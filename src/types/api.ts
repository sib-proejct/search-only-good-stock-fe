export type Market = 'NASDAQ' | 'NYSE' | 'KOSPI' | 'KOSDAQ';
export type Currency = 'USD' | 'KRW';
export type IndustryType = 'GENERAL' | 'FINANCIAL';
export type SourceType = 'FIXTURE';
export type InterestPaidClassification = 'CFO' | 'NON_CFO' | 'UNKNOWN';

export type ThresholdOperator = 'GTE' | 'LTE' | 'GT' | 'LT';
export type MetricUnit = 'RATIO' | 'MULTIPLE' | 'CURRENCY' | 'COUNT';
export type SpecialValue = 'INFINITY';

export type RuleStatus = 'PASS' | 'FAIL' | 'N/A';
export type CapitalActionStatus =
  | 'REVIEW_DILUTION'
  | 'STABLE'
  | 'REVIEW_BUYBACK_PRICE'
  | 'N/A';
export type ValuationStatus =
  | 'PASS_WITH_MARGIN'
  | 'WATCH'
  | 'NO_MARGIN'
  | 'N/A';
export type Confidence = 'HIGH' | 'MEDIUM' | 'LOW';
export type CoreStatus = 'PASS' | 'FAIL' | 'N/A';
export type RuleDefinitionCategory =
  | 'CORE'
  | 'AUXILIARY'
  | 'REVIEW'
  | 'VALUATION';
export type Applicability = 'ALL' | 'NON_FINANCIAL';

export type ReasonCode =
  | 'FINANCIAL_SECTOR'
  | 'MISSING_DATA'
  | 'INSUFFICIENT_HISTORY'
  | 'NON_POSITIVE_DENOMINATOR'
  | 'INVALID_TAX_RATE'
  | 'NON_POSITIVE_START_VALUE'
  | 'UNKNOWN_INTEREST_CLASSIFICATION'
  | 'PREREQUISITE_FAILED';

export type HistoryYears = 5 | 3 | 1;
export type StockSort = 'ticker' | 'currentPrice' | 'conservativeMarginOfSafety';
export type SortOrder = 'asc' | 'desc';

export interface RuleThresholdDTO {
  metricId: string;
  operator: ThresholdOperator;
  value: number;
  unit: MetricUnit;
}

export interface RuleDefinitionDTO {
  ruleId: string;
  name: string;
  category: RuleDefinitionCategory;
  defaultThresholds: RuleThresholdDTO[];
  applicability: Applicability;
  supportedHistoryYears: HistoryYears[];
}

export interface RuleListResponse {
  items: RuleDefinitionDTO[];
}

export interface MetricValueDTO {
  metricId: string;
  value: number | null;
  unit: MetricUnit;
  specialValue?: SpecialValue | null;
}

export interface RuleEvaluationDTO {
  ruleId: string;
  category: 'CORE' | 'AUXILIARY';
  status: RuleStatus;
  historyYears: HistoryYears | null;
  periodStart: string | null;
  periodEnd: string | null;
  metrics: MetricValueDTO[];
  reasonCodes: ReasonCode[];
  warnings: string[];
}

export interface CapitalActionEvaluationDTO {
  ruleId: 'capital_action_flag';
  category: 'REVIEW';
  status: CapitalActionStatus;
  historyYears: HistoryYears | null;
  periodStart: string | null;
  periodEnd: string | null;
  metrics: MetricValueDTO[];
  reasonCodes: ReasonCode[];
  warnings: string[];
}

export interface DcfScenarioDTO {
  growthRate: number;
  terminalGrowthRate: number;
  intrinsicValuePerShare: number;
}

export interface DcfScenariosDTO {
  conservative: DcfScenarioDTO;
  base: DcfScenarioDTO;
  optimistic: DcfScenarioDTO;
}

export interface DcfResultDTO {
  status: ValuationStatus;
  method: 'OWNER_EARNINGS_DCF';
  historyYears: HistoryYears | null;
  normalizedOwnerEarnings: number | null;
  normalizedOeps: number | null;
  rawGrowth: number | null;
  growthCap: number | null;
  baseGrowth: number | null;
  discountRate: number | null;
  scenarios: DcfScenariosDTO | null;
  currentPrice: number | null;
  conservativeMarginOfSafety: number | null;
  confidence: Confidence;
  reasonCodes: ReasonCode[];
  warnings: string[];
}

export interface AnnualFinancialDTO {
  fiscalYear: number;
  periodEnd: string;
  netIncomeCommon: number | null;
  ebit: number | null;
  preTaxIncome: number | null;
  incomeTaxExpense: number | null;
  commonEquity: number | null;
  interestBearingDebt: number | null;
  cashAndEquivalents: number | null;
  totalLiabilities: number | null;
  interestExpense: number | null;
  cfo: number | null;
  capex: number | null;
  interestPaid: number | null;
  interestPaidClassification: InterestPaidClassification;
  dilutedEps: number | null;
  dilutedShares: number | null;
}

export interface QuarterlyBookPriceDTO {
  fiscalYear: number;
  fiscalQuarter: number;
  periodEnd: string;
  adjustedClosePrice: number | null;
  bvps: number | null;
}

export interface BenchmarkPointDTO {
  periodEnd: string;
  indexValue: number | null;
}

export interface CurrentMarketDTO {
  asOf: string;
  currentPrice: number | null;
  marketCap: number | null;
  dilutedShares: number | null;
  riskFreeRate: number | null;
}

export interface StockSummaryDTO {
  id: string;
  ticker: string;
  name: string;
  market: Market;
  sector: string;
  currency: Currency;
  currentPrice: number | null;
  marketCap: number | null;
  coreStatus: CoreStatus;
  corePassCount: number;
  coreFailCount: number;
  coreNaCount: number;
  valuationStatus: ValuationStatus;
  conservativeIntrinsicValue: number | null;
  conservativeMarginOfSafety: number | null;
  confidence: Confidence;
  dataAsOf: string;
  sourceType: SourceType;
}

export interface StockListResponse {
  items: StockSummaryDTO[];
  total: number;
  limit: number;
  offset: number;
}

export interface StockDetailDTO extends StockSummaryDTO {
  industryType: IndustryType;
  sourceName: string;
  annualFinancials: AnnualFinancialDTO[];
  quarterlyBookPrices: QuarterlyBookPriceDTO[];
  benchmarkPoints: BenchmarkPointDTO[];
  currentMarket: CurrentMarketDTO;
  ruleEvaluations: RuleEvaluationDTO[];
  capitalAction: CapitalActionEvaluationDTO;
  dcf: DcfResultDTO;
  warnings: string[];
}

export interface StockListQuery {
  search?: string;
  market?: Market;
  sector?: string;
  coreStatus?: CoreStatus;
  valuationStatus?: ValuationStatus;
  sort?: StockSort;
  order?: SortOrder;
  limit?: number;
  offset?: number;
}
