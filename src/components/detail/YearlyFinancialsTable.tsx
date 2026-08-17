import React from 'react';
import { Stock } from '../../types/stock';
import { useAppConfig } from '../../context/ThemeLanguageContext';

interface YearlyFinancialsTableProps {
  stock: Stock;
}

export const YearlyFinancialsTable: React.FC<YearlyFinancialsTableProps> = ({ stock }) => {
  const { t, language } = useAppConfig();
  const financials = stock.yearlyFinancials;

  if (!financials || financials.length === 0) return null;

  return (
    <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 sm:p-7 border border-black/[0.06] dark:border-white/[0.08] shadow-sm space-y-4 transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-black/[0.04] dark:border-white/[0.06]">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
            {t('fiveYearFinancialTrends')}
          </h2>
          <p className="text-xs text-[#86868B] mt-0.5 font-normal">
            {language === 'ko' ? '5개년 핵심 손익 및 자본수익률(ROE/ROIC) 추이' : '5-Year Earnings & Capital Return History'}
          </p>
        </div>
        <span className="text-[10px] sm:text-xs text-[#86868B]">
          Unit: {stock.currency === 'USD' ? '$ (Billion)' : 'KRW (십억원)'}
        </span>
      </div>

      {/* Financials Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-black/[0.04] dark:border-white/[0.06] text-[#86868B] font-medium whitespace-nowrap">
              <th className="py-3 px-3 text-left">{language === 'ko' ? '회계연도' : 'Fiscal Year'}</th>
              <th className="py-3 px-3 text-right">{t('revenueLabel')}</th>
              <th className="py-3 px-3 text-right">{t('operatingMarginLabel')}</th>
              <th className="py-3 px-3 text-right">{t('netIncomeLabel')}</th>
              <th className="py-3 px-3 text-right font-bold text-[#34C759]">ROE</th>
              <th className="py-3 px-3 text-right font-bold text-[#0071E3] dark:text-[#2997FF]">ROIC</th>
              <th className="py-3 px-3 text-right">EPS</th>
              <th className="py-3 px-3 text-right">{t('debtRatio')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.03] dark:divide-white/[0.04] font-mono tabular-nums">
            {financials.map((f) => (
              <tr key={f.year} className="hover:bg-[#F5F5F7]/80 dark:hover:bg-[#2C2C2E]/60 transition-colors">
                <td className="py-3 px-3 font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                  {f.year}
                </td>
                <td className="py-3 px-3 text-right text-[#1D1D1F] dark:text-[#F5F5F7]">
                  {stock.currency === 'USD' ? `$${f.revenue}B` : `${f.revenue.toLocaleString()}억`}
                </td>
                <td className="py-3 px-3 text-right text-[#1D1D1F] dark:text-[#F5F5F7]">
                  {f.operatingMargin.toFixed(1)}%
                </td>
                <td className="py-3 px-3 text-right text-[#1D1D1F] dark:text-[#F5F5F7]">
                  {stock.currency === 'USD' ? `$${f.netIncome}B` : `${f.netIncome.toLocaleString()}억`}
                </td>
                <td className="py-3 px-3 text-right font-bold text-[#34C759]">
                  {f.roe.toFixed(1)}%
                </td>
                <td className="py-3 px-3 text-right font-bold text-[#0071E3] dark:text-[#2997FF]">
                  {f.roic.toFixed(1)}%
                </td>
                <td className="py-3 px-3 text-right text-[#1D1D1F] dark:text-[#F5F5F7]">
                  {stock.currency === 'USD' ? `$${f.eps.toFixed(2)}` : `${f.eps.toLocaleString()}원`}
                </td>
                <td className="py-3 px-3 text-right text-[#86868B]">
                  {f.debtToEquity.toFixed(0)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
