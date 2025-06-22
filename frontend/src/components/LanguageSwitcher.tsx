import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Globe, Check } from 'lucide-react';
import { useEffect, useState } from 'react';

const languageMap: { [key: string]: string } = {
  en: 'English',
  zh: 'simplified_chinese',
  'zh-TW': 'traditional_chinese',
  ja: 'japanese',
  ko: 'korean',
  de: 'german',
  fr: 'french',
  it: 'italian',
  es: 'spanish',
  pt: 'portuguese',
  hi: 'Hindi',
};

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation('common');
  const router = useRouter();
  const { pathname, asPath, query, locale } = router;
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    router.push({ pathname, query, hash: 'generator' }, asPath, { locale: lng });
  };

  const supportedLocales = router.locales?.filter(loc => loc !== 'default') || [];
  const currentLanguageName = languageMap[locale || 'en'] || 'English';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <span>{isMounted ? t(languageMap[locale || 'en'] || 'english') : currentLanguageName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-stone-900 border-stone-700 text-white">
        {router.locales?.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => changeLanguage(loc)}
            className="flex justify-between items-center cursor-pointer hover:bg-yellow-500 hover:text-black focus:bg-yellow-500 focus:text-black data-[highlighted]:bg-yellow-500 data-[highlighted]:text-black"
          >
            <span>{isMounted ? t(languageMap[loc]) : languageMap[loc]}</span>
            {locale === loc && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 