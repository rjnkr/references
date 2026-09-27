# Build context is the repository root (npm workspaces share one lockfile):
#   docker build -f frontend/Dockerfile .

FROM node:24-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/package.json backend/
COPY frontend/package.json frontend/
RUN npm ci --workspace=frontend

COPY frontend frontend
RUN npm run build --workspace=frontend

FROM nginx:1.27-alpine AS runtime
# Upstream the SPA proxies /api, /mcp and /docs to (substituted into the
# config template by the nginx image's entrypoint at start-up).
ENV BACKEND_URL=http://backend:3000
COPY frontend/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/frontend/dist/frontend/browser /usr/share/nginx/html
EXPOSE 80
