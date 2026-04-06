import { PrismaClient } from '@generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as dotenv from 'dotenv';
dotenv.config();

async function test() {
  const url = process.env.DATABASE_URL || '';
  const adapter = new PrismaMariaDb(url);
  const prisma = new PrismaClient({ adapter });
  try {
    const result = await prisma.$queryRaw`SELECT 1 as result`;
    console.log('Connection success:', result);
  } catch (e) {
    console.error('Connection failed:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}
test();
