import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, MessageSquare, Calendar, Upload, Clock, CheckCircle, Circle, Send, Tag, Download, Landmark } from 'lucide-react';
import Header from '../../components/layout/Header';
import Card from '../../components/ui/Card';
import { StatusBadge, Badge } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { useClientAppData } from '../../context/ClientExperienceContext';
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

function sortEcourtsHearingsLatestFirst(rows) {
  return [...rows].sort((a, b) => ecourtsHearingTimeMs(b) - ecourtsHearingTimeMs(a));
}

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

function toIsoDateLocal(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

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

const HEARING_RELATIVE_PRESETS = [
  { id: 'last2', label: 'Last 2 days' },
  { id: 'last7', label: 'Last 7 days' },
  { id: 'last10', label: 'Last 10 days' },
  { id: 'last30', label: 'Last 30 days' },
  { id: 'last90', label: 'Last 90 days' },
];

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

const tabs = ['Overview', 'eCourts', 'Timeline', 'Documents', 'Chat', 'Hearings'];

export default function CaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cases } = useClientAppData();
  const { getSnapshot, setSnapshot } = useEcourtsCache();
  const [activeTab, setActiveTab] = useState('Overview');
  const [message, setMessage] = useState('');
  const [hearingHistoryLimit, setHearingHistoryLimit] = useState(HEARING_HISTORY_PAGE_SIZE);
  const [ecourtsHistoryLoading, setEcourtsHistoryLoading] = useState(false);
  const [hearingDateFrom, setHearingDateFrom] = useState('');
  const [hearingDateTo, setHearingDateTo] = useState('');

  const caseData = cases.find((c) => c.id === id);
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

  if (!caseData) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 p-4 pb-24">
        <Header title="Case" showBack />
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <p className="text-sm font-medium text-gray-700">Case not found</p>
          <p className="text-xs text-gray-500 mt-2">It may not exist in preview mode, or you have no cases yet.</p>
          <Button className="mt-6" onClick={() => navigate('/cases')}>
            Back to cases
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      <Header title={caseData.title} showBack />

      {/* Case Header Card */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="flex items-center gap-2 mb-2">
          <StatusBadge status={caseData.status} />
          <span className="text-xs text-gray-400">·</span>
          <span className="text-xs text-gray-500">{caseData.type}</span>
        </div>
        <p className="text-xs text-gray-500">{caseData.court}</p>
        <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
          <span>CNR: <span className="font-mono text-gray-600">{caseData.cnr}</span></span>
          <span>Filed: {formatDate(caseData.filedDate)}</span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-navy-100 flex items-center justify-center text-navy-800 text-xs font-bold">
              {caseData.advocate.split(' ').pop()[0]}
            </div>
            <div>
              <p className="text-xs font-medium text-gray-700">{caseData.advocate}</p>
              <p className="text-[10px] text-gray-400">Your Advocate</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/cases/book-appointment')}
            className="text-xs bg-navy-100 text-navy-800 font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1"
          >
            <Calendar size={12} />
            Book Appointment
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100 px-4">
        <div className="flex overflow-x-auto scrollbar-hide -mb-px">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 py-3 px-3 text-xs font-medium border-b-2 transition-colors flex items-center gap-1 ${
                activeTab === tab
                  ? 'border-navy-700 text-navy-800'
                  : 'border-transparent text-gray-500'
              }`}
            >
              {tab === 'eCourts' && <Landmark size={12} />}
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 px-4 py-4">
        {/* OVERVIEW TAB */}
        {activeTab === 'eCourts' && (
          <div className="space-y-3">
            <p className="text-xs text-gray-500">
              Official case data from eCourts India. Use <strong>Fetch latest</strong> to reload, or{' '}
              <strong>Refresh case status</strong> to queue a source refresh (may take several minutes).
            </p>
            <EcourtsCasePanel cnr={caseData.cnr} />
          </div>
        )}

        {activeTab === 'Overview' && (
          <div className="space-y-4">
            <Card>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Case Details</h4>
              {[
                { label: 'Case Type', value: caseData.type },
                { label: 'Court', value: caseData.court },
                { label: 'Filed Date', value: formatDate(caseData.filedDate) },
                { label: 'Next Hearing', value: formatDate(caseData.nextHearing) },
                { label: 'Last Updated', value: formatDate(caseData.lastUpdated) },
              ].map(row => (
                <div key={row.label} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-xs text-gray-500">{row.label}</span>
                  <span className="text-xs font-medium text-gray-800">{row.value}</span>
                </div>
              ))}
            </Card>
            <Card className="bg-amber-50 border-amber-100">
              <div className="flex items-start gap-2">
                <Clock size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-amber-800">Hearing in {Math.ceil((new Date(caseData.nextHearing) - new Date()) / (1000 * 60 * 60 * 24))} days</p>
                  <p className="text-xs text-amber-600 mt-0.5">{formatDate(caseData.nextHearing)} · {caseData.court}</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* TIMELINE TAB */}
        {activeTab === 'Timeline' && (
          <div className="space-y-0">
            <p className="text-xs text-gray-500 mb-4">Complete history of your case</p>
            {caseData.timeline.map((event, idx) => (
              <div key={idx} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                    event.type === 'upcoming' ? 'bg-blue-100' : 'bg-navy-100'
                  }`}>
                    {event.type === 'upcoming'
                      ? <Circle size={14} className="text-blue-500" />
                      : <CheckCircle size={14} className="text-navy-700" />
                    }
                  </div>
                  {idx < caseData.timeline.length - 1 && (
                    <div className="w-0.5 h-full bg-gray-100 my-1 min-h-[20px]" />
                  )}
                </div>
                <div className="pb-5 flex-1">
                  <p className="text-xs text-gray-400">{formatDate(event.date)}</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{event.event}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{event.description}</p>
                  {event.type === 'upcoming' && (
                    <Badge variant="blue" size="xs" className="mt-1">Upcoming</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* DOCUMENTS TAB */}
        {activeTab === 'Documents' && (
          <div className="space-y-3">
            <Button variant="outline" size="sm" fullWidth>
              <Upload size={14} />
              Upload Document
            </Button>
            {caseData.documents.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <FileText size={40} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No documents yet</p>
              </div>
            ) : (
              caseData.documents.map(doc => (
                <Card key={doc.id}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText size={18} className="text-red-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{doc.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {doc.uploadedBy === 'You' ? (
                          <span className="text-navy-700 font-medium">You</span>
                        ) : doc.uploadedBy} · {formatDate(doc.uploadedAt)} · {doc.size}
                      </p>
                      <Badge variant="default" size="xs">{doc.category}</Badge>
                    </div>
                    <button className="p-2 rounded-lg hover:bg-gray-50">
                      <Download size={14} className="text-gray-400" />
                    </button>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {/* CHAT TAB */}
        {activeTab === 'Chat' && (
          <div className="flex flex-col h-[calc(100vh-280px)]">
            <div className="flex-1 overflow-y-auto space-y-3 pb-2">
              {caseData.messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender === 'client' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] ${msg.sender === 'client' ? 'items-end' : 'items-start'} flex flex-col`}>
                    {msg.isInstruction && (
                      <div className="flex items-center gap-1 mb-1">
                        <Tag size={10} className="text-amber-500" />
                        <span className="text-[10px] text-amber-600 font-medium">Instruction</span>
                      </div>
                    )}
                    <div className={`px-3 py-2 rounded-2xl text-sm ${
                      msg.sender === 'client'
                        ? `${msg.isInstruction ? 'bg-amber-500' : 'bg-navy-700'} text-white rounded-br-sm`
                        : 'bg-white border border-gray-100 text-gray-700 rounded-bl-sm'
                    }`}>
                      {msg.text}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 mx-1">
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white border-t border-gray-100 pt-3 flex items-center gap-2">
              <button className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors">
                <Tag size={16} />
              </button>
              <input
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Type a message or instruction..."
                className="flex-1 bg-gray-50 rounded-xl px-3 py-2.5 text-sm outline-none border border-gray-100"
              />
              <button type="button" className="p-2.5 bg-navy-700 rounded-xl text-white hover:bg-navy-800">
                <Send size={16} />
              </button>
            </div>
          </div>
        )}

        {/* HEARINGS TAB */}
        {activeTab === 'Hearings' && (
          <div className="space-y-5">
            {cnrKey && (
              <div className="space-y-4">
                {!hasPartnerToken() && (
                  <p className="text-xs text-gray-500">
                    Add <code className="font-mono bg-gray-100 px-1 rounded">VITE_ECOURTS_API_TOKEN</code> for eCourts next
                    hearing and history.
                  </p>
                )}
                {hasPartnerToken() && ecourtsHistoryLoading && !ecourtsCourt && (
                  <p className="text-xs text-gray-500">Loading eCourts case…</p>
                )}
                {hasPartnerToken() && !ecourtsHistoryLoading && !ecourtsCourt && (
                  <p className="text-xs text-gray-500">
                    No eCourts data yet. Open <strong>eCourts</strong> and tap <strong>Fetch latest</strong>.
                  </p>
                )}
                {hasPartnerToken() && ecourtsCourt && (
                  <>
                    <div className="rounded-xl border-2 border-navy-500 bg-gradient-to-br from-navy-50 via-white to-indigo-50/90 p-4 shadow-lg ring-2 ring-navy-100/80">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-navy-800">Next hearing</p>
                      <p className="mt-1 text-xl font-bold tabular-nums text-navy-950">
                        {formatEcourtsHearingDate(ecourtsNextHearingRaw)}
                      </p>
                    </div>

                    <Card className="p-3 space-y-3">
                      <p className="text-[10px] font-semibold text-gray-500 uppercase flex items-center gap-1.5">
                        <Calendar size={12} />
                        Filter history by date
                      </p>
                      <div className="flex flex-col gap-2">
                        <div>
                          <label htmlFor="client-hearing-from" className="text-[10px] text-gray-500">
                            From
                          </label>
                          <input
                            id="client-hearing-from"
                            type="date"
                            value={hearingDateFrom}
                            onChange={(e) => setHearingDateFrom(e.target.value)}
                            className="w-full mt-0.5 rounded-lg border border-gray-200 px-2 py-1.5 text-xs"
                          />
                        </div>
                        <div>
                          <label htmlFor="client-hearing-to" className="text-[10px] text-gray-500">
                            To
                          </label>
                          <input
                            id="client-hearing-to"
                            type="date"
                            value={hearingDateTo}
                            onChange={(e) => setHearingDateTo(e.target.value)}
                            className="w-full mt-0.5 rounded-lg border border-gray-200 px-2 py-1.5 text-xs"
                          />
                        </div>
                        {hearingFilterActive && (
                          <button
                            type="button"
                            className="text-xs font-semibold text-navy-700 py-1 text-left"
                            onClick={() => {
                              setHearingDateFrom('');
                              setHearingDateTo('');
                            }}
                          >
                            Clear dates
                          </button>
                        )}
                      </div>
                      <div className="pt-2 border-t border-gray-100">
                        <p className="text-[10px] font-semibold text-gray-500 uppercase mb-2">Quick ranges</p>
                        <div className="flex flex-wrap gap-1.5">
                          {HEARING_RELATIVE_PRESETS.map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              className="text-[10px] px-2 py-1 rounded-full border border-gray-200 bg-gray-50 text-gray-700 active:bg-navy-100"
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
                        <p className="text-[10px] text-gray-400 mt-2">Last N days includes today and the previous N - 1 days.</p>
                      </div>
                    </Card>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">Hearings history</h3>
                      {hasPartnerToken() && ecourtsHistoryLoading && hearingHistoryRows.length === 0 && (
                        <p className="text-xs text-gray-500">Loading hearings history…</p>
                      )}
                      {hasPartnerToken() && !ecourtsHistoryLoading && hearingHistoryRows.length === 0 && (
                        <p className="text-xs text-gray-500">No hearings history for this CNR yet.</p>
                      )}
                      {hasPartnerToken() &&
                        !ecourtsHistoryLoading &&
                        hearingHistoryRows.length > 0 &&
                        hearingHistoryFiltered.length === 0 && (
                          <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                            No rows in this date range. Adjust dates or clear the filter.
                          </p>
                        )}
                      {hearingHistoryFiltered.length > 0 && (
                        <ul className="space-y-2">
                          {visibleHearingHistory.map((h, i) => (
                            <li key={i} className="text-xs border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                              <p className="font-medium text-gray-800">{formatEcourtsHearingDate(h.hearingDate || h.businessOnDate)}</p>
                              <p className="text-gray-600 mt-0.5">{h.purposeOfListing || '—'}</p>
                              {h.judge && <p className="text-gray-400 mt-0.5">Judge: {h.judge}</p>}
                            </li>
                          ))}
                        </ul>
                      )}
                      {hasMoreHearingHistory && (
                        <button
                          type="button"
                          className="mt-3 text-xs font-semibold text-navy-700"
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
          </div>
        )}
      </div>
    </div>
  );
}
