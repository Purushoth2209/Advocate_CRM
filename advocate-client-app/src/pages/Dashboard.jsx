import { useNavigate } from 'react-router-dom';
import { Scale, Briefcase, CreditCard, Calendar, ChevronRight, TrendingUp, Clock } from 'lucide-react';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import { StatusBadge } from '../components/ui/Badge';
import { mockCases, mockInvoices, mockNotifications } from '../data/mockData';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

export default function Dashboard() {
  const navigate = useNavigate();
  const activeCases = mockCases.length;
  const pendingInvoices = mockInvoices.filter(i => i.status === 'pending' || i.status === 'overdue');
  const totalPending = pendingInvoices.reduce((s, i) => s + i.total, 0);
  const unread = mockNotifications.filter(n => !n.read).length;
  const nextHearing = mockCases
    .filter(c => c.nextHearing)
    .sort((a, b) => new Date(a.nextHearing) - new Date(b.nextHearing))[0];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      <Header title="Advocate Connect" />

      {/* Hero / Welcome */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-700 px-4 pt-5 pb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Scale size={20} className="text-white" />
          </div>
          <div>
            <p className="text-primary-100 text-xs">Good morning,</p>
            <h2 className="text-white text-lg font-semibold">Ramesh Kumar</h2>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Active Cases', value: activeCases, icon: Briefcase, color: 'bg-white/20' },
            { label: 'Pending Dues', value: formatCurrency(totalPending), icon: CreditCard, color: 'bg-white/20' },
            { label: 'Unread Alerts', value: unread, icon: TrendingUp, color: 'bg-white/20' },
          ].map(stat => (
            <div key={stat.label} className={`${stat.color} rounded-xl p-3`}>
              <stat.icon size={14} className="text-primary-100 mb-1" />
              <p className="text-white font-bold text-base leading-tight">{stat.value}</p>
              <p className="text-primary-100 text-[10px] mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4">

        {/* Next Hearing Banner */}
        {nextHearing && (
          <Card className="border-l-4 border-l-blue-500 !rounded-l-none rounded-r-2xl" onClick={() => navigate(`/cases/${nextHearing.id}`)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Calendar size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Upcoming Hearing</p>
                  <p className="text-sm font-semibold text-gray-800">{nextHearing.title}</p>
                  <p className="text-xs text-blue-600 font-medium mt-0.5">{formatDate(nextHearing.nextHearing)} · {nextHearing.court}</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </div>
          </Card>
        )}

        {/* Quick Actions */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'My Cases', icon: Briefcase, path: '/cases', color: 'bg-indigo-50 text-indigo-600' },
              { label: 'Payments', icon: CreditCard, path: '/payments', color: 'bg-green-50 text-green-600' },
              { label: 'Schedule', icon: Calendar, path: '/cases', color: 'bg-orange-50 text-orange-600' },
              { label: 'Find Advocate', icon: Scale, path: '/cases/discover', color: 'bg-purple-50 text-purple-600' },
            ].map(action => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className="flex flex-col items-center gap-1.5 py-3 px-2 bg-white rounded-2xl shadow-sm border border-gray-100 active:scale-95 transition-transform"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${action.color}`}>
                  <action.icon size={18} />
                </div>
                <span className="text-[10px] font-medium text-gray-600 text-center leading-tight">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Active Cases */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Active Cases</h3>
            <button onClick={() => navigate('/cases')} className="text-xs text-primary-600 font-medium">View All</button>
          </div>
          <div className="space-y-3">
            {mockCases.slice(0, 2).map(c => (
              <Card key={c.id} onClick={() => navigate(`/cases/${c.id}`)}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <StatusBadge status={c.status} />
                    </div>
                    <p className="text-sm font-semibold text-gray-800 truncate">{c.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{c.court}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <Clock size={11} className="text-gray-400" />
                      <p className="text-xs text-gray-400">Next: {formatDate(c.nextHearing)}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-400 mt-1 flex-shrink-0" />
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Pending Invoices */}
        {pendingInvoices.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">Pending Payments</h3>
              <button onClick={() => navigate('/payments')} className="text-xs text-primary-600 font-medium">View All</button>
            </div>
            <div className="space-y-3">
              {pendingInvoices.map(inv => (
                <Card key={inv.id} onClick={() => navigate(`/payments/invoice/${inv.id}`)}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">{inv.invoiceNo} · {inv.caseTitle}</p>
                      <p className="text-base font-bold text-gray-900 mt-0.5">{formatCurrency(inv.total)}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Due: {formatDate(inv.dueDate)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={inv.status} />
                      <ChevronRight size={16} className="text-gray-400" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
