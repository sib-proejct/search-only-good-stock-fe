import {
  Confidence,
  Currency,
  IndustryType,
  RuleDefinitionDTO,
  RuleEvaluationDTO,
  StockSummaryDTO,
  ValuationStatus,
} from '../types/api';
import { Language } from '../locales/translations';

export interface RuleTitleInfo {
  title: string;
  shortTitle: string;
  subtitle: string;
}

export function getRuleAvailabilityLabel(
  evaluation: Pick<RuleEvaluationDTO, 'status' | 'reasonCodes'>,
  language: Language,
): string {
  if (evaluation.status !== 'N/A') return evaluation.status;
  const isKo = language === 'ko';
  const reasons = evaluation.reasonCodes ?? [];
  if (reasons.includes('FINANCIAL_SECTOR')) return isKo ? '업종 제외' : 'Sector excluded';
  if (reasons.includes('INSUFFICIENT_HISTORY')) return isKo ? '이력 부족' : 'Short history';
  if (reasons.includes('MISSING_DATA')) return isKo ? '자료 부족' : 'Missing data';
  if (reasons.includes('UNKNOWN_INTEREST_CLASSIFICATION')) return isKo ? '분류 확인 필요' : 'Classification needed';
  return isKo ? '계산 불가' : 'Not calculable';
}

export function getRuleWarningLabel(warning: string, language: Language): string {
  const isKo = language === 'ko';
  const missingYear = warning.match(/^MISSING_ANNUAL_YEAR:(\d{4})$/);
  if (missingYear) {
    return isKo ? `${missingYear[1]}년 연간 재무 이력이 없습니다.` : `Annual financial history is missing for ${missingYear[1]}.`;
  }
  const missingField = warning.match(/^MISSING_ANNUAL_FIELD:(\d{4}):([a-z_]+)$/);
  if (!missingField) return warning;
  const [, year, field] = missingField;
  const labels: Record<string, [string, string]> = {
    net_income_common: ['보통주 귀속 순이익', 'net income attributable to common shareholders'],
    common_equity: ['보통주 자기자본', 'common equity'],
    ebit: ['영업이익', 'operating income'],
    pre_tax_income: ['세전이익', 'pre-tax income'],
    income_tax_expense: ['법인세 비용', 'income tax expense'],
    interest_bearing_debt: ['이자발생부채 총액', 'total interest-bearing debt'],
    cash_and_equivalents: ['현금 및 현금성자산', 'cash and equivalents'],
    total_liabilities: ['총부채', 'total liabilities'],
    cfo: ['영업현금흐름', 'operating cash flow'],
    capex: ['유형·무형자산 투자지출 합계', 'combined tangible and intangible capital expenditure'],
    diluted_eps: ['희석 EPS', 'diluted EPS'],
  };
  const label = labels[field]?.[isKo ? 0 : 1] ?? field;
  return isKo ? `${year}년 ${label}을 확인할 수 없습니다.` : `${year}: ${label} is unavailable.`;
}

export function getRuleInfo(
  ruleId: string,
  language: Language,
  fallbackName?: string
): RuleTitleInfo {
  const isKo = language === 'ko';

  switch (ruleId) {
    case 'sustained_roe':
      return {
        title: isKo
          ? '지속 가능한 자기자본이익률 (Sustained ROE)'
          : 'Sustained Return on Equity (ROE)',
        shortTitle: isKo ? '지속 ROE' : 'Sustained ROE',
        subtitle: isKo
          ? '3개년 매년 ROE 10% 이상 달성 (초과 자본수익성)'
          : '3-Year Annual ROE ≥ 10% (Excess Capital Return)',
      };
    case 'sustained_roic':
      return {
        title: isKo
          ? '투하자본이익률 (Sustained ROIC)'
          : 'Sustained Return on Invested Capital (ROIC)',
        shortTitle: isKo ? '투하자본이익률' : 'Sustained ROIC',
        subtitle: isKo
          ? '3개년 매년 ROIC 10% 이상 달성 (영업자본 효율성)'
          : '3-Year Annual ROIC ≥ 10% (Operating Efficiency)',
      };
    case 'debt_safety':
      return {
        title: isKo
          ? '재무 안전성 & 이자보상배율 (Debt Safety)'
          : 'Conservative Debt Safety & Interest Coverage',
        shortTitle: isKo ? '부채 안전성' : 'Debt Safety',
        subtitle: isKo
          ? '부채비율 150% 이하 & 이자보상배율 3배 이상'
          : 'Debt/Equity ≤ 150% & Interest Coverage ≥ 3.0x',
      };
    case 'retained_value_test':
      return {
        title: isKo
          ? '1달러 유보이익 가치창출 (Retained Value Test)'
          : '1-Dollar Retained Value Test',
        shortTitle: isKo ? '1달러 유보이익' : 'Retained Value',
        subtitle: isKo
          ? 'BPS 성장률이 벤치마크를 상회하고 최저 PBR > 1.0'
          : 'BVPS Growth > Benchmark & Min P/B > 1.0',
      };
    case 'capital_light_business':
      return {
        title: isKo
          ? '설비투자 효율성 / 자본효율 (Capital-Light)'
          : 'Capital-Light Business (CapEx Efficiency)',
        shortTitle: isKo ? '설비투자 효율성' : 'Capital-Light',
        subtitle: isKo
          ? '누적 영업현금흐름 대비 설비투자(CapEx) 70% 이하'
          : '3Y Cumulative CapEx / CFO ≤ 70%',
      };
    case 'proven_earnings_power':
      return {
        title: isKo
          ? '검증된 실적 이익창출력 (Proven Earnings Power)'
          : 'Proven Earnings Power (Consecutive Profit)',
        shortTitle: isKo ? '검증된 이익창출력' : 'Proven Earnings',
        subtitle: isKo
          ? '3개년 전 기간 영업이익(EBIT) 및 순이익 흑자 유지'
          : 'Positive Operating Profit & Net Income Across All 3 Years',
      };
    case 'eps_growth':
      return {
        title: isKo
          ? 'EPS 복리 성장률 (EPS Compound Growth)'
          : 'EPS Compound Growth (CAGR)',
        shortTitle: isKo ? 'EPS 복리성장' : 'EPS Growth',
        subtitle: isKo
          ? '최근 3개 회계연도 시작·종료 희석 EPS 기준 연환산 성장률 8% 이상'
          : 'Diluted EPS CAGR ≥ 8% across 3 fiscal years (2 elapsed years)',
      };
    case 'capital_action_flag':
      return {
        title: isKo
          ? '자본행동 & 주식희석 검토 (Capital Action)'
          : 'Capital Action & Share Dilution Review',
        shortTitle: isKo ? '자본행동 검토' : 'Capital Action',
        subtitle: isKo
          ? '신주 발행 및 자사주 매입에 따른 주당가치 변동 점검'
          : 'Review Dilution & Share Buyback Price Efficiency',
      };
    case 'owner_earnings_quality':
      return {
        title: isKo
          ? '주주이익 현금품질 (Owner Earnings Quality)'
          : 'Owner Earnings Quality (Cash Conversion)',
        shortTitle: isKo ? '주주이익 품질' : 'OE Quality',
        subtitle: isKo
          ? '실질 주주이익(OE) 흑자 및 현금전환율 60% 이상'
          : 'Positive Owner Earnings & Cash Conversion ≥ 60%',
      };
    case 'owner_earnings_yield':
      return {
        title: isKo
          ? '주주이익 국채대비 초과수익률 (Yield Spread)'
          : 'Owner Earnings Yield Spread vs Risk-Free',
        shortTitle: isKo ? '주주이익 초과수익' : 'Yield Spread',
        subtitle: isKo
          ? '시가총액 대비 주주이익 수익률이 국채금리보다 3%p 이상 높음'
          : 'Owner Earnings Yield ≥ Risk-Free Rate + 3 percentage points',
      };
    case 'owner_earnings_dcf':
      return {
        title: isKo
          ? '10개년 주주이익 DCF 내재가치 & 안전마진'
          : '10-Year Owner Earnings DCF Valuation & MoS',
        shortTitle: isKo ? '주주이익 DCF' : 'Owner Earnings DCF',
        subtitle: isKo
          ? '투자지출 차감 현금흐름 기반 추정치 · 데이터 검증 후 할인 폭 평가'
          : 'DCF Fair Value with 20%+ Margin of Safety',
      };
    default: {
      const formatted = fallbackName || ruleId.replace(/_/g, ' ').toUpperCase();
      return {
        title: formatted,
        shortTitle: formatted,
        subtitle: isKo ? '원칙 평가' : 'Rule Evaluation',
      };
    }
  }
}

/**
 * Transforms raw metric IDs like `roe_2021`, `debt_to_equity_2022`, `cumulative_cfo`
 * into human-readable, professional Korean / English labels.
 */
export function getMetricLabel(metricId: string, language: Language): string {
  const isKo = language === 'ko';

  // 1. Check for year-suffixed patterns (e.g. roe_2021, roic_2022, debt_to_equity_2023, etc.)
  const yearMatch = metricId.match(/^(.*)_(\d{4})$/);
  if (yearMatch) {
    const base = yearMatch[1];
    const year = yearMatch[2];

    switch (base) {
      case 'roe':
        return isKo ? `${year}년 ROE` : `${year} ROE`;
      case 'roic':
        return isKo ? `${year}년 ROIC` : `${year} ROIC`;
      case 'debt_to_equity':
        return isKo ? `${year}년 부채비율` : `${year} Debt/Equity`;
      case 'interest_coverage':
        return isKo ? `${year}년 이자보상배율` : `${year} Interest Coverage`;
      case 'ebit':
        return isKo ? `${year}년 영업이익(EBIT)` : `${year} EBIT`;
      case 'net_income_common':
        return isKo ? `${year}년 보통주 순이익` : `${year} Net Income`;
      case 'owner_earnings':
        return isKo ? `${year}년 주주이익(OE)` : `${year} Owner Earnings`;
      default:
        return isKo ? `${year}년 ${base.replace(/_/g, ' ')}` : `${year} ${base.replace(/_/g, ' ')}`;
    }
  }

  // 2. Aggregate & Special Metrics
  switch (metricId) {
    // Retained value test
    case 'bvps_cagr':
      return isKo ? 'BPS(주당순자산) 연평균 성장률' : 'BVPS CAGR';
    case 'benchmark_cagr':
      return isKo ? '벤치마크 지수 연평균 성장률' : 'Benchmark Index CAGR';
    case 'minimum_pbr':
      return isKo ? '평가기간 최저 PBR' : 'Minimum PBR';

    // Capital light business
    case 'cumulative_cfo':
      return isKo ? '평가 기간 누적 영업현금흐름(CFO)' : 'Cumulative CFO over the evaluation period';
    case 'cumulative_capex':
      return isKo ? '평가 기간 누적 자본적지출(CapEx)' : 'Cumulative CapEx over the evaluation period';
    case 'capital_intensity':
      return isKo ? '자본집약도 (CapEx/CFO)' : 'Capital Intensity (CapEx/CFO)';

    // EPS growth
    case 'eps_cagr':
      return isKo ? '평가 기간 EPS 연평균 복리성장률' : 'EPS CAGR over the evaluation period';

    // Capital action
    case 'diluted_share_cagr':
      return isKo ? '희석주식수 연평균 증감률' : 'Diluted Shares CAGR';
    case 'dilution_review':
      return isKo ? '주식 희석률' : 'Dilution Review Threshold';
    case 'buyback_review':
      return isKo ? '자사주 매입률' : 'Buyback Review Threshold';

    // Owner earnings quality
    case 'median_owner_earnings':
      return isKo ? '주주이익 중앙값 (Median OE)' : 'Median Owner Earnings';
    case 'cash_conversion':
      return isKo ? '현금전환율 (주주이익/순이익)' : 'Cash Conversion (OE/Net Income)';

    // Owner earnings yield
    case 'normalized_owner_earnings':
      return isKo ? '정규화 주주이익' : 'Normalized Owner Earnings';
    case 'owner_earnings_yield':
      return isKo ? '주주이익 수익률' : 'Owner Earnings Yield';
    case 'yield_spread':
      return isKo ? '초과 스프레드 (수익률 - 무위험금리)' : 'Yield Spread (vs Risk-Free)';

    // DCF
    case 'required_margin_of_safety':
      return isKo ? '요구 안전마진' : 'Required Margin of Safety';

    default:
      return metricId.replace(/_/g, ' ');
  }
}

/**
 * Returns clean criteria label for threshold rendering
 */
export function getCriteriaMetricName(metricId: string, language: Language): string {
  const isKo = language === 'ko';
  switch (metricId) {
    case 'roe':
      return 'ROE';
    case 'roic':
      return 'ROIC';
    case 'debt_to_equity':
      return isKo ? '부채비율' : 'Debt/Equity';
    case 'interest_coverage':
      return isKo ? '이자보상배율' : 'Interest Coverage';
    case 'minimum_pbr':
      return isKo ? '최저 PBR' : 'Min P/B';
    case 'capital_intensity':
      return isKo ? '자본집약도' : 'Capital Intensity';
    case 'ebit':
      return isKo ? '영업이익(EBIT)' : 'EBIT';
    case 'net_income_common':
      return isKo ? '당기순이익' : 'Net Income';
    case 'eps_cagr':
      return isKo ? 'EPS 복리성장률' : 'EPS CAGR';
    case 'dilution_review':
      return isKo ? '주식 희석률 상한' : 'Max Dilution';
    case 'buyback_review':
      return isKo ? '자사주 매입 하한' : 'Min Buyback';
    case 'cash_conversion':
      return isKo ? '현금전환율' : 'Cash Conversion';
    case 'yield_spread':
      return isKo ? '초과 스프레드' : 'Yield Spread';
    case 'required_margin_of_safety':
      return isKo ? '요구 안전마진' : 'Required MoS';
    default:
      return metricId.replace(/_/g, ' ');
  }
}

/**
 * Formats criteria rule threshold definition into user-friendly text
 */
export function formatCriteria(
  def: RuleDefinitionDTO | undefined,
  currency: Currency,
  language: Language
): string {
  if (!def || !def.defaultThresholds || def.defaultThresholds.length === 0) {
    return '';
  }

  const thresholds = def.defaultThresholds
    .map((th) => {
      const op =
        th.operator === 'GTE'
          ? '≥'
          : th.operator === 'LTE'
            ? '≤'
            : th.operator === 'GT'
              ? '>'
              : '<';
      const numVal = typeof th.value === 'string' ? parseFloat(th.value) : th.value;
      let valStr = `${th.value}`;
      if (!isNaN(numVal)) {
        if (th.unit === 'RATIO') {
          valStr = `${(numVal * 100).toFixed(0)}%`;
        } else if (th.unit === 'MULTIPLE') {
          valStr = `${numVal.toFixed(1)}x`;
        } else if (th.unit === 'CURRENCY') {
          valStr = currency === 'USD' ? `$${numVal}` : `${numVal}원`;
        }
      }
      const metricName = getCriteriaMetricName(th.metricId, language);
      return `${metricName} ${op} ${valStr}`;
    })
    .join(' · ');

  const isKo = language === 'ko';
  const years = def.supportedHistoryYears[0];
  switch (def.ruleId) {
    case 'sustained_roe':
    case 'sustained_roic':
    case 'debt_safety':
    case 'proven_earnings_power':
      return `${isKo ? `최근 연속 ${years}개년 매년` : `Every year across ${years} consecutive fiscal years`}: ${thresholds}`;
    case 'eps_growth':
      return `${thresholds} · ${isKo ? `시작·종료 EPS > 0, ${years}개 연도 간 경과 ${years - 1}년` : `Start/end EPS > 0; ${years - 1} elapsed years across ${years} observations`}`;
    case 'capital_light_business':
      return `${thresholds} · ${isKo ? `${years}개년 누적 CFO > 0` : `${years}-year cumulative CFO > 0`}`;
    case 'owner_earnings_quality':
      return `${thresholds} · ${isKo ? '최근·중앙값 주주이익 > 0, 누적 순이익 > 0' : 'Latest and median OE > 0; cumulative net income > 0'}`;
    case 'retained_value_test':
      return `${thresholds} · ${isKo ? '동일 기간 BPS 성장률 > 벤치마크 성장률' : 'BVPS CAGR > benchmark CAGR over the same interval'}`;
    default:
      return thresholds;
  }
}

/**
 * Returns user-friendly category label
 */
export function getCategoryBadgeLabel(category: string, language: Language): string {
  const isKo = language === 'ko';
  switch (category) {
    case 'CORE':
      return isKo ? '핵심 (CORE)' : 'CORE';
    case 'AUXILIARY':
      return isKo ? '보조 (AUX)' : 'AUXILIARY';
    case 'REVIEW':
      return isKo ? '자본검토 (REVIEW)' : 'REVIEW';
    case 'VALUATION':
      return isKo ? '가치평가 (DCF)' : 'VALUATION';
    default:
      return category;
  }
}

/**
 * Returns formatted industry type label
 */
export function getIndustryTypeLabel(
  industryType: IndustryType | string | undefined,
  language: Language
): string {
  const isKo = language === 'ko';
  if (industryType === 'FINANCIAL') {
    return isKo ? '금융업 (Financial)' : 'Financial';
  }
  return isKo ? '일반기업 (Non-Financial)' : 'Non-Financial';
}

/**
 * Returns formatted valuation status label
 */
export function getValuationStatusInfo(
  status: ValuationStatus,
  language: Language
): { label: string; badgeLabel: string; desc: string } {
  const isKo = language === 'ko';
  switch (status) {
    case 'PASS_WITH_MARGIN':
      return {
        label: isKo ? '안전마진 20%+ 확보' : 'Pass with Margin (20%+)',
        badgeLabel: isKo ? '안전마진 확보' : 'Pass with Margin',
        desc: isKo
          ? '보수적 DCF 추정 내재가치 대비 20% 이상의 안전마진이 확보되었습니다.'
          : 'Intrinsic value exceeds market price by 20%+ conservative margin of safety.',
      };
    case 'WATCH':
      return {
        label: isKo ? '추가 검토 필요' : 'Review Required',
        badgeLabel: isKo ? '관찰 필요' : 'Watch',
        desc: isKo
          ? '가격 또는 데이터 신뢰도·핵심 규칙에 대한 추가 검토가 필요합니다.'
          : 'Review price, data quality and core-rule results before interpreting the discount.',
      };
    case 'NO_MARGIN':
      return {
        label: isKo ? '안전마진 미확보 (고평가)' : 'No Margin (Overvalued)',
        badgeLabel: isKo ? '마진 없음' : 'No Margin',
        desc: isKo
          ? '현재 주가가 보수적 추정 내재가치보다 높아 안전마진이 없습니다.'
          : 'Market price is higher than conservative fair value.',
      };
    case 'N/A':
    default:
      return {
        label: isKo ? '가치평가 산출 제외' : 'Valuation N/A',
        badgeLabel: isKo ? '평가 불가' : 'N/A',
        desc: isKo
          ? '금융업종이거나 필수 데이터 부족으로 DCF 가치평가가 제외되었습니다.'
          : 'Excluded from DCF model due to industry type or missing inputs.',
      };
  }
}

/**
 * Returns formatted data confidence label
 */
export function getConfidenceInfo(
  confidence: Confidence,
  language: Language
): { label: string; desc: string } {
  const isKo = language === 'ko';
  switch (confidence) {
    case 'HIGH':
      return {
        label: isKo ? '우수 (HIGH)' : 'High Quality',
        desc: isKo ? '5개년 완전 재무제표 및 지표 신뢰도 우수' : '5-Year Complete Financials',
      };
    case 'MEDIUM':
      return {
        label: isKo ? '보통 (MEDIUM)' : 'Medium Quality',
        desc: isKo ? '5개년 계산 결과에 추가 검토 사유가 있습니다.' : 'Five-year estimate with review flags',
      };
    case 'LOW':
    default:
      return {
        label: isKo ? '주의 (LOW)' : 'Low Quality',
        desc: isKo ? '이력 부족 또는 일부 결측치 존재' : 'Limited History or Missing Data',
      };
  }
}

export interface CoreGradeInfo {
  grade: 'PASS' | 'FAIL' | 'N/A';
  label: string;
  badgeLabel: string;
  badgeClass: string;
  dotClass: string;
  textClass: string;
  passRatioText: string;
  desc: string;
}

/** The aggregate rule result is authoritative; counts never override failures. */
export function getCoreGradeInfo(
  stock: Pick<StockSummaryDTO, 'corePassCount' | 'coreFailCount' | 'coreNaCount' | 'coreStatus'>,
  language: Language
): CoreGradeInfo {
  const isKo = language === 'ko';
  const { corePassCount: passCount, coreStatus } = stock;
  const totalCount = passCount + stock.coreFailCount + stock.coreNaCount;
  const passed = coreStatus === 'PASS';
  const failed = coreStatus === 'FAIL';
  const label = passed
    ? (isKo ? '기준 통과' : 'Criteria Passed')
    : failed
      ? (isKo ? '기준 미달' : 'Failed Criteria')
      : (isKo ? '평가 불가' : 'Incomplete');
  return {
    grade: passed ? 'PASS' : failed ? 'FAIL' : 'N/A',
    label,
    badgeLabel: label,
    badgeClass: passed
      ? 'bg-[#34C759]/10 text-[#34C759] border-[#34C759]/20'
      : failed
        ? 'bg-[#FF3B30]/10 text-[#FF3B30] border-[#FF3B30]/20'
        : 'bg-[#86868B]/10 text-[#86868B] border-[#86868B]/20',
    dotClass: passed ? 'bg-[#34C759]' : failed ? 'bg-[#FF3B30]' : 'bg-[#86868B]',
    textClass: passed ? 'text-[#34C759]' : failed ? 'text-[#FF3B30]' : 'text-[#86868B]',
    passRatioText: `${passCount}/${totalCount}`,
    desc: passed
      ? (isKo ? `${passCount}/${totalCount} 충족. 수익력·부채 안전성 필수 조건과 핵심 통과 기준 충족. 가격 매력도는 DCF에서 별도로 확인하세요.` : `${passCount}/${totalCount} passed. Required earnings and debt safety checks and the core pass threshold are met. Review valuation separately.`)
      : failed
        ? (isKo ? `${passCount}/${totalCount} 충족. 필수 규칙 실패 또는 통과 가능 개수 부족으로 기준 미달입니다.` : `${passCount}/${totalCount} passed. A required rule failed or too few rules can pass.`)
        : (isKo ? `${passCount}/${totalCount} 충족. 이력 부족·결측 또는 업종 특성으로 전체 판정을 할 수 없습니다.` : `${passCount}/${totalCount} passed. History, data or sector applicability prevents a complete assessment.`),
  };
}

export function getDcfWarningLabel(warning: string, language: Language): string {
  const labels: Record<string, [string, string]> = {
    CASH_FLOW_PROXY: ['영업현금흐름에서 유형·무형자산 투자를 차감한 추정 모델입니다. 유지투자, 주식보상, 순차입을 별도로 조정한 가치는 아닙니다.', 'Cash-flow proxy deducting tangible and intangible investment; maintenance investment, stock compensation and net borrowing are not separately adjusted.'],
    ESTIMATED_CURRENT_SHARES: ['현재 주식 수가 확인되지 않아 연간 평균 주식 수를 사용했습니다. 주당 가치와 시가총액 추정에 오차가 있을 수 있습니다.', 'Current shares are unverified; annual average shares may distort per-share value and estimated market capitalization.'],
    INCOMPLETE_GROWTH_HISTORY: ['EPS와 주당 현금흐름의 5년 이력이 완전하지 않아 양의 성장률을 적용하지 않았습니다.', 'Incomplete five-year EPS or per-share cash-flow history: no positive growth assumed.'],
    CORE_RULE_FAIL: ['실패한 핵심 규칙이 있어 가치평가에 추가 검토가 필요합니다.', 'A core rule failed; review the valuation.'],
    CORE_RULE_NA: ['평가할 수 없는 핵심 규칙이 있습니다.', 'Some core rules could not be evaluated.'],
    CAPITAL_ACTION_REVIEW: ['주식 수 변동 또는 관련 데이터 부족을 확인하세요.', 'Review changes in shares or missing share data.'],
    WIDE_VALUATION_RANGE: ['성장률 가정에 따라 추정가치 차이가 큽니다.', 'Valuation is sensitive to growth assumptions.'],
    NEGATIVE_GROWTH: ['과거 역성장을 반영했습니다.', 'Historical negative growth is reflected.'],
    ONE_YEAR_HISTORY: ['재무 이력이 1년뿐입니다.', 'Only one year of financial history.'],
    MARGIN_REQUIRES_REVIEW: ['계산상 할인 폭이 커도 데이터·핵심 규칙 검증이 부족하여 안전마진 통과로 판정하지 않습니다.', 'A calculated discount does not qualify as a margin pass without sufficient data and core-rule validation.'],
  };
  return labels[warning]?.[language === 'ko' ? 0 : 1] ?? getRuleWarningLabel(warning, language);
}
