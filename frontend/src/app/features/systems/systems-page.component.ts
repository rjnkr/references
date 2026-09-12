import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AgGridAngular } from 'ag-grid-angular';
import {
  ColDef,
  ColumnMovedEvent,
  ColumnResizedEvent,
  FilterChangedEvent,
  GetRowIdParams,
  GridApi,
  GridReadyEvent,
  ModelUpdatedEvent,
  RowClassParams,
  RowClickedEvent,
  SortChangedEvent,
} from 'ag-grid-community';

import { LookupService } from '../../core/api/lookup.service';
import { SystemService } from '../../core/api/system.service';
import { System } from '../../core/models/system.models';
import { MapSelectionService } from '../../core/services/map-selection.service';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../shared/confirm-dialog/confirm-dialog.component';
// Side-effect: registers every AG Grid Community module (client-side row model, the
// Text/Number/Date column filters, cell renderers, pinning…) once for the whole app.
import '../../shared/grid/ag-grid-setup';
import { reorderColumnDefs } from '../../shared/grid/column-order';
import { TIDALIS_GRID_THEME } from '../../shared/grid/grid-theme';
import {
  ACTIONS_COLUMN_ID,
  ALL_COLUMN_IDS,
  COLUMN_SORT_KEYS,
  DEFAULT_VISIBLE_COLUMN_IDS,
  SHOW_ON_MAP_COLUMN_ID,
  buildSystemColumnDefs,
} from './grid/system-column-defs';
import { SystemGridContext } from './grid/system-grid-context';
import {
  SystemDetailPanelComponent,
  SystemPanelState,
} from './system-detail-panel/system-detail-panel.component';

const VISIBLE_COLUMNS_STORAGE_KEY = 'tidalis.systems.visibleColumns';
/** Persists a user's drag-to-reorder — restored on next visit or when navigating back to
 *  this screen (the component, and so this array, is rebuilt fresh each time). */
const COLUMN_ORDER_STORAGE_KEY = 'tidalis.systems.columnOrder';
/** Persists AG Grid's own filter model (every column's floating filter) — same reason:
 *  navigating to another screen (e.g. World Map) and back destroys and rebuilds this whole
 *  component, which would otherwise silently drop whatever the user had typed in. */
const COLUMN_FILTERS_STORAGE_KEY = 'tidalis.systems.columnFilters';
/** Persists a user's drag-to-resize, same reason as `COLUMN_ORDER_STORAGE_KEY`. */
const COLUMN_WIDTHS_STORAGE_KEY = 'tidalis.systems.columnWidths';

/** Minimal stand-in for Material's `Sort` — dropped along with `MatSortModule`. */
interface GridSort {
  active: string;
  direction: 'asc' | 'desc';
}

/**
 * "Systems" — the delivered-system grid, rendered with AG Grid Community. The commercial
 * side of a reference (award date, prices, Pipedrive links) lives on the separate Contracts
 * grid; zero, one or many contracts can link back to a given system.
 *
 * Filtering strategy (documented in frontend/README.md):
 *  - sorting and pagination are sent to the backend, since AG Grid Community's client-side
 *    row model only ever holds the one page currently loaded — there is no server-side row
 *    model outside Enterprise. There is no separate global search box: every column's own
 *    floating filter (AG Grid's Text/Number/Date filters — the Set filter is Enterprise-only,
 *    see `system-column-defs.ts`) covers that, client-side, on the page that is currently
 *    loaded, which keeps typing instant.
 */
@Component({
  selector: 'app-systems-page',
  imports: [
    AgGridAngular,
    MatPaginatorModule,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatCheckboxModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatDividerModule,
    SystemDetailPanelComponent,
  ],
  templateUrl: './systems-page.component.html',
  styleUrl: './systems-page.component.scss',
})
export class SystemsPageComponent implements OnInit {
  private readonly systems = inject(SystemService);
  private readonly lookups = inject(LookupService);
  private readonly dialog = inject(MatDialog);
  private readonly snackbar = inject(MatSnackBar);
  private readonly mapSelection = inject(MapSelectionService);

  /* --- Static metadata ------------------------------------------------------------ */

  protected readonly gridTheme = TIDALIS_GRID_THEME;
  protected readonly pageSizeOptions = [10, 25, 50, 100, 250, 500];
  /** `params.context` for every cell renderer — see `RowActionsCellRendererComponent`. */
  protected readonly gridContext: SystemGridContext = { componentParent: this };

  /* --- Data --------------------------------------------------------------------- */

  protected readonly rows = signal<System[]>([]);
  protected readonly total = signal(0);
  protected readonly loading = signal(false);
  protected readonly loadError = signal<string | null>(null);
  /** Rows AG Grid is actually showing once its own column filters are applied. */
  protected readonly displayedRowCount = signal(0);

  /* --- Server-side query state --------------------------------------------------- */

  protected readonly sort = signal<GridSort>({ active: 'name', direction: 'asc' });
  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal(25);

  /* --- Column visibility --------------------------------------------------------- */

  protected readonly visibleColumnKeys = signal<string[]>(this.restoreVisibleColumns());

  /** The grid's own column definitions — built once; live visibility changes go through
   *  the grid API (`toggleColumn`), not by rebuilding this array. Order reflects whatever
   *  the user last dragged it to (see `onGridColumnMoved`). */
  protected readonly columnDefs: ColDef<System>[] = this.withInitialSort(
    reorderColumnDefs(
      buildSystemColumnDefs(this.visibleColumnKeys(), this.mapSelection),
      this.restoreColumnOrder(),
      SHOW_ON_MAP_COLUMN_ID,
    ),
  );
  protected readonly defaultColDef: ColDef<System> = {
    resizable: true,
    sortingOrder: ['asc', 'desc'],
  };
  /** Each column's shipped width, snapshotted before any restored/user-resized width is
   *  applied — `resetColumns()` uses this to put widths back exactly as delivered. */
  private readonly defaultColumnWidths: Record<string, number> = Object.fromEntries(
    this.columnDefs
      .filter((def): def is ColDef<System> & { colId: string; width: number } =>
        typeof def.colId === 'string' && typeof def.width === 'number',
      )
      .map((def) => [def.colId, def.width]),
  );
  /** Every toggleable column, for the "Columns" menu — excludes the two pinned, always-
   *  visible columns (actions on the right, "Map" on the left). */
  protected readonly toggleableColumns = this.columnDefs
    .filter((def) => def.colId !== ACTIONS_COLUMN_ID && def.colId !== SHOW_ON_MAP_COLUMN_ID)
    .map((def) => ({ colId: def.colId as string, label: def.headerName ?? def.colId! }));

  private gridApi?: GridApi<System>;

  /** Stable row identity across `rowData` updates (reload, sort, page). */
  protected readonly getRowId = (params: GetRowIdParams<System>): string => String(params.data.id);

  /** Highlights the row currently open in the detail panel. Re-evaluated by an explicit
   *  `redrawRows()` call wherever `selectedId` changes, since it isn't itself a grid input
   *  AG Grid watches. */
  protected readonly getRowClass = (params: RowClassParams<System>): string =>
    params.data?.id === this.selectedId() ? 'system-row--selected' : '';

  /* --- Detail panel -------------------------------------------------------------- */

  protected readonly panel = signal<SystemPanelState | null>(null);
  protected readonly selectedId = signal<number | null>(null);

  ngOnInit(): void {
    this.lookups.preload().subscribe({
      // Only needed for the detail panel's own dropdowns; the grid works without it.
      error: () => undefined,
    });

    this.load();
  }

  /* --- Loading ------------------------------------------------------------------- */

  load(): void {
    this.loading.set(true);
    this.loadError.set(null);

    this.systems
      .list({
        sort: SystemService.encodeSort(this.sort().active, this.sort().direction),
        page: this.pageIndex() + 1,
        pageSize: this.pageSize(),
      })
      .subscribe({
        next: (result) => {
          this.rows.set(result?.data ?? []);
          this.total.set(result?.total ?? 0);
          this.loading.set(false);
        },
        error: () => {
          this.rows.set([]);
          this.total.set(0);
          this.loading.set(false);
          this.loadError.set('Could not load systems. Check that the API on :3000 is running.');
        },
      });
  }

  /* --- Grid interactions ---------------------------------------------------------- */

  onGridReady(event: GridReadyEvent<System>): void {
    this.gridApi = event.api;
    // Applied even though `rowData` may still be empty (the initial `load()` is likely
    // still in flight) — AG Grid re-runs the filter against rows as they arrive.
    const restoredFilters = this.restoreColumnFilters();
    if (restoredFilters) {
      event.api.setFilterModel(restoredFilters);
    }

    const restoredWidths = this.restoreColumnWidths();
    if (restoredWidths) {
      event.api.applyColumnState({
        state: Object.entries(restoredWidths).map(([colId, width]) => ({ colId, width })),
      });
    }
  }

  /**
   * AG Grid Community has no server-side row model, so every sortable column's comparator
   * is a no-op (see `system-column-defs.ts`) — the header click still fires this event, we
   * just translate it into the real, server-side sort instead of letting AG Grid re-order
   * the one page it already has.
   */
  onGridSortChanged(event: SortChangedEvent<System>): void {
    const sorted = event.api.getColumnState().find((state) => state.sort);
    if (!sorted) {
      return;
    }
    const active = COLUMN_SORT_KEYS[sorted.colId];
    if (!active) {
      return;
    }
    this.sort.set({ active, direction: sorted.sort === 'desc' ? 'desc' : 'asc' });
    this.pageIndex.set(0);
    this.load();
  }

  /**
   * `modelUpdated` (rather than just `filterChanged`) so `displayedRowCount` is also
   * correct right after the initial load and after every `rowData` refresh — otherwise it
   * sits at its initial 0 and "0 of 5 shown" wrongly implies an active filter.
   */
  onGridModelUpdated(event: ModelUpdatedEvent<System>): void {
    this.displayedRowCount.set(event.api.getDisplayedRowCount());
  }

  onRowClicked(event: RowClickedEvent<System>): void {
    if (event.data) {
      this.openSystem(event.data);
    }
  }

  /** Persists AG Grid's own filter model on every change, including it being cleared —
   *  `clearFilters()` below relies on this to also clear what's persisted, rather than
   *  needing to touch localStorage itself. */
  onGridFilterChanged(event: FilterChangedEvent<System>): void {
    this.persistColumnFilters(event.api.getFilterModel());
  }

  /** `columnMoved` fires continuously while dragging — only persist once the drag (or a
   *  keyboard move) actually finishes, not on every intermediate frame. */
  onGridColumnMoved(event: ColumnMovedEvent<System>): void {
    if (event.finished) {
      this.persistColumnOrder(event.api.getColumnState().map((state) => state.colId));
    }
  }

  /** `columnResized` fires continuously while dragging a column's edge — only persist once
   *  the drag actually finishes, same reason as above. Restricted to `'uiColumnResized'`
   *  (a real drag) so that `resetColumns()`'s own `applyColumnState` call — which also
   *  fires this event, `source: 'api'` — cannot immediately re-persist the very widths it
   *  just told localStorage to forget. */
  onGridColumnResized(event: ColumnResizedEvent<System>): void {
    if (event.finished && event.source === 'uiColumnResized') {
      this.persistColumnWidths(event.api.getColumnState());
    }
  }

  onPage(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.load();
  }

  /** Only clears the grid's own column filters now — there's no server-side search left to
   *  reset alongside it. */
  clearFilters(): void {
    this.gridApi?.setFilterModel(null);
  }

  hasColumnFilters(): boolean {
    return this.displayedRowCount() < this.rows().length;
  }

  /* --- Column visibility ---------------------------------------------------------- */

  isColumnVisible(key: string): boolean {
    return this.visibleColumnKeys().includes(key);
  }

  toggleColumn(key: string, visible: boolean): void {
    const next = visible
      ? [...new Set([...this.visibleColumnKeys(), key])]
      : this.visibleColumnKeys().filter((existing) => existing !== key);

    // Never let the grid end up with no columns at all.
    this.visibleColumnKeys.set(next.length > 0 ? next : [this.toggleableColumns[0].colId]);
    this.gridApi?.setColumnsVisible([key], this.isColumnVisible(key));
    this.persistVisibleColumns();
  }

  resetColumns(): void {
    this.visibleColumnKeys.set([...DEFAULT_VISIBLE_COLUMN_IDS]);
    this.gridApi?.setColumnsVisible(
      this.toggleableColumns.map((c) => c.colId),
      false,
    );
    this.gridApi?.setColumnsVisible(DEFAULT_VISIBLE_COLUMN_IDS, true);
    this.persistVisibleColumns();

    // Order is reset too — "Reset" should mean back to the shipped default in every sense.
    this.gridApi?.applyColumnState({
      state: ALL_COLUMN_IDS.map((colId) => ({ colId })),
      applyOrder: true,
    });
    try {
      localStorage.removeItem(COLUMN_ORDER_STORAGE_KEY);
    } catch {
      // Private browsing / storage disabled — nothing was persisted to begin with.
    }

    // ...and so are widths.
    this.gridApi?.applyColumnState({
      state: Object.entries(this.defaultColumnWidths).map(([colId, width]) => ({ colId, width })),
    });
    try {
      localStorage.removeItem(COLUMN_WIDTHS_STORAGE_KEY);
    } catch {
      // Private browsing / storage disabled — nothing was persisted to begin with.
    }
  }

  private restoreVisibleColumns(): string[] {
    try {
      const raw = localStorage.getItem(VISIBLE_COLUMNS_STORAGE_KEY);
      if (!raw) {
        return [...DEFAULT_VISIBLE_COLUMN_IDS];
      }
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [...DEFAULT_VISIBLE_COLUMN_IDS];
      }
      // Drop keys that no longer exist (columns can be renamed between releases).
      const known = parsed.filter(
        (key): key is string => typeof key === 'string' && ALL_COLUMN_IDS.includes(key),
      );
      return known.length > 0 ? known : [...DEFAULT_VISIBLE_COLUMN_IDS];
    } catch {
      return [...DEFAULT_VISIBLE_COLUMN_IDS];
    }
  }

  private persistVisibleColumns(): void {
    try {
      localStorage.setItem(VISIBLE_COLUMNS_STORAGE_KEY, JSON.stringify(this.visibleColumnKeys()));
    } catch {
      // Private browsing / storage disabled — the selection just will not persist.
    }
  }

  /** `null` means "nothing usable was stored" — callers fall back to the shipped order. */
  private restoreColumnOrder(): string[] | null {
    try {
      const raw = localStorage.getItem(COLUMN_ORDER_STORAGE_KEY);
      if (!raw) {
        return null;
      }
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return null;
      }
      // Drop ids that no longer exist (a column can be renamed/removed between releases);
      // any that remain valid but are missing from a stale list are appended by
      // `reorderColumnDefs` itself, so a partial list is still safe to use as-is.
      const known = parsed.filter(
        (id): id is string => typeof id === 'string' && ALL_COLUMN_IDS.includes(id),
      );
      return known.length > 0 ? known : null;
    } catch {
      return null;
    }
  }

  private persistColumnOrder(order: (string | null)[]): void {
    try {
      localStorage.setItem(
        COLUMN_ORDER_STORAGE_KEY,
        JSON.stringify(
          order.filter((id): id is string => !!id && id !== ACTIONS_COLUMN_ID && id !== SHOW_ON_MAP_COLUMN_ID),
        ),
      );
    } catch {
      // Private browsing / storage disabled — the new order just will not persist.
    }
  }

  /** `null` means "nothing usable was stored" — callers then leave every column at its
   *  shipped default width. */
  private restoreColumnWidths(): Record<string, number> | null {
    try {
      const raw = localStorage.getItem(COLUMN_WIDTHS_STORAGE_KEY);
      if (!raw) {
        return null;
      }
      const parsed: unknown = JSON.parse(raw);
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        return null;
      }
      const widths: Record<string, number> = {};
      // Drop ids that no longer exist (a column can be renamed/removed between releases).
      for (const [colId, width] of Object.entries(parsed as Record<string, unknown>)) {
        if (ALL_COLUMN_IDS.includes(colId) && typeof width === 'number' && width > 0) {
          widths[colId] = width;
        }
      }
      return Object.keys(widths).length > 0 ? widths : null;
    } catch {
      return null;
    }
  }

  private persistColumnWidths(state: readonly { colId: string; width?: number | null }[]): void {
    try {
      const widths: Record<string, number> = {};
      for (const column of state) {
        if (typeof column.width === 'number') {
          widths[column.colId] = column.width;
        }
      }
      localStorage.setItem(COLUMN_WIDTHS_STORAGE_KEY, JSON.stringify(widths));
    } catch {
      // Private browsing / storage disabled — the new widths just will not persist.
    }
  }

  /** `null` means "nothing usable was stored" — `onGridReady` then leaves the grid unfiltered. */
  private restoreColumnFilters(): Record<string, unknown> | null {
    try {
      const raw = localStorage.getItem(COLUMN_FILTERS_STORAGE_KEY);
      if (!raw) {
        return null;
      }
      const parsed: unknown = JSON.parse(raw);
      // A plain object, not an array/primitive/null — same shape `getFilterModel()` returns.
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        return null;
      }
      // Drop entries for columns that no longer exist (renamed/removed between releases).
      return Object.fromEntries(
        Object.entries(parsed as Record<string, unknown>).filter(([colId]) =>
          ALL_COLUMN_IDS.includes(colId),
        ),
      );
    } catch {
      return null;
    }
  }

  private persistColumnFilters(model: Record<string, unknown>): void {
    try {
      localStorage.setItem(COLUMN_FILTERS_STORAGE_KEY, JSON.stringify(model));
    } catch {
      // Private browsing / storage disabled — the filters just will not persist.
    }
  }

  /** Stamps the initial `sort` state onto whichever column def matches it, so the header
   *  shows the right arrow before the user has clicked anything. */
  private withInitialSort(defs: ColDef<System>[]): ColDef<System>[] {
    const { active, direction } = this.sort();
    for (const def of defs) {
      if (def.colId && COLUMN_SORT_KEYS[def.colId] === active) {
        def.sort = direction;
        def.sortIndex = 0;
      }
    }
    return defs;
  }

  /* --- Detail panel --------------------------------------------------------------- */

  openSystem(system: System): void {
    this.selectedId.set(system.id);
    this.panel.set({ mode: 'view', system });
    this.gridApi?.redrawRows();
  }

  newSystem(): void {
    this.selectedId.set(null);
    this.panel.set({ mode: 'create', system: null });
    this.gridApi?.redrawRows();
  }

  /** Matches `RowActionsGridContext<System>` — invoked by `RowActionsCellRendererComponent`. */
  edit(system: System, event?: Event): void {
    event?.stopPropagation();
    this.selectedId.set(system.id);
    this.panel.set({ mode: 'edit', system });
    this.gridApi?.redrawRows();
  }

  closePanel(): void {
    this.panel.set(null);
    this.selectedId.set(null);
    this.gridApi?.redrawRows();
  }

  onSidenavOpenedChange(opened: boolean): void {
    if (!opened && this.panel() !== null) {
      this.closePanel();
    }
  }

  onPanelSaved(system: System): void {
    this.panel.set({ mode: 'view', system });
    this.selectedId.set(system.id);
    this.load();
  }

  confirmDelete(system: System, event?: Event): void {
    event?.stopPropagation();

    const data: ConfirmDialogData = {
      title: 'Delete system?',
      message: `“${system.name}” and all of its ports, documents, people and modules will be permanently removed.`,
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
            if (this.panel()?.system?.id === system.id) {
              this.closePanel();
            }
            this.load();
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
