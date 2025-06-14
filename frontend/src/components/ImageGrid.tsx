import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutline, ShareIcon } from '@heroicons/react/24/outline';
import { CommunityImage } from '../types';

interface ImageGridProps {
    images: CommunityImage[];
    onFavorite: (id: number, favorited: boolean) => void;
    onShare: (image: CommunityImage) => void;
    isAuthenticated: boolean;
}

const ImageGrid: React.FC<ImageGridProps> = ({ images, onFavorite, onShare, isAuthenticated }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
                <div key={image.id} className="relative group bg-white rounded-lg overflow-hidden shadow-md border border-gray-200">
                    <img src={image.image_url} alt={image.prompt} className="w-full h-64 object-cover" />
                    <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                        <p className="text-white text-sm">{image.prompt}</p>
                        <div className="flex justify-between items-center mt-2">
                            <p className="text-xs text-gray-200">by @{image.owner.username}</p>
                            <div className="flex items-center space-x-3">
                                <button onClick={() => onShare(image)} className="text-white hover:text-gray-300 transform transition-transform duration-200 hover:scale-110">
                                    <ShareIcon className="h-6 w-6" />
                                </button>
                                {isAuthenticated && (
                                    <button onClick={() => onFavorite(image.id, image.favorited_by_user)} className="text-white hover:text-pink-400 transform transition-transform duration-200 hover:scale-110">
                                        {image.favorited_by_user ? (
                                            <HeartSolid className="h-6 w-6 text-pink-500" />
                                        ) : (
                                            <HeartOutline className="h-6 w-6" />
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ImageGrid; 