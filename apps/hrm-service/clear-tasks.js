const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.taskParticipant.deleteMany({});
  await prisma.taskClosure.deleteMany({});
  await prisma.taskComment.deleteMany({});
  
  // also delete tasks to avoid foreign key issues from other tables
  try {
    await prisma.task.deleteMany({});
  } catch (e) {
    console.log(e);
  }
}

main().finally(() => prisma.$disconnect());
