import React, { useState } from 'react';
import {
  BenchmarkPointDTO,
  Currency,
  CurrentMarketDTO,
  QuarterlyBookPriceDTO,
} from '../../types/api';
import { useAppConfig } from '../../context/ThemeLanguageContext';
import { Landmark, ChevronDown, Calendar } from 'lucide-react';

interface MarketBenchmarkCardProps {
  currentMarket: CurrentMarketDTO;
  benchmarkPoints: BenchmarkPointDTO[];
  quarterlyBookPrices: QuarterlyBookPriceDTO[];
  currency: Currency;
}

export const MarketBenchmarkCard: React.FC<MarketBenchmarkCardProps> = ({
  currentMarket,
  benchmarkPoints,
  quarterlyBookPrices,
  currency,
}) => {
  const { language } = useAppConfig();
  const [showQuarterly, setShowQuarterly] = useState(false);

  const formatPrice = (val: number | string | null): string => {
    if (val === null || val === undefined) return '—';
    const num = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(num)) return '—';
    if (currency === 'USD') {
      return `$${num.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
    return `${Math.round(num).toLocaleString()}원`;
  };

  const formatMarketCap = (val: number | string | null): string => {
    if (val === null || val === undefined) return '—';
    const num = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(num)) return '—';
    if (currency === 'USD') {
      if (num >= 1_000_000_000_000) return `$${(num / 1_000_000_000_000).toFixed(1)}T`;
      if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(1)}B`;
      if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`;
      return `$${num.toLocaleString()}`;
    }
    if (num >= 1_000_000_000_000) return `${(num / 1_000_000_000_000).toFixed(1)}조원`;
    if (num >= 100_000_000) return `${(num / 100_000_000).toFixed(1)}억원`;
    return `${num.toLocaleString()}원`;
  };

  const dilutedSharesNum = currentMarket.dilutedShares !== null && currentMarket.dilutedShares !== undefined
    ? Number(currentMarket.dilutedShares)
    : null;
  const formattedDilutedShares = dilutedSharesNum === null || isNaN(dilutedSharesNum)
    ? '—'
    : dilutedSharesNum >= 1_000_000_000
    ? `${(dilutedSharesNum / 1_000_000_000).toFixed(2)}B`
    : dilutedSharesNum >= 1_000_000
    ? `${(dilutedSharesNum / 1_000_000).toFixed(2)}M`
    : dilutedSharesNum.toLocaleString();
  const riskFreeRateNum = currentMarket.riskFreeRate !== null && currentMarket.riskFreeRate !== undefined
    ? Number(currentMarket.riskFreeRate)
    : null;

  return (
    <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 sm:p-7 border border-black/[0.06] dark:border-white/[0.08] shadow-sm space-y-5 transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-black/[0.04] dark:border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2">
            <Landmark className="w-5 h-5 text-[#0071E3] dark:text-[#2997FF]" />
            <h2 className="text-base sm:text-lg font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
              {language === 'ko' ? '시장 지표 & 벤치마크 (Market Snapshot)' : 'Market Snapshot & Benchmark'}
            </h2>
          </div>
          <p className="text-xs text-[#86868B] mt-0.5 font-normal">
            {language === 'ko'
              ? '현재 시장 가격, 무위험 수익률 및 1달러 유보이익 테스트 비교 벤치마크'
              : 'Current market data, risk-free rate, and benchmark data for value tests'}
          </p>
        </div>

        {currentMarket.asOf && (
          <div className="text-[11px] font-mono text-[#86868B] flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{currentMarket.asOf.slice(0, 10)}</span>
          </div>
        )}
      </div>

      {/* Market Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-[#FBFBFD] dark:bg-[#252528]/50 border border-black/[0.04] dark:border-white/[0.06]">
          <span className="text-[10px] text-[#86868B] uppercase font-semibold block">현재가 (Current Price)</span>
          <span className="font-mono text-base sm:text-lg font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tabular-nums mt-1 block">
            {formatPrice(currentMarket.currentPrice)}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#FBFBFD] dark:bg-[#252528]/50 border border-black/[0.04] dark:border-white/[0.06]">
          <span className="text-[10px] text-[#86868B] uppercase font-semibold block">시가총액 (Market Cap)</span>
          <span className="font-mono text-base sm:text-lg font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tabular-nums mt-1 block">
            {formatMarketCap(currentMarket.marketCap)}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#FBFBFD] dark:bg-[#252528]/50 border border-black/[0.04] dark:border-white/[0.06]">
          <span className="text-[10px] text-[#86868B] uppercase font-semibold block">희석주식수 (Diluted Shares)</span>
          <span className="font-mono text-base sm:text-lg font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tabular-nums mt-1 block">
            {formattedDilutedShares}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#FBFBFD] dark:bg-[#252528]/50 border border-black/[0.04] dark:border-white/[0.06]">
          <span className="text-[10px] text-[#86868B] uppercase font-semibold block">무위험수익률 (Risk-Free Rate)</span>
          <span className="font-mono text-base sm:text-lg font-bold text-[#0071E3] dark:text-[#2997FF] tabular-nums mt-1 block">
            {riskFreeRateNum !== null && !isNaN(riskFreeRateNum) ? `${(riskFreeRateNum * 100).toFixed(2)}%` : '—'}
          </span>
        </div>
      </div>

      {/* Benchmark Points */}
      {benchmarkPoints && benchmarkPoints.length > 0 && (
        <div className="p-4 rounded-2xl bg-[#F5F5F7]/80 dark:bg-[#252528]/60 border border-black/[0.04] dark:border-white/[0.06] space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
            <span>비교 벤치마크 지수 (Benchmark Points for 1-Dollar Test)</span>
            <span className="font-mono text-[11px] text-[#86868B]">{benchmarkPoints.length} Points</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {benchmarkPoints.map((bp, idx) => {
              const idxNum = bp.indexValue !== null && bp.indexValue !== undefined ? Number(bp.indexValue) : null;
              return (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between"
                >
                  <span className="font-mono text-xs text-[#86868B]">{bp.periodEnd.slice(0, 10)}</span>
                  <span className="font-mono text-xs font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tabular-nums">
                    {idxNum !== null && !isNaN(idxNum) ? idxNum.toFixed(2) : '—'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Collapsible Quarterly Book Prices */}
      {quarterlyBookPrices && quarterlyBookPrices.length > 0 && (
        <div className="pt-2">
          <button
            onClick={() => setShowQuarterly(!showQuarterly)}
            className="w-full flex items-center justify-between text-xs font-bold text-[#6E6E73] dark:text-[#86868B] hover:text-[#0071E3] dark:hover:text-[#2997FF] py-2 transition-colors cursor-pointer select-none"
          >
            <span>분기별 주당순자산가치(BVPS) 및 주가 히스토리 ({quarterlyBookPrices.length} Quarters)</span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showQuarterly ? 'rotate-180' : ''}`} />
          </button>

          {showQuarterly && (
            <div className="mt-3 overflow-x-auto max-h-60 overflow-y-auto border border-black/[0.04] dark:border-white/[0.06] rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-[#F5F5F7] dark:bg-[#252528] text-[#86868B] font-semibold border-b border-black/[0.04] dark:border-white/[0.06]">
                  <tr>
                    <th className="py-2.5 px-3">Quarter</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3 text-right">Adjusted Close</th>
                    <th className="py-2.5 px-3 text-right">BVPS</th>
                    <th className="py-2.5 px-3 text-right">P/B Ratio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.03] dark:divide-white/[0.04] font-mono tabular-nums">
                  {quarterlyBookPrices.map((q, idx) => {
                    const adjCloseNum = Number(q.adjustedClosePrice);
                    const bvpsNum = Number(q.bvps);
                    const pb = !isNaN(adjCloseNum) && !isNaN(bvpsNum) && bvpsNum > 0
                      ? (adjCloseNum / bvpsNum).toFixed(2)
                      : '—';
                    return (
                      <tr key={idx} className="hover:bg-[#F9FAFB] dark:hover:bg-[#252528]/50">
                        <td className="py-2 px-3 font-semibold">{q.fiscalYear} Q{q.fiscalQuarter}</td>
                        <td className="py-2 px-3 text-[#86868B]">{q.periodEnd.slice(0, 10)}</td>
                        <td className="py-2 px-3 text-right">{formatPrice(q.adjustedClosePrice)}</td>
                        <td className="py-2 px-3 text-right font-bold text-[#0071E3] dark:text-[#2997FF]">{formatPrice(q.bvps)}</td>
                        <td className="py-2 px-3 text-right text-[#86868B]">{pb}{pb !== '—' ? 'x' : ''}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
