import { Stock } from '../types/stock';
import { MOCK_STOCKS } from './mockData';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const stockApi = {
  // 전체 종목 목록 조회
  async getStocks(): Promise<Stock[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stocks`, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.info('BE API 서버 연결 전이거나 오프라인 상태이므로 내장 Mock 데이터를 사용합니다.', err);
      return MOCK_STOCKS;
    }
  },

  // 특정 종목 상세 조회
  async getStockDetail(tickerOrId: string): Promise<Stock | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stocks/${tickerOrId}`, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch {
      const found = MOCK_STOCKS.find(
        (s) => s.id.toLowerCase() === tickerOrId.toLowerCase() || s.ticker.toLowerCase() === tickerOrId.toLowerCase()
      );
      return found || MOCK_STOCKS[0];
    }
  }
};
