import React, { useState } from 'react';
import { Layers, RotateCcw, Plus, ChevronDown, Check, SlidersHorizontal, Table, Grid } from 'lucide-react';
import { FilterRuleDefinition, RulePreset } from '../../types/rules';
import { ViewMode, SortField } from '../../hooks/useStocks';

interface HorizontalRibbonFilterProps {
  rules: FilterRuleDefinition[];
  presets: RulePreset[];
  activePresetId: string;
  onSelectPreset: (presetId: string) => void;
  onUpdateRule: (ruleId: string, value: number | boolean) => void;
  onReset: () => void;
  onOpenCustomRuleModal: () => void;
  viewMode: ViewMode;
  onToggleViewMode: (mode: ViewMode) => void;
  sortField: SortField;
  onSortChange: (field: SortField) => void;
  passedCount: number;
  totalCount: number;
}

export const HorizontalRibbonFilter: React.FC<HorizontalRibbonFilterProps> = ({
  rules,
  presets,
  activePresetId,
  onSelectPreset,
  onUpdateRule,
  onReset,
  onOpenCustomRuleModal,
  viewMode,
  onToggleViewMode,
  sortField,
  onSortChange,
  passedCount,
  totalCount,
}) => {
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const toggleDropdown = (id: string) => {
    setOpenDropdownId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="w-full apple-card p-5 space-y-4">
      
      {/* 1. Top Row: Strategy Presets & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-black/[0.05]">
        
        {/* Strategy Presets Segmented Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#86868B] uppercase tracking-wider mr-1">
            <Layers className="w-3.5 h-3.5 text-[#0071E3]" />
            <span>Presets</span>
          </div>

          <div className="flex flex-wrap items-center gap-1 bg-[#EBEBED] p-1 rounded-full border border-black/[0.03]">
            {presets.map((preset) => {
              const isActive = activePresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => onSelectPreset(preset.id)}
                  className={`px-3.5 py-1 rounded-full text-xs transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#0071E3] text-white shadow-apple-pill font-medium'
                      : 'text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-white/60 font-medium'
                  }`}
                  title={preset.description}
                >
                  {isActive && <Check className="w-3 h-3 stroke-[2.5]" />}
                  <span>{preset.name}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={onOpenCustomRuleModal}
            className="px-3.5 py-1 rounded-full text-xs font-medium bg-[#0071E3]/10 text-[#0071E3] hover:bg-[#0071E3]/15 transition-all flex items-center gap-1 border border-[#0071E3]/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Rule</span>
          </button>
        </div>

        {/* Right side: View Mode switch & Reset */}
        <div className="flex items-center gap-3">
          
          {/* Sorting Dropdown */}
          <div className="flex items-center gap-1.5 text-xs text-[#86868B]">
            <span>Sort:</span>
            <select
              value={sortField}
              onChange={(e) => onSortChange(e.target.value as SortField)}
              className="bg-[#F5F5F7] text-[#1D1D1F] text-xs font-medium px-3 py-1 rounded-full border border-black/[0.05] focus:outline-none focus:border-[#0071E3] cursor-pointer"
            >
              <option value="buffettScore">Buffett Score</option>
              <option value="avgRoe5Yr">5Y Avg ROE</option>
              <option value="epsCagr5Yr">5Y EPS Growth</option>
              <option value="oneDollar">$1 Test Efficiency</option>
              <option value="marketCap">Market Cap</option>
            </select>
          </div>

          {/* View Mode Toggle (Segmented Pill) */}
          <div className="flex items-center bg-[#EBEBED] rounded-full p-0.5 border border-black/[0.04]">
            <button
              onClick={() => onToggleViewMode('table')}
              className={`p-1.5 rounded-full text-xs transition-all ${
                viewMode === 'table' ? 'bg-white text-[#1D1D1F] shadow-apple-pill' : 'text-[#86868B] hover:text-[#1D1D1F]'
              }`}
              title="Table View"
            >
              <Table className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onToggleViewMode('grid')}
              className={`p-1.5 rounded-full text-xs transition-all ${
                viewMode === 'grid' ? 'bg-white text-[#1D1D1F] shadow-apple-pill' : 'text-[#86868B] hover:text-[#1D1D1F]'
              }`}
              title="Bento Grid View"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Reset Button */}
          <button
            onClick={onReset}
            className="px-3 py-1 text-xs text-[#86868B] hover:text-[#1D1D1F] bg-[#F5F5F7] hover:bg-[#EBEBED] rounded-full border border-black/[0.04] transition-all flex items-center gap-1 font-medium"
            title="Reset Filters"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* 2. Bottom Row: Rule Filter Pill Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 text-xs font-semibold text-[#86868B] uppercase tracking-wider mr-1">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#0071E3]" />
          <span>Rules</span>
        </div>

        {rules.map((rule) => {
          const isOpen = openDropdownId === rule.id;
          const isBoolean = rule.controlType === 'toggle';

          if (isBoolean) {
            const isChecked = rule.currentValue === true;
            return (
              <button
                key={rule.id}
                onClick={() => onUpdateRule(rule.id, !isChecked)}
                className={`px-3.5 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 border ${
                  isChecked
                    ? 'bg-[#34C759]/15 text-[#248A3D] border-[#34C759]/30 font-semibold'
                    : 'bg-[#F5F5F7] text-[#6E6E73] border-transparent hover:border-black/10'
                }`}
                title={rule.description}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border transition-all ${
                    isChecked
                      ? 'bg-[#34C759] border-[#34C759] text-white'
                      : 'border-[#D2D2D7] bg-white'
                  }`}
                >
                  {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </div>
                <span>{rule.name}</span>
              </button>
            );
          }

          // Slider Filter Dropdown Tag
          return (
            <div key={rule.id} className="relative">
              <button
                onClick={() => toggleDropdown(rule.id)}
                className={`px-3.5 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 border ${
                  isOpen
                    ? 'bg-[#0071E3]/15 text-[#0071E3] border-[#0071E3]/40 font-semibold'
                    : 'bg-[#F5F5F7] text-[#1D1D1F] border-transparent hover:border-black/10'
                }`}
              >
                <span>{rule.name}</span>
                <span className="font-semibold text-[#0071E3] font-mono tabular-nums text-[11px]">
                  {rule.comparator === 'gte' ? '≥ ' : '≤ '}
                  {rule.currentValue}
                  {rule.unit}
                </span>
                <ChevronDown className={`w-3 h-3 text-[#86868B] transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#0071E3]' : ''}`} />
              </button>

              {/* Apple Slider Popover Dropdown */}
              {isOpen && (
                <div className="absolute left-0 top-full mt-2 z-50 w-72 bg-white border border-black/[0.08] rounded-2xl p-4 shadow-apple-modal animate-fade-in">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-[#1D1D1F]">{rule.name} Threshold</span>
                    <span className="font-mono font-bold text-[#0071E3] bg-[#0071E3]/10 px-2 py-0.5 rounded-full tabular-nums text-xs">
                      {rule.comparator === 'gte' ? 'Min ' : 'Max '}
                      {rule.currentValue} {rule.unit}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#86868B] mb-3 leading-relaxed font-normal">
                    {rule.summary}
                  </p>

                  <input
                    type="range"
                    min={rule.min ?? 0}
                    max={rule.max ?? 100}
                    step={rule.step ?? 1}
                    value={(rule.currentValue as number) ?? rule.defaultValue}
                    onChange={(e) => onUpdateRule(rule.id, parseFloat(e.target.value))}
                    className="w-full accent-[#0071E3] cursor-pointer mb-2 h-1.5 bg-[#EBEBED] rounded-full appearance-none"
                  />

                  <div className="flex justify-between text-[10px] text-[#86868B] font-mono tabular-nums">
                    <span>{rule.min}{rule.unit}</span>
                    <span>Default: {rule.defaultValue}{rule.unit}</span>
                    <span>{rule.max}{rule.unit}</span>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-black/[0.05] flex justify-end">
                    <button
                      onClick={() => setOpenDropdownId(null)}
                      className="px-4 py-1 rounded-full text-xs font-semibold bg-[#0071E3] hover:bg-[#0077ED] text-white transition-all shadow-apple-pill"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Live Matched Count Pill */}
        <div className="ml-auto text-xs flex items-center gap-1.5 bg-[#34C759]/12 px-3.5 py-1 rounded-full text-[#248A3D] font-medium border border-[#34C759]/20">
          <div className="w-1.5 h-1.5 rounded-full bg-[#34C759]" />
          <span className="text-[11px]">Passed:</span>
          <span className="font-mono font-bold tabular-nums text-xs">{passedCount}</span>
          <span className="text-[#248A3D]/70 font-mono text-[11px]">/ {totalCount}</span>
        </div>
      </div>
    </div>
  );
};
