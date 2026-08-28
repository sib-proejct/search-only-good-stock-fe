import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  RuleDefinitionDTO,
  StockDetailDTO,
  StockSummaryDTO,
  Market,
} from '../types/api';
import { stockApi } from '../services/api';
import { useAppConfig } from '../context/ThemeLanguageContext';
import { BuffettRuleDiagnosis } from '../components/detail/BuffettRuleDiagnosis';
import { DcfValuationCard } from '../components/detail/DcfValuationCard';
import { CapitalActionCard } from '../components/detail/CapitalActionCard';
import { MarketBenchmarkCard } from '../components/detail/MarketBenchmarkCard';
import { YearlyFinancialsTable } from '../components/detail/YearlyFinancialsTable';
import {
  ArrowLeft,
  ChevronDown,
  Check,
  Sparkles,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Search,
} from 'lucide-react';

interface StockDetailPageProps {
  stockId?: string;
  ticker?: string | null;
  onBack?: () => void;
  onSelectStock?: (ticker: string) => void;
}

export const StockDetailPage: React.FC<StockDetailPageProps> = ({
  stockId,
  ticker: propTicker,
  onBack,
  onSelectStock,
}) => {
  const { ticker: urlTicker } = useParams<{ ticker?: string }>();
  const navigate = useNavigate();
  const currentTicker = urlTicker || propTicker || stockId || 'SYN-PASS';
  const { t } = useAppConfig();

  const [detail, setDetail] = useState<StockDetailDTO | null>(null);
  const [rulesMap, setRulesMap] = useState<Map<string, RuleDefinitionDTO>>(new Map());
  const [stockList, setStockList] = useState<StockSummaryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [is404, setIs404] = useState(false);

  // Dropdown state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [marketFilter, setMarketFilter] = useState<'ALL' | Market>('ALL');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch stock detail & rules & stock list
  useEffect(() => {
    if (!currentTicker) {
      setLoading(false);
      setDetail(null);
      return;
    }

    const controller = new AbortController();
    const { signal } = controller;

    async function loadData() {
      setLoading(true);
      setError(null);
      setIs404(false);

      try {
        const [detailRes, rulesRes, listRes] = await Promise.allSettled([
          stockApi.getStockDetail(currentTicker!, signal),
          stockApi.getRules(signal),
          stockApi.getStocks({ limit: 100 }, signal),
        ]);

        if (signal.aborted) return;

        // 1. Process rules
        if (rulesRes.status === 'fulfilled') {
          const map = new Map<string, RuleDefinitionDTO>();
          rulesRes.value.items.forEach((r) => map.set(r.ruleId, r));
          setRulesMap(map);
        }

        // 2. Process stock list
        if (listRes.status === 'fulfilled') {
          setStockList(listRes.value.items);
        }

        // 3. Process stock detail
        if (detailRes.status === 'fulfilled') {
          setDetail(detailRes.value);
        } else {
          const reason = detailRes.reason;
          const errMsg = reason instanceof Error ? reason.message : String(reason);
          if (errMsg.includes('404') || errMsg.toLowerCase().includes('not found')) {
            setIs404(true);
          } else {
            setError(errMsg || t('fetchError'));
          }
        }
      } catch (err) {
        if (!signal.aborted) {
          const errMsg = err instanceof Error ? err.message : String(err);
          if (errMsg.includes('404') || errMsg.toLowerCase().includes('not found')) {
            setIs404(true);
          } else {
            setError(errMsg || t('fetchError'));
          }
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      controller.abort();
    };
  }, [currentTicker]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/');
    }
  };

  const handleSelectFromList = (targetTicker: string) => {
    setIsDropdownOpen(false);
    if (onSelectStock) {
      onSelectStock(targetTicker);
    }
    navigate(`/stock/${targetTicker}`);
  };

  const handleRetry = () => {
    if (currentTicker) {
      setLoading(true);
      setError(null);
      setIs404(false);
      stockApi
        .getStockDetail(currentTicker)
        .then((data) => {
          setDetail(data);
          setLoading(false);
        })
        .catch((err) => {
          const errMsg = err instanceof Error ? err.message : String(err);
          if (errMsg.includes('404') || errMsg.toLowerCase().includes('not found')) {
            setIs404(true);
          } else {
            setError(errMsg || t('fetchError'));
          }
          setLoading(false);
        });
    }
  };

  // Format price & market cap
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
      return `$${val.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 })}M`;
    }
    return `${val.toLocaleString()}억원`;
  };

  const formatPercent = (val: number | null) => {
    if (val === null || val === undefined) return '—';
    const pct = val * 100;
    return `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`;
  };

  // Dropdown filtering
  const filteredDropdownStocks = stockList.filter((s) => {
    if (marketFilter === 'ALL') return true;
    return s.market === marketFilter;
  });

  const currentIndex = stockList.findIndex(
    (s) => s.ticker.toUpperCase() === currentTicker?.toUpperCase()
  );

  // 1. Empty Prompt State (when no ticker selected)
  if (!currentTicker) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-20 text-center space-y-4 animate-fade-in">
        <div className="w-14 h-14 rounded-3xl bg-[#0071E3]/10 dark:bg-[#2997FF]/15 flex items-center justify-center mx-auto text-[#0071E3] dark:text-[#2997FF]">
          <Search className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
          {t('selectStockPrompt')}
        </h2>
        <p className="text-xs text-[#86868B] max-w-md mx-auto">
          {t('selectStockDesc')}
        </p>
        <div className="pt-2">
          <button
            onClick={handleBack}
            className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-[#0071E3] hover:bg-[#0077ED] dark:bg-[#2997FF] dark:hover:bg-[#0071E3] shadow-sm transition-all cursor-pointer"
          >
            {t('backToScreener')}
          </button>
        </div>
      </div>
    );
  }

  // 2. Loading State
  if (loading) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-24 text-center space-y-3 animate-fade-in">
        <div className="inline-block w-8 h-8 border-2 border-[#0071E3] dark:border-[#2997FF] border-t-transparent rounded-full animate-spin" />
        <p className="text-[#86868B] text-xs font-medium">
          {t('loadingStocks')}
        </p>
      </div>
    );
  }

  // 3. 404 Not Found State
  if (is404) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-20 text-center space-y-4 animate-fade-in">
        <div className="w-14 h-14 rounded-3xl bg-[#FF9500]/10 flex items-center justify-center mx-auto text-[#FF9500]">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
          {t('stockNotFound')} ({currentTicker})
        </h2>
        <p className="text-xs text-[#86868B] max-w-md mx-auto">
          {t('stockNotFoundDesc')}
        </p>
        <div className="pt-2 flex items-center justify-center gap-3">
          <button
            onClick={handleBack}
            className="px-5 py-2.5 rounded-full text-xs font-bold text-white bg-[#0071E3] hover:bg-[#0077ED] dark:bg-[#2997FF] dark:hover:bg-[#0071E3] transition-all cursor-pointer"
          >
            {t('backToScreener')}
          </button>
          <button
            onClick={() => handleSelectFromList('SYN-PASS')}
            className="px-5 py-2.5 rounded-full text-xs font-semibold bg-[#F5F5F7] dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#EBEBED] dark:hover:bg-[#2C2C2E] border border-black/[0.06] dark:border-white/[0.08] transition-all cursor-pointer"
          >
            {t('goodStockExample')}
          </button>
        </div>
      </div>
    );
  }

  // 4. General Error State
  if (error || !detail) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-20 text-center space-y-4 animate-fade-in">
        <div className="w-14 h-14 rounded-3xl bg-[#FF3B30]/10 flex items-center justify-center mx-auto text-[#FF3B30]">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
          {t('fetchError')}
        </h2>
        <p className="text-xs text-[#86868B] max-w-md mx-auto font-mono">
          {error || 'Unknown error occurred'}
        </p>
        <div className="pt-2 flex items-center justify-center gap-3">
          <button
            onClick={handleRetry}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold text-white bg-[#0071E3] hover:bg-[#0077ED] dark:bg-[#2997FF] transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('retry')}</span>
          </button>
          <button
            onClick={handleBack}
            className="px-5 py-2.5 rounded-full text-xs font-semibold bg-[#F5F5F7] dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#EBEBED] dark:hover:bg-[#2C2C2E] border border-black/[0.06] dark:border-white/[0.08] transition-all cursor-pointer"
          >
            {t('backToScreener')}
          </button>
        </div>
      </div>
    );
  }

  const isGoodStockSelected = detail.ticker === 'SYN-PASS';
  const isBadStockSelected = detail.ticker === 'SYN-FAIL';

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-5 sm:py-8 space-y-6 animate-fade-in">
      {/* 1. Sub Header: Back Button & Synthetic Fixture Quick Buttons & Stock Switcher Dropdown */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6E6E73] dark:text-[#86868B] hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors focus:outline-none cursor-pointer w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('backToScreener')}</span>
        </button>

        {/* Action Group: Example 1, Example 2, and Stock Selector Capsule */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Quick Example 1: SYN-PASS */}
          <button
            onClick={() => handleSelectFromList('SYN-PASS')}
            className={`h-8 px-3.5 rounded-full flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer select-none focus:outline-none ${
              isGoodStockSelected
                ? 'bg-[#34C759]/15 dark:bg-[#34C759]/25 text-[#34C759] border border-[#34C759]/40 shadow-xs'
                : 'bg-[#F5F5F7] dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#EBEBED] dark:hover:bg-[#2C2C2E] border border-black/[0.06] dark:border-white/[0.08]'
            }`}
            title="워런 버핏 규칙 7/7 전체 통과 대표 합성 우량주"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#34C759]" />
            <span>{t('goodStockExample')}</span>
          </button>

          {/* Quick Example 2: SYN-FAIL */}
          <button
            onClick={() => handleSelectFromList('SYN-FAIL')}
            className={`h-8 px-3.5 rounded-full flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer select-none focus:outline-none ${
              isBadStockSelected
                ? 'bg-[#FF3B30]/15 dark:bg-[#FF3B30]/25 text-[#FF3B30] border border-[#FF3B30]/40 shadow-xs'
                : 'bg-[#F5F5F7] dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#EBEBED] dark:hover:bg-[#2C2C2E] border border-black/[0.06] dark:border-white/[0.08]'
            }`}
            title="EPS 성장률 기준 미달 및 안전마진 불합격 예시"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-[#FF3B30]" />
            <span>{t('badStockExample')}</span>
          </button>

          {/* Stock Selector Capsule Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="h-8 px-3.5 rounded-full flex items-center gap-1.5 text-xs font-semibold bg-[#F5F5F7] dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#EBEBED] dark:hover:bg-[#2C2C2E] border border-black/[0.06] dark:border-white/[0.08] transition-all cursor-pointer select-none focus:outline-none"
              aria-expanded={isDropdownOpen}
              aria-haspopup="true"
            >
              <span className="text-[#86868B] font-mono tabular-nums">
                {currentIndex >= 0 ? `${currentIndex + 1}/${stockList.length}` : ''}
              </span>
              <span className="font-bold font-mono">{detail.ticker}</span>
              <span className="text-[#86868B]">·</span>
              <span className="font-normal text-[#6E6E73] dark:text-[#86868B] truncate max-w-[120px]">
                {detail.name}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#86868B] transition-transform duration-200 ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 sm:w-84 bg-white dark:bg-[#1C1C1E] rounded-2xl shadow-2xl border border-black/[0.08] dark:border-white/[0.12] p-2 z-50 animate-fade-in max-h-[420px] overflow-y-auto">
                {/* Market Switcher */}
                <div className="flex items-center gap-1 p-1 bg-[#F2F4F6] dark:bg-[#252528] rounded-xl mb-2">
                  {(['ALL', 'NASDAQ', 'NYSE', 'KOSPI', 'KOSDAQ'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMarketFilter(m)}
                      className={`flex-1 py-1 text-[10px] font-semibold rounded-lg transition-all cursor-pointer select-none text-center ${
                        marketFilter === m
                          ? 'bg-white dark:bg-[#1C1C1E] text-[#0071E3] dark:text-[#2997FF] shadow-xs font-bold'
                          : 'text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>

                {/* Stock List */}
                <div className="space-y-0.5">
                  {filteredDropdownStocks.map((s, idx) => {
                    const isCurrent = s.ticker.toUpperCase() === detail.ticker.toUpperCase();
                    return (
                      <button
                        key={s.id}
                        onClick={() => handleSelectFromList(s.ticker)}
                        className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between transition-colors cursor-pointer select-none ${
                          isCurrent
                            ? 'bg-[#F2F4F6] dark:bg-[#2C2C2E] text-[#0071E3] dark:text-[#2997FF] font-bold'
                            : 'text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#F9FAFB] dark:hover:bg-[#252528]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="font-mono text-xs text-[#86868B] w-4 shrink-0 tabular-nums">
                            {idx + 1}
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold font-mono text-xs text-[#1D1D1F] dark:text-[#F5F5F7]">
                                {s.ticker}
                              </span>
                              <span className="text-[10px] text-[#86868B] truncate">
                                {s.name}
                              </span>
                            </div>
                            <div className="text-[10px] text-[#86868B] mt-0.5">
                              <span className="font-mono tabular-nums">
                                {formatPrice(s.currentPrice, s.currency)}
                              </span>{' '}
                              · {s.market}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                              s.coreStatus === 'PASS'
                                ? 'bg-[#34C759]/15 text-[#34C759]'
                                : s.coreStatus === 'FAIL'
                                ? 'bg-[#FF3B30]/15 text-[#FF3B30]'
                                : 'bg-black/[0.06] text-[#86868B]'
                            }`}
                          >
                            {s.coreStatus}
                          </span>
                          {isCurrent && (
                            <Check className="w-3.5 h-3.5 text-[#0071E3] dark:text-[#2997FF] stroke-[2.5]" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Hero Section: Stock Identity & Status Badges & Price */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 sm:p-8 border border-black/[0.06] dark:border-white/[0.08] shadow-sm transition-colors duration-300">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Ticker, Name, Status & Tags */}
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                {detail.name}
              </h1>
              <span className="font-mono text-base font-semibold text-[#86868B]">
                {detail.ticker}
              </span>

              {/* Core Status Badge */}
              {detail.coreStatus === 'PASS' && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#34C759] bg-[#34C759]/10 dark:bg-[#34C759]/20 px-2.5 py-0.5 rounded-full border border-[#34C759]/20">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span className="font-mono tabular-nums">
                    {detail.corePassCount}P / {detail.coreFailCount}F / {detail.coreNaCount}NA
                  </span>
                  <span>{t('pass')}</span>
                </span>
              )}
              {detail.coreStatus === 'FAIL' && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FF3B30] bg-[#FF3B30]/10 dark:bg-[#FF3B30]/20 px-2.5 py-0.5 rounded-full border border-[#FF3B30]/20">
                  <XCircle className="w-3.5 h-3.5" />
                  <span className="font-mono tabular-nums">
                    {detail.corePassCount}P / {detail.coreFailCount}F / {detail.coreNaCount}NA
                  </span>
                  <span>{t('fail')}</span>
                </span>
              )}
              {detail.coreStatus === 'N/A' && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#86868B] bg-black/[0.04] dark:bg-white/[0.06] px-2.5 py-0.5 rounded-full border border-black/[0.06] dark:border-white/[0.08]">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span className="font-mono tabular-nums">
                    {detail.corePassCount}P / {detail.coreFailCount}F / {detail.coreNaCount}NA
                  </span>
                  <span>{t('na')}</span>
                </span>
              )}

              {/* Data As Of Date */}
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#86868B] bg-black/[0.04] dark:bg-white/[0.06] px-2.5 py-0.5 rounded-full">
                <Calendar className="w-3 h-3 text-[#86868B]" />
                <span>{detail.dataAsOf.slice(0, 10)}</span>
              </span>
            </div>

            <div className="text-xs sm:text-[13px] text-[#86868B] flex items-center gap-2 flex-wrap">
              <span>{detail.market}</span>
              <span>·</span>
              <span>{detail.sector}</span>
              <span>·</span>
              <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06]">
                {detail.industryType}
              </span>
              <span>·</span>
              <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06]">
                {detail.sourceName} ({detail.sourceType})
              </span>
            </div>
          </div>

          {/* Right: Price & Cap */}
          <div className="text-left sm:text-right shrink-0">
            <div className="text-2xl sm:text-3xl font-bold font-mono text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight tabular-nums">
              {formatPrice(detail.currentPrice, detail.currency)}
            </div>
            <div className="text-xs text-[#86868B] mt-1">
              {t('marketCapLabel')}:{' '}
              <span className="font-semibold font-mono tabular-nums text-[#1D1D1F] dark:text-[#F5F5F7]">
                {formatMarketCap(detail.marketCap, detail.currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Global Warnings Banner */}
        {detail.warnings && detail.warnings.length > 0 && (
          <div className="mt-5 p-3.5 rounded-2xl bg-[#FF9500]/10 border border-[#FF9500]/20 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#C93400] dark:text-[#FF9500]">
              <AlertTriangle className="w-4 h-4" />
              <span>종목 데이터 분석 경고 ({detail.warnings.length}건)</span>
            </div>
            {detail.warnings.map((w, idx) => (
              <p key={idx} className="text-xs text-[#86868B] leading-relaxed">
                • {w}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* 3. Refined Key KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: Core Status */}
        <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 sm:p-5 border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex flex-col justify-between">
          <span className="text-[11px] text-[#86868B] font-medium uppercase tracking-wider block">
            {t('coreStatusLabel')}
          </span>
          <div className="mt-2">
            <span
              className={`text-2xl sm:text-3xl font-bold font-mono tracking-tight tabular-nums block ${
                detail.coreStatus === 'PASS'
                  ? 'text-[#34C759]'
                  : detail.coreStatus === 'FAIL'
                  ? 'text-[#FF3B30]'
                  : 'text-[#86868B]'
              }`}
            >
              {detail.coreStatus}
            </span>
            <div className="text-[11px] text-[#86868B] mt-2 pt-2 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between font-mono">
              <span>{detail.corePassCount}P · {detail.coreFailCount}F · {detail.coreNaCount}NA</span>
              <span className="text-[10px] font-bold">CORE RULES</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Valuation Status */}
        <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 sm:p-5 border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex flex-col justify-between">
          <span className="text-[11px] text-[#86868B] font-medium uppercase tracking-wider block">
            {t('valuationStatusLabel')}
          </span>
          <div className="mt-2">
            <span className="text-lg sm:text-xl font-bold text-[#0071E3] dark:text-[#2997FF] tracking-tight block truncate">
              {detail.valuationStatus.replace(/_/g, ' ')}
            </span>
            <div className="text-[11px] text-[#86868B] mt-2 pt-2 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between">
              <span>Owner Earnings DCF</span>
              <span className="text-[10px] font-mono text-[#0071E3] dark:text-[#2997FF] font-semibold">
                {detail.valuationStatus}
              </span>
            </div>
          </div>
        </div>

        {/* KPI 3: Conservative Margin of Safety */}
        <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 sm:p-5 border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex flex-col justify-between">
          <span className="text-[11px] text-[#86868B] font-medium uppercase tracking-wider block">
            {t('marginOfSafety')}
          </span>
          <div className="mt-2">
            <span
              className={`text-2xl sm:text-3xl font-bold font-mono tracking-tight tabular-nums block ${
                detail.conservativeMarginOfSafety !== null && detail.conservativeMarginOfSafety >= 0.2
                  ? 'text-[#34C759]'
                  : detail.conservativeMarginOfSafety !== null && detail.conservativeMarginOfSafety >= 0
                  ? 'text-[#0071E3] dark:text-[#2997FF]'
                  : detail.conservativeMarginOfSafety !== null
                  ? 'text-[#FF3B30]'
                  : 'text-[#86868B]'
              }`}
            >
              {formatPercent(detail.conservativeMarginOfSafety)}
            </span>
            <div className="text-[11px] text-[#86868B] mt-2 pt-2 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between font-mono">
              <span>
                IV: {formatPrice(detail.conservativeIntrinsicValue, detail.currency)}
              </span>
              <span className="text-[10px] font-semibold">CONSERVATIVE</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Data Confidence */}
        <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 sm:p-5 border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex flex-col justify-between">
          <span className="text-[11px] text-[#86868B] font-medium uppercase tracking-wider block">
            {t('confidence')}
          </span>
          <div className="mt-2">
            <span
              className={`text-2xl sm:text-3xl font-bold font-mono tracking-tight block ${
                detail.confidence === 'HIGH'
                  ? 'text-[#34C759]'
                  : detail.confidence === 'MEDIUM'
                  ? 'text-[#FF9500]'
                  : 'text-[#86868B]'
              }`}
            >
              {detail.confidence}
            </span>
            <div className="text-[11px] text-[#86868B] mt-2 pt-2 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between">
              <span>품질 검증 등급</span>
              <span className="text-[10px] font-mono">GRADE</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Warren Buffett Rule Diagnosis (9 Rules Grid) */}
      <BuffettRuleDiagnosis
        evaluations={detail.ruleEvaluations}
        rulesMap={rulesMap}
        currency={detail.currency}
      />

      {/* 5. DCF Valuation Card & Capital Action Card Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-stretch">
        <DcfValuationCard
          dcf={detail.dcf}
          currency={detail.currency}
          currentPrice={detail.currentPrice}
        />
        <CapitalActionCard
          capitalAction={detail.capitalAction}
          currency={detail.currency}
        />
      </div>

      {/* 6. Market Snapshot & Benchmark Card */}
      <MarketBenchmarkCard
        currentMarket={detail.currentMarket}
        benchmarkPoints={detail.benchmarkPoints}
        quarterlyBookPrices={detail.quarterlyBookPrices}
        currency={detail.currency}
      />

      {/* 7. 5-Year Financial Statements Table */}
      <YearlyFinancialsTable
        financials={detail.annualFinancials}
        currency={detail.currency}
        industryType={detail.industryType}
      />
    </div>
  );
};
