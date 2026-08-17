import React from 'react';
import { Sun, Moon, Globe } from 'lucide-react';
import { useAppConfig } from '../../context/ThemeLanguageContext';

export const FloatingControlDock: React.FC = () => {
  const { theme, toggleTheme, language, toggleLanguage } = useAppConfig();

  return (
    <aside
      aria-label="Display and Language Settings"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-1.5 p-1.5 rounded-full bg-white/85 dark:bg-[#1C1C1E]/85 backdrop-blur-2xl border border-black/[0.08] dark:border-white/[0.12] shadow-apple-modal transition-all duration-300 hover:scale-105"
    >
      {/* 1. Single Toggle Language Button (Swaps between KO <-> EN) */}
      <button
        onClick={toggleLanguage}
        className="h-8.5 px-3 rounded-full flex items-center gap-1.5 text-xs font-bold bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#EBEBED] dark:hover:bg-[#3A3A3C] transition-all focus:outline-none select-none"
        title={language === 'ko' ? 'Switch to English' : '한국어로 전환'}
      >
        <Globe className="w-3.5 h-3.5 text-[#0071E3] dark:text-[#2997FF]" />
        <span>{language === 'ko' ? 'EN' : 'KO'}</span>
      </button>

      {/* 2. Theme Toggle Button (Light / Dark) */}
      <button
        onClick={toggleTheme}
        className="w-8.5 h-8.5 rounded-full flex items-center justify-center text-[#1D1D1F] dark:text-[#F5F5F7] bg-[#F5F5F7] dark:bg-[#2C2C2E] hover:bg-[#EBEBED] dark:hover:bg-[#3A3A3C] transition-all focus:outline-none select-none"
        title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        aria-label="Toggle Theme"
      >
        {theme === 'light' ? (
          <Moon className="w-4 h-4 text-[#1D1D1F]" />
        ) : (
          <Sun className="w-4 h-4 text-[#FFD60A]" />
        )}
      </button>
    </aside>
  );
};
