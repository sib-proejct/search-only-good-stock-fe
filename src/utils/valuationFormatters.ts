import type { PeriodValuation } from '../services/valuationApi';
import { formatMonetaryAmount, formatPerShare } from './numberFormatters';

function koreanWon(value: number) {
  let remaining = Math.round(Math.abs(value));
  const parts: string[] = [];
  for (const [size, unit] of [[1_000_000_000_000, '조'], [100_000_000, '억'], [10_000, '만']] as const) {
    const count = Math.floor(remaining / size);
    if (count) parts.push(`${count}${unit}`);
    remaining %= size;
  }
  if (remaining || !parts.length) parts.push(parts.length ? String(remaining) : remaining.toLocaleString('ko-KR'));
  return `${value < 0 ? '-' : ''}${parts.join(' ')}원`;
}

export function valuationPrice(value: number | null | undefined, currency: string, ko = true) {
  if (value != null && currency === 'KRW' && !ko) return `KRW ${Math.round(value).toLocaleString('en-US')}`;
  if (value != null && currency === 'KRW') return koreanWon(value);
  return value == null ? '—' : formatPerShare(value, currency, currency === 'KRW' ? 0 : 2);
}

export function valuationAmount(value: number | null | undefined, currency: string, ko = true) {
  if (value == null) return '—';
  if (ko && currency === 'KRW') return koreanWon(value);
  if (currency === 'USD') return formatMonetaryAmount(value, currency);
  return value.toLocaleString('en-US', { style: 'currency', currency, currencyDisplay: 'code', notation: 'compact', maximumFractionDigits: 2 });
}

export function valuationMarketCap(value: number | null | undefined, currency: string, ko = true) {
  if (value == null || currency !== 'KRW') return valuationAmount(value, currency, ko);
  const rounded = Math.trunc(value / 100_000_000) * 100_000_000;
  return ko && rounded === 0 ? '0억원' : valuationAmount(rounded, currency, ko);
}
export function valuationPercent(value: number | null | undefined) {
  return value == null ? '—' : `${(value * 100).toFixed(1)}%`;
}
export function valuationPriceToValueRatio(
  currentPrice: number | null | undefined,
  intrinsicValue: number | null | undefined
): string {
  if (currentPrice == null || intrinsicValue == null || intrinsicValue <= 0) return '—';
  return `${((currentPrice / intrinsicValue) * 100).toFixed(1)}%`;
}
export function priceToValueColor(
  currentPrice: number | null | undefined,
  intrinsicValue: number | null | undefined
): string {
  if (currentPrice == null || intrinsicValue == null || intrinsicValue <= 0) return 'text-[#86868B]';
  const ratio = currentPrice / intrinsicValue;
  if (ratio <= 1.2) return 'text-[#34C759]';
  return 'text-[#FF3B30]';
}

export function periodNote(period: PeriodValuation | undefined, ko: boolean): string {
  if (!period) return ko ? '기간별 결과 보충이 필요합니다.' : 'Period results require supplementation.';
  const reasons = [...period.dcf.reasonCodes, ...period.missingReasons, ...period.dcf.warnings];
  const labels: Record<string, [string, string]> = {
    MISSING_DATA: ['필수 자료 부족', 'Missing required data'],
    FINANCIAL_SECTOR: ['금융업은 계산 대상 제외', 'Financial sector excluded'],
    PREREQUISITE_FAILED: ['이익 창출력 조건 미충족', 'Earnings prerequisite failed'],
    UNKNOWN_INTEREST_CLASSIFICATION: ['지급이자 분류 미확인', 'Unknown interest classification'],
    NON_POSITIVE_DENOMINATOR: ['양수 이익·가격·주식수 필요', 'Positive earnings, price and shares required'],
    MISSING_YEAR: ['연도 자료 누락', 'Missing fiscal year'],
    MISSING_OWNER_EARNINGS_INPUT: ['주주이익 계산 항목 부족', 'Missing owner earnings inputs'],
    MISSING_MAINTENANCE_CAPEX: ['유지보수 CAPEX 근거 부족', 'Missing maintenance CAPEX evidence'],
    MISSING_TOTAL_CAPEX: ['총 CAPEX 근거 부족', 'Missing total CAPEX evidence'],
    CAPEX_EVIDENCE_UNAVAILABLE: ['선택 방식의 CAPEX 근거 없음', 'CAPEX evidence unavailable for this mode'],
    EPS_GROWTH_UNAVAILABLE: ['EPS 성장 이력 부족 또는 양수 조건 미충족', 'EPS growth history missing or non-positive'],
    OEPS_GROWTH_UNAVAILABLE: ['OEPS 성장 이력 부족 또는 양수 조건 미충족', 'OEPS growth history missing or non-positive'],
    EPS_MISSING_YEAR: ['EPS: 연도 자료 누락', 'EPS: missing fiscal year'],
    EPS_MISSING_DILUTED_EPS: ['EPS: 희석 EPS 누락', 'EPS: missing diluted EPS'],
    EPS_NON_POSITIVE_ENDPOINT: ['EPS: 시작·종료 값이 0 이하라 CAGR 계산 불가', 'EPS: CAGR endpoint is non-positive'],
    OEPS_MISSING_YEAR: ['OEPS: 연도 자료 누락', 'OEPS: missing fiscal year'],
    OEPS_MISSING_CFO: ['OEPS: CFO 누락', 'OEPS: missing CFO'],
    OEPS_MISSING_CAPEX: ['OEPS: CAPEX 누락', 'OEPS: missing CAPEX'],
    OEPS_MISSING_DILUTED_SHARES: ['OEPS: 희석주식수 누락', 'OEPS: missing diluted shares'],
    OEPS_UNKNOWN_INTEREST_CLASSIFICATION: ['OEPS: 지급이자 분류 미확인', 'OEPS: unknown interest classification'],
    OEPS_NON_POSITIVE_ENDPOINT: ['OEPS: 시작·종료 값이 0 이하라 CAGR 계산 불가', 'OEPS: CAGR endpoint is non-positive'],
    OEPS_NON_POSITIVE_SHARES: ['OEPS: 희석주식수가 0 이하', 'OEPS: non-positive diluted shares'],
    INCOMPLETE_GROWTH_HISTORY: ['성장 이력 부족: 유효 지표 또는 0 사용', 'Incomplete growth: valid metric or zero used'],
    NEGATIVE_GROWTH: ['음수 성장률', 'Negative growth'],
    MISSING_NET_INCOME_COMMON: ['보통주 순이익 누락', 'Missing common net income'],
    MISSING_COMMON_EQUITY: ['보통주 자본 누락', 'Missing common equity'],
    MISSING_OPENING_COMMON_EQUITY: ['기초 보통주 자본 누락', 'Missing opening common equity'],
    NO_DISTRIBUTABLE_EARNINGS: ['성장 자본 유보 후 배분 가능한 이익이 없음', 'No distributable earnings after equity retention'],
    REGULATORY_CAPITAL_PROXY: ['ROE 기반 자기자본 유보 추정: 규제자본 검토 필요', 'ROE-based equity retention estimate: review regulatory capital'],
    SUSTAINABLE_GROWTH_CAP: ['ROE 상한이 성장률 하한보다 우선 적용됨', 'ROE cap overrides the growth floor'],
    CASH_FLOW_PROXY: ['현금흐름 기반 추정', 'Cash flow proxy'],
    ONE_YEAR_HISTORY: ['1개년 자료', 'One year of history'],
    ESTIMATED_CURRENT_SHARES: ['현재 주식수 추정치 사용', 'Estimated current shares'],
    CORE_RULE_FAIL: ['기업 품질 규칙 미충족', 'Quality rule failed'],
    CORE_RULE_NA: ['기업 품질 자료 부족', 'Quality data incomplete'],
    CAPITAL_ACTION_REVIEW: ['자본 변동 검토 필요', 'Capital action review'],
    WIDE_VALUATION_RANGE: ['시나리오 간 차이가 큼', 'Wide scenario range'],
    MARGIN_REQUIRES_REVIEW: ['안전마진 검토 필요', 'Margin requires review'],
  };
  return [...new Set(reasons)].map(reason => {
    const [year, code] = reason.includes(': ') ? reason.split(': ') : ['', reason];
    return `${year ? `${year}: ` : ''}${labels[code]?.[ko ? 0 : 1] ?? code}`;
  }).join(' · ');
}

export function growthUnavailableNote(period: PeriodValuation | undefined, ko: boolean): string {
  if (!period || (period.dcf.epsGrowth != null && (period.dcf.method === 'FINANCIAL_FCFE_DCF' || period.dcf.oepsGrowth != null))) return '';
  const reasons = period.missingReasons.filter(reason => /(?:^|: )(EPS|OEPS)_/.test(reason));
  const detailed = reasons.filter(reason => !reason.endsWith('GROWTH_UNAVAILABLE'));
  return periodNote({
    ...period,
    missingReasons: detailed.length ? detailed : reasons,
    dcf: { ...period.dcf, reasonCodes: [], warnings: [] },
  }, ko) || (ko ? '성장률 계산 자료를 확인하세요.' : 'Review growth calculation inputs.');
}

export interface LowestIntrinsicValueResult {
  minIntrinsicValue: number | null;
  minYear: number | null;
}

export function getLowestIntrinsicValue(
  periodValuations?: Record<
    string,
    {
      dcf?: {
        scenarios?: {
          base?: {
            intrinsicValuePerShare?: number | null;
          } | null;
        } | null;
      } | null;
    } | undefined
  > | undefined
): LowestIntrinsicValueResult {
  if (!periodValuations) return { minIntrinsicValue: null, minYear: null };

  let minVal: number | null = null;
  let minYear: number | null = null;

  for (let year = 1; year <= 5; year++) {
    const val = periodValuations[String(year)]?.dcf?.scenarios?.base?.intrinsicValuePerShare;
    if (typeof val === 'number' && val > 0) {
      if (minVal === null || val < minVal) {
        minVal = val;
        minYear = year;
      }
    }
  }

  return { minIntrinsicValue: minVal, minYear };
}

