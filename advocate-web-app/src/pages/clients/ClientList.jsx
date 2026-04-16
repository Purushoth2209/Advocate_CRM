import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Filter, Phone, Mail, Briefcase, MapPin, ChevronRight, Tag } from 'lucide-react';
import { mockClients, mockAdvocates } from '../../data/mockData';
import Tooltip from '../../components/ui/Tooltip';

const statusBadge = {
  active: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-500',
  inactive: 'bg-red-100 text-red-600',
};

export default function ClientList() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAdvocate, setFilterAdvocate] = useState('all');

  const filtered = mockClients.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.tags.some(t => t.toLowerCase().includes(q));
    const matchStatus = filterStatus === 'all' || c.status === filterStatus;
    const matchAdv = filterAdvocate === 'all' || c.assignedAdvocateId === filterAdvocate;
    return matchSearch && matchStatus && matchAdv;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">All Clients</h2>
          <p className="text-sm text-gray-500 mt-0.5">{mockClients.length} total · {mockClients.filter(c => c.status === 'active').length} active</p>
        </div>
        <Tooltip content="Open new client intake" side="bottom">
          <Link to="/clients/new" className="btn-primary">
            <Plus size={16} />
            Add Client
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
            placeholder="Search by name, email, tag..."
            className="input pl-9"
          />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input w-auto">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="closed">Closed</option>
        </select>
        <select value={filterAdvocate} onChange={e => setFilterAdvocate(e.target.value)} className="input w-auto">
          <option value="all">All Advocates</option>
          {mockAdvocates.map(a => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      </div>

      {/* Client cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(client => {
          const advocate = mockAdvocates.find(a => a.id === client.assignedAdvocateId);
          return (
            <Link
              key={client.id}
              to={`/clients/${client.id}`}
              className="card p-5 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-gradient-to-br from-navy-600 to-navy-800 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-bold">
                      {client.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{client.name}</p>
                    <p className="text-xs text-gray-500 truncate">{client.occupation}</p>
                  </div>
                </div>
                <span className={`badge text-xs ${statusBadge[client.status]}`}>{client.status}</span>
              </div>

              <div className="space-y-1.5 mb-4">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Phone size={12} className="flex-shrink-0" />
                  <span>{client.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Mail size={12} className="flex-shrink-0" />
                  <span className="truncate">{client.email}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <MapPin size={12} className="flex-shrink-0" />
                  <span>{client.city}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-1 flex-wrap">
                  {client.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="badge bg-navy-50 text-navy-700 text-xs">{tag}</span>
                  ))}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Briefcase size={11} />
                  <span>{client.activeCases} cases</span>
                </div>
              </div>

              {advocate && (
                <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-2">
                  <div className="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-indigo-700 text-xs font-bold">
                      {advocate.name.replace('Adv. ', '')[0]}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 truncate">{advocate.name}</span>
                  <ChevronRight size={12} className="ml-auto text-gray-300 group-hover:text-navy-600 transition-colors" />
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 card">
          <Search size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-500">No clients found</p>
          <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
