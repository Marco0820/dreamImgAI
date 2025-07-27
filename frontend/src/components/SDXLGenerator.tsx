import { useTranslation } from 'next-i18next';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Download, ImageIcon, RefreshCw, Trash2, ChevronDown, Sparkles, X, Loader2, Star } from 'lucide-react';
import { usePromptStore } from '@/store/promptStore';
import { Slider } from "@/components/ui/slider"
import { Turnstile, TurnstileInstance } from '@marsidev/react-turnstile';
import { aspectRatios, styles, colors, lightings, compositions, inspirationPrompts } from '@/data/styleOptions';
import ModelSelector, { Model } from './ModelSelector';
import axios from 'axios';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';

const randomPrompts = [
  "A majestic dragon soaring through a storm, lightning illuminates its scales, hyper-detailed, fantasy art.",
  "An enchanted library with floating books and glowing runes, ancient wood, cinematic lighting, Harry Potter vibes.",
  "A cyberpunk city street seen from a rooftop, neon signs reflecting on wet pavement, flying cars, Blade Runner aesthetic.",
  "Portrait of an elegant elven queen with intricate silver armor and a crown of stars, ethereal, fantasy portrait.",
  "A colossal ancient golem made of stone and moss, slumbering in a dense forest, dappled sunlight.",
  "Alien jungle at night, bioluminescent plants casting an otherworldly glow, Avatar-inspired, vibrant colors.",
  "A futuristic space station orbiting a gas giant, intricate details, realistic, sci-fi concept art.",
  "Knight in shining armor battling a giant sea serpent in a raging ocean, dramatic, epic fantasy scene.",
  "A hidden city built inside a massive crystal cave, shimmering walls, fantasy architecture.",
  "Steampunk inventor's workshop, filled with gears, brass contraptions, and glowing vacuum tubes, detailed illustration.",
  "Close-up portrait of an old fisherman with a weathered face and a wise gaze, sharp focus, photo-realistic.",
  "A bustling Moroccan market, vibrant spices, colorful textiles, and crowds of people, travel photography.",
  "A lone astronaut standing on the surface of Mars, looking at the Earth in the distant sky, awe-inspiring, realistic.",
  "A chef meticulously preparing a gourmet dish in a modern kitchen, motion blur, culinary photography.",
  "A candid shot of a laughing child playing in a field of sunflowers at golden hour, warm light, joyful.",
  "A classical musician playing a grand piano on a stage, dramatic spotlight, emotional.",
  "Hacker in a dark room, surrounded by multiple monitors with cascading green code, matrix style.",
  "An athlete crossing the finish line, expression of exhaustion and triumph, sports photography.",
  "A Victorian-era detective examining clues in a dimly lit study, mystery, cinematic.",
  "Two dancers in a passionate tango, flowing red dress, dynamic pose, dramatic lighting.",
  "Serene Japanese Zen garden with a koi pond, cherry blossoms, and a stone lantern, watercolor style.",
  "A panoramic view of the Grand Canyon at sunrise, breathtaking landscape, vibrant oranges and purples.",
  "Misty Scottish Highlands with a lone stag on a hill, moody, atmospheric, landscape photography.",
  "A pristine tropical beach with crystal-clear turquoise water and a white sand beach, aerial drone shot.",
  "A path through a dense redwood forest, giant ancient trees, sunbeams filtering through the canopy.",
  "Northern Lights (Aurora Borealis) over a snowy landscape with a log cabin, magical, long exposure.",
  "Volcanic eruption at night, glowing lava flows down the mountain, powerful, nature's fury.",
  "Rice terraces in Vietnam, cascading green fields, golden hour, travel photography.",
  "A field of lavender in Provence, France, endless rows of purple, peaceful, impressionistic painting style.",
  "An underwater coral reef teeming with colorful fish and marine life, vibrant, detailed, National Geographic style.",
  "A surreal dreamscape where clouds are made of cotton candy and rivers flow with liquid gold, whimsical, Dali-esque.",
  "An explosion of colorful powder, frozen in time, high-speed photography, abstract.",
  "A city skyline rendered in a geometric, low-poly art style, minimalist, modern.",
  "A macro shot of a snowflake, revealing its intricate and perfect symmetrical pattern.",
  "A human silhouette filled with a star-filled galaxy, double exposure effect, spiritual, creative.",
  "A painting of a wave in the style of Hokusai, but with a modern twist, Ukiyo-e.",
  "Abstract sculpture made of polished chrome and glass, reflecting its surroundings, sleek, futuristic.",
  "A still life of vintage objects on a wooden table, nostalgic, oil painting style.",
  "Ink wash painting (Sumi-e) of a bamboo forest, minimalist, black and white.",
  "A world made entirely of stained glass, light filtering through, creating colorful patterns, intricate."
];

const availableModels: Model[] = [
  { id: 'tt-flux1-schnell', name: 'Flux.1 Dev (Schnell)', paid: false },
  { id: 'flux1-dev', name: 'Flux.1 Dev (Original)', paid: false },
  { id: 'tt-flux1-pro', name: 'Flux.1 Pro', paid: true },
  { id: 'seedream3', name: 'Seedream3.0', paid: true },
];

// Helper to convert file to Base64
const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
});

const createThumbnail = (dataUrl: string, width = 256, height = 256): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Could not get canvas context'));
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.85)); 
    };
    img.onerror = (err) => {
      reject(err);
    };
    img.src = dataUrl;
  });
};

type GeneratedImage = {
  status: 'loading' | 'done' | 'error';
  url?: string;
  error?: string;
};

type HistoryImage = {
  url: string;
  prompt: string;
  timestamp: number;
};

const pollForImage = async (jobId: string): Promise<string> => {
  const pollStartTime = Date.now();
  const pollTimeout = 180000; // 3 minutes
  const pollInterval = 5000; // 5 seconds

  while (Date.now() - pollStartTime < pollTimeout) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      try {
          const fetchResponse = await axios.post('/api/ttapi/flux/fetch', { jobId });
          const fetchData = fetchResponse.data;

          if (fetchData.status === 'SUCCESS' && fetchData.data.imageUrl) {
              return fetchData.data.imageUrl;
          } else if (fetchData.status === 'FAILED') {
              throw new Error(fetchData.message || 'Image generation failed at ttapi.io');
          }
          // If status is PENDING or other, continue polling.
      } catch (error) {
          console.error('Polling failed:', error);
          // We can decide to throw or continue polling, for now, we let it continue until timeout.
      }
  }

  throw new Error('Image generation timed out.');
};

const SDXLGenerator = () => {
  const { t } = useTranslation('common');
  const { data: session } = useSession();
  const router = useRouter();
  
  const promptFromHome = usePromptStore((state) => state.prompt);
  const [prompt, setPrompt] = useState(promptFromHome || '');
  
  useEffect(() => {
    const savedPrompt = sessionStorage.getItem('promptBeforeLogin');
    if (savedPrompt) {
      setPrompt(savedPrompt);
      sessionStorage.removeItem('promptBeforeLogin');
    } else if (promptFromHome) {
      setPrompt(promptFromHome);
    }
  }, [promptFromHome]);

  const [negativePrompt, setNegativePrompt] = useState('');
  const [showNegativePrompt, setShowNegativePrompt] = useState(false);
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewImageDimensions, setPreviewImageDimensions] = useState({ width: 0, height: 0 });
  const [history, setHistory] = useState<HistoryImage[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>(availableModels[0].id);

  // Group history by prompt for rendering
  const groupedHistory = history.reduce((acc, image) => {
    (acc[image.prompt] = acc[image.prompt] || []).push(image);
    return acc;
  }, {} as Record<string, HistoryImage[]>);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('generatedImagesHistory');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to load history from localStorage", error);
    }
  }, []);

  // Style states
  const [aspectRatio, setAspectRatio] = useState(aspectRatios[0].value);
  const [style, setStyle] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [lighting, setLighting] = useState<string | null>(null);
  const [composition, setComposition] = useState<string | null>(null);

  // Image reference states
  const [uploadedImage, setUploadedImage] = useState<{ url: string; file: File | null }>({ url: '', file: null });
  const [referenceStrength, setReferenceStrength] = useState(50);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Turnstile state
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileSiteKey = process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY;
  console.log('Attempting to read Turnstile Site Key:', turnstileSiteKey);
  const isTurnstileMisconfigured = !turnstileSiteKey || turnstileSiteKey === 'YOUR_TURNSTILE_SITE_KEY';
  const turnstileRef = useRef<TurnstileInstance>(null);

  interface StyleOption {
    value: string;
    label: string;
  }

  const handleModelChange = (modelId: string) => {
    // The check for paid models is now handled entirely by the backend.
    // The backend will check for either a subscription or sufficient credits.
    // This removes the incorrect client-side redirect.
    setSelectedModel(modelId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[SDXLGenerator] handleSubmit triggered");

    // --- DIAGNOSTIC LOGS ---
    console.log("[SDXLGenerator] Verifying session state before API call...");
    console.log(`[SDXLGenerator] Session status: ${session ? 'Exists' : 'Does not exist'}`);
    if(session) {
      console.log("[SDXLGenerator] Session details:", JSON.stringify(session, null, 2));
    }
    // --- END DIAGNOSTIC LOGS ---

    // This client-side check is removed. The backend is the single source of truth
    // for authorization and will respond with a 402 or 403 status if the user
    // cannot use the selected model. The frontend will then react to that response.
    /*
    const model = availableModels.find(m => m.id === selectedModel);
    if (model?.paid && session?.user?.creemPriceId !== 'price_ultimate') {
        toast.info(t('generator.upgrade_required_for_model'));
        router.push('/pricing');
        return;
    }
    */

    if (!session) {
      toast.info(t('generator.login_required'));
      sessionStorage.setItem('promptBeforeLogin', prompt);
      signIn(undefined, { callbackUrl: window.location.pathname });
      return;
    }

    if (!prompt.trim()) {
      toast.error(t('generator.promptRequired'));
      return;
    }

    if (isTurnstileMisconfigured) {
        toast.error(t('error.turnstile_misconfigured'));
        return;
    }

    if (!turnstileToken) {
        toast.error(t('error.turnstile_token_missing'));
        return;
    }

    setIsGenerating(true);
    setGeneratedImages(Array(4).fill({ status: 'loading' })); // Show 4 loading placeholders

    let image_b64 = null;
    if (uploadedImage.file) {
      try {
        image_b64 = await toBase64(uploadedImage.file);
      } catch (error) {
        toast.error(t('error.image_upload_failed'));
        setIsGenerating(false);
        setGeneratedImages([]);
        return;
      }
    }

    try {
        const finalPrompt = [prompt, style, color, lighting, composition].filter(Boolean).join(', ');
        const endpoint = '/api/generate-image';
        const payload = {
            prompt: finalPrompt,
            negative_prompt: negativePrompt,
            style, color, lighting, composition,
            aspect_ratio: '1:1', // Force 1:1 aspect ratio
            turnstile_token: turnstileToken,
            image_b64: image_b64,
            reference_strength: referenceStrength / 100,
            model: selectedModel
        };
        
        console.log("Calling API endpoint:", endpoint, "with payload:", payload);

        const generateResponse = await axios.post(endpoint, payload);
        const imageUrls = generateResponse.data.images; // Expect an array of images

        if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
            throw new Error('No image URLs returned or response format is incorrect.');
        }

        const newImages: GeneratedImage[] = imageUrls.map((url: string) => ({ status: 'done', url }));
        setGeneratedImages(newImages);
        
        // Add all new images to history
        const historyUpdatesPromises = imageUrls.map(async (url: string) => {
          try {
            const thumbnailUrl = await createThumbnail(url);
            return { url: thumbnailUrl, prompt: finalPrompt, timestamp: Date.now() };
          } catch (error) {
            console.error("Failed to create thumbnail, storing full image as fallback", error);
            return { url, prompt: finalPrompt, timestamp: Date.now() };
          }
        });

        const historyUpdates = await Promise.all(historyUpdatesPromises);
        const updatedHistory = [...historyUpdates, ...history];
        setHistory(updatedHistory);
        localStorage.setItem('generatedImagesHistory', JSON.stringify(updatedHistory.slice(0, 20)));

    } catch (error: any) {
      const err = error as any;
      console.error("Generation failed:", err);

      if (err.response?.status === 402) {
        toast.error(t('error_insufficient_credits'), {
          action: {
            label: t('recharge_button'),
            onClick: () => router.push('/pricing'),
          },
        });
      } else {
        const errorMessage = err.response?.data?.detail || err.message || t('generator.generation_failed');
        toast.error(errorMessage);
      }
      
      setGeneratedImages(Array(4).fill({ status: 'error', error: t('generator.generation_failed') })); // Show 4 error placeholders
    } finally {
      setIsGenerating(false);
      // Reset Turnstile to get a new token for the next generation
      turnstileRef.current?.reset();
      setTurnstileToken(null);
    }
  };

  const handleDownload = (dataUrl: string) => {
    if (!dataUrl) return;
    const link = document.createElement("a");
    link.href = dataUrl;
    // Generate a random filename
    link.download = `dreamimg-${Math.random().toString(36).substring(7)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenPreview = (url: string) => {
    const img = new Image();
    img.onload = () => {
      const maxWidth = window.innerWidth * 0.9;
      const maxHeight = window.innerHeight * 0.9;
      const ratio = Math.min(maxWidth / img.naturalWidth, maxHeight / img.naturalHeight);
      
      setPreviewImageDimensions({
        width: img.naturalWidth * ratio,
        height: img.naturalHeight * ratio,
      });
      setPreviewImage(url);
    };
    img.src = url;
  };

  const handleClosePreview = () => {
    setPreviewImage(null);
    setPreviewImageDimensions({ width: 0, height: 0 });
  };
  
  const handleInspirationClick = (prompt: string) => {
    setPrompt(prompt);
    document.getElementById('generator')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleRandomPrompt = () => {
    const randomPrompt = randomPrompts[Math.floor(Math.random() * randomPrompts.length)];
    setPrompt(randomPrompt);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedImage({ url: URL.createObjectURL(file), file: file });
    }
  };

  const clearImage = () => {
    setUploadedImage({ url: '', file: null });
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const StylePopover = ({ label, options, selectedValue, onSelect, multiColumn = true }: { label: string; options: StyleOption[]; selectedValue: string | null; onSelect: (value: string) => void; multiColumn?: boolean }) => {
    const { t } = useTranslation('common');
    const [isOpen, setIsOpen] = useState(false);
    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-between px-3">
            <span className="truncate">{selectedValue ? t(options.find(o => o.value === selectedValue)?.label || label) : t(label)}</span>
            <ChevronDown className="h-4 w-4 flex-shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className={`w-[280px] p-1 ${multiColumn ? 'md:w-[420px]' : ''} bg-stone-900 border border-stone-700`}>
          <div className={`grid ${multiColumn ? 'grid-cols-3 md:grid-cols-3' : 'grid-cols-1'} gap-1`}>
            {options.map((option) => (
              <Button
                key={option.value}
                variant={selectedValue === option.value ? 'secondary' : 'ghost'}
                onClick={() => {
                  onSelect(option.value);
                  setIsOpen(false);
                }}
                className="w-full justify-start text-xs h-8 px-2 text-white hover:bg-amber-500"
              >
                {t(option.label)}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  return (
    <>
      <section id="generator" className="py-10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-[90%] mx-auto"
            style={{ transform: 'scale(0.6)', transformOrigin: 'top' }}
          >
            <form
              onSubmit={handleSubmit}
              className="bg-stone-800/40 backdrop-blur-sm border border-stone-700 rounded-2xl p-6 md:p-8 space-y-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-stone-200">{t('image_generator', 'AI 图像生成器')}</h2>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={imageInputRef}
                    onChange={handleImageUpload}
                    className="hidden"
                    accept="image/png, image/jpeg"
                  />
                  <Button type="button" variant="ghost" size="icon" className="text-stone-400 hover:text-white hover:bg-stone-700" onClick={() => imageInputRef.current?.click()}>
                    <ImageIcon className="h-6 w-6" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="prompt" className="text-base font-medium text-stone-300">
                    {t('prompt_label')}
                  </Label>
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={handleRandomPrompt} className="text-amber-400 border-amber-400/50 hover:bg-amber-400/10 hover:text-amber-300">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      {t('random_button', '随机')}
                    </Button>
                    <span className="text-xs text-stone-500">{t('prompt_hint', 'GB 请用英文输入提示词以获得最佳效果')}</span>
                  </div>
                </div>
                <div className="flex gap-4">
                  {uploadedImage.url && (
                    <div className="w-1/3 md:w-1/4 space-y-4 flex-shrink-0">
                      <div className="aspect-square bg-stone-900/50 rounded-lg flex items-center justify-center overflow-hidden relative group">
                        <img src={uploadedImage.url} alt="Uploaded reference" className="w-full h-full object-contain" />
                         <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={clearImage}>
                            <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-stone-300">{t('reference_strength', '参考强度')}</Label>
                        <p className="text-xs text-stone-400 mb-2">{referenceStrength}%</p>
                        <Slider
                          value={[referenceStrength]}
                          onValueChange={(value) => setReferenceStrength(value[0])}
                          max={100}
                          step={1}
                        />
                      </div>
                    </div>
                  )}
                  <div className="flex-grow">
                    <Textarea
                      placeholder={t('enter your dream...')}
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="h-24 resize-none"
                      maxLength={1000}
                    />
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-stone-400">{prompt.length} / 1000</span>
                    </div>
                  </div>                  
                </div>
              </div>

              {showNegativePrompt && (
                <motion.div 
                  className="grid gap-2"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Textarea
                    placeholder={t('generator.negative_prompt_placeholder')}
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    className="h-24 resize-none"
                    maxLength={1000}
                  />
                </motion.div>
              )}

              <div className="space-y-4">
                <Label className="text-base font-medium text-stone-300">{t('style_options_label', '风格选项')}</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                  <StylePopover label={t('aspect_ratio_label')} options={aspectRatios} selectedValue={aspectRatio} onSelect={setAspectRatio} multiColumn={false} />
                  <StylePopover label={t('style_label')} options={styles} selectedValue={style} onSelect={setStyle} />
                  <StylePopover label={t('color_label')} options={colors} selectedValue={color} onSelect={setColor} />
                  <StylePopover label={t('lighting_label')} options={lightings} selectedValue={lighting} onSelect={setLighting} />
                  <StylePopover label={t('composition_label')} options={compositions} selectedValue={composition} onSelect={setComposition} />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-stone-700/50">
                <div className="flex items-center gap-2">
                  <Button 
                    type="button"
                    variant={showNegativePrompt ? 'default' : 'outline'}
                    onClick={() => setShowNegativePrompt(!showNegativePrompt)}
                    className={showNegativePrompt ? 'bg-amber-500 hover:bg-amber-600 text-black' : 'border-stone-600 hover:bg-stone-800'}
                  >
                    {t('negative_prompt_label', '负面提示词')}
                  </Button>
                  <Button 
                    type="button"
                    variant={'outline'}
                    onClick={() => setShowUpgradePopup(true)}
                     className={'border-stone-600 hover:bg-stone-800'}
                  >
                     <Sparkles className="mr-2 h-4 w-4 text-yellow-400" />
                    {t('high_quality_button', '高质量')}
                  </Button>
                </div>

                <div className="flex flex-col items-center">
                  {isTurnstileMisconfigured ? (
                      <p className="text-red-500 text-xs">{t('error.turnstile_misconfigured')}</p>
                  ) : (
                      <Turnstile
                          ref={turnstileRef}
                          siteKey={turnstileSiteKey}
                          onSuccess={setTurnstileToken}
                          options={{ theme: 'dark' }}
                      />
                  )}
                </div>
                <div className="flex items-center gap-4 flex-grow md:flex-grow-0">
                  <ModelSelector
                    models={availableModels}
                    selectedModel={selectedModel}
                    onModelChange={handleModelChange}
                    disabled={isGenerating}
                  />
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="bg-amber-500 hover:bg-amber-600 text-black font-bold text-lg px-8 py-6 h-full"
                    disabled={isGenerating || !prompt.trim() || !turnstileToken || isTurnstileMisconfigured}
                  >
                    {isGenerating ? t('generating_button', '生成中...') : t('generate_button', '生成')}
                  </Button>
                </div>
              </div>
            </form>
          </motion.div>

          {/* --- Image Output --- */}
          {isGenerating && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {generatedImages.map((image, index) => (
                <div key={index} className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center relative">
                  {image.status === 'loading' && (
                    <div className="flex flex-col items-center justify-center text-center p-4">
                      <Loader2 className="h-8 w-8 animate-spin text-stone-500 mb-4" />
                      <p className="text-stone-300 font-semibold">{t('generating_estimate', '预计20s完成图片创作')}</p>
                      <p className="text-stone-400 text-sm mb-4">{t('generating_masterpiece', '正在生成您的杰作...')}</p>
                      <Button
                        size="sm"
                        className="bg-amber-500 hover:bg-amber-600 text-white"
                        onClick={() => window.open('/pricing', '_blank')}
                      >
                        <Sparkles className="h-4 w-4 mr-2"/>
                        {t('increase_speed_10x', '提高10倍生成速度')}
                      </Button>
                    </div>
                  )}
                  {image.status === 'done' && image.url && (
                    <>
                      <img
                        src={image.url}
                        alt={`${t('generator.alt_text_prefix', 'Generated image')} ${index + 1}`}
                        className="object-contain w-full h-full rounded-lg cursor-pointer"
                        onClick={() => handleOpenPreview(image.url!)}
                      />
                      <div className="absolute bottom-2 right-2 transition-opacity">
                        <Button size="icon" variant="secondary" onClick={(e) => { e.stopPropagation(); handleDownload(image.url!); }}>
                          <Download className="h-5 w-5" />
                        </Button>
                      </div>
                    </>
                  )}
                  {image.status === 'error' && (
                    <div className="flex flex-col items-center text-center p-4">
                      <X className="h-8 w-8 text-red-500 mb-4" />
                      <p className="text-red-400">{t('generator.generation_failed', 'Generation failed')}</p>
                      <p className="text-stone-400 text-xs">{image.error}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {!isGenerating && generatedImages.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4 text-center">{t('generator.results')}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {generatedImages.map((image, index) => (
                  image.status === 'done' && image.url && (
                    <div key={index} className="group relative aspect-square">
                      <img
                        src={image.url}
                        alt={`${t('generator.alt_text_prefix', 'Generated image')} ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg cursor-pointer"
                        onClick={() => handleOpenPreview(image.url!)}
                      />
                      <div className="absolute bottom-2 right-2 transition-opacity opacity-0 group-hover:opacity-100">
                        <Button size="icon" variant="secondary" onClick={(e) => { e.stopPropagation(); handleDownload(image.url!); }}>
                          <Download className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* --- Inspiration Section --- */}
      <section id="inspiration" className="py-10 bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-center text-stone-200 mb-2">{t('inspiration_title')}</h3>
            <p className="text-center text-stone-400 mb-6">{t('inspiration_subtitle')}</p>
            <div className="columns-2 md:columns-4 gap-4 space-y-4">
              {inspirationPrompts.map((p, index) => (
                <motion.div
                  key={index}
                  className="relative rounded-lg overflow-hidden group cursor-pointer break-inside-avoid"
                  onClick={() => handleInspirationClick(p.prompt)}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <img src={`/images/${p.image}`} alt={`Inspiration image ${index + 1}`} className="w-full h-auto rounded-lg"/>
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-2">
                    <p className="text-white text-xs text-center">{p.prompt.substring(0, 100)}...</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Dialog open={showUpgradePopup} onOpenChange={setShowUpgradePopup}>
        <DialogContent className="sm:max-w-md bg-stone-900 border-stone-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-amber-400 text-2xl font-bold">👑 {t('ultimate_title', 'Ultimate会员功能')}</DialogTitle>
            <DialogDescription className="text-stone-400 pt-2">
              {t('ultimate_description', '高质量图像生成可生成更详细、更清晰的图像。')}
              <br />
              {t('ultimate_unlock', '升级到 Ultimate 解锁高质量图像生成，显著改善细节。')}
            </DialogDescription>
          </DialogHeader>
          <div className="bg-stone-800/50 p-4 rounded-lg my-4">
            <h4 className="font-semibold text-stone-200">{t('ultimate_advantages_title', '高质量优势:')}</h4>
            <ul className="list-disc list-inside text-stone-400 space-y-1 mt-2">
              <li>{t('ultimate_advantage1', '图像质量和细节显著提高')}</li>
              <li>{t('ultimate_advantage2', '稍微延长生成时间')}</li>
              <li>{t('ultimate_advantage3', '仅限 Ultimate 会员')}</li>
            </ul>
          </div>
          <DialogFooter className="sm:justify-between gap-2">
            <Button type="button" variant="secondary" onClick={() => setShowUpgradePopup(false)}>
              {t('not_now_button', '暂不')}
            </Button>
            <Button type="button" className="bg-amber-600 hover:bg-amber-700" onClick={() => window.open('/pricing', '_blank')}>
              👑 {t('upgrade_button', '升级到 Ultimate')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {previewImage && (
         <Dialog open={!!previewImage} onOpenChange={(isOpen) => !isOpen && handleClosePreview()}>
            <DialogContent 
              className="p-0 bg-stone-900 border-stone-700 text-white flex flex-col [&>button[aria-label=Close]]:hidden"
              style={{
                width: previewImageDimensions.width ? `${previewImageDimensions.width}px` : 'auto',
                height: previewImageDimensions.height ? `${previewImageDimensions.height}px` : 'auto',
                maxWidth: '90vw',
                maxHeight: '90vh'
              }}
            >
              <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
                 <Button
                    size="icon"
                    variant="secondary"
                    className="w-8 h-8"
                    onClick={() => handleDownload(previewImage!)}
                >
                    <Download className="h-4 w-4" />
                </Button>
                 <Button
                    size="icon"
                    variant="secondary"
                    className="w-8 h-8"
                    onClick={handleClosePreview}
                >
                    <X className="h-4 w-4" />
                </Button>
              </div>
              <img src={previewImage} alt="Preview" className="object-contain w-full h-full" />
           </DialogContent>
         </Dialog>
      )}
    </>
  );
};

export default SDXLGenerator;