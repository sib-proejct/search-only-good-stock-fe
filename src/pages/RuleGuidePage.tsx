import React from 'react';
import { BookOpen, Quote, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAppConfig } from '../context/ThemeLanguageContext';

export const RuleGuidePage: React.FC = () => {
  const { t, language } = useAppConfig();

  const guideRules = [
    {
      id: 1,
      num: 'PRINCIPLE 01',
      title: language === 'ko' ? '주당 내재가치 증가율 및 초과 자본이익률 (ROE / ROIC)' : 'Per-Share Intrinsic Compounding & High ROE / ROIC',
      buffettQuote: language === 'ko' 
        ? '“우리는 회사의 규모로 실적을 평가하지 않고, 주당 내재가치 증가율로 평가합니다. 자본이익률이 계속해서 평균을 초과하는 기업들을 보유하는 방법으로 목표를 달성합니다.”'
        : '"We do not measure financial results by size, but by per-share value growth. We accomplish this goal by owning businesses that consistently achieve above-average returns on equity."',
      purpose: language === 'ko'
        ? '외형적 매출/자산 성장이 아닌, 투입된 자본 대비 높은 효율성을 지속적으로 창출하는 기업 선별'
        : 'Identifies enterprises creating sustained, exceptional returns on invested capital rather than superficial asset size growth.',
      passCondition: language === 'ko'
        ? '최근 5개년 연속 평균 ROE ≥ 15% 및 ROIC ≥ 10% 유지'
        : '5-Year Consecutive Avg ROE ≥ 15% & ROIC ≥ 10%',
      formula: 'ROE = Net Income ÷ Shareholders Equity | ROIC = NOPAT ÷ Invested Capital',
      exclusionCondition: language === 'ko'
        ? '대규모 유상증자 등으로 덩치만 키우고 주당 가치(EPS/BPS)가 희석되는 기업 제외'
        : 'Companies using repeated dilutive share issuances that expand balance sheet size but destroy per-share value.'
    },
    {
      id: 2,
      num: 'PRINCIPLE 02',
      title: language === 'ko' ? '1달러 유보이익 가치 창출 테스트 (One-Dollar Test)' : 'The One-Dollar Retained Earnings Test',
      buffettQuote: language === 'ko'
        ? '“이익 1달러를 유보할 때마다 장기적으로 주주들에게 시장가치를 1달러 이상 제공했는가?”'
        : '"Unrestricted earnings should be retained only when there is a reasonable prospect that for every dollar retained by the corporation, at least one dollar of market value will be created for owners."',
      purpose: language === 'ko'
        ? '경영진이 배당하지 않고 사내에 재투자한 유보이익이 주주 시장가치 상승으로 연결되었는지 검증'
        : 'Verifies whether capital retained by management actually generates superior market value compared to paying dividends.',
      passCondition: language === 'ko'
        ? '5개년 누적 (시가총액 증가분 ÷ 5개년 누적 유보이익) ≥ 1.0 달성'
        : '5Y Cumulative (Market Cap Increase ÷ Cumulative Retained Earnings) ≥ $1.00',
      formula: 'Retained Earnings = Net Income - Dividends Paid | Multiplier = Market Cap Gain ÷ Retained Earnings',
      exclusionCondition: language === 'ko'
        ? '유보이익을 비효율적인 M&A나 방만한 시설투자로 탕진하여 1달러 미만의 시장가치만 창출한 기업 배제'
        : 'Companies destroying capital through reckless M&A or uneconomic capex creating < $1.00 of shareholder value.'
    },
    {
      id: 3,
      num: 'PRINCIPLE 03',
      title: language === 'ko' ? '5개년 EPS 및 BPS 복리 성장률 (Compounding Growth)' : '5-Year Compounding Growth in EPS & BPS',
      buffettQuote: language === 'ko'
        ? '“시간은 훌륭한 기업에게는 친구이지만, 평범한 기업에게는 적입니다.”'
        : '"Time is the friend of the wonderful company, the enemy of the mediocre."',
      purpose: language === 'ko'
        ? '장기적으로 주당 순이익과 순자산의 복리 성장이 시장 인플레이션과 대기업 평균을 상회하는 기업 발굴'
        : 'Filters for durable compounders whose earnings per share outpace inflation and industry peers over multi-year cycles.',
      passCondition: language === 'ko'
        ? '최근 5개년 EPS CAGR ≥ 10% 및 BPS CAGR ≥ 10%'
        : '5-Year EPS CAGR ≥ 10% & BPS CAGR ≥ 10%',
      formula: 'CAGR = (Current Metric / 5Y Prior Metric)^(1/5) - 1',
      exclusionCondition: language === 'ko'
        ? '외형 매출은 늘어나나 일회성 비용이나 이익률 하락으로 주당 이익이 정체/역성장하는 기업'
        : 'Enterprises with stagnant earnings, margin degradation, or volatile cyclical spikes.'
    },
    {
      id: 4,
      num: 'PRINCIPLE 04',
      title: language === 'ko' ? '건전한 부채 및 레버리지 제한 (Debt Safety Rule)' : 'Conservative Debt & Solvency Fortress',
      buffettQuote: language === 'ko'
        ? '“우리는 부채를 좀처럼 일으키지 않으며, 금융 위기가 왔을 때 살아남는 유일한 방법은 빚이 없는 것이다.”'
        : '"We use debt sparingly. When leverage works, it magnifies gains. When something goes wrong, it ruins you. Fortresses survive every financial hurricane."',
      purpose: language === 'ko'
        ? '과도한 차입금 레버리지로 만든 위험한 고수익을 배제하고, 위기에도 흔들리지 않는 재무 요새 선별'
        : 'Ensures the enterprise possesses an anti-fragile balance sheet capable of navigating macroeconomic downturns without distress.',
      passCondition: language === 'ko'
        ? '부채비율(Debt-to-Equity) ≤ 80% 및 이자보상배율 ≥ 5.0배 이상'
        : 'Debt-to-Equity ≤ 80% & Interest Coverage Ratio ≥ 5.0x',
      formula: 'Debt-to-Equity = Total Debt ÷ Total Equity | Interest Coverage = Operating Income ÷ Interest Expense',
      exclusionCondition: language === 'ko'
        ? '영업이익으로 이자를 감당하기 어렵거나(이자보상배율 < 5.0배), 차입금 의존도가 높은 기업'
        : 'Over-leveraged capital structures or enterprises with heavy short-term refinancing vulnerabilities.'
    },
    {
      id: 5,
      num: 'PRINCIPLE 05',
      title: language === 'ko' ? '무분별한 유상증자/주식 희석 방지 (Share Dilution Rule)' : 'Shareholder Anti-Dilution & Disciplined Buybacks',
      buffettQuote: language === 'ko'
        ? '“버크셔 기업가치와 일치하는 기준이 아니라면 결코 주식을 발행하지 않는다.”'
        : '"We will not dilute Berkshire’s intrinsic value per share by issuing stock except when receiving equal value in return."',
      purpose: language === 'ko'
        ? '신주 발행(유상증자, CB/BW)으로 기존 주주가치를 훼손하는 기업을 배제하고 자사주 소각 기업 우대'
        : 'Favors businesses retiring shares at attractive valuations while eliminating aggressive option dilution and secondary offerings.',
      passCondition: language === 'ko'
        ? '최근 5개년 발행주식수 연평균 증가율(CAGR) ≤ 0% (주식수 축소 또는 유지)'
        : '5-Year Diluted Share Count CAGR ≤ 0.0% (Share reduction or flat)',
      formula: 'Shares CAGR = (Current Share Count / 5Y Prior Count)^(1/5) - 1',
      exclusionCondition: language === 'ko'
        ? '스톡옵션 남발, 잦은 제3자배정 유상증자, 전환사채 발행 이력이 있는 종목'
        : 'Excessive stock-based compensation without offsetting buybacks, or frequent equity dilution.'
    },
    {
      id: 6,
      num: 'PRINCIPLE 06',
      title: language === 'ko' ? '벤치마크 초과 BPS 복리 성장률 (Market Outperformance)' : 'Benchmark Alpha Over S&P 500 / KOSPI Index',
      buffettQuote: language === 'ko'
        ? '“우리의 장기 목표는 버크셔의 주당 순자산가치 증가율이 S&P 500의 연간 수익률을 초과하는 것입니다.”'
        : '"Our long-term economic goal is to maximize the average annual rate of gain in per-share intrinsic value above the S&P 500."',
      purpose: language === 'ko'
        ? '단기 주가 테마가 아닌 장부상 순자산(Equity)의 실질 축적 속도가 시장 지수를 초과하는 우량 기업 선별'
        : 'Confirms that the real compounding speed of book value and intrinsic value outpaces passive index investing.',
      passCondition: language === 'ko'
        ? '기업 5개년 BPS CAGR > 5개년 시장 벤치마크 연평균 수익률'
        : '5-Year Enterprise BPS CAGR > 5-Year Benchmark Index CAGR',
      formula: 'Excess Alpha = Enterprise BPS CAGR - Benchmark Index CAGR',
      exclusionCondition: language === 'ko'
        ? '순자산 성장 속도가 시장 인덱스 펀드 수익률보다 낮은 저효율 기업'
        : 'Enterprises compounding equity slower than a passive broad-market index fund.'
    }
  ];

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-6 sm:py-10 space-y-4 sm:space-y-6 animate-fade-in transition-colors duration-300">
      
      {/* Apple Header Banner */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-black/[0.06] dark:border-white/[0.08] shadow-sm space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#1D1D1F] dark:bg-[#2C2C2E] text-[#FFD60A] flex items-center justify-center shadow-apple-pill shrink-0">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-[#F5F5F7] text-[9px] sm:text-[10px] font-semibold px-2 sm:px-2.5 py-0.5 rounded-full font-mono mb-0.5 sm:mb-1 border border-black/[0.04] dark:border-white/[0.06]">
              <span>OWNER-RELATED BUSINESS PRINCIPLES</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
              {t('guideTitle')}
            </h1>
            <p className="text-[11px] sm:text-xs text-[#86868B] mt-0.5 font-normal">
              {t('guideSubtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* 6 Rules Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {guideRules.map((rule) => (
          <div 
            key={rule.id} 
            className="bg-white dark:bg-[#1C1C1E] rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-black/[0.06] dark:border-white/[0.08] shadow-sm space-y-3.5 sm:space-y-4"
          >
            {/* Top Badge & Title */}
            <div>
              <span className="text-[10px] font-bold text-[#0071E3] dark:text-[#2997FF] font-mono tracking-wider block mb-1">
                {rule.num}
              </span>
              <h3 className="font-bold text-sm sm:text-base text-[#1D1D1F] dark:text-[#F5F5F7]">
                {rule.title}
              </h3>
            </div>

            {/* Buffett Quote Bento Box */}
            <div className="bg-[#F5F5F7] dark:bg-[#252528] p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-black/[0.03] dark:border-white/[0.06] space-y-1">
              <Quote className="w-3.5 h-3.5 text-[#FF9500] opacity-80" />
              <blockquote className="text-[11px] sm:text-xs text-[#1D1D1F] dark:text-[#F5F5F7] italic leading-relaxed">
                {rule.buffettQuote}
              </blockquote>
            </div>

            {/* Purpose & Formula Details */}
            <div className="space-y-2 sm:space-y-2.5 text-xs">
              <div className="bg-[#F5F5F7] dark:bg-[#252528] p-3 sm:p-3.5 rounded-xl border border-black/[0.02] dark:border-white/[0.04]">
                <span className="font-semibold text-[#86868B] block mb-0.5 text-[10px] sm:text-[11px]">🎯 {t('objective')}:</span>
                <p className="text-[#424245] dark:text-[#D2D2D7] leading-relaxed text-[11px] sm:text-xs">{rule.purpose}</p>
              </div>

              <div className="bg-[#34C759]/10 dark:bg-[#34C759]/15 p-3 sm:p-3.5 rounded-xl border border-[#34C759]/20">
                <span className="font-semibold text-[#248A3D] dark:text-[#34C759] flex items-center gap-1.5 mb-0.5 text-[10px] sm:text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#34C759]" />
                  {t('passCriteria')}:
                </span>
                <p className="text-[#1D1D1F] dark:text-[#F5F5F7] font-semibold text-[11px] sm:text-xs">{rule.passCondition}</p>
              </div>

              <div className="bg-[#F5F5F7] dark:bg-[#252528] p-3 sm:p-3.5 rounded-xl border border-black/[0.02] dark:border-white/[0.04]">
                <span className="font-semibold text-[#86868B] block mb-0.5 text-[10px] sm:text-[11px]">📐 {t('formula')}:</span>
                <div className="font-mono text-[10px] sm:text-[11px] text-[#1D1D1F] dark:text-[#F5F5F7] font-medium bg-white dark:bg-[#1C1C1E] p-2 sm:p-2.5 rounded-lg border border-black/[0.04] dark:border-white/[0.06] overflow-x-auto">
                  {rule.formula}
                </div>
              </div>

              <div className="bg-[#FF3B30]/10 dark:bg-[#FF3B30]/15 p-3 sm:p-3.5 rounded-xl border border-[#FF3B30]/20">
                <span className="font-semibold text-[#D70015] dark:text-[#FF453A] flex items-center gap-1.5 mb-0.5 text-[10px] sm:text-[11px]">
                  <AlertCircle className="w-3.5 h-3.5 text-[#FF3B30]" />
                  {t('disqualification')}:
                </span>
                <p className="text-[#424245] dark:text-[#D2D2D7] leading-relaxed text-[11px] sm:text-xs">{rule.exclusionCondition}</p>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
