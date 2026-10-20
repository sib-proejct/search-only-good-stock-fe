import { useState, useEffect, useCallback } from 'react';
import type { ValuationConditions } from '../services/valuationApi';
import {
  loadValuationConfig,
  saveValuationConfig,
  resetValuationConfig,
  hasCustomValuationConfig,
  SYSTEM_DEFAULT_VALUATION_CONDITIONS,
} from '../utils/valuationConfig';

export function useValuationConfig() {
  const [config, setConfig] = useState<ValuationConditions>(() => loadValuationConfig());
  const [isCustom, setIsCustom] = useState<boolean>(() => hasCustomValuationConfig());

  const refresh = useCallback(() => {
    setConfig(loadValuationConfig());
    setIsCustom(hasCustomValuationConfig());
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

  const save = useCallback((conditions: ValuationConditions) => {
    const success = saveValuationConfig(conditions);
    if (success) {
      setConfig(conditions);
      setIsCustom(true);
    }
    return success;
  }, []);

  const reset = useCallback(() => {
    const def = resetValuationConfig();
    setConfig(def);
    setIsCustom(false);
    return def;
  }, []);

  return {
    config,
    isCustom,
    systemDefault: SYSTEM_DEFAULT_VALUATION_CONDITIONS,
    saveConfig: save,
    resetConfig: reset,
    refreshConfig: refresh,
  };
}
