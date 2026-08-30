import { HelpPopoverContent } from '../components/common/HelpPopover';
import { Language } from '../locales/translations';

/**
 * Korean and English explanatory dictionary for terms and concepts
 * across Section 4, 5, 6, and 7 of the Stock Detail Page.
 */

// ==========================================
// SECTION 4: BUFFETT RULE DIAGNOSIS GLOSSARY
// ==========================================
export const getBuffettRuleGlossary = (ruleId: string, language: Language): HelpPopoverContent => {
  const isKo = language === 'ko';

  switch (ruleId) {
    case 'sustained_roe':
      return {
        title: isKo ? '지속 가능한 자기자본이익률 (Sustained ROE)' : 'Sustained Return on Equity (ROE)',
        badge: isKo ? '핵심 7원칙 #1' : 'CORE RULE #1',
        description: isKo
          ? '주주가 투자한 자기자본(순자산)을 바탕으로 기업이 얼마나 효율적으로 순이익을 창출했는지를 나타내는 핵심 수익성 지표입니다.'
          : 'Measures how efficiently a company generates profits from shareholders’ equity.',
        whyItMatters: isKo
          ? '단순 매출 규모보다 중요한 것은 "주주 자본 1원당 얼마의 이익을 남기는가"입니다. 5년 연속 15% 이상을 유지하는 기업은 강력한 경제적 해자(Moat)를 보유했을 확률이 높습니다.'
          : 'High, consistent ROE indicates a durable competitive advantage (economic moat).',
        formula: isKo
          ? 'ROE = 당기순이익 ÷ 평균 자기자본 (5개년 전 기간 매년 ≥ 15%)'
          : 'ROE = Net Income / Average Common Equity (Every year ≥ 15%)',
        quote: {
          text: isKo
            ? '“우리는 회사의 규모로 실적을 평가하지 않고 주당 가치 증가율로 평가합니다. 높은 자본이익률을 지속하는 기업이 핵심입니다.”'
            : '"We measure financial results by per-share value growth and above-average return on equity."',
          author: 'Warren Buffett (1979)',
        },
      };

    case 'sustained_roic':
      return {
        title: isKo ? '투하자본이익률 (Sustained ROIC)' : 'Sustained ROIC',
        badge: isKo ? '핵심 7원칙 #2' : 'CORE RULE #2',
        description: isKo
          ? '부채와 자본 조달 방식에 따른 왜곡 없이, 실제 영업활동에 투입된 총 자본(투하자본) 대비 세후 영업이익 창출 효율을 평가합니다.'
          : 'Measures return generated on all operating capital invested in the core business, independent of debt financing leverage.',
        whyItMatters: isKo
          ? '부채를 과도하게 끌어써서 ROE만 겉보기에 높인 부실기업을 걸러내고, 본업의 순수한 자본운용 능력을 검증합니다.'
          : 'Filters out companies that artificially inflate ROE through high debt leverage.',
        formula: isKo
          ? 'ROIC = 세후영업이익(NOPAT) ÷ 평균 투하자본(IC) (5개년 전 기간 매년 ≥ 10%)'
          : 'ROIC = NOPAT / Average Invested Capital (Every year ≥ 10%)',
        quote: {
          text: isKo
            ? '“단순히 자본을 추가 투입하는 것이 아니라, 투입한 자본에서 높은 수익을 창출하는 능력이 진정한 부를 만듭니다.”'
            : '"It is the return generated on capital employed that creates true wealth."',
          author: 'Warren Buffett (1995)',
        },
      };

    case 'debt_safety':
      return {
        title: isKo ? '재무 안전성 & 이자보상배율 (Debt Safety)' : 'Conservative Debt Safety',
        badge: isKo ? '핵심 7원칙 #3' : 'CORE RULE #3',
        description: isKo
          ? '기업의 부채비율이 건전한 수준인지, 그리고 영업이익으로 이자비용을 충분히 감당할 수 있는지를 평가합니다.'
          : 'Evaluates financial leverage safety and ability to service debt payments easily with operating earnings.',
        whyItMatters: isKo
          ? '아무리 뛰어난 비즈니스 모델이라도 과도한 차입금은 불황기에 파산 위험을 초래합니다. 워런 버핏은 보수적인 무차입 혹은 최소 차입 경영을 극히 선호합니다.'
          : 'Excessive leverage is the primary cause of corporate distress during downturns.',
        formula: isKo
          ? '부채비율 ≤ 100% AND 이자보상배율(EBIT/이자) ≥ 5.0배 (이자비용 0일 경우 통과)'
          : 'Total Debt / Equity ≤ 100% & EBIT / Interest Paid ≥ 5.0x',
        quote: {
          text: isKo
            ? '“우리는 밤에 편안히 잠들 수 있는 수준 이하로만 부채를 유지합니다. 과도한 레버리지는 언제나 위험을 부릅니다.”'
            : '"We will not trade a night’s sleep for a chance of extra profit with leverage."',
          author: 'Warren Buffett',
        },
      };

    case 'retained_value_test':
      return {
        title: isKo ? '1달러 유보이익 가치창출 (1-Dollar Retained Value Test)' : '1-Dollar Retained Value Test',
        badge: isKo ? '핵심 7원칙 #4' : 'CORE RULE #4',
        description: isKo
          ? '기업이 배당으로 지급하지 않고 사내에 유보한 이익 1달러당 1달러 이상의 시장가치를 창출했는지를 검증합니다.'
          : 'Tests whether every dollar of earnings retained by the company creates at least one dollar of market value for shareholders.',
        whyItMatters: isKo
          ? '경영진이 이익을 재투자할 때 주주가 직접 배당받아 인덱스에 투자하는 것보다 더 높은 가치를 만들어내지 못한다면 주주가치를 훼손하는 것입니다.'
          : 'Ensures management reinvests retained profits superior to market index returns.',
        formula: isKo
          ? 'BPS(주당순자산) 복리성장률 > 벤치마크(S&P500/KOSPI) 성장률 AND 최저 PBR > 1.0'
          : 'BVPS CAGR > Benchmark Index CAGR & 5Y Min PBR > 1.0',
        quote: {
          text: isKo
            ? '“유보된 1달러의 이익은 주주에게 최소 1달러 이상의 시장 가치를 만들어주어야 합니다.”'
            : '"Unrestricted earnings should be retained only when there is reasonable prospect that retention will deliver at least $1 of market value for each $1 retained."',
          author: 'Warren Buffett (1983)',
        },
      };

    case 'capital_light_business':
      return {
        title: isKo ? '설비투자 효율성 (Capital-Light Business)' : 'Capital-Light Business',
        badge: isKo ? '핵심 7원칙 #5' : 'CORE RULE #5',
        description: isKo
          ? '기업이 영업활동으로 벌어들인 현금(CFO) 중 공장, 기계, 설비 유지보수(CapEx)에 소모되는 비중을 측정합니다.'
          : 'Measures how much operating cash flow must be poured back into capital expenditures just to maintain competitiveness.',
        whyItMatters: isKo
          ? '매년 번 돈의 대부분을 설비투자에 쏟아부어야 하는 기업은 주주에게 환원할 잉여현금(FCF)이 남지 않습니다. 적은 자본으로 막대한 현금을 창출하는 기업이 최고의 자산입니다.'
          : 'Great businesses generate abundant free cash flow without consuming large capital investments.',
        formula: isKo
          ? '5개년 누적 CapEx ÷ 5개년 누적 영업현금흐름(CFO) ≤ 50%'
          : '5Y Cumulative CapEx / 5Y Cumulative CFO ≤ 50%',
        quote: {
          text: isKo
            ? '“최고의 기업은 많은 자본을 추가로 들이지 않고도 높은 수익을 내며 성장하는 기업입니다.”'
            : '"The best business is a royalty on the growth of others, requiring little capital investment itself."',
          author: 'Warren Buffett',
        },
      };

    case 'proven_earnings_power':
      return {
        title: isKo ? '검증된 실적 이익창출력 (Proven Earnings Power)' : 'Proven Earnings Power',
        badge: isKo ? '핵심 7원칙 #6' : 'CORE RULE #6',
        description: isKo
          ? '경기 변동이나 일시적 위기 속에서도 5년 내내 단 한 번의 적자 없이 영업이익(EBIT)과 당기순이익 흑자를 지켜냈는지 점검합니다.'
          : 'Verifies consecutive profitability across all 5 historical years without any operating or net losses.',
        whyItMatters: isKo
          ? '워런 버핏의 제1원칙은 "돈을 잃지 마라", 제2원칙은 "제1원칙을 잊지 마라"입니다. 일관된 흑자 기조는 예측 불가능한 미래의 안전판 역할을 합니다.'
          : 'Rule #1 is never lose money. Consistent profitability across all cycles protects principal.',
        formula: isKo
          ? '5개년 전 기간 매년 영업이익(EBIT) > 0 AND 당기순이익 > 0'
          : 'EBIT > 0 and Net Income > 0 in all 5 historical years',
      };

    case 'eps_growth':
      return {
        title: isKo ? 'EPS 복리 성장률 (EPS Compound Growth)' : 'EPS Compound Growth',
        badge: isKo ? '핵심 7원칙 #7' : 'CORE RULE #7',
        description: isKo
          ? '1주당 벌어들이는 순이익(희석 EPS)이 지난 5년간 연평균(CAGR) 8% 이상 꾸준히 성장했는지를 평가합니다.'
          : 'Evaluates whether diluted Earnings Per Share has compounded at an annualized rate of 8.0%+ over 5 years.',
        whyItMatters: isKo
          ? '총 이익이 늘더라도 주식수가 남발되면 주당 가치는 정체됩니다. 주주 입장에서 실질적인 성장은 오직 "주당순이익(EPS)의 성장"입니다.'
          : 'Per-share earnings growth is the true driver of long-term intrinsic value expansion.',
        formula: isKo
          ? '5개년 희석 EPS 연평균 복리성장률(CAGR) ≥ 8.0%'
          : '5-Year Diluted EPS CAGR ≥ 8.0%',
      };

    case 'owner_earnings_quality':
      return {
        title: isKo ? '주주이익 현금품질 (Owner Earnings Quality)' : 'Owner Earnings Quality',
        badge: isKo ? '보조 원칙' : 'SUPPLEMENTAL RULE',
        description: isKo
          ? '회계상 당기순이익이 실제 현금 형태의 주주이익(Owner Earnings)으로 얼마나 충실히 전환되는지를 검증합니다.'
          : 'Checks if accounting net income translates effectively into real, unencumbered cash for owners.',
        whyItMatters: isKo
          ? '장부상 이익만 있고 실제 현금이 들어오지 않는 기업(매출채권 급증 등)은 분식 위험이 있습니다. 현금 전환율 80% 이상인 기업이 정직한 이익을 냅니다.'
          : 'High cash conversion guarantees high earnings quality and low accounting risk.',
        formula: isKo
          ? '주주이익(순이익 + 감가상각 - 유지CapEx) > 0 AND 현금전환율 ≥ 80%'
          : 'Owner Earnings > 0 & Cash Conversion Ratio ≥ 80%',
      };

    case 'owner_earnings_yield':
      return {
        title: isKo ? '주주이익 초과수익률 (Yield Spread vs Benchmark)' : 'Owner Earnings Yield Spread',
        badge: isKo ? '보조 원칙' : 'SUPPLEMENTAL RULE',
        description: isKo
          ? '현재 시가총액 대비 기업이 창출하는 주주이익 수익률(Owner Earnings Yield)이 무위험 자산인 10년물 국채 금리를 초과하는지 비교합니다.'
          : 'Compares the company’s owner earnings yield against the risk-free 10-year government bond rate.',
        whyItMatters: isKo
          ? '주식 투자는 국채보다 위험하므로 국채 수익률 이상의 확실한 초과 이익수익률을 제공해야만 투자 가치가 성립합니다.'
          : 'Equities must deliver yield spread over risk-free bonds to justify taking business risk.',
        formula: isKo
          ? '주주이익수익률(OE ÷ 시가총액) ≥ 10년물 국채 무위험수익률'
          : 'Owner Earnings Yield (OE / Market Cap) ≥ 10Y Risk-Free Rate',
      };

    default:
      return {
        title: ruleId,
        description: isKo ? '워런 버핏의 원칙 진단 지표입니다.' : 'Warren Buffett investment pillar metric.',
      };
  }
};

// ==========================================
// SECTION 5: DCF & CAPITAL ACTION GLOSSARY
// ==========================================
export const DCF_GLOSSARY = {
  header: (language: Language): HelpPopoverContent => {
    const isKo = language === 'ko';
    return {
      title: isKo ? '10개년 주주이익 DCF 가치평가 모델' : '10-Year Owner Earnings DCF Valuation',
      badge: isKo ? '내재가치 평가' : 'VALUATION MODEL',
      description: isKo
        ? '워런 버핏의 "주주이익(Owner Earnings = 영업현금흐름 - 총 CapEx)"을 바탕으로, 향후 10년간 기업이 창출할 현금흐름을 주주요구수익률로 할인하여 주당 본질가치(Intrinsic Value)를 산출하는 보수적 가치평가 모델입니다 (성장 CapEx까지 전액 차감된 보수적 현금흐름 하한선 기준).'
        : 'Warren Buffett’s discounted cash flow model using Owner Earnings discounted by the required cost of equity to calculate a conservative baseline intrinsic value per share.',
      whyItMatters: isKo
        ? '주가는 단기적으로 시장의 인기투표에 의해 등락하지만, 장기적으로는 기업이 평생 벌어들일 현금의 현재가치(내재가치)로 수렴합니다.'
        : 'Price is what you pay; value is what you get. Stock prices ultimately track per-share cash flow generation.',
      formula: isKo
        ? '내재가치 = 향후 10년간 주주이익 현재가치 합 + 영구가치(Terminal Value) 현재가치'
        : 'IV = Sum of PV(10-Year Owner Earnings) + PV(Terminal Value)',
      quote: {
        text: isKo
          ? '“가격은 당신이 지불하는 것이고, 가치는 당신이 얻는 것입니다.”'
          : '"Price is what you pay. Value is what you get."',
        author: 'Warren Buffett',
      },
    };
  },
  conservativeIV: (language: Language): HelpPopoverContent => {
    const isKo = language === 'ko';
    return {
      title: isKo ? '보수적 추정 내재가치 (Conservative IV)' : 'Conservative Intrinsic Value',
      badge: isKo ? '적정주가 추정' : 'FAIR VALUE',
      description: isKo
        ? '미래의 불확실성을 감안하여 기본 성장률 대비 3.0%p 차감된 보수적 성장률(하한 0%)과 주주요구수익률(할인율)을 적용해 산출한 주당 적정 본질가치입니다.'
        : 'Estimated intrinsic value per share applying a conservative growth assumption (base growth minus 3.0%p, floored at 0%) and required discount rate.',
      whyItMatters: isKo
        ? '과도한 낙관론으로 인한 투자 손실을 막기 위해, 최악의 경제 환경에서도 기업이 창출할 수 있는 안전한 가치를 기준점으로 삼습니다.'
        : 'Prevents overpaying by grounding valuation in pessimistic/modest growth realities.',
      tip: isKo
        ? '현재 주가가 이 보수적 내재가치보다도 20% 이상 저렴할 때 가장 안전한 매수 기회가 됩니다.'
        : 'A buying opportunity exists when price trades at a 20%+ discount to this conservative value.',
    };
  },
  marginOfSafety: (language: Language): HelpPopoverContent => {
    const isKo = language === 'ko';
    return {
      title: isKo ? '안전마진 (Margin of Safety)' : 'Margin of Safety (MoS)',
      badge: isKo ? '투자 안전판' : 'RISK PROTECTION',
      description: isKo
        ? '추정된 기업의 내재가치와 현재 시장 주가 사이의 할인율 격차를 의미합니다.'
        : 'The percentage discount between estimated intrinsic value and current market price.',
      whyItMatters: isKo
        ? '인간의 예측은 언제나 틀릴 수 있습니다. 내재가치 대비 20% 이상 저렴한 가격에 매수하면, 분석에 실수가 있거나 불황이 닥쳐도 원금을 안전하게 지킬 수 있습니다.'
        : 'Provides a cushion against valuation miscalculations, unexpected industry downturns, or macroeconomic shocks.',
      formula: isKo
        ? '안전마진 = (보수적 내재가치 - 현재주가) ÷ 보수적 내재가치'
        : 'Margin of Safety = (Conservative IV - Price) / Conservative IV',
      quote: {
        text: isKo
          ? '“투자에서 가장 중요한 세 단어는 바로 ‘안전마진’입니다.”'
          : '"The three most important words in investing are Margin of Safety."',
        author: 'Benjamin Graham & Warren Buffett',
      },
    };
  },
  scenarios: (language: Language): HelpPopoverContent => {
    const isKo = language === 'ko';
    return {
      title: isKo ? 'DCF 3대 시나리오 & 할인율 (주주요구수익률)' : 'DCF Scenarios & Discount Rate (Cost of Equity)',
      badge: isKo ? '시나리오 분석' : 'SENSITIVITY',
      description: isKo
        ? '미래 성장률에 따라 보수적(Base-3%p), 기본(Base), 낙관적(Base+3%p) 3가지 시나리오로 내재가치를 다각도 비교하며, 주주요구수익률(무위험수익률+5%p 가산, 최저 8% 및 부채 리스크 가산)을 할인율로 적용합니다.'
        : 'Compares intrinsic value estimates across Conservative (Base-3%p), Base, and Optimistic (Base+3%p) scenarios discounted by required cost of equity (Risk-Free + 5%p floor 8%, plus debt risk adjustments).',
      whyItMatters: isKo
        ? '단 하나의 확정된 숫자가 아닌 합리적인 가치 범위를 파악하여 의사결정의 유연성을 확보합니다.'
        : 'Helps understand the plausible range of value rather than relying on a single static number.',
    };
  },
};

export const CAPITAL_ACTION_GLOSSARY = {
  header: (language: Language): HelpPopoverContent => {
    const isKo = language === 'ko';
    return {
      title: isKo ? '자본배치 및 주식 희석 검토 (Capital Allocation)' : 'Capital Allocation Review',
      badge: isKo ? '소유주 원칙' : 'OWNER PRINCIPLE',
      description: isKo
        ? '경영진이 창출된 이익을 어떻게 배분하는지(신주 발행, 유상증자, 스톡옵션 남발, 자사주 매입 및 배당)를 점검하여 주당 지분 가치가 훼손되지 않는지 검토합니다.'
        : 'Evaluates how management allocates surplus capital and whether per-share shareholder equity is preserved or diluted.',
      whyItMatters: isKo
        ? '훌륭한 경영진의 가장 중요한 임무는 "자본배치"입니다. 엉뚱한 기업 인수나 무분별한 신주 발행은 주주 가치를 파괴합니다.'
        : 'Capital allocation is the CEO’s most crucial long-term responsibility.',
      quote: {
        text: isKo
          ? '“자본 배치는 최고경영자가 수행해야 하는 가장 중요한 임무입니다.”'
          : '"Capital allocation is the most critical job of a CEO."',
        author: 'Warren Buffett',
      },
    };
  },
  dilutionMetric: (language: Language): HelpPopoverContent => {
    const isKo = language === 'ko';
    return {
      title: isKo ? '5개년 희석주식수 연평균 증감률 (5Y CAGR)' : '5-Year Diluted Shares CAGR',
      badge: isKo ? '주식수 변동' : 'SHARE COUNT',
      description: isKo
        ? '기업의 전체 발행 주식수(전환사채, 스톡옵션 등 희석증권 포함)가 지난 5년간 매년 몇 %씩 늘어나거나 줄어들었는지를 나타냅니다.'
        : 'Annualized growth or reduction rate of total diluted shares outstanding over 5 years.',
      whyItMatters: isKo
        ? '주식수가 0% 이하(안정/감소)이면 자사주 소각 등으로 주당 가치가 커집니다. 반면 주식수가 매년 급증하면 피자 조각이 쪼개지듯 기존 주주의 몫이 줄어듭니다(희석 위험).'
        : 'Share count reduction increases each share’s claim on profits, while dilution shrinks existing ownership.',
      tip: isKo
        ? 'STABLE(안정): 주식수 유지/감소 | REVIEW_DILUTION: 연 1.5%+ 이상 유상증자/스톡옵션 증가 경고'
        : 'STABLE: Preserved or decreasing | REVIEW_DILUTION: Rapid share count expansion warning',
    };
  },
};

// ==========================================
// SECTION 6: MARKET SNAPSHOT GLOSSARY
// ==========================================
export const MARKET_BENCHMARK_GLOSSARY = {
  header: (language: Language): HelpPopoverContent => {
    const isKo = language === 'ko';
    return {
      title: isKo ? '시장 지표 & 벤치마크 (Market Snapshot)' : 'Market Snapshot & Benchmark',
      badge: isKo ? '시장 비교' : 'BENCHMARK',
      description: isKo
        ? '현재 시장의 실시간 가격 데이터와 10년물 국채 무위험수익률, 그리고 1달러 유보이익 테스트를 위한 지수(S&P500 / KOSPI) 벤치마크 데이터를 통합 제공합니다.'
        : 'Comprehensive market reference points including 10Y risk-free rates and index benchmark comparison points.',
    };
  },
  riskFreeRate: (language: Language): HelpPopoverContent => {
    const isKo = language === 'ko';
    return {
      title: isKo ? '무위험수익률 (10년물 국채 금리)' : 'Risk-Free Benchmark Rate (10Y)',
      badge: isKo ? '기회비용 잣대' : 'OPPORTUNITY COST',
      description: isKo
        ? '국가가 보증하는 10년 만기 국채의 수익률로, 모든 위험자산(주식) 투자의 최소 기회비용 기준점이 됩니다.'
        : 'The baseline return guaranteed by 10-year government treasury bonds, serving as the benchmark opportunity cost.',
      whyItMatters: isKo
        ? '워런 버핏은 주식의 주주이익수익률이나 DCF 할인율을 평가할 때 항상 국채 금리를 중력과 같은 가장 기초적인 잣대로 활용합니다.'
        : 'Interest rates act like gravity on all asset prices.',
      quote: {
        text: isKo
          ? '“금리는 금융 자산의 가격을 결정하는 중력과 같습니다.”'
          : '"Interest rates are to asset prices what gravity is to physical objects."',
        author: 'Warren Buffett',
      },
    };
  },
  benchmarkPoints: (language: Language): HelpPopoverContent => {
    const isKo = language === 'ko';
    return {
      title: isKo ? '1달러 유보이익 테스트 벤치마크 지수' : '1-Dollar Test Benchmark Points',
      badge: isKo ? '시장 지수' : 'MARKET INDEX',
      description: isKo
        ? '해당 종목의 BPS(주당순자산) 성장률과 비교하기 위해 수집된 동기간 시장 대표 지수(미국: S&P 500, 한국: KOSPI)의 기준 포인트입니다.'
        : 'Historical market index benchmark points used to evaluate whether retained earnings beat the broader market.',
      whyItMatters: isKo
        ? '기업이 자본을 굴려서 낸 성과가 단순히 인덱스 펀드에 투자했을 때의 시장 평균 성장률보다 우수한지 객관적으로 증명합니다.'
        : 'Objectively verifies if enterprise value accumulation outperforms a passive index holding.',
    };
  },
  quarterlyBvps: (language: Language): HelpPopoverContent => {
    const isKo = language === 'ko';
    return {
      title: isKo ? '분기별 BVPS(주당순자산) & PBR 추이' : 'Quarterly BVPS & P/B History',
      badge: isKo ? '장부가치 추이' : 'BOOK VALUE',
      description: isKo
        ? '분기별 주당순자산가치(BVPS)와 실제 주가 및 주가순자산비율(PBR)의 역사적 궤적을 보여줍니다.'
        : 'Quarterly track record of Book Value Per Share (BVPS), stock prices, and historical P/B multiples.',
      whyItMatters: isKo
        ? '장기적으로 기업의 BVPS가 우상향하면 주가도 이에 비례하여 상승합니다. PBR이 지속적으로 1.0배 이상을 유지하는지 점검할 수 있습니다.'
        : 'Durable compounders demonstrate steadily rising BVPS alongside market price appreciation.',
    };
  },
};

// ==========================================
// SECTION 7: 5-YEAR FINANCIALS GLOSSARY
// ==========================================
export const FINANCIALS_TABLE_GLOSSARY = {
  header: (language: Language): HelpPopoverContent => {
    const isKo = language === 'ko';
    return {
      title: isKo ? '5개년 연차 재무제표 10대 핵심 계정과목 종합 가이드' : '5-Year Financial Statements: 10-Metric Comprehensive Guide',
      badge: isKo ? '재무제표 종합 해설' : 'FINANCIAL GLOSSARY',
      description: isKo
        ? '추정이나 가공 없이 공식 공시된 5개년 확정 연차 재무제표 원본 데이터입니다. 아래 10개 핵심 계정과목의 개념을 한눈에 확인하세요.'
        : 'Audited 5-year raw financial statements. Review definitions for all 10 core financial metrics below.',
      whyItMatters: isKo
        ? '손익계산서(순이익/EBIT), 재무상태표(자본/부채/현금), 현금흐름표(CFO/CapEx/이자), 주당지표(EPS/주식수)의 4대 영역을 종합적으로 분석하여 기업의 실질 펀더멘털을 파악합니다.'
        : 'Comprehensive transparency into Income, Balance Sheet, Cash Flow, and Per-Share drivers powering valuation.',
    };
  },
  categories: (language: Language) => {
    const isKo = language === 'ko';
    return [
      {
        group: isKo ? '📈 손익계산서 (Income Statement)' : '📈 Income Statement',
        items: [
          {
            name: isKo ? '보통주 순이익 (Net Income)' : 'Net Income to Common',
            desc: isKo
              ? '우선주 배당금 등을 제외하고 최종적으로 보통주 주주에게 귀속되는 최종 당기순이익'
              : 'Net profit attributable solely to common equity shareholders.',
          },
          {
            name: isKo ? '영업이익 (EBIT)' : 'EBIT (Operating Income)',
            desc: isKo
              ? '이자비용과 법인세 차감 전 본업 활동으로 번 이익으로, 순수한 본업 수익성을 대변'
              : 'Earnings Before Interest and Taxes, representing core operating earnings.',
          },
        ],
      },
      {
        group: isKo ? '🏛️ 재무상태표 (Balance Sheet)' : '🏛️ Balance Sheet',
        items: [
          {
            name: isKo ? '보통주 자기자본 (Common Equity)' : 'Common Equity',
            desc: isKo
              ? '총 자산에서 총 부채를 뺀 순자산(장부가치)으로, 보통주 주주들의 순수한 몫'
              : 'Total assets minus total liabilities, representing total book equity.',
          },
          {
            name: isKo ? '이자발생 부채 (Interest Debt)' : 'Interest-Bearing Debt',
            desc: isKo
              ? '외상매입금 등 무이자 영업부채를 제외하고 실제 이자가 발생하는 단기/장기 차입금 및 회사채'
              : 'Total short-term and long-term interest-bearing debt.',
          },
          {
            name: isKo ? '현금및현금성자산 (Cash & Equiv)' : 'Cash & Cash Equivalents',
            desc: isKo
              ? '즉시 현금화 가능한 예금 및 단기 금융상품으로, 위기 방어막이자 재투자 실탄'
              : 'Readily available liquidity to withstand crises and seize opportunities.',
          },
        ],
      },
      {
        group: isKo ? '💵 현금흐름표 (Cash Flows)' : '💵 Cash Flows',
        items: [
          {
            name: isKo ? '영업현금흐름 (CFO)' : 'Operating Cash Flow (CFO)',
            desc: isKo
              ? '장부상 숫자가 아닌 본업 영업활동을 통해 실제로 회사 금고에 유입된 순수 현금'
              : 'Actual net cash generated from core operating activities.',
          },
          {
            name: isKo ? '설비투자 (CapEx)' : 'Capital Expenditures (CapEx)',
            desc: isKo
              ? '공장, 기계, IT 인프라 등 유형/무형자산의 취득 및 유지보수에 투입된 현금 지출'
              : 'Cash invested into acquiring, upgrading, and maintaining property and equipment.',
          },
          {
            name: isKo ? '지급이자 (Interest Paid)' : 'Interest Paid',
            desc: isKo
              ? '차입금 및 회사채에 대해 회사가 회계기간 동안 실제로 현금으로 지급한 이자비용'
              : 'Actual cash interest disbursed on debt obligations.',
          },
        ],
      },
      {
        group: isKo ? '📊 주당 가치 지표 (Per-Share Metrics)' : '📊 Per-Share Metrics',
        items: [
          {
            name: isKo ? '희석 EPS (Diluted EPS)' : 'Diluted EPS',
            desc: isKo
              ? '전환사채, 스톡옵션 등 모든 잠재적 신주가 발행되었다고 가정한 1주당 순이익'
              : 'Per-share net income assuming full exercise of all dilutive securities.',
          },
          {
            name: isKo ? '희석주식수 (Diluted Shares)' : 'Diluted Shares',
            desc: isKo
              ? '주당 가치를 정확히 계산하기 위해 잠재적 희석증권을 모두 반영한 가중평균 총 주식수'
              : 'Total weighted average share count inclusive of dilutive securities.',
          },
        ],
      },
    ];
  },
  columns: {
    netIncome: (language: Language): HelpPopoverContent => ({
      title: language === 'ko' ? '보통주 순이익 (Net Income Common)' : 'Net Income to Common',
      description: language === 'ko'
        ? '우선주 배당금 등을 제외하고 최종적으로 보통주 주주에게 귀속되는 당기순이익입니다.'
        : 'Net profit attributable solely to common equity shareholders.',
    }),
    ebit: (language: Language): HelpPopoverContent => ({
      title: language === 'ko' ? '영업이익 (EBIT)' : 'EBIT (Operating Income)',
      description: language === 'ko'
        ? '이자비용과 법인세를 차감하기 전 본업 영업활동으로 창출된 이익입니다. 자본구조 왜곡 없이 순수한 본업 수익성을 보여줍니다.'
        : 'Earnings Before Interest and Taxes, representing core operating earnings.',
    }),
    commonEquity: (language: Language): HelpPopoverContent => ({
      title: language === 'ko' ? '보통주 자기자본 (Common Equity)' : 'Common Equity',
      description: language === 'ko'
        ? '총 자산에서 총 부채를 뺀 순자산으로, 보통주 주주들의 순수한 몫(장부가치)입니다.'
        : 'Total assets minus total liabilities, representing total book equity of common shareholders.',
    }),
    interestDebt: (language: Language): HelpPopoverContent => ({
      title: language === 'ko' ? '이자발생 부채 (Interest-Bearing Debt)' : 'Interest-Bearing Debt',
      description: language === 'ko'
        ? '매입채무 등 무이자 영업부채를 제외하고 실제 이자가 나가는 단기/장기 차입금 및 회사채의 합계입니다.'
        : 'Total short-term and long-term interest-bearing loans and corporate debt.',
    }),
    cash: (language: Language): HelpPopoverContent => ({
      title: language === 'ko' ? '현금및현금성자산 (Cash & Equivalents)' : 'Cash & Cash Equivalents',
      description: language === 'ko'
        ? '즉시 현금화 가능한 예금 및 단기 금융상품으로, 기업의 유동성 방어막이자 재투자 실탄입니다.'
        : 'Readily available liquidity to withstand crises and seize investment opportunities.',
    }),
    cfo: (language: Language): HelpPopoverContent => ({
      title: language === 'ko' ? '영업활동현금흐름 (CFO)' : 'Operating Cash Flow (CFO)',
      description: language === 'ko'
        ? '장부상 숫자가 아닌 본업 영업활동을 통해 실제로 회사 금고로 유입된 순수 현금 총액입니다.'
        : 'Actual net cash generated from core operating activities.',
    }),
    capex: (language: Language): HelpPopoverContent => ({
      title: language === 'ko' ? '설비투자 / 자본적지출 (CapEx)' : 'Capital Expenditures (CapEx)',
      description: language === 'ko'
        ? '공장, 기계, IT 인프라, 건물 등 유형/무형자산의 취득 및 유지보수에 투입된 현금 지출입니다.'
        : 'Cash invested into acquiring, upgrading, and maintaining property, plant, equipment, and technology.',
    }),
    interestPaid: (language: Language): HelpPopoverContent => ({
      title: language === 'ko' ? '지급이자 (Interest Paid)' : 'Interest Paid',
      description: language === 'ko'
        ? '차입금 및 회사채에 대해 회사가 회계기간 동안 실제로 현금으로 지급한 이자비용입니다.'
        : 'Actual cash interest disbursed on outstanding debt obligations.',
    }),
    dilutedEps: (language: Language): HelpPopoverContent => ({
      title: language === 'ko' ? '희석 주당순이익 (Diluted EPS)' : 'Diluted EPS',
      description: language === 'ko'
        ? '전환사채, 스톡옵션 등 모든 잠재적 신주가 발행되었다고 가정했을 때의 1주당 순이익입니다.'
        : 'Per-share net income assuming full exercise of all dilutive securities and stock options.',
    }),
    dilutedShares: (language: Language): HelpPopoverContent => ({
      title: language === 'ko' ? '희석주식수 (Diluted Shares)' : 'Diluted Shares',
      description: language === 'ko'
        ? '보통주 1주당 가치를 정확히 계산하기 위해 잠재적 희석 증권을 모두 반영한 가중평균 총 주식수입니다.'
        : 'Total weighted average share count inclusive of all potential dilutive securities.',
    }),
  },
};
