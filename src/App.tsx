import { lazy, Suspense, useState, type ReactNode } from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AccountProvider, useAccount } from './context/AccountContext';
import { LoginPage } from './pages/LoginPage';
import { ThemeLanguageProvider, useAppConfig } from './context/ThemeLanguageContext';
import { TopNavBar } from './components/common/TopNavBar';
import { Sun, Moon, Globe } from 'lucide-react';

const StockValuationPage = lazy(() => import('./pages/StockValuationPage').then(module => ({ default: module.StockValuationPage })));

const AdminValuationPage = lazy(() => import('./pages/AdminValuationPage').then(module => ({ default: module.AdminValuationPage })));

const ScreenerPage = lazy(() =>
  import('./pages/ScreenerPage').then((module) => ({
    default: module.ScreenerPage,
  }))
);
const StockDetailPage = lazy(() =>
  import('./pages/StockDetailPage').then((module) => ({
    default: module.StockDetailPage,
  }))
);
const RuleGuidePage = lazy(() =>
  import('./pages/RuleGuidePage').then((module) => ({
    default: module.RuleGuidePage,
  }))
);
const CommunityPage = lazy(() =>
  import('./pages/CommunityPage').then((module) => ({
    default: module.CommunityPage,
  }))
);
const CommunityWritePage = lazy(() =>
  import('./pages/CommunityWritePage').then((module) => ({
    default: module.CommunityWritePage,
  }))
);

function RouteFallback() {
  return (
    <div className="py-24 text-center">
      <div className="inline-block w-8 h-8 border-2 border-[#0071E3] dark:border-[#2997FF] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function AppContent() {
  const { user } = useAccount();
  const { t, theme, toggleTheme, language, toggleLanguage } = useAppConfig();
  const [searchQuery, setSearchQuery] = useState<string>('');

  return (
    <div className="min-h-screen bg-[#FBFBFD] dark:bg-black text-[#1D1D1F] dark:text-[#F5F5F7] flex flex-col font-sans selection:bg-[#0071E3]/15 selection:text-[#0071E3] transition-colors duration-300">
      {/* 1. Frosted Glass Top Navigation Bar */}
      <TopNavBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* 2. Main Body Content with Client-Side Routing */}
      <main className="flex-1 w-full pb-16">
        <Suspense fallback={<RouteFallback />}>
          <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/account/password" element={<LoginPage key="password" passwordChange />} />
          <Route path="/favorites" element={<RequireAccount><ScreenerPage key="favorites" searchQuery={searchQuery} favoritesOnly /></RequireAccount>} />
          <Route path="/admin/valuation" element={<RequireAccount admin><AdminValuationPage /></RequireAccount>} />
          {/* Screener (Home) */}
          <Route
            path="/"
            element={<ScreenerPage key="all" searchQuery={searchQuery} />}
          />
          <Route
            path="/screener"
            element={<Navigate to="/" replace />}
          />

          <Route path="/stock/:ticker/valuation" element={<StockValuationPage />} />
          {/* Stock Analysis Detail */}
          <Route
            path="/stock/:ticker"
            element={<StockDetailPage />}
          />
          <Route
            path="/stock"
            element={<StockDetailPage />}
          />
          <Route
            path="/detail/:ticker"
            element={<StockDetailPage />}
          />
          <Route
            path="/detail"
            element={<StockDetailPage />}
          />

          {/* Investment Principle Guides */}
          <Route
            path="/guide"
            element={<Navigate to="/guide/buffett" replace />}
          />
          <Route
            path="/guide/:guideType"
            element={<RuleGuidePage />}
          />

          {/* Community Discussions */}
          <Route
            path="/community"
            element={<CommunityPage />}
          />
          <Route
            path="/community/write"
            element={<CommunityWritePage />}
          />

          {/* Fallback */}
          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
          </Routes>
        </Suspense>
      </main>

      {/* 3. Apple Minimalist Footer with Inline Controls on a Single Line */}
      <footer className="border-t border-black/[0.04] dark:border-white/[0.08] bg-[#FBFBFD] dark:bg-black py-8 px-6 sm:px-8 text-xs text-[#86868B] font-sans transition-colors duration-300">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left: Copyright */}
          <div className="font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">
            {t('footerCopyright')}
          </div>

          {/* Right: Links & Controls on the Same Single Line */}
          <div className="flex flex-wrap items-center gap-5 sm:gap-6">
            <nav className="flex items-center space-x-5 sm:space-x-6 text-[#86868B]">
              {user?.role === 'admin' && <Link to="/admin/valuation" className="text-[#0071E3] dark:text-[#2997FF] font-semibold hover:underline transition-colors">
                {language === 'ko' ? '내재가치 계산기 (원자료 관리)' : 'Valuation calculator (fact editor)'}
              </Link>}
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
      <AccountProvider><AppContent /></AccountProvider>
    </ThemeLanguageProvider>
  );
}

function RequireAccount({ children, admin = false }: { children: ReactNode; admin?: boolean }) {
  const { user, loading, error, reload } = useAccount();
  const { language } = useAppConfig();
  const location = useLocation();
  if (loading) return <RouteFallback />;
  if (error) return <div role="alert" className="text-center py-16 space-y-3"><p>{error}</p><button onClick={() => void reload()}>{language === 'ko' ? '다시 시도' : 'Retry'}</button></div>;
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  if (admin && user.role !== 'admin') return <p role="alert" className="text-center py-16">{language === 'ko' ? '관리자 권한이 필요합니다.' : 'Administrator access required.'}</p>;
  return children;
}

export default App;
