import { describe, expect, it } from 'vitest';
import {
  getLowestIntrinsicValue,
  priceToValueColor,
  valuationPriceToValueRatio,
} from './valuationFormatters';

describe('valuationPriceToValueRatio', () => {
  it('formats valid price to intrinsic value ratio', () => {
    expect(valuationPriceToValueRatio(80000, 100000)).toBe('80.0%');
    expect(valuationPriceToValueRatio(120000, 100000)).toBe('120.0%');
    expect(valuationPriceToValueRatio(75300, 100000)).toBe('75.3%');
  });

  it('returns dash when price or value is missing or non-positive', () => {
    expect(valuationPriceToValueRatio(null, 100000)).toBe('—');
    expect(valuationPriceToValueRatio(80000, null)).toBe('—');
    expect(valuationPriceToValueRatio(80000, 0)).toBe('—');
    expect(valuationPriceToValueRatio(80000, -50000)).toBe('—');
  });
});

describe('priceToValueColor', () => {
  it('returns green for ratio <= 120%', () => {
    expect(priceToValueColor(80000, 100000)).toBe('text-[#34C759]');
    expect(priceToValueColor(100000, 100000)).toBe('text-[#34C759]');
    expect(priceToValueColor(120000, 100000)).toBe('text-[#34C759]');
  });

  it('returns red for ratio > 120%', () => {
    expect(priceToValueColor(120100, 100000)).toBe('text-[#FF3B30]');
    expect(priceToValueColor(150000, 100000)).toBe('text-[#FF3B30]');
  });

  it('returns muted gray for missing values', () => {
    expect(priceToValueColor(null, 100000)).toBe('text-[#86868B]');
    expect(priceToValueColor(80000, null)).toBe('text-[#86868B]');
    expect(priceToValueColor(80000, 0)).toBe('text-[#86868B]');
  });
});

describe('getLowestIntrinsicValue', () => {
  it('finds the lowest positive intrinsic value among 5 years', () => {
    const periodValuations = {
      '1': { dcf: { scenarios: { base: { intrinsicValuePerShare: 120000 } } } },
      '2': { dcf: { scenarios: { base: { intrinsicValuePerShare: 95000 } } } },
      '3': { dcf: { scenarios: { base: { intrinsicValuePerShare: 80000 } } } },
      '4': { dcf: { scenarios: { base: { intrinsicValuePerShare: 110000 } } } },
      '5': { dcf: { scenarios: { base: { intrinsicValuePerShare: 85000 } } } },
    };
    expect(getLowestIntrinsicValue(periodValuations)).toEqual({
      minIntrinsicValue: 80000,
      minYear: 3,
    });
  });

  it('skips non-positive, null, or undefined values', () => {
    const periodValuations = {
      '1': { dcf: { scenarios: { base: { intrinsicValuePerShare: 0 } } } },
      '2': { dcf: { scenarios: { base: { intrinsicValuePerShare: -5000 } } } },
      '3': { dcf: { scenarios: { base: { intrinsicValuePerShare: 70000 } } } },
      '4': { dcf: { scenarios: { base: { intrinsicValuePerShare: null } } } },
      '5': undefined,
    };
    expect(getLowestIntrinsicValue(periodValuations)).toEqual({
      minIntrinsicValue: 70000,
      minYear: 3,
    });
  });

  it('returns nulls when periodValuations is undefined or contains no positive values', () => {
    expect(getLowestIntrinsicValue(undefined)).toEqual({
      minIntrinsicValue: null,
      minYear: null,
    });
    expect(getLowestIntrinsicValue({})).toEqual({
      minIntrinsicValue: null,
      minYear: null,
    });
    expect(getLowestIntrinsicValue({
      '1': { dcf: { scenarios: { base: { intrinsicValuePerShare: 0 } } } },
      '2': { dcf: { scenarios: { base: { intrinsicValuePerShare: null } } } },
    })).toEqual({
      minIntrinsicValue: null,
      minYear: null,
    });
  });
});

