import { useParams, useNavigate } from 'react-router-dom';
import { Download, MessageSquare } from 'lucide-react';
import Header from '../../components/layout/Header';
import Card from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { mockInvoices } from '../../data/mockData';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const inv = mockInvoices.find(i => i.id === id);

  if (!inv) return <div className="p-4 text-center text-gray-500">Invoice not found</div>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-32">
      <Header title={inv.invoiceNo} showBack />

      <div className="px-4 py-4 space-y-4">
        {/* Invoice Header */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-gray-400">Invoice Number</p>
              <p className="text-base font-bold text-gray-900">{inv.invoiceNo}</p>
            </div>
            <StatusBadge status={inv.status} />
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-gray-400">Case</p>
              <p className="font-medium text-gray-700">{inv.caseTitle}</p>
            </div>
            <div>
              <p className="text-gray-400">Advocate</p>
              <p className="font-medium text-gray-700">{inv.advocate}</p>
            </div>
            <div>
              <p className="text-gray-400">Date Raised</p>
              <p className="font-medium text-gray-700">{formatDate(inv.dateRaised)}</p>
            </div>
            <div>
              <p className="text-gray-400">{inv.status === 'paid' ? 'Paid On' : 'Due Date'}</p>
              <p className={`font-medium ${inv.status === 'overdue' ? 'text-red-600' : 'text-gray-700'}`}>
                {formatDate(inv.status === 'paid' ? inv.paidOn : inv.dueDate)}
              </p>
            </div>
          </div>
        </Card>

        {/* Line Items */}
        <Card>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Breakdown</p>
          <div className="space-y-0">
            {inv.items.map((item, idx) => (
              <div key={idx} className="flex items-start justify-between py-2.5 border-b border-gray-50 last:border-0">
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{item.description}</p>
                  <p className="text-xs text-gray-400">{formatDate(item.date)}</p>
                </div>
                <p className="text-sm font-semibold text-gray-900 ml-3">{formatCurrency(item.amount)}</p>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Subtotal</span>
              <span>{formatCurrency(inv.subtotal)}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>GST (18%)</span>
              <span>{formatCurrency(inv.gst)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-100">
              <span>Total</span>
              <span>{formatCurrency(inv.total)}</span>
            </div>
          </div>
        </Card>

        {/* Payment Info (if paid) */}
        {inv.status === 'paid' && (
          <Card className="bg-green-50 border-green-100">
            <p className="text-xs font-semibold text-green-700 mb-2">Payment Details</p>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-green-600">Method</span>
                <span className="font-medium text-green-800">{inv.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-600">Reference ID</span>
                <span className="font-mono font-medium text-green-800">{inv.referenceId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-600">Paid On</span>
                <span className="font-medium text-green-800">{formatDate(inv.paidOn)}</span>
              </div>
            </div>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {inv.status === 'paid' ? (
            <Button variant="outline" fullWidth>
              <Download size={14} />
              Download Receipt
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => navigate(`/payments/dispute/${inv.id}`)}>
              <MessageSquare size={14} />
              Raise Query
            </Button>
          )}
        </div>
      </div>

      {/* Sticky Bottom CTA */}
      {(inv.status === 'pending' || inv.status === 'overdue') && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md p-4 bg-white border-t border-gray-100">
          <Button fullWidth size="lg" variant={inv.status === 'overdue' ? 'danger' : 'primary'} onClick={() => navigate(`/payments/pay/${inv.id}`)}>
            Pay {formatCurrency(inv.total)}
          </Button>
        </div>
      )}
    </div>
  );
}
