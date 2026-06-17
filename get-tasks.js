const { PrismaClient } = require('/app/node_modules/@prisma/client');
const prisma = new PrismaClient();
prisma.task.findMany({ where: { status: { not: 'TEMPLATE' } }, include: { participants: true } }).then(tasks => {
  console.log('Tasks:', tasks.length);
  tasks.forEach(t => {
    console.log('ID:', t.id, 'Title:', t.title);
    t.participants.forEach(p => console.log('  Role:', p.participantRole, 'UserID:', p.userId));
  });
}).catch(console.error).finally(() => prisma.$disconnect());
