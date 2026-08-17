import React, { useState, useRef, useEffect } from 'react';
import { useStocks } from '../hooks/useStocks';
import { CheckCircle2, ChevronRight, ChevronDown, ArrowUpRight, ArrowDownRight, Check } from 'lucide-react';
import { useAppConfig } from '../context/ThemeLanguageContext';
import { StockDetailDrawer } from '../components/screener/StockDetailDrawer';

export type MarketFilterType = 'US' | 'KR' | 'ALL';

interface ScreenerPageProps {
  onSelectStock: (stockId: string) => void;
  searchQuery: string;
}

export const ScreenerPage: React.FC<ScreenerPageProps> = ({ onSelectStock, searchQuery }) => {
  const { t, language } = useAppConfig();
  const {
    stocks,
    totalStockCount,
    passedStockCount,
    ruleEngine,
  } = useStocks();

  const [marketFilter, setMarketFilter] = useState<MarketFilterType>('US');
  const [isMarketDropdownOpen, setIsMarketDropdownOpen] = useState(false);
  const marketDropdownRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState('buffett_perfection');
  const [showAll, setShowAll] = useState(false);
  const [drawerStockId, setDrawerStockId] = useState<string | null>(null);

  // Close market dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (marketDropdownRef.current && !marketDropdownRef.current.contains(event.target as Node)) {
        setIsMarketDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Market Options for Dropdown
  const marketOptions: { id: MarketFilterType; label: string; subLabel: string }[] = [
    { id: 'US', label: t('usStocks'), subLabel: 'NASDAQ · NYSE' },
    { id: 'KR', label: t('krStocks'), subLabel: 'KOSPI · KOSDAQ' },
    { id: 'ALL', label: t('allMarkets'), subLabel: language === 'ko' ? '미국 + 한국 통합' : 'US & KR Combined' },
  ];

  const currentMarketOption = marketOptions.find((o) => o.id === marketFilter) || marketOptions[0];

  // Strategy Presets with translations
  const presets = [
    { id: 'buffett_perfection', label: t('buffettPerfection') },
    { id: 'zero_debt', label: t('zeroDebt') },
    { id: 'garp', label: t('garpStrategy') },
    { id: 'dividend', label: t('dividendChampions') },
  ];

  const handleSelectPreset = (id: string) => {
    setActiveTab(id);
    if (id === 'buffett_perfection') {
      ruleEngine.applyPreset('buffett_master');
    } else if (id === 'zero_debt') {
      ruleEngine.applyPreset('zero_debt_fortress');
    } else if (id === 'garp') {
      ruleEngine.applyPreset('buffett_master');
    } else if (id === 'dividend') {
      ruleEngine.applyPreset('one_dollar_champion');
    }
  };

  // Filter stocks based on market filter and search query
  const filteredStocks = stocks.filter((s) => {
    // 1. Market condition
    const matchesMarket =
      marketFilter === 'ALL'
        ? true
        : marketFilter === 'US'
          ? s.market === 'NASDAQ' || s.market === 'NYSE' || s.currency === 'USD'
          : s.market === 'KOSPI' || s.market === 'KOSDAQ' || s.currency === 'KRW';

    // 2. Search condition
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      s.ticker.toLowerCase().includes(q) ||
      s.nameEn.toLowerCase().includes(q) ||
      s.nameKo.includes(q) ||
      s.sector.toLowerCase().includes(q);

    return matchesMarket && matchesSearch;
  });

  const displayStocks = showAll ? filteredStocks : filteredStocks.slice(0, 6);

  const selectedDrawerStock =
    filteredStocks.find((s) => s.id === drawerStockId) ||
    stocks.find((s) => s.id === drawerStockId) ||
    null;

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-5 sm:py-8 space-y-5 sm:space-y-6 animate-fade-in">

      {/* 1. Hero Bento Grid (Compact 3 Cards Row) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-5">

        {/* Card 1: Current Market Scan */}
        <div className="md:col-span-6 bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 sm:p-5 border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex flex-col justify-between transition-colors duration-300">
          <div>
            <span className="text-[11px] sm:text-xs font-medium text-[#86868B] block truncate">{t('currentMarketScan')}</span>
            <div className="flex items-baseline gap-1.5 sm:gap-2 mt-1 whitespace-nowrap">
              <span className="text-lg sm:text-2xl font-bold font-mono text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight tabular-nums">
                {passedStockCount} / {totalStockCount.toLocaleString()}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-[#86868B] dark:text-[#A1A1A6]">
                {t('stocksPassed')}
              </span>
            </div>
          </div>

          <div className="pt-2.5 sm:pt-3 mt-2.5 sm:mt-3 border-t border-black/[0.06] dark:border-white/[0.08]">
            <div className="flex items-center gap-1.5 min-w-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#34C759] stroke-[2.5] shrink-0" />
              <span className="text-[11px] sm:text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] truncate">
                {t('buffettPassApplied')}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2 & 3: Compact 2-Column Row with Inline Value + Change */}
        <div className="md:col-span-6 grid grid-cols-2 gap-3 sm:gap-5">

          {/* Card 2: S&P 500 / KOSPI (Inline Value + Change) */}
          <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 sm:p-5 border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex flex-col justify-between transition-colors duration-300">
            <div>
              <span className="text-[11px] sm:text-xs font-medium text-[#86868B] block truncate">
                {marketFilter === 'KR' ? 'KOSPI' : t('sp500')}
              </span>
              <div className="flex items-baseline gap-1.5 sm:gap-2 mt-1 whitespace-nowrap">
                <span className="text-lg sm:text-2xl font-bold font-mono text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight tabular-nums">
                  {marketFilter === 'KR' ? '2,745.20' : '5,234.18'}
                </span>
                <span className="inline-flex items-center gap-0.5 text-[11px] sm:text-xs font-semibold text-[#34C759] font-mono tabular-nums">
                  <ArrowUpRight className="w-3 h-3 shrink-0" />
                  {marketFilter === 'KR' ? '+0.68%' : '+0.42%'}
                </span>
              </div>
            </div>

            <div className="pt-2.5 sm:pt-3 mt-2.5 sm:mt-3 border-t border-black/[0.06] dark:border-white/[0.08]">
              <span className="text-[11px] sm:text-xs font-medium text-[#86868B] truncate block">
                {marketFilter === 'KR' ? t('krMarketIndex') : t('usMarketIndex')}
              </span>
            </div>
          </div>

          {/* Card 3: 10Y Yield (Inline Value + Change) */}
          <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 sm:p-5 border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex flex-col justify-between transition-colors duration-300">
            <div>
              <span className="text-[11px] sm:text-xs font-medium text-[#86868B] block truncate">
                {t('tenYearYield')}
              </span>
              <div className="flex items-baseline gap-1.5 sm:gap-2 mt-1 whitespace-nowrap">
                <span className="text-lg sm:text-2xl font-bold font-mono text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight tabular-nums">
                  4.25%
                </span>
                <span className="inline-flex items-center gap-0.5 text-[11px] sm:text-xs font-semibold text-[#FF3B30] font-mono tabular-nums">
                  <ArrowDownRight className="w-3 h-3 shrink-0" />
                  -0.03 bps
                </span>
              </div>
            </div>

            <div className="pt-2.5 sm:pt-3 mt-2.5 sm:mt-3 border-t border-black/[0.06] dark:border-white/[0.08]">
              <span className="text-[11px] sm:text-xs font-medium text-[#86868B] truncate block">
                {t('benchmarkRate')}
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* 2. Toss/Apple Style Filter Ribbon (Market Dropdown Capsule + Strategy Tabs Bar) */}
      <div className="flex items-center gap-2.5 py-1">

        {/* Left: Market Dropdown Selector Button (Toss Securities style) */}
        <div className="relative shrink-0 z-30" ref={marketDropdownRef}>
          <button
            onClick={() => setIsMarketDropdownOpen(!isMarketDropdownOpen)}
            className="h-10 sm:h-11 px-3.5 sm:px-4 rounded-2xl bg-[#F2F4F6] dark:bg-[#1C1C1E] hover:bg-[#E5E8EB] dark:hover:bg-[#2C2C2E] text-[#191F28] dark:text-[#F5F5F7] font-semibold text-xs sm:text-[13px] flex items-center gap-1.5 border border-black/[0.06] dark:border-white/[0.08] shadow-2xs transition-all cursor-pointer select-none focus:outline-none"
            aria-haspopup="true"
            aria-expanded={isMarketDropdownOpen}
          >
            <span>{currentMarketOption.label}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-[#8B95A1] dark:text-[#86868B] transition-transform duration-200 ${isMarketDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Popover Menu */}
          {isMarketDropdownOpen && (
            <div className="absolute left-0 top-full mt-2 w-48 bg-white dark:bg-[#1C1C1E] rounded-2xl shadow-xl dark:shadow-2xl border border-black/[0.08] dark:border-white/[0.12] p-1.5 z-50 animate-fade-in">
              {marketOptions.map((opt) => {
                const isSelected = marketFilter === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setMarketFilter(opt.id);
                      setIsMarketDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer select-none ${isSelected
                        ? 'bg-[#F2F4F6] dark:bg-[#2C2C2E] font-bold text-[#0071E3] dark:text-[#2997FF]'
                        : 'text-[#191F28] dark:text-[#F5F5F7] hover:bg-[#F9FAFB] dark:hover:bg-[#252528]'
                      }`}
                  >
                    <div>
                      <div className="font-semibold text-xs">{opt.label}</div>
                      <div className="text-[10px] text-[#8B95A1] dark:text-[#86868B] font-normal">{opt.subLabel}</div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#0071E3] dark:text-[#2997FF] stroke-[2.5]" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Strategy Segmented Capsule Ribbon (Toss Securities style) */}
        <div className="inline-flex w-fit max-w-full bg-[#F2F4F6] dark:bg-[#1C1C1E] p-1 rounded-2xl border border-black/[0.04] dark:border-white/[0.06] items-center gap-1 overflow-x-auto scrollbar-none shrink-0">
          {presets.map((preset) => {
            const isActive = activeTab === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset.id)}
                className={`px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-[13px] rounded-xl whitespace-nowrap transition-all duration-200 select-none cursor-pointer focus:outline-none shrink-0 ${isActive
                    ? 'bg-white dark:bg-[#2C2C2E] text-[#191F28] dark:text-[#F5F5F7] font-bold shadow-sm border border-black/[0.04] dark:border-white/[0.06]'
                    : 'text-[#8B95A1] dark:text-[#86868B] hover:text-[#191F28] dark:hover:text-[#F5F5F7] font-medium hover:bg-white/40 dark:hover:bg-white/5'
                  }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

      </div>

      {/* 3. Stock List / Table View */}

      {/* 3A. Mobile View (iOS Stocks App Style List - Shown on Mobile only) */}
      <div className="block md:hidden bg-white dark:bg-[#1C1C1E] rounded-2xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm overflow-hidden divide-y divide-black/[0.04] dark:divide-white/[0.06]">
        {displayStocks.map((stock, index) => {
          const rank = index + 1;
          const scoreLabel = stock.isMasterPass
            ? `${stock.passCount}/${stock.totalRuleCount}`
            : `${stock.passCount}/${stock.totalRuleCount}`;

          const scorePillClass = stock.isMasterPass
            ? 'bg-[#EAF8EE] dark:bg-[#34C759]/15 text-[#34C759]'
            : stock.passCount >= 4
              ? 'bg-[#EAF8EE] dark:bg-[#34C759]/15 text-[#34C759]'
              : 'bg-[#FDF2F2] dark:bg-[#FF3B30]/15 text-[#FF3B30]';

          const companyName = language === 'ko' ? stock.nameKo : stock.nameEn;

          return (
            <div
              key={stock.id}
              onClick={() => setDrawerStockId(stock.id)}
              className="p-4 flex items-center justify-between gap-3 active:bg-[#F5F5F7] dark:active:bg-[#2C2C2E] transition-colors cursor-pointer"
            >
              {/* Left: Rank & Ticker & Name */}
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-mono text-xs font-semibold text-[#86868B] w-4 shrink-0 tabular-nums">
                  {rank}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-[#1D1D1F] dark:text-[#F5F5F7] font-mono">
                      {stock.ticker}
                    </span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold font-mono ${scorePillClass}`}>
                      {scoreLabel}
                    </span>
                  </div>
                  <div className="text-xs text-[#86868B] truncate mt-0.5 font-normal">
                    {companyName}
                  </div>
                </div>
              </div>

              {/* Right: Price & 5Y ROE */}
              <div className="text-right shrink-0">
                <div className="font-mono font-bold text-sm text-[#1D1D1F] dark:text-[#F5F5F7] tabular-nums">
                  {stock.currency === 'USD' ? `$${stock.currentPrice.toFixed(2)}` : `${stock.currentPrice.toLocaleString()}원`}
                </div>
                <div className="text-[11px] font-mono text-[#34C759] font-medium tabular-nums mt-0.5">
                  ROE {stock.avgRoe5Yr.toFixed(1)}%
                </div>
              </div>
            </div>
          );
        })}

        {/* Mobile Footer */}
        <div className="p-3.5 border-t border-black/[0.05] dark:border-white/[0.06] flex items-center justify-between text-xs text-[#86868B]">
          <span>{t('showingTop', { count: displayStocks.length, total: filteredStocks.length })}</span>
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-[#0071E3] dark:text-[#2997FF] font-semibold flex items-center gap-0.5 focus:outline-none"
          >
            <span>{showAll ? t('showTop6') : t('viewAll')}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3B. Desktop Table View (Shown on md: and above) */}
      <div className="hidden md:block bg-white dark:bg-[#1C1C1E] rounded-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm overflow-hidden transition-colors duration-300">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black/[0.05] dark:border-white/[0.06] text-xs font-medium text-[#86868B] whitespace-nowrap">
                <th className="py-4 pl-6 sm:pl-7 pr-3 w-16 sm:w-20 whitespace-nowrap">{t('rank')}</th>
                <th className="py-4 px-4 min-w-[200px] whitespace-nowrap">{t('company')}</th>
                <th className="py-4 px-4 text-right whitespace-nowrap">{t('price')}</th>
                <th className="py-4 px-4 text-center whitespace-nowrap">{t('score')}</th>
                <th className="py-4 px-4 text-right whitespace-nowrap">{t('fiveYrRoe')}</th>
                <th className="py-4 pr-6 sm:pr-7 pl-4 text-right whitespace-nowrap">{t('epsCagr')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.06] text-xs">
              {displayStocks.map((stock, index) => {
                const rank = index + 1;
                const scoreLabel = stock.isMasterPass
                  ? `${stock.passCount}/${stock.totalRuleCount} ${t('masterPass')}`
                  : stock.passCount >= 4
                    ? `${stock.passCount}/${stock.totalRuleCount} ${t('watch')}`
                    : `${stock.passCount}/${stock.totalRuleCount} ${t('fail')}`;

                const scorePillClass = stock.isMasterPass
                  ? 'bg-[#EAF8EE] dark:bg-[#34C759]/15 text-[#34C759]'
                  : stock.passCount >= 4
                    ? 'bg-[#EAF8EE] dark:bg-[#34C759]/15 text-[#34C759]'
                    : 'bg-[#FDF2F2] dark:bg-[#FF3B30]/15 text-[#FF3B30]';

                const companyName = language === 'ko' ? `${stock.nameKo} (${stock.nameEn})` : stock.nameEn;

                return (
                  <tr
                    key={stock.id}
                    onClick={() => setDrawerStockId(stock.id)}
                    className="hover:bg-[#F5F5F7]/80 dark:hover:bg-[#2C2C2E]/60 transition-colors cursor-pointer group"
                  >
                    {/* Rank */}
                    <td className="py-4 pl-6 sm:pl-7 pr-3 font-mono text-[#86868B] tabular-nums whitespace-nowrap">
                      {rank}
                    </td>

                    {/* Company */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#1D1D1F] dark:text-[#F5F5F7] group-hover:text-[#0071E3] dark:group-hover:text-[#2997FF] transition-colors font-mono whitespace-nowrap">
                          {stock.ticker}
                        </span>
                        <span className="text-[#86868B] font-normal text-xs truncate">
                          {companyName}
                        </span>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-4 px-4 text-right font-mono font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tabular-nums whitespace-nowrap">
                      {stock.currency === 'USD' ? `$${stock.currentPrice.toFixed(2)}` : `${stock.currentPrice.toLocaleString()}원`}
                    </td>

                    {/* Score Badge */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold font-mono tabular-nums whitespace-nowrap ${scorePillClass}`}>
                        {scoreLabel}
                      </span>
                    </td>

                    {/* 5Y ROE */}
                    <td className="py-4 px-4 text-right font-mono text-[#1D1D1F] dark:text-[#F5F5F7] tabular-nums whitespace-nowrap">
                      {stock.avgRoe5Yr.toFixed(1)}%
                    </td>

                    {/* EPS CAGR */}
                    <td className="py-4 pr-6 sm:pr-7 pl-4 text-right font-mono text-[#1D1D1F] dark:text-[#F5F5F7] tabular-nums whitespace-nowrap">
                      {stock.epsCagr5Yr >= 0 ? `${stock.epsCagr5Yr.toFixed(1)}%` : `${stock.epsCagr5Yr.toFixed(1)}%`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Desktop Table Footer */}
        <div className="py-4 px-7 border-t border-black/[0.05] dark:border-white/[0.06] flex items-center justify-between text-xs text-[#86868B]">
          <span>{t('showingTop', { count: displayStocks.length, total: filteredStocks.length })}</span>
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-[#0071E3] dark:text-[#2997FF] hover:underline font-semibold flex items-center gap-0.5 focus:outline-none cursor-pointer"
          >
            <span>{showAll ? t('showTop6') : t('viewAll')}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4. Quick Stock Detail Slide-over Panel */}
      <StockDetailDrawer
        stock={selectedDrawerStock}
        isOpen={Boolean(selectedDrawerStock)}
        onClose={() => setDrawerStockId(null)}
        onNavigateToFullDetail={(stockId) => {
          setDrawerStockId(null);
          onSelectStock(stockId);
        }}
        stockList={filteredStocks}
        onSelectStock={(stockId) => setDrawerStockId(stockId)}
      />

    </div>
  );
};
