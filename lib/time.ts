/** Minutes since midnight for a Date's local time. */
export function minutesOfDay(d: Date): number {
  return d.getHours() * 60 + d.getMinutes();
}

/** 12-hour display string, e.g. 615 -> "10:15 AM". */
export function formatMinutes(totalMinutes: number): string {
  const hour24 = Math.floor(totalMinutes / 60) % 24;
  const minute = totalMinutes % 60;
  const period = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}:${String(minute).padStart(2, '0')} ${period}`;
}

/**
 * Parse a legacy stored time string ("10:15 PM", "22:15", narrow-space
 * locale variants) to minutes since midnight. Null if unparseable.
 */
export function parseTimeString(s: string): number | null {
  const match = /(\d{1,2}):(\d{2})\s*([APap])?\.?[Mm]?\.?/.exec(s.trim());
  if (!match) return null;
  let hour = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);
  if (Number.isNaN(hour) || Number.isNaN(minute) || minute > 59) return null;
  const period = match[3]?.toLowerCase();
  if (period === 'p' && hour !== 12) hour += 12;
  if (period === 'a' && hour === 12) hour = 0;
  if (hour > 23) return null;
  return hour * 60 + minute;
}
