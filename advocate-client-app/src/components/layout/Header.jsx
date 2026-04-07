import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Scale } from 'lucide-react';
import { useClientAppData } from '../../context/ClientExperienceContext';

export default function Header({ title, showBack = false, rightAction = null, showBrand = false }) {
  const navigate = useNavigate();
  const { notifications } = useClientAppData();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 h-14 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {showBack && (
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-lg hover:bg-navy-50 transition-colors -ml-1 flex-shrink-0"
            aria-label="Go back"
          >
            <ArrowLeft size={20} className="text-navy-800" />
          </button>
        )}
        {showBrand && !showBack && (
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-8 h-8 bg-gold-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Scale size={16} className="text-navy-900" />
            </div>
            <div className="min-w-0 leading-tight">
              <p className="text-sm font-bold text-navy-900 truncate">LexDesk</p>
              <p className="text-[10px] text-navy-600 font-medium">Client · {title}</p>
            </div>
          </div>
        )}
        {showBrand && !showBack && <h1 className="sr-only">{title}</h1>}
        {(!showBrand || showBack) && (
          <h1 className="text-base font-semibold text-gray-900 truncate">{title}</h1>
        )}
      </div>
      {rightAction || (
        !showBack && (
          <button
            type="button"
            onClick={() => navigate('/notifications')}
            className="relative p-1.5 rounded-lg hover:bg-navy-50 transition-colors flex-shrink-0"
            aria-label="Notifications"
          >
            <Bell size={20} className="text-navy-700" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[6px] h-[6px] bg-red-500 rounded-full ring-2 ring-white" />
            )}
          </button>
        )
      )}
    </header>
  );
}
