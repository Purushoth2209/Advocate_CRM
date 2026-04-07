import { NavLink, useLocation } from 'react-router-dom';
import {
  Scale, LayoutDashboard, Users, FolderOpen, Briefcase,
  CalendarDays, MessageSquare, Settings, ChevronDown,
  Bell, Shield, LogOut, Building2,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/clients', icon: Users, label: 'Clients' },
  { to: '/cases', icon: Briefcase, label: 'Cases' },
  { to: '/documents', icon: FolderOpen, label: 'Documents' },
  { to: '/appointments', icon: CalendarDays, label: 'Appointments' },
  { to: '/chat', icon: MessageSquare, label: 'Chat', badge: 2 },
];

const adminItems = [
  { to: '/team', icon: Shield, label: 'Team & Users' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const [orgOpen, setOrgOpen] = useState(false);
  const location = useLocation();

  const isActive = (to, exact) => {
    if (exact) return location.pathname === to;
    return location.pathname.startsWith(to);
  };

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
        <button
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
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
        <p className="text-navy-500 text-xs font-semibold uppercase tracking-wider px-3 mb-2">Main</p>
        {navItems.map(({ to, icon: Icon, label, badge, exact }) => (
          <NavLink
            key={to}
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
        ))}

        <p className="text-navy-500 text-xs font-semibold uppercase tracking-wider px-3 mt-5 mb-2">Administration</p>
        {adminItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive: navActive }) =>
              `sidebar-link ${navActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}`
            }
          >
            <Icon size={18} className="flex-shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User profile */}
      <div className="px-3 py-3 border-t border-white/10">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
          <div className="w-8 h-8 bg-navy-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">AS</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">Adv. A. Sharma</p>
            <p className="text-navy-400 text-xs truncate">Admin</p>
          </div>
          <LogOut size={14} className="text-navy-400 flex-shrink-0" />
        </div>
      </div>
    </aside>
  );
}
