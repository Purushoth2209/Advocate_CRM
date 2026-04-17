import { useNavigate, Link } from 'react-router-dom';
import { Landmark, Search, Filter, ArrowRight, BookOpen } from 'lucide-react';
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
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3 text-sm text-gray-500">
        <Link to="/cases" className="text-navy-700 font-medium hover:underline">
          Cases
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-900 font-medium">eCourts India</span>
      </div>

      <div className="rounded-xl bg-gradient-to-br from-navy-800 to-navy-700 px-6 py-6 text-white shadow-lg">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
            <Landmark size={30} className="text-gold-400" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-navy-200">Separate module</p>
            <h2 className="text-xl font-bold leading-tight mt-1">eCourts integration (CRM)</h2>
            <p className="text-sm text-navy-200 mt-2 leading-relaxed max-w-2xl">
              Same engine as the client app: look up matters by CNR, search the national index, and open live panels
              from any matter’s detail tab. Uses the EcourtsIndia Partner API.
            </p>
          </div>
        </div>
      </div>

      <Card className="border-dashed border-navy-200 bg-navy-50/40">
        <div className="flex gap-3 items-start">
          <BookOpen size={18} className="text-navy-700 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-navy-900 leading-relaxed">
            <strong className="font-semibold">Setup:</strong> add{' '}
            <code className="font-mono text-xs bg-white px-1.5 py-0.5 rounded border border-navy-100">
              VITE_ECOURTS_API_TOKEN
            </code>{' '}
            to <code className="font-mono text-xs">advocate-web-app/.env</code> and restart Vite. Source code:{' '}
            <code className="font-mono text-xs">src/modules/e-courts/</code>.
          </p>
        </div>
      </Card>

      <p className="text-xs font-bold text-navy-900 uppercase tracking-wide">Tools</p>

      <div className="grid gap-4 md:grid-cols-2">
        {tools.map((t) => (
          <button
            key={t.path}
            type="button"
            onClick={() => navigate(t.path)}
            className={`text-left rounded-xl border p-5 transition-colors hover:shadow-md ${t.tone}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-white/90 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <t.icon size={22} className="text-navy-800" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{t.title}</p>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">{t.description}</p>
                </div>
              </div>
              <ArrowRight size={20} className="text-gray-400 flex-shrink-0 mt-1" />
            </div>
          </button>
        ))}
      </div>

      <Card>
        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">From the case list</p>
        <p className="text-sm text-gray-600 leading-relaxed">
          Open any matter, then use the <strong className="text-gray-900">eCourts</strong> tab for live status, queue
          refresh, orders, and hearings.
        </p>
        <button
          type="button"
          onClick={() => navigate('/cases')}
          className="mt-4 btn-secondary text-sm"
        >
          Back to All cases
        </button>
      </Card>
    </div>
  );
}
