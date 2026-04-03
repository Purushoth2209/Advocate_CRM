import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell } from 'lucide-react';
import { mockNotifications } from '../../data/mockData';

export default function Header({ title, showBack = false, rightAction = null }) {
  const navigate = useNavigate();
  const unreadCount = mockNotifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 h-14 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors -ml-1"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
        )}
        <h1 className="text-base font-semibold text-gray-900 truncate max-w-[220px]">{title}</h1>
      </div>
      {rightAction || (
        !showBack && (
          <button
            onClick={() => navigate('/notifications')}
            className="relative p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Bell size={20} className="text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>
        )
      )}
    </header>
  );
}
