import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, RefreshCw, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import Header from '../../components/layout/Header';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';

const mockCNRResult = {
  cnr: 'TNCH010012342024',
  title: 'Ramesh Kumar vs State of Tamil Nadu',
  type: 'CRL.A',
  filingDate: '2024-03-15',
  registrationDate: '2024-03-20',
  currentStatus: 'Next hearing scheduled',
  nextHearingDate: '2026-04-10',
  court: 'City Civil Court, Chennai',
  presidingJudge: 'Hon. Justice K. Krishnamurthy',
  petitioner: { name: 'Ramesh Kumar', advocate: 'Adv. Priya Sharma' },
  respondent: { name: 'State of Tamil Nadu', advocate: 'Government Pleader' },
  actsSections: ['IPC Section 302', 'IPC Section 120B'],
  lastFetched: '2026-04-03T10:30:00',
};

export default function CNRLookup() {
  const navigate = useNavigate();
  const [cnr, setCnr] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = () => {
    if (!cnr.trim()) { setError('Please enter a CNR number'); return; }
    if (cnr.trim().length < 12) { setError('CNR number must be at least 12 characters'); return; }
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setResult(mockCNRResult);
    }, 1800);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      <Header title="CNR Case Lookup" showBack />

      <div className="px-4 py-5 space-y-4">
        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-100">
          <div className="flex items-start gap-2">
            <ExternalLink size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-blue-800">Powered by eCourts India</p>
              <p className="text-xs text-blue-600 mt-0.5">We fetch live case data directly from the official eCourts portal using your 16-digit CNR number.</p>
            </div>
          </div>
        </Card>

        {/* CNR Input */}
        <Card>
          <p className="text-sm font-semibold text-gray-800 mb-3">Enter CNR Number</p>
          <div className="space-y-3">
            <div>
              <input
                value={cnr}
                onChange={e => { setCnr(e.target.value.toUpperCase()); setError(''); }}
                placeholder="e.g. TNCH010012342024"
                maxLength={20}
                className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl font-mono text-sm uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            </div>
            <p className="text-xs text-gray-400">Your 16-digit CNR is printed on all court notices and cause lists.</p>
            <Button fullWidth onClick={handleSearch} disabled={loading}>
              {loading ? (
                <><RefreshCw size={14} className="animate-spin" /> Fetching from eCourts...</>
              ) : (
                <><Search size={14} /> Search Case</>
              )}
            </Button>
          </div>
        </Card>

        {/* Loading */}
        {loading && (
          <Card>
            <div className="flex flex-col items-center py-6 gap-3">
              <RefreshCw size={28} className="text-primary-500 animate-spin" />
              <p className="text-sm font-medium text-gray-600">Connecting to eCourts portal...</p>
              <p className="text-xs text-gray-400">This may take a few seconds</p>
            </div>
          </Card>
        )}

        {/* Result */}
        {result && !loading && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-500" />
              <p className="text-sm font-medium text-green-700">Case found on eCourts</p>
              <span className="text-xs text-gray-400 ml-auto">Live data · Just now</span>
            </div>

            <Card>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Case Title</p>
                  <p className="text-sm font-bold text-gray-900">{result.title}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-400">CNR Number</p>
                    <p className="text-xs font-mono font-medium text-gray-700">{result.cnr}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Case Type</p>
                    <p className="text-xs font-medium text-gray-700">{result.type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Filed Date</p>
                    <p className="text-xs font-medium text-gray-700">{result.filingDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Next Hearing</p>
                    <p className="text-xs font-semibold text-blue-600">{result.nextHearingDate}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Court</p>
                  <p className="text-xs font-medium text-gray-700">{result.court}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Presiding Judge</p>
                  <p className="text-xs font-medium text-gray-700">{result.presidingJudge}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-400">Petitioner</p>
                    <p className="text-xs font-medium text-gray-700">{result.petitioner.name}</p>
                    <p className="text-xs text-primary-500">{result.petitioner.advocate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Respondent</p>
                    <p className="text-xs font-medium text-gray-700">{result.respondent.name}</p>
                    <p className="text-xs text-gray-500">{result.respondent.advocate}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {result.actsSections.map(act => (
                    <span key={act} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{act}</span>
                  ))}
                </div>
              </div>
            </Card>

            <Button fullWidth onClick={() => navigate('/cases')}>
              <CheckCircle size={14} />
              Add This Case to My Cases
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
