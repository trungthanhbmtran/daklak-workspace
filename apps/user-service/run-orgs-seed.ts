import 'dotenv/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from './src/generated/prisma/client';
import { seedOrganizationsDakLakProvince } from './prisma/seeds/07-organizations-dak-lak-province.seed';
import { seedJobPositions } from './prisma/seeds/08-job-positions.seed';

async function main() {
  const dbUrl = process.env.DATABASE_URL || "mysql://root:mypassword@localhost:3306/admin_systems?allowPublicKeyRetrieval=true";
  const mariadbUrl = dbUrl.replace(/^mysql:\/\//, 'mariadb://');
  const adapter = new PrismaMariaDb(mariadbUrl);
  const prisma = new PrismaClient({ adapter });
  
  try {
    await seedOrganizationsDakLakProvince(prisma);
    await seedJobPositions(prisma);
  } finally {
    await prisma.$disconnect();
  }
}
main().catch(console.error);
