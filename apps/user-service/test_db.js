const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.menu.findMany({ where: { code: 'SYS_GROUP' } }).then(console.log).finally(() => prisma.$disconnect());
