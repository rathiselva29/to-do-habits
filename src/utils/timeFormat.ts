/**
 * Helper utilities for 12-hour AM/PM time formatting and conversion.
 */

export function formatTimeTo12Hour(time24?: string): string {
  if (!time24) return '--:--';
  const parts = time24.split(':');
  if (parts.length < 2) return time24;

  let hour = parseInt(parts[0], 10);
  const minute = parts[1].padStart(2, '0');

  if (isNaN(hour)) return time24;

  const period = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  if (hour === 0) hour = 12;

  const hourStr = String(hour).padStart(2, '0');
  return `${hourStr}:${minute} ${period}`;
}

export function parse24HourTo12(time24?: string): { hour: number; minute: number; period: 'AM' | 'PM' } {
  if (!time24) return { hour: 8, minute: 0, period: 'AM' };
  const parts = time24.split(':');
  let hour = parseInt(parts[0], 10);
  let minute = parseInt(parts[1], 10);

  if (isNaN(hour)) hour = 8;
  if (isNaN(minute)) minute = 0;

  const period: 'AM' | 'PM' = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  if (hour === 0) hour = 12;

  return { hour, minute, period };
}

export function parse12HourTo24(hour: number, minute: number, period: 'AM' | 'PM'): string {
  let h = hour % 12;
  if (period === 'PM') {
    h += 12;
  }
  const hourStr = String(h).padStart(2, '0');
  const minuteStr = String(minute).padStart(2, '0');
  return `${hourStr}:${minuteStr}`;
}
