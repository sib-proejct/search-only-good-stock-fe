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

  const formatPrice = (val: number | null): string => {
    if (val === null || val === undefined) return '—';
    if (currency === 'USD') {
      return `$${val.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
    return `${Math.round(val).toLocaleString()}원`;
  };

  const formatPercent = (val: number | null): string => {
    if (val === null || val === undefined) return '—';
    const pct = val * 100;
    return `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`;
  };

  const getStatusBadge = (status: ValuationStatus) => {
    switch (status) {
      case 'PASS_WITH_MARGIN':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#34C759] bg-[#34C759]/10 dark:bg-[#34C759]/20 px-2.5 py-0.5 rounded-full border border-[#34C759]/20 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{t('valuationPassWithMargin')}</span>
          </span>
        );
      case 'WATCH':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#0071E3] dark:text-[#2997FF] bg-[#0071E3]/10 dark:bg-[#2997FF]/15 px-2.5 py-0.5 rounded-full border border-[#0071E3]/20 font-mono">
            <Eye className="w-3.5 h-3.5" />
            <span>{t('valuationWatch')}</span>
          </span>
        );
      case 'NO_MARGIN':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#FF3B30] bg-[#FF3B30]/10 dark:bg-[#FF3B30]/20 px-2.5 py-0.5 rounded-full border border-[#FF3B30]/20 font-mono">
            <XCircle className="w-3.5 h-3.5" />
            <span>{t('valuationNoMargin')}</span>
          </span>
        );
      case 'N/A':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#86868B] bg-black/[0.04] dark:bg-white/[0.06] px-2.5 py-0.5 rounded-full border border-black/[0.06] font-mono">
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
              {t('dcfIntrinsicValue')}
            </h2>
          </div>
          <p className="text-xs text-[#86868B] mt-0.5 font-normal">
            Warren Buffett 10-Year Owner Earnings Discounted Cash Flow
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
              {t('fairValueEstimate')}
            </span>
            <div className="text-xl sm:text-2xl font-bold font-mono text-[#0071E3] dark:text-[#2997FF] tracking-tight tabular-nums mt-1">
              {formatPrice(conservativeIV)}
            </div>
            <div className="text-[10px] text-[#86868B] mt-1 font-mono">
              보수적 시나리오 기준
            </div>
          </div>

          {/* Current Market Price */}
          <div className="p-4 rounded-2xl bg-[#FBFBFD] dark:bg-[#252528]/50 border border-black/[0.04] dark:border-white/[0.06]">
            <span className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider block">
              {t('price')}
            </span>
            <div className="text-xl sm:text-2xl font-bold font-mono text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight tabular-nums mt-1">
              {formatPrice(currentPrice)}
            </div>
            <div className="text-[10px] text-[#86868B] mt-1 font-mono">
              현재 시장 가격
            </div>
          </div>

          {/* Conservative Margin of Safety */}
          <div className="p-4 rounded-2xl bg-[#FBFBFD] dark:bg-[#252528]/50 border border-black/[0.04] dark:border-white/[0.06]">
            <span className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider block">
              {t('marginOfSafety')}
            </span>
            <div
              className={`text-xl sm:text-2xl font-bold font-mono tracking-tight tabular-nums mt-1 ${
                dcf.conservativeMarginOfSafety !== null && dcf.conservativeMarginOfSafety >= 0.2
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
                ? '안전마진 20% 이상 충족'
                : dcf.conservativeMarginOfSafety !== null && dcf.conservativeMarginOfSafety >= 0
                ? '적정가 부근 관찰 필요'
                : '안전마진 미확보'}
            </div>
          </div>
        </div>

        {/* 3 DCF Scenarios Breakdown */}
        {dcf.scenarios ? (
          <div className="p-4 rounded-2xl bg-[#F5F5F7]/80 dark:bg-[#252528]/60 border border-black/[0.04] dark:border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
              <span>DCF 시나리오별 주당 내재가치 비교</span>
              <span className="font-mono text-[11px] text-[#86868B]">
                할인율(WACC): {formatPercent(dcf.discountRate)}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
              {/* Conservative */}
              <div className="p-3 rounded-xl bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.06] shadow-2xs">
                <div className="text-[10px] sm:text-[11px] font-semibold text-[#86868B]">보수적 (Conservative)</div>
                <div className="text-xs sm:text-sm font-bold font-mono mt-1 text-[#0071E3] dark:text-[#2997FF] tabular-nums">
                  {formatPrice(conservativeIV)}
                </div>
                <div className="text-[10px] text-[#86868B] font-mono mt-0.5">
                  성장률 {formatPercent(dcf.scenarios.conservative.growthRate)}
                </div>
              </div>

              {/* Base */}
              <div className="p-3 rounded-xl bg-white dark:bg-[#1C1C1E] border border-[#0071E3]/20 shadow-2xs">
                <div className="text-[10px] sm:text-[11px] font-bold text-[#0071E3] dark:text-[#2997FF]">기본 (Base)</div>
                <div className="text-xs sm:text-sm font-bold font-mono mt-1 text-[#1D1D1F] dark:text-[#F5F5F7] tabular-nums">
                  {formatPrice(baseIV)}
                </div>
                <div className="text-[10px] text-[#86868B] font-mono mt-0.5">
                  성장률 {formatPercent(dcf.scenarios.base.growthRate)}
                </div>
              </div>

              {/* Optimistic */}
              <div className="p-3 rounded-xl bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.06] shadow-2xs">
                <div className="text-[10px] sm:text-[11px] font-semibold text-[#86868B]">낙관적 (Optimistic)</div>
                <div className="text-xs sm:text-sm font-bold font-mono mt-1 text-[#34C759] tabular-nums">
                  {formatPrice(optimisticIV)}
                </div>
                <div className="text-[10px] text-[#86868B] font-mono mt-0.5">
                  성장률 {formatPercent(dcf.scenarios.optimistic.growthRate)}
                </div>
              </div>
            </div>

            {/* Assumptions strip */}
            <div className="pt-2 border-t border-black/[0.04] dark:border-white/[0.06] flex flex-wrap items-center justify-between text-[11px] text-[#86868B] font-mono gap-2">
              <div>
                정규화 주당주주이익(OEPS):{' '}
                <span className="font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tabular-nums">
                  {formatPrice(dcf.normalizedOeps)}
                </span>
              </div>
              <div>
                기본 성장률: <span className="font-bold tabular-nums">{formatPercent(dcf.baseGrowth)}</span>
              </div>
              <div>
                성장률 상한: <span className="font-bold tabular-nums">{formatPercent(dcf.growthCap)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.06] text-xs text-[#86868B] space-y-2">
            <p>
              {language === 'ko'
                ? '해당 종목은 금융업종이거나 필수 데이터가 부족하여 Owner Earnings DCF 밸류에이션 산출 대상에서 제외되었습니다.'
                : 'Owner Earnings DCF valuation is not applicable for this stock due to industry classification or missing inputs.'}
            </p>
          </div>
        )}

        {/* Reason Codes */}
        {dcf.reasonCodes && dcf.reasonCodes.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[11px] text-[#86868B] font-semibold block">Reason Codes:</span>
            <div className="flex flex-wrap gap-1.5">
              {dcf.reasonCodes.map((code, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-[#FF9500] bg-[#FF9500]/10 px-2.5 py-0.5 rounded-full"
                >
                  <Info className="w-3 h-3" />
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
              <span>DCF Valuation Warnings</span>
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
        <span>Method: {dcf.method}</span>
        <span>
          Confidence:{' '}
          <span
            className={`font-bold ${
              dcf.confidence === 'HIGH'
                ? 'text-[#34C759]'
                : dcf.confidence === 'MEDIUM'
                ? 'text-[#FF9500]'
                : 'text-[#86868B]'
            }`}
          >
            {dcf.confidence}
          </span>
        </span>
      </div>
    </div>
  );
};
