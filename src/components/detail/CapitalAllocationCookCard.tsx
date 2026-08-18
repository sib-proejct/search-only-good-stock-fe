import React, { useState } from 'react';
import { ManagementGovernance } from '../../types/stock';
import { useAppConfig } from '../../context/ThemeLanguageContext';

interface CapitalAllocationCookCardProps {
  governance?: ManagementGovernance;
}

type AllocationType = 'buybacks' | 'dividends' | 'reinvestment';

export const CapitalAllocationCookCard: React.FC<CapitalAllocationCookCardProps> = ({
  governance,
}) => {
  const { t, language } = useAppConfig();
  const [activeSegment, setActiveSegment] = useState<AllocationType>('buybacks');

  const buybacksPct = governance ? governance.capitalAllocation.shareBuybacksPct : 78;
  const dividendsPct = governance ? governance.capitalAllocation.dividendsPct : 14;
  const reinvestmentPct = governance ? governance.capitalAllocation.reinvestmentPct : 8;
  const totalReturnPct = governance ? governance.capitalAllocation.totalShareholderReturnPct : 92;

  // Segments metadata
  const segments = [
    {
      id: 'buybacks' as AllocationType,
      label: t('shareRepurchases'),
      shortLabel: t('buybacks'),
      pct: buybacksPct,
      color: '#0071E3',
      darkColor: '#2997FF',
      subText: language === 'ko' ? '주당 가치 상승을 위한 자사주 매입 및 영구 소각' : 'Share buybacks and permanent cancellation to boost EPS',
    },
    {
      id: 'dividends' as AllocationType,
      label: t('dividendsPaid'),
      shortLabel: language === 'ko' ? '현금 배당' : 'Dividends',
      pct: dividendsPct,
      color: '#34C759',
      darkColor: '#30D158',
      subText: language === 'ko' ? '주주에게 분기별로 현금 직접 환원' : 'Direct quarterly cash returns to shareholders',
    },
    {
      id: 'reinvestment' as AllocationType,
      label: language === 'ko' ? 'R&D 및 사업 재투자' : 'R&D & Reinvestment',
      shortLabel: language === 'ko' ? '재투자' : 'Reinvest',
      pct: reinvestmentPct,
      color: '#AF52DE',
      darkColor: '#BF5AF2',
      subText: language === 'ko' ? '차세대 기술 및 공급망 혁신을 위한 내부 유보' : 'Retained capital for next-gen innovation & CAPEX',
    },
  ];

  const currentSegment = segments.find((s) => s.id === activeSegment) || segments[0];

  // SVG Multi-segment Donut calculations
  const radius = 46;
  const circumference = 2 * Math.PI * radius;

  // Compute strokeDasharray and offset for each segment
  const buybacksLen = (buybacksPct / 100) * circumference;
  const dividendsLen = (dividendsPct / 100) * circumference;
  const reinvestmentLen = (reinvestmentPct / 100) * circumference;

  const buybacksOffset = 0;
  const dividendsOffset = -buybacksLen;
  const reinvestmentOffset = -(buybacksLen + dividendsLen);

  return (
    <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex flex-col justify-between h-full space-y-4 transition-colors duration-300 overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-black/[0.04] dark:border-white/[0.06]">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
            {t('capitalAllocationTitle')}
          </h2>
          <p className="text-xs text-[#86868B] mt-0.5 font-normal">
            5-Year Shareholder Yield & Reinvestment
          </p>
        </div>
        <div className="text-right shrink-0 ml-3">
          <span className="text-sm font-mono font-bold text-[#0071E3] dark:text-[#2997FF] tabular-nums">
            {totalReturnPct}%
          </span>
          <span className="text-[10px] text-[#86868B] block font-medium uppercase tracking-wider">
            Total Return
          </span>
        </div>
      </div>

      {/* Main Interactive Donut Chart & Breakdown */}
      <div className="flex flex-col xl:flex-row items-center gap-4 py-0.5 min-w-0">

        {/* Sleek Interactive SVG Donut Chart */}
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            {/* Background Track */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              className="stroke-[#EBEBED] dark:stroke-[#2C2C2E]"
              strokeWidth="11"
              fill="transparent"
            />

            {/* Segment 1: Buybacks */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              className="cursor-pointer transition-all duration-500 ease-out"
              stroke={activeSegment === 'buybacks' ? '#0071E3' : '#0071E3'}
              strokeWidth={activeSegment === 'buybacks' ? '15' : '10'}
              strokeDasharray={`${buybacksLen} ${circumference - buybacksLen}`}
              strokeDashoffset={buybacksOffset}
              opacity={activeSegment === 'buybacks' ? 1 : 0.4}
              fill="transparent"
              onClick={() => setActiveSegment('buybacks')}
            />

            {/* Segment 2: Dividends */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              className="cursor-pointer transition-all duration-500 ease-out"
              stroke="#34C759"
              strokeWidth={activeSegment === 'dividends' ? '15' : '10'}
              strokeDasharray={`${dividendsLen} ${circumference - dividendsLen}`}
              strokeDashoffset={dividendsOffset}
              opacity={activeSegment === 'dividends' ? 1 : 0.4}
              fill="transparent"
              onClick={() => setActiveSegment('dividends')}
            />

            {/* Segment 3: Reinvestment */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              className="cursor-pointer transition-all duration-500 ease-out"
              stroke="#AF52DE"
              strokeWidth={activeSegment === 'reinvestment' ? '15' : '10'}
              strokeDasharray={`${reinvestmentLen} ${circumference - reinvestmentLen}`}
              strokeDashoffset={reinvestmentOffset}
              opacity={activeSegment === 'reinvestment' ? 1 : 0.4}
              fill="transparent"
              onClick={() => setActiveSegment('reinvestment')}
            />
          </svg>

          {/* Center Dynamic Stat on Active Segment */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none transition-all duration-300">
            <span
              className="text-xl sm:text-2xl font-bold font-mono tabular-nums tracking-tight"
              style={{ color: currentSegment.color }}
            >
              {currentSegment.pct}%
            </span>
            <span className="text-[10px] text-[#86868B] font-medium tracking-tight mt-0.5">
              {currentSegment.shortLabel}
            </span>
          </div>
        </div>

        {/* Clickable Legend & Breakdown Buttons */}
        <div className="flex-1 min-w-0 w-full space-y-1.5">
          {segments.map((seg) => {
            const isActive = activeSegment === seg.id;
            return (
              <button
                key={seg.id}
                onClick={() => setActiveSegment(seg.id)}
                className={`w-full text-left p-2 sm:p-2.5 rounded-xl transition-all cursor-pointer select-none flex items-center justify-between border min-w-0 ${isActive
                    ? 'bg-[#F5F5F7] dark:bg-[#252528] border-black/[0.08] dark:border-white/[0.12] shadow-2xs'
                    : 'bg-transparent border-transparent hover:bg-[#F5F5F7]/50 dark:hover:bg-[#252528]/40'
                  }`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 transition-transform duration-300"
                    style={{
                      backgroundColor: seg.color,
                      transform: isActive ? 'scale(1.25)' : 'scale(1)',
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className={`text-xs font-semibold truncate ${isActive ? 'text-[#1D1D1F] dark:text-[#F5F5F7]' : 'text-[#6E6E73] dark:text-[#86868B]'}`}>
                      {seg.label}
                    </div>
                    {isActive && (
                      <div className="text-[10px] text-[#86868B] truncate mt-0.5 font-normal">
                        {seg.subText}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`font-mono text-xs tabular-nums ${isActive ? 'font-bold' : 'font-medium text-[#86868B]'}`} style={{ color: isActive ? seg.color : undefined }}>
                    {seg.pct}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>

      </div>

    </div>
  );
};
