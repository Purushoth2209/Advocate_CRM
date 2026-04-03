import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Briefcase, CreditCard, Bell, User } from 'lucide-react';
import { mockNotifications } from '../../data/mockData';

const tabs = [
  { label: 'Home', icon: Home, path: '/' },
  { label: 'Cases', icon: Briefcase, path: '/cases' },
  { label: 'Payments', icon: CreditCard, path: '/payments' },
  { label: 'Alerts', icon: Bell, path: '/notifications' },
  { label: 'Profile', icon: User, path: '/profile' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const unreadCount = mockNotifications.filter(n => !n.read).length;

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 z-50 safe-bottom shadow-lg">
      <div className="flex">
        {tabs.map(({ label, icon: Icon, path }) => {
          const isActive = path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(path);
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex-1 flex flex-col items-center py-3 gap-0.5 relative transition-colors ${
                isActive ? 'text-primary-600' : 'text-gray-400'
              }`}
            >
              <div className="relative">
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                {label === 'Alerts' && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-medium ${isActive ? 'text-primary-600' : 'text-gray-400'}`}>
                {label}
              </span>
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
