# ==========================================
# 1️⃣ Stage: Builder (Môi trường chuẩn bị)
# ==========================================
FROM node:20-alpine AS builder
WORKDIR /app

# Lấy package.json của đúng service notification
COPY apps/notification_service/package*.json ./

# Cài đặt thư viện production (dùng install thay vì ci để không kén file lock)
RUN npm install --omit=dev && npm cache clean --force

# Copy toàn bộ source code của notification-service (server.js, routes, config...)
COPY apps/notification_service .

# ==========================================
# 2️⃣ Stage: Runner (Production)
# ==========================================
FROM node:20-alpine AS runner
WORKDIR /app

# 🛡️ Cấu hình Non-root
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

ENV NODE_ENV=production
ENV PROTO_PATH=/app/protos

# Copy code & dependencies
COPY --from=builder /app ./

# Copy TOÀN BỘ thư mục protos dùng chung từ monorepo root
COPY shared/protos ./protos

# Phân quyền
RUN chown -R nestjs:nodejs /app
USER nestjs

# Mở đúng cổng 50075
EXPOSE 50075

# Chạy file server.js
CMD ["node", "server.js"]