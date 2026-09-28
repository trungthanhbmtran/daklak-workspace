import { PrismaClient } from './src/generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as dotenv from 'dotenv';
import { seed1UnitTypesNewModel } from './prisma/seeds/03-1-unit-types-new-model.seed';

dotenv.config();

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error('DATABASE_URL is not set');
  const mariadbUrl = dbUrl.replace(/^mysql:\/\//, 'mariadb://');
  const adapter = new PrismaMariaDb(mariadbUrl);
  const prisma = new PrismaClient({ adapter });

  try {
    await seed1UnitTypesNewModel(prisma);
    console.log('✅ UnitTypes Seed completed successfully');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
