require('dotenv').config();
const { PrismaClient } = require('../generated/prisma/client');

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('[Notification Seed] Thiếu biến môi trường DATABASE_URL. Không seed database với connection string mặc định. Hãy export DATABASE_URL hoặc cấu hình .env trước khi chạy seed.');
  process.exit(2);
}
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
const prisma = new PrismaClient({
  adapter: new PrismaMariaDb(url.replace(/^mysql:\/\//, 'mariadb://')),
});

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
