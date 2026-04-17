import { publicCourtStructureRequest } from './http.js';

function asList(res) {
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.data)) return res.data;
  return [];
}

export async function getStates() {
  const res = await publicCourtStructureRequest('/states');
  return asList(res);
}

export async function getDistricts(state) {
  const res = await publicCourtStructureRequest(`/states/${encodeURIComponent(state)}/districts`);
  return asList(res);
}

export async function getComplexes(state, districtCode) {
  const res = await publicCourtStructureRequest(
    `/states/${encodeURIComponent(state)}/districts/${encodeURIComponent(districtCode)}/complexes`
  );
  return asList(res);
}

/**
 * @param {string} state
 * @param {string} districtCode
 * @param {string} courtComplexCode
 */
export async function getCourts(state, districtCode, courtComplexCode) {
  const res = await publicCourtStructureRequest(
    `/states/${encodeURIComponent(state)}/districts/${encodeURIComponent(districtCode)}/complexes/${encodeURIComponent(courtComplexCode)}/courts`
  );
  return asList(res);
}
