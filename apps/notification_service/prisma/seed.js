require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
const mariadb = require('mariadb');

const url = process.env.DATABASE_URL || 'mysql://root:mypassword@127.0.0.1:3306/admin_notification';
const adapter = new PrismaMariaDb(url);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding notification_channels...');

  await prisma.notificationChannel.upsert({
    where: { code: 'NOTIFY_INAPP' },
    update: { isActive: true },
    create: {
      name: 'In-App Notifications',
      code: 'NOTIFY_INAPP',
      config: {},
      isActive: true,
    },
  });

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
