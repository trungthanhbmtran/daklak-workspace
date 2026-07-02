# ==========================================
# 1️⃣ Builder Stage
# ==========================================
FROM node:22-alpine AS builder
WORKDIR /app

COPY apps/api-gateway/package*.json ./
RUN npm ci

COPY apps/api-gateway/ ./
COPY shared/protos ./shared/protos

RUN npx prisma generate
RUN npm run build


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
COPY --chown=app:app apps/api-gateway/package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force

# Copy build outputs from builder stage with correct ownership
COPY --chown=app:app --from=builder /app/dist ./dist
COPY --chown=app:app --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --chown=app:app --from=builder /app/shared/protos ./protos

ENV PROTO_PATH=/app/protos

EXPOSE 8080

CMD ["node", "dist/src/main.js"]
