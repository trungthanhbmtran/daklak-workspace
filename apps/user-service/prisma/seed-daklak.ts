import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '../src/generated/prisma/client';
import { seedPartyOrganizationsDakLak } from './seeds/10-daklak-party-organizations.seed';

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) throw new Error('DATABASE_URL is not set');
const mariadbUrl = dbUrl.replace(/^mysql:\/\//, 'mariadb://');
const adapter = new PrismaMariaDb(mariadbUrl);
const prisma = new PrismaClient({ adapter });

export async function main() {
  await seedPartyOrganizationsDakLak(prisma);
}

if (require.main === module) {
  main()
    .catch((e) => {
      console.error('❌ Lỗi khi seed dữ liệu BTCTU:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
