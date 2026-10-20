import { apiFetch } from './http';
import type { components } from '../types/openapi.generated';
import type { ValuationConditions } from './valuationApi';
import { normalizeScientificNotation, parseNumeric } from '../utils/numberFormatters';

export type AdminStock = components['schemas']['AdminStock'];
export type EditorTable = components['schemas']['EditorTable'];
export type EditorField = components['schemas']['EditorField'];
export type ValuationOptions = components['schemas']['ValuationRequest-Input'];
export type ValuationResult = components['schemas']['ValuationResponse'];
export type AdminValuationCalculation = ValuationResult & {
  earningsPowerFailures: Array<{
    fiscalYear: number;
    ebit: number;
    netIncome: number;
  }>;
};
export type TableName = EditorTable['table'];
export type FactRow =
  | components['schemas']['AnnualFactDataRead']
  | components['schemas']['ShareFactDataRead']
  | components['schemas']['DilutiveFactDataRead']
  | components['schemas']['MarketFactDataRead'];
export type FieldValue = string | number | boolean | null;
export type Draft = Record<string, FieldValue>;
const base = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

export async function adminRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await apiFetch(`${base}/api/admin${path}`, init);
  const body = await response.json();
  if (!response.ok) {
    const detail = body.detail;
    throw new Error(
      typeof detail === 'string'
        ? detail
        : Array.isArray(detail)
          ? detail.map((item: { msg: string }) => item.msg).join(', ')
          : '요청에 실패했습니다.',
    );
  }
  return body as T;
}

export async function calculateAdminValuation(
  stockId: number,
  options: ValuationOptions,
): Promise<AdminValuationCalculation> {
  const requestOptions = { ...options, publish: true };
  // Fetch annual evidence independently of the currently selected editor table.
  const facts = await adminRequest<components['schemas']['AnnualFactDataRead'][]>(
    `/facts/annual_financial_fact?stock_id=${stockId}`,
  );
  const result = await adminRequest<ValuationResult>(`/stocks/${stockId}/valuation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestOptions),
  });
  const earningsPowerFailures: AdminValuationCalculation['earningsPowerFailures'] = [];
  if (result.dcf?.reasonCodes.includes('PREREQUISITE_FAILED')) {
    const { as_of: cutoff, statement_scope: scope } = result.options;
    const includedYears = new Set(result.annual_oe.map((row) => row.fiscal_year));
    const byYear = new Map(facts
      .filter((row) => row.statement_scope === scope
        && row.period_end <= cutoff
        && (row.filed_at == null || row.filed_at <= cutoff)
        && includedYears.has(row.fiscal_year))
      .map((row) => [row.fiscal_year, row]));
    const latestYear = Math.max(...includedYears);
    const years = [latestYear - 2, latestYear - 1, latestYear];
    // The earnings rule requires three consecutive fiscal years and both values.
    if (years.every((year) => byYear.has(year))) {
      for (const fiscalYear of years) {
        const row = byYear.get(fiscalYear)!;
        const ebit = parseNumeric(row.ebit);
        const netIncome = parseNumeric(row.net_income_common);
        if (ebit !== null && netIncome !== null && (ebit <= 0 || netIncome <= 0)) {
          earningsPowerFailures.push({ fiscalYear, ebit, netIncome });
        }
      }
    }
  }
  // Store parsed evidence with this response so later editor changes cannot alter it.
  return { ...result, earningsPowerFailures };
}

export function fieldDisplay(
  name: string,
  value: FieldValue | undefined,
): string {
  if (value == null) return '';
  if (name === 'ten_year_bond_yield') {
    return normalizeScientificNotation(Number(value) * 100);
  }
  return normalizeScientificNotation(value);
}

export function fieldValue(field: EditorField, value: string): FieldValue {
  if (value === '') return null;
  if (field.kind === 'boolean') return value === 'true';
  if (['stock_id', 'fiscal_year'].includes(field.name)) return Number(value);
  if (field.name === 'ten_year_bond_yield') return String(Number(value) / 100);
  return value;
}

export function changedValues(draft: Draft, original: Draft): Draft {
  return Object.fromEntries(
    Object.entries(draft).filter(
      ([key, value]) => value !== (original[key] ?? null),
    ),
  );
}

export interface BulkRecalculateRequest {
  conditions?: ValuationConditions;
  apply?: boolean;
}

export interface BulkRecalculateItem {
  ticker: string;
  name: string;
  market: string;
  changed: boolean;
  status: string;
  intrinsicValuePerShare: string | number | null;
  conservativeMarginOfSafety: string | number | null;
  epsGrowth: string | number | null;
  oepsGrowth: string | number | null;
  periodStatus?: Record<string, string> | null;
  error?: string | null;
}

export interface BulkRecalculateResponse {
  totalStocks: number;
  recalculatedCount: number;
  appliedCount: number;
  skippedCount?: number;
  failedCount: number;
  conditions: ValuationConditions;
  items: BulkRecalculateItem[];
}

export async function bulkRecalculateValuation(
  payload: BulkRecalculateRequest,
  signal?: AbortSignal,
): Promise<BulkRecalculateResponse> {
  return adminRequest<BulkRecalculateResponse>('/valuation/recalculate-all', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  });
}

export interface BulkFillMaintenanceCapexRequest {
  overwrite_existing?: boolean;
}

export interface BulkFillMaintenanceCapexResponse {
  total_rows_checked: number;
  updated_rows_count: number;
  skipped_rows_count: number;
}

export async function bulkFillMaintenanceCapex(
  payload: BulkFillMaintenanceCapexRequest = {},
  signal?: AbortSignal,
): Promise<BulkFillMaintenanceCapexResponse> {
  return adminRequest<BulkFillMaintenanceCapexResponse>(
    '/facts/annual_financial_fact/bulk-fill-maintenance-capex',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal,
    },
  );
}
