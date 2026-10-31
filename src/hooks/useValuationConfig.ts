import { useState, useEffect, useCallback } from 'react';
import type { ValuationConditions } from '../services/valuationApi';
import {
  loadRegionalValuationConfigs,
  saveValuationConfig,
  saveRegionalValuationConfigs,
  resetValuationConfig,
  hasCustomValuationConfig,
  SYSTEM_DEFAULT_VALUATION_CONDITIONS,
  type ValuationMarketGroup,
  type RegionalValuationConfigs,
} from '../utils/valuationConfig';

export function useValuationConfig() {
  const [configs, setConfigs] = useState<RegionalValuationConfigs>(() =>
    loadRegionalValuationConfigs(),
  );
  const [isCustomUs, setIsCustomUs] = useState<boolean>(() => hasCustomValuationConfig('us'));
  const [isCustomKr, setIsCustomKr] = useState<boolean>(() => hasCustomValuationConfig('kr'));

  const refresh = useCallback(() => {
    setConfigs(loadRegionalValuationConfigs());
    setIsCustomUs(hasCustomValuationConfig('us'));
    setIsCustomKr(hasCustomValuationConfig('kr'));
  }, []);

  useEffect(() => {
    const handleUpdate = () => {
      refresh();
    };

    window.addEventListener('sogs_valuation_config_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('sogs_valuation_config_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [refresh]);

  const save = useCallback((conditions: ValuationConditions, region?: ValuationMarketGroup) => {
    const success = saveValuationConfig(conditions, region);
    if (success) {
      refresh();
    }
    return success;
  }, [refresh]);

  const saveRegional = useCallback((nextConfigs: RegionalValuationConfigs) => {
    const success = saveRegionalValuationConfigs(nextConfigs);
    if (success) {
      refresh();
    }
    return success;
  }, [refresh]);

  const reset = useCallback((region?: ValuationMarketGroup) => {
    const def = resetValuationConfig(region);
    refresh();
    return def;
  }, [refresh]);

  return {
    config: configs.us,
    configs,
    isCustom: isCustomUs || isCustomKr,
    isCustomUs,
    isCustomKr,
    systemDefault: SYSTEM_DEFAULT_VALUATION_CONDITIONS,
    saveConfig: save,
    saveRegionalConfigs: saveRegional,
    resetConfig: reset,
    refreshConfig: refresh,
  };
}
