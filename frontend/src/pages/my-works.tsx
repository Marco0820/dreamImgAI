import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { motion } from 'framer-motion';
import { Download, Trash2, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'next-i18next';
import { GetStaticProps, type NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { useSession } from 'next-auth/react';

type HistoryImage = {
  id: number;
  url: string;
  prompt: string;
  timestamp: number;
};

const MyWorksPage: NextPage = () => {
  const { t } = useTranslation('common');
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewImageDimensions, setPreviewImageDimensions] = useState({ width: 0, height: 0 });

  const { data: history = [], isLoading, error } = useQuery<HistoryImage[]>({
    queryKey: ['my-works', session?.user?.id],
    queryFn: async () => {
      const response = await axios.get('/api/my-works');
      return response.data;
    },
    enabled: !!session, // Only run the query if the user is logged in
  });

  const deleteMutation = useMutation({
    mutationFn: (imageId: number) => axios.delete(`/api/images/${imageId}`),
    onSuccess: () => {
      // Invalidate and refetch the 'my-works' query to update the list
      queryClient.invalidateQueries({ queryKey: ['my-works'] });
      queryClient.invalidateQueries({ queryKey: ['my-works', session?.user?.id] });
    },
  });

  const handleDelete = (imageId: number) => {
    deleteMutation.mutate(imageId);
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-stone-100 tracking-tight">{t('my_works_title')}</h1>
        <p className="mt-4 text-lg text-stone-400">{t('loading', 'Loading...')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-stone-100 tracking-tight">{t('my_works_title')}</h1>
        <p className="mt-4 text-lg text-red-400">{t('error_loading_works', 'Failed to load your works.')}</p>
      </div>
    );
  }

  if (!session) {
     return (
        <div className="container mx-auto px-4 py-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-stone-100 tracking-tight">{t('my_works_title')}</h1>
            <p className="mt-4 text-lg text-stone-400">
                {t('login_to_see_works', 'Please log in to see your works.')}
            </p>
            <Button className="mt-6" asChild>
                <Link href="/login">{t('login', 'Login')}</Link>
            </Button>
        </div>
    )
  }

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
    <>
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
              className="relative overflow-hidden rounded-lg group"
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative pt-[100%] cursor-pointer" onClick={() => handleOpenPreview(image.url)}>
                <img
                  src={image.url}
                  alt={image.prompt}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                />
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 flex flex-col justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                 <div>
                     <div className="flex justify-end space-x-2">
                        <Button onClick={(e) => {e.stopPropagation(); handleDownload(image.url)}} size="icon" variant="ghost" className="text-white hover:bg-white/20 hover:text-white h-8 w-8">
                             <Download size={16} />
                         </Button>
                         <Button onClick={(e) => {e.stopPropagation(); handleDelete(image.id)}} size="icon" variant="ghost" className="text-white hover:bg-white/20 hover:text-white h-8 w-8">
                             <Trash2 size={16} />
                         </Button>
                     </div>
                 </div>
                 <p className="text-white text-sm font-light leading-snug line-clamp-3">
                   {image.prompt}
                 </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
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
                    <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <img src={previewImage} alt="Preview" className="object-contain w-full h-full" />
           </DialogContent>
         </Dialog>
      )}
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
    props: {
        ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
});

export default MyWorksPage; 