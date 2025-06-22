import { useState } from 'react';
import Layout from '@/components/Layout';
import { motion } from 'framer-motion';
import { Heart, MessageSquare, Share2 } from 'lucide-react';
import { inspirationPrompts } from '@/data/styleOptions';
import { useTranslation } from 'next-i18next';

const CommunityPage = () => {
  const { t } = useTranslation('common');
  const [hoveredImageId, setHoveredImageId] = useState<string | null>(null);

  // TODO: Add search and filter functionality
  // TODO: Implement pagination or infinite scroll

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-stone-100 tracking-tight">{t('community_gallery')}</h1>
        <p className="mt-4 text-lg text-stone-400 max-w-2xl mx-auto">
          {t('community_description')}
        </p>
      </header>

      <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
        {inspirationPrompts.map((item, index) => (
            <motion.div
              key={index}
              className="relative overflow-hidden rounded-lg group break-inside-avoid"
              onMouseEnter={() => setHoveredImageId(item.image)}
              onMouseLeave={() => setHoveredImageId(null)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <img
                src={`/images/${item.image}`}
                alt={item.prompt}
                className="w-full h-auto object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
              />
              
              {hoveredImageId === item.image && (
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 flex flex-col justify-end">
                    <p className="text-white text-sm font-light leading-snug mb-2 line-clamp-4">
                      {item.prompt}
                    </p>
                 </div>
              )}
            </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CommunityPage; 