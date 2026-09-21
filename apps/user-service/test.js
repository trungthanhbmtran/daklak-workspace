const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const units = await prisma.organizationUnit.findMany({ select: { id: true, code: true }, take: 10 });
  console.log(units);
}
main().catch(console.error).finally(() => prisma.$disconnect());
