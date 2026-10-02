# Build from the repository root to preserve shared contract imports.
FROM node:22-alpine AS deps
WORKDIR /app
COPY apps/admin_khcn/package*.json ./
RUN npm ci --legacy-peer-deps

FROM node:22-alpine AS builder
WORKDIR /app/apps/admin_khcn
COPY --from=deps /app/node_modules ./node_modules
COPY apps/admin_khcn ./
COPY shared /app/shared
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
RUN apk add --no-cache dumb-init tzdata
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV TZ=Asia/Ho_Chi_Minh
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin_khcn/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin_khcn/public ./apps/admin_khcn/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin_khcn/.next/static ./apps/admin_khcn/.next/static
USER nextjs
EXPOSE 3000
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "apps/admin_khcn/server.js"]

