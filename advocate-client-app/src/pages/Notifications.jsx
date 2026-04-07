import { useNavigate } from 'react-router-dom';
import { Bell, Gavel, FileText, MessageSquare, Wallet } from 'lucide-react';
import Header from '../components/layout/Header';
import { useClientAppData } from '../context/ClientExperienceContext';

function timeAgo(t) { return t; }

const typeConfig = {
  hearing: { icon: Gavel, color: 'bg-blue-50 text-blue-600' },
  billing: { icon: Wallet, color: 'bg-amber-50 text-amber-600' },
  update: { icon: Bell, color: 'bg-purple-50 text-purple-600' },
  message: { icon: MessageSquare, color: 'bg-green-50 text-green-600' },
  document: { icon: FileText, color: 'bg-indigo-50 text-indigo-600' },
};

export default function Notifications() {
  const navigate = useNavigate();
  const { notifications } = useClientAppData();
  const unread = notifications.filter(n => !n.read);
  const read = notifications.filter(n => n.read);

  const handleTap = (notif) => {
    if (notif.caseId) navigate(`/cases/${notif.caseId}`);
  };

  const NotifItem = ({ notif }) => {
    const config = typeConfig[notif.type] || typeConfig.update;
    const Icon = config.icon;
    return (
      <button
        onClick={() => handleTap(notif)}
        className={`w-full flex items-start gap-3 p-4 rounded-2xl text-left transition-colors border ${
          notif.read ? 'bg-white border-gray-100' : 'bg-navy-50/80 border-navy-100'
        }`}
      >
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${config.color}`}>
          <Icon size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={`text-sm font-semibold leading-tight ${notif.read ? 'text-gray-700' : 'text-gray-900'}`}>
              {notif.title}
            </p>
            {!notif.read && <div className="w-2 h-2 bg-navy-700 rounded-full flex-shrink-0 mt-1" />}
          </div>
          <p className="text-xs text-gray-500 mt-0.5 leading-snug">{notif.message}</p>
          <p className="text-[10px] text-gray-400 mt-1.5">{notif.time}</p>
        </div>
      </button>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      <Header title="Notifications" />

      <div className="px-4 py-4 space-y-4">
        {unread.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">New · {unread.length}</p>
            <div className="space-y-2">
              {unread.map(n => <NotifItem key={n.id} notif={n} />)}
            </div>
          </div>
        )}

        {read.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Earlier</p>
            <div className="space-y-2">
              {read.map(n => <NotifItem key={n.id} notif={n} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
