import { describe, expect, it } from 'vitest';
import {
  formatFieldPreview,
  formatMonetaryAmount,
  formatPerShare,
  formatShares,
  normalizeScientificNotation,
} from './numberFormatters';

describe('numberFormatters', () => {
  it('normalizes scientific notation to clean decimal string', () => {
    expect(normalizeScientificNotation('1.1430100E+11')).toBe('114301000000');
    expect(normalizeScientificNotation('1.5e3')).toBe('1500');
    expect(normalizeScientificNotation('-2.4E+8')).toBe('-240000000');
    expect(normalizeScientificNotation('12345')).toBe('12345');
    expect(normalizeScientificNotation('')).toBe('');
    expect(normalizeScientificNotation(null)).toBe('');
  });

  describe('formatMonetaryAmount', () => {
    it('formats KRW in 억 and 조 with commas', () => {
      // 1.1430100E+11 = 114,301,000,000 (약 1,143.01억 원)
      expect(formatMonetaryAmount('1.1430100E+11', 'KRW')).toBe('1,143.01억 원');
      expect(formatMonetaryAmount(114301000000, 'KRW')).toBe('1,143.01억 원');

      // 1조 2,500억 원
      expect(formatMonetaryAmount(1_250_000_000_000, 'KRW')).toBe('1조 2,500억 원');

      // 2조 원 (딱 떨어지는 경우)
      expect(formatMonetaryAmount(2_000_000_000_000, 'KRW')).toBe('2조 원');

      // 1억 미만
      expect(formatMonetaryAmount(50_000_000, 'KRW')).toBe('50,000,000원');

      // 음수
      expect(formatMonetaryAmount(-520_000_000, 'KRW')).toBe('-5.2억 원');
    });

    it('formats USD in M, B, T', () => {
      // $114.30B
      expect(formatMonetaryAmount('1.1430100E+11', 'USD')).toBe('$114.3B');
      expect(formatMonetaryAmount(114_301_000_000, 'USD')).toBe('$114.3B');

      // $85.40M
      expect(formatMonetaryAmount(85_400_000, 'USD')).toBe('$85.4M');

      // $1.50T
      expect(formatMonetaryAmount(1_500_000_000_000, 'USD')).toBe('$1.5T');

      // Under $1M
      expect(formatMonetaryAmount(500_000, 'USD')).toBe('$500,000');
    });
  });

  describe('formatPerShare', () => {
    it('formats KRW and USD per share prices', () => {
      expect(formatPerShare(72500, 'KRW')).toBe('72,500원');
      expect(formatPerShare(182.5, 'USD')).toBe('$182.50');
      expect(formatPerShare('5420.5', 'KRW')).toBe('5,420.5원');
    });
  });

  describe('formatShares', () => {
    it('formats share counts', () => {
      expect(formatShares(125_000_000)).toBe('1.25억 주');
      expect(formatShares(25_000)).toBe('2.5만 주');
      expect(formatShares(500)).toBe('500주');
    });
  });

  describe('formatFieldPreview', () => {
    it('provides real-time human readable previews for admin forms', () => {
      expect(formatFieldPreview('cfo', '1.1430100E+11', 'KRW')).toBe(
        '약 1,143.01억 원 (114,301,000,000 KRW)',
      );
      expect(formatFieldPreview('cfo', '8.54E+7', 'USD')).toBe(
        '약 $85.4M (85,400,000 USD)',
      );
      expect(formatFieldPreview('diluted_shares', '125400000', 'KRW')).toBe(
        '약 1.25억 주 (125,400,000주)',
      );
      expect(formatFieldPreview('diluted_eps', '5420', 'KRW')).toBe('5,420원/주');
      expect(formatFieldPreview('currency', 'KRW', 'KRW')).toBeNull();
    });
  });
});

