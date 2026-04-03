import Header from '../../components/layout/Header';
import Card from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { mockExpenses } from '../../data/mockData';
import { Receipt, Check, X } from 'lucide-react';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const categoryIcons = {
  'Court Filing Fee': '⚖️',
  'Travel': '🚗',
  'Printing & Stationery': '🖨️',
  'Stamp Duty': '📮',
};

export default function ExpenseLog() {
  const pendingCount = mockExpenses.filter(e => e.status === 'pending').length;
  const totalApproved = mockExpenses.filter(e => e.status === 'approved').reduce((s, e) => s + e.amount, 0);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      <Header title="Expense Log" showBack />

      <div className="px-4 py-4 space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <p className="text-[10px] text-gray-400 mb-1">Pending Review</p>
            <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
          </Card>
          <Card>
            <p className="text-[10px] text-gray-400 mb-1">Approved Total</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalApproved)}</p>
          </Card>
        </div>

        {pendingCount > 0 && (
          <Card className="bg-amber-50 border-amber-100">
            <p className="text-xs font-semibold text-amber-700">{pendingCount} expense(s) need your review</p>
            <p className="text-xs text-amber-600 mt-0.5">Approved expenses will be added to your next invoice.</p>
          </Card>
        )}

        <div className="space-y-3">
          {mockExpenses.map(exp => (
            <Card key={exp.id}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                  {categoryIcons[exp.category] || '💼'}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{exp.category}</p>
                      <p className="text-xs text-gray-500">{exp.description}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(exp.date)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">{formatCurrency(exp.amount)}</p>
                      <StatusBadge status={exp.status} />
                    </div>
                  </div>

                  {exp.receipt && (
                    <button className="mt-2 flex items-center gap-1 text-xs text-primary-600">
                      <Receipt size={11} />
                      View Receipt
                    </button>
                  )}

                  {exp.status === 'pending' && (
                    <div className="flex gap-2 mt-3">
                      <Button variant="success" size="sm" className="flex-1">
                        <Check size={12} />
                        Approve
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <X size={12} />
                        Dispute
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
