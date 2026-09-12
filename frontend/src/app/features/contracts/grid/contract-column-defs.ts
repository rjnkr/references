import { ColDef } from 'ag-grid-community';

import { CONTRACT_TAG_LABELS, Contract } from '../../../core/models/contract.models';
import { NO_OP_COMPARATOR } from '../../../shared/grid/column-order';
import { RowActionsCellRendererComponent } from '../../../shared/grid/row-actions-cell-renderer.component';
import { TagChipsCellRendererComponent } from '../../../shared/grid/tag-chips-cell-renderer.component';

/** Column ids the "Columns" visibility menu shows by default; the rest are opt-in. */
export const DEFAULT_VISIBLE_COLUMN_IDS = [
  'name',
  'contractNumber',
  'system',
  'awardDate',
  'implementationPrice',
  'currency',
];

/** Pinned to the right; never hidden, never part of the "Columns" menu. */
export const ACTIONS_COLUMN_ID = 'actions';

/** Every valid TOGGLEABLE column id, default-visible or not — used to sanitise a
 *  restored/persisted selection (a column can be renamed/removed between releases). */
export const ALL_COLUMN_IDS = [
  'name',
  'contractNumber',
  'system',
  'awardDate',
  'endDate',
  'contractType',
  'tags',
  'implementationPrice',
  'currency',
  'maintenancePricePerYear',
  'completionDatesCount',
  'documentsCount',
  'pipedriveNumber',
  'updatedAt',
];

/** `colId` → the field name the backend's `sort` query param expects (`buildOrderBy`). Only
 *  columns present here are sortable; everything else (derived/joined/count columns) isn't,
 *  matching what the backend can actually order by. */
export const COLUMN_SORT_KEYS: Record<string, string> = {
  contractNumber: 'contractNumber',
  name: 'name',
  system: 'systemId',
  awardDate: 'awardDate',
  endDate: 'endDate',
  implementationPrice: 'implementationPrice',
  currency: 'currencyId',
  maintenancePricePerYear: 'maintenancePricePerYear',
  pipedriveNumber: 'pipedriveNumber',
  updatedAt: 'updatedAt',
};

const money = (value: number | null | undefined, currencySymbol?: string | null): string => {
  if (value === null || value === undefined) {
    return '';
  }
  const formatted = value.toLocaleString('en-GB');
  return currencySymbol ? `${currencySymbol} ${formatted}` : formatted;
};

const dateOnly = (value: string | null | undefined): Date | null => (value ? new Date(value) : null);

const formatDate = (value: Date | null): string =>
  value ? value.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

/**
 * Every column the grid can show, with `hide` set from `visibleColumnIds` — normally the
 * restored (or default) selection from the "Columns" menu, persisted in localStorage by
 * `ContractsPageComponent`.
 */
export function buildContractColumnDefs(visibleColumnIds: readonly string[]): ColDef<Contract>[] {
  const defs: ColDef<Contract>[] = [
    {
      colId: 'name',
      field: 'name',
      headerName: 'Name',
      width: 220,
      pinned: 'left',
      lockPinned: true,
      suppressMovable: true,
      sortable: true,
      comparator: NO_OP_COMPARATOR,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      tooltipField: 'name',
      cellClass: 'cell-clip cell-strong',
    },
    {
      colId: 'contractNumber',
      field: 'contractNumber',
      headerName: 'Contract #',
      width: 150,
      sortable: true,
      comparator: NO_OP_COMPARATOR,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      valueFormatter: (params) => params.value || '—',
    },
    {
      colId: 'system',
      headerName: 'System',
      width: 240,
      sortable: true,
      comparator: NO_OP_COMPARATOR,
      valueGetter: (params) => params.data?.system?.name ?? '',
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      tooltipValueGetter: (params) => params.data?.system?.name ?? '',
      cellClass: 'cell-clip',
    },
    {
      colId: 'awardDate',
      headerName: 'Award date',
      width: 125,
      sortable: true,
      comparator: NO_OP_COMPARATOR,
      valueGetter: (params) => dateOnly(params.data?.awardDate),
      valueFormatter: (params) => formatDate(params.value),
      filter: 'agDateColumnFilter',
      floatingFilter: true,
    },
    {
      colId: 'implementationPrice',
      field: 'implementationPrice',
      headerName: 'Implementation',
      width: 145,
      sortable: true,
      comparator: NO_OP_COMPARATOR,
      type: 'rightAligned',
      cellClass: 'ag-right-aligned-cell cell--num',
      valueFormatter: (params) =>
        money(params.value, params.data?.currency?.symbol || params.data?.currency?.code),
      filter: 'agNumberColumnFilter',
      floatingFilter: true,
    },
    {
      colId: 'currency',
      headerName: 'Currency',
      width: 100,
      sortable: true,
      comparator: NO_OP_COMPARATOR,
      valueGetter: (params) => params.data?.currency?.code ?? '',
      filter: 'agTextColumnFilter',
      floatingFilter: true,
    },

    /* --- Optional columns ----------------------------------------------------------- */

    {
      colId: 'endDate',
      headerName: 'End date',
      width: 125,
      sortable: true,
      comparator: NO_OP_COMPARATOR,
      valueGetter: (params) => dateOnly(params.data?.endDate),
      valueFormatter: (params) => formatDate(params.value),
      filter: 'agDateColumnFilter',
      floatingFilter: true,
    },
    {
      colId: 'contractType',
      headerName: 'Contract type',
      width: 180,
      sortable: false,
      valueGetter: (params) =>
        (params.data?.contractType ?? []).map((tag) => CONTRACT_TAG_LABELS[tag] ?? tag).join(', '),
      filter: 'agTextColumnFilter',
      floatingFilter: true,
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
    {
      colId: 'maintenancePricePerYear',
      field: 'maintenancePricePerYear',
      headerName: 'Maintenance / yr',
      width: 150,
      sortable: true,
      comparator: NO_OP_COMPARATOR,
      type: 'rightAligned',
      cellClass: 'ag-right-aligned-cell cell--num',
      valueFormatter: (params) =>
        money(params.value, params.data?.currency?.symbol || params.data?.currency?.code),
      filter: 'agNumberColumnFilter',
      floatingFilter: true,
    },
    {
      colId: 'completionDatesCount',
      headerName: '# Completion dates',
      width: 165,
      sortable: false,
      filter: 'agNumberColumnFilter',
      floatingFilter: true,
      type: 'rightAligned',
      cellClass: 'ag-right-aligned-cell cell--num',
      valueGetter: (params) => (params.data?.completionDates ?? []).length,
    },
    {
      colId: 'documentsCount',
      headerName: '# Documents',
      width: 135,
      sortable: false,
      filter: 'agNumberColumnFilter',
      floatingFilter: true,
      type: 'rightAligned',
      cellClass: 'ag-right-aligned-cell cell--num',
      valueGetter: (params) => (params.data?.documents ?? []).length,
    },
    {
      colId: 'pipedriveNumber',
      field: 'pipedriveNumber',
      headerName: 'Pipedrive #',
      width: 130,
      sortable: true,
      comparator: NO_OP_COMPARATOR,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
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
    if (def.colId !== ACTIONS_COLUMN_ID) {
      def.hide = !visibleColumnIds.includes(def.colId!);
    }
  }

  return defs;
}
