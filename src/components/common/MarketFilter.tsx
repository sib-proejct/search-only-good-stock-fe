import { useAppConfig } from '../../context/ThemeLanguageContext';
import type { Market } from '../../types/api';

export function MarketFilter({ markets, onChange }: {
  markets: Market[];
  onChange: (markets: Market[]) => void;
}) {
  const { t, language } = useAppConfig();
  const options: { id: Market | 'ALL'; label: string }[] = [
    { id: 'ALL', label: t('allMarkets') },
    { id: 'NASDAQ', label: 'NASDAQ' },
    { id: 'NYSE', label: 'NYSE' },
    { id: 'KOSPI', label: 'KOSPI' },
    { id: 'KOSDAQ', label: 'KOSDAQ' },
  ];
  return (
    <div role="group" aria-label={language === 'ko' ? '시장 선택' : 'Markets'} className="flex flex-wrap items-center gap-1 min-w-0 max-w-full rounded-2xl bg-[#F2F4F6] dark:bg-[#1C1C1E] p-1 border border-black/[0.04] dark:border-white/[0.06]">
      {options.map((option) => {
        const isActive = option.id === 'ALL' ? markets.length === 0 : markets.includes(option.id);
        return (
          <button
            type="button"
            key={option.id}
            aria-pressed={isActive}
            onClick={() => {
              const id = option.id;
              onChange(id === 'ALL' ? [] : markets.includes(id)
                ? markets.filter((value) => value !== id)
                : [...markets, id]);
            }}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-[13px] rounded-xl whitespace-nowrap transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] ${isActive
              ? 'bg-white dark:bg-[#2C2C2E] text-[#0071E3] dark:text-[#2997FF] font-bold shadow-sm'
              : 'text-[#6B7684] dark:text-[#A1A1A6] hover:bg-white/60 dark:hover:bg-[#2C2C2E] font-medium'}`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
