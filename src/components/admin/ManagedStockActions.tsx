import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { adminRequest, type AdminStock } from '../../services/adminApi';
import type { components } from '../../types/openapi.generated';

type Collection = components['schemas']['CollectionStatus'];
type Market = components['schemas']['StockRegistration']['market'];

const active = (status?: string) => status === 'PENDING' || status === 'RUNNING';
const stages: Record<string, string> = {
  PENDING: '수집 대기',
  COLLECT: '자료 수집 중',
  NORMALIZE: '자료 정리 중',
  SAVE: '원자료 저장 중',
  REVIEW: '수집 완료',
};

export function RegisterStockCard({
  disabled,
  onRegistered,
}: {
  disabled: boolean;
  onRegistered: (stock: AdminStock) => void;
}) {
  const [market, setMarket] = useState<Market>('NASDAQ');
  const [ticker, setTicker] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function register() {
    setBusy(true);
    setError('');
    try {
      const added = await adminRequest<AdminStock>('/stocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ market, ticker }),
      });
      onRegistered(added);
      setTicker('');
    } catch (e) {
      setError(e instanceof Error ? e.message : '종목 등록 실패');
    } finally {
      setBusy(false);
    }
  }

  return (
    <fieldset className="min-w-0 rounded-xl border border-black/5 bg-[#F5F5F7]/70 p-4 space-y-3 dark:border-white/10 dark:bg-white/[0.03]">
      <legend className="px-1 text-sm font-semibold">
        종목 추가
        <span className="ml-2 text-[10px] font-normal text-gray-500 dark:text-gray-400 font-mono">Register Stock</span>
      </legend>
      <form
        className="flex flex-wrap items-center gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          void register();
        }}
      >
        <select
          aria-label="등록할 시장"
          value={market}
          onChange={(e) => setMarket(e.target.value as Market)}
          className="min-h-11 rounded-lg border border-black/15 dark:border-white/20 bg-white p-2 text-sm dark:bg-[#1C1C1E]"
          disabled={busy || disabled}
        >
          {(['NASDAQ', 'NYSE', 'KOSPI', 'KOSDAQ'] as const).map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
        <input
          aria-label="등록할 티커 또는 종목코드"
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          placeholder={market.startsWith('KO') ? '005930' : 'AAPL'}
          maxLength={32}
          className="rounded-lg border border-black/15 dark:border-white/20 p-2 text-sm dark:bg-[#1C1C1E] bg-white min-h-11 min-w-0 w-full sm:w-60"
          disabled={busy || disabled}
        />
        <button
          type="submit"
          disabled={busy || disabled || !ticker.trim()}
          className="min-h-11 rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-40 transition-colors cursor-pointer"
        >
          {busy ? '처리 중…' : '종목 추가'}
        </button>
      </form>
      <p className="text-xs text-gray-500">
        종목을 등록한 후 아래에서 해당 종목을 선택하고 [선택 종목 자료 수집]을 진행하세요.
      </p>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    </fieldset>
  );
}

export function StockDataCollector({
  stock,
  disabled,
  onCollected,
  onCollecting,
}: {
  stock: AdminStock;
  disabled: boolean;
  onCollected: () => void;
  onCollecting: (value: boolean) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [job, setJob] = useState<Collection | null>(null);

  useEffect(() => {
    setError('');
    setJob(
      stock.batch_run_id
        ? {
            stock_id: stock.id,
            batch_run_id: stock.batch_run_id,
            status: stock.collection_status ?? 'NOT_COLLECTED',
            stage: stock.collection_stage ?? 'PENDING',
            error_detail: stock.collection_error,
          }
        : null,
    );
  }, [stock.id, stock.batch_run_id, stock.collection_status, stock.collection_stage, stock.collection_error]);

  const running = active(job?.status);
  useEffect(() => {
    onCollecting(running || busy);
    return () => onCollecting(false);
  }, [running, busy, onCollecting]);

  const jobId = job?.batch_run_id;
  const jobStockId = job?.stock_id;

  useEffect(() => {
    if (!jobId || !jobStockId || !running) return;
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    async function poll() {
      try {
        const next = await adminRequest<Collection>(
          `/stocks/${jobStockId}/refresh/${jobId}`,
          { signal: controller.signal },
        );
        if (controller.signal.aborted) return;
        setJob(next);
        setError('');
        if (!active(next.status)) {
          onCollected();
          return;
        }
      } catch (e) {
        if (controller.signal.aborted) return;
        setError(e instanceof Error ? e.message : '수집 상태 조회 실패');
      }
      timer = setTimeout(poll, 2000);
    }
    void poll();
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [jobId, jobStockId, running, onCollected]);

  async function collect() {
    setBusy(true);
    setError('');
    try {
      setJob(
        await adminRequest<Collection>(`/stocks/${stock.id}/refresh`, {
          method: 'POST',
        }),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : '수집 시작 실패');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2.5 flex-wrap">
      <button
        type="button"
        onClick={() => void collect()}
        disabled={busy || disabled || running}
        className={`h-10 px-4 rounded-xl flex items-center gap-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer select-none focus:outline-none disabled:opacity-50 ${
          job?.status === 'FAILED'
            ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm'
            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
        }`}
      >
        <RefreshCw className={`w-3.5 h-3.5 ${running ? 'animate-spin' : ''}`} />
        <span>
          {running
            ? '수집 중…'
            : job?.status === 'FAILED'
            ? '선택 종목 수집 재시도'
            : '선택 종목 자료 수집'}
        </span>
      </button>

      {job && (
        <span
          role="status"
          className={`text-xs font-medium inline-flex items-center gap-1.5 ${
            job.status === 'FAILED'
              ? 'text-red-600 dark:text-red-400'
              : running
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-emerald-600 dark:text-emerald-400'
          }`}
        >
          {running && (
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          )}
          {job.status === 'FAILED'
            ? job.error_detail || '수집 실패 · 다시 시도하세요.'
            : job.status === 'SKIPPED'
            ? '수집 취소됨'
            : stages[job.stage] || job.status}
        </span>
      )}

      <span className="text-xs text-[#86868B] font-medium">
        {stock.valuation_status === 'CALCULATED'
          ? '· 계산 결과 저장됨'
          : '· 미계산'}
      </span>

      {error && (
        <span role="alert" className="text-xs text-red-600">
          {error}
        </span>
      )}
    </div>
  );
}

export function ManagedStockActions({
  disabled,
  onRegistered,
}: {
  stock?: AdminStock | null;
  disabled: boolean;
  onRegistered: (stock: AdminStock) => void;
  onCollected?: () => void;
  onCollecting?: (value: boolean) => void;
}) {
  return <RegisterStockCard disabled={disabled} onRegistered={onRegistered} />;
}
