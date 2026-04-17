/**
 * Map EcourtsIndia JSON error bodies to a short user-facing message.
 * @param {unknown} body
 * @returns {string | null}
 */
export function messageFromErrorBody(body) {
  if (!body || typeof body !== 'object') return null;
  const err = body.error;
  if (!err || typeof err !== 'object') return null;
  const code = err.code;
  const msg = err.message || 'Request failed';
  const reqId = body.meta?.requestId ?? body.meta?.request_id;
  const suffix = reqId ? ` · ref ${reqId}` : '';

  const map = {
    INVALID_TOKEN: 'Invalid API token. Check VITE_ECOURTS_API_TOKEN.',
    TOKEN_INACTIVE: 'API token is inactive.',
    INSUFFICIENT_CREDITS: 'Insufficient API credits.',
    SUBSCRIPTION_REQUIRED: 'An active subscription is required for this call.',
    ACCOUNT_INACTIVE: 'Account is inactive.',
    RATE_LIMIT_EXCEEDED: 'Too many requests. Try again shortly.',
    INVALID_CNR: 'CNR format is invalid.',
    INVALID_PARAMETER: 'Invalid search parameter.',
    MISSING_PARAMETER: 'A required parameter is missing.',
    PAGE_SIZE_EXCEEDED: 'Page size must be at most 100.',
    MISSING_FILTER: 'Add at least one search filter (e.g. court, state, or text query).',
    CASE_NOT_FOUND: 'No case found for this CNR.',
    ORDER_NOT_FOUND: 'Order file not found.',
    INTERNAL_ERROR: 'eCourts service error. Retry later.',
    INTERNAL_SERVER_ERROR: 'eCourts service error. Retry later.',
  };

  // INTERNAL_ERROR / INTERNAL_SERVER_ERROR: prefer the API message (document pipeline, etc.)
  let base;
  if ((code === 'INTERNAL_ERROR' || code === 'INTERNAL_SERVER_ERROR') && msg) {
    base = msg;
  } else {
    base = map[code] || msg;
  }
  return `${base}${suffix}`;
}

export function errorMessageFromResponse(status, body) {
  const parsed = messageFromErrorBody(body);
  if (parsed) return parsed;
  if (status === 401) return 'Unauthorized — check your API token.';
  if (status === 429) return 'Rate limited. Wait and retry.';
  if (status >= 500) return 'eCourts server error. Try again later.';
  return `Request failed (${status || 'network'}).`;
}
