require('dotenv').config();
const { PrismaClient } = require('./src/generated/prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');

const dbUrl = process.env.DATABASE_URL;
const mariadbUrl = dbUrl.replace(/^mysql:\/\//, 'mariadb://');
const adapter = new PrismaMariaDb(mariadbUrl);
const prisma = new PrismaClient({ adapter });

async function main() {
  const userId = 1; // superadmin

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      roles: { include: { policies: { include: { resource: true } } } },
    },
  });

  const allowedResources = new Set();
  for (const role of user?.roles ?? []) {
    for (const p of role.policies ?? []) {
      if (p.resource?.code) {
        allowedResources.add(p.resource.code);
      }
    }
  }

  const rawMenus = await prisma.menu.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });

  const visibleMenus = rawMenus.filter((menu) => {
    if (menu.linkedResourceCode) {
      return allowedResources.has(menu.linkedResourceCode);
    }
    return true;
  });

  const allowedPaths = new Set();
  for (const menu of visibleMenus) {
    const p = menu.route;
    if (!p) continue;
    
    allowedPaths.add(p);
    const segmentsCount = p.split('/').filter(Boolean).length;
    if (segmentsCount >= 3) {
      allowedPaths.add(`${p}/*`);
    }
  }
  
  // Kiểm tra xem '/services/admin/organization' có trong allowedPaths không
  console.log('Is /services/admin/organization in allowedPaths?', allowedPaths.has('/services/admin/organization'));
  console.log('Is /services/admin/organization/* in allowedPaths?', allowedPaths.has('/services/admin/organization/*'));
  
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
