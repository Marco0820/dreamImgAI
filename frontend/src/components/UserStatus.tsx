'use client';
import { useSession, signOut } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { Button } from './ui/button';

export default function UserStatus() {
  const { data: session, status } = useSession();
  const { t } = useTranslation('common');

  if (status === 'loading') {
    return <div className="animate-pulse bg-gray-700 rounded-md w-24 h-8"></div>;
  }
  
  if (session) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">{session.user?.email}</span>
        <Button 
          onClick={() => signOut()} 
          variant="ghost"
        >
          {t('signOut')}
        </Button>
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-4">
       {/* The login button is already in Layout.tsx, so we might not need a separate signIn here */}
       {/* Not showing login/register as they are in Layout, but keeping code for reference if needed */}
       {/* <Link href="/login" className="text-sm font-semibold hover:text-gray-300 transition-colors">
        {t('signIn')}
      </Link>
      <Link href="/signup" className="px-4 py-2 text-sm font-bold bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
        {t('register')}
      </Link> */}
    </div>
  );
} 