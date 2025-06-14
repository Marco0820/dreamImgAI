import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { useAppDispatch, useAppSelector } from '../../hooks';
import {
  generateImage,
  selectImageError,
  selectImageLoading,
  selectLatestGeneration,
} from '../../store/imageSlice';
import { selectUser } from '../../store/authSlice';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { RootState } from '../../store';
import Layout from '../../components/Layout';
import Image from 'next/image';

// TODO: Add your gallery images to the `public/gallery` folder
// and update the `imageNames` array below to match the filenames.
const imageNames: string[] = [
  // '1.jpg', '2.jpg', '3.jpg', '4.jpg', 
  // '5.jpg', '6.jpg', '7.jpg', '8.jpg',
];

export default function HeroSection() {
  const { t } = useTranslation('common');
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const token = useAppSelector((state: RootState) => state.auth.token);
  const latestGeneration = useAppSelector(selectLatestGeneration);
  const isLoading = useAppSelector(selectImageLoading);
  const error = useAppSelector(selectImageError);

  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [isHighQuality, setIsHighQuality] = useState(false);
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);

  useEffect(() => {
    if (error) {
      toast.error(t('error.prefix') + error);
    }
  }, [error, t]);

  const handleHighQualityToggle = () => {
    if (!user || !user.is_premium) {
        setIsHighQuality(false); // Make sure it doesn't stay checked
        setShowUpgradePopup(true);
    } else {
        setIsHighQuality(!isHighQuality);
    }
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      toast.error(t('error.promptRequired'));
      return;
    }

    if (isHighQuality && (!user || !user.is_premium)) {
      toast.info(t('error.premiumFeature'));
      setShowUpgradePopup(true);
      return;
    }

    dispatch(generateImage({ prompt, negative_prompt: negativePrompt, token, model: 'stable-diffusion' }));
  };

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

  return (
    <Layout>
      <section id="generator" className="bg-gray-900 text-white py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8 flex justify-center items-center gap-4">
              <Image src="/logo.png" alt="DreamImg AI Logo" width={64} height={64} />
              <h1 className="text-5xl md:text-6xl font-bold tracking-tighter">
                DreamImg AI
              </h1>
            </div>
            <p className="max-w-2xl mx-auto text-lg text-gray-400">
              {t('hero.subtitle')}
            </p>
            <div className="mt-6 flex justify-center gap-2 md:gap-4">
              <div className="bg-green-500/10 text-green-300 px-4 py-2 rounded-md font-semibold">100% {t('hero.tag_free')}</div>
              <div className="bg-blue-500/10 text-blue-300 px-4 py-2 rounded-md font-semibold">{t('hero.tag_flux')}</div>
              <div className="bg-purple-500/10 text-purple-300 px-4 py-2 rounded-md font-semibold">{t('hero.tag_open_source')}</div>
              <div className="bg-orange-500/10 text-orange-300 px-4 py-2 rounded-md font-semibold">{t('hero.tag_unlimited')}</div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 max-w-3xl mx-auto"
          >
            <form
              onSubmit={handleGenerate}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 space-y-4"
            >
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={t('generator.promptPlaceholder')}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition h-28 resize-none"
              />
              <textarea
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                placeholder={t('generator.negativePromptPlaceholder')}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition h-24 resize-none"
              />
              <div className="flex justify-between items-center mt-4">
                <div className="flex items-center space-x-3">
                  <Switch
                    checked={isHighQuality}
                    onCheckedChange={handleHighQualityToggle}
                    id="high-quality"
                  />
                  <Label htmlFor="high-quality" className="text-gray-300">
                    {t('generator.highQuality')}
                  </Label>
                </div>
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => {
                      setPrompt('');
                      setNegativePrompt('');
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    {t('generator.clear')}
                  </Button>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-semibold"
                    disabled={isLoading}
                  >
                    {isLoading
                      ? t('generator.generating')
                      : t('generator.generate')}
                  </Button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>

        {/* --- Image Output --- */}
        <div className="mt-8 text-center min-h-[256px] flex flex-col justify-center items-center">
          {isLoading && ( <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div> )}
          {error && ( <div className="text-red-400 bg-red-900/50 rounded-md p-4 max-w-2xl mx-auto w-full"><p>{t('generator.error_prefix')}: {error}</p></div> )}
        </div>
      </section>

      {/* Results Section */}
      {(isLoading || latestGeneration.length > 0) && (
        <section id="results" className="py-20 bg-gray-900">
          <div className="container mx-auto px-4">
            {isLoading && (
              <div className="text-center text-white">
                <div className="flex justify-center items-center mb-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
                <p className="text-2xl mb-2">{t('generator.loadingMessage')}</p>
                <p className="text-gray-400">
                  {t('generator.loadingDescription')}
                </p>
              </div>
            )}

            {latestGeneration.length > 0 && (
              <div>
                <h2 className="text-3xl font-bold text-center text-white mb-10">
                  {t('generator.resultsTitle')}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {latestGeneration.map((image: any) => (
                    <motion.div
                      key={image.id}
                      className="rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 aspect-square"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <img
                        src={`${API_BASE_URL}${image.image_url}`}
                        alt={image.prompt}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {showUpgradePopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-lg p-8 max-w-sm w-full text-center"
          >
            <h3 className="text-xl font-bold text-white mb-4">{t('upgrade_popup.title')}</h3>
            <p className="text-gray-400 mb-6">{t('upgrade_popup.description')}</p>
            <div className="flex flex-col gap-4">
              <Button onClick={() => setShowUpgradePopup(false)} className="bg-blue-600 hover:bg-blue-700">{t('upgrade_popup.upgrade')}</Button>
              <Button variant="ghost" onClick={() => setShowUpgradePopup(false)}>{t('upgrade_popup.cancel')}</Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* --- Gallery Section --- */}
      {imageNames.length > 0 && (
        <div className="mt-24">
          <h2 className="text-3xl font-bold mb-8">获取灵感</h2>
          <p className="text-lg text-gray-400 mb-12">从我们社区创作的最新图像中获取灵感。</p>
          <div className="columns-2 sm:columns-3 md:columns-4 gap-4 space-y-4">
            {imageNames.map((name) => (
              <div key={name} className="break-inside-avoid">
                <Image src={`/gallery/${name}`} alt={`AI generated art ${name}`} width={500} height={500} className="w-full h-auto rounded-lg shadow-lg transition-transform duration-300 hover:scale-105" />
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
} 