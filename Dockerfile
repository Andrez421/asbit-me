# Stage 1 — build the static site with Astro.
# Node 26 images no longer bundle corepack, so pnpm is installed explicitly.
FROM node:26-alpine AS build
WORKDIR /app
RUN npm install -g pnpm@11.9.0
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# Stage 2 — serve the generated dist/ with nginx, exactly like the previous
# single-file image did (same port, same Traefik wiring, same Dokploy app).
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
