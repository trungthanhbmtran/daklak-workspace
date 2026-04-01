# ==========================================
# 1️⃣ Dependency Stage
# ==========================================
FROM node:20-alpine AS deps
WORKDIR /app

COPY apps/user-service/package*.json ./
RUN npm ci


# ==========================================
# 2️⃣ Builder Stage
# ==========================================
FROM node:20-alpine AS builder
WORKDIR /app

# Prisma cần openssl
RUN apk add --no-cache openssl

COPY --from=deps /app/node_modules ./node_modules
COPY apps/user-service/ ./
COPY shared/protos ./shared/protos

# 👉 Prisma env (required for generate)
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

# 👉 Generate Prisma Client (IMPORTANT)
RUN npx prisma generate

# Build NestJS
RUN npm run build


# ==========================================
# 3️⃣ Production Runner Stage
# ==========================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache openssl

# Install ONLY production deps
COPY apps/user-service/package*.json ./
RUN npm ci --omit=dev

# Copy build artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/shared/protos ./protos

# Prisma runtime engine (IMPORTANT)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

ENV PROTO_PATH=/app/protos

# Security
RUN addgroup -S app && adduser -S app -G app
RUN chown -R app:app /app
USER app

EXPOSE 3001

CMD ["node", "dist/src/main.js"]