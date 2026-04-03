import { useNavigate } from 'react-router-dom';
import { Plus, Search, ChevronRight, Clock, Scale } from 'lucide-react';
import Header from '../../components/layout/Header';
import Card from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { mockCases } from '../../data/mockData';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const statusColors = {
  'Hearing Scheduled': 'bg-blue-500',
  'Judgment Pending': 'bg-amber-500',
  'Under Review': 'bg-purple-500',
  'Filed': 'bg-indigo-500',
};

export default function CaseList() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      <Header
        title="My Cases"
        rightAction={
          <button onClick={() => navigate('/cases/cnr')} className="text-xs bg-primary-50 text-primary-600 font-semibold px-3 py-1.5 rounded-lg">
            + Add Case
          </button>
        }
      />

      <div className="px-4 py-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search cases..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Summary Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {['All (3)', 'Active (3)', 'Hearing Due (1)', 'Judgment (1)'].map((chip, i) => (
            <button
              key={chip}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                i === 0 ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200'
              }`}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Cases */}
        <div className="space-y-3">
          {mockCases.map(c => (
            <Card key={c.id} padding={false} onClick={() => navigate(`/cases/${c.id}`)}>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-2 h-2 rounded-full ${statusColors[c.status] || 'bg-gray-400'}`} />
                      <StatusBadge status={c.status} />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 leading-tight">{c.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">{c.type} · {c.court}</p>
                  </div>
                  <ChevronRight size={16} className="text-gray-400 mt-1 flex-shrink-0" />
                </div>

                <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center">
                      <Scale size={10} className="text-primary-600" />
                    </div>
                    <span className="text-xs text-gray-500">{c.advocate}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={11} className="text-gray-400" />
                    <span className="text-xs text-gray-400">{formatDate(c.nextHearing)}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Discover */}
        <Card className="bg-gradient-to-r from-primary-600 to-indigo-600 border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-semibold text-sm">Need a new advocate?</p>
              <p className="text-primary-100 text-xs mt-0.5">Find experts by specialization & city</p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => navigate('/cases/discover')}>
              Explore
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
