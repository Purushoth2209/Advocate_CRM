import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, RefreshCw, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import Header from '../../components/layout/Header';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import {
  hasPartnerToken,
  searchCases,
  buildSearchQueryParams,
  getStates,
  getDistricts,
  getComplexes,
  getCourts,
  asStringList,
} from '../../modules/e-courts';

const CASE_TYPES = [
  'CIVIL',
  'CRIMINAL',
  'WRIT',
  'APPEAL',
  'REVISION',
  'EXECUTION',
  'ARBITRATION',
  'MATRIMONIAL',
  'MOTOR_ACCIDENT',
  'LABOR',
];

const CASE_STATUSES = ['PENDING', 'DISPOSED', 'TRANSFERRED', 'WITHDRAWN', 'UNKNOWN'];

const JUDICIAL_SECTIONS = ['CIV', 'CRIM', 'WRIT', 'REV', 'APP', 'MISC', 'PIL', 'BAIL', 'URG', 'ADM'];

const BENCH_TYPES = ['SINGLE', 'DIVISION'];

function parseCommaList(str) {
  if (!str || !String(str).trim()) return undefined;
  const parts = String(str)
    .split(/[,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length ? parts : undefined;
}

function parseYears(str) {
  const parts = parseCommaList(str);
  if (!parts) return undefined;
  const nums = parts.map((x) => parseInt(x, 10)).filter((n) => !Number.isNaN(n));
  return nums.length ? nums : undefined;
}

function toggleIn(set, val) {
  set((prev) => (prev.includes(val) ? prev.filter((x) => x !== val) : [...prev, val]));
}

export default function CaseSearch() {
  const navigate = useNavigate();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [query, setQuery] = useState('');
  const [advocates, setAdvocates] = useState('');
  const [judges, setJudges] = useState('');
  const [petitioners, setPetitioners] = useState('');
  const [respondents, setRespondents] = useState('');
  const [litigants, setLitigants] = useState('');

  const [courtCodesManual, setCourtCodesManual] = useState('');
  const [caseTypes, setCaseTypes] = useState([]);
  const [caseStatuses, setCaseStatuses] = useState([]);
  const [judicialSections, setJudicialSections] = useState([]);
  const [benchTypes, setBenchTypes] = useState([]);

  const [filingYears, setFilingYears] = useState('');
  const [registrationYears, setRegistrationYears] = useState('');
  const [nextHearingYears, setNextHearingYears] = useState('');
  const [decisionYears, setDecisionYears] = useState('');

  const [filingDateFrom, setFilingDateFrom] = useState('');
  const [filingDateTo, setFilingDateTo] = useState('');
  const [nextHearingDateFrom, setNextHearingDateFrom] = useState('');
  const [nextHearingDateTo, setNextHearingDateTo] = useState('');
  const [decisionDateFrom, setDecisionDateFrom] = useState('');
  const [decisionDateTo, setDecisionDateTo] = useState('');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [includeFacets, setIncludeFacets] = useState(true);

  const [states, setStates] = useState([]);
  const [state, setState] = useState('');
  const [districts, setDistricts] = useState([]);
  const [districtCode, setDistrictCode] = useState('');
  const [complexes, setComplexes] = useState([]);
  const [courtComplexCode, setCourtComplexCode] = useState('');
  const [courts, setCourts] = useState([]);
  const [selectedCourtCodes, setSelectedCourtCodes] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getStates()
      .then((data) => {
        if (!cancelled && Array.isArray(data)) setStates(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!state) {
      setDistricts([]);
      setDistrictCode('');
      return;
    }
    let cancelled = false;
    getDistricts(state)
      .then((data) => {
        if (!cancelled && Array.isArray(data)) setDistricts(data);
      })
      .catch(() => setDistricts([]));
    return () => {
      cancelled = true;
    };
  }, [state]);

  useEffect(() => {
    if (!state || !districtCode) {
      setComplexes([]);
      setCourtComplexCode('');
      return;
    }
    let cancelled = false;
    getComplexes(state, districtCode)
      .then((data) => {
        if (!cancelled && Array.isArray(data)) setComplexes(data);
      })
      .catch(() => setComplexes([]));
    return () => {
      cancelled = true;
    };
  }, [state, districtCode]);

  useEffect(() => {
    if (!state || !districtCode || !courtComplexCode) {
      setCourts([]);
      return;
    }
    let cancelled = false;
    getCourts(state, districtCode, courtComplexCode)
      .then((data) => {
        if (!cancelled && Array.isArray(data)) setCourts(data);
      })
      .catch(() => setCourts([]));
    return () => {
      cancelled = true;
    };
  }, [state, districtCode, courtComplexCode]);

  const buildForm = useCallback(() => {
    const manualCourts = parseCommaList(courtCodesManual);
    const hierarchyCourts = selectedCourtCodes.length ? selectedCourtCodes : undefined;
    const court_codes = hierarchyCourts?.length ? hierarchyCourts : manualCourts;

    return {
      query: query.trim() || undefined,
      advocates: advocates.trim() || undefined,
      judges: judges.trim() || undefined,
      petitioners: petitioners.trim() || undefined,
      respondents: respondents.trim() || undefined,
      litigants: litigants.trim() || undefined,
      court_codes,
      case_types: caseTypes.length ? caseTypes : undefined,
      case_statuses: caseStatuses.length ? caseStatuses : undefined,
      judicial_sections: judicialSections.length ? judicialSections : undefined,
      bench_types: benchTypes.length ? benchTypes : undefined,
      filing_years: parseYears(filingYears),
      registration_years: parseYears(registrationYears),
      next_hearing_years: parseYears(nextHearingYears),
      decision_years: parseYears(decisionYears),
      filing_date_from: filingDateFrom || undefined,
      filing_date_to: filingDateTo || undefined,
      next_hearing_date_from: nextHearingDateFrom || undefined,
      next_hearing_date_to: nextHearingDateTo || undefined,
      decision_date_from: decisionDateFrom || undefined,
      decision_date_to: decisionDateTo || undefined,
      include_facet_counts: includeFacets,
      sort_by: sortBy || undefined,
      sort_order: sortBy ? sortOrder : undefined,
      page,
      page_size: pageSize,
    };
  }, [
    query,
    advocates,
    judges,
    petitioners,
    respondents,
    litigants,
    courtCodesManual,
    selectedCourtCodes,
    caseTypes,
    caseStatuses,
    judicialSections,
    benchTypes,
    filingYears,
    registrationYears,
    nextHearingYears,
    decisionYears,
    filingDateFrom,
    filingDateTo,
    nextHearingDateFrom,
    nextHearingDateTo,
    decisionDateFrom,
    decisionDateTo,
    includeFacets,
    sortBy,
    sortOrder,
    page,
    pageSize,
  ]);

  const runSearch = async (pageOverride) => {
    if (!hasPartnerToken()) {
      setError('Set VITE_ECOURTS_API_TOKEN in .env to search.');
      return;
    }
    const raw = { ...buildForm(), page: pageOverride !== undefined ? pageOverride : page };
    const params = buildSearchQueryParams(raw);
    const keys = Object.keys(params).filter((k) => k !== 'page' && k !== 'pageSize');
    const hasFilter =
      keys.length > 0 &&
      keys.some((k) => {
        const v = params[k];
        if (v === undefined || v === null || v === '') return false;
        if (Array.isArray(v)) return v.length > 0;
        return true;
      });
    if (!hasFilter) {
      setError('Add at least one search term or filter (e.g. query, advocate, court, or dates).');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const res = await searchCases(raw);
      const d = res?.data ?? null;
      setResults(d);
      if (d?.page) setPage(d.page);
    } catch (e) {
      setResults(null);
      setError(e?.message || 'Search failed.');
    } finally {
      setLoading(false);
    }
  };

  const toggleCourtCode = (code) => {
    setSelectedCourtCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-24">
      <Header title="Search cases" showBack />

      <div className="px-4 py-4 space-y-4">
        {!hasPartnerToken() && (
          <Card className="bg-amber-50 border-amber-100">
            <p className="text-xs text-amber-900">
              Configure <code className="font-mono bg-amber-100/80 px-1 rounded">VITE_ECOURTS_API_TOKEN</code> in{' '}
              <code className="font-mono">.env</code> to use eCourts search.
            </p>
          </Card>
        )}

        <Card>
          <p className="text-xs font-semibold text-gray-800 mb-3">Text & names</p>
          <div className="space-y-2">
            <label className="block">
              <span className="text-[10px] text-gray-500 uppercase">General query</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="mt-0.5 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"
                placeholder="Keywords across case fields"
              />
            </label>
            <label className="block">
              <span className="text-[10px] text-gray-500 uppercase">Advocate</span>
              <input
                value={advocates}
                onChange={(e) => setAdvocates(e.target.value)}
                className="mt-0.5 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"
                placeholder="Petitioner or respondent advocate name"
              />
            </label>
            <div className="grid grid-cols-1 gap-2">
              <label className="block">
                <span className="text-[10px] text-gray-500 uppercase">Judge</span>
                <input
                  value={judges}
                  onChange={(e) => setJudges(e.target.value)}
                  className="mt-0.5 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"
                />
              </label>
              <label className="block">
                <span className="text-[10px] text-gray-500 uppercase">Petitioner</span>
                <input
                  value={petitioners}
                  onChange={(e) => setPetitioners(e.target.value)}
                  className="mt-0.5 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"
                />
              </label>
              <label className="block">
                <span className="text-[10px] text-gray-500 uppercase">Respondent</span>
                <input
                  value={respondents}
                  onChange={(e) => setRespondents(e.target.value)}
                  className="mt-0.5 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"
                />
              </label>
              <label className="block">
                <span className="text-[10px] text-gray-500 uppercase">Litigants (both sides)</span>
                <input
                  value={litigants}
                  onChange={(e) => setLitigants(e.target.value)}
                  className="mt-0.5 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"
                />
              </label>
            </div>
          </div>
        </Card>

        <button
          type="button"
          onClick={() => setShowAdvanced((s) => !s)}
          className="flex items-center gap-2 text-xs font-semibold text-navy-800 w-full justify-between px-1"
        >
          <span className="flex items-center gap-2">
            <Filter size={14} /> Advanced filters
          </span>
          {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showAdvanced && (
          <>
            <Card>
              <p className="text-xs font-semibold text-gray-800 mb-2">Court hierarchy</p>
              <p className="text-[10px] text-gray-500 mb-2">Pick courts to send as court_codes, or type codes below.</p>
              <div className="space-y-2">
                <select
                  value={state}
                  onChange={(e) => {
                    setState(e.target.value);
                    setDistrictCode('');
                    setCourtComplexCode('');
                    setSelectedCourtCodes([]);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white"
                >
                  <option value="">State…</option>
                  {states.map((s) => (
                    <option key={s.state} value={s.state}>
                      {s.stateName} ({s.state})
                    </option>
                  ))}
                </select>
                <select
                  value={districtCode}
                  onChange={(e) => {
                    setDistrictCode(e.target.value);
                    setCourtComplexCode('');
                    setSelectedCourtCodes([]);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white"
                  disabled={!state}
                >
                  <option value="">District…</option>
                  {districts.map((d) => (
                    <option key={d.districtCode} value={d.districtCode}>
                      {d.districtName}
                    </option>
                  ))}
                </select>
                <select
                  value={courtComplexCode}
                  onChange={(e) => {
                    setCourtComplexCode(e.target.value);
                    setSelectedCourtCodes([]);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white"
                  disabled={!districtCode}
                >
                  <option value="">Court complex…</option>
                  {complexes.map((c) => (
                    <option key={c.courtComplexCode} value={c.courtComplexCode}>
                      {c.courtComplexName}
                    </option>
                  ))}
                </select>
                {courts.length > 0 && (
                  <div className="rounded-xl border border-gray-100 p-2 max-h-40 overflow-y-auto space-y-1">
                    {courts.map((c) => (
                      <label key={c.court} className="flex items-start gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={selectedCourtCodes.includes(c.court)}
                          onChange={() => toggleCourtCode(c.court)}
                          className="mt-0.5"
                        />
                        <span>
                          <span className="font-medium text-gray-800">{c.courtName}</span>
                          <span className="text-gray-400"> · {c.court}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            <Card>
              <p className="text-xs font-semibold text-gray-800 mb-2">Court codes (manual)</p>
              <input
                value={courtCodesManual}
                onChange={(e) => setCourtCodesManual(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm font-mono"
                placeholder="DLHC01, HCBM01 (comma-separated)"
              />
            </Card>

            <Card>
              <p className="text-xs font-semibold text-gray-800 mb-2">Case type & status</p>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {CASE_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleIn(setCaseTypes, t)}
                    className={`text-[10px] px-2 py-1 rounded-full border ${
                      caseTypes.includes(t) ? 'bg-navy-700 text-white border-navy-700' : 'bg-white text-gray-600 border-gray-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {CASE_STATUSES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleIn(setCaseStatuses, t)}
                    className={`text-[10px] px-2 py-1 rounded-full border ${
                      caseStatuses.includes(t) ? 'bg-navy-700 text-white border-navy-700' : 'bg-white text-gray-600 border-gray-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-gray-500 mb-1">Judicial section</p>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {JUDICIAL_SECTIONS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleIn(setJudicialSections, t)}
                    className={`text-[10px] px-2 py-1 rounded-full border ${
                      judicialSections.includes(t) ? 'bg-navy-700 text-white border-navy-700' : 'bg-white text-gray-600 border-gray-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-gray-500 mb-1">Bench</p>
              <div className="flex flex-wrap gap-1.5">
                {BENCH_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleIn(setBenchTypes, t)}
                    className={`text-[10px] px-2 py-1 rounded-full border ${
                      benchTypes.includes(t) ? 'bg-navy-700 text-white border-navy-700' : 'bg-white text-gray-600 border-gray-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </Card>

            <Card>
              <p className="text-xs font-semibold text-gray-800 mb-2">Years (comma-separated)</p>
              <div className="grid grid-cols-2 gap-2">
                <label className="text-[10px] text-gray-500">
                  Filing years
                  <input
                    value={filingYears}
                    onChange={(e) => setFilingYears(e.target.value)}
                    className="mt-0.5 w-full px-2 py-1.5 rounded-lg border border-gray-200 text-xs font-mono"
                    placeholder="2024, 2023"
                  />
                </label>
                <label className="text-[10px] text-gray-500">
                  Registration years
                  <input
                    value={registrationYears}
                    onChange={(e) => setRegistrationYears(e.target.value)}
                    className="mt-0.5 w-full px-2 py-1.5 rounded-lg border border-gray-200 text-xs font-mono"
                  />
                </label>
                <label className="text-[10px] text-gray-500">
                  Next hearing years
                  <input
                    value={nextHearingYears}
                    onChange={(e) => setNextHearingYears(e.target.value)}
                    className="mt-0.5 w-full px-2 py-1.5 rounded-lg border border-gray-200 text-xs font-mono"
                  />
                </label>
                <label className="text-[10px] text-gray-500">
                  Decision years
                  <input
                    value={decisionYears}
                    onChange={(e) => setDecisionYears(e.target.value)}
                    className="mt-0.5 w-full px-2 py-1.5 rounded-lg border border-gray-200 text-xs font-mono"
                  />
                </label>
              </div>
            </Card>

            <Card>
              <p className="text-xs font-semibold text-gray-800 mb-2">Date ranges (YYYY-MM-DD)</p>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <label>
                  Filing from
                  <input
                    type="date"
                    value={filingDateFrom}
                    onChange={(e) => setFilingDateFrom(e.target.value)}
                    className="mt-0.5 w-full px-2 py-1.5 rounded-lg border border-gray-200 text-xs"
                  />
                </label>
                <label>
                  Filing to
                  <input
                    type="date"
                    value={filingDateTo}
                    onChange={(e) => setFilingDateTo(e.target.value)}
                    className="mt-0.5 w-full px-2 py-1.5 rounded-lg border border-gray-200 text-xs"
                  />
                </label>
                <label>
                  Next hearing from
                  <input
                    type="date"
                    value={nextHearingDateFrom}
                    onChange={(e) => setNextHearingDateFrom(e.target.value)}
                    className="mt-0.5 w-full px-2 py-1.5 rounded-lg border border-gray-200 text-xs"
                  />
                </label>
                <label>
                  Next hearing to
                  <input
                    type="date"
                    value={nextHearingDateTo}
                    onChange={(e) => setNextHearingDateTo(e.target.value)}
                    className="mt-0.5 w-full px-2 py-1.5 rounded-lg border border-gray-200 text-xs"
                  />
                </label>
                <label>
                  Decision from
                  <input
                    type="date"
                    value={decisionDateFrom}
                    onChange={(e) => setDecisionDateFrom(e.target.value)}
                    className="mt-0.5 w-full px-2 py-1.5 rounded-lg border border-gray-200 text-xs"
                  />
                </label>
                <label>
                  Decision to
                  <input
                    type="date"
                    value={decisionDateTo}
                    onChange={(e) => setDecisionDateTo(e.target.value)}
                    className="mt-0.5 w-full px-2 py-1.5 rounded-lg border border-gray-200 text-xs"
                  />
                </label>
              </div>
            </Card>

            <Card>
              <p className="text-xs font-semibold text-gray-800 mb-2">Sort & pagination</p>
              <div className="flex flex-wrap gap-2 items-end">
                <label className="text-[10px] text-gray-500">
                  Sort by
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="mt-0.5 block w-full px-2 py-1.5 rounded-lg border border-gray-200 text-xs bg-white"
                  >
                    <option value="">Default</option>
                    <option value="filingDate">Filing date</option>
                    <option value="registrationDate">Registration date</option>
                    <option value="nextHearingDate">Next hearing</option>
                    <option value="decisionDate">Decision date</option>
                  </select>
                </label>
                <label className="text-[10px] text-gray-500">
                  Order
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="mt-0.5 block px-2 py-1.5 rounded-lg border border-gray-200 text-xs bg-white"
                  >
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </select>
                </label>
                <label className="text-[10px] text-gray-500">
                  Page size
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    className="mt-0.5 block px-2 py-1.5 rounded-lg border border-gray-200 text-xs bg-white"
                  >
                    {[10, 20, 50, 100].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex items-center gap-2 text-xs text-gray-600">
                  <input
                    type="checkbox"
                    checked={includeFacets}
                    onChange={(e) => setIncludeFacets(e.target.checked)}
                  />
                  Include facet counts
                </label>
              </div>
            </Card>
          </>
        )}

        {error && (
          <Card className="bg-red-50 border-red-100">
            <p className="text-xs text-red-800">{error}</p>
          </Card>
        )}

        <Button fullWidth onClick={() => runSearch(1)} disabled={loading}>
          {loading ? (
            <>
              <RefreshCw size={14} className="animate-spin" /> Searching…
            </>
          ) : (
            <>
              <Search size={14} /> Search eCourts
            </>
          )}
        </Button>

        {results && (
          <div className="space-y-3">
            <p className="text-xs text-gray-500">
              {results.totalHits} hit(s) · page {results.page} of {results.totalPages} ·{' '}
              {results.processingTimeMs} ms
            </p>
            {(results.results || []).map((r) => (
              <Card key={r.id || r.cnr} padding={false}>
                <div className="p-4">
                  <p className="text-sm font-semibold text-gray-900 leading-snug">
                    {asStringList(r.petitioners).join(', ') || '—'} vs {asStringList(r.respondents).join(', ') || '—'}
                  </p>
                  <p className="text-[10px] font-mono text-gray-500 mt-1">{r.cnr}</p>
                  <p className="text-xs text-gray-600 mt-2">
                    {r.caseType} · {r.caseStatus} · {r.courtCode}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    Next: {r.nextHearingDate || '—'} · Filed: {r.filingDate}
                  </p>
                  <Button
                    className="mt-3"
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/cases/ecourts/${encodeURIComponent(r.cnr)}`)}
                  >
                    Open eCourts detail
                  </Button>
                </div>
              </Card>
            ))}

            <div className="flex gap-2 justify-between">
              <Button
                variant="outline"
                size="sm"
                disabled={!results.hasPreviousPage || loading}
                onClick={() => runSearch(results.page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!results.hasNextPage || loading}
                onClick={() => runSearch(results.page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
