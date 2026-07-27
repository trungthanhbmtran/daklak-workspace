# ==========================================
# 1. Builder Stage
# Môi trường dùng để cài đặt dependencies và compile code
# ==========================================
FROM node:22-slim AS builder
WORKDIR /app

# Bắt buộc cài openssl cho Prisma Engine

# [MONOREPO] Copy package.json của service cụ thể từ gốc
# Context của docker build phải đặt ở thư mục ngoài cùng (root)
COPY apps/posts-service/package*.json ./
RUN npm ci

# [MONOREPO] Copy source code service và các thư mục chia sẻ (protos)
COPY apps/posts-service/ ./
COPY shared/protos ./shared/protos
COPY shared/core ./shared/core

# Generate Prisma Client (Nếu service có sử dụng Prisma)
RUN DATABASE_URL="mysql://dummy:dummy@localhost:3306/dummy" npx prisma generate

# Compile source code sang thư mục /dist
RUN npm run build

# ==========================================
# 2. Runner Stage
# Môi trường chạy thực tế trên Production
# ==========================================
FROM node:22-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PROTO_PATH=/app/protos


# [Bảo Mật] Tạo và chuyển sang user app không có đặc quyền
RUN groupadd -r app && useradd -r -m -g app app && chown app:app /app
USER app

# Cài đặt Prod Dependencies trực tiếp dưới quyền app
COPY --chown=app:app apps/posts-service/package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force

# [PRISMA] Copy Prisma custom generated client (BẮT BUỘC để tránh lỗi)
COPY --chown=app:app --from=builder /app/prisma ./prisma

# Copy thư mục build và protos từ builder stage
COPY --chown=app:app --from=builder /app/dist ./dist
COPY --chown=app:app --from=builder /app/shared/protos ./protos

EXPOSE 8080

CMD ["node", "dist/src/main.js"]

