import { PrismaClient } from '@generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import 'dotenv/config';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL is not defined');
const adapter = new PrismaMariaDb(url);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding workflows...');

  // 1. Article Moderation Workflow
  await prisma.workflow.upsert({
    where: { id: 'post-moderation-001' },
    update: {},
    create: {
      id: 'post-moderation-001',
      name: 'Quy trình Duyệt Bài viết',
      description: 'Quy trình tự động điều phối bài viết từ khi nộp đến khi xuất bản.',
      trigger: 'POST_SUBMIT',
      active: true,
      definition: {
        nodes: [
          { id: 'start', type: 'start', position: { x: 250, y: 0 }, data: { label: 'Bắt đầu' } },
          { 
            id: 'mark-review', 
            type: 'service_task', 
            position: { x: 250, y: 100 },
            data: { 
              label: 'Chuyển trạng thái Đang duyệt',
              service: 'posts-service',
              action: 'reviewPost'
            } 
          },
          { 
            id: 'manager-approve', 
            type: 'user_task', 
            position: { x: 250, y: 200 },
            data: { 
              label: 'Lãnh đạo phê duyệt',
              role: 'manager' 
            } 
          },
          { 
            id: 'check-decision', 
            type: 'condition', 
            position: { x: 250, y: 300 },
            data: { 
              label: 'Kiểm tra quyết định',
              expression: 'decision == "APPROVE"'
            } 
          },
          { 
            id: 'execute-approve', 
            type: 'service_task', 
            position: { x: 100, y: 400 },
            data: { 
              label: 'Cập nhật Đã duyệt',
              service: 'posts-service',
              action: 'approvePost'
            } 
          },
          { 
            id: 'execute-publish', 
            type: 'service_task', 
            position: { x: 100, y: 500 },
            data: { 
              label: 'Xuất bản bài viết',
              service: 'posts-service',
              action: 'publishPost'
            } 
          },
          { 
            id: 'execute-reject', 
            type: 'service_task', 
            position: { x: 400, y: 400 },
            data: { 
              label: 'Từ chối bài viết',
              service: 'posts-service',
              action: 'rejectPost'
            } 
          },
          { id: 'end', type: 'end', position: { x: 250, y: 600 }, data: { label: 'Kết thúc' } }
        ],
        edges: [
          { id: 'e1', source: 'start', target: 'mark-review' },
          { id: 'e2', source: 'mark-review', target: 'manager-approve' },
          { id: 'e3', source: 'manager-approve', target: 'check-decision' },
          { id: 'e4', source: 'check-decision', target: 'execute-approve', label: 'True' },
          { id: 'e5', source: 'check-decision', target: 'execute-reject', label: 'False' },
          { id: 'e6', source: 'execute-approve', target: 'execute-publish' },
          { id: 'e7', source: 'execute-publish', target: 'end' },
          { id: 'e8', source: 'execute-reject', target: 'end' }
        ]
      }
    }
  });

  // 2. Document Routing Workflow
  await prisma.workflow.upsert({
    where: { id: 'doc-routing-001' },
    update: {},
    create: {
      id: 'doc-routing-001',
      name: 'Quy trình Xử lý Văn bản',
      description: 'Quy trình tự động điều phối văn bản đến các phòng ban.',
      trigger: 'DOC_RECEIVED',
      active: true,
      definition: {
        nodes: [
          { id: 'start', type: 'start', position: { x: 250, y: 0 }, data: { label: 'Bắt đầu' } },
          { 
            id: 'process-doc', 
            type: 'user_task', 
            position: { x: 250, y: 150 },
            data: { 
              label: 'Phân công xử lý',
              role: 'admin' 
            } 
          },
          { id: 'end', type: 'end', position: { x: 250, y: 300 }, data: { label: 'Kết thúc' } }
        ],
        edges: [
          { id: 'e-doc-1', source: 'start', target: 'process-doc' },
          { id: 'e-doc-2', source: 'process-doc', target: 'end' }
        ]
      }
    }
  });

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });