import React from 'react';
import { Stock } from '../../types/stock';
import { useAppConfig } from '../../context/ThemeLanguageContext';

interface EconomicMoatGovernanceCardProps {
  stock: Stock;
}

export const EconomicMoatGovernanceCard: React.FC<EconomicMoatGovernanceCardProps> = ({ stock }) => {
  const { t, language } = useAppConfig();
  const { governance } = stock;
  const ceo = governance.leadership[0];

  return (
    <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 sm:p-7 border border-black/[0.06] dark:border-white/[0.08] shadow-sm space-y-6 transition-colors duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-black/[0.04] dark:border-white/[0.06]">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
            {t('economicMoatGovernance')}
          </h2>
          <p className="text-xs text-[#86868B] mt-0.5 font-normal">
            Competitive Advantage & Management Alignment
          </p>
        </div>
        <span className="text-[10px] sm:text-xs font-bold bg-[#FF9500]/10 text-[#C93400] dark:text-[#FF9F0A] px-2.5 py-0.5 rounded-full border border-[#FF9500]/20">
          {language === 'ko' ? '거버넌스' : 'Governance'} {governance.overallGrade}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Left: Economic Moat Analysis */}
        <div className="space-y-3">
          <span className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider block">
            {language === 'ko' ? '경제적 해자(Moat) 분석' : 'Economic Moat Analysis'}
          </span>
          <p className="text-xs sm:text-[13px] text-[#1D1D1F] dark:text-[#F5F5F7] leading-relaxed">
            {stock.economicMoatSummary}
          </p>

          <div className="pt-2 flex flex-wrap gap-1.5">
            {stock.moatSources.map((source, idx) => (
              <span
                key={idx}
                className="text-[11px] font-medium bg-[#F5F5F7] dark:bg-[#252528] text-[#1D1D1F] dark:text-[#F5F5F7] px-2.5 py-1 rounded-lg border border-black/[0.03] dark:border-white/[0.04]"
              >
                {source}
              </span>
            ))}
          </div>
        </div>

        {/* Right: Leadership & Governance Profile */}
        <div className="space-y-3 lg:border-l lg:border-black/[0.04] lg:dark:border-white/[0.06] lg:pl-8">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider">
              {language === 'ko' ? '경영진 책임 경영' : 'Leadership & Alignment'}
            </span>
            <span className="text-[11px] text-[#0071E3] dark:text-[#2997FF] font-semibold">
              {language === 'ko' ? '이사회 독립성' : 'Board Independence'} <span className="font-mono tabular-nums">{governance.boardIndependencePct}%</span>
            </span>
          </div>

          {ceo && (
            <div className="py-1">
              <div className="text-xs sm:text-[13px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                {ceo.name} <span className="font-normal text-[#86868B]">({ceo.role} · {ceo.tenureYears}년 재임)</span>
              </div>
              <p className="text-xs text-[#86868B] mt-1 leading-relaxed">
                {ceo.bio}
              </p>
            </div>
          )}

          <div className="pt-1 text-[11px] sm:text-xs text-[#86868B] leading-relaxed">
            {governance.ceoSkinInTheGameSummary}
          </div>
        </div>
      </div>

    </div>
  );
};
