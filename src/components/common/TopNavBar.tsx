import React, { useState, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAccount } from '../../context/AccountContext';
import { Search, X, Globe, Moon, Sun, Settings } from 'lucide-react';
import { useAppConfig } from '../../context/ThemeLanguageContext';

export type NavTab = 'screener' | 'detail' | 'guide' | 'community';
export type GuideType = 'buffett' | 'lynch';

interface TopNavBarProps {
  currentTab?: NavTab;
  onSelectTab?: (tab: NavTab, guideType?: GuideType) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeGuide?: GuideType;
  currentTicker?: string | null;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  currentTab: propCurrentTab,
  onSelectTab,
  searchQuery,
  onSearchChange,
  activeGuide: propActiveGuide,
  currentTicker = null,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, language, theme, toggleTheme, toggleLanguage } = useAppConfig();
  const { user, loading, logout } = useAccount();
  const [logoutError, setLogoutError] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Compute active tab from pathname
  const currentTab = useMemo<NavTab>(() => {
    if (propCurrentTab) return propCurrentTab;
    const path = location.pathname;
    if (path.startsWith('/stock') || path.startsWith('/detail')) return 'detail';
    if (path.startsWith('/guide')) return 'guide';
    if (path.startsWith('/community')) return 'community';
    return 'screener';
  }, [propCurrentTab, location.pathname]);

  // Compute active guide from pathname
  const activeGuide = useMemo<GuideType>(() => {
    if (propActiveGuide) return propActiveGuide;
    const path = location.pathname;
    if (path.includes('lynch')) return 'lynch';
    return 'buffett';
  }, [propActiveGuide, location.pathname]);

  const handleNavigateTab = (tab: NavTab, guideType?: GuideType) => {
    if (onSelectTab) {
      onSelectTab(tab, guideType);
    }
    if (tab === 'screener') {
      navigate('/');
    } else if (tab === 'detail') {
      const routeTicker = location.pathname.match(
        /^\/(?:stock|detail)\/([^/]+)/
      )?.[1];
      const targetTicker = currentTicker || routeTicker;
      navigate(
        targetTicker
          ? `/stock/${targetTicker}${location.search}`
          : '/stock'
      );
    } else if (tab === 'guide') {
      const targetGuide = guideType || (activeGuide === 'lynch' ? 'lynch' : 'buffett');
      navigate(`/guide/${targetGuide}`);
    } else if (tab === 'community') {
      navigate('/community');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderThemeLanguageControls = (withDivider = true) => (
    <div className={`flex items-center justify-between gap-2 ${withDivider ? 'pb-2 mb-2 border-b border-black/[0.06] dark:border-white/[0.08]' : ''}`}>
      <button
        type="button"
        onClick={toggleLanguage}
        className="h-7 px-2.5 rounded-full flex items-center gap-1 text-[11px] font-bold bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#EBEBED] dark:hover:bg-[#3A3A3C] border border-black/[0.06] dark:border-white/[0.08] transition-all focus:outline-none select-none cursor-pointer"
        title={language === 'ko' ? 'Switch to English' : '한국어로 전환'}
      >
        <Globe className="w-3 h-3 text-[#0071E3] dark:text-[#2997FF]" />
        <span>{language === 'ko' ? 'EN' : 'KO'}</span>
      </button>

      <button
        type="button"
        onClick={toggleTheme}
        className="w-7 h-7 rounded-full flex items-center justify-center text-[#1D1D1F] dark:text-[#F5F5F7] bg-[#F5F5F7] dark:bg-[#2C2C2E] hover:bg-[#EBEBED] dark:hover:bg-[#3A3A3C] border border-black/[0.06] dark:border-white/[0.08] transition-all focus:outline-none select-none cursor-pointer"
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
  );

  return (
    <header className="display-chrome sticky top-0 z-40 bg-[#FBFBFD]/90 dark:bg-black/85 backdrop-blur-xl border-b border-black/[0.04] dark:border-white/[0.08] transition-colors duration-300">
      <div className="page-container max-w-[1600px] mx-auto px-3 sm:px-8 h-14 sm:h-[4.5rem] flex items-center justify-between gap-1.5 sm:gap-4">

        {/* Mobile Search Overlay */}
        {showMobileSearch ? (
          <div className="flex-1 flex items-center gap-2 animate-fade-in">
            <div className="relative flex-1">
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full bg-[#F5F5F7] dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-[#F5F5F7] text-xs pl-8 pr-3 py-1.5 rounded-full border border-black/[0.06] dark:border-white/[0.08] focus:outline-none focus:border-[#0071E3] dark:focus:border-[#2997FF]"
              />
              <Search className="w-3.5 h-3.5 text-[#86868B] absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
            <button
              onClick={() => {
                setShowMobileSearch(false);
                onSearchChange('');
              }}
              className="p-1.5 text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] rounded-full cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            {/* Left: Brand (Clean Typographic SOGS Logo) */}
            <div className="flex items-center shrink-0">
              <button
                onClick={() => handleNavigateTab('screener')}
                className="text-left group cursor-pointer focus:outline-none flex items-center gap-1.5 sm:gap-2"
              >
                <span className="text-sm sm:text-lg font-black tracking-tight text-[#0071E3] dark:text-[#2997FF] group-hover:opacity-80 transition-opacity">
                  SOGS
                </span>
                <span className="hidden md:inline text-xs sm:text-sm font-medium text-[#86868B] dark:text-[#86868B] tracking-tight">
                  Search Only Good Stock
                </span>
              </button>
            </div>


            {/* Center: Clean Nav Links with Horizontal Scroll Shelf on Mobile */}
            <nav className="flex items-center space-x-1 sm:space-x-6 overflow-x-auto no-scrollbar py-1 min-w-0">
              <button
                onClick={() => handleNavigateTab('screener')}
                className={`text-xs sm:text-sm font-medium py-1 px-1.5 sm:px-0.5 shrink-0 relative transition-colors focus:outline-none whitespace-nowrap cursor-pointer ${currentTab === 'screener'
                  ? 'text-[#0071E3] dark:text-[#2997FF]'
                  : 'text-[#6E6E73] dark:text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
                  }`}
              >
                <span>{t('screener')}</span>
                {currentTab === 'screener' && (
                  <span className="absolute -bottom-1 left-1 right-1 sm:left-0 sm:right-0 h-0.5 bg-[#0071E3] dark:bg-[#2997FF] rounded-full" />
                )}
              </button>

              <button
                onClick={() => handleNavigateTab('detail')}
                className={`text-xs sm:text-sm font-medium py-1 px-1.5 sm:px-0.5 shrink-0 relative transition-colors focus:outline-none whitespace-nowrap cursor-pointer ${currentTab === 'detail'
                  ? 'text-[#0071E3] dark:text-[#2997FF]'
                  : 'text-[#6E6E73] dark:text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
                  }`}
              >
                <span className="hidden sm:inline">{t('analysis')}</span>
                <span className="sm:hidden">{t('analysisShort')}</span>
                {currentTab === 'detail' && (
                  <span className="absolute -bottom-1 left-1 right-1 sm:left-0 sm:right-0 h-0.5 bg-[#0071E3] dark:bg-[#2997FF] rounded-full" />
                )}
              </button>

              {/* Guide Tab with Hover Dropdown */}
              <div
                className="relative shrink-0"
                onMouseEnter={() => setIsGuideOpen(true)}
                onMouseLeave={() => setIsGuideOpen(false)}
              >
                <button
                  onClick={() => {
                    handleNavigateTab('guide', 'buffett');
                    setIsGuideOpen(false);
                  }}
                  className={`text-xs sm:text-sm font-medium py-1 px-1.5 sm:px-0.5 relative transition-colors focus:outline-none whitespace-nowrap cursor-pointer flex items-center gap-1 ${currentTab === 'guide'
                    ? 'text-[#0071E3] dark:text-[#2997FF]'
                    : 'text-[#6E6E73] dark:text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
                    }`}
                >
                  <span className="hidden sm:inline">{t('guide')}</span>
                  <span className="sm:hidden">{t('guideShort')}</span>
                  {currentTab === 'guide' && (
                    <span className="absolute -bottom-1 left-1 right-1 sm:left-0 sm:right-0 h-0.5 bg-[#0071E3] dark:bg-[#2997FF] rounded-full" />
                  )}
                </button>

                {/* Sub-Guide Dropdown Menu on Hover (Slim 1 Row, 2 Columns) */}
                {isGuideOpen && (
                  <div className="absolute left-0 sm:left-1/2 sm:-translate-x-1/2 top-full pt-1.5 z-50 animate-fade-in">
                    <div className="bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-2xl rounded-xl border border-black/[0.08] dark:border-white/[0.12] shadow-xl p-1 flex items-center gap-1 whitespace-nowrap">

                      {/* Sub-guide 1: Warren Buffett Rules */}
                      <button
                        onClick={() => {
                          handleNavigateTab('guide', 'buffett');
                          setIsGuideOpen(false);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${currentTab === 'guide' && activeGuide === 'buffett'
                          ? 'bg-[#0071E3]/10 dark:bg-[#2997FF]/15 text-[#0071E3] dark:text-[#2997FF] font-semibold'
                          : 'hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-[#1D1D1F] dark:text-[#F5F5F7]'
                          }`}
                      >
                        {t('guideBuffett')}
                      </button>

                      {/* Divider */}
                      <div className="w-px h-3.5 bg-black/[0.06] dark:bg-white/[0.1]" />

                      {/* Sub-guide 2: Peter Lynch Rules */}
                      <button
                        onClick={() => {
                          handleNavigateTab('guide', 'lynch');
                          setIsGuideOpen(false);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${currentTab === 'guide' && activeGuide === 'lynch'
                          ? 'bg-[#0071E3]/10 dark:bg-[#2997FF]/15 text-[#0071E3] dark:text-[#2997FF] font-semibold'
                          : 'hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-[#1D1D1F] dark:text-[#F5F5F7]'
                          }`}
                      >
                        {t('guideLynch')}
                      </button>

                    </div>
                  </div>
                )}
              </div>

              {/* Community Tab */}
              <button
                onClick={() => handleNavigateTab('community')}
                className={`text-xs sm:text-sm font-medium py-1 px-1.5 sm:px-0.5 shrink-0 relative transition-colors focus:outline-none whitespace-nowrap cursor-pointer ${currentTab === 'community'
                  ? 'text-[#0071E3] dark:text-[#2997FF]'
                  : 'text-[#6E6E73] dark:text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
                  }`}
              >
                <span className="hidden sm:inline">{t('community')}</span>
                <span className="sm:hidden">{t('communityShort')}</span>
                {currentTab === 'community' && (
                  <span className="absolute -bottom-1 left-1 right-1 sm:left-0 sm:right-0 h-0.5 bg-[#0071E3] dark:bg-[#2997FF] rounded-full" />
                )}
              </button>
            </nav>

            {/* Right side: Search Pill */}
              <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
                {loading ? (
                  <span className="text-xs text-[#86868B]">…</span>
                ) : user ? (
                  <div className="relative">
                    <details key={location.pathname} className="text-xs group">
                      <summary className="cursor-pointer font-semibold max-w-32 truncate list-none [&::-webkit-details-marker]:hidden flex items-center gap-1.5 text-[#1D1D1F] dark:text-[#F5F5F7] hover:text-[#0071E3] dark:hover:text-[#2997FF] py-1 px-1.5 rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors">
                        <span className="truncate">{user.username}</span>
                        <Settings className="w-3.5 h-3.5 text-[#6E6E73] dark:text-[#86868B] shrink-0" />
                      </summary>
                      <div className="absolute right-0 top-full mt-2 p-2.5 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-black/10 dark:border-white/10 shadow-xl w-max whitespace-nowrap z-50 animate-fade-in">
                        {renderThemeLanguageControls(true)}
                        <div className="space-y-2 text-xs px-0.5">
                          {user.role === 'admin' && (
                            <Link
                              className="block text-[#1D1D1F] dark:text-[#F5F5F7] hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors"
                              to="/admin/valuation"
                            >
                              {language === 'ko' ? '종목 관리' : 'Stock management'}
                            </Link>
                          )}
                          <Link
                            className="block text-[#1D1D1F] dark:text-[#F5F5F7] hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors"
                            to="/account/password"
                          >
                            {language === 'ko' ? '비밀번호 변경' : 'Change password'}
                          </Link>
                          <button
                            type="button"
                            className="block w-full text-left text-[#FF3B30] hover:opacity-80 transition-opacity cursor-pointer"
                            onClick={() => {
                              setLogoutError(false);
                              void logout().catch(() => setLogoutError(true));
                            }}
                          >
                            {language === 'ko' ? '로그아웃' : 'Log out'}
                          </button>
                          {logoutError && (
                            <p role="alert" className="text-[11px] text-[#FF3B30]">
                              {language === 'ko'
                                ? '로그아웃하지 못했습니다. 다시 시도해 주세요.'
                                : 'Could not log out. Please retry.'}
                            </p>
                          )}
                        </div>
                      </div>
                    </details>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <Link
                      to={
                        location.pathname === '/login'
                          ? location.pathname + location.search
                          : `/login?next=${encodeURIComponent(location.pathname + location.search)}`
                      }
                      className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] hover:text-[#0071E3] dark:hover:text-[#2997FF] whitespace-nowrap transition-colors py-1 px-1.5"
                    >
                      {language === 'ko' ? '로그인' : 'Log in'}
                    </Link>
                    <div className="relative">
                      <details key={location.pathname} className="text-xs">
                        <summary
                          className="p-1.5 rounded-lg text-[#6E6E73] dark:text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] cursor-pointer list-none [&::-webkit-details-marker]:hidden flex items-center transition-colors"
                          title={language === 'ko' ? '화면 설정' : 'Preferences'}
                          aria-label="Preferences"
                        >
                          <Settings className="w-4 h-4" />
                        </summary>
                        <div className="absolute right-0 top-full mt-2 p-2.5 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-black/10 dark:border-white/10 shadow-xl z-50 animate-fade-in">
                          {renderThemeLanguageControls(false)}
                        </div>
                      </details>
                    </div>
                  </div>
                )}
                {/* Desktop Search */}
                <div className="relative hidden md:block">
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
                  className="p-1.5 text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] md:hidden cursor-pointer"
                  aria-label={t('searchPlaceholder')}
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
