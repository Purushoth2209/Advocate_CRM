import { useState } from 'react';
import {
  CalendarDays, Plus, ChevronLeft, ChevronRight, Clock,
  MapPin, User, Video, Phone, X, CheckCircle2, AlertTriangle,
  Settings, Inbox, List, LayoutGrid,
} from 'lucide-react';
import { mockClients, mockAvailability, mockAppointments as initialAppointments } from '../../data/mockData';
import { useCases } from '../../context/CasesContext';
import { STATUS_META, generateSlotsForDate, isLateCancel, formatTime12h } from '../../utils/slotGenerator';
import RequestQueue from './RequestQueue';
import AvailabilityManager from './AvailabilityManager';

const DAYS   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const TODAY  = '2026-04-07';

const typeIcon  = { 'in-person': User, 'video-call': Video, 'phone-call': Phone };
const typeColor = { 'in-person': 'bg-navy-100 text-navy-700', 'video-call': 'bg-blue-100 text-blue-700', 'phone-call': 'bg-green-100 text-green-700' };

function fmt12(t24) { return formatTime12h(t24); }

// ── New appointment modal ───────────────────────────────────────────────────
function NewAppointmentModal({ availability, appointments, onClose, onSave }) {
  const { cases } = useCases();
  const [form, setForm] = useState({
    clientId: '', caseId: '', date: '', timeStart: '', duration: '60',
    purpose: '', type: 'in-person', location: '', notes: '',
  });

  const slots = form.date
    ? generateSlotsForDate(form.date, availability, appointments)
    : [];
  const availableSlots = slots.filter(s => s.available);

  const clientCases = form.clientId ? cases.filter(c => c.clientId === form.clientId) : [];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.clientId || !form.date || !form.timeStart) return;
    const slot = slots.find(s => s.timeStart === form.timeStart);
    const now = new Date().toISOString();
    onSave({
      id: `apt-${Date.now()}`,
      ...form,
      duration: Number(form.duration),
      time: slot ? slot.time : fmt12(form.timeStart),
      advocateId: 'adv-001',
      status: 'confirmed',
      initiatedBy: 'advocate',
      cancellationReason: null,
      isLateCancel: false,
      rescheduleProposal: null,
      history: [
        { timestamp: now, action: 'created', by: 'advocate', note: 'Advocate initiated appointment' },
        { timestamp: now, action: 'confirmed', by: 'advocate', note: 'Auto-confirmed — advocate initiated' },
      ],
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Schedule Appointment</h3>
            <p className="text-xs text-gray-500 mt-0.5">Advocate-initiated appointments are auto-confirmed.</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg">
            <X size={16} className="text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="label">Client <span className="text-red-500">*</span></label>
            <select
              value={form.clientId}
              onChange={e => setForm({ ...form, clientId: e.target.value, caseId: '' })}
              className="input" required
            >
              <option value="">Select client...</option>
              {mockClients.filter(c => c.status === 'active').map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Related Case (optional)</label>
            <select value={form.caseId} onChange={e => setForm({ ...form, caseId: e.target.value })} className="input">
              <option value="">No specific case</option>
              {clientCases.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>

          <div>
            <label className="label">Date <span className="text-red-500">*</span></label>
            <input
              type="date" value={form.date} min={TODAY}
              onChange={e => { setForm({ ...form, date: e.target.value, timeStart: '' }); }}
              className="input" required
            />
          </div>

          {form.date && (
            <div>
              <label className="label">Select Time Slot <span className="text-red-500">*</span></label>
              {availableSlots.length === 0 ? (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-2">
                  <AlertTriangle size={14} /> No available slots on this date. Check blocked dates or existing bookings.
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {slots.map((slot, i) => (
                    <button
                      key={i} type="button"
                      disabled={!slot.available}
                      onClick={() => setForm({ ...form, timeStart: slot.timeStart })}
                      className={`px-2 py-2 rounded-lg text-xs font-medium border-2 transition-colors ${
                        form.timeStart === slot.timeStart
                          ? 'border-navy-600 bg-navy-600 text-white'
                          : slot.available
                          ? 'border-gray-200 hover:border-navy-400 text-gray-700'
                          : 'border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50'
                      }`}
                    >
                      {slot.time.replace(' AM','a').replace(' PM','p')}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Duration</label>
              <select value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} className="input">
                {[30,45,60,90,120].map(v => <option key={v} value={v}>{v} min</option>)}
              </select>
            </div>
            <div>
              <label className="label">Type</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="input">
                <option value="in-person">In-Person</option>
                <option value="video-call">Video Call</option>
                <option value="phone-call">Phone Call</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Purpose / Agenda <span className="text-red-500">*</span></label>
            <input type="text" value={form.purpose} onChange={e => setForm({...form, purpose: e.target.value})} className="input" placeholder="e.g. Pre-hearing briefing" required />
          </div>
          <div>
            <label className="label">Location / Link</label>
            <input type="text" value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="input" placeholder="Office Room 1, or Google Meet link..." />
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="input resize-none" rows={2} placeholder="Any notes for this appointment..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" className="btn-primary flex-1 justify-center">
              <CalendarDays size={15} /> Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Calendar day cell ───────────────────────────────────────────────────────
function CalendarDay({ day, dateStr, appts, availability, isToday, isSelected, isBlocked, onClick }) {
  const blockReason = availability?.blockedDates.find(b => b.date === dateStr)?.reason;
  return (
    <button
      onClick={onClick}
      title={blockReason || undefined}
      className={`relative min-h-12 rounded-lg p-1.5 flex flex-col items-center transition-colors text-sm
        ${isSelected  ? 'bg-navy-700 text-white'
        : isBlocked   ? 'bg-red-50 text-red-400 cursor-default'
        : isToday     ? 'bg-navy-50 text-navy-700 font-bold'
        : 'hover:bg-gray-50 text-gray-700'}
      `}
    >
      <span className="font-medium leading-none text-xs">{day}</span>
      {isBlocked && <div className={`w-1.5 h-1.5 rounded-full mt-1 ${isSelected ? 'bg-white' : 'bg-red-400'}`} />}
      {!isBlocked && appts.length > 0 && (
        <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
          {appts.slice(0, 3).map((a, i) => {
            const meta = STATUS_META[a.status];
            return <span key={i} className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : meta?.dot || 'bg-gray-300'}`} />;
          })}
        </div>
      )}
    </button>
  );
}

// ── Main Appointments page ──────────────────────────────────────────────────
export default function Appointments() {
  const { cases } = useCases();
  const [activeTab, setActiveTab]       = useState('calendar');
  const [viewDate, setViewDate]         = useState({ year: 2026, month: 3 });
  const [selectedDay, setSelectedDay]   = useState(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [appointments, setAppointments] = useState(() =>
    JSON.parse(JSON.stringify(initialAppointments))
  );
  const [availability, setAvailability] = useState(mockAvailability);

  const { year, month } = viewDate;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay    = new Date(year, month, 1).getDay();

  // Map appointments by date
  const apptsByDate = {};
  appointments.forEach(a => {
    if (!apptsByDate[a.date]) apptsByDate[a.date] = [];
    apptsByDate[a.date].push(a);
  });

  const selectedDateStr = selectedDay
    ? `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`
    : null;
  const selectedAppts = selectedDateStr ? (apptsByDate[selectedDateStr] || []) : [];
  const selectedSlots = selectedDateStr
    ? generateSlotsForDate(selectedDateStr, availability, appointments)
    : [];

  const prevMonth = () => setViewDate(v => v.month === 0 ? { year: v.year-1, month: 11 } : { ...v, month: v.month-1 });
  const nextMonth = () => setViewDate(v => v.month === 11 ? { year: v.year+1, month: 0 } : { ...v, month: v.month+1 });

  // ── State machine action handler ────────────────────────────────────────
  const handleAction = (id, action, payload = {}) => {
    const now = new Date().toISOString();
    setAppointments(prev => prev.map(a => {
      if (a.id !== id) return a;
      const historyEntry = (act, note = '') => ({ timestamp: now, action: act, by: 'advocate', note });
      switch (action) {
        case 'confirm':
          return { ...a, status: 'confirmed',
            history: [...a.history, historyEntry('confirmed')] };
        case 'decline':
          return { ...a, status: 'declined', cancellationReason: payload.reason,
            history: [...a.history, historyEntry('declined', payload.reason)] };
        case 'cancel':
          return { ...a, status: 'cancelled-advocate',
            cancellationReason: payload.reason,
            isLateCancel: isLateCancel(a.date, a.timeStart, availability.lateCancelHours),
            history: [...a.history, historyEntry('cancelled', payload.reason)] };
        case 'reschedule':
          return { ...a, status: 'reschedule-proposed',
            rescheduleProposal: {
              date: payload.date, timeStart: payload.timeStart, time: payload.time,
              proposedBy: 'advocate', proposedAt: now, reason: payload.reason,
            },
            history: [...a.history, historyEntry('reschedule-proposed', payload.reason)] };
        case 'reschedule-accept': {
          const p = a.rescheduleProposal;
          return { ...a, status: 'confirmed',
            date: p.date, timeStart: p.timeStart, time: p.time,
            rescheduleProposal: null,
            history: [...a.history, historyEntry('reschedule-accepted')] };
        }
        case 'reschedule-decline':
          return { ...a, status: 'confirmed', rescheduleProposal: null,
            history: [...a.history, historyEntry('reschedule-declined')] };
        case 'complete':
          return { ...a, status: 'completed',
            history: [...a.history, historyEntry('completed')] };
        case 'no-show':
          return { ...a, status: 'no-show',
            history: [...a.history, historyEntry('no-show', 'Client did not attend')] };
        default: return a;
      }
    }));
  };

  const handleAddAppointment = (newAppt) => {
    setAppointments(prev => [...prev, newAppt]);
    setShowNewModal(false);
  };

  const actionNeededCount = appointments.filter(a =>
    ['requested', 'reschedule-proposed'].includes(a.status)
  ).length;

  const TABS = [
    { id: 'calendar', label: 'Calendar',       icon: CalendarDays },
    { id: 'queue',    label: 'Request Queue',   icon: Inbox,    badge: actionNeededCount },
    { id: 'list',     label: 'All Appointments',icon: List },
    { id: 'avail',    label: 'Availability',    icon: Settings },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Appointments</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {appointments.filter(a => a.status === 'confirmed').length} confirmed ·{' '}
            {actionNeededCount > 0 && <span className="text-amber-600 font-medium">{actionNeededCount} awaiting action · </span>}
            {appointments.filter(a => a.status === 'completed').length} completed
          </p>
        </div>
        <button onClick={() => setShowNewModal(true)} className="btn-primary">
          <Plus size={16} /> Schedule Appointment
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-0">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-navy-700 text-navy-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={15} />
                {tab.label}
                {tab.badge > 0 && (
                  <span className="bg-amber-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── TAB: Calendar ─────────────────────────────────────────────────── */}
      {activeTab === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Calendar grid */}
          <div className="lg:col-span-2 card p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-gray-900">{MONTHS[month]} {year}</h3>
              <div className="flex gap-1">
                <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ChevronLeft size={16} className="text-gray-500" />
                </button>
                <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ChevronRight size={16} className="text-gray-500" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 mb-1">
              {DAYS.map(d => <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isBlocked = availability.blockedDates.some(b => b.date === dateStr);
                return (
                  <CalendarDay
                    key={day} day={day} dateStr={dateStr}
                    appts={apptsByDate[dateStr] || []}
                    availability={availability}
                    isToday={dateStr === TODAY}
                    isSelected={selectedDay === day && month === viewDate.month}
                    isBlocked={isBlocked}
                    onClick={() => setSelectedDay(selectedDay === day ? null : day)}
                  />
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-50 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs text-gray-500"><div className="w-2 h-2 rounded-full bg-green-500" /> Confirmed</div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500"><div className="w-2 h-2 rounded-full bg-amber-400" /> Requested</div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500"><div className="w-2 h-2 rounded-full bg-blue-400" /> Reschedule</div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500"><div className="w-2 h-2 rounded-full bg-red-400" /> Blocked</div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500"><div className="w-2 h-2 rounded-full bg-navy-600" /> Today</div>
            </div>
          </div>

          {/* Day detail sidebar */}
          <div className="card p-5">
            {selectedDay && selectedDateStr ? (
              <>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  {new Date(selectedDateStr + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                </h3>

                {/* Blocked notice */}
                {availability.blockedDates.find(b => b.date === selectedDateStr) && (
                  <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                    <AlertTriangle size={13} className="flex-shrink-0" />
                    <span><strong>Blocked:</strong> {availability.blockedDates.find(b => b.date === selectedDateStr)?.reason}</span>
                  </div>
                )}

                {/* Appointments on this day */}
                {selectedAppts.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Appointments</p>
                    <div className="space-y-2">
                      {selectedAppts.map(a => {
                        const client = mockClients.find(c => c.id === a.clientId);
                        const meta = STATUS_META[a.status];
                        const Icon = typeIcon[a.type] || User;
                        return (
                          <div key={a.id} className="p-2.5 bg-gray-50 rounded-xl">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`badge text-xs ${meta?.bg} ${meta?.text}`}>{meta?.label}</span>
                            </div>
                            <p className="text-xs font-semibold text-gray-900">{client?.name}</p>
                            <p className="text-xs text-gray-500">{a.purpose}</p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                              <Clock size={10} /> {a.time} · {a.duration}m
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Available slots */}
                {selectedSlots.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Available Slots ({selectedSlots.filter(s => s.available).length}/{selectedSlots.length})
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {selectedSlots.map((slot, i) => (
                        <button
                          key={i}
                          disabled={!slot.available}
                          onClick={() => {
                            setShowNewModal(true);
                          }}
                          className={`px-2 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                            slot.available
                              ? 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
                              : 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                          }`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedSlots.length === 0 && selectedAppts.length === 0 && !availability.blockedDates.find(b => b.date === selectedDateStr) && (
                  <div className="text-center py-8">
                    <CalendarDays size={28} className="text-gray-200 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">No working hours on this day</p>
                    <p className="text-xs text-gray-300 mt-1">Update availability in the Settings tab</p>
                  </div>
                )}
              </>
            ) : (
              <>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Upcoming Appointments</h3>
                <div className="space-y-2">
                  {appointments
                    .filter(a => a.date >= TODAY && ['confirmed', 'requested', 'reschedule-proposed'].includes(a.status))
                    .sort((a, b) => a.date.localeCompare(b.date))
                    .slice(0, 6)
                    .map(a => {
                      const client = mockClients.find(c => c.id === a.clientId);
                      const meta   = STATUS_META[a.status];
                      const Icon   = typeIcon[a.type] || User;
                      return (
                        <div key={a.id} className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-gray-50">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${typeColor[a.type]}`}>
                            <Icon size={14} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-900 truncate">{client?.name}</p>
                            <p className="text-xs text-gray-500 truncate">{a.purpose}</p>
                            <p className="text-xs text-gray-400">
                              {new Date(a.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {a.time}
                            </p>
                          </div>
                          <span className={`badge text-xs ${meta?.bg} ${meta?.text} flex-shrink-0`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-1 ${meta?.dot}`} />
                            {meta?.label}
                          </span>
                        </div>
                      );
                    })}
                  {appointments.filter(a => a.date >= TODAY).length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-4">No upcoming appointments.</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: Request Queue ─────────────────────────────────────────────── */}
      {activeTab === 'queue' && (
        <RequestQueue
          appointments={appointments}
          availability={availability}
          onAction={handleAction}
        />
      )}

      {/* ── TAB: All Appointments list ─────────────────────────────────────── */}
      {activeTab === 'list' && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">All Appointments</h3>
            <p className="text-xs text-gray-500">{appointments.length} total</p>
          </div>
          <div className="divide-y divide-gray-50">
            {appointments
              .sort((a, b) => b.date.localeCompare(a.date))
              .map(a => {
                const client   = mockClients.find(c => c.id === a.clientId);
                const caseItem = cases.find(c => c.id === a.caseId);
                const meta     = STATUS_META[a.status];
                const Icon     = typeIcon[a.type] || User;
                return (
                  <div key={a.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${typeColor[a.type]}`}>
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-gray-900">{client?.name}</p>
                        {caseItem && <span className="badge bg-gray-100 text-gray-600 text-xs">{caseItem.type}</span>}
                        {a.initiatedBy === 'client' && <span className="badge bg-purple-100 text-purple-700 text-xs">Client req.</span>}
                      </div>
                      <p className="text-xs text-gray-500 truncate">{a.purpose}</p>
                    </div>
                    <div className="text-right hidden md:block flex-shrink-0">
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(a.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {a.time}
                      </p>
                      <p className="text-xs text-gray-500">{a.duration} min · {a.location}</p>
                    </div>
                    <span className={`badge text-xs flex-shrink-0 ${meta?.bg} ${meta?.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${meta?.dot}`} />
                      {meta?.label}
                    </span>
                    {['requested', 'reschedule-proposed'].includes(a.status) && (
                      <button
                        onClick={() => setActiveTab('queue')}
                        className="text-xs text-amber-600 font-semibold hover:underline flex-shrink-0"
                      >
                        Act →
                      </button>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ── TAB: Availability ─────────────────────────────────────────────── */}
      {activeTab === 'avail' && (
        <AvailabilityManager
          availability={availability}
          onSave={(updated) => setAvailability(prev => ({ ...prev, ...updated }))}
        />
      )}

      {/* New appointment modal */}
      {showNewModal && (
        <NewAppointmentModal
          availability={availability}
          appointments={appointments}
          onClose={() => setShowNewModal(false)}
          onSave={handleAddAppointment}
        />
      )}
    </div>
  );
}
