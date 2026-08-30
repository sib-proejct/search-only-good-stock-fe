import React from 'react';
import { AnnualFinancialDTO, Currency, IndustryType } from '../../types/api';
import { useAppConfig } from '../../context/ThemeLanguageContext';
import { FileSpreadsheet } from 'lucide-react';

interface YearlyFinancialsTableProps {
  financials: AnnualFinancialDTO[];
  currency: Currency;
  industryType?: IndustryType;
}

export const YearlyFinancialsTable: React.FC<YearlyFinancialsTableProps> = ({
  financials,
  currency,
  industryType,
}) => {
  const { t, language } = useAppConfig();

  if (!financials || financials.length === 0) {
    return null;
  }

  // Sort chronological ascending (or latest first)
  const sortedFinancials = [...financials].sort((a, b) => a.fiscalYear - b.fiscalYear);

  const formatNumber = (val: number | string | null, isEps: boolean = false): string => {
    if (val === null || val === undefined) return '—';
    const num = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(num)) return '—';
    if (isEps) {
      if (currency === 'USD') {
        return `$${num.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;
      }
      return `${Math.round(num).toLocaleString()}원`;
    }
    if (currency === 'USD') {
      if (Math.abs(num) >= 1_000_000_000_000) return `$${(num / 1_000_000_000_000).toFixed(1)}T`;
      if (Math.abs(num) >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(1)}B`;
      if (Math.abs(num) >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`;
      return `$${num.toLocaleString()}`;
    }
    if (Math.abs(num) >= 1_000_000_000_000) return `${(num / 1_000_000_000_000).toFixed(1)}조원`;
    if (Math.abs(num) >= 100_000_000) return `${(num / 100_000_000).toFixed(1)}억원`;
    return `${num.toLocaleString()}원`;
  };

  const formatShares = (val: string | null): string => {
    if (val === null) return '—';
    const num = Number(val);
    if (isNaN(num)) return '—';
    if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(2)}B`;
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
    return num.toLocaleString();
  };

  return (
    <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 sm:p-7 border border-black/[0.06] dark:border-white/[0.08] shadow-sm space-y-4 transition-colors duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-black/[0.04] dark:border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#0071E3] dark:text-[#2997FF]" />
            <h2 className="text-base sm:text-lg font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
              {t('fiveYearFinancialTrends')}
            </h2>
          </div>
          <p className="text-xs text-[#86868B] mt-0.5 font-normal">
            {language === 'ko'
              ? 'API가 제공하는 연차 재무제표 원자료 (가공/추정 없는 실제 수신값)'
              : 'Raw annual financial statements received directly from the backend API'}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#86868B]">
          {industryType && (
            <span className="px-2 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] font-semibold text-[10px]">
              {industryType}
            </span>
          )}
          <span>{currency} 원단위 · 화면 축약 표기</span>
        </div>
      </div>

      {/* Financials Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-black/[0.06] dark:border-white/[0.08] text-[#86868B] font-medium whitespace-nowrap bg-black/[0.01] dark:bg-white/[0.01]">
              <th className="py-3 px-3.5 text-left font-semibold">회계연도 (Period)</th>
              <th className="py-3 px-3.5 text-right font-semibold">순이익 (Net Income)</th>
              <th className="py-3 px-3.5 text-right font-semibold">EBIT</th>
              <th className="py-3 px-3.5 text-right font-semibold">자기자본 (Equity)</th>
              <th className="py-3 px-3.5 text-right font-semibold">차입부채 (Debt)</th>
              <th className="py-3 px-3.5 text-right font-semibold">현금성자산 (Cash)</th>
              <th className="py-3 px-3.5 text-right font-semibold text-[#0071E3] dark:text-[#2997FF]">영업현금흐름 (CFO)</th>
              <th className="py-3 px-3.5 text-right font-semibold">자본지출 (CapEx)</th>
              <th className="py-3 px-3.5 text-right font-semibold">지급이자 (Interest)</th>
              <th className="py-3 px-3.5 text-right font-semibold font-mono text-[#34C759]">희석 EPS</th>
              <th className="py-3 px-3.5 text-right font-semibold font-mono">희석주식수</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.03] dark:divide-white/[0.04] font-mono tabular-nums">
            {sortedFinancials.map((f) => (
              <tr
                key={f.fiscalYear}
                className="hover:bg-[#F5F5F7]/80 dark:hover:bg-[#2C2C2E]/60 transition-colors"
              >
                <td className="py-3.5 px-3.5 font-bold text-[#1D1D1F] dark:text-[#F5F5F7] whitespace-nowrap">
                  <span>{f.fiscalYear}</span>
                  <span className="text-[10px] text-[#86868B] ml-1 font-normal">
                    ({f.periodEnd.slice(0, 10)})
                  </span>
                </td>
                <td
                  className={`py-3.5 px-3.5 text-right font-semibold ${
                    f.netIncomeCommon !== null && Number(f.netIncomeCommon) >= 0
                      ? 'text-[#1D1D1F] dark:text-[#F5F5F7]'
                      : 'text-[#FF3B30]'
                  }`}
                >
                  {formatNumber(f.netIncomeCommon)}
                </td>
                <td className="py-3.5 px-3.5 text-right text-[#1D1D1F] dark:text-[#F5F5F7]">
                  {formatNumber(f.ebit)}
                </td>
                <td className="py-3.5 px-3.5 text-right text-[#1D1D1F] dark:text-[#F5F5F7]">
                  {formatNumber(f.commonEquity)}
                </td>
                <td className="py-3.5 px-3.5 text-right text-[#86868B]">
                  {formatNumber(f.interestBearingDebt)}
                </td>
                <td className="py-3.5 px-3.5 text-right text-[#1D1D1F] dark:text-[#F5F5F7]">
                  {formatNumber(f.cashAndEquivalents)}
                </td>
                <td className="py-3.5 px-3.5 text-right font-bold text-[#0071E3] dark:text-[#2997FF]">
                  {formatNumber(f.cfo)}
                </td>
                <td className="py-3.5 px-3.5 text-right text-[#86868B]">
                  {formatNumber(f.capex)}
                </td>
                <td className="py-3.5 px-3.5 text-right text-[#86868B]" title={`분류: ${f.interestPaidClassification}`}>
                  <span>{formatNumber(f.interestPaid)}</span>
                  {f.interestPaidClassification && (
                    <span className="text-[9px] text-[#86868B] ml-1">
                      ({f.interestPaidClassification})
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-3.5 text-right font-bold text-[#34C759]">
                  {formatNumber(f.dilutedEps, true)}
                </td>
                <td className="py-3.5 px-3.5 text-right text-[#86868B]">
                  {formatShares(f.dilutedShares)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
