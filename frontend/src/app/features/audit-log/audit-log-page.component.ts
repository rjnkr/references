import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { AuditLogService } from '../../core/api/audit-log.service';
import { SystemAuditLogService } from '../../core/api/system-audit-log.service';
import { AUDIT_ACTIONS, AUDIT_ACTION_LABELS, AuditAction } from '../../core/models/audit-log.model';
import { TimezonePreferenceService } from '../../core/services/timezone-preference.service';
import { AnyAuditLogEntry, AuditLogKind, auditEntryLabel } from './audit-log-entry.model';
import {
  AuditLogDetailDialogComponent,
  AuditLogDetailDialogData,
} from './audit-log-detail-dialog/audit-log-detail-dialog.component';

/**
 * "Audit Trail" — reachable only from the home screen's own tile (there is
 * deliberately no navbar entry, same as Reference Data). Read-only: entries are written
 * internally alongside every project/system create/update/delete (see the backend's
 * `audit-log.util.ts`). A toggle switches between the Project trail and the System trail -
 * they're two separate tables server-side, since the two entities were split.
 */
@Component({
  selector: 'app-audit-log-page',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatTooltipModule,
  ],
  templateUrl: './audit-log-page.component.html',
  styleUrl: './audit-log-page.component.scss',
})
export class AuditLogPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly projectApi = inject(AuditLogService);
  private readonly systemApi = inject(SystemAuditLogService);
  private readonly dialog = inject(MatDialog);
  protected readonly tz = inject(TimezonePreferenceService);

  protected readonly actions = AUDIT_ACTIONS;
  protected readonly actionLabels = AUDIT_ACTION_LABELS;
  protected readonly pageSizeOptions = [10, 25, 50, 100];

  protected readonly kind = signal<AuditLogKind>('system');
  protected readonly rows = signal<AnyAuditLogEntry[]>([]);
  protected readonly total = signal(0);
  protected readonly loading = signal(false);
  protected readonly loadError = signal<string | null>(null);

  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal(25);

  protected readonly searchControl = new FormControl('', { nonNullable: true });
  protected readonly actionControl = new FormControl<AuditAction | ''>('', { nonNullable: true });

  /** Set when the page was opened with `?projectId=…`/`?systemId=…` - scopes the whole
   *  trail to one entity and shows a banner explaining that, with a way to clear it. */
  protected readonly scopedId = signal<number | null>(null);
  protected readonly scopedName = signal<string | null>(null);

  ngOnInit(): void {
    const kindParam = this.route.snapshot.queryParamMap.get('kind');
    if (kindParam === 'system' || kindParam === 'project') {
      this.kind.set(kindParam);
    }

    const idParam =
      this.route.snapshot.queryParamMap.get(this.kind() === 'system' ? 'systemId' : 'projectId');
    const nameParam =
      this.route.snapshot.queryParamMap.get(this.kind() === 'system' ? 'systemName' : 'projectName');
    if (idParam) {
      this.scopedId.set(Number(idParam));
      this.scopedName.set(nameParam);
    }

    this.searchControl.valueChanges.pipe(debounceTime(300), distinctUntilChanged()).subscribe(() => {
      this.pageIndex.set(0);
      this.load();
    });
    this.actionControl.valueChanges.subscribe(() => {
      this.pageIndex.set(0);
      this.load();
    });

    this.load();
  }

  /** Switches between the Project and System trail. Clears whatever single-entity scope
   *  was active - it belonged to the other trail. */
  setKind(kind: AuditLogKind): void {
    if (kind === this.kind()) {
      return;
    }
    this.kind.set(kind);
    this.scopedId.set(null);
    this.scopedName.set(null);
    this.pageIndex.set(0);
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.loadError.set(null);

    const kind = this.kind();
    const onError = () => {
      this.rows.set([]);
      this.total.set(0);
      this.loading.set(false);
      this.loadError.set('Could not load the audit trail. Check that the API on :3000 is running.');
    };

    if (kind === 'system') {
      this.systemApi
        .list({
          systemId: this.scopedId() ?? undefined,
          action: this.actionControl.value || undefined,
          search: this.searchControl.value,
          page: this.pageIndex() + 1,
          pageSize: this.pageSize(),
        })
        .subscribe({
          next: (result) => {
            this.rows.set((result?.data ?? []).map((entry): AnyAuditLogEntry => ({ ...entry, kind })));
            this.total.set(result?.total ?? 0);
            this.loading.set(false);
          },
          error: onError,
        });
    } else {
      this.projectApi
        .list({
          projectId: this.scopedId() ?? undefined,
          action: this.actionControl.value || undefined,
          search: this.searchControl.value,
          page: this.pageIndex() + 1,
          pageSize: this.pageSize(),
        })
        .subscribe({
          next: (result) => {
            this.rows.set((result?.data ?? []).map((entry): AnyAuditLogEntry => ({ ...entry, kind })));
            this.total.set(result?.total ?? 0);
            this.loading.set(false);
          },
          error: onError,
        });
    }
  }

  onPage(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.load();
  }

  clearScope(): void {
    this.scopedId.set(null);
    this.scopedName.set(null);
    this.pageIndex.set(0);
    this.load();
  }

  openDetail(entry: AnyAuditLogEntry): void {
    const data: AuditLogDetailDialogData = { entry };
    this.dialog
      .open(AuditLogDetailDialogComponent, { data, width: '820px', autoFocus: false })
      .afterClosed()
      .subscribe((restored) => {
        // A restore writes a new RESTORE entry, which the currently displayed page may
        // now need to reflect.
        if (restored) {
          this.load();
        }
      });
  }

  entryLabel(row: AnyAuditLogEntry): string {
    return auditEntryLabel(row);
  }

  changedFieldsSummary(entry: AnyAuditLogEntry): string {
    if (!entry.changedFields || entry.changedFields.length === 0) {
      return '—';
    }
    return entry.changedFields.join(', ');
  }
}
