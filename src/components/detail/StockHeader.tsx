import React from 'react';
import { Stock } from '../../types/stock';
import { ScoreBadge } from '../common/ScoreBadge';
import { Bookmark, Scale, FileText, ArrowLeft, ShieldCheck } from 'lucide-react';

interface StockHeaderProps {
  stock: Stock;
  onBack: () => void;
}

export const StockHeader: React.FC<StockHeaderProps> = ({ stock, onBack }) => {
  const isPricePositive = stock.priceChangePct >= 0;

  return (
    <div className="w-full apple-card p-6 sm:p-8 space-y-6">
      
      {/* Back Button Pill */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[#86868B] hover:text-[#1D1D1F] transition-colors bg-[#F5F5F7] hover:bg-[#EBEBED] px-3.5 py-1.5 rounded-full border border-black/[0.04]"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Screener</span>
      </button>

      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        
        {/* Left: Stock Profile & Badges */}
        <div className="space-y-3.5">
          <div className="flex flex-wrap items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#1D1D1F] flex items-center justify-center font-mono font-bold text-white text-lg shadow-apple-pill">
              {stock.ticker.slice(0, 3)}
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-bold text-[#1D1D1F] tracking-tight">
                  {stock.nameKo}
                </h1>
                <span className="font-mono text-xs font-semibold text-[#86868B] bg-[#F5F5F7] px-2.5 py-0.5 rounded-full border border-black/[0.04]">
                  {stock.ticker} · {stock.market}
                </span>
              </div>
              <p className="text-xs text-[#86868B] font-normal font-sans mt-0.5">
                {stock.nameEn} · {stock.sector}
              </p>
            </div>
          </div>

          {/* Status Badges Row */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <ScoreBadge
              score={stock.buffettScore}
              isMasterPass={stock.isMasterPass}
              passCount={stock.passCount}
              totalRules={stock.totalRuleCount}
              size="md"
            />

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FF9500]/15 text-[#C93400] border border-[#FF9500]/20">
              <ShieldCheck className="w-3.5 h-3.5 text-[#FF9500]" />
              <span>Governance: {stock.governance.gradeLabel}</span>
            </div>

            <div className="px-3 py-1 rounded-full text-xs font-medium text-[#86868B] bg-[#F5F5F7] border border-black/[0.04]">
              Warren Buffett 6-Pillar Audited
            </div>
          </div>
        </div>

        {/* Right: Real-time Price & Market Cap & Actions */}
        <div className="flex flex-col lg:items-end gap-3 bg-[#F5F5F7] p-5 rounded-2xl border border-black/[0.04]">
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold font-mono text-[#1D1D1F] tabular-nums tracking-tight">
              {stock.currency === 'USD' ? `$${stock.currentPrice.toFixed(2)}` : `${stock.currentPrice.toLocaleString()}원`}
            </span>
            <span className={`text-xs font-bold font-mono tabular-nums px-2.5 py-0.5 rounded-full ${
              isPricePositive ? 'bg-[#34C759]/15 text-[#248A3D]' : 'bg-[#FF3B30]/15 text-[#FF3B30]'
            }`}>
              {isPricePositive ? `+${stock.priceChangePct.toFixed(2)}%` : `${stock.priceChangePct.toFixed(2)}%`}
            </span>
          </div>

          <div className="flex items-center gap-2.5 text-xs text-[#86868B] font-sans">
            <span>Market Cap:</span>
            <span className="font-mono font-bold text-[#1D1D1F] tabular-nums">{stock.marketCapFormatted}</span>
            <span className="text-[#D2D2D7]">|</span>
            <span>5Y BPS Growth:</span>
            <span className="font-mono font-bold text-[#34C759] tabular-nums">+{stock.bpsCagr5Yr}%</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button className="px-3 py-1.5 rounded-full text-xs font-medium bg-white hover:bg-[#EBEBED] text-[#1D1D1F] border border-black/[0.06] transition-all flex items-center gap-1.5 shadow-2xs">
              <Bookmark className="w-3.5 h-3.5 text-[#FF9500]" />
              <span>Watchlist</span>
            </button>
            <button className="px-3 py-1.5 rounded-full text-xs font-medium bg-white hover:bg-[#EBEBED] text-[#1D1D1F] border border-black/[0.06] transition-all flex items-center gap-1.5 shadow-2xs">
              <Scale className="w-3.5 h-3.5 text-[#0071E3]" />
              <span>Peer Compare</span>
            </button>
            <button className="px-3 py-1.5 rounded-full text-xs font-medium bg-white hover:bg-[#EBEBED] text-[#1D1D1F] border border-black/[0.06] transition-all flex items-center gap-1.5 shadow-2xs">
              <FileText className="w-3.5 h-3.5 text-[#34C759]" />
              <span>SEC Filings</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
