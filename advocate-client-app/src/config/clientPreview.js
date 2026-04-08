const HIDE_STORAGE_KEY = 'lexdesk_client_preview_hide';

/**
 * Profile “preview mode” (fresh vs returning mock data):
 * - **Default: ON** in dev and production (design / demo phase).
 * - **Production lock:** set `VITE_HIDE_CLIENT_PREVIEW=true` in Vercel at build time to hide the panel.
 * - **Optional per-browser hide:** `?client_preview=0` stores a local hide (until cleared with `?client_preview=1` or site data clear).
 *
 * `applyClientPreviewQueryParam` runs from the router when using optional query overrides.
 */
export function applyClientPreviewQueryParam() {
  if (typeof window === 'undefined') return;
  try {
    const p = new URLSearchParams(window.location.search).get('client_preview');
    if (p === '0' || p === 'false') localStorage.setItem(HIDE_STORAGE_KEY, '1');
    if (p === '1' || p === 'true') localStorage.removeItem(HIDE_STORAGE_KEY);
  } catch (_) {
    /* ignore */
  }
}

export function isClientPreviewEnabled() {
  if (import.meta.env.VITE_HIDE_CLIENT_PREVIEW === 'true') return false;
  if (typeof window !== 'undefined' && localStorage.getItem(HIDE_STORAGE_KEY) === '1') return false;
  return true;
}
