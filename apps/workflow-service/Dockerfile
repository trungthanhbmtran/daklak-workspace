# ==========================================
# 1️⃣ Deps Stage — Chỉ cài production deps
# ==========================================
FROM node:22-alpine AS deps
WORKDIR /app

RUN apk add --no-cache openssl

COPY apps/workflow-service/package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund

# ==========================================
# 2️⃣ Builder Stage — Build + generate Prisma
# ==========================================
FROM node:22-alpine AS builder
WORKDIR /app

RUN apk add --no-cache openssl

COPY apps/workflow-service/package*.json ./
RUN npm ci --no-audit --no-fund

COPY apps/workflow-service/ ./
COPY shared/ ./shared/

# Prisma generate cần DATABASE_URL dù chỉ để generate types
ENV DATABASE_URL="mysql://dummy:dummy@localhost:3306/dummy"
RUN npm run build

# ==========================================
# 3️⃣ Runner Stage — Image tối giản
# ==========================================
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache openssl

# Non-root user
RUN addgroup -S app && adduser -S app -G app && chown app:app /app
USER app

# Production node_modules từ deps stage (đã tối ưu, không cần build lại)
COPY --chown=app:app --from=deps /app/node_modules ./node_modules

# Build artifacts
COPY --chown=app:app --from=builder /app/dist ./dist

# Prisma: schema, migrations, generated client, config
COPY --chown=app:app --from=builder /app/prisma ./prisma
COPY --chown=app:app --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --chown=app:app --from=builder /app/generated ./generated

# Proto files
COPY --chown=app:app --from=builder /app/shared/protos ./protos

ENV PROTO_PATH=/app/protos

EXPOSE 3004

# Mặc định: chạy app
# Để migrate: docker run --rm ... sh -c "npx prisma migrate deploy"
# Để seed:    docker run --rm ... sh -c "npx ts-node -r tsconfig-paths/register prisma/seed.ts"
CMD ["node", "dist/src/main.js"]