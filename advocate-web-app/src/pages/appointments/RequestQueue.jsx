import { useState } from 'react';
import {
  CheckCircle2, XCircle, RefreshCw, User, Video, Phone,
  Clock, MapPin, MessageSquare, AlertTriangle, Calendar,
  ChevronDown, ChevronUp, History,
} from 'lucide-react';
import { mockClients, mockCases } from '../../data/mockData';
import { STATUS_META, ACTION_HISTORY_LABELS, generateSlotsForDate, isLateCancel } from '../../utils/slotGenerator';

const typeIcon   = { 'in-person': User, 'video-call': Video, 'phone-call': Phone };
const typeColor  = { 'in-person': 'bg-navy-100 text-navy-700', 'video-call': 'bg-blue-100 text-blue-700', 'phone-call': 'bg-green-100 text-green-700' };

// ── Helper: confirm-before-action modal ─────────────────────────────────────
function ConfirmModal({ title, message, confirmLabel, confirmClass, onConfirm, onCancel, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="px-6 py-5 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          {message && <p className="text-sm text-gray-500 mt-1">{message}</p>}
        </div>
        <div className="px-6 py-5 space-y-4">
          {children}
          <div className="flex gap-3">
            <button onClick={onCancel} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button onClick={onConfirm} className={`flex-1 justify-center inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${confirmClass}`}>
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Appointment card ─────────────────────────────────────────────────────────
function AppointmentCard({ appt, availability, allAppointments, onAction, showHistory }) {
  const [expanded, setExpanded] = useState(false);
  const [modal, setModal] = useState(null); // 'decline' | 'cancel' | 'reschedule' | 'no-show'
  const [declineReason, setDeclineReason] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleSlot, setRescheduleSlot] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');

  const client   = mockClients.find(c => c.id === appt.clientId);
  const caseItem = mockCases.find(c => c.id === appt.caseId);
  const IconComp = typeIcon[appt.type] || User;
  const meta     = STATUS_META[appt.status] || STATUS_META['requested'];

  const lateCancel = availability
    ? isLateCancel(appt.date, appt.timeStart, availability.lateCancelHours)
    : false;

  // Slots for reschedule picker
  const rescheduleSlots = rescheduleDate
    ? generateSlotsForDate(rescheduleDate, availability,
        allAppointments.filter(a => a.id !== appt.id))
    : [];

  const daysUntil = Math.ceil(
    (new Date(appt.date + 'T00:00:00') - new Date('2026-04-07T00:00:00')) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className={`card overflow-hidden ${appt.status === 'requested' || appt.status === 'reschedule-proposed' ? 'ring-2 ring-amber-300' : ''}`}>
      {/* Main row */}
      <div className="flex items-start gap-4 p-4">
        {/* Type icon */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${typeColor[appt.type]}`}>
          <IconComp size={18} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-gray-900">{client?.name}</p>
                {caseItem && <span className="badge bg-gray-100 text-gray-600 text-xs">{caseItem.type}</span>}
                {appt.initiatedBy === 'client' && (
                  <span className="badge bg-purple-100 text-purple-700 text-xs">Client requested</span>
                )}
                {lateCancel && appt.status.startsWith('cancelled') && (
                  <span className="badge bg-red-100 text-red-600 text-xs">Late cancel</span>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-0.5">{appt.purpose}</p>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400 flex-wrap">
                <span className="flex items-center gap-1">
                  <Calendar size={11} />
                  {new Date(appt.date + 'T00:00:00').toLocaleDateString('en-IN', {
                    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
                  })}
                  {daysUntil === 0 && ' (Today)'}
                  {daysUntil === 1 && ' (Tomorrow)'}
                  {daysUntil > 1 && daysUntil <= 3 && ` (In ${daysUntil} days)`}
                </span>
                <span className="flex items-center gap-1"><Clock size={11} /> {appt.time} · {appt.duration} min</span>
                <span className="flex items-center gap-1"><MapPin size={11} /> {appt.location}</span>
              </div>

              {/* Reschedule proposal banner */}
              {appt.status === 'reschedule-proposed' && appt.rescheduleProposal && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg text-xs">
                  <p className="font-semibold text-blue-800">
                    Reschedule proposed by {appt.rescheduleProposal.proposedBy === 'advocate' ? 'you' : 'client'}:
                  </p>
                  <p className="text-blue-700 mt-0.5">
                    {new Date(appt.rescheduleProposal.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                    {' at '}{appt.rescheduleProposal.time}
                    {appt.rescheduleProposal.reason && ` · "${appt.rescheduleProposal.reason}"`}
                  </p>
                </div>
              )}
            </div>

            {/* Status badge */}
            <span className={`badge text-xs flex-shrink-0 ${meta.bg} ${meta.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${meta.dot}`} />
              {meta.label}
            </span>
          </div>
        </div>
      </div>

      {/* Action buttons based on state */}
      {(appt.status === 'requested' || appt.status === 'reschedule-proposed') && (
        <div className={`px-4 py-3 border-t flex flex-wrap gap-2 ${appt.status === 'requested' ? 'bg-amber-50 border-amber-100' : 'bg-blue-50 border-blue-100'}`}>
          {appt.status === 'requested' ? (
            <>
              <p className="text-xs text-amber-700 font-medium w-full mb-1">
                Action required — respond to this request:
              </p>
              <button onClick={() => onAction(appt.id, 'confirm')} className="btn-primary text-xs py-1.5 px-3 bg-green-600 hover:bg-green-700">
                <CheckCircle2 size={13} /> Accept
              </button>
              <button onClick={() => setModal('decline')} className="btn-secondary text-xs py-1.5 px-3 text-red-600 border-red-200 hover:bg-red-50">
                <XCircle size={13} /> Decline
              </button>
              <button onClick={() => setModal('reschedule')} className="btn-secondary text-xs py-1.5 px-3">
                <RefreshCw size={13} /> Propose New Time
              </button>
            </>
          ) : (
            <>
              <p className="text-xs text-blue-700 font-medium w-full mb-1">
                Waiting for client to respond to your reschedule proposal:
              </p>
              <button onClick={() => onAction(appt.id, 'reschedule-accept')} className="btn-primary text-xs py-1.5 px-3 bg-green-600 hover:bg-green-700">
                <CheckCircle2 size={13} /> Accept New Time
              </button>
              <button onClick={() => onAction(appt.id, 'reschedule-decline')} className="btn-secondary text-xs py-1.5 px-3 text-red-600 border-red-200 hover:bg-red-50">
                <XCircle size={13} /> Decline Reschedule
              </button>
            </>
          )}
        </div>
      )}

      {appt.status === 'confirmed' && (
        <div className="px-4 py-3 border-t border-gray-50 flex flex-wrap gap-2 bg-gray-50">
          <button onClick={() => onAction(appt.id, 'complete')} className="btn-secondary text-xs py-1.5 px-3 text-teal-700 border-teal-200 hover:bg-teal-50">
            <CheckCircle2 size={13} /> Mark Complete
          </button>
          <button onClick={() => setModal('reschedule')} className="btn-secondary text-xs py-1.5 px-3">
            <RefreshCw size={13} /> Reschedule
          </button>
          <button onClick={() => setModal('cancel')} className="btn-secondary text-xs py-1.5 px-3 text-red-600 border-red-200 hover:bg-red-50">
            <XCircle size={13} /> Cancel
          </button>
          <button onClick={() => setModal('no-show')} className="btn-secondary text-xs py-1.5 px-3 text-orange-600 border-orange-200 hover:bg-orange-50">
            <AlertTriangle size={13} /> No-Show
          </button>
        </div>
      )}

      {/* History toggle */}
      {showHistory && appt.history?.length > 0 && (
        <div className="border-t border-gray-50">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center gap-2 px-4 py-2 text-xs text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <History size={12} />
            <span>Audit history ({appt.history.length} events)</span>
            {expanded ? <ChevronUp size={12} className="ml-auto" /> : <ChevronDown size={12} className="ml-auto" />}
          </button>
          {expanded && (
            <div className="px-4 pb-3 space-y-1.5">
              {appt.history.map((h, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-gray-500">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-gray-700">{ACTION_HISTORY_LABELS[h.action] || h.action}</span>
                    <span className="text-gray-400"> by {h.by}</span>
                    {h.note && <span className="text-gray-400"> — "{h.note}"</span>}
                    <span className="block text-gray-400">
                      {new Date(h.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Modals ─────────────────────────────────────────────────────── */}

      {/* Decline modal */}
      {modal === 'decline' && (
        <ConfirmModal
          title="Decline Appointment Request"
          confirmLabel={<><XCircle size={14} /> Decline Request</>}
          confirmClass="bg-red-600 hover:bg-red-700 text-white"
          onCancel={() => setModal(null)}
          onConfirm={() => { onAction(appt.id, 'decline', { reason: declineReason }); setModal(null); }}
        >
          <p className="text-sm text-gray-600">
            Declining will release this slot and notify <strong>{client?.name}</strong>.
          </p>
          <div>
            <label className="label">Reason (sent to client)</label>
            <input
              type="text"
              value={declineReason}
              onChange={e => setDeclineReason(e.target.value)}
              placeholder="e.g. Slot unavailable, court hearing conflict..."
              className="input"
              autoFocus
            />
          </div>
        </ConfirmModal>
      )}

      {/* Cancel modal */}
      {modal === 'cancel' && (
        <ConfirmModal
          title="Cancel Appointment"
          confirmLabel={<><XCircle size={14} /> Cancel Appointment</>}
          confirmClass="bg-red-600 hover:bg-red-700 text-white"
          onCancel={() => setModal(null)}
          onConfirm={() => { onAction(appt.id, 'cancel', { reason: cancelReason }); setModal(null); }}
        >
          {lateCancel && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
              <AlertTriangle size={14} className="flex-shrink-0" />
              This is within the {availability?.lateCancelHours}h late-cancellation window and will be flagged.
            </div>
          )}
          <div>
            <label className="label">Cancellation Reason <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
              placeholder="Reason for cancellation..."
              className="input"
              required autoFocus
            />
          </div>
        </ConfirmModal>
      )}

      {/* Reschedule modal */}
      {modal === 'reschedule' && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">Propose New Time</h3>
              <p className="text-sm text-gray-500 mt-1">
                Select a new date and slot. <strong>{client?.name}</strong> will be notified to accept or decline.
              </p>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="label">New Date</label>
                <input
                  type="date"
                  value={rescheduleDate}
                  min="2026-04-07"
                  onChange={e => { setRescheduleDate(e.target.value); setRescheduleSlot(''); }}
                  className="input"
                />
              </div>
              {rescheduleDate && (
                <div>
                  <label className="label">Available Slots</label>
                  {rescheduleSlots.filter(s => s.available).length === 0 ? (
                    <p className="text-sm text-gray-500 p-3 bg-gray-50 rounded-lg text-center">
                      No available slots on this date.
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {rescheduleSlots.map((slot, i) => (
                        <button
                          key={i}
                          disabled={!slot.available}
                          onClick={() => setRescheduleSlot(slot.timeStart)}
                          className={`px-3 py-2 rounded-lg text-xs font-medium border-2 transition-colors ${
                            rescheduleSlot === slot.timeStart
                              ? 'border-navy-600 bg-navy-600 text-white'
                              : slot.available
                              ? 'border-gray-200 hover:border-navy-400 text-gray-700'
                              : 'border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50'
                          }`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <div>
                <label className="label">Reason for Reschedule</label>
                <input
                  type="text"
                  value={rescheduleReason}
                  onChange={e => setRescheduleReason(e.target.value)}
                  placeholder="e.g. Court hearing conflict on original date..."
                  className="input"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setModal(null)} className="btn-secondary flex-1 justify-center">Cancel</button>
                <button
                  disabled={!rescheduleDate || !rescheduleSlot}
                  onClick={() => {
                    const slot = rescheduleSlots.find(s => s.timeStart === rescheduleSlot);
                    onAction(appt.id, 'reschedule', {
                      date: rescheduleDate,
                      timeStart: rescheduleSlot,
                      time: slot?.time || '',
                      reason: rescheduleReason,
                    });
                    setModal(null);
                  }}
                  className="btn-primary flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw size={14} /> Propose
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No-show modal */}
      {modal === 'no-show' && (
        <ConfirmModal
          title="Mark as No-Show"
          message="This will be recorded on the client's profile."
          confirmLabel={<><AlertTriangle size={14} /> Mark No-Show</>}
          confirmClass="bg-orange-500 hover:bg-orange-600 text-white"
          onCancel={() => setModal(null)}
          onConfirm={() => { onAction(appt.id, 'no-show'); setModal(null); }}
        />
      )}
    </div>
  );
}

// ── Request Queue ────────────────────────────────────────────────────────────
export default function RequestQueue({ appointments, availability, onAction }) {
  const [filter, setFilter] = useState('action-needed');

  const filterOptions = [
    { value: 'action-needed', label: 'Action Needed', count: appointments.filter(a => ['requested', 'reschedule-proposed'].includes(a.status)).length },
    { value: 'confirmed',     label: 'Confirmed',     count: appointments.filter(a => a.status === 'confirmed').length },
    { value: 'completed',     label: 'History',        count: appointments.filter(a => ['completed', 'no-show', 'cancelled-client', 'cancelled-advocate', 'declined', 'auto-declined'].includes(a.status)).length },
    { value: 'all',           label: 'All',            count: appointments.length },
  ];

  const filtered = appointments.filter(a => {
    if (filter === 'action-needed') return ['requested', 'reschedule-proposed'].includes(a.status);
    if (filter === 'confirmed')     return a.status === 'confirmed';
    if (filter === 'completed')     return ['completed', 'no-show', 'cancelled-client', 'cancelled-advocate', 'declined', 'auto-declined'].includes(a.status);
    return true;
  }).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        {filterOptions.map(opt => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === opt.value ? 'bg-white text-navy-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {opt.label}
            {opt.count > 0 && (
              <span className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${
                filter === opt.value
                  ? opt.value === 'action-needed' ? 'bg-amber-100 text-amber-700' : 'bg-navy-100 text-navy-700'
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {opt.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 card">
          <CheckCircle2 size={32} className="text-green-400 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-700">All clear</p>
          <p className="text-xs text-gray-400 mt-1">No appointments in this category</p>
        </div>
      )}

      {filtered.map(appt => (
        <AppointmentCard
          key={appt.id}
          appt={appt}
          availability={availability}
          allAppointments={appointments}
          onAction={onAction}
          showHistory={filter === 'completed' || filter === 'all'}
        />
      ))}
    </div>
  );
}
