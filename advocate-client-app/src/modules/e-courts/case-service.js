import { partnerRequest } from './http.js';
import { errorMessageFromResponse } from './errors.js';
import { getPartnerToken, getPartnerApiBase } from './config.js';

/**
 * Filename segment for GET `/case/{cnr}/order/{filename}` (from case detail `orderUrl`).
 * @param {string} orderUrlOrName
 * @returns {string}
 */
export function normalizeOrderFilename(orderUrlOrName) {
  let raw = String(orderUrlOrName ?? '').trim();
  if (!raw) return raw;
  raw = raw.split(/[?#]/)[0].trim();
  if (!raw) return raw;
  if (/^https?:\/\//i.test(raw)) {
    try {
      const u = new URL(raw);
      const m = u.pathname.match(/\/order\/([^/]+)\/?$/i);
      if (m) return decodeURIComponent(m[1]);
      const parts = u.pathname.split('/').filter(Boolean);
      return decodeURIComponent(parts[parts.length - 1] || raw);
    } catch {
      /* fall through */
    }
  }
  if (raw.includes('/')) {
    const m = raw.match(/\/order\/([^/]+)\/?$/i);
    if (m) return m[1];
    const parts = raw.split(/[/\\]/).filter(Boolean);
    return parts[parts.length - 1] || raw;
  }
  return raw;
}

/**
 * Save a Blob as a file using a temporary anchor with the `download` attribute. After an
 * async `fetch`, some browsers ignore the save if the node is `display:none` or removed
 * immediately; keep the anchor off-screen until the download starts. Revoke the blob URL
 * after a delay.
 * @param {Blob} blob
 * @param {string} filename
 */
export function triggerBlobDownload(blob, filename) {
  const safeBase = String(filename || 'download')
    .replace(/[/\\?%*:|"<>]/g, '_')
    .trim();
  const safeName = /\.pdf$/i.test(safeBase) ? safeBase : `${safeBase}.pdf`;

  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = safeName;
  a.rel = 'noopener';
  a.setAttribute(
    'style',
    'position:fixed;left:-10000px;top:0;width:1px;height:1px;opacity:0'
  );
  document.body.appendChild(a);

  const cleanup = () => {
    URL.revokeObjectURL(objectUrl);
    if (a.parentNode) a.parentNode.removeChild(a);
  };

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      a.click();
      setTimeout(cleanup, 2500);
    });
  });
}

/**
 * @param {string} cnr
 * @returns {Promise<import('./types').CaseDetailResponse>}
 */
export function getCaseByCnr(cnr) {
  const clean = String(cnr).trim().toUpperCase();
  return partnerRequest(`/case/${encodeURIComponent(clean)}`);
}

/**
 * Build query object for GET /search from a flat form (snake_case keys).
 * Omits empty strings and empty arrays.
 * @param {Record<string, unknown>} form
 */
export function buildSearchQueryParams(form) {
  /** @type {Record<string, unknown>} */
  const qp = {
    page: form.page ?? 1,
    pageSize: form.page_size ?? 20,
  };

  if (form.query) qp.query = form.query;
  if (form.advocates) qp.advocates = form.advocates;
  if (form.judges) qp.judges = form.judges;
  if (form.petitioners) qp.petitioners = form.petitioners;
  if (form.respondents) qp.respondents = form.respondents;
  if (form.litigants) qp.litigants = form.litigants;

  if (form.court_codes?.length) qp.courtCodes = form.court_codes;
  if (form.case_types?.length) qp.caseTypes = form.case_types;
  if (form.case_statuses?.length) qp.caseStatuses = form.case_statuses;
  if (form.judicial_sections?.length) qp.judicialSections = form.judicial_sections;
  if (form.case_categories?.length) qp.caseCategories = form.case_categories;
  if (form.bench_types?.length) qp.benchTypes = form.bench_types;

  if (form.filing_years?.length) qp.filingYears = form.filing_years;
  if (form.registration_years?.length) qp.registrationYears = form.registration_years;
  if (form.first_hearing_years?.length) qp.firstHearingYears = form.first_hearing_years;
  if (form.next_hearing_years?.length) qp.nextHearingYears = form.next_hearing_years;
  if (form.decision_years?.length) qp.decisionYears = form.decision_years;

  if (form.filing_date_from) qp.filingDateFrom = form.filing_date_from;
  if (form.filing_date_to) qp.filingDateTo = form.filing_date_to;
  if (form.registration_date_from) qp.registrationDateFrom = form.registration_date_from;
  if (form.registration_date_to) qp.registrationDateTo = form.registration_date_to;
  if (form.first_hearing_date_from) qp.firstHearingDateFrom = form.first_hearing_date_from;
  if (form.first_hearing_date_to) qp.firstHearingDateTo = form.first_hearing_date_to;
  if (form.next_hearing_date_from) qp.nextHearingDateFrom = form.next_hearing_date_from;
  if (form.next_hearing_date_to) qp.nextHearingDateTo = form.next_hearing_date_to;
  if (form.decision_date_from) qp.decisionDateFrom = form.decision_date_from;
  if (form.decision_date_to) qp.decisionDateTo = form.decision_date_to;

  if (form.include_facet_counts !== undefined) qp.includeFacetCounts = form.include_facet_counts;
  if (form.sort_by) qp.sortBy = form.sort_by;
  if (form.sort_order) qp.sortOrder = form.sort_order;

  return qp;
}

/**
 * @param {Record<string, unknown>} form — use buildSearchQueryParams input shape
 * @returns {Promise<import('./types').SearchResponse>}
 */
export function searchCases(form) {
  const params = buildSearchQueryParams(form);
  return partnerRequest('/search', { params });
}

/**
 * @param {string} cnr
 * @returns {Promise<import('./types').RefreshResponse>}
 */
export function refreshCase(cnr) {
  const clean = String(cnr).trim().toUpperCase();
  return partnerRequest(`/case/${encodeURIComponent(clean)}/refresh`, { method: 'POST' });
}

/**
 * **Step 2:** GET `/case/{cnr}/order/{filename}` — `filename` must be `orderUrl` from
 * **step 1** `GET /case/{cnr}` → `courtCaseData.judgmentOrders[]` / `interimOrders[]`.
 * Bearer auth, no body.
 * @param {string} cnr
 * @param {string} filename — exact `orderUrl` from case detail response
 */
export async function downloadOrderPdf(cnr, filename) {
  const token = getPartnerToken();
  if (!token) throw new Error('Missing VITE_ECOURTS_API_TOKEN.');

  const clean = String(cnr).trim().toUpperCase();
  const fileSegment = normalizeOrderFilename(filename);
  if (!fileSegment) throw new Error('Missing order filename.');

  const path = `/case/${encodeURIComponent(clean)}/order/${encodeURIComponent(fileSegment)}`;
  const url = `${getPartnerApiBase()}${path}`;

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json, application/pdf, */*',
  };

  const attempt = async () => {
    const res = await fetch(url, { method: 'GET', headers });
    const ct = (res.headers.get('content-type') || '').toLowerCase();

    if (!res.ok) {
      const text = await res.text();
      let body = null;
      try {
        body = JSON.parse(text);
      } catch {
        /* ignore */
      }
      const err = new Error(errorMessageFromResponse(res.status, body));
      err.status = res.status;
      err.body = body;
      throw err;
    }

    if (ct.includes('application/json') || ct.includes('text/json')) {
      const text = await res.text();
      let body = null;
      try {
        body = JSON.parse(text);
      } catch {
        /* ignore */
      }
      const err = new Error(errorMessageFromResponse(res.status, body || { error: { message: text } }));
      err.status = res.status;
      err.body = body;
      throw err;
    }

    const buf = await res.arrayBuffer();
    if (!buf.byteLength) {
      throw new Error('Order download returned an empty file.');
    }

    const head = new Uint8Array(buf.slice(0, 1));
    if (head.length && head[0] === 0x7b /* { */) {
      const text = new TextDecoder().decode(buf);
      let body;
      try {
        body = JSON.parse(text);
      } catch {
        throw new Error('Order download returned invalid JSON instead of a PDF.');
      }
      if (body?.error) {
        const err = new Error(errorMessageFromResponse(res.status, body));
        err.status = res.status;
        err.body = body;
        throw err;
      }
      throw new Error('Order download returned JSON instead of a PDF.');
    }

    let mime = ct.split(';')[0].trim() || 'application/pdf';
    if (mime === 'application/octet-stream' || !mime.includes('pdf')) {
      mime = 'application/pdf';
    }
    const blob = new Blob([buf], { type: mime });
    const cd = res.headers.get('content-disposition') || '';
    const m = cd.match(/filename\*?=(?:UTF-8'')?([^;\n]+)/i);
    let name = m ? m[1].trim().replace(/^["']|["']$/g, '').replace(/\+/g, ' ') : `order-${clean}-${fileSegment}`;
    try {
      name = decodeURIComponent(name);
    } catch {
      /* keep raw */
    }
    if (!/\.pdf$/i.test(name)) name = `${name.replace(/\.+$/, '')}.pdf`;
    return { blob, filename: name };
  };

  try {
    return await attempt();
  } catch (e) {
    const code = e.body?.error?.code;
    const retryable =
      code === 'INTERNAL_ERROR' ||
      code === 'INTERNAL_SERVER_ERROR' ||
      (typeof e.status === 'number' && e.status >= 500);
    if (!retryable) throw e;
    await new Promise((r) => setTimeout(r, 2000));
    return attempt();
  }
}
