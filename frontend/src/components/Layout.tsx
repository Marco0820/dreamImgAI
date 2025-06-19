import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { Button } from './ui/button';
import Head from 'next/head';
import { Toaster } from "@/components/ui/sonner";
import UserStatus from './UserStatus';
import { useTranslation } from 'next-i18next';
import { LanguageSwitcher } from './LanguageSwitcher';

const Header = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { data: session } = useSession();

  const navItems = [
    { name: t('features'), href: '/#features' },
    { name: t('pricing'), href: '/pricing' },
    { name: t('faq'), href: '/#faq' },
    { name: t('community'), href: '/community' },
  ];

  return (
    <header className="bg-gray-900/80 backdrop-blur-md sticky top-0 z-50 w-full border-b border-gray-800">
      <div className="container mx-auto">
          <div className="flex justify-between items-center h-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <Link href="/" className="flex items-center space-x-3" target="_blank" rel="noopener noreferrer">
              <Image src="/logo.png" alt={t('logo_alt', 'DreamImg AI Logo')} width={32} height={32} priority suppressHydrationWarning />
              <span className="text-xl font-bold">{t('brand_name', 'DreamImg AI')}</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-2">
              {navItems.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`nav-link px-3 py-2 rounded-md text-sm font-medium transition-colors text-gray-300 ${
                    (link.href.includes('#') && router.asPath.endsWith(link.href)) || (router.pathname === link.href && !link.href.includes('#'))
                      ? 'bg-gray-700 text-white'
                      : ''
                  }`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              {session ? (
                <UserStatus />
              ) : (
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" asChild>
                    <Link href="/login" target="_blank" rel="noopener noreferrer">{t('login')}</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/signup" target="_blank" rel="noopener noreferrer">{t('signup')}</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
      </div>
    </header>
  );
};

const Footer = () => {
    const { t } = useTranslation('common');
    return (
        <footer className="bg-gray-800 border-t border-gray-700 mt-20">
            <div className="container mx-auto py-8 px-4 md:px-6 flex flex-col md:flex-row justify-between items-center">
                <div className="flex items-center space-x-2 mb-4 md:mb-0">
                    <Image src="/logo.png" alt={t('logo_alt', 'DreamImg AI Logo')} width={32} height={32} />
                    <span className="text-xl font-bold">{t('brand_name', 'DreamImg AI')}</span>
                </div>
                <div className="text-center md:text-right">
                    <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} {t('brand_name', 'DreamImg AI')}. {t('rights_reserved', 'All rights reserved.')}</p>
                    <p className="text-sm text-gray-400">{t('powered_by')}</p>
                </div>
            </div>
        </footer>
    );
};

const BackToTopButton = () => {
  const [isVisible, setIsVisible] = React.useState(false);

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
  const { t } = useTranslation('common');

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white font-sans">
      <Head>
        <title>{t('app_title', 'DreamImg AI - AI Image Generator')}</title>
        <meta name="description" content={t('app_description', 'Create stunning AI-generated images in seconds')} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
      <BackToTopButton />
      <Toaster />
    </div>
  );
};

export default Layout; 