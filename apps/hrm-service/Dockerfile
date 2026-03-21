# ==========================================
# 1️⃣ Stage: Dependencies (Cache layer)
# ==========================================
FROM node:20-alpine AS deps
WORKDIR /app

# 🔥 SỬA ĐƯỜNG DẪN: Chỉ định rõ vào thư mục app
COPY apps/hrm-service/package*.json ./
RUN npm ci

# ==========================================
# 2️⃣ Stage: Builder (Biên dịch TypeScript)
# ==========================================
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

# 🔥 SỬA ĐƯỜNG DẪN: Chỉ copy source code của user-service
COPY apps/hrm-service .

# Generate Prisma 
RUN npx prisma generate
# Build app ra thư mục dist
RUN npm run build

# ==========================================
# 4️⃣ Stage: Migration
# ==========================================
FROM node:20-alpine AS migration
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY apps/hrm-service/package*.json ./

CMD ["npx", "prisma", "migrate", "deploy", "--schema=./prisma/schema.prisma"]

# ==========================================
# 3️⃣ Stage: Runner (K8s Production Container)
# ==========================================
FROM node:20-alpine AS runner
WORKDIR /app

# 🛡️ Cấu hình Non-root cho K8s
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

# Khai báo biến môi trường cho main.ts
ENV NODE_ENV=production
ENV GRPC_URL=0.0.0.0:50052
ENV PROTO_PATH=/app/protos

# 🔥 SỬA ĐƯỜNG DẪN: Lấy đúng package.json của user-service
COPY apps/hrm-service/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy code biên dịch và Prisma Client
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /app/prisma ./prisma

# Copy thư mục protos (từ thư mục shared bên ngoài)
COPY shared/protos/hrm ./protos/hrm
COPY shared/protos/common ./protos/common

# Distroless mặc định chạy user an toàn (ID: 1000)
USER 1000

# Expose port gRPC
EXPOSE 50052

# Chạy file main.js trực tiếp (Cấu trúc NestJS build có kèm thư mục src)
CMD ["node", "dist/src/main.js"]