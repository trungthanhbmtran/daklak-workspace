import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as dotenv from 'dotenv';
import { PrismaClient } from '../src/generated/prisma/client';
import { seedMenus } from './seeds/menus.seed';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('Missing DATABASE_URL');
}

const adapter = new PrismaMariaDb(databaseUrl.replace(/^mysql:\/\//, 'mariadb://'));
const prisma = new PrismaClient({ adapter });

seedMenus(prisma)
  .then(() => console.log('✅ Menu seed completed successfully.'))
  .catch((error) => {
    console.error('❌ Menu seed failed:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
