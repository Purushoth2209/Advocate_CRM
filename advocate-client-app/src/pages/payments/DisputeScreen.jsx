import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, CheckCircle } from 'lucide-react';
import Header from '../../components/layout/Header';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { mockInvoices } from '../../data/mockData';

export default function DisputeScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const inv = mockInvoices.find(i => i.id === id);

  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  }

  if (submitted) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 items-center justify-center px-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle size={32} className="text-blue-500" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Query Submitted</h2>
        <p className="text-sm text-gray-500 text-center mb-6">Your query has been sent to {inv?.advocate}. They will respond within 24 hours.</p>
        <div className="w-full max-w-xs">
          <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-4">
            <div className="flex gap-2 items-center mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <p className="text-xs font-medium text-gray-600">Status: <span className="text-blue-600">Under Review</span></p>
            </div>
            <p className="text-xs text-gray-500">You will receive a notification when the advocate responds.</p>
          </div>
          <Button fullWidth variant="outline" onClick={() => navigate('/payments')}>
            Back to Payments
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-24">
      <Header title="Raise a Query" showBack />

      <div className="px-4 py-4 space-y-4">
        {inv && (
          <Card className="bg-gray-50">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Invoice Reference</p>
            <p className="text-sm font-bold text-gray-800">{inv.invoiceNo}</p>
            <p className="text-xs text-gray-500">{inv.caseTitle} · {formatCurrency(inv.total)}</p>
          </Card>
        )}

        <Card>
          <p className="text-sm font-semibold text-gray-800 mb-3">Describe Your Query</p>
          <textarea
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="e.g. I don't understand the ₹1,500 documentation charge. Could you clarify what documents were drafted?"
            rows={5}
            className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <p className="text-xs text-gray-400 mt-1">{query.length}/500</p>
        </Card>

        <Card className="bg-blue-50 border-blue-100">
          <p className="text-xs text-blue-700">Your query will be reviewed by {inv?.advocate}. All queries are logged for transparency and legal traceability.</p>
        </Card>
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md p-4 bg-white border-t border-gray-100">
        <Button fullWidth size="lg" disabled={!query.trim()} onClick={() => setSubmitted(true)}>
          <Send size={14} />
          Submit Query
        </Button>
      </div>
    </div>
  );
}
