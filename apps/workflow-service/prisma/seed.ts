import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaService);
  console.log('Seeding Workflow definitions...');

  // ─── Permission presets ───────────────────────────────────────────────────
  const fullPermissions = {
    CHAT:    ['PARTICIPANT', 'ADMIN'],
    MONITOR: ['PARTICIPANT', 'ADMIN'],
    EDIT:    ['OWNER', 'DEPT_LEADER', 'ADMIN'],
    DELETE:  ['OWNER', 'DEPT_LEADER', 'ADMIN'],
    EXECUTE: ['ASSIGNEE', 'OWNER', 'ADMIN'],
  };

  // ─── 1. Quy trinh xu ly cong viec (TASK_PROCESSING_ID) ───────────────────
  // Được đơn giản hóa để loại bỏ parallel_gateway (tuân thủ Clean Architecture Stateless)
  const taskWorkflowDef = {
    nodes: [
      { id: 'node_start', type: 'start', position: { x: 50, y: 200 }, data: { label: 'Bắt đầu' } },
      {
        id: 'node_assign', type: 'user_task', position: { x: 300, y: 200 },
        data: {
          label: 'Phân công / Tiếp nhận',
          actionName: 'ASSIGN', targetStatus: 'TODO',
          permissions: { ...fullPermissions, ASSIGN: ['OWNER', 'DEPT_LEADER', 'ADMIN'], IN_PROGRESS: ['ASSIGNEE'], REJECT: ['ASSIGNEE'] },
        }
      },
      {
        id: 'node_rejected', type: 'user_task', position: { x: 300, y: 350 },
        data: {
          label: 'Từ chối nhận việc',
          targetStatus: 'REJECTED',
          permissions: { ...fullPermissions, ASSIGN: ['OWNER', 'DEPT_LEADER', 'ADMIN'] },
        }
      },
      {
        id: 'node_in_progress', type: 'user_task', position: { x: 550, y: 200 },
        data: {
          label: 'Thực hiện',
          actionName: 'IN_PROGRESS', targetStatus: 'IN_PROGRESS',
          permissions: { ...fullPermissions, IN_PROGRESS: ['ASSIGNEE', 'OWNER', 'DEPT_LEADER', 'ADMIN'] },
        }
      },
      {
        id: 'node_report', type: 'user_task', position: { x: 800, y: 200 },
        data: {
          label: 'Báo cáo',
          actionName: 'COMPLETE', targetStatus: 'PENDING_APPROVAL',
          permissions: { ...fullPermissions, COMPLETE: ['ASSIGNEE', 'OWNER', 'DEPT_LEADER', 'ADMIN'] },
        }
      },
      {
        id: 'node_approve', type: 'user_task', position: { x: 1050, y: 200 },
        data: {
          label: 'Phê duyệt',
          actionName: 'APPROVE', targetStatus: 'PENDING_APPROVAL',
          permissions: { ...fullPermissions, APPROVE: ['SUPERVISOR', 'DEPT_LEADER', 'OWNER', 'ADMIN'], REJECT: ['SUPERVISOR', 'DEPT_LEADER', 'OWNER', 'ADMIN'] },
        }
      },
      { id: 'gw_approve', type: 'exclusive_gateway', position: { x: 1300, y: 200 }, data: { label: 'Kết quả phê duyệt' } },
      {
        id: 'node_end', type: 'end', position: { x: 1550, y: 200 },
        data: {
          label: 'Kết thúc', targetStatus: 'DONE'
        }
      },
    ],
    edges: [
      { id: 'edge_start',            source: 'node_start',           target: 'node_assign',          label: '' },
      { id: 'edge_assign_loop',      source: 'node_assign',          target: 'node_assign',          label: 'ASSIGN' },
      { id: 'edge_assign_progress',  source: 'node_assign',          target: 'node_in_progress',     label: 'IN_PROGRESS' },
      { id: 'edge_assign_reject',    source: 'node_assign',          target: 'node_rejected',        label: 'REJECT' },
      { id: 'edge_reject_assign',    source: 'node_rejected',        target: 'node_assign',          label: 'ASSIGN' },
      { id: 'edge_progress_report',  source: 'node_in_progress',     target: 'node_report',          label: 'IN_PROGRESS' },
      { id: 'edge_report_approve',   source: 'node_report',          target: 'node_approve',         label: 'COMPLETE' },
      { id: 'edge_approve_gw',       source: 'node_approve',         target: 'gw_approve',           label: 'APPROVE_OR_REJECT' },
      { id: 'edge_gw_end',           source: 'gw_approve',           target: 'node_end',             label: 'APPROVE', data: { expression: 'actionName === "APPROVE"' } },
      { id: 'edge_gw_return',        source: 'gw_approve',           target: 'node_in_progress',     label: 'REJECT',  data: { expression: 'actionName === "REJECT"' } },
    ],
  };

  // ─── 2. Quy trinh dieu chuyen & xu ly van ban (DOCUMENT_TRANSFER_ID) ──────
  const docTransferWorkflowDef = {
    nodes: [
      { id: 'node_start', type: 'start', position: { x: 50, y: 200 }, data: { label: 'Bắt đầu' } },
      {
        id: 'node_receive', type: 'user_task', position: { x: 250, y: 200 },
        data: {
          label: 'Tiếp nhận',
          actionName: 'RECEIVE', targetStatus: 'TODO',
          permissions: { ...fullPermissions, RECEIVE: ['OWNER', 'DEPT_LEADER', 'ADMIN'] },
        }
      },
      {
        id: 'node_route', type: 'user_task', position: { x: 500, y: 200 },
        data: {
          label: 'Bút phê',
          actionName: 'ROUTE',
          permissions: { ...fullPermissions, ROUTE: ['SUPERVISOR', 'DEPT_LEADER', 'ADMIN'], ASSIGN_DEPT: ['SUPERVISOR', 'DEPT_LEADER', 'ADMIN'], ARCHIVE: ['SUPERVISOR', 'DEPT_LEADER', 'ADMIN'] },
        }
      },
      { id: 'gw_route', type: 'exclusive_gateway', position: { x: 750, y: 200 }, data: { label: 'Điều chuyển / Lưu trữ' } },
      {
        id: 'node_assign_staff', type: 'user_task', position: { x: 1000, y: 100 },
        data: {
          label: 'Phân công',
          actionName: 'ASSIGN_STAFF',
          permissions: { ...fullPermissions, ASSIGN_STAFF: ['DEPT_LEADER', 'ADMIN'] },
        }
      },
      {
        id: 'node_process', type: 'user_task', position: { x: 1250, y: 100 },
        data: {
          label: 'Xử lý',
          actionName: 'PROCESS', targetStatus: 'IN_PROGRESS',
          permissions: { ...fullPermissions, PROCESS: ['ASSIGNEE', 'DEPT_LEADER', 'ADMIN'] },
        }
      },
      {
        id: 'node_approve', type: 'user_task', position: { x: 1500, y: 100 },
        data: {
          label: 'Duyệt kết quả',
          actionName: 'APPROVE', targetStatus: 'PENDING_APPROVAL',
          permissions: { ...fullPermissions, APPROVE: ['SUPERVISOR', 'DEPT_LEADER', 'ADMIN'], REJECT: ['SUPERVISOR', 'DEPT_LEADER', 'ADMIN'] },
        }
      },
      { id: 'gw_approve', type: 'exclusive_gateway', position: { x: 1750, y: 100 }, data: { label: 'Kết quả duyệt' } },
      {
        id: 'node_issue', type: 'user_task', position: { x: 2000, y: 100 },
        data: {
          label: 'Ban hành',
          actionName: 'ISSUE',
          permissions: { ...fullPermissions, ISSUE: ['OWNER', 'DEPT_LEADER', 'ADMIN'] },
        }
      },
      {
        id: 'node_end', type: 'end', position: { x: 2250, y: 200 },
        data: {
          label: 'Kết thúc', targetStatus: 'DONE'
        }
      },
    ],
    edges: [
      { id: 'edge_start',          source: 'node_start',        target: 'node_receive',       label: '' },
      { id: 'edge_recv_route',     source: 'node_receive',      target: 'node_route',         label: 'RECEIVE' },
      { id: 'edge_route_gw',       source: 'node_route',        target: 'gw_route',           label: 'ROUTE' },
      { id: 'edge_gw_assign',      source: 'gw_route',          target: 'node_assign_staff',  label: 'ASSIGN_DEPT', data: { expression: 'actionName === "ASSIGN_DEPT"' } },
      { id: 'edge_gw_archive',     source: 'gw_route',          target: 'node_issue',         label: 'ARCHIVE',     data: { expression: 'actionName === "ARCHIVE"' } },
      { id: 'edge_assign_process', source: 'node_assign_staff', target: 'node_process',       label: 'ASSIGN_STAFF' },
      { id: 'edge_process_approve',source: 'node_process',      target: 'node_approve',       label: 'PROCESS' },
      { id: 'edge_approve_gw',     source: 'node_approve',      target: 'gw_approve',         label: 'APPROVE_OR_REJECT' },
      { id: 'edge_gw_issue',       source: 'gw_approve',        target: 'node_issue',         label: 'APPROVE', data: { expression: 'actionName === "APPROVE"' } },
      { id: 'edge_gw_return',      source: 'gw_approve',        target: 'node_process',       label: 'REJECT',  data: { expression: 'actionName === "REJECT"' } },
      { id: 'edge_issue_end',      source: 'node_issue',        target: 'node_end',           label: 'ISSUE' },
    ],
  };

  // ─── Seed helper ──────────────────────────────────────────────────────────
  async function seedWorkflow(
    code: string,
    name: string,
    description: string,
    definition: { nodes: any[]; edges: any[] }
  ) {
    await prisma.workflowInstance.deleteMany({ where: { workflow: { code } } });
    await prisma.workflowDefinition.deleteMany({ where: { code } });

    await prisma.workflowDefinition.create({
      data: {
        code,
        name,
        description,
        version: 1,
        status: 'Published',
        nodes: {
          create: definition.nodes.map((n: any) => ({
            id: `${code}_${n.id}`,
            nodeKey: n.id,
            type: n.type,
            name: n.data?.label || n.id,
            x: n.position?.x || 0,
            y: n.position?.y || 0,
            properties: n.data || {},
          })),
        },
        edges: {
          create: definition.edges.map((e: any) => ({
            sourceNodeId: `${code}_${e.source}`,
            targetNodeId: `${code}_${e.target}`,
            condition: e.data?.expression || e.label || '',
          })),
        },
      },
    });

    console.log(`  Seeded: ${code} (${name})`);
  }

  // ─── Execute seeds ────────────────────────────────────────────────────────
  await seedWorkflow(
    'TASK_PROCESSING_ID',
    'Quy trình mẫu cơ bản (Generic Workflow)',
    'Luồng xử lý chung: Phân công -> Thực hiện -> Báo cáo -> Phê duyệt.',
    taskWorkflowDef,
  );

  await seedWorkflow(
    'DOCUMENT_TRANSFER_ID',
    'Quy trình điều chuyển văn bản',
    'Quy trình tiếp nhận, bút phê, xử lý và ban hành văn bản.',
    docTransferWorkflowDef,
  );

  console.log('Seeding hoàn tất!');
  await app.close();
}

main().catch((e) => {
  console.error('Error seeding workflow:', e);
  process.exit(1);
});
