import React from 'react';
import { OneDollarTestResult } from '../../types/stock';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { DollarSign, Check, X } from 'lucide-react';

interface OneDollarTestWidgetProps {
  testResult: OneDollarTestResult;
  ticker?: string;
}

export const OneDollarTestWidget: React.FC<OneDollarTestWidgetProps> = ({ testResult }) => {
  const chartData = [
    {
      name: 'Retained Earnings',
      amount: testResult.accumulatedRetainedEarnings,
      color: '#0071E3',
    },
    {
      name: 'Market Cap Created',
      amount: testResult.marketCapIncrease,
      color: '#34C759',
    },
  ];

  return (
    <div className="apple-card p-6 flex flex-col justify-between space-y-4">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-bold text-sm text-[#1D1D1F] flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-[#FF9500]/15 text-[#FF9500]">
                <DollarSign className="w-3.5 h-3.5" />
              </div>
              <span>$1 Retained Earnings Test</span>
            </h3>
            <p className="text-[11px] text-[#86868B] mt-0.5">
              "For every $1 of earnings retained, did the company create $1+ of market value?"
            </p>
          </div>

          <div className={`px-3 py-1 rounded-full text-xs font-semibold font-mono flex items-center gap-1.5 tabular-nums ${
            testResult.passed
              ? 'bg-[#34C759]/15 text-[#248A3D]'
              : 'bg-[#FF3B30]/15 text-[#FF3B30]'
          }`}>
            {testResult.passed ? <Check className="w-3 h-3 stroke-[3]" /> : <X className="w-3 h-3 stroke-[3]" />}
            <span>${testResult.valueCreatedPerDollar.toFixed(2)} Created ({testResult.passed ? 'PASS' : 'FAIL'})</span>
          </div>
        </div>

        {/* Metric comparison cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-[#F5F5F7] p-3.5 rounded-2xl border border-black/[0.03]">
            <span className="text-[10px] text-[#86868B] font-semibold uppercase tracking-wider block mb-0.5">5Y Retained Earnings</span>
            <span className="font-mono font-bold text-[#1D1D1F] text-sm tabular-nums">
              ${testResult.accumulatedRetainedEarnings.toLocaleString()}B
            </span>
          </div>
          <div className="bg-[#F5F5F7] p-3.5 rounded-2xl border border-black/[0.03]">
            <span className="text-[10px] text-[#86868B] font-semibold uppercase tracking-wider block mb-0.5">5Y Market Cap Gain</span>
            <span className="font-mono font-bold text-[#34C759] text-sm tabular-nums">
              +${testResult.marketCapIncrease.toLocaleString()}B
            </span>
          </div>
        </div>

        {/* Bar Chart comparing Retained vs Market Cap */}
        <div className="h-32 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F7" horizontal={false} />
              <XAxis type="number" stroke="#86868B" fontSize={10} tickFormatter={(v) => `$${v}B`} />
              <YAxis type="category" dataKey="name" stroke="#86868B" fontSize={11} width={130} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: 'rgba(0, 0, 0, 0.08)',
                  borderRadius: '1rem',
                  fontSize: '11px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
                  color: '#1D1D1F',
                }}
                formatter={(val: any) => [`$${val.toLocaleString()}B`, 'Amount']}
              />
              <Bar dataKey="amount" radius={[0, 9999, 9999, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <p className="text-[11px] text-[#6E6E73] leading-relaxed bg-[#F5F5F7] p-3 rounded-2xl border border-black/[0.03] font-normal">
        {testResult.evaluationComment}
      </p>
    </div>
  );
};
