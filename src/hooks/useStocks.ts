import { useState, useEffect, useCallback, useRef } from 'react';
import {
  StockSummaryDTO,
  StockListQuery,
  Market,
  CoreGradeFilter,
  ValuationStatus,
  StockSort,
  SortOrder,
} from '../types/api';
import { stockApi } from '../services/api';

export type MarketFilter = Market | 'ALL';
export type CoreGradeFilterOption = CoreGradeFilter | 'ALL';
export type ValuationStatusFilter = ValuationStatus | 'ALL';

export interface UseStocksReturn {
  years: number;
  setYears: (years: number) => void;
  stocks: StockSummaryDTO[];
  total: number;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  market: MarketFilter;
  setMarket: (market: MarketFilter) => void;
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
}

export function useStocks(): UseStocksReturn {
  const [years, setYearsState] = useState(5);
  const setYears = useCallback((value: number) => { setYearsState(value); setOffset(0); }, []);
  const [stocks, setStocks] = useState<StockSummaryDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter & Query States
  const [searchQuery, setSearchQueryState] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [market, setMarketState] = useState<MarketFilter>('ALL');
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

  const setMarket = useCallback((nextMarket: MarketFilter) => {
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
          years,
          limit,
          offset: isLoadMore ? offset : 0,
        };

        if (debouncedSearch.trim()) {
          query.search = debouncedSearch.trim();
        }
        if (market !== 'ALL') {
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
    [
      years,
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
    setMarketState('ALL');
    setCoreGradeFilterState('ALL');
    setValuationStatusState('ALL');
    setYearsState(5);
    setSortFieldState('marketCap');
    setSortOrderState('desc');
    setOffset(0);
  }, []);

  return {
    years, setYears,
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
  };
}
