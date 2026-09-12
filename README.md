# Tidalis Contract References

Internal application to record Tidalis contract references (scope, financials, ports, documents, people involved, etc.).

## Structure

- `backend/` — NestJS + TypeScript API (Prisma ORM, MariaDB, Passport SAML SSO, Swagger, MCP server)
- `frontend/` — Angular application (Angular Material + Bootstrap 5, Tidalis look & feel)
- `docker-compose.yml` — local MariaDB instance

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
