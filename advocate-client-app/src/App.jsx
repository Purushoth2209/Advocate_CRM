import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ClientExperienceProvider } from './context/ClientExperienceContext';
import { EcourtsCacheProvider } from './context/EcourtsCacheContext';
import PreviewQuerySync from './components/PreviewQuerySync';
import BottomNav from './components/layout/BottomNav';
import Dashboard from './pages/Dashboard';
import CaseList from './pages/cases/CaseList';
import CaseDetail from './pages/cases/CaseDetail';
import CNRLookup from './pages/cases/CNRLookup';
import CaseSearch from './pages/cases/CaseSearch';
import EcourtsCaseView from './pages/cases/EcourtsCaseView';
import EcourtsHub from './pages/cases/EcourtsHub';
import AppointmentBooking from './pages/cases/AppointmentBooking';
import DiscoverAdvocates from './pages/cases/DiscoverAdvocates';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  return (
    <BrowserRouter>
      <EcourtsCacheProvider>
      <ClientExperienceProvider>
      <PreviewQuerySync />
      <div className="min-h-screen min-h-[100dvh] bg-gray-50 flex flex-col max-w-md mx-auto relative w-full">
        <ErrorBoundary>
        <div className="flex-1 flex flex-col w-full min-h-0">
          <Routes>
            <Route path="/" element={<Dashboard />} />

            {/* Cases — static routes must come before dynamic :id */}
            <Route path="/cases" element={<CaseList />} />
            <Route path="/cases/cnr" element={<CNRLookup />} />
            <Route path="/cases/search" element={<CaseSearch />} />
            <Route path="/cases/ecourts" element={<EcourtsHub />} />
            <Route path="/cases/ecourts/:cnr" element={<EcourtsCaseView />} />
            <Route path="/cases/book-appointment" element={<AppointmentBooking />} />
            <Route path="/cases/discover" element={<DiscoverAdvocates />} />
            <Route path="/cases/:id" element={<CaseDetail />} />

            {/* Misc */}
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>
        </ErrorBoundary>
        <BottomNav />
      </div>
      </ClientExperienceProvider>
      </EcourtsCacheProvider>
    </BrowserRouter>
  );
}
