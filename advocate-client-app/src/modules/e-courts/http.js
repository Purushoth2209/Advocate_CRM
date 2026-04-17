import { getPartnerToken, getPartnerApiBase, getCourtStructureBase } from './config.js';
import { errorMessageFromResponse } from './errors.js';

/**
 * Serialize query params with repeated keys for arrays (courtCodes=a&courtCodes=b).
 */
export function serializeParams(params) {
  const parts = [];
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item === undefined || item === null) continue;
        parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(item))}`);
      }
    } else {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    }
  }
  return parts.join('&');
}

async function parseJsonSafe(res) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { _raw: text };
  }
}

async function partnerRequestOnce(path, opts = {}) {
  const token = getPartnerToken();
  if (!token) {
    throw new Error('Missing VITE_ECOURTS_API_TOKEN. Add it to .env for live eCourts data.');
  }

  const method = opts.method || 'GET';
  let url = `${getPartnerApiBase()}${path.startsWith('/') ? path : `/${path}`}`;
  if (method === 'GET' && opts.params && Object.keys(opts.params).length) {
    const q = serializeParams(
      Object.fromEntries(
        Object.entries(opts.params).filter(([, v]) => v !== undefined && v !== null && v !== '')
      )
    );
    if (q) url += `?${q}`;
  }

  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const res = await fetch(url, {
    method,
    headers,
    body: method === 'POST' && opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });

  const data = await parseJsonSafe(res);
  if (!res.ok) {
    const msg = errorMessageFromResponse(res.status, data);
    const err = new Error(msg);
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return data;
}

/**
 * Authenticated JSON request to Partner API.
 * Retries idempotent GET once after ~2s on INTERNAL_ERROR or 5xx.
 */
export async function partnerRequest(path, opts = {}) {
  const method = opts.method || 'GET';
  try {
    return await partnerRequestOnce(path, opts);
  } catch (e) {
    const code = e.body?.error?.code;
    const status = e.status;
    const retryable =
      method === 'GET' &&
      (code === 'INTERNAL_ERROR' || (typeof status === 'number' && status >= 500));
    if (!retryable) throw e;
    await new Promise((r) => setTimeout(r, 2000));
    return partnerRequestOnce(path, opts);
  }
}

/**
 * Public court hierarchy (no auth).
 * @param {string} path - e.g. `/states` or `/states/DL/districts`
 */
export async function publicCourtStructureRequest(path) {
  const url = `${getCourtStructureBase()}${path.startsWith('/') ? path : `/${path}`}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  const data = await parseJsonSafe(res);
  if (!res.ok) {
    const msg = errorMessageFromResponse(res.status, data);
    const err = new Error(msg);
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return data;
}
