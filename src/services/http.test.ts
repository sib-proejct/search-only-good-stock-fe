import { afterEach, describe, expect, it, vi } from 'vitest';
import { accountRequest, apiFetch, AUTH_EXPIRED_EVENT } from './http';
import { stockApi } from './api';
import { safeNext } from '../pages/LoginPage';

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe('authenticated API requests', () => {
  it('sends cookies and a CSRF header for mutations while preserving JSON headers', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetch);
    await accountRequest('/favorites/NASDAQ-AAPL', { method: 'PUT', headers: { 'Content-Type': 'application/json' } });
    const init = fetch.mock.calls[0][1] as RequestInit;
    expect(init.credentials).toBe('include');
    expect(new Headers(init.headers).get('X-CSRF-Protection')).toBe('1');
    expect(new Headers(init.headers).get('Content-Type')).toBe('application/json');
  });
  it('announces expired sessions without treating network failures as logout', async () => {
    const target = new EventTarget();
    const listener = vi.fn();
    target.addEventListener(AUTH_EXPIRED_EVENT, listener);
    vi.stubGlobal('window', target);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 401 })));
    await apiFetch('/api/auth/me');
    expect(listener).toHaveBeenCalledTimes(1);
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    await expect(apiFetch('/api/auth/me')).rejects.toThrow('offline');
    expect(listener).toHaveBeenCalledTimes(1);
  });
  it('passes favorites filtering to the server along with pagination and market', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ items: [], total: 0, limit: 1, offset: 1 })));
    vi.stubGlobal('fetch', fetch);
    await stockApi.getStocks({ favoritesOnly: true, market: ['NASDAQ'], offset: 1, limit: 1 });
    const url = new URL(fetch.mock.calls[0][0], 'http://localhost');
    expect(url.searchParams.get('favoritesOnly')).toBe('true');
    expect(url.searchParams.get('offset')).toBe('1');
    expect(url.searchParams.get('market')).toBe('NASDAQ');
  });
  it('reports server errors and accepts empty logout responses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ detail: 'Too many login attempts' }), { status: 429 })));
    await expect(accountRequest('/auth/login', { method: 'POST' })).rejects.toThrow('Too many login attempts');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 204 })));
    await expect(accountRequest('/auth/logout', { method: 'POST' })).resolves.toBeUndefined();
  });
});

describe('login return path', () => {
  it('retains an internal stock or favorites path', () => {
    expect(safeNext('/stock/AAPL?market=NASDAQ')).toBe('/stock/AAPL?market=NASDAQ');
    expect(safeNext('/favorites')).toBe('/favorites');
  });
  it.each([null, 'https://evil.example', '//evil.example', '/\\evil.example', '/login?next=/login', '/\n/evil.example'])(
    'rejects unsafe or looping return path %s', value => expect(safeNext(value)).toBe('/')
  );
});
