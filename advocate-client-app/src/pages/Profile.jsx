import { User, Shield, Bell, HelpCircle, LogOut, ChevronRight, Phone, Link2, Building2 } from 'lucide-react';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import { useClientAppData } from '../context/ClientExperienceContext';
import { isClientPreviewEnabled } from '../config/clientPreview';

const menuItems = [
  { icon: User, label: 'Personal details', desc: 'Name, phone, address', path: '/profile/details' },
  { icon: Shield, label: 'Privacy & security', desc: 'Password, device sessions', path: '/profile/security' },
  { icon: Bell, label: 'Notifications', desc: 'Hearings, messages, documents', path: '/profile/notifications' },
  { icon: HelpCircle, label: 'Help & support', desc: 'FAQs, contact', path: '/profile/help' },
];

function initials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0])
    .join('')
    .toUpperCase();
}

const relCopy = {
  retained: 'Active matter — full case access in LexDesk',
  consultation: 'Consultation only — upgrade when you retain counsel',
};

export default function Profile() {
  const { clientProfile: p, cases, experience, setExperience } = useClientAppData();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      <Header title="Profile" />
      <div className="px-4 py-4 space-y-4">
        <Card className="border-navy-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-navy-700 flex items-center justify-center text-gold-400 font-bold text-lg shadow-md">
              {initials(p.displayName)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-base font-bold text-navy-950">{p.displayName}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Phone size={11} className="text-gray-400 flex-shrink-0" />
                <p className="text-xs text-gray-600 truncate">{p.phone}</p>
              </div>
              <p className="text-[11px] text-gray-400 mt-1 font-mono">Ref: {p.clientRef}</p>
              {p.firmLabel && (
                <div className="flex items-center gap-1 mt-2 text-[11px] text-navy-700">
                  <Building2 size={12} className="flex-shrink-0" />
                  <span className="font-medium truncate">{p.firmLabel}</span>
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Link2 size={14} className="text-navy-700" />
            <p className="text-xs font-bold text-navy-900 uppercase tracking-wide">Linked advocates</p>
          </div>
          <p className="text-[11px] text-gray-500 mb-3">
            Matches your connections in the advocate CRM (invite link, code, or accepted request).
          </p>
          <div className="space-y-2">
            {p.advocateLinks.length === 0 && (
              <p className="text-sm text-gray-500 py-2 text-center">No linked advocates yet.</p>
            )}
            {p.advocateLinks.map(link => (
              <div
                key={link.advocateId}
                className="flex items-start justify-between gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{link.name}</p>
                  <p className="text-[11px] text-gray-500">{link.court}</p>
                  <p className="text-[10px] text-navy-600 mt-1">{relCopy[link.relationship] || relCopy.retained}</p>
                </div>
                <span className="text-[10px] font-medium text-gray-400 capitalize flex-shrink-0">{link.source}</span>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Cases', value: String(cases.length) },
            { label: 'Advocates', value: String(p.advocateLinks.length) },
            { label: 'Est. paid', value: cases.length > 0 ? '₹26K' : '—' },
          ].map(s => (
            <Card key={s.label} className="!p-3 text-center">
              <p className="text-lg font-bold text-navy-900">{s.value}</p>
              <p className="text-[10px] text-gray-500 mt-0.5 font-medium">{s.label}</p>
            </Card>
          ))}
        </div>

        <div className="space-y-2">
          {menuItems.map(item => (
            <Card key={item.label} onClick={() => {}}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-navy-50 rounded-xl flex items-center justify-center">
                  <item.icon size={16} className="text-navy-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
                <ChevronRight size={14} className="text-gray-300 flex-shrink-0" />
              </div>
            </Card>
          ))}
        </div>

        {isClientPreviewEnabled() && (
          <Card className="border-amber-200 bg-amber-50/50">
            <p className="text-[10px] font-bold text-amber-900 uppercase tracking-wide mb-2">Preview mode</p>
            <p className="text-xs text-amber-900/80 mb-3">
              Switch between a brand-new client (empty home) and a client with cases and linked advocates.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setExperience('fresh')}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                  experience === 'fresh'
                    ? 'bg-navy-700 text-white border-navy-700'
                    : 'bg-white text-navy-800 border-navy-200 hover:bg-navy-50'
                }`}
              >
                New user
              </button>
              <button
                type="button"
                onClick={() => setExperience('returning')}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                  experience === 'returning'
                    ? 'bg-navy-700 text-white border-navy-700'
                    : 'bg-white text-navy-800 border-navy-200 hover:bg-navy-50'
                }`}
              >
                Returning
              </button>
            </div>
            <p className="text-[10px] text-amber-800/70 mt-2">
              Data preset: <span className="font-mono">?experience=fresh</span> in the URL. For real production, build with{' '}
              <span className="font-mono">VITE_HIDE_CLIENT_PREVIEW=true</span> to hide this block. Optional hide in browser:{' '}
              <span className="font-mono">?client_preview=0</span>.
            </p>
          </Card>
        )}

        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-red-600 border border-red-100 rounded-2xl bg-white hover:bg-red-50 transition-colors"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </div>
  );
}
