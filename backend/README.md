# Tidalis Project References — API

NestJS + TypeScript backend for recording Tidalis project references, split across two
entities: `System` (the delivered system itself — scope, products, location, ports,
modules, sub-systems, external interfaces, people and documents) and `Project` (the
commercial deal around it — award date, prices, currency, Pipedrive links and completion
dates). A `Project` optionally links to the `System` it relates to via `systemId`; several
projects (e.g. an implementation plus later maintenance renewals) can link to the same
system. Read-heavy internal tool, protected by Tidalis SSO (SAML 2.0), with a Prisma/MariaDB
data layer, Swagger docs and an MCP server so AI applications can query the reference
database.

## Stack

| Concern      | Choice                                                                 |
| ------------ | ---------------------------------------------------------------------- |
| Framework    | NestJS 11 (`@nestjs/platform-express`)                                 |
| ORM          | Prisma 6, multi-file schema under `prisma/schema/`                     |
| Database     | MariaDB 11 (MySQL wire protocol, so the Prisma `mysql` provider)       |
| DTOs         | Generated from the schema by `@brakebein/prisma-generator-nestjs-dto`  |
| Auth         | SAML 2.0 SSO → signed httpOnly JWT session cookie                      |
| API docs     | Swagger UI at `/docs`                                                  |
| AI access    | MCP server over HTTP/SSE at `/mcp/sse`                                 |

## Getting started

From the repository root, start the database:

```bash
npm run db:up            # docker compose up -d mariadb  (MariaDB on host port 3308)
```

Then, in `backend/`:

```bash
cp .env.example .env     # adjust if your database is elsewhere
npm install              # works from backend/ or from the repo root (npm workspaces)
npx prisma generate      # Prisma client + the DTOs in src/generated/ (no database needed)
npx prisma migrate dev   # creates the schema; name the first migration e.g. "init"
npx prisma db seed       # currencies, all ISO countries, document types, starter UN/LOCODEs
npm run start:dev        # watch mode on http://localhost:3000
```

- REST API: `http://localhost:3000/api/...`
- Swagger UI: `http://localhost:3000/docs`
- MCP endpoint: `http://localhost:3000/mcp/sse`

`src/generated/` is git-ignored, so **`npx prisma generate` must be run after every clone and
after every schema change** — the project does not compile without it.

### npm scripts

| Script                    | What it does                                        |
| ------------------------- | --------------------------------------------------- |
| `npm run start:dev`       | Watch-mode development server                       |
| `npm run build`           | Compile to `dist/`                                   |
| `npm run start:prod`      | Run the compiled build                              |
| `npm run typecheck`       | `tsc --noEmit`                                      |
| `npm run prisma:generate` | Regenerate the Prisma client and the DTOs           |
| `npm run prisma:migrate`  | `prisma migrate dev`                                |
| `npm run prisma:deploy`   | `prisma migrate deploy` (for deployments)           |
| `npm run seed`            | `prisma db seed`                                    |
| `npm run import:unlocodes`| Bulk import the official UN/LOCODE CSV (see below)  |

## Project layout

```
prisma/
  schema/                 one file per model + schema.prisma (datasource/generators)
  seed.ts                 lookup table seed data
  import-unlocodes.ts     bulk importer for the full UNECE UN/LOCODE dataset
prisma.config.ts          Prisma 6 config, points at the prisma/schema folder
src/
  main.ts                 bootstrap: CORS, cookies, /api prefix, validation, filters, Swagger
  app.module.ts           wires the feature modules and the global auth guard
  config/configuration.ts env → typed config consumed via ConfigService
  core/                   CoreModule (Prisma provider), exception filters, decorators, validators
  database/db-service/    DbService — PrismaClient as an injectable provider
  generated/nestjs-dto/   generated, git-ignored
  modules/
    auth/                 SAML strategy, session cookie, guards
    currencies/ countries/ unlocodes/ document-types/    lookup CRUD
    projects/             projects (commercial deal) + completion dates
    systems/               systems (delivered system) + nested children + document upload/download
    audit-logs/            read-only Project audit trail
    system-audit-logs/     read-only System audit trail
    map/                   world-map reference points (plots Systems)
  mcp/                    MCP server (HTTP/SSE) for AI applications
```

## Configuration

Every setting is an environment variable; see `.env.example` for the full list with comments.
The ones you are most likely to change:

| Variable          | Default                                                          |
| ----------------- | ---------------------------------------------------------------- |
| `DATABASE_URL`    | `mysql://tidalis:changeme@localhost:3308/tidalis_references`      |
| `PORT`            | `3000`                                                           |
| `FRONTEND_ORIGIN` | `http://localhost:4200` (CORS origin and post-login redirect)    |
| `STORAGE_DIR`     | `./storage/documents`                                            |
| `MAX_UPLOAD_MB`   | `25`                                                             |
| `JWT_SECRET`      | `change_me_dev_secret` — **replace in production**               |
| `MCP_API_KEY`     | `change_me_mcp_key` — **replace in production**                  |

## API

All REST routes live under the `/api` prefix. `/docs` and `/mcp/*` sit outside it.

### Lookup tables

Plain CRUD, all admin-manageable and seeded:

```
GET|POST            /api/currencies
GET|PATCH|DELETE    /api/currencies/:id
GET|POST            /api/countries
GET|PATCH|DELETE    /api/countries/:id
GET|POST            /api/unlocodes          ?search=  matches code or location name (max 50 hits)
GET|PATCH|DELETE    /api/unlocodes/:id
GET|POST            /api/document-types
GET|PATCH|DELETE    /api/document-types/:id
```

### Systems

```
GET    /api/systems               list, filtered/sorted/paged
POST   /api/systems               create, full nested payload, one transaction
GET    /api/systems/:id           one system, fully expanded
PATCH  /api/systems/:id           patch scalars and/or replace child collections
DELETE /api/systems/:id           soft delete (restorable from its audit trail entry)
POST   /api/systems/:id/restore   undo a soft delete
```

`GET /api/systems` query parameters:

`search` (matches name, products), `projectType`, `countryId`, `isSensitive`,
`canBeUsedAsReference`, `systemDecommissioned`, `sort`, `page`, `pageSize`.

`sort` takes a field name, prefixed with `-` for descending, e.g. `sort=-createdAt`. Allowed
fields: `id`, `name`, `projectType`, `products`, `countryId`, `isSensitive`,
`canBeUsedAsReference`, `showOnMap`, `systemDecommissioned`, `pocName`, `createdAt`,
`updatedAt`. Anything else is a 400. Default sort is `name` ascending; default paging is
`page=1&pageSize=25` (max 500).

Response shape:

```json
{ "data": [ /* fully expanded systems */ ], "total": 141 }
```

Every system — in the list as well as in the detail endpoint — comes back fully expanded:
`country`, `systemUnlocode` (with its own `country`), `ports` (each with its `unlocode`,
itself with its `country`), `modules`, `subSystems`, `externalInterfaces`, `people` and
`documents` (each with its `documentType`). The list view therefore needs no follow-up
requests.

#### Create / update payload

`POST` takes the scalar fields plus the child collections in one body. Two of the collections
accept either a compact or an object form, whichever is easier for the client:

```json
{
  "name": "Port of Rotterdam VTS",
  "scope": "Replacement of the existing VTS ... (max 200 words)",
  "projectType": "VTS",
  "products": "VTS Suite, Radar Processing",
  "countryId": 155,
  "systemUnlocodeId": 12,

  "ports": [12, 34],
  "modules": ["Vessel Traffic Image", "Reporting"],
  "subSystems": ["VHF", "CCTV", "Radar"],
  "externalInterfaces": [{ "name": "AIS feed", "description": "National AIS network" }],
  "people": [{ "name": "J. Jansen", "role": "Project Manager", "email": "j.jansen@tidalis.com" }]
}
```

- `ports` — a list of `UnLocode` ids, or of `{ "unlocodeId": 12 }` objects. Duplicates are
  collapsed.
- `modules` / `subSystems` — a list of names, or of `{ "name": "..." }` objects.
- `scope` is `TEXT` in the database but capped at **200 words** by a `@MaxWords(200)` validator,
  because that is a business rule rather than a storage limit.

`PATCH` uses the same shape, everything optional. A child collection **present** in the body
replaces the existing rows entirely (delete + recreate in one transaction); a collection that is
**absent** is left untouched; an **empty array** clears it. Documents are never touched by
`PATCH` — they have their own endpoints.

### Projects

```
GET    /api/projects               list, filtered/sorted/paged
POST   /api/projects               create, full nested payload, one transaction
GET    /api/projects/:id           one project, fully expanded
PATCH  /api/projects/:id           patch scalars and/or replace `completionDates`
DELETE /api/projects/:id           soft delete (restorable from its audit trail entry)
POST   /api/projects/:id/restore   undo a soft delete
```

`GET /api/projects` query parameters: `search` (matches projectNumber), `currencyId`,
`systemId` (find the projects linked to a given system), `sort`, `page`, `pageSize`.

Response shape:

```json
{ "data": [ /* fully expanded projects */ ], "total": 141 }
```

Every project comes back with `currency`, `completionDates`, and `system` — a summary of the
linked `System` (or `null` if this project doesn't link to one).

```json
{
  "projectNumber": "TID-2024-017",
  "awardDate": "2024-02-01",
  "implementationPrice": 4500000,
  "maintenancePricePerYear": 320000,
  "currencyId": 1,
  "systemId": 42,
  "completionDates": [{ "completionDate": "2025-06-30", "description": "Phase 1" }]
}
```

### Documents

Documents belong to a `System`, not a `Project`:

```
GET    /api/systems/:id/documents                 list metadata
POST   /api/systems/:id/documents                 multipart/form-data upload
GET    /api/systems/:id/documents/:documentId     download the file
DELETE /api/systems/:id/documents/:documentId     delete row + file
```

Upload fields: `file` (the file) and `documentType` (a `DocumentType` id; `documentTypeId` is
accepted as an alias). Files are stored at `STORAGE_DIR/<systemId>/<uuid><original extension>`
and only that relative path goes into the database, so the storage root can be moved without
touching data — and a document uploaded before the Project/System split keeps its original
`<projectId>/...` path unchanged, since `filePath` is opaque. `MAX_UPLOAD_MB` (default 25) caps
the size.

Deleting a document removes the file from disk on a best-effort basis before the row is
removed; a file that cannot be removed is logged and ignored.

## Authentication — Tidalis SSO (SAML 2.0)

Service-provider-initiated only. Unsolicited assertions are rejected
(`validateInResponseTo: always`, the equivalent of Sustainsys' `AllowUnsolicitedAuthnResponse =
false`).

```
GET  /api/auth/saml/login       redirect to the Tidalis IdP  (point the frontend here)
POST /api/auth/saml/callback    assertion consumer service (HTTP-POST binding)
GET  /api/auth/saml/metadata    SP metadata XML to hand to Tidalis IT
GET  /api/auth/me               { id, email, name } or 401
POST /api/auth/logout           clears the session cookie
```

On a successful assertion the e-mail is taken from the profile (`email` / `mail` / the
e-mail claim / `nameID`), a `User` row is auto-provisioned or refreshed (`lastLoginAt`), a JWT
`{ sub, email }` is signed with `JWT_SECRET` and set as the `tidalis_session` cookie
(`httpOnly`, `sameSite=lax`, `secure` in production only), and the browser is redirected to
`FRONTEND_ORIGIN`.

`JwtCookieAuthGuard` is registered globally as `APP_GUARD`, so **every route is protected by
default**. The SSO handshake, `/api/auth/me`, `/api/auth/logout` and the MCP endpoints opt out
with the `@Public()` decorator; the MCP endpoints then apply their own API-key guard.

### ⚠️ Manual follow-up: obtain the real IdP metadata

This is the one thing that cannot be finished from the code side. **Request the following from
Tidalis IT (or whoever owns the SSO identity provider) and fill them in in `.env`:**

| Variable             | What to ask for                                                        |
| -------------------- | ---------------------------------------------------------------------- |
| `SAML_IDP_ENTITY_ID` | The IdP's entity id                                                    |
| `SAML_IDP_SSO_URL`   | The single sign-on endpoint (HTTP-Redirect binding)                    |
| `SAML_IDP_CERT`      | The IdP's signing certificate, base64 DER on **one line**, no PEM header/footer |

You will also need to give them our side, which the API can generate for you once the above are
set: `SAML_SP_ENTITY_ID` / `SAML_ISSUER` (default `urn:tidalis:project-references`), the ACS URL
`SAML_CALLBACK_URL` (default `http://localhost:3000/api/auth/saml/callback` — use the real
hostname in production), and the SP metadata XML from `GET /api/auth/saml/metadata`.

**Until then the application still runs.** If `SAML_IDP_SSO_URL` or `SAML_IDP_CERT` is empty the
strategy is simply not registered: a warning is logged at boot and the SSO endpoints answer
`503` instead of crashing. To work on the API locally without any login at all, set:

```
AUTH_DISABLED=true
DEV_USER_EMAIL=your.name@tidalis.com
```

The global guard then injects that stand-in user instead of rejecting requests. **Never enable
`AUTH_DISABLED` outside local development.**

Note that the in-flight `InResponseTo` ids are kept in node-saml's default in-memory cache, so
logins in progress are lost on a restart and a single instance is assumed. Supply a shared
`cacheProvider` in `src/modules/auth/strategies/saml.strategy.ts` before scaling out.

## MCP server (for AI applications)

An MCP server is exposed over HTTP/SSE, outside the `/api` prefix:

```
GET  /mcp/sse                       open the event stream (also reachable as GET /mcp)
POST /mcp/messages?sessionId=...    the client posts JSON-RPC here
```

Machine clients cannot follow a browser SSO redirect, so the MCP endpoint uses a shared secret
instead of the session cookie: send the `X-MCP-Key` header, checked against `MCP_API_KEY`. If
`MCP_API_KEY` is unset the endpoint is **closed**, not open.

Example client configuration:

```json
{
  "mcpServers": {
    "tidalis-references": {
      "url": "http://localhost:3000/mcp/sse",
      "headers": { "X-MCP-Key": "change_me_mcp_key" }
    }
  }
}
```

Or with curl, to check it by hand:

```bash
curl -N -H "X-MCP-Key: change_me_mcp_key" http://localhost:3000/mcp/sse
```

The frontend's "Connect Claude" page (linked from the home screen) shows this configuration
pre-filled with the real `MCP_API_KEY`, via `GET /api/mcp/connection-info` — a normal,
session-cookie-authenticated endpoint (unlike `/mcp/*` above), since a signed-in user can
already reach everything the MCP tools return through the regular API.

### Tools

| Tool                        | Arguments                                          | Returns                              |
| --------------------------- | -------------------------------------------------- | ------------------------------------ |
| `list_systems`              | `search?`, `projectType?`, `countryId?`, `limit?`  | Compact system summaries             |
| `get_system`                | `id`                                                | One fully expanded system + its projects |
| `search_reference_systems`  | `query`, `projectType?`, `limit?`                  | Quotable reference systems           |
| `list_projects`             | `search?`, `systemId?`, `limit?`                    | Compact commercial-deal summaries    |
| `get_project`                | `id?` or `projectNumber?`                          | One fully expanded project           |
| `list_currencies`           | –                                                  | Currency lookup                      |
| `list_countries`            | –                                                  | Country lookup                       |
| `list_unlocodes`            | `search?`, `limit?`                                | UN/LOCODE lookup                     |
| `list_document_types`       | –                                                  | Document type lookup                 |

`search_reference_systems` is the one to reach for when answering questions like *"do we have a
VTS system in Belgium we can use as a reference?"*. It only ever returns systems where
`canBeUsedAsReference = true` **and** `isSensitive = false`, matches the query words across
name, products, scope, description and country, and ranks results by how many words matched.

## UN/LOCODEs

The seed only inserts ~40 well-known ports, which is enough to use the UI. The official UNECE
dataset holds 100 000+ locations and is not vendored here. Download it from
<https://unece.org/trade/cefact/unlocode-code-list-country-and-territory> and import it once:

```bash
npm run import:unlocodes -- /path/to/code-list.csv
```

`prisma/import-unlocodes.ts` documents the CSV column layout and keeps only rows flagged as
seaports; adjust the filter there if inland terminals or airports are needed too.

## Error handling

Prisma errors are translated to HTTP by three global filters in `src/core/filters/`:

| Prisma                                  | HTTP                                     |
| --------------------------------------- | ---------------------------------------- |
| `P2002` unique constraint               | `409 Conflict`                           |
| `P2003` / `P2014` foreign key           | `400 Bad Request`                        |
| `P2001` / `P2015` / `P2018` / `P2025`   | `404 Not Found`                          |
| `P2000`, `P2006`, `P2011`, `P2019/20`   | `400 Bad Request`                        |
| Anything else known                     | `500 Internal Server Error`              |
| `PrismaClientValidationError`           | `400 Bad Request`                        |
| Unknown / init / panic errors           | `500 Internal Server Error`              |

Request bodies go through a global
`ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true })`, so unknown
properties are rejected rather than silently dropped.

## Known limitations / TODO

- `SystemDocument.uploadedBy` is not filled in yet. Once SSO is live, take it from
  `@CurrentUser()` in `SystemDocumentsController.upload` (marked with a `TODO`).
- Uploads use multer's in-memory storage. Fine at the 25 MB default; switch to `diskStorage` if
  `MAX_UPLOAD_MB` is raised substantially.
- The SAML `InResponseTo` cache is in-memory (single instance) — see the note above.
- No test suite, deliberately out of scope for this build.
