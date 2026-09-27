# Tidalis Contract References

Internal application to record Tidalis contract references (scope, financials, ports, documents, people involved, etc.).

## Structure

- `backend/` — NestJS + TypeScript API (Prisma ORM, MariaDB, Passport SAML SSO, Swagger, MCP server)
- `frontend/` — Angular application (Angular Material + Bootstrap 5, Tidalis look & feel)
- `docker-compose.yml` — MariaDB, backend and frontend containers
- `.github/workflows/containers.yml` — builds the backend/frontend images and pushes them to Docker Hub

## Getting started

```bash
npm install
npm run db:up
npm run dev:backend
npm run dev:frontend
```

Backend API: http://localhost:3000 (Swagger docs at `/docs`)
Frontend app: http://localhost:4200

See `backend/README.md` and `frontend/README.md` for details, including SAML SSO configuration.

## Running with Docker

```bash
docker compose up -d --build
```

Open http://localhost:8080. nginx in the frontend container serves the SPA and proxies `/api`, `/mcp` and `/docs` to the backend; the backend applies pending Prisma migrations on start. Uploaded documents live in the `documents` volume. Override settings (`JWT_SECRET`, `MCP_API_KEY`, `SAML_*`, `PUBLIC_URL`, `FRONTEND_PORT`, `AUTH_DISABLED`, ...) in a root `.env` file.

To run the published images instead of building them: `docker compose pull && docker compose up -d` (set `DOCKERHUB_NAMESPACE` to the Docker Hub account and `TAG` to choose a version).
