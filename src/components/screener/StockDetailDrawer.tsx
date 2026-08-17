import React, { useEffect, useCallback } from 'react';
import { Stock } from '../../types/stock';
import { useAppConfig } from '../../context/ThemeLanguageContext';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  TrendingUp,
  Landmark,
  Banknote,
  ShieldCheck,
  DollarSign,
  CheckCircle2,
  PieChart,
  Shield,
  Activity,
} from 'lucide-react';
import { DcfIntrinsicValueCard } from '../detail/DcfIntrinsicValueCard';
import { OneDollarRetainedCard } from '../detail/OneDollarRetainedCard';
import { CapitalAllocationCookCard } from '../detail/CapitalAllocationCookCard';

interface StockDetailDrawerProps {
  stock: Stock | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToFullDetail: (stockId: string) => void;
  stockList: Stock[];
  onSelectStock: (stockId: string) => void;
}

export const StockDetailDrawer: React.FC<StockDetailDrawerProps> = ({
  stock,
  isOpen,
  onClose,
  onNavigateToFullDetail,
  stockList,
  onSelectStock,
}) => {
  const { t, language } = useAppConfig();

  // Find index of current stock in the active list
  const currentIndex = stock
    ? stockList.findIndex((s) => s.id === stock.id || s.ticker === stock.ticker)
    : -1;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < stockList.length - 1;

  const handlePrevStock = useCallback(() => {
    if (hasPrev && currentIndex > 0) {
      onSelectStock(stockList[currentIndex - 1].id);
    }
  }, [hasPrev, currentIndex, stockList, onSelectStock]);

  const handleNextStock = useCallback(() => {
    if (hasNext && currentIndex < stockList.length - 1) {
      onSelectStock(stockList[currentIndex + 1].id);
    }
  }, [hasNext, currentIndex, stockList, onSelectStock]);

  // Keyboard navigation: Escape to close, Left/Right arrow to navigate
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrevStock();
      } else if (e.key === 'ArrowRight') {
        handleNextStock();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handlePrevStock, handleNextStock]);

  // Prevent background body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !stock) {
    return null;
  }

  const isPricePositive = stock.priceChangePct >= 0;
  const companyName = language === 'ko' ? stock.nameKo : stock.nameEn;
  const subtitleName = language === 'ko' ? stock.nameEn : stock.nameKo;

  const scoreLabel = stock.isMasterPass
    ? `${stock.passCount}/${stock.totalRuleCount} ${t('masterPass')}`
    : stock.passCount >= 4
      ? `${stock.passCount}/${stock.totalRuleCount} ${t('watch')}`
      : `${stock.passCount}/${stock.totalRuleCount} ${t('fail')}`;

  const scorePillClass = stock.isMasterPass
    ? 'bg-[#EAF8EE] dark:bg-[#34C759]/15 text-[#34C759] border-[#34C759]/20'
    : stock.passCount >= 4
      ? 'bg-[#EAF8EE] dark:bg-[#34C759]/15 text-[#34C759] border-[#34C759]/20'
      : 'bg-[#FDF2F2] dark:bg-[#FF3B30]/15 text-[#FF3B30] border-[#FF3B30]/20';

  // 6-Rule Diagnosis list
  const diagnosisRules = [
    {
      title: t('consistentEarnings'),
      value: t('tenYrEpsGrowth'),
      icon: TrendingUp,
      actual: `${stock.epsCagr5Yr >= 0 ? '+' : ''}${stock.epsCagr5Yr.toFixed(1)}% CAGR`,
      passed: stock.epsCagr5Yr >= 10,
    },
    {
      title: t('highRoe'),
      value: t('avgRoeGt20'),
      icon: Landmark,
      actual: `${stock.avgRoe5Yr.toFixed(1)}%`,
      passed: stock.avgRoe5Yr >= 20,
    },
    {
      title: t('highRoic'),
      value: t('roicGt15Historic'),
      icon: Banknote,
      actual: `${stock.avgRoic5Yr.toFixed(1)}%`,
      passed: stock.avgRoic5Yr >= 15,
    },
    {
      title: t('lowDebt'),
      value: t('netCashPositive'),
      icon: ShieldCheck,
      actual: `${stock.debtToEquity.toFixed(0)}% D/E`,
      passed: stock.debtToEquity <= 80,
    },
    {
      title: t('marginExpansion'),
      value: t('grossMarginsUp'),
      icon: ArrowUpRight,
      actual: 'Expanding',
      passed: true,
    },
    {
      title: t('oneDollarTest'),
      value: t('valueCreated'),
      icon: DollarSign,
      actual: `$${stock.oneDollarTest.valueCreatedPerDollar.toFixed(2)}`,
      passed: stock.oneDollarTest.passed,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* 1. Backdrop Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-sm transition-opacity duration-300 animate-fade-in cursor-pointer"
        aria-hidden="true"
      />

      {/* 2. Slide-over Panel Container */}
      <aside
        className="relative z-10 w-full max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl bg-[#FBFBFD] dark:bg-black h-full flex flex-col shadow-2xl border-l border-black/[0.08] dark:border-white/[0.1] transition-transform duration-300 ease-out transform translate-x-0"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-stock-title"
      >
        {/* Top Header Bar with Navigation Controls */}
        <div className="sticky top-0 z-20 px-5 sm:px-7 py-3.5 sm:py-4 bg-[#FBFBFD]/95 dark:bg-black/90 backdrop-blur-xl border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between gap-3">
          
          {/* Left: Quick stock pagination & navigation */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] sm:text-xs font-mono font-semibold text-[#86868B] tabular-nums bg-[#F5F5F7] dark:bg-[#1C1C1E] px-2.5 py-1 rounded-full border border-black/[0.04] dark:border-white/[0.06]">
              {currentIndex >= 0 ? `${currentIndex + 1} / ${stockList.length}` : '1 / 1'}
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevStock}
                disabled={!hasPrev}
                className={`p-1.5 rounded-full border transition-all cursor-pointer ${
                  hasPrev
                    ? 'text-[#1D1D1F] dark:text-[#F5F5F7] bg-white dark:bg-[#1C1C1E] hover:bg-[#EBEBED] dark:hover:bg-[#2C2C2E] border-black/[0.08] dark:border-white/[0.08]'
                    : 'text-[#C7C7CC] dark:text-[#48484A] bg-transparent border-transparent cursor-not-allowed'
                }`}
                title={`${t('prevStock')} (←)`}
                aria-label={t('prevStock')}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={handleNextStock}
                disabled={!hasNext}
                className={`p-1.5 rounded-full border transition-all cursor-pointer ${
                  hasNext
                    ? 'text-[#1D1D1F] dark:text-[#F5F5F7] bg-white dark:bg-[#1C1C1E] hover:bg-[#EBEBED] dark:hover:bg-[#2C2C2E] border-black/[0.08] dark:border-white/[0.08]'
                    : 'text-[#C7C7CC] dark:text-[#48484A] bg-transparent border-transparent cursor-not-allowed'
                }`}
                title={`${t('nextStock')} (→)`}
                aria-label={t('nextStock')}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right: Full detail page shortcut & Close button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateToFullDetail(stock.id)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#0071E3] dark:text-[#2997FF] bg-[#0071E3]/10 dark:bg-[#2997FF]/15 hover:bg-[#0071E3]/20 rounded-full transition-all cursor-pointer"
              title={t('viewFullAnalysis')}
            >
              <span>{t('viewFullAnalysis')}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] hover:bg-[#EBEBED] dark:hover:bg-[#2C2C2E] transition-colors cursor-pointer"
              title={`${t('close')} (Esc)`}
              aria-label={t('close')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        </div>

        {/* Scrollable Drawer Body */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-5 sm:py-6 space-y-5 sm:space-y-6">

          {/* 1. Hero Stock Identity Card */}
          <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Left: Ticker & Name */}
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] flex items-center justify-center font-mono font-bold text-base shadow-sm shrink-0">
                {stock.ticker.slice(0, 4)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 id="drawer-stock-title" className="text-lg sm:text-xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                    {companyName}
                  </h1>
                  <span className="font-mono text-xs font-semibold text-[#86868B] dark:text-[#A1A1A6] bg-[#F5F5F7] dark:bg-[#2C2C2E] px-2 py-0.5 rounded-full border border-black/[0.04] dark:border-white/[0.06]">
                    {stock.ticker}
                  </span>
                  <span className="text-xs text-[#86868B]">· {stock.market}</span>
                </div>
                <div className="text-xs text-[#86868B] truncate mt-0.5">
                  {subtitleName} · {stock.sector}
                </div>
              </div>
            </div>

            {/* Right: Price & Score Badges */}
            <div className="flex sm:flex-col items-baseline sm:items-end justify-between gap-1 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-black/[0.04] dark:border-white/[0.06]">
              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-bold font-mono text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight tabular-nums">
                  {stock.currency === 'USD' ? `$${stock.currentPrice.toFixed(2)}` : `${stock.currentPrice.toLocaleString()}원`}
                </span>
                <span className={`text-xs font-mono font-bold tabular-nums px-2 py-0.5 rounded-full ${
                  isPricePositive ? 'bg-[#34C759]/15 text-[#34C759]' : 'bg-[#FF3B30]/15 text-[#FF3B30]'
                }`}>
                  {isPricePositive ? `+${stock.priceChangePct.toFixed(2)}%` : `${stock.priceChangePct.toFixed(2)}%`}
                </span>
              </div>

              <div className="mt-1">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono border ${scorePillClass}`}>
                  <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
                  <span>{scoreLabel}</span>
                </span>
              </div>
            </div>
          </div>

          {/* 2. Key Financial Metrics Bar (High-Density Strip) */}
          <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 border border-black/[0.06] dark:border-white/[0.08] shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.04] dark:border-white/[0.06] text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#0071E3] dark:text-[#2997FF]" />
                {t('keyFinancialMetrics')}
              </span>
              <span className="text-[11px] text-[#86868B] font-mono tabular-nums">
                {t('marketCapLabel')}: {stock.marketCapFormatted}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs">
              <div className="bg-[#F5F5F7] dark:bg-[#252528] p-2.5 rounded-xl">
                <span className="text-[10px] text-[#86868B] block font-medium">5Y Avg ROE</span>
                <span className="text-sm font-bold font-mono text-[#34C759] tabular-nums mt-0.5 block">
                  {stock.avgRoe5Yr.toFixed(1)}%
                </span>
              </div>

              <div className="bg-[#F5F5F7] dark:bg-[#252528] p-2.5 rounded-xl">
                <span className="text-[10px] text-[#86868B] block font-medium">5Y Avg ROIC</span>
                <span className="text-sm font-bold font-mono text-[#0071E3] dark:text-[#2997FF] tabular-nums mt-0.5 block">
                  {stock.avgRoic5Yr.toFixed(1)}%
                </span>
              </div>

              <div className="bg-[#F5F5F7] dark:bg-[#252528] p-2.5 rounded-xl">
                <span className="text-[10px] text-[#86868B] block font-medium">5Y EPS CAGR</span>
                <span className="text-sm font-bold font-mono text-[#1D1D1F] dark:text-[#F5F5F7] tabular-nums mt-0.5 block">
                  {stock.epsCagr5Yr >= 0 ? `+${stock.epsCagr5Yr.toFixed(1)}%` : `${stock.epsCagr5Yr.toFixed(1)}%`}
                </span>
              </div>

              <div className="bg-[#F5F5F7] dark:bg-[#252528] p-2.5 rounded-xl">
                <span className="text-[10px] text-[#86868B] block font-medium">{t('debtRatio')} (D/E)</span>
                <span className={`text-sm font-bold font-mono tabular-nums mt-0.5 block ${
                  stock.debtToEquity <= 80 ? 'text-[#34C759]' : 'text-[#FF9500]'
                }`}>
                  {stock.debtToEquity.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* 3. Warren Buffett 6-Pillar Diagnosis Bento (6-Grid Card) */}
          <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-black/[0.06] dark:border-white/[0.08] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#0071E3] dark:text-[#2997FF]" />
                <h2 className="text-sm sm:text-base font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                  {t('buffett6RuleDiagnosis')}
                </h2>
              </div>
              <span className="text-[10px] sm:text-xs text-[#86868B] font-mono font-semibold bg-[#F5F5F7] dark:bg-[#2C2C2E] px-2.5 py-0.5 rounded-full">
                {stock.passCount}/6 {t('pass')}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {diagnosisRules.map((rule, idx) => {
                const Icon = rule.icon;
                return (
                  <div
                    key={idx}
                    className="bg-[#F5F5F7] dark:bg-[#252528] border border-black/[0.03] dark:border-white/[0.06] rounded-xl p-3 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Icon className="w-3.5 h-3.5 text-[#86868B]" />
                      {rule.passed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#34C759] stroke-[2.5]" />
                      ) : (
                        <span className="text-[10px] font-bold font-mono text-[#FF3B30] bg-[#FF3B30]/15 px-1.5 py-0.2 rounded-full">FAIL</span>
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] text-[#86868B] font-medium block truncate">
                        {rule.title}
                      </span>
                      <div className="flex items-baseline justify-between gap-1 mt-0.5">
                        <span className="text-xs font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight truncate">
                          {rule.actual}
                        </span>
                        <span className="text-[10px] text-[#86868B] truncate">
                          {rule.value}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. DCF Valuation Card */}
          <DcfIntrinsicValueCard currentPrice={stock.currentPrice} currency={stock.currency} />

          {/* 5. $1 Retained Earnings Test & Capital Allocation (2 Bento Cards) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <OneDollarRetainedCard testResult={stock.oneDollarTest} />
            <CapitalAllocationCookCard governance={stock.governance} />
          </div>

          {/* 6. Economic Moat & Leadership Summary */}
          <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-5 border border-black/[0.06] dark:border-white/[0.08] shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
              <span className="flex items-center gap-1.5">
                <PieChart className="w-3.5 h-3.5 text-[#FF9500]" />
                {t('economicMoat')} & {t('governanceRating')}
              </span>
              <span className="text-[10px] font-bold font-mono bg-[#FF9500]/15 text-[#C93400] px-2 py-0.5 rounded-full">
                {stock.governance.gradeLabel}
              </span>
            </div>

            <p className="text-xs text-[#86868B] leading-relaxed">
              {stock.economicMoatSummary}
            </p>

            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {stock.moatSources.map((source, idx) => (
                <span
                  key={idx}
                  className="text-[11px] font-medium bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-[#F5F5F7] px-2.5 py-1 rounded-full border border-black/[0.04] dark:border-white/[0.06]"
                >
                  ✓ {source}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Sticky Bottom Action Footer */}
        <div className="sticky bottom-0 z-20 px-5 sm:px-7 py-3.5 sm:py-4 bg-[#FBFBFD]/95 dark:bg-black/90 backdrop-blur-xl border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-full text-xs font-medium text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] hover:bg-[#F5F5F7] dark:hover:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] transition-colors cursor-pointer"
          >
            {t('close')}
          </button>

          <button
            onClick={() => onNavigateToFullDetail(stock.id)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-full text-xs font-bold text-white bg-[#0071E3] hover:bg-[#0077ED] dark:bg-[#2997FF] dark:hover:bg-[#0071E3] shadow-sm hover:shadow transition-all cursor-pointer"
          >
            <span>{t('viewFullAnalysis')}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </aside>
    </div>
  );
};
