import { useEffect, useState } from 'react';
import { adminRequest, type AdminStock } from '../../services/adminApi';
import type { components } from '../../types/openapi.generated';

type Collection = components['schemas']['CollectionStatus'];
type Market = components['schemas']['StockRegistration']['market'];
const active = (status?: string) => status === 'PENDING' || status === 'RUNNING';
const stages: Record<string, string> = { PENDING: '수집 대기', COLLECT: '자료 수집 중', NORMALIZE: '자료 정리 중', SAVE: '원자료 저장 중', REVIEW: '수집 완료 · 자료 검토 가능' };

export function ManagedStockActions({ stock, disabled, onRegistered, onCollected, onCollecting }: {
  stock: AdminStock | null; disabled: boolean;
  onRegistered: (stock: AdminStock) => void; onCollected: () => void;
  onCollecting: (value: boolean) => void;
}) {
  const [market, setMarket] = useState<Market>('NASDAQ');
  const [ticker, setTicker] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [job, setJob] = useState<Collection | null>(null);
  useEffect(() => {
    setError('');
    setJob(stock?.batch_run_id ? { stock_id: stock.id, batch_run_id: stock.batch_run_id, status: stock.collection_status ?? 'NOT_COLLECTED', stage: stock.collection_stage ?? 'PENDING', error_detail: stock.collection_error } : null);
  }, [stock?.id, stock?.batch_run_id, stock?.collection_status, stock?.collection_stage, stock?.collection_error]);
  const running = active(job?.status);
  useEffect(() => { onCollecting(running || busy); return () => onCollecting(false); }, [running, busy, onCollecting]);
  const jobId = job?.batch_run_id;
  const jobStockId = job?.stock_id;
  useEffect(() => {
    if (!jobId || !jobStockId || !running) return;
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    async function poll() {
      try {
        const next = await adminRequest<Collection>(`/stocks/${jobStockId}/refresh/${jobId}`, { signal: controller.signal });
        if (controller.signal.aborted) return;
        setJob(next);
        setError('');
        if (!active(next.status)) { onCollected(); return; }
      } catch (e) {
        if (controller.signal.aborted) return;
        setError(e instanceof Error ? e.message : '수집 상태 조회 실패');
      }
      timer = setTimeout(poll, 2000);
    }
    void poll();
    return () => { controller.abort(); clearTimeout(timer); };
  }, [jobId, jobStockId, running, onCollected]);

  async function register() {
    setBusy(true); setError('');
    try {
      const added = await adminRequest<AdminStock>('/stocks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ market, ticker }) });
      onRegistered(added); setTicker('');
    } catch (e) { setError(e instanceof Error ? e.message : '종목 등록 실패'); }
    finally { setBusy(false); }
  }
  async function collect() {
    if (!stock) return;
    setBusy(true); setError('');
    try {
      setJob(await adminRequest<Collection>(`/stocks/${stock.id}/refresh`, { method: 'POST' }));
    } catch (e) { setError(e instanceof Error ? e.message : '수집 시작 실패'); }
    finally { setBusy(false); }
  }
  return <section className="rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
    <h2 className="font-semibold">종목 추가와 자료 수집</h2>
    <form className="flex flex-wrap gap-3" onSubmit={(event) => { event.preventDefault(); void register(); }}>
      <select aria-label="등록할 시장" value={market} onChange={(e) => setMarket(e.target.value as Market)} className="rounded-lg border p-2 dark:bg-gray-900" disabled={busy || disabled || running}>
        {(['NASDAQ', 'NYSE', 'KOSPI', 'KOSDAQ'] as const).map((value) => <option key={value}>{value}</option>)}
      </select>
      <input aria-label="등록할 티커 또는 종목코드" value={ticker} onChange={(e) => setTicker(e.target.value)} placeholder={market.startsWith('KO') ? '005930' : 'AAPL'} maxLength={32} className="rounded-lg border p-2 dark:bg-gray-900" disabled={busy || disabled || running} />
      <button type="submit" disabled={busy || disabled || running || !ticker.trim()} className="rounded-lg bg-blue-600 text-white px-4 py-2 disabled:opacity-40">{busy ? '처리 중…' : '종목 추가'}</button>
    </form>
    {stock && <div className="space-y-2">
      <p className="text-sm">{stock.name} ({stock.ticker}) · {stock.valuation_status === 'CALCULATED' ? '계산 결과 저장됨' : '미계산'}</p>
      <button onClick={() => void collect()} disabled={busy || disabled || running} className="rounded-lg border px-4 py-2 disabled:opacity-40">{running ? '수집 중…' : job?.status === 'FAILED' ? '선택 종목 수집 재시도' : '선택 종목 자료 수집'}</button>
      {job && <p role="status" className="text-sm">{job.status === 'FAILED' ? job.error_detail || '수집 실패 · 다시 시도하세요.' : job.status === 'SKIPPED' ? '수집 취소됨' : stages[job.stage] || job.status}</p>}
    </div>}
    <p className="text-sm text-gray-500">수집 후 원자료를 확인·수정하고 계산 및 반영을 누르세요. 재수집해도 직접 수정한 행은 보존됩니다.</p>
    {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
  </section>;
}
