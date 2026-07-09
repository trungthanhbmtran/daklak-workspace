# ==========================================
# 1️⃣ Builder Stage
# ==========================================
FROM node:22-alpine AS builder
WORKDIR /app

RUN apk add --no-cache openssl

COPY apps/workflow-service/package*.json ./
RUN npm config set fetch-retries 5 && npm config set fetch-retry-mintimeout 20000 && npm config set fetch-retry-maxtimeout 120000 && npm ci

COPY apps/workflow-service/ ./
COPY shared/ ./shared/

# Generate Prisma client and build the NestJS app
# Provide a dummy DATABASE_URL for Prisma generate during build
ENV DATABASE_URL="mysql://dummy:dummy@localhost:3306/dummy"
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
COPY --chown=app:app apps/workflow-service/package*.json ./
RUN npm config set fetch-retries 5 && npm config set fetch-retry-mintimeout 20000 && npm config set fetch-retry-maxtimeout 120000 && npm ci --omit=dev --no-audit --no-fund && npm cache clean --force

# Copy build outputs from builder stage with correct ownership
COPY --chown=app:app --from=builder /app/dist ./dist
COPY --chown=app:app --from=builder /app/prisma ./prisma
COPY --chown=app:app --from=builder /app/shared/protos ./protos
COPY --chown=app:app --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --chown=app:app --from=builder /app/generated ./generated

ENV PROTO_PATH=/app/protos

EXPOSE 3004

CMD ["node", "dist/src/main.js"]