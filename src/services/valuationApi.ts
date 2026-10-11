import type { components } from '../types/openapi.generated';
import type { Market } from '../types/api';

export type ValuationView = components['schemas']['ValuationView'];
export type ValuationConditions = components['schemas']['ValuationConditions-Input'];
export type PeriodValuation = components['schemas']['PeriodValuationDTO'];
const base = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

export async function valuationRequest(ticker: string, market?: Market, action?: 'preview' | 'apply', body?: { baseSnapshotId: number; conditions: ValuationConditions }, signal?: AbortSignal): Promise<ValuationView> {
  const query = market ? `?market=${encodeURIComponent(market)}` : '';
  const response = await fetch(`${base}/api/stocks/${encodeURIComponent(ticker)}/valuation${action ? `/${action}` : ''}${query}`, {
    method: action ? 'POST' : 'GET',
    ...(body ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {}), signal,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(typeof data.detail === 'string' ? data.detail : `HTTP ${response.status}`);
  return data;
}
