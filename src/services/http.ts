export const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
export const AUTH_EXPIRED_EVENT = 'sogs_auth_expired';

export async function apiFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  if (!['GET', 'HEAD', 'OPTIONS'].includes((init.method ?? 'GET').toUpperCase())) {
    headers.set('X-CSRF-Protection', '1');
  }
  const response = await fetch(url, { ...init, headers, credentials: 'include' });
  if (response.status === 401 && typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
  }
  return response;
}

export async function accountRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await apiFetch(`${API_BASE_URL}/api${path}`, init);
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(typeof body?.detail === 'string' ? body.detail : `HTTP ${response.status}`);
  }
  return response.status === 204 ? undefined as T : response.json();
}
