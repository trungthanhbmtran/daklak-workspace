import 'dotenv/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from './src/generated/prisma/client';
import { usersSeed } from './prisma/seeds/05-users.seed';
import { seedUserGroups } from './prisma/seeds/04-pbac.seed';

async function main() {
  const dbUrl = process.env.DATABASE_URL || "mysql://root:mypassword@localhost:3306/admin_systems?allowPublicKeyRetrieval=true";
  const mariadbUrl = dbUrl.replace(/^mysql:\/\//, 'mariadb://');
  const adapter = new PrismaMariaDb(mariadbUrl);
  const prisma = new PrismaClient({ adapter });
  
  try {
    await seedUserGroups(prisma);
    await usersSeed(prisma);
  } finally {
    await prisma.$disconnect();
  }
}
main().catch(console.error);
