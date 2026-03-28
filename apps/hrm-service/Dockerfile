# ==========================================
# 1️⃣ Dependencies Stage
# ==========================================
FROM node:20-alpine AS deps

WORKDIR /app

# chỉ copy package để tận dụng cache
COPY apps/hrm-service/package*.json ./

# install full deps (bao gồm dev để build)
RUN npm ci

# ==========================================
# 2️⃣ Builder Stage
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# reuse node_modules từ deps
COPY --from=deps /app/node_modules ./node_modules

# copy source code
COPY apps/hrm-service/ ./
COPY shared/protos ./shared/protos

# =========================
# Prisma generate
# =========================
# gộp nhiều schema nếu có
RUN if [ -d "prisma/schema" ]; then cat prisma/schema/*.prisma > prisma/schema.prisma; fi

# generate prisma client
RUN npx prisma generate --schema=./prisma/schema.prisma

# =========================
# Build NestJS
# =========================
RUN npm run build

# ==========================================
# 3️⃣ Production Runner Stage
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# cần cho prisma engine
RUN apk add --no-cache openssl

# chỉ cài production dependencies
COPY apps/hrm-service/package*.json ./
RUN npm ci --omit=dev

# =========================
# Copy build output
# =========================
COPY --from=builder /app/dist ./dist

# prisma schema (để migrate / runtime)
COPY --from=builder /app/prisma ./prisma

# 🔥 cực kỳ quan trọng cho prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# proto files (grpc)
COPY --from=builder /app/shared/protos ./protos
ENV PROTO_PATH=/app/protos

# =========================
# Security (non-root)
# =========================
RUN addgroup -S app && adduser -S app -G app
RUN chown -R app:app /app
USER app

# =========================
# Run app
# =========================
EXPOSE 3002

CMD ["node", "dist/src/main.js"]