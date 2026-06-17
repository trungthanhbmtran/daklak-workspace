const { PrismaClient } = require('./apps/hrm-service/node_modules/@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const where = { AND: [], status: { not: 'TEMPLATE' } };
  const scopingConditions = [];
  
  // 1. Participant check for NV_100
  scopingConditions.push({
    participants: {
      some: {
        employeeCode: 'NV_100'
      }
    }
  });
  
  // 2. Creator check for NV_100
  scopingConditions.push({
    creatorEmployeeCode: 'NV_100'
  });
  
  where.AND.push({ OR: scopingConditions });
  
  // 3. Assigner filter
  where.AND.push({
    participants: {
      some: {
        employeeCode: 'NV_100',
        participantRole: 'OWNER'
      }
    }
  });

  const tasks = await prisma.task.findMany({
    where,
    include: {
      participants: true
    }
  });

  console.log("Tasks found:", tasks.length);
  tasks.forEach(t => {
    console.log(`Task ${t.id} - ${t.title}`);
    console.log("Participants:", t.participants.map(p => `${p.participantRole}:${p.employeeCode}`).join(", "));
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
