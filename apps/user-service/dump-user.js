require('dotenv').config();
const { PrismaClient } = require('./src/generated/prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');

const dbUrl = process.env.DATABASE_URL;
const mariadbUrl = dbUrl.replace(/^mysql:\/\//, 'mariadb://');
const adapter = new PrismaMariaDb(mariadbUrl);
const prisma = new PrismaClient({ adapter });

async function main() {
  const user = await prisma.user.findUnique({
    where: { username: 'superadmin' },
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

  console.log('User roles:', user.roles.map(r => r.code));
  console.log('Allowed resources:', Array.from(allowedResources));
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
