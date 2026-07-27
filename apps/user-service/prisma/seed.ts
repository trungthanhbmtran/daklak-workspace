import * as dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { runSeeds } from './seeds';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('Missing DATABASE_URL');
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaMariaDb({ url }),
});

async function main() {
  console.log('🌱 START COMPREHENSIVE E-GOV SEED');
  await runSeeds(prisma);
  console.log('✅ Seed completed successfully.');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
