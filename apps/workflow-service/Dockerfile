# ==========================================
# 1️⃣ Dependency Stage
# ==========================================
FROM node:22-alpine AS deps
WORKDIR /app

RUN apk add --no-cache openssl

COPY apps/workflow-service/package*.json ./
RUN npm ci


# ==========================================
# 2️⃣ Builder Stage
# ==========================================
FROM node:22-alpine AS builder
WORKDIR /app

RUN apk add --no-cache openssl

COPY --from=deps /app/node_modules ./node_modules
COPY apps/workflow-service/ ./
COPY shared/protos ./shared/protos

# Merge schemas if needed (standard practice)
RUN if [ -d "prisma/schema" ]; then cat prisma/schema/*.prisma > prisma/schema.prisma; fi

# 🔥 Prisma 7.6 → dùng config
ENV DATABASE_URL="mysql://localhost:3306/dummy"

RUN npx prisma generate --config=./prisma.config.ts

RUN npm run build


# ==========================================
# 3️⃣ Runner Stage
# ==========================================
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache openssl

COPY apps/workflow-service/package*.json ./
RUN npm ci --omit=dev

# copy build output
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/shared/protos ./protos

# 🔥 BẮT BUỘC với Prisma 7
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

ENV PROTO_PATH=/app/protos

# security
RUN addgroup -S app && adduser -S app -G app
RUN chown -R app:app /app
USER app

EXPOSE 3004

CMD ["node", "dist/src/main.js"]