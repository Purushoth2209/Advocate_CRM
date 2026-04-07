import { useState } from 'react';
import {
  Clock, Plus, Trash2, Save, AlertCircle, CheckCircle2,
  Calendar, Settings, Info,
} from 'lucide-react';
import { generateSlotsForDate, formatTime12h } from '../../utils/slotGenerator';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const TODAY = '2026-04-07';

export default function AvailabilityManager({ availability, onSave }) {
  const [config, setConfig] = useState({
    slotDuration: availability.slotDuration,
    bufferTime: availability.bufferTime,
    lateCancelHours: availability.lateCancelHours,
    autoDeclineHours: availability.autoDeclineHours,
    weeklyHours: JSON.parse(JSON.stringify(availability.weeklyHours)),
    blockedDates: [...availability.blockedDates],
  });
  const [newBlock, setNewBlock] = useState({ date: '', reason: '' });
  const [previewDay, setPreviewDay] = useState(1);
  const [saved, setSaved] = useState(false);

  // ── Weekly hours handlers ──────────────────────────────────────────────
  const toggleDay = (dow) => {
    setConfig(prev => {
      const updated = { ...prev, weeklyHours: { ...prev.weeklyHours } };
      if (updated.weeklyHours[dow].length > 0) {
        updated.weeklyHours[dow] = [];
      } else {
        updated.weeklyHours[dow] = [{ start: '10:00', end: '13:00' }];
      }
      return updated;
    });
  };

  const addWindow = (dow) => {
    setConfig(prev => ({
      ...prev,
      weeklyHours: {
        ...prev.weeklyHours,
        [dow]: [...prev.weeklyHours[dow], { start: '14:00', end: '17:00' }],
      },
    }));
  };

  const removeWindow = (dow, idx) => {
    setConfig(prev => ({
      ...prev,
      weeklyHours: {
        ...prev.weeklyHours,
        [dow]: prev.weeklyHours[dow].filter((_, i) => i !== idx),
      },
    }));
  };

  const updateWindow = (dow, idx, field, value) => {
    setConfig(prev => {
      const wins = [...prev.weeklyHours[dow]];
      wins[idx] = { ...wins[idx], [field]: value };
      return { ...prev, weeklyHours: { ...prev.weeklyHours, [dow]: wins } };
    });
  };

  // ── Blocked dates handlers ─────────────────────────────────────────────
  const addBlockedDate = (e) => {
    e.preventDefault();
    if (!newBlock.date) return;
    setConfig(prev => ({
      ...prev,
      blockedDates: [
        ...prev.blockedDates,
        { id: `blk-${Date.now()}`, date: newBlock.date, reason: newBlock.reason || 'Blocked' },
      ],
    }));
    setNewBlock({ date: '', reason: '' });
  };

  const removeBlockedDate = (id) => {
    setConfig(prev => ({
      ...prev,
      blockedDates: prev.blockedDates.filter(b => b.id !== id),
    }));
  };

  const handleSave = () => {
    onSave(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  // ── Preview: generate slots for the selected weekday ──────────────────
  // Find next occurrence of previewDay from today
  const getNextOccurrence = (dow) => {
    const base = new Date(TODAY + 'T00:00:00');
    for (let i = 0; i < 7; i++) {
      const d = new Date(base);
      d.setDate(d.getDate() + i);
      if (d.getDay() === dow) return d.toISOString().split('T')[0];
    }
    return TODAY;
  };

  const previewDateStr = getNextOccurrence(previewDay);
  const previewSlots = generateSlotsForDate(previewDateStr, { ...availability, ...config }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Availability Settings</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure your working hours, slot duration, buffer time, and blocked dates.
          </p>
        </div>
        <button onClick={handleSave} className={`btn-primary gap-2 ${saved ? 'bg-green-600 hover:bg-green-700' : ''}`}>
          {saved ? <CheckCircle2 size={15} /> : <Save size={15} />}
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Slot Configuration */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Settings size={16} className="text-navy-700" />
          <h4 className="text-sm font-semibold text-gray-900">Slot Configuration</h4>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="label">Slot Duration (min)</label>
            <select
              value={config.slotDuration}
              onChange={e => setConfig(p => ({ ...p, slotDuration: Number(e.target.value) }))}
              className="input"
            >
              {[30, 45, 60, 90, 120].map(v => <option key={v} value={v}>{v} min</option>)}
            </select>
            <p className="text-xs text-gray-400 mt-1">Length of each appointment</p>
          </div>
          <div>
            <label className="label">Buffer Between Slots (min)</label>
            <select
              value={config.bufferTime}
              onChange={e => setConfig(p => ({ ...p, bufferTime: Number(e.target.value) }))}
              className="input"
            >
              {[0, 10, 15, 20, 30].map(v => <option key={v} value={v}>{v} min</option>)}
            </select>
            <p className="text-xs text-gray-400 mt-1">Gap between back-to-back slots</p>
          </div>
          <div>
            <label className="label">Late Cancel Window (hrs)</label>
            <select
              value={config.lateCancelHours}
              onChange={e => setConfig(p => ({ ...p, lateCancelHours: Number(e.target.value) }))}
              className="input"
            >
              {[2, 6, 12, 24, 48].map(v => <option key={v} value={v}>{v}h before appt</option>)}
            </select>
            <p className="text-xs text-gray-400 mt-1">Cancellation flagged as "late"</p>
          </div>
          <div>
            <label className="label">Auto-Decline After (hrs)</label>
            <select
              value={config.autoDeclineHours}
              onChange={e => setConfig(p => ({ ...p, autoDeclineHours: Number(e.target.value) }))}
              className="input"
            >
              {[6, 12, 24, 48].map(v => <option key={v} value={v}>{v}h after request</option>)}
            </select>
            <p className="text-xs text-gray-400 mt-1">Unresponded requests auto-declined</p>
          </div>
        </div>

        {/* Slot count preview */}
        <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-2 text-xs text-gray-500">
          <Info size={13} className="text-navy-500" />
          With a {config.slotDuration}-min slot and {config.bufferTime}-min buffer, a 3-hour window
          produces{' '}
          <strong className="text-gray-900">
            {Math.floor(180 / (config.slotDuration + config.bufferTime))} slots
          </strong>{' '}
          (e.g., 10:00–1:00 PM).
        </div>
      </div>

      {/* Two-column: weekly hours + preview */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Weekly Working Hours */}
        <div className="lg:col-span-3 card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={16} className="text-navy-700" />
            <h4 className="text-sm font-semibold text-gray-900">Weekly Working Hours</h4>
          </div>
          <div className="space-y-3">
            {[0, 1, 2, 3, 4, 5, 6].map(dow => {
              const isOpen = config.weeklyHours[dow].length > 0;
              return (
                <div key={dow} className={`rounded-xl border p-3 transition-colors ${isOpen ? 'border-navy-200 bg-navy-50' : 'border-gray-100 bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <div
                        onClick={() => toggleDay(dow)}
                        className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${isOpen ? 'bg-navy-600' : 'bg-gray-300'}`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${isOpen ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </div>
                      <span className={`text-sm font-semibold ${isOpen ? 'text-navy-800' : 'text-gray-400'}`}>
                        {DAY_NAMES[dow]}
                      </span>
                    </label>
                    {isOpen && (
                      <button
                        onClick={() => addWindow(dow)}
                        className="text-xs text-navy-600 hover:text-navy-800 flex items-center gap-1"
                      >
                        <Plus size={12} /> Add window
                      </button>
                    )}
                  </div>

                  {isOpen && config.weeklyHours[dow].map((win, idx) => (
                    <div key={idx} className="flex items-center gap-2 mt-2">
                      <input
                        type="time"
                        value={win.start}
                        onChange={e => updateWindow(dow, idx, 'start', e.target.value)}
                        className="input text-xs py-1.5 w-28"
                      />
                      <span className="text-xs text-gray-400">to</span>
                      <input
                        type="time"
                        value={win.end}
                        onChange={e => updateWindow(dow, idx, 'end', e.target.value)}
                        className="input text-xs py-1.5 w-28"
                      />
                      {config.weeklyHours[dow].length > 1 && (
                        <button onClick={() => removeWindow(dow, idx)} className="p-1.5 hover:bg-red-50 rounded text-gray-400 hover:text-red-500">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  ))}

                  {!isOpen && (
                    <p className="text-xs text-gray-400 ml-0.5">Closed — no appointments</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Preview panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Calendar size={16} className="text-navy-700" />
              <h4 className="text-sm font-semibold text-gray-900">Slot Preview</h4>
            </div>
            <div className="mb-3">
              <label className="label">Preview day</label>
              <select
                value={previewDay}
                onChange={e => setPreviewDay(Number(e.target.value))}
                className="input text-xs"
              >
                {[0,1,2,3,4,5,6].map(d => (
                  <option key={d} value={d}>{DAY_NAMES[d]}</option>
                ))}
              </select>
            </div>

            {previewSlots.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded-xl">
                <Clock size={24} className="text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No slots on {DAY_NAMES[previewDay]}</p>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {previewSlots.map((slot, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${
                      slot.available
                        ? 'bg-green-50 text-green-700 border border-green-100'
                        : 'bg-gray-100 text-gray-400 border border-gray-200'
                    }`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${slot.available ? 'bg-green-500' : 'bg-gray-300'}`} />
                    {slot.time} – {formatTime12h(slot.timeEnd)}
                    {!slot.available && <span className="ml-auto text-gray-400">Booked</span>}
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-gray-400 mt-3 text-center">
              {previewSlots.filter(s => s.available).length} of {previewSlots.length} slots available
            </p>
          </div>
        </div>
      </div>

      {/* Blocked Dates */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle size={16} className="text-orange-500" />
          <h4 className="text-sm font-semibold text-gray-900">Blocked Dates</h4>
          <span className="ml-auto text-xs text-gray-500">
            Clients cannot book on blocked dates. Existing confirmed appointments on these dates must be manually resolved.
          </span>
        </div>

        {/* Existing blocks */}
        <div className="space-y-2 mb-4">
          {config.blockedDates.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">No blocked dates.</p>
          )}
          {config.blockedDates
            .sort((a, b) => a.date.localeCompare(b.date))
            .map(block => (
              <div key={block.id} className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-100 rounded-xl">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertCircle size={15} className="text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(block.date + 'T00:00:00').toLocaleDateString('en-IN', {
                      weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </p>
                  <p className="text-xs text-gray-600">{block.reason}</p>
                </div>
                <button
                  onClick={() => removeBlockedDate(block.id)}
                  className="p-1.5 hover:bg-red-50 rounded text-gray-400 hover:text-red-500 flex-shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
        </div>

        {/* Add new blocked date */}
        <form onSubmit={addBlockedDate} className="flex gap-3 pt-3 border-t border-gray-100">
          <div className="flex-1">
            <label className="label">Date</label>
            <input
              type="date"
              value={newBlock.date}
              min={TODAY}
              onChange={e => setNewBlock(p => ({ ...p, date: e.target.value }))}
              className="input"
              required
            />
          </div>
          <div className="flex-[2]">
            <label className="label">Reason (optional)</label>
            <input
              type="text"
              value={newBlock.reason}
              onChange={e => setNewBlock(p => ({ ...p, reason: e.target.value }))}
              placeholder="e.g. Court Hearing, Holiday, Leave..."
              className="input"
            />
          </div>
          <div className="flex items-end">
            <button type="submit" className="btn-primary px-4">
              <Plus size={15} /> Block Date
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
