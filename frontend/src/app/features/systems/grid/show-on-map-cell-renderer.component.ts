import { Component, inject } from '@angular/core';
import { MatCheckboxModule, MatCheckboxChange } from '@angular/material/checkbox';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

import { MapSelectionService } from '../../../core/services/map-selection.service';
import { System } from '../../../core/models/system.models';

/**
 * The "Map" column: an editable checkbox — checked means this reference is plotted on
 * *this user's* World Map. Reads and writes `MapSelectionService` directly (a per-user,
 * browser-local preference, not a saved system property — see that service's doc
 * comment), so toggling it is instant and never fails.
 */
@Component({
  selector: 'app-show-on-map-cell-renderer',
  imports: [MatCheckboxModule],
  template: `
    <div class="show-on-map-cell" (click)="stop($event)">
      <mat-checkbox [checked]="checked" (change)="onChange($event)"></mat-checkbox>
    </div>
  `,
  styles: `
    .show-on-map-cell {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
    }
  `,
})
export class ShowOnMapCellRendererComponent implements ICellRendererAngularComp {
  private readonly mapSelection = inject(MapSelectionService);

  protected checked = false;
  private params!: ICellRendererParams<System>;

  agInit(params: ICellRendererParams<System>): void {
    this.params = params;
    this.checked = !!params.data && this.mapSelection.isShown(params.data.id);
  }

  refresh(params: ICellRendererParams<System>): boolean {
    this.agInit(params);
    return true;
  }

  /** Clicking the checkbox must not also fire the row click that opens the detail panel. */
  protected stop(event: MouseEvent): void {
    event.stopPropagation();
  }

  protected onChange(event: MatCheckboxChange): void {
    if (this.params.data) {
      this.mapSelection.setShown(this.params.data.id, event.checked);
      this.checked = event.checked;
      // The header's tri-state "select all" checkbox only recomputes when asked to —
      // an individual row toggle doesn't otherwise notify it.
      this.params.api.refreshHeader();
    }
  }
}
