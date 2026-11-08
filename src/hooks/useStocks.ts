import { useState, useEffect, useCallback, useRef } from 'react';
import {
  StockSummaryDTO,
  StockListCountsDTO,
  StockListQuery,
  Market,
  CoreGradeFilter,
  ValuationStatus,
  StockSort,
  SortOrder,
} from '../types/api';
import { stockApi } from '../services/api';
import { getLowestIntrinsicValue } from '../utils/valuationFormatters';

export type CoreGradeFilterOption = CoreGradeFilter | 'ALL';
export type ValuationStatusFilter = ValuationStatus | 'ALL';

export interface UseStocksReturn {
  stocks: StockSummaryDTO[];
  total: number;
  counts: StockListCountsDTO | null;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  market: Market[];
  setMarket: (market: Market[]) => void;
  coreGradeFilter: CoreGradeFilterOption;
  setCoreGradeFilter: (grade: CoreGradeFilterOption) => void;
  valuationStatus: ValuationStatusFilter;
  setValuationStatus: (status: ValuationStatusFilter) => void;
  sortField: StockSort;
  setSortField: (field: StockSort) => void;
  sortOrder: SortOrder;
  setSortOrder: (order: SortOrder) => void;
  toggleSortOrder: () => void;
  hasMore: boolean;
  loadMore: () => void;
  retry: () => void;
  resetFilters: () => void;
  updateStockMemoLocal: (stockId: string, memo: string | null) => void;
  removeStocksLocal: (stockIds: string[]) => void;
}

export function useStocks(
  favoritesOnly = false,
  hiddenOnly = false,
): UseStocksReturn {
  const [stocks, setStocks] = useState<StockSummaryDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState<StockListCountsDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter & Query States
  const [searchQuery, setSearchQueryState] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [market, setMarketState] = useState<Market[]>([]);
  const [coreGradeFilter, setCoreGradeFilterState] =
    useState<CoreGradeFilterOption>('ALL');
  const [valuationStatus, setValuationStatusState] =
    useState<ValuationStatusFilter>('ALL');
  const [sortField, setSortFieldState] =
    useState<StockSort>('marketCap');
  const [sortOrder, setSortOrderState] = useState<SortOrder>('desc');
  const [offset, setOffset] = useState(0);
  const limit = 50;

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setOffset(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryState(query);
  }, []);

  const setMarket = useCallback((nextMarket: Market[]) => {
    setMarketState(nextMarket);
    setOffset(0);
  }, []);

  const setCoreGradeFilter = useCallback((nextGrade: CoreGradeFilterOption) => {
    setCoreGradeFilterState(nextGrade);
    setOffset(0);
  }, []);

  const setValuationStatus = useCallback(
    (nextStatus: ValuationStatusFilter) => {
      setValuationStatusState(nextStatus);
      setOffset(0);
    },
    []
  );

  const setSortField = useCallback((nextField: StockSort) => {
    setSortFieldState(nextField);
    setOffset(0);
  }, []);

  const setSortOrder = useCallback((nextOrder: SortOrder) => {
    setSortOrderState(nextOrder);
    setOffset(0);
  }, []);

  // Active abort controllers
  const abortControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);
  const loadedQueryRef = useRef('');

  useEffect(() => { setOffset(0); }, [favoritesOnly, hiddenOnly]);

  // Fetch stocks function
  const fetchStocks = useCallback(
    async (isLoadMore: boolean = false) => {
      abortControllerRef.current?.abort();

      const controller = new AbortController();
      const requestId = ++requestIdRef.current;
      abortControllerRef.current = controller;

      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
      }

      try {
        const query: StockListQuery = {
          favoritesOnly,
          hiddenOnly,
          limit,
          offset: isLoadMore ? offset : 0,
        };

        if (debouncedSearch.trim()) {
          query.search = debouncedSearch.trim();
        }
        if (market.length > 0) {
          query.market = market;
        }
        if (coreGradeFilter !== 'ALL') {
          query.coreStatus = coreGradeFilter;
        }
        if (valuationStatus !== 'ALL') {
          query.valuationStatus = valuationStatus;
        }
        if (sortField) {
          query.sort = sortField;
          query.order = sortOrder;
        }

        const queryKey = JSON.stringify({ ...query, offset: 0 });
        const append = isLoadMore && loadedQueryRef.current === queryKey;
        if (!append) {
          query.offset = 0;
          query.includeCounts = true;
        }
        const response = await stockApi.getStocks(query, controller.signal);
        if (requestId !== requestIdRef.current) return;
        loadedQueryRef.current = queryKey;

        if (append) {
          setStocks((prev) => [...prev, ...response.items]);
        } else {
          setStocks(response.items);
          if (response.counts) {
            setCounts(response.counts);
          }
        }
        setTotal(response.total);
        setError(null);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        if (requestId !== requestIdRef.current) return;
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
      } finally {
        if (requestId === requestIdRef.current) {
          abortControllerRef.current = null;
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [
      favoritesOnly,
      hiddenOnly,
      debouncedSearch,
      market,
      coreGradeFilter,
      valuationStatus,
      sortField,
      sortOrder,
      offset,
    ]
  );

  // Initial & Filter Triggered Load
  useEffect(() => {
    fetchStocks(offset > 0);
  }, [fetchStocks, offset]);

  useEffect(
    () => () => {
      requestIdRef.current += 1;
      abortControllerRef.current?.abort();
    },
    []
  );

  const toggleSortOrder = useCallback(() => {
    setSortOrderState((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    setOffset(0);
  }, []);

  const loadMore = useCallback(() => {
    if (!loading && !loadingMore && stocks.length < total) {
      setOffset(stocks.length);
    }
  }, [loading, loadingMore, stocks.length, total]);

  const retry = useCallback(() => {
    setOffset(0);
    if (offset === 0) {
      fetchStocks(false);
    }
  }, [fetchStocks, offset]);

  const resetFilters = useCallback(() => {
    setSearchQueryState('');
    setDebouncedSearch('');
    setMarketState([]);
    setCoreGradeFilterState('ALL');
    setValuationStatusState('ALL');
    setSortFieldState('marketCap');
    setSortOrderState('desc');
    setOffset(0);
  }, []);

  const updateStockMemoLocal = useCallback((stockId: string, memo: string | null) => {
    setStocks((prev) =>
      prev.map((s) => (s.id === stockId ? { ...s, memo } : s))
    );
  }, []);

  const removeStocksLocal = useCallback((stockIds: string[]) => {
    if (stockIds.length === 0) return;
    const idSet = new Set(stockIds);
    setStocks((prev) => {
      const removedItems = prev.filter((s) => idSet.has(s.id));
      const next = prev.filter((s) => !idSet.has(s.id));
      const removedCount = removedItems.length;
      if (removedCount > 0) {
        setTotal((t) => Math.max(0, t - removedCount));
        const removedPassed = removedItems.filter((s) => s.coreStatus === 'PASS').length;
        const removedMargin = removedItems.filter((s) => {
          const minInfo = getLowestIntrinsicValue(s.periodValuations);
          const minYear = minInfo.minYear ?? 5;
          const status = s.periodValuations?.[String(minYear)]?.dcf.status ?? s.valuationStatus;
          return status === 'PASS_WITH_MARGIN';
        }).length;
        setCounts((c) =>
          c
            ? {
                total: Math.max(0, c.total - removedCount),
                passed: Math.max(0, c.passed - removedPassed),
                margin: Math.max(0, c.margin - removedMargin),
              }
            : null,
        );
      }
      return next;
    });
  }, []);

  return {
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
    valuationStatus,
    setValuationStatus,
    sortField,
    setSortField,
    sortOrder,
    setSortOrder,
    toggleSortOrder,
    hasMore: stocks.length < total,
    loadMore,
    retry,
    resetFilters,
    updateStockMemoLocal,
    removeStocksLocal,
  };
}
