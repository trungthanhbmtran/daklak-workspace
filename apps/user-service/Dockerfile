# ==========================================
# 1️⃣ Stage: Builder
# ==========================================
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package trước để cache
COPY apps/user-service/package*.json ./

# Dùng npm ci nhanh + ổn định hơn
RUN npm ci

# Copy source
COPY apps/user-service .
COPY shared/protos ./shared/protos

# Generate Prisma Client
RUN npx prisma generate --schema=./prisma/schema.prisma

# Build app
RUN npm run build

# ==========================================
# 2️⃣ Stage: Production Dependencies
# ==========================================
FROM node:20-alpine AS deps
WORKDIR /app

COPY apps/user-service/package*.json ./

# Chỉ install production deps (nhẹ hơn nhiều)
RUN npm ci --omit=dev

# ==========================================
# 3️⃣ Stage: Migration
# ==========================================
FROM node:20-alpine AS migration
WORKDIR /app

ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY apps/user-service/package*.json ./

CMD ["npx", "prisma", "migrate", "deploy", "--schema=./prisma/schema.prisma"]

# ==========================================
# 4️⃣ Stage: Runner (Production)
# ==========================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PROTO_PATH=/app/protos

# Copy production deps
COPY --from=deps /app/node_modules ./node_modules

# Copy build artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/shared/protos ./protos

EXPOSE 3000

CMD ["node", "dist/main.js"]