import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStocks, MarketFilter, CoreStatusFilter, ValuationStatusFilter } from '../hooks/useStocks';
import {
  CheckCircle2,
  ChevronDown,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  AlertCircle,
  Database,
  Search,
  Check,
  ChevronRight,
} from 'lucide-react';
import { useAppConfig } from '../context/ThemeLanguageContext';
import { StockDetailDrawer } from '../components/screener/StockDetailDrawer';
import { StockSort, StockSummaryDTO } from '../types/api';

interface ScreenerPageProps {
  onSelectStock?: (stockId: string) => void;
  searchQuery: string;
}

export const ScreenerPage: React.FC<ScreenerPageProps> = ({ onSelectStock, searchQuery: globalSearchQuery }) => {
  const navigate = useNavigate();
  const { t } = useAppConfig();
  const {
    stocks,
    total,
    loading,
    loadingMore,
    error,
    searchQuery,
    setSearchQuery,
    market,
    setMarket,
    coreStatus,
    setCoreStatus,
    valuationStatus,
    setValuationStatus,
    sortField,
    setSortField,
    sortOrder,
    toggleSortOrder,
    passedStockCount,
    totalStockCount,
    hasMore,
    loadMore,
    retry,
    resetFilters,
  } = useStocks();

  // Sync global search from TopNavBar if changed
  useEffect(() => {
    if (globalSearchQuery !== searchQuery) {
      setSearchQuery(globalSearchQuery);
    }
  }, [globalSearchQuery]);

  const [isMarketDropdownOpen, setIsMarketDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [drawerStockTicker, setDrawerStockTicker] = useState<string | null>(null);

  const marketDropdownRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (marketDropdownRef.current && !marketDropdownRef.current.contains(event.target as Node)) {
        setIsMarketDropdownOpen(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setIsSortDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Market Options for Dropdown
  const marketOptions: { id: MarketFilter; label: string; subLabel: string }[] = [
    { id: 'ALL', label: t('allMarkets'), subLabel: 'NASDAQ · NYSE · KOSPI · KOSDAQ' },
    { id: 'NASDAQ', label: 'NASDAQ', subLabel: 'US Tech & Growth' },
    { id: 'NYSE', label: 'NYSE', subLabel: 'US Classic & Blue-Chip' },
    { id: 'KOSPI', label: 'KOSPI', subLabel: 'KR Prime Market' },
    { id: 'KOSDAQ', label: 'KOSDAQ', subLabel: 'KR Growth & Innovation' },
  ];

  const currentMarketOption = marketOptions.find((o) => o.id === market) || marketOptions[0];

  // Core Status Options
  const coreStatusOptions: { id: CoreStatusFilter; label: string }[] = [
    { id: 'ALL', label: t('allStatuses') },
    { id: 'PASS', label: t('pass') },
    { id: 'FAIL', label: t('fail') },
    { id: 'N/A', label: t('na') },
  ];

  // Valuation Status Options
  const valuationStatusOptions: { id: ValuationStatusFilter; label: string }[] = [
    { id: 'ALL', label: t('allStatuses') },
    { id: 'PASS_WITH_MARGIN', label: t('valuationPassWithMargin') },
    { id: 'WATCH', label: t('valuationWatch') },
    { id: 'NO_MARGIN', label: t('valuationNoMargin') },
    { id: 'N/A', label: t('valuationNa') },
  ];

  // Sort Options
  const sortOptions: { id: StockSort; label: string }[] = [
    { id: 'conservativeMarginOfSafety', label: t('sortMargin') },
    { id: 'currentPrice', label: t('sortPrice') },
    { id: 'ticker', label: t('sortTicker') },
  ];

  const currentSortOption = sortOptions.find((s) => s.id === sortField) || sortOptions[0];

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
      if (val >= 1000) return `$${(val / 1000).toFixed(1)}B`;
      return `$${val.toFixed(1)}M`;
    }
    if (val >= 10000) return `${(val / 10000).toFixed(1)}조원`;
    return `${val.toLocaleString()}억원`;
  };

  const formatPercent = (val: number | null) => {
    if (val === null || val === undefined) return '—';
    const pct = val * 100;
    return `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`;
  };

  const selectedDrawerStock: StockSummaryDTO | null =
    stocks.find((s) => s.ticker === drawerStockTicker || s.id === drawerStockTicker) || null;

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-5 sm:py-8 space-y-5 sm:space-y-6 animate-fade-in">
      {/* 1. Hero Bento Grid (3 Cards Row) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-5">
        {/* Card 1: Current Market Scan & Total Passed */}
        <div className="md:col-span-5 bg-white dark:bg-[#1C1C1E] rounded-3xl p-5 sm:p-6 border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex flex-col justify-between transition-colors duration-300">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#86868B] block truncate">
                {t('currentMarketScan')}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#0071E3] dark:text-[#2997FF] font-mono">
                <Database className="w-3 h-3" />
                <span>FIXTURE</span>
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-2 whitespace-nowrap">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight tabular-nums">
                {passedStockCount} / {totalStockCount}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-[#86868B] dark:text-[#A1A1A6]">
                {t('stocksPassed')}
              </span>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-black/[0.06] dark:border-white/[0.08]">
            <div className="flex items-center gap-1.5 min-w-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#34C759] stroke-[2.5] shrink-0" />
              <span className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] truncate">
                {t('buffettPassApplied')}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Valuation Coverage */}
        <div className="md:col-span-4 bg-white dark:bg-[#1C1C1E] rounded-3xl p-5 sm:p-6 border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex flex-col justify-between transition-colors duration-300">
          <div>
            <span className="text-xs font-medium text-[#86868B] block truncate">
              {t('valuationStatusLabel')}
            </span>
            <div className="flex items-baseline gap-2 mt-2 whitespace-nowrap">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-[#34C759] tracking-tight tabular-nums">
                {stocks.filter((s) => s.valuationStatus === 'PASS_WITH_MARGIN').length}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-[#86868B] dark:text-[#A1A1A6]">
                {t('valuationPassWithMargin')}
              </span>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-black/[0.06] dark:border-white/[0.08]">
            <span className="text-xs font-medium text-[#86868B] truncate block">
              DCF Owner Earnings Intrinsic Valuation
            </span>
          </div>
        </div>

        {/* Card 3: Data Quality & Date */}
        <div className="md:col-span-3 bg-white dark:bg-[#1C1C1E] rounded-3xl p-5 sm:p-6 border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex flex-col justify-between transition-colors duration-300">
          <div>
            <span className="text-xs font-medium text-[#86868B] block truncate">
              {t('asOfDateLabel')}
            </span>
            <div className="flex items-baseline gap-1.5 mt-2 whitespace-nowrap">
              <span className="text-lg sm:text-xl font-bold font-mono text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                2026-08-27
              </span>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-black/[0.06] dark:border-white/[0.08]">
            <span className="text-xs font-medium text-[#86868B] truncate block font-mono">
              FastAPI Verified Fixtures
            </span>
          </div>
        </div>
      </div>

      {/* 2. Toss/Apple Style Filter Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-1">
        {/* Left: Market Dropdown + Core Status Capsule Ribbon */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Market Dropdown */}
          <div className="relative shrink-0 z-30" ref={marketDropdownRef}>
            <button
              onClick={() => setIsMarketDropdownOpen(!isMarketDropdownOpen)}
              className="h-10 sm:h-11 px-3.5 sm:px-4 rounded-2xl bg-[#F2F4F6] dark:bg-[#1C1C1E] hover:bg-[#E5E8EB] dark:hover:bg-[#2C2C2E] text-[#191F28] dark:text-[#F5F5F7] font-semibold text-xs sm:text-[13px] flex items-center gap-1.5 border border-black/[0.06] dark:border-white/[0.08] shadow-2xs transition-all cursor-pointer select-none focus:outline-none"
              aria-haspopup="true"
              aria-expanded={isMarketDropdownOpen}
            >
              <span>{currentMarketOption.label}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#8B95A1] dark:text-[#86868B] transition-transform duration-200 ${
                  isMarketDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isMarketDropdownOpen && (
              <div className="absolute left-0 top-full mt-2 w-52 bg-white dark:bg-[#1C1C1E] rounded-2xl shadow-xl dark:shadow-2xl border border-black/[0.08] dark:border-white/[0.12] p-1.5 z-50 animate-fade-in">
                {marketOptions.map((opt) => {
                  const isSelected = market === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setMarket(opt.id);
                        setIsMarketDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer select-none ${
                        isSelected
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

          {/* Core Status Capsule Ribbon */}
          <div className="inline-flex w-fit bg-[#F2F4F6] dark:bg-[#1C1C1E] p-1 rounded-2xl border border-black/[0.04] dark:border-white/[0.06] items-center gap-1 overflow-x-auto scrollbar-none shrink-0">
            {coreStatusOptions.map((opt) => {
              const isActive = coreStatus === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setCoreStatus(opt.id)}
                  className={`px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-[13px] rounded-xl whitespace-nowrap transition-all duration-200 select-none cursor-pointer focus:outline-none shrink-0 ${
                    isActive
                      ? 'bg-white dark:bg-[#2C2C2E] text-[#191F28] dark:text-[#F5F5F7] font-bold shadow-sm border border-black/[0.04] dark:border-white/[0.06]'
                      : 'text-[#8B95A1] dark:text-[#86868B] hover:text-[#191F28] dark:hover:text-[#F5F5F7] font-medium hover:bg-white/40 dark:hover:bg-white/5'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* Valuation Status Capsule Ribbon */}
          <div className="hidden lg:inline-flex w-fit bg-[#F2F4F6] dark:bg-[#1C1C1E] p-1 rounded-2xl border border-black/[0.04] dark:border-white/[0.06] items-center gap-1 overflow-x-auto scrollbar-none shrink-0">
            {valuationStatusOptions.map((opt) => {
              const isActive = valuationStatus === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setValuationStatus(opt.id)}
                  className={`px-3 py-1.5 sm:py-2 text-xs rounded-xl whitespace-nowrap transition-all duration-200 select-none cursor-pointer focus:outline-none shrink-0 ${
                    isActive
                      ? 'bg-white dark:bg-[#2C2C2E] text-[#0071E3] dark:text-[#2997FF] font-bold shadow-sm border border-black/[0.04] dark:border-white/[0.06]'
                      : 'text-[#8B95A1] dark:text-[#86868B] hover:text-[#191F28] dark:hover:text-[#F5F5F7] font-medium hover:bg-white/40 dark:hover:bg-white/5'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Sorting Selector & Order Toggle */}
        <div className="flex items-center gap-2">
          {/* Sort Selector Dropdown */}
          <div className="relative" ref={sortDropdownRef}>
            <button
              onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
              className="h-10 px-3.5 rounded-2xl bg-[#F2F4F6] dark:bg-[#1C1C1E] hover:bg-[#E5E8EB] dark:hover:bg-[#2C2C2E] text-[#191F28] dark:text-[#F5F5F7] font-medium text-xs flex items-center gap-1.5 border border-black/[0.06] dark:border-white/[0.08] transition-all cursor-pointer select-none focus:outline-none"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-[#86868B]" />
              <span>{currentSortOption.label}</span>
              <ChevronDown
                className={`w-3 h-3 text-[#86868B] transition-transform ${isSortDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isSortDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-44 bg-white dark:bg-[#1C1C1E] rounded-2xl shadow-xl border border-black/[0.08] dark:border-white/[0.12] p-1.5 z-50 animate-fade-in">
                {sortOptions.map((opt) => {
                  const isSelected = sortField === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setSortField(opt.id);
                        setIsSortDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer select-none ${
                        isSelected
                          ? 'bg-[#F2F4F6] dark:bg-[#2C2C2E] font-bold text-[#0071E3] dark:text-[#2997FF]'
                          : 'text-[#191F28] dark:text-[#F5F5F7] hover:bg-[#F9FAFB] dark:hover:bg-[#252528]'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#0071E3] dark:text-[#2997FF] stroke-[2.5]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sort Order Toggle */}
          <button
            onClick={toggleSortOrder}
            className="h-10 w-10 rounded-2xl bg-[#F2F4F6] dark:bg-[#1C1C1E] hover:bg-[#E5E8EB] dark:hover:bg-[#2C2C2E] text-[#191F28] dark:text-[#F5F5F7] flex items-center justify-center border border-black/[0.06] dark:border-white/[0.08] transition-all cursor-pointer select-none focus:outline-none"
            title={sortOrder === 'asc' ? t('sortOrderAsc') : t('sortOrderDesc')}
            aria-label="Toggle sort order"
          >
            {sortOrder === 'asc' ? <ArrowUp className="w-4 h-4 text-[#0071E3] dark:text-[#2997FF]" /> : <ArrowDown className="w-4 h-4 text-[#0071E3] dark:text-[#2997FF]" />}
          </button>
        </div>
      </div>

      {/* 3. Main Content: Loading, Error, Empty, or Table */}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-8 sm:p-12 border border-[#FF3B30]/30 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#FF3B30]/10 text-[#FF3B30] flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
              {t('fetchError')}
            </h3>
            <p className="text-xs text-[#86868B] max-w-md mx-auto">{error}</p>
          </div>
          <button
            onClick={retry}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-bold text-white bg-[#0071E3] hover:bg-[#0077ED] transition-all cursor-pointer shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('retry')}</span>
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-8 sm:p-12 border border-black/[0.06] dark:border-white/[0.08] text-center space-y-3">
          <div className="inline-block w-8 h-8 border-2 border-[#0071E3] dark:border-[#2997FF] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-[#86868B] font-medium">{t('loadingStocks')}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && stocks.length === 0 && (
        <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-8 sm:p-12 border border-black/[0.06] dark:border-white/[0.08] text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-black/[0.04] dark:bg-white/[0.06] text-[#86868B] flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
              {t('noStocksFound')}
            </h3>
            <p className="text-xs text-[#86868B]">
              다른 시장이나 상태 필터를 선택하거나 검색어를 변경해보세요.
            </p>
          </div>
          <button
            onClick={resetFilters}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] bg-[#F5F5F7] dark:bg-[#2C2C2E] hover:bg-[#EBEBED] border border-black/[0.06] dark:border-white/[0.08] transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('resetFilters')}</span>
          </button>
        </div>
      )}

      {/* Loaded Table / List Views */}
      {!loading && !error && stocks.length > 0 && (
        <>
          {/* Mobile View (iOS Stocks App Style List - Shown on Mobile only) */}
          <div className="block md:hidden bg-white dark:bg-[#1C1C1E] rounded-2xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm overflow-hidden divide-y divide-black/[0.04] dark:divide-white/[0.06]">
            {stocks.map((stock, index) => {
              const rank = index + 1;

              return (
                <div
                  key={stock.id}
                  onClick={() => setDrawerStockTicker(stock.ticker)}
                  className="p-4 flex items-center justify-between gap-3 active:bg-[#F5F5F7] dark:active:bg-[#2C2C2E] transition-colors cursor-pointer"
                >
                  {/* Left: Rank & Ticker & Name */}
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono text-xs font-semibold text-[#86868B] w-4 shrink-0 tabular-nums">
                      {rank}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#1D1D1F] dark:text-[#F5F5F7] font-mono">
                          {stock.ticker}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              stock.coreStatus === 'PASS'
                                ? 'bg-[#34C759]'
                                : stock.coreStatus === 'FAIL'
                                ? 'bg-[#FF3B30]'
                                : 'bg-[#86868B]'
                            }`}
                          />
                          <span
                            className={`tabular-nums ${
                              stock.coreStatus === 'PASS'
                                ? 'text-[#34C759]'
                                : stock.coreStatus === 'FAIL'
                                ? 'text-[#FF3B30]'
                                : 'text-[#86868B]'
                            }`}
                          >
                            {stock.corePassCount}P
                          </span>
                        </span>
                      </div>
                      <div className="text-xs text-[#86868B] truncate mt-0.5 font-normal">
                        {stock.name} · {stock.market}
                      </div>
                    </div>
                  </div>

                  {/* Right: Price & Margin of Safety */}
                  <div className="text-right shrink-0">
                    <div className="font-mono font-bold text-sm text-[#1D1D1F] dark:text-[#F5F5F7] tabular-nums">
                      {formatPrice(stock.currentPrice, stock.currency)}
                    </div>
                    <div
                      className={`text-[11px] font-medium font-mono tabular-nums mt-0.5 ${
                        stock.conservativeMarginOfSafety !== null && stock.conservativeMarginOfSafety >= 0
                          ? 'text-[#34C759]'
                          : stock.conservativeMarginOfSafety !== null
                          ? 'text-[#FF3B30]'
                          : 'text-[#86868B]'
                      }`}
                    >
                      {formatPercent(stock.conservativeMarginOfSafety)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View (Shown on md: and above) */}
          <div className="hidden md:block bg-white dark:bg-[#1C1C1E] rounded-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm overflow-hidden transition-colors duration-300">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-black/[0.05] dark:border-white/[0.06] text-xs font-medium text-[#86868B] whitespace-nowrap">
                    <th className="py-4 pl-6 sm:pl-7 pr-3 w-16 sm:w-20 whitespace-nowrap">{t('rank')}</th>
                    <th className="py-4 px-4 min-w-[220px] whitespace-nowrap">{t('company')}</th>
                    <th className="py-4 px-4 text-right whitespace-nowrap">{t('price')}</th>
                    <th className="py-4 px-4 text-right whitespace-nowrap">{t('marketCapLabel')}</th>
                    <th className="py-4 px-4 text-center whitespace-nowrap">{t('coreStatusLabel')}</th>
                    <th className="py-4 px-4 text-center whitespace-nowrap">{t('valuationStatusLabel')}</th>
                    <th className="py-4 px-4 text-right whitespace-nowrap">{t('marginOfSafety')}</th>
                    <th className="py-4 pr-6 sm:pr-7 pl-4 text-center whitespace-nowrap">{t('confidence')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.06] text-xs">
                  {stocks.map((stock, index) => {
                    const rank = index + 1;

                    return (
                      <tr
                        key={stock.id}
                        onClick={() => setDrawerStockTicker(stock.ticker)}
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
                            <span className="text-[#86868B] font-normal text-xs truncate max-w-[160px] lg:max-w-[240px]">
                              {stock.name}
                            </span>
                            <span className="text-[10px] font-mono text-[#86868B] px-1.5 py-0.5 bg-black/[0.04] dark:bg-white/[0.06] rounded">
                              {stock.market}
                            </span>
                          </div>
                        </td>

                        {/* Price */}
                        <td className="py-4 px-4 text-right font-mono font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tabular-nums whitespace-nowrap">
                          {formatPrice(stock.currentPrice, stock.currency)}
                        </td>

                        {/* Market Cap */}
                        <td className="py-4 px-4 text-right font-mono text-[#86868B] tabular-nums whitespace-nowrap">
                          {formatMarketCap(stock.marketCap, stock.currency)}
                        </td>

                        {/* Core Status */}
                        <td className="py-4 px-4 text-center whitespace-nowrap">
                          <div className="inline-flex items-center justify-center gap-1.5">
                            <span
                              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                stock.coreStatus === 'PASS'
                                  ? 'bg-[#34C759]'
                                  : stock.coreStatus === 'FAIL'
                                  ? 'bg-[#FF3B30]'
                                  : 'bg-[#86868B]'
                              }`}
                            />
                            <span
                              className={`font-mono font-bold text-xs tabular-nums ${
                                stock.coreStatus === 'PASS'
                                  ? 'text-[#34C759]'
                                  : stock.coreStatus === 'FAIL'
                                  ? 'text-[#FF3B30]'
                                  : 'text-[#86868B]'
                              }`}
                            >
                              {stock.coreStatus}
                            </span>
                            <span className="text-[10px] font-mono text-[#86868B] tabular-nums">
                              ({stock.corePassCount}P/{stock.coreFailCount}F/{stock.coreNaCount}NA)
                            </span>
                          </div>
                        </td>

                        {/* Valuation Status */}
                        <td className="py-4 px-4 text-center whitespace-nowrap">
                          <span
                            className={`text-[11px] font-semibold ${
                              stock.valuationStatus === 'PASS_WITH_MARGIN'
                                ? 'text-[#34C759]'
                                : stock.valuationStatus === 'WATCH'
                                ? 'text-[#FF9500]'
                                : stock.valuationStatus === 'NO_MARGIN'
                                ? 'text-[#FF3B30]'
                                : 'text-[#86868B]'
                            }`}
                          >
                            {stock.valuationStatus === 'PASS_WITH_MARGIN'
                              ? t('valuationPassWithMargin')
                              : stock.valuationStatus === 'WATCH'
                              ? t('valuationWatch')
                              : stock.valuationStatus === 'NO_MARGIN'
                              ? t('valuationNoMargin')
                              : t('valuationNa')}
                          </span>
                        </td>

                        {/* Margin of Safety */}
                        <td
                          className={`py-4 px-4 text-right font-mono font-semibold tabular-nums whitespace-nowrap ${
                            stock.conservativeMarginOfSafety !== null && stock.conservativeMarginOfSafety >= 0
                              ? 'text-[#34C759]'
                              : stock.conservativeMarginOfSafety !== null
                              ? 'text-[#FF3B30]'
                              : 'text-[#86868B]'
                          }`}
                        >
                          {formatPercent(stock.conservativeMarginOfSafety)}
                        </td>

                        {/* Confidence */}
                        <td className="py-4 pr-6 sm:pr-7 pl-4 text-center font-mono whitespace-nowrap">
                          <span
                            className={`text-[10px] font-bold ${
                              stock.confidence === 'HIGH'
                                ? 'text-[#34C759]'
                                : stock.confidence === 'MEDIUM'
                                ? 'text-[#FF9500]'
                                : 'text-[#86868B]'
                            }`}
                          >
                            {stock.confidence}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="py-4 px-7 border-t border-black/[0.05] dark:border-white/[0.06] flex items-center justify-between text-xs text-[#86868B]">
              <span>{t('showingTop', { count: stocks.length, total })}</span>
              {hasMore && (
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="text-[#0071E3] dark:text-[#2997FF] hover:underline font-semibold flex items-center gap-0.5 focus:outline-none cursor-pointer"
                >
                  <span>{loadingMore ? t('loadingStocks') : t('loadMore')}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* 4. Quick Stock Detail Slide-over Panel */}
      <StockDetailDrawer
        stock={selectedDrawerStock}
        isOpen={Boolean(selectedDrawerStock)}
        onClose={() => setDrawerStockTicker(null)}
        onNavigateToFullDetail={(ticker) => {
          setDrawerStockTicker(null);
          if (onSelectStock) {
            onSelectStock(ticker);
          }
          navigate(`/stock/${ticker}`);
        }}
        stockList={stocks}
        onSelectStock={(ticker) => setDrawerStockTicker(ticker)}
      />
    </div>
  );
};
