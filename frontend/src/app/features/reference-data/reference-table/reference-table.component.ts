import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ReferenceCrudClient } from '../../../core/api/reference-crud.service';
import { LookupService } from '../../../core/api/lookup.service';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../../shared/confirm-dialog/confirm-dialog.component';
import {
  COUNTRY_CONFIG,
  CURRENCY_CONFIG,
  DOCUMENT_TYPE_CONFIG,
  MODULE_CONFIG,
  TAG_CONFIG,
  URL_TYPE_CONFIG,
  unlocodeConfig,
} from '../reference-data.configs';
import { ReferenceEntityConfig } from '../reference-data.model';
import {
  ReferenceEditDialogComponent,
  ReferenceEditDialogData,
} from '../reference-edit-dialog/reference-edit-dialog.component';

/** A reference-data row, loosely typed — the concrete shape lives in each entity's config. */
type Row = Record<string, unknown> & { id: number };

const LOOKUP_CACHE_KEYS: Record<
  string,
  'currencies' | 'countries' | 'documentTypes' | 'tags' | 'urlTypes' | 'modules'
> = {
  countries: 'countries',
  currencies: 'currencies',
  'document-types': 'documentTypes',
  tags: 'tags',
  'url-types': 'urlTypes',
  modules: 'modules',
};

/**
 * One generic table + add/edit/delete screen, reused for every reference-data entity.
 * Which entity it manages is driven entirely by the `:type` route param (see
 * `app.routes.ts`) resolved against the configs in `reference-data.configs.ts` — this
 * avoids four near-identical list screens for what are, structurally, four CRUD tables.
 */
@Component({
  selector: 'app-reference-table-page',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    MatTooltipModule,
  ],
  templateUrl: './reference-table.component.html',
  styleUrl: './reference-table.component.scss',
})
export class ReferenceTablePageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);
  private readonly dialog = inject(MatDialog);
  private readonly snackbar = inject(MatSnackBar);
  protected readonly lookups = inject(LookupService);

  private readonly base = environment.apiBaseUrl;
  private client: ReferenceCrudClient<Row> | null = null;

  protected readonly config = signal<ReferenceEntityConfig<Row> | null>(null);
  protected readonly rows = signal<Row[]>([]);
  protected readonly loading = signal(false);
  protected readonly loadError = signal<string | null>(null);
  protected readonly searchControl = new FormControl('', { nonNullable: true });

  constructor() {
    // Countries are needed both for the UN/LOCODE country dropdown and its table column.
    this.lookups.getCountries().subscribe({ error: () => undefined });

    this.route.paramMap.subscribe((params) => {
      const config = this.resolveConfig(params.get('type') ?? '');
      this.config.set(config);
      this.client = config ? new ReferenceCrudClient<Row>(this.http, this.base, config.key) : null;
      this.rows.set([]);
      this.loadError.set(null);
      this.searchControl.setValue('', { emitEvent: false });

      if (config && !config.searchMinLength) {
        this.load();
      }
    });

    this.searchControl.valueChanges.pipe(debounceTime(300), distinctUntilChanged()).subscribe(
      (term) => {
        if (this.config()?.searchMinLength) {
          this.load(term);
        }
      },
    );
  }

  private resolveConfig(type: string): ReferenceEntityConfig<Row> | null {
    switch (type) {
      case 'countries':
        return COUNTRY_CONFIG as unknown as ReferenceEntityConfig<Row>;
      case 'currencies':
        return CURRENCY_CONFIG as unknown as ReferenceEntityConfig<Row>;
      case 'document-types':
        return DOCUMENT_TYPE_CONFIG as unknown as ReferenceEntityConfig<Row>;
      case 'url-types':
        return URL_TYPE_CONFIG as unknown as ReferenceEntityConfig<Row>;
      case 'tags':
        return TAG_CONFIG as unknown as ReferenceEntityConfig<Row>;
      case 'modules':
        return MODULE_CONFIG as unknown as ReferenceEntityConfig<Row>;
      case 'unlocodes':
        return unlocodeConfig(this.lookups.countries) as unknown as ReferenceEntityConfig<Row>;
      default:
        return null;
    }
  }

  /* --- Loading --------------------------------------------------------------------- */

  load(search?: string): void {
    const config = this.config();
    if (!config || !this.client) {
      return;
    }

    const term = (search ?? '').trim();
    if (config.searchMinLength && term.length < config.searchMinLength) {
      this.rows.set([]);
      return;
    }

    this.loading.set(true);
    this.loadError.set(null);
    this.client.list(term || undefined).subscribe({
      next: (rows) => {
        this.rows.set(rows);
        this.loading.set(false);
      },
      error: () => {
        this.rows.set([]);
        this.loading.set(false);
        this.loadError.set(`Could not load ${config.title.toLowerCase()}.`);
      },
    });
  }

  /** Shown instead of the table's own "no rows" message while a search is still too short. */
  needsLongerSearch(): boolean {
    const config = this.config();
    const min = config?.searchMinLength;
    if (!min) {
      return false;
    }
    return this.searchControl.value.trim().length < min;
  }

  /* --- Add / edit -------------------------------------------------------------------- */

  add(): void {
    const config = this.config();
    if (!config) {
      return;
    }
    const data: ReferenceEditDialogData = {
      title: `Add ${config.singular}`,
      fields: config.fields,
      value: null,
      preview: config.preview,
    };
    this.dialog
      .open(ReferenceEditDialogComponent, { data, width: '480px', autoFocus: false })
      .afterClosed()
      .subscribe((payload) => {
        if (!payload || !this.client) {
          return;
        }
        this.client.create(payload).subscribe({
          next: () => {
            this.snackbar.open(`${capitalize(config.singular)} created.`, 'Dismiss', {
              duration: 4000,
              panelClass: 'tidalis-snackbar-success',
            });
            this.invalidateLookupCache();
            this.load(this.searchControl.value);
          },
          error: (error: unknown) => this.showError(error),
        });
      });
  }

  edit(row: Row): void {
    const config = this.config();
    if (!config) {
      return;
    }
    const data: ReferenceEditDialogData = {
      title: `Edit ${config.singular}`,
      fields: config.fields,
      value: row,
      preview: config.preview,
    };
    this.dialog
      .open(ReferenceEditDialogComponent, { data, width: '480px', autoFocus: false })
      .afterClosed()
      .subscribe((payload) => {
        if (!payload || !this.client) {
          return;
        }
        this.client.update(row.id, payload).subscribe({
          next: () => {
            this.snackbar.open(`${capitalize(config.singular)} saved.`, 'Dismiss', {
              duration: 4000,
              panelClass: 'tidalis-snackbar-success',
            });
            this.invalidateLookupCache();
            this.load(this.searchControl.value);
          },
          error: (error: unknown) => this.showError(error),
        });
      });
  }

  confirmDelete(row: Row): void {
    const config = this.config();
    if (!config) {
      return;
    }
    const data: ConfirmDialogData = {
      title: `Delete ${config.singular}?`,
      message: `“${config.rowLabel(row)}” will be permanently removed. This cannot be undone.`,
      confirmLabel: 'Delete',
      destructive: true,
    };
    this.dialog
      .open(ConfirmDialogComponent, { data, width: '460px', autoFocus: false })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed || !this.client) {
          return;
        }
        this.client.remove(row.id).subscribe({
          next: () => {
            this.snackbar.open(`${capitalize(config.singular)} deleted.`, 'Dismiss', {
              duration: 4000,
              panelClass: 'tidalis-snackbar-success',
            });
            this.invalidateLookupCache();
            this.load(this.searchControl.value);
          },
          error: (error: unknown) => this.showError(error),
        });
      });
  }

  private invalidateLookupCache(): void {
    const key = LOOKUP_CACHE_KEYS[this.config()?.key ?? ''];
    if (key) {
      this.lookups.invalidate(key);
    }
  }

  private showError(error: unknown): void {
    const body = (error as { error?: { message?: string | string[] } } | null)?.error;
    const message = body?.message;
    const text = Array.isArray(message)
      ? message.join(' · ')
      : typeof message === 'string' && message.trim()
        ? message
        : (error as { status?: number } | null)?.status === 409
          ? 'That value already exists.'
          : 'The request failed. Please try again.';
    this.snackbar.open(text, 'Dismiss', { duration: 7000, panelClass: 'tidalis-snackbar-error' });
  }
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
