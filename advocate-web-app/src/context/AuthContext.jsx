import { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react';
import { mockAdvocates } from '../data/mockData';

const STORAGE_KEY = 'lexdesk-auth-user';

const AuthContext = createContext(null);

function initialsFromName(name) {
  const parts = name.replace(/^Adv\.\s*/i, '').trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (name.slice(0, 2) || '??').toUpperCase();
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const login = useCallback(() => {
    const advocate = mockAdvocates.find(a => a.status === 'active') ?? mockAdvocates[0];
    const next = {
      id: advocate.id,
      name: advocate.name,
      email: advocate.email,
      role: advocate.role,
      isAdmin: advocate.isAdmin,
      initials: initialsFromName(advocate.name),
    };
    setUser(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo(
    () => ({ user, login, logout, isAuthenticated: !!user }),
    [user, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
