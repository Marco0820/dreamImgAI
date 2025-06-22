'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';

const HeroSection = () => {
  const { t } = useTranslation('home');

  const featureTags = [
    { text: t('featureTags.free'), color: 'border-yellow-600/50 text-yellow-300 bg-yellow-900/20 hover:bg-yellow-900/40' },
    { text: t('featureTags.poweredBy'), color: 'border-teal-600/50 text-teal-300 bg-teal-900/20 hover:bg-teal-900/40' },
    { text: t('featureTags.noLogin'), color: 'border-indigo-600/50 text-indigo-300 bg-indigo-900/20 hover:bg-indigo-900/40' },
    { text: t('featureTags.unlimited'), color: 'border-purple-600/50 text-purple-300 bg-purple-900/20 hover:bg-purple-900/40' },
  ];

  return (
    <section className="py-20 text-center">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          <div className="flex justify-center items-center gap-4 mb-4">
            <Image src="/logo.png" alt="DreamImg AI Logo" width={50} height={50} />
            <h1 className="text-6xl md:text-5xl font-bold" style={{ color: '#E5B80B', fontFamily: "serif" }}>
              DreamImg AI
            </h1>
          </div>
          <p className="text-2xl text-gray-300 max-w-3xl mx-auto">
            {t('hero.subtitle')}
          </p>
          <p className="mt-4 text-lg text-yellow-500 max-w-2xl mx-auto">
            ✨ {t('hero.tagline')} ✨
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {featureTags.map((tag, index) => {
              const [title, description] = tag.text.split('——');
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                  className={`px-6 py-3 rounded-full border text-center transition-all duration-300 ${tag.color}`}
                >
                  <div className="flex flex-col items-center">
                    <span className="font-semibold">{title}</span>
                    {description && <span className="text-sm opacity-80">{description}</span>}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;