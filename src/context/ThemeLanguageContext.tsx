import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, translations } from '../locales/translations';

export type Theme = 'light' | 'dark';

interface ThemeLanguageContextType {
  theme: Theme;
  toggleTheme: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: keyof typeof translations['en'], params?: Record<string, string | number>) => string;
}

const ThemeLanguageContext = createContext<ThemeLanguageContextType | undefined>(undefined);

export const ThemeLanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize theme from localStorage or system preference
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('sogs_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return 'light';
  });

  // Initialize language from localStorage or default 'ko'
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('sogs_lang');
    if (saved === 'ko' || saved === 'en') return saved;
    return 'ko';
  });

  // Apply dark mode class to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('sogs_theme', theme);
  }, [theme]);

  // Persist language
  useEffect(() => {
    localStorage.setItem('sogs_lang', language);
  }, [language]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === 'ko' ? 'en' : 'ko'));
  };

  // Translation helper with param replacement
  const t = (key: keyof typeof translations['en'], params?: Record<string, string | number>): string => {
    const currentDict = translations[language] || translations['en'];
    let text = (currentDict as any)[key] || (translations['en'] as any)[key] || key;

    if (params) {
      Object.entries(params).forEach(([paramKey, paramVal]) => {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
      });
    }

    return text;
  };

  return (
    <ThemeLanguageContext.Provider
      value={{
        theme,
        toggleTheme,
        language,
        setLanguage,
        toggleLanguage,
        t,
      }}
    >
      {children}
    </ThemeLanguageContext.Provider>
  );
};

export function useAppConfig() {
  const context = useContext(ThemeLanguageContext);
  if (!context) {
    throw new Error('useAppConfig must be used within a ThemeLanguageProvider');
  }
  return context;
}
