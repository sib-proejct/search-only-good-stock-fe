import React from 'react';
import {
  CapitalActionEvaluationDTO,
  CapitalActionStatus,
  Currency,
  ReasonCode,
} from '../../types/api';
import { useAppConfig } from '../../context/ThemeLanguageContext';
import {
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ShieldAlert,
  Info,
  Calendar,
} from 'lucide-react';

interface CapitalActionCardProps {
  capitalAction: CapitalActionEvaluationDTO;
  currency?: Currency;
}

export const CapitalActionCard: React.FC<CapitalActionCardProps> = ({
  capitalAction,
}) => {
  const { t, language } = useAppConfig();
  const isKo = language === 'ko';

  const getStatusBadge = (status: CapitalActionStatus) => {
    switch (status) {
      case 'STABLE':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#34C759] font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isKo ? '안정 (STABLE)' : 'STABLE'}</span>
          </span>
        );
      case 'REVIEW_DILUTION':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF9500] font-mono">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{isKo ? '희석 검토 (DILUTION)' : 'REVIEW DILUTION'}</span>
          </span>
        );
      case 'REVIEW_BUYBACK_PRICE':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#AF52DE] font-mono">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>{isKo ? '자사주단가 검토' : 'REVIEW BUYBACK'}</span>
          </span>
        );
      case 'N/A':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#86868B] font-mono">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{isKo ? '평가 불가 (N/A)' : 'N/A'}</span>
          </span>
        );
    }
  };

  const getStatusDescription = (status: CapitalActionStatus) => {
    switch (status) {
      case 'STABLE':
        return isKo
          ? '최근 5개년 희석주식수가 안정적이거나 감소하여, 기존 주주의 지분 가치가 충실히 보존되고 있습니다.'
          : 'Diluted shares outstanding have remained stable or decreased over the last 5 years, preserving shareholder equity.';
      case 'REVIEW_DILUTION':
        return isKo
          ? '신주 발행, 유상증자 또는 과도한 임직원 스톡옵션 행사로 인해 주당 가치가 희석될 위험이 있으므로 검토가 필요합니다.'
          : 'Share count has increased via new share issuance or stock-based compensation, which may dilute per-share shareholder value.';
      case 'REVIEW_BUYBACK_PRICE':
        return isKo
          ? '자사주 매입이 내재가치 대비 고평가된 가격에 집행되었을 가능성이 있어 자본배치 효율성 검토가 필요합니다.'
          : 'Share buybacks may have been executed at valuations above intrinsic value, requiring capital allocation review.';
      case 'N/A':
      default:
        return isKo
          ? '자본행동 평가에 필요한 주식수 이력 또는 데이터가 불충분하여 평가를 완료할 수 없습니다.'
          : 'Insufficient historical share data to evaluate capital action behavior.';
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

  const dilutionMetric = capitalAction.metrics?.find((m) => m.metricId === 'diluted_share_cagr');

  return (
    <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 sm:p-7 border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex flex-col justify-between h-full space-y-5 transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-black/[0.04] dark:border-white/[0.06]">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
            {isKo ? '자본배치 및 주식 희석 검토 (Capital Action Review)' : t('capitalAllocationTitle')}
          </h2>
          <p className="text-xs text-[#86868B] mt-0.5 font-normal">
            {isKo
              ? '워런 버핏 소유주 원칙 기반 자본배치 효율성 및 주당가치 희석 점검'
              : 'Warren Buffett Capital Allocation & Share Dilution Review'}
          </p>
        </div>
        <div>{getStatusBadge(capitalAction.status)}</div>
      </div>

      {/* Main Metric & Status Summary */}
      <div className="space-y-4">
        <div className="p-4 rounded-2xl bg-[#FBFBFD] dark:bg-[#252528]/50 border border-black/[0.03] dark:border-white/[0.04] space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-semibold text-[#86868B]">
              {isKo ? '5개년 희석주식수 연평균 증감률 (5Y CAGR)' : '5-Year Diluted Shares CAGR'}
            </span>
            <span className="font-mono text-xl sm:text-2xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tabular-nums">
              {dilutionMetric && dilutionMetric.value !== null
                ? `${(dilutionMetric.value * 100).toFixed(2)}%`
                : '—'}
            </span>
          </div>

          <p className="text-xs text-[#6E6E73] dark:text-[#86868B] leading-relaxed pt-1">
            {getStatusDescription(capitalAction.status)}
          </p>
        </div>

        {/* Reason Codes */}
        {capitalAction.reasonCodes && capitalAction.reasonCodes.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[11px] text-[#86868B] font-semibold block">
              {isKo ? '평가 사유 코드:' : 'Reason Codes:'}
            </span>
            <div className="flex flex-wrap gap-2">
              {capitalAction.reasonCodes.map((code, idx) => (
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

        {/* Warnings Alert */}
        {capitalAction.warnings && capitalAction.warnings.length > 0 && (
          <div className="p-3.5 rounded-xl bg-[#FF9500]/10 border border-[#FF9500]/20 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#C93400] dark:text-[#FF9500]">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{isKo ? '자본행동 주의 경고' : 'Capital Action Warning'}</span>
            </div>
            {capitalAction.warnings.map((warn, idx) => (
              <p key={idx} className="text-xs text-[#86868B] leading-relaxed">
                {warn}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      {capitalAction.periodStart && capitalAction.periodEnd && (
        <div className="pt-2 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between text-[11px] text-[#86868B] font-mono">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>
              {isKo
                ? `${capitalAction.historyYears ? `${capitalAction.historyYears}개년: ` : ''}${capitalAction.periodStart.slice(0, 4)}년 ~ ${capitalAction.periodEnd.slice(0, 4)}년`
                : `${capitalAction.historyYears ? `${capitalAction.historyYears}Y: ` : ''}${capitalAction.periodStart.slice(0, 4)} ~ ${capitalAction.periodEnd.slice(0, 4)}`}
            </span>
          </div>
          <span className="text-[10px] text-[#86868B]">{isKo ? '자본행동 규칙 (capital_action_flag)' : 'ruleId: capital_action_flag'}</span>
        </div>
      )}
    </div>
  );
};
