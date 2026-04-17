import { Bell, Search, Plus } from 'lucide-react';
import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { mockNotifications } from '../../data/mockData';
import Tooltip from '../ui/Tooltip';

function getPageTitle(pathname) {
  if (pathname === '/dashboard') return 'Dashboard';
  if (pathname.startsWith('/clients')) return 'Clients';
  if (pathname === '/cases/ecourts') return 'eCourts India';
  if (/^\/cases\/ecourts\/.+/.test(pathname)) return 'eCourts — Live case';
  if (pathname === '/cases/cnr' || pathname.startsWith('/cases/cnr/')) return 'CNR lookup';
  if (pathname === '/cases/search' || pathname.startsWith('/cases/search')) return 'Search eCourts';
  if (pathname === '/cases/new') return 'New case';
  if (pathname.startsWith('/cases')) return 'Cases';
  if (pathname.startsWith('/documents')) return 'Documents';
  if (pathname.startsWith('/appointments')) return 'Appointments';
  if (pathname.startsWith('/chat')) return 'Chat';
  if (pathname.startsWith('/team')) return 'Team & Users';
  if (pathname.startsWith('/settings')) return 'Settings';
  return 'LexDesk';
}

export default function TopBar() {
  const location = useLocation();
  const [notifOpen, setNotifOpen] = useState(false);
  const unreadCount = mockNotifications.filter(n => !n.read).length;

  const title = getPageTitle(location.pathname);

  return (
    <header className="fixed top-0 left-60 right-0 h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 z-20">
      <h1 className="text-base font-semibold text-gray-900">{title}</h1>

      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Tooltip content="Search clients, cases, and matters (demo UI)" side="bottom">
            <span className="relative inline-flex">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
              <input
                type="text"
                placeholder="Search clients, cases..."
                className="pl-9 pr-4 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg w-52 focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500"
              />
            </span>
          </Tooltip>
        </div>

        <div className="relative">
          <Tooltip content="Notifications" side="bottom">
            <button
              type="button"
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Bell size={18} className="text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </Tooltip>

          {notifOpen && (
            <div className="absolute right-0 top-10 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900">Notifications</span>
                <Tooltip content="Mark all as read (demo)" side="bottom">
                  <button type="button" className="text-xs text-navy-600 font-medium">
                    Mark all read
                  </button>
                </Tooltip>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {mockNotifications.map(n => (
                  <div
                    key={n.id}
                    className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${!n.read ? 'bg-navy-50' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.read ? 'bg-navy-600' : 'bg-gray-300'}`} />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-900">{n.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <Tooltip content="Start new client intake" side="bottom">
          <Link to="/clients/new" className="btn-primary text-xs py-1.5 px-3">
            <Plus size={14} />
            New Client
          </Link>
        </Tooltip>
      </div>
    </header>
  );
}
