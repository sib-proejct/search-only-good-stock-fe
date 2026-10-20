import { useState } from 'react';
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
  const active = favoriteIds.includes(stockId);
  const ko = language === 'ko';
  const label = ko ? `${name} 즐겨찾기 ${active ? '해제' : '추가'}` : `${active ? 'Remove' : 'Add'} ${name} ${active ? 'from' : 'to'} favorites`;
  const click = async () => {
    setError('');
    if (!user) { navigate(`/login?next=${encodeURIComponent(location.pathname + location.search)}`); return; }
    try { if (favoritesError) await reloadFavorites(); else await toggleFavorite(stockId); }
    catch { setError(ko ? '즐겨찾기를 저장하지 못했습니다. 다시 시도해 주세요.' : 'Could not save favorites. Please retry.'); }
  };
  return <span className="inline-flex items-center gap-1 shrink-0">
    <button type="button" aria-label={label} aria-pressed={active} title={label}
      disabled={loading || favoritesLoading || pendingIds.has(stockId)}
      onClick={event => { event.stopPropagation(); void click(); }}
      className={`inline-flex items-center justify-center w-9 h-9 rounded-full transition-colors disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0071E3] ${active ? 'text-[#C07800] dark:text-[#FFD60A] bg-[#FFCC00]/10' : 'text-[#86868B] hover:bg-black/5 dark:hover:bg-white/10'}`}>
      <Star aria-hidden="true" className="w-4 h-4" fill={active ? 'currentColor' : 'none'} />
    </button>
    {error && <span role="alert" className="text-[11px] text-[#FF3B30] whitespace-normal max-w-36">{error}</span>}
  </span>;
}
