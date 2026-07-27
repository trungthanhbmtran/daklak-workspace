# ==========================================
# 1️⃣ Builder Stage
# ==========================================
FROM node:22-slim AS builder
WORKDIR /app

COPY apps/notification_service/package*.json ./
RUN npm ci

COPY apps/notification_service/ ./
COPY shared/protos ./shared/protos

# Generate Prisma Client
RUN DATABASE_URL="mysql://dummy:dummy@localhost:3306/dummy" npx prisma generate

# ==========================================
# 2️⃣ Runner Stage
# ==========================================
FROM node:22-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PROTO_PATH=/app/protos

# Create non-root user early to run container and install packages under its ownership
RUN groupadd -r app && useradd -r -m -g app app && chown app:app /app
USER app

# Copy package files and install production dependencies directly as non-root user (avoids slow chown at the end)
COPY --chown=app:app apps/notification_service/package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force

# [PRISMA] Copy Prisma custom generated client
COPY --chown=app:app --from=builder /app/generated ./generated
COPY --chown=app:app --from=builder /app/prisma ./prisma
COPY --chown=app:app --from=builder /app/prisma.config.ts ./prisma.config.ts

# Copy source and shared files with correct ownership
COPY --chown=app:app --from=builder /app/server.js ./server.js
COPY --chown=app:app --from=builder /app/adapters ./adapters
COPY --chown=app:app --from=builder /app/config ./config
COPY --chown=app:app --from=builder /app/worker ./worker
COPY --chown=app:app --from=builder /app/shared/protos ./protos

EXPOSE 50075

CMD ["node", "server.js"]