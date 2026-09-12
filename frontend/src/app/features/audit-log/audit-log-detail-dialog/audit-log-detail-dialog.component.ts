import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ProjectService } from '../../../core/api/project.service';
import { SystemService } from '../../../core/api/system.service';
import { AUDIT_ACTION_LABELS } from '../../../core/models/audit-log.model';
import { TimezonePreferenceService } from '../../../core/services/timezone-preference.service';
import { AnyAuditLogEntry, auditEntryLabel } from '../audit-log-entry.model';
import { PROJECT_SNAPSHOT_FIELDS } from '../project-snapshot-fields';
import { SnapshotField } from '../snapshot-format';
import { SYSTEM_SNAPSHOT_FIELDS } from '../system-snapshot-fields';

export interface AuditLogDetailDialogData {
  entry: AnyAuditLogEntry;
}

interface DiffRow {
  label: string;
  before: string;
  after: string;
  changed: boolean;
}

/**
 * Full before/full after comparison for one audit entry. A CREATE only ever has an
 * "after" snapshot, a DELETE only a "before" one (the entity's last known state) - both
 * render as a single value column rather than a comparison. Works for both the Project
 * and System trail, picking the matching snapshot-field list and restore endpoint from
 * `data.entry.kind`.
 */
@Component({
  selector: 'app-audit-log-detail-dialog',
  imports: [DatePipe, MatDialogModule, MatButtonModule, MatIconModule, MatProgressBarModule],
  templateUrl: './audit-log-detail-dialog.component.html',
  styleUrl: './audit-log-detail-dialog.component.scss',
})
export class AuditLogDetailDialogComponent {
  private readonly projects = inject(ProjectService);
  private readonly systems = inject(SystemService);
  private readonly snackbar = inject(MatSnackBar);
  protected readonly tz = inject(TimezonePreferenceService);
  readonly dialogRef =
    inject<MatDialogRef<AuditLogDetailDialogComponent, boolean>>(MatDialogRef);
  readonly data = inject<AuditLogDetailDialogData>(MAT_DIALOG_DATA);
  protected readonly actionLabels = AUDIT_ACTION_LABELS;
  protected readonly title = auditEntryLabel(this.data.entry);

  protected readonly isUpdate = this.data.entry.action === 'UPDATE';
  protected readonly isCreate = this.data.entry.action === 'CREATE';
  protected readonly isDelete = this.data.entry.action === 'DELETE';
  protected readonly isRestore = this.data.entry.action === 'RESTORE';

  /** CREATE and RESTORE show the resulting state; DELETE shows the last known state
   *  before it disappeared. Only UPDATE is a real two-column comparison - a RESTORE's
   *  before/after are identical apart from the internal `deleted` flag, which isn't a
   *  field worth diffing on its own. */
  protected readonly singleColumnLabel = this.isCreate
    ? 'Value'
    : this.isRestore
      ? 'Restored value'
      : 'Last known value';

  protected readonly restoring = signal(false);

  protected readonly rows: DiffRow[] = this.buildRows();

  restore(): void {
    this.restoring.set(true);
    const entry = this.data.entry;

    const onSuccess = (label: string | number) => {
      this.restoring.set(false);
      this.snackbar.open(`Restored ${label}.`, 'Dismiss', {
        duration: 4000,
        panelClass: 'tidalis-snackbar-success',
      });
      // A new RESTORE entry now exists - the list behind this dialog needs reloading.
      this.dialogRef.close(true);
    };
    const onFailure = (error: unknown) => {
      this.restoring.set(false);
      this.snackbar.open(extractErrorMessage(error, entry.kind), 'Dismiss', {
        duration: 7000,
        panelClass: 'tidalis-snackbar-error',
      });
    };

    if (entry.kind === 'system') {
      this.systems.restore(entry.systemId).subscribe({
        next: (restored) => onSuccess(restored.name),
        error: onFailure,
      });
    } else {
      this.projects.restore(entry.projectId).subscribe({
        next: (restored) => onSuccess(restored.projectNumber ?? restored.id),
        error: onFailure,
      });
    }
  }

  private buildRows(): DiffRow[] {
    const { beforeData, afterData, changedFields, kind } = this.data.entry;
    const changed = new Set(changedFields ?? []);
    const fields: SnapshotField[] = kind === 'system' ? SYSTEM_SNAPSHOT_FIELDS : PROJECT_SNAPSHOT_FIELDS;

    const rows: DiffRow[] = [];
    for (const field of fields) {
      const beforeValue = beforeData ? field.format(beforeData[field.key]) : '—';
      const afterValue = afterData ? field.format(afterData[field.key]) : '—';

      // Skip fields that carry nothing on either side - keeps the dialog to what
      // actually has data instead of ~30 rows of "—".
      if (beforeValue === '—' && afterValue === '—') {
        continue;
      }

      rows.push({
        label: field.label,
        before: beforeValue,
        after: afterValue,
        changed: changed.has(field.key),
      });
    }
    return rows;
  }
}

function extractErrorMessage(error: unknown, kind: 'project' | 'system'): string {
  const body = (error as { error?: { message?: string | string[] } } | null)?.error;
  const message = body?.message;
  if (Array.isArray(message) && message.length > 0) {
    return message.join(' · ');
  }
  if (typeof message === 'string' && message.trim()) {
    return message;
  }
  const status = (error as { status?: number } | null)?.status;
  if (status === 409 && kind === 'project') {
    return 'Cannot restore: another project now uses this project number.';
  }
  return `Could not restore the ${kind}. Please try again.`;
}
