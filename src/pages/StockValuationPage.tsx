import { useEffect, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useAppConfig } from '../context/ThemeLanguageContext';
import { stockApi } from '../services/api';
import { valuationRequest, type ValuationView, type ValuationConditions } from '../services/valuationApi';
import { periodNote, valuationAmount, valuationPercent, valuationPrice } from '../utils/valuationFormatters';
import type { Market, StockDetailDTO } from '../types/api';

const box = 'rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#1C1C1E] p-5';
const input = 'w-full rounded-lg border border-black/15 dark:border-white/15 bg-transparent px-3 py-2 mt-1';
const button = 'rounded-xl bg-[#0071E3] text-white px-4 py-2 disabled:opacity-40';

export function StockValuationPage() {
  const { ticker = '' } = useParams();
  const [params, setParams] = useSearchParams();
  const marketValue = params.get('market');
  const market = ['KOSPI', 'KOSDAQ', 'NASDAQ', 'NYSE'].includes(marketValue ?? '') ? marketValue as Market : undefined;
  const queryYears = Number(params.get('years') || 5);
  const years = [1, 2, 3, 4, 5].includes(queryYears) ? queryYears : 5;
  const { language } = useAppConfig(); const ko = language === 'ko';
  const [stock, setStock] = useState<StockDetailDTO | null>(null);
  const [result, setResult] = useState<ValuationView | null>(null);
  const [conditions, setConditions] = useState<ValuationConditions | null>(null);
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const actionController = useRef<AbortController | null>(null);
  // Changing the selected period is a condition edit; it does not discard a preview.
  const initialYears = useRef(years);
  useEffect(() => {
    const controller = new AbortController(); actionController.current = controller;
    setResult(null); setStock(null); setConditions(null); setError(''); setBusy(true);
    Promise.all([stockApi.getStockDetail(ticker, controller.signal, market), valuationRequest(ticker, market, undefined, undefined, controller.signal)])
      .then(async ([detail, valuation]) => {
        if (initialYears.current !== valuation.conditions.normalizationYears) {
          valuation = await valuationRequest(ticker, market, 'preview', { baseSnapshotId: valuation.baseSnapshotId, conditions: { ...valuation.conditions, normalizationYears: initialYears.current as 1|2|3|4|5 } }, controller.signal);
        }
        if (controller.signal.aborted) return;
        setStock(detail); setResult(valuation); setConditions(valuation.conditions);
      }).catch(err => { if (!controller.signal.aborted) setError(String(err.message)); })
      .finally(() => { if (!controller.signal.aborted) setBusy(false); });
    return () => { controller.abort(); actionController.current?.abort(); };
  }, [ticker, market, reload]);

  const dirty = result && conditions ? JSON.stringify(conditions) !== JSON.stringify(result.conditions) : false;
  const selectedYears = conditions?.normalizationYears ?? years;
  const period = result?.periods[String(selectedYears)]; const dcf = period?.dcf;
  const edit = (patch: Partial<ValuationConditions>) => {
    if (!conditions) return;
    setConditions({ ...conditions, ...patch }); setError('');
    if (patch.normalizationYears) {
      initialYears.current = patch.normalizationYears;
      const next = new URLSearchParams(params); next.set('years', String(patch.normalizationYears)); setParams(next, { replace: true });
    }
  };
  const run = async (action: 'preview' | 'apply') => {
    if (!result || !conditions || busy || (action === 'apply' && dirty)) return;
    const controller = new AbortController(); actionController.current = controller;
    setBusy(true); setError('');
    try {
      const value = await valuationRequest(ticker, market, action, { baseSnapshotId: result.baseSnapshotId, conditions }, controller.signal);
      if (!controller.signal.aborted) { setResult(value); setConditions(value.conditions); }
    } catch (err) { if (!controller.signal.aborted) setError(err instanceof Error ? err.message : String(err)); }
    finally { if (!controller.signal.aborted) setBusy(false); }
  };
  const money = (value: number | null | undefined) => valuationPrice(value, stock?.currency ?? 'KRW', ko);
  const amount = (value: unknown) => valuationAmount(value == null ? null : Number(value), stock?.currency ?? 'KRW', ko);
  const chart = [1, 2, 3, 4, 5].map(year => ({ year, value: result?.periods[String(year)]?.dcf.scenarios?.conservative.intrinsicValuePerShare ?? null }));
  return <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-6">
    <div className="flex justify-between gap-3 text-sm"><Link to="/" className="text-[#0071E3]">← {ko ? '스크리너' : 'Screener'}</Link><Link className="text-[#0071E3]" to={`/stock/${encodeURIComponent(ticker)}${market ? `?market=${market}` : ''}`}>{ko ? '기존 상세 분석' : 'Full stock analysis'} →</Link></div>
    <header><h1 className="text-3xl font-bold">{stock?.name ?? ticker}</h1><p className="text-sm text-[#86868B] mt-2">{ticker} · {stock?.market} · {ko ? '현재 내재가치 계산' : 'Current intrinsic value'} · {result?.dataAsOf.slice(0, 10)}</p></header>
    {busy && <p role="status">{ko ? '계산 자료를 확인하는 중…' : 'Loading valuation…'}</p>}
    {error && <div className={box} role="alert"><p>{error}</p><button className={`${button} mt-3`} disabled={busy} onClick={() => setReload(v => v + 1)}>{ko ? '최신 게시 자료 다시 불러오기' : 'Reload published data'}</button></div>}
    {result && conditions && stock && <>
      {dirty && <p role="status" className="text-amber-600">{ko ? '조건이 변경되었습니다. 아래 결과는 이전 계산이며 재계산 후 적용할 수 있습니다.' : 'Conditions changed. Results show the previous calculation; recalculate before applying.'}</p>}
      {result.published && !dirty && <p role="status" className="text-green-600">{ko ? '공식 목록에 적용했습니다.' : 'Applied to the official screener.'}</p>}
      {result.defaultsUsed && <p className="text-sm text-[#86868B]">{ko ? '계산 조건이 없는 과거 게시 자료: 기존 엔진 기본 조건을 적용했습니다. 성장률 하한은 없습니다.' : 'Legacy publication without conditions: original engine defaults were used, with no growth floor.'}</p>}
      <section className="grid sm:grid-cols-3 gap-4">
        {[[ko ? '현재가' : 'Price', money(stock.currentPrice)], [ko ? `${selectedYears}개년 보수적 주당 내재가치` : `${selectedYears} year conservative value`, money(dcf?.scenarios?.conservative.intrinsicValuePerShare)], [ko ? '안전마진' : 'Margin of safety', valuationPercent(dcf?.conservativeMarginOfSafety)]].map(([label, value]) => <div key={label} className={box}><p className="text-sm text-[#86868B]">{label}</p><p className="text-2xl font-bold mt-2 tabular-nums">{value}</p></div>)}
      </section>
      <p className="text-sm text-[#86868B]">{ko ? '신뢰도' : 'Confidence'}: {dcf?.confidence} · {periodNote(period, ko)}</p>
      <section className={box}><h2 className="font-bold mb-4">{ko ? '기간별 보수적 주당 내재가치' : 'Conservative value by history period'}</h2>
        <div className="h-64"><ResponsiveContainer width="100%" height="100%"><LineChart data={chart}><CartesianGrid strokeDasharray="3 3" stroke="#86868B" opacity={0.2}/><XAxis dataKey="year" tickFormatter={y => `${y}${ko ? '개년' : 'y'}`}/><YAxis tickFormatter={v => money(v)}/><Tooltip formatter={v => money(Number(v))}/><Line type="linear" dataKey="value" stroke="#0071E3" strokeWidth={2} connectNulls={false}/></LineChart></ResponsiveContainer></div>
        <div className="flex flex-wrap gap-4 text-sm">{chart.map(point => <span key={point.year}>{point.year}{ko ? '개년' : 'y'}: {money(point.value)}</span>)}</div>
      </section>
      <section className="grid sm:grid-cols-3 gap-4">{(['conservative', 'base', 'optimistic'] as const).map((key, i) => <div className={box} key={key}><h2 className="font-bold">{(ko ? ['보수적', '기본', '낙관적'] : ['Conservative', 'Base', 'Optimistic'])[i]}</h2><p className="text-xl mt-2">{money(dcf?.scenarios?.[key].intrinsicValuePerShare)}</p><p className="text-sm text-[#86868B] mt-2">{ko ? '성장률' : 'Growth'} {valuationPercent(dcf?.scenarios?.[key].growthRate)}</p></div>)}</section>
      <section className={box}><h2 className="font-bold mb-4">{ko ? '계산 조건' : 'Calculation conditions'}</h2>
        <fieldset disabled={busy} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <label>{ko ? '재무자료 기간' : 'History period'}<select className={input} value={selectedYears} onChange={e => edit({ normalizationYears: Number(e.target.value) as 1|2|3|4|5 })}>{[1, 2, 3, 4, 5].map(y => <option key={y} value={y}>{y}{ko ? '개년' : ' years'}</option>)}</select></label>
          <label>{ko ? '주주이익 정상화' : 'Owner earnings normalization'}<select className={input} value={conditions.normalizationMethod} onChange={e => edit({ normalizationMethod: e.target.value as 'CONSERVATIVE'|'MEAN' })}><option value="CONSERVATIVE">{ko ? '최근값·중간값 중 낮은 값' : 'Lower of latest and median'}</option><option value="MEAN">{ko ? '평균' : 'Mean'}</option></select></label>
          <label>CAPEX<select className={input} value={conditions.capexMode} onChange={e => edit({ capexMode: e.target.value as 'TOTAL'|'MAINTENANCE' })}><option value="TOTAL">{ko ? '총액' : 'Total'}</option><option value="MAINTENANCE">{ko ? '유지보수' : 'Maintenance'}</option></select></label>
          <label>{ko ? '성장률 방식' : 'Growth method'}<select className={input} value={conditions.growthMethod} onChange={e => edit({ growthMethod: e.target.value as 'LOWER_BOUND'|'OEPS_WEIGHTED'|'EQUAL_BLEND' })}><option value="LOWER_BOUND">{ko ? '낮은 값' : 'Lower bound'}</option><option value="OEPS_WEIGHTED">{ko ? 'OEPS 70% / EPS 30%' : 'OEPS 70% / EPS 30%'}</option><option value="EQUAL_BLEND">{ko ? '동일 비중' : 'Equal blend'}</option></select></label>
          <label>{ko ? '성장률 상한 (%)' : 'Growth cap (%)'}<input className={input} type="number" min={0} max={100} step="any" value={Number(conditions.growthRateCap) * 100} onChange={e => edit({ growthRateCap: String(Number(e.target.value) / 100) })}/></label>
          <label>{ko ? '성장률 하한 (%, 빈칸은 제한 없음)' : 'Growth floor (%, blank = none)'}<input className={input} type="number" min={-99.99} max={100} step="any" value={conditions.growthRateFloor == null ? '' : Number(conditions.growthRateFloor) * 100} onChange={e => edit({ growthRateFloor: e.target.value === '' ? null : String(Number(e.target.value) / 100) })}/></label>
        </fieldset>
        <div className="flex flex-wrap gap-3 mt-5"><button className={button} disabled={busy} onClick={() => run('preview')}>{ko ? '임시 재계산' : 'Recalculate preview'}</button>{result.canApply && <button className={button} disabled={busy || Boolean(dirty) || !dcf?.scenarios} onClick={() => run('apply')}>{ko ? '공식 목록에 적용' : 'Apply to official screener'}</button>}</div>
        <p className="text-xs text-[#86868B] mt-3">{ko ? '게시된 입력만 사용합니다. 임시 재계산은 공식 목록을 변경하지 않습니다.' : 'Uses published inputs. Preview calculations leave official values unchanged.'}</p>
      </section>
      <section className={box}><h2 className="font-bold mb-3">{ko ? '계산 대상 및 실제 사용 연도' : 'Target and used fiscal years'}</h2>
        <dl className="grid sm:grid-cols-2 gap-3 text-sm">{[
          [ko ? '정상화 대상' : 'Normalization target', period?.normalizationTargetYears], [ko ? '정상화 유효 입력' : 'Normalization valid inputs', period?.normalizationUsedYears],
          [ko ? '성장률 대상 (기초 연도 포함)' : 'Growth target (including opening year)', period?.growthTargetYears], [ko ? 'EPS 성장률 사용' : 'EPS growth used', period?.epsGrowthUsedYears], [ko ? 'OEPS 성장률 사용' : 'OEPS growth used', period?.oepsGrowthUsedYears],
        ].map(([label, values]) => <div key={String(label)}><dt className="text-[#86868B]">{String(label)}</dt><dd>{Array.isArray(values) && values.length ? values.join(', ') : '—'}</dd></div>)}</dl>
        <p className="mt-4 text-sm">{ko ? '누락 및 경고' : 'Missing inputs and warnings'}: {periodNote(period, ko)}</p>
        <p className="mt-2 text-sm">{ko ? '정상화 주당 주주이익' : 'Normalized owner earnings per share'}: {money(dcf?.normalizedOeps)} · {ko ? '할인율' : 'Discount rate'}: {valuationPercent(dcf?.discountRate)}</p>
      </section>
      <section className={`${box} overflow-x-auto`}><h2 className="font-bold mb-3">{ko ? '연도별 게시 근거' : 'Published annual evidence'}</h2>
        <table className="w-full text-sm whitespace-nowrap"><thead><tr>{(ko ? ['연도', 'CFO', '지급이자 / 분류', '선택 CAPEX', '주주이익', 'EPS', '희석주식수', 'CAPEX 출처'] : ['Year', 'CFO', 'Interest paid / classification', 'Selected CAPEX', 'Owner earnings', 'EPS', 'Diluted shares', 'CAPEX source']).map(label => <th className="p-2 text-left" key={label}>{label}</th>)}</tr></thead><tbody>{result.annualFinancials.map(annual => {
          const evidence = result.capexEvidence.find(item => item.fiscalYear === annual.fiscalYear);
          return <tr key={annual.fiscalYear} className="border-t border-black/10 dark:border-white/10"><td className="p-2">{annual.fiscalYear}</td><td className="p-2">{amount(annual.cfo)}</td><td className="p-2">{amount(annual.interestPaid)} / {annual.interestPaidClassification}</td><td className="p-2">{amount(annual.capex)}</td><td className="p-2">{amount(result.annualOwnerEarnings?.[String(annual.fiscalYear)])}</td><td className="p-2">{money(annual.dilutedEps == null ? null : Number(annual.dilutedEps))}</td><td className="p-2">{annual.dilutedShares == null ? '—' : Number(annual.dilutedShares).toLocaleString()}</td><td className="p-2">{evidence ? `${evidence.provider ?? '—'} / ${evidence.documentKey ?? '—'}` : ko ? '게시된 선택값만 보유' : 'Published selected value only'}</td></tr>;
        })}</tbody></table>
        {result.capexEvidence.length > 0 && <details className="mt-4"><summary>{ko ? 'CAPEX 공시 및 추정 근거' : 'Reported and estimated CAPEX'}</summary><div className="overflow-x-auto"><table className="text-sm w-full whitespace-nowrap"><thead><tr>{(ko ? ['연도', '공시 총액', '유형', '무형', '유지 추정', '성장 추정'] : ['Year', 'Reported total', 'Tangible', 'Intangible', 'Maintenance estimate', 'Growth estimate']).map(label => <th className="p-2 text-left" key={label}>{label}</th>)}</tr></thead><tbody>{result.capexEvidence.map(item => <tr key={item.fiscalYear}>{[item.fiscalYear, ...[item.reportedTotalCapex, item.tangibleCapex, item.intangibleCapex, item.maintenanceCapexEstimate, item.growthCapexEstimate].map(v => amount(v))].map((v, i) => <td className="p-2" key={i}>{v}</td>)}</tr>)}</tbody></table></div></details>}
      </section>
    </>}
  </div>;
}
