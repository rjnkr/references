import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

/** Which `tidalis-chip--*` colour a "Yes" value gets; "No" is always the neutral grey chip. */
export type BoolChipVariant = 'green' | 'orange' | 'red';

export interface BoolChipCellRendererParams extends ICellRendererParams {
  variant: BoolChipVariant;
}

/**
 * Renders the `'Yes' | 'No'` string a column's `valueGetter` already produces (see
 * `project-column-defs.ts`) as the same coloured pill chip the old `mat-table` cell used —
 * same `tidalis-chip` classes as everywhere else in the app (project detail panel, map).
 */
@Component({
  selector: 'app-bool-chip-cell-renderer',
  template: `
    @if (isYes) {
      <span
        class="tidalis-chip"
        [class.tidalis-chip--green]="variant === 'green'"
        [class.tidalis-chip--orange]="variant === 'orange'"
        [class.tidalis-chip--red]="variant === 'red'"
        >Yes</span
      >
    } @else {
      <span class="tidalis-chip tidalis-chip--grey">No</span>
    }
  `,
})
export class BoolChipCellRendererComponent implements ICellRendererAngularComp {
  protected isYes = false;
  protected variant: BoolChipVariant = 'green';

  agInit(params: BoolChipCellRendererParams): void {
    this.isYes = params.value === 'Yes';
    this.variant = params.variant;
  }

  refresh(params: BoolChipCellRendererParams): boolean {
    this.agInit(params);
    return true;
  }
}
