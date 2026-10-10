import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStocks } from '../hooks/useStocks';
import { useAppConfig } from '../context/ThemeLanguageContext';
import { getCoreGradeInfo } from '../utils/ruleFormatters';
import { periodNote, valuationPercent, valuationPrice } from '../utils/valuationFormatters';
import type { Market, CoreGradeFilter, ValuationStatus, StockSort } from '../types/api';

interface Props { searchQuery?: string; onSelectStock?: (ticker: string) => void }
const control = 'rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-[#1C1C1E] px-3 py-2 text-sm';

export function ScreenerPage({ searchQuery = '' }: Props) {
  const { language } = useAppConfig();
  const ko = language === 'ko';
  const state = useStocks();
  const { setSearchQuery } = state;
  useEffect(() => { setSearchQuery(searchQuery); }, [searchQuery, setSearchQuery]);
  const href = (ticker: string, market: string) => `/stock/${encodeURIComponent(ticker)}/valuation?market=${encodeURIComponent(market)}&years=${state.years}`;
  return <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-8 space-y-6">
    <header className="space-y-3">
      <h1 className="text-3xl font-bold">{ko ? '내재가치 스크리너' : 'Intrinsic value screener'}</h1>
      <p className="text-sm text-[#86868B]">{ko ? '최근 1~5개년 재무자료로 계산한 현재의 보수적 주당 내재가치를 비교합니다.' : 'Compare current conservative intrinsic value per share using the latest 1–5 fiscal years.'}</p>
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm">{ko ? '재무자료 기간' : 'Financial history'}</span>
        {[1, 2, 3, 4, 5].map(year => <button key={year} aria-pressed={state.years === year} onClick={() => state.setYears(year)} className={`${control} ${state.years === year ? '!bg-[#0071E3] text-white' : ''}`}>{year}{ko ? '개년' : ' years'}</button>)}
      </div>
    </header>
    <div className="flex flex-wrap gap-3 items-center">
      <label className="text-sm">{ko ? '가치평가 ' : 'Valuation '}<select aria-label={ko ? '가치평가' : 'Valuation'} className={control} value={state.valuationStatus} onChange={e => state.setValuationStatus(e.target.value as ValuationStatus | 'ALL')}>
        <option value="ALL">{ko ? '전체' : 'All'}</option><option value="PASS_WITH_MARGIN">{ko ? '안전마진 확보' : 'With margin'}</option><option value="WATCH">{ko ? '관찰' : 'Watch'}</option><option value="NO_MARGIN">{ko ? '안전마진 부족' : 'No margin'}</option><option value="N/A">{ko ? '계산 불가' : 'Unavailable'}</option>
      </select></label>
      <input aria-label={ko ? '종목 검색' : 'Search stocks'} placeholder={ko ? '종목 검색' : 'Search stocks'} className={control} value={state.searchQuery} onChange={e => state.setSearchQuery(e.target.value)} />
      <select aria-label={ko ? '시장' : 'Market'} className={control} value={state.market} onChange={e => state.setMarket(e.target.value as Market | 'ALL')}>
        <option value="ALL">{ko ? '전체 시장' : 'All markets'}</option>{['KOSPI', 'KOSDAQ', 'NASDAQ', 'NYSE'].map(m => <option key={m}>{m}</option>)}
      </select>
      <select aria-label={ko ? '기업 품질' : 'Business quality'} className={control} value={state.coreGradeFilter} onChange={e => state.setCoreGradeFilter(e.target.value as CoreGradeFilter | 'ALL')}>
        <option value="ALL">{ko ? '기업 품질 전체' : 'All quality grades'}</option>{['PASS', 'HOLD', 'FAIL', 'N/A'].map(g => <option key={g}>{g}</option>)}
      </select>
      <select aria-label={ko ? '정렬' : 'Sort'} className={control} value={state.sortField} onChange={e => state.setSortField(e.target.value as StockSort)}>
        <option value="conservativeMarginOfSafety">{ko ? '선택 기간 안전마진' : 'Selected period margin'}</option><option value="ticker">{ko ? '종목' : 'Ticker'}</option><option value="currentPrice">{ko ? '현재가' : 'Price'}</option><option value="corePassCount">{ko ? '기업 품질' : 'Quality'}</option>
      </select>
      <button className={control} onClick={state.toggleSortOrder}>{state.sortOrder === 'desc' ? '↓' : '↑'}</button>
      <button className={control} onClick={state.resetFilters}>{ko ? '초기화' : 'Reset'}</button>
    </div>
    <p className="text-sm text-[#86868B]">{state.total}{ko ? '개 검색 결과' : ' results'}</p>
    {state.error && <div role="alert">{state.error} <button onClick={state.retry}>{ko ? '다시 시도' : 'Retry'}</button></div>}
    {state.loading ? <p>{ko ? '불러오는 중…' : 'Loading…'}</p> : !state.error && <>
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#1C1C1E]">
        <table className="w-full text-sm whitespace-nowrap"><thead className="text-[#86868B] border-b border-black/10 dark:border-white/10"><tr>
          <th className="p-4 text-left">{ko ? '종목' : 'Stock'}</th><th className="p-4 text-right">{ko ? '현재가' : 'Price'}</th>
          {[1, 2, 3, 4, 5].map(y => <th className={`p-4 text-right ${y === state.years ? 'text-[#0071E3]' : ''}`} key={y}>{y}{ko ? '개년' : ' years'}</th>)}
          <th className="p-4 text-right">{ko ? '안전마진' : 'Margin of safety'}</th><th className="p-4">{ko ? '기업 품질' : 'Quality'}</th>
        </tr></thead><tbody>{state.stocks.map(stock => {
          const grade = getCoreGradeInfo(stock, language);
          const selected = stock.periodValuations?.[String(state.years)];
          return <tr key={stock.id} className="border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5">
            <td className="p-4"><Link className="block font-bold text-[#0071E3]" to={href(stock.ticker, stock.market)}>{stock.ticker} · {stock.market}<span className="block text-xs text-[#86868B] font-normal">{stock.name}{stock.isStale ? ' · STALE' : ''}</span></Link></td>
            <td className="p-4 text-right tabular-nums">{valuationPrice(stock.currentPrice, stock.currency, ko)}</td>
            {[1, 2, 3, 4, 5].map(y => { const period = stock.periodValuations?.[String(y)]; return <td className={`p-4 text-right tabular-nums ${y === state.years ? 'text-[#0071E3] font-bold' : ''}`} key={y}>
              <Link title={periodNote(period, ko)} to={href(stock.ticker, stock.market)}>{valuationPrice(period?.dcf.scenarios?.conservative.intrinsicValuePerShare, stock.currency, ko)}<span className="block text-[10px] text-[#86868B]">{period?.dcf.confidence ?? '—'}{period?.dcf.warnings.includes('INCOMPLETE_GROWTH_HISTORY') ? ' ⚠' : ''}</span></Link>
            </td>; })}
            <td className="p-4 text-right tabular-nums" title={periodNote(selected, ko)}>{valuationPercent(selected?.dcf.conservativeMarginOfSafety)}</td><td className={`p-4 text-center ${grade.textClass}`}>{grade.badgeLabel}</td>
          </tr>;
        })}</tbody></table>
      </div>
      <div className="md:hidden space-y-3">{state.stocks.map(stock => {
        const period = stock.periodValuations?.[String(state.years)]; const grade = getCoreGradeInfo(stock, language);
        return <Link key={stock.id} to={href(stock.ticker, stock.market)} className="block rounded-2xl p-4 bg-white dark:bg-[#1C1C1E] border border-black/10 dark:border-white/10 space-y-2">
          <div className="flex justify-between"><strong>{stock.ticker} · {stock.market}</strong><span>{valuationPrice(stock.currentPrice, stock.currency, ko)}</span></div>
          <div className="flex justify-between text-sm"><span>{stock.name}</span><span className={grade.textClass}>{grade.badgeLabel}</span></div>
          <div className="flex justify-between text-sm text-[#0071E3]"><span>{state.years}{ko ? '개년 내재가치' : ' year value'}: {valuationPrice(period?.dcf.scenarios?.conservative.intrinsicValuePerShare, stock.currency, ko)}</span><span>{valuationPercent(period?.dcf.conservativeMarginOfSafety)}</span></div>
          <p className="text-xs text-[#86868B]">{period?.dcf.confidence} · {periodNote(period, ko)}</p>
        </Link>;
      })}</div>
      {state.stocks.length === 0 && <p>{ko ? '검색 결과가 없습니다.' : 'No results.'}</p>}
      {state.hasMore && <button className={control} disabled={state.loadingMore} onClick={state.loadMore}>{ko ? '더 보기' : 'Load more'}</button>}
    </>}
  </div>;
}
