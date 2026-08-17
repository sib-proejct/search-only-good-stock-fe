import React, { useState } from 'react';
import { useStocks } from '../hooks/useStocks';
import { CheckCircle2, ChevronRight, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useAppConfig } from '../context/ThemeLanguageContext';

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

  const [activeTab, setActiveTab] = useState('buffett_perfection');
  const [showAll, setShowAll] = useState(false);

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

  // Filter stocks based on search query
  const filteredStocks = stocks.filter(
    (s) =>
      s.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nameKo.includes(searchQuery)
  );

  const displayStocks = showAll ? filteredStocks : filteredStocks.slice(0, 6);

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-5 sm:py-8 space-y-5 sm:space-y-6 animate-fade-in">

      {/* 1. Hero Bento Grid (Compact 3 Cards Row) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-5">

        {/* Card 1: Current Market Scan (14/2,450 Stocks Passed on single line) */}
        <div className="md:col-span-6 bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 sm:p-5 border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex flex-col justify-between transition-colors duration-300">
          <div>
            <span className="text-[11px] sm:text-xs font-medium text-[#86868B] block">{t('currentMarketScan')}</span>
            <div className="flex items-baseline gap-1.5 sm:gap-2 mt-1 flex-wrap">
              <span className="text-lg sm:text-2xl font-bold font-mono text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight tabular-nums">
                {passedStockCount} / {totalStockCount.toLocaleString()}
              </span>
              <span className="text-sm sm:text-base font-semibold text-[#86868B] dark:text-[#A1A1A6]">
                {t('stocksPassed')}
              </span>
            </div>
          </div>

          <div className="pt-2.5 sm:pt-3 mt-2.5 sm:mt-3 border-t border-black/[0.06] dark:border-white/[0.08]">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#34C759] stroke-[2.5] shrink-0" />
              <span className="text-[11px] sm:text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] truncate">
                {t('buffettPassApplied')}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2 & 3: Compact 2-Column Row with Inline Value + Change */}
        <div className="md:col-span-6 grid grid-cols-2 gap-3 sm:gap-5">

          {/* Card 2: S&P 500 (Inline Value + Change) */}
          <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 sm:p-5 border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex flex-col justify-between transition-colors duration-300">
            <div>
              <span className="text-[11px] sm:text-xs font-medium text-[#86868B] block">{t('sp500')}</span>
              <div className="flex items-baseline gap-1.5 sm:gap-2 mt-1 flex-wrap">
                <span className="text-lg sm:text-2xl font-bold font-mono text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight tabular-nums">
                  5,234.18
                </span>
                <span className="inline-flex items-center gap-0.5 text-[11px] sm:text-xs font-semibold text-[#34C759] font-mono tabular-nums">
                  <ArrowUpRight className="w-3 h-3" />
                  +0.42%
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: 10Y Yield (Inline Value + Change) */}
          <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 sm:p-5 border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex flex-col justify-between transition-colors duration-300">
            <div>
              <span className="text-[11px] sm:text-xs font-medium text-[#86868B] block">{t('tenYearYield')}</span>
              <div className="flex items-baseline gap-1.5 sm:gap-2 mt-1 flex-wrap">
                <span className="text-lg sm:text-2xl font-bold font-mono text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight tabular-nums">
                  4.25%
                </span>
                <span className="inline-flex items-center gap-0.5 text-[11px] sm:text-xs font-semibold text-[#FF3B30] font-mono tabular-nums">
                  <ArrowDownRight className="w-3 h-3" />
                  -0.03 bps
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* 2. Swipeable Segmented Filter Ribbon */}
      <div className="flex items-center gap-2 overflow-x-auto py-1.5 px-0.5 scrollbar-none snap-x">
        {presets.map((preset) => {
          const isActive = activeTab === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset.id)}
              className={`px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs transition-all font-medium focus:outline-none whitespace-nowrap snap-start shrink-0 cursor-pointer ${isActive
                ? 'bg-[#0071E3] dark:bg-[#2997FF] text-white shadow-sm font-semibold border border-transparent'
                : 'bg-[#F5F5F7] dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#EBEBED] dark:hover:bg-[#2C2C2E] border border-black/[0.04] dark:border-white/[0.06]'
                }`}
            >
              {preset.label}
            </button>
          );
        })}
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
              onClick={() => onSelectStock(stock.id)}
              className="p-4 flex items-center justify-between gap-3 active:bg-[#F5F5F7] dark:active:bg-[#2C2C2E] transition-colors cursor-pointer"
            >
              {/* Left: Rank & Ticker & Name */}
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-mono text-xs font-semibold text-[#86868B] w-4 tabular-nums">
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
              <tr className="border-b border-black/[0.05] dark:border-white/[0.06] text-xs font-medium text-[#86868B]">
                <th className="py-4 pl-7 pr-4 w-16">{t('rank')}</th>
                <th className="py-4 px-4 min-w-[200px]">{t('company')}</th>
                <th className="py-4 px-4 text-right">{t('price')}</th>
                <th className="py-4 px-4 text-center">{t('score')}</th>
                <th className="py-4 px-4 text-right">{t('fiveYrRoe')}</th>
                <th className="py-4 pr-7 pl-4 text-right">{t('epsCagr')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.06] text-xs">
              {displayStocks.map((stock, index) => {
                const rank = index + 1;
                const scoreLabel = stock.isMasterPass
                  ? `${stock.passCount}/${stock.totalRuleCount} ${t('pass')}`
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
                    onClick={() => onSelectStock(stock.id)}
                    className="hover:bg-[#F5F5F7]/80 dark:hover:bg-[#2C2C2E]/60 transition-colors cursor-pointer group"
                  >
                    {/* Rank */}
                    <td className="py-4 pl-7 pr-4 font-mono text-[#86868B] tabular-nums">
                      {rank}
                    </td>

                    {/* Company */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#1D1D1F] dark:text-[#F5F5F7] group-hover:text-[#0071E3] dark:group-hover:text-[#2997FF] transition-colors font-mono">
                          {stock.ticker}
                        </span>
                        <span className="text-[#86868B] font-normal text-xs">
                          {companyName}
                        </span>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-4 px-4 text-right font-mono font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tabular-nums">
                      {stock.currency === 'USD' ? `$${stock.currentPrice.toFixed(2)}` : `${stock.currentPrice.toLocaleString()}원`}
                    </td>

                    {/* Score Badge */}
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold font-mono tabular-nums ${scorePillClass}`}>
                        {scoreLabel}
                      </span>
                    </td>

                    {/* 5Y ROE */}
                    <td className="py-4 px-4 text-right font-mono text-[#1D1D1F] dark:text-[#F5F5F7] tabular-nums">
                      {stock.avgRoe5Yr.toFixed(1)}%
                    </td>

                    {/* EPS CAGR */}
                    <td className="py-4 pr-7 pl-4 text-right font-mono text-[#1D1D1F] dark:text-[#F5F5F7] tabular-nums">
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

    </div>
  );
};
