import { ColDef } from 'ag-grid-community';

import { CONTRACT_TYPE_LABELS } from '../../../core/models/contract.models';
import { System } from '../../../core/models/system.models';
import { MapSelectionService } from '../../../core/services/map-selection.service';
import { BoolChipCellRendererComponent, BoolChipVariant } from '../../../shared/grid/bool-chip-cell-renderer.component';
import { NO_OP_COMPARATOR } from '../../../shared/grid/column-order';
import { EnumChipCellRendererComponent } from '../../../shared/grid/enum-chip-cell-renderer.component';
import { RowActionsCellRendererComponent } from '../../../shared/grid/row-actions-cell-renderer.component';
import { TagChipsCellRendererComponent } from '../../../shared/grid/tag-chips-cell-renderer.component';
import { ModuleListCellRendererComponent } from './module-list-cell-renderer.component';
import { SelectAllOnMapHeaderComponent } from './select-all-on-map-header.component';
import { ShowOnMapCellRendererComponent } from './show-on-map-cell-renderer.component';
import { SystemNameCellRendererComponent } from './system-name-cell-renderer.component';

/** Column ids the "Columns" visibility menu shows by default; the rest are opt-in. */
export const DEFAULT_VISIBLE_COLUMN_IDS = [
  'name',
  'contractType',
  'country',
  'products',
  'tags',
  'canBeUsedAsReference',
];

/** Pinned to the right; never hidden, never part of the "Columns" menu. */
export const ACTIONS_COLUMN_ID = 'actions';

/** Pinned to the left as the very first column; never hidden, never part of the "Columns"
 *  menu — same treatment as `ACTIONS_COLUMN_ID`, just on the other edge of the grid. */
export const SHOW_ON_MAP_COLUMN_ID = 'showOnMap';

/** Every valid TOGGLEABLE column id, default-visible or not — used to sanitise a
 *  restored/persisted selection (a column can be renamed/removed between releases).
 *  Deliberately excludes `ACTIONS_COLUMN_ID` and `SHOW_ON_MAP_COLUMN_ID`, which are never
 *  hidden and so never go through that selection. */
export const ALL_COLUMN_IDS = [
  'name',
  'contractType',
  'country',
  'products',
  'tags',
  'canBeUsedAsReference',
  'isSensitive',
  'systemDecommissioned',
  'ports',
  'portsCount',
  'modules',
  'subSystemsCount',
  'externalInterfacesCount',
  'peopleCount',
  'documentsCount',
  'pocName',
  'customerDetails',
  'endUserDetails',
  'updatedAt',
];

/** `colId` → the field name the backend's `sort` query param expects (`buildOrderBy`). Only
 *  columns present here are sortable; everything else (derived/joined/count columns) isn't,
 *  matching what the backend can actually order by. */
export const COLUMN_SORT_KEYS: Record<string, string> = {
  name: 'name',
  contractType: 'contractType',
  country: 'countryId',
  canBeUsedAsReference: 'canBeUsedAsReference',
  isSensitive: 'isSensitive',
  systemDecommissioned: 'systemDecommissioned',
  pocName: 'pocName',
  updatedAt: 'updatedAt',
};

const yesNo = (value: boolean | null | undefined): string => (value ? 'Yes' : 'No');

const dateOnly = (value: string | null | undefined): Date | null => (value ? new Date(value) : null);

const formatDate = (value: Date | null): string =>
  value ? value.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

/** A system's ports, minus its own location — that's shown separately (as the green
 *  marker on the map, and its own field elsewhere), so listing it again under "ports"
 *  would just be a confusing duplicate, e.g. if it was also added there by mistake. */
const nonSystemPorts = (system: System) =>
  (system.ports ?? []).filter((port) => port.unlocodeId !== system.systemUnlocodeId);

function boolColumn(
  colId: 'canBeUsedAsReference' | 'isSensitive' | 'systemDecommissioned',
  headerName: string,
  variant: BoolChipVariant,
  width: number,
): ColDef<System> {
  return {
    colId,
    field: colId,
    headerName,
    width,
    sortable: true,
    comparator: NO_OP_COMPARATOR,
    valueGetter: (params) => yesNo(params.data?.[colId]),
    // Not `agSetColumnFilter` — the Set Filter is Enterprise-only; ag-grid-community's
    // bundle merely knows its *name* for error-message purposes, so it silently renders an
    // empty, non-functional floating filter instead of erroring at build time. A text
    // filter against the same 'Yes'/'No' string this valueGetter already returns is a
    // genuine Community feature and reads just as naturally (type "yes" or "no").
    filter: 'agTextColumnFilter',
    floatingFilter: true,
    cellRenderer: BoolChipCellRendererComponent,
    cellRendererParams: { variant },
  };
}

function countColumn(
  colId: string,
  headerName: string,
  getCount: (system: System) => number,
  width: number,
): ColDef<System> {
  return {
    colId,
    headerName,
    width,
    sortable: false,
    filter: 'agNumberColumnFilter',
    floatingFilter: true,
    type: 'rightAligned',
    cellClass: 'ag-right-aligned-cell cell--num',
    valueGetter: (params) => (params.data ? getCount(params.data) : 0),
  };
}

/**
 * Every column the grid can show, with `hide` set from `visibleColumnIds` — normally the
 * restored (or default) selection from the "Columns" menu, persisted in localStorage by
 * `SystemsPageComponent`. Nested collections are summarised as counts rather than exploded
 * into columns of their own.
 *
 * `mapSelection` backs the "Map" column — per-user/browser-local (`MapSelectionService`),
 * not a saved system property, so unlike every other column here it has no backend field
 * to sort by.
 */
export function buildSystemColumnDefs(
  visibleColumnIds: readonly string[],
  mapSelection: MapSelectionService,
): ColDef<System>[] {
  const defs: ColDef<System>[] = [
    {
      colId: 'showOnMap',
      headerName: 'Map',
      headerComponent: SelectAllOnMapHeaderComponent,
      width: 90,
      pinned: 'left',
      lockPinned: true,
      suppressMovable: true,
      resizable: false,
      sortable: false,
      valueGetter: (params) => (params.data ? yesNo(mapSelection.isShown(params.data.id)) : ''),
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      cellRenderer: ShowOnMapCellRendererComponent,
    },
    {
      colId: 'name',
      field: 'name',
      headerName: 'Name',
      width: 260,
      pinned: 'left',
      lockPinned: true,
      // Dragging one pinned-left column past another triggers an AG Grid bug in this
      // version that leaves the dragged column's cells blank until reload (reproduced with
      // plain `pinned: 'left'` on both this column and `showOnMap`, no lock flags at all).
      // Making both pinned columns immovable sidesteps it entirely, at the acceptable cost
      // of not being able to drag Name to further-left than its default position (2nd,
      // right after the always-first "Map" column).
      suppressMovable: true,
      sortable: true,
      comparator: NO_OP_COMPARATOR,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      tooltipField: 'name',
      cellClass: 'cell-clip cell-strong',
      cellRenderer: SystemNameCellRendererComponent,
    },
    {
      colId: 'contractType',
      headerName: 'Type',
      width: 110,
      sortable: true,
      comparator: NO_OP_COMPARATOR,
      valueGetter: (params) =>
        params.data ? (CONTRACT_TYPE_LABELS[params.data.contractType] ?? params.data.contractType) : '',
      // See the note in `boolColumn` — `agSetColumnFilter` is Enterprise-only and renders an
      // empty, non-functional floating filter under Community. Text search against the same
      // label this valueGetter returns (e.g. "VTS") is the genuine Community equivalent.
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      cellRenderer: EnumChipCellRendererComponent,
    },
    {
      colId: 'country',
      headerName: 'Country',
      width: 160,
      sortable: true,
      comparator: NO_OP_COMPARATOR,
      valueGetter: (params) => params.data?.country?.name ?? '',
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      cellClass: 'cell-clip',
    },
    {
      colId: 'products',
      headerName: 'Products',
      width: 220,
      sortable: false,
      valueGetter: (params) =>
        (params.data?.products ?? []).map((assignment) => assignment.product.name).join(', '),
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      tooltipValueGetter: (params) => params.value,
      cellClass: 'cell-clip',
    },
    {
      colId: 'tags',
      headerName: 'Tags',
      width: 200,
      sortable: false,
      valueGetter: (params) => params.data?.tags ?? [],
      filterValueGetter: (params) =>
        (params.data?.tags ?? []).map((assignment) => assignment.tag.name).join(', '),
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      cellRenderer: TagChipsCellRendererComponent,
    },
    boolColumn('canBeUsedAsReference', 'Reference', 'green', 115),

    /* --- Optional columns ----------------------------------------------------------- */

    boolColumn('isSensitive', 'Sensitive', 'orange', 110),
    boolColumn('systemDecommissioned', 'Decommissioned', 'red', 150),
    {
      colId: 'ports',
      headerName: 'Ports',
      width: 190,
      sortable: false,
      valueGetter: (params) =>
        params.data
          ? nonSystemPorts(params.data)
              .map((port) => port.unlocode?.code)
              .filter(Boolean)
              .join(', ')
          : '',
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      cellClass: 'cell-clip',
    },
    countColumn('portsCount', '# Ports', (s) => nonSystemPorts(s).length, 95),
    {
      colId: 'modules',
      headerName: 'Functions',
      width: 220,
      sortable: false,
      autoHeight: true,
      wrapText: true,
      valueGetter: (params) => params.data?.modules ?? [],
      filterValueGetter: (params) =>
        (params.data?.modules ?? []).map((m) => m.module.name).join(', '),
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      cellRenderer: ModuleListCellRendererComponent,
    },
    countColumn('subSystemsCount', '# Subsystems', (s) => (s.subSystems ?? []).length, 140),
    countColumn(
      'externalInterfacesCount',
      '# Interfaces',
      (s) => (s.externalInterfaces ?? []).length,
      130,
    ),
    countColumn('peopleCount', '# People', (s) => (s.people ?? []).length, 110),
    countColumn('documentsCount', '# Documents', (s) => (s.documents ?? []).length, 135),
    {
      colId: 'pocName',
      field: 'pocName',
      headerName: 'Point of contact',
      width: 180,
      sortable: true,
      comparator: NO_OP_COMPARATOR,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
    },
    {
      colId: 'customerDetails',
      field: 'customerDetails',
      headerName: 'Customer',
      width: 220,
      sortable: false,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      tooltipField: 'customerDetails',
      cellClass: 'cell-clip',
    },
    {
      colId: 'endUserDetails',
      field: 'endUserDetails',
      headerName: 'End user',
      width: 220,
      sortable: false,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      tooltipField: 'endUserDetails',
      cellClass: 'cell-clip',
    },
    {
      colId: 'updatedAt',
      headerName: 'Last updated',
      width: 135,
      sortable: true,
      comparator: NO_OP_COMPARATOR,
      valueGetter: (params) => dateOnly(params.data?.updatedAt),
      valueFormatter: (params) => formatDate(params.value),
      filter: 'agDateColumnFilter',
      floatingFilter: true,
    },

    /* --- Actions — pinned, not part of the "Columns" menu --------------------------- */
    {
      colId: ACTIONS_COLUMN_ID,
      headerName: '',
      width: 92,
      pinned: 'right',
      lockPinned: true,
      sortable: false,
      filter: false,
      resizable: false,
      suppressMovable: true,
      cellClass: 'actions-cell',
      headerClass: 'actions-cell',
      cellRenderer: RowActionsCellRendererComponent,
    },
  ];

  for (const def of defs) {
    if (def.colId !== ACTIONS_COLUMN_ID && def.colId !== SHOW_ON_MAP_COLUMN_ID) {
      def.hide = !visibleColumnIds.includes(def.colId!);
    }
  }

  return defs;
}
