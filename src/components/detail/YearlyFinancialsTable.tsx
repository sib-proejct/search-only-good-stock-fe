import React from 'react';
import { AnnualFinancialDTO, Currency, IndustryType } from '../../types/api';
import { useAppConfig } from '../../context/ThemeLanguageContext';
import { getIndustryTypeLabel } from '../../utils/ruleFormatters';
import { FileSpreadsheet, X } from 'lucide-react';
import { HelpPopover } from '../common/HelpPopover';
import { FINANCIALS_TABLE_GLOSSARY } from '../../utils/glossaryData';

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
  const isKo = language === 'ko';
  const [isGlossaryOpen, setIsGlossaryOpen] = React.useState(false);

  if (!financials || financials.length === 0) {
    return null;
  }

  // Sort chronological ascending
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

  const cols = FINANCIALS_TABLE_GLOSSARY.columns;
  const categories = FINANCIALS_TABLE_GLOSSARY.categories(language);

  return (
    <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 sm:p-7 border border-black/[0.06] dark:border-white/[0.08] shadow-sm space-y-4 transition-colors duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/[0.04] dark:border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#0071E3] dark:text-[#2997FF]" />
            <h2 className="text-base sm:text-lg font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
              {isKo ? '5개년 연차 재무제표 원자료' : t('fiveYearFinancialTrends')}
            </h2>
            <button
              onClick={() => setIsGlossaryOpen(true)}
              className="p-1 rounded-full text-[#86868B] hover:text-[#0071E3] dark:hover:text-[#2997FF] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors cursor-pointer select-none focus:outline-none"
              title={isKo ? '10대 핵심 계정과목 용어 전체보기' : 'View all 10 financial metrics guide'}
              aria-label={isKo ? '10대 핵심 계정과목 용어 전체보기' : 'View all 10 financial metrics guide'}
            >
              <HelpPopover
                align="left"
                content={{
                  title: isKo ? '5개년 연차 재무제표 원자료 안내' : '5-Year Financial Statements Guide',
                  badge: isKo ? '공시 원본 데이터' : 'RAW AUDITED DATA',
                  description: isKo
                    ? '추정이나 가공 없이 백엔드 API에서 제공하는 기업의 최근 5개년 확정 연차(Audit) 재무제표 원본 데이터입니다.'
                    : 'Audited annual raw financial statements received directly from official corporate filings.',
                  whyItMatters: isKo
                    ? '우측의 [계정과목 용어 가이드] 버튼을 누르면 10개 핵심 재무 항목(손익/재무상태/현금흐름/주당지표)의 정의를 한눈에 볼 수 있습니다.'
                    : 'Click [Glossary Guide] to review definitions for all 10 core financial accounts at a glance.',
                }}
              />
            </button>
          </div>
          <p className="text-xs text-[#86868B] mt-0.5 font-normal">
            {isKo
              ? '백엔드 API가 제공하는 확정 연차 재무제표 원본 데이터 (가공/추정 없음)'
              : 'Raw annual financial statements received directly from the backend API'}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#86868B]">
          <button
            onClick={() => setIsGlossaryOpen(true)}
            className="px-3 py-1 rounded-full bg-[#0071E3]/10 dark:bg-[#2997FF]/15 text-[#0071E3] dark:text-[#2997FF] hover:bg-[#0071E3]/20 dark:hover:bg-[#2997FF]/25 transition-colors font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span>📖</span>
            <span>{isKo ? '계정과목 용어 가이드' : 'Financial Glossary'}</span>
          </button>
          {industryType && (
            <span className="px-2.5 py-1 rounded-full bg-black/[0.04] dark:bg-white/[0.06] font-semibold text-[10px]">
              {getIndustryTypeLabel(industryType, language)}
            </span>
          )}
          <span className="text-[11px]">{currency} 단위</span>
        </div>
      </div>

      {/* Financials Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-black/[0.06] dark:border-white/[0.08] text-[#86868B] font-medium whitespace-nowrap bg-black/[0.01] dark:bg-white/[0.01]">
              <th className="py-3 px-3.5 text-left font-semibold">{isKo ? '회계연도' : 'Fiscal Year'}</th>
              <th
                className="py-3 px-3.5 text-right font-semibold cursor-help"
                title={cols.netIncome(language).description}
              >
                {isKo ? '보통주 순이익' : 'Net Income'}
              </th>
              <th
                className="py-3 px-3.5 text-right font-semibold cursor-help"
                title={cols.ebit(language).description}
              >
                {isKo ? '영업이익 (EBIT)' : 'EBIT'}
              </th>
              <th
                className="py-3 px-3.5 text-right font-semibold cursor-help"
                title={cols.commonEquity(language).description}
              >
                {isKo ? '자기자본 (Equity)' : 'Common Equity'}
              </th>
              <th
                className="py-3 px-3.5 text-right font-semibold cursor-help"
                title={cols.interestDebt(language).description}
              >
                {isKo ? '이자발생 부채' : 'Interest Debt'}
              </th>
              <th
                className="py-3 px-3.5 text-right font-semibold cursor-help"
                title={cols.cash(language).description}
              >
                {isKo ? '현금및현금성자산' : 'Cash & Equiv'}
              </th>
              <th
                className="py-3 px-3.5 text-right font-semibold text-[#0071E3] dark:text-[#2997FF] cursor-help"
                title={cols.cfo(language).description}
              >
                {isKo ? '영업현금흐름 (CFO)' : 'CFO'}
              </th>
              <th
                className="py-3 px-3.5 text-right font-semibold cursor-help"
                title={cols.capex(language).description}
              >
                {isKo ? '설비투자 (CapEx)' : 'CapEx'}
              </th>
              <th
                className="py-3 px-3.5 text-right font-semibold cursor-help"
                title={cols.interestPaid(language).description}
              >
                {isKo ? '지급이자' : 'Interest Paid'}
              </th>
              <th
                className="py-3 px-3.5 text-right font-semibold font-mono text-[#34C759] cursor-help"
                title={cols.dilutedEps(language).description}
              >
                {isKo ? '희석 EPS' : 'Diluted EPS'}
              </th>
              <th
                className="py-3 px-3.5 text-right font-semibold font-mono cursor-help"
                title={cols.dilutedShares(language).description}
              >
                {isKo ? '희석주식수' : 'Diluted Shares'}
              </th>
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
                <td
                  className="py-3.5 px-3.5 text-right text-[#86868B]"
                  title={f.interestPaidClassification ? `분류: ${f.interestPaidClassification}` : undefined}
                >
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

      {/* 10-Metric Comprehensive Glossary Modal */}
      {isGlossaryOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in"
          onClick={() => setIsGlossaryOpen(false)}
        >
          <div
            className="w-full max-w-2xl bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 sm:p-7 shadow-2xl border border-black/[0.08] dark:border-white/[0.12] max-h-[85vh] overflow-y-auto space-y-5 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-black/[0.05] dark:border-white/[0.08]">
              <div>
                <span className="inline-block text-[11px] font-mono font-bold uppercase tracking-wider text-[#0071E3] dark:text-[#2997FF] bg-[#0071E3]/10 dark:bg-[#2997FF]/15 px-2.5 py-0.5 rounded-full mb-1">
                  {isKo ? '재무제표 10대 계정과목 종합 가이드' : '10-METRIC FINANCIAL GLOSSARY'}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                  {isKo ? '연차 재무제표 핵심 항목 한눈에 보기' : 'Annual Financial Accounts at a Glance'}
                </h3>
                <p className="text-xs text-[#86868B] mt-0.5">
                  {isKo
                    ? '가공되지 않은 공시 원본 데이터의 4대 영역(손익, 재무상태, 현금흐름, 주당지표) 10개 핵심 계정과목의 개념입니다.'
                    : 'Definitions for all 10 core raw accounting metrics across 4 financial dimensions.'}
                </p>
              </div>
              <button
                onClick={() => setIsGlossaryOpen(false)}
                className="p-1.5 rounded-full text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 4 Category Groups */}
            <div className="space-y-4">
              {categories.map((cat, cIdx) => (
                <div
                  key={cIdx}
                  className="p-4 rounded-2xl bg-[#F5F5F7]/80 dark:bg-[#252528]/60 border border-black/[0.04] dark:border-white/[0.06] space-y-2.5"
                >
                  <h4 className="text-xs sm:text-[13px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center gap-1.5">
                    <span>{cat.group}</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {cat.items.map((item, iIdx) => (
                      <div
                        key={iIdx}
                        className="p-3 rounded-xl bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.06] shadow-sm space-y-1"
                      >
                        <div className="text-xs font-bold text-[#0071E3] dark:text-[#2997FF]">
                          {item.name}
                        </div>
                        <p className="text-[11px] text-[#6E6E73] dark:text-[#86868B] leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-black/[0.05] dark:border-white/[0.08] flex items-center justify-between text-xs text-[#86868B]">
              <span>💡 표 헤더에 마우스를 올려도 툴팁으로 설명을 바로 확인할 수 있습니다.</span>
              <button
                onClick={() => setIsGlossaryOpen(false)}
                className="px-4 py-1.5 rounded-full bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#EBEBED] dark:hover:bg-[#3A3A3C] font-semibold text-xs transition-colors cursor-pointer"
              >
                {isKo ? '닫기' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
