import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { EyeOff, Eye } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppConfig } from '../../context/ThemeLanguageContext';
import { useAccount } from '../../context/AccountContext';

export function HideStockButton({
  stockId,
  name,
  onToggled,
}: {
  stockId: string;
  name: string;
  onToggled?: (hidden: boolean) => void;
}) {
  const { language } = useAppConfig();
  const {
    user,
    loading,
    hiddenIds,
    hiddenLoading,
    hiddenError,
    pendingIds,
    toggleHidden,
    reloadHidden,
  } = useAccount();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [optimistic, setOptimistic] = useState<boolean | null>(null);
  const saved = hiddenIds.includes(stockId);
  const active = optimistic ?? saved;
  const ko = language === 'ko';
  const label = ko
    ? `${name} ${active ? '숨김 해제' : '종목 숨기기'}`
    : `${active ? 'Unhide' : 'Hide'} ${name}`;

  useEffect(() => {
    if (optimistic === saved) setOptimistic(null);
  }, [optimistic, saved]);

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(''), 3000);
    return () => clearTimeout(timer);
  }, [error]);

  const click = async () => {
    setError('');
    if (!user) {
      navigate(`/login?next=${encodeURIComponent(location.pathname + location.search)}`);
      return;
    }
    if (hiddenError) {
      try {
        await reloadHidden();
      } catch {
        setError(
          ko
            ? '숨김 상태를 저장하지 못했습니다. 다시 시도해 주세요.'
            : 'Could not update hidden state. Please retry.',
        );
      }
      return;
    }
    const nextState = !saved;
    setOptimistic(nextState);
    onToggled?.(nextState);
    try {
      await toggleHidden(stockId);
    } catch {
      setOptimistic(null);
      onToggled?.(!nextState);
      setError(
        ko
          ? '숨김 상태를 저장하지 못했습니다. 다시 시도해 주세요.'
          : 'Could not update hidden state. Please retry.',
      );
    }
  };

  return (
    <span className="inline-flex shrink-0">
      <button
        type="button"
        aria-label={label}
        aria-pressed={active}
        title={label}
        disabled={loading || hiddenLoading || pendingIds.has(stockId)}
        onClick={(event) => {
          event.stopPropagation();
          void click();
        }}
        className={`inline-flex items-center justify-center w-8 h-8 -my-1.5 -mx-1 rounded-full transition-colors disabled:cursor-wait focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0071E3] cursor-pointer ${
          active
            ? 'text-[#FF3B30] bg-[#FF3B30]/10 hover:bg-[#FF3B30]/20'
            : 'text-[#C7C7CC] dark:text-[#636366] group-hover:text-[#86868B] hover:!text-[#FF3B30] hover:bg-[#FF3B30]/10'
        }`}
      >
        {active ? (
          <Eye aria-hidden="true" className="w-3.5 h-3.5" />
        ) : (
          <EyeOff aria-hidden="true" className="w-3.5 h-3.5" />
        )}
      </button>
      {error &&
        createPortal(
          <div
            role="alert"
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] max-w-[calc(100vw-2rem)] rounded-full px-4 py-2.5 text-xs font-medium text-white bg-[#1D1D1F]/90 dark:bg-[#3A3A3C]/95 backdrop-blur-xl shadow-lg"
          >
            {error}
          </div>,
          document.body,
        )}
    </span>
  );
}

