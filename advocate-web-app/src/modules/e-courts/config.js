/** EcourtsIndia Partner API — see https://ecourtsindia.com/api/docs */

const REMOTE_PARTNER = 'https://webapi.ecourtsindia.com/api/partner';
const REMOTE_STRUCTURE = 'https://webapi.ecourtsindia.com/api/CauseList/court-structure';

/** Vite dev server or `vite preview` on localhost — proxy in vite.config.js (avoids CORS). */
function useViteEcourtsProxy() {
  if (import.meta.env.DEV) return true;
  if (typeof window === 'undefined') return false;
  const h = window.location.hostname;
  return h === 'localhost' || h === '127.0.0.1';
}

/**
 * Production browser build on a real host (e.g. Vercel) — call same-origin `/api/partner` so
 * edge rewrites can proxy to webapi (browser cannot call webapi directly — CORS).
 */
function useDeployedSameOriginProxy() {
  if (typeof window === 'undefined') return false;
  if (import.meta.env.DEV) return false;
  const h = window.location.hostname;
  return Boolean(h && h !== 'localhost' && h !== '127.0.0.1');
}

/**
 * Base URL for Partner API calls.
 * - Optional `VITE_ECOURTS_API_BASE` overrides everything.
 * - Local dev / localhost preview: `/api/partner` (Vite proxy).
 * - Production in browser (e.g. vercel.app): `/api/partner` (reverse-proxy in vercel.json).
 * - Fallback: direct remote (SSR / tests only — browser will hit CORS).
 */
export function getPartnerApiBase() {
  const o = import.meta.env.VITE_ECOURTS_API_BASE;
  if (typeof o === 'string' && o.trim()) return o.trim().replace(/\/$/, '');
  if (useViteEcourtsProxy()) return '/api/partner';
  if (useDeployedSameOriginProxy()) return '/api/partner';
  return REMOTE_PARTNER;
}

export function getCourtStructureBase() {
  const o = import.meta.env.VITE_ECOURTS_STRUCTURE_BASE;
  if (typeof o === 'string' && o.trim()) return o.trim().replace(/\/$/, '');
  if (useViteEcourtsProxy()) return '/api/CauseList/court-structure';
  if (useDeployedSameOriginProxy()) return '/api/CauseList/court-structure';
  return REMOTE_STRUCTURE;
}

/** Remote URL (no proxy) — for docs / debugging */
export const PARTNER_API_BASE = REMOTE_PARTNER;
export const COURT_STRUCTURE_BASE = REMOTE_STRUCTURE;

export function getPartnerToken() {
  const t = import.meta.env.VITE_ECOURTS_API_TOKEN;
  return typeof t === 'string' && t.trim() ? t.trim() : '';
}

export function hasPartnerToken() {
  return Boolean(getPartnerToken());
}
