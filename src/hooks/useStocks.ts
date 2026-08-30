import { useState, useEffect, useCallback, useRef } from 'react';
import {
  StockSummaryDTO,
  StockListQuery,
  Market,
  CoreStatus,
  ValuationStatus,
  StockSort,
  SortOrder,
} from '../types/api';
import { stockApi } from '../services/api';

export type MarketFilter = Market | 'ALL';
export type CoreStatusFilter = CoreStatus | 'ALL';
export type ValuationStatusFilter = ValuationStatus | 'ALL';

export interface UseStocksReturn {
  stocks: StockSummaryDTO[];
  total: number;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  market: MarketFilter;
  setMarket: (market: MarketFilter) => void;
  coreStatus: CoreStatusFilter;
  setCoreStatus: (status: CoreStatusFilter) => void;
  valuationStatus: ValuationStatusFilter;
  setValuationStatus: (status: ValuationStatusFilter) => void;
  sortField: StockSort;
  setSortField: (field: StockSort) => void;
  sortOrder: SortOrder;
  setSortOrder: (order: SortOrder) => void;
  toggleSortOrder: () => void;
  passedStockCount: number | null;
  totalStockCount: number | null;
  hasMore: boolean;
  loadMore: () => void;
  retry: () => void;
  resetFilters: () => void;
}

export function useStocks(): UseStocksReturn {
  const [stocks, setStocks] = useState<StockSummaryDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter & Query States
  const [searchQuery, setSearchQueryState] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [market, setMarketState] = useState<MarketFilter>('ALL');
  const [coreStatus, setCoreStatusState] = useState<CoreStatusFilter>('ALL');
  const [valuationStatus, setValuationStatusState] =
    useState<ValuationStatusFilter>('ALL');
  const [sortField, setSortFieldState] =
    useState<StockSort>('corePassCount');
  const [sortOrder, setSortOrderState] = useState<SortOrder>('desc');
  const [offset, setOffset] = useState(0);
  const limit = 50;

  // Market/search-wide statistics shown in the hero card.
  const [passedStockCount, setPassedStockCount] = useState<number | null>(null);
  const [totalStockCount, setTotalStockCount] = useState<number | null>(null);

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

  const setMarket = useCallback((nextMarket: MarketFilter) => {
    setMarketState(nextMarket);
    setOffset(0);
  }, []);

  const setCoreStatus = useCallback((nextStatus: CoreStatusFilter) => {
    setCoreStatusState(nextStatus);
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
  const statsAbortRef = useRef<AbortController | null>(null);

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
          limit,
          offset: isLoadMore ? offset : 0,
        };

        if (debouncedSearch.trim()) {
          query.search = debouncedSearch.trim();
        }
        if (market !== 'ALL') {
          query.market = market;
        }
        if (coreStatus !== 'ALL') {
          query.coreStatus = coreStatus;
        }
        if (valuationStatus !== 'ALL') {
          query.valuationStatus = valuationStatus;
        }
        if (sortField) {
          query.sort = sortField;
          query.order = sortOrder;
        }

        const response = await stockApi.getStocks(query, controller.signal);
        if (requestId !== requestIdRef.current) return;

        if (isLoadMore) {
          setStocks((prev) => [...prev, ...response.items]);
        } else {
          setStocks(response.items);
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
    [debouncedSearch, market, coreStatus, valuationStatus, sortField, sortOrder, offset]
  );

  // Fetch numerator and denominator from the same market/search population.
  const fetchMarketStats = useCallback(async () => {
    statsAbortRef.current?.abort();
    const controller = new AbortController();
    statsAbortRef.current = controller;
    setTotalStockCount(null);
    setPassedStockCount(null);

    const baseQuery: StockListQuery = { limit: 1, offset: 0 };
    if (debouncedSearch.trim()) {
      baseQuery.search = debouncedSearch.trim();
    }
    if (market !== 'ALL') {
      baseQuery.market = market;
    }

    try {
      const [allResponse, passedResponse] = await Promise.all([
        stockApi.getStocks(baseQuery, controller.signal),
        stockApi.getStocks(
          { ...baseQuery, coreStatus: 'PASS' },
          controller.signal
        ),
      ]);
      if (statsAbortRef.current !== controller) return;
      setTotalStockCount(allResponse.total);
      setPassedStockCount(passedResponse.total);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      if (statsAbortRef.current !== controller) return;
      setTotalStockCount(null);
      setPassedStockCount(null);
    } finally {
      if (statsAbortRef.current === controller) {
        statsAbortRef.current = null;
      }
    }
  }, [debouncedSearch, market]);

  // Initial & Filter Triggered Load
  useEffect(() => {
    fetchStocks(offset > 0);
  }, [fetchStocks, offset]);

  // Trigger market-wide statistics load
  useEffect(() => {
    fetchMarketStats();
  }, [fetchMarketStats]);

  useEffect(
    () => () => {
      requestIdRef.current += 1;
      abortControllerRef.current?.abort();
      statsAbortRef.current?.abort();
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
    fetchMarketStats();
  }, [fetchStocks, fetchMarketStats, offset]);

  const resetFilters = useCallback(() => {
    setSearchQueryState('');
    setDebouncedSearch('');
    setMarketState('ALL');
    setCoreStatusState('ALL');
    setValuationStatusState('ALL');
    setSortFieldState('corePassCount');
    setSortOrderState('desc');
    setOffset(0);
  }, []);

  return {
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
    setSortOrder,
    toggleSortOrder,
    passedStockCount,
    totalStockCount,
    hasMore: stocks.length < total,
    loadMore,
    retry,
    resetFilters,
  };
}
