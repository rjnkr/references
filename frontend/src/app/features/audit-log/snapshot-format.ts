/**
 * How to render one field of an audit snapshot (`beforeData`/`afterData`) in the
 * before/after comparison — a config list rather than a hand-written template per field.
 * Shared by `contract-snapshot-fields.ts` and `system-snapshot-fields.ts`.
 */
export interface SnapshotField {
  key: string;
  label: string;
  format: (value: unknown) => string;
}

export const text = (value: unknown): string =>
  value === null || value === undefined || value === '' ? '—' : String(value);

export const bool = (value: unknown): string => (value ? 'Yes' : 'No');

export const money = (value: unknown): string =>
  typeof value === 'number' ? value.toLocaleString() : text(value);

export const date = (value: unknown): string => {
  if (!value) {
    return '—';
  }
  const parsed = new Date(value as string);
  return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toLocaleDateString();
};

export const dateTime = (value: unknown): string => {
  if (!value) {
    return '—';
  }
  const parsed = new Date(value as string);
  return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toLocaleString();
};

export const relation = (labelKeys: string[]) => (value: unknown): string => {
  if (!value || typeof value !== 'object') {
    return '—';
  }
  const record = value as Record<string, unknown>;
  const parts = labelKeys.map((key) => record[key]).filter((part) => part !== undefined && part !== null);
  return parts.length > 0 ? parts.join(' — ') : '—';
};

export const namedList = (nameKey = 'name') => (value: unknown): string => {
  if (!Array.isArray(value) || value.length === 0) {
    return '—';
  }
  return value
    .map((item) => (item && typeof item === 'object' ? (item as Record<string, unknown>)[nameKey] : item))
    .filter((part) => part !== undefined && part !== null)
    .join(', ');
};
