import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  calculateAdminValuation,
  changedValues,
  fieldDisplay,
  fieldValue,
  type BulkRecalculateResponse,
  type EditorField,
  type FactRow,
  type ValuationOptions,
  type ValuationResult,
} from './adminApi';

afterEach(() => vi.unstubAllGlobals());

const bondField: EditorField = {
  name: 'ten_year_bond_yield',
  kind: 'number',
  required: false,
  choices: [],
};

describe('administrator fact values', () => {
  it('converts percentage input to stored ratio and back', () => {
    expect(fieldValue(bondField, '4.25')).toBe('0.0425');
    expect(fieldDisplay(bondField.name, '0.0425')).toBe('4.25');
    expect(fieldValue(bondField, '')).toBeNull();
    expect(fieldValue(bondField, '0')).toBe('0');
  });
  it('preserves large amounts as decimal strings', () => {
    expect(
      fieldValue({ ...bondField, name: 'cfo' }, '12345678901234567890'),
    ).toBe('12345678901234567890');
  });
  it('sends only changes and distinguishes explicit null from zero', () => {
    expect(
      changedValues(
        { cfo: null, growth_capex_estimate: '0', provider: 'DART' },
        { cfo: '100', growth_capex_estimate: null, provider: 'DART' },
      ),
    ).toEqual({ cfo: null, growth_capex_estimate: '0' });
  });
  it('normalizes scientific notation in fieldDisplay for inputs', () => {
    expect(fieldDisplay('cfo', '1.1430100E+11')).toBe('114301000000');
  });
});

type AnnualFact = Extract<FactRow, { fiscal_year: number }>;

const calculationOptions: ValuationOptions = {
  publish: true, as_of: '2025-01-15', statement_scope: 'CFS', capex_mode: 'TOTAL',
  normalization_years: 3, normalization_method: 'CONSERVATIVE',
  growth_method: 'OEPS_WEIGHTED', growth_rate_cap: '0.20', growth_rate_floor: '0.05',
};

function annualFact(year: number, values: Partial<AnnualFact> = {}): AnnualFact {
  return {
    id: year, stock_id: 7, source_type: 'MANUAL', created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z', fiscal_year: year, statement_scope: 'CFS',
    period_end: `${year}-12-31`, filed_at: null, currency: 'KRW',
    ebit: '100', net_income_common: '50', ...values,
  };
}

function calculationResult(years = [2021, 2022, 2023]): ValuationResult {
  return {
    published: true, options: {
      ...calculationOptions, growth_rate_cap: '0.20', growth_rate_floor: '0.05',
    },
    annual_oe: years.map((fiscal_year) => ({
      fiscal_year, capex_source: 'reported_total', selected: true,
      diluted_eps: null, diluted_shares: null, capex: null, owner_earnings: null,
    })),
    dcf: {
      status: 'N/A', method: 'OWNER_EARNINGS_DCF', historyYears: null,
      normalizedOwnerEarnings: null, normalizedOeps: null, rawGrowth: null,
      growthCap: null, baseGrowth: null, discountRate: null, scenarios: null,
      currentPrice: 100, conservativeMarginOfSafety: null, confidence: 'LOW',
      reasonCodes: ['PREREQUISITE_FAILED'], warnings: [],
    },
  };
}

function mockCalculation(facts: AnnualFact[], result = calculationResult()) {
  const fetchMock = vi.fn()
    .mockResolvedValueOnce({ ok: true, json: async () => facts })
    .mockResolvedValueOnce({ ok: true, json: async () => result });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('administrator valuation evidence', () => {
  it('fetches annual facts independently and retains evidence after editor changes', async () => {
    const facts = [annualFact(2021, { ebit: '-10' }), annualFact(2022), annualFact(2023)];
    const fetchMock = mockCalculation(facts);
    const options = { ...calculationOptions };
    const pending = calculateAdminValuation(7, options);
    options.statement_scope = 'OFS';
    options.as_of = '2026-01-01';
    const result = await pending;
    expect(fetchMock.mock.calls[0][0]).toContain('/api/admin/facts/annual_financial_fact?stock_id=7');
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual(calculationOptions);
    facts[0].ebit = '100';
    facts.length = 0;
    expect(result.earningsPowerFailures).toEqual([{ fiscalYear: 2021, ebit: -10, netIncome: 50 }]);
    expect(result.options.statement_scope).toBe('CFS');
  });

  it('excludes future periods and later filings from a historical calculation', async () => {
    mockCalculation([
      annualFact(2021, { ebit: '-10' }), annualFact(2022), annualFact(2023),
      annualFact(2024, { filed_at: '2025-03-01' }),
      annualFact(2025, { filed_at: null }),
      annualFact(2021, { statement_scope: 'OFS' }),
    ]);
    const result = await calculateAdminValuation(7, calculationOptions);
    expect(result.earningsPowerFailures).toEqual([{ fiscalYear: 2021, ebit: -10, netIncome: 50 }]);
  });

  it('uses the returned scope and includes dates equal to the cutoff or missing filings', async () => {
    const response = calculationResult([2022, 2023, 2024]);
    response.options.statement_scope = 'CONSOLIDATED_US_GAAP';
    mockCalculation([
      annualFact(2022, { statement_scope: 'CONSOLIDATED_US_GAAP', ebit: '0' }),
      annualFact(2023, { statement_scope: 'CONSOLIDATED_US_GAAP', net_income_common: '-20' }),
      annualFact(2024, { statement_scope: 'CONSOLIDATED_US_GAAP', period_end: '2025-01-15', filed_at: '2025-01-15', ebit: '-30' }),
      annualFact(2024),
    ], response);
    const result = await calculateAdminValuation(7, calculationOptions);
    expect(result.earningsPowerFailures).toEqual([
      { fiscalYear: 2022, ebit: 0, netIncome: 50 },
      { fiscalYear: 2023, ebit: 100, netIncome: -20 },
      { fiscalYear: 2024, ebit: -30, netIncome: 50 },
    ]);
  });

  it('does not substitute older years for gaps in the required consecutive window', async () => {
    mockCalculation([
      annualFact(2020, { ebit: '-10' }), annualFact(2022), annualFact(2023),
    ], calculationResult([2020, 2022, 2023]));
    expect((await calculateAdminValuation(7, calculationOptions)).earningsPowerFailures).toEqual([]);
  });

  it('does not mark a year with an incomplete metric pair as a failed year', async () => {
    mockCalculation([
      annualFact(2021, { ebit: '-10', net_income_common: null }),
      annualFact(2022, { net_income_common: '0' }), annualFact(2023),
    ]);
    expect((await calculateAdminValuation(7, calculationOptions)).earningsPowerFailures)
      .toEqual([{ fiscalYear: 2022, ebit: 100, netIncome: 0 }]);
  });

  it('does not attach failures when DCF was excluded for another reason', async () => {
    const response = calculationResult();
    response.dcf!.reasonCodes = ['FINANCIAL_SECTOR'];
    mockCalculation([annualFact(2021, { ebit: '-10' }), annualFact(2022), annualFact(2023)], response);
    expect((await calculateAdminValuation(7, calculationOptions)).earningsPowerFailures).toEqual([]);
  });

  it('posts bulk recalculation request and receives response', async () => {
    const { bulkRecalculateValuation } = await import('./adminApi');
    const mockResponse: BulkRecalculateResponse = {
      totalStocks: 1,
      recalculatedCount: 1,
      appliedCount: 1,
      failedCount: 0,
      conditions: {
        normalizationYears: 5,
        normalizationMethod: 'CONSERVATIVE',
        capexMode: 'TOTAL',
        growthMethod: 'OEPS_WEIGHTED',
        growthRateCap: '0.20',
        growthRateFloor: '0.05',
      },
      items: [
        {
          ticker: 'AAPL',
          name: 'Apple',
          market: 'NASDAQ',
          changed: true,
          status: 'PASS_WITH_MARGIN',
          intrinsicValuePerShare: 150,
          conservativeMarginOfSafety: 0.25,
          epsGrowth: 0.1,
          oepsGrowth: 0.1,
        },
      ],
    };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      }),
    );

    const res = await bulkRecalculateValuation({
      conditions: mockResponse.conditions,
      apply: true,
    });
    expect(res.totalStocks).toBe(1);
    expect(res.recalculatedCount).toBe(1);
    expect(res.items[0].ticker).toBe('AAPL');
  });
});
