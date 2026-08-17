import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Stock } from '../../types/stock';
import { useAppConfig } from '../../context/ThemeLanguageContext';

export type NavTab = 'screener' | 'detail' | 'guide';

interface TopNavBarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedStock?: Stock | null;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  currentTab,
  onSelectTab,
  searchQuery,
  onSearchChange,
}) => {
  const { t } = useAppConfig();
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const isDetail = currentTab === 'detail';

  return (
    <header className="sticky top-0 z-40 bg-[#FBFBFD]/90 dark:bg-black/85 backdrop-blur-xl border-b border-black/[0.04] dark:border-white/[0.08] transition-colors duration-300">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 h-14 sm:h-18 flex items-center justify-between gap-2">
        
        {/* Mobile Search Overlay */}
        {showMobileSearch ? (
          <div className="flex-1 flex items-center gap-2 animate-fade-in">
            <div className="relative flex-1">
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={isDetail ? `${t('searchTickerPlaceholder')}` : `${t('searchPlaceholder')}`}
                className="w-full bg-[#F5F5F7] dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-[#F5F5F7] text-xs pl-8 pr-3 py-1.5 rounded-full border border-black/[0.06] dark:border-white/[0.08] focus:outline-none focus:border-[#0071E3] dark:focus:border-[#2997FF]"
              />
              <Search className="w-3.5 h-3.5 text-[#86868B] absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
            <button
              onClick={() => {
                setShowMobileSearch(false);
                onSearchChange('');
              }}
              className="p-1.5 text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            {/* Left: Brand */}
            <div className="flex items-center shrink-0">
              <button
                onClick={() => onSelectTab('screener')}
                className="text-left group cursor-pointer focus:outline-none"
              >
                <span className="text-sm sm:text-lg font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight hover:opacity-80 transition-opacity whitespace-nowrap">
                  {t('brandTitle')}
                </span>
              </button>
            </div>

            {/* Center: Clean Nav Links with Apple Blue Underline */}
            <nav className="flex items-center space-x-3 sm:space-x-8 shrink-0">
              <button
                onClick={() => onSelectTab('screener')}
                className={`text-xs sm:text-sm font-medium py-1.5 px-0.5 relative transition-colors focus:outline-none whitespace-nowrap cursor-pointer ${
                  currentTab === 'screener'
                    ? 'text-[#0071E3] dark:text-[#2997FF] font-semibold'
                    : 'text-[#6E6E73] dark:text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
                }`}
              >
                <span>{t('screener')}</span>
                {currentTab === 'screener' && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#0071E3] dark:bg-[#2997FF] rounded-full" />
                )}
              </button>

              <button
                onClick={() => onSelectTab('detail')}
                className={`text-xs sm:text-sm font-medium py-1.5 px-0.5 relative transition-colors focus:outline-none whitespace-nowrap cursor-pointer ${
                  currentTab === 'detail'
                    ? 'text-[#0071E3] dark:text-[#2997FF] font-semibold'
                    : 'text-[#6E6E73] dark:text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
                }`}
              >
                <span>{t('analysis')}</span>
                {currentTab === 'detail' && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#0071E3] dark:bg-[#2997FF] rounded-full" />
                )}
              </button>

              <button
                onClick={() => onSelectTab('guide')}
                className={`text-xs sm:text-sm font-medium py-1.5 px-0.5 relative transition-colors focus:outline-none whitespace-nowrap cursor-pointer ${
                  currentTab === 'guide'
                    ? 'text-[#0071E3] dark:text-[#2997FF] font-semibold'
                    : 'text-[#6E6E73] dark:text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
                }`}
              >
                <span>{t('guide')}</span>
                {currentTab === 'guide' && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#0071E3] dark:bg-[#2997FF] rounded-full" />
                )}
              </button>
            </nav>

            {/* Right side: Global Search Pill */}
            <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">
              {/* Desktop Search */}
              <div className="relative hidden sm:block">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={t('searchPlaceholder')}
                  className="w-40 md:w-56 bg-[#F5F5F7] dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-[#F5F5F7] text-xs pl-8 pr-3 py-1.5 rounded-full border border-black/[0.06] dark:border-white/[0.08] focus:outline-none focus:border-[#0071E3] dark:focus:border-[#2997FF] transition-all placeholder:text-[#86868B]"
                />
                <Search className="w-3.5 h-3.5 text-[#86868B] absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>

              {/* Mobile Search Trigger Icon */}
              <button
                onClick={() => setShowMobileSearch(true)}
                className="p-1.5 text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] sm:hidden cursor-pointer"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </>
        )}

      </div>
    </header>
  );
};
