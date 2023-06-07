import { useEffect } from 'react';

import { useDataLoader } from './useDataLoader';

export function useTransactions() {
  const { load, isLoaded, isLoading, getData, getError } = useDataLoader();
  useEffect(() => {
    load();
  }, [load]);
  return {
    isLoaded,
    isLoading,
    getData,
    getError,
  };
}
