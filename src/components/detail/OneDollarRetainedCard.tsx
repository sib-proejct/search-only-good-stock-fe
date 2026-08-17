import React from 'react';
import { TrendingUp } from 'lucide-react';
import { OneDollarTestResult } from '../../types/stock';
import { useAppConfig } from '../../context/ThemeLanguageContext';

interface OneDollarRetainedCardProps {
  testResult?: OneDollarTestResult;
}

export const OneDollarRetainedCard: React.FC<OneDollarRetainedCardProps> = ({
  testResult,
}) => {
  const { t } = useAppConfig();
  const valueCreated = testResult ? testResult.valueCreatedPerDollar : 17.80;

  return (
    <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex flex-col justify-between space-y-4 sm:space-y-6 transition-colors duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
          {t('oneDollarTestTitle')}
        </h2>
        <TrendingUp className="w-4 h-4 text-[#86868B]" />
      </div>

      {/* Main Value Display */}
      <div>
        <div className="text-3xl sm:text-4xl font-bold font-mono text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight tabular-nums">
          ${valueCreated.toFixed(2)}
        </div>
        <p className="text-[11px] sm:text-xs text-[#86868B] mt-0.5 sm:mt-1 font-normal">
          {t('oneDollarSub')}
        </p>
      </div>

      {/* Dual Horizontal Progress Bars */}
      <div className="space-y-2.5 sm:space-y-3 pt-1 sm:pt-2">
        {/* Retained Bar Row */}
        <div className="flex items-center gap-3 sm:gap-4 text-xs">
          <span className="w-14 sm:w-16 text-[#86868B] font-medium shrink-0 text-[11px] sm:text-xs">{t('retained')}</span>
          <div className="flex-1 bg-[#EBEBED] dark:bg-[#2C2C2E] rounded-full h-5 sm:h-6 overflow-hidden flex items-center">
            <div
              className="bg-[#5E5E63] dark:bg-[#6E6E73] h-full flex items-center justify-center text-white font-mono text-[10px] sm:text-[11px] font-semibold px-2 rounded-l-full rounded-r-none transition-all duration-500"
              style={{ width: '12%' }}
            >
              $1.00
            </div>
          </div>
        </div>

        {/* Created Bar Row */}
        <div className="flex items-center gap-3 sm:gap-4 text-xs">
          <span className="w-14 sm:w-16 text-[#86868B] font-medium shrink-0 text-[11px] sm:text-xs">{t('created')}</span>
          <div className="flex-1 bg-[#EBEBED] dark:bg-[#2C2C2E] rounded-full h-5 sm:h-6 overflow-hidden flex items-center">
            <div
              className="bg-[#34C759] h-full flex items-center pl-3 sm:pl-4 text-white font-mono text-[10px] sm:text-[11px] font-semibold rounded-full transition-all duration-700 ease-out truncate"
              style={{ width: '92%' }}
            >
              ${valueCreated.toFixed(2)} {t('marketValue')}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
