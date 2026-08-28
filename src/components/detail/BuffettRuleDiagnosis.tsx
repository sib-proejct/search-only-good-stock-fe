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
      return '∞';
    }
    if (metric.value === null || metric.value === undefined) {
      return '—';
    }
    switch (metric.unit) {
      case 'RATIO': {
        const pct = metric.value * 100;
        return `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`;
      }
      case 'MULTIPLE':
        return `${metric.value.toFixed(2)}x`;
      case 'CURRENCY':
        if (currency === 'USD') {
          return `$${metric.value.toLocaleString(undefined, {
            minimumFractionDigits: 1,
            maximumFractionDigits: 2,
          })}M`;
        }
        return `${metric.value.toLocaleString()}억`;
      case 'COUNT':
        return `${metric.value.toLocaleString()}`;
      default:
        return `${metric.value}`;
    }
  };

  const formatCriteria = (def?: RuleDefinitionDTO): string => {
    if (!def || !def.defaultThresholds || def.defaultThresholds.length === 0) {
      return '';
    }
    return def.defaultThresholds
      .map((th) => {
        const op = th.operator === 'GTE' ? '≥' : th.operator === 'LTE' ? '≤' : th.operator === 'GT' ? '>' : '<';
        let valStr = `${th.value}`;
        if (th.unit === 'RATIO') {
          valStr = `${(th.value * 100).toFixed(0)}%`;
        } else if (th.unit === 'MULTIPLE') {
          valStr = `${th.value.toFixed(1)}x`;
        } else if (th.unit === 'CURRENCY') {
          valStr = currency === 'USD' ? `$${th.value}` : `${th.value}원`;
        }
        return `${th.metricId} ${op} ${valStr}`;
      })
      .join(' · ');
  };

  const getStatusBadge = (status: RuleStatus) => {
    switch (status) {
      case 'PASS':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#34C759] bg-[#34C759]/10 dark:bg-[#34C759]/20 px-2.5 py-0.5 rounded-full border border-[#34C759]/20 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" />
            PASS
          </span>
        );
      case 'FAIL':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#FF3B30] bg-[#FF3B30]/10 dark:bg-[#FF3B30]/20 px-2.5 py-0.5 rounded-full border border-[#FF3B30]/20 font-mono">
            <XCircle className="w-3.5 h-3.5" />
            FAIL
          </span>
        );
      case 'N/A':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#86868B] bg-black/[0.04] dark:bg-white/[0.06] px-2.5 py-0.5 rounded-full border border-black/[0.06] dark:border-white/[0.08] font-mono">
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
              ? 'BE 공식 주식 분석 규칙 평가 결과 (최근 5개년 완료 데이터 기준)'
              : 'Official Backend Rule Evaluation Results (Based on 5-Year History)'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#F5F5F7] dark:bg-[#252528] border border-black/[0.04] dark:border-white/[0.06]">
            <span className="text-[#34C759]">{passCount} PASS</span>
            <span className="text-[#86868B]">·</span>
            <span className="text-[#FF3B30]">{failCount} FAIL</span>
            <span className="text-[#86868B]">·</span>
            <span className="text-[#86868B]">{naCount} N/A</span>
          </span>
        </div>
      </div>

      {/* 9 Rules Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {evaluations.map((evalItem, idx) => {
          const ruleDef = rulesMap.get(evalItem.ruleId);
          const ruleTitle = ruleDef?.name || evalItem.ruleId.replace(/_/g, ' ').toUpperCase();
          const criteriaText = formatCriteria(ruleDef);

          return (
            <div
              key={evalItem.ruleId}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                evalItem.status === 'PASS'
                  ? 'bg-[#FBFBFD] dark:bg-[#252528]/40 border-black/[0.04] dark:border-white/[0.06]'
                  : evalItem.status === 'FAIL'
                  ? 'bg-[#FF3B30]/[0.02] dark:bg-[#FF3B30]/[0.05] border-[#FF3B30]/20'
                  : 'bg-black/[0.01] dark:bg-white/[0.02] border-black/[0.04] dark:border-white/[0.04]'
              }`}
            >
              {/* Card Header: Number & Title & Status */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-mono text-[11px] font-bold text-[#86868B] shrink-0">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span
                      className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded tracking-wider shrink-0 font-mono ${
                        evalItem.category === 'CORE'
                          ? 'bg-[#0071E3]/10 text-[#0071E3] dark:bg-[#2997FF]/15 dark:text-[#2997FF]'
                          : 'bg-[#AF52DE]/10 text-[#AF52DE] dark:bg-[#BF5AF2]/15 dark:text-[#BF5AF2]'
                      }`}
                    >
                      {evalItem.category}
                    </span>
                  </div>
                  {getStatusBadge(evalItem.status)}
                </div>

                <h3 className="text-xs sm:text-[13px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7] leading-snug">
                  {ruleTitle}
                </h3>

                {criteriaText && (
                  <p className="text-[10px] text-[#86868B] font-mono mt-0.5 truncate" title={criteriaText}>
                    기준: {criteriaText}
                  </p>
                )}
              </div>

              {/* Metrics Values */}
              <div className="space-y-1.5 pt-2 border-t border-black/[0.04] dark:border-white/[0.06]">
                {evalItem.metrics && evalItem.metrics.length > 0 ? (
                  <div className="space-y-1">
                    {evalItem.metrics.slice(0, 4).map((m, mIdx) => (
                      <div key={mIdx} className="flex items-center justify-between text-[11px] gap-2">
                        <span className="font-mono text-[#86868B] truncate text-[10px]">
                          {m.metricId}
                        </span>
                        <span className="font-mono font-bold text-[#1D1D1F] dark:text-[#F5F5F7] shrink-0 tabular-nums">
                          {formatMetricValue(m)}
                        </span>
                      </div>
                    ))}
                    {evalItem.metrics.length > 4 && (
                      <div className="text-[10px] text-[#86868B] text-right font-mono">
                        +{evalItem.metrics.length - 4} more metric(s)
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-[11px] text-[#86868B] italic">No metric values</div>
                )}

                {/* Reason Codes for N/A */}
                {evalItem.reasonCodes && evalItem.reasonCodes.length > 0 && (
                  <div className="pt-1.5 space-y-1">
                    {evalItem.reasonCodes.map((code, cIdx) => (
                      <div
                        key={cIdx}
                        className="inline-flex items-center gap-1 text-[10px] font-medium text-[#FF9500] bg-[#FF9500]/10 px-2 py-0.5 rounded-md"
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
                <div className="text-[10px] text-[#86868B] font-mono flex items-center gap-1 pt-1">
                  <Calendar className="w-2.5 h-2.5" />
                  <span>
                    {evalItem.historyYears ? `${evalItem.historyYears}Y: ` : ''}
                    {evalItem.periodStart.slice(0, 4)} ~ {evalItem.periodEnd.slice(0, 4)}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
