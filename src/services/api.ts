import {
  RuleListResponse,
  StockDetailDTO,
  StockListQuery,
  StockListResponse,
} from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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
    const response = await fetch(`${API_BASE_URL}/api/rules`, {
      headers: { 'Content-Type': 'application/json' },
      signal,
    });

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
      if (query.search && query.search.trim() !== '') {
        params.set('search', query.search.trim());
      }
      if (query.market) {
        params.set('market', query.market);
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

    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      signal,
    });

    if (!response.ok) {
      throw new Error(await parseErrorMessage(response));
    }

    return response.json();
  },

  async getStockDetail(
    ticker: string,
    signal?: AbortSignal
  ): Promise<StockDetailDTO> {
    const trimmedTicker = ticker?.trim();
    if (!trimmedTicker) {
      throw new Error('Ticker is required');
    }

    const encodedTicker = encodeURIComponent(trimmedTicker);
    const response = await fetch(
      `${API_BASE_URL}/api/stocks/${encodedTicker}`,
      {
        headers: { 'Content-Type': 'application/json' },
        signal,
      }
    );

    if (!response.ok) {
      throw new Error(await parseErrorMessage(response));
    }

    return response.json();
  },
};
