import type { PrismaClient as PrismaClientType } from '@generated/prisma/client';
let PrismaClient: typeof PrismaClientType;
try {
  PrismaClient = require('@generated/prisma/client').PrismaClient;
} catch (e) {
  PrismaClient = require('../generated/prisma/client').PrismaClient;
}
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
      version: 1,
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
              role: 'MANAGER' 
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

  // 2. Document Routing Workflow (Standard 2)
  await prisma.workflow.upsert({
    where: { id: 'doc-routing-001' },
    update: {},
    create: {
      id: 'doc-routing-001',
      name: 'Quy trình Xử lý Văn bản (Chuẩn 2)',
      description: 'Quy trình tự động điều phối và xử lý văn bản đến các đơn vị.',
      trigger: 'DOC_RECEIVED',
      active: true,
      version: 1,
      definition: {
        nodes: [
          { id: 'start', type: 'start', position: { x: 300, y: 0 }, data: { label: 'Bắt đầu' } },
          { 
            id: 'svc-receive', 
            type: 'service_task', 
            position: { x: 300, y: 100 },
            data: { 
              label: 'Vào sổ văn bản',
              service: 'document-service',
              action: 'receiveDocument'
            } 
          },
          { 
            id: 'user-assign', 
            type: 'user_task', 
            position: { x: 300, y: 200 },
            data: { 
              label: 'Lãnh đạo phân công',
              role: 'MANAGER' 
            } 
          },
          { 
            id: 'check-approval', 
            type: 'condition', 
            position: { x: 300, y: 300 },
            data: { 
              label: 'Kiểm tra phê duyệt',
              expression: 'decision == "APPROVE"'
            } 
          },
          { 
            id: 'svc-finalize', 
            type: 'service_task', 
            position: { x: 150, y: 400 },
            data: { 
              label: 'Hoàn tất văn bản',
              service: 'document-service',
              action: 'finalizeDocument'
            } 
          },
          { id: 'end', type: 'end', position: { x: 300, y: 550 }, data: { label: 'Kết thúc' } }
        ],
        edges: [
          { id: 'ed-1', source: 'start', target: 'svc-receive' },
          { id: 'ed-2', source: 'svc-receive', target: 'user-assign' },
          { id: 'ed-3', source: 'user-assign', target: 'check-approval' },
          { id: 'ed-4', source: 'check-approval', target: 'svc-finalize', label: 'True' },
          { id: 'ed-5', source: 'svc-finalize', target: 'end' },
          { id: 'ed-6', source: 'check-approval', target: 'end', label: 'False' }
        ]
      }
    }
  });

  // 3. User Onboarding Workflow
  await prisma.workflow.upsert({
    where: { id: 'user-onboarding-001' },
    update: {},
    create: {
      id: 'user-onboarding-001',
      name: 'Quy trình Tiếp nhận Nhân sự',
      description: 'Quy trình tự động thiết lập quyền và hồ sơ cho nhân sự mới.',
      trigger: 'USER_CREATED',
      active: true,
      version: 1,
      definition: {
        nodes: [
          { id: 'start', type: 'start', position: { x: 250, y: 0 }, data: { label: 'Nhân sự mới' } },
          { 
            id: 'user-setup', 
            type: 'user_task', 
            position: { x: 250, y: 150 },
            data: { 
              label: 'Quản trị thiết lập quyền',
              role: 'ADMIN' 
            } 
          },
          { id: 'end', type: 'end', position: { x: 250, y: 300 }, data: { label: 'Sẵn sàng' } }
        ],
        edges: [
          { id: 'eu-1', source: 'start', target: 'user-setup' },
          { id: 'eu-2', source: 'user-setup', target: 'end' }
        ]
      }
    }
  });

  // 4. Document Processing Workflow (Nghiệp vụ chuẩn)
  await prisma.workflow.upsert({
    where: { id: 'doc-processing-002' },
    update: {},
    create: {
      id: 'doc-processing-002',
      name: 'Quy trình Xử lý Văn bản (Chuẩn)',
      description: 'Chỉ lãnh đạo mới giao việc, nhân viên thụ lý.',
      trigger: 'DOC_PROCESSING',
      active: true,
      version: 1,
      definition: {
        nodes: [
          { id: 'start', type: 'start', position: { x: 300, y: 0 }, data: { label: 'Bắt đầu' } },
          { 
            id: 'manager-assign', 
            type: 'user_task', 
            position: { x: 300, y: 100 },
            data: { 
              label: 'Lãnh đạo phân công',
              role: 'MANAGER' 
            } 
          },
          { 
            id: 'staff-process', 
            type: 'user_task', 
            position: { x: 300, y: 200 },
            data: { 
              label: 'Nhân viên thụ lý',
              role: 'STAFF' 
            } 
          },
          { id: 'end', type: 'end', position: { x: 300, y: 350 }, data: { label: 'Kết thúc' } }
        ],
        edges: [
          { id: 'ep-1', source: 'start', target: 'manager-assign' },
          { id: 'ep-2', source: 'manager-assign', target: 'staff-process' },
          { id: 'ep-3', source: 'staff-process', target: 'end' }
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