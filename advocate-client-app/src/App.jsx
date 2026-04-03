import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BottomNav from './components/layout/BottomNav';
import Dashboard from './pages/Dashboard';
import CaseList from './pages/cases/CaseList';
import CaseDetail from './pages/cases/CaseDetail';
import CNRLookup from './pages/cases/CNRLookup';
import AppointmentBooking from './pages/cases/AppointmentBooking';
import DiscoverAdvocates from './pages/cases/DiscoverAdvocates';
import PaymentsSummary from './pages/payments/PaymentsSummary';
import InvoiceList from './pages/payments/InvoiceList';
import InvoiceDetail from './pages/payments/InvoiceDetail';
import PayNow from './pages/payments/PayNow';
import PaymentHistory from './pages/payments/PaymentHistory';
import RetainerTracker from './pages/payments/RetainerTracker';
import InstallmentSchedule from './pages/payments/InstallmentSchedule';
import ExpenseLog from './pages/payments/ExpenseLog';
import DisputeScreen from './pages/payments/DisputeScreen';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto relative">
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />

            {/* Cases — static routes must come before dynamic :id */}
            <Route path="/cases" element={<CaseList />} />
            <Route path="/cases/cnr" element={<CNRLookup />} />
            <Route path="/cases/book-appointment" element={<AppointmentBooking />} />
            <Route path="/cases/discover" element={<DiscoverAdvocates />} />
            <Route path="/cases/:id" element={<CaseDetail />} />

            {/* Payments */}
            <Route path="/payments" element={<PaymentsSummary />} />
            <Route path="/payments/invoices" element={<InvoiceList />} />
            <Route path="/payments/invoice/:id" element={<InvoiceDetail />} />
            <Route path="/payments/pay/:id" element={<PayNow />} />
            <Route path="/payments/history" element={<PaymentHistory />} />
            <Route path="/payments/retainer" element={<RetainerTracker />} />
            <Route path="/payments/installments" element={<InstallmentSchedule />} />
            <Route path="/payments/expenses" element={<ExpenseLog />} />
            <Route path="/payments/dispute/:id" element={<DisputeScreen />} />

            {/* Misc */}
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}
