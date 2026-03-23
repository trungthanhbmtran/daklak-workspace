# ==========================================
# 1️⃣ Base deps (cache tốt hơn)
# ==========================================
FROM node:20-alpine AS base
WORKDIR /app

COPY apps/user-service/package*.json ./
RUN npm ci

# ==========================================
# 2️⃣ Builder
# ==========================================
FROM base AS builder

COPY apps/user-service ./
COPY shared/protos ./shared/protos

# Merge schema (nếu bạn dùng multi file)
RUN cat prisma/schema/*.prisma > prisma/schema.prisma

# Generate Prisma
RUN npx prisma generate --schema=./prisma/schema.prisma

# Build
RUN npm run build

# ==========================================
# 3️⃣ Production deps (nhẹ)
# ==========================================
FROM node:20-alpine AS deps
WORKDIR /app

COPY apps/user-service/package*.json ./
RUN npm ci --omit=dev

# ==========================================
# 5️⃣ Migration
# ==========================================
FROM node:20-alpine AS migration
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY apps/user-service/package*.json ./

CMD ["npx", "prisma", "migrate", "deploy", "--schema=./prisma/schema.prisma"]

# ==========================================
# 4️⃣ Runner (FINAL)
# ==========================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PROTO_PATH=/app/protos

# 👉 chỉ copy prod deps
COPY --from=deps /app/node_modules ./node_modules

# 👉 copy prisma client (QUAN TRỌNG)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# 👉 app build
COPY --from=builder /app/dist ./dist

# 👉 schema (optional)
COPY --from=builder /app/prisma ./prisma

# 👉 protos
COPY --from=builder /app/shared/protos ./protos

EXPOSE 3000

# 👉 security: không chạy root
RUN addgroup -S app && adduser -S app -G app
USER app

CMD ["node", "dist/src/main.js"]