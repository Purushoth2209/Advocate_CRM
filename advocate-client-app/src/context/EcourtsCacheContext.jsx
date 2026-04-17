import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const EcourtsCacheContext = createContext(null);

function normalizeCnr(cnr) {
  return String(cnr || '')
    .trim()
    .toUpperCase();
}

export function EcourtsCacheProvider({ children }) {
  /** @type {Record<string, { payload: unknown; fetchedAt: string; refreshHint?: string }>} */
  const [byCnr, setByCnr] = useState({});

  const setSnapshot = useCallback((cnr, payload) => {
    const k = normalizeCnr(cnr);
    if (!k) return;
    setByCnr((prev) => ({
      ...prev,
      [k]: {
        ...prev[k],
        payload,
        fetchedAt: new Date().toISOString(),
      },
    }));
  }, []);

  const setRefreshHint = useCallback((cnr, hint) => {
    const k = normalizeCnr(cnr);
    if (!k) return;
    setByCnr((prev) => ({
      ...prev,
      [k]: {
        ...prev[k],
        refreshHint: hint,
        fetchedAt: prev[k]?.fetchedAt ?? new Date().toISOString(),
      },
    }));
  }, []);

  const getSnapshot = useCallback(
    (cnr) => {
      const k = normalizeCnr(cnr);
      return k ? byCnr[k] : undefined;
    },
    [byCnr]
  );

  const value = useMemo(
    () => ({
      normalizeCnr,
      setSnapshot,
      getSnapshot,
      setRefreshHint,
    }),
    [setSnapshot, getSnapshot, setRefreshHint]
  );

  return <EcourtsCacheContext.Provider value={value}>{children}</EcourtsCacheContext.Provider>;
}

export function useEcourtsCache() {
  const ctx = useContext(EcourtsCacheContext);
  if (!ctx) {
    throw new Error('useEcourtsCache must be used within EcourtsCacheProvider');
  }
  return ctx;
}
