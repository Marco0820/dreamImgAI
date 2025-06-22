import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { useState, useEffect } from "react";
import {
  FacebookShareButton,
  TwitterShareButton,
  RedditShareButton,
  FacebookIcon,
  TwitterIcon,
  RedditIcon,
} from 'react-share';
import { CommunityImage } from '../types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: CommunityImage | null;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, image }) => {
  const [caption, setCaption] = useState('');

  useEffect(() => {
    if (image) {
      setCaption(image.prompt);
    }
  }, [image]);

  if (!isOpen || !image) {
    return null;
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-stone-900 border-stone-800">
        <DialogHeader>
          <DialogTitle className="text-stone-200">Share this Image</DialogTitle>
          <DialogDescription>
            Share this generated image with the community or on social media.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-lg overflow-hidden">
            <img src={image.image_url} alt={image.prompt} className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col space-y-4">
            <div>
              <label htmlFor="caption" className="text-stone-400 text-sm font-medium">Caption</label>
              <Textarea
                id="caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="mt-1 bg-stone-800 border-stone-700 text-stone-200 focus:ring-amber-500 focus:border-amber-500"
                rows={4}
              />
            </div>
            
            <div className="flex flex-col space-y-2">
                <Button className="w-full bg-amber-600 hover:bg-amber-700">Share to Community</Button>
                <div className="flex items-center space-x-2">
                    <div className="flex-grow border-t border-stone-700"></div>
                    <span className="text-stone-500 text-xs">or share on</span>
                    <div className="flex-grow border-t border-stone-700"></div>
                </div>
                <div className="flex justify-center space-x-3 pt-2">
                    <TwitterShareButton url={shareUrl} title={caption}>
                        <TwitterIcon size={40} round />
                    </TwitterShareButton>
                    <FacebookShareButton url={shareUrl} hashtag="#dreamimgai">
                        <FacebookIcon size={40} round />
                    </FacebookShareButton>
                    <RedditShareButton url={shareUrl} title={caption}>
                        <RedditIcon size={40} round />
                    </RedditShareButton>
                </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal; 