import { MarketFilter } from '../components/common/MarketFilter';
import { FavoriteButton } from '../components/common/FavoriteButton';
import { HideStockButton } from '../components/common/HideStockButton';
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
  Eye,
  EyeOff,
  ListChecks,
  Trash2,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { useAppConfig } from '../context/ThemeLanguageContext';
import { StockSort } from '../types/api';
import { getCoreGradeInfo } from '../utils/ruleFormatters';
import { StockDetailDrawer } from '../components/screener/StockDetailDrawer';
import { StockDetailPage } from './StockDetailPage';
import { StockValuationPage } from './StockValuationPage';
import { stockApi } from '../services/api';
import { bulkDeleteAdminStocks, refreshStockPrices } from '../services/adminApi';
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
  hiddenOnly?: boolean;
}

export const ScreenerPage: React.FC<ScreenerPageProps> = ({
  searchQuery: globalSearchQuery,
  favoritesOnly = false,
  hiddenOnly = false,
}) => {
  const navigate = useNavigate();
  const { t, language } = useAppConfig();
  const {
    user,
    favoritesError,
    reloadFavorites,
    hiddenIds,
    hiddenError,
    reloadHidden,
    bulkHideStocks,
    bulkUnhideStocks,
  } = useAccount();
  const {
    valuationStatus, setValuationStatus,
    stocks,
    total,
    counts,
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
    removeStocksLocal,
  } = useStocks(favoritesOnly, hiddenOnly);

  const handleStockFavoriteToggled = (stockId: string, favorite: boolean) => {
    if (!favorite && favoritesOnly) {
      removeStocksLocal([stockId]);
    } else if (favorite && hiddenOnly) {
      removeStocksLocal([stockId]);
    }
  };

  const handleStockHiddenToggled = (stockId: string, hidden: boolean) => {
    if (hidden && !hiddenOnly) {
      removeStocksLocal([stockId]);
    } else if (!hidden && hiddenOnly) {
      removeStocksLocal([stockId]);
    }
  };

  const ko = language === 'ko';
  const [quickPriceBusy, setQuickPriceBusy] = useState(false);
  const [quickPriceMessage, setQuickPriceMessage] = useState<string | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedStockIds, setSelectedStockIds] = useState<string[]>([]);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkMessage, setBulkMessage] = useState<string | null>(null);

  useEffect(() => {
    setSelectedStockIds((prev) =>
      prev.filter((id) => stocks.some((stock) => stock.id === id)),
    );
  }, [stocks]);

  const toggleSelectStock = (stockId: string) => {
    setSelectedStockIds((prev) =>
      prev.includes(stockId) ? prev.filter((id) => id !== stockId) : [...prev, stockId],
    );
  };

  const allLoadedSelected =
    stocks.length > 0 && stocks.every((s) => selectedStockIds.includes(s.id));

  const toggleSelectAllLoaded = () => {
    if (allLoadedSelected) {
      setSelectedStockIds([]);
    } else {
      setSelectedStockIds(stocks.map((s) => s.id));
    }
  };

  const handleBulkHideOrUnhide = async () => {
    if (bulkBusy || selectedStockIds.length === 0) return;
    if (!user) {
      navigate(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }
    setBulkBusy(true);
    setBulkMessage(null);
    try {
      const idsToProcess = [...selectedStockIds];
      const count = idsToProcess.length;
      if (hiddenOnly) {
        await bulkUnhideStocks(idsToProcess);
        removeStocksLocal(idsToProcess);
        setBulkMessage(
          ko ? `${count}개 종목 숨김을 해제했습니다.` : `Unhid ${count} stocks.`,
        );
      } else {
        await bulkHideStocks(idsToProcess);
        removeStocksLocal(idsToProcess);
        setBulkMessage(
          ko ? `${count}개 종목을 숨겼습니다.` : `Hid ${count} stocks.`,
        );
      }
      setSelectedStockIds([]);
      setTimeout(() => setBulkMessage(null), 4000);
    } catch (err) {
      setBulkMessage(
        err instanceof Error
          ? err.message
          : ko
          ? '일괄 처리에 실패했습니다.'
          : 'Bulk operation failed.',
      );
      setTimeout(() => setBulkMessage(null), 5000);
    } finally {
      setBulkBusy(false);
    }
  };

  const handleBulkAdminDelete = async () => {
    if (bulkBusy || selectedStockIds.length === 0) return;
    const count = selectedStockIds.length;
    const confirmMsg = ko
      ? `[관리자] 선택한 ${count}개 종목을 서비스 전체 관리 목록에서 일괄 삭제(제외)하시겠습니까?\n(기존 수집된 원자료는 보존되며 언제든 다시 추가할 수 있습니다.)`
      : `[Admin] Remove ${count} selected stocks from managed list?`;
    if (!window.confirm(confirmMsg)) return;
    setBulkBusy(true);
    setBulkMessage(null);
    try {
      const res = await bulkDeleteAdminStocks(selectedStockIds);
      setSelectedStockIds([]);
      setBulkMessage(
        ko
          ? `${res.deleted_count}개 종목을 관리 목록에서 삭제했습니다.`
          : `Removed ${res.deleted_count} stocks from managed list.`,
      );
      retry();
      setTimeout(() => setBulkMessage(null), 4000);
    } catch (err) {
      setBulkMessage(
        err instanceof Error
          ? err.message
          : ko
          ? '관리 종목 일괄 삭제 실패'
          : 'Failed to remove stocks.',
      );
      setTimeout(() => setBulkMessage(null), 5000);
    } finally {
      setBulkBusy(false);
    }
  };

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
    { id: 'FAIL', label: t('coreStatusFail') },
    { id: 'N/A', label: ko ? '평가 불가' : 'N/A' },
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
    <div className="screener-page page-container max-w-[1600px] mx-auto px-4 sm:px-8 py-3.5 sm:py-8 space-y-3 sm:space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2 sm:gap-3">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
          {hiddenOnly
            ? (ko ? '숨긴 종목' : 'Hidden stocks')
            : favoritesOnly
            ? (ko ? '내 즐겨찾기' : 'My favorites')
            : (ko ? '종목 스크리너' : 'Stock screener')}
        </h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-pressed={favoritesOnly}
            onClick={() => navigate(favoritesOnly ? '/' : '/favorites')}
            className={`inline-flex items-center gap-1.5 h-8 rounded-full pl-3 pr-3.5 text-xs font-semibold border transition-all duration-200 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0071E3] cursor-pointer ${favoritesOnly
              ? 'bg-[#FFD60A]/15 border-[#D97706]/25 text-[#B45309] dark:bg-[#FFD60A]/15 dark:border-[#FFD60A]/30 dark:text-[#FFD60A] hover:bg-[#FFD60A]/25'
              : 'bg-white dark:bg-[#1C1C1E] border-black/[0.08] dark:border-white/[0.12] text-[#1D1D1F] dark:text-[#F5F5F7] shadow-sm hover:border-[#D97706]/30 hover:text-[#B45309] dark:hover:text-[#FFD60A]'}`}
          >
            <Star aria-hidden="true" className="w-3.5 h-3.5" fill={favoritesOnly ? 'currentColor' : 'none'} strokeWidth={2.25} />
            {ko ? '즐겨찾기만 보기' : 'Favorites only'}
          </button>
          <button
            type="button"
            aria-pressed={hiddenOnly}
            onClick={() => navigate(hiddenOnly ? '/' : '/hidden')}
            className={`inline-flex items-center gap-1.5 h-8 rounded-full pl-3 pr-3.5 text-xs font-semibold border transition-all duration-200 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0071E3] cursor-pointer ${hiddenOnly
              ? 'bg-[#FF3B30]/15 border-[#FF3B30]/30 text-[#FF3B30] hover:bg-[#FF3B30]/25'
              : 'bg-white dark:bg-[#1C1C1E] border-black/[0.08] dark:border-white/[0.12] text-[#6E6E73] dark:text-[#A1A1A6] shadow-sm hover:border-[#FF3B30]/30 hover:text-[#FF3B30]'}`}
          >
            <EyeOff aria-hidden="true" className="w-3.5 h-3.5" strokeWidth={2.25} />
            <span>
              {ko ? '숨긴 종목' : 'Hidden'}
              {hiddenIds.length > 0 ? ` (${hiddenIds.length})` : ''}
            </span>
          </button>
          <button
            type="button"
            aria-pressed={selectionMode}
            onClick={() => {
              setSelectionMode((prev) => {
                if (prev) setSelectedStockIds([]);
                return !prev;
              });
            }}
            className={`inline-flex items-center gap-1.5 h-8 rounded-full pl-3 pr-3.5 text-xs font-semibold border transition-all duration-200 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0071E3] cursor-pointer ${selectionMode
              ? 'bg-[#0071E3]/15 border-[#0071E3]/30 text-[#0071E3] dark:text-[#2997FF] hover:bg-[#0071E3]/25'
              : 'bg-white dark:bg-[#1C1C1E] border-black/[0.08] dark:border-white/[0.12] text-[#6E6E73] dark:text-[#A1A1A6] shadow-sm hover:border-[#0071E3]/30 hover:text-[#0071E3] dark:hover:text-[#2997FF]'}`}
          >
            <ListChecks aria-hidden="true" className="w-3.5 h-3.5" strokeWidth={2.25} />
            <span>{ko ? '여러 종목 선택' : 'Select multiple'}</span>
          </button>
        </div>
      </div>
      {selectionMode && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-white dark:bg-[#1C1C1E] px-4 py-2.5 border border-[#0071E3]/25 dark:border-[#2997FF]/30 shadow-sm animate-fade-in">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={bulkBusy || stocks.length === 0}
              onClick={toggleSelectAllLoaded}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#F2F4F6] dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#E5E8EB] dark:hover:bg-[#3A3A3C] transition-colors cursor-pointer disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5 text-[#0071E3] dark:text-[#2997FF]" />
              <span>{allLoadedSelected ? (ko ? '전체 해제' : 'Deselect all') : (ko ? '현재 목록 전체 선택' : 'Select all')}</span>
            </button>
            {selectedStockIds.length > 0 && (
              <button
                type="button"
                disabled={bulkBusy}
                onClick={() => setSelectedStockIds([])}
                className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-[#6E6E73] dark:text-[#A1A1A6] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] cursor-pointer"
              >
                {ko ? '선택 초기화' : 'Clear'}
              </button>
            )}
            <span className="text-xs font-semibold font-mono text-[#0071E3] dark:text-[#2997FF] px-2 py-0.5 rounded-lg bg-[#0071E3]/10 dark:bg-[#2997FF]/15 tabular-nums">
              {ko ? `${selectedStockIds.length}개 선택됨` : `${selectedStockIds.length} selected`}
            </span>
            {bulkMessage && (
              <span role="status" className="text-xs font-medium text-[#34C759]">
                {bulkMessage}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={bulkBusy || selectedStockIds.length === 0}
              onClick={() => void handleBulkHideOrUnhide()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-[#FF3B30] hover:bg-[#D70015] shadow-sm transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {hiddenOnly ? (
                <Eye className="w-3.5 h-3.5" />
              ) : (
                <EyeOff className="w-3.5 h-3.5" />
              )}
              <span>
                {bulkBusy
                  ? (ko ? '처리 중…' : 'Processing…')
                  : hiddenOnly
                  ? (ko ? `선택 종목 숨김 해제 (${selectedStockIds.length})` : `Unhide selected (${selectedStockIds.length})`)
                  : (ko ? `선택 종목 숨기기 (${selectedStockIds.length})` : `Hide selected (${selectedStockIds.length})`)}
              </span>
            </button>
            {user?.role === 'admin' && (
              <button
                type="button"
                disabled={bulkBusy || selectedStockIds.length === 0}
                onClick={() => void handleBulkAdminDelete()}
                title={ko ? '관리자: 선택한 종목들을 서비스 전체 관리 목록에서 일괄 제외합니다' : 'Admin: Remove selected stocks from managed list'}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#FF3B30] bg-[#FF3B30]/10 hover:bg-[#FF3B30]/20 border border-[#FF3B30]/25 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>
                  {ko
                    ? `[관리자] 영구 제외 (${selectedStockIds.length})`
                    : `[Admin] Unmanage (${selectedStockIds.length})`}
                </span>
              </button>
            )}
          </div>
        </div>
      )}
      {favoritesError && <div role="alert" className="text-xs text-[#FF3B30]">{ko ? '즐겨찾기 상태를 불러오지 못했습니다.' : 'Could not load favorites.'} <button onClick={() => void reloadFavorites().catch(() => {})} className="underline">{t('retry')}</button></div>}
      {hiddenError && <div role="alert" className="text-xs text-[#FF3B30]">{ko ? '숨김 종목 상태를 불러오지 못했습니다.' : 'Could not load hidden stocks.'} <button onClick={() => void reloadHidden().catch(() => {})} className="underline">{t('retry')}</button></div>}
      {/* 1-A. Mobile Compact Summary Bar (1 Row, 3 Columns) */}
      <div className="md:hidden bg-white dark:bg-[#1C1C1E] rounded-2xl p-3.5 border border-black/[0.06] dark:border-white/[0.08] shadow-sm transition-colors duration-300">
        <div className="grid grid-cols-3 divide-x divide-black/[0.06] dark:divide-white/[0.08] text-center">
          <div className="px-1.5">
            <span className="text-[11px] font-medium text-[#6E6E73] dark:text-[#A1A1A6] block truncate">
              {ko ? '버핏 통과' : 'Passed'}
            </span>
            <div className="text-sm font-bold font-mono text-[#1D1D1F] dark:text-[#F5F5F7] tabular-nums mt-0.5">
              {counts?.passed ?? '—'} <span className="text-[11px] font-normal text-[#86868B]">/ {counts?.total ?? '—'}</span>
            </div>
          </div>
          <div className="px-1.5">
            <span className="text-[11px] font-medium text-[#6E6E73] dark:text-[#A1A1A6] block truncate">
              {ko ? '안전마진 확보' : 'With Margin'}
            </span>
            <div className="text-sm font-bold font-mono text-[#34C759] tabular-nums mt-0.5">
              {counts?.margin ?? '—'}
            </div>
          </div>
          <div className="px-1.5">
            <span className="text-[11px] font-medium text-[#6E6E73] dark:text-[#A1A1A6] block truncate">
              {ko ? '기준일' : 'As Of'}
            </span>
            <div className="text-xs font-bold font-mono text-[#1D1D1F] dark:text-[#F5F5F7] tabular-nums mt-1">
              {latestLoadedDataAsOf?.slice(0, 10) ?? '—'}
            </div>
          </div>
        </div>
        {(user?.role === 'admin' || quickPriceMessage) && (
          <div className="pt-2.5 mt-2.5 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium text-[#6E6E73] dark:text-[#A1A1A6] truncate font-mono">
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
                className="inline-flex items-center gap-1 text-[11px] font-medium text-[#6E6E73] hover:text-[#1D1D1F] dark:text-[#A1A1A6] dark:hover:text-[#F5F5F7] transition-colors cursor-pointer disabled:opacity-50 shrink-0"
              >
                {quickPriceBusy ? (
                  <RefreshCw className="w-3 h-3 animate-spin text-amber-500" />
                ) : (
                  <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />
                )}
                <span>{quickPriceBusy ? (ko ? '갱신 중…' : 'Updating…') : (ko ? '현재가 빠른 갱신' : 'Refresh Prices')}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* 1-B. Desktop Hero Bento Grid (3 Cards Row) */}
      <div className="screener-summary hidden md:grid md:grid-cols-12 gap-3 sm:gap-5">
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
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6E6E73] hover:text-[#1D1D1F] dark:text-[#A1A1A6] dark:hover:text-[#F5F5F7] transition-colors cursor-pointer disabled:opacity-50 shrink-0"
              >
                {quickPriceBusy ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-500" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                )}
                <span>{quickPriceBusy ? (ko ? '갱신 중…' : 'Updating…') : (ko ? '현재가 빠른 갱신' : 'Refresh Prices')}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Minimalist Filter Ribbon */}
      <div className="screener-filters flex flex-wrap items-center justify-between gap-2 sm:gap-3 py-1">
        {/* Market multi-select buttons (Row 1 on Mobile, Inline on Desktop) */}
        <MarketFilter markets={market} onChange={setMarket} />

        {/* Desktop Core Status Capsule Ribbon */}
        <div className="hidden md:inline-flex w-fit max-w-full bg-[#F2F4F6] dark:bg-[#1C1C1E] p-1 rounded-2xl border border-black/[0.04] dark:border-white/[0.06] items-center gap-1 overflow-x-auto scrollbar-none shrink-0">
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

        {/* Row 2 on Mobile (Grade + Valuation + Sort all in 1 line) / Remaining controls on Desktop */}
        <div className="w-full md:w-auto flex-1 flex items-center justify-between gap-1.5 sm:gap-2 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1 md:flex-none">
            {/* Mobile Core Status Select */}
            <div className="md:hidden relative shrink-0">
              <select
                aria-label={ko ? '핵심 등급' : 'Core Status'}
                value={coreGradeFilter}
                onChange={(event) => setCoreGradeFilter(event.target.value as CoreGradeFilterOption)}
                className="h-9 pl-2.5 pr-6 appearance-none rounded-xl bg-[#F2F4F6] dark:bg-[#1C1C1E] hover:bg-[#E5E8EB] dark:hover:bg-[#2C2C2E] text-[#191F28] dark:text-[#F5F5F7] font-medium text-xs border border-black/[0.06] dark:border-white/[0.08] transition-all cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0071E3]"
              >
                {coreGradeFilterOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#86868B]" />
            </div>

            {/* Valuation Select */}
            <div className="relative min-w-0 flex-1 md:flex-none">
              <select
                aria-label={ko ? '가치평가' : 'Valuation'}
                value={valuationStatus}
                onChange={event => setValuationStatus(event.target.value as typeof valuationStatus)}
                className="w-full md:w-auto h-9 sm:h-10 pl-2.5 sm:pl-3.5 pr-6 sm:pr-8 truncate appearance-none rounded-xl sm:rounded-2xl bg-[#F2F4F6] dark:bg-[#1C1C1E] hover:bg-[#E5E8EB] dark:hover:bg-[#2C2C2E] text-[#191F28] dark:text-[#F5F5F7] font-medium text-xs sm:text-[13px] border border-black/[0.06] dark:border-white/[0.08] transition-all cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0071E3]"
              >
                <option value="ALL">{ko ? '가치평가: 전체' : 'Valuation: All'}</option>
                <option value="PASS_WITH_MARGIN">{ko ? '가치평가: 안전마진 확보' : 'Valuation: With margin'}</option>
                <option value="WATCH">{ko ? '가치평가: 관찰' : 'Valuation: Watch'}</option>
                <option value="NO_MARGIN">{ko ? '가치평가: 안전마진 부족' : 'Valuation: No margin'}</option>
                <option value="N/A">{ko ? '가치평가: 계산 불가' : 'Valuation: Unavailable'}</option>
              </select>
              <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-2 sm:right-3.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#86868B]" />
            </div>
          </div>

          {/* Right: Sorting Selector & Order Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Sort Selector Dropdown */}
            <div className="relative" ref={sortDropdownRef}>
              <button
                onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                className="h-9 sm:h-10 px-2.5 sm:px-3.5 rounded-xl sm:rounded-2xl bg-[#F2F4F6] dark:bg-[#1C1C1E] hover:bg-[#E5E8EB] dark:hover:bg-[#2C2C2E] text-[#191F28] dark:text-[#F5F5F7] font-medium text-xs sm:text-[13px] flex items-center gap-1 sm:gap-1.5 border border-black/[0.06] dark:border-white/[0.08] transition-all cursor-pointer select-none focus:outline-none whitespace-nowrap"
              >
                <ArrowUpDown className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-[#86868B] shrink-0" />
                <span>{currentSortOption.label}</span>
                <ChevronDown
                  className={`w-3 h-3 text-[#86868B] shrink-0 transition-transform ${isSortDropdownOpen ? 'rotate-180' : ''}`}
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
              className="screener-sort-order h-9 w-9 sm:h-10 sm:w-10 rounded-xl sm:rounded-2xl bg-[#F2F4F6] dark:bg-[#1C1C1E] hover:bg-[#E5E8EB] dark:hover:bg-[#2C2C2E] text-[#191F28] dark:text-[#F5F5F7] flex items-center justify-center border border-black/[0.06] dark:border-white/[0.08] transition-all cursor-pointer select-none focus:outline-none shrink-0"
              title={sortOrder === 'asc' ? t('sortOrderAsc') : t('sortOrderDesc')}
              aria-label="Toggle sort order"
            >
              {sortOrder === 'asc' ? <ArrowUp className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#0071E3] dark:text-[#2997FF]" /> : <ArrowDown className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#0071E3] dark:text-[#2997FF]" />}
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
              {hiddenOnly
                ? (ko ? '숨긴 종목이 없습니다.' : 'No hidden stocks.')
                : favoritesOnly
                ? (ko ? '표시할 즐겨찾기 종목이 없습니다.' : 'No favorite stocks to show.')
                : t('noStocksFound')}
            </h3>
            <p className="text-xs text-[#86868B]">
              {hiddenOnly
                ? (ko ? '전체 종목에서 숨기기(눈 가림) 아이콘을 누른 종목이 이곳에 표시됩니다.' : 'Stocks you hide from the screener will appear here.')
                : favoritesOnly
                ? (ko ? '전체 종목에서 별표를 눌러 추가하거나 검색·필터를 확인해 주세요.' : 'Add stocks using the star, or adjust your search and filters.')
                : (ko ? '다른 시장이나 상태 필터를 선택하거나 검색어를 변경해보세요.' : 'Try a different market, status filter, or search.')}
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
                    if (selectionMode) {
                      toggleSelectStock(stock.id);
                      return;
                    }
                    setDrawerStockId(stock.id);
                    setDrawerView('detail');
                  }}
                  className={`p-4 flex items-center justify-between gap-3 active:bg-[#F5F5F7] dark:active:bg-[#2C2C2E] transition-colors cursor-pointer ${
                    selectionMode && selectedStockIds.includes(stock.id)
                      ? 'bg-[#0071E3]/[0.06] dark:bg-[#2997FF]/[0.1]'
                      : ''
                  }`}
                >
                  {/* Left: Rank & Ticker & Name & Grade */}
                  <div className="flex items-center gap-3 min-w-0">
                    {selectionMode && (
                      <input
                        type="checkbox"
                        aria-label={`${stock.name} 선택`}
                        checked={selectedStockIds.includes(stock.id)}
                        onChange={() => toggleSelectStock(stock.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 rounded accent-[#0071E3] shrink-0 cursor-pointer"
                      />
                    )}
                    <span className="font-mono text-xs font-semibold text-[#6E6E73] dark:text-[#A1A1A6] w-5 shrink-0 tabular-nums">
                      {rank}
                    </span>
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-bold text-[15px] text-[#1D1D1F] dark:text-[#F5F5F7] ${isKoreanMarket(stock.market) ? 'truncate max-w-[9rem]' : 'font-mono'}`}>
                          {isKoreanMarket(stock.market) ? stock.name : stock.ticker}
                        </span>
                        <HideStockButton
                          stockId={stock.id}
                          name={stock.name}
                          onToggled={(hidden) => handleStockHiddenToggled(stock.id, hidden)}
                        />
                        {stock.isStale && (
                          <span className="text-[11px] font-bold text-[#FF9500] bg-[#FF9500]/10 px-1.5 py-0.5 rounded-full">
                            STALE
                          </span>
                        )}
                        <div className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold" title={gradeInfo.desc}>
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${gradeInfo.dotClass}`} />
                          <span className={gradeInfo.textClass}>{gradeInfo.badgeLabel}</span>
                        </div>
                        <FavoriteButton
                          stockId={stock.id}
                          name={stock.name}
                          onToggled={(fav) => handleStockFavoriteToggled(stock.id, fav)}
                        />
                      </div>
                      <StockMemoEditor
                        stockId={stock.id}
                        stockName={stock.name}
                        initialMemo={stock.memo}
                        onMemoChange={(newMemo) => updateStockMemoLocal(stock.id, newMemo)}
                      />
                    </div>
                  </div>

                  {/* Right: Current Price & Intrinsic Value */}
                  <div className="text-right space-y-0.5 shrink-0">
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
                    {selectionMode && (
                      <th rowSpan={2} className="py-3 pl-3 pr-1 w-8 text-center border-b border-black/[0.05] dark:border-white/[0.06]">
                        <input
                          type="checkbox"
                          aria-label={ko ? '전체 선택' : 'Select all'}
                          checked={allLoadedSelected}
                          onChange={toggleSelectAllLoaded}
                          className="w-4 h-4 rounded accent-[#0071E3] cursor-pointer"
                        />
                      </th>
                    )}
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
                          if (selectionMode) {
                            toggleSelectStock(stock.id);
                            return;
                          }
                          setDrawerStockId(stock.id);
                          setDrawerView('detail');
                        }}
                        className={`hover:bg-[#F5F5F7]/80 dark:hover:bg-[#2C2C2E]/60 transition-colors cursor-pointer group ${
                          selectionMode && selectedStockIds.includes(stock.id)
                            ? 'bg-[#0071E3]/[0.06] dark:bg-[#2997FF]/[0.1]'
                            : ''
                        }`}
                      >
                        {selectionMode && (
                          <td
                            className="py-3 pl-3 pr-1 text-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              aria-label={`${stock.name} 선택`}
                              checked={selectedStockIds.includes(stock.id)}
                              onChange={() => toggleSelectStock(stock.id)}
                              className="w-4 h-4 rounded accent-[#0071E3] cursor-pointer"
                            />
                          </td>
                        )}
                        {/* Favorite */}
                        <td className="py-3 pl-2.5 sm:pl-3 pr-0">
                          <FavoriteButton
                            stockId={stock.id}
                            name={stock.name}
                            onToggled={(fav) => handleStockFavoriteToggled(stock.id, fav)}
                          />
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
                            <HideStockButton
                              stockId={stock.id}
                              name={stock.name}
                              onToggled={(hidden) => handleStockHiddenToggled(stock.id, hidden)}
                            />
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
              onFavoriteToggled={(fav) => handleStockFavoriteToggled(drawerStock.id, fav)}
            />
          ) : (
            <StockDetailPage
              key={`${drawerStock.id}-detail`}
              ticker={drawerStock.ticker}
              market={drawerStock.market}
              embedded
              onDeleted={() => {
                setDrawerStockId(null);
                retry();
              }}
              onFavoriteToggled={(fav) => handleStockFavoriteToggled(drawerStock.id, fav)}
              onHiddenToggled={(hidden) => handleStockHiddenToggled(drawerStock.id, hidden)}
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
