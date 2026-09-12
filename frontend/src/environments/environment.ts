/**
 * Production environment.
 *
 * `apiBaseUrl` is intentionally empty: in production the API is assumed to be served
 * under the SAME origin as this SPA (either by the same host or behind a shared
 * reverse proxy that routes `/api` and `/mcp` to the NestJS backend). Requests are
 * therefore issued as relative URLs (`/api/...`), which keeps the httpOnly
 * `tidalis_session` cookie first-party.
 *
 * If the API ever lives on a different origin, set `apiBaseUrl` to that origin
 * (e.g. `https://references-api.tidalis.com`); the backend then also needs CORS with
 * `credentials: true` and a `SameSite=None; Secure` session cookie.
 *
 * `docsUrl` is relative for the same same-origin reason - point it at an absolute URL
 * instead if `apiBaseUrl` above is ever changed to a different origin.
 *
 * `mcpUrl` is shown to the user as a copy-paste value for their own Claude config, which
 * runs on their machine, not in this browser tab - a relative URL would be meaningless
 * there, so it is built from the page's own origin at runtime instead.
 *
 * `worldMap.tileBaseUrl` points at Tidalis's own TileServer GL instance
 * (mcsse-ext-maps.tidalis.com) - a vector-tile server exposing MapLibre/Mapbox GL Style
 * Spec v8 documents (`GET /styles/<name>/style.json`), rendered client-side with
 * `ol-mapbox-style`. The available named themes (matching the ones Tidalis's own Traffic
 * Viewer offers, e.g. "ECDIS Day", "ECDIS Night", "Dark Modern") are discovered at runtime
 * from `GET {tileBaseUrl}/styles.json` (see `map-theme-catalog.ts`) rather than hard-coded
 * here, so a theme added on the server later shows up without a frontend change. CORS is
 * open (`Access-Control-Allow-Origin: *`), so these are fetched directly from the browser,
 * no backend proxy needed. The world map only ever renders a chosen style's `background`
 * and `water` layers (see `filterToBaseAndWater()` in `world-map-page.component.ts`) -
 * every nautical (IHO S-52 ENC) chart layer, from any of the style's
 * `displaybase`/`standard`/`other` sources, is dropped entirely.
 */
export const environment = {
  production: true,
  apiBaseUrl: '',
  docsUrl: '/docs',
  mcpUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}/mcp/sse`,
  worldMap: {
    tileBaseUrl: 'https://mcsse-ext-maps.tidalis.com',
  },
};
