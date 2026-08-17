import React from 'react';
import { OneDollarTestResult } from '../../types/stock';
import { useAppConfig } from '../../context/ThemeLanguageContext';

interface OneDollarRetainedCardProps {
  testResult?: OneDollarTestResult;
}

export const OneDollarRetainedCard: React.FC<OneDollarRetainedCardProps> = ({
  testResult,
}) => {
  const { t, language } = useAppConfig();
  const valueCreated = testResult ? testResult.valueCreatedPerDollar : 6.76;
  const comment = testResult?.evaluationComment || '5개년 누적 사내유보 이익 1달러당 창출된 주주 시장가치';

  return (
    <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 sm:p-7 border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex flex-col justify-between h-full space-y-6 transition-colors duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-black/[0.04] dark:border-white/[0.06]">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
            {t('oneDollarTestTitle')}
          </h2>
          <p className="text-xs text-[#86868B] mt-0.5 font-normal">
            Warren Buffett's $1 Retained Earnings Doctrine
          </p>
        </div>
        <div className="text-right shrink-0">
          <span className="text-sm font-bold text-[#34C759]">
            PASS
          </span>
          <span className="text-[10px] text-[#86868B] block font-medium uppercase tracking-wider">
            기준 ≥ $1.00
          </span>
        </div>
      </div>

      {/* Main Metric & Comparison Bar */}
      <div className="space-y-4">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl lg:text-5xl font-bold font-mono text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight tabular-nums">
              ${valueCreated.toFixed(2)}
            </span>
            <span className="text-xs font-semibold text-[#34C759]">
              / $1.00 Retained
            </span>
          </div>
          <p className="text-xs text-[#86868B] mt-1 leading-relaxed">
            {comment}
          </p>
        </div>

        {/* Proportional Value Multiplier Bar */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#86868B] font-medium">{t('retained')} vs {t('created')}</span>
            <span className="font-bold text-[#34C759]"><span className="font-mono tabular-nums">{valueCreated.toFixed(1)}x</span> {language === 'ko' ? '가치 증폭' : 'Value Multiple'}</span>
          </div>
          
          <div className="h-3 w-full bg-[#EBEBED] dark:bg-[#2C2C2E] rounded-full overflow-hidden flex">
            <div className="bg-[#86868B] h-full w-[15%] rounded-l-full" title="사내유보 $1.00" />
            <div className="bg-[#34C759] h-full w-[85%] rounded-r-full" title={`창출가치 $${valueCreated.toFixed(2)}`} />
          </div>

          <div className="flex justify-between text-[10px] text-[#86868B] pt-0.5">
            <span>● {language === 'ko' ? '사내 유보' : 'Retained'} <span className="font-mono tabular-nums">$1.00</span></span>
            <span>● {language === 'ko' ? '주주 시장가치 창출' : 'Market Value Created'} <span className="font-mono tabular-nums">${valueCreated.toFixed(2)}</span></span>
          </div>
        </div>
      </div>

    </div>
  );
};
