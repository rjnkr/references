# Build context is the repository root (npm workspaces share one lockfile):
#   docker build -f backend/Dockerfile .

FROM node:24-slim AS build
# Prisma's query engine needs OpenSSL.
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/package.json backend/
COPY frontend/package.json frontend/
RUN npm ci --workspace=backend

COPY backend backend
# Generates the Prisma client and the NestJS DTOs under src/generated, then compiles.
RUN npm run prisma:generate --workspace=backend && npm run build --workspace=backend

FROM node:24-slim AS runtime
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production \
    PORT=3000 \
    STORAGE_DIR=/app/backend/storage/documents
WORKDIR /app

# Dev dependencies are kept on purpose: `prisma migrate deploy` (prisma CLI +
# prisma.config.ts, which loads dotenv) runs at container start.
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/backend/package.json /app/backend/prisma.config.ts ./backend/
COPY --from=build /app/backend/prisma ./backend/prisma
COPY --from=build /app/backend/dist ./backend/dist

WORKDIR /app/backend
RUN mkdir -p storage/documents && chown -R node:node storage
USER node

EXPOSE 3000
VOLUME ["/app/backend/storage/documents"]
CMD ["sh", "-c", "npx prisma migrate deploy && exec node dist/main"]
