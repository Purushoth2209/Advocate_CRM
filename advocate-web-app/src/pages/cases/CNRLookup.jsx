import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, RefreshCw, CheckCircle, ExternalLink, Maximize2 } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import EcourtsCasePanel from '../../components/e-courts/EcourtsCasePanel';
import { getCaseByCnr, hasPartnerToken } from '../../modules/e-courts';
import { useEcourtsCache } from '../../context/EcourtsCacheContext';

export default function CNRLookup() {
  const navigate = useNavigate();
  const { setSnapshot } = useEcourtsCache();
  const [cnr, setCnr] = useState('');
  const [loading, setLoading] = useState(false);
  const [successCnr, setSuccessCnr] = useState('');
  const [error, setError] = useState('');

  const handleSearch = async () => {
    const clean = cnr.trim().toUpperCase();
    if (!clean) {
      setError('Please enter a CNR number');
      return;
    }
    if (clean.length < 10) {
      setError('CNR must be at least 10 characters');
      return;
    }
    if (!hasPartnerToken()) {
      setError('Add VITE_ECOURTS_API_TOKEN to .env to fetch live data.');
      return;
    }
    setError('');
    setSuccessCnr('');
    setLoading(true);
    try {
      const res = await getCaseByCnr(clean);
      setSnapshot(clean, res);
      setSuccessCnr(clean);
    } catch (e) {
      setError(e?.message || 'Lookup failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link to="/cases/ecourts" className="btn-secondary text-xs py-1.5 px-3">
          ← eCourts hub
        </Link>
      </div>

      <div className="space-y-4">
        <Card className="bg-blue-50 border-blue-100">
          <div className="flex items-start gap-2">
            <ExternalLink size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-blue-800">Powered by eCourts India</p>
              <p className="text-xs text-blue-600 mt-0.5">
                Live case data via the EcourtsIndia Partner API using your CNR (Case Number Record).
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <p className="text-sm font-semibold text-gray-800 mb-3">Enter CNR Number</p>
          <div className="space-y-3">
            <div>
              <input
                value={cnr}
                onChange={(e) => {
                  setCnr(e.target.value.toUpperCase());
                  setError('');
                }}
                placeholder="e.g. DLHC010001232024"
                maxLength={30}
                className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl font-mono text-sm uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-navy-500/30 focus:border-navy-600 focus:border-transparent"
              />
              {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            </div>
            <p className="text-xs text-gray-400">CNR appears on court notices and cause lists.</p>
            <Button fullWidth onClick={handleSearch} disabled={loading}>
              {loading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" /> Fetching from eCourts…
                </>
              ) : (
                <>
                  <Search size={14} /> Search case
                </>
              )}
            </Button>
          </div>
        </Card>

        {loading && (
          <Card>
            <div className="flex flex-col items-center py-6 gap-3">
              <RefreshCw size={28} className="text-navy-700 animate-spin" />
              <p className="text-sm font-medium text-gray-600">Calling eCourts API…</p>
            </div>
          </Card>
        )}

        {successCnr && !loading && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <CheckCircle size={16} className="text-green-500" />
              <p className="text-sm font-medium text-green-700">Case loaded</p>
              <Button
                size="sm"
                variant="outline"
                className="ml-auto"
                onClick={() => navigate(`/cases/ecourts/${encodeURIComponent(successCnr)}`)}
              >
                <Maximize2 size={14} /> Full screen
              </Button>
            </div>
            <EcourtsCasePanel cnr={successCnr} />
            <Button fullWidth onClick={() => navigate('/cases')}>
              <CheckCircle size={14} />
              Back to my cases
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
