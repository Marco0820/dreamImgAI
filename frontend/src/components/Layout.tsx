import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'next-i18next';
import { AppDispatch, RootState } from '@/store';
import { checkUserSession, logoutUser } from '@/store/authSlice';
import LanguageSwitcher from './LanguageSwitcher';
import Head from 'next/head';
import { Toaster } from "@/components/ui/sonner";

const Footer = () => (
    <footer className="bg-gray-800 border-t border-gray-700 mt-20">
        <div className="container mx-auto py-8 px-4 md:px-6 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <Image src="/logo.png" alt="DreamImg AI Logo" width={32} height={32} />
                <span className="text-xl font-bold">DreamImg AI</span>
            </div>
            <div className="text-center md:text-right">
                <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} DreamImg AI. All rights reserved.</p>
                <p className="text-sm text-gray-400">Powered by FLUX.1 Dev</p>
            </div>
        </div>
    </footer>
);

const BackToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className={`fixed bottom-8 right-8 p-3 rounded-full bg-yellow-500 text-black shadow-lg hover:bg-yellow-600 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    </button>
  );
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { t } = useTranslation('common');
  const router = useRouter();

  useEffect(() => {
    dispatch(checkUserSession());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logoutUser());
    router.push('/');
  };

  const navLinks = [
    { href: '/#features', label: 'features' },
    { href: '/#faq', label: 'faq' },
    { href: '/pricing', label: 'pricing' },
    { href: '/generate', label: 'generate' },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      <Head>
        <title>DreamImg AI - AI Image Generator</title>
        <meta name="description" content="Create stunning AI-generated images in seconds with DreamImg AI, powered by Flux.1 Dev." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header className="bg-gray-900/80 backdrop-blur-md sticky top-0 z-50 w-full border-b border-gray-800">
        <div className="container mx-auto">
            <div className="flex justify-between items-center h-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
              <Link href="/" className="flex items-center space-x-3">
                <Image src="/logo.png" alt="DreamImg AI Logo" width={32} height={32} />
                <span className="text-xl font-bold">DreamImg AI</span>
              </Link>
              <nav className="hidden md:flex items-center space-x-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors text-gray-300 hover:bg-gray-700 hover:text-white ${
                      (link.href.includes('#') && router.asPath.endsWith(link.href)) || (router.pathname === link.href && !link.href.includes('#'))
                        ? 'bg-gray-700 text-white'
                        : ''
                    }`}
                  >
                    {t(link.label)}
                  </Link>
                ))}
              </nav>
              <div className="flex items-center space-x-4">
                <LanguageSwitcher />
                {user ? (
                  <div className="relative">
                    <span className="text-gray-300">{user?.email}</span>
                    <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                      {t('logout')}
                    </button>
                  </div>
                ) : (
                  <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                    {t('signin')}
                  </Link>
                )}
              </div>
            </div>
        </div>
      </header>
      <main>{children}</main>
      <Footer />
      <BackToTopButton />
    </div>
  );
};

export default Layout; 