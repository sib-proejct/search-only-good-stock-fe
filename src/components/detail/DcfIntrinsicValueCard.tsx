import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { useAppConfig } from '../../context/ThemeLanguageContext';

interface DcfIntrinsicValueCardProps {
  currentPrice?: number;
}

export const DcfIntrinsicValueCard: React.FC<DcfIntrinsicValueCardProps> = ({
  currentPrice = 224.20,
}) => {
  const { t } = useAppConfig();
  const [growthRate, setGrowthRate] = useState<number>(8.5);
  const [wacc, setWacc] = useState<number>(7.2);

  // Dynamic DCF fair value calculation based on sliders
  const baseFairValue = 245.00;
  const growthMultiplier = 1 + (growthRate - 8.5) * 0.04;
  const waccMultiplier = 1 - (wacc - 7.2) * 0.05;
  const calculatedFairValue = baseFairValue * growthMultiplier * waccMultiplier;
  const upsidePct = ((calculatedFairValue - currentPrice) / currentPrice) * 100;

  return (
    <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-7 border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex flex-col justify-between space-y-5 transition-colors duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
          {t('dcfIntrinsicValue')}
        </h2>
        <button
          className="text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors focus:outline-none"
          title="Discounted Cash Flow 10-Year Valuation Model"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      {/* Main Fair Value Estimate Display */}
      <div className="text-center py-2">
        <span className="text-[10px] text-[#86868B] tracking-wider uppercase font-semibold block mb-1">
          {t('fairValueEstimate')}
        </span>
        <div className="text-4xl font-bold font-mono text-[#0071E3] dark:text-[#2997FF] tracking-tight tabular-nums">
          ${calculatedFairValue.toFixed(2)}
        </div>
        <span className={`text-xs font-semibold mt-1 inline-block tabular-nums ${
          upsidePct >= 0 ? 'text-[#34C759]' : 'text-[#FF3B30]'
        }`}>
          {upsidePct >= 0 ? `+${upsidePct.toFixed(1)}% ${t('upside')}` : `${upsidePct.toFixed(1)}% ${t('downside')}`}
        </span>
      </div>

      {/* Interactive Sliders */}
      <div className="pt-4 border-t border-black/[0.06] dark:border-white/[0.08] space-y-4">
        {/* Slider 1: Expected Growth */}
        <div>
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-[#86868B] font-medium">{t('expectedGrowth')}</span>
            <span className="font-bold font-mono text-[#1D1D1F] dark:text-[#F5F5F7] tabular-nums">{growthRate.toFixed(1)}%</span>
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
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-[#86868B] font-medium">{t('discountRateWacc')}</span>
            <span className="font-bold font-mono text-[#1D1D1F] dark:text-[#F5F5F7] tabular-nums">{wacc.toFixed(1)}%</span>
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
