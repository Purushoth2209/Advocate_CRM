import { createContext, useContext, useMemo, useState, useEffect } from 'react';
import {
  mockCases,
  mockNotifications,
  mockClientProfile,
  mockCasesFresh,
  mockNotificationsFresh,
  mockClientProfileFresh,
} from '../data/mockData';

const STORAGE_KEY = 'lexdesk_client_experience';

const ClientExperienceContext = createContext(null);

function readInitialExperience() {
  if (typeof window === 'undefined') return 'returning';
  const params = new URLSearchParams(window.location.search);
  const q = params.get('experience');
  if (q === 'fresh' || q === 'returning') return q;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'fresh' || stored === 'returning') return stored;
  return 'returning';
}

export function ClientExperienceProvider({ children }) {
  const [experience, setExperienceState] = useState(readInitialExperience);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, experience);
  }, [experience]);

  const setExperience = (v) => {
    if (v === 'fresh' || v === 'returning') setExperienceState(v);
  };

  const value = useMemo(() => {
    const isFresh = experience === 'fresh';
    return {
      experience,
      setExperience,
      isFresh,
      cases: isFresh ? mockCasesFresh : mockCases,
      notifications: isFresh ? mockNotificationsFresh : mockNotifications,
      clientProfile: isFresh ? mockClientProfileFresh : mockClientProfile,
    };
  }, [experience]);

  return (
    <ClientExperienceContext.Provider value={value}>
      {children}
    </ClientExperienceContext.Provider>
  );
}

export function useClientAppData() {
  const ctx = useContext(ClientExperienceContext);
  if (!ctx) {
    throw new Error('useClientAppData must be used within ClientExperienceProvider');
  }
  return ctx;
}
