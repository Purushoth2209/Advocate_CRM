import { useNavigate } from 'react-router-dom';
import { Plus, Search, ChevronRight, Clock, Scale } from 'lucide-react';
import Header from '../../components/layout/Header';
import Card from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { useClientAppData } from '../../context/ClientExperienceContext';

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
  const { cases } = useClientAppData();
  const n = cases.length;
  const hearingDue = cases.filter(c => c.nextHearing).length;
  const judgment = cases.filter(c => c.status === 'Judgment Pending').length;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      <Header
        title="My Cases"
        rightAction={
          <button
            type="button"
            onClick={() => navigate('/cases/cnr')}
            className="text-xs bg-navy-100 text-navy-800 font-semibold px-3 py-1.5 rounded-lg hover:bg-navy-200 transition-colors"
          >
            + CNR lookup
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
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-500/30 focus:border-navy-600"
          />
        </div>

        {/* Summary Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {[
            `All (${n})`,
            `Active (${n})`,
            `Hearing Due (${hearingDue})`,
            `Judgment (${judgment})`,
          ].map((chip, i) => (
            <button
              key={chip}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                i === 0 ? 'bg-navy-700 text-white border-navy-700' : 'bg-white text-gray-600 border-gray-200'
              }`}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Cases */}
        <div className="space-y-3">
          {n === 0 && (
            <Card className="border-dashed border-navy-200 bg-navy-50/30 text-center py-8 px-4">
              <p className="text-sm font-semibold text-navy-900">No cases on file</p>
              <p className="text-xs text-gray-500 mt-2 max-w-xs mx-auto">
                After your advocate accepts you or you complete onboarding, matters will show here.
              </p>
              <Button className="mt-4" onClick={() => navigate('/cases/discover')}>
                Find an advocate
              </Button>
            </Card>
          )}
          {cases.map(c => (
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
                    <div className="w-5 h-5 rounded-full bg-navy-100 flex items-center justify-center">
                      <Scale size={10} className="text-navy-700" />
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
        <Card className="bg-gradient-to-r from-navy-800 to-navy-700 border-0 shadow-lg">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-white font-semibold text-sm">Find an advocate</p>
              <p className="text-navy-200 text-xs mt-0.5">Directory · same flow as LexDesk CRM linking</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="!border-white/40 !text-white !bg-white/10 hover:!bg-white/20"
              onClick={() => navigate('/cases/discover')}
            >
              Browse
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
