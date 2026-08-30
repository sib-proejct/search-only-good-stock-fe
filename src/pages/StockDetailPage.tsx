import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  RuleDefinitionDTO,
  StockDetailDTO,
  StockSummaryDTO,
  Market,
} from '../types/api';
import { stockApi } from '../services/api';
import { useAppConfig } from '../context/ThemeLanguageContext';
import {
  getConfidenceInfo,
  getCoreGradeInfo,
  getIndustryTypeLabel,
  getValuationStatusInfo,
} from '../utils/ruleFormatters';
import { BuffettRuleDiagnosis } from '../components/detail/BuffettRuleDiagnosis';
import { DcfValuationCard } from '../components/detail/DcfValuationCard';
import { CapitalActionCard } from '../components/detail/CapitalActionCard';
import { MarketBenchmarkCard } from '../components/detail/MarketBenchmarkCard';
import { YearlyFinancialsTable } from '../components/detail/YearlyFinancialsTable';
import {
  ArrowLeft,
  ChevronDown,
  Check,
  AlertTriangle,
  Calendar,
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
  const [searchParams] = useSearchParams();
  const currentTicker = urlTicker || propTicker || stockId;
  const marketParam = searchParams.get('market');
  const currentMarket = (
    ['NASDAQ', 'NYSE', 'KOSPI', 'KOSDAQ'] as const
  ).find((market) => market === marketParam);
  const { t, language } = useAppConfig();

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
    const controller = new AbortController();
    const { signal } = controller;

    async function loadData() {
      setLoading(true);
      setError(null);
      setIs404(false);

      try {
        // If currentTicker is not provided (e.g. accessed via /stock directly), fetch stock list and auto-navigate to the first stock
        if (!currentTicker) {
          const listRes = await stockApi.getStocks({ limit: 100 }, signal);
          if (signal.aborted) return;
          if (listRes.items.length > 0) {
            const firstStock = listRes.items[0];
            navigate(
              `/stock/${firstStock.ticker}?market=${encodeURIComponent(firstStock.market)}`,
              { replace: true }
            );
            return;
          } else {
            setStockList([]);
            setLoading(false);
            return;
          }
        }

        const [detailRes, rulesRes, listRes] = await Promise.allSettled([
          stockApi.getStockDetail(currentTicker, signal, currentMarket),
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
  }, [currentTicker, currentMarket, navigate, t]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/');
    }
  };

  const handleSelectFromList = (stock: StockSummaryDTO) => {
    setIsDropdownOpen(false);
    if (onSelectStock) {
      onSelectStock(stock.ticker);
    }
    navigate(
      `/stock/${stock.ticker}?market=${encodeURIComponent(stock.market)}`
    );
  };

  const handleRetry = () => {
    if (currentTicker) {
      setLoading(true);
      setError(null);
      setIs404(false);
      stockApi
        .getStockDetail(currentTicker, undefined, currentMarket)
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
  const formatPrice = (val: number | string | null, curr: string) => {
    if (val === null || val === undefined) return '—';
    const num = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(num)) return '—';
    if (curr === 'USD') {
      return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `${Math.round(num).toLocaleString()}원`;
  };

  const formatMarketCap = (val: number | string | null, curr: string) => {
    if (val === null || val === undefined) return '—';
    const num = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(num)) return '—';
    if (curr === 'USD') {
      if (num >= 1_000_000_000_000) return `$${(num / 1_000_000_000_000).toFixed(1)}T`;
      if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(1)}B`;
      if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`;
      return `$${num.toLocaleString()}`;
    }
    if (num >= 1_000_000_000_000) return `${(num / 1_000_000_000_000).toFixed(1)}조원`;
    if (num >= 100_000_000) return `${(num / 100_000_000).toFixed(1)}억원`;
    return `${num.toLocaleString()}원`;
  };

  const formatPercent = (val: number | string | null) => {
    if (val === null || val === undefined) return '—';
    const num = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(num)) return '—';
    const pct = num * 100;
    return `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`;
  };

  // Dropdown filtering
  const filteredDropdownStocks = stockList.filter((s) => {
    if (marketFilter === 'ALL') return true;
    return s.market === marketFilter;
  });

  const currentIndex = stockList.findIndex(
    (s) =>
      s.ticker.toUpperCase() === currentTicker?.toUpperCase() &&
      (!currentMarket || s.market === currentMarket)
  );

  // 1. Empty Prompt State (when no ticker selected)
  if (!currentTicker) {
    return (
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-20 text-center space-y-4 animate-fade-in">
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
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-24 text-center space-y-3 animate-fade-in">
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
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-20 text-center space-y-4 animate-fade-in">
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
        </div>
      </div>
    );
  }

  // 4. General Error State
  if (error || !detail) {
    return (
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-20 text-center space-y-4 animate-fade-in">
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

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-5 sm:py-8 space-y-6 animate-fade-in">
      {/* 1. Sub Header: Back Button & Stock Switcher Dropdown */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6E6E73] dark:text-[#86868B] hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors focus:outline-none cursor-pointer w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('backToScreener')}</span>
        </button>

        {/* Stock Selector Capsule */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
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
                className={`w-3.5 h-3.5 text-[#86868B] transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''
                  }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 sm:w-[21rem] bg-white dark:bg-[#1C1C1E] rounded-2xl shadow-2xl border border-black/[0.08] dark:border-white/[0.12] p-2 z-50 animate-fade-in max-h-[420px] overflow-y-auto">
                {/* Market Switcher */}
                <div className="flex items-center gap-1 p-1 bg-[#F2F4F6] dark:bg-[#252528] rounded-xl mb-2">
                  {(['ALL', 'NASDAQ', 'NYSE', 'KOSPI', 'KOSDAQ'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMarketFilter(m)}
                      className={`flex-1 py-1 text-[10px] font-semibold rounded-lg transition-all cursor-pointer select-none text-center ${marketFilter === m
                        ? 'bg-white dark:bg-[#1C1C1E] text-[#0071E3] dark:text-[#2997FF] shadow-sm font-bold'
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
                    const isCurrent =
                      s.ticker.toUpperCase() === detail.ticker.toUpperCase() &&
                      s.market === detail.market;
                    return (
                      <button
                        key={s.id}
                        onClick={() => handleSelectFromList(s)}
                        className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between transition-colors cursor-pointer select-none ${isCurrent
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
                          {(() => {
                            const gradeInfo = getCoreGradeInfo(s.corePassCount, s.coreStatus, language);
                            return (
                              <span
                                className={`text-[10px] font-mono font-bold ${gradeInfo.textClass}`}
                              >
                                {gradeInfo.badgeLabel}
                              </span>
                            );
                          })()}
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

              {/* Data As Of Date */}
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#86868B]">
                <Calendar className="w-3 h-3 text-[#86868B]" />
                <span>{detail.dataAsOf.slice(0, 10)}</span>
              </span>
              {detail.isStale && (
                <span
                  className="inline-flex items-center text-[10px] font-bold text-[#FF9500]"
                  title={`Last successful: ${detail.lastSuccessfulAt}`}
                >
                  STALE
                </span>
              )}
            </div>

            <div className="text-xs sm:text-[13px] text-[#86868B] flex items-center gap-2 flex-wrap">
              <span>{detail.market}</span>
              <span>·</span>
              <span>{detail.sector}</span>
              <span>·</span>
              <span className="font-mono text-[11px]">
                {getIndustryTypeLabel(detail.industryType, language)}
              </span>
            </div>
          </div>

          {/* Right: Price & Intrinsic Value */}
          <div className="flex flex-wrap sm:flex-nowrap items-start sm:items-center gap-5 sm:gap-7 shrink-0">
            {/* Current Price */}
            <div className="text-left sm:text-right">
              <span className="text-[11px] font-medium text-[#86868B] uppercase tracking-wider block mb-0.5">
                {t('price')}
              </span>
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

            {/* Divider */}
            <div className="hidden sm:block w-px h-10 bg-black/[0.08] dark:bg-white/[0.1] self-center" />

            {/* Conservative Intrinsic Value */}
            <div className="text-left sm:text-right">
              <span className="text-[11px] font-semibold text-[#0071E3] dark:text-[#2997FF] uppercase tracking-wider block mb-0.5">
                {t('intrinsicValue')}
              </span>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-[#0071E3] dark:text-[#2997FF] tracking-tight tabular-nums">
                {formatPrice(detail.conservativeIntrinsicValue, detail.currency)}
              </div>
              <div className="text-xs text-[#86868B] mt-1">
                <span>{language === 'ko' ? '보수적 DCF 추정' : 'Conservative DCF'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Warnings Banner */}
        {detail.warnings && detail.warnings.length > 0 && (
          <div className="mt-5 p-3.5 rounded-2xl bg-[#FF9500]/10 border border-[#FF9500]/20 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#C93400] dark:text-[#FF9500]">
              <AlertTriangle className="w-4 h-4" />
              <span>
                {language === 'ko'
                  ? `종목 데이터 분석 경고 (${detail.warnings.length}건)`
                  : `Data Analysis Warnings (${detail.warnings.length})`}
              </span>
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
        {(() => {
          const gradeInfo = getCoreGradeInfo(detail.corePassCount, detail.coreStatus, language);
          return (
            <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 sm:p-5 border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex flex-col justify-between">
              <span className="text-[11px] text-[#86868B] font-medium uppercase tracking-wider block">
                {t('coreStatusLabel')}
              </span>
              <div className="mt-2">
                <span
                  className={`text-2xl sm:text-3xl font-bold tracking-tight block ${gradeInfo.textClass}`}
                  title={gradeInfo.desc}
                >
                  {gradeInfo.label}
                </span>
                <div className="text-[11px] text-[#86868B] mt-2 pt-2 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between font-mono">
                  <span>{detail.corePassCount} PASS · {detail.coreFailCount} FAIL · {detail.coreNaCount} NA</span>
                  <span className="text-[10px] font-bold">
                    {language === 'ko' ? '핵심 7원칙' : 'CORE RULES'}
                  </span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* KPI 2: Valuation Status */}
        {(() => {
          const valInfo = getValuationStatusInfo(detail.valuationStatus, language);
          return (
            <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 sm:p-5 border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex flex-col justify-between">
              <span className="text-[11px] text-[#86868B] font-medium uppercase tracking-wider block">
                {t('valuationStatusLabel')}
              </span>
              <div className="mt-2">
                <span className="text-base sm:text-lg font-bold text-[#0071E3] dark:text-[#2997FF] tracking-tight block truncate" title={valInfo.label}>
                  {valInfo.label}
                </span>
                <div className="text-[11px] text-[#86868B] mt-2 pt-2 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between">
                  <span>Owner Earnings DCF</span>
                  <span className="text-[10px] font-mono text-[#0071E3] dark:text-[#2997FF] font-semibold">
                    {detail.valuationStatus}
                  </span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* KPI 3: Conservative Margin of Safety */}
        <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 sm:p-5 border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex flex-col justify-between">
          <span className="text-[11px] text-[#86868B] font-medium uppercase tracking-wider block">
            {t('marginOfSafety')}
          </span>
          <div className="mt-2">
            <span
              className={`text-2xl sm:text-3xl font-bold font-mono tracking-tight tabular-nums block ${detail.conservativeMarginOfSafety !== null && detail.conservativeMarginOfSafety >= 0.2
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
              <span className="truncate max-w-[140px]" title={`IV: ${formatPrice(detail.conservativeIntrinsicValue, detail.currency)}`}>
                IV: {formatPrice(detail.conservativeIntrinsicValue, detail.currency)}
              </span>
              <span className="text-[10px] font-semibold">
                {language === 'ko' ? '보수적 DCF' : 'CONSERVATIVE'}
              </span>
            </div>
          </div>
        </div>

        {/* KPI 4: Data Confidence */}
        {(() => {
          const confInfo = getConfidenceInfo(detail.confidence, language);
          return (
            <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 sm:p-5 border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex flex-col justify-between">
              <span className="text-[11px] text-[#86868B] font-medium uppercase tracking-wider block">
                {t('confidence')}
              </span>
              <div className="mt-2">
                <span
                  className={`text-xl sm:text-2xl font-bold tracking-tight block ${detail.confidence === 'HIGH'
                    ? 'text-[#34C759]'
                    : detail.confidence === 'MEDIUM'
                      ? 'text-[#FF9500]'
                      : 'text-[#86868B]'
                    }`}
                >
                  {confInfo.label}
                </span>
                <div className="text-[11px] text-[#86868B] mt-2 pt-2 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between">
                  <span className="truncate max-w-[140px]">{confInfo.desc}</span>
                  <span className="text-[10px] font-mono font-semibold">{detail.confidence}</span>
                </div>
              </div>
            </div>
          );
        })()}
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
