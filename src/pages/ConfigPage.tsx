import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sliders,
  RotateCcw,
  Save,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Sparkles,
  Info,
  Layers,
  Percent,
  Play,
  RefreshCw,
  ExternalLink,
  Shield,
  ChevronDown,
  ChevronUp,
  Copy,
  Zap,
} from 'lucide-react';
import { useAppConfig } from '../context/ThemeLanguageContext';
import { useAccount } from '../context/AccountContext';
import { useValuationConfig } from '../hooks/useValuationConfig';
import {
  VALUATION_PRESETS,
  ValuationPreset,
  validateValuationConditions,
  type ValuationMarketGroup,
  type RegionalValuationConfigs,
} from '../utils/valuationConfig';
import type { ValuationConditions } from '../services/valuationApi';
import {
  bulkRecalculateValuation,
  BulkRecalculateResponse,
  bulkFillMaintenanceCapex,
  BulkFillMaintenanceCapexResponse,
  refreshStockPrices,
  QuickPriceRefreshResponse,
} from '../services/adminApi';
import { valuationMarketCap, valuationPercent, valuationPrice } from '../utils/valuationFormatters';

const box = 'rounded-3xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#1C1C1E] p-6 sm:p-8 shadow-sm transition-colors duration-300';
const label = 'text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center gap-1.5 mb-1.5';
const sublabel = 'text-[11px] text-[#86868B] leading-relaxed mb-2.5 block';
const input = 'w-full rounded-2xl border border-black/[0.08] dark:border-white/[0.1] bg-[#F2F4F6] dark:bg-[#2C2C2E] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] font-medium focus:outline-none focus:border-[#0071E3] dark:focus:border-[#2997FF] px-3.5 py-3 transition-colors';
const buttonPrimary = 'inline-flex items-center justify-center gap-2 rounded-full bg-[#0071E3] hover:bg-[#0077ED] dark:bg-[#2997FF] dark:hover:bg-[#0071E3] text-white text-xs font-semibold px-6 py-2.5 shadow-sm transition-all disabled:opacity-40 cursor-pointer';
const buttonSecondary = 'inline-flex items-center justify-center gap-2 rounded-full bg-[#F5F5F7] dark:bg-[#2C2C2E] hover:bg-[#EBEBED] dark:hover:bg-[#3A3A3C] text-[#1D1D1F] dark:text-[#F5F5F7] text-xs font-semibold px-5 py-2.5 border border-black/[0.06] dark:border-white/[0.08] transition-all cursor-pointer';

function formatConditionSummary(c: ValuationConditions, ko: boolean): string {
  const cap = `${Math.round(Number(c.growthRateCap) * 1000) / 10}%`;
  const floor =
    c.growthRateFloor == null || c.growthRateFloor === ''
      ? ko
        ? '없음'
        : 'None'
      : `${Math.round(Number(c.growthRateFloor) * 1000) / 10}%`;
  return `${c.normalizationYears}${ko ? '개년' : 'Y'} · ${c.normalizationMethod} · ${c.capexMode} · ${c.growthMethod} · ${cap}/${floor}`;
}

export const ConfigPage: React.FC = () => {
  const { language } = useAppConfig();
  const { user } = useAccount();
  const isAdmin = user?.role === 'admin';
  const ko = language === 'ko';
  const { configs, isCustom, isCustomUs, isCustomKr, saveRegionalConfigs, resetConfig } =
    useValuationConfig();

  // Active region tab ('us' | 'kr') and regional draft forms
  const [activeRegion, setActiveRegion] = useState<ValuationMarketGroup>('us');
  const [forms, setForms] = useState<RegionalValuationConfigs>(() => ({
    us: { ...configs.us },
    kr: { ...configs.kr },
  }));
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activePresets, setActivePresets] = useState<{ us: string | null; kr: string | null }>({
    us: null,
    kr: null,
  });

  // Quick price refresh state
  const [priceMarketGroup, setPriceMarketGroup] = useState<'ALL' | 'US' | 'KR'>('ALL');
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [priceResult, setPriceResult] = useState<QuickPriceRefreshResponse | null>(null);
  const [showPriceTableDetails, setShowPriceTableDetails] = useState(true);

  // Bulk recalculation state
  const [bulkMarketGroup, setBulkMarketGroup] = useState<'ALL' | 'US' | 'KR'>('ALL');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [bulkResult, setBulkResult] = useState<BulkRecalculateResponse | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showTableDetails, setShowTableDetails] = useState(true);

  // Bulk fill maintenance capex state
  const [bulkFillLoading, setBulkFillLoading] = useState(false);
  const [bulkFillError, setBulkFillError] = useState<string | null>(null);
  const [bulkFillResult, setBulkFillResult] = useState<BulkFillMaintenanceCapexResponse | null>(null);
  const [showFillConfirmModal, setShowFillConfirmModal] = useState(false);
  const [overwriteExisting, setOverwriteExisting] = useState(false);

  const form = forms[activeRegion];
  const activePreset = activePresets[activeRegion];
  const usValidation = validateValuationConditions(forms.us);
  const krValidation = validateValuationConditions(forms.kr);
  const bothValid = usValidation.valid && krValidation.valid;
  const isFormDirty =
    JSON.stringify(forms.us) !== JSON.stringify(configs.us) ||
    JSON.stringify(forms.kr) !== JSON.stringify(configs.kr);

  const handleApplyPreset = (preset: ValuationPreset) => {
    setForms((prev) => ({
      ...prev,
      [activeRegion]: { ...preset.conditions },
    }));
    setActivePresets((prev) => ({
      ...prev,
      [activeRegion]: preset.id,
    }));
    setSaveSuccess(false);
  };

  const handleCopyFromOtherRegion = () => {
    const sourceRegion: ValuationMarketGroup = activeRegion === 'us' ? 'kr' : 'us';
    setForms((prev) => ({
      ...prev,
      [activeRegion]: { ...prev[sourceRegion] },
    }));
    setActivePresets((prev) => ({
      ...prev,
      [activeRegion]: prev[sourceRegion],
    }));
    setSaveSuccess(false);
  };

  const handleFieldChange = (patch: Partial<ValuationConditions>) => {
    setForms((prev) => ({
      ...prev,
      [activeRegion]: { ...prev[activeRegion], ...patch },
    }));
    setActivePresets((prev) => ({
      ...prev,
      [activeRegion]: null,
    }));
    setSaveSuccess(false);
  };

  const handleSave = () => {
    if (!bothValid) return;
    saveRegionalConfigs(forms);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  const handleResetCurrentRegion = () => {
    const def = resetConfig(activeRegion);
    setForms((prev) => ({
      ...prev,
      [activeRegion]: { ...def },
    }));
    setActivePresets((prev) => ({
      ...prev,
      [activeRegion]: 'buffett_conservative',
    }));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  const handleResetAllRegions = () => {
    const def = resetConfig();
    setForms({
      us: { ...def },
      kr: { ...def },
    });
    setActivePresets({
      us: 'buffett_conservative',
      kr: 'buffett_conservative',
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  const handleRunQuickPriceRefresh = async () => {
    if (!bothValid) return;
    setPriceLoading(true);
    setPriceError(null);
    setPriceResult(null);

    try {
      saveRegionalConfigs(forms);
      const res = await refreshStockPrices({
        marketGroup: priceMarketGroup,
        usConditions: forms.us,
        krConditions: forms.kr,
      });
      setPriceResult(res);
    } catch (err) {
      setPriceError(err instanceof Error ? err.message : String(err));
    } finally {
      setPriceLoading(false);
    }
  };

  const handleRunBulkRecalculate = async () => {
    setShowConfirmModal(false);
    if (!bothValid) return;
    setBulkLoading(true);
    setBulkError(null);
    setBulkResult(null);

    try {
      // Save both US and KR configurations to local storage
      saveRegionalConfigs(forms);

      // Call bulk recalculation API with separate US and KR conditions
      const res = await bulkRecalculateValuation({
        conditions: forms.us,
        usConditions: forms.us,
        krConditions: forms.kr,
        marketGroup: bulkMarketGroup,
        apply: true,
      });
      setBulkResult(res);
    } catch (err) {
      setBulkError(err instanceof Error ? err.message : String(err));
    } finally {
      setBulkLoading(false);
    }
  };

  const handleRunBulkFillCapex = async () => {
    setShowFillConfirmModal(false);
    setBulkFillLoading(true);
    setBulkFillError(null);
    setBulkFillResult(null);

    try {
      const res = await bulkFillMaintenanceCapex({
        overwrite_existing: overwriteExisting,
      });
      setBulkFillResult(res);
    } catch (err) {
      setBulkFillError(err instanceof Error ? err.message : String(err));
    } finally {
      setBulkFillLoading(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-6 sm:py-10 space-y-8 animate-fade-in">
      {/* Top Breadcrumb & Return Link */}
      <div className="flex items-center justify-between gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6E6E73] dark:text-[#86868B] hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {ko ? '스크리너로 돌아가기' : 'Back to screener'}
        </Link>
      </div>

      {/* Header Banner */}
      <header className={box}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="w-10 h-10 rounded-2xl bg-[#0071E3]/10 dark:bg-[#2997FF]/15 text-[#0071E3] dark:text-[#2997FF] flex items-center justify-center">
                <Sliders className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {ko ? '내재가치 계산 조건 설정 (미국 · 한국 분리)' : 'Valuation Defaults (US & Korea)'}
              </h1>
              <span
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                  isCustom
                    ? 'bg-[#0071E3]/10 text-[#0071E3] dark:text-[#2997FF] border-[#0071E3]/20'
                    : 'bg-[#86868B]/10 text-[#86868B] border-[#86868B]/20'
                }`}
              >
                {isCustom
                  ? ko
                    ? '커스텀 기본값 적용 중'
                    : 'Custom Defaults Active'
                  : ko
                  ? '시스템 표준 기본값'
                  : 'System Standard Defaults'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#86868B] max-w-2xl leading-relaxed">
              {ko
                ? '미국 시장(NASDAQ·NYSE)과 한국 시장(KOSPI·KOSDAQ)의 내재가치(DCF) 계산 조건을 각각 독립적으로 설정할 수 있습니다. 저장된 조건은 각 국가 종목 페이지 진입 시 자동 적용되며, 관리자 일괄 재계산 및 현재가 업데이트 시에도 국가별로 분리 적용됩니다.'
                : 'Configure independent DCF valuation defaults for US (NASDAQ/NYSE) and Korean (KOSPI/KOSDAQ) markets. Applied automatically per stock market and during bulk recalculation.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleResetAllRegions}
              className={buttonSecondary}
              title={ko ? '미국·한국 모두 엔진 표준값으로 복원' : 'Reset both US and KR to system defaults'}
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#86868B]" />
              <span>{ko ? '전체 기본값 초기화' : 'Reset All Defaults'}</span>
            </button>
            <button
              onClick={handleSave}
              disabled={!bothValid || (!isFormDirty && !isCustom && !activePresets.us && !activePresets.kr)}
              className={buttonPrimary}
            >
              <Save className="w-3.5 h-3.5" />
              <span>{ko ? '미국·한국 설정 저장' : 'Save US & KR Config'}</span>
            </button>
          </div>
        </div>

        {/* Success feedback toast */}
        {saveSuccess && (
          <div className="mt-5 p-3.5 rounded-2xl bg-[#34C759]/10 border border-[#34C759]/20 flex items-center gap-2.5 text-xs font-semibold text-[#34C759] animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>
              {ko
                ? '미국(US) 및 한국(KR) 계산 조건 기본값이 브라우저에 저장되었습니다.'
                : 'US and Korea valuation default conditions saved to this browser.'}
            </span>
          </div>
        )}

        {/* Validation error alert */}
        {(!usValidation.valid || !krValidation.valid) && (
          <div className="mt-5 p-3.5 rounded-2xl bg-[#FF3B30]/10 border border-[#FF3B30]/20 flex items-center gap-2.5 text-xs font-semibold text-[#FF3B30] animate-fade-in">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              {!usValidation.valid
                ? `[US] ${usValidation.error}`
                : `[KR] ${krValidation.error}`}
            </span>
          </div>
        )}
      </header>

      {/* Market Selector Tabs (US vs KR) & Comparison Bar */}
      <section className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setActiveRegion('us')}
            className={`text-left rounded-3xl p-5 border transition-all cursor-pointer ${
              activeRegion === 'us'
                ? 'border-[#0071E3] dark:border-[#2997FF] bg-[#0071E3]/[0.06] dark:bg-[#2997FF]/[0.12] shadow-sm ring-1 ring-[#0071E3]'
                : 'border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#1C1C1E] hover:border-black/[0.14] dark:hover:border-white/[0.16]'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-base">🇺🇸</span>
                <span className="text-sm font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                  {ko ? '미국 주식 설정 (US · NASDAQ / NYSE)' : 'US Market (NASDAQ / NYSE)'}
                </span>
              </div>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  activeRegion === 'us'
                    ? 'bg-[#0071E3] text-white'
                    : isCustomUs
                    ? 'bg-[#0071E3]/10 text-[#0071E3] dark:text-[#2997FF]'
                    : 'bg-[#86868B]/10 text-[#86868B]'
                }`}
              >
                {activeRegion === 'us'
                  ? ko
                    ? '편집 중'
                    : 'Editing'
                  : isCustomUs
                  ? ko
                    ? '커스텀'
                    : 'Custom'
                  : ko
                  ? '표준'
                  : 'Default'}
              </span>
            </div>
            <p className="text-[11px] font-mono text-[#86868B] truncate">
              {formatConditionSummary(forms.us, ko)}
            </p>
          </button>

          <button
            type="button"
            onClick={() => setActiveRegion('kr')}
            className={`text-left rounded-3xl p-5 border transition-all cursor-pointer ${
              activeRegion === 'kr'
                ? 'border-[#0071E3] dark:border-[#2997FF] bg-[#0071E3]/[0.06] dark:bg-[#2997FF]/[0.12] shadow-sm ring-1 ring-[#0071E3]'
                : 'border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#1C1C1E] hover:border-black/[0.14] dark:hover:border-white/[0.16]'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-base">🇰🇷</span>
                <span className="text-sm font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                  {ko ? '한국 주식 설정 (KR · KOSPI / KOSDAQ)' : 'Korea Market (KOSPI / KOSDAQ)'}
                </span>
              </div>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  activeRegion === 'kr'
                    ? 'bg-[#0071E3] text-white'
                    : isCustomKr
                    ? 'bg-[#0071E3]/10 text-[#0071E3] dark:text-[#2997FF]'
                    : 'bg-[#86868B]/10 text-[#86868B]'
                }`}
              >
                {activeRegion === 'kr'
                  ? ko
                    ? '편집 중'
                    : 'Editing'
                  : isCustomKr
                  ? ko
                    ? '커스텀'
                    : 'Custom'
                  : ko
                  ? '표준'
                  : 'Default'}
              </span>
            </div>
            <p className="text-[11px] font-mono text-[#86868B] truncate">
              {formatConditionSummary(forms.kr, ko)}
            </p>
          </button>
        </div>
      </section>

      {/* Preset Fast Selection Cards */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#0071E3] dark:text-[#2997FF]" />
            <h2 className="text-sm font-bold tracking-tight">
              {activeRegion === 'us'
                ? ko
                  ? '🇺🇸 미국 주식 투자 스타일 프리셋'
                  : '🇺🇸 US Strategy Presets'
                : ko
                ? '🇰🇷 한국 주식 투자 스타일 프리셋'
                : '🇰🇷 Korea Strategy Presets'}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleCopyFromOtherRegion}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0071E3] dark:text-[#2997FF] hover:underline cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>
              {activeRegion === 'us'
                ? ko
                  ? '한국(KR) 설정값 그대로 가져오기'
                  : 'Copy from Korea (KR) settings'
                : ko
                ? '미국(US) 설정값 그대로 가져오기'
                : 'Copy from US settings'}
            </span>
          </button>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {VALUATION_PRESETS.map((preset) => {
            const isSelected = activePreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className={`text-left rounded-2xl p-5 border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#0071E3] dark:border-[#2997FF] bg-[#0071E3]/5 dark:bg-[#2997FF]/10 shadow-sm ring-1 ring-[#0071E3]'
                    : 'border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#1C1C1E] hover:border-black/[0.12] dark:hover:border-white/[0.16]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                    {ko ? preset.nameKo : preset.nameEn}
                  </span>
                  {isSelected && (
                    <span className="text-[10px] font-bold text-[#0071E3] dark:text-[#2997FF] bg-[#0071E3]/10 px-2 py-0.5 rounded-full">
                      {ko ? '선택됨' : 'Active'}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#86868B] leading-relaxed">
                  {ko ? preset.descriptionKo : preset.descriptionEn}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Parameter Edit Form Card */}
      <section className={box}>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#0071E3] dark:text-[#2997FF]" />
            <h2 className="text-base font-bold tracking-tight">
              {activeRegion === 'us'
                ? ko
                  ? '🇺🇸 미국 주식 (NASDAQ · NYSE) 상세 계산 파라미터'
                  : '🇺🇸 US Market Detailed Calculation Parameters'
                : ko
                ? '🇰🇷 한국 주식 (KOSPI · KOSDAQ) 상세 계산 파라미터'
                : '🇰🇷 Korea Market Detailed Calculation Parameters'}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleResetCurrentRegion}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>
              {activeRegion === 'us'
                ? ko
                  ? '미국 설정만 기본값 복원'
                  : 'Reset US Only'
                : ko
                ? '한국 설정만 기본값 복원'
                : 'Reset KR Only'}
            </span>
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
          {/* 1. Normalization Years */}
          <div>
            <label className={label}>
              <span>{ko ? '1. 재무자료 정상화 기간' : '1. History Normalization Period'}</span>
            </label>
            <span className={sublabel}>
              {ko
                ? '주주이익 및 순이익을 집계할 과거 회계연도 기간 (1~5개년)'
                : 'Number of past fiscal years to normalize owner earnings (1-5 yrs)'}
            </span>
            <select
              className={input}
              value={form.normalizationYears}
              onChange={(e) =>
                handleFieldChange({
                  normalizationYears: Number(e.target.value) as 1 | 2 | 3 | 4 | 5,
                })
              }
            >
              {[1, 2, 3, 4, 5].map((y) => (
                <option key={y} value={y}>
                  {y}
                  {ko ? '개년' : ' fiscal years'}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Normalization Method */}
          <div>
            <label className={label}>
              <span>{ko ? '2. 이익 정상화 방식' : '2. Normalization Method'}</span>
            </label>
            <span className={sublabel}>
              {ko
                ? '과거 실적 중 대표값을 선택하는 통계 방식'
                : 'Statistical metric to pick baseline normalized earnings'}
            </span>
            <select
              className={input}
              value={form.normalizationMethod}
              onChange={(e) =>
                handleFieldChange({
                  normalizationMethod: e.target.value as 'CONSERVATIVE' | 'MEAN',
                })
              }
            >
              <option value="CONSERVATIVE">
                {ko ? '최근값·중간값 중 낮은 값 (보수적)' : 'Lower of latest and median (Conservative)'}
              </option>
              <option value="MEAN">{ko ? '산술 평균 (Mean)' : 'Arithmetic mean'}</option>
            </select>
          </div>

          {/* 3. CAPEX Mode */}
          <div>
            <label className={label}>
              <span>{ko ? '3. 자본적 지출 (CAPEX) 기준' : '3. CAPEX Mode'}</span>
            </label>
            <span className={sublabel}>
              {ko
                ? '주주이익 계산 시 CFO에서 차감할 설비투자액 기준'
                : 'Capital expenditure subtracted from CFO for owner earnings'}
            </span>
            <select
              className={input}
              value={form.capexMode}
              onChange={(e) =>
                handleFieldChange({
                  capexMode: e.target.value as 'TOTAL' | 'MAINTENANCE',
                })
              }
            >
              <option value="TOTAL">{ko ? '공시 총 CAPEX (보수적)' : 'Total reported CAPEX'}</option>
              <option value="MAINTENANCE">
                {ko ? '유지보수 CAPEX 추정액' : 'Estimated maintenance CAPEX'}
              </option>
            </select>
          </div>

          {/* 4. Growth Method */}
          <div>
            <label className={label}>
              <span>{ko ? '4. 성장률 산출 방식' : '4. Growth Rate Method'}</span>
            </label>
            <span className={sublabel}>
              {ko
                ? '미래 현금흐름 추정 시 사용할 기준 성장률 계산식'
                : 'CAGR blending formula used for future cash projection'}
            </span>
            <select
              className={input}
              value={form.growthMethod}
              onChange={(e) =>
                handleFieldChange({
                  growthMethod: e.target.value as 'LOWER_BOUND' | 'OEPS_WEIGHTED' | 'EQUAL_BLEND',
                })
              }
            >
              <option value="OEPS_WEIGHTED">
                {ko ? 'OEPS 70% + EPS 30% 가중 복합' : 'OEPS 70% / EPS 30% Weighted Blend'}
              </option>
              <option value="LOWER_BOUND">
                {ko ? '둘 중 낮은 값 (보수적 하한)' : 'Lower bound (Conservative)'}
              </option>
              <option value="EQUAL_BLEND">
                {ko ? '50:50 동일 가중치' : '50:50 Equal Blend'}
              </option>
            </select>
          </div>

          {/* 5. Growth Rate Cap */}
          <div>
            <label className={label}>
              <Percent className="w-3.5 h-3.5 text-[#0071E3] dark:text-[#2997FF]" />
              <span>{ko ? '5. 성장률 상한선 (%)' : '5. Growth Rate Cap (%)'}</span>
            </label>
            <span className={sublabel}>
              {ko
                ? '고성장 기업에 대한 과대평가 방지용 최대 한도 (0 ~ 100%)'
                : 'Maximum allowable growth rate cap to prevent overvaluation'}
            </span>
            <div className="relative">
              <input
                className={input}
                type="number"
                min={0}
                max={100}
                step="0.5"
                value={
                  isNaN(Number(form.growthRateCap)) ? '' : Math.round(Number(form.growthRateCap) * 1000) / 10
                }
                onChange={(e) =>
                  handleFieldChange({
                    growthRateCap: String(Number(e.target.value) / 100),
                  })
                }
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-semibold text-[#86868B]">
                %
              </span>
            </div>
          </div>

          {/* 6. Growth Rate Floor */}
          <div>
            <label className={label}>
              <Percent className="w-3.5 h-3.5 text-[#0071E3] dark:text-[#2997FF]" />
              <span>{ko ? '6. 성장률 하한선 (%)' : '6. Growth Rate Floor (%)'}</span>
            </label>
            <span className={sublabel}>
              {ko
                ? '우량주의 일시적 침체 방어선 (빈칸 = 제한 없음)'
                : 'Floor protection against cyclical downturns (blank = none)'}
            </span>
            <div className="relative">
              <input
                className={input}
                type="number"
                min={-99.9}
                max={100}
                step="0.5"
                placeholder={ko ? '하한선 없음 (빈칸)' : 'No floor (blank)'}
                value={
                  form.growthRateFloor == null || form.growthRateFloor === ''
                    ? ''
                    : Math.round(Number(form.growthRateFloor) * 1000) / 10
                }
                onChange={(e) =>
                  handleFieldChange({
                    growthRateFloor:
                      e.target.value.trim() === '' ? null : String(Number(e.target.value) / 100),
                  })
                }
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-semibold text-[#86868B]">
                %
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-8 pt-6 border-t border-black/[0.04] dark:border-white/[0.06]">
          <p className="text-xs text-[#86868B]">
            {ko
              ? '저장 시 미국(US)·한국(KR) 설정이 각각 브라우저에 보관되며, 각 시장의 개별 종목 내재가치 페이지에서 기본값으로 사용됩니다.'
              : 'Saved per market (US & KR) in this browser and applied when inspecting individual stock valuations.'}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={handleResetAllRegions}
              className={buttonSecondary}
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#86868B]" />
              <span>{ko ? '전체 초기화' : 'Reset All'}</span>
            </button>
            <button
              onClick={handleSave}
              disabled={!bothValid}
              className={buttonPrimary}
            >
              <Save className="w-3.5 h-3.5" />
              <span>{ko ? '미국·한국 설정 저장하기' : 'Save US & KR Settings'}</span>
            </button>
          </div>
        </div>
      </section>

      {isAdmin && (
        <>
          {/* Admin Quick Current Price Update Section */}
          <section className="rounded-3xl border border-amber-500/25 dark:border-amber-400/25 bg-gradient-to-br from-amber-500/[0.03] to-transparent dark:from-amber-400/[0.04] p-6 sm:p-8 shadow-sm transition-colors duration-300 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-white bg-amber-500 dark:bg-amber-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Zap className="w-3 h-3" />
                QUICK PRICE
              </span>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
                {ko ? '전 종목 현재가만 빠르게 업데이트' : 'Quick Current Price Refresh'}
              </h2>
            </div>
            <p className="text-xs text-[#86868B] max-w-2xl leading-relaxed">
              {ko
                ? '무거운 7년치 재무/공시 수집을 생략하고 토스증권에서 최신 주식 현재가만 빠르게 가져와 시가총액·안전마진·스크리너 노출가를 즉시 갱신합니다.'
                : 'Fetches only the latest stock prices without full 7-year financial/filing collection and immediately updates market cap and margin of safety.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <select
              value={priceMarketGroup}
              disabled={priceLoading}
              onChange={(e) => setPriceMarketGroup(e.target.value as 'ALL' | 'US' | 'KR')}
              className="rounded-full border border-black/[0.08] dark:border-white/[0.12] bg-white dark:bg-[#2C2C2E] text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] px-4 py-2.5 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">{ko ? '전체 종목 (미국 + 한국)' : 'All Markets (US + KR)'}</option>
              <option value="US">{ko ? '🇺🇸 미국 종목만 (NASDAQ·NYSE)' : '🇺🇸 US Stocks Only'}</option>
              <option value="KR">{ko ? '🇰🇷 한국 종목만 (KOSPI·KOSDAQ)' : '🇰🇷 Korea Stocks Only'}</option>
            </select>

            <button
              type="button"
              disabled={priceLoading || !bothValid}
              onClick={handleRunQuickPriceRefresh}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-6 py-3 shadow-md hover:shadow-lg transition-all disabled:opacity-40 cursor-pointer shrink-0"
            >
              {priceLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{ko ? '현재가 빠르게 갱신 중…' : 'Refreshing prices…'}</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-current" />
                  <span>{ko ? '현재가만 빠르게 업데이트' : 'Quick Refresh Prices'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {priceError && (
          <div className="p-4 rounded-2xl bg-[#FF3B30]/10 border border-[#FF3B30]/20 flex items-start gap-3 text-xs text-[#FF3B30] animate-fade-in">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">{ko ? '현재가 업데이트 실패' : 'Quick Price Refresh Failed'}</p>
              <p className="text-[11px] text-[#86868B] dark:text-[#A1A1A6]">{priceError}</p>
            </div>
          </div>
        )}

        {priceResult && (
          <div className="space-y-5 animate-fade-in pt-2">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="bg-white dark:bg-[#1C1C1E] p-4 rounded-2xl border border-black/[0.06] dark:border-white/[0.08]">
                <span className="text-[11px] text-[#86868B] block font-medium">
                  {ko ? '총 대상 종목' : 'Total Stocks'}
                </span>
                <span className="text-xl font-bold font-mono tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] mt-1 block">
                  {priceResult.totalStocks}
                </span>
              </div>
              <div className="bg-white dark:bg-[#1C1C1E] p-4 rounded-2xl border border-black/[0.06] dark:border-white/[0.08]">
                <span className="text-[11px] text-[#86868B] block font-medium">
                  {ko ? '현재가 조회 성공' : 'Price Fetched'}
                </span>
                <span className="text-xl font-bold font-mono tracking-tight text-amber-500 mt-1 block">
                  {priceResult.priceUpdatedCount}
                </span>
              </div>
              <div className="bg-white dark:bg-[#1C1C1E] p-4 rounded-2xl border border-black/[0.06] dark:border-white/[0.08]">
                <span className="text-[11px] text-[#86868B] block font-medium">
                  {ko ? '스크리너 반영 완료' : 'Valuation Updated'}
                </span>
                <span className="text-xl font-bold font-mono tracking-tight text-[#34C759] mt-1 block">
                  {priceResult.valuationUpdatedCount}
                </span>
              </div>
              <div className="bg-white dark:bg-[#1C1C1E] p-4 rounded-2xl border border-black/[0.06] dark:border-white/[0.08]">
                <span className="text-[11px] text-[#86868B] block font-medium">
                  {ko ? '건너뜀' : 'Skipped'}
                </span>
                <span className="text-xl font-bold font-mono tracking-tight text-[#86868B] mt-1 block">
                  {priceResult.skippedCount}
                </span>
              </div>
              <div className="bg-white dark:bg-[#1C1C1E] p-4 rounded-2xl border border-black/[0.06] dark:border-white/[0.08]">
                <span className="text-[11px] text-[#86868B] block font-medium">
                  {ko ? '오류 실패' : 'Failed'}
                </span>
                <span className={`text-xl font-bold font-mono tracking-tight mt-1 block ${priceResult.failedCount > 0 ? 'text-[#FF3B30]' : 'text-[#86868B]'}`}>
                  {priceResult.failedCount}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setShowPriceTableDetails((v) => !v)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
              >
                {showPriceTableDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                <span>
                  {showPriceTableDetails
                    ? ko
                      ? '종목별 현재가 갱신 내역 접기'
                      : 'Hide Price Refresh Details'
                    : ko
                    ? `종목별 현재가 갱신 내역 펼치기 (${priceResult.items.length}개)`
                    : `Show Price Refresh Details (${priceResult.items.length})`}
                </span>
              </button>

              <Link
                to="/"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#34C759] hover:underline"
              >
                <span>{ko ? '갱신된 스크리너 확인하러 가기' : 'View Updated Screener'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {showPriceTableDetails && priceResult.items.length > 0 && (
              <div className="overflow-x-auto rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#1C1C1E]">
                <table className="w-full text-xs whitespace-nowrap">
                  <thead className="text-[11px] font-medium text-[#86868B] border-b border-black/[0.05] dark:border-white/[0.06] bg-[#F5F5F7]/50 dark:bg-[#2C2C2E]/40">
                    <tr>
                      <th className="py-2.5 px-4 text-left font-medium">{ko ? '티커' : 'Ticker'}</th>
                      <th className="py-2.5 px-4 text-left font-medium">{ko ? '종목명' : 'Company'}</th>
                      <th className="py-2.5 px-4 text-left font-medium">{ko ? '시장' : 'Market'}</th>
                      <th className="py-2.5 px-4 text-left font-medium">{ko ? '이전 현재가 → 최신 현재가' : 'Prev → Latest Price'}</th>
                      <th className="py-2.5 px-4 text-left font-medium">{ko ? '기준일' : 'As Of'}</th>
                      <th className="py-2.5 px-4 text-left font-medium">{ko ? '시가총액' : 'Market Cap'}</th>
                      <th className="py-2.5 px-4 text-left font-medium">{ko ? '내재가치' : 'Intrinsic Value'}</th>
                      <th className="py-2.5 px-4 text-left font-medium">{ko ? '안전마진' : 'Margin'}</th>
                      <th className="py-2.5 px-4 text-left font-medium">{ko ? '상태' : 'Status'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.06] font-mono tabular-nums">
                    {priceResult.items.map((item) => {
                      const prev = item.previousPrice != null ? Number(item.previousPrice) : null;
                      const curr = item.currentPrice != null ? Number(item.currentPrice) : null;
                      return (
                        <tr key={item.ticker} className="hover:bg-[#F5F5F7]/80 dark:hover:bg-[#2C2C2E]/60 transition-colors">
                          <td className="py-2 px-4 font-bold">
                            <Link
                              to={`/stock/${encodeURIComponent(item.ticker)}/valuation`}
                              className="text-[#0071E3] dark:text-[#2997FF] hover:underline"
                              target="_blank"
                            >
                              {item.ticker}
                            </Link>
                          </td>
                          <td className="py-2 px-4 font-sans font-medium text-[#1D1D1F] dark:text-[#F5F5F7] max-w-[180px] truncate">
                            {item.name}
                          </td>
                          <td className="py-2 px-4 text-[#86868B]">{item.market}</td>
                          <td className="py-2 px-4">
                            <span className="text-[#86868B]">
                              {valuationPrice(prev, item.currency, ko)}
                            </span>
                            <span className="mx-1.5 text-[#86868B]">→</span>
                            <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                              {valuationPrice(curr, item.currency, ko)}
                            </span>
                          </td>
                          <td className="py-2 px-4 text-[#86868B]">{item.priceAsOf ?? '—'}</td>
                          <td className="py-2 px-4 text-[#86868B]">
                            {valuationMarketCap(item.marketCap != null ? Number(item.marketCap) : null, item.currency, ko)}
                          </td>
                          <td className="py-2 px-4 text-[#0071E3] dark:text-[#2997FF] font-semibold">
                            {valuationPrice(item.intrinsicValuePerShare != null ? Number(item.intrinsicValuePerShare) : null, item.currency, ko)}
                          </td>
                          <td className="py-2 px-4 font-semibold">
                            {valuationPercent(item.conservativeMarginOfSafety != null ? Number(item.conservativeMarginOfSafety) : null)}
                          </td>
                          <td className="py-2 px-4">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                item.status === 'PASS_WITH_MARGIN'
                                  ? 'bg-[#34C759]/10 text-[#34C759]'
                                  : item.status === 'WATCH'
                                  ? 'bg-[#FF9500]/10 text-[#FF9500]'
                                  : item.status === 'ERROR'
                                  ? 'bg-[#FF3B30]/10 text-[#FF3B30]'
                                  : 'bg-[#86868B]/10 text-[#86868B]'
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Admin Bulk Recalculation Section */}
      <section className="rounded-3xl border border-[#0071E3]/20 dark:border-[#2997FF]/20 bg-gradient-to-br from-[#0071E3]/[0.02] to-transparent dark:from-[#2997FF]/[0.03] p-6 sm:p-8 shadow-sm transition-colors duration-300 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-white bg-[#0071E3] dark:bg-[#2997FF] px-2 py-0.5 rounded-full flex items-center gap-1">
                <Shield className="w-3 h-3" />
                ADMIN
              </span>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
                {ko ? '관리자 전 종목 일괄 재계산 (미국 · 한국 조건 분리 적용)' : 'Admin Bulk Recalculation (US & KR Conditions)'}
              </h2>
            </div>
            <p className="text-xs text-[#86868B] max-w-2xl leading-relaxed">
              {ko
                ? '미국 종목에는 미국(US) 설정을, 한국 종목에는 한국(KR) 설정을 각각 적용하여 1~5개년 전 기간 내재가치를 일괄 재산출합니다. 특정 국가만 선택하여 재계산할 수도 있습니다.'
                : 'Applies US settings to US stocks and Korea settings to Korean stocks across 1-5 fiscal year horizons. You can also target a single market group.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <select
              value={bulkMarketGroup}
              disabled={bulkLoading}
              onChange={(e) => setBulkMarketGroup(e.target.value as 'ALL' | 'US' | 'KR')}
              className="rounded-full border border-black/[0.08] dark:border-white/[0.12] bg-white dark:bg-[#2C2C2E] text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] px-4 py-2.5 focus:outline-none focus:border-[#0071E3]"
            >
              <option value="ALL">{ko ? '전체 (미국·한국 각각 적용)' : 'All (Apply US & KR)'}</option>
              <option value="US">{ko ? '🇺🇸 미국 종목만 재계산' : '🇺🇸 US Stocks Only'}</option>
              <option value="KR">{ko ? '🇰🇷 한국 종목만 재계산' : '🇰🇷 Korea Stocks Only'}</option>
            </select>

            <button
              type="button"
              disabled={bulkLoading || !bothValid}
              onClick={() => setShowConfirmModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0071E3] hover:bg-[#0077ED] dark:bg-[#2997FF] dark:hover:bg-[#0071E3] text-white text-xs font-semibold px-6 py-3 shadow-md hover:shadow-lg transition-all disabled:opacity-40 cursor-pointer shrink-0"
            >
              {bulkLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{ko ? '일괄 재계산 중…' : 'Recalculating stocks…'}</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>{ko ? '1~5개년 일괄 재계산 실행' : 'Recalculate (1-5Y)'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Bulk Error Alert */}
        {bulkError && (
          <div className="p-4 rounded-2xl bg-[#FF3B30]/10 border border-[#FF3B30]/20 flex items-start gap-3 text-xs text-[#FF3B30] animate-fade-in">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">{ko ? '일괄 재계산 실패' : 'Bulk Recalculation Failed'}</p>
              <p className="text-[11px] text-[#86868B] dark:text-[#A1A1A6]">{bulkError}</p>
            </div>
          </div>
        )}

        {/* Bulk Success & Summary Report */}
        {bulkResult && (
          <div className="space-y-5 animate-fade-in pt-2">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="bg-white dark:bg-[#1C1C1E] p-4 rounded-2xl border border-black/[0.06] dark:border-white/[0.08]">
                <span className="text-[11px] text-[#86868B] block font-medium">
                  {ko ? '총 대상 종목' : 'Total Stocks'}
                </span>
                <span className="text-xl font-bold font-mono tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] mt-1 block">
                  {bulkResult.totalStocks}
                </span>
              </div>
              <div className="bg-white dark:bg-[#1C1C1E] p-4 rounded-2xl border border-black/[0.06] dark:border-white/[0.08]">
                <span className="text-[11px] text-[#86868B] block font-medium">
                  {ko ? '재계산 완료' : 'Recalculated'}
                </span>
                <span className="text-xl font-bold font-mono tracking-tight text-[#0071E3] dark:text-[#2997FF] mt-1 block">
                  {bulkResult.recalculatedCount}
                </span>
              </div>
              <div className="bg-white dark:bg-[#1C1C1E] p-4 rounded-2xl border border-black/[0.06] dark:border-white/[0.08]">
                <span className="text-[11px] text-[#86868B] block font-medium">
                  {ko ? '공식 DB 반영' : 'Applied to DB'}
                </span>
                <span className="text-xl font-bold font-mono tracking-tight text-[#34C759] mt-1 block">
                  {bulkResult.appliedCount}
                </span>
              </div>
              <div className="bg-white dark:bg-[#1C1C1E] p-4 rounded-2xl border border-black/[0.06] dark:border-white/[0.08]">
                <span className="text-[11px] text-[#86868B] block font-medium">
                  {ko ? '계산 불가 패스' : 'Skipped (N/A)'}
                </span>
                <span className="text-xl font-bold font-mono tracking-tight text-[#FF9500] mt-1 block">
                  {bulkResult.skippedCount ?? 0}
                </span>
              </div>
              <div className="bg-white dark:bg-[#1C1C1E] p-4 rounded-2xl border border-black/[0.06] dark:border-white/[0.08]">
                <span className="text-[11px] text-[#86868B] block font-medium">
                  {ko ? '오류 실패' : 'Failed'}
                </span>
                <span className={`text-xl font-bold font-mono tracking-tight mt-1 block ${bulkResult.failedCount > 0 ? 'text-[#FF3B30]' : 'text-[#86868B]'}`}>
                  {bulkResult.failedCount}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setShowTableDetails((v) => !v)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0071E3] dark:text-[#2997FF] hover:underline cursor-pointer"
              >
                {showTableDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                <span>
                  {showTableDetails
                    ? ko
                      ? '종목별 재계산 결과 목록 접기'
                      : 'Hide Detailed Stock Results'
                    : ko
                    ? `종목별 재계산 결과 목록 펼치기 (${bulkResult.items.length}개)`
                    : `Show Detailed Stock Results (${bulkResult.items.length})`}
                </span>
              </button>

              <Link
                to="/"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#34C759] hover:underline"
              >
                <span>{ko ? '갱신된 스크리너 확인하러 가기' : 'View Updated Screener'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Detailed Table */}
            {showTableDetails && bulkResult.items.length > 0 && (
              <div className="overflow-x-auto rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#1C1C1E]">
                <table className="w-full text-xs whitespace-nowrap">
                  <thead className="text-[11px] font-medium text-[#86868B] border-b border-black/[0.05] dark:border-white/[0.06] bg-[#F5F5F7]/50 dark:bg-[#2C2C2E]/40">
                    <tr>
                      <th className="py-2.5 px-4 text-left font-medium">{ko ? '티커' : 'Ticker'}</th>
                      <th className="py-2.5 px-4 text-left font-medium">{ko ? '종목명' : 'Company'}</th>
                      <th className="py-2.5 px-4 text-left font-medium">{ko ? '시장' : 'Market'}</th>
                      <th className="py-2.5 px-4 text-left font-medium">{ko ? '대표 상태' : 'Status'}</th>
                      <th className="py-2.5 px-4 text-left font-medium">{ko ? '1~5개년 산출 현황' : '1Y~5Y Status'}</th>
                      <th className="py-2.5 px-4 text-left font-medium">{ko ? '기준 내재가치' : 'Intrinsic Value'}</th>
                      <th className="py-2.5 px-4 text-left font-medium">{ko ? '안전마진' : 'Margin'}</th>
                      <th className="py-2.5 px-4 text-left font-medium">{ko ? 'EPS 성장' : 'EPS Growth'}</th>
                      <th className="py-2.5 px-4 text-left font-medium">{ko ? '변경 여부' : 'Changed'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.06] font-mono tabular-nums">
                    {bulkResult.items.map((item) => (
                      <tr key={item.ticker} className="hover:bg-[#F5F5F7]/80 dark:hover:bg-[#2C2C2E]/60 transition-colors">
                        <td className="py-2 px-4 font-bold">
                          <Link
                            to={`/stock/${encodeURIComponent(item.ticker)}/valuation`}
                            className="text-[#0071E3] dark:text-[#2997FF] hover:underline"
                            target="_blank"
                          >
                            {item.ticker}
                          </Link>
                        </td>
                        <td className="py-2 px-4 font-sans font-medium text-[#1D1D1F] dark:text-[#F5F5F7] max-w-[180px] truncate">
                          {item.name}
                        </td>
                        <td className="py-2 px-4 text-[#86868B]">{item.market}</td>
                        <td className="py-2 px-4">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              item.status === 'PASS_WITH_MARGIN'
                                ? 'bg-[#34C759]/10 text-[#34C759]'
                                : item.status === 'WATCH'
                                ? 'bg-[#FF9500]/10 text-[#FF9500]'
                                : item.status === 'ERROR'
                                ? 'bg-[#FF3B30]/10 text-[#FF3B30]'
                                : 'bg-[#86868B]/10 text-[#86868B]'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="py-2 px-4">
                          <div className="flex items-center gap-1 font-mono text-[10px]">
                            {[1, 2, 3, 4, 5].map((y) => {
                              const st = item.periodStatus?.[String(y)];
                              const ok = st && st !== 'N/A';
                              return (
                                <span
                                  key={y}
                                  title={`${y}개년: ${st ?? 'N/A'}`}
                                  className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                                    ok
                                      ? 'bg-[#34C759]/15 text-[#34C759]'
                                      : 'bg-[#86868B]/10 text-[#86868B]'
                                  }`}
                                >
                                  {y}Y
                                </span>
                              );
                            })}
                          </div>
                        </td>
                        <td className="py-2 px-4 text-[#0071E3] dark:text-[#2997FF] font-semibold">
                          {valuationPrice(item.intrinsicValuePerShare ? Number(item.intrinsicValuePerShare) : null, item.market === 'KOSPI' || item.market === 'KOSDAQ' ? 'KRW' : 'USD', ko)}
                        </td>
                        <td className="py-2 px-4 font-semibold">
                          {valuationPercent(item.conservativeMarginOfSafety ? Number(item.conservativeMarginOfSafety) : null)}
                        </td>
                        <td className="py-2 px-4 text-[#86868B]">
                          {valuationPercent(item.epsGrowth ? Number(item.epsGrowth) : null)}
                        </td>
                        <td className="py-2 px-4">
                          {item.changed ? (
                            <span className="text-[10px] font-bold text-[#0071E3] dark:text-[#2997FF] bg-[#0071E3]/10 px-1.5 py-0.5 rounded">
                              UPDATED
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#86868B]">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Admin Bulk Maintenance CapEx Fill Section */}
      <section className="rounded-3xl border border-emerald-500/20 dark:border-emerald-400/20 bg-gradient-to-br from-emerald-500/[0.02] to-transparent dark:from-emerald-400/[0.03] p-6 sm:p-8 shadow-sm transition-colors duration-300 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-white bg-emerald-600 dark:bg-emerald-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Shield className="w-3 h-3" />
                ADMIN
              </span>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
                {ko ? '유지보수 CAPEX 전 종목 일괄 채우기' : 'Bulk Fill Maintenance CAPEX for All Stocks'}
              </h2>
            </div>
            <p className="text-xs text-[#86868B] max-w-2xl leading-relaxed">
              {ko
                ? 'DB에 등록된 모든 종목의 연간 재무제표에 대해 유형자산 감가상각비 기준으로 유지보수 CAPEX 추정치(min(감가상각비, 총 CAPEX))를 일괄 입력합니다. 기존에 직접 입력한 유지보수 CAPEX는 기본적으로 보존됩니다.'
                : 'Bulk-populates maintenance CAPEX estimates as min(depreciation_ppe, total_capex) across all annual financial records in the database. Existing manual estimates are preserved by default.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
            <label className="flex items-center gap-2 text-xs text-[#86868B] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={overwriteExisting}
                disabled={bulkFillLoading}
                onChange={(e) => setOverwriteExisting(e.target.checked)}
                className="rounded border-black/20 dark:border-white/20 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
              />
              <span>{ko ? '기존 입력값 덮어쓰기' : 'Overwrite existing'}</span>
            </label>
            <button
              type="button"
              disabled={bulkFillLoading}
              onClick={() => setShowFillConfirmModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-xs font-semibold px-6 py-3 shadow-md hover:shadow-lg transition-all disabled:opacity-40 cursor-pointer"
            >
              {bulkFillLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{ko ? '일괄 채우는 중…' : 'Populating all records…'}</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>{ko ? '유지보수 CAPEX 전 종목 일괄 채우기 실행' : 'Fill Maintenance CAPEX for All Stocks'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Bulk Fill Error Alert */}
        {bulkFillError && (
          <div className="p-4 rounded-2xl bg-[#FF3B30]/10 border border-[#FF3B30]/20 flex items-start gap-3 text-xs text-[#FF3B30] animate-fade-in">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">{ko ? '일괄 입력 실패' : 'Bulk Fill Failed'}</p>
              <p className="text-[11px] text-[#86868B] dark:text-[#A1A1A6]">{bulkFillError}</p>
            </div>
          </div>
        )}

        {/* Bulk Fill Success Report */}
        {bulkFillResult && (
          <div className="space-y-3 animate-fade-in pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white dark:bg-[#1C1C1E] p-4 rounded-2xl border border-black/[0.06] dark:border-white/[0.08]">
                <span className="text-[11px] text-[#86868B] block font-medium">
                  {ko ? '검사한 연간 재무 행' : 'Total Records Checked'}
                </span>
                <span className="text-xl font-bold font-mono tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] mt-1 block">
                  {bulkFillResult.total_rows_checked}
                </span>
              </div>
              <div className="bg-white dark:bg-[#1C1C1E] p-4 rounded-2xl border border-black/[0.06] dark:border-white/[0.08]">
                <span className="text-[11px] text-[#86868B] block font-medium">
                  {ko ? '유지보수 CAPEX 입력 완료' : 'Updated Records'}
                </span>
                <span className="text-xl font-bold font-mono tracking-tight text-emerald-600 dark:text-emerald-400 mt-1 block">
                  {bulkFillResult.updated_rows_count}
                </span>
              </div>
              <div className="bg-white dark:bg-[#1C1C1E] p-4 rounded-2xl border border-black/[0.06] dark:border-white/[0.08]">
                <span className="text-[11px] text-[#86868B] block font-medium">
                  {ko ? '보존 / 건너뜀' : 'Skipped / Preserved'}
                </span>
                <span className="text-xl font-bold font-mono tracking-tight text-[#86868B] mt-1 block">
                  {bulkFillResult.skipped_rows_count}
                </span>
              </div>
            </div>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
              {ko
                ? `✓ 총 ${bulkFillResult.updated_rows_count}개 연도의 유지보수 CAPEX 추정치가 감가상각비 기준으로 갱신되었습니다. 상단 자본적 지출 기준을 "유지보수 CAPEX 추정액"으로 변경한 후 전 종목 일괄 재계산을 실행하시면 스크리너에 반영됩니다.`
                : `✓ Successfully populated maintenance CAPEX for ${bulkFillResult.updated_rows_count} annual records. Run bulk recalculation to publish updated valuations.`}
            </p>
          </div>
        )}
      </section>
        </>
      )}

      {/* Guide & Explanation Section */}
      <section className={box}>
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-4 h-4 text-[#0071E3] dark:text-[#2997FF]" />
          <h2 className="text-sm font-bold tracking-tight">
            {ko ? '계산 조건이 내재가치(DCF)에 미치는 영향' : 'How These Conditions Affect DCF'}
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 text-xs text-[#86868B] leading-relaxed">
          <div className="p-4 rounded-2xl bg-[#F5F5F7] dark:bg-[#2C2C2E]/60 space-y-1.5">
            <h3 className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
              {ko ? '성장률 상한과 하한' : 'Growth Caps & Floors'}
            </h3>
            <p>
              {ko
                ? 'DCF 모델은 성장률의 작은 차이에도 추정 가치가 크게 변합니다. 과거 고성장률(30~50%)을 그대로 미래에 대입하면 과대평가 위험이 커지므로 상한선(기본 20%)을 적용합니다.'
                : 'DCF results are highly sensitive to growth assumptions. A cap (default 20%) prevents compounding unrealistic short-term hypergrowth.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F5F5F7] dark:bg-[#2C2C2E]/60 space-y-1.5">
            <h3 className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
              {ko ? '총 CAPEX vs 유지보수 CAPEX' : 'Total vs Maintenance CAPEX'}
            </h3>
            <p>
              {ko
                ? '총 CAPEX를 차감하면 신규 시설투자(성장 CAPEX)까지 모두 차감되어 보수적인 주주이익이 산출됩니다. 유지보수 CAPEX를 사용하면 성장을 위한 투자를 가산하여 실질 현금창출력이 높게 평가됩니다.'
                : 'Total CAPEX includes growth investments, yielding more conservative owner earnings. Maintenance CAPEX isolates core sustaining reinvestment.'}
            </p>
          </div>
        </div>
      </section>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 sm:p-8 max-w-md w-full border border-black/[0.08] dark:border-white/[0.1] shadow-2xl space-y-5 animate-scale-up">
            <div className="w-12 h-12 rounded-2xl bg-[#0071E3]/10 dark:bg-[#2997FF]/15 text-[#0071E3] dark:text-[#2997FF] flex items-center justify-center mx-auto">
              <Shield className="w-6 h-6" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
                {ko ? '일괄 재계산을 실행하시겠습니까?' : 'Run Bulk Recalculation?'}
              </h3>
              <p className="text-xs text-[#86868B] leading-relaxed">
                {ko
                  ? '설정된 미국(US) 및 한국(KR) 조건으로 대상 종목의 1~5개년 내재가치가 일괄 재계산되며 공식 스크리너가 즉시 갱신됩니다.'
                  : 'Recalculates 1 to 5 fiscal year intrinsic valuations using the configured US and Korea conditions.'}
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#F5F5F7] dark:bg-[#2C2C2E] text-xs font-mono text-[#86868B] space-y-2">
              {(bulkMarketGroup === 'ALL' || bulkMarketGroup === 'US') && (
                <div>
                  <div className="font-bold text-[#1D1D1F] dark:text-[#F5F5F7] mb-0.5">
                    🇺🇸 {ko ? '미국 종목 적용 조건' : 'US Stocks'}
                  </div>
                  <div>{formatConditionSummary(forms.us, ko)}</div>
                </div>
              )}
              {(bulkMarketGroup === 'ALL' || bulkMarketGroup === 'KR') && (
                <div>
                  <div className="font-bold text-[#1D1D1F] dark:text-[#F5F5F7] mb-0.5">
                    🇰🇷 {ko ? '한국 종목 적용 조건' : 'Korea Stocks'}
                  </div>
                  <div>{formatConditionSummary(forms.kr, ko)}</div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className={buttonSecondary}
              >
                {ko ? '취소' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleRunBulkRecalculate}
                className={buttonPrimary}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{ko ? '지금 실행하기' : 'Execute Now'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Fill Confirmation Modal */}
      {showFillConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 sm:p-8 max-w-md w-full border border-black/[0.08] dark:border-white/[0.1] shadow-2xl space-y-5 animate-scale-up">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-400/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <Shield className="w-6 h-6" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
                {ko ? '유지보수 CAPEX 전 종목 일괄 채우기 실행' : 'Fill Maintenance CAPEX for All Stocks?'}
              </h3>
              <p className="text-xs text-[#86868B] leading-relaxed">
                {ko
                  ? 'DB 내 모든 연간 재무제표의 유지보수 CAPEX 추정치를 유형자산 감가상각비 기준으로 일괄 산출하여 채웁니다.'
                  : 'Calculates and populates maintenance CAPEX estimates as min(depreciation_ppe, total_capex) across all annual financial records in the database.'}
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#F5F5F7] dark:bg-[#2C2C2E] text-xs font-mono text-[#86868B] space-y-1">
              <div>• {ko ? '산출 공식' : 'Formula'}: min(유형자산 감가상각비, 총 CAPEX)</div>
              <div>• {ko ? '기존값 처리' : 'Existing Values'}: {overwriteExisting ? (ko ? '덮어쓰기 (ON)' : 'Overwrite (ON)') : (ko ? '기존값 보존 (OFF)' : 'Preserve (OFF)')}</div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowFillConfirmModal(false)}
                className={buttonSecondary}
              >
                {ko ? '취소' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleRunBulkFillCapex}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-xs font-semibold px-6 py-2.5 shadow-sm transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{ko ? '일괄 채우기 실행' : 'Execute Fill'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigPage;
