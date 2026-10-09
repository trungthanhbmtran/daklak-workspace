const { PrismaClient } = require('./apps/hrm-service/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Deleting TaskRankTemplate...');
    const res1 = await prisma.taskRankTemplate.deleteMany({});
    console.log(`Deleted ${res1.count} records from task_rank_templates.`);

    console.log('Deleting RankQuota...');
    const res2 = await prisma.rankQuota.deleteMany({});
    console.log(`Deleted ${res2.count} records from rank_quotas.`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
