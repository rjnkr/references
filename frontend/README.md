# Tidalis Project References — Frontend

Angular SPA for recording and browsing Tidalis project references: an Excel-like,
sortable/filterable grid of past projects with a slide-in detail panel covering
financials, scope, ports, modules, people, completion dates and documents.

- **Angular 19** (standalone components, signals, functional guards/interceptors)
- **Angular Material 19** — table, sort, paginator, tabs, dialogs, menus, datepicker, form controls
- **Bootstrap 5** — layout utilities and grid, used alongside Material
- **Nunito** (Google Fonts), 14px base / 15px from the `md` breakpoint up
- Light mode only

## Quick start

```bash
# from the repository root (npm workspaces)
npm install

# start the frontend dev server (http://localhost:4200)
npm run dev:frontend        # or: npm start --workspace=frontend
```

The dev server proxies `/api` and `/mcp` to `http://localhost:3000`, so **the NestJS
backend must be running on port 3000** for sign-in and data to work:

```bash
npm run db:up          # MariaDB via docker compose
npm run dev:backend    # NestJS on :3000
```

Without the backend the app still builds and serves; it will simply land on `/login`
(the session probe fails) and the grid will show a "check that the API on :3000 is
running" banner.

### Scripts

| Command | What it does |
| --- | --- |
| `npm start` | Dev server on :4200 with the `/api` + `/mcp` proxy |
| `npm run build` | Production build into `dist/frontend` |
| `npm run watch` | Development build in watch mode |

## Auth flow

The SPA never handles a token. Everything hangs off an httpOnly `tidalis_session`
cookie set by the backend.

1. `/login` shows a single **Sign in with Tidalis SSO** button. Clicking it does a
   **full page navigation** (`window.location.href`) to `${apiBaseUrl}/api/auth/saml/login`
   — deliberately *not* an Angular router navigation, because the SAML handshake is a
   server-driven redirect chain the SPA takes no part in.
2. The backend completes SAML, sets the `tidalis_session` cookie, and redirects back to
   the frontend origin (`FRONTEND_ORIGIN`, i.e. `/`), which routes on to `/projects`.
3. On bootstrap, `provideAppInitializer` calls `AuthService.loadCurrentUser()` →
   `GET /api/auth/me`. A 200 stores `{ id, email, name }` in a signal; a 401 means
   "signed out". The initializer resolves *before* the first route activates, so
   `authGuard` can decide synchronously and a signed-in user never sees a login flash.
4. `authGuard` (functional `CanActivateFn`) protects every route except `/login` and
   redirects to `/login?returnUrl=…` when unauthenticated. `loginPageGuard` does the
   reverse, keeping signed-in users off the login page.
5. `credentialsInterceptor` sets `withCredentials: true` on **every** outgoing request
   (Angular's `HttpClient` does not send cookies cross-origin by default).
6. `authErrorInterceptor` redirects to `/login` on any 401 — except for
   `/api/auth/me` itself, which is allowed to 401 so the bootstrap probe cannot cause a
   redirect loop.
7. Logout: `POST /api/auth/logout`, then redirect to `/login`.

### Origins, the dev proxy, and `apiBaseUrl`

`src/environments/environment.ts` (prod) and `environment.development.ts` (dev) both set
`apiBaseUrl: ''`, so all calls are **relative** (`/api/...`):

- **In dev**, `proxy.conf.json` (wired into `angular.json` → `serve.options.proxyConfig`)
  forwards `/api` and `/mcp` to `http://localhost:3000`. The browser therefore stays on a
  single origin (`http://localhost:4200`), which is what makes the httpOnly session
  cookie and the SAML redirect chain work without CORS or `SameSite=None`.
- **In production** the API is *assumed to be served under the same origin* as this SPA —
  either by the same host or behind a shared reverse proxy that routes `/api` and `/mcp`
  to the NestJS app. Nothing else is configured here.

If the API ever has to live on a different origin, set `apiBaseUrl` to that origin. The
backend then also needs CORS with `credentials: true` and a `SameSite=None; Secure`
session cookie.

## Main screens

The reference data is split across two entities, each with its own screen: `/systems` (the
delivered system — scope, products, location, ports, modules, sub-systems, external
interfaces, people, documents) and `/projects` (the commercial deal around it — award date,
prices, currency, Pipedrive links, completion dates), linked by `Project.systemId`. The two
features (`features/systems/`, `features/projects/`) mirror each other structurally; the
notes below describe the Projects screen, but apply the same way to Systems.

A `.tidalis-card` holds the grid; clicking a row slides in a `mat-sidenav` (`mode="over"`,
`position="end"`) with the full detail.

**Grid**

- `mat-table` + `MatSort` + `MatPaginator`, sticky header rows, sticky first column
  (Project #) and sticky action column, cell rules for a spreadsheet feel.
- **Columns** button → `mat-menu` of checkboxes. The selection is persisted in
  `localStorage` under `tidalis.projectReferences.visibleColumns` and survives reloads;
  unknown keys are dropped so renamed columns degrade gracefully. Defaults: Project #,
  Name, Type, Country, Award date, Implementation price, Currency, Reference. Optional
  columns include Maintenance/yr, Products, Sensitive, Decommissioned, Ports (joined
  codes), Modules (joined names), and counts for ports / completion dates / subsystems /
  interfaces / people / documents.
- **Filter row** under the header, one control per visible column.

**Filtering strategy (as implemented)**

| Control | Where it runs |
| --- | --- |
| Global search box (toolbar, 300 ms debounce) | **server** — `search=` |
| Type / Country / Currency dropdowns | **server** — `projectType=`, `countryId=`, `currencyId=` |
| Sensitive / Reference / Decommissioned tri-state dropdowns | **server** — `isSensitive=`, `canBeUsedAsReference=`, `systemDecommissioned=` |
| Per-column free-text inputs | **client**, against the page currently loaded (keeps typing instant) |
| Sorting | **server** — `sort=` |
| Pagination | **server** — `page=` (1-based), `pageSize=` |

When client-side column filters are active the card subtitle says
"*N* of *M* shown on this page · *T* matching in total" so the distinction is visible.

> **Contract note — `sort` encoding.** The API contract specifies a single `sort`
> parameter without pinning its format. This client sends **`sort=<field>:<asc|desc>`**
> (e.g. `sort=awardDate:desc`). If the backend settles on something else, change the one
> place that builds it: `ProjectService.encodeSort()` in
> `src/app/core/api/project.service.ts`. Sort fields are the column `sortKey`s, which use
> the underlying property names (`countryId`, `currencyId`, `awardDate`, …).

**Detail panel** — nine `mat-tab`s over one reactive form (`FormGroup` + `FormArray`s for
the repeatable sections):

1. **General** — projectNumber, name, projectType, country, awardDate, the three flags
2. **Scope & Description** — scope (live word counter, soft-highlighted past ~200 words),
   products, description, newDevelopments, implementationDetails
3. **Financial** — currency, implementationPrice, maintenancePricePerYear
4. **Ports & Locations** — repeatable UN/LOCODE typeahead rows (`GET /api/unlocodes?search=`)
5. **Modules & Subsystems** — two repeatable string lists plus externalInterfaces (name + description)
6. **People & Contacts** — poc name/email/phone, customer & end-user details, repeatable people (name, role, email)
7. **Completion Dates** — repeatable date picker + description
8. **Documents** — existing documents (type, name, size, uploaded, download, delete) plus
   an upload control (file + document type). In create mode it shows
   "Save the project first to attach documents."
9. **Business** — pipedriveNumber, pipedriveUrl (rendered as a clickable link)

View mode disables the form; **Edit** enables it; **Delete** goes through a confirmation
dialog. Tab headers show a red dot when a tab holds an invalid field, and a failed save
jumps to the first tab with a problem. Document downloads are plain
`<a href target="_blank">` links so the browser handles `Content-Disposition` — the file
is never buffered through XHR into a blob.

## Theme

`src/styles/_tokens.scss` holds the Tidalis palette as CSS custom properties
(`--tidalis-blue: #0C4DA2`, `--tidalis-orange: #ee964b`, …).
`src/styles/_material-tidalis.scss` re-tints the Angular Material prebuilt M3 theme by
redefining its `--mat-sys-*` tokens (colour roles, the Nunito typography scale, corner
radii) rather than recompiling a Sass theme, plus a few per-component overrides.
`src/styles.scss` pulls in Bootstrap from source, points Bootstrap's own CSS variables at
the Tidalis tokens, and defines the shared `.tidalis-card` / `.tidalis-card-header` /
`.tidalis-card-body` / `.tidalis-chip` patterns.

The logo is an inline SVG wordmark (a tide glyph plus "Tidalis") — no official brand asset
was available, so it is intentionally simple and easy to swap out later.

## Layout

```
src/
├─ index.html                       Nunito + Material Icons
├─ styles.scss                      Bootstrap + tokens + shared component classes
├─ styles/
│  ├─ _tokens.scss                  Tidalis palette / typography tokens
│  └─ _material-tidalis.scss        Material --mat-sys-* re-theme
├─ environments/
│  ├─ environment.ts                prod  (apiBaseUrl: '')
│  └─ environment.development.ts    dev   (apiBaseUrl: '', proxied)
└─ app/
   ├─ app.component.*               Shell: navbar, user menu, footer
   ├─ app.config.ts                 Providers: router, http + interceptors, date adapter, session probe
   ├─ app.routes.ts                 /login, /projects (guarded), redirects
   ├─ core/
   │  ├─ api/{project,system,lookup}.service.ts
   │  ├─ auth/{auth.service,auth.guard}.ts
   │  ├─ http/{credentials,auth-error}.interceptor.ts
   │  ├─ models/{project,system,lookup,user}.model(s).ts
   │  └─ util/date-only.ts          Date-only <-> Date helpers, file-size formatting
   ├─ shared/
   │  ├─ confirm-dialog/
   │  ├─ grid/                      AG Grid setup, theme, column-order + row-actions renderer
   │  ├─ unlocode-autocomplete/     ControlValueAccessor typeahead
   │  └─ system-autocomplete/       ControlValueAccessor typeahead (links a Project to a System)
   └─ features/
      ├─ login/
      ├─ projects/
      │  ├─ projects-page.component.*        Grid, filters, column visibility, panel host
      │  ├─ grid/project-column-defs.ts      Column definitions
      │  └─ project-detail-panel/            Reactive form (commercial fields only)
      └─ systems/
         ├─ systems-page.component.*         Grid, filters, column visibility, panel host
         ├─ grid/system-column-defs.ts       Column definitions
         └─ system-detail-panel/             Reactive form + documents
```

## Notes & limitations

- **Angular 19, not 20+.** The local toolchain runs Node 20.17.0; Angular 20's CLI
  requires Node ≥ 20.19. Angular 19 is the latest release that runs on this Node, so the
  app is scaffolded on 19. Bumping Node makes an `ng update` to 20/21 straightforward.
- Dates are converted with local-calendar formatting (`src/app/core/util/date-only.ts`)
  rather than `toISOString()`, which would shift the day for anyone west of UTC.
- No unit or e2e tests, and no admin CRUD screens for the lookup tables
  (Currency / Country / UnLocode / DocumentType) — they are read-only dropdown sources,
  as scoped.
- The production budget for the initial bundle was raised (Bootstrap + Material together
  exceed the CLI's default 1 MB raw ceiling); the build is ~830 kB raw / ~170 kB
  transferred.
- Building emits one harmless warning — "4 rules skipped due to selector errors" — from
  the CSS optimiser parsing a few legacy Bootstrap 5.3 selectors. It does not affect the
  output.
