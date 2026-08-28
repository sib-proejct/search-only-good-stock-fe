import { BookOpen, Check, X, TrendingUp } from 'lucide-react';
import { useAppConfig } from '../context/ThemeLanguageContext';
import { GuideType } from '../components/common/TopNavBar';

interface RuleGuidePageProps {
  activeGuide?: GuideType;
}

export const RuleGuidePage: React.FC<RuleGuidePageProps> = ({
  activeGuide = 'buffett',
}) => {
  const { t, language } = useAppConfig();

  const buffettRules = [
    {
      id: 1,
      num: '01',
      category: language === 'ko' ? '초과 자본이익률' : 'Capital Efficiency',
      targetHurdle: 'ROE ≥ 15.0% · ROIC ≥ 10.0%',
      title: language === 'ko'
        ? '주당 내재가치 증가율 및 초과 자본이익률'
        : 'Per-Share Intrinsic Compounding & High ROE / ROIC',
      titleSub: 'ROE & ROIC Criteria',
      quoteAuthor: 'Warren Buffett',
      quote: language === 'ko'
        ? '“우리는 회사의 규모로 실적을 평가하지 않고, 주당 내재가치 증가율로 평가합니다. 자본이익률이 계속해서 평균을 초과하는 기업들을 보유하는 방법으로 목표를 달성합니다.”'
        : '"We do not measure financial results by size, but by per-share value growth. We accomplish this goal by owning businesses that consistently achieve above-average returns on equity."',
      quoteYear: '1979',
      purpose: language === 'ko'
        ? '외형적 매출/자산 팽창이 아닌, 투입된 자본 대비 높은 실질 현금창출 효율을 지속적으로 입증하는 경제적 해자 기업을 선별합니다.'
        : 'Identifies enterprises generating sustained economic profits above their cost of capital rather than superficial asset size growth.',
      formula: 'ROE = Net Income ÷ Shareholders’ Equity  |  ROIC = NOPAT ÷ Invested Capital',
      conditionText: '5-Year Avg ROE ≥ 15.0% AND ROIC ≥ 10.0%',
      passCondition: language === 'ko'
        ? '최근 5개년 연속 평균 ROE 15% 이상 및 ROIC 10% 이상 유지 (경기 하강기에도 두 자릿수 수익성 보존)'
        : '5-Year Consecutive Avg ROE ≥ 15% & ROIC ≥ 10% maintained across economic cycles',
      exclusionCondition: language === 'ko'
        ? '대규모 유상증자 등으로 덩치만 키우고 자본이익률이 10% 미만으로 희석되는 저효율 기업 배제'
        : 'Dilutive equity offerings expanding asset size while generating sub-10% return on capital',
      benchmarkStock: language === 'ko'
        ? '애플 (AAPL) — 5년 평균 ROE 140%+, ROIC 55%+ 지속 유지'
        : 'Apple (AAPL) — Sustained 5Y Avg ROE 140%+, ROIC 55%+'
    },
    {
      id: 2,
      num: '02',
      category: language === 'ko' ? '유보이익 주주가치 창출' : '1-Dollar Retained Test',
      targetHurdle: 'Value Multiplier ≥ $1.00',
      title: language === 'ko'
        ? '1달러 유보이익 가치 창출 테스트'
        : 'The One-Dollar Retained Earnings Test',
      titleSub: 'Capital Allocation Efficiency',
      quoteAuthor: 'Warren Buffett',
      quote: language === 'ko'
        ? '“이익 1달러를 유보할 때마다 장기적으로 주주들에게 시장가치를 최소 1달러 이상 창출하여 제공했는가?”'
        : '"Unrestricted earnings should be retained only when there is a reasonable prospect that for every dollar retained by the corporation, at least one dollar of market value will be created for owners."',
      quoteYear: '1984',
      purpose: language === 'ko'
        ? '경영진이 배당으로 지급하지 않고 사내에 재투자한 유보이익이 주주들의 시가총액 증가로 증명되었는지 엄격히 판정합니다.'
        : 'Verifies whether capital retained by management actually generates superior market value compared to paying immediate dividends.',
      formula: 'Multiplier = 5Y Cumulative Market Cap Gain ÷ 5Y Cumulative Retained Earnings',
      conditionText: 'Multiplier ≥ $1.00 (Benchmark Standard: ≥ $2.00)',
      passCondition: language === 'ko'
        ? '사내 유보 1달러당 창출된 주주 시장가치 ≥ 1.00 달러 달성 (고수익 재투자 입증)'
        : '5Y Cumulative (Market Cap Gain ÷ Retained Earnings) ≥ $1.00',
      exclusionCondition: language === 'ko'
        ? '유보이익을 비효율적인 M&A나 방만한 시설투자로 탕진하여 1달러 미만의 시장가치만 창출한 기업 배제'
        : 'Value destroyers squandering retained profits on uneconomic capex or empire-building acquisitions',
      benchmarkStock: language === 'ko'
        ? '마이크로소프트 (MSFT) — 1달러 유보당 $4.10+ 이상의 시장가치 창출'
        : 'Microsoft (MSFT) — Generated $4.10+ market value per $1.00 retained'
    },
    {
      id: 3,
      num: '03',
      category: language === 'ko' ? 'EPS & BPS 복리 성장' : 'Compounding Growth',
      targetHurdle: 'EPS & BPS CAGR ≥ 10.0%',
      title: language === 'ko'
        ? '5개년 EPS 및 BPS 복리 성장률'
        : '5-Year Compounding Growth in EPS & BPS',
      titleSub: 'Long-term Compounding Engine',
      quoteAuthor: 'Warren Buffett',
      quote: language === 'ko'
        ? '“시간은 훌륭한 기업에게는 가장 좋은 친구이지만, 평범한 기업에게는 최대의 적입니다.”'
        : '"Time is the friend of the wonderful company, the enemy of the mediocre."',
      quoteYear: '1989',
      purpose: language === 'ko'
        ? '단기 테마가 아닌, 주당 순이익과 순자산의 실질 복리 성장이 인플레이션과 시장 평균을 지속 상회하는 우량주를 발굴합니다.'
        : 'Filters for durable compounders whose earnings per share outpace inflation and peers over multi-year cycles.',
      formula: 'CAGR = (Current Metric ÷ 5Y Prior Metric)^(1/5) - 1',
      conditionText: '5-Year EPS CAGR ≥ 10.0% AND BPS CAGR ≥ 10.0%',
      passCondition: language === 'ko'
        ? '최근 5개년 EPS CAGR 10% 이상 및 BPS CAGR 10% 이상 동시 달성'
        : '5-Year Diluted EPS CAGR ≥ 10% & BPS CAGR ≥ 10% simultaneously',
      exclusionCondition: language === 'ko'
        ? '외형 매출은 늘어나나 비용 통제 실패로 주당 이익이 정체되거나 경기 변동에 널뛰는 시클리컬 기업 배제'
        : 'Topline growth with negative or volatile EPS compounding due to cost inflation',
      benchmarkStock: language === 'ko'
        ? '엔비디아 (NVDA) — 5년 EPS CAGR 40%+, BPS CAGR 35%+ 폭발적 복리 성장'
        : 'NVIDIA (NVDA) — 5-Year EPS CAGR 40%+ driven by platform moat'
    },
    {
      id: 4,
      num: '04',
      category: language === 'ko' ? '건전한 부채 & 재무 요새' : 'Debt Safety Fortress',
      targetHurdle: 'Debt-to-Equity ≤ 80.0%',
      title: language === 'ko'
        ? '건전한 부채 및 레버리지 제한'
        : 'Conservative Debt & Solvency Fortress',
      titleSub: 'Balance Sheet Solvency',
      quoteAuthor: 'Warren Buffett',
      quote: language === 'ko'
        ? '“우리는 부채를 좀처럼 일으키지 않으며, 금융 위기가 왔을 때 살아남는 유일한 방법은 빚이 없는 것입니다.”'
        : '"We use debt sparingly. When leverage works, it magnifies gains. When something goes wrong, it ruins you. Fortresses survive every financial hurricane."',
      quoteYear: '1987',
      purpose: language === 'ko'
        ? '과도한 부채 레버리지로 포장된 위험한 고수익을 배제하고, 고금리와 경기 충격에도 자력 생존 가능한 무차입/저부채 요새 기업을 선별합니다.'
        : 'Ensures the enterprise possesses an anti-fragile balance sheet capable of navigating macroeconomic downturns without distress.',
      formula: 'Debt-to-Equity = Total Debt ÷ Total Equity  |  Interest Coverage = Operating Income ÷ Interest Expense',
      conditionText: 'Debt-to-Equity ≤ 80.0% AND Interest Coverage ≥ 5.0x',
      passCondition: language === 'ko'
        ? '부채비율 80% 이하 및 이자보상배율 5.0배 이상 유지 (순현금 포지션 우대)'
        : 'Debt-to-Equity ≤ 80% & Interest Coverage Ratio ≥ 5.0x',
      exclusionCondition: language === 'ko'
        ? '영업이익으로 이자를 감당하기 어렵거나(이자보상배율 < 5.0배), 차입금 의존도가 높은 과다 부채 기업 배제'
        : 'Over-leveraged capital structures or enterprises with heavy short-term refinancing vulnerabilities',
      benchmarkStock: language === 'ko'
        ? '삼성전자 (005930.KS) — 부채비율 ~25%, 100조 원 이상의 순현금 요새'
        : 'Samsung Electronics (005930.KS) — ~25% Debt-to-Equity with $75B+ net cash'
    },
    {
      id: 5,
      num: '05',
      category: language === 'ko' ? '주주환원 & 주식 희석 방지' : 'Anti-Dilution & Buybacks',
      targetHurdle: 'Shares CAGR ≤ 0.0%',
      title: language === 'ko'
        ? '무분별한 유상증자 및 주식 희석 방지'
        : 'Shareholder Anti-Dilution & Disciplined Buybacks',
      titleSub: 'Share Count Discipline',
      quoteAuthor: 'Warren Buffett',
      quote: language === 'ko'
        ? '“버크셔 기업가치와 일치하는 기준이 아니라면, 우리는 결코 주식을 새로 발행하여 기존 주주의 가치를 희석하지 않습니다.”'
        : '"We will not dilute Berkshire’s intrinsic value per share by issuing stock except when receiving equal value in return."',
      quoteYear: 'Rule #7',
      purpose: language === 'ko'
        ? '신주 발행(유상증자, CB/BW, 과도한 스톡옵션)으로 기존 주주의 파이를 갉아먹는 기업을 배제하고, 자사주 소각으로 주당 가치를 높이는 친주주 기업을 우대합니다.'
        : 'Favors businesses retiring shares at attractive valuations while eliminating aggressive option dilution and secondary offerings.',
      formula: 'Shares CAGR = (Current Diluted Share Count ÷ 5Y Prior Diluted Count)^(1/5) - 1',
      conditionText: '5-Year Diluted Shares CAGR ≤ 0.0% (Share reduction or flat)',
      passCondition: language === 'ko'
        ? '최근 5개년 희석주식수 연평균 증가율 ≤ 0.0% 달성 (자사주 매입/소각 정책 실행)'
        : '5-Year Diluted Share Count CAGR ≤ 0.0% (Retiring shares or zero net dilution)',
      exclusionCondition: language === 'ko'
        ? '스톡옵션 남발, 잦은 제3자배정 유상증자, 전환사채(CB) 발행 이력으로 주식수가 매년 증가하는 기업 배제'
        : 'Annual share count inflation driven by executive SBC or repeated dilutive equity financing',
      benchmarkStock: language === 'ko'
        ? '애플 (AAPL) — 10년간 전체 유통주식수의 35%+ 영구 소각 집행'
        : 'Apple (AAPL) — Retired over 35% of total share count over 10 years'
    },
    {
      id: 6,
      num: '06',
      category: language === 'ko' ? '시장 지수 초과 수익' : 'Benchmark Alpha',
      targetHurdle: '5Y BPS CAGR > Index CAGR',
      title: language === 'ko'
        ? '벤치마크 초과 BPS 복리 성장률'
        : 'Benchmark Alpha Over S&P 500 / KOSPI Index',
      titleSub: 'Market Outperformance Alpha',
      quoteAuthor: 'Warren Buffett',
      quote: language === 'ko'
        ? '“우리의 오랜 경제적 목표는 버크셔의 주당 순자산가치(BPS) 증가율이 장기적으로 S&P 500의 연간 총수익률을 초과하는 것입니다.”'
        : '"Our long-term economic goal is to maximize the average annual rate of gain in per-share intrinsic value above the S&P 500."',
      quoteYear: 'Rule #1',
      purpose: language === 'ko'
        ? '단순한 단기 주가 테마가 아닌 장부상 순자산의 실질 축적 속도가 패시브 인덱스 펀드 수익률을 초과하여 액티브 투자의 당위성을 입증하는 우량주를 선별합니다.'
        : 'Confirms that the real compounding speed of book value and intrinsic value outpaces passive broad-market index funds.',
      formula: 'Excess Alpha = Enterprise 5Y BPS CAGR - Benchmark Index 5Y CAGR',
      conditionText: 'Excess Alpha > 0.0% (Recommended: +3.0%p+)',
      passCondition: language === 'ko'
        ? '기업 5개년 BPS CAGR > 5개년 시장 벤치마크(S&P 500/KOSPI) 연평균 수익률 달성'
        : '5-Year Enterprise BPS CAGR > 5-Year Benchmark Index CAGR',
      exclusionCondition: language === 'ko'
        ? '순자산 복리 속도가 시장 지수 펀드보다 느려 패시브 ETF보다 비효율적인 저수익 기업 배제'
        : 'Enterprises compounding equity slower than a passive broad-market index fund',
      benchmarkStock: language === 'ko'
        ? '알파벳 (GOOGL) — 5년 BPS CAGR 19.8% vs S&P 500 12.1% (초과 알파 +7.7%p)'
        : 'Alphabet (GOOGL) — 5Y BPS CAGR 19.8% vs S&P 500 12.1% (+7.7%p alpha)'
    }
  ];

  const lynchRules = [
    {
      id: 1,
      num: '01',
      category: language === 'ko' ? '성장 대비 저평가' : 'GARP Valuation',
      targetHurdle: 'PEG Ratio ≤ 1.0',
      title: language === 'ko'
        ? '합리적인 가격의 성장성 (PEG 지표)'
        : 'Growth at a Reasonable Price (PEG Ratio)',
      titleSub: 'PEG Valuation Hurdle',
      quoteAuthor: 'Peter Lynch',
      quote: language === 'ko'
        ? '“어떤 기업이든 PER이 이익성장률과 같다면 적정 가격에 거래되는 것입니다. PER이 성장률보다 현저히 낮을 때 매수 기회가 찾아옵니다.”'
        : '"The P/E ratio of any company that\'s fairly priced will equal its growth rate... If the P/E is less than the growth rate, you may have found yourself a bargain."',
      quoteYear: '1989',
      purpose: language === 'ko'
        ? '성장 잠재력 대비 과도하게 높은 밸류에이션(고PER 버블)을 피하고, 성장률 대비 저평가된 진정한 GARP 기업을 선별합니다.'
        : 'Filters for companies whose earnings growth fundamentally justifies their current valuation multiple.',
      formula: 'PEG = Trailing P/E Ratio ÷ 5Y Forward/Historical EPS Growth Rate (%)',
      conditionText: 'PEG Ratio ≤ 1.0 (Strong Buy: PEG ≤ 0.7)',
      passCondition: language === 'ko'
        ? 'PEG 지표 1.0 이하 (성장률 대비 합리적이거나 저평가된 주가 수준)'
        : 'PEG Ratio ≤ 1.0 (Indicates growth exceeds multiple)',
      exclusionCondition: language === 'ko'
        ? '실적 성장 대비 시장의 과열 기대로 PEG가 2.0을 초과하는 고평가 기업 배제'
        : 'Enterprises trading at hyper-inflated multiples with PEG > 2.0',
      benchmarkStock: language === 'ko'
        ? '메타 플랫폼스 (META) — 2022 저점 당시 PEG 0.6배 수준'
        : 'Meta Platforms (META) — Historic GARP rebound with PEG < 0.7'
    },
    {
      id: 2,
      num: '02',
      category: language === 'ko' ? '건전한 이익 복리' : 'Sustainable Growth',
      targetHurdle: '15.0% ≤ EPS CAGR ≤ 30.0%',
      title: language === 'ko'
        ? '지속 가능한 이익 성장률'
        : 'Sustainable Mid-to-High EPS Compounding',
      titleSub: 'Compounding Velocity',
      quoteAuthor: 'Peter Lynch',
      quote: language === 'ko'
        ? '“연 50%씩 급성장하는 기업을 조심하십시오. 그런 성장은 오래 유지될 수 없으며 경쟁자를 끌어들입니다. 연 20~25%씩 꾸준히 성장하는 기업이 가장 훌륭합니다.”'
        : '"In general, if you can find a company with a 20 to 25 percent growth rate, you\'ve found the ideal compounder. Extremely high 50%+ growth is rarely durable."',
      quoteYear: '1993',
      purpose: language === 'ko'
        ? '단기 테마나 착시로 인한 50%+의 일시적 폭증이 아닌, 15~30% 범위에서 장기 유지 가능한 내실 있는 우량 성장주를 포착합니다.'
        : 'Targeting robust, durable growth without excessive volatility or early burnout risks.',
      formula: '5-Year Normalized EPS CAGR',
      conditionText: '15.0% ≤ 5Y EPS CAGR ≤ 30.0%',
      passCondition: language === 'ko'
        ? '5개년 연평균 주당순이익 성장률 15% 이상 30% 이하 (안정적 고성장)'
        : '5-Year EPS Compound Annual Growth Rate between 15% and 30%',
      exclusionCondition: language === 'ko'
        ? '성장률 10% 미만의 정체 기업 또는 일시적 기저효과로 100%+ 널뛰는 불안정 기업 배제'
        : 'Low-growth stalwarts (< 10%) or unsustainable ephemeral spike businesses',
      benchmarkStock: language === 'ko'
        ? '코스트코 (COST) — 15년 이상 연평균 15~20% 수준의 견고한 복리 실적 성장'
        : 'Costco Wholesale (COST) — Long-term 15-20% EPS compounder'
    },
    {
      id: 3,
      num: '03',
      category: language === 'ko' ? '재무 안전성 & 순현금' : 'Net Cash & Solvency',
      targetHurdle: 'Debt / Equity ≤ 50.0%',
      title: language === 'ko'
        ? '낮은 차입금 및 풍부한 순현금 자산'
        : 'Conservative Debt Structure & Strong Cash Cushion',
      titleSub: 'Balance Sheet Anti-Fragility',
      quoteAuthor: 'Peter Lynch',
      quote: language === 'ko'
        ? '“부채가 전혀 없는 기업은 파산할 수 없습니다. 재무제표의 부채 항목을 확인하는 것은 어떤 정밀 분석보다 중요합니다.”'
        : '"A company with no debt can\'t go bankrupt. The balance sheet is the most critical check for long-term safety."',
      quoteYear: '1989',
      purpose: language === 'ko'
        ? '경기 침체기에도 도산 위험 없이 자력으로 사업을 확장할 수 있는 무차입/저부채 고유동성 기업을 선별합니다.'
        : 'Ensures zero bankruptcy risk and abundant liquidity during industry downturns.',
      formula: 'Debt-to-Equity = Total Long-Term Debt ÷ Total Equity',
      conditionText: 'Debt-to-Equity ≤ 50.0% OR Net Cash > 0',
      passCondition: language === 'ko'
        ? '부채비율 50% 이하 또는 보유 현금이 총부채보다 많은 순현금 기업'
        : 'Debt-to-Equity ≤ 50% or positive Net Cash position',
      exclusionCondition: language === 'ko'
        ? '부채비율 100% 초과 또는 차입금 리파이낸싱 위험이 상존하는 기업 배제'
        : 'High leverage with substantial interest burdens or refinancing vulnerabilities',
      benchmarkStock: language === 'ko'
        ? '알파벳 (GOOGL) — 부채비율 10% 미만, $100B+ 규모의 압도적 순현금'
        : 'Alphabet (GOOGL) — Ultra-clean balance sheet with $100B+ net cash'
    },
    {
      id: 4,
      num: '04',
      category: language === 'ko' ? '영업현금흐름 건전성' : 'Cash Flow Realization',
      targetHurdle: 'Operating Cash Flow > Net Income',
      title: language === 'ko'
        ? '영업활동 현금흐름과 실질 이익의 일치'
        : 'Operating Cash Flow Quality vs Reported Earnings',
      titleSub: 'Real Cash Generation',
      quoteAuthor: 'Peter Lynch',
      quote: language === 'ko'
        ? '“회계상의 장부 이익보다 실제로 회사 통장에 들어오는 현금흐름이 훨씬 더 솔직합니다.”'
        : '"Corporate profits can be cosmetic. Cash coming into the bank account never lies."',
      quoteYear: '1990',
      purpose: language === 'ko'
        ? '매출채권이나 가공 이익으로 부풀려진 착시 실적을 걸러내고, 실제 현금으로 회수되는 순도 높은 이익 창출 기업을 판정합니다.'
        : 'Verifies the quality of earnings by comparing cash from operations against accounting profits.',
      formula: 'Cash Conversion Ratio = Operating Cash Flow ÷ Net Income',
      conditionText: 'Operating Cash Flow ÷ Net Income ≥ 1.0x',
      passCondition: language === 'ko'
        ? '최근 3개년 평균 영업현금흐름이 당기순이익 이상 (현금 전환율 100%+)'
        : '3-Year Avg Operating Cash Flow ≥ 100% of Reported Net Income',
      exclusionCondition: language === 'ko'
        ? '장부상 흑자이나 영업활동 현금흐름이 마이너스이거나 지속 감소하는 기업 배제'
        : 'Paper profits accompanied by deteriorating or negative operating cash flows',
      benchmarkStock: language === 'ko'
        ? '마이크로소프트 (MSFT) — 영업현금흐름이 순이익의 120%+ 달성'
        : 'Microsoft (MSFT) — Flawless cash conversion with OCF/NI > 1.2x'
    }
  ];

  const currentRules = activeGuide === 'buffett' ? buffettRules : lynchRules;

  return (
    <div className="max-w-[760px] mx-auto px-5 sm:px-6 py-8 sm:py-12 space-y-8 animate-fade-in transition-colors duration-300">
      
      {/* 1. Editorial Header Section */}
      <header className="space-y-4 pb-8 border-b border-black/[0.08] dark:border-white/[0.10]">
        {/* Eyebrow / Kicker */}
        <div className="flex items-center gap-2 text-xs font-semibold text-[#0071E3] dark:text-[#2997FF]">
          {activeGuide === 'buffett' ? (
            <>
              <BookOpen className="w-3.5 h-3.5" />
              <span>{language === 'ko' ? '버크셔 해서웨이 주주 서한 & 사업 원칙' : 'Berkshire Hathaway Owner Principles'}</span>
            </>
          ) : (
            <>
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{language === 'ko' ? '마젤란 펀드 성장주 발굴 원칙' : 'Magellan Fund Growth Principles'}</span>
            </>
          )}
        </div>

        {/* H1 Headline */}
        <h1 className="font-serif text-2xl sm:text-3xl lg:text-[34px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight leading-[1.25]">
          {activeGuide === 'buffett' ? t('guideTitle') : t('guideLynchTitle')}
        </h1>

        {/* Deck / Subtitle */}
        <p className="text-base sm:text-[17px] text-[#52525B] dark:text-[#A1A1A6] leading-[1.7] font-normal">
          {activeGuide === 'buffett' ? t('guideSubtitle') : t('guideLynchSubtitle')}
        </p>

        {/* Summary Stats Row - Editorial Style */}
        <div className="pt-4 flex items-center gap-6 sm:gap-8 text-xs border-t border-black/[0.04] dark:border-white/[0.06]">
          <div>
            <span className="text-[#86868B] block text-[11px]">핵심 원칙</span>
            <span className="text-sm sm:text-base font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
              {activeGuide === 'buffett' ? '6대 기준' : '4대 기준'}
            </span>
          </div>
          <div className="w-px h-6 bg-black/[0.08] dark:bg-white/[0.1]" />
          <div>
            <span className="text-[#86868B] block text-[11px]">스크리너 통과율</span>
            <span className="text-sm sm:text-base font-bold text-[#34C759]">
              {activeGuide === 'buffett' ? '< 3%' : '< 5%'}
            </span>
          </div>
          <div className="w-px h-6 bg-black/[0.08] dark:bg-white/[0.1]" />
          <div>
            <span className="text-[#86868B] block text-[11px]">핵심 평가 기준</span>
            <span className="text-sm sm:text-base font-bold text-[#0071E3] dark:text-[#2997FF]">
              {activeGuide === 'buffett' ? '15%+ ROE' : 'PEG ≤ 1.0'}
            </span>
          </div>
        </div>
      </header>

      {/* 2. Editorial Rules List - Linear Reading Flow */}
      <div className="divide-y divide-black/[0.08] dark:divide-white/[0.10]">
        {currentRules.map((rule) => (
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

            {/* Editorial Pull-Quote (NYT Style Quote Box) */}
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
              <h3 className="text-xs font-semibold text-[#86868B]">
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
                    <span className="font-bold text-[#248A3D] dark:text-[#34C759] mr-1.5">
                      {t('passCriteria')}:
                    </span>
                    <span className="text-[#1D1D1F] dark:text-[#F5F5F7] font-medium">
                      {rule.passCondition}
                    </span>
                  </div>
                </div>

                {/* Fail */}
                <div className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-[#FF3B30]/15 text-[#FF3B30] flex items-center justify-center shrink-0 mt-0.5">
                    <X className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <div className="text-xs sm:text-[13px] leading-relaxed">
                    <span className="font-bold text-[#D70015] dark:text-[#FF453A] mr-1.5">
                      {t('disqualification')}:
                    </span>
                    <span className="text-[#6E6E73] dark:text-[#8E8E93]">
                      {rule.exclusionCondition}
                    </span>
                  </div>
                </div>
              </div>

              {/* Formula & Benchmark */}
              <div className="rounded-xl bg-[#F5F5F7] dark:bg-[#1E1E20] p-4 sm:p-5 space-y-3 border border-black/[0.04] dark:border-white/[0.06]">
                <div>
                  <span className="text-xs font-semibold text-[#86868B] block mb-1">
                    {t('formula')}
                  </span>
                  <div className="font-mono text-xs sm:text-[13px] text-[#1D1D1F] dark:text-[#F5F5F7] bg-white dark:bg-[#151516] p-2.5 rounded-lg border border-black/[0.04] dark:border-white/[0.06] overflow-x-auto leading-relaxed">
                    {rule.formula}
                  </div>
                </div>

                <div className="pt-2 border-t border-black/[0.04] dark:border-white/[0.06] flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 text-xs">
                  <span className="font-semibold text-[#86868B] text-xs">
                    {language === 'ko' ? '대표 벤치마크' : 'Benchmark'}
                  </span>
                  <span className="font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">
                    {rule.benchmarkStock}
                  </span>
                </div>
              </div>
            </div>

          </article>
        ))}
      </div>

    </div>
  );
};
