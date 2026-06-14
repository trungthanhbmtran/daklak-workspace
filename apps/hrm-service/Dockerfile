# ==========================================
# 1️⃣ Builder Stage
# ==========================================
FROM node:22-alpine AS builder
WORKDIR /app

RUN apk add --no-cache openssl

COPY apps/hrm-service/package*.json ./
RUN npm ci

COPY apps/hrm-service/ ./
COPY shared/protos ./shared/protos

# Build the NestJS app directly (without prisma generate, since client is pre-generated in 'generated/')
RUN npx nest build && npx tsc


# ==========================================
# 3️⃣ Runner Stage
# ==========================================
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache openssl

COPY apps/hrm-service/package*.json ./
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

EXPOSE 3002

CMD ["node", "dist/src/main.js"]