import { useEffect, useState } from 'react';
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

const tableLabels: Record<TableName, string> = {
  annual_financial_fact: '연간 재무',
  share_capital_fact: '주식수·자본변동',
  dilutive_security_fact: '희석 요인',
  market_fact: '시장 데이터',
};
const labels: Record<string, string> = {
  stock_id: '종목 ID',
  fiscal_year: '회계연도',
  statement_scope: '재무제표 범위',
  period_start: '회계기간 시작',
  period_end: '회계기간 종료',
  currency: '통화',
  net_income_common: '지배주주 순이익',
  ebit: '영업이익 (EBIT)',
  pre_tax_income: '세전이익',
  income_tax_expense: '법인세 비용',
  common_equity: '보통주 자본',
  interest_bearing_debt: '이자발생부채',
  cash_and_equivalents: '현금·현금성자산',
  total_liabilities: '총부채',
  interest_expense: '이자비용',
  interest_paid: '지급이자',
  interest_paid_classification: '지급이자 CFO 포함 여부',
  cfo: '영업현금흐름 (CFO)',
  tangible_capex: '유형자산 취득액',
  intangible_capex: '무형자산 취득액',
  diluted_eps: '희석 EPS (통화/주)',
  diluted_shares: '연간 희석 가중평균주식수 (주)',
  depreciation_ppe: '유형자산 감가상각',
  share_based_compensation: '주식기준보상',
  amortization_intangibles: '무형자산 상각',
  depreciation_right_of_use: '사용권자산 감가상각',
  impairment_loss: '자산손상차손',
  provision_expense: '충당부채 설정',
  deferred_tax_expense: '이연법인세 비용',
  unrealized_financial_loss: '금융자산 미실현 손실',
  equity_method_income: '지분법 이익',
  unrealized_fx_gain: '미실현 외화환산 이익',
  unrealized_financial_gain: '금융자산 미실현 이익',
  impairment_reversal: '손상차손 환입',
  provision_reversal: '충당부채 환입',
  deferred_tax_benefit: '이연법인세 수익',
  gain_on_ppe_disposal: '유형자산 처분이익',
  receivables_increase: '매출채권 증가',
  inventory_increase: '재고자산 증가',
  payables_increase: '매입채무 증가',
  maintenance_capex_estimate: '유지보수 CAPEX 추정',
  growth_capex_estimate: '성장 CAPEX 추정',
  filed_at: '공시일',
  is_amended: '수정공시 여부',
  as_of: '기준일',
  record_key: '기록 식별명',
  outstanding_shares: '유통주식수 (주)',
  issued_shares: '발행주식수 (주)',
  authorized_shares: '발행가능주식수 (주)',
  treasury_shares: '자기주식수 (주)',
  current_diluted_shares_estimate: '현재 희석주식수 추정 (주)',
  event_type: '자본변동 유형',
  event_shares: '변동 주식수 (주)',
  split_ratio: '분할 비율',
  security_key: '증권 식별명',
  security_type: '희석 요인 유형',
  quantity: '증권 수량',
  potential_shares: '잠재 주식수 (주)',
  exercise_or_conversion_price: '행사·전환 가격',
  price_currency: '가격 통화',
  exercisable_from: '행사 가능일',
  expires_at: '만기일',
  conditions: '행사·전환 조건',
  series_key: '시계열 식별명',
  current_price: '현재가 (통화/주)',
  observed_market_cap: '직접 관측 시가총액',
  ten_year_bond_yield: '10년 국채수익률 (%)',
  benchmark_index_value: '비교지수 (포인트)',
  provider: '출처 기관 / 수동 입력자',
  document_key: '공시 식별자 / 근거',
};
const choices: Record<string, string> = {
  CFS: '연결',
  OFS: '별도',
  CONSOLIDATED_US_GAAP: '미국 연결 (US GAAP)',
  CFO: 'CFO에 포함',
  NON_CFO: 'CFO에 미포함',
  UNKNOWN: '확인 필요',
  OPTION: '스톡옵션',
  RESTRICTED_STOCK: '제한조건부 주식',
  RSU: '제한조건부 주식단위',
  CB: '전환사채',
  CPS: '전환우선주',
  BW: '신주인수권부사채',
  WARRANT: '신주인수권',
  RIGHTS_ISSUE: '유상증자',
  SPLIT: '주식분할',
  REVERSE_SPLIT: '주식병합',
  BUYBACK: '자사주 매입',
  CANCELLATION: '자사주 소각',
};
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
const fmt = (value: unknown) =>
  value == null
    ? '미입력'
    : typeof value === 'number'
      ? value.toLocaleString('ko-KR', { maximumFractionDigits: 4 })
      : String(value);

export function AdminValuationPage() {
  const [search, setSearch] = useState('');
  const [stocks, setStocks] = useState<AdminStock[]>([]);
  const [stock, setStock] = useState<AdminStock | null>(null);
  const [tables, setTables] = useState<EditorTable[]>([]);
  const [table, setTable] = useState<TableName>('annual_financial_fact');
  const [rows, setRows] = useState<FactRow[]>([]);
  const [selected, setSelected] = useState<FactRow | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [original, setOriginal] = useState<Draft>({});
  const [missingOnly, setMissingOnly] = useState(false);
  const [review, setReview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loadingRows, setLoadingRows] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [revision, setRevision] = useState(0);
  const [options, setOptions] = useState<ValuationOptions>({
    as_of: today(),
    capex_mode: 'TOTAL',
    normalization_years: 5,
    normalization_method: 'CONSERVATIVE',
    statement_scope: 'CFS',
  });
  const [result, setResult] = useState<ValuationResult | null>(null);
  const [stale, setStale] = useState(false);
  const fields = tables.find((item) => item.table === table)?.fields ?? [];
  const changes = draft ? changedValues(draft, original) : {};
  const dirty =
    draft !== null && (selected === null || Object.keys(changes).length > 0);

  useEffect(() => {
    const controller = new AbortController();
    adminRequest<EditorTable[]>('/editor', { signal: controller.signal })
      .then(setTables)
      .catch((e) => {
        if (!controller.signal.aborted) setError(String(e.message));
      });
    return () => controller.abort();
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    if (!search.trim()) return;
    const timer = window.setTimeout(() => {
      adminRequest<AdminStock[]>(
        `/stocks?search=${encodeURIComponent(search)}`,
        { signal: controller.signal },
      )
        .then(setStocks)
        .catch((e) => {
          if (!controller.signal.aborted) setError(String(e.message));
        });
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [search]);
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

  function resetEditor() {
    setDraft(null);
    setSelected(null);
    setOriginal({});
    setReview(false);
  }
  function pickStock(next: AdminStock) {
    setStock(next);
    setRows([]);
    setLoadingRows(true);
    resetEditor();
    setResult(null);
    setError('');
    setNotice('');
    setOptions((old) => ({
      ...old,
      statement_scope: next.currency === 'USD' ? 'CONSOLIDATED_US_GAAP' : 'CFS',
    }));
  }
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
  async function calculate() {
    if (!stock) return;
    setBusy(true);
    setError('');
    try {
      setResult(
        await adminRequest<ValuationResult>(`/stocks/${stock.id}/valuation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(options),
        }),
      );
      setStale(false);
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
  const visibleRows = missingOnly
    ? rows.filter((row) =>
        fields.some((field) => (row as unknown as Draft)[field.name] == null),
      )
    : rows;
  const visibleFields = fields.filter(
    (field) =>
      !missingOnly ||
      field.required ||
      draft?.[field.name] == null ||
      original[field.name] == null,
  );
  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10 space-y-8">
      <header>
        <p className="text-sm text-blue-600 font-semibold">LOCAL ADMIN</p>
        <h1 className="text-3xl font-bold mt-2">내재가치 계산 · 원자료 관리</h1>
        <p className="text-sm text-gray-500 mt-3">
          로컬 전용 작업 공간입니다. 원자료는 DB에 저장하며, 계산 결과는 이
          페이지에서만 확인합니다.
        </p>
      </header>
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
      <section className="space-y-3">
        <label className="block font-semibold" htmlFor="admin-search">
          종목 검색
        </label>
        <input
          id="admin-search"
          className={control}
          placeholder="종목명 또는 티커"
          value={search}
          disabled={busy || dirty}
          onChange={(e) => {
            setSearch(e.target.value);
            setStocks([]);
          }}
        />
        <div className="flex gap-2 flex-wrap max-h-36 overflow-y-auto">
          {stocks.map((item) => (
            <button
              className={`rounded-full border px-3 py-2 text-sm ${stock?.id === item.id ? 'bg-blue-600 text-white' : ''}`}
              key={item.id}
              disabled={busy || dirty}
              onClick={() => pickStock(item)}
            >
              {item.name} · {item.ticker} · {item.market}
            </button>
          ))}
        </div>
      </section>
      {stock && (
        <>
          <section className="rounded-2xl border border-black/10 dark:border-white/15 p-6 space-y-5">
            <h2 className="text-xl font-bold">{stock.name} 계산 조건</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <label>
                계산 기준일
                <input
                  type="date"
                  className={control}
                  disabled={busy}
                  value={options.as_of}
                  onChange={(e) => changeOption({ as_of: e.target.value })}
                />
              </label>
              <label>
                재무제표
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
                      {choices[value]}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                CAPEX
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
                  <option value="TOTAL">유지보수 + 성장</option>
                  <option value="MAINTENANCE">유지보수</option>
                </select>
              </label>
              <label>
                Normalized OE 기간
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
                      {value}개년
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Normalized OE 방식
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
                  <option value="CONSERVATIVE">기존 방식</option>
                  <option value="MEAN">기간 평균</option>
                </select>
              </label>
            </div>
            <p className="text-sm text-gray-500">
              {options.normalization_method === 'MEAN'
                ? '선택 기간 OE 합계 ÷ 선택 연수'
                : 'min(최근 연도 OE, 선택 기간 OE 중앙값)'}{' '}
              · 총 CAPEX 추정치가 부족하면 공시 유형·무형 취득액 합계를
              사용합니다.
            </p>
            <button
              className={button}
              disabled={busy || dirty || !options.as_of}
              onClick={calculate}
            >
              {busy ? '처리 중…' : '내재가치 계산'}
            </button>
            {dirty && (
              <p className="text-amber-600 text-sm">
                미저장 변경을 저장하거나 취소한 뒤 계산하세요.
              </p>
            )}
          </section>
          {result && (
            <section className="rounded-2xl border border-black/10 dark:border-white/15 p-6 space-y-4">
              <h2 className="text-xl font-bold">
                계산 결과{' '}
                {stale && (
                  <span className="text-sm text-amber-600">
                    이전 결과 · 재계산 필요
                  </span>
                )}
              </h2>
              <p className="text-sm">
                {result.options.as_of} · {result.options.normalization_years}
                개년 ·{' '}
                {result.options.normalization_method === 'MEAN'
                  ? '기간 평균'
                  : '기존 방식'}{' '}
                ·{' '}
                {result.options.capex_mode === 'TOTAL'
                  ? '유지보수+성장'
                  : '유지보수'}
              </p>
              {(result.issues ?? []).map((issue, index) => (
                <p key={index} className="text-amber-600">
                  {issue}
                </p>
              ))}
              {result.dcf && (
                <>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <p>
                      Normalized OE
                      <br />
                      <strong>
                        {fmt(result.dcf.normalizedOwnerEarnings)}{' '}
                        {stock.currency}
                      </strong>
                    </p>
                    <p>
                      OEPS
                      <br />
                      <strong>
                        {fmt(result.dcf.normalizedOeps)} {stock.currency}/주
                      </strong>
                    </p>
                    <p>
                      판정
                      <br />
                      <strong>{result.dcf.status}</strong>
                    </p>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    {Object.entries(result.dcf.scenarios ?? {}).map(
                      ([key, scenario]) => (
                        <div
                          className="bg-gray-100 dark:bg-white/5 p-4 rounded-xl"
                          key={key}
                        >
                          <p>
                            {(
                              {
                                conservative: '보수적',
                                base: '기준',
                                optimistic: '낙관적',
                              } as Record<string, string>
                            )[key] ?? key}
                          </p>
                          <strong className="text-xl">
                            {fmt(scenario?.intrinsicValuePerShare)}{' '}
                            {stock.currency}/주
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
                  <p className="text-sm text-amber-600">
                    {result.dcf.reasonCodes.join(', ')}{' '}
                    {result.dcf.warnings.join(', ')}
                  </p>
                </>
              )}
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr>
                      <th>연도</th>
                      <th>적용 CAPEX</th>
                      <th>CAPEX 출처</th>
                      <th>OE</th>
                      <th>정규화 포함</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.annual_oe.map((row) => (
                      <tr
                        key={row.fiscal_year}
                        className="border-t border-gray-200 dark:border-gray-700"
                      >
                        <td className="py-2">{row.fiscal_year}</td>
                        <td>{fmt(row.capex)}</td>
                        <td>
                          {
                            (
                              {
                                maintenance_capex_estimate: '유지보수 추정',
                                maintenance_plus_growth: '유지보수+성장 추정',
                                reported_tangible_plus_intangible:
                                  '공시 유형+무형 취득',
                                missing_total_capex: '총 CAPEX 미입력',
                              } as Record<string, string>
                            )[row.capex_source]
                          }
                        </td>
                        <td>{fmt(row.owner_earnings)}</td>
                        <td>{row.selected ? '포함' : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <details>
                <summary>입력 출처·기준일</summary>
                <dl className="text-sm mt-2">
                  {Object.entries(result.sources ?? {}).map(([key, value]) => (
                    <div key={key}>
                      <dt className="inline font-semibold">
                        {labels[key] ?? key}:{' '}
                      </dt>
                      <dd className="inline">{value ?? '없음'}</dd>
                    </div>
                  ))}
                </dl>
              </details>
            </section>
          )}
          <section className="space-y-4">
            <h2 className="text-xl font-bold">원자료 편집</h2>
            <p className="text-sm text-gray-500">
              금액은 통화 기본 단위 ({stock.currency}), 주식수는 주 단위입니다.
              빈 값은 0과 다릅니다. 희석 요인은 자동 합산하지 않으며 검토한 최종
              희석주식수를 직접 입력합니다.
            </p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(tableLabels).map(([name, label]) => (
                <button
                  key={name}
                  disabled={busy || dirty}
                  className={`px-4 py-2 rounded-lg border ${table === name ? 'bg-blue-600 text-white' : ''}`}
                  onClick={() => {
                    setTable(name as TableName);
                    setRows([]);
                    setLoadingRows(true);
                    resetEditor();
                  }}
                >
                  {label}
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
                ‘주식수·자본변동’에 기록합니다.
              </p>
            )}
            <div className="flex gap-5 items-center">
              <label>
                <input
                  type="checkbox"
                  checked={missingOnly}
                  onChange={(e) => setMissingOnly(e.target.checked)}
                />{' '}
                결측만 보기
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
                disabled={busy || dirty}
                onClick={() => {
                  setLoadingRows(true);
                  setRevision((v) => v + 1);
                  resetEditor();
                }}
              >
                다시 조회
              </button>
            </div>
            {loadingRows ? (
              <p role="status">자료를 불러오는 중…</p>
            ) : (
              <div className="max-h-64 overflow-y-auto border rounded-xl">
                {visibleRows.length === 0 && (
                  <p className="p-4">표시할 행이 없습니다.</p>
                )}
                {visibleRows.map((row) => (
                  <button
                    key={row.id}
                    className={`block w-full p-3 text-left border-b text-sm ${selected?.id === row.id ? 'bg-blue-50 dark:bg-blue-950' : ''}`}
                    disabled={busy || dirty}
                    onClick={() => edit(row)}
                  >
                    {keyFields[table]
                      .filter((key) => key !== 'stock_id')
                      .map((key) => {
                        const value = (row as unknown as Draft)[key];
                        return (
                          choices[String(value)] ?? String(value ?? '미입력')
                        );
                      })
                      .join(' · ')}{' '}
                    <span className="text-gray-500">
                      / {row.source_type} · 수정{' '}
                      {new Date(row.updated_at).toLocaleString()}
                    </span>
                  </button>
                ))}
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
                <div className="flex justify-between">
                  <h3 className="font-bold">
                    {selected ? '기존 행 수정' : '새 행 입력'}
                  </h3>
                  <button
                    type="button"
                    className="underline"
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
                    return (
                      <label className="text-sm space-y-1" key={field.name}>
                        <span>
                          {labels[field.name] ?? field.name}
                          {field.required ? ' *' : ''}
                        </span>
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
                                {choices[choice] ??
                                  (choice === 'true'
                                    ? '예'
                                    : choice === 'false'
                                      ? '아니오'
                                      : choice)}
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
                  <div className="bg-blue-50 dark:bg-blue-950 rounded-xl p-4 space-y-3">
                    <h4 className="font-bold">저장할 변경</h4>
                    <ul className="text-sm space-y-1">
                      {Object.entries(changes).map(([key, value]) => (
                        <li key={key}>
                          {labels[key] ?? key}:{' '}
                          {fieldDisplay(key, original[key]) || '미입력'} →{' '}
                          {fieldDisplay(key, value) || '미입력'}
                        </li>
                      ))}
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
