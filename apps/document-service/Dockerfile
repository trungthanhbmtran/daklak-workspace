# ==========================================
# 1️⃣ Builder Stage
# ==========================================
FROM node:22-alpine AS builder
WORKDIR /app

RUN apk add --no-cache openssl

COPY apps/document-service/package*.json ./
RUN npm ci

COPY apps/document-service/ ./
COPY shared/protos ./shared/protos

# 🔥 SỬA LỖI TRÊN CI: Bắt buộc phải chạy prisma generate trước khi build NestJS.
# Lệnh này sẽ tự động sinh ra thư mục 'generated/' và các TypeScript Types 
# giúp quá trình biên dịch không còn bị lỗi "Property 'user' does not exist".
RUN npx prisma generate

# Build ứng dụng NestJS (Đã loại bỏ lệnh '&& npx tsc' thừa)
RUN npx nest build && npx tsc-alias


# ==========================================
# 2️⃣ Runner Stage
# ==========================================
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache openssl

# Tạo non-root user từ sớm để chạy container bảo mật hơn
RUN addgroup -S app && adduser -S app -G app && chown app:app /app
USER app

# Copy package files và cài production dependencies trực tiếp dưới quyền user app
COPY --chown=app:app apps/document-service/package*.json ./
RUN npm ci --omit=dev

# Copy kết quả từ builder stage sang với quyền sở hữu chính xác của user app
COPY --chown=app:app --from=builder /app/dist ./dist
COPY --chown=app:app --from=builder /app/prisma ./prisma
COPY --chown=app:app --from=builder /app/generated ./generated
COPY --chown=app:app --from=builder /app/shared/protos ./protos
COPY --chown=app:app --from=builder /app/prisma.config.ts ./prisma.config.ts

ENV PROTO_PATH=/app/protos

EXPOSE 50056

CMD ["node", "dist/src/main.js"]