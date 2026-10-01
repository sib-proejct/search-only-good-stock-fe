import { Calculator, Info } from 'lucide-react';
import type { ValuationResult } from '../../services/adminApi';
import {
  formatMonetaryAmount,
  formatPerShare,
  formatShares,
  parseNumeric,
} from '../../utils/numberFormatters';
import { getDcfWarningLabel } from '../../utils/ruleFormatters';

interface ValuationCalculationDetailsProps {
  result: ValuationResult;
  currency: string;
}

const formatPercent = (value: number | null): string =>
  value === null ? '—' : `${(value * 100).toFixed(2)}%`;

const formatSignedPercent = (value: number): string =>
  `${value >= 0 ? '+' : ''}${(value * 100).toFixed(2)}%`;

const growthCalculationText = (
  method: ValuationResult['options']['growth_method'],
  epsGrowth: number | null | undefined,
  oepsGrowth: number | null | undefined,
  rawGrowth: number | null | undefined,
): string => {
  if (rawGrowth == null) return '—';
  if (epsGrowth == null && oepsGrowth == null) return formatSignedPercent(rawGrowth);
  if (epsGrowth == null) {
    return `OEPS만 유효: ${formatSignedPercent(rawGrowth)}`;
  }
  if (oepsGrowth == null) {
    return `EPS만 유효: ${formatSignedPercent(rawGrowth)}`;
  }
  if (epsGrowth < 0 || oepsGrowth < 0 || method === 'LOWER_BOUND') {
    return `min(${formatSignedPercent(epsGrowth)}, ${formatSignedPercent(oepsGrowth)}) = ${formatSignedPercent(rawGrowth)}`;
  }
  if (method === 'OEPS_WEIGHTED') {
    return `EPS 30% + OEPS 70% = ${formatSignedPercent(rawGrowth)}`;
  }
  return `(EPS + OEPS) ÷ 2 = ${formatSignedPercent(rawGrowth)}`;
};

const median = (values: number[]): number | null => {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
};

const statusLabel = (status: string): string =>
  ({
    PASS_WITH_MARGIN: '안전마진 충족',
    WATCH: '추가 검토',
    NO_MARGIN: '안전마진 부족',
    'N/A': '계산 불가',
  })[status] ?? status;

const reasonLabel = (code: string, normalizedOwnerEarnings: number | null): string => {
  if (code === 'NON_POSITIVE_DENOMINATOR' && normalizedOwnerEarnings !== null && normalizedOwnerEarnings <= 0) {
    return '정규화 Owner Earnings가 0 이하라 DCF를 계산하지 않았습니다.';
  }
  return ({
    FINANCIAL_SECTOR: '금융업종에는 현재 Owner Earnings DCF를 적용하지 않습니다.',
    MISSING_DATA: '필수 계산 데이터가 부족합니다.',
    INSUFFICIENT_HISTORY: '선택한 계산기간에 필요한 연속 이력이 부족합니다.',
    NON_POSITIVE_DENOMINATOR: '계산에 필요한 분모가 0 이하입니다.',
    UNKNOWN_INTEREST_CLASSIFICATION: '지급이자의 CFO 포함 여부를 확인해야 합니다.',
    PREREQUISITE_FAILED: 'DCF 선행 조건을 충족하지 못했습니다.',
  } as Record<string, string>)[code] ?? code;
};

export function ValuationCalculationDetails({
  result,
  currency,
}: ValuationCalculationDetailsProps) {
  const dcf = result.dcf;
  if (!dcf) return null;

  const selectedRows = result.annual_oe.filter((row) => row.selected);
  const ownerEarningsValues = selectedRows
    .map((row) => parseNumeric(row.owner_earnings))
    .filter((value): value is number => value !== null);
  const latestOwnerEarnings = ownerEarningsValues.at(-1) ?? null;
  const medianOwnerEarnings = median(ownerEarningsValues);
  const impliedShares =
    dcf.normalizedOwnerEarnings !== null &&
    dcf.normalizedOeps !== null &&
    dcf.normalizedOeps !== 0
      ? dcf.normalizedOwnerEarnings / dcf.normalizedOeps
      : null;
  const scenarios = dcf.scenarios
    ? [
        ['보수적', dcf.scenarios.conservative],
        ['기준', dcf.scenarios.base],
        ['낙관적', dcf.scenarios.optimistic],
      ] as const
    : [];
  const growthWasCapped =
    dcf.rawGrowth !== null &&
    dcf.growthCap !== null &&
    dcf.rawGrowth > dcf.growthCap;
  const growthWasFloored =
    dcf.rawGrowth !== null &&
    dcf.growthFloor !== null &&
    dcf.rawGrowth < dcf.growthFloor;
  const growthEndYear = Math.max(...result.annual_oe.map((row) => row.fiscal_year));
  const growthStartYear = growthEndYear - result.options.normalization_years;
  const growthStart = result.annual_oe.find((row) => row.fiscal_year === growthStartYear);
  const growthEnd = result.annual_oe.find((row) => row.fiscal_year === growthEndYear);
  const startEps = parseNumeric(growthStart?.diluted_eps);
  const endEps = parseNumeric(growthEnd?.diluted_eps);
  const startShares = parseNumeric(growthStart?.diluted_shares);
  const endShares = parseNumeric(growthEnd?.diluted_shares);
  const startOe = parseNumeric(growthStart?.owner_earnings);
  const endOe = parseNumeric(growthEnd?.owner_earnings);
  const startOeps = startOe !== null && startShares !== null && startShares > 0
    ? startOe / startShares
    : null;
  const endOeps = endOe !== null && endShares !== null && endShares > 0
    ? endOe / endShares
    : null;

  return (
    <details
      open
      className="group rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-950/20 overflow-hidden"
    >
      <summary className="cursor-pointer list-none p-4 flex items-center justify-between gap-3 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <div>
            <h3 className="text-sm font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
              계산식 & 지표 해설
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              입력값에서 Owner Earnings, 성장률, DCF 내재가치와 안전마진까지 계산되는 과정
            </p>
          </div>
        </div>
        <span className="text-xs font-mono text-blue-600 dark:text-blue-400 group-open:hidden">
          펼치기
        </span>
        <span className="text-xs font-mono text-blue-600 dark:text-blue-400 hidden group-open:inline">
          접기
        </span>
      </summary>

      <div className="p-4 pt-0 space-y-4">
        <div className="grid md:grid-cols-2 gap-3">
          <fieldset className="min-w-0 rounded-xl bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] p-4 space-y-2">
            <legend className="px-1 text-sm font-semibold">1. 연도별 Owner Earnings</legend>
            <p className="text-xs text-gray-500">
              <span className="font-mono font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                조정 CFO − 선택 CAPEX = Owner Earnings
              </span>
              <br />
              지급이자가 CFO 밖에 분류된 경우에만 CFO에서 지급이자를 추가 차감합니다.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono tabular-nums">
                <thead className="text-gray-500 border-b border-black/[0.06] dark:border-white/[0.08]">
                  <tr>
                    <th className="py-2 text-left">연도</th>
                    <th className="py-2 text-right">조정 CFO</th>
                    <th className="py-2 text-right">CAPEX</th>
                    <th className="py-2 text-right">OE</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedRows.map((row) => {
                    const capex = parseNumeric(row.capex);
                    const ownerEarnings = parseNumeric(row.owner_earnings);
                    const adjustedCfo =
                      capex !== null && ownerEarnings !== null
                        ? capex + ownerEarnings
                        : null;
                    return (
                      <tr key={row.fiscal_year} className="border-b last:border-0 border-black/[0.04] dark:border-white/[0.06]">
                        <td className="py-2 font-bold">{row.fiscal_year}</td>
                        <td className="py-2 text-right text-blue-600 dark:text-blue-400">
                          {formatMonetaryAmount(adjustedCfo, currency)}
                        </td>
                        <td className="py-2 text-right text-gray-500">
                          {formatMonetaryAmount(capex, currency)}
                        </td>
                        <td className={`py-2 text-right font-bold ${ownerEarnings !== null && ownerEarnings < 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                          {formatMonetaryAmount(ownerEarnings, currency)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </fieldset>

          <fieldset className="min-w-0 rounded-xl bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] p-4 space-y-3">
            <legend className="px-1 text-sm font-semibold">2. OE 정규화와 주당 환산</legend>
            <div className="text-xs text-gray-500 space-y-2">
              {result.options.normalization_method === 'MEAN' ? (
                <p>
                  <span className="font-mono font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                    정규화 OE = 선택기간 OE 합계 ÷ {ownerEarningsValues.length || result.options.normalization_years}
                  </span>
                  <br />
                  기간 평균 방식으로 일시적인 연도별 변동을 완화합니다.
                </p>
              ) : (
                <p>
                  <span className="font-mono font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                    정규화 OE = min(최근 OE, 기간 중앙값)
                  </span>
                  <br />
                  min({formatMonetaryAmount(latestOwnerEarnings, currency)}, {formatMonetaryAmount(medianOwnerEarnings, currency)})
                </p>
              )}
              <div className="rounded-lg bg-black/[0.025] dark:bg-white/[0.04] p-3">
                <span className="block">정규화 Owner Earnings</span>
                <strong className="text-base text-[#1D1D1F] dark:text-[#F5F5F7]">
                  {formatMonetaryAmount(dcf.normalizedOwnerEarnings, currency)}
                </strong>
              </div>
              <p>
                <span className="font-mono font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                  OEPS = 정규화 OE ÷ 현재 희석주식수
                </span>
                <br />
                {formatMonetaryAmount(dcf.normalizedOwnerEarnings, currency)} ÷{' '}
                {impliedShares === null ? '—' : `${Math.round(impliedShares).toLocaleString()}주`} ={' '}
                <strong>{formatPerShare(dcf.normalizedOeps, currency)}/주</strong>
              </p>
            </div>
          </fieldset>

          <fieldset className="min-w-0 rounded-xl bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] p-4 space-y-3">
            <legend className="px-1 text-sm font-semibold">3. 성장률과 할인율</legend>
            <div className="space-y-2 text-xs">
              <p className="text-gray-500 leading-relaxed">
                CAGR은 시작값에서 종료값까지 매년 같은 비율로 복리 성장했다고 환산한
                연평균 성장률입니다. 선택한 {result.options.normalization_years}년은 관측치
                수가 아니라 경과연수이므로 {growthStartYear}년과 {growthEndYear}년을 포함한{' '}
                {result.options.normalization_years + 1}개 연간 자료가 필요합니다.
              </p>
              <div className="rounded-lg bg-black/[0.025] dark:bg-white/[0.04] p-3 space-y-3 font-mono tabular-nums">
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <strong>EPS CAGR</strong>
                    <strong className="text-blue-600 dark:text-blue-400">{formatPercent(dcf.epsGrowth ?? null)}</strong>
                  </div>
                  <p className="mt-1 text-gray-500 break-words">
                    ({formatPerShare(endEps, currency)} ÷ {formatPerShare(startEps, currency)})
                    <sup>1/{result.options.normalization_years}</sup> − 1
                  </p>
                  <p className="mt-1 text-[11px] text-gray-400">
                    희석 EPS: {growthStartYear}년 {formatPerShare(startEps, currency)} →{' '}
                    {growthEndYear}년 {formatPerShare(endEps, currency)}
                  </p>
                </div>
                <div className="border-t border-black/[0.06] dark:border-white/[0.08] pt-3">
                  <div className="flex items-center justify-between gap-3">
                    <strong>OEPS CAGR</strong>
                    <strong className="text-blue-600 dark:text-blue-400">{formatPercent(dcf.oepsGrowth ?? null)}</strong>
                  </div>
                  <p className="mt-1 text-gray-500 break-words">
                    ({formatPerShare(endOeps, currency)} ÷ {formatPerShare(startOeps, currency)})
                    <sup>1/{result.options.normalization_years}</sup> − 1
                  </p>
                  <p className="mt-1 text-[11px] text-gray-400">
                    OEPS = 해당 연도 OE ÷ 해당 연도 희석주식수
                    <br />
                    {growthStartYear}년 {formatMonetaryAmount(startOe, currency)} ÷ {formatShares(startShares)} = {formatPerShare(startOeps, currency)}
                    {' · '}{growthEndYear}년 {formatMonetaryAmount(endOe, currency)} ÷ {formatShares(endShares)} = {formatPerShare(endOeps, currency)}
                  </p>
                </div>
              </div>
              {(dcf.epsGrowth == null || dcf.oepsGrowth == null) && (
                <p className="text-amber-600 dark:text-amber-400 leading-relaxed">
                  CAGR은 시작값과 종료값이 모두 0보다 크고, 구간 내 연간 자료가 모두
                  존재할 때만 계산합니다. 표시되지 않은 지표는 이 조건을 충족하지 못했습니다.
                </p>
              )}
            </div>
            <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 text-xs">
              <dt className="text-gray-500">원성장률</dt>
              <dd className="font-mono font-bold">
                {growthCalculationText(
                  result.options.growth_method,
                  dcf.epsGrowth,
                  dcf.oepsGrowth,
                  dcf.rawGrowth,
                )}
              </dd>
              <dt className="text-gray-500">성장률 상한</dt>
              <dd className="font-mono font-bold">{formatPercent(dcf.growthCap)}</dd>
              <dt className="text-gray-500">성장률 하한</dt>
              <dd className="font-mono font-bold">{formatPercent(dcf.growthFloor)}</dd>
              <dt className="text-gray-500">기준 성장률 = 원성장률의 하한·상한 적용값</dt>
              <dd className="font-mono font-bold text-blue-600 dark:text-blue-400">
                {formatPercent(dcf.baseGrowth)}
              </dd>
              <dt className="text-gray-500">할인율</dt>
              <dd className="font-mono font-bold">{formatPercent(dcf.discountRate)}</dd>
            </dl>
            <p className="text-xs text-gray-500 leading-relaxed">
              선택한 산정 방식은 EPS와 OEPS 성장률이 모두 유효할 때 적용됩니다. 한 지표만
              유효하면 해당 성장률을 사용하고, 하나라도 음수이면 더 낮은 성장률을
              사용합니다. 산정 후에는 기업별 성장률 하한·상한 범위로 제한해 기준
              성장률로 적용합니다. 할인율은 무위험금리와 시장위험 프리미엄을 합산하고
              7% 하한 및 부채 안전성 가산금리를 반영합니다.
            </p>
            {growthWasCapped && (
              <p className="rounded-lg bg-amber-50 p-2 text-xs leading-relaxed text-amber-700 dark:bg-amber-950/20 dark:text-amber-400">
                선택한 산정 방식으로 원성장률은 {formatPercent(dcf.rawGrowth)}이지만,
                성장률 상한 {formatPercent(dcf.growthCap)}이 적용되어 기준 성장률은{' '}
                {formatPercent(dcf.baseGrowth)}입니다.
              </p>
            )}
            {growthWasFloored && (
              <p className="rounded-lg bg-amber-50 p-2 text-xs leading-relaxed text-amber-700 dark:bg-amber-950/20 dark:text-amber-400">
                선택한 산정 방식으로 원성장률은 {formatPercent(dcf.rawGrowth)}이지만,
                성장률 하한 {formatPercent(dcf.growthFloor)}이 적용되어 기준 성장률은{' '}
                {formatPercent(dcf.baseGrowth)}입니다.
              </p>
            )}
          </fieldset>

          <fieldset className="min-w-0 rounded-xl bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] p-4 space-y-3">
            <legend className="px-1 text-sm font-semibold">4. DCF 내재가치와 안전마진</legend>
            <p className="text-xs text-gray-500 leading-relaxed">
              향후 10년 OEPS와 영구가치를 할인율로 현재가치화합니다. 보수적 내재가치를
              기준으로 현재가 대비 할인 폭을 계산합니다.
            </p>
            {scenarios.length > 0 ? (
              <div className="space-y-2">
                {scenarios.map(([label, scenario]) => (
                  <div key={label} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 text-xs">
                    <span className="font-semibold">{label}</span>
                    <span className="text-gray-500 font-mono">
                      성장 {formatPercent(scenario.growthRate)} · 영구 {formatPercent(scenario.terminalGrowthRate)}
                    </span>
                    <strong className="font-mono">
                      {formatPerShare(scenario.intrinsicValuePerShare, currency)}/주
                    </strong>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-amber-600">선행 계산값이 유효하지 않아 DCF 시나리오를 만들지 않았습니다.</p>
            )}
            <div className="rounded-lg bg-black/[0.025] dark:bg-white/[0.04] p-3 text-xs">
              <span className="font-mono block">
                안전마진 = (보수적 내재가치 − 현재가) ÷ 보수적 내재가치
              </span>
              <strong className="text-base mt-1 block">
                {formatPercent(dcf.conservativeMarginOfSafety)} · {statusLabel(dcf.status)}
              </strong>
            </div>
          </fieldset>
        </div>

        {(dcf.reasonCodes.length > 0 || dcf.warnings.length > 0) && (
          <section className="rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400">
              <Info className="w-3.5 h-3.5" />
              계산 결과 참고사항
            </div>
            {dcf.reasonCodes.map((code) => (
              <p key={code} className="text-xs text-gray-600 dark:text-gray-400">
                {reasonLabel(code, dcf.normalizedOwnerEarnings)}
              </p>
            ))}
            {dcf.warnings.map((warning) => (
              <p key={warning} className="text-xs text-gray-600 dark:text-gray-400">
                {getDcfWarningLabel(warning, 'ko')}
              </p>
            ))}
          </section>
        )}
      </div>
    </details>
  );
}
