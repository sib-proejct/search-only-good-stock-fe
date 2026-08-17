export interface RoeRoicDataPoint {
  year: string;
  roe: number;
  roic: number;
  industryAvgRoe?: number;
}

export interface OneDollarChartDataPoint {
  category: string;
  amount: number;
  formattedAmount: string;
}

export interface CapitalAllocationDataPoint {
  name: string;
  value: number;
  color: string;
}
