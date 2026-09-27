import { Validators } from '@angular/forms';

/** `#RRGGBB` - the same format the native `<input type="color">` swatch produces, so the
 *  text field and the swatch always stay in sync. */
const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

/** A single field in a reference entity's add/edit form. */
export interface ReferenceField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'checkboxes' | 'color';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  /** For `type: 'number'`. */
  min?: number;
  max?: number;
  /** Upper-cases the value as the user types — used for ISO/UN-LOCODE style codes. */
  uppercase?: boolean;
  placeholder?: string;
  hint?: string;
  /** For `type: 'select'` / `'checkboxes'` — evaluated lazily so options (e.g. countries) can load async. */
  options?: () => { value: number; label: string }[];
}

/** What a chip preview should look like — used both for a table column that renders one
 *  (see `ReferenceColumn.chip`) and for the add/edit dialog's live preview
 *  (`ReferenceEntityConfig.preview`). */
export interface ReferenceChipPreview {
  label: string;
  backgroundColor: string;
  textColor: string;
}

/** A column in a reference entity's table. */
export interface ReferenceColumn<T> {
  key: string;
  label: string;
  align?: 'start' | 'end';
  render: (row: T) => string;
  /** When set, the cell renders this coloured, rounded chip instead of `render`'s plain
   *  text — used by tags to preview how the tag will actually be displayed. Return `null`
   *  to fall back to `render` for a particular row (e.g. incomplete data). */
  chip?: (row: T) => ReferenceChipPreview | null;
}

/** Everything a single reference-data screen needs, in one place. */
export interface ReferenceEntityConfig<T extends { id: number }> {
  /** URL segment used both for the route (`/reference-data/:key`) and the API path. */
  key: string;
  title: string;
  icon: string;
  description: string;
  /** Used in confirm/snackbar copy, e.g. "country" / "UN/LOCODE". */
  singular: string;
  columns: ReferenceColumn<T>[];
  fields: ReferenceField[];
  /**
   * When set, the table requires a search term of at least this many characters before
   * loading anything — used for UN/LOCODEs, whose backing table can hold 100k+ rows and
   * must never be fetched in full by an admin screen.
   */
  searchMinLength?: number;
  emptyMessage: string;
  rowLabel: (row: T) => string;
  /** When set, the add/edit dialog shows a live chip preview above the form, rebuilt from
   *  the form's raw values on every change — used by tags to preview the colour scheme
   *  before saving. Return `null` while there isn't enough to show yet. */
  preview?: (value: Record<string, unknown>) => ReferenceChipPreview | null;
}

export function fieldValidators(field: ReferenceField) {
  const validators = [];
  if (field.required) {
    validators.push(Validators.required);
  }
  if (field.minLength) {
    validators.push(Validators.minLength(field.minLength));
  }
  if (field.maxLength) {
    validators.push(Validators.maxLength(field.maxLength));
  }
  if (field.type === 'number') {
    if (field.min !== undefined) {
      validators.push(Validators.min(field.min));
    }
    if (field.max !== undefined) {
      validators.push(Validators.max(field.max));
    }
  }
  if (field.type === 'color') {
    validators.push(Validators.pattern(HEX_COLOR_PATTERN));
  }
  return validators;
}
