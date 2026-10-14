import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '../src/generated/prisma/client';
import { seedAiProviders } from './seeds/11-ai-providers.seed';

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) throw new Error('DATABASE_URL is not set');
const mariadbUrl = dbUrl.replace(/^mysql:\/\//, 'mariadb://');
const adapter = new PrismaMariaDb(mariadbUrl);
const prisma = new PrismaClient({ adapter });

export async function main() {
  console.log('🚀 Bắt đầu nạp seed cấu hình API Key AI (Gemini & OpenAI)...');
  await seedAiProviders(prisma);
  console.log('✨ Hoàn thành nạp seed cấu hình AI thành công!');
}

if (require.main === module) {
  main()
    .catch((e) => {
      console.error('❌ Lỗi khi seed cấu hình AI:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
