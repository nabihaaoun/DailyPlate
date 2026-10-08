/**
 * Utility functions for calendar dates in DailyPlate.
 * All dates are handled as 'YYYY-MM-DD' calendar day strings.
 */

export function getTodayDateString(): string {
  const now = new Date();
  return formatDateString(now);
}

export function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(dateStr: string, days: number): string {
  const d = parseDateString(dateStr);
  d.setDate(d.getDate() + days);
  return formatDateString(d);
}

export function formatDisplayDate(dateStr: string): string {
  const today = getTodayDateString();
  const tomorrow = addDays(today, 1);
  const yesterday = addDays(today, -1);

  if (dateStr === today) return 'Today';
  if (dateStr === tomorrow) return 'Tomorrow';
  if (dateStr === yesterday) return 'Yesterday';

  const d = parseDateString(dateStr);
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function formatFullDate(dateStr: string): string {
  const d = parseDateString(dateStr);
  return d.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function getDaysInMonth(year: number, month: number): string[] {
  // month: 1-12
  const days: string[] = [];
  const date = new Date(year, month - 1, 1);
  while (date.getMonth() === month - 1) {
    days.push(formatDateString(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}
