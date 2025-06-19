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
import { Turnstile } from '@marsidev/react-turnstile';
import { aspectRatios, styles, colors, lightings, compositions, inspirationPrompts } from '@/data/styleOptions';
import ModelSelector, { Model } from './ModelSelector';

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
  { id: 'flux-dev', name: 'Flux.1 Dev' },
  { id: 'seedream3', name: 'Seedream3.0' },
];

// Helper to convert file to Base64
const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
});

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

const SDXLGenerator = () => {
  const { t } = useTranslation('common');
  const { data: session } = useSession();
  
  const promptFromHome = usePromptStore((state) => state.prompt);
  const [prompt, setPrompt] = useState(promptFromHome || '');
  
  useEffect(() => {
    if (promptFromHome) setPrompt(promptFromHome);
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
  const isTurnstileMisconfigured = !turnstileSiteKey || turnstileSiteKey === 'YOUR_TURNSTILE_SITE_KEY';


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    setGeneratedImages(Array(3).fill({ status: 'loading' }));

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

    const requestBody = {
      prompt,
      negative_prompt: showNegativePrompt ? negativePrompt : '',
      aspect_ratio: aspectRatio,
      style: style,
      color: color,
      composition: composition,
      lighting: lighting,
      image_b64,
      reference_strength: image_b64 ? referenceStrength / 100 : undefined,
      turnstile_token: turnstileToken,
    };
    
    const generateSequentially = async () => {
      for (let i = 0; i < 3; i++) {
        try {
          const endpoint = selectedModel === 'flux-dev' ? '/api/horde/generate' : '/api/generate-image';

          const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...requestBody, num_outputs: 1 }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Image generation failed');
          }
          const data = await response.json();
          
          // Add to history
          const newHistoryImage: HistoryImage = {
            url: data.image,
            prompt: requestBody.prompt,
            timestamp: Date.now()
          };

          setHistory(currentHistory => {
            const updatedHistory = [newHistoryImage, ...currentHistory].slice(0, 16);
            try {
              localStorage.setItem('generatedImagesHistory', JSON.stringify(updatedHistory));
            } catch (error) {
              console.error("Failed to save history to localStorage", error);
            }
            return updatedHistory;
          });
          
          setGeneratedImages(currentImages => {
              const newImages = [...currentImages];
              newImages[i] = { status: 'done', url: data.image };
              return newImages;
          });

        } catch (err: any) {
            console.error(`Generation failed for image ${i + 1}:`, err);
            toast.error(`Image ${i + 1} generation failed.`);
            setGeneratedImages(currentImages => {
                const newImages = [...currentImages];
                newImages[i] = { status: 'error', error: err.message || 'Unknown error' };
                return newImages;
            });
        }
      }
      setIsGenerating(false);
    }

    generateSequentially();
  };

  const handleDownload = (url: string) => {
    if (!url) return;
    // Use the new API route to handle the download
    window.location.href = `/api/download-image?url=${encodeURIComponent(url)}`;
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

  const StylePopover = ({ label, options, selectedValue, onSelect, multiColumn=true }: any) => {
    const selectedLabel = options.find((o: any) => o.value === selectedValue)?.label || label;

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="flex-grow justify-between bg-stone-900/50 border-stone-700 hover:bg-stone-800 text-white">
            <span>{String(t(selectedLabel, label))}</span><ChevronDown />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 bg-stone-800 border-stone-700 p-2 text-white">
          <div className={multiColumn ? "grid grid-cols-4 gap-1" : "flex flex-col space-y-1"}>
            {options.map((o: any) => 
              <Button
                variant={selectedValue === o.value ? "secondary" : "ghost"}
                key={o.label}
                onClick={() => onSelect(o.value)}
                className="h-auto p-2 flex flex-col gap-1 text-xs hover:bg-stone-700 text-white"
              >
                {String(t(o.label, o.label))}
              </Button>
            )}
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
                        <img src={uploadedImage.url} alt="Uploaded reference" className="w-full h-full object-cover" />
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
                  <Textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
                    placeholder={t('prompt_placeholder')}
                    className="w-full bg-stone-900/50 border-2 border-stone-700 rounded-lg p-4 text-white placeholder-stone-500 focus:ring-2 focus:ring-amber-600 focus:border-amber-600 focus:outline-none transition h-auto min-h-[150px] resize-none text-base"
                  />
                </div>
              </div>

              {showNegativePrompt && (
                <div className="space-y-2">
                  <Label htmlFor="negative-prompt" className="font-medium text-stone-300">
                    {t('negative_prompt_label', '负面提示词')}
                  </Label>
                  <Textarea
                    id="negative-prompt"
                    value={negativePrompt}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNegativePrompt(e.target.value)}
                    placeholder={t('negative_prompt_placeholder', '您想避免什么？')}
                    className="w-full bg-stone-900/50 border-2 border-stone-700 rounded-lg p-4 text-white placeholder-stone-500 focus:ring-2 focus:ring-amber-600 focus:border-amber-600 focus:outline-none transition h-24 resize-none text-base"
                  />
                </div>
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
                    onModelChange={setSelectedModel}
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

            {/* --- Image Output --- */}
            {(isGenerating || generatedImages.length > 0) && (
              <div className="mt-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {generatedImages.map((image, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="relative group aspect-square bg-stone-800/40 rounded-lg flex items-center justify-center border border-stone-700"
                    >
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
                            className="object-cover w-full h-full rounded-lg cursor-pointer"
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
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* --- Inspiration Section --- */}
      <section id="inspiration" className="py-10 bg-gray-900/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-white mb-2">
            {t('inspiration_title')}
          </h2>
          <p className="text-lg text-gray-400 text-center mb-10">
            {t('inspiration_subtitle')}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {inspirationPrompts.map((item) => (
              <motion.div
                key={item.image}
                className="rounded-lg overflow-hidden shadow-lg group hover:shadow-2xl transition-shadow duration-300 aspect-square cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                onClick={() => handleInspirationClick(item.prompt)}
              >
                <img
                  src={`/images/${item.image}`}
                  alt={item.prompt.substring(0, 50) + '...'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </motion.div>
            ))}
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
              <img src={previewImage} alt="Preview" className="object-cover w-full h-full" />
           </DialogContent>
         </Dialog>
      )}
    </>
  );
};

export default SDXLGenerator;