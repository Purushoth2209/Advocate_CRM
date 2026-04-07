/**
 * Slot Generator
 * Converts advocate availability settings into a list of bookable time slots
 * for a given date, after subtracting buffer time and existing appointments.
 */

/**
 * Convert "HH:MM" string to total minutes from midnight.
 */
export function timeToMinutes(time) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Convert minutes from midnight back to "HH:MM" string.
 */
export function minutesToTime(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Format "HH:MM" (24h) to "hh:MM AM/PM" display string.
 */
export function formatTime12h(time24) {
  const [h, m] = time24.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${suffix}`;
}

/**
 * Check if a date string (YYYY-MM-DD) is blocked by the advocate.
 */
export function isDateBlocked(dateStr, blockedDates) {
  return blockedDates.some(b => b.date === dateStr);
}

/**
 * Get the block reason for a date, or null if not blocked.
 */
export function getBlockReason(dateStr, blockedDates) {
  const block = blockedDates.find(b => b.date === dateStr);
  return block ? block.reason : null;
}

/**
 * Generate all possible time slots for a given date based on availability.
 * Returns array of { timeStart: "HH:MM", time: "hh:MM AM/PM", available: bool, conflictReason?: string }
 *
 * @param {string} dateStr - "YYYY-MM-DD"
 * @param {object} availability - mockAvailability object
 * @param {Array}  existingAppointments - all appointments to check for conflicts
 */
export function generateSlotsForDate(dateStr, availability, existingAppointments = []) {
  const { weeklyHours, slotDuration, bufferTime, blockedDates } = availability;

  // 1. Check if date is blocked
  if (isDateBlocked(dateStr, blockedDates)) {
    return [];
  }

  // 2. Get day of week (0=Sun … 6=Sat)
  const dow = new Date(dateStr + 'T00:00:00').getDay();
  const workingWindows = weeklyHours[dow] || [];
  if (workingWindows.length === 0) return [];

  // 3. Gather occupied ranges from existing confirmed/requested appointments on this date
  const occupiedRanges = existingAppointments
    .filter(a =>
      a.date === dateStr &&
      ['confirmed', 'requested', 'reschedule-proposed'].includes(a.status)
    )
    .map(a => {
      const start = timeToMinutes(a.timeStart);
      return { start, end: start + a.duration };
    });

  // 4. Generate slots within each working window
  const slots = [];
  const stepSize = slotDuration + bufferTime;

  for (const window of workingWindows) {
    const winStart = timeToMinutes(window.start);
    const winEnd   = timeToMinutes(window.end);

    let cursor = winStart;
    while (cursor + slotDuration <= winEnd) {
      const slotEnd = cursor + slotDuration;

      // Check if this slot conflicts with any occupied range
      const conflict = occupiedRanges.find(
        r => cursor < r.end && slotEnd > r.start
      );

      slots.push({
        timeStart: minutesToTime(cursor),
        time: formatTime12h(minutesToTime(cursor)),
        timeEnd: minutesToTime(slotEnd),
        available: !conflict,
        conflictReason: conflict ? 'Already booked' : null,
      });

      cursor += stepSize;
    }
  }

  return slots;
}

/**
 * Generate available slots for the next N days starting from a date.
 * Returns { [dateStr]: slot[] }
 */
export function generateSlotsForRange(startDateStr, days, availability, existingAppointments) {
  const result = {};
  const start = new Date(startDateStr + 'T00:00:00');

  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const slots = generateSlotsForDate(dateStr, availability, existingAppointments);
    if (slots.length > 0) {
      result[dateStr] = slots;
    }
  }

  return result;
}

/**
 * Check if cancellation is within the late-cancel window.
 */
export function isLateCancel(appointmentDate, appointmentTimeStart, lateCancelHours) {
  const apptDateTime = new Date(`${appointmentDate}T${appointmentTimeStart}:00`);
  const now = new Date('2026-04-07T12:00:00'); // simulated "now"
  const diffHours = (apptDateTime - now) / (1000 * 60 * 60);
  return diffHours >= 0 && diffHours < lateCancelHours;
}

/**
 * Get a human-readable label for each appointment status.
 */
export const STATUS_META = {
  'requested':           { label: 'Pending Request',      bg: 'bg-amber-100',   text: 'text-amber-700',  dot: 'bg-amber-400' },
  'confirmed':           { label: 'Confirmed',             bg: 'bg-green-100',   text: 'text-green-700',  dot: 'bg-green-500' },
  'declined':            { label: 'Declined',              bg: 'bg-red-100',     text: 'text-red-600',    dot: 'bg-red-400' },
  'auto-declined':       { label: 'Auto-Declined',         bg: 'bg-red-50',      text: 'text-red-400',    dot: 'bg-red-300' },
  'reschedule-proposed': { label: 'Reschedule Proposed',   bg: 'bg-blue-100',    text: 'text-blue-700',   dot: 'bg-blue-400' },
  'cancelled-client':    { label: 'Cancelled by Client',   bg: 'bg-gray-100',    text: 'text-gray-500',   dot: 'bg-gray-300' },
  'cancelled-advocate':  { label: 'Cancelled by Advocate', bg: 'bg-gray-100',    text: 'text-gray-500',   dot: 'bg-gray-300' },
  'completed':           { label: 'Completed',             bg: 'bg-teal-100',    text: 'text-teal-700',   dot: 'bg-teal-400' },
  'no-show':             { label: 'No-Show',               bg: 'bg-orange-100',  text: 'text-orange-600', dot: 'bg-orange-400' },
};

export const ACTION_HISTORY_LABELS = {
  'created':             'Appointment created',
  'confirmed':           'Confirmed',
  'declined':            'Declined',
  'auto-declined':       'Auto-declined (no response)',
  'reschedule-proposed': 'Reschedule proposed',
  'reschedule-accepted': 'Reschedule accepted',
  'reschedule-declined': 'Reschedule declined',
  'cancelled':           'Cancelled',
  'completed':           'Marked as completed',
  'no-show':             'Marked as no-show',
};
