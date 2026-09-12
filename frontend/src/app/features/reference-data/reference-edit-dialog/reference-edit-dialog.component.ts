import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { ReferenceChipPreview, ReferenceField, fieldValidators } from '../reference-data.model';

export interface ReferenceEditDialogData {
  title: string;
  fields: ReferenceField[];
  /** Existing row values (edit) or `null` (create). */
  value: Record<string, unknown> | null;
  /** See `ReferenceEntityConfig.preview`. */
  preview?: (value: Record<string, unknown>) => ReferenceChipPreview | null;
}

/**
 * Generic add/edit form for a reference-data row, built from a `ReferenceField[]` config
 * rather than one hand-written form per entity — the four reference tables (countries,
 * currencies, document types, UN/LOCODEs) only ever need text/number/select inputs.
 */
@Component({
  selector: 'app-reference-edit-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './reference-edit-dialog.component.html',
  styleUrl: './reference-edit-dialog.component.scss',
})
export class ReferenceEditDialogComponent {
  private readonly fb = inject(FormBuilder);
  readonly dialogRef =
    inject<MatDialogRef<ReferenceEditDialogComponent, Record<string, unknown> | undefined>>(
      MatDialogRef,
    );
  readonly data = inject<ReferenceEditDialogData>(MAT_DIALOG_DATA);

  readonly form: FormGroup = this.buildForm();

  private buildForm(): FormGroup {
    const controls: Record<string, unknown> = {};
    for (const field of this.data.fields) {
      const raw = this.data.value?.[field.key];
      const initial = field.type === 'select' ? (raw ?? null) : (raw ?? '');
      controls[field.key] = [initial, fieldValidators(field)];
    }
    return this.fb.group(controls);
  }

  onInput(field: ReferenceField, event: Event): void {
    if (!field.uppercase) {
      return;
    }
    const input = event.target as HTMLInputElement;
    const upper = input.value.toUpperCase();
    this.form.get(field.key)?.setValue(upper, { emitEvent: false });
    input.value = upper;
  }

  errorText(field: ReferenceField): string | null {
    const control = this.form.get(field.key);
    if (!control || !control.touched || control.valid) {
      return null;
    }
    if (control.hasError('required')) {
      return `${field.label} is required`;
    }
    if (control.hasError('minlength')) {
      return `${field.label} must be at least ${field.minLength} characters`;
    }
    if (control.hasError('maxlength')) {
      return `${field.label} must be ${field.maxLength} characters or fewer`;
    }
    if (control.hasError('min')) {
      return `${field.label} must be at least ${field.min}`;
    }
    if (control.hasError('max')) {
      return `${field.label} must be at most ${field.max}`;
    }
    if (control.hasError('pattern')) {
      return field.type === 'color' ? `${field.label} must be a hex colour, e.g. #1E88E5` : 'Invalid value';
    }
    return 'Invalid value';
  }

  pickColor(field: ReferenceField, event: Event): void {
    const input = event.target as HTMLInputElement;
    this.form.get(field.key)?.setValue(input.value.toUpperCase());
  }

  /** Read live off the form (not just on save) so the preview tracks in-progress edits,
   *  including invalid/partial ones — there is nothing to save yet either way. */
  preview(): ReferenceChipPreview | null {
    return this.data.preview ? this.data.preview(this.form.getRawValue()) : null;
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const payload: Record<string, unknown> = {};
    for (const field of this.data.fields) {
      const raw = value[field.key];
      if (field.type === 'number') {
        payload[field.key] = raw === '' || raw === null ? null : Number(raw);
      } else if (field.type === 'select') {
        payload[field.key] = raw ?? null;
      } else {
        const text = typeof raw === 'string' ? raw.trim() : raw;
        payload[field.key] = field.required ? text : text || null;
      }
    }
    this.dialogRef.close(payload);
  }

  cancel(): void {
    this.dialogRef.close(undefined);
  }
}
