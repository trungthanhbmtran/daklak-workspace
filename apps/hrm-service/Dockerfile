# ==========================================
# 1️⃣ Dependency Stage
# ==========================================
FROM node:22-alpine AS deps
WORKDIR /app

RUN apk add --no-cache openssl
COPY apps/hrm-service/package*.json ./
RUN npm ci


# ==========================================
# 2️⃣ Builder Stage
# ==========================================
FROM node:22-alpine AS builder
WORKDIR /app

RUN apk add --no-cache openssl
COPY --from=deps /app/node_modules ./node_modules
COPY apps/hrm-service/ ./
COPY shared/protos ./shared/protos

# Gom các schema nhỏ thành 1 file duy nhất (đặc thù của hrm-service)
RUN if [ -d "prisma/schema" ]; then cat prisma/schema/*.prisma > prisma/schema.prisma; fi

# Bỏ qua lỗi thiếu DATABASE_URL lúc build trên CI/CD
ENV DATABASE_URL="mysql://localhost:3306/dummy"
RUN npx prisma generate --config=./prisma.config.ts

RUN npm run build


# ==========================================
# 3️⃣ Runner Stage (Siêu nhẹ - Ultra Lean)
# ==========================================
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
RUN apk add --no-cache openssl

COPY apps/hrm-service/package*.json ./

# 🔥 ÉP CÂN TỐI ĐA: 
# 1. Cài production libs + prisma CLI (để chạy migrate deploy trên server).
# 2. Xóa sạch NPM cache khổng lồ ngay trong cùng 1 command để tiết kiệm layer size.
# 3. Dọn rác các Prisma Engine của hệ điều hành khác không dùng tới.
RUN npm ci --omit=dev && \
    npm install prisma && \
    npm cache clean --force && \
    rm -rf node_modules/@prisma/engines/*windows* && \
    rm -rf node_modules/@prisma/engines/*darwin*

# 🔥 CHỈ COPY NHỮNG THỨ CẦN THIẾT (Tự động loại bỏ nest-cli.json, src, tsconfig...)
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/shared/protos ./protos
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

ENV PROTO_PATH=/app/protos

# Thiết lập user phân quyền bảo mật
RUN addgroup -S app && adduser -S app -G app
RUN chown -R app:app /app
USER app

EXPOSE 3002

CMD ["node", "dist/src/main.js"]