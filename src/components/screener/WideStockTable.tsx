import React from 'react';
import { Stock } from '../../types/stock';
import { ScoreBadge } from '../common/ScoreBadge';
import { Sparkline } from '../common/Sparkline';
import { InlineStockExpansion } from './InlineStockExpansion';
import { ChevronDown, ChevronRight, ArrowUpRight, Check, X } from 'lucide-react';

interface WideStockTableProps {
  stocks: Stock[];
  expandedStockId: string | null;
  onToggleExpand: (stockId: string) => void;
  onSelectStock: (stockId: string) => void;
}

export const WideStockTable: React.FC<WideStockTableProps> = ({
  stocks,
  expandedStockId,
  onToggleExpand,
  onSelectStock,
}) => {
  if (stocks.length === 0) {
    return (
      <div className="w-full apple-card p-12 text-center">
        <p className="text-[#1D1D1F] font-semibold text-sm">No stocks matching your criteria.</p>
        <p className="text-xs text-[#86868B] mt-1.5">Try easing your filter sliders or reset presets.</p>
      </div>
    );
  }

  return (
    <div className="w-full apple-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          
          {/* Table Header */}
          <thead>
            <tr className="border-b border-black/[0.05] bg-[#F5F5F7]/60 text-[11px] font-semibold text-[#86868B] font-sans select-none">
              <th className="py-3.5 px-4 w-8 text-center"></th>
              <th className="py-3.5 px-4">Company / Ticker</th>
              <th className="py-3.5 px-4 text-right">Price</th>
              <th className="py-3.5 px-4 text-center">Buffett Score</th>
              <th className="py-3.5 px-4 text-right">5Y Avg ROE</th>
              <th className="py-3.5 px-4 text-right">5Y EPS Growth</th>
              <th className="py-3.5 px-4 text-right">$1 Test Value</th>
              <th className="py-3.5 px-4 text-right">Debt Ratio</th>
              <th className="py-3.5 px-4 text-center">5Y Trend</th>
              <th className="py-3.5 px-4 text-center">Action</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-black/[0.03] text-xs font-sans">
            {stocks.map((stock, idx) => {
              const isExpanded = expandedStockId === stock.id;
              const isPricePositive = stock.priceChangePct >= 0;

              return (
                <React.Fragment key={stock.id}>
                  <tr
                    className={`transition-colors duration-150 cursor-pointer group select-none ${
                      isExpanded
                        ? 'bg-[#0071E3]/[0.03] border-l-3 border-[#0071E3]'
                        : 'hover:bg-[#F5F5F7]/80'
                    }`}
                    onClick={() => onToggleExpand(stock.id)}
                  >
                    {/* Expand Chevron */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleExpand(stock.id);
                        }}
                        className="p-1 rounded-full text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#EBEBED] transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5 text-[#0071E3]" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </td>

                    {/* Rank & Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[#A1A1A6] text-xs font-medium w-4 text-center tabular-nums">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[#1D1D1F] group-hover:text-[#0071E3] transition-colors text-xs">
                              {stock.nameKo}
                            </span>
                            <span className="font-mono text-[10px] text-[#86868B] bg-[#F5F5F7] px-1.5 py-0.2 rounded-full border border-black/[0.04] font-medium">
                              {stock.ticker}
                            </span>
                          </div>
                          <span className="text-[10px] text-[#86868B] font-sans">{stock.sector}</span>
                        </div>
                      </div>
                    </td>

                    {/* Price & Change */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="font-mono font-semibold text-[#1D1D1F] text-xs tabular-nums">
                        {stock.currency === 'USD' ? `$${stock.currentPrice.toFixed(2)}` : `${stock.currentPrice.toLocaleString()}원`}
                      </div>
                      <div className={`font-mono text-[10px] font-semibold tabular-nums ${isPricePositive ? 'text-[#34C759]' : 'text-[#FF3B30]'}`}>
                        {isPricePositive ? `+${stock.priceChangePct.toFixed(2)}%` : `${stock.priceChangePct.toFixed(2)}%`}
                      </div>
                    </td>

                    {/* Buffett Score Badge */}
                    <td className="py-3.5 px-4 text-center">
                      <ScoreBadge
                        score={stock.buffettScore}
                        isMasterPass={stock.isMasterPass}
                        passCount={stock.passCount}
                        totalRules={stock.totalRuleCount}
                        size="sm"
                      />
                    </td>

                    {/* 5Y ROE */}
                    <td className="py-3.5 px-4 text-right">
                      <span className={`font-mono font-semibold tabular-nums ${stock.avgRoe5Yr >= 15 ? 'text-[#34C759]' : 'text-[#1D1D1F]'}`}>
                        {stock.avgRoe5Yr.toFixed(1)}%
                      </span>
                    </td>

                    {/* 5Y EPS CAGR */}
                    <td className="py-3.5 px-4 text-right">
                      <span className={`font-mono font-semibold tabular-nums ${stock.epsCagr5Yr >= 10 ? 'text-[#34C759]' : 'text-[#1D1D1F]'}`}>
                        +{stock.epsCagr5Yr.toFixed(1)}%
                      </span>
                    </td>

                    {/* 1$ Retained Earnings Test */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <span className={`font-mono font-semibold tabular-nums ${stock.oneDollarTest.passed ? 'text-[#34C759]' : 'text-[#FF3B30]'}`}>
                          ${stock.oneDollarTest.valueCreatedPerDollar.toFixed(2)}
                        </span>
                        {stock.oneDollarTest.passed ? (
                          <div className="w-3.5 h-3.5 rounded-full bg-[#34C759]/10 text-[#34C759] flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full bg-[#FF3B30]/10 text-[#FF3B30] flex items-center justify-center">
                            <X className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Debt Ratio */}
                    <td className="py-3.5 px-4 text-right">
                      <span className={`font-mono font-semibold tabular-nums ${stock.debtToEquity <= 80 ? 'text-[#34C759]' : 'text-[#FF9500]'}`}>
                        {stock.debtToEquity.toFixed(1)}%
                      </span>
                    </td>

                    {/* 5-Year Sparkline */}
                    <td className="py-3.5 px-4 text-center">
                      <Sparkline data={stock.sparkline5Yr} width={80} height={20} />
                    </td>

                    {/* Action Button */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectStock(stock.id);
                        }}
                        className="px-3 py-1 rounded-full text-xs font-medium bg-[#F5F5F7] hover:bg-[#0071E3] hover:text-white text-[#1D1D1F] transition-all border border-black/[0.04] flex items-center gap-1 mx-auto"
                      >
                        <span>Analyze</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>

                  {/* Inline Expanded Row */}
                  {isExpanded && (
                    <tr className="bg-[#F5F5F7]/40">
                      <td colSpan={10} className="px-6 py-4 border-t border-b border-black/[0.04]">
                        <InlineStockExpansion
                          stock={stock}
                          onNavigateDetail={onSelectStock}
                        />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
