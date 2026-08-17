import React from 'react';
import { PieChart } from 'lucide-react';
import { ManagementGovernance } from '../../types/stock';
import { useAppConfig } from '../../context/ThemeLanguageContext';

interface CapitalAllocationCookCardProps {
  governance?: ManagementGovernance;
}

export const CapitalAllocationCookCard: React.FC<CapitalAllocationCookCardProps> = ({
  governance,
}) => {
  const { t } = useAppConfig();
  const buybacksPct = governance ? governance.capitalAllocation.shareBuybacksPct : 82;
  const dividendsPct = governance ? governance.capitalAllocation.dividendsPct : 18;

  // SVG Donut calculation
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (buybacksPct / 100) * circumference;

  return (
    <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex flex-col justify-between space-y-4 sm:space-y-6 transition-colors duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
          {t('capitalAllocationTitle')}
        </h2>
        <PieChart className="w-4 h-4 text-[#86868B]" />
      </div>

      {/* Main Visual Layout (Donut Chart + Right Stat) */}
      <div className="flex flex-row items-center gap-5 sm:gap-8 py-2">
        
        {/* Donut Chart Ring */}
        <div className="relative w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 130 130">
            {/* Background Track */}
            <circle
              cx="65"
              cy="65"
              r={radius}
              className="stroke-[#EBEBED] dark:stroke-[#2C2C2E]"
              strokeWidth="14"
              fill="transparent"
            />
            {/* Active Buyback Segment */}
            <circle
              cx="65"
              cy="65"
              r={radius}
              className="stroke-[#0071E3] dark:stroke-[#2997FF] transition-all duration-1000 ease-out"
              strokeWidth="14"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Center Text inside Donut */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xl sm:text-2xl font-bold font-mono text-[#1D1D1F] dark:text-[#F5F5F7] tabular-nums tracking-tight">
              {buybacksPct}%
            </span>
            <span className="text-[9px] sm:text-[10px] text-[#86868B] font-medium tracking-tight">
              {t('buybacks')}
            </span>
          </div>
        </div>

        {/* Right Content & Legend */}
        <div className="flex-1 space-y-2 sm:space-y-3 text-left">
          <div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight tabular-nums">
              $650B
            </div>
            <p className="text-[11px] sm:text-xs text-[#86868B] mt-0.5 sm:mt-1 font-normal leading-relaxed">
              {t('sharesRetiredSub')}
            </p>
          </div>

          {/* Legend */}
          <div className="space-y-1 sm:space-y-1.5 pt-1 text-[11px] sm:text-xs">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#0071E3] dark:bg-[#2997FF] shrink-0" />
              <span className="text-[#1D1D1F] dark:text-[#F5F5F7] font-medium">{t('shareRepurchases')} ({buybacksPct}%)</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#D2D2D7] dark:bg-[#5E5E63] shrink-0" />
              <span className="text-[#86868B] font-medium">{t('dividendsPaid')} ({dividendsPct}%)</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
