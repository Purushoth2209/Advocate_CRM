import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { mockCases } from '../data/mockData';

const STORAGE_KEY = 'lexdesk-cases-v3';

function cloneSeedCases() {
  return JSON.parse(JSON.stringify(mockCases));
}

/**
 * Merge current code seed with localStorage so new demo cases (e.g. Raghav) always
 * appear even if the browser cached an older list. User-created cases (ids not in seed)
 * are kept appended.
 */
function readStoredCasesArray() {
  try {
    const v3 = localStorage.getItem(STORAGE_KEY);
    if (v3) {
      const p = JSON.parse(v3);
      if (Array.isArray(p)) return p;
    }
    const v2 = localStorage.getItem('lexdesk-cases-v2');
    if (v2) {
      const p = JSON.parse(v2);
      if (Array.isArray(p)) return p;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function loadCases() {
  const seed = cloneSeedCases();
  const seedIds = new Set(seed.map((c) => c.id));
  try {
    const parsed = readStoredCasesArray();
    if (!parsed) return seed;
    const storedById = new Map(parsed.filter(Boolean).map((c) => [c.id, c]));
    const mergedFromSeed = seed.map((s) => storedById.get(s.id) ?? s);
    const userAdded = parsed.filter((c) => c && c.id && !seedIds.has(c.id));
    return [...mergedFromSeed, ...userAdded];
  } catch {
    return seed;
  }
}

const statusColorMap = {
  Active: 'green',
  'Hearing Scheduled': 'blue',
  'Judgment Pending': 'amber',
  'Under Review': 'purple',
  'Discovery Phase': 'indigo',
  'Appeal Filed': 'blue',
  Mediation: 'teal',
  Settled: 'teal',
  Closed: 'gray',
};

const CasesContext = createContext(null);

export function CasesProvider({ children }) {
  const [cases, setCases] = useState(() => loadCases());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
    } catch {
      /* ignore */
    }
  }, [cases]);

  const addCase = useCallback((partial) => {
    const id = `case-${Date.now()}`;
    const filed = partial.filedDate || new Date().toISOString().slice(0, 10);
    const now = new Date().toISOString();
    const status = partial.status || 'Active';
    const newCase = {
      id,
      cnr: (partial.cnr || '').trim() || `PENDING-${String(id).slice(-8)}`,
      caseNumber: (partial.caseNumber || '').trim() || '',
      title: (partial.title || '').trim() || 'Untitled matter',
      type: partial.type || 'Civil Suit',
      court: (partial.court || '').trim() || '—',
      clientId: partial.clientId,
      assignedAdvocateId: partial.assignedAdvocateId,
      status,
      statusColor: statusColorMap[status] || 'green',
      priority: partial.priority || 'medium',
      nextHearing: partial.nextHearing || null,
      filedDate: filed,
      lastUpdated: now,
      description: (partial.description || '').trim(),
      hearings: [],
      timeline: [{ date: filed, event: 'Case registered in LexDesk', type: 'filed' }],
      appointments: [],
    };
    setCases((prev) => [...prev, newCase]);
    return newCase;
  }, []);

  const value = useMemo(() => ({ cases, addCase }), [cases, addCase]);
  return <CasesContext.Provider value={value}>{children}</CasesContext.Provider>;
}

export function useCases() {
  const ctx = useContext(CasesContext);
  if (!ctx) throw new Error('useCases must be used within CasesProvider');
  return ctx;
}
