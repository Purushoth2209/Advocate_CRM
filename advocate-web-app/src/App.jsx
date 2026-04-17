import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DocumentsProvider } from './context/DocumentsContext';
import { EcourtsCacheProvider } from './context/EcourtsCacheContext';
import { CasesProvider } from './context/CasesContext';
import RequireAuth from './components/auth/RequireAuth';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ClientList from './pages/clients/ClientList';
import ClientDetail from './pages/clients/ClientDetail';
import NewClient from './pages/clients/NewClient';
import CaseList from './pages/cases/CaseList';
import NewCase from './pages/cases/NewCase';
import CaseDetail from './pages/cases/CaseDetail';
import EcourtsHub from './pages/cases/EcourtsHub';
import EcourtsCaseView from './pages/cases/EcourtsCaseView';
import CNRLookup from './pages/cases/CNRLookup';
import CaseSearch from './pages/cases/CaseSearch';
import DocumentVault from './pages/documents/DocumentVault';
import Appointments from './pages/appointments/Appointments';
import Chat from './pages/chat/Chat';
import TeamManagement from './pages/admin/TeamManagement';
import Settings from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CasesProvider>
        <DocumentsProvider>
          <EcourtsCacheProvider>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route element={<RequireAuth />}>
              <Route element={<Layout />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="clients" element={<ClientList />} />
                <Route path="clients/new" element={<NewClient />} />
                <Route path="clients/:id" element={<ClientDetail />} />
                <Route path="cases/ecourts" element={<EcourtsHub />} />
                <Route path="cases/ecourts/:cnr" element={<EcourtsCaseView />} />
                <Route path="cases/cnr" element={<CNRLookup />} />
                <Route path="cases/search" element={<CaseSearch />} />
                <Route path="cases/new" element={<NewCase />} />
                <Route path="cases" element={<CaseList />} />
                <Route path="cases/:id" element={<CaseDetail />} />
                <Route path="documents" element={<DocumentVault />} />
                <Route path="appointments" element={<Appointments />} />
                <Route path="appointments/new" element={<Appointments />} />
                <Route path="chat" element={<Chat />} />
                <Route path="team" element={<TeamManagement />} />
                <Route path="settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Route>
            </Route>
          </Routes>
          </EcourtsCacheProvider>
        </DocumentsProvider>
        </CasesProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
