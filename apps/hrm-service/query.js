const { PrismaClient } = require('./generated/prisma');

const prisma = new PrismaClient();

async function main() {
  const criteria = await prisma.kpiCriteria.findMany();
  console.log("Criteria:", JSON.stringify(criteria, null, 2));

  const templates = await prisma.taskRankTemplate.findMany({ take: 5 });
  console.log("Templates:", JSON.stringify(templates, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
