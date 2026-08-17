import React, { useState } from 'react';
import { FilterRuleDefinition, RuleCategory, FilterControlType } from '../../types/rules';
import { X, Plus, SlidersHorizontal } from 'lucide-react';

interface CustomRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRule: (rule: FilterRuleDefinition) => void;
}

export const CustomRuleModal: React.FC<CustomRuleModalProps> = ({
  isOpen,
  onClose,
  onAddRule,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<RuleCategory>('PROFITABILITY');
  const [summary, setSummary] = useState('');
  const [controlType, setControlType] = useState<FilterControlType>('slider');
  const [defaultValue, setDefaultValue] = useState<number>(15);
  const [unit, setUnit] = useState('%');
  const [comparator, setComparator] = useState<'gte' | 'lte' | 'eq'>('gte');
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(100);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newRule: FilterRuleDefinition = {
      id: `custom_${Date.now()}`,
      category,
      name,
      summary: summary || `${name} threshold evaluation`,
      description: summary,
      evaluationPeriod: '3-5 Year Rolling',
      controlType,
      defaultValue: controlType === 'toggle' ? true : defaultValue,
      currentValue: controlType === 'toggle' ? true : defaultValue,
      min,
      max,
      step: 1,
      unit,
      comparator,
      isCoreBuffettRule: false,
    };

    onAddRule(newRule);
    onClose();
    // Reset form
    setName('');
    setSummary('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-white border border-black/[0.08] rounded-3xl p-6 sm:p-8 shadow-apple-modal space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/[0.05] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-[#0071E3]/10 text-[#0071E3]">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-[#1D1D1F] text-base">Add Custom Screener Rule</h3>
              <p className="text-[11px] text-[#86868B]">Register your custom financial or governance metric to the screener.</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-[#86868B] hover:text-[#1D1D1F] rounded-full hover:bg-[#EBEBED] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          
          {/* Rule Name */}
          <div>
            <label className="block font-semibold text-[#1D1D1F] mb-1.5">Rule / Metric Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., 3Y Free Cash Flow Margin, Dividend Payout Cap..."
              className="w-full bg-[#F5F5F7] text-[#1D1D1F] px-4 py-2 rounded-xl border border-black/[0.04] focus:border-[#0071E3] focus:outline-none focus:bg-white transition-all"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block font-semibold text-[#1D1D1F] mb-1.5">Metric Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as RuleCategory)}
              className="w-full bg-[#F5F5F7] text-[#1D1D1F] px-4 py-2 rounded-xl border border-black/[0.04] focus:border-[#0071E3] focus:outline-none cursor-pointer"
            >
              <option value="PROFITABILITY">Profitability (ROE, ROIC, Operating Margin)</option>
              <option value="GROWTH">Growth (EPS/BPS CAGR, Revenue Growth)</option>
              <option value="SAFETY">Solvency & Safety (Debt-to-Equity, Interest Coverage)</option>
              <option value="SHAREHOLDER_VALUE">Shareholder Value ($1 Test, Buybacks)</option>
              <option value="GOVERNANCE">Management & Governance (Pay Alignment, Insider Ownership)</option>
            </select>
          </div>

          {/* Control Type & Comparator */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#1D1D1F] mb-1.5">Control Type</label>
              <select
                value={controlType}
                onChange={(e) => setControlType(e.target.value as FilterControlType)}
                className="w-full bg-[#F5F5F7] text-[#1D1D1F] px-4 py-2 rounded-xl border border-black/[0.04] focus:border-[#0071E3] focus:outline-none cursor-pointer"
              >
                <option value="slider">Slider (Numeric Range)</option>
                <option value="toggle">Toggle (Pass / Fail Condition)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#1D1D1F] mb-1.5">Condition Logic</label>
              <select
                value={comparator}
                onChange={(e) => setComparator(e.target.value as any)}
                className="w-full bg-[#F5F5F7] text-[#1D1D1F] px-4 py-2 rounded-xl border border-black/[0.04] focus:border-[#0071E3] focus:outline-none cursor-pointer"
              >
                <option value="gte">Greater Than or Equal (≥)</option>
                <option value="lte">Less Than or Equal (≤)</option>
                <option value="eq">Exact Match</option>
              </select>
            </div>
          </div>

          {/* Slider Min / Max / Default Value */}
          {controlType === 'slider' && (
            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="block font-semibold text-[#86868B] mb-1">Min</label>
                <input
                  type="number"
                  value={min}
                  onChange={(e) => setMin(parseFloat(e.target.value))}
                  className="w-full bg-[#F5F5F7] text-[#1D1D1F] px-3 py-1.5 rounded-lg border border-black/[0.04] focus:border-[#0071E3] focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#86868B] mb-1">Max</label>
                <input
                  type="number"
                  value={max}
                  onChange={(e) => setMax(parseFloat(e.target.value))}
                  className="w-full bg-[#F5F5F7] text-[#1D1D1F] px-3 py-1.5 rounded-lg border border-black/[0.04] focus:border-[#0071E3] focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#86868B] mb-1">Default</label>
                <input
                  type="number"
                  value={defaultValue}
                  onChange={(e) => setDefaultValue(parseFloat(e.target.value))}
                  className="w-full bg-[#F5F5F7] text-[#1D1D1F] px-3 py-1.5 rounded-lg border border-black/[0.04] focus:border-[#0071E3] focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#86868B] mb-1">Unit</label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="%, x, $"
                  className="w-full bg-[#F5F5F7] text-[#1D1D1F] px-3 py-1.5 rounded-lg border border-black/[0.04] focus:border-[#0071E3] focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Summary */}
          <div>
            <label className="block font-semibold text-[#1D1D1F] mb-1.5">Rule Summary / Formula</label>
            <textarea
              rows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Brief explanation of how this rule is calculated and evaluated."
              className="w-full bg-[#F5F5F7] text-[#1D1D1F] px-4 py-2 rounded-xl border border-black/[0.04] focus:border-[#0071E3] focus:outline-none focus:bg-white transition-all"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-black/[0.05] flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full font-semibold bg-[#F5F5F7] text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#EBEBED] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-full font-semibold bg-[#0071E3] hover:bg-[#0077ED] text-white shadow-apple-pill flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Rule</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
