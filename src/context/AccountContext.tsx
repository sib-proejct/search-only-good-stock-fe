import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { components } from '../types/openapi.generated';
import { accountRequest, apiFetch, API_BASE_URL, AUTH_EXPIRED_EVENT } from '../services/http';

type User = components['schemas']['UserDTO'];
type Favorites = components['schemas']['FavoritesDTO'];
interface AccountState {
  user: User | null;
  loading: boolean;
  error: string;
  favoriteIds: string[];
  favoritesLoading: boolean;
  favoritesError: string;
  hiddenIds: string[];
  hiddenLoading: boolean;
  hiddenError: string;
  revision: number;
  pendingIds: Set<string>;
  reload: () => Promise<void>;
  reloadFavorites: () => Promise<void>;
  reloadHidden: () => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  toggleHidden: (id: string) => Promise<void>;
  bulkHideStocks: (ids: string[]) => Promise<void>;
  bulkUnhideStocks: (ids: string[]) => Promise<void>;
  logout: () => Promise<void>;
}
const AccountContext = createContext<AccountState | null>(null);

export function AccountProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [favoritesError, setFavoritesError] = useState('');
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const [hiddenLoading, setHiddenLoading] = useState(false);
  const [hiddenError, setHiddenError] = useState('');
  const [revision, setRevision] = useState(0);
  const [pendingIds, setPendingIds] = useState(new Set<string>());
  const generation = useRef(0);
  const favoritesRequest = useRef(0);
  const hiddenRequest = useRef(0);
  const pendingRef = useRef(new Set<string>());

  const clear = useCallback(() => {
    generation.current += 1;
    setUser(null); setError(''); setFavoriteIds([]); setFavoritesError(''); setFavoritesLoading(false);
    setHiddenIds([]); setHiddenError(''); setHiddenLoading(false); setLoading(false);
    pendingRef.current.clear(); setPendingIds(new Set());
  }, []);
  const reloadFavorites = useCallback(async () => {
    const current = generation.current;
    const requestId = ++favoritesRequest.current;
    setFavoritesLoading(true); setFavoritesError('');
    try {
      const favorites = await accountRequest<Favorites>('/favorites');
      if (current === generation.current && requestId === favoritesRequest.current) { setFavoriteIds(favorites.stockIds); setRevision(v => v + 1); }
    } catch (err) {
      if (current === generation.current && requestId === favoritesRequest.current) setFavoritesError(err instanceof Error ? err.message : String(err));
      throw err;
    } finally { if (current === generation.current && requestId === favoritesRequest.current) setFavoritesLoading(false); }
  }, []);
  const reloadHidden = useCallback(async () => {
    const current = generation.current;
    const requestId = ++hiddenRequest.current;
    setHiddenLoading(true); setHiddenError('');
    try {
      const hidden = await accountRequest<Favorites>('/hidden-stocks');
      if (current === generation.current && requestId === hiddenRequest.current) { setHiddenIds(hidden.stockIds); setRevision(v => v + 1); }
    } catch (err) {
      if (current === generation.current && requestId === hiddenRequest.current) setHiddenError(err instanceof Error ? err.message : String(err));
      throw err;
    } finally { if (current === generation.current && requestId === hiddenRequest.current) setHiddenLoading(false); }
  }, []);
  const reload = useCallback(async () => {
    const current = ++generation.current;
    setLoading(true); setError(''); setFavoriteIds([]); setHiddenIds([]);
    try {
      const response = await apiFetch(`${API_BASE_URL}/api/auth/me`);
      if (current !== generation.current) return;
      if (!response.ok) throw new Error('로그인 상태를 확인하지 못했습니다. / Could not verify login.');
      const next = await response.json() as User;
      if (current !== generation.current) return;
      setUser(next);
      await Promise.all([
        reloadFavorites().catch(() => {}),
        reloadHidden().catch(() => {}),
      ]);
    } catch (err) {
      if (current === generation.current) { setUser(null); setError(err instanceof Error ? err.message : String(err)); }
    } finally { if (current === generation.current) setLoading(false); }
  }, [reloadFavorites, reloadHidden]);
  useEffect(() => {
    window.addEventListener(AUTH_EXPIRED_EVENT, clear);
    void reload();
    return () => { generation.current += 1; window.removeEventListener(AUTH_EXPIRED_EVENT, clear); };
  }, [clear, reload]);
  const toggleFavorite = async (id: string) => {
    if (!user || pendingRef.current.has(id)) return;
    const current = generation.current;
    const wasHidden = hiddenIds.includes(id);
    pendingRef.current.add(id); setPendingIds(new Set(pendingRef.current));
    try {
      await accountRequest(`/favorites/${encodeURIComponent(id)}`, { method: favoriteIds.includes(id) ? 'DELETE' : 'PUT' });
      if (current === generation.current) {
        await reloadFavorites();
        if (wasHidden) await reloadHidden().catch(() => {});
      }
    } finally {
      if (current === generation.current) { pendingRef.current.delete(id); setPendingIds(new Set(pendingRef.current)); }
    }
  };
  const toggleHidden = async (id: string) => {
    if (!user || pendingRef.current.has(id)) return;
    const current = generation.current;
    const wasFavorite = favoriteIds.includes(id);
    pendingRef.current.add(id); setPendingIds(new Set(pendingRef.current));
    try {
      await accountRequest(`/hidden-stocks/${encodeURIComponent(id)}`, { method: hiddenIds.includes(id) ? 'DELETE' : 'PUT' });
      if (current === generation.current) {
        await reloadHidden();
        if (wasFavorite) await reloadFavorites().catch(() => {});
      }
    } finally {
      if (current === generation.current) { pendingRef.current.delete(id); setPendingIds(new Set(pendingRef.current)); }
    }
  };
  const bulkHideStocks = async (ids: string[]) => {
    if (!user || ids.length === 0) return;
    const current = generation.current;
    const hadFavorite = ids.some(id => favoriteIds.includes(id));
    await accountRequest('/hidden-stocks/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stockIds: ids }),
    });
    if (current === generation.current) {
      await reloadHidden();
      if (hadFavorite) await reloadFavorites().catch(() => {});
    }
  };
  const bulkUnhideStocks = async (ids: string[]) => {
    if (!user || ids.length === 0) return;
    const current = generation.current;
    await accountRequest('/hidden-stocks/bulk-unhide', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stockIds: ids }),
    });
    if (current === generation.current) {
      await reloadHidden();
    }
  };
  const logout = async () => { await accountRequest('/auth/logout', { method: 'POST' }); clear(); };
  return <AccountContext.Provider value={{ user, loading, error, favoriteIds, favoritesLoading, favoritesError, hiddenIds, hiddenLoading, hiddenError, revision, pendingIds, reload, reloadFavorites, reloadHidden, toggleFavorite, toggleHidden, bulkHideStocks, bulkUnhideStocks, logout }}>{children}</AccountContext.Provider>;
}

export function useAccount() {
  const value = useContext(AccountContext);
  if (!value) throw new Error('AccountProvider is required');
  return value;
}
