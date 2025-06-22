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

const languageMap: { [key: string]: { name: string; key: string } } = {
  ar: { name: 'Arabic', key: 'arabic' },
  bn: { name: 'Bengali', key: 'bengali' },
  de: { name: 'German', key: 'german' },
  en: { name: 'English', key: 'english' },
  es: { name: 'Spanish', key: 'spanish' },
  fa: { name: 'Persian', key: 'persian' },
  fr: { name: 'French', key: 'french' },
  he: { name: 'Hebrew', key: 'hebrew' },
  hi: { name: 'Hindi', key: 'hindi' },
  id: { name: 'Indonesian', key: 'indonesian' },
  it: { name: 'Italian', key: 'italian' },
  ja: { name: 'Japanese', key: 'japanese' },
  kn: { name: 'Kannada', key: 'kannada' },
  ko: { name: 'Korean', key: 'korean' },
  mr: { name: 'Marathi', key: 'marathi' },
  ms: { name: 'Malay', key: 'malay' },
  ne: { name: 'Nepali', key: 'nepali' },
  pl: { name: 'Polish', key: 'polish' },
  pt: { name: 'Portuguese', key: 'portuguese' },
  ru: { name: 'Russian', key: 'russian' },
  ta: { name: 'Tamil', key: 'tamil' },
  th: { name: 'Thai', key: 'thai' },
  tr: { name: 'Turkish', key: 'turkish' },
  ur: { name: 'Urdu', key: 'urdu' },
  vi: { name: 'Vietnamese', key: 'vietnamese' },
  zh: { name: 'Simplified Chinese', key: 'simplified_chinese' },
  'zh-TW': { name: 'Traditional Chinese', key: 'traditional_chinese' },
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

  const currentLanguageName = languageMap[locale || 'en']?.name || 'English';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <span>{isMounted ? t(languageMap[locale || 'en']?.key || 'english') : currentLanguageName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-stone-900 border-stone-700 text-white">
        {router.locales?.map((loc) => {
          if (loc === 'default') return null;
          const lang = languageMap[loc];
          if (!lang) return null;

          return (
            <DropdownMenuItem
              key={loc}
              onClick={() => changeLanguage(loc)}
              className="flex justify-between items-center cursor-pointer hover:bg-yellow-500 hover:text-black focus:bg-yellow-500 focus:text-black data-[highlighted]:bg-yellow-500 data-[highlighted]:text-black"
            >
              <span>{isMounted ? t(lang.key) : lang.name}</span>
              {locale === loc && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 