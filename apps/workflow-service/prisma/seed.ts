import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaService);

  console.log('Seeding Workflow definition for Task Processing...');

  const taskWorkflowDef = {
    nodes: [
      {
        id: 'node_start',
        type: 'start',
        position: { x: 250, y: 50 },
        data: { label: 'Bắt đầu' },
      },
      {
        id: 'node_processing',
        type: 'user_task',
        position: { x: 250, y: 150 },
        data: {
          label: 'Đang xử lý nghiệp vụ Giao việc',
          description: 'Quản lý các trạng thái: Giao việc, Tiếp nhận, Báo cáo, Duyệt/Trả lại',
          role: '', // Không dùng hardcode PBAC cơ bản nữa
          validationExpression: `
            (function() {
              // actionName, userId, userRoles, userContext, context (from Workflow) are available
              
              if (actionName === 'ASSIGN') {
                 // Chỉ quản lý, admin, hoặc người được giao mới được uỷ quyền lại
                 // Kiểm tra xem người nhận có nằm trong danh sách cấp dưới không (nếu không phải Admin)
                 var isAdmin = userRoles.includes('SUPER_ADMIN');
                 var isManager = userRoles.includes('MANAGER');
                 return isAdmin || isManager;
              }
              
              if (actionName === 'IN_PROGRESS') {
                 // Người được giao mới được đổi trạng thái thành IN_PROGRESS
                 return true; // Thực tế cần: userId === context.assigneeId, do HrmService chưa truyền assigneeId vào context, tạm thời pass để HRM xử lý bổ sung
              }
              
              if (actionName === 'DONE') {
                 // Người được giao mới được báo cáo hoàn thành
                 return true; 
              }
              
              if (actionName === 'RETURNED' || actionName === 'APPROVED') {
                 // Lãnh đạo giao việc mới được duyệt hoặc trả lại
                 var isAdmin = userRoles.includes('SUPER_ADMIN');
                 var isManager = userRoles.includes('MANAGER');
                 return isAdmin || isManager;
              }
              
              return true; // Cho phép các hành động khác
            })()
          `
        },
      },
      {
        id: 'node_end',
        type: 'end',
        position: { x: 250, y: 300 },
        data: { label: 'Kết thúc' },
      }
    ],
    edges: [
      {
        id: 'edge_1',
        source: 'node_start',
        target: 'node_processing',
      },
      {
        id: 'edge_2',
        source: 'node_processing',
        target: 'node_end',
      }
    ],
  };

  const workflow = await prisma.workflow.upsert({
    where: { id: 'TASK_PROCESSING_ID' }, // Provide a fixed UUID or use findFirst
    update: {
      name: 'Quy trình xử lý công việc (Động)',
      description: 'Luồng nghiệp vụ xử lý giao việc: Lãnh đạo giao, nhân viên thụ lý. Áp dụng luật kiểm tra động qua Expression.',
      definition: taskWorkflowDef,
      trigger: 'MANUAL',
      version: 2
    },
    create: {
      id: 'TASK_PROCESSING_ID',
      name: 'Quy trình xử lý công việc (Động)',
      description: 'Luồng nghiệp vụ xử lý giao việc: Lãnh đạo giao, nhân viên thụ lý. Áp dụng luật kiểm tra động qua Expression.',
      definition: taskWorkflowDef,
      trigger: 'MANUAL',
      version: 1
    },
  });

  console.log('✅ Upserted Workflow:', workflow.name);
  await app.close();
}

main()
  .catch((e) => {
    console.error('Error seeding workflow:', e);
    process.exit(1);
  });