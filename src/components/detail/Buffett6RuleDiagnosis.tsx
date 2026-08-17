import React from 'react';
import { CheckCircle2, TrendingUp, Landmark, Banknote, ShieldCheck, ArrowUpRight, DollarSign } from 'lucide-react';
import { Stock } from '../../types/stock';
import { useAppConfig } from '../../context/ThemeLanguageContext';

interface Buffett6RuleDiagnosisProps {
  stock: Stock;
}

export const Buffett6RuleDiagnosis: React.FC<Buffett6RuleDiagnosisProps> = ({ stock }) => {
  const { t } = useAppConfig();

  const rules = [
    {
      title: t('consistentEarnings'),
      value: t('tenYrEpsGrowth'),
      icon: TrendingUp,
      passed: true,
    },
    {
      title: t('highRoe'),
      value: `${t('avgRoeGt20')} (${stock.avgRoe5Yr.toFixed(1)}%)`,
      icon: Landmark,
      passed: true,
    },
    {
      title: t('highRoic'),
      value: `${t('roicGt15Historic')} (${stock.avgRoic5Yr.toFixed(1)}%)`,
      icon: Banknote,
      passed: true,
    },
    {
      title: t('lowDebt'),
      value: t('netCashPositive'),
      icon: ShieldCheck,
      passed: true,
    },
    {
      title: t('marginExpansion'),
      value: t('grossMarginsUp'),
      icon: ArrowUpRight,
      passed: true,
    },
    {
      title: t('oneDollarTest'),
      value: t('valueCreated'),
      icon: DollarSign,
      passed: true,
    },
  ];

  return (
    <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex flex-col justify-between space-y-4 sm:space-y-5 transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
          {t('buffett6RuleDiagnosis')}
        </h2>
        <span className="text-[10px] sm:text-xs text-[#86868B] font-medium bg-[#F5F5F7] dark:bg-[#2C2C2E] px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full border border-black/[0.03] dark:border-white/[0.06]">
          {t('updatedToday')}
        </span>
      </div>

      {/* 6 Bento Tiles Grid (2 cols on Mobile, 3 cols on Tablet/Desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3.5">
        {rules.map((rule, idx) => {
          const Icon = rule.icon;
          return (
            <div
              key={idx}
              className="bg-white dark:bg-[#252528] border border-black/[0.06] dark:border-white/[0.06] rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col justify-between hover:border-black/[0.12] dark:hover:border-white/[0.15] transition-all"
            >
              <div className="flex items-center justify-between mb-2.5 sm:mb-4">
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#86868B]" />
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#34C759] stroke-[2.5]" />
              </div>

              <div>
                <span className="text-[10px] sm:text-[11px] text-[#86868B] font-medium block truncate">
                  {rule.title}
                </span>
                <span className="text-[11px] sm:text-xs font-bold text-[#1D1D1F] dark:text-[#F5F5F7] mt-0.5 block tracking-tight truncate">
                  {rule.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
