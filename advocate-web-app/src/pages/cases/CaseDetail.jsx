import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Scale, Calendar, FileText, MessageSquare, Clock,
  Edit2, Plus, ChevronRight, CheckCircle2, AlertCircle,
  MapPin, User, Upload, Lock, Users,
} from 'lucide-react';
import {
  mockCases, mockClients, mockAdvocates, mockDocuments,
  mockAppointments, caseStatusOptions,
} from '../../data/mockData';

const statusColors = {
  'Hearing Scheduled': 'bg-blue-100 text-blue-700',
  'Judgment Pending': 'bg-amber-100 text-amber-700',
  'Under Review': 'bg-purple-100 text-purple-700',
  'Active': 'bg-green-100 text-green-700',
  'Discovery Phase': 'bg-indigo-100 text-indigo-700',
};

const timelineTypeIcon = { filed: '📄', update: '📝', hearing: '⚖️', upcoming: '📅' };
const timelineTypeColor = { filed: 'bg-navy-600', update: 'bg-blue-500', hearing: 'bg-amber-500', upcoming: 'bg-green-500' };

const TABS = ['Overview', 'Hearings', 'Documents', 'Timeline', 'Appointments'];

export default function CaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');
  const [editStatus, setEditStatus] = useState(false);
  const [addHearingModal, setAddHearingModal] = useState(false);
  const [newHearing, setNewHearing] = useState({ date: '', time: '', court: '', purpose: '', notes: '', judge: '' });

  const caseData = mockCases.find(c => c.id === id);
  if (!caseData) return (
    <div className="text-center py-20">
      <p className="text-gray-500">Case not found.</p>
      <Link to="/cases" className="btn-primary mt-4 inline-flex">Back to Cases</Link>
    </div>
  );

  const client = mockClients.find(c => c.id === caseData.clientId);
  const advocate = mockAdvocates.find(a => a.id === caseData.assignedAdvocateId);
  const docs = mockDocuments.filter(d => d.caseId === caseData.id);
  const appointments = mockAppointments.filter(a => a.caseId === caseData.id);
  const daysToHearing = caseData.nextHearing
    ? Math.ceil((new Date(caseData.nextHearing) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button onClick={() => navigate(-1)} className="btn-secondary px-3 py-2">
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
                onClick={() => setEditStatus(true)}
                className={`badge text-xs ${statusColors[caseData.status] || 'bg-gray-100 text-gray-600'} cursor-pointer hover:opacity-80`}
              >
                {caseData.status} <Edit2 size={10} className="ml-1" />
              </button>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-0.5 font-mono">{caseData.cnr}</p>
        </div>
        <div className="flex gap-2">
          <Link to={`/chat?client=${client?.id}`} className="btn-secondary">
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
              </div>
            </div>
          )}

          {/* Hearings */}
          {activeTab === 'Hearings' && (
            <div className="space-y-3">
              <div className="flex justify-end">
                <button onClick={() => setAddHearingModal(true)} className="btn-primary text-xs">
                  <Plus size={14} /> Add Hearing
                </button>
              </div>
              {caseData.hearings.map(h => (
                <div key={h.id} className={`p-4 rounded-xl border ${h.outcome === 'Upcoming' ? 'border-blue-200 bg-blue-50' : 'border-gray-100 bg-gray-50'}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-gray-900">
                          {new Date(h.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                        <span className="text-xs text-gray-500">at {h.time}</span>
                        {h.outcome === 'Upcoming' && (
                          <span className="badge bg-blue-100 text-blue-700 text-xs">Upcoming</span>
                        )}
                      </div>
                      <p className="text-xs font-medium text-gray-700 mt-1">{h.purpose}</p>
                      <p className="text-xs text-gray-500">{h.court} · {h.judge}</p>
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
          )}

          {/* Documents */}
          {activeTab === 'Documents' && (
            <div className="space-y-3">
              <div className="flex justify-end">
                <button className="btn-primary text-xs"><Upload size={14} /> Upload Document</button>
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
                <Link to={`/appointments/new?case=${caseData.id}`} className="btn-primary text-xs">
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
                <button onClick={() => setAddHearingModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
                <button onClick={() => setAddHearingModal(false)} className="btn-primary flex-1 justify-center">
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
