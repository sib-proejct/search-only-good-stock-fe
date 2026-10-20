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
  revision: number;
  pendingIds: Set<string>;
  reload: () => Promise<void>;
  reloadFavorites: () => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
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
  const [revision, setRevision] = useState(0);
  const [pendingIds, setPendingIds] = useState(new Set<string>());
  const generation = useRef(0);
  const favoritesRequest = useRef(0);
  const pendingRef = useRef(new Set<string>());

  const clear = useCallback(() => {
    generation.current += 1;
    setUser(null); setError(''); setFavoriteIds([]); setFavoritesError(''); setFavoritesLoading(false); setLoading(false);
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
  const reload = useCallback(async () => {
    const current = ++generation.current;
    setLoading(true); setError(''); setFavoriteIds([]);
    try {
      const response = await apiFetch(`${API_BASE_URL}/api/auth/me`);
      if (current !== generation.current) return;
      if (!response.ok) throw new Error('로그인 상태를 확인하지 못했습니다. / Could not verify login.');
      const next = await response.json() as User;
      if (current !== generation.current) return;
      setUser(next);
      await reloadFavorites().catch(() => {});
    } catch (err) {
      if (current === generation.current) { setUser(null); setError(err instanceof Error ? err.message : String(err)); }
    } finally { if (current === generation.current) setLoading(false); }
  }, [reloadFavorites]);
  useEffect(() => {
    window.addEventListener(AUTH_EXPIRED_EVENT, clear);
    void reload();
    return () => { generation.current += 1; window.removeEventListener(AUTH_EXPIRED_EVENT, clear); };
  }, [clear, reload]);
  const toggleFavorite = async (id: string) => {
    if (!user || pendingRef.current.has(id)) return;
    const current = generation.current;
    pendingRef.current.add(id); setPendingIds(new Set(pendingRef.current));
    try {
      await accountRequest(`/favorites/${encodeURIComponent(id)}`, { method: favoriteIds.includes(id) ? 'DELETE' : 'PUT' });
      if (current === generation.current) await reloadFavorites();
    } finally {
      if (current === generation.current) { pendingRef.current.delete(id); setPendingIds(new Set(pendingRef.current)); }
    }
  };
  const logout = async () => { await accountRequest('/auth/logout', { method: 'POST' }); clear(); };
  return <AccountContext.Provider value={{ user, loading, error, favoriteIds, favoritesLoading, favoritesError, revision, pendingIds, reload, reloadFavorites, toggleFavorite, logout }}>{children}</AccountContext.Provider>;
}

export function useAccount() {
  const value = useContext(AccountContext);
  if (!value) throw new Error('AccountProvider is required');
  return value;
}
