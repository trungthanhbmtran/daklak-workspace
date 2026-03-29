# ==========================================
# 1️⃣ Base & Build Tools
# ==========================================
FROM node:20-slim AS base
WORKDIR /app
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# ==========================================
# 2️⃣ Dependencies
# ==========================================
FROM base AS deps
COPY package*.json ./
RUN npm ci

# ==========================================
# 3️⃣ Build Production Dependencies
# ==========================================
FROM base AS prod-deps
COPY package*.json ./
RUN npm ci --omit=dev

# ==========================================
# 4️⃣ Builder
# ==========================================
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Prisma & Build (automated in npm run build)
RUN npm run build

# ==========================================
# 5️⃣ Runner
# ==========================================
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# security
RUN useradd -m app && chown -R app:app /app
USER app

EXPOSE 30005
CMD ["node", "dist/src/main.js"]