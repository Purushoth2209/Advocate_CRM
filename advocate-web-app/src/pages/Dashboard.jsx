import { Link } from 'react-router-dom';
import {
  Users, Briefcase, CalendarDays, MessageSquare,
  TrendingUp, Clock, AlertCircle, CheckCircle2,
  ChevronRight, Scale, FileText, ArrowUpRight,
} from 'lucide-react';
import { getDashboardStats, mockAppointments, mockClients, mockAdvocates } from '../data/mockData';
import { useCases } from '../context/CasesContext';

const statusColors = {
  'Hearing Scheduled': 'bg-blue-100 text-blue-700',
  'Judgment Pending': 'bg-amber-100 text-amber-700',
  'Under Review': 'bg-purple-100 text-purple-700',
  'Active': 'bg-green-100 text-green-700',
  'Discovery Phase': 'bg-indigo-100 text-indigo-700',
  'Settled': 'bg-gray-100 text-gray-600',
  'Closed': 'bg-gray-100 text-gray-500',
};

const priorityColors = {
  high: 'bg-red-100 text-red-600',
  medium: 'bg-amber-100 text-amber-600',
  low: 'bg-gray-100 text-gray-600',
};

function StatCard({ icon: Icon, label, value, sub, color, trend }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={20} />
        </div>
      </div>
      {trend && (
        <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-50">
          <TrendingUp size={12} className="text-green-500" />
          <span className="text-xs text-green-600 font-medium">{trend}</span>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { cases } = useCases();
  const stats = {
    ...getDashboardStats(),
    totalCases: cases.length,
    activeCases: cases.filter((c) => c.status !== 'Closed').length,
  };
  const upcomingCases = cases
    .filter((c) => c.nextHearing)
    .sort((a, b) => new Date(a.nextHearing) - new Date(b.nextHearing))
    .slice(0, 4);
  const todayAppts = mockAppointments.filter(a => a.date === '2026-04-08' || a.date === '2026-04-09').slice(0, 3);
  const recentClients = mockClients.filter(c => c.status === 'active').slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-navy-800 to-navy-700 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-navy-200 text-sm">Good morning,</p>
            <h2 className="text-xl font-bold mt-0.5">Adv. A. Sharma</h2>
            <p className="text-navy-300 text-sm mt-1">
              You have <span className="text-white font-semibold">3 hearings</span> this week and{' '}
              <span className="text-white font-semibold">2 pending appointments</span>.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">3</p>
              <p className="text-navy-300 text-xs">This Week</p>
            </div>
            <Scale size={40} className="text-gold-400 opacity-50" />
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total Clients"
          value={stats.totalClients}
          sub={`${stats.activeClients} active`}
          color="bg-blue-50 text-blue-600"
          trend="+2 this month"
        />
        <StatCard
          icon={Briefcase}
          label="Active Cases"
          value={stats.activeCases}
          sub={`${stats.totalCases} total`}
          color="bg-indigo-50 text-indigo-600"
          trend="+1 this week"
        />
        <StatCard
          icon={CalendarDays}
          label="Upcoming Hearings"
          value={stats.upcomingHearings}
          sub="next 7 days"
          color="bg-amber-50 text-amber-600"
        />
        <StatCard
          icon={MessageSquare}
          label="Unread Messages"
          value={stats.unreadMessages}
          sub={`${stats.teamMembers} team members`}
          color="bg-green-50 text-green-600"
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming hearings */}
        <div className="lg:col-span-2 card">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase size={16} className="text-navy-700" />
              <h3 className="text-sm font-semibold text-gray-900">Upcoming Hearings</h3>
            </div>
            <Link to="/cases" className="text-xs text-navy-600 font-medium flex items-center gap-1 hover:underline">
              View all <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {upcomingCases.map(c => {
              const client = mockClients.find(cl => cl.id === c.clientId);
              return (
                <Link
                  key={c.id}
                  to={`/cases/${c.id}`}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-navy-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Scale size={16} className="text-navy-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{c.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{c.court} · {client?.name}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-semibold text-gray-900">
                      {new Date(c.nextHearing).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                    <span className={`badge text-xs mt-1 ${statusColors[c.status] || 'bg-gray-100 text-gray-600'}`}>
                      {c.status}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Today's schedule */}
        <div className="card">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays size={16} className="text-navy-700" />
              <h3 className="text-sm font-semibold text-gray-900">Today's Schedule</h3>
            </div>
            <Link to="/appointments" className="text-xs text-navy-600 font-medium flex items-center gap-1 hover:underline">
              View all <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="px-5 py-4 space-y-3">
            {todayAppts.length === 0 && (
              <div className="text-center py-6">
                <CheckCircle2 size={28} className="text-green-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No appointments today</p>
              </div>
            )}
            {todayAppts.map(a => {
              const client = mockClients.find(c => c.id === a.clientId);
              return (
                <div key={a.id} className="flex items-start gap-3">
                  <div className="text-right flex-shrink-0 w-14">
                    <p className="text-xs font-semibold text-navy-700">{a.time}</p>
                    <p className="text-xs text-gray-400">{a.duration}m</p>
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2 min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">{client?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{a.purpose}</p>
                    <span className={`badge text-xs mt-1 ${a.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {a.status}
                    </span>
                  </div>
                </div>
              );
            })}
            <Link to="/appointments/new" className="btn-secondary w-full justify-center text-xs mt-2">
              + Add Appointment
            </Link>
          </div>
        </div>
      </div>

      {/* Recent clients + Team activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent clients */}
        <div className="card">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-navy-700" />
              <h3 className="text-sm font-semibold text-gray-900">Active Clients</h3>
            </div>
            <Link to="/clients" className="text-xs text-navy-600 font-medium flex items-center gap-1 hover:underline">
              View all <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentClients.map(client => (
              <Link
                key={client.id}
                to={`/clients/${client.id}`}
                className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-navy-600 to-navy-800 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">
                    {client.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{client.name}</p>
                  <p className="text-xs text-gray-500">{client.activeCases} active case{client.activeCases !== 1 ? 's' : ''}</p>
                </div>
                <div className="flex gap-1 flex-wrap justify-end">
                  {client.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="badge bg-gray-100 text-gray-600 text-xs">{tag}</span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Team overview */}
        <div className="card">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale size={16} className="text-navy-700" />
              <h3 className="text-sm font-semibold text-gray-900">Team Overview</h3>
            </div>
            <Link to="/team" className="text-xs text-navy-600 font-medium flex items-center gap-1 hover:underline">
              Manage <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {mockAdvocates.map(adv => (
              <div key={adv.id} className="flex items-center gap-3 px-5 py-3">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">
                    {adv.name.replace('Adv. ', '').split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{adv.name}</p>
                  <p className="text-xs text-gray-500">{adv.role} · {adv.city}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-gray-900">{adv.activeCases}</p>
                  <p className="text-xs text-gray-400">active</p>
                </div>
                <span className={`badge text-xs ${adv.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {adv.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
