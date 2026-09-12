import { Component, Input, forwardRef, inject, signal } from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { debounceTime, distinctUntilChanged, filter, of, switchMap, tap } from 'rxjs';

import { SystemService } from '../../core/api/system.service';
import { SystemRef } from '../../core/models/project.models';

/**
 * System picker backed by `GET /api/systems?search=`, used to link a project to the
 * delivered system it relates to (`Project.systemId`).
 *
 * Implemented as a `ControlValueAccessor`, mirroring UnlocodeAutocompleteComponent — its
 * value is the selected system (or null), and the parent form maps it to `systemId` on
 * save.
 */
@Component({
  selector: 'app-system-autocomplete',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SystemAutocompleteComponent),
      multi: true,
    },
  ],
  template: `
    <mat-form-field appearance="outline" class="system-field">
      <mat-label>{{ label }}</mat-label>
      <input
        type="text"
        matInput
        [formControl]="inner"
        [matAutocomplete]="auto"
        [placeholder]="placeholder"
        (blur)="onBlur()"
      />
      @if (loading()) {
        <mat-spinner matSuffix diameter="18"></mat-spinner>
      } @else {
        <mat-icon matSuffix>link</mat-icon>
      }
      <mat-autocomplete
        #auto="matAutocomplete"
        [displayWith]="display"
        (optionSelected)="onSelected($event.option.value)"
      >
        @for (option of options(); track option.id) {
          <mat-option [value]="option">{{ option.name }}</mat-option>
        }
        @if (!loading() && options().length === 0 && typedTerm().length >= 2) {
          <mat-option [disabled]="true">No system matches “{{ typedTerm() }}”</mat-option>
        }
      </mat-autocomplete>
      @if (!loading() && typedTerm().length > 0 && typedTerm().length < 2) {
        <mat-hint>Type at least 2 characters</mat-hint>
      } @else if (hint) {
        <mat-hint>{{ hint }}</mat-hint>
      }
    </mat-form-field>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .system-field {
        width: 100%;
      }
    `,
  ],
})
export class SystemAutocompleteComponent implements ControlValueAccessor {
  private readonly api = inject(SystemService);

  @Input() label = 'System';
  @Input() placeholder = 'Search system name…';
  /** Static hint shown below the field when the user isn't mid-search. */
  @Input() hint = '';

  protected readonly inner = new FormControl<string | SystemRef | null>(null);
  protected readonly options = signal<SystemRef[]>([]);
  protected readonly loading = signal(false);
  protected readonly typedTerm = signal('');

  private onChange: (value: SystemRef | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  constructor() {
    this.inner.valueChanges
      .pipe(
        filter((value): value is string => typeof value === 'string'),
        tap((term) => {
          this.typedTerm.set(term);
          // A free-typed string is not a valid selection.
          this.onChange(null);
        }),
        debounceTime(250),
        distinctUntilChanged(),
        switchMap((term) => {
          const trimmed = term.trim();
          this.loading.set(trimmed.length >= 2);
          if (trimmed.length < 2) {
            return of({ data: [], total: 0 });
          }
          return this.api.list({ search: trimmed, pageSize: 10 });
        }),
      )
      .subscribe({
        next: (result) => {
          this.options.set(result.data.map((system) => ({ id: system.id, name: system.name })));
          this.loading.set(false);
        },
        error: () => {
          this.options.set([]);
          this.loading.set(false);
        },
      });
  }

  protected readonly display = (value: SystemRef | string | null): string => {
    if (!value) {
      return '';
    }
    return typeof value === 'string' ? value : value.name;
  };

  protected onSelected(value: SystemRef): void {
    this.typedTerm.set('');
    this.onChange(value);
  }

  protected onBlur(): void {
    this.onTouched();
  }

  /* --- ControlValueAccessor ------------------------------------------------------- */

  writeValue(value: SystemRef | null): void {
    this.inner.setValue(value ?? null, { emitEvent: false });
    this.typedTerm.set('');
  }

  registerOnChange(fn: (value: SystemRef | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.inner.disable({ emitEvent: false });
    } else {
      this.inner.enable({ emitEvent: false });
    }
  }
}
