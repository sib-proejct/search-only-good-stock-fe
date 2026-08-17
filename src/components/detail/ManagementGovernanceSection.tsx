import React from 'react';
import { ManagementGovernance } from '../../types/stock';
import { ShieldCheck, Users, DollarSign, PieChart } from 'lucide-react';

interface ManagementGovernanceSectionProps {
  governance: ManagementGovernance;
}

export const ManagementGovernanceSection: React.FC<ManagementGovernanceSectionProps> = ({
  governance,
}) => {
  return (
    <div className="w-full apple-card p-6 sm:p-8 space-y-6">
      
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-black/[0.05]">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-[#1D1D1F] tracking-tight">
              Management & Board Governance Audit
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FF9500]/15 text-[#C93400]">
              {governance.gradeLabel}
            </span>
          </div>
          <p className="text-xs text-[#86868B] mt-0.5 font-normal">
            Warren Buffett Criteria: 'Rational Capital Allocation', 'Skin in the Game', and 'Unfailing Candor'
          </p>
        </div>

        <div className="flex items-center gap-2.5 bg-[#F5F5F7] px-3.5 py-2 rounded-2xl border border-black/[0.03]">
          <ShieldCheck className="w-4 h-4 text-[#34C759]" />
          <div className="text-right">
            <span className="text-[10px] text-[#86868B] font-semibold uppercase tracking-wider block">Board Independence</span>
            <span className="text-[#34C759] text-xs font-bold"><span className="font-mono tabular-nums">{governance.boardIndependencePct}%</span> Independent</span>
          </div>
        </div>
      </div>

      {/* 2-Column Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* 1. Key Leadership & Skin in the Game */}
        <div className="bg-[#F5F5F7] rounded-2xl p-5 space-y-4 border border-black/[0.03]">
          <div className="flex items-center justify-between border-b border-black/[0.05] pb-3">
            <h3 className="text-xs font-bold text-[#1D1D1F] flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-[#0071E3]" />
              <span>Leadership Profile & Skin in the Game</span>
            </h3>
            <span className="text-[10px] text-[#248A3D] font-bold bg-[#34C759]/15 px-2.5 py-0.5 rounded-full">Owner Alignment A+</span>
          </div>

          <div className="space-y-3">
            {governance.leadership.map((leader, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl border border-black/[0.04] space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#0071E3] font-semibold uppercase tracking-wider block">{leader.role}</span>
                    <span className="font-bold text-[#1D1D1F] text-xs">{leader.name}</span>
                    <span className="text-[11px] text-[#86868B] ml-2">Tenure: <span className="font-mono tabular-nums">{leader.tenureYears}</span> Years</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#86868B] font-semibold uppercase tracking-wider block">Owned Shares Value</span>
                    <span className="font-bold text-[#34C759] text-xs">
                      <span className="font-mono tabular-nums">${(leader.sharesValueUsd / 1000000).toFixed(1)}M</span> (<span className="font-mono tabular-nums">{leader.sharesOwned.toLocaleString()}</span> shares)
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-[#6E6E73] leading-relaxed font-normal">
                  {leader.bio}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-white p-3 rounded-xl border border-black/[0.04] text-xs text-[#6E6E73]">
            <span className="font-semibold text-[#1D1D1F]">Insider Transaction Tracking: </span>
            {governance.ceoSkinInTheGameSummary}
          </div>
        </div>

        {/* 2. Executive Compensation Alignment & Capital Allocation */}
        <div className="bg-[#F5F5F7] rounded-2xl p-5 space-y-4 border border-black/[0.03]">
          <div className="flex items-center justify-between border-b border-black/[0.05] pb-3">
            <h3 className="text-xs font-bold text-[#1D1D1F] flex items-center gap-2">
              <DollarSign className="w-3.5 h-3.5 text-[#FF9500]" />
              <span>Compensation Structure & Pay-for-Performance</span>
            </h3>
            <span className="text-[10px] text-[#248A3D] font-bold bg-[#34C759]/15 px-2.5 py-0.5 rounded-full">
              {governance.compensation.alignmentRating === 'EXCELLENT' ? 'Outstanding Alignment' : 'Disciplined'}
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-black/[0.04] space-y-3 shadow-2xs">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-medium text-[#86868B]">Annual Total CEO Compensation ({governance.compensation.year})</span>
              <span className="font-mono font-bold text-[#1D1D1F] text-sm tabular-nums">
                ${(governance.compensation.totalCompUsd / 1000000).toFixed(1)}M
              </span>
            </div>

            {/* Compensation Breakdown Bar */}
            <div>
              <div className="flex justify-between text-[10px] text-[#86868B] mb-1.5 font-sans">
                <span>Base ({governance.compensation.baseSalaryPct}%)</span>
                <span>Bonus ({governance.compensation.performanceBonusPct}%)</span>
                <span className="font-semibold text-[#34C759]">Stock-based ({governance.compensation.stockBasedCompPct}%)</span>
              </div>
              <div className="w-full bg-[#E5E5EA] rounded-full h-2 flex overflow-hidden">
                <div
                  className="bg-[#86868B] h-full"
                  style={{ width: `${governance.compensation.baseSalaryPct}%` }}
                  title="Base Salary"
                />
                <div
                  className="bg-[#0071E3] h-full"
                  style={{ width: `${governance.compensation.performanceBonusPct}%` }}
                  title="Performance Bonus"
                />
                <div
                  className="bg-[#34C759] h-full"
                  style={{ width: `${governance.compensation.stockBasedCompPct}%` }}
                  title="Long-term Equity Incentives"
                />
              </div>
            </div>

            <p className="text-[11px] text-[#6E6E73] leading-relaxed font-normal">
              {governance.compensation.summaryComment}
            </p>
          </div>

          {/* 3. 5-Year Capital Allocation Bento Box */}
          <div className="bg-white p-4 rounded-xl border border-black/[0.04] space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1D1D1F] flex items-center gap-1.5">
                <PieChart className="w-3.5 h-3.5 text-[#0071E3]" />
                5-Year FCF Capital Deployment
              </span>
              <span className="text-[11px] font-bold text-[#248A3D] bg-[#34C759]/15 px-2.5 py-0.5 rounded-full">
                Total Shareholder Return: <span className="font-mono tabular-nums">{governance.capitalAllocation.totalShareholderReturnPct}%</span>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center text-xs">
              <div className="bg-[#F5F5F7] p-2.5 rounded-xl border border-black/[0.02]">
                <span className="text-[10px] text-[#86868B] block font-medium">Buybacks</span>
                <span className="font-mono font-bold text-[#34C759] text-xs tabular-nums">
                  {governance.capitalAllocation.shareBuybacksPct}%
                </span>
              </div>
              <div className="bg-[#F5F5F7] p-2.5 rounded-xl border border-black/[0.02]">
                <span className="text-[10px] text-[#86868B] block font-medium">Dividends</span>
                <span className="font-mono font-bold text-[#0071E3] text-xs tabular-nums">
                  {governance.capitalAllocation.dividendsPct}%
                </span>
              </div>
              <div className="bg-[#F5F5F7] p-2.5 rounded-xl border border-black/[0.02]">
                <span className="text-[10px] text-[#86868B] block font-medium">Reinvestment</span>
                <span className="font-mono font-bold text-[#FF9500] text-xs tabular-nums">
                  {governance.capitalAllocation.reinvestmentPct}%
                </span>
              </div>
              <div className="bg-[#F5F5F7] p-2.5 rounded-xl border border-black/[0.02]">
                <span className="text-[10px] text-[#86868B] block font-medium">M&A</span>
                <span className="font-mono font-bold text-[#86868B] text-xs tabular-nums">
                  {governance.capitalAllocation.maAcquisitionPct}%
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
