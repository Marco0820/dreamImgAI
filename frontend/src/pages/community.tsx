import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { toast } from 'react-toastify';
import { AppDispatch, RootState } from '../store';
import { fetchCommunityImages, toggleFavorite } from '../store/communitySlice';
import ImageGrid from '../components/ImageGrid';
import ShareModal from '../components/ShareModal';
import { CommunityImage } from '../types';

const CommunityPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation('common');
  const { images, loading, error } = useSelector((state: RootState) => state.community);
  const { isAuthenticated, token } = useSelector((state: RootState) => state.auth);

  const [isShareModalOpen, setShareModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<CommunityImage | null>(null);

  useEffect(() => {
    dispatch(fetchCommunityImages());
  }, [dispatch]);

  const handleFavorite = (id: number, favorited: boolean) => {
    if (!isAuthenticated || !token) {
      toast.error('Please log in to favorite images.');
      return;
    }
    dispatch(toggleFavorite({ imageId: id, favorited, token }));
  };

  const handleShare = (image: CommunityImage) => {
    setSelectedImage(image);
    setShareModalOpen(true);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-2">{t('Community Gallery')}</h1>
      <p className="text-gray-400 mb-6">{t('Explore amazing artworks created by the dreamImg.ai community')}</p>
      
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <ImageGrid 
          images={images} 
          onFavorite={handleFavorite} 
          onShare={handleShare}
          isAuthenticated={isAuthenticated}
        />
      )}

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setShareModalOpen(false)}
        image={selectedImage}
      />
    </div>
  );
};

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}

export default CommunityPage; 