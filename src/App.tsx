import { useState } from 'react';
import { ThemeLanguageProvider, useAppConfig } from './context/ThemeLanguageContext';
import { TopNavBar } from './components/common/TopNavBar';
import { ScreenerPage } from './pages/ScreenerPage';
import { StockDetailPage } from './pages/StockDetailPage';
import { RuleGuidePage } from './pages/RuleGuidePage';
import { MOCK_STOCKS } from './services/mockData';
import { Sun, Moon, Globe } from 'lucide-react';

function AppContent() {
  const { t, theme, toggleTheme, language, toggleLanguage } = useAppConfig();
  const [currentTab, setCurrentTab] = useState<'screener' | 'detail' | 'guide'>('screener');
  const [selectedStockId, setSelectedStockId] = useState<string>('aapl');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const selectedStock = MOCK_STOCKS.find((s) => s.id === selectedStockId) || MOCK_STOCKS[0];

  const handleSelectStock = (stockId: string) => {
    setSelectedStockId(stockId);
    setCurrentTab('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#FBFBFD] dark:bg-black text-[#1D1D1F] dark:text-[#F5F5F7] flex flex-col font-sans selection:bg-[#0071E3]/15 selection:text-[#0071E3] transition-colors duration-300">

      {/* 1. Frosted Glass Top Navigation Bar */}
      <TopNavBar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedStock={selectedStock}
      />

      {/* 2. Main Body Content */}
      <main className="flex-1 w-full pb-16">
        {currentTab === 'screener' && (
          <ScreenerPage
            onSelectStock={handleSelectStock}
            searchQuery={searchQuery}
          />
        )}

        {currentTab === 'detail' && (
          <StockDetailPage
            stockId={selectedStockId}
            onBack={() => setCurrentTab('screener')}
            onSelectStock={handleSelectStock}
          />
        )}

        {currentTab === 'guide' && <RuleGuidePage />}
      </main>

      {/* 3. Apple Minimalist Footer with Inline Controls on a Single Line */}
      <footer className="border-t border-black/[0.04] dark:border-white/[0.08] bg-[#FBFBFD] dark:bg-black py-8 px-6 sm:px-8 text-xs text-[#86868B] font-sans transition-colors duration-300">
        <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">

          {/* Left: Copyright */}
          <div className="font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">
            {t('footerCopyright')}
          </div>

          {/* Right: Links & Controls on the Same Single Line */}
          <div className="flex flex-wrap items-center gap-5 sm:gap-6">
            <nav className="flex items-center space-x-5 sm:space-x-6 text-[#86868B]">
              <a href="#privacy" className="hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors">{t('privacy')}</a>
              <a href="#terms" className="hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors">{t('terms')}</a>
              <a href="#disclosure" className="hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors">{t('disclosure')}</a>
              <a href="#contact" className="hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors">{t('contact')}</a>
            </nav>

            <span className="hidden sm:inline text-[#D2D2D7] dark:text-[#3A3A3C]">|</span>

            {/* Single Toggle Language + Theme Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleLanguage}
                className="h-7 px-2.5 rounded-full flex items-center gap-1 text-[11px] font-bold bg-[#F5F5F7] dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#EBEBED] dark:hover:bg-[#2C2C2E] border border-black/[0.06] dark:border-white/[0.08] transition-all focus:outline-none select-none cursor-pointer"
                title={language === 'ko' ? 'Switch to English' : '한국어로 전환'}
              >
                <Globe className="w-3 h-3 text-[#0071E3] dark:text-[#2997FF]" />
                <span>{language === 'ko' ? 'EN' : 'KO'}</span>
              </button>

              <button
                onClick={toggleTheme}
                className="w-7 h-7 rounded-full flex items-center justify-center text-[#1D1D1F] dark:text-[#F5F5F7] bg-[#F5F5F7] dark:bg-[#1C1C1E] hover:bg-[#EBEBED] dark:hover:bg-[#2C2C2E] border border-black/[0.06] dark:border-white/[0.08] transition-all focus:outline-none select-none cursor-pointer"
                title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                aria-label="Toggle Theme"
              >
                {theme === 'light' ? (
                  <Moon className="w-3.5 h-3.5 text-[#1D1D1F]" />
                ) : (
                  <Sun className="w-3.5 h-3.5 text-[#FFD60A]" />
                )}
              </button>
            </div>

          </div>

        </div>
      </footer>

    </div>
  );
}

export function App() {
  return (
    <ThemeLanguageProvider>
      <AppContent />
    </ThemeLanguageProvider>
  );
}

export default App;
