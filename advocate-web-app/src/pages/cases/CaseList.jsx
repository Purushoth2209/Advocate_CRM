import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Scale, Calendar, ChevronRight, AlertCircle, Landmark, ExternalLink } from 'lucide-react';
import { mockClients, mockAdvocates, caseStatusOptions, caseTypeOptions } from '../../data/mockData';
import { useCases } from '../../context/CasesContext';
import Tooltip from '../../components/ui/Tooltip';

const statusColors = {
  'Hearing Scheduled': 'bg-blue-100 text-blue-700',
  'Judgment Pending': 'bg-amber-100 text-amber-700',
  'Under Review': 'bg-purple-100 text-purple-700',
  'Active': 'bg-green-100 text-green-700',
  'Discovery Phase': 'bg-indigo-100 text-indigo-700',
  'Settled': 'bg-teal-100 text-teal-700',
  'Closed': 'bg-gray-100 text-gray-500',
};

const priorityDot = { high: 'bg-red-500', medium: 'bg-amber-400', low: 'bg-gray-300' };

export default function CaseList() {
  const { cases } = useCases();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAdvocate, setFilterAdvocate] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const filtered = cases.filter(c => {
    const q = search.toLowerCase();
    const title = (c.title || '').toLowerCase();
    const cnr = (c.cnr || '').toLowerCase();
    const typ = (c.type || '').toLowerCase();
    const matchSearch =
      !q ||
      title.includes(q) ||
      cnr.includes(q) ||
      (c.caseNumber || '').toLowerCase().includes(q) ||
      typ.includes(q);
    const matchStatus = filterStatus === 'all' || c.status === filterStatus;
    const matchAdv = filterAdvocate === 'all' || c.assignedAdvocateId === filterAdvocate;
    const matchType = filterType === 'all' || (c.type || '') === filterType;
    return matchSearch && matchStatus && matchAdv && matchType;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">All Cases</h2>
          <p className="text-sm text-gray-500 mt-0.5">{cases.length} total cases</p>
        </div>
        <Tooltip content="Register a new matter" side="bottom">
          <Link to="/cases/new" className="btn-primary">
            <Plus size={16} /> New Case
          </Link>
        </Tooltip>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title, case number, CNR, type..."
            className="input pl-9"
          />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input w-auto">
          <option value="all">All Status</option>
          {caseStatusOptions.map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="input w-auto">
          <option value="all">All Types</option>
          {caseTypeOptions.map(t => <option key={t}>{t}</option>)}
        </select>
        <select value={filterAdvocate} onChange={e => setFilterAdvocate(e.target.value)} className="input w-auto">
          <option value="all">All Advocates</option>
          {mockAdvocates.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
      </div>

      <div className="card p-4 flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 bg-gradient-to-r from-navy-900/[0.06] to-teal-50/50 border-navy-100">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-navy-800 flex items-center justify-center flex-shrink-0">
            <Landmark size={18} className="text-gold-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-navy-900">eCourts India (separate module)</p>
            <p className="text-xs text-gray-500">CNR lookup, national search, live sync — same as client app.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 sm:ml-auto">
          <Link to="/cases/ecourts" className="btn-primary text-xs py-1.5 px-3">
            Open eCourts hub
          </Link>
          <Link to="/cases/cnr" className="btn-secondary text-xs py-1.5 px-3">
            CNR lookup
          </Link>
          <Link to="/cases/search" className="btn-secondary text-xs py-1.5 px-3">
            Search
          </Link>
        </div>
      </div>

      {/* Cases table */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Case</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden md:table-cell">Client</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden lg:table-cell">Advocate</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Status</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden md:table-cell">Next Hearing</th>
              <th className="text-center text-xs font-semibold text-gray-500 px-2 py-3 w-14 hidden sm:table-cell">eCourts</th>
              <th className="px-4 py-3 w-8"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(c => {
              const client = mockClients.find(cl => cl.id === c.clientId);
              const advocate = mockAdvocates.find(a => a.id === c.assignedAdvocateId);
              const isUrgent = c.nextHearing && new Date(c.nextHearing) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
              return (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityDot[c.priority]}`} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate max-w-48">{c.title}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-xs text-gray-500 font-mono">{c.cnr}</span>
                          {c.caseNumber ? (
                            <span className="text-xs text-gray-600">Filing {c.caseNumber}</span>
                          ) : null}
                          <span className="badge bg-gray-100 text-gray-600 text-xs">{c.type}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell">
                    <p className="text-sm text-gray-700">{client?.name || '—'}</p>
                  </td>
                  <td className="px-4 py-4 hidden lg:table-cell">
                    <p className="text-sm text-gray-700">{advocate?.name.replace('Adv. ', '') || '—'}</p>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`badge text-xs ${statusColors[c.status] || 'bg-gray-100 text-gray-600'}`}>{c.status}</span>
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell">
                    {c.nextHearing ? (
                      <div className="flex items-center gap-1.5">
                        {isUrgent && <AlertCircle size={13} className="text-red-500 flex-shrink-0" />}
                        <span className={`text-xs font-medium ${isUrgent ? 'text-red-600' : 'text-gray-700'}`}>
                          {new Date(c.nextHearing).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-2 py-4 hidden sm:table-cell text-center">
                    <Tooltip content="Open live eCourts record for this CNR" side="left">
                      <Link
                        to={`/cases/ecourts/${encodeURIComponent(c.cnr)}`}
                        className="inline-flex p-1.5 rounded-lg text-navy-700 hover:bg-navy-50 border border-transparent hover:border-navy-100"
                        onClick={e => e.stopPropagation()}
                      >
                        <ExternalLink size={16} />
                      </Link>
                    </Tooltip>
                  </td>
                  <td className="px-4 py-4">
                    <Link to={`/cases/${c.id}`} className="p-1.5 hover:bg-gray-100 rounded-lg flex items-center">
                      <ChevronRight size={16} className="text-gray-400" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Scale size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No cases found</p>
          </div>
        )}
      </div>
    </div>
  );
}
