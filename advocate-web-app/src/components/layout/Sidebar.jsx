import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Tooltip from '../ui/Tooltip';
import {
  Scale, LayoutDashboard, Users, FolderOpen, Briefcase,
  CalendarDays, MessageSquare, Settings, ChevronDown,
  Shield, LogOut, Building2,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', exact: true, tooltip: 'Dashboard — overview and quick stats' },
  { to: '/clients', icon: Users, label: 'Clients', tooltip: 'All clients and contact records' },
  { to: '/cases', icon: Briefcase, label: 'Cases', tooltip: 'Matters and case files' },
  { to: '/documents', icon: FolderOpen, label: 'Documents', tooltip: 'Shared and private document vault' },
  { to: '/appointments', icon: CalendarDays, label: 'Appointments', tooltip: 'Calendar and scheduling' },
  { to: '/chat', icon: MessageSquare, label: 'Chat', badge: 2, tooltip: 'Client messaging (2 unread — demo)' },
];

const adminItems = [
  { to: '/team', icon: Shield, label: 'Team & Users', tooltip: 'Manage advocates and access' },
  { to: '/settings', icon: Settings, label: 'Settings', tooltip: 'Firm and account preferences' },
];

export default function Sidebar() {
  const [orgOpen, setOrgOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-navy-900 flex flex-col z-30">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gold-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Scale size={18} className="text-navy-900" />
          </div>
          <div>
            <p className="text-white font-bold text-base leading-tight">LexDesk</p>
            <p className="text-navy-300 text-xs">Advocate CRM</p>
          </div>
        </div>
      </div>

      {/* Organisation selector */}
      <div className="px-3 py-3 border-b border-white/10">
        <Tooltip content="Switch organisation (demo — not wired yet)" side="right" className="w-full">
          <button
            type="button"
            onClick={() => setOrgOpen(!orgOpen)}
            className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <div className="w-7 h-7 bg-indigo-500 rounded-md flex items-center justify-center flex-shrink-0">
              <Building2 size={14} className="text-white" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-white text-xs font-semibold truncate">Sharma & Associates</p>
              <p className="text-navy-400 text-xs truncate">4 advocates</p>
            </div>
            <ChevronDown size={14} className={`text-navy-400 transition-transform ${orgOpen ? 'rotate-180' : ''}`} />
          </button>
        </Tooltip>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
        <p className="text-navy-500 text-xs font-semibold uppercase tracking-wider px-3 mb-2">Main</p>
        {navItems.map(({ to, icon: Icon, label, badge, exact, tooltip }) => (
          <Tooltip key={to} content={tooltip} side="right" className="w-full">
            <NavLink
              to={to}
              end={exact}
              className={({ isActive: navActive }) =>
                `sidebar-link ${navActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}`
              }
            >
              <Icon size={18} className="flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {badge && (
                <span className="bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {badge}
                </span>
              )}
            </NavLink>
          </Tooltip>
        ))}

        <p className="text-navy-500 text-xs font-semibold uppercase tracking-wider px-3 mt-5 mb-2">Administration</p>
        {adminItems.map(({ to, icon: Icon, label, tooltip }) => (
          <Tooltip key={to} content={tooltip} side="right" className="w-full">
            <NavLink
              to={to}
              className={({ isActive: navActive }) =>
                `sidebar-link ${navActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}`
              }
            >
              <Icon size={18} className="flex-shrink-0" />
              <span>{label}</span>
            </NavLink>
          </Tooltip>
        ))}
      </nav>

      {/* User profile */}
      <div className="px-3 py-3 border-t border-white/10">
        <Tooltip content="Sign out and return to login" side="right" className="w-full">
          <button
            type="button"
            onClick={() => { logout(); navigate('/', { replace: true }); }}
            className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors text-left"
          >
            <div className="w-8 h-8 bg-navy-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">{user?.initials || '?'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">{user?.name || 'Signed in'}</p>
              <p className="text-navy-400 text-xs truncate">{user?.role || ''}</p>
            </div>
            <LogOut size={14} className="text-navy-400 flex-shrink-0" />
          </button>
        </Tooltip>
      </div>
    </aside>
  );
}
