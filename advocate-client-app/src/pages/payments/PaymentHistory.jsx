import { useNavigate } from 'react-router-dom';
import { Download, ChevronRight } from 'lucide-react';
import Header from '../../components/layout/Header';
import Card from '../../components/ui/Card';
import { mockPaymentHistory } from '../../data/mockData';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const methodIcon = { 'UPI': '🔵', 'Net Banking': '🏦', 'Card': '💳' };

export default function PaymentHistory() {
  const navigate = useNavigate();
  const total = mockPaymentHistory.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      <Header title="Payment History" showBack />

      <div className="px-4 py-4 space-y-4">
        {/* Summary */}
        <Card className="bg-gradient-to-r from-primary-600 to-indigo-600 border-0">
          <p className="text-primary-100 text-xs mb-1">Total Paid to Date</p>
          <p className="text-white text-2xl font-bold">{formatCurrency(total)}</p>
          <p className="text-primary-200 text-xs mt-1">{mockPaymentHistory.length} transactions</p>
        </Card>

        {/* Transaction List */}
        <div className="space-y-2">
          {mockPaymentHistory.map(pay => (
            <Card key={pay.id} padding={false}>
              <div className="flex items-center gap-3 p-4">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                  {methodIcon[pay.method]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{pay.invoiceNo}</p>
                  <p className="text-xs text-gray-400 truncate">{pay.caseTitle}</p>
                  <p className="text-[10px] text-gray-400">{formatDate(pay.date)} · {pay.method} · {pay.ref}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-600">- {formatCurrency(pay.amount)}</p>
                  <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Paid</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <button className="w-full py-3 flex items-center justify-center gap-2 text-sm text-primary-600 font-medium border border-primary-200 rounded-xl bg-white">
          <Download size={14} />
          Download All Receipts
        </button>
      </div>
    </div>
  );
}
