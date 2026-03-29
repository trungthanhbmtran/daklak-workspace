import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

async function test() {
  const prisma = new PrismaClient();
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
