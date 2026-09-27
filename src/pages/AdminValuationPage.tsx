import { RegisterStockCard, StockDataCollector } from '../components/admin/ManagedStockActions';
import { ValuationCalculationDetails } from '../components/admin/ValuationCalculationDetails';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Check,
  ChevronDown,
  Search,
  X,
} from 'lucide-react';
import {
  adminRequest,
  changedValues,
  fieldDisplay,
  fieldValue,
  type AdminStock,
  type Draft,
  type EditorTable,
  type FactRow,
  type TableName,
  type ValuationOptions,
  type ValuationResult,
} from '../services/adminApi';
import {
  formatFieldPreview,
  formatMonetaryAmount,
  formatPerShare,
  parseNumeric,
} from '../utils/numberFormatters';

interface FieldMeta {
  ko: string;
  en: string;
  unit?: string;
}

interface MissingValuationInput {
  fields: string[];
  message: string;
}

const tableLabels: Record<TableName, { ko: string; en: string }> = {
  annual_financial_fact: { ko: '연간 재무', en: 'Annual Financials' },
  share_capital_fact: { ko: '주식수·자본변동', en: 'Share Capital' },
  dilutive_security_fact: { ko: '희석 요인', en: 'Dilutive Securities' },
  market_fact: { ko: '시장 데이터', en: 'Market Data' },
};

const fieldsMeta: Record<string, FieldMeta> = {
  stock_id: { ko: '종목 ID', en: 'Stock ID' },
  fiscal_year: { ko: '회계연도', en: 'Fiscal Year' },
  statement_scope: { ko: '재무제표 범위', en: 'Statement Scope' },
  period_start: { ko: '회계기간 시작', en: 'Period Start' },
  period_end: { ko: '회계기간 종료', en: 'Period End' },
  currency: { ko: '통화', en: 'Currency' },
  net_income_common: { ko: '지배주주 순이익', en: 'Net Income Common' },
  ebit: { ko: '영업이익', en: 'EBIT' },
  pre_tax_income: { ko: '세전이익', en: 'Pre-tax Income' },
  income_tax_expense: { ko: '법인세 비용', en: 'Income Tax Expense' },
  common_equity: { ko: '보통주 자본', en: 'Common Equity' },
  interest_bearing_debt: { ko: '이자발생부채', en: 'Interest Bearing Debt' },
  cash_and_equivalents: { ko: '현금·현금성자산', en: 'Cash & Equivalents' },
  total_liabilities: { ko: '총부채', en: 'Total Liabilities' },
  interest_expense: { ko: '이자비용', en: 'Interest Expense' },
  interest_paid: { ko: '지급이자', en: 'Interest Paid' },
  interest_paid_classification: { ko: '지급이자 CFO 포함 여부', en: 'Interest Paid Scope' },
  cfo: { ko: '영업현금흐름', en: 'CFO' },
  reported_total_capex: { ko: '공시 총 CAPEX', en: 'Reported total CAPEX' },
  tangible_capex: { ko: '유형자산 취득액', en: 'Tangible CAPEX' },
  intangible_capex: { ko: '무형자산 취득액', en: 'Intangible CAPEX' },
  diluted_eps: { ko: '희석 EPS', en: 'Diluted EPS', unit: '통화/주' },
  diluted_shares: { ko: '연간 희석 가중평균주식수', en: 'Diluted Shares', unit: '주' },
  depreciation_ppe: { ko: '유형자산 감가상각', en: 'Depreciation PPE' },
  share_based_compensation: { ko: '주식기준보상', en: 'Share Based Compensation' },
  amortization_intangibles: { ko: '무형자산 상각', en: 'Amortization Intangibles' },
  depreciation_right_of_use: { ko: '사용권자산 감가상각', en: 'Depreciation ROU' },
  impairment_loss: { ko: '자산손상차손', en: 'Impairment Loss' },
  provision_expense: { ko: '충당부채 설정', en: 'Provision Expense' },
  deferred_tax_expense: { ko: '이연법인세 비용', en: 'Deferred Tax Expense' },
  unrealized_financial_loss: { ko: '금융자산 미실현 손실', en: 'Unrealized Financial Loss' },
  equity_method_income: { ko: '지분법 이익', en: 'Equity Method Income' },
  unrealized_fx_gain: { ko: '미실현 외화환산 이익', en: 'Unrealized FX Gain' },
  unrealized_financial_gain: { ko: '금융자산 미실현 이익', en: 'Unrealized Financial Gain' },
  impairment_reversal: { ko: '손상차손 환입', en: 'Impairment Reversal' },
  provision_reversal: { ko: '충당부채 환입', en: 'Provision Reversal' },
  deferred_tax_benefit: { ko: '이연법인세 수익', en: 'Deferred Tax Benefit' },
  gain_on_ppe_disposal: { ko: '유형자산 처분이익', en: 'Gain on PPE Disposal' },
  receivables_increase: { ko: '매출채권 증가', en: 'Receivables Increase' },
  inventory_increase: { ko: '재고자산 증가', en: 'Inventory Increase' },
  payables_increase: { ko: '매입채무 증가', en: 'Payables Increase' },
  maintenance_capex_estimate: { ko: '유지보수 CAPEX 추정', en: 'Maintenance CAPEX' },
  growth_capex_estimate: { ko: '성장 CAPEX 추정', en: 'Growth CAPEX' },
  filed_at: { ko: '공시일', en: 'Filed Date' },
  is_amended: { ko: '수정공시 여부', en: 'Amended' },
  as_of: { ko: '기준일', en: 'As of Date' },
  record_key: { ko: '기록 식별명', en: 'Record Key' },
  outstanding_shares: { ko: '유통주식수', en: 'Outstanding Shares', unit: '주' },
  issued_shares: { ko: '발행주식수', en: 'Issued Shares', unit: '주' },
  authorized_shares: { ko: '발행가능주식수', en: 'Authorized Shares', unit: '주' },
  treasury_shares: { ko: '자기주식수', en: 'Treasury Shares', unit: '주' },
  current_diluted_shares_estimate: { ko: '현재 희석주식수 추정', en: 'Current Diluted Shares', unit: '주' },
  event_type: { ko: '자본변동 유형', en: 'Event Type' },
  event_shares: { ko: '변동 주식수', en: 'Event Shares', unit: '주' },
  split_ratio: { ko: '분할 비율', en: 'Split Ratio' },
  security_key: { ko: '증권 식별명', en: 'Security Key' },
  security_type: { ko: '희석 요인 유형', en: 'Security Type' },
  quantity: { ko: '증권 수량', en: 'Quantity' },
  potential_shares: { ko: '잠재 주식수', en: 'Potential Shares', unit: '주' },
  exercise_or_conversion_price: { ko: '행사·전환 가격', en: 'Strike / Conversion Price' },
  price_currency: { ko: '가격 통화', en: 'Price Currency' },
  exercisable_from: { ko: '행사 가능일', en: 'Exercisable From' },
  expires_at: { ko: '만기일', en: 'Expires At' },
  conditions: { ko: '행사·전환 조건', en: 'Conditions' },
  series_key: { ko: '시계열 식별명', en: 'Series Key' },
  current_price: { ko: '현재가', en: 'Current Price', unit: '통화/주' },
  observed_market_cap: { ko: '직접 관측 시가총액', en: 'Observed Market Cap' },
  ten_year_bond_yield: { ko: '10년 국채수익률', en: '10Y Treasury Yield', unit: '%' },
  benchmark_index_value: { ko: '비교지수', en: 'Benchmark Index', unit: 'pt' },
  provider: { ko: '출처 기관 / 수동 입력자', en: 'Provider' },
  document_key: { ko: '공시 식별자 / 근거', en: 'Document Key' },
  risk_free_rate: { ko: '무위험이자율', en: 'Risk-free Rate' },
  quarterly_snapshot: { ko: '분기 스냅샷 ID', en: 'Quarterly Snapshot ID' },
  annual_scope: { ko: '재무제표 범위', en: 'Annual Scope' },
  risk_free_series: { ko: '국채 시계열 키', en: 'Risk-free Series' },
};

const choices: Record<string, { ko: string; en: string }> = {
  CFS: { ko: '연결', en: 'CFS' },
  OFS: { ko: '별도', en: 'OFS' },
  CONSOLIDATED_US_GAAP: { ko: '미국 연결', en: 'US GAAP' },
  CFO: { ko: 'CFO 포함', en: 'CFO' },
  NON_CFO: { ko: 'CFO 미포함', en: 'Non-CFO' },
  UNKNOWN: { ko: '확인 필요', en: 'Unknown' },
  OPTION: { ko: '스톡옵션', en: 'Stock Option' },
  RESTRICTED_STOCK: { ko: '제한조건부 주식', en: 'Restricted Stock' },
  RSU: { ko: '제한조건부 주식단위', en: 'RSU' },
  CB: { ko: '전환사채', en: 'CB' },
  CPS: { ko: '전환우선주', en: 'CPS' },
  BW: { ko: '신주인수권부사채', en: 'BW' },
  WARRANT: { ko: '신주인수권', en: 'Warrant' },
  RIGHTS_ISSUE: { ko: '유상증자', en: 'Rights Issue' },
  SPLIT: { ko: '주식분할', en: 'Stock Split' },
  REVERSE_SPLIT: { ko: '주식병합', en: 'Reverse Split' },
  BUYBACK: { ko: '자사주 매입', en: 'Buyback' },
  CANCELLATION: { ko: '자사주 소각', en: 'Cancellation' },
};

function getFieldMeta(name: string): FieldMeta {
  return fieldsMeta[name] ?? { ko: name, en: '' };
}

function formatChoice(key: string): string {
  const item = choices[key];
  if (!item) return key;
  if (item.ko === item.en) return item.ko;
  return `${item.ko} (${item.en})`;
}
const keyFields: Record<TableName, string[]> = {
  annual_financial_fact: ['stock_id', 'fiscal_year', 'statement_scope'],
  share_capital_fact: ['stock_id', 'as_of', 'record_key'],
  dilutive_security_fact: ['stock_id', 'security_key', 'as_of'],
  market_fact: ['stock_id', 'series_key', 'as_of'],
};
const control =
  'w-full rounded-lg border border-black/15 dark:border-white/20 bg-white dark:bg-[#1C1C1E] px-3 py-2 text-sm disabled:opacity-50';
const button =
  'rounded-lg bg-blue-600 text-white px-4 py-2 text-sm disabled:opacity-40';
const today = () => new Date().toLocaleDateString('en-CA');
const fmt = (value: unknown) => {
  if (value == null || value === '') return '미입력';
  const num = parseNumeric(value);
  if (num === null) return String(value);
  return num.toLocaleString('ko-KR', { maximumFractionDigits: 4 });
};

const isMissing = (value: unknown) => value === null || value === undefined || value === '';

function missingAnnualInputs(
  row: Draft,
  capexMode: ValuationOptions['capex_mode'],
): MissingValuationInput | null {
  const missing: string[] = [];
  if (isMissing(row.cfo)) missing.push('cfo');

  const interestScope = row.interest_paid_classification;
  if (isMissing(interestScope) || interestScope === 'UNKNOWN') {
    missing.push('interest_paid_classification');
  } else if (interestScope === 'NON_CFO' && isMissing(row.interest_paid)) {
    missing.push('interest_paid');
  }

  const hasReportedCapex = !isMissing(row.reported_total_capex);
  const hasDetailedCapex =
    !isMissing(row.tangible_capex) && !isMissing(row.intangible_capex);
  if (capexMode === 'MAINTENANCE') {
    const hasMaintenance = !isMissing(row.maintenance_capex_estimate);
    const canSubtractGrowth =
      !isMissing(row.growth_capex_estimate) && (hasReportedCapex || hasDetailedCapex);
    if (!hasMaintenance && !canSubtractGrowth) {
      missing.push('maintenance_capex_estimate');
      if (isMissing(row.growth_capex_estimate)) missing.push('growth_capex_estimate');
      if (!hasReportedCapex && !hasDetailedCapex) {
        missing.push('reported_total_capex', 'tangible_capex', 'intangible_capex');
      }
    }
  } else {
    const hasEstimatedTotal =
      !isMissing(row.maintenance_capex_estimate) &&
      !isMissing(row.growth_capex_estimate);
    if (!hasEstimatedTotal && !hasReportedCapex && !hasDetailedCapex) {
      missing.push('reported_total_capex');
      if (isMissing(row.tangible_capex)) missing.push('tangible_capex');
      if (isMissing(row.intangible_capex)) missing.push('intangible_capex');
    }
  }

  const fields = [...new Set(missing)];
  return fields.length
    ? { fields, message: fields.map((name) => getFieldMeta(name).ko).join(', ') }
    : null;
}

export interface AdminStockItem extends AdminStock {
  currentPrice?: number | null;
  marketCap?: number | null;
}

const formatPrice = (val: number | string | null | undefined, curr: string) => {
  if (val === null || val === undefined) return '—';
  const num = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(num)) return '—';
  if (curr === 'USD') {
    return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `${Math.round(num).toLocaleString()}원`;
};

const formatMarketCap = (val: number | string | null | undefined, curr: string) => {
  if (val === null || val === undefined) return '—';
  const num = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(num)) return '—';
  if (curr === 'USD') {
    if (num >= 1_000_000_000_000) return `$${(num / 1_000_000_000_000).toFixed(1)}T`;
    if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(1)}B`;
    if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`;
    return `$${num.toLocaleString()}`;
  }
  if (num >= 1_000_000_000_000) return `${(num / 1_000_000_000_000).toFixed(1)}조원`;
  if (num >= 100_000_000) return `${(num / 100_000_000).toFixed(1)}억원`;
  return `${num.toLocaleString()}원`;
};

export function AdminValuationPage() {
  const [searchParams] = useSearchParams();
  const [stocks, setStocks] = useState<AdminStockItem[]>([]);
  const [initialStocks, setInitialStocks] = useState<AdminStockItem[]>([]);
  const [stock, setStock] = useState<AdminStockItem | null>(null);
  const [latestPrice, setLatestPrice] = useState<number | string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [marketFilter, setMarketFilter] = useState<'ALL' | 'NASDAQ' | 'NYSE' | 'KOSPI' | 'KOSDAQ'>('ALL');
  const [dropdownSearch, setDropdownSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [tables, setTables] = useState<EditorTable[]>([]);
  const [table, setTable] = useState<TableName>('annual_financial_fact');
  const [rows, setRows] = useState<FactRow[]>([]);
  const [bulkSelectedIds, setBulkSelectedIds] = useState<number[]>([]);
  const [bulkFieldName, setBulkFieldName] = useState('interest_paid_classification');
  const [bulkFieldInput, setBulkFieldInput] = useState('CFO');
  const [selected, setSelected] = useState<FactRow | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [original, setOriginal] = useState<Draft>({});
  const [missingOnly, setMissingOnly] = useState(false);
  const [review, setReview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [collecting, setCollecting] = useState(false);
  const [loadingRows, setLoadingRows] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [revision, setRevision] = useState(0);
  const [options, setOptions] = useState<ValuationOptions>({
    publish: true,
    as_of: today(),
    capex_mode: 'TOTAL',
    normalization_years: 5,
    normalization_method: 'CONSERVATIVE',
    growth_rate_cap: '0.20',
    statement_scope: 'CFS',
  });
  const [result, setResult] = useState<ValuationResult | null>(null);
  const [stale, setStale] = useState(false);
  const fields = tables.find((item) => item.table === table)?.fields ?? [];
  const changes = draft ? changedValues(draft, original) : {};
  const dirty =
    draft !== null && (selected === null || Object.keys(changes).length > 0);

  const displayPrice = latestPrice ?? stock?.currentPrice ?? stock?.current_price;

  const filteredStocks = stocks.filter((s) => {
    if (marketFilter !== 'ALL' && s.market !== marketFilter) return false;
    if (dropdownSearch.trim()) {
      const q = dropdownSearch.trim().toLowerCase();
      const tickerMatch = s.ticker.toLowerCase().includes(q);
      const nameMatch = s.name.toLowerCase().includes(q);
      if (!tickerMatch && !nameMatch) return false;
    }
    return true;
  });

  const currentIndex = stock ? stocks.findIndex((s) => s.id === stock.id) : -1;

  const resetEditor = useCallback(() => {
    setDraft(null);
    setSelected(null);
    setOriginal({});
    setReview(false);
  }, []);

  const resetBulkSelection = useCallback(() => {
    setBulkSelectedIds([]);
    setBulkFieldName('interest_paid_classification');
    setBulkFieldInput('CFO');
  }, []);

  const pickStock = useCallback((next: AdminStockItem) => {
    setStock(next);
    setLatestPrice(next.currentPrice ?? next.current_price ?? null);
    setRows([]);
    resetBulkSelection();
    setLoadingRows(true);
    resetEditor();
    setResult(null);
    setError('');
    setNotice('');
    setOptions((old) => ({
      ...old,
      statement_scope: next.currency === 'USD' ? 'CONSOLIDATED_US_GAAP' : 'CFS',
      growth_rate_cap: next.growth_rate_cap ?? '0.20',
    }));
  }, [resetEditor, resetBulkSelection]);

  const reloadManagedStocks = useCallback(async () => {
    const rows = await adminRequest<AdminStock[]>('/stocks?limit=1000');
    const items = rows.map((item) => ({ ...item, currentPrice: item.current_price, marketCap: item.market_cap }));
    setInitialStocks(items);
    setStocks(items);
    setStock((current) => current ? items.find((item) => item.id === current.id) ?? current : null);
  }, []);

  const onCollected = useCallback(() => {
    setRevision((value) => value + 1);
    setStale(true);
    void reloadManagedStocks().catch((e) => setError(e.message));
  }, [reloadManagedStocks]);

  const onRegistered = useCallback((added: AdminStock) => {
    pickStock({ ...added, currentPrice: added.current_price, marketCap: added.market_cap });
    void reloadManagedStocks().catch((e) => setError(e.message));
  }, [pickStock, reloadManagedStocks]);

  useEffect(() => {
    if (!stock) {
      setLatestPrice(null);
      return;
    }
    const controller = new AbortController();
    adminRequest<FactRow[]>(`/facts/market_fact?stock_id=${stock.id}`, {
      signal: controller.signal,
    })
      .then((marketRows) => {
        if (controller.signal.aborted) return;
        const priceRow = marketRows.find((r) => 'current_price' in r && r.current_price != null);
        if (priceRow && 'current_price' in priceRow && priceRow.current_price != null) {
          const num = typeof priceRow.current_price === 'string' ? parseFloat(priceRow.current_price) : priceRow.current_price;
          if (!isNaN(num)) {
            setLatestPrice(num);
            setStocks((prev) =>
              prev.map((s) => (s.id === stock.id ? { ...s, currentPrice: num } : s))
            );
          }
        }
      })
      .catch(() => {
        // Silently preserve currentPrice
      });
    return () => controller.abort();
  }, [stock, revision]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto focus search input on dropdown open, clear search on dropdown close
  useEffect(() => {
    if (isDropdownOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setDropdownSearch('');
    }
  }, [isDropdownOpen]);

  useEffect(() => {
    const controller = new AbortController();
    adminRequest<EditorTable[]>('/editor', { signal: controller.signal })
      .then(setTables)
      .catch((e) => {
        if (!controller.signal.aborted) setError(String(e.message));
      });
    return () => controller.abort();
  }, []);

  // The managed list includes newly registered stocks without a published analysis.
  useEffect(() => {
    const controller = new AbortController();
    adminRequest<AdminStock[]>('/stocks?limit=1000', { signal: controller.signal })
      .then((items) => {
        if (controller.signal.aborted) return;
        const enriched = items.map((item) => ({ ...item, currentPrice: item.current_price, marketCap: item.market_cap }));
        setInitialStocks(enriched);
        setStocks(enriched);
        const tickerParam = searchParams.get('ticker');
        const stockIdParam = searchParams.get('stock_id');
        if (tickerParam) {
          const matched = enriched.find(
            (s) => s.ticker.toUpperCase() === tickerParam.toUpperCase(),
          );
          if (matched) pickStock(matched);
        } else if (stockIdParam) {
          const matched = enriched.find((s) => String(s.id) === stockIdParam);
          if (matched) pickStock(matched);
        }
      })
      .catch((e) => {
        if (!controller.signal.aborted) setError(String(e.message));
      });
    return () => controller.abort();
  }, [searchParams, pickStock]);

  // Search stocks dynamically when search term changes
  useEffect(() => {
    const query = dropdownSearch.trim();
    if (!query) {
      setStocks(initialStocks);
      return;
    }
    const q = query.toLowerCase();
    const locallyFiltered = initialStocks.filter(
      (s) => s.ticker.toLowerCase().includes(q) || s.name.toLowerCase().includes(q),
    );
    setStocks(locallyFiltered);

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      adminRequest<AdminStock[]>(
        `/stocks?search=${encodeURIComponent(query)}&limit=500`,
        { signal: controller.signal },
      )
        .then((fetched) => {
          const map = new Map<number, AdminStockItem>(
            initialStocks.map((s) => [s.id, s]),
          );
          const merged: AdminStockItem[] = fetched.map(
            (s) =>
              map.get(s.id) || {
                ...s,
                currentPrice: s.current_price,
                marketCap: s.market_cap,
              },
          );
          setStocks(merged);
        })
        .catch((e) => {
          if (!controller.signal.aborted) setError(String(e.message));
        });
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [dropdownSearch, initialStocks]);
  useEffect(() => {
    if (!stock) return;
    const controller = new AbortController();
    adminRequest<FactRow[]>(`/facts/${table}?stock_id=${stock.id}`, {
      signal: controller.signal,
    })
      .then((data) => {
        setRows(data);
        setLoadingRows(false);
      })
      .catch((e) => {
        if (!controller.signal.aborted) {
          setError(String(e.message));
          setLoadingRows(false);
        }
      });
    return () => controller.abort();
  }, [stock, table, revision]);

  function edit(row: FactRow | null) {
    const values: Draft = {};
    for (const field of fields)
      values[field.name] = row
        ? ((row as unknown as Draft)[field.name] ?? null)
        : null;
    if (!row && stock) {
      values.stock_id = stock.id;
      if ('currency' in values) values.currency = stock.currency;
      if ('as_of' in values) values.as_of = options.as_of;
      if ('statement_scope' in values)
        values.statement_scope = options.statement_scope ?? 'CFS';
      if ('record_key' in values) values.record_key = 'POSITION';
      if ('series_key' in values)
        values.series_key = `PRICE:${stock.external_id}`;
    }
    setSelected(row);
    setDraft(values);
    setOriginal(row ? { ...values } : {});
    setReview(false);
    setError('');
    setNotice('');
  }
  async function save() {
    if (!draft) return;
    setBusy(true);
    setError('');
    try {
      const payload = selected
        ? { ...changes, expected_updated_at: selected.updated_at }
        : Object.fromEntries(
            Object.entries(draft).filter(
              ([key, value]) =>
                value !== null || fields.find((f) => f.name === key)?.required,
            ),
          );
      await adminRequest(
        `/facts/${table}${selected ? `/${selected.id}` : ''}`,
        {
          method: selected ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );
      resetEditor();
      setRevision((old) => old + 1);
      setLoadingRows(true);
      setStale(true);
      setNotice('DB에 저장했습니다. 계산 버튼으로 결과를 갱신하세요.');
    } catch (e) {
      setError(e instanceof Error ? e.message : '저장 실패');
    } finally {
      setBusy(false);
    }
  }
  async function saveBulkField() {
    const selectedRows = rows.filter((row) => bulkSelectedIds.includes(row.id));
    const bulkField = fields.find((field) => field.name === bulkFieldName);
    if (selectedRows.length === 0 || !bulkField) return;
    const bulkValue = fieldValue(bulkField, bulkFieldInput);
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const results = await Promise.allSettled(
        selectedRows.map((row) =>
          adminRequest(`/facts/annual_financial_fact/${row.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              expected_updated_at: row.updated_at,
              [bulkFieldName]: bulkValue,
            }),
          }),
        ),
      );
      const savedCount = results.filter((result) => result.status === 'fulfilled').length;
      const failedCount = results.length - savedCount;
      resetBulkSelection();
      setRevision((old) => old + 1);
      setLoadingRows(true);
      if (savedCount > 0) {
        setStale(true);
        setNotice(
          `${savedCount}개 연도의 ${getFieldMeta(bulkFieldName).ko}을(를) 일괄 저장했습니다. 계산 버튼으로 결과를 갱신하세요.`,
        );
      }
      if (failedCount > 0) {
        setError(
          `${failedCount}개 연도는 다른 수정과 충돌해 저장하지 못했습니다. 다시 조회한 뒤 재시도하세요.`,
        );
      }
    } finally {
      setBusy(false);
    }
  }
  async function calculate() {
    if (!stock) return;
    setBusy(true);
    setError('');
    try {
      const calculated = await adminRequest<ValuationResult>(`/stocks/${stock.id}/valuation`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...options, publish: true }),
      });
      setResult(calculated);
      setStale(false);
      setNotice(calculated.published ? '계산 결과를 저장하고 종목 목록·상세에 반영했습니다.' : '계산 결과를 반영하지 않았습니다. 아래 부족한 자료를 확인하세요.');
      await reloadManagedStocks();
    } catch (e) {
      setError(e instanceof Error ? e.message : '계산 실패');
    } finally {
      setBusy(false);
    }
  }
  const changeOption = (value: Partial<ValuationOptions>) => {
    setOptions((old) => ({ ...old, ...value }));
    setStale(true);
  };

  const valuationMissingByRow = new Map<number, MissingValuationInput>();
  const valuationMissingNotices: string[] = [];
  const cutoff = options.as_of;
  if (table === 'annual_financial_fact') {
    const eligibleRows = rows
      .filter((row) => {
        const values = row as unknown as Draft;
        return (
          values.statement_scope === options.statement_scope &&
          typeof values.period_end === 'string' &&
          values.period_end <= cutoff
        );
      })
      .sort(
        (left, right) =>
          Number((right as unknown as Draft).fiscal_year) -
          Number((left as unknown as Draft).fiscal_year),
      );
    const latestYear = Math.max(
      ...eligibleRows.map((row) => Number((row as unknown as Draft).fiscal_year)),
      0,
    );
    const selectedYears = new Set(
      Array.from(
        { length: options.normalization_years },
        (_, index) => latestYear - index,
      ),
    );
    const selectedRows = eligibleRows.filter((row) =>
      selectedYears.has(Number((row as unknown as Draft).fiscal_year)),
    );
    selectedRows.forEach((row) => {
      const missing = missingAnnualInputs(
        row as unknown as Draft,
        options.capex_mode,
      );
      if (missing) valuationMissingByRow.set(row.id, missing);
    });
    if (selectedRows.length < options.normalization_years) {
      valuationMissingNotices.push(
        `${options.statement_scope} 기준 연간 자료가 ${options.normalization_years - selectedRows.length}개 연도 부족합니다.`,
      );
    }
  } else if (table === 'share_capital_fact') {
    const eligibleRows = rows
      .filter((row) => String((row as unknown as Draft).as_of ?? '') <= cutoff)
      .sort((left, right) =>
        String((right as unknown as Draft).as_of ?? '').localeCompare(
          String((left as unknown as Draft).as_of ?? ''),
        ),
      );
    const hasShares = eligibleRows.some(
      (row) => !isMissing((row as unknown as Draft).current_diluted_shares_estimate),
    );
    if (!hasShares) {
      const target = eligibleRows[0];
      if (target) {
        valuationMissingByRow.set(target.id, {
          fields: ['current_diluted_shares_estimate'],
          message: getFieldMeta('current_diluted_shares_estimate').ko,
        });
      } else {
        valuationMissingNotices.push('계산 기준일 이하의 주식수 행이 필요합니다.');
      }
    }
  } else if (table === 'market_fact' && stock) {
    const requirements = [
      {
        series: `PRICE:${stock.external_id}`,
        field: 'current_price',
      },
      {
        series: stock.currency === 'KRW' ? 'KR10Y' : 'US10Y',
        field: 'ten_year_bond_yield',
      },
    ];
    requirements.forEach(({ series, field }) => {
      const candidates = rows
        .filter((row) => {
          const values = row as unknown as Draft;
          return values.series_key === series && String(values.as_of ?? '') <= cutoff;
        })
        .sort((left, right) =>
          String((right as unknown as Draft).as_of ?? '').localeCompare(
            String((left as unknown as Draft).as_of ?? ''),
          ),
        );
      if (!candidates.some((row) => !isMissing((row as unknown as Draft)[field]))) {
        const target = candidates[0];
        if (target) {
          const existing = valuationMissingByRow.get(target.id);
          const nextFields = [...(existing?.fields ?? []), field];
          valuationMissingByRow.set(target.id, {
            fields: nextFields,
            message: nextFields.map((name) => getFieldMeta(name).ko).join(', '),
          });
        } else {
          valuationMissingNotices.push(
            `${series}: 계산 기준일 이하의 ${getFieldMeta(field).ko} 행이 필요합니다.`,
          );
        }
      }
    });
  }

  const visibleRows = missingOnly
    ? rows.filter((row) => valuationMissingByRow.has(row.id))
    : rows;
  const activeMissingFields = new Set(
    selected ? valuationMissingByRow.get(selected.id)?.fields ?? [] : [],
  );
  const visibleFields = fields.filter(
    (field) =>
      !missingOnly ||
      keyFields[table].includes(field.name) ||
      activeMissingFields.has(field.name),
  );
  const bulkEditableFields = fields.filter(
    (field) => !keyFields.annual_financial_fact.includes(field.name),
  );
  const bulkField = bulkEditableFields.find((field) => field.name === bulkFieldName);
  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10 space-y-8">
      <header>
        <p className="text-sm text-blue-600 font-semibold">LOCAL ADMIN</p>
        <h1 className="text-3xl font-bold mt-2">내재가치 계산 · 원자료 관리</h1>
        <p className="text-sm text-gray-500 mt-3">
          기본 10개와 직접 추가한 종목을 관리합니다. 종목별로 자료를 수집하고 확인·수정한 뒤, 계산 및 반영을 누르면 목록과 상세에도 결과가 저장됩니다.
        </p>
      </header>
      <RegisterStockCard disabled={busy || dirty || collecting} onRegistered={onRegistered} />
      {error && (
        <div role="alert" className="rounded-xl bg-red-50 text-red-800 p-4">
          {error}
        </div>
      )}
      {notice && (
        <p role="status" className="text-blue-600">
          {notice}
        </p>
      )}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block font-semibold text-sm">
            종목 선택
          </label>
          {dirty && (
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
              수정 중인 내용이 있어 종목을 변경할 수 없습니다
            </span>
          )}
        </div>

        {/* Stock Selector Dropdown & Collection Control */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative inline-block" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            disabled={busy || dirty || collecting}
            className="h-10 px-4 rounded-xl flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] border border-black/15 dark:border-white/20 transition-all cursor-pointer select-none focus:outline-none disabled:opacity-50 min-w-[420px] sm:min-w-[510px]"
            aria-expanded={isDropdownOpen}
            aria-haspopup="true"
          >
            {stock ? (
              <div className="flex items-center gap-2 truncate">
                <span className="text-[#86868B] font-mono tabular-nums text-xs shrink-0">
                  {currentIndex >= 0 ? `${currentIndex + 1}/${stocks.length}` : ''}
                </span>
                <span className="font-bold font-mono text-blue-600 dark:text-blue-400 shrink-0">
                  {stock.ticker}
                </span>
                <span className="text-[#86868B] shrink-0">·</span>
                <span className="font-normal text-[#1D1D1F] dark:text-[#F5F5F7] truncate max-w-[200px] sm:max-w-[260px]">
                  {stock.name}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold bg-black/[0.05] dark:bg-white/[0.08] text-[#86868B] shrink-0">
                  {stock.market}
                </span>
                {displayPrice != null && (
                  <>
                    <span className="text-[#86868B] shrink-0">·</span>
                    <span className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums shrink-0">
                      {formatPrice(displayPrice, stock.currency)}
                    </span>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-[#86868B]">
                <Search className="w-4 h-4" />
                <span>종목을 선택하세요</span>
              </div>
            )}
            <ChevronDown
              className={`w-4 h-4 text-[#86868B] transition-transform duration-200 shrink-0 ${
                isDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute left-0 top-full mt-2 w-[420px] sm:w-[510px] bg-white dark:bg-[#1C1C1E] rounded-2xl shadow-2xl border border-black/[0.08] dark:border-white/[0.12] p-2 z-50 animate-fade-in flex flex-col max-h-[440px]">
              {/* Search Input */}
              <div className="relative mb-2">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#86868B] pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={dropdownSearch}
                  onChange={(e) => setDropdownSearch(e.target.value)}
                  placeholder="종목명 또는 티커 검색"
                  className="w-full pl-8 pr-7 py-1.5 text-xs bg-[#F2F4F6] dark:bg-[#252528] text-[#1D1D1F] dark:text-[#F5F5F7] placeholder-[#86868B] rounded-xl border border-transparent focus:border-blue-500 focus:outline-none transition-all"
                />
                {dropdownSearch && (
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownSearch('');
                      searchInputRef.current?.focus();
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] p-1 rounded-full cursor-pointer"
                    aria-label="Clear search"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Market Switcher */}
              <div className="flex items-center gap-1 p-1 bg-[#F2F4F6] dark:bg-[#252528] rounded-xl mb-2 shrink-0">
                {(['ALL', 'NASDAQ', 'NYSE', 'KOSPI', 'KOSDAQ'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMarketFilter(m)}
                    className={`flex-1 py-1 text-[10px] font-semibold rounded-lg transition-all cursor-pointer select-none text-center ${
                      marketFilter === m
                        ? 'bg-white dark:bg-[#1C1C1E] text-blue-600 dark:text-blue-400 shadow-sm font-bold'
                        : 'text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              {/* Stock List */}
              <div className="space-y-0.5 overflow-y-auto flex-1 pr-0.5">
                {filteredStocks.length === 0 ? (
                  <div className="py-8 text-center text-xs text-[#86868B]">
                    검색된 종목이 없습니다.
                  </div>
                ) : (
                  filteredStocks.map((s, idx) => {
                    const isCurrent = stock?.id === s.id;
                    return (
                      <button
                        key={s.id}
                        disabled={busy || dirty || collecting}
                        type="button"
                        onClick={() => {
                          pickStock(s);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between transition-colors cursor-pointer select-none ${
                          isCurrent
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold'
                            : 'text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#F2F4F6] dark:hover:bg-[#252528]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="font-mono text-xs text-[#86868B] w-5 shrink-0 tabular-nums">
                            {idx + 1}
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold font-mono text-xs text-[#1D1D1F] dark:text-[#F5F5F7]">
                                {s.ticker}
                              </span>
                              <span className="text-[10px] text-[#86868B] truncate">
                                {s.name}
                              </span>
                            </div>
                            <div className="text-[10px] text-[#86868B] mt-0.5 flex items-center gap-1 font-mono">
                              {(s.currentPrice ?? s.current_price) != null && (
                                <>
                                  <span className="tabular-nums">
                                    {formatPrice(s.currentPrice ?? s.current_price, s.currency)}
                                  </span>
                                  <span>·</span>
                                </>
                              )}
                              {(s.marketCap ?? s.market_cap) != null && (
                                <>
                                  <span className="tabular-nums">
                                    {formatMarketCap(s.marketCap ?? s.market_cap, s.currency)}
                                  </span>
                                  <span>·</span>
                                </>
                              )}
                              <span>{s.market}</span>
                            </div>
                          </div>
                        </div>

                        {isCurrent && (
                          <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 stroke-[2.5] shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
          </div>
          {stock && (
            <StockDataCollector
              stock={stock}
              disabled={busy || dirty || collecting}
              onCollected={onCollected}
              onCollecting={setCollecting}
            />
          )}
        </div>
      </section>

      {!stock && (
        <div className="rounded-2xl border border-dashed border-black/15 dark:border-white/20 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <p className="text-base font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
            관리할 종목을 선택해주세요
          </p>
          <p className="text-xs text-[#86868B] max-w-sm mx-auto">
            상단 드롭다운에서 종목을 선택하면 원자료 조회/수정 및 내재가치 계산을 진행할 수 있습니다.
          </p>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(true)}
            disabled={busy || dirty || collecting}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Search className="w-3.5 h-3.5" />
            <span>종목 목록 열기</span>
          </button>
        </div>
      )}
      {stock && (
        <>
          <section className="rounded-2xl border border-black/10 dark:border-white/15 p-6 space-y-5">
            <div className="flex items-baseline justify-between">
              <h2 className="text-xl font-bold">{stock.name} 계산 조건</h2>
              <span className="text-xs text-gray-600 dark:text-gray-300 font-mono">Valuation Options</span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-4">
              <label className="text-sm space-y-1 block">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>계산 기준일</span>
                  <span className="font-mono">As of</span>
                </div>
                <input
                  type="date"
                  className={control}
                  disabled={busy}
                  value={options.as_of}
                  onChange={(e) => changeOption({ as_of: e.target.value })}
                />
              </label>
              <label className="text-sm space-y-1 block">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>재무제표</span>
                  <span className="font-mono">Scope</span>
                </div>
                <select
                  className={control}
                  disabled={busy}
                  value={options.statement_scope}
                  onChange={(e) =>
                    changeOption({
                      statement_scope: e.target
                        .value as ValuationOptions['statement_scope'],
                    })
                  }
                >
                  {(stock.currency === 'USD'
                    ? ['CONSOLIDATED_US_GAAP', 'OFS']
                    : ['CFS', 'OFS']
                  ).map((value) => (
                    <option key={value} value={value}>
                      {formatChoice(value)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm space-y-1 block">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>CAPEX</span>
                  <span className="font-mono">Mode</span>
                </div>
                <select
                  className={control}
                  disabled={busy}
                  value={options.capex_mode}
                  onChange={(e) =>
                    changeOption({
                      capex_mode: e.target
                        .value as ValuationOptions['capex_mode'],
                    })
                  }
                >
                  <option value="TOTAL">유지보수 + 성장 (Total)</option>
                  <option value="MAINTENANCE">유지보수 전용 (Maintenance)</option>
                </select>
              </label>
              <label className="text-sm space-y-1 block">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>OE 정규화·성장률 기간</span>
                  <span className="font-mono">Period</span>
                </div>
                <select
                  className={control}
                  disabled={busy}
                  value={options.normalization_years}
                  onChange={(e) =>
                    changeOption({
                      normalization_years: Number(e.target.value) as 1 | 3 | 5,
                    })
                  }
                >
                  {[1, 3, 5].map((value) => (
                    <option key={value} value={value}>
                      {value}개년 ({value}Y)
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm space-y-1 block">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>정규화 OE 방식</span>
                  <span className="font-mono">Method</span>
                </div>
                <select
                  className={control}
                  disabled={busy}
                  value={options.normalization_method}
                  onChange={(e) =>
                    changeOption({
                      normalization_method: e.target
                        .value as ValuationOptions['normalization_method'],
                    })
                  }
                >
                  <option value="CONSERVATIVE">보수적 (Conservative)</option>
                  <option value="MEAN">기간 평균 (Mean)</option>
                </select>
              </label>
              <label className="text-sm space-y-1 block">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>성장률 상한</span>
                  <span className="font-mono">Growth Cap</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    className={`${control} pr-8`}
                    disabled={busy}
                    value={Number(options.growth_rate_cap) * 100}
                    onChange={(e) =>
                      changeOption({
                        growth_rate_cap: String(Number(e.target.value) / 100),
                      })
                    }
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">%</span>
                </div>
              </label>
            </div>
            <p className="text-sm text-gray-500">
              {options.normalization_method === 'MEAN'
                ? '선택 기간 OE 합계 ÷ 선택 연수'
                : 'min(최근 연도 OE, 선택 기간 OE 중앙값)'}{' '}
              · 성장률은 선택한 {options.normalization_years}년간의 EPS·OEPS 변화 중 낮은 값과 기업별 성장률 상한 {Number(options.growth_rate_cap) * 100}% 중 작은 값을 사용합니다. 시작 연도를 포함한 {options.normalization_years + 1}개 연간 자료가 필요하며, 한 지표만 유효하면 해당 성장률과 이력 불완전 경고를 사용합니다.{' '}
              · 총 CAPEX 추정치가 부족하면 공시 유형·무형 취득액 합계 또는 수집된 공시 총액을 사용하며, 유지보수 모드는 유지보수 추정치 또는 총 CAPEX에서 성장 CAPEX를 차감해 계산합니다.
            </p>
            <button
              className={button}
              disabled={busy || collecting || dirty || !options.as_of}
              onClick={calculate}
            >
              {busy ? '처리 중…' : '계산 및 반영'}
            </button>
            {dirty && (
              <p className="text-amber-600 text-sm">
                미저장 변경을 저장하거나 취소한 뒤 계산하세요.
              </p>
            )}
          </section>
          {result && (
            <section className="rounded-2xl border border-black/10 dark:border-white/15 p-6 space-y-4">
              <div className="flex items-baseline justify-between">
                <h2 className="text-xl font-bold">
                  계산 결과{' '}
                  {stale && (
                    <span className="text-sm font-normal text-amber-600 ml-2">
                      이전 결과 · 재계산 필요
                    </span>
                  )}
                </h2>
                <span className="text-xs text-gray-600 dark:text-gray-300 font-mono">Valuation Result</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {result.options.as_of} · {result.options.normalization_years}개년 ·{' '}
                {result.options.normalization_method === 'MEAN'
                  ? '기간 평균 (Mean)'
                  : '보수적 기준 (Conservative)'}{' '}
                ·{' '}
                성장률 상한 {Number(result.options.growth_rate_cap) * 100}% ·{' '}
                {result.options.capex_mode === 'TOTAL'
                  ? '유지보수+성장 (Total)'
                  : '유지보수 (Maintenance)'}
              </p>
              {(result.issues ?? []).map((issue, index) => (
                <p key={index} className="text-amber-600">
                  {issue}
                </p>
              ))}
              <ValuationCalculationDetails
                result={result}
                currency={stock.currency}
              />
              {result.dcf && (
                <>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <p>
                      Normalized OE
                      <br />
                      <strong className="text-lg">
                        {formatMonetaryAmount(result.dcf.normalizedOwnerEarnings, stock.currency)}
                      </strong>
                      <span className="text-xs text-gray-500 dark:text-gray-400 block font-mono">
                        {fmt(result.dcf.normalizedOwnerEarnings)} {stock.currency}
                      </span>
                    </p>
                    <p>
                      OEPS
                      <br />
                      <strong className="text-lg">
                        {formatPerShare(result.dcf.normalizedOeps, stock.currency)}/주
                      </strong>
                    </p>
                    <p>
                      판정
                      <br />
                      <strong className="text-lg">{result.dcf.status}</strong>
                    </p>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    {Object.entries(result.dcf.scenarios ?? {}).map(
                      ([key, scenario]) => (
                        <div
                          className="bg-gray-100 dark:bg-white/5 p-4 rounded-xl"
                          key={key}
                        >
                          <p className="text-xs text-gray-600 dark:text-gray-300 font-mono">
                            {(
                              {
                                conservative: '보수적 (Conservative)',
                                base: '기준 (Base)',
                                optimistic: '낙관적 (Optimistic)',
                              } as Record<string, string>
                            )[key] ?? key}
                          </p>
                          <strong className="text-xl">
                            {formatPerShare(scenario?.intrinsicValuePerShare, stock.currency)}/주
                          </strong>
                        </div>
                      ),
                    )}
                  </div>
                  <p>
                    안전마진:{' '}
                    {result.dcf.conservativeMarginOfSafety == null
                      ? '계산 불가'
                      : `${(result.dcf.conservativeMarginOfSafety * 100).toFixed(2)}%`}
                  </p>
                </>
              )}
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="text-xs text-gray-500 font-medium">
                      <th className="py-2">연도</th>
                      <th>적용 CAPEX</th>
                      <th>CAPEX 산출 출처</th>
                      <th>OE</th>
                      <th>정규화 반영</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.annual_oe.map((row) => (
                      <tr
                        key={row.fiscal_year}
                        className="border-t border-gray-200 dark:border-gray-700"
                      >
                        <td className="py-2 font-mono">{row.fiscal_year}</td>
                        <td className="font-mono">
                          <div>
                            <span className="font-medium">
                              {formatMonetaryAmount(row.capex, stock.currency)}
                            </span>
                            <span className="text-xs text-gray-400 dark:text-gray-500 block font-normal">
                              {fmt(row.capex)} {stock.currency}
                            </span>
                          </div>
                        </td>
                        <td>
                          {
                            (
                              {
                                maintenance_capex_estimate:
                                  '유지보수 추정 (Maintenance)',
                                maintenance_plus_growth:
                                  '유지보수+성장 추정 (Total)',
                                total_minus_growth:
                                  '총 CAPEX - 성장 추정 (Maintenance)',
                                reported_total_capex: '공시 총 CAPEX',
                                reported_tangible_plus_intangible:
                                  '공시 취득액 합계 (Reported Capex)',
                                missing_total_capex:
                                  '총 CAPEX 미입력 (Missing)',
                                missing_maintenance_capex:
                                  '유지보수 CAPEX 미입력 (Missing)',
                              } as Record<string, string>
                            )[row.capex_source] ?? row.capex_source
                          }
                        </td>
                        <td className="font-mono">
                          <div>
                            <span className="font-medium">
                              {formatMonetaryAmount(row.owner_earnings, stock.currency)}
                            </span>
                            <span className="text-xs text-gray-400 dark:text-gray-500 block font-normal">
                              {fmt(row.owner_earnings)} {stock.currency}
                            </span>
                          </div>
                        </td>
                        <td>{row.selected ? '반영' : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <details>
                <summary className="text-sm font-medium cursor-pointer text-gray-700 dark:text-gray-300">
                  입력 출처 및 기준 시점
                </summary>
                <dl className="text-sm mt-2 space-y-1">
                  {Object.entries(result.sources ?? {}).map(([key, value]) => {
                    const meta = getFieldMeta(key);
                    return (
                      <div key={key} className="flex gap-2 text-xs">
                        <dt className="font-medium text-gray-700 dark:text-gray-300">
                          {meta.ko}
                          {meta.en && <span className="text-gray-600 dark:text-gray-300 font-mono ml-1">({meta.en})</span>}:
                        </dt>
                        <dd className="text-gray-600 dark:text-gray-400 font-mono">{value ?? '없음'}</dd>
                      </div>
                    );
                  })}
                </dl>
              </details>
            </section>
          )}
          <section className="space-y-4">
            <div className="flex items-baseline justify-between">
              <h2 className="text-xl font-bold">원자료 편집</h2>
              <span className="text-xs text-gray-600 dark:text-gray-300 font-mono">Fact Data Editor</span>
            </div>
            <p className="text-sm text-gray-500">
              금액은 통화 기본 단위 ({stock.currency}), 주식수는 주 단위입니다.
              빈 값은 0과 다릅니다. 희석 요인은 자동 합산하지 않으며 검토한 최종
              희석주식수를 직접 입력합니다.
            </p>
            {table !== 'dilutive_security_fact' &&
              (valuationMissingByRow.size > 0 || valuationMissingNotices.length > 0) && (
                <div className="rounded-xl border border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 p-4 space-y-2">
                  <p className="font-semibold text-sm text-amber-900 dark:text-amber-200">
                    계산 필수 입력 확인 · 누락 행 {valuationMissingByRow.size}개
                  </p>
                  <p className="text-xs text-amber-800 dark:text-amber-300">
                    현재 계산 옵션과 기준일에 실제로 필요한 값만 표시합니다. 아래의
                    주황색 행을 열면 누락 필드가 강조됩니다.
                  </p>
                  {valuationMissingNotices.map((message) => (
                    <p key={message} className="text-sm text-amber-800 dark:text-amber-300">
                      • {message}
                    </p>
                  ))}
                </div>
              )}
            <div className="flex flex-wrap gap-2">
              {Object.entries(tableLabels).map(([name, item]) => (
                <button
                  key={name}
                  disabled={busy || dirty || collecting}
                  className={`px-4 py-2 rounded-xl border text-sm transition-colors flex items-center gap-2 ${
                    table === name
                      ? 'bg-blue-600 text-white font-medium border-blue-600 shadow-sm'
                      : 'border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300'
                  }`}
                  onClick={() => {
                    setTable(name as TableName);
                    setRows([]);
                    setLoadingRows(true);
                    resetEditor();
                    resetBulkSelection();
                  }}
                >
                  <span>{item.ko}</span>
                  <span className={`text-xs font-mono ${table === name ? 'text-blue-100' : 'text-gray-600 dark:text-gray-300'}`}>
                    {item.en}
                  </span>
                </button>
              ))}
            </div>
            {table === 'market_fact' && (
              <p className="text-sm text-amber-600">
                국채·지수는 모든 종목이 공유합니다. 새 공통 시계열은 종목 ID를
                비우고 US10Y, KR10Y 또는 BENCHMARK:지수명을 입력하세요.
              </p>
            )}
            {table === 'dilutive_security_fact' && (
              <p className="text-sm text-gray-500">
                예정 유상증자는 여기에서 관리하며 완료된 증자는
                ‘주식수·자본변동 (Share Capital)’에 기록합니다.
              </p>
            )}
            <div className="flex gap-5 items-center">
              <label className="text-sm flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={missingOnly}
                  onChange={(e) => setMissingOnly(e.target.checked)}
                />{' '}
                <span>계산 필수 누락만 보기</span>
              </label>
              <button
                className={button}
                disabled={busy || dirty || !fields.length}
                onClick={() => edit(null)}
              >
                새 행 추가
              </button>
              <button
                className="text-sm underline"
                disabled={busy || dirty || collecting}
                onClick={() => {
                  setLoadingRows(true);
                  setRevision((v) => v + 1);
                  resetEditor();
                }}
              >
                다시 조회
              </button>
            </div>
            {table === 'annual_financial_fact' && rows.length > 0 && (
              <div className="rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/60 dark:bg-blue-950/30 p-4 flex flex-wrap items-end gap-3">
                <label className="text-sm flex items-center gap-2 cursor-pointer self-center">
                  <input
                    type="checkbox"
                    checked={
                      visibleRows.length > 0 &&
                      visibleRows.every((row) => bulkSelectedIds.includes(row.id))
                    }
                    onChange={(event) => {
                      const visibleIds = visibleRows.map((row) => row.id);
                      setBulkSelectedIds((current) =>
                        event.target.checked
                          ? [...new Set([...current, ...visibleIds])]
                          : current.filter((id) => !visibleIds.includes(id)),
                      );
                    }}
                    disabled={busy || dirty || collecting || visibleRows.length === 0}
                  />
                  <span>표시된 연도 전체 선택</span>
                </label>
                <label className="text-sm space-y-1 min-w-52">
                  <span className="block text-xs text-gray-600 dark:text-gray-300">
                    변경할 항목
                  </span>
                  <select
                    className={control}
                    value={bulkFieldName}
                    disabled={busy || dirty || collecting}
                    onChange={(event) => {
                      const nextField = bulkEditableFields.find(
                        (field) => field.name === event.target.value,
                      );
                      setBulkFieldName(event.target.value);
                      setBulkFieldInput(
                        nextField?.name === 'interest_paid_classification' ? 'CFO' : '',
                      );
                    }}
                  >
                    {bulkEditableFields.map((field) => (
                      <option key={field.name} value={field.name}>
                        {getFieldMeta(field.name).ko}
                      </option>
                    ))}
                  </select>
                </label>
                {bulkField && (
                  <label className="text-sm space-y-1 min-w-52">
                    <span className="block text-xs text-gray-600 dark:text-gray-300">
                      적용할 값
                    </span>
                    {bulkField.kind === 'select' || bulkField.kind === 'boolean' ? (
                      <select
                        className={control}
                        value={bulkFieldInput}
                        disabled={busy || dirty || collecting}
                        onChange={(event) => setBulkFieldInput(event.target.value)}
                      >
                        <option value="">값 비우기</option>
                        {(bulkField.kind === 'boolean'
                          ? ['true', 'false']
                          : (bulkField.choices ?? [])
                        ).map((choice) => (
                          <option key={choice} value={choice}>
                            {bulkField.kind === 'boolean'
                              ? choice === 'true'
                                ? '예 (True)'
                                : '아니오 (False)'
                              : formatChoice(choice)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        className={control}
                        type={
                          bulkField.kind === 'date'
                            ? 'date'
                            : bulkField.kind === 'number'
                              ? 'number'
                              : 'text'
                        }
                        step="any"
                        placeholder="비우면 값을 삭제합니다"
                        value={bulkFieldInput}
                        disabled={busy || dirty || collecting}
                        onChange={(event) => setBulkFieldInput(event.target.value)}
                      />
                    )}
                  </label>
                )}
                <button
                  type="button"
                  className={button}
                  disabled={busy || dirty || collecting || bulkSelectedIds.length === 0}
                  onClick={() => void saveBulkField()}
                >
                  선택한 {bulkSelectedIds.length}개 연도 일괄 저장
                </button>
                <p className="w-full text-xs text-gray-500">
                  빈 값을 적용하면 선택한 연도의 해당 값이 삭제됩니다. 필수 항목이나 서로 의존하는 값은 저장 시 검증됩니다.
                </p>
              </div>
            )}
            {loadingRows ? (
              <p role="status">자료를 불러오는 중…</p>
            ) : (
              <div className="max-h-64 overflow-y-auto border rounded-xl">
                {visibleRows.length === 0 && (
                  <p className="p-4">
                    {missingOnly && valuationMissingNotices.length === 0
                      ? '현재 행에서 계산을 막는 누락값이 없습니다.'
                      : '표시할 행이 없습니다.'}
                  </p>
                )}
                {visibleRows.map((row) => {
                  const missing = valuationMissingByRow.get(row.id);
                  return (
                  <div
                    key={row.id}
                    className={`flex items-center border-b ${
                      selected?.id === row.id
                        ? 'bg-blue-50 dark:bg-blue-950'
                        : missing
                          ? 'bg-amber-50/80 dark:bg-amber-950/20'
                          : ''
                    }`}
                  >
                    {table === 'annual_financial_fact' && (
                      <label className="p-3 pr-1 flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          aria-label={`${String((row as unknown as Draft).fiscal_year)}년 선택`}
                          checked={bulkSelectedIds.includes(row.id)}
                          disabled={busy || dirty || collecting}
                          onChange={(event) =>
                            setBulkSelectedIds((current) =>
                              event.target.checked
                                ? [...current, row.id]
                                : current.filter((id) => id !== row.id),
                            )
                          }
                        />
                      </label>
                    )}
                    <button
                      className="block flex-1 p-3 text-left text-sm"
                      disabled={busy || dirty || collecting}
                      onClick={() => edit(row)}
                    >
                      {keyFields[table]
                        .filter((key) => key !== 'stock_id')
                        .map((key) => {
                          const value = (row as unknown as Draft)[key];
                          return (
                            formatChoice(String(value ?? '')) || String(value ?? '미입력')
                          );
                        })
                        .join(' · ')}{' '}
                      <span className="text-gray-500">
                        / {row.source_type} · 수정{' '}
                        {new Date(row.updated_at).toLocaleString()}
                      </span>
                      {missing && (
                        <span className="mt-1 flex flex-wrap gap-1" aria-label="계산 필수 누락">
                          {missing.fields.map((name) => (
                            <span
                              key={name}
                              className="rounded-full bg-amber-200/80 px-2 py-0.5 text-xs font-medium text-amber-900 dark:bg-amber-900/60 dark:text-amber-200"
                            >
                              {getFieldMeta(name).ko}
                            </span>
                          ))}
                        </span>
                      )}
                    </button>
                  </div>
                  );
                })}
              </div>
            )}
            {draft && (
              <form
                className="rounded-xl border p-5 space-y-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  setReview(true);
                }}
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-base">
                    {selected ? '기존 행 수정' : '새 행 입력'}
                  </h3>
                  <button
                    type="button"
                    className="text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 underline"
                    disabled={busy}
                    onClick={resetEditor}
                  >
                    변경 취소
                  </button>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {visibleFields.map((field) => {
                    const disabled =
                      busy ||
                      (selected !== null &&
                        keyFields[table].includes(field.name));
                    const value = fieldDisplay(field.name, draft[field.name]);
                    const meta = getFieldMeta(field.name);
                    return (
                      <label
                        className={`text-sm space-y-1.5 block rounded-lg ${
                          activeMissingFields.has(field.name)
                            ? 'ring-2 ring-amber-400 bg-amber-50 dark:bg-amber-950/30 p-2'
                            : ''
                        }`}
                        key={field.name}
                      >
                        <div className="flex items-baseline justify-between gap-1">
                          <span className="font-medium text-gray-800 dark:text-gray-200">
                            {meta.ko}
                            {meta.unit && (
                              <span className="text-xs text-gray-600 dark:text-gray-400 font-normal ml-1">
                                ({meta.unit})
                              </span>
                            )}
                            {field.required && (
                              <span className="text-blue-600 dark:text-blue-400 ml-1 font-bold">*</span>
                            )}
                            {activeMissingFields.has(field.name) && (
                              <span className="text-xs text-amber-700 dark:text-amber-300 ml-1 font-semibold">
                                계산 필요
                              </span>
                            )}
                          </span>
                          {meta.en && (
                            <span className="text-[11px] text-gray-600 dark:text-gray-300 font-mono tracking-tight text-right truncate max-w-[50%]">
                              {meta.en}
                            </span>
                          )}
                        </div>
                        {field.kind === 'select' || field.kind === 'boolean' ? (
                          <select
                            className={control}
                            disabled={disabled}
                            required={field.required}
                            value={value}
                            onChange={(e) => {
                              setDraft({
                                ...draft,
                                [field.name]: fieldValue(field, e.target.value),
                              });
                              setReview(false);
                            }}
                          >
                            <option value="">미입력</option>
                            {(field.kind === 'boolean'
                              ? ['true', 'false']
                              : (field.choices ?? [])
                            ).map((choice) => (
                              <option key={choice} value={choice}>
                                {field.kind === 'boolean'
                                  ? choice === 'true'
                                    ? '예 (True)'
                                    : '아니오 (False)'
                                  : formatChoice(choice)}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            className={control}
                            disabled={disabled}
                            required={field.required}
                            type={
                              field.kind === 'date'
                                ? 'date'
                                : field.kind === 'number'
                                  ? 'number'
                                  : 'text'
                            }
                            step="any"
                            value={value}
                            onChange={(e) => {
                              setDraft({
                                ...draft,
                                [field.name]: fieldValue(field, e.target.value),
                              });
                              setReview(false);
                            }}
                          />
                        )}
                        {field.kind === 'number' && stock && (() => {
                          const preview = formatFieldPreview(field.name, value, stock.currency);
                          if (!preview) return null;
                          return (
                            <p className="text-xs text-blue-600 dark:text-blue-400 font-mono mt-0.5">
                              {preview}
                            </p>
                          );
                        })()}
                      </label>
                    );
                  })}
                </div>
                <button
                  className={button}
                  disabled={busy || !dirty}
                  type="submit"
                >
                  저장 전 변경 확인
                </button>
                {review && (
                  <div className="bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 rounded-xl p-4 space-y-3">
                    <h4 className="font-bold text-sm text-blue-950 dark:text-blue-200">저장할 변경</h4>
                    <ul className="text-sm space-y-1.5 divide-y divide-blue-100 dark:divide-blue-900/50">
                      {Object.entries(changes).map(([key, value]) => {
                        const meta = getFieldMeta(key);
                        return (
                          <li key={key} className="pt-1.5 flex justify-between items-center text-xs">
                            <span className="font-medium">
                              {meta.ko}
                              {meta.en && (
                                <span className="text-gray-600 dark:text-gray-300 font-mono ml-1.5">
                                  ({meta.en})
                                </span>
                              )}
                            </span>
                            <span className="font-mono text-right">
                              <span>{fieldDisplay(key, original[key]) || 'null'}</span> →{' '}
                              <span className="text-blue-600 dark:text-blue-400 font-semibold">
                                {fieldDisplay(key, value) || 'null'}
                              </span>
                              {stock && (() => {
                                const preview = formatFieldPreview(key, value, stock.currency);
                                if (!preview) return null;
                                return (
                                  <span className="block text-[11px] text-gray-500 dark:text-gray-400 font-sans">
                                    {preview}
                                  </span>
                                );
                              })()}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                    <button
                      className={button}
                      type="button"
                      disabled={busy}
                      onClick={save}
                    >
                      DB에 저장
                    </button>
                  </div>
                )}
              </form>
            )}
          </section>
        </>
      )}
    </div>
  );
}
