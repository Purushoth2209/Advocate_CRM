import { useNavigate } from 'react-router-dom';
import { Scale, Briefcase, Calendar, ChevronRight, CalendarDays, Search, Users, FileText, Bell, Landmark } from 'lucide-react';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import { StatusBadge } from '../components/ui/Badge';
import { useClientAppData } from '../context/ClientExperienceContext';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const relLabel = {
  retained: { text: 'Active matter', className: 'bg-navy-100 text-navy-800' },
  consultation: { text: 'Consultation', className: 'bg-amber-100 text-amber-800' },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { cases, notifications, clientProfile } = useClientAppData();
  const activeCases = cases.length;
  const unread = notifications.filter(n => !n.read).length;
  const upcomingHearings = cases.filter(c => c.nextHearing).length;
  const nextHearing = cases
    .filter(c => c.nextHearing)
    .sort((a, b) => new Date(a.nextHearing) - new Date(b.nextHearing))[0];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      <Header title="Home" showBrand />

      {/* Hero — matches LexDesk CRM gradient */}
      <div className="ld-hero px-4 pt-5 pb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-gold-500 flex items-center justify-center shadow-lg shadow-navy-900/20">
            <Scale size={22} className="text-navy-900" />
          </div>
          <div className="min-w-0">
            <p className="text-navy-200 text-xs font-medium">Good morning,</p>
            <h2 className="text-white text-lg font-bold truncate">{clientProfile.displayName}</h2>
            {clientProfile.firmLabel && (
              <p className="text-navy-300 text-[11px] mt-0.5 truncate">{clientProfile.firmLabel}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {[
            { label: 'Cases', value: activeCases, icon: Briefcase },
            { label: 'Hearings', value: upcomingHearings, icon: Calendar },
            { label: 'Alerts', value: unread, icon: Bell },
          ].map(stat => (
            <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <stat.icon size={14} className="text-gold-400 mb-1" />
              <p className="text-white font-bold text-lg leading-tight">{stat.value}</p>
              <p className="text-navy-200 text-[10px] font-medium mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* Your advocates — aligns with CRM client–advocate mapping */}
        <Card className="border-navy-100 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-navy-100 flex items-center justify-center">
                <Users size={16} className="text-navy-700" />
              </div>
              <div>
                <p className="text-xs font-bold text-navy-900 uppercase tracking-wide">Your advocates</p>
                <p className="text-[10px] text-gray-500">Linked in LexDesk (same as your firm CRM)</p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            {clientProfile.advocateLinks.length === 0 && (
              <div className="rounded-xl border border-dashed border-navy-200 bg-navy-50/40 p-4 text-center">
                <p className="text-sm text-navy-900 font-medium">No advocates linked yet</p>
                <p className="text-[11px] text-gray-500 mt-1 mb-3">Use an invite from your lawyer or browse the directory.</p>
                <button
                  type="button"
                  onClick={() => navigate('/cases/discover')}
                  className="text-xs font-semibold text-navy-700 bg-white border border-navy-200 rounded-lg px-3 py-2 hover:bg-navy-50"
                >
                  Find an advocate
                </button>
              </div>
            )}
            {clientProfile.advocateLinks.map(link => {
              const meta = relLabel[link.relationship] || relLabel.retained;
              return (
                <button
                  key={link.advocateId}
                  type="button"
                  onClick={() => navigate('/cases')}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-navy-50/80 border border-gray-100 text-left transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-navy-700 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {link.name.replace('Adv. ', '').split(' ').pop()?.[0] ?? '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{link.name}</p>
                    <p className="text-[11px] text-gray-500 truncate">{link.court} · {link.city}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Since {formatDate(link.since)}</p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${meta.className}`}>
                    {meta.text}
                  </span>
                  <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
                </button>
              );
            })}
          </div>
        </Card>

        {nextHearing && (
          <Card className="border-l-4 border-l-navy-600 !rounded-l-none rounded-r-2xl shadow-sm" onClick={() => navigate(`/cases/${nextHearing.id}`)}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 bg-navy-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Calendar size={18} className="text-navy-700" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 font-semibold">Next hearing</p>
                  <p className="text-sm font-bold text-gray-900 truncate">{nextHearing.title}</p>
                  <p className="text-xs text-navy-700 font-medium mt-0.5">{formatDate(nextHearing.nextHearing)} · {nextHearing.court}</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400 flex-shrink-0" />
            </div>
          </Card>
        )}

        <Card
          className="border-navy-200 bg-gradient-to-r from-navy-900/5 to-teal-50/50 shadow-md"
          onClick={() => navigate('/cases/ecourts')}
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-navy-800 flex items-center justify-center flex-shrink-0">
              <Landmark size={22} className="text-gold-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-navy-900 uppercase tracking-wide">eCourts module</p>
              <p className="text-xs text-gray-600 mt-0.5">CNR lookup · search · live case data</p>
            </div>
            <ChevronRight size={18} className="text-navy-400 flex-shrink-0" />
          </div>
        </Card>

        <div>
          <h3 className="text-xs font-bold text-navy-900 uppercase tracking-wide mb-3">Quick actions</h3>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Cases', icon: Briefcase, path: '/cases', tone: 'bg-navy-100 text-navy-700' },
              { label: 'eCourts', icon: Landmark, path: '/cases/ecourts', tone: 'bg-navy-800 text-gold-400' },
              { label: 'Book', icon: CalendarDays, path: '/cases/book-appointment', tone: 'bg-amber-50 text-amber-700' },
              { label: 'Find', icon: Scale, path: '/cases/discover', tone: 'bg-gold-400/30 text-navy-900' },
            ].map(action => (
              <button
                key={action.label}
                type="button"
                onClick={() => navigate(action.path)}
                className="flex flex-col items-center gap-1.5 py-3 px-1.5 bg-white rounded-2xl shadow-sm border border-gray-100 active:scale-[0.97] transition-transform"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${action.tone}`}>
                  <action.icon size={18} />
                </div>
                <span className="text-[10px] font-semibold text-gray-700 text-center leading-tight">{action.label}</span>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-center text-gray-400 mt-2 px-2">
            My cases, open the <strong className="text-gray-600">eCourts</strong> hub, book time, or browse advocates.
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-navy-900 uppercase tracking-wide">Recent cases</h3>
            <button type="button" onClick={() => navigate('/cases')} className="text-xs text-navy-700 font-semibold">
              View all
            </button>
          </div>
          <div className="space-y-3">
            {cases.length === 0 && (
              <Card className="border-dashed border-navy-200 bg-navy-50/30">
                <p className="text-sm font-medium text-navy-900 text-center">No cases yet</p>
                <p className="text-[11px] text-gray-500 text-center mt-1">They will appear here once an advocate links you.</p>
                <button
                  type="button"
                  onClick={() => navigate('/cases/discover')}
                  className="mt-3 w-full text-xs font-semibold text-navy-700 py-2 rounded-lg bg-white border border-navy-200"
                >
                  Explore advocates
                </button>
              </Card>
            )}
            {cases.slice(0, 2).map(c => (
              <Card key={c.id} onClick={() => navigate(`/cases/${c.id}`)}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <StatusBadge status={c.status} />
                    </div>
                    <p className="text-sm font-bold text-gray-900 truncate">{c.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{c.court}</p>
                    <div className="flex items-center gap-1.5 mt-2 text-[11px] text-gray-400">
                      <FileText size={11} className="text-navy-500" />
                      <span className="text-navy-700 font-medium">{c.advocate}</span>
                      <span className="text-gray-300">·</span>
                      <span>Next {formatDate(c.nextHearing)}</span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-300 mt-1 flex-shrink-0" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
