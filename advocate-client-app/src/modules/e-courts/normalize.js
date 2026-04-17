/** Defensive parsing — Partner API sometimes returns a single string where docs show string[]. */

export function asArray(v) {
  if (v == null || v === '') return [];
  if (Array.isArray(v)) return v;
  return [v];
}

export function asStringList(v) {
  return asArray(v)
    .filter((x) => x != null && x !== '')
    .map((x) => (typeof x === 'object' ? JSON.stringify(x) : String(x)));
}

export function courtJudgmentOrders(court) {
  if (!court || typeof court !== 'object') return [];
  return asArray(court.judgmentOrders ?? court.judgment_orders);
}

export function courtInterimOrders(court) {
  if (!court || typeof court !== 'object') return [];
  return asArray(court.interimOrders ?? court.interim_orders);
}

export function orderFilenameFromRow(row) {
  if (row == null || typeof row !== 'object') return '';
  const v =
    row.orderUrl ??
    row.order_url ??
    row.orderURL ??
    row.filename ??
    row.file_name ??
    '';
  if (v == null || v === '') return '';
  return String(v).trim();
}

/**
 * Prefer `entityInfo.nextDateOfHearing` over `courtCaseData.nextHearingDate` (portal-aligned next date).
 * @param {Record<string, unknown>|null|undefined} detail
 * @returns {string|null}
 */
export function pickNextHearingDateFromCaseDetail(detail) {
  if (!detail || typeof detail !== 'object') return null;
  const court = detail.courtCaseData ?? detail.court_case_data;
  const entity = detail.entityInfo ?? detail.entity_info;

  const fromEntity = entity?.nextDateOfHearing ?? entity?.next_date_of_hearing;
  if (fromEntity != null && fromEntity !== '') return String(fromEntity).trim();

  const fromCourt =
    court?.nextHearingDate ??
    court?.next_hearing_date ??
    court?.nextHearing ??
    court?.next_hearing;
  if (fromCourt != null && fromCourt !== '') return String(fromCourt).trim();

  const fromRoot = detail.nextHearingDate ?? detail.next_hearing_date;
  if (fromRoot != null && fromRoot !== '') return String(fromRoot).trim();

  return null;
}
