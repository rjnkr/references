import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { System } from '../../../core/models/system.models';

/**
 * The system's name, plus a lock icon when the system is flagged sensitive.
 */
@Component({
  selector: 'app-system-name-cell-renderer',
  imports: [MatIconModule, MatTooltipModule],
  template: `
    <span>{{ value || '—' }}</span>
    @if (sensitive) {
      <mat-icon class="cell-lock" matTooltip="Sensitive system">lock</mat-icon>
    }
  `,
  // AG Grid renders cell renderers as their own component tree, outside
  // `SystemsPageComponent`'s view — the page's (emulated, scoped) SCSS never reaches here,
  // so this component carries its own styles rather than relying on `systems-page.component.scss`.
  styles: `
    .cell-lock {
      font-size: 14px;
      width: 14px;
      height: 14px;
      margin-left: 5px;
      vertical-align: -2px;
      color: var(--tidalis-orange-dark);
    }
  `,
})
export class SystemNameCellRendererComponent implements ICellRendererAngularComp {
  protected value = '';
  protected sensitive = false;

  agInit(params: ICellRendererParams<System>): void {
    this.value = params.value ?? '';
    this.sensitive = !!params.data?.isSensitive;
  }

  refresh(params: ICellRendererParams<System>): boolean {
    this.agInit(params);
    return true;
  }
}
