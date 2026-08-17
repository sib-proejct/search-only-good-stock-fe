import React, { useState, useEffect } from 'react';
import { Stock } from '../types/stock';
import { stockApi } from '../services/api';
import { Buffett6RuleDiagnosis } from '../components/detail/Buffett6RuleDiagnosis';
import { DcfIntrinsicValueCard } from '../components/detail/DcfIntrinsicValueCard';
import { OneDollarRetainedCard } from '../components/detail/OneDollarRetainedCard';
import { CapitalAllocationCookCard } from '../components/detail/CapitalAllocationCookCard';

interface StockDetailPageProps {
  stockId: string;
  onBack: () => void;
}

export const StockDetailPage: React.FC<StockDetailPageProps> = ({ stockId }) => {
  const [stock, setStock] = useState<Stock | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await stockApi.getStockDetail(stockId);
      setStock(data);
      setLoading(false);
    }
    load();
  }, [stockId]);

  if (loading || !stock) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-20 text-center">
        <div className="inline-block w-8 h-8 border-2 border-[#0071E3] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-[#86868B] font-sans text-xs font-medium">
          Loading Intrinsic Value & Buffett Diagnosis...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-6 sm:py-10 space-y-4 sm:space-y-6 animate-fade-in">
      
      {/* 1. Top Bento Grid (8-col Diagnosis & 4-col DCF Valuation) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        <div className="lg:col-span-8">
          <Buffett6RuleDiagnosis stock={stock} />
        </div>
        <div className="lg:col-span-4">
          <DcfIntrinsicValueCard currentPrice={stock.currentPrice} />
        </div>
      </div>

      {/* 2. Bottom Bento Grid (6-col $1 Retained Test & 6-col Capital Allocation) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <OneDollarRetainedCard testResult={stock.oneDollarTest} />
        <CapitalAllocationCookCard governance={stock.governance} />
      </div>

    </div>
  );
};
