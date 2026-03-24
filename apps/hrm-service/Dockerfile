# ==========================================
# 1️⃣ Dependency Stage
# ==========================================
FROM node:20-alpine AS deps
WORKDIR /app
COPY apps/hrm-service/package*.json ./
RUN npm ci

# ==========================================
# 2️⃣ Builder Stage
# ==========================================
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY apps/hrm-service/ ./
COPY shared/protos ./shared/protos

# Generate Prisma Client
RUN if [ -d "prisma/schema" ]; then cat prisma/schema/*.prisma > prisma/schema.prisma; fi
RUN npx prisma generate --schema=./prisma/schema.prisma

# Build the app
RUN npm run build

# ==========================================
# 3️⃣ Production Runner Stage
# ==========================================
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache openssl

# Install prod deps + Prisma CLI
COPY apps/hrm-service/package*.json ./
RUN npm ci --omit=dev && npm install prisma --save-prod

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/shared/protos ./protos

ENV PROTO_PATH=/app/protos

# Security
RUN addgroup -S app && adduser -S app -G app
RUN chown -R app:app /app
USER app

EXPOSE 3002
CMD ["node", "dist/main.js"]