# ==========================================
# 1️⃣ Stage: Builder
# ==========================================
FROM node:20-alpine AS builder
WORKDIR /app

# Khai báo và cài dependencies
COPY apps/posts_service/package*.json ./
RUN npm install

# Copy source code và build ra thư mục dist
COPY apps/posts_service .
# Sinh Prisma Client
RUN npx prisma generate --schema=./prisma/schema.prisma

# Build dự án NestJS
RUN npm run build

# ==========================================
# 2️⃣ Stage: Migration
# ==========================================
FROM node:20-alpine AS migration
WORKDIR /app

ENV NODE_ENV=production

# Copy FULL source (bao gồm prisma schema + migrations)
COPY apps/posts_service ./
RUN npm install --omit=dev

# Chạy lệnh migration mặc định
CMD ["npx", "prisma", "migrate", "deploy", "--schema=./prisma/schema.prisma"]

# 🔥 ÉP CÂN: Xóa devDependencies 
RUN npm prune --omit=dev && npm cache clean --force

# ==========================================
# 3️⃣ Stage: Runner (Production)
# ==========================================
FROM node:20-alpine AS runner
WORKDIR /app

# 🛡️ Cấu hình Non-root
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

ENV NODE_ENV=production
ENV PROTO_PATH=/app/protos

# Copy node_modules từ builder
COPY --from=builder /app/node_modules ./node_modules
# Copy code đã biên dịch
COPY --from=builder /app/dist ./dist
# Copy prisma folder for migrations
COPY --from=builder /app/prisma ./prisma
# Copy thư mục protos dùng chung
COPY shared/protos ./protos

# Phân quyền cho user nestjs
RUN chown -R nestjs:nodejs /app
USER nestjs

EXPOSE 50055

# Chạy file main.js trực tiếp từ dist
CMD ["node", "dist/src/main.js"]
