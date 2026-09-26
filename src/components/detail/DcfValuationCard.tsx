import React from 'react';
import {
  AnnualFinancialDTO,
  Currency,
  DcfResultDTO,
  ReasonCode,
  ValuationStatus,
} from '../../types/api';
import { useAppConfig } from '../../context/ThemeLanguageContext';
import {
  TrendingUp,
  AlertTriangle,
  Info,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Eye,
  ChevronDown,
} from 'lucide-react';
import { HelpPopover } from '../common/HelpPopover';
import { getDcfWarningLabel } from '../../utils/ruleFormatters';
import { DCF_GLOSSARY } from '../../utils/glossaryData';

interface DcfValuationCardProps {
  dcf: DcfResultDTO;
  currency: Currency;
  currentPrice: number | null;
  annualFinancials: AnnualFinancialDTO[];
}

export const DcfValuationCard: React.FC<DcfValuationCardProps> = ({
  dcf,
  currency,
  currentPrice,
  annualFinancials,
}) => {
  const { t, language } = useAppConfig();
  const isKo = language === 'ko';
  const [isCalculationOpen, setIsCalculationOpen] = React.useState(false);

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

  const formatPercent = (val: number | string | null): string => {
    if (val === null || val === undefined) return '—';
    const num = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(num)) return '—';
    const pct = num * 100;
    return `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`;
  };

  const formatAmount = (val: number | null): string => {
    if (val === null || !Number.isFinite(val)) return '—';
    const abs = Math.abs(val);
    if (currency === 'USD') {
      if (abs >= 1_000_000_000_000) return `$${(val / 1_000_000_000_000).toFixed(2)}T`;
      if (abs >= 1_000_000_000) return `$${(val / 1_000_000_000).toFixed(2)}B`;
      if (abs >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}M`;
      return `$${val.toLocaleString()}`;
    }
    if (abs >= 1_000_000_000_000) return `${(val / 1_000_000_000_000).toFixed(2)}조원`;
    if (abs >= 100_000_000) return `${(val / 100_000_000).toFixed(1)}억원`;
    return `${Math.round(val).toLocaleString()}원`;
  };

  const ownerEarningsRows = [...annualFinancials]
    .filter((financial) => financial.cfo !== null && financial.capex !== null)
    .sort((a, b) => b.fiscalYear - a.fiscalYear)
    .slice(0, dcf.historyYears ?? 0)
    .sort((a, b) => a.fiscalYear - b.fiscalYear)
    .map((financial) => {
      const cfo = Number(financial.cfo);
      const capex = Number(financial.capex);
      const interestPaid = financial.interestPaid === null ? null : Number(financial.interestPaid);
      const adjustedCfo =
        financial.interestPaidClassification === 'NON_CFO' && interestPaid !== null
          ? cfo - interestPaid
          : cfo;
      return {
        fiscalYear: financial.fiscalYear,
        adjustedCfo,
        capex,
        ownerEarnings: adjustedCfo - capex,
      };
    });

  const hasNonPositiveOwnerEarnings =
    dcf.reasonCodes.includes('NON_POSITIVE_DENOMINATOR') &&
    dcf.normalizedOwnerEarnings !== null &&
    dcf.normalizedOwnerEarnings <= 0;

  const getStatusBadge = (status: ValuationStatus) => {
    switch (status) {
      case 'PASS_WITH_MARGIN':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#34C759] font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{t('valuationPassWithMargin')}</span>
          </span>
        );
      case 'WATCH':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0071E3] dark:text-[#2997FF] font-mono">
            <Eye className="w-3.5 h-3.5" />
            <span>{t('valuationWatch')}</span>
          </span>
        );
      case 'NO_MARGIN':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF3B30] font-mono">
            <XCircle className="w-3.5 h-3.5" />
            <span>{t('valuationNoMargin')}</span>
          </span>
        );
      case 'N/A':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF9500] font-mono">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{t('valuationNa')}</span>
          </span>
        );
    }
  };

  const getReasonLabel = (code: ReasonCode): string => {
    switch (code) {
      case 'FINANCIAL_SECTOR':
        return t('reasonFinancialSector');
      case 'MISSING_DATA':
        return t('reasonMissingData');
      case 'INSUFFICIENT_HISTORY':
        return t('reasonInsufficientHistory');
      case 'NON_POSITIVE_DENOMINATOR':
        return hasNonPositiveOwnerEarnings
          ? (isKo
              ? '정규화 Owner Earnings가 0 이하라 DCF를 계산하지 않았습니다.'
              : 'DCF was not calculated because normalized Owner Earnings are zero or negative.')
          : t('reasonNonPositiveDenominator');
      case 'INVALID_TAX_RATE':
        return t('reasonInvalidTaxRate');
      case 'NON_POSITIVE_START_VALUE':
        return t('reasonNonPositiveStartValue');
      case 'UNKNOWN_INTEREST_CLASSIFICATION':
        return t('reasonUnknownInterestClassification');
      case 'PREREQUISITE_FAILED':
        return t('reasonPrerequisiteFailed');
      default:
        return code;
    }
  };

  const conservativeIV = dcf.scenarios?.conservative.intrinsicValuePerShare ?? null;
  const baseIV = dcf.scenarios?.base.intrinsicValuePerShare ?? null;
  const optimisticIV = dcf.scenarios?.optimistic.intrinsicValuePerShare ?? null;

  return (
    <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 sm:p-7 border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex flex-col justify-between h-full space-y-6 transition-colors duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/[0.04] dark:border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#0071E3] dark:text-[#2997FF]" />
            <h2 className="text-base sm:text-lg font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
              {isKo ? '10개년 현금흐름 DCF 추정가치' : t('dcfIntrinsicValue')}
            </h2>
            <HelpPopover content={DCF_GLOSSARY.header(language)} align="left" />
          </div>
          <p className="text-xs text-[#86868B] mt-0.5 font-normal">
            {isKo
              ? '영업현금흐름 − 유형·무형자산 투자 기반 추정 모델'
              : '10-year cash-flow proxy after tangible and intangible investment'}
          </p>
        </div>
        <div>{getStatusBadge(dcf.status)}</div>
      </div>

      {/* Main Intrinsic Value vs Price Strip */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Conservative Intrinsic Value */}
          <div className="p-4 rounded-2xl bg-[#FBFBFD] dark:bg-[#252528]/50 border border-black/[0.04] dark:border-white/[0.06]">
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider">
                {isKo ? '보수적 추정 내재가치' : t('fairValueEstimate')}
              </span>
              <HelpPopover content={DCF_GLOSSARY.conservativeIV(language)} align="left" iconSize={12} />
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-[#0071E3] dark:text-[#2997FF] tracking-tight tabular-nums mt-1">
              {formatPrice(conservativeIV)}
            </div>
            <div className="text-[10px] text-[#86868B] mt-1 font-mono">
              {isKo ? '보수적 성장률 가정 기준' : 'Conservative Scenario'}
            </div>
          </div>

          {/* Current Market Price */}
          <div className="p-4 rounded-2xl bg-[#FBFBFD] dark:bg-[#252528]/50 border border-black/[0.04] dark:border-white/[0.06]">
            <span className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider block">
              {isKo ? '현재 시장 주가' : t('price')}
            </span>
            <div className="text-xl sm:text-2xl font-bold font-mono text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight tabular-nums mt-1">
              {formatPrice(currentPrice)}
            </div>
            <div className="text-[10px] text-[#86868B] mt-1 font-mono">
              {isKo ? '현재 시장 거래 가격' : 'Current Market Price'}
            </div>
          </div>

          {/* Conservative Margin of Safety */}
          <div className="p-4 rounded-2xl bg-[#FBFBFD] dark:bg-[#252528]/50 border border-black/[0.04] dark:border-white/[0.06]">
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider">
                {isKo ? '보수적 안전마진' : t('marginOfSafety')}
              </span>
              <HelpPopover content={DCF_GLOSSARY.marginOfSafety(language)} align="left" iconSize={12} />
            </div>
            <div
              className={`text-xl sm:text-2xl font-bold font-mono tracking-tight tabular-nums mt-1 ${dcf.conservativeMarginOfSafety !== null && dcf.conservativeMarginOfSafety >= 0.2
                  ? 'text-[#34C759]'
                  : dcf.conservativeMarginOfSafety !== null && dcf.conservativeMarginOfSafety >= 0
                    ? 'text-[#0071E3] dark:text-[#2997FF]'
                    : dcf.conservativeMarginOfSafety !== null
                      ? 'text-[#FF3B30]'
                      : 'text-[#86868B]'
                }`}
            >
              {formatPercent(dcf.conservativeMarginOfSafety)}
            </div>
            <div className="text-[10px] text-[#86868B] mt-1 font-mono">
              {dcf.conservativeMarginOfSafety === null
                ? (isKo ? '계산 불가' : 'Unavailable')
                : dcf.status === 'PASS_WITH_MARGIN'
                  ? (isKo ? '모델 기준 할인 폭 20% 이상' : 'Model discount at least 20%')
                  : dcf.status === 'WATCH'
                    ? (isKo ? '가격·데이터 추가 검토 필요' : 'Review price and data')
                    : (isKo ? '모델 기준 할인 부족' : 'Insufficient model discount')}

            </div>
          </div>
        </div>

        {/* 3 DCF Scenarios Breakdown */}
        {dcf.scenarios ? (
          <div className="p-4 rounded-2xl bg-[#F5F5F7]/80 dark:bg-[#252528]/60 border border-black/[0.04] dark:border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
              <div className="flex items-center gap-1">
                <span>{isKo ? 'DCF 시나리오별 주당 내재가치 비교' : 'DCF Scenarios: Intrinsic Value Comparison'}</span>
                <HelpPopover content={DCF_GLOSSARY.scenarios(language)} align="left" />
              </div>
              <span className="font-mono text-[11px] text-[#86868B]">
                {isKo ? '할인율(주주요구수익률)' : 'Discount Rate (Cost of Equity)'}: {formatPercent(dcf.discountRate)}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
              {/* Conservative */}
              <div className="p-3 rounded-xl bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.06] shadow-sm">
                <div className="text-[10px] sm:text-[11px] font-semibold text-[#86868B]">
                  {isKo ? '보수적 (Conservative)' : 'Conservative'}
                </div>
                <div className="text-xs sm:text-sm font-bold font-mono mt-1 text-[#0071E3] dark:text-[#2997FF] tabular-nums">
                  {formatPrice(conservativeIV)}
                </div>
                <div className="text-[10px] text-[#86868B] font-mono mt-0.5">
                  {isKo ? '성장률' : 'Growth'} {formatPercent(dcf.scenarios.conservative.growthRate)}
                </div>
              </div>

              {/* Base */}
              <div className="p-3 rounded-xl bg-white dark:bg-[#1C1C1E] border border-[#0071E3]/20 shadow-sm">
                <div className="text-[10px] sm:text-[11px] font-bold text-[#0071E3] dark:text-[#2997FF]">
                  {isKo ? '기본 (Base)' : 'Base'}
                </div>
                <div className="text-xs sm:text-sm font-bold font-mono mt-1 text-[#1D1D1F] dark:text-[#F5F5F7] tabular-nums">
                  {formatPrice(baseIV)}
                </div>
                <div className="text-[10px] text-[#86868B] font-mono mt-0.5">
                  {isKo ? '성장률' : 'Growth'} {formatPercent(dcf.scenarios.base.growthRate)}
                </div>
              </div>

              {/* Optimistic */}
              <div className="p-3 rounded-xl bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.06] shadow-sm">
                <div className="text-[10px] sm:text-[11px] font-semibold text-[#86868B]">
                  {isKo ? '낙관적 (Optimistic)' : 'Optimistic'}
                </div>
                <div className="text-xs sm:text-sm font-bold font-mono mt-1 text-[#34C759] tabular-nums">
                  {formatPrice(optimisticIV)}
                </div>
                <div className="text-[10px] text-[#86868B] font-mono mt-0.5">
                  {isKo ? '성장률' : 'Growth'} {formatPercent(dcf.scenarios.optimistic.growthRate)}
                </div>
              </div>
            </div>

            {/* Assumptions strip */}
            <div className="pt-2 border-t border-black/[0.04] dark:border-white/[0.06] flex flex-wrap items-center justify-between text-[11px] text-[#86868B] font-mono gap-2">
              <div>
                {isKo ? '정규화 주당주주이익(OEPS): ' : 'Normalized OEPS: '}
                <span className="font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tabular-nums">
                  {formatPrice(dcf.normalizedOeps)}
                </span>
              </div>
              <div>
                {isKo ? '기본 성장률: ' : 'Base Growth: '}
                <span className="font-bold tabular-nums">{formatPercent(dcf.baseGrowth)}</span>
              </div>
              <div>
                {isKo ? '성장률 상한: ' : 'Growth Cap: '}
                <span className="font-bold tabular-nums">{formatPercent(dcf.growthCap)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.06] text-xs text-[#86868B] space-y-2">
            <p>
              {hasNonPositiveOwnerEarnings
                ? (isKo
                    ? '정규화 Owner Earnings가 0 이하이므로 현재 현금흐름으로는 의미 있는 DCF 내재가치를 계산할 수 없습니다.'
                    : 'A meaningful DCF intrinsic value cannot be calculated because normalized Owner Earnings are zero or negative.')
                : (isKo
                    ? '해당 종목은 업종 특성 또는 필수 데이터 부족으로 Owner Earnings DCF 산출 대상에서 제외되었습니다.'
                    : 'Owner Earnings DCF is not applicable due to industry classification or missing inputs.')}
            </p>
          </div>
        )}

        {/* Owner Earnings calculation details */}
        {ownerEarningsRows.length > 0 && (
          <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] overflow-hidden">
            <button
              type="button"
              onClick={() => setIsCalculationOpen((open) => !open)}
              aria-expanded={isCalculationOpen}
              className="w-full p-4 flex items-center justify-between gap-3 text-left bg-[#FBFBFD] dark:bg-[#252528]/50 hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] transition-colors"
            >
              <div>
                <span className="text-xs font-bold text-[#1D1D1F] dark:text-[#F5F5F7] block">
                  {isKo ? 'Owner Earnings 계산 근거' : 'Owner Earnings calculation'}
                </span>
                <span className="text-[11px] text-[#86868B] mt-0.5 block">
                  {isKo
                    ? `정규화 Owner Earnings ${formatAmount(dcf.normalizedOwnerEarnings)}`
                    : `Normalized Owner Earnings ${formatAmount(dcf.normalizedOwnerEarnings)}`}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 shrink-0 text-[#86868B] transition-transform ${isCalculationOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isCalculationOpen && (
              <div className="p-4 space-y-4 bg-white dark:bg-[#1C1C1E] border-t border-black/[0.04] dark:border-white/[0.06]">
                <div className="text-xs text-[#86868B] leading-relaxed">
                  <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                    Owner Earnings = {isKo ? '조정 영업현금흐름(CFO) − CAPEX' : 'Adjusted CFO − CAPEX'}
                  </span>
                  <p className="mt-1">
                    {isKo
                      ? `최근 ${ownerEarningsRows.length}개년 값을 정규화해 DCF의 출발값으로 사용합니다.`
                      : `The latest ${ownerEarningsRows.length} annual values are normalized as the DCF starting point.`}
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-[11px] font-mono tabular-nums">
                    <thead>
                      <tr className="text-[#86868B] border-b border-black/[0.06] dark:border-white/[0.08]">
                        <th className="py-2 pr-3 text-left font-semibold">{isKo ? '연도' : 'Year'}</th>
                        <th className="py-2 px-3 text-right font-semibold">{isKo ? '조정 CFO' : 'Adjusted CFO'}</th>
                        <th className="py-2 px-3 text-right font-semibold">CAPEX</th>
                        <th className="py-2 pl-3 text-right font-semibold">Owner Earnings</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/[0.03] dark:divide-white/[0.04]">
                      {ownerEarningsRows.map((row) => (
                        <tr key={row.fiscalYear}>
                          <td className="py-2.5 pr-3 font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                            {row.fiscalYear}
                          </td>
                          <td className="py-2.5 px-3 text-right text-[#0071E3] dark:text-[#2997FF]">
                            {formatAmount(row.adjustedCfo)}
                          </td>
                          <td className="py-2.5 px-3 text-right text-[#86868B]">
                            {formatAmount(row.capex)}
                          </td>
                          <td className={`py-2.5 pl-3 text-right font-bold ${row.ownerEarnings < 0 ? 'text-[#FF3B30]' : 'text-[#34C759]'}`}>
                            {formatAmount(row.ownerEarnings)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {hasNonPositiveOwnerEarnings && (
                  <div className="p-3 rounded-xl bg-[#FF9500]/10 border border-[#FF9500]/20 text-xs text-[#6E6E73] dark:text-[#A1A1A6] leading-relaxed">
                    {isKo
                      ? '영업현금흐름이 음수인 상태에서 CAPEX를 추가로 차감해 정규화 Owner Earnings가 음수가 되었습니다. 금융 계열사나 대규모 투자를 포함한 기업은 연결 현금흐름과 전체 CAPEX 기준 평가가 보수적으로 나타날 수 있습니다.'
                      : 'Normalized Owner Earnings are negative because CAPEX is deducted from already-negative operating cash flow. For companies with financing subsidiaries or large investments, consolidated cash flow and total CAPEX can produce a conservative result.'}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Reason Codes */}
        {dcf.reasonCodes && dcf.reasonCodes.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[11px] text-[#86868B] font-semibold block">
              {isKo ? '계산 제외 사유:' : 'Why calculation was excluded:'}
            </span>
            <div className="flex flex-wrap gap-2">
              {dcf.reasonCodes.map((code, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-[#FF9500]"
                >
                  <Info className="w-3.5 h-3.5 shrink-0" />
                  <span>{getReasonLabel(code)}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Warnings */}
        {dcf.warnings && dcf.warnings.length > 0 && (
          <div className="p-3.5 rounded-xl bg-[#FF9500]/10 border border-[#FF9500]/20 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#C93400] dark:text-[#FF9500]">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{isKo ? 'DCF 가치평가 주의 경고' : 'DCF Valuation Warnings'}</span>
            </div>
            {dcf.warnings.map((warn, idx) => (
              <p key={idx} className="text-xs text-[#86868B] leading-relaxed">
                {getDcfWarningLabel(warn, language)}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="pt-2 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between text-[11px] text-[#86868B] font-mono">
        <span>{isKo ? '현금흐름 대용치 · 10개년 DCF' : 'Cash-flow proxy · 10-year DCF'}</span>
        <span>
          {isKo ? '신뢰도: ' : 'Confidence: '}
          <span
            className={`font-bold ${dcf.confidence === 'HIGH'
                ? 'text-[#34C759]'
                : dcf.confidence === 'MEDIUM'
                  ? 'text-[#FF9500]'
                  : 'text-[#86868B]'
              }`}
          >
            {dcf.confidence === 'HIGH' ? (isKo ? '우수 (HIGH)' : 'HIGH') : dcf.confidence === 'MEDIUM' ? (isKo ? '보통 (MEDIUM)' : 'MEDIUM') : (isKo ? '주의 (LOW)' : 'LOW')}
          </span>
        </span>
      </div>
    </div>
  );
};
