import React from 'react';

// --- Math UI Primitives with Authentic Academic Typography (Monochrome & Natural LaTeX Style) ---

export const MathVar: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <span className={`font-serif italic font-normal text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight ${className}`}>
    {children}
  </span>
);

export const MathText: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <span className={`font-sans not-italic font-normal text-[#1D1D1F] dark:text-[#F5F5F7] ${className}`}>
    {children}
  </span>
);

export const MathNum: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <span className={`font-serif font-normal text-[#1D1D1F] dark:text-[#F5F5F7] tabular-nums ${className}`}>
    {children}
  </span>
);

export const MathUnit: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <span className={`font-sans font-normal text-xs sm:text-[13px] text-[#86868B] dark:text-[#A1A1A6] ml-1 select-none ${className}`}>
    {children}
  </span>
);

export const MathOp: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <span className={`font-serif font-normal text-[#1D1D1F] dark:text-[#F5F5F7] mx-1.5 select-none ${className}`}>
    {children}
  </span>
);

export const MathFraction: React.FC<{
  num: React.ReactNode;
  den: React.ReactNode;
  className?: string;
}> = ({ num, den, className = '' }) => (
  <span className={`inline-flex flex-col items-center justify-center align-middle mx-1 px-1.5 ${className}`}>
    <span className="text-center pb-0.5 border-b border-[#1D1D1F]/40 dark:border-[#F5F5F7]/40 w-full whitespace-nowrap leading-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
      {num}
    </span>
    <span className="text-center pt-0.5 w-full whitespace-nowrap leading-tight text-[0.92em] text-[#3A3A3C] dark:text-[#D1D1D6]">
      {den}
    </span>
  </span>
);

export const MathSigma: React.FC<{
  top: React.ReactNode;
  bottom: React.ReactNode;
  className?: string;
}> = ({ top, bottom, className = '' }) => (
  <span className={`inline-flex flex-col items-center justify-center align-middle mx-1 select-none ${className}`}>
    <span className="text-[10px] font-serif leading-none text-[#86868B] dark:text-[#A1A1A6] font-normal -mb-0.5">
      {top}
    </span>
    <span className="font-serif text-xl sm:text-2xl leading-none text-[#1D1D1F] dark:text-[#F5F5F7] font-normal my-0.5">
      ∑
    </span>
    <span className="text-[10px] font-serif leading-none text-[#86868B] dark:text-[#A1A1A6] font-normal -mt-0.5">
      {bottom}
    </span>
  </span>
);

export const MathSub: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <sub className={`text-[0.74em] font-serif font-normal text-[#86868B] dark:text-[#A1A1A6] ml-0.5 select-none ${className}`}>
    {children}
  </sub>
);

export const MathSup: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <sup className={`text-[0.74em] font-serif font-normal text-[#1D1D1F] dark:text-[#F5F5F7] ml-0.5 select-none ${className}`}>
    {children}
  </sup>
);

export const MathParens: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <span className={`inline-flex items-center align-middle ${className}`}>
    <span className="text-xl sm:text-2xl font-light text-[#86868B] dark:text-[#86868B] -mr-0.5 select-none font-serif">
      (
    </span>
    <span className="px-0.5">{children}</span>
    <span className="text-xl sm:text-2xl font-light text-[#86868B] dark:text-[#86868B] -ml-0.5 select-none font-serif">
      )
    </span>
  </span>
);

export const MathBrackets: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <span className={`inline-flex items-center align-middle ${className}`}>
    <span className="text-xl sm:text-2xl font-light text-[#86868B] dark:text-[#86868B] -mr-0.5 select-none font-serif">
      [
    </span>
    <span className="px-0.5">{children}</span>
    <span className="text-xl sm:text-2xl font-light text-[#86868B] dark:text-[#86868B] -ml-0.5 select-none font-serif">
      ]
    </span>
  </span>
);

interface RuleMathFormulaProps {
  ruleId: string;
  language?: 'ko' | 'en';
}

export const RuleMathFormula: React.FC<RuleMathFormulaProps> = ({ ruleId, language = 'ko' }) => {
  const isKo = language === 'ko';

  switch (ruleId) {
    // ----------------------------------------------------
    // BUFFETT RULES (1 ~ 11)
    // ----------------------------------------------------
    case 'sustained_roe':
      return (
        <div className="space-y-3">
          {/* Main Formula */}
          <div className="flex items-center flex-wrap gap-y-2 py-1 text-sm sm:text-[15px]">
            <span className="text-xs text-[#86868B] dark:text-[#A1A1A6] mr-2 font-sans font-medium">
              {isKo ? '[산출 공식]' : '[Formula]'}:
            </span>
            <span className="inline-flex items-center flex-wrap">
              <MathVar>ROE</MathVar>
              <MathSub>t</MathSub>
              <MathOp>=</MathOp>
              <MathFraction
                num={
                  <span>
                    <MathText>{isKo ? '지배주주 귀속 당기순이익' : 'Net Income to Common'}</MathText>
                    <MathSub>t</MathSub>
                  </span>
                }
                den={
                  <span>
                    <MathText>{isKo ? '평균 보통주자본' : 'Avg Common Equity'}</MathText>
                    <MathSub>t</MathSub>
                  </span>
                }
              />
              <MathOp>×</MathOp>
              <MathNum>100</MathNum>
              <MathUnit>(%)</MathUnit>
            </span>
          </div>

          {/* Sub definition & Hurdle */}
          <div className="pt-2 border-t border-black/[0.04] dark:border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#6E6E73] dark:text-[#A1A1A6]">
            <div className="flex items-center flex-wrap gap-1">
              <span className="text-[#86868B] font-sans font-normal">{isKo ? '단,' : 'where'}</span>
              <MathText>{isKo ? '평균 보통주자본' : 'Avg Common Equity'}</MathText>
              <MathSub>t</MathSub>
              <MathOp>=</MathOp>
              <MathFraction
                num={
                  <span>
                    <MathText>{isKo ? '기초 자본' : 'Beg. Equity'}</MathText>
                    <MathSub>t</MathSub>
                    <MathOp>+</MathOp>
                    <MathText>{isKo ? '기말 자본' : 'End. Equity'}</MathText>
                    <MathSub>t</MathSub>
                  </span>
                }
                den={<MathNum>2</MathNum>}
              />
            </div>
            <div className="font-serif font-normal text-[#3A3A3C] dark:text-[#D1D1D6]">
              ∀ t ∈ &#123;1..5&#125; : ROE<sub className="text-[0.8em]">t</sub> ≥ 15.0%
            </div>
          </div>
        </div>
      );

    case 'sustained_roic':
      return (
        <div className="space-y-3">
          {/* Main Formula */}
          <div className="flex items-center flex-wrap gap-y-2 py-1 text-sm sm:text-[15px]">
            <span className="text-xs text-[#86868B] dark:text-[#A1A1A6] mr-2 font-sans font-medium">
              {isKo ? '[산출 공식]' : '[Formula]'}:
            </span>
            <span className="inline-flex items-center flex-wrap">
              <MathVar>ROIC</MathVar>
              <MathSub>t</MathSub>
              <MathOp>=</MathOp>
              <MathFraction
                num={
                  <span>
                    <MathVar>NOPAT</MathVar>
                    <MathSub>t</MathSub>
                  </span>
                }
                den={
                  <span>
                    <MathText>{isKo ? '평균 투하자본 (IC)' : 'Avg Invested Capital (IC)'}</MathText>
                    <MathSub>t</MathSub>
                  </span>
                }
              />
              <MathOp>×</MathOp>
              <MathNum>100</MathNum>
              <MathUnit>(%)</MathUnit>
            </span>
          </div>

          {/* Sub definitions */}
          <div className="pt-2 border-t border-black/[0.04] dark:border-white/[0.06] space-y-1.5 text-xs text-[#6E6E73] dark:text-[#A1A1A6]">
            <div className="flex items-center flex-wrap gap-1">
              <span className="text-[#86868B] font-sans font-normal">1)</span>
              <MathVar>NOPAT</MathVar>
              <MathSub>t</MathSub>
              <MathOp>=</MathOp>
              <MathVar>EBIT</MathVar>
              <MathSub>t</MathSub>
              <MathOp>×</MathOp>
              <MathParens>
                <MathNum>1</MathNum>
                <MathOp>-</MathOp>
                <MathVar>τ</MathVar>
                <MathSub>t</MathSub>
              </MathParens>
              <span className="text-[11px] text-[#86868B] ml-1 font-sans">
                ({isKo ? 'τ = 실효법인세율' : 'τ = Effective Tax Rate'})
              </span>
            </div>
            <div className="flex items-center flex-wrap gap-1">
              <span className="text-[#86868B] font-sans font-normal">2)</span>
              <MathVar>IC</MathVar>
              <MathSub>t</MathSub>
              <MathOp>=</MathOp>
              <MathText>{isKo ? '보통주자본' : 'Common Equity'}</MathText>
              <MathOp>+</MathOp>
              <MathText>{isKo ? '이자발생부채' : 'Interest-Bearing Debt'}</MathText>
              <MathOp>-</MathOp>
              <MathText>{isKo ? '현금및현금성자산' : 'Cash & Equivalents'}</MathText>
            </div>
          </div>
        </div>
      );

    case 'debt_safety':
      return (
        <div className="space-y-3">
          {/* Formula 1: Debt to Equity */}
          <div className="flex items-center flex-wrap gap-y-2 py-1 text-sm sm:text-[15px]">
            <span className="text-xs text-[#86868B] dark:text-[#A1A1A6] mr-2 font-sans font-medium">
              {isKo ? '[1. 총부채비율]' : '[1. Debt / Equity]'}:
            </span>
            <span className="inline-flex items-center flex-wrap">
              <MathFraction
                num={<MathText>{isKo ? '총부채 (Total Debt)' : 'Total Liabilities'}</MathText>}
                den={<MathText>{isKo ? '자기자본 (Total Equity)' : 'Total Stockholders\' Equity'}</MathText>}
              />
              <MathOp>×</MathOp>
              <MathNum>100</MathNum>
              <MathOp>≤</MathOp>
              <MathNum>100.0%</MathNum>
            </span>
          </div>

          {/* Formula 2: Interest Coverage */}
          <div className="pt-2 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center flex-wrap gap-y-2 text-sm sm:text-[15px]">
            <span className="text-xs text-[#86868B] dark:text-[#A1A1A6] mr-2 font-sans font-medium">
              {isKo ? '[2. 이자보상배율]' : '[2. Interest Coverage]'}:
            </span>
            <span className="inline-flex items-center flex-wrap">
              <MathVar>Interest Coverage</MathVar>
              <MathOp>=</MathOp>
              <MathFraction
                num={<MathVar>EBIT</MathVar>}
                den={
                  <span>
                    <span className="font-serif">|</span>
                    <MathText>{isKo ? '이자비용' : 'Interest Expense'}</MathText>
                    <span className="font-serif">|</span>
                  </span>
                }
              />
              <MathOp>≥</MathOp>
              <MathNum>5.0x</MathNum>
              <span className="text-[11px] text-[#86868B] ml-2 font-sans">
                {isKo ? '(무이자 부채 시 ∞ 통과)' : '(Zero interest expense = ∞ PASS)'}
              </span>
            </span>
          </div>
        </div>
      );

    case 'capital_light_business':
      return (
        <div className="space-y-3">
          {/* Main Formula */}
          <div className="flex items-center flex-wrap gap-y-2 py-1 text-sm sm:text-[15px]">
            <span className="text-xs text-[#86868B] dark:text-[#A1A1A6] mr-2 font-sans font-medium">
              {isKo ? '[자본집약도]' : '[Capital Intensity]'}:
            </span>
            <span className="inline-flex items-center flex-wrap">
              <MathText>{isKo ? 'Capital Intensity' : 'CapEx Intensity'}</MathText>
              <MathOp>=</MathOp>
              <MathFraction
                num={
                  <span className="inline-flex items-center">
                    <MathSigma top="5" bottom="t=1" />
                    <span>|</span>
                    <MathVar>CapEx</MathVar>
                    <MathSub>t</MathSub>
                    <span>|</span>
                  </span>
                }
                den={
                  <span className="inline-flex items-center">
                    <MathSigma top="5" bottom="t=1" />
                    <MathVar>CFO</MathVar>
                    <MathSub>t</MathSub>
                  </span>
                }
              />
              <MathOp>×</MathOp>
              <MathNum>100</MathNum>
              <MathOp>≤</MathOp>
              <MathNum>50.0%</MathNum>
            </span>
          </div>

          <div className="pt-2 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center gap-2 text-xs text-[#6E6E73] dark:text-[#A1A1A6]">
            <span className="text-[#86868B] font-sans font-normal">{isKo ? '필수 조건:' : 'Constraint:'}</span>
            <span className="inline-flex items-center">
              <MathSigma top="5" bottom="t=1" />
              <MathVar>CFO</MathVar>
              <MathSub>t</MathSub>
              <MathOp>&gt;</MathOp>
              <MathNum>0</MathNum>
            </span>
            <span className="text-[#86868B] font-sans">
              ({isKo ? '5개년 누적 영업현금흐름 흑자' : '5Y Cumulative CFO must be positive'})
            </span>
          </div>
        </div>
      );

    case 'proven_earnings_power':
      return (
        <div className="space-y-3">
          <div className="flex items-center flex-wrap gap-y-2 py-1 text-sm sm:text-[15px]">
            <span className="text-xs text-[#86868B] dark:text-[#A1A1A6] mr-2 font-sans font-medium">
              {isKo ? '[다년간 흑자 조건]' : '[Profitability Criteria]'}:
            </span>
            <span className="inline-flex items-center flex-wrap gap-2">
              <span className="font-serif italic font-normal">∀ t ∈ &#123;1, 2, 3, 4, 5&#125; :</span>
              <span className="inline-flex items-center pl-2.5 border-l-2 border-black/[0.15] dark:border-white/[0.2] flex-col items-start gap-1">
                <span className="inline-flex items-center">
                  <MathVar>EBIT</MathVar>
                  <MathSub>t</MathSub>
                  <MathOp>&gt;</MathOp>
                  <MathNum>0</MathNum>
                  <span className="text-xs text-[#86868B] ml-2 font-sans">({isKo ? '영업이익 흑자' : 'Operating Profit > 0'})</span>
                </span>
                <span className="inline-flex items-center">
                  <MathText>{isKo ? '순이익' : 'Net Income'}</MathText>
                  <MathSub>t</MathSub>
                  <MathOp>&gt;</MathOp>
                  <MathNum>0</MathNum>
                  <span className="text-xs text-[#86868B] ml-2 font-sans">({isKo ? '당기순이익 흑자' : 'Net Profit > 0'})</span>
                </span>
              </span>
            </span>
          </div>
        </div>
      );

    case 'eps_growth':
      return (
        <div className="space-y-3">
          {/* Main Formula */}
          <div className="flex items-center flex-wrap gap-y-2 py-1 text-sm sm:text-[15px]">
            <span className="text-xs text-[#86868B] dark:text-[#A1A1A6] mr-2 font-sans font-medium">
              {isKo ? '[복리성장률 공식]' : '[CAGR Formula]'}:
            </span>
            <span className="inline-flex items-center flex-wrap">
              <MathVar>EPS CAGR</MathVar>
              <MathSub>5Y</MathSub>
              <MathOp>=</MathOp>
              <MathParens>
                <MathFraction
                  num={<span><MathVar>Diluted EPS</MathVar><MathSub>{isKo ? '최근' : 'recent'}</MathSub></span>}
                  den={<span><MathVar>Diluted EPS</MathVar><MathSub>{isKo ? '5년전' : '5Y ago'}</MathSub></span>}
                />
              </MathParens>
              <MathSup>
                <MathFraction num="1" den="5" />
              </MathSup>
              <MathOp>-</MathOp>
              <MathNum>1</MathNum>
              <MathOp>≥</MathOp>
              <MathNum>8.0%</MathNum>
            </span>
          </div>

          <div className="pt-2 border-t border-black/[0.04] dark:border-white/[0.06] text-xs text-[#86868B] font-sans">
            {isKo
              ? '※ 시작 시점(5년 전) 및 종료 시점(최근) 희석 EPS가 모두 양수(> 0)인 경우에만 산출 유효'
              : '※ Valid only when both base and terminal diluted EPS values are strictly positive (> 0)'}
          </div>
        </div>
      );

    case 'owner_earnings_quality':
      return (
        <div className="space-y-3">
          {/* Main Conversion */}
          <div className="flex items-center flex-wrap gap-y-2 py-1 text-sm sm:text-[15px]">
            <span className="text-xs text-[#86868B] dark:text-[#A1A1A6] mr-2 font-sans font-medium">
              {isKo ? '[현금 전환율]' : '[Cash Conversion]'}:
            </span>
            <span className="inline-flex items-center flex-wrap">
              <MathText>{isKo ? 'Cash Conversion' : 'Cash Conversion'}</MathText>
              <MathOp>=</MathOp>
              <MathFraction
                num={
                  <span className="inline-flex items-center">
                    <MathSigma top="5" bottom="t=1" />
                    <MathVar>OE Proxy</MathVar>
                    <MathSub>t</MathSub>
                  </span>
                }
                den={
                  <span className="inline-flex items-center">
                    <MathSigma top="5" bottom="t=1" />
                    <MathText>{isKo ? '순이익' : 'Net Income'}</MathText>
                    <MathSub>t</MathSub>
                  </span>
                }
              />
              <MathOp>×</MathOp>
              <MathNum>100</MathNum>
              <MathOp>≥</MathOp>
              <MathNum>80.0%</MathNum>
            </span>
          </div>

          {/* Sub definitions */}
          <div className="pt-2 border-t border-black/[0.04] dark:border-white/[0.06] space-y-1.5 text-xs text-[#6E6E73] dark:text-[#A1A1A6]">
            <div className="flex items-center flex-wrap gap-1">
              <span className="text-[#86868B] font-sans font-normal">1)</span>
              <MathVar>Adjusted CFO</MathVar>
              <MathSub>t</MathSub>
              <MathOp>=</MathOp>
              <MathVar>CFO</MathVar>
              <MathSub>t</MathSub>
              <MathOp>-</MathOp>
              <MathText>{isKo ? '이자지급액' : 'Interest Paid'}</MathText>
              <MathSub>t</MathSub>
            </div>
            <div className="flex items-center flex-wrap gap-1">
              <span className="text-[#86868B] font-sans font-normal">2)</span>
              <MathVar>OE Proxy</MathVar>
              <MathSub>t</MathSub>
              <MathOp>=</MathOp>
              <MathVar>Adjusted CFO</MathVar>
              <MathSub>t</MathSub>
              <MathOp>-</MathOp>
              <span>|</span>
              <MathVar>CapEx</MathVar>
              <MathSub>t</MathSub>
              <span>|</span>
              <span className="text-[11px] text-[#86868B] ml-2 font-sans">
                (Median & Recent OE Proxy &gt; 0)
              </span>
            </div>
          </div>
        </div>
      );

    case 'capital_action_flag':
      return (
        <div className="space-y-3">
          {/* Main Formula */}
          <div className="flex items-center flex-wrap gap-y-2 py-1 text-sm sm:text-[15px]">
            <span className="text-xs text-[#86868B] dark:text-[#A1A1A6] mr-2 font-sans font-medium">
              {isKo ? '[주식수 변동률]' : '[Diluted Share CAGR]'}:
            </span>
            <span className="inline-flex items-center flex-wrap">
              <MathVar>Diluted Share CAGR</MathVar>
              <MathSub>5Y</MathSub>
              <MathOp>=</MathOp>
              <MathParens>
                <MathFraction
                  num={<span><MathVar>Diluted Shares</MathVar><MathSub>{isKo ? '최근' : 'recent'}</MathSub></span>}
                  den={<span><MathVar>Diluted Shares</MathVar><MathSub>{isKo ? '5년전' : '5Y ago'}</MathSub></span>}
                />
              </MathParens>
              <MathSup>
                <MathFraction num="1" den="5" />
              </MathSup>
              <MathOp>-</MathOp>
              <MathNum>1</MathNum>
            </span>
          </div>

          {/* Categorization Rules */}
          <div className="pt-2 border-t border-black/[0.04] dark:border-white/[0.06] space-y-1 text-xs text-[#6E6E73] dark:text-[#A1A1A6]">
            <div className="flex items-center gap-2">
              <span className="font-serif">CAGR &gt; +1.0%</span>
              <span className="text-[#86868B]">→</span>
              <span className="font-sans">{isKo ? '신주 발행 지분 희석 검토 (REVIEW_DILUTION)' : 'REVIEW_DILUTION'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-serif">-1.0% ≤ CAGR ≤ +1.0%</span>
              <span className="text-[#86868B]">→</span>
              <span className="font-sans">{isKo ? '안정적 주식수 유지 (STABLE, 통과)' : 'STABLE (Pass)'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-serif">CAGR &lt; -1.0%</span>
              <span className="text-[#86868B]">→</span>
              <span className="font-sans">{isKo ? '자사주 매입 단가 적정성 검토 (REVIEW_BUYBACK_PRICE)' : 'REVIEW_BUYBACK_PRICE'}</span>
            </div>
          </div>
        </div>
      );

    case 'retained_value_test':
      return (
        <div className="space-y-3">
          {/* Condition 1: BVPS Growth vs Benchmark */}
          <div className="flex items-center flex-wrap gap-y-2 py-1 text-sm sm:text-[15px]">
            <span className="text-xs text-[#86868B] dark:text-[#A1A1A6] mr-2 font-sans font-medium">
              {isKo ? '[1. 순자산 복리 알파]' : '[1. BVPS Compounding Alpha]'}:
            </span>
            <span className="inline-flex items-center flex-wrap">
              <MathVar>BVPS CAGR</MathVar>
              <MathSub>5Y</MathSub>
              <MathOp>&gt;</MathOp>
              <MathVar>Benchmark Index CAGR</MathVar>
              <MathSub>5Y</MathSub>
            </span>
          </div>

          {/* Condition 2: PBR Floor */}
          <div className="pt-2 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center flex-wrap gap-y-2 text-sm sm:text-[15px]">
            <span className="text-xs text-[#86868B] dark:text-[#A1A1A6] mr-2 font-sans font-medium">
              {isKo ? '[2. 순자산가치 하한 지지]' : '[2. Valuation Floor]'}:
            </span>
            <span className="inline-flex items-center flex-wrap">
              <span className="font-serif text-sm text-[#86868B] mr-1 italic font-normal">min</span>
              <MathSub>q ∈ &#123;1..20&#125;</MathSub>
              <MathParens>
                <MathVar>PBR</MathVar>
                <MathSub>q</MathSub>
              </MathParens>
              <MathOp>&gt;</MathOp>
              <MathNum>1.00</MathNum>
              <MathUnit>{isKo ? '배' : 'x'}</MathUnit>
              <span className="text-[11px] text-[#86868B] ml-2 font-sans">
                ({isKo ? '최근 20개 분기 전체 PBR > 1.0 유지' : 'Quarterly PBR > 1.0 across all 20 quarters'})
              </span>
            </span>
          </div>
        </div>
      );

    case 'owner_earnings_yield':
      return (
        <div className="space-y-3">
          {/* Yield Formula */}
          <div className="flex items-center flex-wrap gap-y-2 py-1 text-sm sm:text-[15px]">
            <span className="text-xs text-[#86868B] dark:text-[#A1A1A6] mr-2 font-sans font-medium">
              {isKo ? '[1. 주주이익 수익률]' : '[1. OE Yield]'}:
            </span>
            <span className="inline-flex items-center flex-wrap">
              <MathVar>Owner Earnings Yield</MathVar>
              <MathOp>=</MathOp>
              <MathFraction
                num={<MathText>{isKo ? '정규화 주주이익 (Normalized OE)' : 'Normalized Owner Earnings'}</MathText>}
                den={<MathText>{isKo ? '현재 시가총액 (Market Cap)' : 'Current Market Cap'}</MathText>}
              />
              <MathOp>×</MathOp>
              <MathNum>100</MathNum>
              <MathUnit>(%)</MathUnit>
            </span>
          </div>

          {/* Spread Formula */}
          <div className="pt-2 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center flex-wrap gap-y-2 text-sm sm:text-[15px]">
            <span className="text-xs text-[#86868B] dark:text-[#A1A1A6] mr-2 font-sans font-medium">
              {isKo ? '[2. 10년 국채 대비 스프레드]' : '[2. Yield Spread]'}:
            </span>
            <span className="inline-flex items-center flex-wrap">
              <MathVar>Yield Spread</MathVar>
              <MathOp>=</MathOp>
              <MathVar>OE Yield</MathVar>
              <MathOp>-</MathOp>
              <span>
                <MathVar>r</MathVar>
                <MathSub>{isKo ? '10년물 국채수익률' : '10Y Treasury Yield'}</MathSub>
              </span>
              <MathOp>≥</MathOp>
              <MathNum>+3.0%p</MathNum>
            </span>
          </div>
        </div>
      );

    case 'owner_earnings_dcf':
      return (
        <div className="space-y-3.5">
          {/* 1. Cash flow projection */}
          <div className="flex items-center flex-wrap gap-y-2 py-0.5 text-sm sm:text-[15px]">
            <span className="text-xs text-[#86868B] dark:text-[#A1A1A6] mr-2 font-sans font-medium">
              {isKo ? '[1. 10개년 현금흐름 추정]' : '[1. 10Y OE Projection]'}:
            </span>
            <span className="inline-flex items-center flex-wrap">
              <MathVar>OEPS</MathVar>
              <MathSub>t</MathSub>
              <MathOp>=</MathOp>
              <MathVar>OEPS</MathVar>
              <MathSub>0</MathSub>
              <MathOp>×</MathOp>
              <MathParens>
                <MathNum>1</MathNum>
                <MathOp>+</MathOp>
                <MathVar>g</MathVar>
              </MathParens>
              <MathSup>t</MathSup>
              <span className="text-xs font-serif italic text-[#86868B] ml-3">(t = 1, 2, ..., 10)</span>
            </span>
          </div>

          {/* 2. Intrinsic Value Summation */}
          <div className="pt-2 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center flex-wrap gap-y-2 text-sm sm:text-[15px]">
            <span className="text-xs text-[#86868B] dark:text-[#A1A1A6] mr-2 font-sans font-medium">
              {isKo ? '[2. 10년 DCF 내재가치]' : '[2. DCF Intrinsic Value]'}:
            </span>
            <span className="inline-flex items-center flex-wrap">
              <MathText>{isKo ? '내재가치 (Intrinsic Value)' : 'Intrinsic Value'}</MathText>
              <MathOp>=</MathOp>
              <span className="inline-flex items-center">
                <MathSigma top="10" bottom="t=1" />
                <MathFraction
                  num={<span><MathVar>OEPS</MathVar><MathSub>t</MathSub></span>}
                  den={
                    <span>
                      <MathParens><MathNum>1</MathNum><MathOp>+</MathOp><MathVar>r</MathVar></MathParens>
                      <MathSup>t</MathSup>
                    </span>
                  }
                />
              </span>
              <MathOp>+</MathOp>
              <MathFraction
                num={<MathVar>Terminal Value</MathVar>}
                den={
                  <span>
                    <MathParens><MathNum>1</MathNum><MathOp>+</MathOp><MathVar>r</MathVar></MathParens>
                    <MathSup>10</MathSup>
                  </span>
                }
              />
            </span>
          </div>

          {/* 3. Margin of Safety */}
          <div className="pt-2 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center flex-wrap gap-y-2 text-sm sm:text-[15px]">
            <span className="text-xs text-[#86868B] dark:text-[#A1A1A6] mr-2 font-sans font-medium">
              {isKo ? '[3. 안전마진 판정]' : '[3. Margin of Safety]'}:
            </span>
            <span className="inline-flex items-center flex-wrap">
              <MathText>{isKo ? '안전마진 (Margin of Safety)' : 'Margin of Safety'}</MathText>
              <MathOp>=</MathOp>
              <MathFraction
                num={
                  <span>
                    <MathText>{isKo ? '내재가치' : 'Intrinsic Value'}</MathText>
                    <MathOp>-</MathOp>
                    <MathText>{isKo ? '현재주가' : 'Current Price'}</MathText>
                  </span>
                }
                den={<MathText>{isKo ? '내재가치' : 'Intrinsic Value'}</MathText>}
              />
              <MathOp>×</MathOp>
              <MathNum>100</MathNum>
              <MathOp>≥</MathOp>
              <MathNum>20.0%</MathNum>
            </span>
          </div>
        </div>
      );

    // ----------------------------------------------------
    // PETER LYNCH RULES (1 ~ 4)
    // ----------------------------------------------------
    case 'peg_ratio':
      return (
        <div className="space-y-3">
          {/* Main PEG Formula */}
          <div className="flex items-center flex-wrap gap-y-2 py-1 text-sm sm:text-[15px]">
            <span className="text-xs text-[#86868B] dark:text-[#A1A1A6] mr-2 font-sans font-medium">
              {isKo ? '[PEG 지표 공식]' : '[PEG Formula]'}:
            </span>
            <span className="inline-flex items-center flex-wrap">
              <MathVar>PEG Ratio</MathVar>
              <MathOp>=</MathOp>
              <MathFraction
                num={<MathText>{isKo ? 'Trailing P/E Ratio (주가수익비율)' : 'Trailing P/E Ratio'}</MathText>}
                den={
                  <span>
                    <MathText>{isKo ? '연평균 EPS 성장률' : '5Y EPS Growth Rate'}</MathText>{' '}
                    <MathVar>g</MathVar>{' '}
                    <MathUnit>(%)</MathUnit>
                  </span>
                }
              />
              <MathOp>≤</MathOp>
              <MathNum>1.00</MathNum>
            </span>
          </div>

          <div className="pt-2 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center gap-3 text-xs text-[#86868B] font-sans">
            <span className="text-[#1D1D1F] dark:text-[#F5F5F7] font-normal">
              {isKo ? '린치 매수 기준:' : 'Lynch Criteria:'}
            </span>
            <span>PEG ≤ 0.7 (Strong Buy)</span>
            <span>·</span>
            <span>PEG ≤ 1.0 (Fair Value Buy)</span>
          </div>
        </div>
      );

    case 'sustainable_growth':
      return (
        <div className="space-y-3">
          {/* Main EPS CAGR Formula */}
          <div className="flex items-center flex-wrap gap-y-2 py-1 text-sm sm:text-[15px]">
            <span className="text-xs text-[#86868B] dark:text-[#A1A1A6] mr-2 font-sans font-medium">
              {isKo ? '[성장률 범위]' : '[Target Growth Band]'}:
            </span>
            <span className="inline-flex items-center flex-wrap">
              <MathNum>15.0%</MathNum>
              <MathOp>≤</MathOp>
              <span className="inline-flex items-center">
                <MathVar>EPS CAGR</MathVar>
                <MathSub>5Y</MathSub>
                <MathOp>=</MathOp>
                <MathParens>
                  <MathFraction
                    num={<span><MathVar>EPS</MathVar><MathSub>{isKo ? '최근' : 'recent'}</MathSub></span>}
                    den={<span><MathVar>EPS</MathVar><MathSub>{isKo ? '5년전' : '5Y ago'}</MathSub></span>}
                  />
                </MathParens>
                <MathSup>
                  <MathFraction num="1" den="5" />
                </MathSup>
                <MathOp>-</MathOp>
                <MathNum>1</MathNum>
              </span>
              <MathOp>≤</MathOp>
              <MathNum>30.0%</MathNum>
            </span>
          </div>

          <div className="pt-2 border-t border-black/[0.04] dark:border-white/[0.06] text-xs text-[#86868B] font-sans">
            {isKo
              ? '※ 지나치게 높은 일시적 급성장(50%+)은 경쟁 격화 및 이익 급감 위험이 상존하므로 15~30%의 지속 가능한 복리 성장을 선호'
              : '※ Peter Lynch prefers sustainable 15-30% growth compounders over volatile 50%+ hyper-growth burnouts.'}
          </div>
        </div>
      );

    case 'debt_to_equity':
      return (
        <div className="space-y-3">
          {/* Formula 1: Debt to Equity */}
          <div className="flex items-center flex-wrap gap-y-2 py-1 text-sm sm:text-[15px]">
            <span className="text-xs text-[#86868B] dark:text-[#A1A1A6] mr-2 font-sans font-medium">
              {isKo ? '[1. 보수적 부채비율]' : '[1. Debt to Equity]'}:
            </span>
            <span className="inline-flex items-center flex-wrap">
              <MathText>{isKo ? 'Debt / Equity' : 'Debt to Equity'}</MathText>
              <MathOp>=</MathOp>
              <MathFraction
                num={<MathText>{isKo ? '장기차입금 (Long-Term Debt)' : 'Total Long-Term Debt'}</MathText>}
                den={<MathText>{isKo ? '총자기자본 (Total Equity)' : 'Total Stockholders\' Equity'}</MathText>}
              />
              <MathOp>×</MathOp>
              <MathNum>100</MathNum>
              <MathOp>≤</MathOp>
              <MathNum>50.0%</MathNum>
            </span>
          </div>

          {/* Formula 2: Net Cash */}
          <div className="pt-2 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center flex-wrap gap-y-2 text-sm sm:text-[15px]">
            <span className="text-xs text-[#86868B] dark:text-[#A1A1A6] mr-2 font-sans font-medium">
              {isKo ? '[2. 순현금 요건 (대안)]' : '[2. Net Cash Cushion]'}:
            </span>
            <span className="inline-flex items-center flex-wrap">
              <MathVar>Net Cash</MathVar>
              <MathOp>=</MathOp>
              <MathText>{isKo ? '현금및현금성자산' : 'Cash & Cash Equivalents'}</MathText>
              <MathOp>-</MathOp>
              <MathText>{isKo ? '총이자발생차입금' : 'Total Debt'}</MathText>
              <MathOp>&gt;</MathOp>
              <MathNum>0</MathNum>
            </span>
          </div>
        </div>
      );

    case 'cash_flow_realization':
      return (
        <div className="space-y-3">
          {/* Main Formula */}
          <div className="flex items-center flex-wrap gap-y-2 py-1 text-sm sm:text-[15px]">
            <span className="text-xs text-[#86868B] dark:text-[#A1A1A6] mr-2 font-sans font-medium">
              {isKo ? '[현금 전환 배수]' : '[Cash Realization Ratio]'}:
            </span>
            <span className="inline-flex items-center flex-wrap">
              <MathText>{isKo ? 'Cash Conversion Ratio' : 'Cash Conversion Ratio'}</MathText>
              <MathOp>=</MathOp>
              <MathFraction
                num={
                  <span className="inline-flex items-center">
                    <MathFraction num={<MathNum>1</MathNum>} den={<MathNum>3</MathNum>} />
                    <MathSigma top="3" bottom="t=1" />
                    <MathVar>CFO</MathVar>
                    <MathSub>t</MathSub>
                  </span>
                }
                den={
                  <span className="inline-flex items-center">
                    <MathFraction num={<MathNum>1</MathNum>} den={<MathNum>3</MathNum>} />
                    <MathSigma top="3" bottom="t=1" />
                    <MathText>{isKo ? '순이익' : 'Net Income'}</MathText>
                    <MathSub>t</MathSub>
                  </span>
                }
              />
              <MathOp>≥</MathOp>
              <MathNum>1.00x</MathNum>
              <span className="text-xs text-[#86868B] ml-2 font-sans">(100%+)</span>
            </span>
          </div>

          <div className="pt-2 border-t border-black/[0.04] dark:border-white/[0.06] text-xs text-[#86868B] font-sans">
            {isKo
              ? '※ 최근 3개년 평균 영업활동 현금흐름(CFO)이 회계상 당기순이익 이상(≥ 100%)이어야 실제 현금 유입 우량 기업으로 통과'
              : '※ 3-Year average Cash Flow from Operations (CFO) must equal or exceed reported Net Income (≥ 1.0x).'}
          </div>
        </div>
      );

    default:
      return null;
  }
};
