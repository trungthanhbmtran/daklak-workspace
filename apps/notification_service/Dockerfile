# ==========================================
# 1️⃣ Dependency Stage
# ==========================================
FROM node:20-alpine AS deps
WORKDIR /app
COPY apps/notification_service/package*.json ./
RUN npm ci

# ==========================================
# 2️⃣ Builder Stage
# ==========================================
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY apps/notification_service/ ./
COPY shared/protos ./shared/protos

# Notification service is plain Node.js, no build step needed but copying for consistency
# (If it had a build step, it would go here)

# ==========================================
# 3️⃣ Production Runner Stage
# ==========================================
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY apps/notification_service/package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app ./
COPY --from=builder /app/shared/protos ./protos

ENV PROTO_PATH=/app/protos

# Security
RUN addgroup -S app && adduser -S app -G app
RUN chown -R app:app /app
USER app

EXPOSE 50075
CMD ["node", "server.js"]