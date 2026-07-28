# ==========================================
# 1. Builder Stage
# Môi trường dùng để cài đặt dependencies và compile code
# ==========================================
FROM node:22-slim AS builder
WORKDIR /app

# Bắt buộc cài openssl cho Prisma Engine
RUN apt-get update -y && apt-get install -y openssl


# [MONOREPO] Copy package.json của service cụ thể từ gốc
# Context của docker build phải đặt ở thư mục ngoài cùng (root)
COPY package*.json ./
COPY tsconfig.base.json ./
COPY shared ./shared
COPY apps/user-service ./apps/user-service
# Install root dependencies so shared/core can resolve them
RUN npm ci

WORKDIR /app/apps/user-service
RUN npm ci
# Generate Prisma Client (Nếu service có sử dụng Prisma)
RUN DATABASE_URL="mysql://dummy:dummy@localhost:3306/dummy" npx prisma generate

# Compile source code sang thư mục /dist
RUN npm run build
# Copy generated Prisma client to the correct compiled src directory
RUN cp -r src/generated $(find dist -type d -name src | head -n 1)/ || true

# ==========================================
# 2. Runner Stage
# Môi trường chạy thực tế trên Production
# ==========================================
FROM node:22-slim AS runner
WORKDIR /app

# Bắt buộc cài openssl cho Prisma Engine (Runner)
RUN apt-get update -y && apt-get install -y openssl

ENV NODE_ENV=production
ENV PROTO_PATH=/app/protos


# [Bảo Mật] Tạo và chuyển sang user app không có đặc quyền
RUN groupadd -r app && useradd -r -m -g app app && chown app:app /app
USER app

# Cài đặt Prod Dependencies trực tiếp dưới quyền app
COPY --chown=app:app apps/user-service/package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force

# [PRISMA] Copy Prisma custom generated client (BẮT BUỘC để tránh lỗi)
COPY --chown=app:app --from=builder /app/apps/user-service/prisma ./prisma
COPY --chown=app:app --from=builder /app/apps/user-service/src/generated ./src/generated

# Copy thư mục build và protos từ builder stage
COPY --chown=app:app --from=builder /app/apps/user-service/dist ./dist
COPY --chown=app:app --from=builder /app/shared/protos ./protos

EXPOSE 8080

CMD ["node", "dist/apps/user-service/src/main.js"]

