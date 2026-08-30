import React from 'react';
import {
  Currency,
  MetricValueDTO,
  ReasonCode,
  RuleDefinitionDTO,
  RuleEvaluationDTO,
  RuleStatus,
} from '../../types/api';
import { useAppConfig } from '../../context/ThemeLanguageContext';
import {
  getCategoryBadgeLabel,
  formatCriteria,
  getMetricLabel,
  getRuleInfo,
} from '../../utils/ruleFormatters';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle,
  Info,
  Calendar,
} from 'lucide-react';

interface BuffettRuleDiagnosisProps {
  evaluations: RuleEvaluationDTO[];
  rulesMap: Map<string, RuleDefinitionDTO>;
  currency: Currency;
}

export const BuffettRuleDiagnosis: React.FC<BuffettRuleDiagnosisProps> = ({
  evaluations,
  rulesMap,
  currency,
}) => {
  const { t, language } = useAppConfig();

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

  const formatMetricValue = (metric: MetricValueDTO): string => {
    if (metric.specialValue === 'INFINITY') {
      return '∞ (무차입/이자0)';
    }
    if (metric.value === null || metric.value === undefined) {
      return '—';
    }
    const valNum = typeof metric.value === 'string' ? parseFloat(metric.value) : metric.value;
    if (isNaN(valNum)) return '—';
    switch (metric.unit) {
      case 'RATIO': {
        const pct = valNum * 100;
        return `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`;
      }
      case 'MULTIPLE':
        return `${valNum.toFixed(2)}x`;
      case 'CURRENCY':
        if (currency === 'USD') {
          if (Math.abs(valNum) >= 1_000_000_000_000) return `$${(valNum / 1_000_000_000_000).toFixed(1)}T`;
          if (Math.abs(valNum) >= 1_000_000_000) return `$${(valNum / 1_000_000_000).toFixed(1)}B`;
          if (Math.abs(valNum) >= 1_000_000) return `$${(valNum / 1_000_000).toFixed(1)}M`;
          return `$${valNum.toLocaleString()}`;
        }
        if (Math.abs(valNum) >= 1_000_000_000_000) return `${(valNum / 1_000_000_000_000).toFixed(1)}조원`;
        if (Math.abs(valNum) >= 100_000_000) return `${(valNum / 100_000_000).toFixed(1)}억원`;
        return `${valNum.toLocaleString()}원`;
      case 'COUNT':
        return `${valNum.toLocaleString()}`;
      default:
        return `${valNum}`;
    }
  };

  const getStatusBadge = (status: RuleStatus) => {
    switch (status) {
      case 'PASS':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#34C759] font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" />
            PASS
          </span>
        );
      case 'FAIL':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#FF3B30] font-mono">
            <XCircle className="w-3.5 h-3.5" />
            FAIL
          </span>
        );
      case 'N/A':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#86868B] font-mono">
            <HelpCircle className="w-3.5 h-3.5" />
            N/A
          </span>
        );
    }
  };

  const passCount = evaluations.filter((e) => e.status === 'PASS').length;
  const failCount = evaluations.filter((e) => e.status === 'FAIL').length;
  const naCount = evaluations.filter((e) => e.status === 'N/A').length;

  return (
    <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 sm:p-7 border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex flex-col space-y-6 transition-colors duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-black/[0.04] dark:border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#0071E3] dark:text-[#2997FF]" />
            <h2 className="text-base sm:text-lg font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
              {t('buffett6RuleDiagnosis')}
            </h2>
          </div>
          <p className="text-xs text-[#86868B] mt-1 font-normal">
            {language === 'ko'
              ? '워런 버핏의 경제적 해자 및 재무 안전성 11대 원칙 정밀 진단 결과'
              : 'Warren Buffett 11-Pillar Economic Moat & Safety Diagnosis Results'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#86868B]">
            <span className="text-[#34C759]">{passCount} PASS</span>
            <span>·</span>
            <span className="text-[#FF3B30]">{failCount} FAIL</span>
            <span>·</span>
            <span>{naCount} N/A</span>
          </span>
        </div>
      </div>

      {/* Rules Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {evaluations.map((evalItem, idx) => {
          const ruleDef = rulesMap.get(evalItem.ruleId);
          const ruleInfo = getRuleInfo(evalItem.ruleId, language, ruleDef?.name);
          const criteriaText = formatCriteria(ruleDef, currency, language);
          const categoryLabel = getCategoryBadgeLabel(evalItem.category, language);

          return (
            <div
              key={evalItem.ruleId}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${evalItem.status === 'PASS'
                  ? 'bg-[#FBFBFD] dark:bg-[#252528]/40 border-black/[0.04] dark:border-white/[0.06]'
                  : evalItem.status === 'FAIL'
                    ? 'bg-[#FF3B30]/[0.02] dark:bg-[#FF3B30]/[0.05] border-[#FF3B30]/20'
                    : 'bg-black/[0.01] dark:bg-white/[0.02] border-black/[0.04] dark:border-white/[0.04]'
                }`}
            >
              {/* Card Header: Number & Category Badge & Status */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-mono text-[11px] font-bold text-[#86868B] shrink-0">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider shrink-0 font-mono ${evalItem.category === 'CORE'
                          ? 'text-[#0071E3] dark:text-[#2997FF]'
                          : 'text-[#AF52DE] dark:text-[#BF5AF2]'
                        }`}
                    >
                      {categoryLabel}
                    </span>
                  </div>
                  {getStatusBadge(evalItem.status)}
                </div>

                {/* Friendly Title & Subtitle */}
                <h3 className="text-xs sm:text-[13px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7] leading-snug">
                  {ruleInfo.title}
                </h3>
                <p className="text-[11px] text-[#86868B] mt-0.5 leading-normal">
                  {ruleInfo.subtitle}
                </p>

                {/* Criteria */}
                {criteriaText && (
                  <div className="mt-2 text-[10px] text-[#6E6E73] dark:text-[#86868B] font-mono truncate" title={criteriaText}>
                    <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                      {language === 'ko' ? '판정 기준' : 'Criteria'}:
                    </span>{' '}
                    {criteriaText}
                  </div>
                )}
              </div>

              {/* Metrics Values */}
              <div className="space-y-1.5 pt-2 border-t border-black/[0.04] dark:border-white/[0.06]">
                {evalItem.metrics && evalItem.metrics.length > 0 ? (
                  <div className="space-y-1 max-h-48 overflow-y-auto pr-0.5">
                    {evalItem.metrics.map((m, mIdx) => {
                      const metricLabel = getMetricLabel(m.metricId, language);
                      return (
                        <div
                          key={mIdx}
                          className="flex items-center justify-between text-[11px] gap-2 py-0.5"
                        >
                          <span className="text-[#6E6E73] dark:text-[#86868B] truncate text-[11px] font-medium">
                            {metricLabel}
                          </span>
                          <span className="font-mono font-bold text-[#1D1D1F] dark:text-[#F5F5F7] shrink-0 tabular-nums">
                            {formatMetricValue(m)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-[11px] text-[#86868B] italic py-1">
                    {language === 'ko' ? '평가 세부 지표 없음' : 'No metric values'}
                  </div>
                )}

                {/* Reason Codes for N/A */}
                {evalItem.reasonCodes && evalItem.reasonCodes.length > 0 && (
                  <div className="pt-1.5 flex flex-wrap gap-2">
                    {evalItem.reasonCodes.map((code, cIdx) => (
                      <div
                        key={cIdx}
                        className="inline-flex items-center gap-1 text-[10px] font-medium text-[#FF9500]"
                      >
                        <Info className="w-3 h-3 shrink-0" />
                        <span>{getReasonLabel(code)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Rule-specific Warnings */}
                {evalItem.warnings && evalItem.warnings.length > 0 && (
                  <div className="pt-1 space-y-1">
                    {evalItem.warnings.map((warn, wIdx) => (
                      <div
                        key={wIdx}
                        className="flex items-start gap-1 text-[10px] text-[#FF9500] leading-tight"
                      >
                        <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                        <span>{warn}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer: Evaluation Period */}
              {evalItem.periodStart && evalItem.periodEnd && (
                <div className="text-[10px] text-[#86868B] font-mono flex items-center justify-between pt-1 border-t border-black/[0.03] dark:border-white/[0.03]">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-2.5 h-2.5" />
                    <span>
                      {language === 'ko'
                        ? `${evalItem.historyYears ? `${evalItem.historyYears}개년: ` : ''}${evalItem.periodStart.slice(0, 4)}년 ~ ${evalItem.periodEnd.slice(0, 4)}년`
                        : `${evalItem.historyYears ? `${evalItem.historyYears}Y: ` : ''}${evalItem.periodStart.slice(0, 4)} ~ ${evalItem.periodEnd.slice(0, 4)}`}
                    </span>
                  </div>
                  <span className="text-[9px] text-[#86868B] font-mono">{evalItem.ruleId}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
