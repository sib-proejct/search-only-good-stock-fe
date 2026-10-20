import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Star } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppConfig } from '../../context/ThemeLanguageContext';
import { useAccount } from '../../context/AccountContext';

export function FavoriteButton({ stockId, name }: { stockId: string; name: string }) {
  const { language } = useAppConfig();
  const { user, loading, favoriteIds, favoritesLoading, favoritesError, pendingIds, toggleFavorite, reloadFavorites } = useAccount();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  // Optimistic state: shows the requested state until the server-confirmed favorites catch up.
  const [optimistic, setOptimistic] = useState<boolean | null>(null);
  const saved = favoriteIds.includes(stockId);
  const active = optimistic ?? saved;
  const ko = language === 'ko';
  const label = ko ? `${name} 즐겨찾기 ${active ? '해제' : '추가'}` : `${active ? 'Remove' : 'Add'} ${name} ${active ? 'from' : 'to'} favorites`;

  useEffect(() => { if (optimistic === saved) setOptimistic(null); }, [optimistic, saved]);
  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(''), 3000);
    return () => clearTimeout(timer);
  }, [error]);

  const click = async () => {
    setError('');
    if (!user) { navigate(`/login?next=${encodeURIComponent(location.pathname + location.search)}`); return; }
    try {
      if (favoritesError) await reloadFavorites();
      else { setOptimistic(!saved); await toggleFavorite(stockId); }
    } catch {
      setOptimistic(null);
      setError(ko ? '즐겨찾기를 저장하지 못했습니다. 다시 시도해 주세요.' : 'Could not save favorites. Please retry.');
    }
  };
  return <span className="inline-flex shrink-0">
    <button type="button" aria-label={label} aria-pressed={active} title={label}
      disabled={loading || favoritesLoading || pendingIds.has(stockId)}
      onClick={event => { event.stopPropagation(); void click(); }}
      className={`inline-flex items-center justify-center w-9 h-9 -my-2 rounded-full transition-colors disabled:cursor-wait focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0071E3] ${active ? 'text-[#D97706] dark:text-[#FFD60A]' : 'text-[#A1A1A6] group-hover:text-[#86868B] hover:!text-[#1D1D1F] dark:hover:!text-[#F5F5F7] hover:bg-black/5 dark:hover:bg-white/10'}`}>
      <Star aria-hidden="true" className="w-4 h-4" fill={active ? 'currentColor' : 'none'} />
    </button>
    {error && createPortal(<div role="alert" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] max-w-[calc(100vw-2rem)] rounded-full px-4 py-2.5 text-xs font-medium text-white bg-[#1D1D1F]/90 dark:bg-[#3A3A3C]/95 backdrop-blur-xl shadow-lg">{error}</div>, document.body)}
  </span>;
}
