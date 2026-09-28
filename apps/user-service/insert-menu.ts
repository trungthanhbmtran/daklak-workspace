import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from './src/generated/prisma/client';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('Missing DATABASE_URL');
  process.exit(1);
}

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) throw new Error('DATABASE_URL is not set');
const mariadbUrl = dbUrl.replace(/^mysql:\/\//, 'mariadb://');
const adapter = new PrismaMariaDb(mariadbUrl);
const prisma = new PrismaClient({ adapter });

async function main() {
  const sysGroup = await prisma.menu.findUnique({ where: { code: 'SYS_GROUP' } });
  if (sysGroup) {
    await prisma.menu.upsert({
      where: { code: 'SYS_UNIT_JOB_TEMPLATE' },
      update: {
        name: 'Phân loại chức danh',
        route: '/services/admin/unit-job-templates',
        icon: 'Briefcase',
        order: 1.5,
        linkedResourceCode: 'ORGANIZATION',
        type: 'MENU',
        parentId: sysGroup.id
      },
      create: {
        code: 'SYS_UNIT_JOB_TEMPLATE',
        name: 'Phân loại chức danh',
        route: '/services/admin/unit-job-templates',
        icon: 'Briefcase',
        order: 1.5,
        linkedResourceCode: 'ORGANIZATION',
        type: 'MENU',
        parentId: sysGroup.id
      }
    });
    console.log('Inserted SYS_UNIT_JOB_TEMPLATE menu successfully!');
  }
}

main().then(() => prisma.$disconnect()).catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
