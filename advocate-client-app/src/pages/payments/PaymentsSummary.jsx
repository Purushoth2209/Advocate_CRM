import { useNavigate } from 'react-router-dom';
import { TrendingUp, ChevronRight, AlertTriangle, CreditCard, Receipt } from 'lucide-react';
import Header from '../../components/layout/Header';
import Card from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/Badge';
import { mockInvoices, mockRetainer } from '../../data/mockData';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function PaymentsSummary() {
  const navigate = useNavigate();

  const totalFees = 85000;
  const totalPaid = mockInvoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0);
  const totalPending = mockInvoices.filter(i => i.status !== 'paid').reduce((s, i) => s + i.total, 0);
  const paidPercent = Math.round((totalPaid / totalFees) * 100);

  const overdueInvoices = mockInvoices.filter(i => i.status === 'overdue');
  const dueInvoices = mockInvoices.filter(i => i.status === 'pending' || i.status === 'overdue');

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      <Header title="Payments" />

      <div className="bg-gradient-to-br from-green-600 to-emerald-700 px-4 pt-5 pb-8">
        <p className="text-green-100 text-xs mb-1">Total Engagement Fee</p>
        <p className="text-white text-3xl font-bold">{formatCurrency(totalFees)}</p>
        <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full" style={{ width: `${paidPercent}%` }} />
        </div>
        <div className="flex justify-between mt-2">
          <div>
            <p className="text-white/70 text-[10px]">Paid</p>
            <p className="text-white text-sm font-bold">{formatCurrency(totalPaid)}</p>
          </div>
          <div className="text-right">
            <p className="text-white/70 text-[10px]">Pending</p>
            <p className="text-amber-200 text-sm font-bold">{formatCurrency(totalPending)}</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* Overdue Alert */}
        {overdueInvoices.length > 0 && (
          <Card className="border-red-200 bg-red-50" onClick={() => navigate('/payments/invoices')}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangle size={18} className="text-red-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-700">Payment Overdue</p>
                <p className="text-xs text-red-500">{overdueInvoices.length} invoice(s) past due date</p>
              </div>
              <ChevronRight size={14} className="text-red-400" />
            </div>
          </Card>
        )}

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Invoices', desc: `${dueInvoices.length} pending`, icon: Receipt, path: '/payments/invoices', color: 'bg-amber-50 text-amber-600' },
            { label: 'Pay Now', desc: 'Make a payment', icon: CreditCard, path: '/payments/invoices', color: 'bg-green-50 text-green-600' },
            { label: 'Retainer', desc: `${formatCurrency(mockRetainer.remaining)} left`, icon: TrendingUp, path: '/payments/retainer', color: 'bg-blue-50 text-blue-600' },
            { label: 'History', desc: 'Past transactions', icon: Receipt, path: '/payments/history', color: 'bg-purple-50 text-purple-600' },
          ].map(item => (
            <Card key={item.label} onClick={() => navigate(item.path)}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${item.color}`}>
                <item.icon size={18} />
              </div>
              <p className="text-sm font-semibold text-gray-800">{item.label}</p>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </Card>
          ))}
        </div>

        {/* Retainer Snapshot */}
        <Card onClick={() => navigate('/payments/retainer')}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-800">Retainer Balance</p>
            <ChevronRight size={14} className="text-gray-400" />
          </div>
          <div className="flex items-center gap-3 mb-2">
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(mockRetainer.remaining)}</p>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Available</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
              style={{ width: `${(mockRetainer.remaining / mockRetainer.totalRetainer) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[10px] text-gray-400">Utilized: {formatCurrency(mockRetainer.utilized)}</span>
            <span className="text-[10px] text-gray-400">Total: {formatCurrency(mockRetainer.totalRetainer)}</span>
          </div>
        </Card>

        {/* Recent Invoices */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-700">Recent Invoices</p>
            <button onClick={() => navigate('/payments/invoices')} className="text-xs text-primary-600 font-medium">See All</button>
          </div>
          <div className="space-y-2">
            {mockInvoices.slice(0, 3).map(inv => (
              <Card key={inv.id} padding={false} onClick={() => navigate(`/payments/invoice/${inv.id}`)}>
                <div className="flex items-center justify-between p-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-800">{inv.invoiceNo}</p>
                    <p className="text-[10px] text-gray-400">{inv.caseTitle} · {formatDate(inv.dateRaised)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={inv.status} />
                    <p className="text-sm font-bold text-gray-900">{formatCurrency(inv.total)}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* More Links */}
        <div className="grid grid-cols-2 gap-3">
          <Card onClick={() => navigate('/payments/installments')}>
            <p className="text-sm font-semibold text-gray-800 mb-0.5">Installments</p>
            <p className="text-xs text-gray-500">4-payment plan</p>
          </Card>
          <Card onClick={() => navigate('/payments/expenses')}>
            <p className="text-sm font-semibold text-gray-800 mb-0.5">Expenses</p>
            <p className="text-xs text-gray-500">2 pending review</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
