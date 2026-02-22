
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CONTENT_EN, CONTENT_ZH } from '../data/content';

type Language = 'en' | 'zh';

interface LanguageContextType {
  lang: Language;
  toggleLanguage: () => void;
  content: typeof CONTENT_EN;
  ui: typeof CONTENT_EN.UI;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>('en');
  const [content, setContent] = useState(CONTENT_EN);

  useEffect(() => {
    setContent(lang === 'en' ? CONTENT_EN : CONTENT_ZH);
  }, [lang]);

  const toggleLanguage = () => {
    setLang(prev => (prev === 'en' ? 'zh' : 'en'));
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, content, ui: content.UI }}>
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
