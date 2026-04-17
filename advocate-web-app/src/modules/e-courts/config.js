/** EcourtsIndia Partner API — see https://ecourtsindia.com/api/docs */

const REMOTE_PARTNER = 'https://webapi.ecourtsindia.com/api/partner';
const REMOTE_STRUCTURE = 'https://webapi.ecourtsindia.com/api/CauseList/court-structure';

/** Use same-origin paths so Vite dev / preview can proxy (avoids browser CORS). */
function useViteEcourtsProxy() {
  if (import.meta.env.DEV) return true;
  if (typeof window === 'undefined') return false;
  const h = window.location.hostname;
  return h === 'localhost' || h === '127.0.0.1';
}

/**
 * Base URL for Partner API calls. Local dev and `vite preview` on localhost use `/api/partner`
 * (see vite.config.js proxy). Deployed sites must reverse-proxy those paths or set env overrides.
 */
export function getPartnerApiBase() {
  const o = import.meta.env.VITE_ECOURTS_API_BASE;
  if (typeof o === 'string' && o.trim()) return o.trim().replace(/\/$/, '');
  if (useViteEcourtsProxy()) return '/api/partner';
  return REMOTE_PARTNER;
}

export function getCourtStructureBase() {
  const o = import.meta.env.VITE_ECOURTS_STRUCTURE_BASE;
  if (typeof o === 'string' && o.trim()) return o.trim().replace(/\/$/, '');
  if (useViteEcourtsProxy()) return '/api/CauseList/court-structure';
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
