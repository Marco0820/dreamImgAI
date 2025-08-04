'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';

export default function HeroSection() {
  const { t } = useTranslation('common');
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateImage = async (prompt: string) => {
    setGeneratedImage(null);
    setError(null);
    setIsGenerating(true);

    try {
      const imageResponse = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!imageResponse.ok) {
        const errorData = await imageResponse.json();
        throw new Error(errorData.message || 'Image generation failed.');
      }

      const imageData = await imageResponse.json();
      setGeneratedImage(imageData.image_url);
    } catch (err: any) {
      setError(err.message);
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <section className="relative bg-gray-900 text-white py-20">
      <div className="absolute inset-0">
        <Image
          src="/hero-background.jpg"
          alt="Abstract background"
          layout="fill"
          objectFit="cover"
          quality={80}
          priority
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      </div>

      <div className="relative container mx-auto px-4 z-10 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4">
          {t('hero.title')}
        </h1>
        <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          {t('hero.subtitle')}
        </p>

        <div className="max-w-xl mx-auto bg-gray-800/50 p-6 rounded-xl border border-gray-700 shadow-lg">
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={t('hero.placeholder')}
              className="w-full h-24 p-4 pr-12 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
            />
          </div>
          
          <div className="mt-4 text-center">
            <button
              onClick={() => prompt && handleGenerateImage(prompt)}
              disabled={isGenerating || !prompt}
              className="w-full px-6 py-3 text-lg font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-500 transition-all duration-300"
            >
              {isGenerating ? 'Generating...' : `Generate`}
            </button>
          </div>

          {error && <p className="mt-4 text-red-400">{error}</p>}
        </div>

        {isGenerating && (
          <div className="mt-8 flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
            <p className="ml-4 text-lg">{t('hero.generating')}</p>
          </div>
        )}

        {generatedImage && (
          <div className="mt-8">
            <h3 className="text-2xl font-bold mb-4">{t('hero.yourMasterpiece')}</h3>
            <div className="max-w-xl mx-auto bg-gray-800 p-2 rounded-lg shadow-lg">
              <Image
                src={generatedImage}
                alt={prompt}
                width={512}
                height={512}
                className="rounded-md"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}