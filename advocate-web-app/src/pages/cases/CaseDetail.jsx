import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Scale, Calendar, FileText, MessageSquare, Clock,
  Edit2, Plus, ChevronRight, CheckCircle2, AlertCircle,
  MapPin, User, Upload, Lock, Users,
} from 'lucide-react';
import {
  mockClients, mockAdvocates,
  mockAppointments, caseStatusOptions,
} from '../../data/mockData';
import { useCases } from '../../context/CasesContext';
import { useDocuments } from '../../context/DocumentsContext';
import { useEcourtsCache } from '../../context/EcourtsCacheContext';
import EcourtsCasePanel from '../../components/e-courts/EcourtsCasePanel';
import { asArray, getCaseByCnr, hasPartnerToken, pickNextHearingDateFromCaseDetail } from '../../modules/e-courts';

const HEARING_HISTORY_PAGE_SIZE = 10;

function formatEcourtsHearingDate(d) {
  if (!d) return '—';
  const t = Date.parse(d);
  if (Number.isNaN(t)) return String(d);
  return new Date(t).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function ecourtsHearingTimeMs(h) {
  const d = h?.hearingDate ?? h?.businessOnDate;
  if (!d) return Number.NEGATIVE_INFINITY;
  const t = Date.parse(d);
  return Number.isNaN(t) ? Number.NEGATIVE_INFINITY : t;
}

/** Newest hearing first; rows without a parseable date go last. */
function sortEcourtsHearingsLatestFirst(rows) {
  return [...rows].sort((a, b) => ecourtsHearingTimeMs(b) - ecourtsHearingTimeMs(a));
}

function officeHearingDateMs(h) {
  if (!h?.date) return Number.NEGATIVE_INFINITY;
  const t = Date.parse(h.date);
  return Number.isNaN(t) ? Number.NEGATIVE_INFINITY : t;
}

function sortOfficeHearingsLatestFirst(hearings) {
  return [...hearings].sort((a, b) => officeHearingDateMs(b) - officeHearingDateMs(a));
}

/** `YYYY-MM-DD` from `<input type="date" />` → start of local day ms */
function startOfDayMs(iso) {
  if (!iso || typeof iso !== 'string') return null;
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d, 0, 0, 0, 0).getTime();
}

function endOfDayMs(iso) {
  if (!iso || typeof iso !== 'string') return null;
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d, 23, 59, 59, 999).getTime();
}

function ecourtsHearingInDateRange(h, fromIso, toIso) {
  const ms = ecourtsHearingTimeMs(h);
  if (ms === Number.NEGATIVE_INFINITY) return !(fromIso || toIso);
  const from = startOfDayMs(fromIso);
  const to = endOfDayMs(toIso);
  if (from != null && ms < from) return false;
  if (to != null && ms > to) return false;
  return true;
}

function officeHearingInDateRange(h, fromIso, toIso) {
  const ms = officeHearingDateMs(h);
  if (ms === Number.NEGATIVE_INFINITY) return !(fromIso || toIso);
  const from = startOfDayMs(fromIso);
  const to = endOfDayMs(toIso);
  if (from != null && ms < from) return false;
  if (to != null && ms > to) return false;
  return true;
}

/** Next hearing from GET /case/{cnr} `data` — `courtCaseData.nextHearingDate` and common aliases. */
function pickEcourtsNextHearingDate(detail) {
  if (!detail || typeof detail !== 'object') return null;
  const court = detail.courtCaseData ?? detail.court_case_data;
  const entity = detail.entityInfo ?? detail.entity_info;
  const raw =
    court?.nextHearingDate ??
    court?.next_hearing_date ??
    court?.nextHearing ??
    court?.next_hearing ??
    entity?.nextDateOfHearing ??
    entity?.next_date_of_hearing ??
    detail.nextHearingDate ??
    detail.next_hearing_date;
  if (raw == null || raw === '') return null;
  return raw;
}

function toIsoDateLocal(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Preset → { from, to } in local `YYYY-MM-DD`. “Last N days” = N calendar days including today.
 */
function getRelativeHearingRange(presetId) {
  const today = new Date();
  const end = toIsoDateLocal(today);

  const lastNDaysInclusive = (n) => {
    const s = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    s.setDate(s.getDate() - (n - 1));
    return { from: toIsoDateLocal(s), to: end };
  };

  switch (presetId) {
    case 'last2':
      return lastNDaysInclusive(2);
    case 'last7':
      return lastNDaysInclusive(7);
    case 'last10':
      return lastNDaysInclusive(10);
    case 'last30':
      return lastNDaysInclusive(30);
    case 'last90':
      return lastNDaysInclusive(90);
    default:
      return { from: '', to: '' };
  }
}

/** Labels for quick-range chips (order = common workflows first). */
const HEARING_RELATIVE_PRESETS = [
  { id: 'last2', label: 'Last 2 days' },
  { id: 'last7', label: 'Last 7 days' },
  { id: 'last10', label: 'Last 10 days' },
  { id: 'last30', label: 'Last 30 days' },
  { id: 'last90', label: 'Last 90 days' },
];

const statusColors = {
  'Hearing Scheduled': 'bg-blue-100 text-blue-700',
  'Judgment Pending': 'bg-amber-100 text-amber-700',
  'Under Review': 'bg-purple-100 text-purple-700',
  'Active': 'bg-green-100 text-green-700',
  'Discovery Phase': 'bg-indigo-100 text-indigo-700',
};

const timelineTypeIcon = { filed: '📄', update: '📝', hearing: '⚖️', upcoming: '📅' };
const timelineTypeColor = { filed: 'bg-navy-600', update: 'bg-blue-500', hearing: 'bg-amber-500', upcoming: 'bg-green-500' };

const TABS = ['Overview', 'eCourts', 'Hearings', 'Documents', 'Timeline', 'Appointments'];

export default function CaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cases } = useCases();
  const { documents } = useDocuments();
  const { getSnapshot, setSnapshot } = useEcourtsCache();
  const [activeTab, setActiveTab] = useState('Overview');
  const [editStatus, setEditStatus] = useState(false);
  const [addHearingModal, setAddHearingModal] = useState(false);
  const [newHearing, setNewHearing] = useState({ date: '', time: '', court: '', purpose: '', notes: '', judge: '' });
  const [hearingHistoryLimit, setHearingHistoryLimit] = useState(HEARING_HISTORY_PAGE_SIZE);
  const [ecourtsHistoryLoading, setEcourtsHistoryLoading] = useState(false);
  /** `YYYY-MM-DD` — filter court + office hearing lists */
  const [hearingDateFrom, setHearingDateFrom] = useState('');
  const [hearingDateTo, setHearingDateTo] = useState('');

  const caseData = cases.find(c => c.id === id);
  const cnrKey = caseData
    ? String(caseData.cnr || '')
        .trim()
        .toUpperCase()
    : '';

  useEffect(() => {
    setHearingHistoryLimit(HEARING_HISTORY_PAGE_SIZE);
  }, [cnrKey, hearingDateFrom, hearingDateTo]);

  useEffect(() => {
    if (!cnrKey || !hasPartnerToken()) return;
    if (getSnapshot(cnrKey)?.payload?.data) return;
    let cancelled = false;
    setEcourtsHistoryLoading(true);
    getCaseByCnr(cnrKey)
      .then((res) => {
        if (!cancelled) setSnapshot(cnrKey, res);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setEcourtsHistoryLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [cnrKey, getSnapshot, setSnapshot]);

  const ecourtsDetail = cnrKey ? getSnapshot(cnrKey)?.payload?.data : undefined;
  const ecourtsCourt = ecourtsDetail?.courtCaseData ?? ecourtsDetail?.court_case_data;
  const ecourtsNextHearingRaw = pickNextHearingDateFromCaseDetail(ecourtsDetail);
  const hearingHistoryRows = sortEcourtsHearingsLatestFirst(asArray(ecourtsCourt?.historyOfCaseHearings));

  const hearingHistoryFiltered = useMemo(() => {
    if (!hearingDateFrom && !hearingDateTo) return hearingHistoryRows;
    return hearingHistoryRows.filter((h) => ecourtsHearingInDateRange(h, hearingDateFrom, hearingDateTo));
  }, [hearingHistoryRows, hearingDateFrom, hearingDateTo]);

  const visibleHearingHistory = hearingHistoryFiltered.slice(0, hearingHistoryLimit);
  const hasMoreHearingHistory = hearingHistoryFiltered.length > hearingHistoryLimit;
  const hearingFilterActive = Boolean(hearingDateFrom || hearingDateTo);

  const showOfficeRecordedHearings = caseData?.clientId !== 'cli-raghav';
  const officeHearingsFiltered = useMemo(() => {
    if (!caseData || !showOfficeRecordedHearings) return [];
    const sorted = sortOfficeHearingsLatestFirst(caseData.hearings ?? []);
    if (!hearingDateFrom && !hearingDateTo) return sorted;
    return sorted.filter((h) => officeHearingInDateRange(h, hearingDateFrom, hearingDateTo));
  }, [caseData, showOfficeRecordedHearings, hearingDateFrom, hearingDateTo]);

  if (!caseData) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Case not found.</p>
        <Link to="/cases" className="btn-primary mt-4 inline-flex">
          Back to Cases
        </Link>
      </div>
    );
  }

  const client = mockClients.find(c => c.id === caseData.clientId);
  const advocate = mockAdvocates.find(a => a.id === caseData.assignedAdvocateId);
  const docs = documents.filter(d => d.caseId === caseData.id);
  const appointments = mockAppointments.filter(a => a.caseId === caseData.id);
  const daysToHearing = caseData.nextHearing
    ? Math.ceil((new Date(caseData.nextHearing) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button
          type="button"
          title="Go back to the previous page"
          onClick={() => navigate(-1)}
          className="btn-secondary px-3 py-2"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-lg font-semibold text-gray-900">{caseData.title}</h2>
            {editStatus ? (
              <select
                defaultValue={caseData.status}
                onChange={() => setEditStatus(false)}
                onBlur={() => setEditStatus(false)}
                autoFocus
                className="input w-auto text-xs py-1"
              >
                {caseStatusOptions.map(s => <option key={s}>{s}</option>)}
              </select>
            ) : (
              <button
                type="button"
                title="Change case status"
                onClick={() => setEditStatus(true)}
                className={`badge text-xs ${statusColors[caseData.status] || 'bg-gray-100 text-gray-600'} cursor-pointer hover:opacity-80`}
              >
                {caseData.status} <Edit2 size={10} className="ml-1" />
              </button>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-0.5 font-mono">{caseData.cnr}</p>
          {caseData.caseNumber ? (
            <p className="text-xs text-gray-500 mt-0.5">
              Filing no.: <span className="font-mono text-gray-700">{caseData.caseNumber}</span>
            </p>
          ) : null}
        </div>
        <div className="flex gap-2">
          <Link to={`/chat?client=${client?.id}`} className="btn-secondary" title="Open chat with the client on this case">
            <MessageSquare size={15} /> Message Client
          </Link>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-xs text-gray-500">Client</p>
          <Link to={`/clients/${client?.id}`} className="text-sm font-semibold text-navy-700 hover:underline mt-0.5 block truncate">
            {client?.name || '—'}
          </Link>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500">Advocate</p>
          <p className="text-sm font-semibold text-gray-900 mt-0.5 truncate">{advocate?.name || '—'}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500">Court</p>
          <p className="text-sm font-semibold text-gray-900 mt-0.5 truncate">{caseData.court}</p>
        </div>
        <div className={`card p-4 ${daysToHearing !== null && daysToHearing <= 3 ? 'border-red-200 bg-red-50' : ''}`}>
          <p className="text-xs text-gray-500">Next Hearing</p>
          {caseData.nextHearing ? (
            <div>
              <p className={`text-sm font-semibold mt-0.5 ${daysToHearing !== null && daysToHearing <= 3 ? 'text-red-700' : 'text-gray-900'}`}>
                {new Date(caseData.nextHearing).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
              {daysToHearing !== null && (
                <p className={`text-xs mt-0.5 ${daysToHearing <= 3 ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                  {daysToHearing === 0 ? 'Today!' : daysToHearing === 1 ? 'Tomorrow' : `In ${daysToHearing} days`}
                </p>
              )}
            </div>
          ) : <p className="text-sm text-gray-400 mt-0.5">Not scheduled</p>}
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="border-b border-gray-100 px-5">
          <div className="flex gap-1 overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab ? 'border-navy-700 text-navy-700' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5">
          {/* Overview */}
          {activeTab === 'Overview' && (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Case Description</p>
                <p className="text-sm text-gray-700">{caseData.description}</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Case Type</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">{caseData.type}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Filed Date</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">{new Date(caseData.filedDate).toLocaleDateString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Priority</p>
                  <span className={`badge text-xs mt-0.5 ${caseData.priority === 'high' ? 'bg-red-100 text-red-600' : caseData.priority === 'medium' ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-600'}`}>
                    {caseData.priority}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Last Updated</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">
                    {new Date(caseData.lastUpdated).toLocaleDateString('en-IN')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Documents</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">{docs.length} files</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">CNR Number</p>
                  <p className="text-sm font-medium font-mono text-gray-900 mt-0.5">{caseData.cnr}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Filing number</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">{caseData.caseNumber || '—'}</p>
                </div>
                {caseData.registrationNumber && (
                  <div>
                    <p className="text-xs text-gray-500">Registration number</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">{caseData.registrationNumber}</p>
                  </div>
                )}
                {caseData.registrationDate && (
                  <div>
                    <p className="text-xs text-gray-500">Registration date</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">
                      {new Date(caseData.registrationDate).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                )}
                {caseData.firstHearingDate && (
                  <div>
                    <p className="text-xs text-gray-500">First hearing date</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">
                      {new Date(caseData.firstHearingDate).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                )}
                {caseData.caseStage && (
                  <div className="md:col-span-2 lg:col-span-3">
                    <p className="text-xs text-gray-500">Case stage</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">{caseData.caseStage}</p>
                  </div>
                )}
                {caseData.ecourtsLocation && (
                  <div>
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">{caseData.ecourtsLocation}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'eCourts' && (
            <div className="space-y-4 max-w-4xl">
              <p className="text-sm text-gray-600">
                Live data from EcourtsIndia (Partner API). Set{' '}
                <code className="font-mono text-xs bg-gray-100 px-1 rounded">VITE_ECOURTS_API_TOKEN</code> in{' '}
                <code className="font-mono text-xs">.env</code>. Use <strong>Fetch latest</strong> or{' '}
                <strong>Refresh case status</strong> to queue a source refresh.
              </p>
              <EcourtsCasePanel cnr={caseData.cnr} />
            </div>
          )}

          {/* Hearings */}
          {activeTab === 'Hearings' && (
            <div className="space-y-6 max-w-4xl">
              {cnrKey && (
                <div className="space-y-5">
                  {!hasPartnerToken() && (
                    <p className="text-sm text-gray-500">
                      Add <code className="font-mono text-xs bg-gray-100 px-1 rounded">VITE_ECOURTS_API_TOKEN</code> to load
                      eCourts next hearing and hearings history.
                    </p>
                  )}
                  {hasPartnerToken() && ecourtsHistoryLoading && !ecourtsCourt && (
                    <p className="text-sm text-gray-500">Loading eCourts case…</p>
                  )}
                  {hasPartnerToken() && !ecourtsHistoryLoading && !ecourtsCourt && (
                    <p className="text-sm text-gray-500">
                      No eCourts case data yet. Open the <strong>eCourts</strong> tab and use <strong>Fetch latest</strong>.
                    </p>
                  )}
                  {hasPartnerToken() && ecourtsCourt && (
                    <>
                      <div className="rounded-xl border-2 border-navy-500 bg-gradient-to-br from-navy-50 via-white to-indigo-50/90 p-5 shadow-lg ring-2 ring-navy-100/80">
                        <p className="text-xs font-bold uppercase tracking-wider text-navy-800">Next hearing</p>
                        <p className="mt-2 text-2xl font-bold tabular-nums text-navy-950">
                          {formatEcourtsHearingDate(ecourtsNextHearingRaw)}
                        </p>
                      </div>

                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
                        <div className="flex flex-wrap items-end gap-3">
                          <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                            <Calendar size={14} className="text-gray-400" />
                            Filter history by date
                          </div>
                          <div>
                            <label htmlFor="hearing-date-from" className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">
                              From
                            </label>
                            <input
                              id="hearing-date-from"
                              type="date"
                              value={hearingDateFrom}
                              onChange={(e) => setHearingDateFrom(e.target.value)}
                              className="input text-sm py-1.5 min-w-[10rem]"
                            />
                          </div>
                          <div>
                            <label htmlFor="hearing-date-to" className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">
                              To
                            </label>
                            <input
                              id="hearing-date-to"
                              type="date"
                              value={hearingDateTo}
                              onChange={(e) => setHearingDateTo(e.target.value)}
                              className="input text-sm py-1.5 min-w-[10rem]"
                            />
                          </div>
                          {hearingFilterActive && (
                            <button
                              type="button"
                              className="btn-secondary text-xs"
                              onClick={() => {
                                setHearingDateFrom('');
                                setHearingDateTo('');
                              }}
                            >
                              Clear dates
                            </button>
                          )}
                        </div>
                        <div className="pt-2 border-t border-gray-200">
                          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Quick ranges</p>
                          <div className="flex flex-wrap gap-1.5">
                            {HEARING_RELATIVE_PRESETS.map((p) => (
                              <button
                                key={p.id}
                                type="button"
                                className="text-xs px-2.5 py-1 rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-navy-50 hover:border-navy-200 transition-colors"
                                onClick={() => {
                                  const { from, to } = getRelativeHearingRange(p.id);
                                  setHearingDateFrom(from);
                                  setHearingDateTo(to);
                                }}
                              >
                                {p.label}
                              </button>
                            ))}
                          </div>
                          <p className="text-[10px] text-gray-400 mt-2">
                            Last N days = today plus the previous N - 1 calendar days.
                          </p>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-base font-semibold text-gray-900 mb-3">Hearings history</h3>
                        {hasPartnerToken() && ecourtsHistoryLoading && hearingHistoryRows.length === 0 && (
                          <p className="text-sm text-gray-500">Loading hearings history…</p>
                        )}
                        {hasPartnerToken() && !ecourtsHistoryLoading && hearingHistoryRows.length === 0 && (
                          <p className="text-sm text-gray-500">No hearings history returned for this CNR yet.</p>
                        )}
                        {hasPartnerToken() &&
                          !ecourtsHistoryLoading &&
                          hearingHistoryRows.length > 0 &&
                          hearingHistoryFiltered.length === 0 && (
                            <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                              No rows in this date range. Try different dates or clear the filter.
                            </p>
                          )}
                        {hearingHistoryFiltered.length > 0 && (
                          <ul className="space-y-2">
                            {visibleHearingHistory.map((h, i) => (
                              <li key={i} className="text-sm border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                                <p className="font-medium text-gray-800">{formatEcourtsHearingDate(h.hearingDate || h.businessOnDate)}</p>
                                <p className="text-gray-600 text-xs mt-0.5">{h.purposeOfListing || '—'}</p>
                                {h.judge && <p className="text-gray-400 text-xs mt-0.5">Judge: {h.judge}</p>}
                              </li>
                            ))}
                          </ul>
                        )}
                        {hasMoreHearingHistory && (
                          <button
                            type="button"
                            className="mt-3 text-sm font-medium text-navy-700 hover:underline"
                            onClick={() => setHearingHistoryLimit((n) => n + HEARING_HISTORY_PAGE_SIZE)}
                          >
                            Show more ({hearingHistoryFiltered.length - hearingHistoryLimit} remaining)
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              {showOfficeRecordedHearings && (
                <div>
                  <div className="flex justify-between items-center gap-2 mb-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Office-recorded hearings</p>
                    <button
                      type="button"
                      title="Record a new hearing"
                      onClick={() => setAddHearingModal(true)}
                      className="btn-primary text-xs"
                    >
                      <Plus size={14} /> Add Hearing
                    </button>
                  </div>
                  <div className="space-y-3">
                    {hearingFilterActive &&
                      officeHearingsFiltered.length === 0 &&
                      (caseData.hearings?.length ?? 0) > 0 && (
                        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                          No office-recorded hearings in this date range.
                        </p>
                      )}
                    {officeHearingsFiltered.map((h) => (
                      <div
                        key={h.id}
                        className={`p-4 rounded-xl border ${h.outcome === 'Upcoming' ? 'border-blue-200 bg-blue-50' : 'border-gray-100 bg-gray-50'}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-semibold text-gray-900">
                                {new Date(h.date).toLocaleDateString('en-IN', {
                                  weekday: 'short',
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                })}
                              </p>
                              <span className="text-xs text-gray-500">at {h.time}</span>
                              {h.outcome === 'Upcoming' && (
                                <span className="badge bg-blue-100 text-blue-700 text-xs">Upcoming</span>
                              )}
                            </div>
                            <p className="text-xs font-medium text-gray-700 mt-1">{h.purpose}</p>
                            <p className="text-xs text-gray-500">
                              {h.court} · {h.judge}
                            </p>
                            {h.notes && <p className="text-xs text-gray-600 mt-1 italic">"{h.notes}"</p>}
                          </div>
                          {h.outcome !== 'Upcoming' && (
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <CheckCircle2 size={14} className="text-green-500" />
                              <span className="text-xs text-green-700 font-medium">{h.outcome}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Documents */}
          {activeTab === 'Documents' && (
            <div className="space-y-3">
              <div className="flex justify-end">
                <button type="button" className="btn-primary text-xs" title="Use Document Vault to add files (opens from main menu)">
                  <Upload size={14} /> Upload Document
                </button>
              </div>
              {docs.length === 0 && <p className="text-sm text-gray-500 text-center py-8">No documents yet.</p>}
              {docs.map(doc => (
                <div key={doc.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${doc.type === 'pdf' ? 'bg-red-100' : 'bg-blue-100'}`}>
                    <FileText size={16} className={doc.type === 'pdf' ? 'text-red-600' : 'text-blue-600'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                    <p className="text-xs text-gray-500">{doc.category} · {doc.size} · {doc.uploadedByName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`badge text-xs ${doc.visibility === 'shared' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {doc.visibility === 'shared' ? <Users size={10} className="mr-1" /> : <Lock size={10} className="mr-1" />}
                      {doc.visibility === 'shared' ? 'Shared' : 'Private'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Timeline */}
          {activeTab === 'Timeline' && (
            <div className="relative pl-6">
              <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-gray-100" />
              <div className="space-y-4">
                {caseData.timeline.map((event, idx) => (
                  <div key={idx} className="relative flex items-start gap-4">
                    <div className={`absolute -left-6 w-5 h-5 rounded-full ${timelineTypeColor[event.type]} flex items-center justify-center flex-shrink-0 text-xs`}>
                      <span>{timelineTypeIcon[event.type]}</span>
                    </div>
                    <div className={`flex-1 p-3 rounded-xl ${event.type === 'upcoming' ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}>
                      <p className="text-xs font-semibold text-gray-500">
                        {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                      <p className={`text-sm font-medium mt-0.5 ${event.type === 'upcoming' ? 'text-blue-700' : 'text-gray-900'}`}>
                        {event.event}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Appointments */}
          {activeTab === 'Appointments' && (
            <div className="space-y-3">
              <div className="flex justify-end">
                <Link to={`/appointments/new?case=${caseData.id}`} className="btn-primary text-xs" title="Book an appointment linked to this case">
                  <Plus size={14} /> Schedule Appointment
                </Link>
              </div>
              {appointments.length === 0 && <p className="text-sm text-gray-500 text-center py-8">No appointments scheduled.</p>}
              {appointments.map(a => (
                <div key={a.id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                  <Calendar size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{a.purpose}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(a.date).toLocaleDateString('en-IN')} at {a.time} · {a.duration} min · {a.type}
                    </p>
                    <p className="text-xs text-gray-500">{a.location}</p>
                  </div>
                  <span className={`badge text-xs ${a.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Hearing Modal */}
      {addHearingModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="px-6 py-5 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">Add Hearing</h3>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Date</label>
                  <input type="date" value={newHearing.date} onChange={e => setNewHearing({...newHearing, date: e.target.value})} className="input" />
                </div>
                <div>
                  <label className="label">Time</label>
                  <input type="time" value={newHearing.time} onChange={e => setNewHearing({...newHearing, time: e.target.value})} className="input" />
                </div>
              </div>
              <div>
                <label className="label">Court</label>
                <input type="text" defaultValue={caseData.court} className="input" placeholder="Court name..." />
              </div>
              <div>
                <label className="label">Purpose</label>
                <input type="text" value={newHearing.purpose} onChange={e => setNewHearing({...newHearing, purpose: e.target.value})} className="input" placeholder="e.g. Final Arguments" />
              </div>
              <div>
                <label className="label">Judge</label>
                <input type="text" value={newHearing.judge} onChange={e => setNewHearing({...newHearing, judge: e.target.value})} className="input" placeholder="Hon. Justice..." />
              </div>
              <div>
                <label className="label">Notes</label>
                <textarea value={newHearing.notes} onChange={e => setNewHearing({...newHearing, notes: e.target.value})} className="input resize-none" rows={2} placeholder="Any notes..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" title="Close without saving" onClick={() => setAddHearingModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
                <button type="button" title="Close modal (demo — not persisted)" onClick={() => setAddHearingModal(false)} className="btn-primary flex-1 justify-center">
                  <Plus size={14} /> Add Hearing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
