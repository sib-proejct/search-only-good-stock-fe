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
  passedStockCount: number;
  totalStockCount: number;
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
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [market, setMarket] = useState<MarketFilter>('ALL');
  const [coreStatus, setCoreStatus] = useState<CoreStatusFilter>('ALL');
  const [valuationStatus, setValuationStatus] = useState<ValuationStatusFilter>('ALL');
  const [sortField, setSortField] = useState<StockSort>('corePassCount');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [offset, setOffset] = useState(0);
  const limit = 50;

  // Passed stock count (for hero card statistic)
  const [passedStockCount, setPassedStockCount] = useState(0);

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset offset when filters change
  useEffect(() => {
    setOffset(0);
  }, [debouncedSearch, market, coreStatus, valuationStatus, sortField, sortOrder]);

  // Active abort controllers
  const abortControllerRef = useRef<AbortController | null>(null);
  const passCountAbortRef = useRef<AbortController | null>(null);

  // Fetch stocks function
  const fetchStocks = useCallback(
    async (isLoadMore: boolean = false) => {
      // Abort any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
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
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [debouncedSearch, market, coreStatus, valuationStatus, sortField, sortOrder, offset]
  );

  // Fetch passed stocks total count for current market/search condition
  const fetchPassedCount = useCallback(async () => {
    if (passCountAbortRef.current) {
      passCountAbortRef.current.abort();
    }
    const controller = new AbortController();
    passCountAbortRef.current = controller;

    try {
      const query: StockListQuery = {
        coreStatus: 'PASS',
        limit: 1,
        offset: 0,
      };
      if (debouncedSearch.trim()) {
        query.search = debouncedSearch.trim();
      }
      if (market !== 'ALL') {
        query.market = market;
      }
      const res = await stockApi.getStocks(query, controller.signal);
      setPassedStockCount(res.total);
    } catch {
      // ignore abort or stats error
    }
  }, [debouncedSearch, market]);

  // Initial & Filter Triggered Load
  useEffect(() => {
    fetchStocks(offset > 0);
  }, [fetchStocks, offset]);

  // Trigger passed count load
  useEffect(() => {
    fetchPassedCount();
  }, [fetchPassedCount]);

  const toggleSortOrder = useCallback(() => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  }, []);

  const loadMore = useCallback(() => {
    if (!loading && !loadingMore && stocks.length < total) {
      setOffset(stocks.length);
    }
  }, [loading, loadingMore, stocks.length, total]);

  const retry = useCallback(() => {
    fetchStocks(false);
    fetchPassedCount();
  }, [fetchStocks, fetchPassedCount]);

  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setDebouncedSearch('');
    setMarket('ALL');
    setCoreStatus('ALL');
    setValuationStatus('ALL');
    setSortField('corePassCount');
    setSortOrder('desc');
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
    totalStockCount: total,
    hasMore: stocks.length < total,
    loadMore,
    retry,
    resetFilters,
  };
}
