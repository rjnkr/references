/**
 * Helpers for the API's date-only fields (`awardDate`, `completionDate`).
 *
 * Material's datepicker works with `Date`, the API speaks `YYYY-MM-DD`. Converting via
 * `toISOString()` would shift the day for anyone west of UTC, so the local calendar date
 * is formatted by hand.
 */

export function toDateOnlyString(value: Date | string | null | undefined): string | null {
  if (!value) {
    return null;
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function parseDateOnly(value: string | null | undefined): Date | null {
  if (!value) {
    return null;
  }
  // `YYYY-MM-DD` parsed by `new Date()` is treated as UTC midnight, which can render as
  // the previous day locally — build it as a local date instead.
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (match) {
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatFileSize(bytes: number | null | undefined): string {
  if (bytes == null) {
    return '';
  }
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} kB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
