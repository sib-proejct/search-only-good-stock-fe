import type { ValuationConditions } from '../services/valuationApi';

export const STORAGE_KEY_VALUATION_CONFIG = 'sogs_default_valuation_conditions';

export const SYSTEM_DEFAULT_VALUATION_CONDITIONS: ValuationConditions = {
  normalizationYears: 5,
  normalizationMethod: 'CONSERVATIVE',
  capexMode: 'TOTAL',
  growthMethod: 'OEPS_WEIGHTED',
  growthRateCap: '0.20',
  growthRateFloor: '0.05',
};

export interface ValuationPreset {
  id: string;
  nameKo: string;
  nameEn: string;
  descriptionKo: string;
  descriptionEn: string;
  conditions: ValuationConditions;
}

export const VALUATION_PRESETS: ValuationPreset[] = [
  {
    id: 'buffett_conservative',
    nameKo: '보수적 버핏형 (기본값)',
    nameEn: 'Buffett Conservative (Default)',
    descriptionKo: '5개년 과거 자료, 낮은 값 정상화, 공시 총 CAPEX, 상한 20%, 하한 5%',
    descriptionEn: '5-year history, lower-of normalization, total CAPEX, cap 20%, floor 5%',
    conditions: { ...SYSTEM_DEFAULT_VALUATION_CONDITIONS },
  },
  {
    id: 'moderate_growth',
    nameKo: '균형형 (평균치 반영)',
    nameEn: 'Balanced Moderate',
    descriptionKo: '5개년 평균 정상화, 동일 비중 성장률, 상한 25%, 하한 0%',
    descriptionEn: '5-year mean normalization, equal blend growth, cap 25%, floor 0%',
    conditions: {
      normalizationYears: 5,
      normalizationMethod: 'MEAN',
      capexMode: 'TOTAL',
      growthMethod: 'EQUAL_BLEND',
      growthRateCap: '0.25',
      growthRateFloor: '0',
    },
  },
  {
    id: 'aggressive_growth',
    nameKo: '성장주형 (유지 CAPEX)',
    nameEn: 'Growth Focus',
    descriptionKo: '3개년 평균, 유지보수 CAPEX 우선, 상한 30%, 하한 없음',
    descriptionEn: '3-year mean, maintenance CAPEX, cap 30%, no floor',
    conditions: {
      normalizationYears: 3,
      normalizationMethod: 'MEAN',
      capexMode: 'MAINTENANCE',
      growthMethod: 'OEPS_WEIGHTED',
      growthRateCap: '0.30',
      growthRateFloor: null,
    },
  },
];

function getStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
    if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
      return (globalThis as unknown as { localStorage: Storage }).localStorage;
    }
  } catch {
    // ignore
  }
  return null;
}

export function validateValuationConditions(conditions: Partial<ValuationConditions>): { valid: boolean; error?: string } {
  if (!conditions) {
    return { valid: false, error: 'Conditions cannot be empty' };
  }

  const years = conditions.normalizationYears;
  if (!years || ![1, 2, 3, 4, 5].includes(years)) {
    return { valid: false, error: 'Normalization years must be an integer between 1 and 5' };
  }

  if (conditions.normalizationMethod && !['CONSERVATIVE', 'MEAN'].includes(conditions.normalizationMethod)) {
    return { valid: false, error: 'Normalization method must be CONSERVATIVE or MEAN' };
  }

  if (conditions.capexMode && !['TOTAL', 'MAINTENANCE'].includes(conditions.capexMode)) {
    return { valid: false, error: 'CAPEX mode must be TOTAL or MAINTENANCE' };
  }

  if (conditions.growthMethod && !['LOWER_BOUND', 'OEPS_WEIGHTED', 'EQUAL_BLEND'].includes(conditions.growthMethod)) {
    return { valid: false, error: 'Growth method must be LOWER_BOUND, OEPS_WEIGHTED, or EQUAL_BLEND' };
  }

  const cap = Number(conditions.growthRateCap);
  if (isNaN(cap) || cap < 0 || cap > 1) {
    return { valid: false, error: 'Growth rate cap must be between 0% and 100%' };
  }

  if (conditions.growthRateFloor != null && conditions.growthRateFloor !== '') {
    const floor = Number(conditions.growthRateFloor);
    if (isNaN(floor) || floor <= -1 || floor > 1) {
      return { valid: false, error: 'Growth rate floor must be greater than -100% and up to 100%' };
    }
    if (floor > cap) {
      return { valid: false, error: 'Growth rate floor cannot be greater than growth rate cap' };
    }
  }

  return { valid: true };
}

export function loadValuationConfig(): ValuationConditions {
  const storage = getStorage();
  if (!storage) return { ...SYSTEM_DEFAULT_VALUATION_CONDITIONS };
  try {
    const raw = storage.getItem(STORAGE_KEY_VALUATION_CONFIG);
    if (!raw) return { ...SYSTEM_DEFAULT_VALUATION_CONDITIONS };
    const parsed = JSON.parse(raw);
    const validation = validateValuationConditions(parsed);
    if (!validation.valid) {
      return { ...SYSTEM_DEFAULT_VALUATION_CONDITIONS };
    }
    return {
      normalizationYears: parsed.normalizationYears,
      normalizationMethod: parsed.normalizationMethod,
      capexMode: parsed.capexMode,
      growthMethod: parsed.growthMethod,
      growthRateCap: String(parsed.growthRateCap),
      growthRateFloor: parsed.growthRateFloor == null ? null : String(parsed.growthRateFloor),
    };
  } catch {
    return { ...SYSTEM_DEFAULT_VALUATION_CONDITIONS };
  }
}

export function saveValuationConfig(conditions: ValuationConditions): boolean {
  const validation = validateValuationConditions(conditions);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  const storage = getStorage();
  if (!storage) return false;
  try {
    storage.setItem(STORAGE_KEY_VALUATION_CONFIG, JSON.stringify(conditions));
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new Event('sogs_valuation_config_updated'));
    }
    return true;
  } catch {
    return false;
  }
}

export function resetValuationConfig(): ValuationConditions {
  const storage = getStorage();
  if (storage) {
    try {
      storage.removeItem(STORAGE_KEY_VALUATION_CONFIG);
      if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(new Event('sogs_valuation_config_updated'));
      }
    } catch {
      // ignore
    }
  }
  return { ...SYSTEM_DEFAULT_VALUATION_CONDITIONS };
}

export function hasCustomValuationConfig(): boolean {
  const storage = getStorage();
  if (!storage) return false;
  try {
    return storage.getItem(STORAGE_KEY_VALUATION_CONFIG) !== null;
  } catch {
    return false;
  }
}
