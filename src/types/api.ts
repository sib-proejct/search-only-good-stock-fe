import type { components, operations } from './openapi.generated';

type Schemas = components['schemas'];

export type Market = Schemas['Market'];
export type Currency = Schemas['Currency'];
export type IndustryType = Schemas['IndustryType'];
export type SourceType = Schemas['SourceType'];
export type InterestPaidClassification = Schemas['InterestPaidClassification'];
export type ThresholdOperator = Schemas['ThresholdOperator'];
export type MetricUnit = Schemas['MetricUnit'];
export type SpecialValue = Schemas['SpecialValue'];
export type RuleStatus = Schemas['RuleStatus'];
export type CapitalActionStatus = Schemas['CapitalActionStatus'];
export type ValuationStatus = Schemas['ValuationStatus'];
export type Confidence = Schemas['Confidence'];
export type CoreStatus = Schemas['CoreStatus'];
export type RuleDefinitionCategory = Schemas['RuleDefinitionCategory'];
export type Applicability = Schemas['Applicability'];
export type ReasonCode = Schemas['ReasonCode'];
export type StockSort = Schemas['StockSort'];
export type SortOrder = Schemas['SortOrder'];
export type HistoryYears = NonNullable<
  Schemas['RuleEvaluationDTO']['historyYears']
>;

export type RuleThresholdDTO = Schemas['RuleThresholdDTO'];
export type RuleDefinitionDTO = Schemas['RuleDefinitionDTO'];
export type RuleListResponse = Schemas['RuleListResponse'];
export type MetricValueDTO = Schemas['MetricValueDTO'];
export type RuleEvaluationDTO = Schemas['RuleEvaluationDTO'];
export type CapitalActionEvaluationDTO =
  Schemas['CapitalActionEvaluationDTO'];
export type DcfScenarioDTO = Schemas['DcfScenarioDTO'];
export type DcfScenariosDTO = Schemas['DcfScenariosDTO'];
export type DcfResultDTO = Schemas['DcfResultDTO'];
export type AnnualFinancialDTO = Schemas['AnnualFinancialInput'];
export type QuarterlyBookPriceDTO = Schemas['QuarterlyBookPriceInput'];
export type BenchmarkPointDTO = Schemas['BenchmarkPointInput'];
export type CurrentMarketDTO = Schemas['CurrentMarketInput'];
export type StockSummaryDTO = Schemas['StockSummaryDTO'];
export type StockListResponse = Schemas['StockListResponse'];
export type StockDetailDTO = Schemas['StockDetailDTO'];
export type ReadinessResponse = Schemas['ReadinessResponse'];

export type StockListQuery = NonNullable<
  operations['list_stocks_api_stocks_get']['parameters']['query']
>;
