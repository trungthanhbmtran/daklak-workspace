# ==========================================
# 1️⃣ Dependency Stage
# ==========================================
FROM node:20-alpine AS deps
WORKDIR /app

# prisma cần openssl
RUN apk add --no-cache openssl

COPY apps/workflow-service/package*.json ./
RUN npm ci


# ==========================================
# 2️⃣ Builder Stage
# ==========================================
FROM node:20-alpine AS builder
WORKDIR /app

RUN apk add --no-cache openssl

COPY --from=deps /app/node_modules ./node_modules
COPY apps/workflow-service/ ./
COPY shared/protos ./shared/protos

# Generate Prisma Client
RUN npx prisma generate --schema=./prisma/schema

# Build the app
RUN npm run build


# ==========================================
# 3️⃣ Production Runner Stage
# ==========================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
RUN apk add --no-cache openssl

# optimize production node_modules
COPY apps/workflow-service/package*.json ./
RUN npm ci --omit=dev

# copy built artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/shared/protos ./protos

ENV PROTO_PATH=/app/protos

# Security: Run as non-root user
RUN addgroup -S app && adduser -S app -G app
RUN chown -R app:app /app
USER app

EXPOSE 3001 50060

CMD ["node", "dist/src/main.js"]