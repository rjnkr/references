import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

/** A single system's module assignments, however the grid row shapes them. */
type ModuleAssignment = { module: { id: number; name: string } };

/** Renders a system's modules as a vertical, alphabetised list — a flat comma-joined
 *  string stops being readable once a system carries 10+ modules. Paired with the
 *  column's `autoHeight: true` so the row grows to fit however many are listed. */
@Component({
  selector: 'app-module-list-cell-renderer',
  template: `
    @if (names.length === 0) {
      <span class="module-list__empty">—</span>
    } @else {
      <ul class="module-list">
        @for (name of names; track name) {
          <li>{{ name }}</li>
        }
      </ul>
    }
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
      padding: 6px 0;
    }

    .module-list {
      margin: 0;
      padding-left: 16px;
    }

    .module-list li {
      line-height: 1.4;
    }

    .module-list__empty {
      color: var(--tidalis-text-muted, #8a94a6);
    }
  `,
})
export class ModuleListCellRendererComponent implements ICellRendererAngularComp {
  protected names: string[] = [];

  agInit(params: ICellRendererParams<unknown, ModuleAssignment[]>): void {
    this.names = (params.value ?? [])
      .map((assignment) => assignment.module.name)
      .sort((a, b) => a.localeCompare(b));
  }

  refresh(params: ICellRendererParams<unknown, ModuleAssignment[]>): boolean {
    this.agInit(params);
    return true;
  }
}
