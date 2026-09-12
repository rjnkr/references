/** One named colour theme for the world map's base layer, as offered by the tile
 *  server's own style catalog. */
export interface MapThemeOption {
  id: string;
  label: string;
  styleUrl: string;
}

/** Style id -> the exact wording Tidalis's own Traffic Viewer uses for it, so the two
 *  apps read as the same product. An id the server adds later that isn't in this map
 *  still shows up (see `humanizeThemeId`) - just without the curated wording. */
const KNOWN_THEME_LABELS: Record<string, string> = {
  'ecdis-day': 'ECDIS Day',
  'ecdis-day-white-back': 'ECDIS Day White Background',
  'ecdis-day-black-back': 'ECDIS Day Black Background',
  'ecdis-night': 'ECDIS Night',
  dark: 'Dark Modern',
  light: 'Light Modern',
};

function humanizeThemeId(id: string): string {
  return id
    .split('-')
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
}

export function themeLabelFor(id: string): string {
  return KNOWN_THEME_LABELS[id] ?? humanizeThemeId(id);
}

/** Shape of one entry in a TileServer GL instance's `GET /styles.json`. */
interface TileServerStyleEntry {
  id: string;
  name: string;
  url: string;
}

/**
 * Fetches the tile server's own list of available styles rather than hard-coding a
 * fixed set - a theme added on the server (or renamed) shows up here automatically,
 * with no frontend deploy needed. CORS on this endpoint is open, same as the individual
 * `style.json` documents `world-map-page.component.ts` already fetches directly.
 */
export async function fetchMapThemeCatalog(tileBaseUrl: string): Promise<MapThemeOption[]> {
  const response = await fetch(`${tileBaseUrl}/styles.json`);
  const entries = (await response.json()) as TileServerStyleEntry[];
  return entries.map((entry) => ({
    id: entry.id,
    label: themeLabelFor(entry.id),
    styleUrl: entry.url,
  }));
}
