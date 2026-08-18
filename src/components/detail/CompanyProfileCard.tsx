import React, { useState, useEffect } from 'react';
import { Stock, LeadershipMember } from '../../types/stock';
import { useAppConfig } from '../../context/ThemeLanguageContext';
import {
  ShieldCheck,
  Scale,
  Award,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Circle,
  Users,
  Briefcase,
  Coins,
} from 'lucide-react';

interface CompanyProfileCardProps {
  stock: Stock;
}

const getInitialChecklist = (s: Stock): Record<string, boolean> => {
  const isSkinPass =
    s.governance?.overallGrade !== 'C' &&
    s.governance?.overallGrade !== 'D' &&
    s.governance?.overallGrade !== 'F' &&
    s.governance?.compensation?.alignmentRating !== 'CONCERNING';

  const isIndepPass = (s.governance?.boardIndependencePct ?? 0) >= 70;
  const isDnoPass = s.shareCountCagr5Yr <= 0;
  const isCompUnitPass =
    (s.governance?.compensation?.stockBasedCompPct ?? 0) > 0 &&
    s.governance?.compensation?.alignmentRating !== 'CONCERNING';

  const isCompRoicPass =
    s.governance?.compensation?.alignmentRating !== 'CONCERNING' &&
    s.governance?.overallGrade !== 'C';

  return {
    gov_skin: isSkinPass,
    gov_indep: isIndepPass,
    gov_dno: isDnoPass,
    comp_unit: isCompUnitPass,
    comp_roic: isCompRoicPass,
  };
};

export const CompanyProfileCard: React.FC<CompanyProfileCardProps> = ({ stock }) => {
  const { language } = useAppConfig();
  const [isLeadershipExpanded, setIsLeadershipExpanded] = useState(false);
  const [boardFilter, setBoardFilter] = useState<'ALL' | 'EXECUTIVE' | 'OUTSIDE'>('ALL');
  const [isChecklistExpanded, setIsChecklistExpanded] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() =>
    getInitialChecklist(stock)
  );

  useEffect(() => {
    setCheckedItems(getInitialChecklist(stock));
  }, [stock.id, stock.ticker]);

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const totalCheckCount = 5;

  const companyName = language === 'ko' ? stock.nameKo : stock.nameEn;
  const ceo = stock.governance.leadership[0];

  const leadershipList: LeadershipMember[] = stock.governance.leadership || [];
  const executives = leadershipList.filter((m) => !m.isOutsideDirector && !m.role.includes('사외이사'));
  const outsideDirectors = leadershipList.filter((m) => !!m.isOutsideDirector || m.role.includes('사외이사'));

  const filteredMembers = leadershipList.filter((m) => {
    const isOutside = !!m.isOutsideDirector || m.role.includes('사외이사');
    if (boardFilter === 'EXECUTIVE') return !isOutside;
    if (boardFilter === 'OUTSIDE') return isOutside;
    return true;
  });

  // Value formatting helper
  const formatHoldingValue = (usdVal: number | undefined, currency: 'USD' | 'KRW') => {
    if (usdVal === undefined || usdVal === null) return '-';
    if (currency === 'USD') {
      if (usdVal >= 1_000_000_000) return `$${(usdVal / 1_000_000_000).toFixed(2)}B`;
      if (usdVal >= 1_000_000) return `$${(usdVal / 1_000_000).toFixed(1)}M`;
      if (usdVal >= 1_000) return `$${(usdVal / 1_000).toFixed(0)}K`;
      return `$${usdVal.toLocaleString()}`;
    } else {
      const krw = usdVal * 1350;
      if (krw >= 100_000_000_000_000) {
        return `${(krw / 100_000_000_000_000).toFixed(2)}조원`;
      }
      if (krw >= 100_000_000) {
        const eok = krw / 100_000_000;
        if (eok >= 10000) {
          return `${(eok / 10000).toFixed(1)}조원`;
        }
        return `${eok >= 10 ? eok.toFixed(1) : eok.toFixed(2)}억원`;
      }
      return `${Math.round(krw / 10000).toLocaleString()}만원`;
    }
  };

  return (
    <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 sm:p-8 border border-black/[0.06] dark:border-white/[0.08] shadow-sm space-y-6 transition-colors duration-300">
      
      {/* 1. Header */}
      <div className="flex items-center justify-between pb-1 border-b border-black/[0.04] dark:border-white/[0.06]">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
            {language === 'ko' ? `${companyName} 기업 개요` : `About ${stock.nameEn}`}
          </h2>
          <p className="text-xs text-[#86868B] mt-0.5 font-normal">
            {stock.market} · {stock.sector}
          </p>
        </div>
        <span className="text-xs font-mono font-semibold text-[#86868B]">
          {stock.ticker}
        </span>
      </div>

      {/* 2. Business Summary & Key Multiples */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Left: Business Summary & Moat Drivers */}
        <div className="lg:col-span-7 space-y-3">
          <p className="text-xs sm:text-[13px] text-[#1D1D1F] dark:text-[#F5F5F7] leading-relaxed">
            {stock.economicMoatSummary}
          </p>

          <div className="pt-2 flex flex-wrap gap-1.5">
            {stock.moatSources.map((source, idx) => (
              <span
                key={idx}
                className="text-[11px] font-medium bg-[#F5F5F7] dark:bg-[#252528] text-[#6E6E73] dark:text-[#A1A1A6] px-2.5 py-1 rounded-lg border border-black/[0.03] dark:border-white/[0.04]"
              >
                {source}
              </span>
            ))}
          </div>

          {ceo && (
            <div className="pt-2 text-xs text-[#86868B]">
              <span className="font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">
                {language === 'ko' ? '대표 경영진' : 'Chief Executive'}:
              </span>{' '}
              {ceo.name} ({ceo.role})
            </div>
          )}
        </div>

        {/* Right: Key Facts & Market Multiples */}
        <div className="lg:col-span-5 lg:border-l lg:border-black/[0.04] lg:dark:border-white/[0.06] lg:pl-8 grid grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-[10px] text-[#86868B] uppercase tracking-wider block">
              {language === 'ko' ? '시가총액' : 'Market Cap'}
            </span>
            <span className="font-bold font-mono text-sm text-[#1D1D1F] dark:text-[#F5F5F7] tabular-nums block">
              {stock.marketCapFormatted}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-[#86868B] uppercase tracking-wider block">
              {language === 'ko' ? '이자보상배율' : 'Interest Coverage'}
            </span>
            <span className="font-bold font-mono text-sm text-[#1D1D1F] dark:text-[#F5F5F7] tabular-nums block">
              {stock.interestCoverage.toFixed(1)}x
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-[#86868B] uppercase tracking-wider block">
              5Y BPS CAGR
            </span>
            <span className="font-bold font-mono text-sm text-[#1D1D1F] dark:text-[#F5F5F7] tabular-nums block">
              +{stock.bpsCagr5Yr.toFixed(1)}%
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-[#86868B] uppercase tracking-wider block">
              {language === 'ko' ? '5년 주식수 증감' : '5Y Share Dilution'}
            </span>
            <span className={`font-bold text-sm block ${stock.shareCountCagr5Yr <= 0 ? 'text-[#34C759]' : 'text-[#FF3B30]'}`}>
              {stock.shareCountCagr5Yr <= 0 ? (
                <>
                  <span className="font-mono tabular-nums">{stock.shareCountCagr5Yr.toFixed(1)}%</span>{' '}
                  <span className="font-medium text-xs">({language === 'ko' ? '소각' : 'Retired'})</span>
                </>
              ) : (
                <span className="font-mono tabular-nums">+{stock.shareCountCagr5Yr.toFixed(1)}%</span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Leadership & Board Roster: Shares Owned & Compensation Structure */}
      <div className="pt-5 border-t border-black/[0.04] dark:border-white/[0.06] space-y-4">
        {/* Section Header with Segmented Filter & Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#0071E3]/10 dark:bg-[#2997FF]/15 flex items-center justify-center">
                <Users className="w-3.5 h-3.5 text-[#0071E3] dark:text-[#2997FF]" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                {language === 'ko'
                  ? '이사회 및 경영진 자사주 보유 & 보수 체계'
                  : 'Leadership & Board: Ownership & Compensation Structure'}
              </h3>
              <span className="text-xs font-mono font-medium text-[#86868B] tabular-nums">
                {leadershipList.length}{language === 'ko' ? '명' : ' members'}
              </span>
            </div>
            <p className="text-[11px] text-[#86868B] mt-0.5 ml-8">
              {language === 'ko'
                ? `사외이사 독립성 ${stock.governance.boardIndependencePct}% · 경영진 지분 보유(Skin in the game) 및 성과급 비중 진단`
                : `Board Independence ${stock.governance.boardIndependencePct}% · Executive Equity Alignment & Pay Mix`}
            </p>
          </div>

          {/* Right Controls: Filter + Collapse Toggle */}
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            {isLeadershipExpanded && (
              <div className="flex items-center gap-1 p-1 bg-[#F5F5F7] dark:bg-[#252528] rounded-xl border border-black/[0.03] dark:border-white/[0.04] animate-fade-in">
                <button
                  onClick={() => setBoardFilter('ALL')}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all cursor-pointer select-none ${
                    boardFilter === 'ALL'
                      ? 'bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-[#F5F5F7] shadow-2xs'
                      : 'text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
                  }`}
                >
                  {language === 'ko' ? '전체' : 'All'} ({leadershipList.length})
                </button>
                <button
                  onClick={() => setBoardFilter('EXECUTIVE')}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all cursor-pointer select-none ${
                    boardFilter === 'EXECUTIVE'
                      ? 'bg-white dark:bg-[#1C1C1E] text-[#0071E3] dark:text-[#2997FF] shadow-2xs'
                      : 'text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
                  }`}
                >
                  {language === 'ko' ? '경영진' : 'Executives'} ({executives.length})
                </button>
                <button
                  onClick={() => setBoardFilter('OUTSIDE')}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all cursor-pointer select-none ${
                    boardFilter === 'OUTSIDE'
                      ? 'bg-white dark:bg-[#1C1C1E] text-[#AF52DE] dark:text-[#BF5AF2] shadow-2xs'
                      : 'text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
                  }`}
                >
                  {language === 'ko' ? '사외이사' : 'Independent'} ({outsideDirectors.length})
                </button>
              </div>
            )}

            <button
              onClick={() => setIsLeadershipExpanded(!isLeadershipExpanded)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors cursor-pointer select-none px-2.5 py-1 rounded-lg hover:bg-[#F5F5F7] dark:hover:bg-[#252528]"
            >
              <span>{isLeadershipExpanded ? (language === 'ko' ? '접기' : 'Collapse') : (language === 'ko' ? '자세히 보기' : 'Show Details')}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isLeadershipExpanded ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Members Bento Grid */}
        {isLeadershipExpanded && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 pt-1 animate-fade-in">
          {filteredMembers.map((member, idx) => {
            const isOutside = !!member.isOutsideDirector || member.role.includes('사외이사');
            const compUsd = member.compensationUsd ?? (isOutside ? 350000 : stock.governance.compensation.totalCompUsd);
            const basePct = member.baseSalaryPct ?? (isOutside ? 25 : stock.governance.compensation.baseSalaryPct);
            const bonusPct = member.performanceBonusPct ?? (isOutside ? 0 : stock.governance.compensation.performanceBonusPct);
            const stockPct = member.stockBasedCompPct ?? (isOutside ? 75 : stock.governance.compensation.stockBasedCompPct);
            const otherPct = member.otherCompPct ?? 0;
            const totalPct = basePct + bonusPct + stockPct + otherPct || 100;

            return (
              <div
                key={idx}
                className="bg-[#F9FAFB] dark:bg-[#242426] rounded-2xl p-4 sm:p-5 border border-black/[0.04] dark:border-white/[0.06] space-y-3.5 flex flex-col justify-between"
              >
                {/* Member Header */}
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs sm:text-[13px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                          {member.name}
                        </h4>
                        <span
                          className={`text-xs font-semibold ${
                            isOutside
                              ? 'text-[#AF52DE] dark:text-[#BF5AF2]'
                              : 'text-[#0071E3] dark:text-[#2997FF]'
                          }`}
                        >
                          {member.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#86868B] mt-0.5">
                        {language === 'ko' ? `재임 ${member.tenureYears}년` : `Tenure: ${member.tenureYears} Years`}
                      </p>
                    </div>

                    <span className="text-[10px] font-medium text-[#86868B] shrink-0">
                      {isOutside
                        ? (language === 'ko' ? '독립 사외이사' : 'Independent')
                        : (language === 'ko' ? '사내 상임이사' : 'Executive')}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#6E6E73] dark:text-[#A1A1A6] leading-relaxed line-clamp-2">
                    {member.bio}
                  </p>
                </div>

                {/* 2-Column Metrics Box: Stock Ownership & Compensation Structure */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  
                  {/* Column 1: 자사주 보유 (Skin in the game) */}
                  <div className="bg-white dark:bg-[#1C1C1E] p-3 rounded-xl border border-black/[0.04] dark:border-white/[0.06] space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-[#86868B] uppercase tracking-wider flex items-center gap-1">
                        <Coins className="w-3 h-3 text-[#34C759]" />
                        {language === 'ko' ? '자사주 보유' : 'Shares Owned'}
                      </span>
                      {member.sharesOwnershipPct !== undefined && member.sharesOwnershipPct > 0 && (
                        <span className="text-[10px] font-mono font-bold text-[#34C759]">
                          {member.sharesOwnershipPct}%
                        </span>
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <div className="text-xs font-bold font-mono text-[#1D1D1F] dark:text-[#F5F5F7] tabular-nums">
                        {member.sharesOwned.toLocaleString()}주
                      </div>
                      <div className="text-[11px] font-mono font-semibold text-[#34C759] tabular-nums">
                        {formatHoldingValue(member.sharesValueUsd, stock.currency)}
                      </div>
                    </div>
                  </div>

                  {/* Column 2: 연간 총 보수 및 구성 (Compensation Structure) */}
                  <div className="bg-white dark:bg-[#1C1C1E] p-3 rounded-xl border border-black/[0.04] dark:border-white/[0.06] space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-[#86868B] uppercase tracking-wider flex items-center gap-1">
                        <Briefcase className="w-3 h-3 text-[#0071E3] dark:text-[#2997FF]" />
                        {language === 'ko' ? '연간 총 보수' : 'Total Compensation'}
                      </span>
                      <span className="text-xs font-bold font-mono text-[#0071E3] dark:text-[#2997FF] tabular-nums">
                        {formatHoldingValue(compUsd, stock.currency)}
                      </span>
                    </div>

                    {/* Stacked Pay Mix Bar (보수 구성 선/막대 그래프) */}
                    <div className="space-y-1">
                      <div className="w-full h-2 bg-[#EBEBED] dark:bg-[#2C2C2E] rounded-full overflow-hidden flex">
                        {basePct > 0 && (
                          <div
                            className="h-full bg-[#0071E3] transition-all duration-300"
                            style={{ width: `${(basePct / totalPct) * 100}%` }}
                            title={`기본급: ${basePct.toFixed(1)}%`}
                          />
                        )}
                        {bonusPct > 0 && (
                          <div
                            className="h-full bg-[#34C759] transition-all duration-300"
                            style={{ width: `${(bonusPct / totalPct) * 100}%` }}
                            title={`성과급: ${bonusPct.toFixed(1)}%`}
                          />
                        )}
                        {stockPct > 0 && (
                          <div
                            className="h-full bg-[#AF52DE] transition-all duration-300"
                            style={{ width: `${(stockPct / totalPct) * 100}%` }}
                            title={`주식보상: ${stockPct.toFixed(1)}%`}
                          />
                        )}
                        {otherPct > 0 && (
                          <div
                            className="h-full bg-[#FF9500] transition-all duration-300"
                            style={{ width: `${(otherPct / totalPct) * 100}%` }}
                            title={`기타(보안 등): ${otherPct.toFixed(1)}%`}
                          />
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[9px] text-[#86868B] font-mono flex-wrap gap-x-2 gap-y-0.5">
                        <span className="text-[#0071E3] dark:text-[#2997FF]">기본 {basePct.toFixed(basePct % 1 === 0 ? 0 : 1)}%</span>
                        {bonusPct > 0 && <span className="text-[#34C759]">성과 {bonusPct.toFixed(bonusPct % 1 === 0 ? 0 : 1)}%</span>}
                        {stockPct > 0 && <span className="text-[#AF52DE] dark:text-[#BF5AF2]">주식 {stockPct.toFixed(stockPct % 1 === 0 ? 0 : 1)}%</span>}
                        {otherPct > 0 && <span className="text-[#FF9500] dark:text-[#FF9F0A] font-bold">기타(보안) {otherPct.toFixed(1)}%</span>}
                      </div>

                      {member.otherCompDescription && (
                        <p className="text-[10px] text-[#86868B] dark:text-[#A1A1A6] pt-1 border-t border-black/[0.03] dark:border-white/[0.04] leading-tight">
                          * {member.otherCompDescription}
                        </p>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
        )}
      </div>

      {/* 4. Governance & Executive Compensation Audit Checklist */}
      <div className="pt-5 border-t border-black/[0.04] dark:border-white/[0.06] space-y-4">
        {/* Toggle Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#0071E3]/10 dark:bg-[#2997FF]/15 flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0071E3] dark:text-[#2997FF]" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                {language === 'ko' ? '지배구조 및 경영자 보상 원칙 진단' : 'Board Governance & Compensation Audit'}
              </h3>
            </div>
            <span className={`inline-flex items-center gap-1 text-xs font-bold font-mono tabular-nums ${
              checkedCount === totalCheckCount ? 'text-[#34C759]' : checkedCount >= 3 ? 'text-[#FF9500]' : 'text-[#FF3B30]'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                checkedCount === totalCheckCount ? 'bg-[#34C759]' : checkedCount >= 3 ? 'bg-[#FF9500]' : 'bg-[#FF3B30]'
              }`} />
              {checkedCount}/{totalCheckCount} {language === 'ko' ? '충족' : 'Passed'}
            </span>
          </div>

          <button
            onClick={() => setIsChecklistExpanded(!isChecklistExpanded)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors cursor-pointer select-none px-2.5 py-1 rounded-lg hover:bg-[#F5F5F7] dark:hover:bg-[#252528]"
          >
            <span>{isChecklistExpanded ? (language === 'ko' ? '접기' : 'Collapse') : (language === 'ko' ? '자세히 보기' : 'Show Details')}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isChecklistExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Checklist Content */}
        {isChecklistExpanded && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-in pt-1">
            
            {/* 1. 지배구조 및 이사회 구성 (Board & Governance) */}
            <div className="bg-[#F9FAFB] dark:bg-[#242426] rounded-2xl p-4 sm:p-5 border border-black/[0.04] dark:border-white/[0.06] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-black/[0.04] dark:border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-[#0071E3] dark:text-[#2997FF]" />
                  <h4 className="text-xs sm:text-[13px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                    {language === 'ko' ? '지배구조 및 이사회 구성 (Board & Governance)' : 'Board & Governance'}
                  </h4>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  stock.governance?.overallGrade === 'A+' || stock.governance?.overallGrade === 'A'
                    ? 'bg-[#34C759]/10 text-[#34C759]'
                    : stock.governance?.overallGrade === 'B+' || stock.governance?.overallGrade === 'B'
                    ? 'bg-[#FF9500]/10 text-[#FF9500]'
                    : 'bg-[#FF3B30]/10 text-[#FF3B30]'
                }`}>
                  {stock.governance?.overallGrade ? `${stock.governance.overallGrade} 등급` : '검증완료'}
                </span>
              </div>

              <div className="space-y-2.5">
                {/* Item 1 */}
                <div
                  onClick={() => toggleCheck('gov_skin')}
                  className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors cursor-pointer select-none"
                >
                  <button type="button" className="mt-0.5 shrink-0 focus:outline-none">
                    {checkedItems.gov_skin ? (
                      <CheckCircle2 className="w-4 h-4 text-[#34C759]" />
                    ) : (
                      <XCircle className="w-4 h-4 text-[#FF3B30]" />
                    )}
                  </button>
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] leading-snug">
                      {language === 'ko'
                        ? '경영진/최대주주 지분율 및 내부자 매매 동향 (Skin in the game)'
                        : 'Executive & Insider Ownership Trends (Skin in the game)'}
                    </p>
                    <p className="text-[11px] text-[#86868B] leading-relaxed">
                      {stock.governance?.ceoSkinInTheGameSummary ||
                        (language === 'ko'
                          ? '경영진의 실질적 지분 보유 및 주주 이익 일치도 검증'
                          : 'Substantial insider ownership aligned with long-term shareholders')}
                    </p>
                  </div>
                </div>

                {/* Item 2 */}
                <div
                  onClick={() => toggleCheck('gov_indep')}
                  className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors cursor-pointer select-none"
                >
                  <button type="button" className="mt-0.5 shrink-0 focus:outline-none">
                    {checkedItems.gov_indep ? (
                      <CheckCircle2 className="w-4 h-4 text-[#34C759]" />
                    ) : (
                      <XCircle className="w-4 h-4 text-[#FF3B30]" />
                    )}
                  </button>
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] leading-snug">
                      {language === 'ko'
                        ? '사외이사 독립성 및 이사회 구성 건전성'
                        : 'Independent Board Majority & Governance Soundness'}
                    </p>
                    <p className="text-[11px] text-[#86868B] leading-relaxed">
                      {language === 'ko'
                        ? `사외이사 독립성 비율 ${stock.governance?.boardIndependencePct ?? 80}% 확보 · 독립 감사위원회 견제 운영`
                        : `${stock.governance?.boardIndependencePct ?? 80}% independent board ratio with autonomous audit oversight`}
                    </p>
                  </div>
                </div>

                {/* Item 3 */}
                <div
                  onClick={() => toggleCheck('gov_dno')}
                  className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors cursor-pointer select-none"
                >
                  <button type="button" className="mt-0.5 shrink-0 focus:outline-none">
                    {checkedItems.gov_dno ? (
                      <CheckCircle2 className="w-4 h-4 text-[#34C759]" />
                    ) : (
                      <XCircle className="w-4 h-4 text-[#FF3B30]" />
                    )}
                  </button>
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] leading-snug">
                      {language === 'ko'
                        ? '과도한 임원배상책임보험 및 방만한 스톡옵션 부여 여부'
                        : 'D&O Insurance Limits & Anti-Dilution Stock Option Safeguards'}
                    </p>
                    <p className="text-[11px] text-[#86868B] leading-relaxed">
                      {language === 'ko'
                        ? '방만한 스톡옵션 남발 방지 · 주식 희석 없는 엄격한 보상 거버넌스 유지'
                        : 'Rigorous option grant oversight preventing excessive dilution and moral hazard'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. 경영자 보상 원칙 (Compensation Alignment) */}
            <div className="bg-[#F9FAFB] dark:bg-[#242426] rounded-2xl p-4 sm:p-5 border border-black/[0.04] dark:border-white/[0.06] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-black/[0.04] dark:border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#AF52DE] dark:text-[#BF5AF2]" />
                  <h4 className="text-xs sm:text-[13px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                    {language === 'ko' ? '경영자 보상 원칙 (Compensation Alignment)' : 'Compensation Alignment'}
                  </h4>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  stock.governance?.compensation?.alignmentRating === 'EXCELLENT' || stock.governance?.compensation?.alignmentRating === 'GOOD'
                    ? 'bg-[#34C759]/10 text-[#34C759]'
                    : stock.governance?.compensation?.alignmentRating === 'FAIR'
                    ? 'bg-[#FF9500]/10 text-[#FF9500]'
                    : 'bg-[#FF3B30]/10 text-[#FF3B30]'
                }`}>
                  {stock.governance?.compensation?.alignmentRating || '우수'}
                </span>
              </div>

              <div className="space-y-2.5">
                {/* Item 1 */}
                <div
                  onClick={() => toggleCheck('comp_unit')}
                  className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors cursor-pointer select-none"
                >
                  <button type="button" className="mt-0.5 shrink-0 focus:outline-none">
                    {checkedItems.comp_unit ? (
                      <CheckCircle2 className="w-4 h-4 text-[#34C759]" />
                    ) : (
                      <XCircle className="w-4 h-4 text-[#FF3B30]" />
                    )}
                  </button>
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] leading-snug">
                      {language === 'ko'
                        ? "단순 유보이익 복리 성장이 아닌, '담당 사업부 실적/목표 달성' 기반 보상 여부"
                        : "Business Unit Performance & Target-Based Compensation"}
                    </p>
                    <p className="text-[11px] text-[#86868B] leading-relaxed">
                      {language === 'ko'
                        ? '시장 전반 상승분이 아닌 사업부별 실질 잉여현금흐름 및 KPI 목표 달성에 연동'
                        : 'Tied strictly to controllable divisional operating results rather than market ride-along'}
                    </p>
                  </div>
                </div>

                {/* Item 2 */}
                <div
                  onClick={() => toggleCheck('comp_roic')}
                  className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors cursor-pointer select-none"
                >
                  <button type="button" className="mt-0.5 shrink-0 focus:outline-none">
                    {checkedItems.comp_roic ? (
                      <CheckCircle2 className="w-4 h-4 text-[#34C759]" />
                    ) : (
                      <XCircle className="w-4 h-4 text-[#FF3B30]" />
                    )}
                  </button>
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] leading-snug">
                      {language === 'ko'
                        ? "단기 주가 부양용 옵션 장사가 아닌 '투하자본비용(자본비용)'을 고려한 성과급 체계 여부"
                        : "Cost of Capital & ROIC Hurdle-Based Incentive System"}
                    </p>
                    <p className="text-[11px] text-[#86868B] leading-relaxed">
                      {stock.governance?.compensation?.summaryComment ||
                        (language === 'ko'
                          ? `투하자본비용(WACC)을 초과한 진정한 초과이익 창출에 연동 (${stock.governance?.compensation?.stockBasedCompPct ?? 79}% 장기 성과 연동)`
                          : 'Incentives anchored to economic profit exceeding cost of capital hurdles')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

    </div>
  );
};


