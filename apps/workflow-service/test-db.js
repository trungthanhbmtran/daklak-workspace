const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();

async function main() {
  const data = await prisma.integrationConnection.findMany({
    orderBy: { createdAt: 'desc' },
    take: 1
  });
  console.dir(data, { depth: null });
}
main().catch(console.error).finally(() => prisma.$disconnect());
