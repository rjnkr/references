import { themeQuartz } from 'ag-grid-community';

/**
 * AG Grid's Theming API, re-tinted with the Tidalis design tokens (`src/styles/_tokens.scss`)
 * instead of hand-copied hex values, so it stays in sync if the brand palette ever changes.
 * `themeQuartz` is the closest stock theme to the flat, compact spreadsheet look the old
 * hand-rolled `mat-table` had — `.withParams()` only needs to nudge density/colour, not
 * replace the whole visual language. Shared by every AG Grid on the site (Projects,
 * Systems, ...).
 */
export const TIDALIS_GRID_THEME = themeQuartz.withParams({
  accentColor: 'var(--tidalis-blue)',
  backgroundColor: 'var(--tidalis-card-bg)',
  foregroundColor: 'var(--tidalis-text)',
  borderColor: 'var(--tidalis-border)',
  wrapperBorder: false,
  wrapperBorderRadius: 0,

  headerBackgroundColor: 'var(--tidalis-header-bg)',
  headerTextColor: 'var(--tidalis-blue-dark)',
  headerFontWeight: 700,
  headerFontSize: 12,

  fontFamily: 'var(--tidalis-font)',
  fontSize: 13,
  spacing: 6,
  rowHeight: 34,
  headerHeight: 34,

  rowHoverColor: 'var(--tidalis-row-hover)',
  selectedRowBackgroundColor: 'var(--tidalis-row-selected)',
  oddRowBackgroundColor: 'transparent',
});
