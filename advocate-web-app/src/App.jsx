import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import ClientList from './pages/clients/ClientList';
import ClientDetail from './pages/clients/ClientDetail';
import CaseList from './pages/cases/CaseList';
import CaseDetail from './pages/cases/CaseDetail';
import DocumentVault from './pages/documents/DocumentVault';
import Appointments from './pages/appointments/Appointments';
import Chat from './pages/chat/Chat';
import TeamManagement from './pages/admin/TeamManagement';
import Settings from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="clients" element={<ClientList />} />
          <Route path="clients/:id" element={<ClientDetail />} />
          <Route path="clients/new" element={<ClientDetail />} />
          <Route path="cases" element={<CaseList />} />
          <Route path="cases/:id" element={<CaseDetail />} />
          <Route path="cases/new" element={<CaseList />} />
          <Route path="documents" element={<DocumentVault />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="appointments/new" element={<Appointments />} />
          <Route path="chat" element={<Chat />} />
          <Route path="team" element={<TeamManagement />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
