import Header from '../../components/layout/Header';
import Card from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/Badge';
import { mockInstallments } from '../../data/mockData';
import { CheckCircle, Circle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const iconMap = {
  paid: <CheckCircle size={18} className="text-green-500" />,
  due: <Clock size={18} className="text-amber-500" />,
  upcoming: <Circle size={18} className="text-gray-300" />,
};

export default function InstallmentSchedule() {
  const navigate = useNavigate();
  const total = mockInstallments.reduce((s, i) => s + i.amount, 0);
  const paid = mockInstallments.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
  const dueItem = mockInstallments.find(i => i.status === 'due');

  const daysUntilDue = dueItem
    ? Math.ceil((new Date(dueItem.dueDate) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      <Header title="Payment Schedule" showBack />

      <div className="px-4 py-4 space-y-4">
        {/* Progress */}
        <Card>
          <div className="flex justify-between mb-2">
            <p className="text-sm font-semibold text-gray-800">Overall Progress</p>
            <p className="text-sm font-bold text-primary-600">{Math.round((paid / total) * 100)}%</p>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"
              style={{ width: `${(paid / total) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>Paid: {formatCurrency(paid)}</span>
            <span>Total: {formatCurrency(total)}</span>
          </div>
        </Card>

        {/* Due Alert */}
        {dueItem && (
          <Card className="bg-amber-50 border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-amber-800">{dueItem.label} Due Soon</p>
                <p className="text-xs text-amber-600">{formatCurrency(dueItem.amount)} · Due in {daysUntilDue} days</p>
              </div>
              <Button size="sm" onClick={() => navigate('/payments/invoices')}>
                Pay Now
              </Button>
            </div>
          </Card>
        )}

        {/* Timeline */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3">Payment Schedule</p>
          <div className="space-y-0">
            {mockInstallments.map((inst, idx) => (
              <div key={inst.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="mt-1">{iconMap[inst.status]}</div>
                  {idx < mockInstallments.length - 1 && (
                    <div className="w-0.5 flex-1 bg-gray-100 my-1 min-h-[24px]" />
                  )}
                </div>
                <div className="pb-5 flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{inst.label}</p>
                      <p className="text-xs text-gray-400">Due: {formatDate(inst.dueDate)}</p>
                      {inst.paidOn && (
                        <p className="text-xs text-green-600">Paid on {formatDate(inst.paidOn)}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">{formatCurrency(inst.amount)}</p>
                      <StatusBadge status={inst.status} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
