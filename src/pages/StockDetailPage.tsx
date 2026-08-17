import React, { useState, useEffect, useRef } from 'react';
import { Stock } from '../types/stock';
import { stockApi } from '../services/api';
import { MOCK_STOCKS } from '../services/mockData';
import { useAppConfig } from '../context/ThemeLanguageContext';
import { Buffett6RuleDiagnosis } from '../components/detail/Buffett6RuleDiagnosis';
import { DcfIntrinsicValueCard } from '../components/detail/DcfIntrinsicValueCard';
import { OneDollarRetainedCard } from '../components/detail/OneDollarRetainedCard';
import { CapitalAllocationCookCard } from '../components/detail/CapitalAllocationCookCard';
import { CompanyProfileCard } from '../components/detail/CompanyProfileCard';
import { YearlyFinancialsTable } from '../components/detail/YearlyFinancialsTable';
import { ArrowLeft, ChevronDown, Check } from 'lucide-react';

interface StockDetailPageProps {
  stockId: string;
  onBack: () => void;
  onSelectStock?: (stockId: string) => void;
}

export const StockDetailPage: React.FC<StockDetailPageProps> = ({
  stockId,
  onBack,
  onSelectStock,
}) => {
  const { t, language } = useAppConfig();
  const [stock, setStock] = useState<Stock | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [marketFilter, setMarketFilter] = useState<'ALL' | 'US' | 'KR'>('ALL');
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

  const currentIndex = MOCK_STOCKS.findIndex((s) => s.id === stockId || s.ticker.toLowerCase() === stockId.toLowerCase());

  const handleSelectFromList = (targetId: string) => {
    if (onSelectStock) {
      onSelectStock(targetId);
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await stockApi.getStockDetail(stockId);
      setStock(data);
      setLoading(false);
    }
    load();
  }, [stockId]);

  if (loading || !stock) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-24 text-center">
        <div className="inline-block w-8 h-8 border-2 border-[#0071E3] dark:border-[#2997FF] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-[#86868B] text-xs font-medium">
          Loading Stock Analysis...
        </p>
      </div>
    );
  }

  const isPricePositive = stock.priceChangePct >= 0;
  const companyName = language === 'ko' ? stock.nameKo : stock.nameEn;
  const subtitleName = language === 'ko' ? stock.nameEn : stock.nameKo;

  // SVG Sparkline calculation
  const sparkPoints = stock.sparkline5Yr;
  const minPrice = Math.min(...sparkPoints);
  const maxPrice = Math.max(...sparkPoints);
  const sparkSvgPath = sparkPoints
    .map((val, idx) => {
      const x = (idx / (sparkPoints.length - 1)) * 140;
      const y = 38 - ((val - minPrice) / (maxPrice - minPrice || 1)) * 30;
      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  const filteredDropdownStocks = MOCK_STOCKS.filter((s) => {
    if (marketFilter === 'ALL') return true;
    if (marketFilter === 'US') return s.market === 'NASDAQ' || s.market === 'NYSE' || s.currency === 'USD';
    if (marketFilter === 'KR') return s.market === 'KOSPI' || s.market === 'KOSDAQ' || s.currency === 'KRW';
    return true;
  });

  const usCount = MOCK_STOCKS.filter((s) => s.market === 'NASDAQ' || s.market === 'NYSE' || s.currency === 'USD').length;
  const krCount = MOCK_STOCKS.filter((s) => s.market === 'KOSPI' || s.market === 'KOSDAQ' || s.currency === 'KRW').length;

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-5 sm:py-8 space-y-6 animate-fade-in">
      
      {/* 1. Sub Header: Back Button & Stock Dropdown Selector */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#6E6E73] dark:text-[#86868B] hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors focus:outline-none cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t('backToScreener')}</span>
        </button>

        {/* Stock Selector Capsule Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="h-8 px-3.5 rounded-full flex items-center gap-1.5 text-xs font-semibold bg-[#F5F5F7] dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#EBEBED] dark:hover:bg-[#2C2C2E] border border-black/[0.06] dark:border-white/[0.08] transition-all cursor-pointer select-none focus:outline-none"
            aria-expanded={isDropdownOpen}
            aria-haspopup="true"
          >
            <span className="text-[#86868B] font-mono tabular-nums">{currentIndex >= 0 ? `${currentIndex + 1}/${MOCK_STOCKS.length}` : ''}</span>
            <span className="font-bold font-mono">{stock.ticker}</span>
            <span className="text-[#86868B]">·</span>
            <span className="font-normal text-[#6E6E73] dark:text-[#86868B]">{companyName}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-[#86868B] transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Stock List Popover Dropdown Menu with US / KR Tabs */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 sm:w-84 bg-white dark:bg-[#1C1C1E] rounded-2xl shadow-2xl border border-black/[0.08] dark:border-white/[0.12] p-2 z-50 animate-fade-in max-h-[420px] overflow-y-auto">
              
              {/* Market Segmented Switcher (전체 / 미국 / 한국) */}
              <div className="flex items-center gap-1 p-1 bg-[#F2F4F6] dark:bg-[#252528] rounded-xl mb-2">
                <button
                  onClick={() => setMarketFilter('ALL')}
                  className={`flex-1 py-1 text-[11px] font-semibold rounded-lg transition-all cursor-pointer select-none text-center ${
                    marketFilter === 'ALL'
                      ? 'bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-[#F5F5F7] shadow-xs'
                      : 'text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
                  }`}
                >
                  {t('allMarkets')} ({MOCK_STOCKS.length})
                </button>
                <button
                  onClick={() => setMarketFilter('US')}
                  className={`flex-1 py-1 text-[11px] font-semibold rounded-lg transition-all cursor-pointer select-none text-center ${
                    marketFilter === 'US'
                      ? 'bg-white dark:bg-[#1C1C1E] text-[#0071E3] dark:text-[#2997FF] shadow-xs font-bold'
                      : 'text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
                  }`}
                >
                  {t('usStocks')} ({usCount})
                </button>
                <button
                  onClick={() => setMarketFilter('KR')}
                  className={`flex-1 py-1 text-[11px] font-semibold rounded-lg transition-all cursor-pointer select-none text-center ${
                    marketFilter === 'KR'
                      ? 'bg-white dark:bg-[#1C1C1E] text-[#0071E3] dark:text-[#2997FF] shadow-xs font-bold'
                      : 'text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
                  }`}
                >
                  {t('krStocks')} ({krCount})
                </button>
              </div>

              {/* Stock List */}
              <div className="space-y-0.5">
                {filteredDropdownStocks.map((s, idx) => {
                  const isCurrent = s.id === stockId || s.ticker.toLowerCase() === stockId.toLowerCase();
                  const itemCompanyName = language === 'ko' ? s.nameKo : s.nameEn;

                  return (
                    <button
                      key={s.id}
                      onClick={() => handleSelectFromList(s.id)}
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
                              {itemCompanyName}
                            </span>
                          </div>
                          <div className="text-[10px] text-[#86868B] mt-0.5">
                            <span className="font-mono tabular-nums">{s.currency === 'USD' ? `$${s.currentPrice.toFixed(2)}` : `${s.currentPrice.toLocaleString()}원`}</span> · {s.market}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.isMasterPass ? 'bg-[#34C759]' : 'bg-[#86868B]'}`} />
                        <span className={`text-[11px] font-mono font-bold tabular-nums ${
                          s.isMasterPass ? 'text-[#34C759]' : 'text-[#86868B]'
                        }`}>
                          {s.passCount}/6
                        </span>
                        {isCurrent && <Check className="w-3.5 h-3.5 text-[#0071E3] dark:text-[#2997FF] stroke-[2.5]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Hero Section: Stock Identity & Real-time Quote */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 sm:p-8 border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6 transition-colors duration-300">
        
        {/* Left: Ticker & Names & Tags */}
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
              {companyName}
            </h1>
            <span className="font-mono text-base font-semibold text-[#86868B]">
              {stock.ticker}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#34C759]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34C759]" />
              <span className="font-mono tabular-nums">{stock.passCount}/6</span>
              <span>{t('masterPass') || '버핏 올패스'}</span>
            </span>
          </div>

          <div className="text-xs sm:text-[13px] text-[#86868B] flex items-center gap-2 flex-wrap">
            <span>{subtitleName}</span>
            <span>·</span>
            <span>{stock.market}</span>
            <span>·</span>
            <span>{stock.sector}</span>
          </div>
        </div>

        {/* Right: Price & Sparkline & Market Cap */}
        <div className="flex items-center gap-6 self-start lg:self-center">
          {/* 5-Year Mini Sparkline Trend */}
          <div className="hidden sm:block text-right">
            <span className="text-[10px] text-[#86868B] block mb-1">5Y Price Trend</span>
            <svg className="w-36 h-10 overflow-visible" viewBox="0 0 140 40">
              <path
                d={sparkSvgPath}
                fill="none"
                stroke={isPricePositive ? '#34C759' : '#FF3B30'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Price & Cap */}
          <div className="text-right">
            <div className="flex items-baseline justify-end gap-2">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight tabular-nums">
                {stock.currency === 'USD' ? `$${stock.currentPrice.toFixed(2)}` : `${stock.currentPrice.toLocaleString()}원`}
              </span>
              <span className={`text-sm font-mono font-bold tabular-nums ${
                isPricePositive ? 'text-[#34C759]' : 'text-[#FF3B30]'
              }`}>
                {isPricePositive ? `+${stock.priceChangePct.toFixed(2)}%` : `${stock.priceChangePct.toFixed(2)}%`}
              </span>
            </div>

            <div className="text-xs text-[#86868B] mt-1">
              {t('marketCapLabel')}: <span className="font-semibold font-mono tabular-nums text-[#1D1D1F] dark:text-[#F5F5F7]">{stock.marketCapFormatted}</span>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Refined Key KPI Strip (Apple Minimal Typography Stats) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 sm:p-5 border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex flex-col justify-between">
          <span className="text-[11px] text-[#86868B] font-medium uppercase tracking-wider block">5Y Avg ROE</span>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-[#34C759] tracking-tight tabular-nums block">
              {stock.avgRoe5Yr.toFixed(1)}%
            </span>
            <div className="text-[11px] text-[#86868B] mt-2 pt-2 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between">
              <span>기준 &gt; <span className="font-mono tabular-nums">15%</span></span>
              <span className="text-[#34C759] font-medium font-mono text-[10px]">PASS</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 sm:p-5 border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex flex-col justify-between">
          <span className="text-[11px] text-[#86868B] font-medium uppercase tracking-wider block">5Y Avg ROIC</span>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-[#0071E3] dark:text-[#2997FF] tracking-tight tabular-nums block">
              {stock.avgRoic5Yr.toFixed(1)}%
            </span>
            <div className="text-[11px] text-[#86868B] mt-2 pt-2 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between">
              <span>기준 &gt; <span className="font-mono tabular-nums">10%</span></span>
              <span className="text-[#0071E3] dark:text-[#2997FF] font-medium font-mono text-[10px]">PASS</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 sm:p-5 border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex flex-col justify-between">
          <span className="text-[11px] text-[#86868B] font-medium uppercase tracking-wider block">5Y EPS CAGR</span>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight tabular-nums block">
              {stock.epsCagr5Yr >= 0 ? `+${stock.epsCagr5Yr.toFixed(1)}%` : `${stock.epsCagr5Yr.toFixed(1)}%`}
            </span>
            <div className="text-[11px] text-[#86868B] mt-2 pt-2 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between">
              <span>10Y 복리성장</span>
              <span className="text-[#34C759] font-medium font-mono text-[10px]">PASS</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 sm:p-5 border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex flex-col justify-between">
          <span className="text-[11px] text-[#86868B] font-medium uppercase tracking-wider block">{t('debtRatio')} (D/E)</span>
          <div className="mt-2">
            <span className={`text-2xl sm:text-3xl font-bold font-mono tracking-tight tabular-nums block ${
              stock.debtToEquity <= 80 ? 'text-[#34C759]' : 'text-[#FF9500]'
            }`}>
              {stock.debtToEquity.toFixed(0)}%
            </span>
            <div className="text-[11px] text-[#86868B] mt-2 pt-2 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between">
              <span>무차입 안전</span>
              <span className="text-[#34C759] font-medium font-mono text-[10px]">PASS</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Row 1: Symmetrical 2-Column Bento Grid (Buffett 6-Rule & DCF Valuation) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-stretch">
        <Buffett6RuleDiagnosis stock={stock} />
        <DcfIntrinsicValueCard currentPrice={stock.currentPrice} currency={stock.currency} />
      </div>

      {/* 5. Row 2: Symmetrical 2-Column Bento Grid ($1 Retained Test & Capital Allocation) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-stretch">
        <OneDollarRetainedCard testResult={stock.oneDollarTest} />
        <CapitalAllocationCookCard governance={stock.governance} />
      </div>

      {/* 6. Row 3: Company Profile & Key Statistics (Apple Stocks Style) */}
      <CompanyProfileCard stock={stock} />

      {/* 7. Row 4: 5-Year Financial Statements Trend Table */}
      <YearlyFinancialsTable stock={stock} />

    </div>
  );
};
