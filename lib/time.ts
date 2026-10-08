/**
 * 12-hour clock helpers — the whole site displays times as "9:00 AM".
 * Times are stored as 24-hour "HH:mm" strings.
 */

export function formatTime12(value?: string | null): string {
  if (!value) return '';
  const match = /^(\d{1,2}):(\d{2})/.exec(value.trim());
  if (!match) return value;
  const h = Number(match[1]);
  const m = match[2];
  if (h > 23) return value;
  return `${h % 12 === 0 ? 12 : h % 12}:${m} ${h < 12 ? 'AM' : 'PM'}`;
}

/** "2026-10-09" → "Fri, 9 Oct 2026" */
export function formatDateLong(value?: string | null): string {
  if (!value) return '';
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return value;
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
