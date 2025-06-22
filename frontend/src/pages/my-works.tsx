import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { motion } from 'framer-motion';
import { Download, Trash2, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'next-i18next';
import { GetStaticProps, type NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';

type HistoryImage = {
  url: string;
  prompt: string;
  timestamp: number;
};

const MyWorksPage: NextPage = () => {
  const { t } = useTranslation('common');
  const [history, setHistory] = useState<HistoryImage[]>([]);
  const [hoveredImageIndex, setHoveredImageIndex] = useState<number | null>(null);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('generatedImagesHistory');
      if (storedHistory) {
        const parsedHistory = JSON.parse(storedHistory);
        // Sort by timestamp descending to show newest first
        parsedHistory.sort((a: HistoryImage, b: HistoryImage) => b.timestamp - a.timestamp);
        setHistory(parsedHistory);
      }
    } catch (error) {
      console.error("Failed to load or parse history from localStorage", error);
    }
  }, []);

  const handleDelete = (timestamp: number) => {
    const updatedHistory = history.filter(image => image.timestamp !== timestamp);
    setHistory(updatedHistory);
    localStorage.setItem('generatedImagesHistory', JSON.stringify(updatedHistory));
  };
  
  const handleDownload = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `dreamimg-ai-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
        console.error("Failed to download image:", error);
    }
  };

  if (history.length === 0) {
    return (
        <div className="container mx-auto px-4 py-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-stone-100 tracking-tight">{t('my_works_title')}</h1>
            <p className="mt-4 text-lg text-stone-400">
                {t('my_works_empty')}
            </p>
            <Button className="mt-6" asChild>
                <Link href="/">{t('go_generate')}</Link>
            </Button>
        </div>
    )
  }

  return (
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-stone-100 tracking-tight">{t('my_works_title')}</h1>
          <p className="mt-4 text-lg text-stone-400 max-w-2xl mx-auto">
            {t('my_works_description')}
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {history.map((image, index) => (
            <motion.div
              key={image.timestamp}
              className="relative overflow-hidden rounded-lg group aspect-square"
              onMouseEnter={() => setHoveredImageIndex(index)}
              onMouseLeave={() => setHoveredImageIndex(null)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <img
                src={image.url}
                alt={image.prompt}
                className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
              />
              
              {hoveredImageIndex === index && (
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-end space-x-2">
                           <Button onClick={() => handleDownload(image.url)} size="icon" variant="ghost" className="text-white hover:bg-white/20 hover:text-white h-8 w-8">
                                <Download size={16} />
                            </Button>
                            <Button onClick={() => handleDelete(image.timestamp)} size="icon" variant="ghost" className="text-white hover:bg-white/20 hover:text-white h-8 w-8">
                                <Trash2 size={16} />
                            </Button>
                        </div>
                    </div>
                    <p className="text-white text-sm font-light leading-snug line-clamp-3">
                      {image.prompt}
                    </p>
                 </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
    props: {
        ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
});

export default MyWorksPage; 