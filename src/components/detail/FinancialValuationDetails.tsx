import type { DcfResultDTO } from '../../types/api';
import { useAppConfig } from '../../context/ThemeLanguageContext';
import { formatMonetaryAmount, formatPerShare, parseNumeric } from '../../utils/numberFormatters';
import { valuationPercent } from '../../utils/valuationFormatters';
import { getDcfWarningLabel } from '../../utils/ruleFormatters';

interface Props {
  dcf: DcfResultDTO;
  currency: string;
  annuals: Array<{ year: number; netIncome: unknown; equity: unknown }>;
}

export function FinancialValuationDetails({ dcf, currency, annuals }: Props) {
  const { language } = useAppConfig();
  const ko = language === 'ko';
  const latest = Math.max(...annuals.map(row => row.year));
  const selected = annuals.filter(row => row.year > latest - (dcf.historyYears ?? 0));
  return <section className="rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-950/20 p-4 space-y-3">
    <h3 className="text-sm font-bold">{ko ? '금융업 순이익 기반 DCF' : 'Financial earnings DCF'}</h3>
    <p className="text-xs leading-relaxed">{ko
      ? '기존 10년 할인·영구가치 방식을 사용합니다. 순이익과 ROE를 선택 기간 평균 또는 최근값·중앙값 중 낮은 값으로 정상화합니다. ROE = 보통주 순이익 ÷ 기초·기말 평균 보통주 자본.'
      : 'Uses the existing 10-year forecast and terminal value. Earnings and ROE use the mean or lower of latest and median. ROE = common net income / average opening and closing common equity.'}</p>
    <p className="text-xs font-mono">FCFE/주 = EPS × (1 − max(g, 0) / ROE)</p>
    <p className="text-xs leading-relaxed">{ko
      ? '성장에 필요한 자기자본을 유보한 뒤 남는 이익을 할인합니다. 성장률은 EPS CAGR을 사용하며 ROE 이하로 제한합니다. 역성장 시 규제자본 회수를 가정하지 않습니다. 할인율은 무위험금리 + 4%p, 최소 7%이며 일반기업 부채 가산은 적용하지 않습니다.'
      : 'Discounts earnings remaining after retaining equity for growth. Growth uses EPS CAGR and is capped at ROE. Contraction does not assume regulatory capital release. Discount rate is risk-free + 4pp, with a 7% floor and no general-company debt premium.'}</p>
    {dcf.status === 'N/A' && <p role="status" className="text-xs text-amber-700 dark:text-amber-400">{ko ? '계산 불가: 보통주 순이익·기초 및 기말 자본·가격·주식수·금리의 누락 또는 양수 조건을 확인하세요.' : 'Unavailable: check common earnings, opening and closing equity, price, shares and rates for missing inputs or non-positive values.'}</p>}
    {dcf.warnings.length > 0 && <ul className="text-xs text-amber-700 dark:text-amber-400 space-y-1">{dcf.warnings.map(warning => <li key={warning}>{getDcfWarningLabel(warning, language)}</li>)}</ul>}
    <dl className="grid sm:grid-cols-3 gap-3 text-xs">
      {[
        [ko ? '정규화 순이익' : 'Normalized net income', formatMonetaryAmount(dcf.normalizedNetIncome, currency)],
        [ko ? '정규화 EPS' : 'Normalized EPS', formatPerShare(dcf.normalizedEps, currency)],
        [ko ? '정규화 ROE' : 'Normalized ROE', valuationPercent(dcf.normalizedRoe)],
        ['EPS CAGR', valuationPercent(dcf.epsGrowth)],
        [ko ? '적용 성장률' : 'Applied growth', valuationPercent(dcf.baseGrowth)],
        [ko ? '할인율' : 'Discount rate', valuationPercent(dcf.discountRate)],
      ].map(([label, value]) => <div key={label}><dt className="text-gray-500">{label}</dt><dd className="font-mono font-bold mt-1">{value}</dd></div>)}
    </dl>
    {selected.length > 0 && <div className="overflow-x-auto"><table className="w-full text-xs tabular-nums"><thead><tr>{(ko ? ['연도', '보통주 순이익', '기말 보통주 자본', '평균 자본', 'ROE'] : ['Year', 'Common net income', 'Closing equity', 'Average equity', 'ROE']).map(label => <th className="text-left py-2" key={label}>{label}</th>)}</tr></thead><tbody>{selected.map(row => {
      const income = parseNumeric(row.netIncome);
      const equity = parseNumeric(row.equity);
      const opening = parseNumeric(annuals.find(item => item.year === row.year - 1)?.equity);
      const average = equity != null && opening != null ? (equity + opening) / 2 : null;
      return <tr key={row.year}><td className="py-2">{row.year}</td><td>{formatMonetaryAmount(income, currency)}</td><td>{formatMonetaryAmount(equity, currency)}</td><td>{formatMonetaryAmount(average, currency)}</td><td>{valuationPercent(income != null && average != null && average > 0 ? income / average : null)}</td></tr>;
    })}</tbody></table></div>}
    <p className="text-xs text-amber-700 dark:text-amber-400">{ko
      ? 'ROE 일정·외부 증자 없음의 가정이며 실제 규제자본·대손·보험 지급여력을 직접 반영하지 않은 추정입니다. 보수적·낙관적 시나리오는 계산된 가치의 낮은 값·높은 값으로 표시합니다. 금융업 품질 검증은 추가 검토가 필요합니다.'
      : 'Assumes constant ROE and no external equity issuance. Actual regulatory capital, credit losses and solvency requirements need separate review. Conservative and optimistic scenarios show the lower and higher calculated values.'}</p>
  </section>;
}
