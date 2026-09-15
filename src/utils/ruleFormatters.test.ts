import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { RuleMathFormula } from '../components/common/MathFormula';
import { getRuleAvailabilityLabel, formatCriteria, getCoreGradeInfo, getDcfWarningLabel, getRuleInfo, getRuleWarningLabel } from './ruleFormatters';
import type { RuleDefinitionDTO } from '../types/api';

describe('core assessment', () => {
  it.each(['ko', 'en'] as const)('uses the API status and all core counts in %s', (language) => {
    for (const status of ['PASS', 'FAIL', 'N/A'] as const) {
      const result = getCoreGradeInfo({ corePassCount: 5, coreFailCount: status === 'N/A' ? 0 : 1, coreNaCount: status === 'N/A' ? 1 : 0, coreStatus: status }, language);
      expect(result.grade).toBe(status);
      expect(result.passRatioText).toBe('5/6');
      if (status === 'PASS') expect(result.badgeLabel).toBe(language === 'ko' ? '기준 통과' : 'Criteria Passed');
    }
  });
  it('includes sector exclusions in the denominator without promoting N/A', () => {
    const result = getCoreGradeInfo({ corePassCount: 3, coreFailCount: 0, coreNaCount: 3, coreStatus: 'N/A' }, 'ko');
    expect(result.grade).toBe('N/A');
    expect(result.passRatioText).toBe('3/6');
    expect(getCoreGradeInfo({ corePassCount: 4, coreFailCount: 0, coreNaCount: 0, coreStatus: 'PASS' }, 'en').passRatioText).toBe('4/4');
  });
  it('explains estimated shares without exposing a warning code', () => {
    expect(getDcfWarningLabel('ESTIMATED_CURRENT_SHARES', 'ko')).toContain('연간 평균');
    expect(getDcfWarningLabel('UNKNOWN_WARNING', 'ko')).toBe('UNKNOWN_WARNING');
  });
});

function definition(ruleId: string): RuleDefinitionDTO {
  return {
    ruleId,
    name: ruleId,
    category: 'CORE',
    applicability: 'ALL',
    supportedHistoryYears: [3],
    defaultThresholds: [{ metricId: 'cash_conversion', operator: 'GTE', value: 0.6, unit: 'RATIO' }],
  };
}

describe('rule calculation explanations', () => {
  it.each(['ko', 'en'] as const)('keeps displayed default thresholds aligned in %s', (language) => {
    expect(getRuleInfo('debt_safety', language).subtitle).toContain('150%');
    const debtFormula = renderToStaticMarkup(createElement(RuleMathFormula, { ruleId: 'debt_safety', language }));
    expect(debtFormula).toContain('150.0%');
    expect(debtFormula).toContain('3.0x');
    expect(getRuleInfo('sustained_roe', language).subtitle).toContain('10%');
    expect(getRuleInfo('owner_earnings_quality', language).subtitle).toContain('60%');
  });
  it('includes conditions beyond a numeric threshold', () => {
    const criteria = formatCriteria(definition('owner_earnings_quality'), 'USD', 'ko');
    expect(criteria).toContain('60%');
    expect(criteria).toContain('최근·중앙값 주주이익 > 0');
    expect(criteria).toContain('누적 순이익 > 0');
    expect(formatCriteria(definition('retained_value_test'), 'USD', 'en')).toContain('BVPS CAGR > benchmark CAGR');
  });
  it('states two elapsed years for three annual EPS observations', () => {
    expect(formatCriteria(definition('eps_growth'), 'USD', 'ko')).toContain('경과 2년');
    expect(formatCriteria(definition('sustained_roe'), 'USD', 'ko')).toContain('3개년 매년');
    const fiveYear = { ...definition('eps_growth'), supportedHistoryYears: [5 as const] };
    expect(formatCriteria(fiveYear, 'USD', 'en')).toContain('4 elapsed years across 5 observations');
  });
  it('states the required yield spread in both languages', () => {
    expect(getRuleInfo('owner_earnings_yield', 'ko').subtitle).toContain('3%p');
    expect(getRuleInfo('owner_earnings_yield', 'en').subtitle).toContain('3 percentage points');
  });
  it('identifies missing annual data without exposing internal field names', () => {
    expect(getRuleWarningLabel('MISSING_ANNUAL_FIELD:2021:interest_bearing_debt', 'ko')).toBe('2021년 이자발생부채 총액을 확인할 수 없습니다.');
    expect(getRuleWarningLabel('MISSING_ANNUAL_YEAR:2020', 'en')).toContain('2020');
    expect(getRuleWarningLabel('NEW_WARNING', 'ko')).toBe('NEW_WARNING');
  });
});

describe('unavailable rule labels', () => {
  it('distinguishes sector exclusions, missing data and calculation limits', () => {
    const label = (reason: import('../types/api').ReasonCode) => getRuleAvailabilityLabel({ status: 'N/A', reasonCodes: [reason] }, 'ko');
    expect(label('FINANCIAL_SECTOR')).toBe('업종 제외');
    expect(label('MISSING_DATA')).toBe('자료 부족');
    expect(label('INSUFFICIENT_HISTORY')).toBe('이력 부족');
    expect(label('NON_POSITIVE_DENOMINATOR')).toBe('계산 불가');
    expect(getRuleAvailabilityLabel({ status: 'FAIL', reasonCodes: ['MISSING_DATA'] }, 'ko')).toBe('FAIL');
    expect(getRuleAvailabilityLabel({ status: 'N/A', reasonCodes: ['FINANCIAL_SECTOR'] }, 'en')).toBe('Sector excluded');
  });
});
