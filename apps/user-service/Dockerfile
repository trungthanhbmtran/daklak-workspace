# ==========================================
# 1. Dependencies
# ==========================================
FROM node:22-alpine AS deps
WORKDIR /app

RUN apk add --no-cache openssl

COPY apps/user-service/package*.json ./
RUN npm ci


# ==========================================
# 2. Builder
# ==========================================
FROM node:22-alpine AS builder
WORKDIR /app

RUN apk add --no-cache openssl

COPY --from=deps /app/node_modules ./node_modules
COPY apps/user-service/ ./
COPY shared/protos ./shared/protos

# merge schema (safe hơn)
RUN if [ -d "prisma/schema" ]; then \
    ls prisma/schema/*.prisma | sort | xargs cat > prisma/schema.prisma; \
    fi

ENV DATABASE_URL="mysql://root:password@localhost:3306/db"

RUN npx prisma generate --schema=./prisma/schema.prisma
RUN npm run build


# ==========================================
# 3. Runner
# ==========================================
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache openssl

COPY apps/user-service/package*.json ./
RUN npm ci --omit=dev

# copy prisma engines (QUAN TRỌNG)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/shared/protos ./protos

ENV PROTO_PATH=/app/protos

RUN addgroup -S app && adduser -S app -G app
RUN chown -R app:app /app
USER app

EXPOSE 3001

CMD ["node", "dist/main.js"]