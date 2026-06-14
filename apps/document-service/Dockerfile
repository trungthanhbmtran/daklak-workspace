# ==========================================
# 1️⃣ Builder Stage
# ==========================================
FROM node:22-alpine AS builder
WORKDIR /app

RUN apk add --no-cache openssl

COPY apps/document-service/package*.json ./
RUN npm ci

COPY apps/document-service/ ./
COPY shared/protos ./shared/protos

# Build the NestJS app directly (without prisma generate, since client is pre-generated in 'generated/')
RUN npx nest build && npx tsc-alias


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
COPY --chown=app:app apps/document-service/package*.json ./
RUN npm ci --omit=dev

# Copy build outputs from builder stage with correct ownership
COPY --chown=app:app --from=builder /app/dist ./dist
COPY --chown=app:app --from=builder /app/prisma ./prisma
COPY --chown=app:app --from=builder /app/generated ./generated
COPY --chown=app:app --from=builder /app/shared/protos ./protos
COPY --chown=app:app --from=builder /app/prisma.config.ts ./prisma.config.ts

ENV PROTO_PATH=/app/protos

EXPOSE 50056

CMD ["node", "dist/src/main.js"]
