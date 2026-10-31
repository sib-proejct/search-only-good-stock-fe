import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { DcfResultDTO } from '../../types/api';
import { FinancialValuationDetails } from './FinancialValuationDetails';
import { growthUnavailableNote } from '../../utils/valuationFormatters';

vi.mock('../../context/ThemeLanguageContext', () => ({
  useAppConfig: () => ({ language: 'ko' }),
}));

const dcf: DcfResultDTO = {
  method: 'FINANCIAL_FCFE_DCF', status: 'WATCH', historyYears: 1,
  normalizedOwnerEarnings: null, normalizedOeps: null,
  normalizedNetIncome: 15, normalizedEps: 1.5, normalizedRoe: .1,
  epsGrowth: .05, oepsGrowth: null, rawGrowth: .05,
  growthCap: .1, baseGrowth: .05, discountRate: .08,
  scenarios: null, currentPrice: 10, conservativeMarginOfSafety: null,
  confidence: 'LOW', reasonCodes: [], warnings: ['REGULATORY_CAPITAL_PROXY'],
};

describe('financial valuation evidence', () => {
  it('shows financial inputs and average equity instead of owner earnings', () => {
    const html = renderToStaticMarkup(<FinancialValuationDetails dcf={dcf} currency="USD" annuals={[
      { year: 2024, netIncome: 15, equity: 100 },
      { year: 2025, netIncome: 15, equity: 200 },
    ]} />);
    expect(html).toContain('금융업 순이익 기반 DCF');
    expect(html).toContain('FCFE/주');
    expect(html).toContain('$150');
    expect(html).toContain('10.0%');
    expect(html).not.toContain('Owner Earnings');
  });

  it('does not treat unused OEPS history as missing financial growth', () => {
    expect(growthUnavailableNote({
      years: 1, dcf, normalizationTargetYears: [2025], normalizationUsedYears: [2025],
      growthTargetYears: [2024, 2025], epsGrowthUsedYears: [2024, 2025],
      oepsGrowthUsedYears: [], missingReasons: [],
    }, true)).toBe('');
  });
});
