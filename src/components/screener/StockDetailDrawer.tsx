import React, { useState, useEffect, useCallback } from 'react';
import { Stock } from '../../types/stock';
import { useAppConfig } from '../../context/ThemeLanguageContext';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Calendar,
} from 'lucide-react';
import { Buffett6RuleDiagnosis } from '../detail/Buffett6RuleDiagnosis';
import { DcfIntrinsicValueCard } from '../detail/DcfIntrinsicValueCard';
import { OneDollarRetainedCard } from '../detail/OneDollarRetainedCard';
import { CapitalAllocationCookCard } from '../detail/CapitalAllocationCookCard';
import { CompanyProfileCard } from '../detail/CompanyProfileCard';
import { YearlyFinancialsTable } from '../detail/YearlyFinancialsTable';

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
  const [trendPeriod, setTrendPeriod] = useState<'1Y' | '5Y'>('1Y');

  // Drawer resize state
  const DEFAULT_WIDTH = 820;
  const MIN_WIDTH = 480;

  const [drawerWidth, setDrawerWidth] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('stock_detail_drawer_width');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= MIN_WIDTH) {
          return Math.min(parsed, typeof window !== 'undefined' ? window.innerWidth - 40 : 1200);
        }
      }
    } catch {
      // ignore
    }
    return DEFAULT_WIDTH;
  });
  const [isResizing, setIsResizing] = useState(false);

  // Resize mouse drag handling
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const maxWidth = Math.max(window.innerWidth - 40, MIN_WIDTH);
      const calculatedWidth = window.innerWidth - e.clientX;
      const clampedWidth = Math.min(Math.max(calculatedWidth, MIN_WIDTH), maxWidth);
      setDrawerWidth(clampedWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'ew-resize';

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // Save width to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('stock_detail_drawer_width', drawerWidth.toString());
    } catch {
      // ignore
    }
  }, [drawerWidth]);

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

  // Sparkline calculations (1Y vs 5Y)
  const activeSparkPoints =
    trendPeriod === '1Y'
      ? stock.sparkline1Yr && stock.sparkline1Yr.length > 0
        ? stock.sparkline1Yr
        : stock.sparkline5Yr
      : stock.sparkline5Yr;

  const sparkMin = Math.min(...activeSparkPoints);
  const sparkMax = Math.max(...activeSparkPoints);
  const sparkRange = sparkMax - sparkMin || 1;

  // Period change % calculation
  const firstPrice = activeSparkPoints[0] || stock.currentPrice;
  const lastPrice = activeSparkPoints[activeSparkPoints.length - 1] || stock.currentPrice;
  const periodChangePct =
    trendPeriod === '1Y' && stock.priceChange1YrPct !== undefined
      ? stock.priceChange1YrPct
      : ((lastPrice - firstPrice) / (firstPrice || 1)) * 100;
  const isPeriodPositive = periodChangePct >= 0;

  // SVG dimensions & points
  const sparkWidth = 140;
  const sparkHeight = 40;
  const paddingY = 5;
  const sparkPointsList = activeSparkPoints.map((val, idx) => {
    const x = (idx / (activeSparkPoints.length - 1 || 1)) * sparkWidth;
    const y =
      sparkHeight -
      paddingY -
      ((val - sparkMin) / sparkRange) * (sparkHeight - paddingY * 2);
    return { x, y };
  });

  const sparkSvgPath = sparkPointsList
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');
  const sparkAreaPath = `${sparkSvgPath} L ${sparkWidth} ${sparkHeight} L 0 ${sparkHeight} Z`;

  // 52-Week Range calculation
  const low52W = stock.low52W !== undefined ? stock.low52W : Math.min(...stock.sparkline5Yr);
  const high52W = stock.high52W !== undefined ? stock.high52W : Math.max(...stock.sparkline5Yr);

  const formatPrice = (val: number) => {
    if (stock.currency === 'USD') {
      return `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `${Math.round(val).toLocaleString()}원`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* 1. Backdrop Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-sm transition-opacity duration-300 animate-fade-in cursor-pointer"
        aria-hidden="true"
      />

      {/* 2. Slide-over Panel Container (Resizable) */}
      <aside
        style={{ width: typeof window !== 'undefined' && window.innerWidth < 640 ? '100%' : `${drawerWidth}px` }}
        className={`relative z-10 w-full max-w-full bg-[#FBFBFD] dark:bg-black h-full flex flex-col shadow-2xl border-l border-black/[0.08] dark:border-white/[0.1] transform translate-x-0 ${
          isResizing ? 'select-none transition-none' : 'transition-[width] duration-150 ease-out'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-stock-title"
      >
        {/* Left Drag Resize Handle (Desktop/Tablet) */}
        <div
          onMouseDown={handleMouseDown}
          onDoubleClick={() => setDrawerWidth(DEFAULT_WIDTH)}
          className={`hidden sm:flex absolute left-0 top-0 bottom-0 w-3 -translate-x-1.5 cursor-ew-resize z-30 items-center justify-center group hover:bg-[#0071E3]/15 dark:hover:bg-[#2997FF]/20 transition-colors ${
            isResizing ? 'bg-[#0071E3]/25 dark:bg-[#2997FF]/30' : ''
          }`}
          title="드래그하여 너비 조절 (더블클릭: 기본 너비)"
          aria-label="Resize panel width"
        >
          {/* Subtle grab bar indicator */}
          <div
            className={`w-1 rounded-full transition-all duration-200 ${
              isResizing
                ? 'h-16 bg-[#0071E3] dark:bg-[#2997FF] shadow-sm'
                : 'h-8 bg-black/20 dark:bg-white/20 group-hover:h-12 group-hover:bg-[#0071E3] dark:group-hover:bg-[#2997FF]'
            }`}
          />
        </div>

        {/* Top Header Bar with Navigation Controls */}
        <div className="sticky top-0 z-20 px-5 sm:px-7 py-3.5 sm:py-4 bg-[#FBFBFD]/95 dark:bg-black/90 backdrop-blur-xl border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between gap-3">

          {/* Left: Quick stock pagination & navigation */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#86868B] tabular-nums font-medium">
              <span className="text-[#1D1D1F] dark:text-[#F5F5F7] font-bold">{currentIndex >= 0 ? currentIndex + 1 : 1}</span> / {stockList.length}
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevStock}
                disabled={!hasPrev}
                className={`p-1.5 rounded-full border transition-all cursor-pointer ${hasPrev
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
                className={`p-1.5 rounded-full border transition-all cursor-pointer ${hasNext
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
        <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-5 sm:py-6 space-y-6">

          {/* 1. Hero Stock Identity & Interactive Sparkline Card */}
          <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-5 sm:p-7 border border-black/[0.06] dark:border-white/[0.08] shadow-sm transition-colors duration-300">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              {/* Left: Ticker & Names & Tags */}
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 id="drawer-stock-title" className="text-xl sm:text-2xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                    {companyName}
                  </h1>
                  <span className="font-mono text-sm font-semibold text-[#86868B]">
                    {stock.ticker}
                  </span>

                  {stock.isMasterPass ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#34C759] bg-[#34C759]/10 dark:bg-[#34C759]/20 px-2.5 py-0.5 rounded-full border border-[#34C759]/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#34C759]" />
                      <span className="font-mono tabular-nums">{stock.passCount}/6</span>
                      <span>{t('masterPass') || '버핏 올패스'}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FF3B30] bg-[#FF3B30]/10 dark:bg-[#FF3B30]/20 px-2.5 py-0.5 rounded-full border border-[#FF3B30]/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B30]" />
                      <span className="font-mono tabular-nums">{stock.passCount}/6</span>
                      <span>{t('fail') || '버핏 기준 탈락'}</span>
                    </span>
                  )}

                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#86868B] bg-black/[0.04] dark:bg-white/[0.06] px-2 py-0.5 rounded-full">
                    <Calendar className="w-3 h-3 text-[#86868B]" />
                    <span>{t('asOfDateLabel')}</span>
                  </span>
                </div>

                <div className="text-xs text-[#86868B] flex items-center gap-2 flex-wrap">
                  <span>{subtitleName}</span>
                  <span>·</span>
                  <span>{stock.market}</span>
                  <span>·</span>
                  <span>{stock.sector}</span>
                </div>
              </div>

              {/* Right: 52W Low/High, Trend Chart & Current Price */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 self-start lg:self-center shrink-0">
                {/* 52W Low / High Stats */}
                <div className="flex sm:flex-col justify-between sm:justify-center gap-2 sm:gap-1 text-xs text-[#86868B] min-w-[100px]">
                  <div className="flex items-center sm:justify-end gap-1.5">
                    <span className="text-[10px] font-medium text-[#86868B]">{t('low52W')}</span>
                    <span className="font-mono font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tabular-nums text-xs">
                      {formatPrice(low52W)}
                    </span>
                  </div>
                  <div className="flex items-center sm:justify-end gap-1.5">
                    <span className="text-[10px] font-medium text-[#86868B]">{t('high52W')}</span>
                    <span className="font-mono font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tabular-nums text-xs">
                      {formatPrice(high52W)}
                    </span>
                  </div>
                </div>

                {/* 1Y / 5Y Interactive Price Trend Mini Chart */}
                <div className="bg-[#F5F5F7] dark:bg-[#252528] rounded-2xl p-2.5 sm:p-3 border border-black/[0.04] dark:border-white/[0.06] transition-colors">
                  <div className="flex items-center justify-between gap-2.5 mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                        {trendPeriod === '1Y' ? t('priceTrend1Y') : t('priceTrend5Y')}
                      </span>
                      <span className={`text-[9px] font-mono font-bold tabular-nums px-1.5 py-0.5 rounded-md ${isPeriodPositive
                          ? 'bg-[#34C759]/15 text-[#34C759]'
                          : 'bg-[#FF3B30]/15 text-[#FF3B30]'
                        }`}>
                        {isPeriodPositive ? `+${periodChangePct.toFixed(1)}%` : `${periodChangePct.toFixed(1)}%`}
                      </span>
                    </div>

                    {/* 1Y / 5Y Switcher */}
                    <div className="flex items-center bg-black/[0.06] dark:bg-white/[0.08] p-0.5 rounded-lg">
                      <button
                        onClick={() => setTrendPeriod('1Y')}
                        className={`px-1.5 py-0.5 text-[9px] font-bold rounded transition-all cursor-pointer select-none ${trendPeriod === '1Y'
                            ? 'bg-white dark:bg-[#1C1C1E] text-[#0071E3] dark:text-[#2997FF] shadow-xs'
                            : 'text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
                          }`}
                      >
                        {t('period1Y')}
                      </button>
                      <button
                        onClick={() => setTrendPeriod('5Y')}
                        className={`px-1.5 py-0.5 text-[9px] font-bold rounded transition-all cursor-pointer select-none ${trendPeriod === '5Y'
                            ? 'bg-white dark:bg-[#1C1C1E] text-[#0071E3] dark:text-[#2997FF] shadow-xs'
                            : 'text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
                          }`}
                      >
                        {t('period5Y')}
                      </button>
                    </div>
                  </div>

                  {/* SVG Sparkline */}
                  <div className="relative">
                    <svg className="w-34 sm:w-38 h-9 overflow-visible" viewBox="0 0 140 40">
                      <defs>
                        <linearGradient id={`drawerSparkGrad-${stock.id}-${trendPeriod}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={isPeriodPositive ? '#34C759' : '#FF3B30'} stopOpacity="0.25" />
                          <stop offset="100%" stopColor={isPeriodPositive ? '#34C759' : '#FF3B30'} stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <path
                        d={sparkAreaPath}
                        fill={`url(#drawerSparkGrad-${stock.id}-${trendPeriod})`}
                      />
                      <path
                        d={sparkSvgPath}
                        fill="none"
                        stroke={isPeriodPositive ? '#34C759' : '#FF3B30'}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {sparkPointsList.length > 0 && (
                        <circle
                          cx={sparkPointsList[sparkPointsList.length - 1].x}
                          cy={sparkPointsList[sparkPointsList.length - 1].y}
                          r="2.5"
                          fill={isPeriodPositive ? '#34C759' : '#FF3B30'}
                        />
                      )}
                    </svg>
                  </div>
                </div>

                {/* Price & Cap */}
                <div className="text-left sm:text-right min-w-[110px]">
                  <div className="flex items-baseline justify-start sm:justify-end gap-1.5">
                    <span className="text-xl sm:text-2xl font-bold font-mono text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight tabular-nums">
                      {formatPrice(stock.currentPrice)}
                    </span>
                  </div>

                  <div className="flex items-center justify-start sm:justify-end gap-1.5 mt-0.5">
                    <span className={`text-xs font-mono font-bold tabular-nums ${isPricePositive ? 'text-[#34C759]' : 'text-[#FF3B30]'
                      }`}>
                      {isPricePositive ? `+${stock.priceChangePct.toFixed(2)}%` : `${stock.priceChangePct.toFixed(2)}%`}
                    </span>
                    <span className="text-[10px] text-[#86868B]">1D</span>
                  </div>

                  <div className="text-[11px] text-[#86868B] mt-1">
                    {t('marketCapLabel')}: <span className="font-semibold font-mono tabular-nums text-[#1D1D1F] dark:text-[#F5F5F7]">{stock.marketCapFormatted}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Key KPI Strip (Apple Minimal Typography Stats) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex flex-col justify-between">
              <span className="text-[10px] sm:text-[11px] text-[#86868B] font-medium uppercase tracking-wider block">5Y Avg ROE</span>
              <div className="mt-1.5">
                <span className="text-xl sm:text-2xl font-bold font-mono text-[#34C759] tracking-tight tabular-nums block">
                  {stock.avgRoe5Yr.toFixed(1)}%
                </span>
                <div className="text-[10px] text-[#86868B] mt-1.5 pt-1.5 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between">
                  <span>기준 &gt; <span className="font-mono tabular-nums">15%</span></span>
                  <span className="text-[#34C759] font-medium font-mono text-[9px]">PASS</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex flex-col justify-between">
              <span className="text-[10px] sm:text-[11px] text-[#86868B] font-medium uppercase tracking-wider block">5Y Avg ROIC</span>
              <div className="mt-1.5">
                <span className="text-xl sm:text-2xl font-bold font-mono text-[#0071E3] dark:text-[#2997FF] tracking-tight tabular-nums block">
                  {stock.avgRoic5Yr.toFixed(1)}%
                </span>
                <div className="text-[10px] text-[#86868B] mt-1.5 pt-1.5 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between">
                  <span>기준 &gt; <span className="font-mono tabular-nums">10%</span></span>
                  <span className="text-[#0071E3] dark:text-[#2997FF] font-medium font-mono text-[9px]">PASS</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex flex-col justify-between">
              <span className="text-[10px] sm:text-[11px] text-[#86868B] font-medium uppercase tracking-wider block">5Y EPS CAGR</span>
              <div className="mt-1.5">
                <span className="text-xl sm:text-2xl font-bold font-mono text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight tabular-nums block">
                  {stock.epsCagr5Yr >= 0 ? `+${stock.epsCagr5Yr.toFixed(1)}%` : `${stock.epsCagr5Yr.toFixed(1)}%`}
                </span>
                <div className="text-[10px] text-[#86868B] mt-1.5 pt-1.5 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between">
                  <span>10Y 복리성장</span>
                  <span className="text-[#34C759] font-medium font-mono text-[9px]">PASS</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex flex-col justify-between">
              <span className="text-[10px] sm:text-[11px] text-[#86868B] font-medium uppercase tracking-wider block">{t('debtRatio')} (D/E)</span>
              <div className="mt-1.5">
                <span className={`text-xl sm:text-2xl font-bold font-mono tracking-tight tabular-nums block ${stock.debtToEquity <= 80 ? 'text-[#34C759]' : 'text-[#FF9500]'
                  }`}>
                  {stock.debtToEquity.toFixed(0)}%
                </span>
                <div className="text-[10px] text-[#86868B] mt-1.5 pt-1.5 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between">
                  <span>무차입 안전</span>
                  <span className="text-[#34C759] font-medium font-mono text-[9px]">PASS</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Row 1: Symmetrical Bento Grid (Buffett 6-Rule Diagnosis & DCF Valuation) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-stretch">
            <Buffett6RuleDiagnosis stock={stock} />
            <DcfIntrinsicValueCard currentPrice={stock.currentPrice} currency={stock.currency} />
          </div>

          {/* 4. Row 2: Symmetrical Bento Grid ($1 Retained Test & Capital Allocation) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-stretch">
            <OneDollarRetainedCard testResult={stock.oneDollarTest} />
            <CapitalAllocationCookCard governance={stock.governance} />
          </div>

          {/* 5. Row 3: Company Profile & Key Statistics (Apple Stocks Style Tabbed Section) */}
          <CompanyProfileCard stock={stock} />

          {/* 6. Row 4: 5-Year Financial Statements Trend Table */}
          <YearlyFinancialsTable stock={stock} />

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
