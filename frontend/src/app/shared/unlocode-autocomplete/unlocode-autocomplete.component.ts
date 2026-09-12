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
import { debounceTime, distinctUntilChanged, filter, switchMap, tap } from 'rxjs';

import { LookupService } from '../../core/api/lookup.service';
import { UnLocode } from '../../core/models/lookup.models';

/**
 * UN/LOCODE picker backed by `GET /api/unlocodes?search=`.
 *
 * Implemented as a `ControlValueAccessor` so it can be dropped straight into the ports
 * `FormArray` — its value is the selected `UnLocode` object (or null), and the parent
 * form maps it to `unlocodeId` on save.
 */
@Component({
  selector: 'app-unlocode-autocomplete',
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
      useExisting: forwardRef(() => UnlocodeAutocompleteComponent),
      multi: true,
    },
  ],
  template: `
    <mat-form-field appearance="outline" class="unlocode-field">
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
        <mat-icon matSuffix>travel_explore</mat-icon>
      }
      <mat-autocomplete
        #auto="matAutocomplete"
        [displayWith]="display"
        (optionSelected)="onSelected($event.option.value)"
      >
        @for (option of options(); track option.id) {
          <mat-option [value]="option">
            <span class="unlocode-code">{{ option.code }}</span>
            <span class="unlocode-name">{{ option.name }}</span>
          </mat-option>
        }
        @if (!loading() && options().length === 0 && typedTerm().length >= 2) {
          <mat-option [disabled]="true">No UN/LOCODE matches “{{ typedTerm() }}”</mat-option>
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

      .unlocode-field {
        width: 100%;
      }

      .unlocode-code {
        display: inline-block;
        min-width: 62px;
        font-weight: 700;
        font-variant-numeric: tabular-nums;
        color: var(--tidalis-blue-dark);
      }

      .unlocode-name {
        color: var(--tidalis-text);
      }
    `,
  ],
})
export class UnlocodeAutocompleteComponent implements ControlValueAccessor {
  private readonly lookups = inject(LookupService);

  @Input() label = 'UN/LOCODE';
  @Input() placeholder = 'Search port or code…';
  /** Static hint shown below the field when the user isn't mid-search. */
  @Input() hint = '';

  protected readonly inner = new FormControl<string | UnLocode | null>(null);
  protected readonly options = signal<UnLocode[]>([]);
  protected readonly loading = signal(false);
  protected readonly typedTerm = signal('');

  private onChange: (value: UnLocode | null) => void = () => undefined;
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
          this.loading.set(term.trim().length >= 2);
          return this.lookups.searchUnlocodes(term);
        }),
      )
      .subscribe({
        next: (rows) => {
          this.options.set(rows);
          this.loading.set(false);
        },
        error: () => {
          this.options.set([]);
          this.loading.set(false);
        },
      });
  }

  protected readonly display = (value: UnLocode | string | null): string => {
    if (!value) {
      return '';
    }
    return typeof value === 'string' ? value : `${value.code} — ${value.name}`;
  };

  protected onSelected(value: UnLocode): void {
    this.typedTerm.set('');
    this.onChange(value);
  }

  protected onBlur(): void {
    this.onTouched();
  }

  /* --- ControlValueAccessor ------------------------------------------------------- */

  writeValue(value: UnLocode | null): void {
    this.inner.setValue(value ?? null, { emitEvent: false });
    this.typedTerm.set('');
  }

  registerOnChange(fn: (value: UnLocode | null) => void): void {
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
