import { useNavigate } from 'react-router-dom';
import { Landmark, Search, Filter, ArrowRight, BookOpen } from 'lucide-react';
import Header from '../../components/layout/Header';
import Card from '../../components/ui/Card';

const tools = [
  {
    title: 'CNR lookup',
    description: 'Fetch full case details by Case Number Record (CNR).',
    path: '/cases/cnr',
    icon: Search,
    tone: 'bg-teal-50 text-teal-800 border-teal-100',
  },
  {
    title: 'Search cases',
    description: 'Search by advocate, judge, parties, courts, dates, and more.',
    path: '/cases/search',
    icon: Filter,
    tone: 'bg-navy-50 text-navy-900 border-navy-100',
  },
];

export default function EcourtsHub() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-24">
      <Header title="eCourts India" showBack />

      <div className="px-4 pt-4 pb-6 space-y-4">
        <div className="rounded-2xl bg-gradient-to-br from-navy-800 to-navy-700 px-4 py-5 text-white shadow-lg">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
              <Landmark size={26} className="text-gold-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-navy-200">Separate module</p>
              <h2 className="text-lg font-bold leading-tight mt-0.5">eCourts integration</h2>
              <p className="text-xs text-navy-200 mt-2 leading-relaxed">
                Look up matters by CNR, search the national index with filters, and open live case panels from your
                matters. Uses the EcourtsIndia Partner API.
              </p>
            </div>
          </div>
        </div>

        <Card className="border-dashed border-navy-200 bg-navy-50/40">
          <div className="flex gap-2 items-start">
            <BookOpen size={16} className="text-navy-700 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-navy-900 leading-relaxed">
              <strong className="font-semibold">Setup:</strong> add{' '}
              <code className="font-mono text-[10px] bg-white/80 px-1 rounded">VITE_ECOURTS_API_TOKEN</code> to{' '}
              <code className="font-mono text-[10px]">.env</code> and restart the dev server. Code for this module lives
              under <code className="font-mono text-[10px]">src/modules/e-courts/</code>.
            </p>
          </div>
        </Card>

        <p className="text-xs font-bold text-navy-900 uppercase tracking-wide px-0.5">Tools</p>

        <div className="space-y-3">
          {tools.map((t) => (
            <button
              key={t.path}
              type="button"
              onClick={() => navigate(t.path)}
              className={`w-full text-left rounded-2xl border p-4 transition-colors active:scale-[0.99] ${t.tone}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <t.icon size={20} className="text-navy-800" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{t.title}</p>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">{t.description}</p>
                  </div>
                </div>
                <ArrowRight size={18} className="text-gray-400 flex-shrink-0 mt-1" />
              </div>
            </button>
          ))}
        </div>

        <Card>
          <p className="text-[10px] font-semibold text-gray-500 uppercase mb-2">From a saved matter</p>
          <p className="text-xs text-gray-600 leading-relaxed">
            Open <strong className="text-gray-800">My cases</strong>, pick a case, then use the{' '}
            <strong className="text-gray-800">eCourts</strong> tab for live status, refresh, orders, and hearings.
          </p>
          <button
            type="button"
            onClick={() => navigate('/cases')}
            className="mt-3 text-xs font-semibold text-navy-800 w-full py-2.5 rounded-xl bg-navy-50 border border-navy-100"
          >
            Go to My cases
          </button>
        </Card>
      </div>
    </div>
  );
}
