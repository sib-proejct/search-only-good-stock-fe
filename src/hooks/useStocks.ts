import { useState, useEffect, useMemo } from 'react';
import { Stock } from '../types/stock';
import { stockApi } from '../services/api';
import { useRuleEngine } from './useRuleEngine';

export type SortField = 'buffettScore' | 'avgRoe5Yr' | 'epsCagr5Yr' | 'marketCap' | 'oneDollar';
export type ViewMode = 'table' | 'grid';

export function useStocks() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('buffettScore');
  const [sortAsc, setSortAsc] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [expandedStockId, setExpandedStockId] = useState<string | null>('msft'); // 기본적으로 마이크로소프트 인라인 펼침

  const ruleEngine = useRuleEngine();

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await stockApi.getStocks();
      setStocks(data);
      setLoading(false);
    }
    load();
  }, []);

  // 검색 및 동적 규칙 평가를 반영한 필터링 & 정렬
  const filteredStocks = useMemo(() => {
    let result = stocks.map((stock) => {
      const evaluation = ruleEngine.evaluateStock(stock);
      return {
        ...stock,
        dynamicBuffettScore: evaluation.score,
        dynamicPassCount: evaluation.passedRuleCount,
        dynamicIsMasterPass: evaluation.passed,
        dynamicTotalRules: evaluation.totalActiveRules,
      };
    });

    // 1. 검색어 필터 (종목명 or 티커 or 업종)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.nameKo.toLowerCase().includes(q) ||
          s.ticker.toLowerCase().includes(q) ||
          s.sector.toLowerCase().includes(q)
      );
    }

    // 2. 정렬
    result.sort((a, b) => {
      let valA = 0;
      let valB = 0;

      switch (sortField) {
        case 'buffettScore':
          valA = a.dynamicBuffettScore;
          valB = b.dynamicBuffettScore;
          break;
        case 'avgRoe5Yr':
          valA = a.avgRoe5Yr;
          valB = b.avgRoe5Yr;
          break;
        case 'epsCagr5Yr':
          valA = a.epsCagr5Yr;
          valB = b.epsCagr5Yr;
          break;
        case 'marketCap':
          valA = a.marketCap;
          valB = b.marketCap;
          break;
        case 'oneDollar':
          valA = a.oneDollarTest.valueCreatedPerDollar;
          valB = b.oneDollarTest.valueCreatedPerDollar;
          break;
      }

      return sortAsc ? valA - valB : valB - valA;
    });

    return result;
  }, [stocks, searchQuery, sortField, sortAsc, ruleEngine]);

  const toggleExpand = (id: string) => {
    setExpandedStockId((prev) => (prev === id ? null : id));
  };

  return {
    stocks: filteredStocks,
    totalStockCount: stocks.length,
    passedStockCount: filteredStocks.filter((s) => s.dynamicIsMasterPass).length,
    loading,
    searchQuery,
    setSearchQuery,
    sortField,
    setSortField,
    sortAsc,
    setSortAsc,
    viewMode,
    setViewMode,
    expandedStockId,
    toggleExpand,
    ruleEngine,
  };
}
