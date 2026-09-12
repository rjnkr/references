import { RowActionsGridContext } from '../../../shared/grid/row-actions-cell-renderer.component';
import { System } from '../../../core/models/system.models';

/**
 * What the grid's `context` must provide for any cell/header renderer to call back into
 * the page component. The "Map" column no longer needs anything here — it reads/writes
 * `MapSelectionService` directly — so this is just the shared row-actions context.
 */
export type SystemGridContext = RowActionsGridContext<System>;
