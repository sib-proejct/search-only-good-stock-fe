import { useEffect, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Calendar, AlertTriangle, RotateCcw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useAppConfig } from '../context/ThemeLanguageContext';
import { stockApi } from '../services/api';
import { valuationRequest, type ValuationView, type ValuationConditions } from '../services/valuationApi';
import { growthUnavailableNote, periodNote, valuationAmount, valuationMarketCap, valuationPercent, valuationPrice } from '../utils/valuationFormatters';
import type { Market, StockDetailDTO } from '../types/api';
import { getCoreGradeInfo, getValuationStatusInfo, getConfidenceInfo } from '../utils/ruleFormatters';

const box = 'rounded-3xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#1C1C1E] p-5 sm:p-6 shadow-sm transition-colors duration-300';
const kpi = 'bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 sm:p-5 border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex flex-col justify-between';
const label = 'text-[11px] text-[#86868B] font-medium uppercase tracking-wider block';
const input = 'w-full rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-[#F2F4F6] dark:bg-[#2C2C2E] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] font-medium focus:outline-none focus:border-[#0071E3]/30 px-3 py-2.5 mt-1';
const button = 'rounded-full bg-[#0071E3] hover:bg-[#0077ED] dark:bg-[#2997FF] dark:hover:bg-[#0071E3] text-white text-xs font-semibold px-5 py-2 shadow-sm transition-colors disabled:opacity-40';

interface StockValuationPageProps {
  ticker?: string;
  market?: Market;
  years?: number;
  embedded?: boolean;
  onApplied?: () => void;
}

export function StockValuationPage({ ticker: panelTicker, market: panelMarket, years: panelYears, embedded = false, onApplied }: StockValuationPageProps = {}) {
  const { ticker: routeTicker = '' } = useParams();
  const ticker = panelTicker ?? routeTicker;
  const [params, setParams] = useSearchParams();
  const marketValue = params.get('market');
  const market = panelMarket ?? (['KOSPI', 'KOSDAQ', 'NASDAQ', 'NYSE'].includes(marketValue ?? '') ? marketValue as Market : undefined);
  const queryYears = panelYears ?? Number(params.get('years') || 5);
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
      const next = new URLSearchParams(params); next.set('years', String(patch.normalizationYears)); if (!embedded) setParams(next, { replace: true });
    }
  };
  const run = async (action: 'preview' | 'apply') => {
    if (!result || !conditions || busy || (action === 'apply' && dirty)) return;
    const controller = new AbortController(); actionController.current = controller;
    setBusy(true); setError('');
    try {
      const value = await valuationRequest(ticker, market, action, { baseSnapshotId: result.baseSnapshotId, conditions }, controller.signal);
      if (!controller.signal.aborted) { setResult(value); setConditions(value.conditions); if (action === 'apply') onApplied?.(); }
    } catch (err) { if (!controller.signal.aborted) setError(err instanceof Error ? err.message : String(err)); }
    finally { if (!controller.signal.aborted) setBusy(false); }
  };
  const money = (value: number | null | undefined) => valuationPrice(value, stock?.currency ?? 'KRW', ko);
  const amount = (value: unknown) => valuationAmount(value == null ? null : Number(value), stock?.currency ?? 'KRW', ko);
  const chart = [1, 2, 3, 4, 5].map(year => ({ year, value: result?.periods[String(year)]?.dcf.scenarios?.base.intrinsicValuePerShare ?? null }));
  const grade = stock ? getCoreGradeInfo(stock, language) : null;
  const valuation = getValuationStatusInfo(dcf?.status ?? 'N/A', language);
  const confidence = getConfidenceInfo(dcf?.confidence ?? 'LOW', language);
  const notes = periodNote(period, ko);
  const marginColor = dcf?.conservativeMarginOfSafety == null ? 'text-[#86868B]' : dcf.conservativeMarginOfSafety >= .2 ? 'text-[#34C759]' : dcf.conservativeMarginOfSafety >= 0 ? 'text-[#0071E3] dark:text-[#2997FF]' : 'text-[#FF3B30]';
  return <div className={embedded ? "space-y-5 animate-fade-in" : "max-w-[1600px] mx-auto px-4 sm:px-8 py-5 sm:py-8 space-y-6 animate-fade-in"}>
    {!embedded && <div className="flex flex-wrap items-center justify-between gap-3">
      <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6E6E73] dark:text-[#86868B] hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors"><ArrowLeft className="w-4 h-4" />{ko ? '스크리너로 돌아가기' : 'Back to screener'}</Link>
      <Link className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full text-xs font-semibold bg-[#F5F5F7] dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] hover:bg-[#EBEBED] dark:hover:bg-[#2C2C2E] transition-colors" to={`/stock/${encodeURIComponent(ticker)}${market ? `?market=${market}` : ''}`}>{ko ? '전체 종목 분석' : 'Full stock analysis'}<ArrowRight className="w-3.5 h-3.5" /></Link>
    </div>}
    {busy && <div role="status" className={`${box} text-center py-12 space-y-3`}><div className="inline-block w-8 h-8 border-2 border-[#0071E3] dark:border-[#2997FF] border-t-transparent rounded-full animate-spin" /><p className="text-xs text-[#86868B] font-medium">{ko ? '계산 자료를 확인하는 중…' : 'Loading valuation…'}</p></div>}
    {error && <div className={`${box} text-center border-[#FF3B30]/30`} role="alert"><AlertTriangle className="w-6 h-6 text-[#FF3B30] mx-auto mb-3" /><p className="text-xs text-[#86868B]">{error}</p><button className={`${button} inline-flex items-center gap-1.5 mt-4`} disabled={busy} onClick={() => setReload(v => v + 1)}><RotateCcw className="w-3.5 h-3.5" />{ko ? '최신 게시 자료 다시 불러오기' : 'Reload published data'}</button></div>}
    {result && conditions && stock && <>
      <header className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 sm:p-8 border border-black/[0.06] dark:border-white/[0.08] shadow-sm transition-colors duration-300">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap"><h1 id={embedded ? "drawer-stock-title" : undefined} className="text-2xl sm:text-3xl font-bold tracking-tight">{stock.name}</h1><span className="font-mono text-base font-semibold text-[#86868B]">{ticker}</span><span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#86868B]"><Calendar className="w-3 h-3" />{result.dataAsOf.slice(0, 10)}</span>{stock.isStale && <span className="text-[10px] font-bold text-[#FF9500]">STALE</span>}</div>
            <p className="text-xs sm:text-[13px] text-[#86868B]">{stock.market} · {stock.sector} · {ko ? '현재 내재가치 계산' : 'Current intrinsic value'}</p>
          </div>
          <div className="flex flex-wrap sm:flex-nowrap items-start sm:items-center gap-5 sm:gap-7">
            <div className="text-left sm:text-right"><span className={label}>{ko ? '현재가' : 'Price'}</span><p className="text-2xl sm:text-3xl font-bold font-mono tracking-tight tabular-nums">{money(stock.currentPrice)}</p><p className="text-xs text-[#86868B] mt-1">{ko ? '시가총액' : 'Market cap'}: <span className="font-semibold font-mono">{valuationMarketCap(stock.marketCap, stock.currency, ko)}</span></p></div>
            <div className="hidden sm:block w-px h-10 bg-black/[0.08] dark:bg-white/[0.1]" />
            <div className="text-left sm:text-right"><span className={`${label} text-[#0071E3] dark:text-[#2997FF]`}>{ko ? '기준 주당 내재가치' : 'Base intrinsic value'}</span><p className="text-2xl sm:text-3xl font-bold font-mono tracking-tight tabular-nums text-[#0071E3] dark:text-[#2997FF]">{money(dcf?.scenarios?.base.intrinsicValuePerShare)}</p><p className="text-xs text-[#86868B] mt-1">{selectedYears}{ko ? '개년 재무자료 기준' : ' fiscal years of history'}</p></div>
          </div>
        </div>
        {dirty && <p role="status" className="mt-5 p-3.5 rounded-2xl bg-[#FF9500]/10 border border-[#FF9500]/20 text-xs font-semibold text-[#C93400] dark:text-[#FF9500]">{ko ? '조건이 변경되었습니다. 아래 결과는 이전 계산이며 재계산 후 적용할 수 있습니다.' : 'Conditions changed. Results show the previous calculation; recalculate before applying.'}</p>}
        {result.published && !dirty && <p role="status" className="mt-5 text-xs font-semibold text-[#34C759]">{ko ? '공식 목록에 적용했습니다.' : 'Applied to the official screener.'}</p>}
        {notes && <details className="mt-5 p-3.5 rounded-2xl bg-[#FF9500]/10 border border-[#FF9500]/20"><summary className="flex items-center gap-1.5 text-xs font-bold text-[#C93400] dark:text-[#FF9500] cursor-pointer"><AlertTriangle className="w-4 h-4" />{ko ? '계산 자료 및 경고 확인' : 'Review calculation inputs and warnings'}</summary><p className="text-xs text-[#86868B] leading-relaxed mt-2">{notes}</p></details>}
        {result.defaultsUsed && <p className="text-xs text-[#86868B] mt-3">{ko ? '계산 조건이 없는 과거 게시 자료: 기존 엔진 기본 조건을 적용했습니다. 성장률 하한은 없습니다.' : 'Legacy publication without conditions: original engine defaults were used, with no growth floor.'}</p>}
      </header>
      <section className={`${embedded ? 'grid grid-cols-2' : 'grid grid-cols-2 lg:grid-cols-4'} gap-3 sm:gap-4`}>
        <div className={kpi}><span className={label}>{ko ? '핵심 판정' : 'Business quality'}</span><p className={`text-2xl sm:text-3xl font-bold tracking-tight mt-2 ${grade?.textClass}`} title={grade?.desc}>{grade?.label}</p><p className="text-[11px] text-[#86868B] mt-2 pt-2 border-t border-black/[0.04] dark:border-white/[0.06] font-mono">{stock.corePassCount} PASS · {stock.coreFailCount} FAIL · {stock.coreNaCount} NA</p></div>
        <div className={kpi}><span className={label}>{ko ? '가치평가' : 'Valuation'}</span><p className="text-base sm:text-lg font-bold text-[#0071E3] dark:text-[#2997FF] mt-2">{valuation.label}</p><p className="text-[11px] text-[#86868B] mt-2 pt-2 border-t border-black/[0.04] dark:border-white/[0.06]">Cash-Flow Proxy DCF</p></div>
        <div className={kpi}><span className={label}>{ko ? '안전마진' : 'Margin of safety'}</span><p className={`text-2xl sm:text-3xl font-bold font-mono tracking-tight tabular-nums mt-2 ${marginColor}`}>{valuationPercent(dcf?.conservativeMarginOfSafety)}</p><p className="text-[11px] text-[#86868B] mt-2 pt-2 border-t border-black/[0.04] dark:border-white/[0.06]">{ko ? '기준 DCF 추정' : 'Base DCF'}</p></div>
        <div className={kpi}><span className={label}>{ko ? '신뢰도' : 'Confidence'}</span><p className={`text-xl sm:text-2xl font-bold mt-2 ${dcf?.confidence === 'HIGH' ? 'text-[#34C759]' : dcf?.confidence === 'MEDIUM' ? 'text-[#FF9500]' : 'text-[#86868B]'}`}>{confidence.label}</p><p className="text-[11px] text-[#86868B] mt-2 pt-2 border-t border-black/[0.04] dark:border-white/[0.06]" title={confidence.desc}>{dcf?.confidence ?? '—'}</p></div>
      </section>
      <section className={box}><h2 className="text-sm font-bold tracking-tight mb-4">{ko ? '기간별 기준 주당 내재가치' : 'Base value by history period'}</h2>
        <div className="h-64"><ResponsiveContainer width="100%" height="100%"><LineChart data={chart}><CartesianGrid strokeDasharray="3 3" stroke="#86868B" opacity={0.2}/><XAxis tick={{fontSize:11,fill:'#86868B'}} dataKey="year" tickFormatter={y => `${y}${ko ? '개년' : 'y'}`}/><YAxis width={100} tick={{fontSize:11,fill:'#86868B'}} tickFormatter={v => money(v)}/><Tooltip formatter={v => money(Number(v))}/><Line type="linear" dataKey="value" stroke="#0071E3" strokeWidth={2} connectNulls={false}/></LineChart></ResponsiveContainer></div>
        <div className="flex flex-wrap gap-4 text-[11px] font-mono tabular-nums text-[#86868B] mt-3 pt-3 border-t border-black/[0.04] dark:border-white/[0.06]">{chart.map(point => <span key={point.year}>{point.year}{ko ? '개년' : 'y'}: {money(point.value)}</span>)}</div>
      </section>
      <section className="grid sm:grid-cols-3 gap-4">{(['conservative', 'base', 'optimistic'] as const).map((key, i) => <div className={box} key={key}><h2 className="text-xs font-semibold text-[#86868B]">{(ko ? ['보수적', '기준', '낙관적'] : ['Conservative', 'Base', 'Optimistic'])[i]}</h2><p className="text-xl sm:text-2xl font-mono font-bold tracking-tight tabular-nums text-[#0071E3] dark:text-[#2997FF] mt-2">{money(dcf?.scenarios?.[key].intrinsicValuePerShare)}</p><p className="text-[11px] text-[#86868B] mt-3 pt-3 border-t border-black/[0.04] dark:border-white/[0.06] font-mono">{ko ? '성장률' : 'Growth'} {valuationPercent(dcf?.scenarios?.[key].growthRate)}</p></div>)}</section>
      <section className={box}><h2 className="text-sm font-bold tracking-tight mb-4">{ko ? '계산 조건' : 'Calculation conditions'}</h2>
        <fieldset disabled={busy} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
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
      <section className={box}><h2 className="text-sm font-bold tracking-tight mb-3">{ko ? '계산 대상 및 실제 사용 연도' : 'Target and used fiscal years'}</h2>
        <dl className="grid sm:grid-cols-2 gap-3 text-xs">{[
          [ko ? '정상화 대상' : 'Normalization target', period?.normalizationTargetYears], [ko ? '정상화 유효 입력' : 'Normalization valid inputs', period?.normalizationUsedYears],
          [ko ? '성장률 대상 (기초 연도 포함)' : 'Growth target (including opening year)', period?.growthTargetYears], [ko ? 'EPS 성장률 사용' : 'EPS growth used', period?.epsGrowthUsedYears], [ko ? 'OEPS 성장률 사용' : 'OEPS growth used', period?.oepsGrowthUsedYears],
        ].map(([label, values]) => <div key={String(label)}><dt className="text-[#86868B]">{String(label)}</dt><dd className="font-mono tabular-nums mt-1">{Array.isArray(values) && values.length ? values.join(', ') : '—'}</dd></div>)}</dl>
        <p className="mt-4 text-sm font-mono tabular-nums">EPS CAGR: {valuationPercent(dcf?.epsGrowth)} · OEPS CAGR: {valuationPercent(dcf?.oepsGrowth)}</p>
        {growthUnavailableNote(period, ko) && <p className="mt-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 p-3 text-sm text-amber-700 dark:text-amber-400"><strong>{ko ? 'CAGR 계산 불가 사유: ' : 'CAGR unavailable: '}</strong>{growthUnavailableNote(period, ko)}</p>}
        <p className="mt-4 text-sm">{ko ? '누락 및 경고' : 'Missing inputs and warnings'}: {periodNote(period, ko)}</p>
        <p className="mt-2 text-sm">{ko ? '정상화 주당 주주이익' : 'Normalized owner earnings per share'}: {money(dcf?.normalizedOeps)} · {ko ? '할인율' : 'Discount rate'}: {valuationPercent(dcf?.discountRate)}</p>
      </section>
      <section className={`${box} overflow-x-auto`}><h2 className="text-sm font-bold tracking-tight mb-3">{ko ? '연도별 게시 근거' : 'Published annual evidence'}</h2>
        <table className="w-full text-xs whitespace-nowrap"><thead className="text-[11px] font-medium text-[#86868B] border-b border-black/[0.05] dark:border-white/[0.06]"><tr>{(ko ? ['연도', 'CFO', '지급이자 / 분류', '선택 CAPEX', '주주이익', 'EPS', '희석주식수', 'CAPEX 출처'] : ['Year', 'CFO', 'Interest paid / classification', 'Selected CAPEX', 'Owner earnings', 'EPS', 'Diluted shares', 'CAPEX source']).map(label => <th className="py-3 px-4 text-left font-medium" key={label}>{label}</th>)}</tr></thead><tbody className="font-mono tabular-nums divide-y divide-black/[0.04] dark:divide-white/[0.06]">{result.annualFinancials.map(annual => {
          const evidence = result.capexEvidence.find(item => item.fiscalYear === annual.fiscalYear);
          return <tr key={annual.fiscalYear} className="hover:bg-[#F5F5F7]/80 dark:hover:bg-[#2C2C2E]/60 transition-colors"><td className="py-3 px-4">{annual.fiscalYear}</td><td className="py-3 px-4">{amount(annual.cfo)}</td><td className="py-3 px-4">{amount(annual.interestPaid)} / {annual.interestPaidClassification}</td><td className="py-3 px-4">{amount(annual.capex)}</td><td className="py-3 px-4">{amount(result.annualOwnerEarnings?.[String(annual.fiscalYear)])}</td><td className="py-3 px-4">{money(annual.dilutedEps == null ? null : Number(annual.dilutedEps))}</td><td className="py-3 px-4">{annual.dilutedShares == null ? '—' : Number(annual.dilutedShares).toLocaleString()}</td><td className="py-3 px-4">{evidence ? `${evidence.provider ?? '—'} / ${evidence.documentKey ?? '—'}` : ko ? '게시된 선택값만 보유' : 'Published selected value only'}</td></tr>;
        })}</tbody></table>
        {result.capexEvidence.length > 0 && <details className="mt-4"><summary className="text-xs font-semibold cursor-pointer text-[#6E6E73] dark:text-[#86868B]">{ko ? 'CAPEX 공시 및 추정 근거' : 'Reported and estimated CAPEX'}</summary><div className="overflow-x-auto"><table className="text-xs w-full whitespace-nowrap"><thead className="text-[11px] font-medium text-[#86868B] border-b border-black/[0.05] dark:border-white/[0.06]"><tr>{(ko ? ['연도', '공시 총액', '유형', '무형', '유지 추정', '성장 추정'] : ['Year', 'Reported total', 'Tangible', 'Intangible', 'Maintenance estimate', 'Growth estimate']).map(label => <th className="py-3 px-4 text-left font-medium" key={label}>{label}</th>)}</tr></thead><tbody className="font-mono tabular-nums divide-y divide-black/[0.04] dark:divide-white/[0.06]">{result.capexEvidence.map(item => <tr key={item.fiscalYear}>{[item.fiscalYear, ...[item.reportedTotalCapex, item.tangibleCapex, item.intangibleCapex, item.maintenanceCapexEstimate, item.growthCapexEstimate].map(v => amount(v))].map((v, i) => <td className="py-3 px-4" key={i}>{v}</td>)}</tr>)}</tbody></table></div></details>}
      </section>
    </>}
  </div>;
}
