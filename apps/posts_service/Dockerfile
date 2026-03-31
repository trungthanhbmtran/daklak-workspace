# ==========================================
# 1️⃣ Dependency Stage
# ==========================================
FROM node:20-alpine AS deps
WORKDIR /app

COPY apps/posts_service/package*.json ./
RUN npm ci

# ==========================================
# 2️⃣ Builder Stage
# ==========================================
FROM node:20-alpine AS builder
WORKDIR /app

# Prisma cần openssl cho engine
RUN apk add --no-cache openssl

COPY --from=deps /app/node_modules ./node_modules
COPY apps/posts_service/ ./
COPY shared/protos ./shared/protos

# 👉 Đảm bảo prisma folder tồn tại
# (debug nếu cần)
# RUN ls -la prisma

# ✅ Prisma 7: generate đúng schema
RUN npx prisma generate

# Build app
RUN npm run build

# ==========================================
# 3️⃣ Production Runner Stage
# ==========================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Prisma engine cần openssl
RUN apk add --no-cache openssl

# Install prod deps
COPY apps/posts_service/package*.json ./
RUN npm ci --omit=dev

# Copy build + prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Prisma runtime files
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Proto
COPY --from=builder /app/shared/protos ./protos
ENV PROTO_PATH=/app/protos

# 👉 Prisma 7 best practice (optional)
ENV PRISMA_CLIENT_ENGINE_TYPE=binary

# Security
RUN addgroup -S app && adduser -S app -G app
RUN chown -R app:app /app
USER app

EXPOSE 3005

CMD ["node", "dist/src/main.js"]