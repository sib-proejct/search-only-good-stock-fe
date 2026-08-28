import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Check,
  X,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { useAppConfig } from '../context/ThemeLanguageContext';
import { GuideType } from '../components/common/TopNavBar';
import { RuleDefinitionCategory } from '../types/api';

interface RuleGuidePageProps {
  activeGuide?: GuideType;
}

type CategoryFilter = 'ALL' | RuleDefinitionCategory;

export const RuleGuidePage: React.FC<RuleGuidePageProps> = ({
  activeGuide: propActiveGuide,
}) => {
  const { guideType: urlGuideType } = useParams<{ guideType?: string }>();
  const navigate = useNavigate();
  const activeGuide: GuideType =
    urlGuideType === 'lynch' || propActiveGuide === 'lynch' ? 'lynch' : 'buffett';
  const { t, language } = useAppConfig();
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('ALL');

  const buffettRules = [
    {
      id: 1,
      num: '01',
      ruleId: 'sustained_roe',
      categoryId: 'CORE' as RuleDefinitionCategory,
      category: language === 'ko' ? '초과 자본이익률' : 'Capital Efficiency',
      targetHurdle: 'ROE ≥ 15.0%',
      applicability:
        language === 'ko'
          ? '전체 기업 (금융업 포함)'
          : 'All Enterprises (Inc. Financials)',
      historyYears:
        language === 'ko'
          ? '최근 5년 (부족 시 3년 → 1년)'
          : '5-Year (3Y/1Y fallback)',
      title:
        language === 'ko'
          ? '지속 가능한 자기자본이익률 (Sustained ROE)'
          : 'Sustained Return on Equity (ROE)',
      titleSub: 'Capital Efficiency & Moat',
      quoteAuthor: 'Warren Buffett',
      quote:
        language === 'ko'
          ? '“우리는 회사의 규모로 실적을 평가하지 않고, 주당 내재가치 증가율로 평가합니다. 자본이익률이 계속해서 평균을 초과하는 기업들을 보유하는 방법으로 목표를 달성합니다.”'
          : '"We do not measure financial results by size, but by per-share value growth. We accomplish this goal by owning businesses that consistently achieve above-average returns on equity."',
      quoteYear: '1979',
      quoteSource:
        language === 'ko'
          ? '주주서한 (소유주 관련 사업 원칙)'
          : 'Shareholder Letter (Owner Principles)',
      purpose:
        language === 'ko'
          ? '외형적 매출이나 자산 팽창이 아닌, 주주가 맡긴 자기자본 대비 높은 실질 순이익 창출 효율을 지속적으로 입증하는 경제적 해자 기업을 선별합니다.'
          : 'Identifies enterprises generating sustained economic profits above their cost of capital rather than superficial asset size growth.',
      formula:
        'ROE_t = 지배주주 귀속 당기순이익_t ÷ 평균 보통주자본_t  |  평균 보통주자본 = (기초 + 기말) ÷ 2',
      conditionText: '5-Year Consecutive ROE ≥ 15.0%',
      passCondition:
        language === 'ko'
          ? '평가 기간의 모든 연도에서 ROE 15.0% 이상 유지 (경기 하강기에도 두 자릿수 수익성 보존)'
          : 'ROE ≥ 15.0% maintained across every single evaluated year without exception',
      exclusionCondition:
        language === 'ko'
          ? '계산 가능한 연도 중 단 한 해라도 ROE 15.0% 미만으로 자본 효율이 떨어지는 저효율 기업 배제'
          : 'Enterprises dropping below 15.0% ROE in any evaluated year are immediately excluded',
      benchmarkStock:
        language === 'ko'
          ? '애플 (AAPL) — 5년 평균 ROE 140%+ 지속 유지'
          : 'Apple (AAPL) — Sustained 5Y Avg ROE 140%+',
    },
    {
      id: 2,
      num: '02',
      ruleId: 'sustained_roic',
      categoryId: 'CORE' as RuleDefinitionCategory,
      category:
        language === 'ko' ? '투하자본 수익성' : 'Invested Capital Returns',
      targetHurdle: 'ROIC ≥ 10.0%',
      applicability:
        language === 'ko'
          ? '비금융 일반기업 (금융업 N/A)'
          : 'Non-Financial Only (Financials N/A)',
      historyYears:
        language === 'ko'
          ? '최근 5년 (부족 시 3년 → 1년)'
          : '5-Year (3Y/1Y fallback)',
      title:
        language === 'ko'
          ? '지속 가능한 투하자본이익률 (Sustained ROIC)'
          : 'Sustained Return on Invested Capital (ROIC)',
      titleSub: 'Operating Capital Moat',
      quoteAuthor: 'Warren Buffett',
      quote:
        language === 'ko'
          ? '“추가 자본을 투입하는 것 자체가 아니라, 투입한 자본에서 높은 수익을 내는지가 진정한 부의 창출을 결정합니다.”'
          : '"It is not merely the addition of capital, but the return generated on capital employed that creates true wealth."',
      quoteYear: '1995',
      quoteSource:
        language === 'ko'
          ? '주주서한 (공익기업과 사회계약)'
          : 'Shareholder Letter (Owner Principles)',
      purpose:
        language === 'ko'
          ? '부채와 자본 조달 방식의 왜곡 없이, 본업 영업활동에 실제로 투입된 총 자본(IC)의 실질 운용 효율성을 판정합니다.'
          : 'Evaluates operating efficiency on capital deployed in the core business, independent of capital structure and leverage.',
      formula:
        'NOPAT = EBIT × (1 - 유효세율)  |  IC = 보통주자본 + 이자발생부채 - 현금  |  ROIC = NOPAT ÷ 평균 IC',
      conditionText: '5-Year Consecutive ROIC ≥ 10.0%',
      passCondition:
        language === 'ko'
          ? '평가 기간의 모든 연도에서 ROIC 10.0% 이상 유지 (비금융 일반기업)'
          : 'ROIC ≥ 10.0% maintained across every single evaluated year (Non-financials only)',
      exclusionCondition:
        language === 'ko'
          ? '영업 투하자본 대비 세후영업이익 창출력이 10.0% 미만으로 떨어지는 비효율 기업 배제'
          : 'Sub-10% ROIC in any year indicates weak operational moat and capital allocation',
      benchmarkStock:
        language === 'ko'
          ? '엔비디아 (NVDA) — 플랫폼 해자 기반 5년 평균 ROIC 50%+ 달성'
          : 'NVIDIA (NVDA) — 5Y Avg ROIC 50%+ driven by platform moat',
    },
    {
      id: 3,
      num: '03',
      ruleId: 'debt_safety',
      categoryId: 'CORE' as RuleDefinitionCategory,
      category:
        language === 'ko' ? '재무 요새 & 부채 안전성' : 'Solvency Fortress',
      targetHurdle: '총부채비율 ≤ 100% · 이자보상배율 ≥ 5.0x',
      applicability:
        language === 'ko'
          ? '비금융 일반기업 (금융업 N/A)'
          : 'Non-Financial Only (Financials N/A)',
      historyYears:
        language === 'ko'
          ? '최근 5년 (부족 시 3년 → 1년)'
          : '5-Year (3Y/1Y fallback)',
      title:
        language === 'ko'
          ? '건전한 부채 및 이자보상 안전성 (Debt Safety)'
          : 'Conservative Debt Safety & Solvency',
      titleSub: 'Balance Sheet Fortress',
      quoteAuthor: 'Warren Buffett',
      quote:
        language === 'ko'
          ? '“우리는 부채를 좀처럼 일으키지 않으며, 금융 위기가 왔을 때 살아남는 유일한 방법은 빚이 없는 요새를 구축하는 것입니다.”'
          : '"We use debt sparingly. When leverage works, it magnifies gains. When something goes wrong, it ruins you. Fortresses survive every hurricane."',
      quoteYear: '1987',
      quoteSource:
        language === 'ko' ? '주주서한 (소유주 원칙)' : 'Shareholder Letter',
      purpose:
        language === 'ko'
          ? '단기 이익을 부풀리는 무분별한 차입금 레버리지를 배제하고, 고금리와 경기 침체 충격에도 자력 생존 가능한 무차입/저부채 요새 기업을 선별합니다.'
          : 'Eliminates fragile over-leveraged companies, favoring fortress balance sheets capable of enduring severe recessions.',
      formula:
        '총부채비율 = 총부채 ÷ 자기자본 × 100  |  이자보상배율 = EBIT ÷ |이자비용| (무이자 시 무한대 통과)',
      conditionText: 'Debt/Equity ≤ 100.0% AND Interest Coverage ≥ 5.0x',
      passCondition:
        language === 'ko'
          ? '평가 기간 모든 연도에서 총부채비율 100% 이하 및 이자보상배율 5.0배 이상 충족'
          : 'Total Debt/Equity ≤ 100% and Interest Coverage ≥ 5.0x in all evaluated years',
      exclusionCondition:
        language === 'ko'
          ? '부채비율 100% 초과 또는 영업이익으로 이자를 감당하기 어려운(5배 미만) 취약 기업 배제'
          : 'Enterprises with heavy debt burdens or interest coverage under 5.0x are excluded',
      benchmarkStock:
        language === 'ko'
          ? '알파벳 (GOOGL) — 부채비율 ~10%, $100B+ 규모의 압도적 순현금 요새'
          : 'Alphabet (GOOGL) — ~10% Debt/Equity with $100B+ net cash cushion',
    },
    {
      id: 4,
      num: '04',
      ruleId: 'capital_light_business',
      categoryId: 'CORE' as RuleDefinitionCategory,
      category:
        language === 'ko' ? '저자본 고현금창출' : 'Capital-Light Cash Engine',
      targetHurdle: '자본집약도 (CapEx / CFO) ≤ 50.0%',
      applicability:
        language === 'ko'
          ? '비금융 일반기업 (금융업 N/A)'
          : 'Non-Financial Only (Financials N/A)',
      historyYears:
        language === 'ko'
          ? '최근 5년 (부족 시 3년 → 1년)'
          : '5-Year (3Y/1Y fallback)',
      title:
        language === 'ko'
          ? '저자본 고현금창출 기업 (Capital-Light Business)'
          : 'Capital-Light Cash Compounding Engine',
      titleSub: 'CapEx Efficiency',
      quoteAuthor: 'Warren Buffett',
      quote:
        language === 'ko'
          ? '“주주들에게 가장 좋은 사업은 높은 자본수익률을 내면서 성장에 추가 자본이 거의 필요 없는 사업입니다.”'
          : '"The best businesses by far for owners are those that produce high returns on capital and require little incremental capital to grow."',
      quoteYear: '1992',
      quoteSource:
        language === 'ko'
          ? '주주서한 (1장 기업 지배구조)'
          : 'Shareholder Letter (Corporate Governance)',
      purpose:
        language === 'ko'
          ? '벌어들인 영업현금의 대부분을 설비 유지(CapEx)에 다시 쏟아붓지 않고도 주주 잉여현금흐름으로 남기는 복리 성장 기업을 선별합니다.'
          : 'Filters for businesses requiring minimal capital reinvestment to maintain their competitive moat, maximizing free cash to owners.',
      formula:
        'Capital Intensity = 5개년 누적 |CapEx| ÷ 5개년 누적 CFO (누적 CFO > 0 필수)',
      conditionText: '5-Year Cumulative CapEx ÷ CFO ≤ 50.0%',
      passCondition:
        language === 'ko'
          ? '누적 영업현금흐름(CFO) > 0 이며 누적 자본집약도 50.0% 이하 달성'
          : '5Y Cumulative CFO > 0 and Capital Intensity (CapEx / CFO) ≤ 50.0%',
      exclusionCondition:
        language === 'ko'
          ? '벌어들인 현금의 50% 이상을 시설 유지보수에 재투자해야 하는 중후장대 설비 집약적 기업 배제'
          : 'Capital-heavy businesses consuming over 50% of operating cash flow in CapEx',
      benchmarkStock:
        language === 'ko'
          ? '마이크로소프트 (MSFT) — 자본집약도 35% 미만 고수익 소프트웨어/클라우드 엔진'
          : 'Microsoft (MSFT) — < 35% Capital Intensity with high free cash flow conversion',
    },
    {
      id: 5,
      num: '05',
      ruleId: 'proven_earnings_power',
      categoryId: 'CORE' as RuleDefinitionCategory,
      category:
        language === 'ko' ? '입증된 이익 지속성' : 'Proven Earnings Power',
      targetHurdle: '연차 EBIT > 0 AND Net Income > 0',
      applicability:
        language === 'ko'
          ? '전체 기업 (금융업 포함)'
          : 'All Enterprises (Inc. Financials)',
      historyYears:
        language === 'ko'
          ? '최근 5년 (부족 시 3년 → 1년)'
          : '5-Year (3Y/1Y fallback)',
      title:
        language === 'ko'
          ? '입증된 이익 지속성 (Proven Earnings Power)'
          : 'Proven Multi-Year Operating Profitability',
      titleSub: 'Durable Profitability Track Record',
      quoteAuthor: 'Warren Buffett',
      quote:
        language === 'ko'
          ? '“우리는 미래 추정 이익이나 턴어라운드(회생형) 기업이 아니라, 지속적인 수익력을 스스로 입증한 기업을 찾습니다.”'
          : '"We look for businesses with demonstrated consistent earning power, rather than future projections or turnaround situations."',
      quoteYear: '1982',
      quoteSource:
        language === 'ko'
          ? '주주서한 (2장 투자 / 건전한 인수 정책)'
          : 'Shareholder Letter (Sound Acquisition Policy)',
      purpose:
        language === 'ko'
          ? '실체 없는 성장 스토리나 일시적 흑자전환 기대주를 걸러내고, 다년간 본업에서 흔들림 없이 흑자를 창출한 실적 검증 기업을 선별합니다.'
          : 'Eliminates speculative pre-profit stories, focusing exclusively on enterprises with verified multi-year operating profitability.',
      formula:
        '모든 평가 연도 t에 대해: EBIT_t > 0 AND 지배주주 귀속 순이익_t > 0',
      conditionText: '5-Year Consecutive EBIT > 0 AND Net Income > 0',
      passCondition:
        language === 'ko'
          ? '평가 기간 모든 연도에서 영업이익(EBIT)과 당기순이익이 흑자(> 0)'
          : 'Positive EBIT and positive Net Income in every single evaluated year',
      exclusionCondition:
        language === 'ko'
          ? '단 한 해라도 영업손실 또는 당기순손실이 발생한 실적 변동성/적자 기업 배제'
          : 'Any operating loss or net loss year results in immediate disqualification',
      benchmarkStock:
        language === 'ko'
          ? '코스트코 (COST) — 수십 년간 무적자 안정적 영업흑자 지속'
          : 'Costco Wholesale (COST) — Multi-decade unbroken profitable operations',
    },
    {
      id: 6,
      num: '06',
      ruleId: 'eps_growth',
      categoryId: 'CORE' as RuleDefinitionCategory,
      category:
        language === 'ko' ? '주당순이익 복리 성장' : 'Compounding EPS Growth',
      targetHurdle: 'Diluted EPS CAGR ≥ 8.0%',
      applicability:
        language === 'ko'
          ? '전체 기업 (금융업 포함)'
          : 'All Enterprises (Inc. Financials)',
      historyYears:
        language === 'ko'
          ? '최근 5년 (부족 시 3년 → 1년)'
          : '5-Year (3Y/1Y fallback)',
      title:
        language === 'ko'
          ? '주당순이익 복리 성장률 (EPS Growth)'
          : 'Diluted EPS Compound Annual Growth',
      titleSub: 'Per-Share Compounding Engine',
      quoteAuthor: 'Warren Buffett',
      quote:
        language === 'ko'
          ? '“장기간 이익이 꾸준히 증가하는 기업으로 포트폴리오를 구성해야 합니다. 시간은 훌륭한 기업의 가장 좋은 친구입니다.”'
          : '"Our portfolio is built on businesses whose earnings increase steadily over long spans of time. Time is the friend of wonderful companies."',
      quoteYear: '1989',
      quoteSource:
        language === 'ko' ? '주주서한 (2장 투자)' : 'Shareholder Letter',
      purpose:
        language === 'ko'
          ? '증자나 M&A로 외형만 불리는 기업을 제외하고, 기존 보통주 주주 1주당 귀속되는 실질 이익이 인플레이션을 넘어 복리로 성장하는 기업을 선별합니다.'
          : 'Filters for durable compounders whose diluted earnings per share steadily outpace inflation over 5-year horizons.',
      formula:
        'EPS CAGR = (종료 희석 EPS ÷ 시작 희석 EPS)^(1/n) - 1  (시작 & 종료 EPS > 0)',
      conditionText: '5-Year Diluted EPS CAGR ≥ 8.0%',
      passCondition:
        language === 'ko'
          ? '시작 및 종료 희석 EPS가 모두 양수이며 5개년 연평균 복리 성장률 8.0% 이상 달성'
          : '5-Year Diluted EPS CAGR ≥ 8.0% with positive base and terminal EPS values',
      exclusionCondition:
        language === 'ko'
          ? '5년 EPS CAGR 8.0% 미만 정체 기업 또는 순손실/역성장 기업 배제'
          : 'Sub-8% compounding speed or deteriorating per-share earning power',
      benchmarkStock:
        language === 'ko'
          ? '엔비디아 (NVDA) — 5년 EPS CAGR 40%+ 폭발적 복리 성장'
          : 'NVIDIA (NVDA) — 5Y Diluted EPS CAGR 40%+',
    },
    {
      id: 7,
      num: '07',
      ruleId: 'owner_earnings_quality',
      categoryId: 'CORE' as RuleDefinitionCategory,
      category:
        language === 'ko'
          ? '주주이익 현금 전환 품질'
          : 'Owner Earnings Cash Quality',
      targetHurdle: 'Cash Conversion (ΣOE / ΣNet Income) ≥ 80.0%',
      applicability:
        language === 'ko'
          ? '비금융 일반기업 (금융업 N/A)'
          : 'Non-Financial Only (Financials N/A)',
      historyYears:
        language === 'ko'
          ? '최근 5년 (부족 시 3년 → 1년)'
          : '5-Year (3Y/1Y fallback)',
      title:
        language === 'ko'
          ? '주주이익 현금 전환 품질 (Owner Earnings Quality)'
          : 'Owner Earnings Cash Conversion Quality',
      titleSub: 'Real Cash Realization',
      quoteAuthor: 'Warren Buffett',
      quote:
        language === 'ko'
          ? '“보고이익에 비현금 비용을 더하고, 사업 경쟁력과 판매량 유지에 필요한 연평균 자본적지출(CapEx)을 차감한 것이 진정한 주주이익입니다.”'
          : '"Owner earnings represent reported earnings plus depreciation/amortization minus the average annual amount of capitalized expenditures for plant and equipment."',
      quoteYear: '1986',
      quoteSource:
        language === 'ko'
          ? '주주서한 (6장 가치평가)'
          : 'Shareholder Letter (Owner Earnings Appendix)',
      purpose:
        language === 'ko'
          ? '분식회계나 외상매출로 부풀린 장부상 이익(Paper Profit)을 배제하고, 설비투자를 차감한 뒤 주주에게 온전히 귀속되는 실질 잉여현금 품질을 엄격히 검증합니다.'
          : 'Eliminates cosmetic accounting profits by verifying that reported net income translates into real owner cash flow after all maintenance CapEx.',
      formula:
        'Adjusted CFO = CFO - 이자지급액  |  OE Proxy = Adjusted CFO - |CapEx|  |  Conversion = ΣOE ÷ Σ순이익',
      conditionText: 'Owner Earnings Proxy > 0 AND Cash Conversion ≥ 80.0%',
      passCondition:
        language === 'ko'
          ? '최근 및 기간 중앙값 주주이익 > 0 이며 누적 순이익 대비 주주이익 전환율 80.0% 이상'
          : 'Median & Recent Owner Earnings > 0 and 5Y Cumulative Cash Conversion ≥ 80.0%',
      exclusionCondition:
        language === 'ko'
          ? '장부상 흑자이나 CapEx 차감 후 실질 잉여현금이 순이익의 80%에 미달하거나 음수인 기업 배제'
          : 'Weak cash realization (< 80%) or negative owner earnings proxy after CapEx',
      benchmarkStock:
        language === 'ko'
          ? '애플 (AAPL) — 주주이익 전환율 100%+ 달성 (회계이익을 상회하는 막강한 현금창출)'
          : 'Apple (AAPL) — 100%+ Owner earnings cash conversion',
    },
    {
      id: 8,
      num: '08',
      ruleId: 'capital_action_flag',
      categoryId: 'REVIEW' as RuleDefinitionCategory,
      category:
        language === 'ko'
          ? '자본행동 검토 (Review)'
          : 'Capital Action Review Flag',
      targetHurdle: '-1.0% ≤ Shares CAGR ≤ +1.0% (안정)',
      applicability:
        language === 'ko'
          ? '전체 기업 (금융업 포함)'
          : 'All Enterprises (Inc. Financials)',
      historyYears:
        language === 'ko'
          ? '최근 5년 (부족 시 3년 → 1년)'
          : '5-Year (3Y/1Y fallback)',
      title:
        language === 'ko'
          ? '주식수 변동 및 자본행동 검토 (Capital Action Flag)'
          : 'Capital Action & Share Dilution Review Flag',
      titleSub: 'Share Count Discipline & Dilution Review',
      quoteAuthor: 'Warren Buffett',
      quote:
        language === 'ko'
          ? '“자사주 매입은 여유 자금이 있고 주가가 보수적으로 계산한 내재가치보다 낮을 때에만 현명합니다. 가치 희석을 일으키는 신주 발행은 엄격히 경계해야 합니다.”'
          : '"Repurchases are sensible only when shares are offered below conservative intrinsic value. We will not dilute intrinsic value by issuing shares without equal value in return."',
      quoteYear: '1999',
      quoteSource:
        language === 'ko'
          ? '주주서한 (4장 주식 / 자사주 매입의 조건)'
          : 'Shareholder Letter (Share Repurchases)',
      purpose:
        language === 'ko'
          ? '신주 발행(유상증자, CB/BW, 스톡옵션)으로 인한 지분 희석이나, 고평가 국면에서의 무분별한 자사주 매입 여부를 추적하여 심층 검토 상태를 부여합니다.'
          : 'Tracks share dilution and buyback behavior, flagging companies for detailed capital allocation review.',
      formula:
        'Diluted Share CAGR = (종료 희석주식수 ÷ 시작 희석주식수)^(1/n) - 1',
      conditionText:
        'CAGR > +1% (REVIEW_DILUTION) | -1% ~ +1% (STABLE) | < -1% (REVIEW_BUYBACK_PRICE)',
      passCondition:
        language === 'ko'
          ? 'STABLE (안정): 5개년 희석주식수 연평균 변동률 -1.0% ~ +1.0% 이내 유지'
          : 'STABLE: 5-Year Diluted Share CAGR maintained within -1.0% to +1.0%',
      exclusionCondition:
        language === 'ko'
          ? 'REVIEW_DILUTION (신주 발행 희석 검토) 또는 REVIEW_BUYBACK_PRICE (자사주 매입 단가 적정성 검토)'
          : 'Flags REVIEW_DILUTION (> +1%) or REVIEW_BUYBACK_PRICE (< -1%) for qualitative review',
      benchmarkStock:
        language === 'ko'
          ? '애플 (AAPL) — 10년간 35%+ 주식 소각 (자사주 매입 검토 플래그)'
          : 'Apple (AAPL) — Retired 35%+ of share count over 10 years',
    },
    {
      id: 9,
      num: '09',
      ruleId: 'retained_value_test',
      categoryId: 'AUXILIARY' as RuleDefinitionCategory,
      category:
        language === 'ko' ? '유보이익 가치 창출' : 'Retained Value Creation',
      targetHurdle: '5Y BVPS CAGR > Index CAGR AND All PBR > 1.0',
      applicability:
        language === 'ko'
          ? '전체 기업 (금융업 포함)'
          : 'All Enterprises (Inc. Financials)',
      historyYears:
        language === 'ko'
          ? '최근 5년 (부족 시 3년 → 1년)'
          : '5-Year (3Y/1Y fallback)',
      title:
        language === 'ko'
          ? '유보이익 장기 가치 창출 테스트 (Retained Value Test)'
          : 'Retained Earnings Value Creation Test',
      titleSub: 'Benchmark Book Value Compounding',
      quoteAuthor: 'Warren Buffett',
      quote:
        language === 'ko'
          ? '“경영진의 의도가 순수한지 확인하려면 주기적으로 실적을 평가해야 합니다. 순자산가치 증가율이 시장을 앞섰고, 주가가 계속 순자산가치보다 높았습니까?”'
          : '"Unrestricted earnings should be retained only when there is a reasonable prospect that every dollar retained creates at least one dollar of market value."',
      quoteYear: '1984',
      quoteSource:
        language === 'ko'
          ? '주주서한 (서언 소유주 관련 사업 원칙)'
          : 'Shareholder Letter (Owner Principles)',
      purpose:
        language === 'ko'
          ? '배당하지 않고 사내에 유보한 이익이 시장 대표 지수(S&P 500 / KOSPI)를 초과하는 순자산 복리 성장으로 연결되고 주가가 순자산 이상으로 거래되는지 확인합니다.'
          : 'Verifies that capital retained by management compounds equity faster than the broad index benchmark while trading above book value.',
      formula:
        'BVPS CAGR > Benchmark Index CAGR  AND  모든 분기말 PBR > 1.0배',
      conditionText: '5Y BVPS CAGR > Index CAGR AND Min Quarterly PBR > 1.0',
      passCondition:
        language === 'ko'
          ? '5개년 BVPS 복리성장률이 시장 지수 연평균 성장률을 상회하고 평가 기간 모든 분기말 PBR > 1.0배 유지'
          : '5Y BVPS CAGR exceeds benchmark index CAGR with all quarterly PBR > 1.0',
      exclusionCondition:
        language === 'ko'
          ? '순자산 복리 속도가 시장 지수보다 느리거나 PBR이 1.0배 미만으로 장부가치를 훼손하는 저효율 기업 배제'
          : 'Compounding slower than index or trading below book value',
      benchmarkStock:
        language === 'ko'
          ? '알파벳 (GOOGL) — 5년 BVPS CAGR 19.8% vs S&P 500 12.1% (초과 알파 +7.7%p)'
          : 'Alphabet (GOOGL) — 5Y BVPS CAGR 19.8% vs S&P 500 12.1% (+7.7%p alpha)',
    },
    {
      id: 10,
      num: '10',
      ruleId: 'owner_earnings_yield',
      categoryId: 'AUXILIARY' as RuleDefinitionCategory,
      category:
        language === 'ko'
          ? '주주이익 수익률 스프레드'
          : 'Yield Spread vs Treasuries',
      targetHurdle: 'Yield Spread ≥ +3.0%p',
      applicability:
        language === 'ko'
          ? '전체 기업 (금융업 포함)'
          : 'All Enterprises (Inc. Financials)',
      historyYears:
        language === 'ko'
          ? '최근 5년 (부족 시 3년 → 1년)'
          : '5-Year (3Y/1Y fallback)',
      title:
        language === 'ko'
          ? '주주이익 수익률 스프레드 (1차 가격 매력도)'
          : 'Owner Earnings Yield vs 10Y Treasury Spread',
      titleSub: 'Yield Spread Screener',
      quoteAuthor: 'Warren Buffett',
      quote:
        language === 'ko'
          ? '“미래 현금의 규모와 시점을 추정하고 무위험 이자율로 현재가치를 판단합니다. 국채보다 매력적인 수익률 스프레드를 제공하지 못한다면 투자할 이유가 없습니다.”'
          : '"We compare equity cash yields against the risk-free rate. If a business cannot provide a compelling spread over long-term treasuries, it is not an attractive investment."',
      quoteYear: '1992',
      quoteSource:
        language === 'ko' ? '주주서한 (6장 가치평가)' : 'Shareholder Letter',
      purpose:
        language === 'ko'
          ? '복잡한 DCF 계산 이전에 현재 시가총액 대비 정규화 주주이익 수익률이 10년물 국채수익률(무위험 금리) 대비 최소 +3.0%p 이상의 가격 여유를 갖는지 1차 검증합니다.'
          : 'Provides a rapid preliminary check that owner earnings yield exceeds the 10-year risk-free treasury rate by at least 3.0%p.',
      formula:
        'OE Yield = 정규화 주주이익 ÷ 시가총액  |  Yield Spread = OE Yield - 10년 국채수익률',
      conditionText:
        'Yield Spread = (Normalized OE ÷ Market Cap) - 10Y Treasury Rate ≥ +3.0%p',
      passCondition:
        language === 'ko'
          ? '정규화 주주이익 수익률이 시장별 10년 국채금리(미국/한국)보다 3.0%p 이상 높음'
          : 'Owner Earnings Yield exceeds the 10-year sovereign bond yield by ≥ 3.0%p',
      exclusionCondition:
        language === 'ko'
          ? '국채수익률 대비 스프레드가 3.0%p 미만으로 밸류에이션 매력도가 부족한 고평가 종목 배제'
          : 'Sub-3.0%p yield spread indicates insufficient margin over risk-free rate',
      benchmarkStock:
        language === 'ko'
          ? '메타 플랫폼스 (META) — 2022년 저점 당시 주주이익 수익률 국채 대비 +6%p+ 기록'
          : 'Meta Platforms (META) — 2022 bottom yielded +6%p spread over 10Y Treasuries',
    },
    {
      id: 11,
      num: '11',
      ruleId: 'owner_earnings_dcf',
      categoryId: 'VALUATION' as RuleDefinitionCategory,
      category:
        language === 'ko'
          ? '주주이익 DCF 가치평가'
          : 'Owner Earnings 10Y DCF Valuation',
      targetHurdle: 'Conservative Margin of Safety ≥ 20.0%',
      applicability:
        language === 'ko'
          ? '비금융 일반기업 (금융업 N/A)'
          : 'Non-Financial Only (Financials N/A)',
      historyYears:
        language === 'ko'
          ? '최근 5년 (부족 시 3년 → 1년)'
          : '5-Year (3Y/1Y fallback)',
      title:
        language === 'ko'
          ? '주주이익 기반 10년 DCF 내재가치 & 안전마진'
          : 'Owner Earnings 10-Year DCF Intrinsic Value',
      titleSub: 'Intrinsic Value Range & Margin of Safety',
      quoteAuthor: 'Warren Buffett',
      quote:
        language === 'ko'
          ? '“내재가치는 기업이 잔여수명 동안 창출하는 현금을 적절한 할인율로 할인한 가치이며, 정확한 숫자가 아니라 추정 범위입니다. 우리는 충분한 안전마진이 있을 때에만 매수합니다.”'
          : '"Intrinsic value is the discounted value of the cash that can be taken out of a business during its remaining life. We demand a margin of safety before allocating capital."',
      quoteYear: '1996',
      quoteSource:
        language === 'ko'
          ? '주주서한 (7장 종합 내재가치 산출)'
          : 'Shareholder Letter (Owner Earnings DCF)',
      purpose:
        language === 'ko'
          ? '1~10번 품질 규칙 통과 결과를 토대로 성장률 상한(Growth Cap: 10%/5%/3%)과 할인율(Discount Rate)을 자동 산출하고, 10년 보수적 DCF 모델을 통해 적정 매수 가격 범위와 20% 안전마진을 판정합니다.'
          : 'Synthesizes quality rule outcomes into a growth cap and discount rate, projecting a 10-year conservative DCF intrinsic value range with a 20% margin of safety.',
      formula:
        'OEPS_t = OEPS × (1+g)^t  |  PV = Σ[OEPS_t / (1+r)^t] + Terminal Value / (1+r)^10  |  Margin = (Value - Price) ÷ Value',
      conditionText:
        'Current Price ≤ Conservative Intrinsic Value × 0.80 (20%+ Margin)',
      passCondition:
        language === 'ko'
          ? 'PASS_WITH_MARGIN: 현재가가 보수적 추정 내재가치 대비 20.0% 이상 할인된 가격에 거래'
          : 'PASS_WITH_MARGIN: Stock price trades at a ≥ 20.0% discount to conservative DCF intrinsic value',
      exclusionCondition:
        language === 'ko'
          ? 'NO_MARGIN (기준 가치 초과 고평가) 또는 WATCH (가치 범위 내이나 20% 안전마진 미확보)'
          : 'NO_MARGIN (Overvalued above base value) or WATCH (Within intrinsic range but sub-20% margin)',
      benchmarkStock:
        language === 'ko'
          ? '버크셔 해서웨이 포트폴리오 핵심 보유 종목군'
          : 'Berkshire Hathaway Core Equity Portfolio',
    },
  ];

  const lynchRules = [
    {
      id: 1,
      num: '01',
      category: language === 'ko' ? '성장 대비 저평가' : 'GARP Valuation',
      targetHurdle: 'PEG Ratio ≤ 1.0',
      title:
        language === 'ko'
          ? '합리적인 가격의 성장성 (PEG 지표)'
          : 'Growth at a Reasonable Price (PEG Ratio)',
      titleSub: 'PEG Valuation Hurdle',
      quoteAuthor: 'Peter Lynch',
      quote:
        language === 'ko'
          ? '“어떤 기업이든 PER이 이익성장률과 같다면 적정 가격에 거래되는 것입니다. PER이 성장률보다 현저히 낮을 때 매수 기회가 찾아옵니다.”'
          : '"The P/E ratio of any company that\'s fairly priced will equal its growth rate... If the P/E is less than the growth rate, you may have found yourself a bargain."',
      quoteYear: '1989',
      purpose:
        language === 'ko'
          ? '성장 잠재력 대비 과도하게 높은 밸류에이션(고PER 버블)을 피하고, 성장률 대비 저평가된 진정한 GARP 기업을 선별합니다.'
          : 'Filters for companies whose earnings growth fundamentally justifies their current valuation multiple.',
      formula:
        'PEG = Trailing P/E Ratio ÷ 5Y Forward/Historical EPS Growth Rate (%)',
      conditionText: 'PEG Ratio ≤ 1.0 (Strong Buy: PEG ≤ 0.7)',
      passCondition:
        language === 'ko'
          ? 'PEG 지표 1.0 이하 (성장률 대비 합리적이거나 저평가된 주가 수준)'
          : 'PEG Ratio ≤ 1.0 (Indicates growth exceeds multiple)',
      exclusionCondition:
        language === 'ko'
          ? '실적 성장 대비 시장의 과열 기대로 PEG가 2.0을 초과하는 고평가 기업 배제'
          : 'Enterprises trading at hyper-inflated multiples with PEG > 2.0',
      benchmarkStock:
        language === 'ko'
          ? '메타 플랫폼스 (META) — 2022 저점 당시 PEG 0.6배 수준'
          : 'Meta Platforms (META) — Historic GARP rebound with PEG < 0.7',
    },
    {
      id: 2,
      num: '02',
      category: language === 'ko' ? '건전한 이익 복리' : 'Sustainable Growth',
      targetHurdle: '15.0% ≤ EPS CAGR ≤ 30.0%',
      title:
        language === 'ko'
          ? '지속 가능한 이익 성장률'
          : 'Sustainable Mid-to-High EPS Compounding',
      titleSub: 'Compounding Velocity',
      quoteAuthor: 'Peter Lynch',
      quote:
        language === 'ko'
          ? '“연 50%씩 급성장하는 기업을 조심하십시오. 그런 성장은 오래 유지될 수 없으며 경쟁자를 끌어들입니다. 연 20~25%씩 꾸준히 성장하는 기업이 가장 훌륭합니다.”'
          : '"In general, if you can find a company with a 20 to 25 percent growth rate, you\'ve found the ideal compounder. Extremely high 50%+ growth is rarely durable."',
      quoteYear: '1993',
      purpose:
        language === 'ko'
          ? '단기 테마나 착시로 인한 50%+의 일시적 폭증이 아닌, 15~30% 범위에서 장기 유지 가능한 내실 있는 우량 성장주를 포착합니다.'
          : 'Targeting robust, durable growth without excessive volatility or early burnout risks.',
      formula: '5-Year Normalized EPS CAGR',
      conditionText: '15.0% ≤ 5Y EPS CAGR ≤ 30.0%',
      passCondition:
        language === 'ko'
          ? '5개년 연평균 주당순이익 성장률 15% 이상 30% 이하 (안정적 고성장)'
          : '5-Year EPS Compound Annual Growth Rate between 15% and 30%',
      exclusionCondition:
        language === 'ko'
          ? '성장률 10% 미만의 정체 기업 또는 일시적 기저효과로 100%+ 널뛰는 불안정 기업 배제'
          : 'Low-growth stalwarts (< 10%) or unsustainable ephemeral spike businesses',
      benchmarkStock:
        language === 'ko'
          ? '코스트코 (COST) — 15년 이상 연평균 15~20% 수준의 견고한 복리 실적 성장'
          : 'Costco Wholesale (COST) — Long-term 15-20% EPS compounder',
    },
    {
      id: 3,
      num: '03',
      category: language === 'ko' ? '재무 안전성 & 순현금' : 'Net Cash & Solvency',
      targetHurdle: 'Debt / Equity ≤ 50.0%',
      title:
        language === 'ko'
          ? '낮은 차입금 및 풍부한 순현금 자산'
          : 'Conservative Debt Structure & Strong Cash Cushion',
      titleSub: 'Balance Sheet Anti-Fragility',
      quoteAuthor: 'Peter Lynch',
      quote:
        language === 'ko'
          ? '“부채가 전혀 없는 기업은 파산할 수 없습니다. 재무제표의 부채 항목을 확인하는 것은 어떤 정밀 분석보다 중요합니다.”'
          : '"A company with no debt can\'t go bankrupt. The balance sheet is the most critical check for long-term safety."',
      quoteYear: '1989',
      purpose:
        language === 'ko'
          ? '경기 침체기에도 도산 위험 없이 자력으로 사업을 확장할 수 있는 무차입/저부채 고유동성 기업을 선별합니다.'
          : 'Ensures zero bankruptcy risk and abundant liquidity during industry downturns.',
      formula: 'Debt-to-Equity = Total Long-Term Debt ÷ Total Equity',
      conditionText: 'Debt-to-Equity ≤ 50.0% OR Net Cash > 0',
      passCondition:
        language === 'ko'
          ? '부채비율 50% 이하 또는 보유 현금이 총부채보다 많은 순현금 기업'
          : 'Debt-to-Equity ≤ 50% or positive Net Cash position',
      exclusionCondition:
        language === 'ko'
          ? '부채비율 100% 초과 또는 차입금 리파이낸싱 위험이 상존하는 기업 배제'
          : 'High leverage with substantial interest burdens or refinancing vulnerabilities',
      benchmarkStock:
        language === 'ko'
          ? '알파벳 (GOOGL) — 부채비율 10% 미만, $100B+ 규모의 압도적 순현금'
          : 'Alphabet (GOOGL) — Ultra-clean balance sheet with $100B+ net cash',
    },
    {
      id: 4,
      num: '04',
      category: language === 'ko' ? '영업현금흐름 건전성' : 'Cash Flow Realization',
      targetHurdle: 'Operating Cash Flow > Net Income',
      title:
        language === 'ko'
          ? '영업활동 현금흐름과 실질 이익의 일치'
          : 'Operating Cash Flow Quality vs Reported Earnings',
      titleSub: 'Real Cash Generation',
      quoteAuthor: 'Peter Lynch',
      quote:
        language === 'ko'
          ? '“회계상의 장부 이익보다 실제로 회사 통장에 들어오는 현금흐름이 훨씬 더 솔직합니다.”'
          : '"Corporate profits can be cosmetic. Cash coming into the bank account never lies."',
      quoteYear: '1990',
      purpose:
        language === 'ko'
          ? '매출채권이나 가공 이익으로 부풀려진 착시 실적을 걸러내고, 실제 현금으로 회수되는 순도 높은 이익 창출 기업을 판정합니다.'
          : 'Verifies the quality of earnings by comparing cash from operations against accounting profits.',
      formula: 'Cash Conversion Ratio = Operating Cash Flow ÷ Net Income',
      conditionText: 'Operating Cash Flow ÷ Net Income ≥ 1.0x',
      passCondition:
        language === 'ko'
          ? '최근 3개년 평균 영업현금흐름이 당기순이익 이상 (현금 전환율 100%+)'
          : '3-Year Avg Operating Cash Flow ≥ 100% of Reported Net Income',
      exclusionCondition:
        language === 'ko'
          ? '장부상 흑자이나 영업활동 현금흐름이 마이너스이거나 지속 감소하는 기업 배제'
          : 'Paper profits accompanied by deteriorating or negative operating cash flows',
      benchmarkStock:
        language === 'ko'
          ? '마이크로소프트 (MSFT) — 영업현금흐름이 순이익의 120%+ 달성'
          : 'Microsoft (MSFT) — Flawless cash conversion with OCF/NI > 1.2x',
    },
  ];

  const filteredBuffettRules =
    selectedCategory === 'ALL'
      ? buffettRules
      : buffettRules.filter((r) => r.categoryId === selectedCategory);

  const getCategoryBadgeStyle = (cat: RuleDefinitionCategory) => {
    switch (cat) {
      case 'CORE':
        return 'bg-[#0071E3]/10 text-[#0071E3] dark:bg-[#2997FF]/20 dark:text-[#2997FF] border-[#0071E3]/20 dark:border-[#2997FF]/30';
      case 'REVIEW':
        return 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border-amber-500/20 dark:border-amber-500/30';
      case 'AUXILIARY':
        return 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 border-purple-500/20 dark:border-purple-500/30';
      case 'VALUATION':
        return 'bg-[#34C759]/10 text-[#34C759] dark:bg-[#34C759]/20 dark:text-[#34C759] border-[#34C759]/20 dark:border-[#34C759]/30';
      default:
        return 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700';
    }
  };

  const getCategoryLabel = (cat: RuleDefinitionCategory) => {
    switch (cat) {
      case 'CORE':
        return t('coreRules');
      case 'REVIEW':
        return t('reviewRules');
      case 'AUXILIARY':
        return t('auxiliaryRules');
      case 'VALUATION':
        return t('valuationRules');
      default:
        return cat;
    }
  };

  return (
    <div className="max-w-[780px] mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 animate-fade-in transition-colors duration-300">
      {/* 1. Editorial Header Section */}
      <header className="space-y-4 pb-8 border-b border-black/[0.08] dark:border-white/[0.10]">
        {/* Top Controls: Eyebrow + Guide Switcher Pill */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0071E3] dark:text-[#2997FF]">
            {activeGuide === 'buffett' ? (
              <>
                <BookOpen className="w-3.5 h-3.5" />
                <span>
                  {language === 'ko'
                    ? '버크셔 해서웨이 주주 서한 & 사업 원칙'
                    : 'Berkshire Hathaway Owner Principles'}
                </span>
              </>
            ) : (
              <>
                <TrendingUp className="w-3.5 h-3.5" />
                <span>
                  {language === 'ko'
                    ? '마젤란 펀드 성장주 발굴 원칙'
                    : 'Magellan Fund Growth Principles'}
                </span>
              </>
            )}
          </div>

          {/* Switch Guide Segmented Pill */}
          <div className="flex items-center gap-1 p-1 bg-[#F5F5F7] dark:bg-[#1C1C1E] rounded-xl w-fit border border-black/[0.04] dark:border-white/[0.08]">
            <button
              onClick={() => {
                navigate('/guide/buffett');
                setSelectedCategory('ALL');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeGuide === 'buffett'
                  ? 'bg-white dark:bg-[#2C2C2E] text-[#0071E3] dark:text-[#2997FF] shadow-xs'
                  : 'text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
              }`}
            >
              {t('guideBuffett')}
            </button>
            <button
              onClick={() => {
                navigate('/guide/lynch');
                setSelectedCategory('ALL');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeGuide === 'lynch'
                  ? 'bg-white dark:bg-[#2C2C2E] text-[#0071E3] dark:text-[#2997FF] shadow-xs'
                  : 'text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
              }`}
            >
              {t('guideLynch')}
            </button>
          </div>
        </div>

        {/* H1 Headline */}
        <h1 className="font-serif text-2xl sm:text-3xl lg:text-[34px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight leading-[1.25]">
          {activeGuide === 'buffett' ? t('guideTitle') : t('guideLynchTitle')}
        </h1>

        {/* Deck / Subtitle */}
        <p className="text-base sm:text-[17px] text-[#52525B] dark:text-[#A1A1A6] leading-[1.7] font-normal">
          {activeGuide === 'buffett'
            ? t('guideSubtitle')
            : t('guideLynchSubtitle')}
        </p>

        {/* Summary Stats Row - Editorial Style */}
        <div className="pt-4 flex flex-wrap items-center gap-6 sm:gap-8 text-xs border-t border-black/[0.04] dark:border-white/[0.06]">
          <div>
            <span className="text-[#86868B] block text-[11px]">핵심 원칙 체계</span>
            <span className="text-sm sm:text-base font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
              {activeGuide === 'buffett'
                ? t('keyRulesCount')
                : t('lynchRulesCount')}
            </span>
          </div>
          <div className="w-px h-6 bg-black/[0.08] dark:bg-white/[0.1]" />
          <div>
            <span className="text-[#86868B] block text-[11px]">스크리너 통과율</span>
            <span className="text-sm sm:text-base font-bold text-[#34C759]">
              {activeGuide === 'buffett'
                ? t('corePassRate')
                : t('lynchPassRate')}
            </span>
          </div>
          <div className="w-px h-6 bg-black/[0.08] dark:bg-white/[0.1]" />
          <div>
            <span className="text-[#86868B] block text-[11px]">핵심 평가 기준</span>
            <span className="text-sm sm:text-base font-bold text-[#0071E3] dark:text-[#2997FF]">
              {activeGuide === 'buffett' ? t('coreHurdle') : t('lynchHurdle')}
            </span>
          </div>
        </div>

        {/* Category Filter Pills (Buffett Guide Only) */}
        {activeGuide === 'buffett' && (
          <div className="pt-3 flex items-center gap-1.5 flex-wrap">
            {(['ALL', 'CORE', 'VALUATION', 'REVIEW', 'AUXILIARY'] as CategoryFilter[]).map(
              (cat) => {
                const label =
                  cat === 'ALL'
                    ? t('allRules')
                    : getCategoryLabel(cat as RuleDefinitionCategory);
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-[#1D1D1F] dark:bg-[#F5F5F7] text-white dark:text-[#1D1D1F] border-transparent shadow-xs'
                        : 'bg-[#F5F5F7] dark:bg-[#1C1C1E] text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] border-black/[0.04] dark:border-white/[0.08]'
                    }`}
                  >
                    {label}
                  </button>
                );
              }
            )}
          </div>
        )}
      </header>

      {/* Peter Lynch Engine Status Notice Banner */}
      {activeGuide === 'lynch' && (
        <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 text-amber-900 dark:text-amber-200 flex items-start gap-3.5">
          <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs sm:text-sm font-bold text-amber-800 dark:text-amber-300">
              {t('lynchEngineComingSoon')}
            </h4>
            <p className="text-xs text-amber-700/90 dark:text-amber-300/80 leading-relaxed">
              {t('lynchEngineComingSoonDesc')}
            </p>
          </div>
        </div>
      )}

      {/* 2. Editorial Rules List */}
      <div className="divide-y divide-black/[0.08] dark:divide-white/[0.10]">
        {activeGuide === 'buffett' ? (
          filteredBuffettRules.map((rule) => (
            <article key={rule.id} className="py-8 sm:py-12 space-y-6">
              {/* Top Row: Rule Number & Category & Target Hurdle */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-[#0071E3] dark:text-[#2997FF] bg-[#0071E3]/10 dark:bg-[#2997FF]/20 px-2 py-0.5 rounded">
                    RULE {rule.num}
                  </span>
                  <span
                    className={`font-mono text-[11px] font-semibold px-2 py-0.5 rounded-md border ${getCategoryBadgeStyle(
                      rule.categoryId
                    )}`}
                  >
                    {rule.categoryId}
                  </span>
                  <span className="text-[#D2D2D7] dark:text-[#3A3A3C]">/</span>
                  <span className="text-xs font-semibold text-[#86868B]">
                    {rule.category}
                  </span>
                </div>

                <span className="font-mono text-xs font-bold text-[#1D1D1F] dark:text-[#F5F5F7] bg-[#F5F5F7] dark:bg-[#252528] px-2.5 py-1 rounded-md border border-black/[0.06] dark:border-white/[0.08] tabular-nums">
                  {rule.targetHurdle}
                </span>
              </div>

              {/* H2 Title */}
              <div className="space-y-1">
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight leading-snug">
                  {rule.title}
                </h2>
                <div className="flex items-center gap-3 text-xs text-[#86868B]">
                  <span className="font-mono bg-black/[0.03] dark:bg-white/[0.06] px-1.5 py-0.5 rounded">
                    ID: {rule.ruleId}
                  </span>
                  <span>·</span>
                  <span>{rule.applicability}</span>
                  <span>·</span>
                  <span>{rule.historyYears}</span>
                </div>
              </div>

              {/* Editorial Pull-Quote (NYT Style Quote Box) */}
              <figure className="pl-4 sm:pl-5 border-l-2 border-[#0071E3] dark:border-[#2997FF] space-y-2 py-0.5">
                <blockquote className="font-serif italic text-[15px] sm:text-[16px] text-[#1D1D1F] dark:text-[#F5F5F7] leading-[1.75]">
                  {rule.quote}
                </blockquote>
                <figcaption className="text-xs text-[#86868B] not-italic">
                  — {rule.quoteAuthor} ({rule.quoteYear},{' '}
                  {rule.quoteSource})
                </figcaption>
              </figure>

              {/* Objective Section */}
              <div className="space-y-1.5">
                <h3 className="text-xs font-semibold text-[#86868B] uppercase tracking-wider">
                  {t('objective')}
                </h3>
                <p className="text-[14px] sm:text-[15px] text-[#3A3A3C] dark:text-[#D1D1D6] leading-[1.8]">
                  {rule.purpose}
                </p>
              </div>

              {/* Criteria & Formula Section */}
              <div className="space-y-3 pt-1">
                {/* Pass / Fail Criteria */}
                <div className="rounded-xl bg-[#F5F5F7] dark:bg-[#1E1E20] p-4 sm:p-5 space-y-3 border border-black/[0.04] dark:border-white/[0.06]">
                  {/* Pass */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-[#34C759]/15 text-[#34C759] flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <div className="text-xs sm:text-[13px] leading-relaxed">
                      <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                        {t('passCriteria')}:
                      </span>{' '}
                      <span className="text-[#3A3A3C] dark:text-[#D1D1D6]">
                        {rule.passCondition}
                      </span>
                    </div>
                  </div>

                  {/* Exclusion / Fail */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-[#FF3B30]/15 text-[#FF3B30] flex items-center justify-center shrink-0 mt-0.5">
                      <X className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <div className="text-xs sm:text-[13px] leading-relaxed">
                      <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                        {t('disqualification')}:
                      </span>{' '}
                      <span className="text-[#86868B] dark:text-[#A1A1A6]">
                        {rule.exclusionCondition}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Formula Block */}
                <div className="rounded-xl bg-[#FBFBFD] dark:bg-[#171719] border border-black/[0.06] dark:border-white/[0.08] p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#86868B]">
                    <span className="font-semibold uppercase tracking-wider">
                      {t('formula')}
                    </span>
                    <span className="font-mono text-[11px] text-[#0071E3] dark:text-[#2997FF]">
                      {rule.conditionText}
                    </span>
                  </div>
                  <div className="font-mono text-xs sm:text-[13px] text-[#1D1D1F] dark:text-[#F5F5F7] bg-black/[0.03] dark:bg-white/[0.05] p-2.5 rounded-lg overflow-x-auto whitespace-pre-wrap">
                    {rule.formula}
                  </div>
                  <div className="text-[11px] text-[#86868B] pt-1">
                    <span className="font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">
                      {language === 'ko' ? '대표 벤치마크' : 'Benchmark'}:
                    </span>{' '}
                    {rule.benchmarkStock}
                  </div>
                </div>
              </div>
            </article>
          ))
        ) : (
          lynchRules.map((rule) => (
            <article key={rule.id} className="py-8 sm:py-12 space-y-6">
              {/* Top Row: Rule Number & Category & Target Hurdle */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-[#0071E3] dark:text-[#2997FF] bg-[#0071E3]/10 dark:bg-[#2997FF]/20 px-2 py-0.5 rounded">
                    RULE {rule.num}
                  </span>
                  <span className="text-[#D2D2D7] dark:text-[#3A3A3C]">/</span>
                  <span className="text-xs font-semibold text-[#86868B]">
                    {rule.category}
                  </span>
                </div>

                <span className="font-mono text-xs font-bold text-[#1D1D1F] dark:text-[#F5F5F7] bg-[#F5F5F7] dark:bg-[#252528] px-2.5 py-1 rounded-md border border-black/[0.06] dark:border-white/[0.08] tabular-nums">
                  {rule.targetHurdle}
                </span>
              </div>

              {/* H2 Title */}
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight leading-snug">
                {rule.title}
              </h2>

              {/* Editorial Pull-Quote */}
              <figure className="pl-4 sm:pl-5 border-l-2 border-[#0071E3] dark:border-[#2997FF] space-y-2 py-0.5">
                <blockquote className="font-serif italic text-[15px] sm:text-[16px] text-[#1D1D1F] dark:text-[#F5F5F7] leading-[1.75]">
                  {rule.quote}
                </blockquote>
                <figcaption className="text-xs text-[#86868B] not-italic">
                  — {rule.quoteAuthor} ({rule.quoteYear})
                </figcaption>
              </figure>

              {/* Objective Section */}
              <div className="space-y-1.5">
                <h3 className="text-xs font-semibold text-[#86868B] uppercase tracking-wider">
                  {t('objective')}
                </h3>
                <p className="text-[14px] sm:text-[15px] text-[#3A3A3C] dark:text-[#D1D1D6] leading-[1.8]">
                  {rule.purpose}
                </p>
              </div>

              {/* Criteria & Formula Section */}
              <div className="space-y-3 pt-1">
                {/* Pass / Fail Criteria */}
                <div className="rounded-xl bg-[#F5F5F7] dark:bg-[#1E1E20] p-4 sm:p-5 space-y-3 border border-black/[0.04] dark:border-white/[0.06]">
                  {/* Pass */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-[#34C759]/15 text-[#34C759] flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <div className="text-xs sm:text-[13px] leading-relaxed">
                      <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                        {t('passCriteria')}:
                      </span>{' '}
                      <span className="text-[#3A3A3C] dark:text-[#D1D1D6]">
                        {rule.passCondition}
                      </span>
                    </div>
                  </div>

                  {/* Exclusion / Fail */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-[#FF3B30]/15 text-[#FF3B30] flex items-center justify-center shrink-0 mt-0.5">
                      <X className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <div className="text-xs sm:text-[13px] leading-relaxed">
                      <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                        {t('disqualification')}:
                      </span>{' '}
                      <span className="text-[#86868B] dark:text-[#A1A1A6]">
                        {rule.exclusionCondition}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Formula Block */}
                <div className="rounded-xl bg-[#FBFBFD] dark:bg-[#171719] border border-black/[0.06] dark:border-white/[0.08] p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#86868B]">
                    <span className="font-semibold uppercase tracking-wider">
                      {t('formula')}
                    </span>
                    <span className="font-mono text-[11px] text-[#0071E3] dark:text-[#2997FF]">
                      {rule.conditionText}
                    </span>
                  </div>
                  <div className="font-mono text-xs sm:text-[13px] text-[#1D1D1F] dark:text-[#F5F5F7] bg-black/[0.03] dark:bg-white/[0.05] p-2.5 rounded-lg overflow-x-auto whitespace-pre-wrap">
                    {rule.formula}
                  </div>
                  <div className="text-[11px] text-[#86868B] pt-1">
                    <span className="font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">
                      {language === 'ko' ? '대표 벤치마크' : 'Benchmark'}:
                    </span>{' '}
                    {rule.benchmarkStock}
                  </div>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
};
