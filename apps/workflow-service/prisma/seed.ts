import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaService);

  console.log('Seeding Workflow definition for Task Processing...');

  const taskWorkflowDef = {
    nodes: [
      { id: 'node_start', type: 'start', position: { x: 50, y: 150 }, data: { label: 'Bắt đầu' } },
      { 
        id: 'node_assign', 
        type: 'user_task', 
        position: { x: 250, y: 150 }, 
        data: { label: 'Giao việc', role: 'MANAGER', description: 'Lãnh đạo/Quản lý thực hiện giao việc', actionName: 'ASSIGN', sendNotification: true } 
      },
      { 
        id: 'node_in_progress', 
        type: 'user_task', 
        position: { x: 500, y: 150 }, 
        data: { label: 'Tiếp nhận & Xử lý', role: 'STAFF', description: 'Nhân viên thụ lý và thực hiện công việc chính', actionName: 'IN_PROGRESS', sendNotification: true } 
      },
      { 
        id: 'node_coordinate', 
        type: 'user_task', 
        position: { x: 500, y: 300 }, 
        data: { label: 'Phối hợp thực hiện', role: 'STAFF', description: 'Người phối hợp tham gia cùng xử lý', actionName: 'COORDINATE', sendNotification: true } 
      },
      { 
        id: 'node_monitor', 
        type: 'user_task', 
        position: { x: 500, y: 0 }, 
        data: { label: 'Lãnh đạo theo dõi', role: 'MANAGER', description: 'Lãnh đạo giám sát tiến độ công việc', actionName: 'MONITOR', sendNotification: false } 
      },
      { 
        id: 'node_report', 
        type: 'user_task', 
        position: { x: 750, y: 150 }, 
        data: { label: 'Báo cáo kết quả', role: 'STAFF', description: 'Nhân viên báo cáo kết quả hoàn thành', actionName: 'DONE', sendNotification: true } 
      },
      { 
        id: 'node_approve', 
        type: 'user_task', 
        position: { x: 1000, y: 150 }, 
        data: { label: 'Phê duyệt / Trả lại', role: 'MANAGER', description: 'Lãnh đạo phê duyệt hoặc trả lại kết quả', actionName: 'APPROVE', sendNotification: true } 
      },
      { id: 'node_end', type: 'end', position: { x: 1250, y: 150 }, data: { label: 'Kết thúc' } }
    ],
    edges: [
      { id: 'edge_start', source: 'node_start', target: 'node_assign', type: 'smoothstep', animated: true },
      { id: 'edge_assign', source: 'node_assign', target: 'node_in_progress', type: 'smoothstep', animated: true, label: 'Giao chính' },
      { id: 'edge_assign_coord', source: 'node_assign', target: 'node_coordinate', type: 'smoothstep', animated: true, label: 'Giao phối hợp' },
      { id: 'edge_assign_monitor', source: 'node_assign', target: 'node_monitor', type: 'smoothstep', animated: true, label: 'Báo cáo theo dõi' },
      { id: 'edge_progress', source: 'node_in_progress', target: 'node_report', type: 'smoothstep', animated: true },
      { id: 'edge_coord_report', source: 'node_coordinate', target: 'node_report', type: 'smoothstep', animated: true, label: 'Hoàn thành' },
      { id: 'edge_monitor_instruct', source: 'node_monitor', target: 'node_in_progress', type: 'smoothstep', animated: true, label: 'Chỉ đạo/Nhắc nhở' },
      { id: 'edge_report', source: 'node_report', target: 'node_approve', type: 'smoothstep', animated: true },
      { id: 'edge_approve', source: 'node_approve', target: 'node_end', type: 'smoothstep', animated: true, label: 'Duyệt' },
      { id: 'edge_return', source: 'node_approve', target: 'node_in_progress', type: 'smoothstep', animated: true, label: 'Trả lại' }
    ],
  };

  const workflow = await prisma.workflow.upsert({
    where: { id: 'TASK_PROCESSING_ID' }, // Provide a fixed UUID or use findFirst
    update: {
      name: 'Quy trình xử lý công việc (Tách luồng) v3',
      description: 'Luồng nghiệp vụ xử lý giao việc đã được tách riêng thành các bước: Giao, Tiếp nhận, Báo cáo, Duyệt.',
      definition: taskWorkflowDef,
      trigger: 'MANUAL',
      version: 3
    },
    create: {
      id: 'TASK_PROCESSING_ID',
      name: 'Quy trình xử lý công việc (Tách luồng) v3',
      description: 'Luồng nghiệp vụ xử lý giao việc đã được tách riêng thành các bước: Giao, Tiếp nhận, Báo cáo, Duyệt.',
      definition: taskWorkflowDef,
      trigger: 'MANUAL',
      version: 3
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