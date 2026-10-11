import { MarketFilter } from '../common/MarketFilter';
import type { Market } from '../../types/api';
import { useEffect, useRef, useState } from 'react';
import { adminRequest, type AdminStock } from '../../services/adminApi';
import type { components } from '../../types/openapi.generated';

type Collection = components['schemas']['CollectionStatus'];
const active = (status: string) => status === 'PENDING' || status === 'RUNNING';
const stages: Record<string, string> = {
  PENDING: '대기',
  COLLECT: '자료 수집 중',
  NORMALIZE: '자료 정리 중',
  SAVE: '저장 중',
  REVIEW: '완료',
};

export function MultiStockCollector({
  stocks,
  currentId,
  disabled,
  onCollecting,
  onCollected,
}: {
  stocks: AdminStock[];
  currentId?: number;
  disabled: boolean;
  onCollecting: (value: boolean) => void;
  onCollected: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const [search, setSearch] = useState('');
  const [markets, setMarkets] = useState<Market[]>([]);
  const [items, setItems] = useState<Collection[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [pollError, setPollError] = useState('');
  const initialized = useRef(false);
  const restored = useRef(false);
  const button = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const running = busy || items.some((item) => active(item.status));
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
  const actionClass = 'rounded-xl px-4 py-2 text-sm border border-black/15 dark:border-white/20 disabled:opacity-40';
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
            className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl bg-white dark:bg-[#1C1C1E] p-5 shadow-xl gap-4"
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
            <div className="flex flex-wrap gap-2 items-center">
              <label className="text-sm flex gap-2">
                <input
                  type="checkbox"
                  disabled={running || disabled || !visible.length}
                  checked={visible.length > 0 && visible.every((stock) => selected.includes(stock.id))}
                  onChange={(event) => {
                    const ids = visible.map((stock) => stock.id);
                    setSelected((previous) => event.target.checked
                      ? [...new Set([...previous, ...ids])]
                      : previous.filter((id) => !ids.includes(id)));
                  }}
                />
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
              <span className="text-sm">{selected.length}개 선택</span>
            </div>
            <div className="overflow-y-auto min-h-0 border rounded-xl divide-y dark:divide-white/10">
              {!visible.length && <p className="p-4 text-sm">검색 결과가 없습니다.</p>}
              {visible.map((stock) => {
                const item = items.find((candidate) => candidate.stock_id === stock.id);
                return (
                  <label key={stock.id} className="flex gap-3 items-start p-3 text-sm">
                    <input
                      className="mt-1"
                      type="checkbox"
                      aria-label={`${stock.name} (${stock.ticker}) 수집 선택`}
                      disabled={running || disabled}
                      checked={selected.includes(stock.id)}
                      onChange={(event) => setSelected((previous) => event.target.checked
                        ? [...previous, stock.id]
                        : previous.filter((id) => id !== stock.id))}
                    />
                    <span className="flex-1">
                      {stock.name} <span className="text-gray-500">{stock.ticker} · {stock.market}</span>
                      {item && (
                        <span className={`block text-xs mt-1 ${item.status === 'FAILED' ? 'text-red-600' : 'text-gray-500'}`}>
                          {item.status === 'FAILED'
                            ? `실패 · ${item.error_detail ?? '다시 시도하세요.'}`
                            : item.status === 'SKIPPED'
                              ? '건너뜀'
                              : active(item.status)
                                ? stages[item.stage] ?? '수집 중'
                                : '완료'}
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
            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
            {pollError && <p role="status" className="text-sm text-amber-600">{pollError}</p>}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={`${actionClass} bg-blue-600 text-white`}
                disabled={running || disabled || !selected.length}
                onClick={() => void collect(selected)}
              >
                {running ? '수집 중…' : `선택한 ${selected.length}개 종목 자료 수집`}
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
