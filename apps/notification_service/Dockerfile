# ==========================================
# 1️⃣ Builder Stage
# ==========================================
FROM node:22-alpine AS builder
WORKDIR /app

COPY apps/notification_service/package*.json ./
RUN npm ci

COPY apps/notification_service/ ./
COPY shared/protos ./shared/protos


# ==========================================
# 2️⃣ Runner Stage
# ==========================================
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user early to run container and install packages under its ownership
RUN addgroup -S app && adduser -S app -G app && chown app:app /app
USER app

# Copy package files and install production dependencies directly as non-root user (avoids slow chown at the end)
COPY --chown=app:app apps/notification_service/package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force

# Copy source and shared files with correct ownership
COPY --chown=app:app --from=builder /app/server.js ./server.js
COPY --chown=app:app --from=builder /app/adapters ./adapters
COPY --chown=app:app --from=builder /app/config ./config
COPY --chown=app:app --from=builder /app/worker ./worker
COPY --chown=app:app --from=builder /app/shared/protos ./protos

ENV PROTO_PATH=/app/protos

EXPOSE 50075

CMD ["node", "server.js"]