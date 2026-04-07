import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays, Plus, ChevronLeft, ChevronRight,
  Clock, MapPin, User, Video, Phone, CheckCircle2, X, Edit2,
} from 'lucide-react';
import { mockAppointments, mockClients, mockCases, mockAdvocates } from '../../data/mockData';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const typeIcon = { 'in-person': User, 'video-call': Video, 'phone-call': Phone };
const typeColor = { 'in-person': 'bg-navy-100 text-navy-700', 'video-call': 'bg-blue-100 text-blue-700', 'phone-call': 'bg-green-100 text-green-700' };
const statusColor = { confirmed: 'bg-green-100 text-green-700', pending: 'bg-amber-100 text-amber-700', cancelled: 'bg-red-100 text-red-600' };

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDay(year, month) {
  return new Date(year, month, 1).getDay();
}

export default function Appointments() {
  const today = new Date('2026-04-07');
  const [viewDate, setViewDate] = useState({ year: 2026, month: 3 }); // April 2026 (0-indexed)
  const [selectedDay, setSelectedDay] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newAppt, setNewAppt] = useState({
    clientId: '', caseId: '', date: '', time: '', duration: '60',
    purpose: '', type: 'in-person', location: '', notes: '',
  });

  const { year, month } = viewDate;
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDay(year, month);

  const apptsByDate = {};
  mockAppointments.forEach(a => {
    if (!apptsByDate[a.date]) apptsByDate[a.date] = [];
    apptsByDate[a.date].push(a);
  });

  const selectedDateStr = selectedDay
    ? `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`
    : null;
  const selectedAppts = selectedDateStr ? (apptsByDate[selectedDateStr] || []) : [];

  const allUpcoming = mockAppointments
    .filter(a => a.date >= '2026-04-07')
    .sort((a, b) => a.date.localeCompare(b.date));

  const prevMonth = () => setViewDate(v => {
    if (v.month === 0) return { year: v.year - 1, month: 11 };
    return { ...v, month: v.month - 1 };
  });
  const nextMonth = () => setViewDate(v => {
    if (v.month === 11) return { year: v.year + 1, month: 0 };
    return { ...v, month: v.month + 1 };
  });

  const handleAdd = (e) => {
    e.preventDefault();
    setShowModal(false);
    setNewAppt({ clientId: '', caseId: '', date: '', time: '', duration: '60', purpose: '', type: 'in-person', location: '', notes: '' });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Appointments</h2>
          <p className="text-sm text-gray-500 mt-0.5">{mockAppointments.length} total · {mockAppointments.filter(a => a.status === 'confirmed').length} confirmed</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus size={16} /> Schedule Appointment
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Calendar */}
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

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map(d => (
              <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayAppts = apptsByDate[dateStr] || [];
              const isToday = dateStr === '2026-04-07';
              const isSelected = selectedDay === day;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(isSelected ? null : day)}
                  className={`relative min-h-10 rounded-lg p-1.5 flex flex-col items-center transition-colors text-sm
                    ${isSelected ? 'bg-navy-700 text-white' : isToday ? 'bg-navy-50 text-navy-700 font-bold' : 'hover:bg-gray-50 text-gray-700'}
                  `}
                >
                  <span className="font-medium leading-none">{day}</span>
                  {dayAppts.length > 0 && (
                    <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                      {dayAppts.slice(0, 3).map((a, idx) => (
                        <span
                          key={idx}
                          className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : a.status === 'confirmed' ? 'bg-green-500' : 'bg-amber-400'}`}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-50">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <div className="w-2 h-2 rounded-full bg-green-500" /> Confirmed
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <div className="w-2 h-2 rounded-full bg-amber-400" /> Pending
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <div className="w-2 h-2 rounded-full bg-navy-600" /> Today
            </div>
          </div>
        </div>

        {/* Sidebar: selected day or upcoming */}
        <div className="card p-5">
          {selectedDay && selectedDateStr ? (
            <>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                {new Date(selectedDateStr).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h3>
              {selectedAppts.length === 0 && (
                <div className="text-center py-8">
                  <CalendarDays size={28} className="text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No appointments on this day</p>
                  <button onClick={() => { setNewAppt(n => ({...n, date: selectedDateStr})); setShowModal(true); }} className="btn-secondary text-xs mt-3">
                    <Plus size={13} /> Add appointment
                  </button>
                </div>
              )}
              {selectedAppts.map(a => {
                const client = mockClients.find(c => c.id === a.clientId);
                const IconComp = typeIcon[a.type] || User;
                return (
                  <div key={a.id} className="mb-3 p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`badge text-xs ${typeColor[a.type]}`}>
                        <IconComp size={11} className="mr-1" /> {a.type}
                      </span>
                      <span className={`badge text-xs ${statusColor[a.status]}`}>{a.status}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">{client?.name}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{a.purpose}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Clock size={11} /> {a.time} · {a.duration}m</span>
                      <span className="flex items-center gap-1"><MapPin size={11} /> {a.location}</span>
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Upcoming Appointments</h3>
              <div className="space-y-3">
                {allUpcoming.slice(0, 6).map(a => {
                  const client = mockClients.find(c => c.id === a.clientId);
                  const IconComp = typeIcon[a.type] || User;
                  return (
                    <div key={a.id} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${typeColor[a.type]}`}>
                        <IconComp size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 truncate">{client?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{a.purpose}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(a.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {a.time}
                        </p>
                      </div>
                      <span className={`badge text-xs ${statusColor[a.status]}`}>{a.status}</span>
                    </div>
                  );
                })}
                {allUpcoming.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">No upcoming appointments.</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* All appointments list */}
      <div className="card">
        <div className="px-5 py-4 border-b border-gray-50">
          <h3 className="text-sm font-semibold text-gray-900">All Appointments</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {mockAppointments.map(a => {
            const client = mockClients.find(c => c.id === a.clientId);
            const caseItem = mockCases.find(c => c.id === a.caseId);
            const advocate = mockAdvocates.find(adv => adv.id === a.advocateId);
            const IconComp = typeIcon[a.type] || User;
            return (
              <div key={a.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${typeColor[a.type]}`}>
                  <IconComp size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900">{client?.name}</p>
                    {caseItem && <span className="badge bg-gray-100 text-gray-600 text-xs">{caseItem.type}</span>}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{a.purpose}</p>
                  <p className="text-xs text-gray-400">{advocate?.name}</p>
                </div>
                <div className="text-right hidden md:block">
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(a.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {a.time}
                  </p>
                  <p className="text-xs text-gray-500">{a.duration} min · {a.location}</p>
                </div>
                <span className={`badge text-xs ${statusColor[a.status]}`}>{a.status}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Appointment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">Schedule Appointment</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X size={16} className="text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="px-6 py-5 space-y-4">
              <div>
                <label className="label">Client</label>
                <select value={newAppt.clientId} onChange={e => setNewAppt({...newAppt, clientId: e.target.value})} className="input" required>
                  <option value="">Select client...</option>
                  {mockClients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Related Case (optional)</label>
                <select value={newAppt.caseId} onChange={e => setNewAppt({...newAppt, caseId: e.target.value})} className="input">
                  <option value="">No specific case</option>
                  {mockCases.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Date</label>
                  <input type="date" value={newAppt.date} onChange={e => setNewAppt({...newAppt, date: e.target.value})} className="input" required />
                </div>
                <div>
                  <label className="label">Time</label>
                  <input type="time" value={newAppt.time} onChange={e => setNewAppt({...newAppt, time: e.target.value})} className="input" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Duration (minutes)</label>
                  <input type="number" value={newAppt.duration} onChange={e => setNewAppt({...newAppt, duration: e.target.value})} className="input" placeholder="60" />
                </div>
                <div>
                  <label className="label">Type</label>
                  <select value={newAppt.type} onChange={e => setNewAppt({...newAppt, type: e.target.value})} className="input">
                    <option value="in-person">In-Person</option>
                    <option value="video-call">Video Call</option>
                    <option value="phone-call">Phone Call</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Purpose / Agenda</label>
                <input type="text" value={newAppt.purpose} onChange={e => setNewAppt({...newAppt, purpose: e.target.value})} className="input" placeholder="e.g. Pre-hearing briefing" required />
              </div>
              <div>
                <label className="label">Location / Link</label>
                <input type="text" value={newAppt.location} onChange={e => setNewAppt({...newAppt, location: e.target.value})} className="input" placeholder="Office Room 1, or Google Meet link..." />
              </div>
              <div>
                <label className="label">Notes</label>
                <textarea value={newAppt.notes} onChange={e => setNewAppt({...newAppt, notes: e.target.value})} className="input resize-none" rows={2} placeholder="Any specific notes for this appointment..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
                <button type="submit" className="btn-primary flex-1 justify-center"><CalendarDays size={15} /> Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
