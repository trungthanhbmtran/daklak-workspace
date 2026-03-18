# ==========================================
# 1️⃣ Stage: Builder
# ==========================================
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies (from root context)
COPY apps/user-service/package*.json ./
RUN npm install

# Copy source and shared protos
COPY apps/user-service .
COPY shared/protos ./shared/protos

# Generate Prisma Client
RUN npx prisma generate --schema=./prisma/schema

# Build the app
RUN npm run build

# ==========================================
# 2️⃣ Stage: Migration
# ==========================================
FROM node:20-alpine AS migration
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./

CMD ["npx", "prisma", "migrate", "deploy", "--schema=./prisma/schema"]

# ==========================================
# 3️⃣ Stage: Runner (Production)
# ==========================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PROTO_PATH=/app/protos

# Copy necessary files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
# Copy protos to internal path
COPY --from=builder /app/shared/protos ./protos

EXPOSE 3000

CMD ["node", "dist/main.js"]