import {
  Confidence,
  Currency,
  IndustryType,
  RuleDefinitionDTO,
  ValuationStatus,
} from '../types/api';
import { Language } from '../locales/translations';

export interface RuleTitleInfo {
  title: string;
  shortTitle: string;
  subtitle: string;
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
          ? '5개년 매년 ROE 15% 이상 달성 (초과 자본수익성)'
          : '5-Year Annual ROE ≥ 15% (Excess Capital Return)',
      };
    case 'sustained_roic':
      return {
        title: isKo
          ? '투하자본이익률 (Sustained ROIC)'
          : 'Sustained Return on Invested Capital (ROIC)',
        shortTitle: isKo ? '투하자본이익률' : 'Sustained ROIC',
        subtitle: isKo
          ? '5개년 매년 ROIC 10% 이상 달성 (영업자본 효율성)'
          : '5-Year Annual ROIC ≥ 10% (Operating Efficiency)',
      };
    case 'debt_safety':
      return {
        title: isKo
          ? '재무 안전성 & 이자보상배율 (Debt Safety)'
          : 'Conservative Debt Safety & Interest Coverage',
        shortTitle: isKo ? '부채 안전성' : 'Debt Safety',
        subtitle: isKo
          ? '부채비율 100% 이하 & 이자보상배율 5배 이상'
          : 'Debt/Equity ≤ 100% & Interest Coverage ≥ 5.0x',
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
          ? '누적 영업현금흐름 대비 설비투자(CapEx) 50% 이하'
          : '5Y Cumulative CapEx / CFO ≤ 50%',
      };
    case 'proven_earnings_power':
      return {
        title: isKo
          ? '검증된 실적 이익창출력 (Proven Earnings Power)'
          : 'Proven Earnings Power (Consecutive Profit)',
        shortTitle: isKo ? '검증된 이익창출력' : 'Proven Earnings',
        subtitle: isKo
          ? '5개년 전 기간 영업이익(EBIT) 및 순이익 흑자 유지'
          : 'Positive Operating Profit & Net Income Across All 5 Years',
      };
    case 'eps_growth':
      return {
        title: isKo
          ? 'EPS 복리 성장률 (EPS Compound Growth)'
          : 'EPS Compound Growth (CAGR)',
        shortTitle: isKo ? 'EPS 복리성장' : 'EPS Growth',
        subtitle: isKo
          ? '희석 주당순이익(EPS) 5개년 복리성장률 8% 이상'
          : '5-Year Diluted EPS CAGR ≥ 8.0%',
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
          ? '실질 주주이익(OE) 흑자 및 현금전환율 80% 이상'
          : 'Positive Owner Earnings & Cash Conversion ≥ 80%',
      };
    case 'owner_earnings_yield':
      return {
        title: isKo
          ? '주주이익 국채대비 초과수익률 (Yield Spread)'
          : 'Owner Earnings Yield Spread vs Risk-Free',
        shortTitle: isKo ? '주주이익 초과수익' : 'Yield Spread',
        subtitle: isKo
          ? '시가총액 대비 주주이익 수익률이 국채금리 초과'
          : 'Owner Earnings Yield ≥ Risk-Free Benchmark Rate',
      };
    case 'owner_earnings_dcf':
      return {
        title: isKo
          ? '10개년 주주이익 DCF 내재가치 & 안전마진'
          : '10-Year Owner Earnings DCF Valuation & MoS',
        shortTitle: isKo ? '주주이익 DCF' : 'Owner Earnings DCF',
        subtitle: isKo
          ? '워런 버핏 방식 현금흐름할인 및 20% 이상 안전마진'
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
      return isKo ? '5개년 누적 영업현금흐름(CFO)' : '5Y Cumulative CFO';
    case 'cumulative_capex':
      return isKo ? '5개년 누적 자본적지출(CapEx)' : '5Y Cumulative CapEx';
    case 'capital_intensity':
      return isKo ? '자본집약도 (CapEx/CFO)' : 'Capital Intensity (CapEx/CFO)';

    // EPS growth
    case 'eps_cagr':
      return isKo ? '5개년 EPS 연평균 복리성장률' : '5Y EPS CAGR';

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

  return def.defaultThresholds
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
        label: isKo ? '적정가 부근 (관찰)' : 'Watch (Near Fair Value)',
        badgeLabel: isKo ? '관찰 필요' : 'Watch',
        desc: isKo
          ? '현재 주가가 보수적 내재가치 부근에 위치하여 추가 조정 시 매력적입니다.'
          : 'Market price is near conservative fair value; watch for better margin.',
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
        desc: isKo ? '3개년 이상 데이터 확보 및 기본 검증 통과' : '3-Year Data Available',
      };
    case 'LOW':
    default:
      return {
        label: isKo ? '주의 (LOW)' : 'Low Quality',
        desc: isKo ? '이력 부족 또는 일부 결측치 존재' : 'Limited History or Missing Data',
      };
  }
}
