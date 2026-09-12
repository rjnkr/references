import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';

/**
 * Registers every AG Grid Community module (client-side row model, the Text/Number/Date
 * column filters, floating filters, quick filter, cell renderers, column pinning…). Note
 * that the Set Filter is *not* among them — it's Enterprise-only, see the comment in
 * `contract-column-defs.ts`/`system-column-defs.ts`. A side-effect import — safe to import
 * more than once, the registry just no-ops after the first call. Imported from every page
 * that uses the grid (Contracts, Systems, ...).
 */
ModuleRegistry.registerModules([AllCommunityModule]);
