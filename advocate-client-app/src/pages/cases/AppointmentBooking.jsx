import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, CheckCircle } from 'lucide-react';
import Header from '../../components/layout/Header';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const slots = ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'];
const days = [
  { date: '2026-04-08', label: 'Wed 8' },
  { date: '2026-04-09', label: 'Thu 9' },
  { date: '2026-04-10', label: 'Fri 10' },
  { date: '2026-04-13', label: 'Mon 13' },
  { date: '2026-04-14', label: 'Tue 14' },
];
const disabledSlots = { '2026-04-08': ['9:00 AM', '11:00 AM'], '2026-04-09': ['2:00 PM'] };

export default function AppointmentBooking() {
  const navigate = useNavigate();
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [note, setNote] = useState('');
  const [step, setStep] = useState(1);
  const [booked, setBooked] = useState(false);

  const handleBook = () => {
    setBooked(true);
    setTimeout(() => navigate('/cases'), 2000);
  };

  if (booked) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 items-center justify-center px-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle size={32} className="text-green-500" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Appointment Requested!</h2>
        <p className="text-sm text-gray-500 text-center">Your appointment request has been sent to Adv. Priya Sharma. You'll be notified once confirmed.</p>
        <div className="mt-6 bg-white border border-gray-100 rounded-2xl p-4 w-full max-w-xs text-center shadow-sm">
          <p className="text-xs text-gray-400">Appointment Details</p>
          <p className="text-base font-bold text-gray-900 mt-1">{days.find(d => d.date === selectedDay)?.label} April 2026</p>
          <p className="text-sm text-primary-600 font-medium">{selectedSlot}</p>
          <span className="inline-block mt-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Pending Confirmation</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      <Header title="Book Appointment" showBack />

      <div className="px-4 py-4 space-y-4">
        {/* Advocate Info */}
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-sm">PS</div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Adv. Priya Sharma</p>
              <p className="text-xs text-gray-500">Criminal & Property Law · Chennai</p>
            </div>
          </div>
        </Card>

        {/* Step 1: Select Date */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
            <p className="text-sm font-semibold text-gray-800">Select Date</p>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {days.map(day => (
              <button
                key={day.date}
                onClick={() => { setSelectedDay(day.date); setSelectedSlot(null); setStep(2); }}
                className={`flex-shrink-0 w-14 py-3 rounded-xl border text-center transition-all ${
                  selectedDay === day.date
                    ? 'bg-primary-600 border-primary-600 text-white'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-primary-300'
                }`}
              >
                <p className="text-xs font-medium">{day.label.split(' ')[0]}</p>
                <p className="text-lg font-bold leading-tight">{day.label.split(' ')[1]}</p>
                <p className="text-[10px] mt-0.5 opacity-70">Apr</p>
              </button>
            ))}
          </div>
        </Card>

        {/* Step 2: Select Slot */}
        {selectedDay && (
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
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
                          ? 'bg-primary-600 border-primary-600 text-white'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-primary-300'
                    }`}
                  >
                    {isDisabled ? 'Booked' : slot}
                  </button>
                );
              })}
            </div>
          </Card>
        )}

        {/* Step 3: Add Note */}
        {selectedSlot && (
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-bold">3</div>
              <p className="text-sm font-semibold text-gray-800">Purpose (Optional)</p>
            </div>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Brief reason for appointment (e.g. Discuss final arguments strategy)..."
              rows={3}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </Card>
        )}

        {/* Confirm */}
        {selectedSlot && (
          <div className="space-y-3">
            <Card className="bg-primary-50 border-primary-100">
              <div className="flex items-center gap-3">
                <Calendar size={18} className="text-primary-600" />
                <div>
                  <p className="text-xs text-primary-600 font-medium">Selected Appointment</p>
                  <p className="text-sm font-bold text-primary-900">{days.find(d => d.date === selectedDay)?.label} April · {selectedSlot}</p>
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
