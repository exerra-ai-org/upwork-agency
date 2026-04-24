# ── Stage 1: Install dependencies ─────────────────────────────────────────────
FROM oven/bun:1 AS install

WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# ── Stage 2: Build ────────────────────────────────────────────────────────────
FROM install AS build

COPY src/ src/
COPY prisma/ prisma/
COPY tsconfig.json nest-cli.json prisma.config.ts ./

RUN bunx prisma generate && bun run build

# ── Stage 3: Production ──────────────────────────────────────────────────────
FROM node:20-slim AS production

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=build /app/dist/ dist/
COPY --from=build /app/node_modules/ node_modules/
COPY --from=build /app/prisma/ prisma/
COPY --from=build /app/prisma.config.ts ./
COPY --from=build /app/package.json ./


ENV NODE_ENV=production


CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
