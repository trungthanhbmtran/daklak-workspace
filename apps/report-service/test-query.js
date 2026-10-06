const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
const { PrismaClient } = require('./src/generated/prisma');

const mariadbUrl = 'mariadb://root:root123@127.0.0.1:3306/admin_report';
const adapter = new PrismaMariaDb(mariadbUrl);
const prisma = new PrismaClient({ adapter });

async function test() {
  try {
    const res = await prisma.$queryRawUnsafe(`
      SELECT t.id, t.status, t.isCompleted, t.progress, t.dueDate, t.completedAt, t.updatedAt, p.participantRole, p.employeeCode, e.fullName, e.departmentId 
      FROM admin_hrm.task t 
      LEFT JOIN admin_hrm.task_participant p ON t.id = p.taskId AND p.participantRole IN ('ASSIGNEE', 'OWNER') 
      LEFT JOIN admin_hrm.employee e ON p.employeeCode = e.employeeCode 
      LIMIT 5
    `);
    console.log(JSON.stringify(res, null, 2));
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}
test();
