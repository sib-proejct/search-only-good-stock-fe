import type { components } from '../types/openapi.generated';
import { normalizeScientificNotation } from '../utils/numberFormatters';

export type AdminStock = components['schemas']['AdminStock'];
export type EditorTable = components['schemas']['EditorTable'];
export type EditorField = components['schemas']['EditorField'];
export type ValuationOptions = components['schemas']['ValuationRequest-Input'];
export type ValuationResult = components['schemas']['ValuationResponse'];
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
  const response = await fetch(`${base}/api/admin${path}`, init);
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
