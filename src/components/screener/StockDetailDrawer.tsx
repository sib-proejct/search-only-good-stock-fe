import React, { useState, useEffect, useCallback } from 'react';
import { StockSummaryDTO, StockDetailDTO, ReasonCode } from '../../types/api';
import { stockApi } from '../../services/api';
import { useAppConfig } from '../../context/ThemeLanguageContext';
import { getMetricLabel, getRuleInfo } from '../../utils/ruleFormatters';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface StockDetailDrawerProps {
  stock: StockSummaryDTO | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToFullDetail: (ticker: string) => void;
  stockList: StockSummaryDTO[];
  onSelectStock: (ticker: string) => void;
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
  const [detail, setDetail] = useState<StockDetailDTO | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const getReasonLabel = (code: ReasonCode): string => {
    switch (code) {
      case 'FINANCIAL_SECTOR':
        return t('reasonFinancialSector');
      case 'MISSING_DATA':
        return t('reasonMissingData');
      case 'INSUFFICIENT_HISTORY':
        return t('reasonInsufficientHistory');
      case 'NON_POSITIVE_DENOMINATOR':
        return t('reasonNonPositiveDenominator');
      case 'INVALID_TAX_RATE':
        return t('reasonInvalidTaxRate');
      case 'NON_POSITIVE_START_VALUE':
        return t('reasonNonPositiveStartValue');
      case 'UNKNOWN_INTEREST_CLASSIFICATION':
        return t('reasonUnknownInterestClassification');
      case 'PREREQUISITE_FAILED':
        return t('reasonPrerequisiteFailed');
      default:
        return code;
    }
  };

  // Drawer resize state
  const DEFAULT_WIDTH = 760;
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

  // Fetch detail when stock changes
  useEffect(() => {
    if (!stock || !isOpen) {
      setDetail(null);
      return;
    }
    let isCancelled = false;
    setDetailLoading(true);

    stockApi
      .getStockDetail(stock.ticker)
      .then((data) => {
        if (!isCancelled) {
          setDetail(data);
          setDetailLoading(false);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setDetail(null);
          setDetailLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [stock, isOpen]);

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
      onSelectStock(stockList[currentIndex - 1].ticker);
    }
  }, [hasPrev, currentIndex, stockList, onSelectStock]);

  const handleNextStock = useCallback(() => {
    if (hasNext && currentIndex < stockList.length - 1) {
      onSelectStock(stockList[currentIndex + 1].ticker);
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

  const formatPrice = (val: number | null, curr: string) => {
    if (val === null || val === undefined) return '—';
    if (curr === 'USD') {
      return `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `${Math.round(val).toLocaleString()}원`;
  };

  const formatMarketCap = (val: number | null, curr: string) => {
    if (val === null || val === undefined) return '—';
    if (curr === 'USD') {
      if (val >= 1_000_000_000_000) return `$${(val / 1_000_000_000_000).toFixed(1)}T`;
      if (val >= 1_000_000_000) return `$${(val / 1_000_000_000).toFixed(1)}B`;
      if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
      return `$${val.toLocaleString()}`;
    }
    if (val >= 1_000_000_000_000) return `${(val / 1_000_000_000_000).toFixed(1)}조원`;
    if (val >= 100_000_000) return `${(val / 100_000_000).toFixed(1)}억원`;
    return `${val.toLocaleString()}원`;
  };

  const formatPercent = (val: number | null) => {
    if (val === null || val === undefined) return '—';
    const pct = val * 100;
    return `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-end sm:items-stretch justify-center sm:justify-end">
      {/* 1. Backdrop Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-sm transition-opacity duration-300 animate-fade-in cursor-pointer"
        aria-hidden="true"
      />

      {/* 2. Slide Panel Container */}
      <aside
        style={{ width: typeof window !== 'undefined' && window.innerWidth < 640 ? '100%' : `${drawerWidth}px` }}
        className={`relative z-10 w-full max-w-full bg-[#FBFBFD] dark:bg-black h-[85vh] sm:h-full max-h-[92vh] sm:max-h-full rounded-t-3xl sm:rounded-none flex flex-col shadow-2xl border-t sm:border-t-0 sm:border-l border-black/[0.08] dark:border-white/[0.1] ${isResizing ? 'select-none transition-none' : 'transition-all duration-150 ease-out'
          }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-stock-title"
      >
        {/* Left Drag Resize Handle (Desktop/Tablet) */}
        <div
          onMouseDown={handleMouseDown}
          onDoubleClick={() => setDrawerWidth(DEFAULT_WIDTH)}
          className={`hidden sm:flex absolute left-0 top-0 bottom-0 w-3 -translate-x-1.5 cursor-ew-resize z-30 items-center justify-center group hover:bg-[#0071E3]/15 dark:hover:bg-[#2997FF]/20 transition-colors ${isResizing ? 'bg-[#0071E3]/25 dark:bg-[#2997FF]/30' : ''
            }`}
          title="드래그하여 너비 조절 (더블클릭: 기본 너비)"
          aria-label="Resize panel width"
        >
          <div
            className={`w-1 rounded-full transition-all duration-200 ${isResizing
                ? 'h-16 bg-[#0071E3] dark:bg-[#2997FF] shadow-sm'
                : 'h-8 bg-black/20 dark:bg-white/20 group-hover:h-12 group-hover:bg-[#0071E3] dark:group-hover:bg-[#2997FF]'
              }`}
          />
        </div>

        {/* Top Header Bar */}
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
              onClick={() => onNavigateToFullDetail(stock.ticker)}
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
          {/* 1. Hero Stock Identity Card */}
          <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-5 sm:p-7 border border-black/[0.06] dark:border-white/[0.08] shadow-sm transition-colors duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 id="drawer-stock-title" className="text-xl sm:text-2xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                    {stock.name}
                  </h1>
                  <span className="font-mono text-sm font-semibold text-[#86868B]">
                    {stock.ticker}
                  </span>

                  {stock.coreStatus === 'PASS' && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#34C759]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{t('pass')}</span>
                    </span>
                  )}
                  {stock.coreStatus === 'FAIL' && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FF3B30]">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>{t('fail')}</span>
                    </span>
                  )}
                  {stock.coreStatus === 'N/A' && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#86868B]">
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>{t('na')}</span>
                    </span>
                  )}

                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#86868B]">
                    <Calendar className="w-3 h-3 text-[#86868B]" />
                    <span>{stock.dataAsOf.slice(0, 10)}</span>
                  </span>
                  {stock.isStale && (
                    <span
                      className="text-[10px] font-bold text-[#FF9500]"
                      title={`Last successful: ${stock.lastSuccessfulAt}`}
                    >
                      STALE
                    </span>
                  )}
                </div>

                <div className="text-xs text-[#86868B] flex items-center gap-2">
                  <span>{stock.market}</span>
                  <span>·</span>
                  <span>{stock.sector}</span>
                  <span>·</span>
                  <span className="px-1.5 py-0.5 bg-black/[0.04] dark:bg-white/[0.06] rounded text-[10px] font-mono">
                    {stock.sourceType}
                  </span>
                </div>
              </div>

              {/* Price & Market Cap */}
              <div className="text-left sm:text-right shrink-0">
                <div className="text-2xl font-bold font-mono text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight tabular-nums">
                  {formatPrice(stock.currentPrice, stock.currency)}
                </div>
                <div className="text-xs text-[#86868B] mt-0.5">
                  {t('marketCapLabel')}: <span className="font-semibold font-mono tabular-nums text-[#1D1D1F] dark:text-[#F5F5F7]">{formatMarketCap(stock.marketCap, stock.currency)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Key KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {/* Core Status */}
            <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex flex-col justify-between">
              <span className="text-[10px] sm:text-[11px] text-[#86868B] font-medium uppercase tracking-wider block">{t('coreStatusLabel')}</span>
              <div className="mt-2">
                <span className={`text-xl sm:text-2xl font-bold font-mono tracking-tight block ${stock.coreStatus === 'PASS' ? 'text-[#34C759]' : stock.coreStatus === 'FAIL' ? 'text-[#FF3B30]' : 'text-[#86868B]'
                  }`}>
                  {stock.coreStatus}
                </span>
                <div className="text-[10px] text-[#86868B] mt-1.5 pt-1.5 border-t border-black/[0.04] dark:border-white/[0.06] font-mono tabular-nums">
                  {stock.corePassCount}P / {stock.coreFailCount}F / {stock.coreNaCount}NA
                </div>
              </div>
            </div>

            {/* Valuation Status */}
            <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex flex-col justify-between">
              <span className="text-[10px] sm:text-[11px] text-[#86868B] font-medium uppercase tracking-wider block">{t('valuationStatusLabel')}</span>
              <div className="mt-2">
                <span className="text-sm sm:text-base font-bold text-[#0071E3] dark:text-[#2997FF] tracking-tight block truncate">
                  {stock.valuationStatus.replace(/_/g, ' ')}
                </span>
                <div className="text-[10px] text-[#86868B] mt-1.5 pt-1.5 border-t border-black/[0.04] dark:border-white/[0.06]">
                  DCF Owner Earnings
                </div>
              </div>
            </div>

            {/* Margin of Safety */}
            <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex flex-col justify-between">
              <span className="text-[10px] sm:text-[11px] text-[#86868B] font-medium uppercase tracking-wider block">{t('marginOfSafety')}</span>
              <div className="mt-2">
                <span className={`text-xl sm:text-2xl font-bold font-mono tracking-tight tabular-nums block ${stock.conservativeMarginOfSafety !== null && stock.conservativeMarginOfSafety >= 0
                    ? 'text-[#34C759]'
                    : stock.conservativeMarginOfSafety !== null
                      ? 'text-[#FF3B30]'
                      : 'text-[#86868B]'
                  }`}>
                  {formatPercent(stock.conservativeMarginOfSafety)}
                </span>
                <div className="text-[10px] text-[#86868B] mt-1.5 pt-1.5 border-t border-black/[0.04] dark:border-white/[0.06]">
                  {stock.conservativeIntrinsicValue !== null ? `IV: ${formatPrice(stock.conservativeIntrinsicValue, stock.currency)}` : '—'}
                </div>
              </div>
            </div>

            {/* Confidence */}
            <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex flex-col justify-between">
              <span className="text-[10px] sm:text-[11px] text-[#86868B] font-medium uppercase tracking-wider block">{t('confidence')}</span>
              <div className="mt-2">
                <span className={`text-xl sm:text-2xl font-bold font-mono tracking-tight block ${stock.confidence === 'HIGH' ? 'text-[#34C759]' : stock.confidence === 'MEDIUM' ? 'text-[#FF9500]' : 'text-[#86868B]'
                  }`}>
                  {stock.confidence}
                </span>
                <div className="text-[10px] text-[#86868B] mt-1.5 pt-1.5 border-t border-black/[0.04] dark:border-white/[0.06]">
                  Data Quality Grade
                </div>
              </div>
            </div>
          </div>

          {/* 3. Detailed Rule Evaluations (When loaded) */}
          {detailLoading && (
            <div className="py-8 text-center bg-white dark:bg-[#1C1C1E] rounded-3xl border border-black/[0.06] dark:border-white/[0.08]">
              <div className="inline-block w-6 h-6 border-2 border-[#0071E3] dark:border-[#2997FF] border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-xs text-[#86868B]">{t('loadingStocks')}</p>
            </div>
          )}

          {detail && !detailLoading && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#0071E3] dark:text-[#2997FF]" />
                  <span>Rule Evaluations ({detail.ruleEvaluations.length})</span>
                </h2>
                {detail.warnings && detail.warnings.length > 0 && (
                  <span className="text-[11px] text-[#FF9500] font-medium flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{detail.warnings.length} Warning(s)</span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {detail.ruleEvaluations.map((evalItem) => {
                  const ruleInfo = getRuleInfo(evalItem.ruleId, language);
                  return (
                    <div
                      key={evalItem.ruleId}
                      className="p-3.5 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] shadow-xs flex flex-col justify-between space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[#1D1D1F] dark:text-[#F5F5F7] truncate" title={ruleInfo.title}>
                          {ruleInfo.title}
                        </span>
                        <span
                          className={`text-[10px] font-bold font-mono shrink-0 ${
                            evalItem.status === 'PASS'
                              ? 'text-[#34C759]'
                              : evalItem.status === 'FAIL'
                              ? 'text-[#FF3B30]'
                              : 'text-[#86868B]'
                          }`}
                        >
                          {evalItem.status}
                        </span>
                      </div>

                      <div className="space-y-1">
                        {evalItem.metrics.map((m, idx) => {
                          const mNum = m.value !== null && m.value !== undefined ? Number(m.value) : null;
                          const metricLabel = getMetricLabel(m.metricId, language);
                          return (
                            <div key={idx} className="flex items-center justify-between text-[11px] text-[#86868B] gap-2">
                              <span className="truncate font-medium">{metricLabel}</span>
                              <span className="font-mono font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tabular-nums shrink-0">
                                {mNum !== null && !isNaN(mNum) ? (m.unit === 'RATIO' ? `${(mNum * 100).toFixed(1)}%` : mNum.toFixed(2)) : '—'}
                              </span>
                            </div>
                          );
                        })}
                        {evalItem.reasonCodes.length > 0 && (
                          <div className="pt-1 flex flex-wrap gap-1.5">
                            {evalItem.reasonCodes.map((code, rIdx) => (
                              <span
                                key={rIdx}
                                className="inline-flex items-center gap-1 text-[10px] font-medium text-[#FF9500]"
                              >
                                <Info className="w-3 h-3 shrink-0" />
                                <span>{getReasonLabel(code)}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* DCF Valuation Details Card */}
              {detail.dcf && (
                <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-[#0071E3] dark:text-[#2997FF]" />
                      <span>DCF Valuation Scenarios</span>
                    </h3>
                    <span className="text-[10px] font-mono text-[#86868B]">{detail.dcf.method}</span>
                  </div>

                  {detail.dcf.scenarios && (
                    <div className="grid grid-cols-3 gap-2 text-center pt-1">
                      <div className="p-2.5 rounded-xl bg-[#F5F5F7] dark:bg-[#252528]">
                        <div className="text-[10px] text-[#86868B]">Conservative</div>
                        <div className="text-xs font-bold font-mono mt-1 text-[#1D1D1F] dark:text-[#F5F5F7] tabular-nums">
                          {formatPrice(detail.dcf.scenarios.conservative.intrinsicValuePerShare, stock.currency)}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#F5F5F7] dark:bg-[#252528] border border-[#0071E3]/20">
                        <div className="text-[10px] text-[#0071E3] dark:text-[#2997FF] font-semibold">Base</div>
                        <div className="text-xs font-bold font-mono mt-1 text-[#0071E3] dark:text-[#2997FF] tabular-nums">
                          {formatPrice(detail.dcf.scenarios.base.intrinsicValuePerShare, stock.currency)}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#F5F5F7] dark:bg-[#252528]">
                        <div className="text-[10px] text-[#86868B]">Optimistic</div>
                        <div className="text-xs font-bold font-mono mt-1 text-[#1D1D1F] dark:text-[#F5F5F7] tabular-nums">
                          {formatPrice(detail.dcf.scenarios.optimistic.intrinsicValuePerShare, stock.currency)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
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
            onClick={() => onNavigateToFullDetail(stock.ticker)}
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
