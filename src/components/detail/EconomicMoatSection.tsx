import React from 'react';
import { Stock } from '../../types/stock';
import { Shield, ExternalLink, Check, FileText, Info } from 'lucide-react';

interface EconomicMoatSectionProps {
  stock: Stock;
}

export const EconomicMoatSection: React.FC<EconomicMoatSectionProps> = ({ stock }) => {
  return (
    <div className="w-full apple-card p-6 sm:p-8 space-y-4">
      
      {/* Moat Summary */}
      <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-black/[0.05]">
        <div>
          <h3 className="text-base font-bold text-[#1D1D1F] flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-[#34C759]/15 text-[#34C759]">
              <Shield className="w-4 h-4" />
            </div>
            <span>Economic Moat & Pricing Power Analysis</span>
          </h3>
          <p className="text-xs text-[#86868B] mt-0.5 font-normal">
            Durable competitive advantage protecting returns on invested capital against competitors over 10+ years
          </p>
        </div>
      </div>

      <div className="bg-[#F5F5F7] p-5 rounded-2xl border border-black/[0.03] space-y-3">
        <p className="text-xs text-[#424245] leading-relaxed font-normal">
          {stock.economicMoatSummary}
        </p>

        {/* Moat Sources Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-semibold text-[#86868B]">Moat Pillars:</span>
          {stock.moatSources.map((source, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-white text-[#248A3D] border border-black/[0.05] shadow-2xs"
            >
              <Check className="w-3 h-3 text-[#34C759] stroke-[3]" />
              {source}
            </span>
          ))}
        </div>
      </div>

      {/* DART & SEC Filing Links Footer */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-[#86868B]">
        <div className="flex items-center gap-2">
          <FileText className="w-3.5 h-3.5 text-[#86868B]" />
          <span className="font-medium text-[#1D1D1F]">Primary Source Filings:</span>
          <a
            href={stock.market === 'KOSPI' || stock.market === 'KOSDAQ' ? 'https://dart.fss.or.kr' : 'https://www.sec.gov/edgar'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0071E3] hover:text-[#0077ED] font-semibold flex items-center gap-1 bg-[#0071E3]/10 px-3 py-1 rounded-full transition-colors"
          >
            <span>{stock.market === 'KOSPI' || stock.market === 'KOSDAQ' ? 'DART Filing System' : 'SEC EDGAR 10-K & Proxy'}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-[#A1A1A6]">
          <Info className="w-3.5 h-3.5" />
          <span>Verified against 5-year annual reports and audited financial statements.</span>
        </div>
      </div>

    </div>
  );
};
