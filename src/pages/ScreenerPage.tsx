import { MarketFilter } from '../components/common/MarketFilter';
import { FavoriteButton } from '../components/common/FavoriteButton';
import { StockMemoEditor } from '../components/common/StockMemoEditor';
import { useAccount } from '../context/AccountContext';
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useStocks,
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
  Star,
  Zap,
  RefreshCw,
} from 'lucide-react';
import { useAppConfig } from '../context/ThemeLanguageContext';
import { StockSort } from '../types/api';
import { getCoreGradeInfo } from '../utils/ruleFormatters';
import { StockDetailDrawer } from '../components/screener/StockDetailDrawer';
import { StockDetailPage } from './StockDetailPage';
import { StockValuationPage } from './StockValuationPage';
import { stockApi } from '../services/api';
import { refreshStockPrices } from '../services/adminApi';
import { loadRegionalValuationConfigs } from '../utils/valuationConfig';
import { getLowestIntrinsicValue, periodNote, priceToValueColor, valuationMarketCap, valuationPrice, valuationPriceToValueRatio } from '../utils/valuationFormatters';

const confidenceColor = (confidence?: string | null) =>
  confidence === 'HIGH' ? 'text-[#34C759]'
    : confidence === 'MEDIUM' ? 'text-[#FF9500]'
    : 'text-[#6E6E73] dark:text-[#A1A1A6]';

// 한국 주식은 티커(숫자 코드)보다 종목명이 식별하기 쉽다.
const isKoreanMarket = (market: string) => market === 'KOSPI' || market === 'KOSDAQ';

interface ScreenerPageProps {
  onSelectStock?: (stockId: string) => void;
  searchQuery: string;
  favoritesOnly?: boolean;
}

export const ScreenerPage: React.FC<ScreenerPageProps> = ({ searchQuery: globalSearchQuery, favoritesOnly = false }) => {
  const navigate = useNavigate();
  const { t, language } = useAppConfig();
  const { user, revision, favoritesError, reloadFavorites } = useAccount();
  const {
    valuationStatus, setValuationStatus,
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
    updateStockMemoLocal,
  } = useStocks(favoritesOnly, favoritesOnly ? revision : 0);

  const ko = language === 'ko';
  const [counts, setCounts] = useState<{ total: number; passed: number; margin: number } | null>(null);
  const [quickPriceBusy, setQuickPriceBusy] = useState(false);
  const [quickPriceMessage, setQuickPriceMessage] = useState<string | null>(null);

  const handleQuickRefreshPrices = async () => {
    if (quickPriceBusy) return;
    setQuickPriceBusy(true);
    setQuickPriceMessage(null);
    try {
      const regional = loadRegionalValuationConfigs();
      const marketGroup =
        market.length > 0 && market.every((m) => m === 'KOSPI' || m === 'KOSDAQ')
          ? 'KR'
          : market.length > 0 && market.every((m) => m === 'NASDAQ' || m === 'NYSE')
          ? 'US'
          : 'ALL';
      const res = await refreshStockPrices({
        marketGroup,
        usConditions: regional.us,
        krConditions: regional.kr,
      });
      setQuickPriceMessage(
        ko
          ? `현재가 ${res.priceUpdatedCount}개 갱신 완료`
          : `Updated ${res.priceUpdatedCount} prices`,
      );
      retry();
      setTimeout(() => setQuickPriceMessage(null), 4000);
    } catch (err) {
      setQuickPriceMessage(
        err instanceof Error ? err.message : ko ? '현재가 갱신 실패' : 'Price refresh failed',
      );
      setTimeout(() => setQuickPriceMessage(null), 5000);
    } finally {
      setQuickPriceBusy(false);
    }
  };
  useEffect(() => { setSearchQuery(globalSearchQuery); }, [globalSearchQuery, setSearchQuery]);
  useEffect(() => {
    const controller = new AbortController();
    setCounts(null);
    const timer = setTimeout(() => {
      const query = { limit: 1, favoritesOnly, search: searchQuery.trim() || undefined, market: market.length ? market : undefined };
      Promise.all([
        stockApi.getStocks(query, controller.signal),
        stockApi.getStocks({ ...query, coreStatus: 'PASS' }, controller.signal),
        stockApi.getStocks({ ...query, valuationStatus: 'PASS_WITH_MARGIN' }, controller.signal),
      ]).then(([all, passed, margin]) => {
        if (!controller.signal.aborted) setCounts({ total: all.total, passed: passed.total, margin: margin.total });
      }).catch(() => { /* Counts remain unavailable when the request fails. */ });
    }, 300);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [searchQuery, market, favoritesOnly, revision]);
  const [drawerStockId, setDrawerStockId] = useState<string | null>(null);
  const [drawerView, setDrawerView] = useState<'detail' | 'valuation'>('detail');
  const drawerStock = stocks.find(stock => stock.id === drawerStockId) ?? null;
  const drawerMinInfo = drawerStock ? getLowestIntrinsicValue(drawerStock.periodValuations) : { minIntrinsicValue: null, minYear: null };
  const effectiveDrawerYears = drawerMinInfo.minYear ?? 5;
  const drawerPeriod = drawerStock?.periodValuations?.[String(effectiveDrawerYears)];
  const selectedDrawerStock = drawerStock ? {
    ...drawerStock,
    conservativeIntrinsicValue: drawerPeriod?.dcf.scenarios?.conservative.intrinsicValuePerShare ?? null,
    conservativeMarginOfSafety: drawerPeriod?.dcf.conservativeMarginOfSafety ?? null,
    valuationStatus: drawerPeriod?.dcf.status ?? 'N/A' as const,
    confidence: drawerPeriod?.dcf.confidence ?? 'LOW' as const,
  } : null;

  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // Close the sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setIsSortDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    { id: 'conservativeMarginOfSafety', label: ko ? '최저 내재가치 안전마진' : 'Lowest value margin' },
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
    <>
    <div className="screener-page page-container max-w-[1600px] mx-auto px-4 sm:px-8 py-5 sm:py-8 space-y-5 sm:space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">{favoritesOnly ? (ko ? '내 즐겨찾기' : 'My favorites') : (ko ? '종목 스크리너' : 'Stock screener')}</h1>
        <button
          type="button"
          aria-pressed={favoritesOnly}
          onClick={() => navigate(favoritesOnly ? '/' : '/favorites')}
          className={`inline-flex items-center gap-1.5 h-8 rounded-full pl-3 pr-3.5 text-xs font-semibold border transition-all duration-200 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0071E3] ${favoritesOnly
            ? 'bg-[#FFD60A]/15 border-[#D97706]/25 text-[#B45309] dark:bg-[#FFD60A]/15 dark:border-[#FFD60A]/30 dark:text-[#FFD60A] hover:bg-[#FFD60A]/25'
            : 'bg-white dark:bg-[#1C1C1E] border-black/[0.08] dark:border-white/[0.12] text-[#1D1D1F] dark:text-[#F5F5F7] shadow-sm hover:border-[#D97706]/30 hover:text-[#B45309] dark:hover:text-[#FFD60A]'}`}
        >
          <Star aria-hidden="true" className="w-3.5 h-3.5" fill={favoritesOnly ? 'currentColor' : 'none'} strokeWidth={2.25} />
          {ko ? '즐겨찾기만 보기' : 'Favorites only'}
        </button>
      </div>
      {favoritesError && <div role="alert" className="text-xs text-[#FF3B30]">{ko ? '즐겨찾기 상태를 불러오지 못했습니다.' : 'Could not load favorites.'} <button onClick={() => void reloadFavorites().catch(() => {})} className="underline">{t('retry')}</button></div>}
      {/* 1. Hero Bento Grid (3 Cards Row) */}
      <div className="screener-summary grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-5">
        {/* Card 1: Current Market Scan & Total Passed */}
        <div className="md:col-span-5 bg-white dark:bg-[#1C1C1E] rounded-3xl p-5 sm:p-6 border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex flex-col justify-between transition-colors duration-300">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-[#6E6E73] dark:text-[#A1A1A6] block truncate">
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
              <span className="text-xs sm:text-sm font-semibold text-[#6E6E73] dark:text-[#A1A1A6]">
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
            <span className="text-[13px] font-medium text-[#6E6E73] dark:text-[#A1A1A6] block truncate">
              {t('valuationStatusLabel')}
            </span>
            <div className="flex items-baseline gap-2 mt-2 whitespace-nowrap">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-[#34C759] tracking-tight tabular-nums">
                {counts?.margin ?? '—'}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-[#6E6E73] dark:text-[#A1A1A6]">
                {t('valuationPassWithMargin')}
              </span>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-black/[0.06] dark:border-white/[0.08]">
            <span className="text-[13px] font-medium text-[#6E6E73] dark:text-[#A1A1A6] truncate block">
              {ko ? '5개년 최저 내재가치 기준 안전마진' : 'Margin based on 5-year lowest intrinsic value'}
            </span>
          </div>
        </div>

        {/* Card 3: Data Quality & Date */}
        <div className="md:col-span-3 bg-white dark:bg-[#1C1C1E] rounded-3xl p-5 sm:p-6 border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex flex-col justify-between transition-colors duration-300">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[13px] font-medium text-[#6E6E73] dark:text-[#A1A1A6] block truncate">
                {t('loadedAsOfDateLabel')}
              </span>
              {import.meta.env.DEV && user?.role === 'admin' && <a href="/admin/valuation" className="text-xs text-blue-600">{ko ? '종목 추가 · 원자료 관리' : 'Add stocks · Edit facts'}</a>}
            </div>
            <div className="flex items-baseline gap-1.5 mt-2 whitespace-nowrap">
              <span className="text-lg sm:text-xl font-bold font-mono text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                {latestLoadedDataAsOf?.slice(0, 10) ?? '—'}
              </span>
            </div>

          </div>

          <div className="pt-3 mt-3 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between gap-2 flex-wrap">
            <span className="text-[13px] font-medium text-[#6E6E73] dark:text-[#A1A1A6] truncate block font-mono">
              {quickPriceMessage ??
                t('loadedSnapshotStatus', {
                  loaded: stocks.length,
                  stale: loadedStaleCount,
                })}
            </span>
            {user?.role === 'admin' && (
              <button
                type="button"
                disabled={quickPriceBusy}
                onClick={() => void handleQuickRefreshPrices()}
                title={
                  ko
                    ? '토스증권에서 최신 현재가만 빠르게 가져와 시가총액·안전마진을 즉시 갱신합니다'
                    : 'Quickly refresh latest stock prices and recalculate margins'
                }
                className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/30 px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer disabled:opacity-50 shrink-0"
              >
                {quickPriceBusy ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <Zap className="w-3 h-3 fill-current" />
                )}
                <span>{quickPriceBusy ? (ko ? '갱신 중…' : 'Updating…') : (ko ? '현재가 빠른 갱신' : 'Refresh Prices')}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Toss/Apple Style Filter Ribbon */}
      <div className="screener-filters flex flex-wrap items-center justify-between gap-3 py-1">
        {/* Left: Markets + Core Status Capsule Ribbon */}
        <div className="flex flex-wrap items-center gap-2 min-w-0 max-w-full">
          {/* Market multi-select buttons */}
          <MarketFilter markets={market} onChange={setMarket} />

          {/* Core Status Capsule Ribbon */}
          <div className="inline-flex w-fit max-w-full bg-[#F2F4F6] dark:bg-[#1C1C1E] p-1 rounded-2xl border border-black/[0.04] dark:border-white/[0.06] items-center gap-1 overflow-x-auto scrollbar-none shrink-0">
            {coreGradeFilterOptions.map((opt) => {
              const isActive = coreGradeFilter === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setCoreGradeFilter(opt.id)}
                  className={`px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-[13px] rounded-xl whitespace-nowrap transition-all duration-200 select-none cursor-pointer focus:outline-none shrink-0 ${isActive
                      ? 'bg-white dark:bg-[#2C2C2E] text-[#191F28] dark:text-[#F5F5F7] font-bold shadow-sm border border-black/[0.04] dark:border-white/[0.06]'
                      : 'text-[#4E5968] dark:text-[#A1A1A6] hover:text-[#191F28] dark:hover:text-[#F5F5F7] font-medium hover:bg-white/40 dark:hover:bg-white/5'
                    }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          <div className="relative shrink-0">
            <select
              aria-label={ko ? '가치평가' : 'Valuation'}
              value={valuationStatus}
              onChange={event => setValuationStatus(event.target.value as typeof valuationStatus)}
              className="h-10 pl-3.5 pr-8 appearance-none rounded-2xl bg-[#F2F4F6] dark:bg-[#1C1C1E] hover:bg-[#E5E8EB] dark:hover:bg-[#2C2C2E] text-[#191F28] dark:text-[#F5F5F7] font-medium text-[13px] border border-black/[0.06] dark:border-white/[0.08] transition-all cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0071E3]"
            >
              <option value="ALL">{ko ? '가치평가: 전체' : 'Valuation: All'}</option>
              <option value="PASS_WITH_MARGIN">{ko ? '가치평가: 안전마진 확보' : 'Valuation: With margin'}</option>
              <option value="WATCH">{ko ? '가치평가: 관찰' : 'Valuation: Watch'}</option>
              <option value="NO_MARGIN">{ko ? '가치평가: 안전마진 부족' : 'Valuation: No margin'}</option>
              <option value="N/A">{ko ? '가치평가: 계산 불가' : 'Valuation: Unavailable'}</option>
            </select>
            <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#86868B]" />
          </div>
        </div>

        {/* Right: Sorting Selector & Order Toggle */}
        <div className="flex flex-wrap items-center gap-2 min-w-0 max-w-full">
          {/* Sort Selector & Order Toggle stay together when wrapping */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Sort Selector Dropdown */}
            <div className="relative" ref={sortDropdownRef}>
              <button
                onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                className="h-10 px-3.5 rounded-2xl bg-[#F2F4F6] dark:bg-[#1C1C1E] hover:bg-[#E5E8EB] dark:hover:bg-[#2C2C2E] text-[#191F28] dark:text-[#F5F5F7] font-medium text-[13px] flex items-center gap-1.5 border border-black/[0.06] dark:border-white/[0.08] transition-all cursor-pointer select-none focus:outline-none"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-[#86868B]" />
                <span>{currentSortOption.label}</span>
                <ChevronDown
                  className={`w-3 h-3 text-[#86868B] transition-transform ${isSortDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isSortDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-max min-w-44 max-w-[calc(100vw-2rem)] bg-white dark:bg-[#1C1C1E] rounded-2xl shadow-xl border border-black/[0.08] dark:border-white/[0.12] p-1.5 z-50 animate-fade-in">
                  {sortOptions.map((opt) => {
                    const isSelected = sortField === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setSortField(opt.id);
                          setIsSortDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between gap-3 whitespace-nowrap transition-colors cursor-pointer select-none ${isSelected
                            ? 'bg-[#F2F4F6] dark:bg-[#2C2C2E] font-bold text-[#0071E3] dark:text-[#2997FF]'
                            : 'text-[#191F28] dark:text-[#F5F5F7] hover:bg-[#F9FAFB] dark:hover:bg-[#252528]'
                          }`}
                      >
                        <span>{opt.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-[#0071E3] dark:text-[#2997FF] stroke-[2.5]" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sort Order Toggle */}
            <button
              onClick={toggleSortOrder}
              className="screener-sort-order h-10 w-10 rounded-2xl bg-[#F2F4F6] dark:bg-[#1C1C1E] hover:bg-[#E5E8EB] dark:hover:bg-[#2C2C2E] text-[#191F28] dark:text-[#F5F5F7] flex items-center justify-center border border-black/[0.06] dark:border-white/[0.08] transition-all cursor-pointer select-none focus:outline-none"
              title={sortOrder === 'asc' ? t('sortOrderAsc') : t('sortOrderDesc')}
              aria-label="Toggle sort order"
            >
              {sortOrder === 'asc' ? <ArrowUp className="w-4 h-4 text-[#0071E3] dark:text-[#2997FF]" /> : <ArrowDown className="w-4 h-4 text-[#0071E3] dark:text-[#2997FF]" />}
            </button>
          </div>
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
              {favoritesOnly ? (ko ? '표시할 즐겨찾기 종목이 없습니다.' : 'No favorite stocks to show.') : t('noStocksFound')}
            </h3>
            <p className="text-xs text-[#86868B]">
              {favoritesOnly ? (ko ? '전체 종목에서 별표를 눌러 추가하거나 검색·필터를 확인해 주세요.' : 'Add stocks using the star, or adjust your search and filters.') : (ko ? '다른 시장이나 상태 필터를 선택하거나 검색어를 변경해보세요.' : 'Try a different market, status filter, or search.')}
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
              const { minIntrinsicValue, minYear } = getLowestIntrinsicValue(stock.periodValuations);
              const minPeriod = minYear ? stock.periodValuations?.[String(minYear)] : undefined;
              const ratioTitle = minYear
                ? `${ko ? `5개년 최저 (${minYear}개년): ` : `5Y Min (${minYear}Y): `}${formatPrice(minIntrinsicValue, stock.currency)}${minPeriod ? ` · ${periodNote(minPeriod, ko)}` : ''}`
                : (ko ? '내재가치 계산 불가' : 'Valuation unavailable');

              return (
                <div
                  key={stock.id}
                  onClick={() => {
                    setDrawerStockId(stock.id);
                    setDrawerView('detail');
                  }}
                  className="p-4 flex items-center justify-between gap-3 active:bg-[#F5F5F7] dark:active:bg-[#2C2C2E] transition-colors cursor-pointer"
                >
                  {/* Left: Rank & Ticker & Name & Grade */}
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono text-xs font-semibold text-[#6E6E73] dark:text-[#A1A1A6] w-5 shrink-0 tabular-nums">
                      {rank}
                    </span>
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-bold text-[15px] text-[#1D1D1F] dark:text-[#F5F5F7] ${isKoreanMarket(stock.market) ? 'truncate max-w-[9rem]' : 'font-mono'}`}>
                          {isKoreanMarket(stock.market) ? stock.name : stock.ticker}
                        </span>
                        {stock.isStale && (
                          <span className="text-[11px] font-bold text-[#FF9500] bg-[#FF9500]/10 px-1.5 py-0.5 rounded-full">
                            STALE
                          </span>
                        )}
                        <div className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold" title={gradeInfo.desc}>
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${gradeInfo.dotClass}`} />
                          <span className={gradeInfo.textClass}>{gradeInfo.badgeLabel}</span>
                        </div>
                      </div>
                      <StockMemoEditor
                        stockId={stock.id}
                        stockName={stock.name}
                        initialMemo={stock.memo}
                        onMemoChange={(newMemo) => updateStockMemoLocal(stock.id, newMemo)}
                      />
                    </div>
                  </div>

                  {/* Right: Current Price & Intrinsic Value & Favorite */}
                  <div className="flex items-center gap-1 shrink-0">
                  <div className="text-right space-y-0.5">
                    <div className="font-mono font-bold text-[15px] text-[#1D1D1F] dark:text-[#F5F5F7] tabular-nums">
                      {formatPrice(stock.currentPrice, stock.currency)}
                    </div>
                    <div className="text-xs font-mono text-[#6E6E73] dark:text-[#A1A1A6]">{ko ? '시총' : 'Cap'} {formatMarketCap(stock.marketCap, stock.currency)}</div>
                    <div title={ratioTitle} className="text-xs font-mono tabular-nums text-[#6E6E73] dark:text-[#A1A1A6]">
                      <span className="font-semibold text-[#0071E3] dark:text-[#2997FF]">{formatPrice(minIntrinsicValue, stock.currency)}</span>
                      {' · '}
                      <span className={priceToValueColor(stock.currentPrice, minIntrinsicValue)}>{valuationPriceToValueRatio(stock.currentPrice, minIntrinsicValue)}</span>
                    </div>
                    <div className={`text-xs font-mono font-bold ${confidenceColor(minPeriod?.dcf.confidence)}`}>{minPeriod?.dcf.confidence ?? '—'}</div>
                  </div>
                  <FavoriteButton stockId={stock.id} name={stock.name} />
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
                  <tr className="text-[13px] font-semibold text-[#6E6E73] dark:text-[#A1A1A6] whitespace-nowrap">
                    <th rowSpan={2} className="py-3 pl-2.5 sm:pl-3 pr-0 w-8 border-b border-black/[0.05] dark:border-white/[0.06]"><span className="sr-only">{ko ? '즐겨찾기' : 'Favorite'}</span></th>
                    <th rowSpan={2} className="py-3 px-1 w-9 text-center border-b border-black/[0.05] dark:border-white/[0.06]">{t('rank')}</th>
                    <th rowSpan={2} className="py-3 px-2 min-w-[100px] border-b border-black/[0.05] dark:border-white/[0.06]">{t('company')}</th>
                    <th rowSpan={2} className="py-3 px-2 text-right border-b border-black/[0.05] dark:border-white/[0.06]">{t('price')}</th>
                    <th rowSpan={2} className="py-3 px-2 text-right border-b border-black/[0.05] dark:border-white/[0.06]">{t('marketCapLabel')}</th>
                    <th rowSpan={2} className="py-3 px-2 text-center border-b border-black/[0.05] dark:border-white/[0.06]">{t('coreStatusLabel')}</th>
                    <th rowSpan={2} className="py-3 px-2 text-center border-b border-black/[0.05] dark:border-white/[0.06]">{t('coreRulesLabel')}</th>
                    <th colSpan={5} className="pt-3 pb-1 px-1.5 text-center">{ko ? '내재가치' : 'Intrinsic value'}</th>
                    <th rowSpan={2} title={ko ? '5개년 중 최저 내재가치 기준' : 'Based on 5-year minimum intrinsic value'} className="py-3 px-2 text-right border-b border-black/[0.05] dark:border-white/[0.06]">{ko ? '주가/내재가치' : 'Price / Value'}</th>
                    <th rowSpan={2} className="py-3 pl-2 pr-3 sm:pr-4 text-center border-b border-black/[0.05] dark:border-white/[0.06]">{t('confidence')}</th>
                  </tr>
                  <tr className="text-xs font-medium text-[#6E6E73] dark:text-[#A1A1A6] whitespace-nowrap border-b border-black/[0.05] dark:border-white/[0.06]">
                    {[1, 2, 3, 4, 5].map(year => <th key={year} className="pt-1 pb-3 px-1.5 lg:px-2 text-right font-mono">{year}{ko ? '년' : 'Y'}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.06] text-sm">
                  {stocks.map((stock, index) => {
                    const rank = index + 1;
                    const gradeInfo = getCoreGradeInfo(stock, language);
                    const { minIntrinsicValue, minYear } = getLowestIntrinsicValue(stock.periodValuations);
                    const minPeriod = minYear ? stock.periodValuations?.[String(minYear)] : undefined;
                    const ratioTitle = minYear
                      ? `${ko ? `5개년 최저 (${minYear}개년): ` : `5Y Min (${minYear}Y): `}${formatPrice(minIntrinsicValue, stock.currency)}${minPeriod ? ` · ${periodNote(minPeriod, ko)}` : ''}`
                      : (ko ? '내재가치 계산 불가' : 'Valuation unavailable');

                    return (
                      <tr
                        key={stock.id}
                        onClick={() => {
                          setDrawerStockId(stock.id);
                          setDrawerView('detail');
                        }}
                        className="hover:bg-[#F5F5F7]/80 dark:hover:bg-[#2C2C2E]/60 transition-colors cursor-pointer group"
                      >
                        {/* Favorite */}
                        <td className="py-3 pl-2.5 sm:pl-3 pr-0">
                          <FavoriteButton stockId={stock.id} name={stock.name} />
                        </td>

                        {/* Rank */}
                        <td className="py-3 px-1 text-center font-mono text-[#6E6E73] dark:text-[#A1A1A6] tabular-nums whitespace-nowrap">
                          {rank}
                        </td>

                        {/* Company */}
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-1.5 whitespace-nowrap">
                            <span className={`font-bold text-[#1D1D1F] dark:text-[#F5F5F7] group-hover:text-[#0071E3] dark:group-hover:text-[#2997FF] transition-colors ${isKoreanMarket(stock.market) ? 'truncate max-w-[10rem] xl:max-w-[11rem]' : 'font-mono'}`}>
                              {isKoreanMarket(stock.market) ? stock.name : stock.ticker}
                            </span>
                            <span className="text-[11px] font-mono text-[#6E6E73] dark:text-[#A1A1A6]">
                              {stock.market}
                            </span>
                            {stock.isStale && (
                              <span
                                className="text-[11px] font-bold text-[#FF9500] bg-[#FF9500]/10 px-1.5 py-0.5 rounded"
                                title={`Last successful: ${stock.lastSuccessfulAt}`}
                              >
                                STALE
                              </span>
                            )}
                          </div>
                          <StockMemoEditor
                            stockId={stock.id}
                            stockName={stock.name}
                            initialMemo={stock.memo}
                            onMemoChange={(newMemo) => updateStockMemoLocal(stock.id, newMemo)}
                          />
                        </td>

                        {/* Price */}
                        <td className="py-3 px-2 text-right font-mono font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tabular-nums whitespace-nowrap">
                          {formatPrice(stock.currentPrice, stock.currency)}
                        </td>

                        {/* Market Cap */}
                        <td className="py-3 px-2 text-right font-mono text-[#6E6E73] dark:text-[#A1A1A6] tabular-nums whitespace-nowrap">
                          {formatMarketCap(stock.marketCap, stock.currency)}
                        </td>

                        {/* 1. Core Status (등급제: 점 + 등급명만 표시) */}
                        <td className="py-3 px-2 text-center whitespace-nowrap">
                          <div className="inline-flex items-center justify-center gap-1.5" title={gradeInfo.desc}>
                            <span className={`w-2 h-2 rounded-full shrink-0 ${gradeInfo.dotClass}`} />
                            <span className={`font-mono font-bold tabular-nums ${gradeInfo.textClass}`}>
                              {gradeInfo.badgeLabel}
                            </span>
                          </div>
                        </td>

                        {/* Core Rules Breakdown (P / F / NA) */}
                        <td className="py-3 px-2 text-center whitespace-nowrap font-mono tabular-nums">
                          <span className="font-semibold text-[#34C759]">{stock.corePassCount}</span>
                          <span className="text-[#6E6E73] dark:text-[#8E8E93]">/</span>
                          <span className="font-semibold text-[#FF3B30]">{stock.coreFailCount}</span>
                          <span className="text-[#6E6E73] dark:text-[#8E8E93]">/</span>
                          <span className="font-semibold text-[#6E6E73] dark:text-[#8E8E93]">{stock.coreNaCount}</span>
                        </td>

                        {[1, 2, 3, 4, 5].map(year => {
                          const period = stock.periodValuations?.[String(year)];
                          const isLowest = year === minYear;
                          const hasWarning = period?.dcf.warnings.includes('INCOMPLETE_GROWTH_HISTORY');
                          return <td key={year} title={periodNote(period, ko)} className={`py-3 px-1.5 lg:px-2 text-right font-mono tabular-nums whitespace-nowrap ${isLowest ? 'font-semibold text-[#0071E3] dark:text-[#2997FF]' : 'text-[#6E6E73] dark:text-[#A1A1A6]'}`}>
                            {formatPrice(period?.dcf.scenarios?.base.intrinsicValuePerShare, stock.currency)}
                            {hasWarning && <span className="ml-0.5 text-[#FF9500]">⚠</span>}
                          </td>;
                        })}
                        <td title={ratioTitle} className={`py-3 px-2 text-right font-mono tabular-nums whitespace-nowrap ${priceToValueColor(stock.currentPrice, minIntrinsicValue)}`}>{valuationPriceToValueRatio(stock.currentPrice, minIntrinsicValue)}</td>

                        {/* Confidence */}
                        <td className="py-3 pl-2 pr-3 sm:pr-4 text-center font-mono whitespace-nowrap">
                          <span className={`text-xs font-bold ${confidenceColor(minPeriod?.dcf.confidence)}`}>
                            {minPeriod?.dcf.confidence ?? '—'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="py-4 px-7 border-t border-black/[0.05] dark:border-white/[0.06] flex items-center justify-between text-[13px] text-[#6E6E73] dark:text-[#A1A1A6]">
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

    </div>

      <StockDetailDrawer
        stock={selectedDrawerStock}
        years={effectiveDrawerYears}
        actionLabel={drawerView === 'valuation' ? (ko ? '종목 분석으로 돌아가기' : 'Back to Stock Analysis') : undefined}
        content={drawerStock && (
          drawerView === 'valuation' ? (
            <StockValuationPage
              key={`${drawerStock.id}-valuation`}
              ticker={drawerStock.ticker}
              market={drawerStock.market}
              years={effectiveDrawerYears}
              embedded
              onApplied={retry}
            />
          ) : (
            <StockDetailPage
              key={`${drawerStock.id}-detail`}
              ticker={drawerStock.ticker}
              market={drawerStock.market}
              embedded
            />
          )
        )}
        isOpen={Boolean(selectedDrawerStock)}
        onClose={() => {
          setDrawerStockId(null);
          setDrawerView('detail');
        }}
        onNavigateToFullDetail={() => {
          setDrawerView(prev => (prev === 'detail' ? 'valuation' : 'detail'));
        }}
        stockList={stocks}
        onSelectStock={stock => setDrawerStockId(stock.id)}
      />
    </>
  );
};
