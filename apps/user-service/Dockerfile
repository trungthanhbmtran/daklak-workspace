FROM node:22-alpine

WORKDIR /app

# prisma cần openssl
RUN apk add --no-cache openssl

# cache deps
COPY apps/user-service/package*.json ./
RUN npm ci

# copy source
COPY apps/user-service/ ./
COPY shared/protos ./shared/protos

# generate prisma (không cần DB)
RUN npx prisma generate --schema=./prisma/schema.prisma

# build nest
RUN npm run build

# remove dev deps
RUN npm prune --omit=dev

ENV NODE_ENV=production
ENV PROTO_PATH=/app/protos

EXPOSE 3001

# chạy trực tiếp app
CMD ["node", "dist/main.js"]