import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, CheckCircle, Shield, Download, Home } from 'lucide-react';
import Header from '../../components/layout/Header';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { mockInvoices } from '../../data/mockData';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

const paymentMethods = [
  { id: 'upi', label: 'UPI', desc: 'GPay, PhonePe, Paytm, BHIM', icon: '🔵' },
  { id: 'netbanking', label: 'Net Banking', desc: 'All major banks supported', icon: '🏦' },
  { id: 'card', label: 'Debit / Credit Card', desc: 'Visa, Mastercard, RuPay', icon: '💳' },
];

export default function PayNow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState(null);
  const [upiId, setUpiId] = useState('');
  const [success, setSuccess] = useState(false);

  const inv = mockInvoices.find(i => i.id === id);
  if (!inv) return null;

  const handleConfirm = () => {
    setStep(3);
    setTimeout(() => setSuccess(true), 1500);
  };

  if (success) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 items-center justify-center px-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-5 animate-bounce">
          <CheckCircle size={40} className="text-green-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Payment Successful!</h2>
        <p className="text-sm text-gray-500 text-center mb-6">Your payment has been processed and sent to {inv.advocate}</p>

        <Card className="w-full max-w-xs text-center">
          <p className="text-3xl font-bold text-gray-900 mb-1">{formatCurrency(inv.total)}</p>
          <p className="text-xs text-gray-400 mb-3">{inv.invoiceNo}</p>
          <div className="space-y-1.5 text-xs text-left">
            <div className="flex justify-between">
              <span className="text-gray-400">Method</span>
              <span className="font-medium text-gray-700">{paymentMethods.find(m => m.id === method)?.label}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Reference ID</span>
              <span className="font-mono text-gray-700">UPI{Date.now().toString().slice(-10)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Date</span>
              <span className="font-medium text-gray-700">{new Date().toLocaleDateString('en-IN')}</span>
            </div>
          </div>
        </Card>

        <div className="mt-6 w-full max-w-xs space-y-3">
          <Button fullWidth variant="outline">
            <Download size={14} />
            Download Receipt
          </Button>
          <Button fullWidth onClick={() => navigate('/')}>
            <Home size={14} />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-24">
      <Header title="Make Payment" showBack />

      {/* Progress Bar */}
      <div className="bg-white px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          {['Select Method', 'Confirm', 'Success'].map((s, i) => (
            <div key={s} className="flex items-center gap-1 flex-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-400'
              }`}>
                {step > i + 1 ? <CheckCircle size={12} /> : i + 1}
              </div>
              <p className={`text-[10px] font-medium flex-1 ${step === i + 1 ? 'text-primary-600' : 'text-gray-400'}`}>{s}</p>
              {i < 2 && <div className={`flex-1 h-0.5 rounded ${step > i + 1 ? 'bg-green-500' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Amount Card */}
        <Card className="bg-gradient-to-r from-primary-600 to-indigo-600 border-0">
          <p className="text-primary-100 text-xs mb-1">Amount to Pay</p>
          <p className="text-white text-3xl font-bold">{formatCurrency(inv.total)}</p>
          <p className="text-primary-200 text-xs mt-1">{inv.invoiceNo} · {inv.caseTitle}</p>
        </Card>

        {/* Step 1: Method Selection */}
        {step === 1 && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-700">Select Payment Method</p>
            {paymentMethods.map(m => (
              <Card key={m.id} onClick={() => setMethod(m.id)}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{m.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">{m.label}</p>
                    <p className="text-xs text-gray-400">{m.desc}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    method === m.id ? 'border-primary-600 bg-primary-600' : 'border-gray-300'
                  }`}>
                    {method === m.id && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                </div>
              </Card>
            ))}

            {method === 'upi' && (
              <Card>
                <p className="text-xs font-medium text-gray-600 mb-2">Enter UPI ID</p>
                <input
                  value={upiId}
                  onChange={e => setUpiId(e.target.value)}
                  placeholder="yourname@upi"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </Card>
            )}

            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Shield size={12} />
              <span>256-bit encrypted · Secured by Razorpay</span>
            </div>
          </div>
        )}

        {/* Step 2: Confirmation */}
        {step === 2 && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-700">Confirm Payment</p>
            <Card>
              <div className="space-y-2 text-sm">
                {[
                  { label: 'Invoice', value: inv.invoiceNo },
                  { label: 'Case', value: inv.caseTitle },
                  { label: 'Advocate', value: inv.advocate },
                  { label: 'Amount', value: formatCurrency(inv.total), bold: true },
                  { label: 'Method', value: paymentMethods.find(m => m.id === method)?.label },
                ].map(row => (
                  <div key={row.label} className="flex justify-between py-1.5 border-b border-gray-50 last:border-0">
                    <span className="text-gray-500">{row.label}</span>
                    <span className={row.bold ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}>{row.value}</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="bg-amber-50 border-amber-100">
              <p className="text-xs text-amber-700">This payment is non-refundable. For any disputes, contact your advocate through the app.</p>
            </Card>
          </div>
        )}

        {/* Step 3: Processing */}
        {step === 3 && !success && (
          <Card>
            <div className="flex flex-col items-center py-8 gap-3">
              <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium text-gray-700">Processing your payment...</p>
              <p className="text-xs text-gray-400">Please do not close this screen</p>
            </div>
          </Card>
        )}
      </div>

      {/* Bottom CTA */}
      {step < 3 && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md p-4 bg-white border-t border-gray-100">
          {step === 1 ? (
            <Button fullWidth size="lg" disabled={!method} onClick={() => setStep(2)}>
              Continue <ChevronRight size={16} />
            </Button>
          ) : (
            <Button fullWidth size="lg" onClick={handleConfirm}>
              Confirm & Pay {formatCurrency(inv.total)}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
