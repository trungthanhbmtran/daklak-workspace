# ==========================================
# 1️⃣ Dependency Stage
# ==========================================
FROM node:22-alpine AS deps
WORKDIR /app

COPY apps/user-service/package*.json ./
RUN npm ci


# ==========================================
# 2️⃣ Builder Stage
# ==========================================
FROM node:22-alpine AS builder
WORKDIR /app

RUN apk add --no-cache openssl

COPY --from=deps /app/node_modules ./node_modules
COPY apps/user-service/ ./
COPY shared/protos ./shared/protos

ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

# Prisma generate (ONLY generate)
RUN npx prisma generate --schema=./prisma/schema.prisma

# Build NestJS
RUN npm run build


# ==========================================
# 3️⃣ Production Runner Stage
# ==========================================
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache openssl

COPY apps/user-service/package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/shared/protos ./protos

# Prisma runtime
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# 👇 ADD entrypoint
COPY apps/user-service/entrypoint.sh ./entrypoint.sh
RUN chmod +x entrypoint.sh

ENV PROTO_PATH=/app/protos

# Security
RUN addgroup -S app && adduser -S app -G app
RUN chown -R app:app /app
USER app

EXPOSE 3001

CMD ["sh", "entrypoint.sh"]