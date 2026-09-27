import { Component, inject, signal } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { SystemService } from '../../core/api/system.service';
import { System } from '../../core/models/system.models';
import {
  SystemDetailPanelComponent,
  SystemPanelState,
} from '../../features/systems/system-detail-panel/system-detail-panel.component';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../shared/confirm-dialog/confirm-dialog.component';

export interface MapSystemDialogData {
  system: System;
}

/**
 * Thin MatDialog host around the existing system detail panel, so a click on the map
 * opens exactly the same tabbed view the list page shows in its sidenav.
 *
 * The panel is a self-contained form component (it owns its own save/upload calls), so
 * the only wiring needed here is: close on `(closed)`, remember the freshly saved
 * system so the dialog result can tell the map something changed, and run the delete
 * confirmation the panel delegates to its parent.
 */
@Component({
  selector: 'app-map-system-dialog',
  imports: [SystemDetailPanelComponent],
  template: `
    <div class="map-dialog">
      <app-system-detail-panel
        [state]="state"
        (closed)="close()"
        (saved)="onSaved($event)"
        (deleteRequested)="confirmDelete($event)"
        (documentsChanged)="dirty.set(true)"
      />
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      /* The panel is height:100% + internal scroll, so it only needs a bounded box. */
      .map-dialog {
        height: min(80vh, 880px);
        overflow: hidden;
      }
    `,
  ],
})
export class MapSystemDialogComponent {
  private readonly data = inject<MapSystemDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject<MatDialogRef<MapSystemDialogComponent, boolean>>(MatDialogRef);
  private readonly dialog = inject(MatDialog);
  private readonly systems = inject(SystemService);
  private readonly snackbar = inject(MatSnackBar);

  /** Kept as a stable field: the panel re-patches its form whenever this input changes. */
  protected state: SystemPanelState = { mode: 'view', system: this.data.system };

  /** True once something was saved/deleted, so the map can refresh its points. */
  protected readonly dirty = signal(false);

  protected close(): void {
    this.dialogRef.close(this.dirty());
  }

  protected onSaved(system: System): void {
    this.state = { mode: 'view', system };
    this.dirty.set(true);
  }

  protected confirmDelete(system: System): void {
    const data: ConfirmDialogData = {
      title: 'Delete system?',
      message: `“${system.name}” and all of its ports, documents, people and functions will be permanently removed.`,
      confirmLabel: 'Delete',
      destructive: true,
    };

    this.dialog
      .open(ConfirmDialogComponent, { data, width: '460px', autoFocus: false })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.systems.delete(system.id).subscribe({
          next: () => {
            this.snackbar.open(`Deleted ${system.name}`, 'Dismiss', {
              duration: 4000,
              panelClass: 'tidalis-snackbar-success',
            });
            this.dirty.set(true);
            this.close();
          },
          error: () =>
            this.snackbar.open('Could not delete the system.', 'Dismiss', {
              duration: 6000,
              panelClass: 'tidalis-snackbar-error',
            }),
        });
      });
  }
}
