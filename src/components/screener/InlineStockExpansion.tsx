import React from 'react';
import { Stock } from '../../types/stock';
import { Check, X, ArrowUpRight, DollarSign, Users, ShieldCheck } from 'lucide-react';

interface InlineStockExpansionProps {
  stock: Stock;
  onNavigateDetail: (stockId: string) => void;
}

export const InlineStockExpansion: React.FC<InlineStockExpansionProps> = ({
  stock,
  onNavigateDetail,
}) => {
  return (
    <div className="p-5 bg-white border border-black/[0.06] rounded-2xl my-2 shadow-apple-card space-y-4 animate-fade-in">
      
      {/* Header inside expansion */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-black/[0.05]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#1D1D1F] flex items-center justify-center font-mono font-bold text-xs text-white">
            {stock.ticker.slice(0, 3)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-xs text-[#1D1D1F]">{stock.nameKo} ({stock.ticker})</h3>
              <span className="text-[10px] text-[#86868B] font-mono bg-[#F5F5F7] px-2 py-0.5 rounded-full">{stock.market}</span>
              <span className="text-xs text-[#86868B]">· {stock.sector}</span>
            </div>
            <p className="text-[11px] text-[#86868B] mt-0.5 font-normal">{stock.economicMoatSummary}</p>
          </div>
        </div>

        <button
          onClick={() => onNavigateDetail(stock.id)}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-[#0071E3] hover:bg-[#0077ED] text-white shadow-apple-pill transition-all"
        >
          <span>Deep Valuation & Governance</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 3-Column Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Column 1: Buffett 6 Rules Checklist */}
        <div className="bg-[#F5F5F7] rounded-xl p-4 space-y-2.5 border border-black/[0.03]">
          <div className="flex items-center justify-between text-xs font-semibold text-[#1D1D1F] border-b border-black/[0.05] pb-2">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0071E3]" />
              Buffett 6-Pillar Scorecard
            </span>
            <span className="text-[#86868B] text-[11px] font-medium"><span className="font-mono tabular-nums">{stock.passCount}/{stock.totalRuleCount}</span> Passed</span>
          </div>

          <div className="space-y-1.5 text-xs">
            {stock.ruleEvaluations.map((evalItem) => (
              <div key={evalItem.ruleId} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {evalItem.passed ? (
                    <div className="w-3.5 h-3.5 rounded-full bg-[#34C759]/15 text-[#34C759] flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full bg-[#FF3B30]/15 text-[#FF3B30] flex items-center justify-center shrink-0">
                      <X className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                  <span className={`text-[11px] ${evalItem.passed ? 'text-[#1D1D1F] font-medium' : 'text-[#86868B]'}`}>
                    {evalItem.ruleName}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`font-mono font-semibold tabular-nums text-xs ${evalItem.passed ? 'text-[#34C759]' : 'text-[#FF3B30]'}`}>
                    {evalItem.actualValue}
                  </span>
                  <span className="text-[10px] text-[#A1A1A6] font-mono tabular-nums">({evalItem.targetValue})</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: 1-Dollar Retained Earnings Test Visualizer */}
        <div className="bg-[#F5F5F7] rounded-xl p-4 space-y-2.5 border border-black/[0.03]">
          <div className="flex items-center justify-between text-xs font-semibold text-[#1D1D1F] border-b border-black/[0.05] pb-2">
            <span className="flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-[#FF9500]" />
              $1 Retained Earnings Test
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              stock.oneDollarTest.passed ? 'bg-[#34C759]/15 text-[#248A3D]' : 'bg-[#FF3B30]/15 text-[#FF3B30]'
            }`}>
              {stock.oneDollarTest.passed ? 'PASS' : 'FAIL'}
            </span>
          </div>

          <div className="space-y-2 pt-0.5">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#86868B] text-[11px]">Value Created per $1 Retained</span>
                <span className="font-mono font-bold text-[#34C759] text-xs tabular-nums">
                  ${stock.oneDollarTest.valueCreatedPerDollar.toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-[#E5E5EA] rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#34C759] h-full rounded-full"
                  style={{ width: `${Math.min(100, (stock.oneDollarTest.valueCreatedPerDollar / 3) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-[#86868B] mt-1">
                <span>Threshold: <span className="font-mono tabular-nums">$1.00</span></span>
                <span>Created: <span className="font-mono tabular-nums">${stock.oneDollarTest.valueCreatedPerDollar.toFixed(2)}</span></span>
              </div>
            </div>

            <p className="text-[11px] text-[#6E6E73] leading-relaxed bg-white p-2.5 rounded-xl border border-black/[0.04]">
              {stock.oneDollarTest.evaluationComment}
            </p>
          </div>
        </div>

        {/* Column 3: Management & Governance Snapshot */}
        <div className="bg-[#F5F5F7] rounded-xl p-4 space-y-2.5 border border-black/[0.03]">
          <div className="flex items-center justify-between text-xs font-semibold text-[#1D1D1F] border-b border-black/[0.05] pb-2">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#0071E3]" />
              Management & Governance
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF9500]/15 text-[#C93400]">
              {stock.governance.gradeLabel}
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-black/[0.04]">
              <span className="text-[#86868B] text-[11px]">Chief Executive Officer</span>
              <span className="font-semibold text-[#1D1D1F]">{stock.governance.leadership[0]?.name}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-black/[0.04]">
              <span className="text-[#86868B] text-[11px]">Stock-linked Comp</span>
              <span className="font-mono font-semibold text-[#34C759] tabular-nums">
                {stock.governance.compensation.stockBasedCompPct}%
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-black/[0.04]">
              <span className="text-[#86868B] text-[11px]">5Y Shareholder Return</span>
              <span className="font-mono font-semibold text-[#34C759] tabular-nums">
                {stock.governance.capitalAllocation.totalShareholderReturnPct}%
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-[#86868B] text-[11px]">Board Independence</span>
              <span className="font-mono font-semibold text-[#1D1D1F] tabular-nums">
                {stock.governance.boardIndependencePct}%
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
