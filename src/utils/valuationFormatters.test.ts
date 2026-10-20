import { describe, expect, it } from 'vitest';
import {
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
  it('returns green for ratio <= 80%', () => {
    expect(priceToValueColor(80000, 100000)).toBe('text-[#34C759]');
    expect(priceToValueColor(70000, 100000)).toBe('text-[#34C759]');
  });

  it('returns blue for ratio > 80% and <= 100%', () => {
    expect(priceToValueColor(85000, 100000)).toBe('text-[#0071E3] dark:text-[#2997FF]');
    expect(priceToValueColor(100000, 100000)).toBe('text-[#0071E3] dark:text-[#2997FF]');
  });

  it('returns red for ratio > 100%', () => {
    expect(priceToValueColor(105000, 100000)).toBe('text-[#FF3B30]');
  });

  it('returns muted gray for missing values', () => {
    expect(priceToValueColor(null, 100000)).toBe('text-[#86868B]');
    expect(priceToValueColor(80000, null)).toBe('text-[#86868B]');
    expect(priceToValueColor(80000, 0)).toBe('text-[#86868B]');
  });
});
