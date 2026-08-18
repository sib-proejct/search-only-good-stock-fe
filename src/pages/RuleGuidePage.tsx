import React from 'react';
import { BookOpen, Check, X } from 'lucide-react';
import { useAppConfig } from '../context/ThemeLanguageContext';

export const RuleGuidePage: React.FC = () => {
  const { t, language } = useAppConfig();

  const guideRules = [
    {
      id: 1,
      num: '01',
      category: language === 'ko' ? '초과 자본이익률' : 'Capital Efficiency',
      targetHurdle: 'ROE ≥ 15.0% · ROIC ≥ 10.0%',
      title: language === 'ko'
        ? '주당 내재가치 증가율 및 초과 자본이익률'
        : 'Per-Share Intrinsic Compounding & High ROE / ROIC',
      titleSub: 'ROE & ROIC Criteria',
      buffettQuote: language === 'ko'
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
      buffettQuote: language === 'ko'
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
      buffettQuote: language === 'ko'
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
      buffettQuote: language === 'ko'
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
      buffettQuote: language === 'ko'
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
      buffettQuote: language === 'ko'
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

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8 animate-fade-in transition-colors duration-300">
      
      {/* 1. Apple Hero Section */}
      <div className="apple-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#0071E3] dark:text-[#2997FF] font-mono uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Berkshire Hathaway Owner Principles</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight leading-tight">
              {t('guideTitle')}
            </h1>
            
            <p className="text-xs sm:text-sm text-[#86868B] leading-relaxed">
              {t('guideSubtitle')}
            </p>
          </div>

          {/* Minimalist Apple Stats (DESIGN.md Section 4.5) */}
          <div className="flex items-center gap-6 sm:gap-8 self-start md:self-center shrink-0 border-t md:border-t-0 md:border-l border-black/[0.06] dark:border-white/[0.08] pt-4 md:pt-0 md:pl-8">
            <div>
              <div className="font-mono text-2xl sm:text-3xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tabular-nums">
                6
              </div>
              <div className="text-[11px] text-[#86868B] font-medium mt-0.5">
                Core Pillars
              </div>
            </div>

            <div className="w-[1px] h-8 bg-black/[0.06] dark:bg-white/[0.08]" />

            <div>
              <div className="font-mono text-2xl sm:text-3xl font-bold text-[#34C759] tabular-nums">
                &lt; 3%
              </div>
              <div className="text-[11px] text-[#86868B] font-medium mt-0.5">
                Strict Pass Bar
              </div>
            </div>

            <div className="w-[1px] h-8 bg-black/[0.06] dark:bg-white/[0.08]" />

            <div>
              <div className="font-mono text-2xl sm:text-3xl font-bold text-[#0071E3] dark:text-[#2997FF] tabular-nums">
                15%+
              </div>
              <div className="text-[11px] text-[#86868B] font-medium mt-0.5">
                Compounding Hurdle
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 2. 6 Principles Bento Grid (Apple 24px Card Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {guideRules.map((rule) => (
          <div
            key={rule.id}
            className="apple-card p-6 sm:p-8 flex flex-col justify-between space-y-6"
          >
            
            {/* Header & Hurdle Badge */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#86868B] tracking-wider">
                    PRINCIPLE {rule.num}
                  </span>
                  <span className="text-[#D2D2D7] dark:text-[#3A3A3C]">·</span>
                  <span className="text-xs font-semibold text-[#0071E3] dark:text-[#2997FF]">
                    {rule.category}
                  </span>
                </div>

                <span className="font-mono text-xs font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tabular-nums bg-[#F5F5F7] dark:bg-[#2C2C2E] px-2.5 py-1 rounded-lg border border-black/[0.04] dark:border-white/[0.06]">
                  {rule.targetHurdle}
                </span>
              </div>

              <div>
                <h2 className="text-lg sm:text-xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight leading-snug">
                  {rule.title}
                </h2>
                <p className="text-xs text-[#86868B] mt-0.5 font-mono">
                  {rule.titleSub}
                </p>
              </div>
            </div>

            {/* Buffett Editorial Quote */}
            <div className="border-l-2 border-[#0071E3] dark:border-[#2997FF] pl-4 py-0.5 space-y-1.5">
              <blockquote className="text-xs sm:text-[13px] text-[#1D1D1F] dark:text-[#F5F5F7] leading-relaxed italic font-normal">
                {rule.buffettQuote}
              </blockquote>
              <div className="text-[11px] text-[#86868B] font-mono">
                — Warren Buffett ({rule.quoteYear})
              </div>
            </div>

            {/* Core Purpose */}
            <div className="space-y-1 text-xs sm:text-[13px] leading-relaxed text-[#424245] dark:text-[#D2D2D7]">
              <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] block text-xs">
                {t('objective')}
              </span>
              <p>{rule.purpose}</p>
            </div>

            {/* Formula & Hurdle Section */}
            <div className="p-3.5 rounded-2xl bg-[#F5F5F7] dark:bg-[#252528] border border-black/[0.04] dark:border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-[#86868B] uppercase font-mono tracking-wider">
                  Formula & Logic
                </span>
                <span className="font-mono font-bold text-[#0071E3] dark:text-[#2997FF] tabular-nums">
                  {rule.conditionText}
                </span>
              </div>
              <div className="font-mono text-xs text-[#1D1D1F] dark:text-[#F5F5F7] bg-white dark:bg-[#1C1C1E] p-2.5 rounded-xl border border-black/[0.04] dark:border-white/[0.06] overflow-x-auto">
                {rule.formula}
              </div>
            </div>

            {/* Pass vs Disqualification Row */}
            <div className="space-y-2.5 pt-1 text-xs">
              
              {/* Pass Condition */}
              <div className="flex items-start gap-2.5">
                <div className="w-4 h-4 rounded-full bg-[#34C759]/15 text-[#34C759] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-[#248A3D] dark:text-[#34C759] mr-1.5">
                    {t('passCriteria')}:
                  </span>
                  <span className="text-[#1D1D1F] dark:text-[#F5F5F7] font-medium leading-relaxed">
                    {rule.passCondition}
                  </span>
                </div>
              </div>

              {/* Exclusion / Disqualification */}
              <div className="flex items-start gap-2.5">
                <div className="w-4 h-4 rounded-full bg-[#FF3B30]/15 text-[#FF3B30] flex items-center justify-center shrink-0 mt-0.5">
                  <X className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-[#D70015] dark:text-[#FF453A] mr-1.5">
                    {t('disqualification')}:
                  </span>
                  <span className="text-[#6E6E73] dark:text-[#86868B] leading-relaxed">
                    {rule.exclusionCondition}
                  </span>
                </div>
              </div>

            </div>

            {/* Benchmark Stock Context Footnote */}
            <div className="pt-3 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between text-[11px] text-[#86868B]">
              <span className="truncate">
                {rule.benchmarkStock}
              </span>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
