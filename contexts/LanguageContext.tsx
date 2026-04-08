
import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { CONTENT_EN, CONTENT_ZH } from '../data/content';

export type Language = 'en' | 'cn' | 'vi';
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

// Mapping between URL language codes to content
const LANG_CONTENT_MAP: Record<Language, any> = {
  en: CONTENT_EN,
  cn: CONTENT_ZH,
  vi: CONTENT_EN // Fallback to English for Vietnamese until content available
};

// Mapping between URL language and default locale
const LANG_LOCALE_MAP: Record<Language, Locale> = {
  en: 'en_US',
  cn: 'zh_CN',
  vi: 'vi_VN'
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { lang: paramLang } = useParams<{lang: string}>();
  const navigate = useNavigate();
  const location = useLocation();

  // Validate language from URL, default to 'cn' if invalid
  const lang: Language = paramLang === 'en' || paramLang === 'cn' || paramLang === 'vi'
    ? paramLang as Language
    : 'cn';

  // Get locale based on language
  const locale = LANG_LOCALE_MAP[lang];

  // Get content based on language
  const content = LANG_CONTENT_MAP[lang];

  const setLanguage = (newLang: Language) => {
    // Construct the new path with the language prefix
    const currentPath = location.pathname;
    const segments = currentPath.split('/').filter(Boolean);

    // If first segment is already a language code, replace it
    if (segments.length > 0 && (segments[0] === 'en' || segments[0] === 'cn' || segments[0] === 'vi')) {
      segments[0] = newLang;
    } else {
      // Otherwise, prepend the language code
      segments.unshift(newLang);
    }

    navigate(`/${segments.join('/')}`);
  };

  const setLocale = (newLocale: Locale) => {
    // Extract language from locale and navigate
    // Convert zh -> cn for our URL format
    const extractedLang = newLocale.split('_')[0];
    const newLang = (extractedLang === 'zh' ? 'cn' : extractedLang) as Language;
    setLanguage(newLang);
  };

  const toggleLanguage = () => {
    const nextLanguage = lang === 'en' ? 'cn' : 'en';
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
