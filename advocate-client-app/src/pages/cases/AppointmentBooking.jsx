import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar, CheckCircle, Link2, Scale, ChevronRight } from 'lucide-react';
import Header from '../../components/layout/Header';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useClientAppData } from '../../context/ClientExperienceContext';
import { mockAdvocates } from '../../data/mockData';
import { isClientPreviewEnabled } from '../../config/clientPreview';

const slots = ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'];
const days = [
  { date: '2026-04-08', label: 'Wed 8' },
  { date: '2026-04-09', label: 'Thu 9' },
  { date: '2026-04-10', label: 'Fri 10' },
  { date: '2026-04-13', label: 'Mon 13' },
  { date: '2026-04-14', label: 'Tue 14' },
];
const disabledSlots = { '2026-04-08': ['9:00 AM', '11:00 AM'], '2026-04-09': ['2:00 PM'] };

function advocateInitials(name) {
  return name
    .replace(/^Adv\.\s*/i, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();
}

function bookingSubtitle(link, adv) {
  if (adv?.specialization?.length) {
    return `${adv.specialization.slice(0, 2).join(' · ')} · ${link.city}`;
  }
  return `${link.court} · ${link.city}`;
}

function resolveBookingDisplay(advocateId, links) {
  const link = links.find(l => l.advocateId === advocateId);
  if (!link) return null;
  const adv = mockAdvocates.find(a => a.id === advocateId);
  return {
    name: link.name,
    initials: advocateInitials(link.name),
    subtitle: bookingSubtitle(link, adv),
  };
}

export default function AppointmentBooking() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clientProfile } = useClientAppData();
  const links = clientProfile.advocateLinks;

  const [selectedAdvocateId, setSelectedAdvocateId] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [note, setNote] = useState('');
  const [step, setStep] = useState(1);
  const [booked, setBooked] = useState(false);

  useEffect(() => {
    const q = searchParams.get('advocate');
    if (links.length === 0) {
      setSelectedAdvocateId(null);
      return;
    }
    if (links.length === 1) {
      setSelectedAdvocateId(links[0].advocateId);
      return;
    }
    if (q && links.some(l => l.advocateId === q)) {
      setSelectedAdvocateId(q);
      return;
    }
    setSelectedAdvocateId(prev =>
      prev && links.some(l => l.advocateId === prev) ? prev : null,
    );
  }, [links, searchParams]);

  const bookingAdvocate = useMemo(
    () => (selectedAdvocateId ? resolveBookingDisplay(selectedAdvocateId, links) : null),
    [selectedAdvocateId, links],
  );

  const handleBook = () => {
    setBooked(true);
    setTimeout(() => navigate('/cases'), 2000);
  };

  const resetSlotFlow = () => {
    setSelectedDay(null);
    setSelectedSlot(null);
    setNote('');
    setStep(1);
  };

  if (booked && bookingAdvocate) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 items-center justify-center px-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle size={32} className="text-green-500" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Appointment Requested!</h2>
        <p className="text-sm text-gray-500 text-center">
          Your appointment request has been sent to {bookingAdvocate.name}. You&apos;ll be notified once confirmed.
        </p>
        <div className="mt-6 bg-white border border-gray-100 rounded-2xl p-4 w-full max-w-xs text-center shadow-sm">
          <p className="text-xs text-gray-400">Appointment Details</p>
          <p className="text-base font-bold text-gray-900 mt-1">{days.find(d => d.date === selectedDay)?.label} April 2026</p>
          <p className="text-sm text-navy-700 font-medium">{selectedSlot}</p>
          <span className="inline-block mt-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Pending Confirmation</span>
        </div>
      </div>
    );
  }

  if (links.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
        <Header title="Book Appointment" showBack />
        <div className="px-4 py-6 space-y-4">
          <Card className="border-dashed border-navy-200 bg-navy-50/40">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-navy-100 flex items-center justify-center flex-shrink-0">
                <Link2 size={18} className="text-navy-700" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-navy-900">Link an advocate first</p>
                <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                  Booking opens once a lawyer has connected you in LexDesk (invite link, code, or accepted request). You can also start from the directory.
                </p>
              </div>
            </div>
          </Card>
          <Button fullWidth size="lg" onClick={() => navigate('/cases/discover')}>
            <Scale size={16} />
            Browse advocate directory
          </Button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full text-sm font-semibold text-navy-700 py-2"
          >
            Back to home
          </button>
        </div>
      </div>
    );
  }

  if (links.length > 1 && !selectedAdvocateId) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
        <Header title="Book Appointment" showBack />
        <div className="px-4 py-4 space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-0.5">
            Who are you booking with?
          </p>
          {links.map(link => {
            const adv = mockAdvocates.find(a => a.id === link.advocateId);
            const subtitle = bookingSubtitle(link, adv);
            return (
              <button
                key={link.advocateId}
                type="button"
                onClick={() => {
                  setSelectedAdvocateId(link.advocateId);
                  resetSlotFlow();
                }}
                className="w-full text-left"
              >
                <Card className="flex items-center gap-3 hover:border-navy-200 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-navy-100 flex items-center justify-center text-navy-700 font-bold text-sm flex-shrink-0">
                    {advocateInitials(link.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{link.name}</p>
                    <p className="text-xs text-gray-500 truncate">{subtitle}</p>
                  </div>
                  <ChevronRight size={18} className="text-gray-300 flex-shrink-0" />
                </Card>
              </button>
            );
          })}
          {isClientPreviewEnabled() && (
            <p className="text-[10px] text-gray-400 px-1 pt-2">
              Tip: <span className="font-mono">?advocate=adv-001</span> skips this step when deep-linking.
            </p>
          )}
        </div>
      </div>
    );
  }

  if (!bookingAdvocate) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      <Header title="Book Appointment" showBack />

      <div className="px-4 py-4 space-y-4">
        {links.length > 1 && (
          <button
            type="button"
            onClick={() => {
              setSelectedAdvocateId(null);
              resetSlotFlow();
            }}
            className="text-xs font-semibold text-navy-700"
          >
            Change advocate
          </button>
        )}

        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-navy-100 flex items-center justify-center text-navy-700 font-bold text-sm">
              {bookingAdvocate.initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{bookingAdvocate.name}</p>
              <p className="text-xs text-gray-500 truncate">{bookingAdvocate.subtitle}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? 'bg-navy-700 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
            <p className="text-sm font-semibold text-gray-800">Select Date</p>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {days.map(day => (
              <button
                key={day.date}
                onClick={() => { setSelectedDay(day.date); setSelectedSlot(null); setStep(2); }}
                className={`flex-shrink-0 w-14 py-3 rounded-xl border text-center transition-all ${
                  selectedDay === day.date
                    ? 'bg-navy-700 border-navy-700 text-white'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-navy-300'
                }`}
              >
                <p className="text-xs font-medium">{day.label.split(' ')[0]}</p>
                <p className="text-lg font-bold leading-tight">{day.label.split(' ')[1]}</p>
                <p className="text-[10px] mt-0.5 opacity-70">Apr</p>
              </button>
            ))}
          </div>
        </Card>

        {selectedDay && (
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 ? 'bg-navy-700 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
              <p className="text-sm font-semibold text-gray-800">Select Time Slot</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {slots.map(slot => {
                const isDisabled = (disabledSlots[selectedDay] || []).includes(slot);
                return (
                  <button
                    key={slot}
                    disabled={isDisabled}
                    onClick={() => { setSelectedSlot(slot); setStep(3); }}
                    className={`py-2.5 rounded-xl text-xs font-medium border transition-all ${
                      isDisabled
                        ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
                        : selectedSlot === slot
                          ? 'bg-navy-700 border-navy-700 text-white'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-navy-300'
                    }`}
                  >
                    {isDisabled ? 'Booked' : slot}
                  </button>
                );
              })}
            </div>
          </Card>
        )}

        {selectedSlot && (
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-full bg-navy-700 text-white flex items-center justify-center text-xs font-bold">3</div>
              <p className="text-sm font-semibold text-gray-800">Purpose (Optional)</p>
            </div>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Brief reason for appointment (e.g. Discuss final arguments strategy)..."
              rows={3}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-navy-500/30 focus:border-navy-600"
            />
          </Card>
        )}

        {selectedSlot && (
          <div className="space-y-3">
            <Card className="bg-navy-50 border-navy-100">
              <div className="flex items-center gap-3">
                <Calendar size={18} className="text-navy-700" />
                <div>
                  <p className="text-xs text-navy-700 font-medium">Selected Appointment</p>
                  <p className="text-sm font-bold text-navy-900">{days.find(d => d.date === selectedDay)?.label} April · {selectedSlot}</p>
                </div>
              </div>
            </Card>
            <Button fullWidth size="lg" onClick={handleBook}>
              <CheckCircle size={16} />
              Send Appointment Request
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
