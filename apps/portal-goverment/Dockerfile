# ==========================================
# 1️⃣ Dependency Stage
# ==========================================
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files for the standalone app
COPY apps/portal-goverment/package*.json ./

# Install dependencies using npm ci
RUN npm ci

# ==========================================
# 2️⃣ Builder Stage
# ==========================================
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules

# Copy app source files
COPY apps/portal-goverment ./

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED 1
RUN DATABASE_URL="mysql://dummy:dummy@localhost:3306/dummy" npm run build
# Copy generated Prisma client to the correct compiled src directory
RUN cp -r src/generated $(find dist -type d -name src | head -n 1)/ || true

# ==========================================
# 3️⃣ Runner Stage
# ==========================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built assets
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
