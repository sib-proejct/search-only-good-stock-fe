/**
 * Formatting utilities for financial and administrative valuation metrics.
 * Supports normalization of scientific notation (e.g. 1.1430100E+11 -> 114301000000),
 * Korean units (억 원, 조 원), and US Dollar units (M, B, T).
 */

export function normalizeScientificNotation(val: unknown): string {
  if (val == null || val === '') return '';
  const str = String(val).trim();
  if (!/[eE]/.test(str)) return str;
  const num = Number(str);
  if (isNaN(num)) return str;
  return num.toLocaleString('en-US', { useGrouping: false, maximumFractionDigits: 10 });
}

export function parseNumeric(val: unknown): number | null {
  if (val == null || val === '') return null;
  const num = typeof val === 'number' ? val : Number(normalizeScientificNotation(val));
  return isNaN(num) ? null : num;
}

/**
 * Format total monetary amount (e.g. Net Income, EBIT, CFO, CAPEX, Market Cap).
 * KRW:
 *   >= 1조: 1.14조 원 (또는 1조 1,430억 원)
 *   >= 1억: 1,143.01억 원
 *   < 1억:  12,345,670원
 * USD:
 *   >= $1T: $1.14T
 *   >= $1B: $114.30B
 *   >= $1M: $85.40M
 *   < $1M:  $123,456
 */
export function formatMonetaryAmount(
  val: unknown,
  currency: string = 'KRW',
  decimals: number = 2,
): string {
  const num = parseNumeric(val);
  if (num === null) return '미입력';

  const isUsd = currency.toUpperCase() === 'USD';
  const abs = Math.abs(num);

  if (isUsd) {
    if (abs >= 1_000_000_000_000) {
      return `$${(num / 1_000_000_000_000).toLocaleString('en-US', { maximumFractionDigits: decimals })}T`;
    }
    if (abs >= 1_000_000_000) {
      return `$${(num / 1_000_000_000).toLocaleString('en-US', { maximumFractionDigits: decimals })}B`;
    }
    if (abs >= 1_000_000) {
      return `$${(num / 1_000_000).toLocaleString('en-US', { maximumFractionDigits: decimals })}M`;
    }
    return `$${num.toLocaleString('en-US', { maximumFractionDigits: decimals })}`;
  }

  // KRW / Default
  if (abs >= 1_000_000_000_000) {
    const jo = Math.floor(abs / 1_000_000_000_000);
    const eok = Math.round((abs % 1_000_000_000_000) / 100_000_000);
    const sign = num < 0 ? '-' : '';
    if (eok === 0) return `${sign}${jo.toLocaleString('ko-KR')}조 원`;
    return `${sign}${jo.toLocaleString('ko-KR')}조 ${eok.toLocaleString('ko-KR')}억 원`;
  }
  if (abs >= 100_000_000) {
    return `${(num / 100_000_000).toLocaleString('ko-KR', { maximumFractionDigits: decimals })}억 원`;
  }
  return `${num.toLocaleString('ko-KR', { maximumFractionDigits: decimals })}원`;
}

/**
 * Format per-share value (e.g. Stock Price, OEPS, EPS, DCF Intrinsic Value).
 * KRW: 72,500원
 * USD: $182.50
 */
export function formatPerShare(
  val: unknown,
  currency: string = 'KRW',
  decimals: number = 2,
): string {
  const num = parseNumeric(val);
  if (num === null) return '미입력';

  const isUsd = currency.toUpperCase() === 'USD';
  if (isUsd) {
    return `$${num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: Math.max(2, decimals),
    })}`;
  }
  return `${num.toLocaleString('ko-KR', { maximumFractionDigits: decimals })}원`;
}

/**
 * Format share count (e.g. Outstanding Shares, Issued Shares).
 * KRW/Ko context:
 *   >= 1억 주: 1.25억 주
 *   >= 1만 주: 1,250만 주
 *   < 1만 주:  5,000주
 */
export function formatShares(val: unknown): string {
  const num = parseNumeric(val);
  if (num === null) return '미입력';

  const abs = Math.abs(num);
  if (abs >= 100_000_000) {
    return `${(num / 100_000_000).toLocaleString('ko-KR', { maximumFractionDigits: 2 })}억 주`;
  }
  if (abs >= 10_000) {
    return `${(num / 10_000).toLocaleString('ko-KR', { maximumFractionDigits: 1 })}만 주`;
  }
  return `${num.toLocaleString('ko-KR')}주`;
}

const TOTAL_MONETARY_FIELDS = new Set([
  'net_income_common',
  'ebit',
  'pre_tax_income',
  'income_tax_expense',
  'common_equity',
  'interest_bearing_debt',
  'cash_and_equivalents',
  'total_liabilities',
  'interest_expense',
  'interest_paid',
  'cfo',
  'tangible_capex',
  'intangible_capex',
  'depreciation_ppe',
  'share_based_compensation',
  'amortization_intangibles',
  'depreciation_right_of_use',
  'impairment_loss',
  'provision_expense',
  'deferred_tax_expense',
  'unrealized_financial_loss',
  'equity_method_income',
  'unrealized_fx_gain',
  'unrealized_financial_gain',
  'impairment_reversal',
  'provision_reversal',
  'deferred_tax_benefit',
  'gain_on_ppe_disposal',
  'receivables_increase',
  'inventory_increase',
  'payables_increase',
  'maintenance_capex_estimate',
  'growth_capex_estimate',
  'observed_market_cap',
]);

const PER_SHARE_FIELDS = new Set([
  'diluted_eps',
  'current_price',
  'exercise_or_conversion_price',
]);

const SHARE_COUNT_FIELDS = new Set([
  'diluted_shares',
  'outstanding_shares',
  'issued_shares',
  'authorized_shares',
  'treasury_shares',
  'current_diluted_shares_estimate',
  'event_shares',
  'quantity',
  'potential_shares',
]);

/**
 * Returns a helpful real-time human-readable preview for the input form.
 * E.g.: "약 1,143.01억 원 (114,301,000,000 KRW)"
 */
export function formatFieldPreview(
  fieldName: string,
  value: unknown,
  currency: string = 'KRW',
): string | null {
  const num = parseNumeric(value);
  if (num === null || num === 0) return null;

  const curr = currency.toUpperCase();
  const rawComma = num.toLocaleString(curr === 'USD' ? 'en-US' : 'ko-KR');

  if (TOTAL_MONETARY_FIELDS.has(fieldName)) {
    const formatted = formatMonetaryAmount(num, curr, 2);
    return `약 ${formatted} (${rawComma} ${curr})`;
  }

  if (PER_SHARE_FIELDS.has(fieldName)) {
    const formatted = formatPerShare(num, curr, 2);
    return `${formatted}/주`;
  }

  if (SHARE_COUNT_FIELDS.has(fieldName)) {
    const formatted = formatShares(num);
    return `약 ${formatted} (${rawComma}주)`;
  }

  return null;
}

