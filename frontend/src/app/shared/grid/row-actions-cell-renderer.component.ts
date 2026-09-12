import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

/**
 * What the grid's `context` must provide for `RowActionsCellRendererComponent` (and, where
 * a grid also has a "Map" column, `ShowOnMapCellRendererComponent` /
 * `SelectAllOnMapHeaderComponent`) to call back into the page component — the standard AG
 * Grid Angular pattern for a cellRenderer that needs to reach outside the grid itself.
 */
export interface RowActionsGridContext<T> {
  componentParent: {
    edit(row: T, event?: Event): void;
    confirmDelete(row: T, event?: Event): void;
  };
}

/**
 * Edit / Delete buttons, pinned to the right. Shared by every AG Grid on the site (Contracts,
 * Systems, ...) — generic over the row type `T` so each grid's page component only needs an
 * `edit`/`confirmDelete` pair matching its own entity.
 */
@Component({
  selector: 'app-row-actions-cell-renderer',
  imports: [MatIconModule, MatTooltipModule],
  template: `
    <button mat-icon-button type="button" matTooltip="Edit" aria-label="Edit" (click)="edit($event)">
      <mat-icon>edit</mat-icon>
    </button>
    <button
      mat-icon-button
      type="button"
      class="actions-cell__delete"
      matTooltip="Delete"
      aria-label="Delete"
      (click)="remove($event)"
    >
      <mat-icon>delete_outline</mat-icon>
    </button>
  `,
  // Rendered by AG Grid outside the page component's view, so it needs its own styles — see
  // the same note in the identity-column cell renderers.
  styles: `
    :host {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
    }

    .mat-mdc-icon-button {
      width: 34px;
      height: 34px;
      padding: 5px;

      mat-icon {
        font-size: 19px;
        width: 19px;
        height: 19px;
      }
    }

    .actions-cell__delete {
      color: #b3261e;
    }
  `,
})
export class RowActionsCellRendererComponent<T = unknown> implements ICellRendererAngularComp {
  private params!: ICellRendererParams<T> & { context: RowActionsGridContext<T> };

  agInit(params: ICellRendererParams<T> & { context: RowActionsGridContext<T> }): void {
    this.params = params;
  }

  refresh(params: ICellRendererParams<T> & { context: RowActionsGridContext<T> }): boolean {
    this.params = params;
    return true;
  }

  protected edit(event: MouseEvent): void {
    event.stopPropagation();
    if (this.params.data) {
      this.params.context.componentParent.edit(this.params.data, event);
    }
  }

  protected remove(event: MouseEvent): void {
    event.stopPropagation();
    if (this.params.data) {
      this.params.context.componentParent.confirmDelete(this.params.data, event);
    }
  }
}
