import { useState, useCallback } from 'react';
import { FilterRuleDefinition } from '../types/rules';
import { DEFAULT_BUFFETT_RULES, RULE_PRESETS } from '../config/defaultRules';
import { Stock } from '../types/stock';

export function useRuleEngine() {
  const [rules, setRules] = useState<FilterRuleDefinition[]>(DEFAULT_BUFFETT_RULES);
  const [activePresetId, setActivePresetId] = useState<string>('buffett_rules');

  // 규칙 필터값 변경
  const updateRuleValue = useCallback((ruleId: string, newValue: number | boolean) => {
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, currentValue: newValue } : r))
    );
    setActivePresetId(''); // 커스텀 조작 시 프리셋 선택 해제
  }, []);

  // 전략 프리셋 적용
  const applyPreset = useCallback((presetId: string) => {
    const preset = RULE_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setRules((prev) =>
      prev.map((rule) => {
        if (preset.filterValues[rule.id] !== undefined) {
          return { ...rule, currentValue: preset.filterValues[rule.id] };
        }
        return rule;
      })
    );
    setActivePresetId(presetId);
  }, []);

  // 모든 필터 기본값으로 리셋
  const resetRules = useCallback(() => {
    applyPreset('buffett_rules');
  }, [applyPreset]);

  // 새로운 커스텀 규칙 추가 (확장성 지원)
  const addCustomRule = useCallback((newRule: FilterRuleDefinition) => {
    setRules((prev) => [...prev, newRule]);
  }, []);

  // 종목이 현재 활성화된 모든 규칙을 통과하는지 평가하는 엔진
  const evaluateStock = useCallback(
    (stock: Stock): { passed: boolean; passedRuleCount: number; totalActiveRules: number; score: number } => {
      let passedCount = 0;
      let totalActive = 0;

      for (const rule of rules) {
        if (rule.currentValue === undefined) continue;
        totalActive++;

        let isRulePass = false;

        switch (rule.id) {
          case 'roe_5yr':
            isRulePass = stock.avgRoe5Yr >= (rule.currentValue as number);
            break;
          case 'roic_5yr':
            isRulePass = stock.avgRoic5Yr >= (rule.currentValue as number);
            break;
          case 'eps_cagr_5yr':
            isRulePass = stock.epsCagr5Yr >= (rule.currentValue as number);
            break;
          case 'one_dollar_test':
            isRulePass = (rule.currentValue as boolean) ? stock.oneDollarTest.passed : true;
            break;
          case 'debt_to_equity':
            isRulePass = stock.debtToEquity <= (rule.currentValue as number);
            break;
          case 'share_dilution':
            isRulePass = (rule.currentValue as boolean) ? stock.shareCountCagr5Yr <= 0 : true;
            break;
          case 'interest_coverage':
            isRulePass = stock.interestCoverage >= (rule.currentValue as number);
            break;
          case 'benchmark_bps_outperformance':
            isRulePass = (rule.currentValue as boolean) ? stock.bpsCagr5Yr >= stock.benchmarkBpsCagr5Yr : true;
            break;
          default:
            isRulePass = true;
            break;
        }

        if (isRulePass) {
          passedCount++;
        }
      }

      const score = totalActive > 0 ? Math.round((passedCount / totalActive) * 100) : 100;
      const passed = passedCount === totalActive;

      return {
        passed,
        passedRuleCount: passedCount,
        totalActiveRules: totalActive,
        score
      };
    },
    [rules]
  );

  return {
    rules,
    presets: RULE_PRESETS,
    activePresetId,
    updateRuleValue,
    applyPreset,
    resetRules,
    addCustomRule,
    evaluateStock,
  };
}
