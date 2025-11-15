# syntax=docker/dockerfile:1.7-labs

FROM oven/bun:1 AS base
WORKDIR /app

FROM base AS deps
COPY bun.lock package.json ./
RUN bun install --ci --frozen-lockfile

FROM deps AS build
COPY . .
RUN bun run build

FROM oven/bun:1-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NITRO_PORT=3000
ENV PORT=3000
ENV HOST=0.0.0.0
EXPOSE 3000
COPY --from=build /app/.output ./.output
CMD ["bun", "run", "./.output/server/index.mjs"]
