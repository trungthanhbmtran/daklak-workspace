import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as dotenv from 'dotenv';

dotenv.config();

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('Missing DATABASE_URL in .env');
  process.exit(1);
}

function parseDatabaseUrl(url: string) {
  const u = new URL(url);
  return {
    host: u.hostname,
    port: u.port ? parseInt(u.port, 10) : 3306,
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname ? decodeURIComponent(u.pathname.slice(1)) : '',
  };
}

const parsed = parseDatabaseUrl(url);
const adapter = new PrismaMariaDb({
  ...parsed,
  allowPublicKeyRetrieval: true,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting Workflow Service Seed...');

  // 1. CLEAR OLD DATA (Optional, but good for clean seed)
  // await prisma.executionLog.deleteMany({});
  // await prisma.workflowInstance.deleteMany({});
  // await prisma.workflow.deleteMany({});

  // 2. CREATE SAMPLE WORKFLOW: Leave Request (Yêu cầu nghỉ phép)
  const leaveWorkflow = await prisma.workflow.upsert({
    where: { id: 'leave-request-v1' },
    update: {},
    create: {
      id: 'leave-request-v1',
      name: 'Quy trình Yêu cầu nghỉ phép',
      description: 'Quy trình phê duyệt đơn xin nghỉ phép của cán bộ, công chức.',
      version: 1,
      active: true,
      definition: {
        nodes: [
          {
            id: 'start_1',
            type: 'start',
            position: { x: 100, y: 150 },
            data: { label: 'Bắt đầu' },
          },
          {
            id: 'cond_days',
            type: 'condition',
            position: { x: 300, y: 150 },
            data: { 
              label: 'Số ngày > 3?', 
              expression: 'days > 3' 
            },
          },
          {
            id: 'task_manager',
            type: 'user_task',
            position: { x: 550, y: 50 },
            data: { 
              label: 'Lãnh đạo đơn vị phê duyệt', 
              role: 'MANAGER' 
            },
          },
          {
            id: 'task_supervisor',
            type: 'user_task',
            position: { x: 550, y: 250 },
            data: { 
              label: 'Cán bộ quản lý trực tiếp phê duyệt', 
              role: 'SUPERVISOR' 
            },
          },
          {
            id: 'service_notify',
            type: 'service_task',
            position: { x: 800, y: 150 },
            data: { 
              label: 'Gửi thông báo kết quả', 
              service: 'notification-service',
              action: 'SEND_EMAIL'
            },
          },
          {
            id: 'end_1',
            type: 'end',
            position: { x: 1050, y: 150 },
            data: { label: 'Kết thúc' },
          },
        ],
        edges: [
          { id: 'e1', source: 'start_1', target: 'cond_days' },
          { id: 'e2_true', source: 'cond_days', target: 'task_manager', label: 'True' },
          { id: 'e2_false', source: 'cond_days', target: 'task_supervisor', label: 'False' },
          { id: 'e3_a', source: 'task_manager', target: 'service_notify' },
          { id: 'e3_b', source: 'task_supervisor', target: 'service_notify' },
          { id: 'e4', source: 'service_notify', target: 'end_1' },
        ],
      },
    },
  });

  console.log(`✅ Seeded Workflow: ${leaveWorkflow.name} (ID: ${leaveWorkflow.id})`);

  // 3. CREATE SAMPLE WORKFLOW: Document Approval (Phê duyệt văn bản)
  const docWorkflow = await prisma.workflow.upsert({
    where: { id: 'doc-approval-v1' },
    update: {},
    create: {
      id: 'doc-approval-v1',
      name: 'Quy trình Phê duyệt văn bản',
      description: 'Luân chuyển và ký duyệt văn bản hành chính.',
      version: 1,
      active: true,
      definition: {
        nodes: [
          { id: 'start_1', type: 'start', position: { x: 50, y: 100 }, data: { label: 'Soạn thảo' } },
          { id: 'task_review', type: 'user_task', position: { x: 250, y: 100 }, data: { label: 'Phòng chuyên môn thẩm định', role: 'EXPERT' } },
          { id: 'task_approve', type: 'user_task', position: { x: 500, y: 100 }, data: { label: 'Lãnh đạo ký duyệt', role: 'DIRECTOR' } },
          { id: 'end_1', type: 'end', position: { x: 750, y: 100 }, data: { label: 'Ban hành' } },
        ],
        edges: [
          { id: 'e1', source: 'start_1', target: 'task_review' },
          { id: 'e2', source: 'task_review', target: 'task_approve' },
          { id: 'e3', source: 'task_approve', target: 'end_1' },
        ],
      },
    },
  });

  console.log(`✅ Seeded Workflow: ${docWorkflow.name} (ID: ${docWorkflow.id})`);

  console.log('🎉 Workflow Service Seed Completed!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });