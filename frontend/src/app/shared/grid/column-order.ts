import { ColDef } from 'ag-grid-community';

/**
 * `ColDef.sort`/client-side sorting only ever touches the one page of rows the backend
 * handed us — AG Grid Community has no server-side row model, so a real "sort the whole
 * table" has to stay a server round-trip. Every sortable column gets this no-op comparator
 * so AG Grid's own re-ordering is a no-op — the header still shows the sort arrow and still
 * fires `sortChanged`, but the row order actually shown is always exactly what the server
 * returned.
 */
export const NO_OP_COMPARATOR = (): number => 0;

/**
 * Reorders `defs` to match a restored/persisted `colId` order. Any id in `order` that no
 * longer matches a column (renamed/removed between releases) is silently dropped; any
 * column NOT mentioned in `order` (a new column added later, or a pinned column that is
 * never persisted) keeps its original relative position, appended at the end.
 *
 * `lockedColId`, when given, is handled separately from that generic fallback and always
 * comes back first: it's `suppressMovable` (can't be dragged) and excluded from what gets
 * persisted, so leaving it to the generic "append in original order" rule would place it
 * wherever it happened to sit in `defs` relative to whatever WAS reordered — not
 * necessarily first, which is the whole point of it being sticky.
 */
export function reorderColumnDefs<T>(
  defs: ColDef<T>[],
  order: readonly string[] | null,
  lockedColId?: string,
): ColDef<T>[] {
  const locked = lockedColId ? defs.find((def) => def.colId === lockedColId) : undefined;
  const rest = lockedColId ? defs.filter((def) => def.colId !== lockedColId) : defs;

  if (!order || order.length === 0) {
    return locked ? [locked, ...rest] : rest;
  }

  const remaining = new Map(rest.map((def) => [def.colId!, def]));
  const ordered: ColDef<T>[] = [];

  for (const colId of order) {
    const def = remaining.get(colId);
    if (def) {
      ordered.push(def);
      remaining.delete(colId);
    }
  }
  for (const def of rest) {
    if (remaining.has(def.colId!)) {
      ordered.push(def);
    }
  }

  return locked ? [locked, ...ordered] : ordered;
}
