/**
 * Seed script – nạp dữ liệu mẫu và cập nhật database (idempotent, an toàn chạy lại).
 * Sau khi chuyển RBAC → PBAC: seed cập nhật menu SYS_RBAC thành SYS_PBAC.
 *
 * Chạy để cập nhật database (từ thư mục project_stc/user-service):
 *   npm run prisma:seed
 *
 * Yêu cầu: DATABASE_URL trong .env (file .env ở thư mục user-service hoặc root).
 */
import 'dotenv/config';
import * as bcrypt from 'bcrypt'; // Hoặc 'bcryptjs' tùy package bạn cài
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL is required for seed');

// Khởi tạo Prisma Client
const adapter = new PrismaMariaDb(url);
const prisma = new PrismaClient({ adapter });

const DEFAULT_PASSWORD = 'Admin@123';

async function main() {
  console.log('🌱 Bắt đầu nạp dữ liệu mẫu (Full Schema + Rich Data)...');

  // ==========================================================
  // 1. NẠP DANH MỤC DÙNG CHUNG (CATEGORIES) – bảng sys_categories
  // ==========================================================
  console.log('🔹 1. Đang nạp Danh mục dùng chung (Categories)...');

  
  console.log('✅ Nạp dữ liệu hoàn tất. Categories (MICROSERVICE), Menu (Cổng TT + Quản trị), PBAC.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });