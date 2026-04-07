import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Scale, Calendar, ChevronRight, AlertCircle } from 'lucide-react';
import { mockCases, mockClients, mockAdvocates, caseStatusOptions, caseTypeOptions } from '../../data/mockData';

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
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAdvocate, setFilterAdvocate] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const filtered = mockCases.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.title.toLowerCase().includes(q) || c.cnr.toLowerCase().includes(q) || c.type.toLowerCase().includes(q);
    const matchStatus = filterStatus === 'all' || c.status === filterStatus;
    const matchAdv = filterAdvocate === 'all' || c.assignedAdvocateId === filterAdvocate;
    const matchType = filterType === 'all' || c.type === filterType;
    return matchSearch && matchStatus && matchAdv && matchType;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">All Cases</h2>
          <p className="text-sm text-gray-500 mt-0.5">{mockCases.length} total cases</p>
        </div>
        <Link to="/cases/new" className="btn-primary">
          <Plus size={16} /> New Case
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title, CNR number, type..."
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
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-500 font-mono">{c.cnr}</span>
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
