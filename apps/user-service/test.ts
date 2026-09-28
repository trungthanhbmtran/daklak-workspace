import { PrismaClient } from './src/generated/prisma/client';
const prisma = new PrismaClient();
prisma.unitType.findMany().then(r => console.log(r)).catch(e => console.error(e)).finally(() => prisma.$disconnect());
