import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const tasks = await prisma.task.findMany({ take: 5, include: { assignee: true } });
  console.log('Tasks:', tasks.map(t => ({ id: t.id, rootTaskId: t.rootTaskId, title: t.title, assigneeCode: t.assigneeCode })));
}
main().finally(() => prisma.$disconnect());
