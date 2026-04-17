import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Briefcase, Bell, User } from 'lucide-react';
import { useClientAppData } from '../../context/ClientExperienceContext';

const tabs = [
  { label: 'Home', icon: Home, path: '/' },
  { label: 'Cases', icon: Briefcase, path: '/cases' },
  { label: 'Alerts', icon: Bell, path: '/notifications' },
  { label: 'Profile', icon: User, path: '/profile' },
];

/** Under `/cases` but not the list/detail — discover, CNR, book flow; shouldn’t light up Cases tab */
const CASES_AUXILIARY_PATHS = [
  '/cases/discover',
  '/cases/book-appointment',
  '/cases/cnr',
  '/cases/search',
];

function isCasesSectionActive(pathname) {
  if (!pathname.startsWith('/cases')) return false;
  /** Full-screen live case view — not the hub at `/cases/ecourts` */
  if (/^\/cases\/ecourts\/.+/.test(pathname)) return false;
  return !CASES_AUXILIARY_PATHS.some(
    aux => pathname === aux || pathname.startsWith(`${aux}/`),
  );
}

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { notifications } = useClientAppData();
  const unreadCount = notifications.filter(n => !n.read).length;
  const pathname = location.pathname;

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 z-50 safe-bottom shadow-[0_-4px_24px_rgba(15,14,58,0.06)]">
      <div className="flex">
        {tabs.map(({ label, icon: Icon, path }) => {
          const isActive =
            path === '/'
              ? pathname === '/'
              : path === '/cases'
                ? isCasesSectionActive(pathname)
                : pathname.startsWith(path);
          return (
            <button
              key={path}
              type="button"
              onClick={() => navigate(path)}
              className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 relative transition-colors ${
                isActive ? 'text-navy-700' : 'text-gray-400'
              }`}
            >
              <div className="relative">
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                {label === 'Alerts' && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-semibold ${isActive ? 'text-navy-700' : 'text-gray-400'}`}>
                {label}
              </span>
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-9 h-0.5 bg-gold-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
