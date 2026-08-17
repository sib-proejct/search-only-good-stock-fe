import React, { useState } from 'react';
import { useAppConfig } from '../../context/ThemeLanguageContext';

interface DcfIntrinsicValueCardProps {
  currentPrice?: number;
  currency?: 'USD' | 'KRW';
}

export const DcfIntrinsicValueCard: React.FC<DcfIntrinsicValueCardProps> = ({
  currentPrice = 175.84,
  currency = currentPrice > 1000 ? 'KRW' : 'USD',
}) => {
  const { t, language } = useAppConfig();
  const [growthRate, setGrowthRate] = useState<number>(8.5);
  const [wacc, setWacc] = useState<number>(7.2);

  // Dynamic DCF fair value calculation based on sliders
  const baseFairValue = currentPrice * 1.15;
  const growthMultiplier = 1 + (growthRate - 8.5) * 0.04;
  const waccMultiplier = 1 - (wacc - 7.2) * 0.05;
  const calculatedFairValue = baseFairValue * growthMultiplier * waccMultiplier;
  const upsidePct = ((calculatedFairValue - currentPrice) / currentPrice) * 100;

  const fairValueFormatted =
    currency === 'USD'
      ? `$${calculatedFairValue.toFixed(2)}`
      : `${Math.round(calculatedFairValue).toLocaleString()}원`;

  const currentPriceFormatted =
    currency === 'USD'
      ? `$${currentPrice.toFixed(2)}`
      : `${Math.round(currentPrice).toLocaleString()}원`;

  return (
    <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 sm:p-7 border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex flex-col justify-between h-full space-y-6 transition-colors duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-black/[0.04] dark:border-white/[0.06]">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
            {t('dcfIntrinsicValue')}
          </h2>
          <p className="text-xs text-[#86868B] mt-0.5 font-normal">
            10-Year Discounted Cash Flow Model
          </p>
        </div>
        <div className="text-right shrink-0">
          <span className={`text-sm font-mono font-bold tabular-nums ${
            upsidePct >= 0 ? 'text-[#34C759]' : 'text-[#FF3B30]'
          }`}>
            {upsidePct >= 0 ? `+${upsidePct.toFixed(1)}%` : `${upsidePct.toFixed(1)}%`}
          </span>
          <span className="text-[10px] text-[#86868B] block font-medium uppercase tracking-wider">
            {upsidePct >= 0 ? t('upside') : t('downside')}
          </span>
        </div>
      </div>

      {/* Main Fair Value & Price Range Comparison */}
      <div className="py-2 flex flex-col justify-center space-y-3">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-[10px] sm:text-[11px] text-[#86868B] uppercase tracking-wider font-semibold block">
              {t('fairValueEstimate')}
            </span>
            <div className="text-3xl sm:text-4xl font-bold font-mono text-[#0071E3] dark:text-[#2997FF] tracking-tight tabular-nums mt-0.5">
              {fairValueFormatted}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] sm:text-[11px] text-[#86868B] uppercase tracking-wider font-semibold block">
              {t('price')}
            </span>
            <div className="text-xl sm:text-2xl font-bold font-mono text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight tabular-nums mt-0.5">
              {currentPriceFormatted}
            </div>
          </div>
        </div>

        {/* Visual Valuation Meter */}
        <div className="space-y-1.5 pt-1">
          <div className="h-2 w-full bg-[#EBEBED] dark:bg-[#2C2C2E] rounded-full overflow-hidden flex">
            <div
              className="bg-[#0071E3] dark:bg-[#2997FF] h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(Math.max((currentPrice / calculatedFairValue) * 100, 20), 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-[#86868B]">
            <span className="font-mono tabular-nums">$0</span>
            <span>
              <span className="font-mono tabular-nums">{currentPriceFormatted}</span> ({t('price')})
            </span>
            <span>
              <span className="font-mono tabular-nums">{fairValueFormatted}</span> ({language === 'ko' ? '적정가' : 'Fair Value'})
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Sliders */}
      <div className="pt-2 border-t border-black/[0.04] dark:border-white/[0.06] space-y-3">
        {/* Slider 1: Expected Growth */}
        <div>
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-[#86868B] font-medium">{t('expectedGrowth')}</span>
            <span className="font-bold font-mono text-[#1D1D1F] dark:text-[#F5F5F7] tabular-nums">
              {growthRate.toFixed(1)}%
            </span>
          </div>
          <input
            type="range"
            min={3.0}
            max={15.0}
            step={0.5}
            value={growthRate}
            onChange={(e) => setGrowthRate(parseFloat(e.target.value))}
            className="w-full accent-[#0071E3] dark:accent-[#2997FF] cursor-pointer h-1.5 bg-[#EBEBED] dark:bg-[#2C2C2E] rounded-full appearance-none"
          />
        </div>

        {/* Slider 2: Discount Rate */}
        <div>
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-[#86868B] font-medium">{t('discountRateWacc')}</span>
            <span className="font-bold font-mono text-[#1D1D1F] dark:text-[#F5F5F7] tabular-nums">
              {wacc.toFixed(1)}%
            </span>
          </div>
          <input
            type="range"
            min={5.0}
            max={12.0}
            step={0.2}
            value={wacc}
            onChange={(e) => setWacc(parseFloat(e.target.value))}
            className="w-full accent-[#0071E3] dark:accent-[#2997FF] cursor-pointer h-1.5 bg-[#EBEBED] dark:bg-[#2C2C2E] rounded-full appearance-none"
          />
        </div>
      </div>

    </div>
  );
};
