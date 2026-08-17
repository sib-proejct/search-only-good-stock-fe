import React from 'react';
import { Stock } from '../../types/stock';
import { ScoreBadge } from '../common/ScoreBadge';
import { Sparkline } from '../common/Sparkline';
import { ArrowUpRight, ShieldCheck } from 'lucide-react';

interface StockCardGridProps {
  stocks: Stock[];
  onSelectStock: (stockId: string) => void;
}

export const StockCardGrid: React.FC<StockCardGridProps> = ({ stocks, onSelectStock }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {stocks.map((stock) => {
        const isPricePositive = stock.priceChangePct >= 0;

        return (
          <div
            key={stock.id}
            onClick={() => onSelectStock(stock.id)}
            className="apple-card p-5 cursor-pointer flex flex-col justify-between group select-none relative"
          >
            {/* Card Header */}
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-semibold text-[#1D1D1F] text-xs group-hover:text-[#0071E3] transition-colors">
                      {stock.nameKo}
                    </h3>
                    <span className="font-mono text-[10px] text-[#86868B] bg-[#F5F5F7] px-1.5 py-0.2 rounded-full border border-black/[0.04] font-medium">
                      {stock.ticker}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#86868B] mt-0.5">{stock.sector}</p>
                </div>

                <ScoreBadge
                  score={stock.buffettScore}
                  isMasterPass={stock.isMasterPass}
                  passCount={stock.passCount}
                  totalRules={stock.totalRuleCount}
                  size="sm"
                />
              </div>

              {/* Price & Sparkline Bento Box */}
              <div className="bg-[#F5F5F7] rounded-2xl p-3 flex items-center justify-between mb-3.5 border border-black/[0.03]">
                <div>
                  <div className="font-mono font-bold text-[#1D1D1F] text-sm tabular-nums">
                    {stock.currency === 'USD' ? `$${stock.currentPrice.toFixed(2)}` : `${stock.currentPrice.toLocaleString()}원`}
                  </div>
                  <div className={`font-mono text-[11px] font-semibold tabular-nums ${isPricePositive ? 'text-[#34C759]' : 'text-[#FF3B30]'}`}>
                    {isPricePositive ? `+${stock.priceChangePct.toFixed(2)}%` : `${stock.priceChangePct.toFixed(2)}%`}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[9px] text-[#86868B] block mb-0.5 font-medium">5Y Price</span>
                  <Sparkline data={stock.sparkline5Yr} width={80} height={20} />
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs mb-3.5">
                <div className="bg-[#F5F5F7] p-2.5 rounded-xl border border-black/[0.02]">
                  <span className="text-[10px] text-[#86868B] block font-medium">5Y Avg ROE</span>
                  <span className="font-mono font-bold text-[#34C759] tabular-nums">{stock.avgRoe5Yr.toFixed(1)}%</span>
                </div>
                <div className="bg-[#F5F5F7] p-2.5 rounded-xl border border-black/[0.02]">
                  <span className="text-[10px] text-[#86868B] block font-medium">5Y EPS Growth</span>
                  <span className="font-mono font-bold text-[#34C759] tabular-nums">+{stock.epsCagr5Yr.toFixed(1)}%</span>
                </div>
                <div className="bg-[#F5F5F7] p-2.5 rounded-xl border border-black/[0.02]">
                  <span className="text-[10px] text-[#86868B] block font-medium">$1 Test Value</span>
                  <span className="font-mono font-bold text-[#34C759] tabular-nums">
                    ${stock.oneDollarTest.valueCreatedPerDollar.toFixed(2)}
                  </span>
                </div>
                <div className="bg-[#F5F5F7] p-2.5 rounded-xl border border-black/[0.02]">
                  <span className="text-[10px] text-[#86868B] block font-medium">Debt Ratio</span>
                  <span className="font-mono font-semibold text-[#1D1D1F] tabular-nums">{stock.debtToEquity.toFixed(1)}%</span>
                </div>
              </div>

              {/* Moat Tag */}
              <p className="text-[11px] text-[#86868B] line-clamp-2 leading-relaxed mb-3.5 font-normal">
                {stock.economicMoatSummary}
              </p>
            </div>

            {/* Card Footer */}
            <div className="pt-3 border-t border-black/[0.05] flex items-center justify-between text-xs">
              <span className="text-[10px] text-[#C93400] font-semibold flex items-center gap-1 bg-[#FF9500]/15 px-2.5 py-0.5 rounded-full">
                <ShieldCheck className="w-3 h-3 text-[#FF9500]" />
                {stock.governance.gradeLabel}
              </span>
              <button
                className="flex items-center gap-1 font-semibold text-[#0071E3] text-xs hover:underline"
              >
                <span>Details</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

          </div>
        );
      })}
    </div>
  );
};
