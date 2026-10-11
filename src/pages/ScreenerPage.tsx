import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useStocks,
  MarketFilter,
  CoreGradeFilterOption,
} from '../hooks/useStocks';
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
import { StockSort } from '../types/api';
import { getCoreGradeInfo } from '../utils/ruleFormatters';
import { StockDetailDrawer } from '../components/screener/StockDetailDrawer';
import { StockValuationPage } from './StockValuationPage';
import { stockApi } from '../services/api';
import { periodNote, valuationPrice, valuationMarketCap, valuationPercent } from '../utils/valuationFormatters';

interface ScreenerPageProps {
  onSelectStock?: (stockId: string) => void;
  searchQuery: string;
}

export const ScreenerPage: React.FC<ScreenerPageProps> = ({ searchQuery: globalSearchQuery }) => {
  const navigate = useNavigate();
  const { t, language } = useAppConfig();
  const {
    years, setYears, valuationStatus, setValuationStatus,
    stocks,
    total,
    loading,
    loadingMore,
    error,
    searchQuery,
    setSearchQuery,
    market,
    setMarket,
    coreGradeFilter,
    setCoreGradeFilter,
    sortField,
    setSortField,
    sortOrder,
    toggleSortOrder,
    hasMore,
    loadMore,
    retry,
    resetFilters,
  } = useStocks();

  const ko = language === 'ko';
  const [counts, setCounts] = useState<{ total: number; passed: number; margin: number } | null>(null);
  useEffect(() => { setSearchQuery(globalSearchQuery); }, [globalSearchQuery, setSearchQuery]);
  useEffect(() => {
    const controller = new AbortController();
    setCounts(null);
    const timer = setTimeout(() => {
      const query = { limit: 1, years, search: searchQuery.trim() || undefined, market: market === 'ALL' ? undefined : market };
      Promise.all([
        stockApi.getStocks(query, controller.signal),
        stockApi.getStocks({ ...query, coreStatus: 'PASS' }, controller.signal),
        stockApi.getStocks({ ...query, valuationStatus: 'PASS_WITH_MARGIN' }, controller.signal),
      ]).then(([all, passed, margin]) => {
        if (!controller.signal.aborted) setCounts({ total: all.total, passed: passed.total, margin: margin.total });
      }).catch(() => { /* Counts remain unavailable when the request fails. */ });
    }, 300);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [searchQuery, market, years]);
  const [drawerStockId, setDrawerStockId] = useState<string | null>(null);
  const drawerStock = stocks.find(stock => stock.id === drawerStockId) ?? null;
  const drawerPeriod = drawerStock?.periodValuations?.[String(years)];
  const selectedDrawerStock = drawerStock ? {
    ...drawerStock,
    conservativeIntrinsicValue: drawerPeriod?.dcf.scenarios?.conservative.intrinsicValuePerShare ?? null,
    conservativeMarginOfSafety: drawerPeriod?.dcf.conservativeMarginOfSafety ?? null,
    valuationStatus: drawerPeriod?.dcf.status ?? 'N/A' as const,
    confidence: drawerPeriod?.dcf.confidence ?? 'LOW' as const,
  } : null;

  const [isMarketDropdownOpen, setIsMarketDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

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

  // Core Grade Filter Options
  const coreGradeFilterOptions: {
    id: CoreGradeFilterOption;
    label: string;
  }[] = [
    { id: 'ALL', label: t('allStatuses') },
    { id: 'PASS', label: t('coreStatusPass') },
    { id: 'HOLD', label: t('coreStatusHold') },
    { id: 'FAIL', label: t('coreStatusFail') },
  ];

  // Sort Options
  const sortOptions: { id: StockSort; label: string }[] = [
    { id: 'marketCap', label: t('sortMarketCap') },
    { id: 'conservativeMarginOfSafety', label: ko ? '선택 기간 안전마진' : 'Selected period margin' },
    { id: 'corePassCount', label: t('sortPassCount') },
    { id: 'currentPrice', label: ko ? '현재가' : 'Price' },
    { id: 'ticker', label: t('sortTicker') },
  ];

  const currentSortOption = sortOptions.find((s) => s.id === sortField) || sortOptions[0];

  const formatPrice = (val: number | null | undefined, curr: string) => valuationPrice(val, curr, ko);
  const formatMarketCap = (val: number | null, curr: string) => valuationMarketCap(val, curr, ko);
  const latestLoadedDataAsOf = stocks.reduce<string | null>(
    (latest, stock) => (!latest || stock.dataAsOf > latest ? stock.dataAsOf : latest),
    null
  );
  const loadedStaleCount = stocks.filter((stock) => stock.isStale).length;
  const sourceLabel = stocks.length > 0
    ? [...new Set(stocks.map((stock) => stock.sourceType))].join(' + ')
    : 'LIVE';

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-5 sm:py-8 space-y-5 sm:space-y-6 animate-fade-in">
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
                <span>{sourceLabel}</span>
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-2 whitespace-nowrap">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight tabular-nums">
                {counts?.passed ?? '—'} / {counts?.total ?? '—'}
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
                {counts?.margin ?? '—'}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-[#86868B] dark:text-[#A1A1A6]">
                {t('valuationPassWithMargin')}
              </span>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-black/[0.06] dark:border-white/[0.08]">
            <span className="text-xs font-medium text-[#86868B] truncate block">
              {ko ? `${years}개년 재무자료 기준 현재 내재가치` : `Current intrinsic value using ${years} fiscal years`}
            </span>
          </div>
        </div>

        {/* Card 3: Data Quality & Date */}
        <div className="md:col-span-3 bg-white dark:bg-[#1C1C1E] rounded-3xl p-5 sm:p-6 border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex flex-col justify-between transition-colors duration-300">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-[#86868B] block truncate">
                {t('loadedAsOfDateLabel')}
              </span>
              {import.meta.env.DEV && <a href="/admin/valuation" className="text-xs text-blue-600">{ko ? '종목 추가 · 원자료 관리' : 'Add stocks · Edit facts'}</a>}
            </div>
            <div className="flex items-baseline gap-1.5 mt-2 whitespace-nowrap">
              <span className="text-lg sm:text-xl font-bold font-mono text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                {latestLoadedDataAsOf?.slice(0, 10) ?? '—'}
              </span>
            </div>

          </div>

          <div className="pt-3 mt-3 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-[#86868B] truncate block font-mono">
              {t('loadedSnapshotStatus', {
                loaded: stocks.length,
                stale: loadedStaleCount,
              })}
            </span>

          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs font-medium text-[#86868B]">{ko ? '재무자료 기간' : 'Financial history'}</span>
        <div className="inline-flex bg-[#F2F4F6] dark:bg-[#1C1C1E] p-1 rounded-2xl border border-black/[0.04] dark:border-white/[0.06] gap-1">
          {[1, 2, 3, 4, 5].map(year => <button key={year} aria-pressed={years === year} onClick={() => setYears(year)} className={`px-3.5 py-2 text-xs rounded-xl transition-all ${years === year ? 'bg-white dark:bg-[#2C2C2E] text-[#191F28] dark:text-[#F5F5F7] font-bold shadow-sm' : 'text-[#8B95A1] dark:text-[#86868B] font-medium'}`}>{year}{ko ? '개년' : ' years'}</button>)}
        </div>
        <label className="text-xs text-[#86868B]">{ko ? '가치평가 ' : 'Valuation '}<select aria-label={ko ? '가치평가' : 'Valuation'} value={valuationStatus} onChange={event => setValuationStatus(event.target.value as typeof valuationStatus)} className="h-10 px-3 rounded-2xl bg-[#F2F4F6] dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] text-[#191F28] dark:text-[#F5F5F7] font-medium">
          <option value="ALL">{ko ? '전체' : 'All'}</option><option value="PASS_WITH_MARGIN">{ko ? '안전마진 확보' : 'With margin'}</option><option value="WATCH">{ko ? '관찰' : 'Watch'}</option><option value="NO_MARGIN">{ko ? '안전마진 부족' : 'No margin'}</option><option value="N/A">{ko ? '계산 불가' : 'Unavailable'}</option>
        </select></label>
      </div>

      {/* 2. Toss/Apple Style Filter Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-1">
        {/* Left: Market Dropdown + Core Status Capsule Ribbon */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Market Dropdown */}
          <div className="relative shrink-0 z-30" ref={marketDropdownRef}>
            <button
              onClick={() => setIsMarketDropdownOpen(!isMarketDropdownOpen)}
              className="h-10 sm:h-11 px-3.5 sm:px-4 rounded-2xl bg-[#F2F4F6] dark:bg-[#1C1C1E] hover:bg-[#E5E8EB] dark:hover:bg-[#2C2C2E] text-[#191F28] dark:text-[#F5F5F7] font-semibold text-xs sm:text-[13px] flex items-center gap-1.5 border border-black/[0.06] dark:border-white/[0.08] shadow-sm transition-all cursor-pointer select-none focus:outline-none"
              aria-haspopup="true"
              aria-expanded={isMarketDropdownOpen}
            >
              <span>{currentMarketOption.label}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#8B95A1] dark:text-[#86868B] transition-transform duration-200 ${isMarketDropdownOpen ? 'rotate-180' : ''
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

          {/* Core Status Capsule Ribbon */}
          <div className="inline-flex w-fit bg-[#F2F4F6] dark:bg-[#1C1C1E] p-1 rounded-2xl border border-black/[0.04] dark:border-white/[0.06] items-center gap-1 overflow-x-auto scrollbar-none shrink-0">
            {coreGradeFilterOptions.map((opt) => {
              const isActive = coreGradeFilter === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setCoreGradeFilter(opt.id)}
                  className={`px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-[13px] rounded-xl whitespace-nowrap transition-all duration-200 select-none cursor-pointer focus:outline-none shrink-0 ${isActive
                      ? 'bg-white dark:bg-[#2C2C2E] text-[#191F28] dark:text-[#F5F5F7] font-bold shadow-sm border border-black/[0.04] dark:border-white/[0.06]'
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
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer select-none ${isSelected
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
              {ko ? '다른 시장이나 상태 필터를 선택하거나 검색어를 변경해보세요.' : 'Try a different market, status filter, or search.'}
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
              const gradeInfo = getCoreGradeInfo(stock, language);
              const selected = stock.periodValuations?.[String(years)];

              return (
                <div
                  key={stock.id}
                  onClick={() => setDrawerStockId(stock.id)}
                  className="p-4 flex items-center justify-between gap-3 active:bg-[#F5F5F7] dark:active:bg-[#2C2C2E] transition-colors cursor-pointer"
                >
                  {/* Left: Rank & Ticker & Name & Grade */}
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono text-xs font-semibold text-[#86868B] w-4 shrink-0 tabular-nums">
                      {rank}
                    </span>
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-[#1D1D1F] dark:text-[#F5F5F7] font-mono">
                          {stock.ticker}
                        </span>
                        {stock.isStale && (
                          <span className="text-[9px] font-bold text-[#FF9500] bg-[#FF9500]/10 px-1.5 py-0.5 rounded-full">
                            STALE
                          </span>
                        )}
                        <div className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold" title={gradeInfo.desc}>
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${gradeInfo.dotClass}`} />
                          <span className={gradeInfo.textClass}>{gradeInfo.badgeLabel}</span>
                        </div>
                      </div>
                      <div className="text-xs text-[#86868B] truncate font-normal">
                        {stock.name} · {stock.market}
                      </div>
                    </div>
                  </div>

                  {/* Right: Current Price & Intrinsic Value */}
                  <div className="text-right shrink-0 space-y-0.5">
                    <div className="font-mono font-bold text-sm text-[#1D1D1F] dark:text-[#F5F5F7] tabular-nums">
                      {formatPrice(stock.currentPrice, stock.currency)}
                    </div>
                    <div className="text-[10px] font-mono text-[#86868B]">{ko ? '시총' : 'Cap'} {formatMarketCap(stock.marketCap, stock.currency)}</div>
                      <div title={periodNote(selected, ko)} className="text-[11px] font-mono font-medium text-[#0071E3] dark:text-[#2997FF] tabular-nums">
                        {years}{ko ? '개년' : 'y'} · {formatPrice(selected?.dcf.scenarios?.base.intrinsicValuePerShare, stock.currency)} · {valuationPercent(selected?.dcf.conservativeMarginOfSafety)}
                      </div>
                      <p className="text-[10px] text-[#86868B] max-w-[180px]">{selected?.dcf.confidence ?? '—'}{!selected?.dcf.scenarios || selected.dcf.warnings.length > 0 ? ` · ${periodNote(selected, ko)}` : ''}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {hasMore && <button onClick={loadMore} disabled={loadingMore} className="md:hidden text-xs font-semibold text-[#0071E3] dark:text-[#2997FF]">{loadingMore ? t('loadingStocks') : t('loadMore')}</button>}

          {/* Desktop Table View (Shown on md: and above) */}
          <div className="hidden md:block bg-white dark:bg-[#1C1C1E] rounded-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm overflow-hidden transition-colors duration-300">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-black/[0.05] dark:border-white/[0.06] text-xs font-medium text-[#86868B] whitespace-nowrap">
                    <th className="py-4 pl-6 sm:pl-7 pr-3 w-16 sm:w-20 whitespace-nowrap">{t('rank')}</th>
                    <th className="py-4 px-4 min-w-[150px] whitespace-nowrap">{t('company')}</th>
                    <th className="py-4 px-4 text-right whitespace-nowrap">{t('price')}</th>
                    <th className="py-4 px-4 text-right whitespace-nowrap">{t('marketCapLabel')}</th>
                    <th className="py-4 px-4 text-center whitespace-nowrap">{t('coreStatusLabel')}</th>
                    <th className="py-4 px-4 text-center whitespace-nowrap">{t('coreRulesLabel')}</th>
                    {[1, 2, 3, 4, 5].map(year => <th key={year} className={`py-4 px-4 text-right whitespace-nowrap ${year === years ? 'text-[#0071E3] dark:text-[#2997FF]' : ''}`}>{year}{ko ? '개년 내재가치' : 'y value'}</th>)}
                    <th className="py-4 px-4 text-right whitespace-nowrap">{ko ? '안전마진' : 'Margin of safety'}</th>
                    <th className="py-4 pr-6 sm:pr-7 pl-4 text-center whitespace-nowrap">{t('confidence')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.06] text-xs">
                  {stocks.map((stock, index) => {
                    const rank = index + 1;
                    const gradeInfo = getCoreGradeInfo(stock, language);
              const selected = stock.periodValuations?.[String(years)];

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
                            <span className="text-[#86868B] font-normal text-xs truncate max-w-[100px] lg:max-w-[140px]">
                              {stock.name}
                            </span>
                            <span className="text-[10px] font-mono text-[#86868B] px-1.5 py-0.5 bg-black/[0.04] dark:bg-white/[0.06] rounded">
                              {stock.market}
                            </span>
                            {stock.isStale && (
                              <span
                                className="text-[9px] font-bold text-[#FF9500] bg-[#FF9500]/10 px-1.5 py-0.5 rounded"
                                title={`Last successful: ${stock.lastSuccessfulAt}`}
                              >
                                STALE
                              </span>
                            )}
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

                        {/* 1. Core Status (등급제: 점 + 등급명만 표시) */}
                        <td className="py-4 px-4 text-center whitespace-nowrap">
                          <div className="inline-flex items-center justify-center gap-1.5" title={gradeInfo.desc}>
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${gradeInfo.dotClass}`} />
                            <span className={`font-mono font-bold text-xs tabular-nums ${gradeInfo.textClass}`}>
                              {gradeInfo.badgeLabel}
                            </span>
                          </div>
                        </td>

                        {/* Core Rules Breakdown (P / F / NA) */}
                        <td className="py-4 px-4 text-center whitespace-nowrap font-mono text-xs tabular-nums">
                          <span className="font-semibold text-[#34C759]">{stock.corePassCount}</span>
                          <span className="text-[#86868B] dark:text-[#636366]">/</span>
                          <span className="font-semibold text-[#FF3B30]">{stock.coreFailCount}</span>
                          <span className="text-[#86868B] dark:text-[#636366]">/</span>
                          <span className="font-semibold text-[#86868B] dark:text-[#636366]">{stock.coreNaCount}</span>
                        </td>

                        {[1, 2, 3, 4, 5].map(year => {
                          const period = stock.periodValuations?.[String(year)];
                          return <td key={year} title={periodNote(period, ko)} className={`py-4 px-4 text-right font-mono tabular-nums whitespace-nowrap ${year === years ? 'font-semibold text-[#0071E3] dark:text-[#2997FF]' : 'text-[#86868B]'}`}>
                            {formatPrice(period?.dcf.scenarios?.base.intrinsicValuePerShare, stock.currency)}
                            {period?.dcf.warnings.includes('INCOMPLETE_GROWTH_HISTORY') && <span className="ml-1 text-[#FF9500]">⚠</span>}
                          </td>;
                        })}
                        <td title={periodNote(selected, ko)} className="py-4 px-4 text-right font-mono tabular-nums whitespace-nowrap">{valuationPercent(selected?.dcf.conservativeMarginOfSafety)}</td>

                        {/* Confidence */}
                        <td className="py-4 pr-6 sm:pr-7 pl-4 text-center font-mono whitespace-nowrap">
                          <span
                            className={`text-[10px] font-bold ${
                              selected?.dcf.confidence === 'HIGH'
                                ? 'text-[#34C759]'
                                : selected?.dcf.confidence === 'MEDIUM'
                                ? 'text-[#FF9500]'
                                : 'text-[#86868B]'
                            }`}
                          >
                            {selected?.dcf.confidence ?? '—'}
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

      <StockDetailDrawer
        stock={selectedDrawerStock}
        years={years}
        content={drawerStock && <StockValuationPage key={`${drawerStock.id}:${years}`} ticker={drawerStock.ticker} market={drawerStock.market} years={years} embedded onApplied={retry} />}
        isOpen={Boolean(selectedDrawerStock)}
        onClose={() => setDrawerStockId(null)}
        onNavigateToFullDetail={(ticker, stockMarket) => {
          setDrawerStockId(null);
          navigate(`/stock/${encodeURIComponent(ticker)}/valuation?market=${encodeURIComponent(stockMarket)}&years=${years}`);
        }}
        stockList={stocks}
        onSelectStock={stock => setDrawerStockId(stock.id)}
      />
    </div>
  );
};
