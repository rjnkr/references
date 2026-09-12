import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

/** Renders a value (the contract type's label) as the same blue pill used elsewhere in the app. */
@Component({
  selector: 'app-enum-chip-cell-renderer',
  template: `
    @if (value) {
      <span class="tidalis-chip tidalis-chip--blue">{{ value }}</span>
    }
  `,
})
export class EnumChipCellRendererComponent implements ICellRendererAngularComp {
  protected value = '';

  agInit(params: ICellRendererParams): void {
    this.value = params.value ?? '';
  }

  refresh(params: ICellRendererParams): boolean {
    this.agInit(params);
    return true;
  }
}
