import { Check, ListChecks, Trash2, Zap } from 'lucide-react';
import { MarketFilter } from '../common/MarketFilter';
import type { Market } from '../../types/api';
import { useEffect, useRef, useState } from 'react';
import {
  adminRequest,
  bulkDeleteAdminStocks,
  refreshStockPrices,
  type AdminStock,
} from '../../services/adminApi';
import type { components } from '../../types/openapi.generated';

type Collection = components['schemas']['CollectionStatus'];
const active = (status: string) => status === 'PENDING' || status === 'RUNNING';
const stages: Record<string, string> = {
  PENDING: '대기',
  COLLECT: '자료 수집 중',
  NORMALIZE: '자료 정리 중',
  SAVE: '저장 중',
  CALCULATE: '계산 중',
  PUBLISH: '계산 및 반영 완료',
  REVIEW: '완료',
};

export function MultiStockCollector({
  stocks,
  currentId,
  disabled,
  onCollecting,
  onCollected,
  onBulkDeleted,
}: {
  stocks: AdminStock[];
  currentId?: number;
  disabled: boolean;
  onCollecting: (value: boolean) => void;
  onCollected: () => void;
  onBulkDeleted?: (deletedIds: number[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const [search, setSearch] = useState('');
  const [markets, setMarkets] = useState<Market[]>([]);
  const [items, setItems] = useState<Collection[]>([]);
  const [busy, setBusy] = useState(false);
  const [priceBusy, setPriceBusy] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [priceNotice, setPriceNotice] = useState('');
  const [error, setError] = useState('');
  const [pollError, setPollError] = useState('');
  const initialized = useRef(false);
  const restored = useRef(false);
  const button = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const running = busy || priceBusy || deleteBusy || items.some((item) => active(item.status));
  const pendingKey = items
    .filter((item) => active(item.status))
    .map((item) => `${item.stock_id}:${item.batch_run_id}`)
    .join(',');
  const visible = stocks.filter((stock) =>
    (markets.length === 0 || markets.some((market) => market === stock.market)) &&
    `${stock.name} ${stock.ticker}`.toLowerCase().includes(search.trim().toLowerCase()),
  );
  const failed = items.filter((item) => item.status === 'FAILED').map((item) => item.stock_id);
  const done = items.filter((item) => !active(item.status)).length;

  useEffect(() => {
    if (restored.current || !stocks.length) return;
    restored.current = true;
    const runId = stocks.find((stock) => active(stock.collection_status))?.batch_run_id;
    if (!runId) return;
    const restoredItems = stocks
      .filter((stock) => stock.batch_run_id === runId)
      .map((stock) => ({
        stock_id: stock.id,
        batch_run_id: runId,
        status: stock.collection_status,
        stage: stock.collection_stage ?? 'PENDING',
        error_detail: stock.collection_error,
      }));
    setItems(restoredItems);
    setSelected(restoredItems.map((item) => item.stock_id));
    initialized.current = true;
  }, [stocks]);

  useEffect(() => {
    onCollecting(running);
    return () => onCollecting(false);
  }, [running, onCollecting]);

  useEffect(() => {
    if (!pendingKey) return;
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    const targets = pendingKey.split(',').map((entry) => entry.split(':').map(Number));
    async function poll() {
      const results = await Promise.allSettled(
        targets.map(([id, runId]) =>
          adminRequest<Collection>(`/stocks/${id}/refresh/${runId}`, {
            signal: controller.signal,
          }),
        ),
      );
      if (controller.signal.aborted) return;
      const updates = results.flatMap((result) => result.status === 'fulfilled' ? [result.value] : []);
      const failedQuery = results.find((result) => result.status === 'rejected');
      setPollError(failedQuery ? '상태를 조회하지 못했습니다. 자동으로 다시 조회합니다.' : '');
      setItems((previous) => previous.map((item) =>
        updates.find((next) => next.stock_id === item.stock_id) ?? item,
      ));
      if (results.every((result) => result.status === 'fulfilled' && !active(result.value.status))) {
        onCollected();
        return;
      }
      timer = setTimeout(() => void poll(), 2000);
    }
    timer = setTimeout(() => void poll(), 2000);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [pendingKey, onCollected]);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const opener = button.current;
    const element = dialog.current;
    element?.querySelector<HTMLInputElement>('input[type="search"]')?.focus();
    function keydown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
      }
      if (event.key !== 'Tab' || !element) return;
      const controls = Array.from(element.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), [tabindex="0"]'));
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (!element.contains(document.activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first)?.focus();
        return;
      }
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
    document.addEventListener('keydown', keydown);
    return () => {
      document.removeEventListener('keydown', keydown);
      (opener ?? previous)?.focus();
    };
  }, [open]);

  async function collect(ids: number[]) {
    setBusy(true);
    setError('');
    setPriceNotice('');
    setPollError('');
    try {
      const response = await adminRequest<components['schemas']['StocksRefreshResponse']>('/stocks/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock_ids: ids }),
      });
      setSelected(ids);
      setItems(response.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : '수집 시작 실패');
    } finally {
      setBusy(false);
    }
  }

  async function refreshPricesOnly(ids: number[]) {
    setPriceBusy(true);
    setError('');
    setPriceNotice('');
    setPollError('');
    try {
      const res = await refreshStockPrices({ stock_ids: ids });
      setPriceNotice(
        `현재가 갱신 완료: ${res.priceUpdatedCount}/${res.totalStocks}개 조회, 내재가치 ${res.valuationUpdatedCount}개 반영${res.failedCount > 0 ? ` (실패 ${res.failedCount}개)` : ''}`,
      );
      onCollected();
    } catch (e) {
      setError(e instanceof Error ? e.message : '현재가 일괄 업데이트 실패');
    } finally {
      setPriceBusy(false);
    }
  }

  async function removeStocks(ids: number[]) {
    if (!ids.length) return;
    if (
      !window.confirm(
        `선택한 ${ids.length}개 종목을 관리 목록에서 일괄 삭제(제외)하시겠습니까?\n(기존 수집된 원자료는 보존되며 언제든 다시 추가할 수 있습니다.)`,
      )
    ) {
      return;
    }
    setDeleteBusy(true);
    setError('');
    setPriceNotice('');
    setPollError('');
    try {
      const res = await bulkDeleteAdminStocks(ids);
      setSelected((prev) => prev.filter((id) => !ids.includes(id)));
      setItems((prev) => prev.filter((item) => !ids.includes(item.stock_id)));
      setPriceNotice(`${res.deleted_count}개 종목을 관리 목록에서 삭제했습니다.`);
      if (onBulkDeleted) onBulkDeleted(ids);
      else onCollected();
    } catch (e) {
      setError(e instanceof Error ? e.message : '종목 일괄 삭제 실패');
    } finally {
      setDeleteBusy(false);
    }
  }
  const actionClass = 'h-10 px-4 rounded-xl inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] border border-black/15 dark:border-white/20 transition-colors cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] disabled:opacity-50 disabled:cursor-not-allowed';
  const checkboxClass = 'peer sr-only';
  const checkmarkClass = 'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-black/15 bg-white text-transparent transition-colors dark:border-white/20 dark:bg-[#1C1C1E] peer-checked:border-[#0071E3] peer-checked:bg-[#0071E3] peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-[#0071E3] peer-focus-visible:ring-offset-2 dark:peer-focus-visible:ring-offset-[#1C1C1E] peer-disabled:opacity-50';
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        ref={button}
        type="button"
        className={actionClass}
        disabled={disabled}
        onClick={() => {
          if (!initialized.current) {
            setSelected(currentId ? [currentId] : []);
            initialized.current = true;
          }
          setOpen(true);
        }}
      >
        <ListChecks className="h-3.5 w-3.5" aria-hidden="true" />
        여러 종목 수집
      </button>
      {items.length > 0 && (
        <span role="status" className="text-xs text-gray-500">
          {running ? '여러 종목 수집 중' : '여러 종목 수집 종료'} · {done}/{items.length}개 처리 · 실패 {failed.length}개
        </span>
      )}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <div
            ref={dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="multi-collection-title"
            className="w-full max-w-2xl h-[90dvh] flex flex-col rounded-2xl bg-white dark:bg-[#1C1C1E] p-5 shadow-xl gap-4"
          >
            <div className="flex items-center justify-between">
              <h2 id="multi-collection-title" className="font-semibold text-lg">
                여러 종목 자료 수집
              </h2>
              <button type="button" className={actionClass} onClick={() => setOpen(false)}>
                닫기
              </button>
            </div>
            <MarketFilter markets={markets} onChange={setMarkets} />
            <input
              type="search"
              aria-label="수집할 종목 검색"
              placeholder="종목명 또는 티커 검색"
              className="rounded-lg border p-2 bg-transparent"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <div className="flex flex-wrap gap-2 items-center rounded-2xl bg-[#F2F4F6] dark:bg-white/[0.03] p-2">
              <label className={`min-h-10 px-3 rounded-xl inline-flex items-center gap-2 text-xs sm:text-sm font-semibold transition-colors ${running || disabled || !visible.length ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-white/60 dark:hover:bg-white/[0.05]'}`}>
                <input
                  type="checkbox"
                  className={checkboxClass}
                  disabled={running || disabled || !visible.length}
                  checked={visible.length > 0 && visible.every((stock) => selected.includes(stock.id))}
                  onChange={(event) => {
                    const ids = visible.map((stock) => stock.id);
                    setSelected((previous) => event.target.checked
                      ? [...new Set([...previous, ...ids])]
                      : previous.filter((id) => !ids.includes(id)));
                  }}
                />
                <span className={checkmarkClass} aria-hidden="true"><Check className="h-3.5 w-3.5" strokeWidth={3} /></span>
                검색 결과 전체 선택
              </label>
              <button
                type="button"
                className={actionClass}
                disabled={running || disabled}
                onClick={() => setSelected([])}
              >
                선택 해제
              </button>
              <span className="ml-auto rounded-lg bg-[#0071E3]/10 dark:bg-[#2997FF]/15 px-3 py-1.5 text-xs font-semibold tabular-nums text-[#0071E3] dark:text-[#2997FF]">{selected.length}개 선택</span>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0 border rounded-xl divide-y dark:divide-white/10">
              {!visible.length && <p className="p-4 text-sm">검색 결과가 없습니다.</p>}
              {visible.map((stock) => {
                const item = items.find((candidate) => candidate.stock_id === stock.id);
                const collectedAt = item?.collected_at ?? stock.collected_at;
                return (
                  <label key={stock.id} className={`flex gap-3 items-start p-3 text-sm transition-colors ${selected.includes(stock.id) ? 'bg-[#0071E3]/[0.05] dark:bg-[#2997FF]/[0.08]' : ''} ${running || disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-[#F5F5F7] dark:hover:bg-white/[0.04]'}`}>
                    <input
                      className={checkboxClass}
                      type="checkbox"
                      aria-label={`${stock.name} (${stock.ticker}) 수집 선택`}
                      disabled={running || disabled}
                      checked={selected.includes(stock.id)}
                      onChange={(event) => setSelected((previous) => event.target.checked
                        ? [...previous, stock.id]
                        : previous.filter((id) => id !== stock.id))}
                    />
                    <span className={`${checkmarkClass} mt-0.5`} aria-hidden="true"><Check className="h-3.5 w-3.5" strokeWidth={3} /></span>
                    <span className="flex-1 min-w-0">
                      <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <span>{stock.name} <span className="text-gray-500">{stock.ticker} · {stock.market}</span></span>
                        {collectedAt ? (
                          <time dateTime={collectedAt} className="text-xs text-gray-500" title="최근 자료 수집 완료 시각 (한국 시간)">
                            수신 {new Date(collectedAt).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                          </time>
                        ) : <span className="text-xs text-gray-500">{stock.collected_at === undefined ? '수신 시각 확인 불가' : '수신 기록 없음'}</span>}
                      </span>
                      {item && (
                        <span className={`block text-xs mt-1 ${item.status === 'FAILED' ? 'text-red-600' : 'text-gray-500'}`}>
                          {item.status === 'FAILED'
                            ? `실패 · ${item.error_detail ?? '다시 시도하세요.'}`
                            : item.status === 'SKIPPED'
                              ? '건너뜀'
                              : active(item.status)
                                ? stages[item.stage] ?? '수집 중'
                                : stages[item.stage] ?? '완료'}
                        </span>
                      )}
                    </span>
                  </label>
                );
              })}
            </div>
            {items.length > 0 && (
              <p role="status" className="text-sm">
                {done}/{items.length}개 처리 · 실패 {failed.length}개
                {running && ' · 창을 닫아도 수집은 계속됩니다.'}
              </p>
            )}
            {priceNotice && <p role="status" className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{priceNotice}</p>}
            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
            {pollError && <p role="status" className="text-sm text-amber-600">{pollError}</p>}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="h-10 px-4 rounded-xl inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold bg-[#0071E3] hover:bg-[#0077ED] text-white shadow-sm transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#1C1C1E] disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={running || disabled || !selected.length}
                onClick={() => void collect(selected)}
              >
                {busy ? '수집 중…' : `선택한 ${selected.length}개 종목 자료 수집`}
              </button>
              <button
                type="button"
                className="h-10 px-4 rounded-xl inline-flex items-center justify-center gap-1.5 text-xs sm:text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#1C1C1E] disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={running || disabled || !selected.length}
                onClick={() => void refreshPricesOnly(selected)}
                title="선택한 종목의 최신 현재가만 빠르게 조회하여 시가총액 및 안전마진을 갱신합니다"
              >
                <Zap className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                {priceBusy ? '현재가 갱신 중…' : `선택한 ${selected.length}개 현재가만 업데이트`}
              </button>
              <button
                type="button"
                className="h-10 px-4 rounded-xl inline-flex items-center justify-center gap-1.5 text-xs sm:text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-950/70 border border-red-200 dark:border-red-900/50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#1C1C1E] disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={running || disabled || !selected.length}
                onClick={() => void removeStocks(selected)}
                title="선택한 종목들을 관리 대상 및 스크리너 노출에서 일괄 제외합니다"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                {deleteBusy ? '삭제 중…' : `선택한 ${selected.length}개 종목 삭제`}
              </button>
              {failed.length > 0 && (
                <button
                  type="button"
                  className={actionClass}
                  disabled={running || disabled}
                  onClick={() => void collect(failed)}
                >
                  실패 종목만 재시도
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
