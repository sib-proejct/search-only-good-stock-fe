import { describe, it, expect, beforeEach } from 'vitest';
import {
  SYSTEM_DEFAULT_VALUATION_CONDITIONS,
  loadValuationConfig,
  saveValuationConfig,
  resetValuationConfig,
  hasCustomValuationConfig,
  validateValuationConditions,
  STORAGE_KEY_VALUATION_CONFIG,
  VALUATION_PRESETS,
} from './valuationConfig';

class MemoryStorage implements Storage {
  private store = new Map<string, string>();
  get length() { return this.store.size; }
  clear() { this.store.clear(); }
  getItem(key: string) { return this.store.get(key) ?? null; }
  setItem(key: string, value: string) { this.store.set(key, String(value)); }
  removeItem(key: string) { this.store.delete(key); }
  key(index: number) { return Array.from(this.store.keys())[index] ?? null; }
}

describe('valuationConfig', () => {
  beforeEach(() => {
    // Provide memory storage
    (globalThis as unknown as { localStorage: Storage }).localStorage = new MemoryStorage();
  });

  it('loads system defaults when nothing is saved in localStorage', () => {
    const config = loadValuationConfig();
    expect(config).toEqual(SYSTEM_DEFAULT_VALUATION_CONDITIONS);
    expect(hasCustomValuationConfig()).toBe(false);
  });

  it('saves and loads custom conditions successfully', () => {
    const custom = {
      normalizationYears: 3 as const,
      normalizationMethod: 'MEAN' as const,
      capexMode: 'MAINTENANCE' as const,
      growthMethod: 'LOWER_BOUND' as const,
      growthRateCap: '0.15',
      growthRateFloor: '0.02',
    };

    const saved = saveValuationConfig(custom);
    expect(saved).toBe(true);
    expect(hasCustomValuationConfig()).toBe(true);

    const loaded = loadValuationConfig();
    expect(loaded).toEqual(custom);
  });

  it('handles null growthRateFloor', () => {
    const custom = {
      normalizationYears: 4 as const,
      normalizationMethod: 'CONSERVATIVE' as const,
      capexMode: 'TOTAL' as const,
      growthMethod: 'OEPS_WEIGHTED' as const,
      growthRateCap: '0.25',
      growthRateFloor: null,
    };

    saveValuationConfig(custom);
    const loaded = loadValuationConfig();
    expect(loaded.growthRateFloor).toBeNull();
  });

  it('resets custom configuration to system defaults', () => {
    saveValuationConfig({
      ...SYSTEM_DEFAULT_VALUATION_CONDITIONS,
      growthRateCap: '0.35',
    });
    expect(hasCustomValuationConfig()).toBe(true);

    const reset = resetValuationConfig();
    expect(reset).toEqual(SYSTEM_DEFAULT_VALUATION_CONDITIONS);
    expect(hasCustomValuationConfig()).toBe(false);
  });

  it('validates growthRateFloor not exceeding growthRateCap', () => {
    const invalid = {
      ...SYSTEM_DEFAULT_VALUATION_CONDITIONS,
      growthRateCap: '0.10',
      growthRateFloor: '0.15',
    };
    const res = validateValuationConditions(invalid);
    expect(res.valid).toBe(false);
    expect(res.error).toContain('greater than growth rate cap');
    expect(() => saveValuationConfig(invalid)).toThrow();
  });

  it('validates normalizationYears range', () => {
    // @ts-expect-error invalid year test
    const res = validateValuationConditions({ normalizationYears: 10 });
    expect(res.valid).toBe(false);
  });

  it('falls back to default if stored JSON is corrupt or invalid', () => {
    const storage = (globalThis as unknown as { localStorage: Storage }).localStorage;
    storage.setItem(STORAGE_KEY_VALUATION_CONFIG, 'invalid json');
    const loaded = loadValuationConfig();
    expect(loaded).toEqual(SYSTEM_DEFAULT_VALUATION_CONDITIONS);
  });

  it('all predefined presets are valid', () => {
    for (const preset of VALUATION_PRESETS) {
      const res = validateValuationConditions(preset.conditions);
      expect(res.valid).toBe(true);
    }
  });
});
