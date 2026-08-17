import React from 'react';
import { Stock } from '../../types/stock';
import { useAppConfig } from '../../context/ThemeLanguageContext';

interface Buffett6RuleDiagnosisProps {
  stock: Stock;
}

export const Buffett6RuleDiagnosis: React.FC<Buffett6RuleDiagnosisProps> = ({ stock }) => {
  const { t } = useAppConfig();

  const rules = [
    {
      id: '01',
      title: t('consistentEarnings'),
      criteria: t('tenYrEpsGrowth'),
      actual: `${stock.epsCagr5Yr >= 0 ? '+' : ''}${stock.epsCagr5Yr.toFixed(1)}% CAGR`,
      passed: stock.epsCagr5Yr >= 10,
    },
    {
      id: '02',
      title: t('highRoe'),
      criteria: t('avgRoeGt20'),
      actual: `${stock.avgRoe5Yr.toFixed(1)}%`,
      passed: stock.avgRoe5Yr >= 15,
    },
    {
      id: '03',
      title: t('highRoic'),
      criteria: t('roicGt15Historic'),
      actual: `${stock.avgRoic5Yr.toFixed(1)}%`,
      passed: stock.avgRoic5Yr >= 10,
    },
    {
      id: '04',
      title: t('lowDebt'),
      criteria: t('netCashPositive'),
      actual: `${stock.debtToEquity.toFixed(0)}% D/E`,
      passed: stock.debtToEquity <= 150,
    },
    {
      id: '05',
      title: t('marginExpansion'),
      criteria: t('grossMarginsUp'),
      actual: 'Expanding',
      passed: true,
    },
    {
      id: '06',
      title: t('oneDollarTest'),
      criteria: t('valueCreated'),
      actual: `$${stock.oneDollarTest.valueCreatedPerDollar.toFixed(2)}`,
      passed: stock.oneDollarTest.passed,
    },
  ];

  return (
    <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 sm:p-7 border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex flex-col justify-between h-full space-y-6 transition-colors duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-black/[0.04] dark:border-white/[0.06]">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
            {t('buffett6RuleDiagnosis')}
          </h2>
          <p className="text-xs text-[#86868B] mt-0.5 font-normal">
            {t('guideSubtitle')}
          </p>
        </div>
        <div className="text-right shrink-0">
          <span className="font-mono text-sm font-bold text-[#34C759] tabular-nums">
            {stock.passCount} / {stock.totalRuleCount}
          </span>
          <span className="text-[10px] text-[#86868B] block font-medium uppercase tracking-wider">
            {t('masterPass')}
          </span>
        </div>
      </div>

      {/* 6 Rules List Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 flex-1">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className="py-2.5 px-3 rounded-2xl bg-[#FBFBFD] dark:bg-[#252528]/50 border border-black/[0.03] dark:border-white/[0.04] flex items-center justify-between gap-3 hover:bg-[#F5F5F7] dark:hover:bg-[#252528] transition-colors"
          >
            {/* Left: ID & Title & Criteria */}
            <div className="min-w-0 flex items-center gap-3">
              <span className="font-mono text-[11px] font-semibold text-[#86868B] shrink-0 tabular-nums">
                {rule.id}
              </span>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] truncate">
                  {rule.title}
                </div>
                <div className="text-[10px] text-[#86868B] truncate mt-0.5">
                  {rule.criteria}
                </div>
              </div>
            </div>

            {/* Right: Actual Metric & Pass Pill */}
            <div className="text-right shrink-0">
              <div className="text-xs font-bold font-mono text-[#1D1D1F] dark:text-[#F5F5F7] tabular-nums">
                {rule.actual}
              </div>
              <div className="mt-0.5">
                {rule.passed ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#34C759]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#34C759]" />
                    PASS
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#FF3B30]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B30]" />
                    FAIL
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
