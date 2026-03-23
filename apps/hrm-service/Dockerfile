# ==========================================
# 1️⃣ Stage: Dependencies (Cache layer)
# ==========================================
FROM node:20-alpine AS deps
WORKDIR /app

COPY apps/hrm-service/package*.json ./
RUN npm ci


# ==========================================
# 2️⃣ Stage: Builder (Build TS + Prisma)
# ==========================================
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY apps/hrm-service .

# Generate Prisma Client
RUN npx prisma generate

# Build NestJS
RUN npm run build


# ==========================================
# 3️⃣ Stage: Runner (Production)
# ==========================================
FROM node:20-alpine AS runner
WORKDIR /app

# Non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

ENV NODE_ENV=production
ENV GRPC_URL=0.0.0.0:50052
ENV PROTO_PATH=/app/protos

# Install production deps
COPY apps/hrm-service/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy build output
COPY --from=builder /app/dist ./dist

# 🔥 QUAN TRỌNG: Prisma runtime cần các thứ này
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/prisma ./prisma

# Copy protos
COPY shared/protos/hrm ./protos/hrm
COPY shared/protos/common ./protos/common

USER 1000

EXPOSE 50052

CMD ["node", "dist/src/main.js"]