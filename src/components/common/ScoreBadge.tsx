import React from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

interface ScoreBadgeProps {
  score: number;
  isMasterPass?: boolean;
  passCount?: number;
  totalRules?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const ScoreBadge: React.FC<ScoreBadgeProps> = ({
  score,
  isMasterPass = false,
  passCount = 6,
  totalRules = 6,
  size = 'md',
}) => {
  if (isMasterPass || score >= 95) {
    return (
      <div className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-[#34C759]/12 text-[#248A3D] border border-[#34C759]/25 select-none ${
        size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : size === 'lg' ? 'px-3.5 py-1.5 text-sm' : 'px-3 py-1 text-xs'
      }`}>
        <ShieldCheck className={`${size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} text-[#34C759]`} />
        <span className="font-mono tabular-nums font-bold">{score}</span>
        <span className="tracking-tight">Master Pass</span>
        <span className="text-[10px] text-[#248A3D]/80 font-mono tabular-nums">({passCount}/{totalRules})</span>
      </div>
    );
  }

  if (score >= 80) {
    return (
      <div className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-[#0071E3]/10 text-[#0071E3] border border-[#0071E3]/20 select-none ${
        size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : size === 'lg' ? 'px-3.5 py-1.5 text-sm' : 'px-3 py-1 text-xs'
      }`}>
        <CheckCircle2 className={`${size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} text-[#0071E3]`} />
        <span className="font-mono tabular-nums font-bold">{score}</span>
        <span className="tracking-tight">Candidate</span>
        <span className="text-[10px] text-[#0071E3]/80 font-mono tabular-nums">({passCount}/{totalRules})</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-[#EBEBED] text-[#6E6E73] border border-black/5 select-none ${
      size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : size === 'lg' ? 'px-3.5 py-1.5 text-sm' : 'px-3 py-1 text-xs'
    }`}>
      <AlertCircle className={`${size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} text-[#86868B]`} />
      <span className="font-mono tabular-nums font-medium">{score}</span>
      <span className="tracking-tight text-[#86868B]">Watchlist</span>
      <span className="text-[10px] text-[#A1A1A6] font-mono tabular-nums">({passCount}/{totalRules})</span>
    </div>
  );
};
