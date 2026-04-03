import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import Header from '../../components/layout/Header';
import Card from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/Badge';
import { mockInvoices } from '../../data/mockData';

const tabs = ['All', 'Pending', 'Overdue', 'Paid'];

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' });
}

export default function InvoiceList() {
  const navigate = useNavigate();
  const [active, setActive] = useState('All');

  const filtered = active === 'All'
    ? mockInvoices
    : mockInvoices.filter(i => i.status === active.toLowerCase());

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      <Header title="Invoices" showBack />

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100 px-4">
        <div className="flex">
          {tabs.map(tab => {
            const count = tab === 'All' ? mockInvoices.length : mockInvoices.filter(i => i.status === tab.toLowerCase()).length;
            return (
              <button
                key={tab}
                onClick={() => setActive(tab)}
                className={`flex-1 py-3 text-xs font-medium border-b-2 transition-colors ${
                  active === tab ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500'
                }`}
              >
                {tab} {count > 0 && <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[9px] ${active === tab ? 'bg-primary-100' : 'bg-gray-100'}`}>{count}</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-sm">No {active.toLowerCase()} invoices</p>
          </div>
        ) : (
          filtered.map(inv => (
            <Card key={inv.id} padding={false} onClick={() => navigate(`/payments/invoice/${inv.id}`)}>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-900">{inv.invoiceNo}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{inv.caseTitle}</p>
                    <p className="text-xs text-gray-400">{inv.advocate}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={inv.status} />
                    <ChevronRight size={14} className="text-gray-400" />
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <p className="text-xl font-bold text-gray-900">{formatCurrency(inv.total)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {inv.status === 'paid' ? `Paid on ${formatDate(inv.paidOn)}` : `Due: ${formatDate(inv.dueDate)}`}
                    </p>
                  </div>
                  {(inv.status === 'pending' || inv.status === 'overdue') && (
                    <button
                      onClick={e => { e.stopPropagation(); navigate(`/payments/pay/${inv.id}`); }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold text-white ${inv.status === 'overdue' ? 'bg-red-500' : 'bg-primary-600'}`}
                    >
                      Pay Now
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
