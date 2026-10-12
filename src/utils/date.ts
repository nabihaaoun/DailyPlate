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

/**
 * Returns the 7 days of the week containing anchorDateStr (Monday through Sunday).
 */
export function getWeekDays(anchorDateStr: string): string[] {
  const d = parseDateString(anchorDateStr);
  const day = d.getDay(); // 0 is Sunday, 1 is Monday, ...
  // Calculate distance to previous Monday (0 for Mon, 6 for Sun)
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);

  const week: string[] = [];
  for (let i = 0; i < 7; i++) {
    const current = new Date(monday);
    current.setDate(monday.getDate() + i);
    week.push(formatDateString(current));
  }
  return week;
}

/**
 * Formats date as Month Year string (e.g., 'October 2026')
 */
export function formatMonthYear(dateStr: string): string {
  const d = parseDateString(dateStr);
  return d.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });
}

