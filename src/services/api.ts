import { apiFetch } from './http';
import {
  BatchRunStatusDTO,
  Market,
  RuleListResponse,
  StockDetailDTO,
  StockListQuery,
  StockListResponse,
  StockMemoDTO,
} from '../types/api';

const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

async function parseErrorMessage(response: Response): Promise<string> {
  const errorBody = await response.json().catch(() => null);
  if (typeof errorBody?.detail === 'string' && errorBody.detail.trim() !== '') {
    return errorBody.detail;
  }
  if (Array.isArray(errorBody?.detail)) {
    const messages = errorBody.detail
      .map((item: { msg?: string }) => item?.msg || '')
      .filter(Boolean);
    if (messages.length > 0) {
      return messages.join(', ');
    }
  }
  return `HTTP error! status: ${response.status}`;
}

export const stockApi = {
  async getRules(signal?: AbortSignal): Promise<RuleListResponse> {
    const response = await apiFetch(`${API_BASE_URL}/api/rules`, { signal });

    if (!response.ok) {
      throw new Error(await parseErrorMessage(response));
    }

    return response.json();
  },

  async getStocks(
    query?: StockListQuery,
    signal?: AbortSignal
  ): Promise<StockListResponse> {
    const params = new URLSearchParams();

    if (query) {
      if (query.years) params.set('years', String(query.years));
      if (query.favoritesOnly) params.set('favoritesOnly', 'true');
      if (query.search && query.search.trim() !== '') {
        params.set('search', query.search.trim());
      }
      if (query.market) {
        query.market.forEach(value => params.append('market', value));
      }
      if (query.sector && query.sector.trim() !== '') {
        params.set('sector', query.sector.trim());
      }
      if (query.coreStatus) {
        params.set('coreStatus', query.coreStatus);
      }
      if (query.valuationStatus) {
        params.set('valuationStatus', query.valuationStatus);
      }
      if (query.sort) {
        params.set('sort', query.sort);
      }
      if (query.order) {
        params.set('order', query.order);
      }
      if (typeof query.limit === 'number') {
        params.set('limit', String(query.limit));
      }
      if (typeof query.offset === 'number') {
        params.set('offset', String(query.offset));
      }
    }

    const queryString = params.toString();
    const url = queryString
      ? `${API_BASE_URL}/api/stocks?${queryString}`
      : `${API_BASE_URL}/api/stocks`;

    const response = await apiFetch(url, { signal });

    if (!response.ok) {
      throw new Error(await parseErrorMessage(response));
    }

    return response.json();
  },

  async getStockDetail(
    ticker: string,
    signal?: AbortSignal,
    market?: Market
  ): Promise<StockDetailDTO> {
    const trimmedTicker = ticker?.trim();
    if (!trimmedTicker) {
      throw new Error('Ticker is required');
    }

    const encodedTicker = encodeURIComponent(trimmedTicker);
    const params = new URLSearchParams();
    if (market) {
      params.set('market', market);
    }
    const queryString = params.toString();
    const url = `${API_BASE_URL}/api/stocks/${encodedTicker}${
      queryString ? `?${queryString}` : ''
    }`;
    const response = await apiFetch(url, { signal });

    if (!response.ok) {
      throw new Error(await parseErrorMessage(response));
    }

    return response.json();
  },

  async triggerBatchRefresh(signal?: AbortSignal): Promise<BatchRunStatusDTO> {
    const response = await apiFetch(`${API_BASE_URL}/api/batch/refresh`, {
      method: 'POST',
      signal,
    });

    if (!response.ok) {
      throw new Error(await parseErrorMessage(response));
    }

    return response.json();
  },

  async cancelBatchRefresh(signal?: AbortSignal): Promise<BatchRunStatusDTO> {
    const response = await apiFetch(`${API_BASE_URL}/api/batch/cancel`, {
      method: 'POST',
      signal,
    });

    if (!response.ok) {
      throw new Error(await parseErrorMessage(response));
    }

    return response.json();
  },

  async getBatchStatus(signal?: AbortSignal): Promise<BatchRunStatusDTO> {
    const response = await apiFetch(`${API_BASE_URL}/api/batch/status`, {
      signal,
    });

    if (!response.ok) {
      throw new Error(await parseErrorMessage(response));
    }

    return response.json();
  },

  async getStockMemo(stockId: string, signal?: AbortSignal): Promise<StockMemoDTO> {
    const response = await apiFetch(`${API_BASE_URL}/api/stocks/${encodeURIComponent(stockId)}/memo`, { signal });

    if (!response.ok) {
      throw new Error(await parseErrorMessage(response));
    }

    return response.json();
  },

  async updateStockMemo(stockId: string, content: string, signal?: AbortSignal): Promise<StockMemoDTO> {
    const response = await apiFetch(`${API_BASE_URL}/api/stocks/${encodeURIComponent(stockId)}/memo`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
      signal,
    });

    if (!response.ok) {
      throw new Error(await parseErrorMessage(response));
    }

    return response.json();
  },

  async deleteStockMemo(stockId: string, signal?: AbortSignal): Promise<void> {
    const response = await apiFetch(`${API_BASE_URL}/api/stocks/${encodeURIComponent(stockId)}/memo`, {
      method: 'DELETE',
      signal,
    });

    if (!response.ok) {
      throw new Error(await parseErrorMessage(response));
    }
  },
};
