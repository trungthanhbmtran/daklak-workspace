import 'dotenv/config';
import type { PrismaClient as PrismaClientType } from '@generated/prisma/client';
let PrismaClient: typeof PrismaClientType;
try {
  PrismaClient = require('@generated/prisma/client').PrismaClient;
} catch (e) {
  PrismaClient = require('../generated/prisma/client').PrismaClient;
}
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaMariaDb(url),
});

async function main() {
  console.log('Syncing users and employees...');
  
  // Update employees user_id by joining with admin_systems.users on email
  const updateEmployeesResult = await prisma.$executeRawUnsafe(`
    UPDATE admin_hrm.employees e
    JOIN admin_systems.users u ON e.email = u.email
    SET e.user_id = CAST(u.id AS CHAR)
    WHERE e.user_id IS NULL OR e.user_id <> CAST(u.id AS CHAR)
  `);
  console.log(`Updated ${updateEmployeesResult} employees with user_id.`);

  // Update users employee_code by joining with admin_hrm.employees on email
  const updateUsersResult = await prisma.$executeRawUnsafe(`
    UPDATE admin_systems.users u
    JOIN admin_hrm.employees e ON u.email = e.email
    SET u.employee_code = e.employee_code
    WHERE u.employee_code IS NULL OR u.employee_code <> e.employee_code
  `);
  console.log(`Updated ${updateUsersResult} users with employee_code.`);

  // Also sync the special UNASSIGNED employee to user ID 0
  const syncUnassigned = await prisma.$executeRawUnsafe(`
    UPDATE admin_hrm.employees
    SET user_id = '0'
    WHERE employee_code = 'UNASSIGNED' AND (user_id IS NULL OR user_id <> '0')
  `);
  console.log(`Synced UNASSIGNED employee to user ID 0 (updated: ${syncUnassigned}).`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error('Sync failed:', e);
    prisma.$disconnect();
    process.exit(1);
  });
