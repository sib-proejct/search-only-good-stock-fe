import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { YearlyFinancialMetric } from '../../types/stock';
import { TrendingUp } from 'lucide-react';

interface FinancialTrendChartProps {
  yearlyData: YearlyFinancialMetric[];
}

export const FinancialTrendChart: React.FC<FinancialTrendChartProps> = ({ yearlyData }) => {
  const chartData = yearlyData.map((d) => ({
    year: `${d.year}`,
    roe: d.roe,
    roic: d.roic,
    operatingMargin: d.operatingMargin,
  }));

  return (
    <div className="apple-card p-6 flex flex-col justify-between space-y-4">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-bold text-sm text-[#1D1D1F] flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-[#0071E3]/15 text-[#0071E3]">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
              <span>5-Year Profitability Trajectory (ROE vs ROIC)</span>
            </h3>
            <p className="text-[11px] text-[#86868B] mt-0.5">
              Long-term durability of Return on Equity (ROE) vs Return on Invested Capital (ROIC)
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono tabular-nums">
            <span className="flex items-center gap-1.5 text-[#248A3D] font-semibold bg-[#34C759]/15 px-2.5 py-0.5 rounded-full text-[11px]">
              <span className="w-2 h-2 rounded-full bg-[#34C759]" />
              ROE (≥15%)
            </span>
            <span className="flex items-center gap-1.5 text-[#0071E3] font-semibold bg-[#0071E3]/15 px-2.5 py-0.5 rounded-full text-[11px]">
              <span className="w-2 h-2 rounded-full bg-[#0071E3]" />
              ROIC (≥10%)
            </span>
          </div>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F7" vertical={false} />
              <XAxis
                dataKey="year"
                stroke="#86868B"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: 'rgba(0, 0, 0, 0.06)' }}
              />
              <YAxis
                stroke="#86868B"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: 'rgba(0, 0, 0, 0.06)' }}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: 'rgba(0, 0, 0, 0.08)',
                  borderRadius: '1rem',
                  fontSize: '11px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
                  color: '#1D1D1F',
                }}
                formatter={(value: any, name: any) => {
                  const label = name === 'roe' ? 'ROE (Return on Equity)' : name === 'roic' ? 'ROIC (Return on Invested Capital)' : 'Operating Margin';
                  return [`${value}%`, label];
                }}
              />
              <Line
                type="monotone"
                dataKey="roe"
                name="roe"
                stroke="#34C759"
                strokeWidth={2.5}
                dot={{ r: 3.5, fill: '#34C759', strokeWidth: 1.5, stroke: '#FFFFFF' }}
                activeDot={{ r: 5, fill: '#34C759' }}
              />
              <Line
                type="monotone"
                dataKey="roic"
                name="roic"
                stroke="#0071E3"
                strokeWidth={2.5}
                dot={{ r: 3.5, fill: '#0071E3', strokeWidth: 1.5, stroke: '#FFFFFF' }}
                activeDot={{ r: 5, fill: '#0071E3' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="pt-3 border-t border-black/[0.05] flex items-center justify-between text-xs text-[#86868B]">
        <span className="text-[11px]">Buffett Standard: ROE ≥ 15% & ROIC ≥ 10% maintained consecutively for 5+ years</span>
        <span className="font-mono text-[#248A3D] font-semibold tabular-nums bg-[#34C759]/15 px-2.5 py-0.5 rounded-full text-[11px]">
          5Y Consecutive Pass
        </span>
      </div>
    </div>
  );
};
