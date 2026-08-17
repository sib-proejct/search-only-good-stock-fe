import React from 'react';
import { Stock } from '../../types/stock';
import { Check, X, TrendingUp, DollarSign, ShieldAlert, Award, ArrowUpRight, Percent } from 'lucide-react';

interface BuffettRuleGridProps {
  stock: Stock;
}

export const BuffettRuleGrid: React.FC<BuffettRuleGridProps> = ({ stock }) => {
  const cards = [
    {
      title: '1. ROE / ROIC Persistence',
      purpose: 'Sustained high returns on deployed capital',
      passCondition: '5Y Avg ROE ≥ 15% & ROIC ≥ 10%',
      actualDisplay: `ROE ${stock.avgRoe5Yr.toFixed(1)}% / ROIC ${stock.avgRoic5Yr.toFixed(1)}%`,
      passed: stock.avgRoe5Yr >= 15 && stock.avgRoic5Yr >= 10,
      icon: TrendingUp,
      comment: stock.ruleEvaluations.find(r => r.ruleId === 'roe_5yr')?.comment || 'Consistently outstanding return on capital'
    },
    {
      title: '2. Compounding Per-Share Growth',
      purpose: 'Long-term compounding rate of EPS and BPS',
      passCondition: '5Y EPS CAGR ≥ 10% & BPS CAGR ≥ 10%',
      actualDisplay: `EPS CAGR +${stock.epsCagr5Yr.toFixed(1)}%`,
      passed: stock.epsCagr5Yr >= 10,
      icon: Percent,
      comment: stock.ruleEvaluations.find(r => r.ruleId === 'eps_cagr_5yr')?.comment || 'Predictable, steady earnings compounding'
    },
    {
      title: '3. $1 Retained Earnings Test',
      purpose: 'Conversion efficiency of retained earnings to market value',
      passCondition: '5Y Market Cap Gain / Retained Earnings ≥ $1.00',
      actualDisplay: `$${stock.oneDollarTest.valueCreatedPerDollar.toFixed(2)} Created per $1`,
      passed: stock.oneDollarTest.passed,
      icon: DollarSign,
      comment: stock.oneDollarTest.evaluationComment
    },
    {
      title: '4. Conservative Debt & Solvency',
      purpose: 'Anti-fragility and low leverage in downturns',
      passCondition: 'Debt/Equity ≤ 80% & Interest Coverage ≥ 5.0x',
      actualDisplay: `Debt Ratio ${stock.debtToEquity.toFixed(1)}% (Cov ${stock.interestCoverage.toFixed(1)}x)`,
      passed: stock.debtToEquity <= 150 && stock.interestCoverage >= 5.0,
      icon: ShieldAlert,
      comment: stock.ruleEvaluations.find(r => r.ruleId === 'debt_to_equity')?.comment || 'Fortress balance sheet with ample liquidity'
    },
    {
      title: '5. Shareholder Anti-Dilution',
      purpose: 'Prevention of share dilution through disciplined buybacks',
      passCondition: '5Y Share Count CAGR ≤ 0% (Buybacks favored)',
      actualDisplay: `Shares CAGR ${stock.shareCountCagr5Yr.toFixed(1)}%`,
      passed: stock.shareCountCagr5Yr <= 0,
      icon: Award,
      comment: stock.ruleEvaluations.find(r => r.ruleId === 'share_dilution')?.comment || 'Zero dilution with active share retirements'
    },
    {
      title: '6. Benchmark Outperformance',
      purpose: 'BPS compounding rate exceeding market index benchmark',
      passCondition: `BPS CAGR (${stock.bpsCagr5Yr}%) > Index (${stock.benchmarkBpsCagr5Yr}%)`,
      actualDisplay: `Alpha +${(stock.bpsCagr5Yr - stock.benchmarkBpsCagr5Yr).toFixed(1)}%p`,
      passed: stock.bpsCagr5Yr >= stock.benchmarkBpsCagr5Yr,
      icon: ArrowUpRight,
      comment: `Compounding at ${(stock.bpsCagr5Yr / stock.benchmarkBpsCagr5Yr).toFixed(1)}x the broader market benchmark`
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#1D1D1F] flex items-center gap-2.5">
          <span>Warren Buffett 6-Pillar Audit</span>
          <span className="text-xs px-3 py-0.5 rounded-full bg-[#34C759]/15 text-[#248A3D] font-bold">
            <span className="font-mono tabular-nums">{stock.passCount} / {stock.totalRuleCount}</span> Passed
          </span>
        </h2>
        <span className="text-xs text-[#86868B] font-normal hidden sm:inline">
          Owner-Related Business Principles
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`apple-card p-5 space-y-3 ${
                card.passed
                  ? 'border-black/[0.05]'
                  : 'border-[#FF3B30]/20 bg-[#FFF5F5]/30'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl ${card.passed ? 'bg-[#34C759]/12 text-[#34C759]' : 'bg-[#FF3B30]/12 text-[#FF3B30]'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#1D1D1F]">{card.title}</h3>
                    <p className="text-[10px] text-[#86868B]">{card.purpose}</p>
                  </div>
                </div>

                <div className="shrink-0">
                  {card.passed ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#248A3D] bg-[#34C759]/15 px-2.5 py-0.5 rounded-full">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                      PASS
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#D70015] bg-[#FF3B30]/15 px-2.5 py-0.5 rounded-full">
                      <X className="w-2.5 h-2.5 stroke-[3]" />
                      FAIL
                    </span>
                  )}
                </div>
              </div>

              {/* Main Metric Value */}
              <div className="bg-[#F5F5F7] p-3 rounded-xl border border-black/[0.02]">
                <div className="text-[10px] text-[#86868B] font-semibold uppercase tracking-wider mb-0.5">Verified Metric</div>
                <div className={`text-base font-bold font-mono tabular-nums ${card.passed ? 'text-[#1D1D1F]' : 'text-[#FF3B30]'}`}>
                  {card.actualDisplay}
                </div>
                <div className="text-[11px] text-[#86868B] mt-0.5 font-normal">
                  Standard: {card.passCondition}
                </div>
              </div>

              {/* Evaluation Comment */}
              <p className="text-[11px] text-[#6E6E73] leading-relaxed font-normal">
                {card.comment}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
