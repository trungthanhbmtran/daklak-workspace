require('dotenv').config();
const { PrismaClient } = require('./src/generated/prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');

const dbUrl = process.env.DATABASE_URL;
const mariadbUrl = dbUrl.replace(/^mysql:\/\//, 'mariadb://');
const adapter = new PrismaMariaDb(mariadbUrl);
const prisma = new PrismaClient({ adapter });

async function main() {
  const menus = await prisma.menu.findMany({
    where: {
      route: {
        contains: 'organization'
      }
    }
  });
  console.log(JSON.stringify(menus, null, 2));
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
