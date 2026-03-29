# ==========================================
# 1️⃣ Dependencies
# ==========================================
FROM node:20-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ==========================================
# 2️⃣ Builder
# ==========================================
FROM node:20-slim AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Prisma
RUN if [ -d "prisma/schema" ]; then cat prisma/schema/*.prisma > prisma/schema.prisma; fi
RUN npx prisma generate

# Build
RUN npm run build

# ==========================================
# 3️⃣ Runner
# ==========================================
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# security
RUN useradd -m app
USER app

EXPOSE 30005
CMD ["node", "dist/src/main.js"]