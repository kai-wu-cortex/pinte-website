
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CONTENT_EN, CONTENT_ZH } from '../data/content';

type Language = 'en' | 'zh' | 'vi';
type Locale = 'en_US' | 'en_GB' | 'en-MY' | 'vi_VN' | 'zh_CN';

interface LanguageContextType {
  lang: Language;
  locale: Locale;
  setLanguage: (language: Language) => void;
  setLocale: (locale: Locale) => void;
  toggleLanguage: () => void;
  content: typeof CONTENT_EN;
  ui: typeof CONTENT_EN.UI;
  availableLocales: Array<{ code: Locale; language: string; region: string }>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Mapping between locales and content
const LOCALE_CONTENT_MAP: Record<Locale, any> = {
  en_US: CONTENT_EN,
  en_GB: CONTENT_EN,
  'en-MY': CONTENT_EN,
  vi_VN: CONTENT_EN, // Fallback to English for Vietnamese until content available
  zh_CN: CONTENT_ZH
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [locale, setLocale] = useState<Locale>('en_US');
  const [content, setContent] = useState(CONTENT_EN);

  // Derive language from locale
  const lang = locale.split('_')[0] as Language;

  useEffect(() => {
    setContent(LOCALE_CONTENT_MAP[locale]);
  }, [locale]);

  const setLanguage = (language: Language) => {
    const newLocale = getDefaultLocaleForLanguage(language);
    setLocale(newLocale);
  };

  const getDefaultLocaleForLanguage = (language: Language): Locale => {
    switch (language) {
      case 'en':
        return 'en_US';
      case 'zh':
        return 'zh_CN';
      case 'vi':
        return 'vi_VN';
      default:
        return 'en_US';
    }
  };

  const toggleLanguage = () => {
    const nextLanguage = lang === 'en' ? 'zh' : lang === 'zh' ? 'vi' : 'en';
    setLanguage(nextLanguage);
  };

  const availableLocales = [
    { code: 'en_US', language: 'English', region: 'United States' },
    { code: 'en_GB', language: 'English', region: 'United Kingdom' },
    { code: 'en-MY', language: 'English', region: 'Malaysia' },
    { code: 'vi_VN', language: 'Vietnamese', region: 'Vietnam' },
    { code: 'zh_CN', language: 'Chinese', region: 'China' }
  ];

  return (
    <LanguageContext.Provider
      value={{
        lang,
        locale,
        setLanguage,
        setLocale,
        toggleLanguage,
        content,
        ui: content.UI,
        availableLocales
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
