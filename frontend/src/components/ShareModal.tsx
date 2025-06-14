import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    FacebookShareButton, FacebookIcon,
    TwitterShareButton, XIcon,
    WhatsappShareButton, WhatsappIcon,
    LinkedinShareButton, LinkedinIcon,
    TelegramShareButton, TelegramIcon,
    RedditShareButton, RedditIcon,
} from 'react-share';
import { AppDispatch, RootState } from '../store';
import { generateCaption } from '../store/communitySlice';
import { CommunityImage } from '../types';

interface ShareModalProps {
    image: CommunityImage | null;
    isOpen: boolean;
    onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ image, isOpen, onClose }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { token } = useSelector((state: RootState) => state.auth);
    const { captionStatus, captions } = useSelector((state: RootState) => state.community);
    
    const [caption, setCaption] = useState('');

    const generatedCaption = image ? captions[image.id] : '';

    useEffect(() => {
        if (generatedCaption) {
            setCaption(generatedCaption);
        }
    }, [generatedCaption]);

    if (!isOpen || !image) return null;

    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/community` : '';
    const title = caption || `Check out this amazing image I created with dreamImg.ai!`;

    const handleGenerateCaption = () => {
        if (token && image) {
            dispatch(generateCaption({ imageId: image.id, token }));
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg relative text-gray-800 shadow-xl">
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-800 text-2xl font-bold">&times;</button>
                <h2 className="text-2xl font-bold mb-4 text-gray-900">Share Your Creation</h2>
                
                <img src={image.image_url} alt={image.prompt} className="w-full h-auto object-cover rounded-lg mb-4 border border-gray-200" />

                <div className="space-y-4">
                    <textarea
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder="Generate a caption or write your own..."
                        className="w-full p-2 bg-gray-50 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-klein-blue"
                        rows={3}
                    />
                    <button
                        onClick={handleGenerateCaption}
                        disabled={captionStatus === 'loading'}
                        className="w-full bg-klein-blue px-4 py-2 rounded text-white font-semibold hover:opacity-90 disabled:bg-gray-400 transition-colors"
                    >
                        {captionStatus === 'loading' ? 'Generating...' : '✨ Generate AI Caption'}
                    </button>
                </div>

                <div className="mt-6">
                    <p className="text-center text-gray-600 mb-4">Share on:</p>
                    <div className="flex justify-center space-x-4">
                        <TwitterShareButton url={shareUrl} title={title}>
                            <XIcon size={40} round />
                        </TwitterShareButton>
                        <FacebookShareButton url={shareUrl} hashtag={"#dreamImgAI"}>
                            <FacebookIcon size={40} round />
                        </FacebookShareButton>
                        <WhatsappShareButton url={shareUrl} title={title} separator=":: ">
                            <WhatsappIcon size={40} round />
                        </WhatsappShareButton>
                        <LinkedinShareButton url={shareUrl} title="AI Generated Image" summary={title}>
                            <LinkedinIcon size={40} round />
                        </LinkedinShareButton>
                        <TelegramShareButton url={shareUrl} title={title}>
                            <TelegramIcon size={40} round />
                        </TelegramShareButton>
                        <RedditShareButton url={shareUrl} title={title}>
                            <RedditIcon size={40} round />
                        </RedditShareButton>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShareModal; 