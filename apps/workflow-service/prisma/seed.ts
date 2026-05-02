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
          { id: 'start', type: 'start', data: { label: 'Bắt đầu' } },
          { 
            id: 'mark-review', 
            type: 'service_task', 
            data: { 
              label: 'Chuyển trạng thái Đang duyệt',
              service: 'post',
              action: 'ReviewPost'
            } 
          },
          { 
            id: 'manager-approve', 
            type: 'user_task', 
            data: { 
              label: 'Lãnh đạo phê duyệt',
              role: 'manager' 
            } 
          },
          { 
            id: 'check-decision', 
            type: 'condition', 
            data: { 
              label: 'Kiểm tra quyết định',
              expression: 'decision == "APPROVE"'
            } 
          },
          { 
            id: 'execute-approve', 
            type: 'service_task', 
            data: { 
              label: 'Cập nhật Đã duyệt',
              service: 'post',
              action: 'ApprovePost'
            } 
          },
          { 
            id: 'execute-publish', 
            type: 'service_task', 
            data: { 
              label: 'Xuất bản bài viết',
              service: 'post',
              action: 'PublishPost'
            } 
          },
          { 
            id: 'execute-reject', 
            type: 'service_task', 
            data: { 
              label: 'Từ chối bài viết',
              service: 'post',
              action: 'RejectPost'
            } 
          },
          { id: 'end', type: 'end', data: { label: 'Kết thúc' } }
        ],
        edges: [
          { source: 'start', target: 'mark-review' },
          { source: 'mark-review', target: 'manager-approve' },
          { source: 'manager-approve', target: 'check-decision' },
          { source: 'check-decision', target: 'execute-approve', label: 'True' },
          { source: 'check-decision', target: 'execute-reject', label: 'False' },
          { source: 'execute-approve', target: 'execute-publish' },
          { source: 'execute-publish', target: 'end' },
          { source: 'execute-reject', target: 'end' }
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
          { id: 'start', type: 'start', data: { label: 'Bắt đầu' } },
          { 
            id: 'process-doc', 
            type: 'user_task', 
            data: { 
              label: 'Phân công xử lý',
              role: 'admin' 
            } 
          },
          { id: 'end', type: 'end', data: { label: 'Kết thúc' } }
        ],
        edges: [
          { source: 'start', target: 'process-doc' },
          { source: 'process-doc', target: 'end' }
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