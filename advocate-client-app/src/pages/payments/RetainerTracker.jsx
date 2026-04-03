import Header from '../../components/layout/Header';
import Card from '../../components/ui/Card';
import { mockRetainer } from '../../data/mockData';
import { TrendingDown, TrendingUp, Plus } from 'lucide-react';
import Button from '../../components/ui/Button';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function RetainerTracker() {
  const r = mockRetainer;
  const pct = Math.round((r.remaining / r.totalRetainer) * 100);
  const utilizationPct = Math.round((r.utilized / r.totalRetainer) * 100);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      <Header title="Retainer Tracker" showBack />

      <div className="px-4 py-4 space-y-4">
        {/* Balance Card */}
        <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 border-0">
          <p className="text-blue-100 text-xs mb-1">Retainer Balance</p>
          <p className="text-white text-3xl font-bold">{formatCurrency(r.remaining)}</p>
          <p className="text-blue-200 text-xs mt-1">{r.advocate} · {r.caseTitle}</p>
          <div className="mt-4 h-3 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <div className="flex justify-between mt-2 text-xs text-blue-200">
            <span>Remaining: {pct}%</span>
            <span>Used: {utilizationPct}%</span>
          </div>
        </Card>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Paid', value: formatCurrency(r.totalRetainer), color: 'text-gray-800' },
            { label: 'Utilized', value: formatCurrency(r.utilized), color: 'text-red-600' },
            { label: 'Remaining', value: formatCurrency(r.remaining), color: 'text-blue-600' },
          ].map(stat => (
            <Card key={stat.label}>
              <p className="text-[10px] text-gray-400 mb-1">{stat.label}</p>
              <p className={`text-sm font-bold ${stat.color}`}>{stat.value}</p>
            </Card>
          ))}
        </div>

        {/* Low balance warning */}
        {pct < 25 && (
          <Card className="bg-amber-50 border-amber-100">
            <p className="text-xs text-amber-700 font-semibold">Retainer balance is low</p>
            <p className="text-xs text-amber-600 mt-0.5">Only {pct}% remaining. Consider topping up to avoid delays.</p>
            <Button size="sm" className="mt-2" variant="secondary">
              <Plus size={12} />
              Top Up Retainer
            </Button>
          </Card>
        )}

        {/* History */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3">Transaction History</p>
          <div className="space-y-2">
            {r.history.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-gray-100">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  item.type === 'credit' ? 'bg-green-50' : 'bg-red-50'
                }`}>
                  {item.type === 'credit'
                    ? <TrendingUp size={14} className="text-green-600" />
                    : <TrendingDown size={14} className="text-red-500" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-800 truncate">{item.description}</p>
                  <p className="text-[10px] text-gray-400">{formatDate(item.date)}</p>
                </div>
                <p className={`text-sm font-bold ${item.type === 'credit' ? 'text-green-600' : 'text-red-500'}`}>
                  {item.type === 'credit' ? '+' : ''}{formatCurrency(item.amount)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
