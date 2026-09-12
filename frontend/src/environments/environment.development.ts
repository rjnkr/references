/**
 * Development environment.
 *
 * `apiBaseUrl` is empty on purpose so that every call is a relative `/api/...` URL and
 * gets forwarded by the Angular dev-server proxy (see `proxy.conf.json`) to the NestJS
 * backend on http://localhost:3000. This keeps the browser on a single origin
 * (http://localhost:4200), so the httpOnly `tidalis_session` cookie and the SAML
 * redirect chain work without CORS or `SameSite=None` gymnastics.
 *
 * Set this to `http://localhost:3000` only if you deliberately want to bypass the proxy
 * and talk to the backend cross-origin (requires CORS + `SameSite=None; Secure`).
 *
 * `docsUrl` points straight at the backend: unlike `/api` and `/mcp`, the dev-server
 * proxy does not forward `/docs`, so this needs the backend's real origin.
 *
 * `mcpUrl` is shown to the user as a copy-paste value for their own Claude config, which
 * runs on their machine, not in this browser tab - a relative URL would be meaningless
 * there, so this is always absolute, in every environment.
 *
 * `worldMap.tileBaseUrl` - see the doc comment in `environment.ts`.
 */
export const environment = {
  production: false,
  apiBaseUrl: '',
  docsUrl: 'http://localhost:3000/docs',
  mcpUrl: 'http://localhost:3000/mcp/sse',
  worldMap: {
    tileBaseUrl: 'https://mcsse-ext-maps.tidalis.com',
  },
};
