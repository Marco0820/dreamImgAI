import { Fragment, useState, useEffect } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { HiCheck, HiGlobe } from 'react-icons/hi';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

const languages = [
    { code: 'en', name: 'English' },
    { code: 'zh', name: '简体中文' },
    { code: 'zh-TW', name: '繁體中文' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' },
    { code: 'de', name: 'Deutsch' },
    { code: 'fr', name: 'Français' },
    { code: 'it', name: 'Italiano' },
    { code: 'es', name: 'Español' },
    { code: 'pt', name: 'Português' },
    { code: 'hi', name: 'हिन्दी' },
];

export default function LanguageSwitcher() {
  const router = useRouter();
  const { i18n } = useTranslation();
  const [selected, setSelected] = useState(() => languages.find(l => l.code === i18n.language) || languages[0]);

  useEffect(() => {
    const currentLang = languages.find(l => l.code === i18n.language);
    if (currentLang) {
      setSelected(currentLang);
    }
  }, [i18n.language]);

  const handleLanguageChange = (lang: { code: string; name: string; }) => {
    setSelected(lang);
    const { pathname, query } = router;
    const newPath = pathname.split('#')[0];
    router.push({ pathname: newPath, query }, newPath, { locale: lang.code });
  };

  return (
    <div className="w-36 z-50">
      <Listbox value={selected} onChange={handleLanguageChange}>
        <div className="relative mt-1">
          <Listbox.Button className="relative w-full cursor-default rounded-lg bg-transparent py-2 pl-3 pr-10 text-left text-gray-300 hover:bg-gray-700 transition-colors focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 sm:text-sm">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2">
                <HiGlobe className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </span>
            <span className="block truncate pl-5">{selected.name}</span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                {languages.map((lang) => (
                  <Listbox.Option
                    key={lang.code}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${
                        selected.code === lang.code ? 'bg-amber-500 text-amber-900' : 'text-gray-200'
                      } ${
                        active && selected.code !== lang.code ? 'bg-gray-700' : ''
                      }`
                    }
                    value={lang}
                  >
                    {({ selected }) => (
                      <>
                        <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                          {lang.name}
                        </span>
                        {selected ? (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-800">
                            <HiCheck className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
} 