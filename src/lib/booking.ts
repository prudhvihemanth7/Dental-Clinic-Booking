import { addMinutes, format, isAfter, isBefore, isEqual, parse, set, startOfDay } from 'date-fns';
import { Appointment, BlockedDate, BusinessHours, ClinicSettings, Service } from '../types';

type GenerateSlotsParams = {
  date: Date;
  service: Service;
  businessHours: BusinessHours[];
  blockedDates: BlockedDate[];
  appointments: Appointment[];
  settings: ClinicSettings;
};

export type TimeSlot = {
  start: Date;
  end: Date;
  label: string;
};

export function generateAvailableSlots({
  date,
  service,
  businessHours,
  blockedDates,
  appointments,
  settings,
}: GenerateSlotsParams): TimeSlot[] {
  // 1. Check if date is blocked
  const dateStr = format(date, 'yyyy-MM-dd');
  const isBlocked = blockedDates.some(bd => bd.blocked_date === dateStr);
  if (isBlocked) return [];

  // 2. Get business hours for this day of week
  // date.getDay() returns 0 (Sunday) to 6 (Saturday)
  const dayOfWeek = date.getDay();
  const todayHours = businessHours.find(bh => bh.weekday === dayOfWeek);
  
  if (!todayHours || !todayHours.is_open) return [];

  // 3. Create start and end boundaries for the day
  const [startHour, startMinute] = todayHours.start_time.split(':').map(Number);
  const [endHour, endMinute] = todayHours.end_time.split(':').map(Number);

  const dayStart = set(date, { hours: startHour, minutes: startMinute, seconds: 0, milliseconds: 0 });
  const dayEnd = set(date, { hours: endHour, minutes: endMinute, seconds: 0, milliseconds: 0 });

  // 4. Generate all possible slots based on interval
  const slots: TimeSlot[] = [];
  let currentSlotStart = dayStart;
  const now = new Date();
  
  // Calculate earliest allowed booking time based on notice hours
  const earliestAllowed = addMinutes(now, (settings.booking_notice_hours || 0) * 60);

  while (isBefore(currentSlotStart, dayEnd)) {
    const currentSlotEnd = addMinutes(currentSlotStart, service.duration_minutes);

    // If this slot ends after business hours, don't include it
    if (isAfter(currentSlotEnd, dayEnd)) {
      break;
    }

    // Check notice hours (don't allow booking in the past or within notice period)
    if (isBefore(currentSlotStart, earliestAllowed)) {
      currentSlotStart = addMinutes(currentSlotStart, settings.slot_interval_minutes || 30);
      continue;
    }

    // 5. Check for overlapping appointments
    // overlap rule: new_start < existing_end AND new_end > existing_start
    const hasOverlap = appointments.some(app => {
      if (app.status === 'cancelled') return false;
      if (app.appointment_date !== dateStr) return false;

      const [appStartHour, appStartMinute] = app.start_time.split(':').map(Number);
      const [appEndHour, appEndMinute] = app.end_time.split(':').map(Number);
      
      const appStart = set(date, { hours: appStartHour, minutes: appStartMinute, seconds: 0, milliseconds: 0 });
      const appEnd = set(date, { hours: appEndHour, minutes: appEndMinute, seconds: 0, milliseconds: 0 });

      return isBefore(currentSlotStart, appEnd) && isAfter(currentSlotEnd, appStart);
    });

    if (!hasOverlap) {
      slots.push({
        start: currentSlotStart,
        end: currentSlotEnd,
        label: format(currentSlotStart, 'h:mm a')
      });
    }

    // Move to next slot based on interval
    currentSlotStart = addMinutes(currentSlotStart, settings.slot_interval_minutes || 30);
  }

  return slots;
}
