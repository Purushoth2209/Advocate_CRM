import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ClientExperienceProvider } from './context/ClientExperienceContext';
import BottomNav from './components/layout/BottomNav';
import Dashboard from './pages/Dashboard';
import CaseList from './pages/cases/CaseList';
import CaseDetail from './pages/cases/CaseDetail';
import CNRLookup from './pages/cases/CNRLookup';
import AppointmentBooking from './pages/cases/AppointmentBooking';
import DiscoverAdvocates from './pages/cases/DiscoverAdvocates';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';

export default function App() {
  return (
    <BrowserRouter>
      <ClientExperienceProvider>
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

            {/* Misc */}
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>
        <BottomNav />
      </div>
      </ClientExperienceProvider>
    </BrowserRouter>
  );
}
