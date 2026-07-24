import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

/**
 * Prisma 7.x Configuration File
 * - `schema`: Trỏ tới thư mục schema (hỗ trợ multi-file schema).
 * - `migrations.path`: Thư mục chứa migration files.
 * - `datasource.url`: Luôn đọc từ biến môi trường DATABASE_URL.
 *
 * LƯU Ý: Kể từ Prisma 7, seed KHÔNG còn cấu hình tại đây.
 * Seed được chạy trực tiếp qua: npx ts-node prisma/seed.ts
 */
export default defineConfig({
  schema: 'prisma/schema',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
