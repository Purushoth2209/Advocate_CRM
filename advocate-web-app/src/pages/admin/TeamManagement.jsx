import { useState } from 'react';
import {
  Shield, Plus, Search, Edit2, Trash2, MoreVertical,
  Mail, Phone, Briefcase, CheckCircle2, XCircle, X,
  Key, UserCog, Crown,
} from 'lucide-react';
import { mockAdvocates } from '../../data/mockData';

const roleBadge = {
  'Admin': 'bg-purple-100 text-purple-700',
  'Partner': 'bg-navy-100 text-navy-700',
  'Senior Advocate': 'bg-blue-100 text-blue-700',
  'Associate': 'bg-indigo-100 text-indigo-700',
  'Junior Advocate': 'bg-gray-100 text-gray-700',
};

const ROLE_OPTIONS = ['Admin', 'Partner', 'Senior Advocate', 'Associate', 'Junior Advocate'];

export default function TeamManagement() {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAdvocate, setEditingAdvocate] = useState(null);
  const [newMember, setNewMember] = useState({
    name: '', email: '', phone: '', role: 'Associate', specialization: '',
    city: '', court: '', experience: '', enrollmentRef: '',
  });
  const [team, setTeam] = useState(mockAdvocates);

  const filtered = team.filter(a => {
    const q = search.toLowerCase();
    return !q || a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) || a.role.toLowerCase().includes(q);
  });

  const handleAdd = (e) => {
    e.preventDefault();
    const member = {
      id: `adv-${Date.now()}`,
      ...newMember,
      specialization: newMember.specialization.split(',').map(s => s.trim()),
      experience: parseInt(newMember.experience, 10) || 0,
      languages: ['English'],
      bio: '',
      avatar: null,
      status: 'active',
      joinedDate: new Date().toISOString().split('T')[0],
      activeCases: 0,
      totalCases: 0,
      isAdmin: newMember.role === 'Admin',
    };
    setTeam(prev => [...prev, member]);
    setShowModal(false);
    setNewMember({ name: '', email: '', phone: '', role: 'Associate', specialization: '', city: '', court: '', experience: '', enrollmentRef: '' });
  };

  const toggleStatus = (id) => {
    setTeam(prev => prev.map(a => a.id === id ? { ...a, status: a.status === 'active' ? 'inactive' : 'active' } : a));
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Team & Users</h2>
          <p className="text-sm text-gray-500 mt-0.5">{team.length} members · {team.filter(a => a.status === 'active').length} active</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus size={16} /> Add Advocate
        </button>
      </div>

      {/* Org stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{team.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total Members</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{team.filter(a => a.status === 'active').length}</p>
          <p className="text-xs text-gray-500 mt-1">Active</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-navy-700">{team.reduce((sum, a) => sum + a.activeCases, 0)}</p>
          <p className="text-xs text-gray-500 mt-1">Total Active Cases</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-indigo-600">{team.reduce((sum, a) => sum + a.totalCases, 0)}</p>
          <p className="text-xs text-gray-500 mt-1">Total Cases Handled</p>
        </div>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search team members..."
            className="input pl-9"
          />
        </div>
      </div>

      {/* Team cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(member => (
          <div key={member.id} className="card p-5">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold">
                    {member.name.replace('Adv. ', '').split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </span>
                </div>
                {member.isAdmin && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-gold-500 rounded-full flex items-center justify-center">
                    <Crown size={11} className="text-navy-900" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-gray-900">{member.name}</p>
                  <span className={`badge text-xs ${roleBadge[member.role] || 'bg-gray-100 text-gray-600'}`}>{member.role}</span>
                  <span className={`badge text-xs ${member.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {member.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{member.city} · {member.court}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Mail size={11} /> {member.email}</span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Phone size={11} /> {member.phone}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => toggleStatus(member.id)}
                  className={`p-2 rounded-lg transition-colors ${member.status === 'active' ? 'hover:bg-red-50 text-green-500 hover:text-red-500' : 'hover:bg-green-50 text-gray-400 hover:text-green-500'}`}
                  title={member.status === 'active' ? 'Deactivate' : 'Activate'}
                >
                  {member.status === 'active' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-navy-700 transition-colors" title="Edit">
                  <Edit2 size={15} />
                </button>
                <button className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors" title="Remove">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            {/* Stats & specializations */}
            <div className="mt-4 pt-4 border-t border-gray-50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex gap-1 flex-wrap">
                  {member.specialization.slice(0, 3).map(s => (
                    <span key={s} className="badge bg-navy-50 text-navy-700 text-xs">{s}</span>
                  ))}
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Briefcase size={11} />
                    <strong className="text-gray-900">{member.activeCases}</strong> active
                  </span>
                  <span>
                    <strong className="text-gray-900">{member.experience}y</strong> exp.
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Enr. Ref:</span>
                <span className="text-xs font-mono text-gray-600">{member.enrollmentRef}</span>
                <button className="ml-auto text-xs text-navy-600 flex items-center gap-1 hover:underline" title="Reset password">
                  <Key size={11} /> Reset Password
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Permissions info */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield size={16} className="text-navy-700" />
          <h3 className="text-sm font-semibold text-gray-900">Role Permissions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left font-semibold text-gray-500 px-4 py-2">Permission</th>
                <th className="text-center font-semibold text-gray-500 px-4 py-2">Admin</th>
                <th className="text-center font-semibold text-gray-500 px-4 py-2">Partner</th>
                <th className="text-center font-semibold text-gray-500 px-4 py-2">Senior</th>
                <th className="text-center font-semibold text-gray-500 px-4 py-2">Associate</th>
                <th className="text-center font-semibold text-gray-500 px-4 py-2">Junior</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[
                ['Add/Remove Team Members', true, false, false, false, false],
                ['View All Clients', true, true, true, false, false],
                ['Manage Cases', true, true, true, true, false],
                ['Upload Private Documents', true, true, true, true, false],
                ['Share Documents with Clients', true, true, true, false, false],
                ['View Private Documents', true, true, true, false, false],
                ['Send Client Messages', true, true, true, true, true],
                ['Schedule Appointments', true, true, true, true, true],
              ].map(([perm, ...roles]) => (
                <tr key={perm}>
                  <td className="px-4 py-2.5 text-gray-700 font-medium">{perm}</td>
                  {roles.map((allowed, i) => (
                    <td key={i} className="px-4 py-2.5 text-center">
                      {allowed
                        ? <CheckCircle2 size={15} className="text-green-500 mx-auto" />
                        : <XCircle size={15} className="text-gray-200 mx-auto" />
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Member Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Add Team Member</h3>
                <p className="text-xs text-gray-500 mt-0.5">They will receive an email invitation to join the platform.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X size={16} className="text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="label">Full Name</label>
                  <input type="text" value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} placeholder="Adv. First Last" className="input" required />
                </div>
                <div>
                  <label className="label">Email Address</label>
                  <input type="email" value={newMember.email} onChange={e => setNewMember({...newMember, email: e.target.value})} placeholder="advocate@firm.in" className="input" required />
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input type="tel" value={newMember.phone} onChange={e => setNewMember({...newMember, phone: e.target.value})} placeholder="+91 98xxx xxxxx" className="input" />
                </div>
                <div>
                  <label className="label">Role</label>
                  <select value={newMember.role} onChange={e => setNewMember({...newMember, role: e.target.value})} className="input">
                    {ROLE_OPTIONS.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Experience (years)</label>
                  <input type="number" value={newMember.experience} onChange={e => setNewMember({...newMember, experience: e.target.value})} className="input" placeholder="5" />
                </div>
                <div>
                  <label className="label">City</label>
                  <input type="text" value={newMember.city} onChange={e => setNewMember({...newMember, city: e.target.value})} className="input" placeholder="Chennai" />
                </div>
                <div>
                  <label className="label">Primary Court</label>
                  <input type="text" value={newMember.court} onChange={e => setNewMember({...newMember, court: e.target.value})} className="input" placeholder="Madras High Court" />
                </div>
                <div className="col-span-2">
                  <label className="label">Enrollment Reference</label>
                  <input type="text" value={newMember.enrollmentRef} onChange={e => setNewMember({...newMember, enrollmentRef: e.target.value})} className="input" placeholder="TN/1234/2024" />
                </div>
                <div className="col-span-2">
                  <label className="label">Specialization (comma-separated)</label>
                  <input type="text" value={newMember.specialization} onChange={e => setNewMember({...newMember, specialization: e.target.value})} className="input" placeholder="Criminal Law, Property Law" />
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
                <strong>Note:</strong> An invitation email will be sent to the advocate. They will need to set their own password upon first login.
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
                <button type="submit" className="btn-primary flex-1 justify-center"><Plus size={15} /> Add Member</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
