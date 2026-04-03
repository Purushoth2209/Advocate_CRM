import { useNavigate } from 'react-router-dom';
import { User, Shield, Bell, HelpCircle, LogOut, ChevronRight, Phone } from 'lucide-react';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';

const menuItems = [
  { icon: User, label: 'Personal Details', desc: 'Update your profile info', path: '/profile/details' },
  { icon: Shield, label: 'Privacy & Security', desc: 'Password, 2FA settings', path: '/profile/security' },
  { icon: Bell, label: 'Notification Preferences', desc: 'Manage alerts & reminders', path: '/profile/notifications' },
  { icon: HelpCircle, label: 'Help & Support', desc: 'FAQs, contact support', path: '/profile/help' },
];

export default function Profile() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      <Header title="Profile" />
      <div className="px-4 py-4 space-y-4">
        {/* Profile Card */}
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xl">RK</div>
            <div>
              <p className="text-base font-bold text-gray-900">Ramesh Kumar</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Phone size={11} className="text-gray-400" />
                <p className="text-xs text-gray-500">+91 98765 43210</p>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">Client ID: CLT-2024-001</p>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Active Cases', value: '3' },
            { label: 'Advocates', value: '2' },
            { label: 'Total Paid', value: '₹26K' },
          ].map(s => (
            <Card key={s.label}>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{s.label}</p>
            </Card>
          ))}
        </div>

        {/* Menu */}
        <div className="space-y-2">
          {menuItems.map(item => (
            <Card key={item.label} onClick={() => {}}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center">
                  <item.icon size={16} className="text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{item.label}</p>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
                <ChevronRight size={14} className="text-gray-400" />
              </div>
            </Card>
          ))}
        </div>

        <button className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-red-500 border border-red-100 rounded-2xl bg-white">
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
