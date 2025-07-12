'use client';
import { useSession, signOut } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import { Button } from './ui/button';
import { Coins } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

// 这只是一个帮助函数，它可以是 async
const fetchCredits = async () => {
  const { data } = await axios.get('/api/user/credits');
  return data;
};

// 但组件本身绝对不能是 async
export default function UserStatus() {
  const { data: session, status } = useSession();
  const { t } = useTranslation('common');

  const { data: creditsData, isLoading: isLoadingCredits } = useQuery({
    queryKey: ['userCredits'],
    queryFn: fetchCredits,
    enabled: status === 'authenticated',
  });

  if (status === 'loading') {
    return <div className="animate-pulse bg-gray-700 rounded-md w-36 h-8"></div>;
  }
  
  if (session && session.user) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm font-medium bg-gray-800 px-3 py-1 rounded-full">
          <Coins className="h-4 w-4 text-yellow-400" />
          {isLoadingCredits ? (
            <span className="w-4 h-4 rounded-full bg-gray-600 animate-pulse"></span>
          ) : (
            // 优先显示实时获取的积分，如果获取失败或加载中，则显示 session 中的旧积分作为备用
            <span>{creditsData?.credits ?? session.user.credits}</span>
          )}
        </div>
        <span className="text-sm font-medium hidden sm:inline">{session.user.email}</span>
        <Button 
          onClick={() => signOut()} 
          variant="ghost"
          size="sm"
        >
          {t('signOut')}
        </Button>
      </div>
    );
  }
  
  return null;
}