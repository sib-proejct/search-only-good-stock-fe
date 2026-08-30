import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, X, Lightbulb, Calculator, Quote } from 'lucide-react';

export interface HelpPopoverContent {
  title: string;
  badge?: string;
  description: string;
  formula?: string;
  whyItMatters?: string;
  quote?: {
    text: string;
    author?: string;
  };
  tip?: string;
}

interface HelpPopoverProps {
  content: HelpPopoverContent;
  align?: 'left' | 'right' | 'center';
  side?: 'top' | 'bottom';
  iconSize?: number;
  className?: string;
}

export const HelpPopover: React.FC<HelpPopoverProps> = ({
  content,
  align = 'right',
  side = 'bottom',
  iconSize = 15,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Position styles based on align and side
  const getAlignClass = () => {
    if (align === 'left') return 'left-0';
    if (align === 'center') return 'left-1/2 -translate-x-1/2';
    return 'right-0';
  };

  const getSideClass = () => {
    if (side === 'top') return 'bottom-full mb-2';
    return 'top-full mt-2';
  };

  return (
    <div className={`relative inline-flex items-center ${className}`} ref={popoverRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        aria-label={content.title}
        aria-expanded={isOpen}
        className="p-1 rounded-full text-[#86868B] hover:text-[#0071E3] dark:hover:text-[#2997FF] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3]"
        title={content.title}
      >
        <HelpCircle style={{ width: iconSize, height: iconSize }} />
      </button>

      {isOpen && (
        <div
          className={`absolute ${getSideClass()} ${getAlignClass()} z-50 w-80 sm:w-[420px] max-w-[calc(100vw-24px)] max-h-[82vh] overflow-y-auto bg-white dark:bg-[#1C1C1E] rounded-3xl p-5 sm:p-6 shadow-2xl border border-black/[0.08] dark:border-white/[0.12] text-left animate-fade-in transition-all`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 pb-3 border-b border-black/[0.05] dark:border-white/[0.08]">
            <div className="space-y-1 min-w-0">
              {content.badge && (
                <span className="inline-block text-[11px] font-mono font-bold uppercase tracking-wider text-[#0071E3] dark:text-[#2997FF] bg-[#0071E3]/10 dark:bg-[#2997FF]/15 px-2.5 py-0.5 rounded-full">
                  {content.badge}
                </span>
              )}
              <h4 className="text-sm sm:text-base font-bold text-[#1D1D1F] dark:text-[#F5F5F7] leading-snug">
                {content.title}
              </h4>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors cursor-pointer shrink-0"
              aria-label="닫기"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="py-3.5 space-y-3.5 text-[13px] sm:text-sm leading-relaxed text-[#515154] dark:text-[#A1A1A6]">
            <p className="text-[#1D1D1F] dark:text-[#E5E5EA] leading-relaxed font-normal">
              {content.description}
            </p>

            {/* Why it matters / Warren Buffett insight */}
            {content.whyItMatters && (
              <div className="p-3.5 rounded-2xl bg-[#F5F5F7] dark:bg-[#252528] space-y-1.5 border border-black/[0.03] dark:border-white/[0.04]">
                <div className="flex items-center gap-1.5 font-bold text-xs sm:text-[13px] text-[#1D1D1F] dark:text-[#F5F5F7]">
                  <Lightbulb className="w-4 h-4 text-[#FF9500] shrink-0" />
                  <span>핵심 포인트 (Why It Matters)</span>
                </div>
                <p className="text-xs sm:text-[13px] text-[#6E6E73] dark:text-[#86868B] leading-relaxed">
                  {content.whyItMatters}
                </p>
              </div>
            )}

            {/* Formula / Calculation */}
            {content.formula && (
              <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.07] space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-xs sm:text-[13px] text-[#1D1D1F] dark:text-[#F5F5F7]">
                  <Calculator className="w-4 h-4 text-[#0071E3] dark:text-[#2997FF] shrink-0" />
                  <span>산출 공식 및 기준</span>
                </div>
                <p className="text-[11px] sm:text-xs font-mono text-[#6E6E73] dark:text-[#86868B] break-words leading-relaxed">
                  {content.formula}
                </p>
              </div>
            )}

            {/* Quote */}
            {content.quote && (
              <div className="p-3 rounded-2xl bg-[#0071E3]/5 dark:bg-[#2997FF]/10 border border-[#0071E3]/15 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[11px] text-[#0071E3] dark:text-[#2997FF]">
                  <Quote className="w-3.5 h-3.5 shrink-0" />
                  <span>{content.quote.author || 'Warren Buffett'}</span>
                </div>
                <p className="text-xs sm:text-[13px] italic text-[#1D1D1F] dark:text-[#F5F5F7] leading-relaxed">
                  {content.quote.text}
                </p>
              </div>
            )}

            {/* Tip */}
            {content.tip && (
              <div className="text-xs text-[#86868B] pt-1.5 border-t border-black/[0.04] dark:border-white/[0.06] flex items-start gap-1.5 leading-relaxed">
                <span className="shrink-0">💡</span>
                <span>{content.tip}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
