# ---------- BUILD STAGE ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package
COPY package*.json ./
RUN npm install

# Copy toàn bộ source
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build NestJS
RUN npm run build



# ---------- PRODUCTION STAGE ----------
FROM node:20-alpine

WORKDIR /app

# Copy package để install production deps
COPY package*.json ./
RUN npm install --omit=dev

# ⚠️ Quan trọng: copy prisma folder
COPY prisma ./prisma

# Generate prisma client cho runtime
RUN npx prisma generate

# Copy dist từ builder
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]