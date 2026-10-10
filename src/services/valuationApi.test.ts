import { afterEach, describe, expect, it, vi } from 'vitest';
import { valuationRequest, type ValuationConditions } from './valuationApi';
import { stockApi } from './api';
import { valuationAmount, valuationPercent, valuationPrice, periodNote } from '../utils/valuationFormatters';

const conditions: ValuationConditions = {
  normalizationYears: 3, normalizationMethod: 'CONSERVATIVE', capexMode: 'TOTAL',
  growthMethod: 'LOWER_BOUND', growthRateCap: '.20', growthRateFloor: null,
};
afterEach(() => vi.unstubAllGlobals());
describe('published valuation contract', () => {
  it('sends validated conditions and base snapshot without editable fact selectors', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ periods: {} }) });
    vi.stubGlobal('fetch', fetchMock);
    const body = { baseSnapshotId: 42, conditions };
    await valuationRequest('ABC/B', 'NYSE', 'preview', body);
    expect(fetchMock.mock.calls[0][0]).toContain('/api/stocks/ABC%2FB/valuation/preview?market=NYSE');
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual(body);
    expect(fetchMock.mock.calls[0][1].method).toBe('POST');
  });
  it('uses the selected period for list filtering and sorting before pagination', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ items: [], total: 0 }) });
    vi.stubGlobal('fetch', fetchMock);
    await stockApi.getStocks({ years: 2, market: 'NASDAQ', valuationStatus: 'WATCH', sort: 'conservativeMarginOfSafety', order: 'desc', offset: 50 });
    const query = new URL(fetchMock.mock.calls[0][0], 'http://localhost').searchParams;
    expect(query.get('years')).toBe('2');
    expect(query.get('valuationStatus')).toBe('WATCH');
    expect(query.get('offset')).toBe('50');
  });
  it('surfaces publication conflicts', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 409, json: async () => ({ detail: 'Published data changed; reload and recalculate' }) }));
    await expect(valuationRequest('AAPL', 'NASDAQ', 'apply', { baseSnapshotId: 1, conditions })).rejects.toThrow('Published data changed');
  });
  it('keeps unavailable, negative margins and currencies distinct', () => {
    expect(valuationPrice(null, 'KRW')).toBe('—');
    expect(valuationPrice(1234.56, 'KRW')).toBe('1,235원');
    expect(valuationPrice(12.345, 'USD')).toBe('$12.35');
    expect(valuationPercent(-.25)).toBe('-25.0%');
    expect(valuationPercent(null)).toBe('—');
    expect(periodNote(undefined, false)).toContain('supplementation');
  });
  it('groups won amounts without losing lower units', () => {
    expect(valuationAmount(1_234_500_006_789, 'KRW')).toBe('1조 2345억 6789원');
    expect(valuationAmount(1_234_556_786_789, 'KRW')).toBe('1조 2345억 5678만 6789원');
    expect(valuationAmount(2_000_000_000_000, 'KRW')).toBe('2조원');
    expect(valuationAmount(-520_000_000, 'KRW')).toBe('-5억 2000만원');
    expect(valuationAmount(0, 'KRW')).toBe('0원');
    expect(valuationAmount(null, 'KRW')).toBe('—');
    expect(valuationAmount(85_400_000, 'USD')).toBe('$85.4M');
    expect(valuationPrice(116_800, 'KRW')).toBe('11만 6800원');
    expect(valuationPrice(99_999_999.6, 'KRW')).toBe('1억원');
  });
});
