# ==========================================
# 1️⃣ Builder Stage
# ==========================================
FROM node:22-alpine AS builder
WORKDIR /app

RUN apk add --no-cache openssl

COPY apps/report-service/package*.json ./
RUN npm ci

COPY apps/report-service/ ./
COPY shared/protos ./shared/protos

RUN npm run build

# ==========================================
# 2️⃣ Runner Stage
# ==========================================
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache openssl

# Create non-root user early to run container and install packages under its ownership
RUN addgroup -S app && adduser -S app -G app && chown app:app /app
USER app

# Copy package files and install production dependencies directly as non-root user (avoids slow chown at the end)
COPY --chown=app:app apps/report-service/package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force

# Copy Prisma generated client and schema from builder
COPY --chown=app:app --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --chown=app:app --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --chown=app:app --from=builder /app/prisma ./prisma

# Copy build outputs from builder stage with correct ownership
COPY --chown=app:app --from=builder /app/dist ./dist
COPY --chown=app:app --from=builder /app/shared/protos ./protos

ENV PROTO_PATH=/app/protos

EXPOSE 3011

CMD ["node", "dist/src/main.js"]
