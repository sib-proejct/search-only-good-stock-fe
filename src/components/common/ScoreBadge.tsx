import React from 'react';

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
  const sizeClasses = {
    sm: 'text-[11px] gap-1.5',
    md: 'text-xs gap-1.5',
    lg: 'text-sm gap-2',
  }[size];

  if (isMasterPass || score >= 95) {
    return (
      <div className={`inline-flex items-center font-medium select-none ${sizeClasses}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-[#34C759] shrink-0" />
        <span className="font-mono tabular-nums font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">{score}</span>
        <span className="tracking-tight text-[#34C759] font-semibold">Master Pass</span>
        <span className="text-[10px] text-[#86868B] font-mono tabular-nums font-normal">({passCount}/{totalRules})</span>
      </div>
    );
  }

  if (score >= 80) {
    return (
      <div className={`inline-flex items-center font-medium select-none ${sizeClasses}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-[#0071E3] dark:bg-[#2997FF] shrink-0" />
        <span className="font-mono tabular-nums font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">{score}</span>
        <span className="tracking-tight text-[#0071E3] dark:text-[#2997FF] font-semibold">Candidate</span>
        <span className="text-[10px] text-[#86868B] font-mono tabular-nums font-normal">({passCount}/{totalRules})</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center font-medium select-none ${sizeClasses}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-[#86868B] shrink-0" />
      <span className="font-mono tabular-nums font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">{score}</span>
      <span className="tracking-tight text-[#86868B]">Watchlist</span>
      <span className="text-[10px] text-[#86868B] font-mono tabular-nums font-normal">({passCount}/{totalRules})</span>
    </div>
  );
};

