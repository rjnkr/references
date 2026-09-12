import { Component, OnDestroy, inject } from '@angular/core';
import { MatCheckboxModule, MatCheckboxChange } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { IHeaderAngularComp } from 'ag-grid-angular';
import { IHeaderParams } from 'ag-grid-community';

import { MapSelectionService } from '../../../core/services/map-selection.service';
import { System } from '../../../core/models/system.models';

/**
 * The "Map" column's header: a tri-state "select all" checkbox scoped to whichever rows
 * are currently passing the grid's own filters — checking it shows every filtered row on
 * *this user's* World Map, unchecking hides every filtered row from it (see
 * `MapSelectionService`).
 */
@Component({
  selector: 'app-select-all-on-map-header',
  imports: [MatCheckboxModule, MatTooltipModule],
  template: `
    <div class="select-all-header" matTooltip="Show/hide every filtered row on your World Map">
      <mat-checkbox
        [checked]="allChecked"
        [indeterminate]="indeterminate"
        (click)="$event.stopPropagation()"
        (change)="onChange($event)"
      ></mat-checkbox>
      <span>{{ displayName }}</span>
    </div>
  `,
  styles: `
    .select-all-header {
      display: flex;
      align-items: center;
      gap: 2px;
      height: 100%;
    }
  `,
})
export class SelectAllOnMapHeaderComponent implements IHeaderAngularComp, OnDestroy {
  private readonly mapSelection = inject(MapSelectionService);

  protected allChecked = false;
  protected indeterminate = false;
  protected displayName = '';

  private params!: IHeaderParams<System>;
  private readonly onGridEvent = (): void => this.recompute();

  agInit(params: IHeaderParams<System>): void {
    this.params = params;
    this.displayName = params.displayName;
    this.params.api.addEventListener('modelUpdated', this.onGridEvent);
    this.params.api.addEventListener('filterChanged', this.onGridEvent);
    this.recompute();
  }

  refresh(params: IHeaderParams<System>): boolean {
    this.params = params;
    this.displayName = params.displayName;
    this.recompute();
    return true;
  }

  ngOnDestroy(): void {
    this.params?.api?.removeEventListener('modelUpdated', this.onGridEvent);
    this.params?.api?.removeEventListener('filterChanged', this.onGridEvent);
  }

  protected onChange(event: MatCheckboxChange): void {
    const ids: number[] = [];
    this.params.api.forEachNodeAfterFilter((node) => {
      if (node.data) {
        ids.push(node.data.id);
      }
    });
    this.mapSelection.setManyShown(ids, event.checked);
    this.params.api.refreshCells({ columns: ['showOnMap'], force: true });
    this.recompute();
  }

  private recompute(): void {
    let anyOn = false;
    let anyOff = false;
    this.params.api.forEachNodeAfterFilter((node) => {
      if (node.data && this.mapSelection.isShown(node.data.id)) {
        anyOn = true;
      } else {
        anyOff = true;
      }
    });
    this.allChecked = anyOn && !anyOff;
    this.indeterminate = anyOn && anyOff;
  }
}
