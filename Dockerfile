# Stage 1 — build the static site with Astro.
FROM node:26-alpine AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# Stage 2 — serve the generated dist/ with nginx, exactly like the previous
# single-file image did (same port, same Traefik wiring, same Dokploy app).
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
