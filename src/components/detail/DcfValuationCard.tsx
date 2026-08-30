import React from 'react';
import {
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
  HelpCircle,
  XCircle,
  Eye,
} from 'lucide-react';

interface DcfValuationCardProps {
  dcf: DcfResultDTO;
  currency: Currency;
  currentPrice: number | null;
}

export const DcfValuationCard: React.FC<DcfValuationCardProps> = ({
  dcf,
  currency,
  currentPrice,
}) => {
  const { t, language } = useAppConfig();
  const isKo = language === 'ko';

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
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#86868B] font-mono">
            <HelpCircle className="w-3.5 h-3.5" />
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
        return t('reasonNonPositiveDenominator');
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
              {isKo ? '10개년 주주이익 DCF 내재가치 평가' : t('dcfIntrinsicValue')}
            </h2>
          </div>
          <p className="text-xs text-[#86868B] mt-0.5 font-normal">
            {isKo
              ? '워런 버핏 10-Year Owner Earnings 할인현금흐름(DCF) 가치평가 모델'
              : 'Warren Buffett 10-Year Owner Earnings Discounted Cash Flow'}
          </p>
        </div>
        <div>{getStatusBadge(dcf.status)}</div>
      </div>

      {/* Main Intrinsic Value vs Price Strip */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Conservative Intrinsic Value */}
          <div className="p-4 rounded-2xl bg-[#FBFBFD] dark:bg-[#252528]/50 border border-black/[0.04] dark:border-white/[0.06]">
            <span className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider block">
              {isKo ? '보수적 추정 내재가치' : t('fairValueEstimate')}
            </span>
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
            <span className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider block">
              {isKo ? '보수적 안전마진' : t('marginOfSafety')}
            </span>
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
              {dcf.conservativeMarginOfSafety !== null && dcf.conservativeMarginOfSafety >= 0.2
                ? (isKo ? '안전마진 20%+ 확보 (통과)' : '20%+ Margin Satisfied')
                : dcf.conservativeMarginOfSafety !== null && dcf.conservativeMarginOfSafety >= 0
                  ? (isKo ? '적정가 부근 (관찰 필요)' : 'Near Fair Value (Watch)')
                  : (isKo ? '안전마진 미확보 (고평가)' : 'No Margin (Overvalued)')}
            </div>
          </div>
        </div>

        {/* 3 DCF Scenarios Breakdown */}
        {dcf.scenarios ? (
          <div className="p-4 rounded-2xl bg-[#F5F5F7]/80 dark:bg-[#252528]/60 border border-black/[0.04] dark:border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
              <span>{isKo ? 'DCF 시나리오별 주당 내재가치 비교' : 'DCF Scenarios: Intrinsic Value Comparison'}</span>
              <span className="font-mono text-[11px] text-[#86868B]">
                {isKo ? '할인율(WACC)' : 'Discount Rate'}: {formatPercent(dcf.discountRate)}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
              {/* Conservative */}
              <div className="p-3 rounded-xl bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.06] shadow-2xs">
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
              <div className="p-3 rounded-xl bg-white dark:bg-[#1C1C1E] border border-[#0071E3]/20 shadow-2xs">
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
              <div className="p-3 rounded-xl bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.06] shadow-2xs">
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
              {isKo
                ? '해당 종목은 금융업종이거나 필수 데이터가 부족하여 Owner Earnings DCF 밸류에이션 산출 대상에서 제외되었습니다.'
                : 'Owner Earnings DCF valuation is not applicable for this stock due to industry classification or missing inputs.'}
            </p>
          </div>
        )}

        {/* Reason Codes */}
        {dcf.reasonCodes && dcf.reasonCodes.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[11px] text-[#86868B] font-semibold block">
              {isKo ? '평가 사유 코드:' : 'Reason Codes:'}
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
                {warn}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="pt-2 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between text-[11px] text-[#86868B] font-mono">
        <span>{isKo ? `평가 모델: ${dcf.method} (10개년 DCF)` : `Method: ${dcf.method}`}</span>
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
