import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaService);
  console.log('Seeding Workflow definitions...');

  // ─── Permission presets ───────────────────────────────────────────────────
  const basePermissions = {
    CHAT:    ['PARTICIPANT', 'ADMIN'],
    MONITOR: ['PARTICIPANT', 'ADMIN'],
    EDIT:    ['OWNER', 'DEPT_LEADER', 'ADMIN'],
    DELETE:  ['OWNER', 'DEPT_LEADER', 'ADMIN'],
  };

  const fullPermissions = {
    ...basePermissions,
    ADD_SUBTASK: ['OWNER', 'DEPT_LEADER', 'ADMIN'],
    COORDINATE:  ['OWNER', 'DEPT_LEADER', 'ADMIN'],
    FORWARD:     ['OWNER', 'DEPT_LEADER', 'ADMIN'],
    ASSIGN:      ['OWNER', 'DEPT_LEADER', 'ADMIN'],
  };

  // ─── 1. Quy trinh xu ly cong viec (TASK_PROCESSING_ID) ───────────────────
  const taskWorkflowDef = {
    nodes: [
      { id: 'node_start', type: 'start', position: { x: 50, y: 200 }, data: { label: 'Bat dau' } },
      {
        id: 'node_plan_assignment', type: 'user_task', position: { x: 250, y: 200 },
        data: {
          label: 'Phuong an phan cong',
          description: 'Lanh dao xac dinh dinh bien va co cau phong ban chiu trach nhiem',
          actionName: 'PLAN_ASSIGNMENT', sendNotification: false,
          assignmentStrategy: 'BY_DEPARTMENT', targetStatus: 'TODO',
          permissions: { ...fullPermissions, PLAN_ASSIGNMENT: ['OWNER', 'DEPT_LEADER', 'ADMIN'] },
        }
      },
      {
        id: 'node_assign', type: 'user_task', position: { x: 500, y: 200 },
        data: {
          label: 'Chinh thuc giao viec',
          description: 'Lanh dao / Quan ly thuc hien giao viec chinh thuc cho nguoi thuc hien',
          actionName: 'ASSIGN', sendNotification: true,
          assignmentStrategy: 'ANY', targetStatus: 'TODO',
          notification: { title: 'Ban duoc giao viec moi', template: 'Cong viec "{{taskTitle}}" vua duoc giao cho ban.', recipientExpression: '[assigneeCode]' },
          permissions: { ...fullPermissions, ASSIGN: ['OWNER', 'DEPT_LEADER', 'ADMIN'] },
        }
      },
      { id: 'gw_split', type: 'parallel_gateway', position: { x: 750, y: 200 }, data: { label: 'Tach luong' } },
      {
        id: 'node_in_progress', type: 'user_task', position: { x: 1000, y: 100 },
        data: {
          label: 'Tiep nhan & Thuc hien',
          description: 'Nhan vien thu ly va thuc hien cong viec, bao gom trao doi chat',
          actionName: 'IN_PROGRESS', sendNotification: true,
          assignmentStrategy: 'ANY', targetStatus: 'IN_PROGRESS',
          notification: { title: 'Nhac nho tien do cong viec', template: 'Cong viec "{{taskTitle}}" dang duoc thuc hien.', recipientExpression: '[assigneeCode]' },
          permissions: { ...fullPermissions, IN_PROGRESS: ['ASSIGNEE', 'OWNER', 'DEPT_LEADER', 'ADMIN'] },
        }
      },
      {
        id: 'node_monitor', type: 'user_task', position: { x: 1000, y: 350 },
        data: {
          label: 'Lanh dao theo doi',
          description: 'Lanh dao giam sat va chi dao tien do cong viec',
          actionName: 'MONITOR', sendNotification: false,
          assignmentStrategy: 'ASSIGNER', targetStatus: 'IN_PROGRESS',
          permissions: { ...fullPermissions },
        }
      },
      { id: 'gw_join', type: 'parallel_gateway', position: { x: 1250, y: 200 }, data: { label: 'Gop luong' } },
      {
        id: 'node_report', type: 'user_task', position: { x: 1500, y: 200 },
        data: {
          label: 'Tong hop ket qua',
          description: 'Nhan vien bao cao ket qua hoan thanh, de nghi nghiem thu',
          actionName: 'COMPLETE', sendNotification: true,
          assignmentStrategy: 'ASSIGNER', targetStatus: 'PENDING_APPROVAL', autoProgress: 100,
          notification: { title: 'Yeu cau nghiem thu cong viec', template: 'Nhan su da bao cao hoan thanh cong viec "{{taskTitle}}". Vui long kiem tra va nghiem thu.', recipientExpression: '[supervisorCode, assignerCode, creatorEmployeeCode]' },
          permissions: { ...fullPermissions, COMPLETE: ['ASSIGNEE', 'OWNER', 'DEPT_LEADER', 'ADMIN'], DONE: ['ASSIGNEE', 'OWNER', 'DEPT_LEADER', 'ADMIN'] },
        }
      },
      {
        id: 'node_approve', type: 'user_task', position: { x: 1750, y: 200 },
        data: {
          label: 'Nghiem thu / Tra lai',
          description: 'Nguoi giao viec phe duyet hoac tra lai ket qua — Nguoi giao viec la nguoi phe duyet',
          actionName: 'APPROVE', sendNotification: true,
          assignmentStrategy: 'ASSIGNER', targetStatus: 'PENDING_APPROVAL',
          notification: { title: 'Ket qua nghiem thu cong viec', template: 'Cong viec "{{taskTitle}}" da duoc xem xet.', recipientExpression: '[assigneeCode]' },
          permissions: { ...fullPermissions, APPROVE: ['SUPERVISOR', 'DEPT_LEADER', 'OWNER', 'ADMIN'], REJECT: ['SUPERVISOR', 'DEPT_LEADER', 'OWNER', 'ADMIN'] },
        }
      },
      { id: 'gw_approve', type: 'exclusive_gateway', position: { x: 2000, y: 200 }, data: { label: 'Ket qua nghiem thu' } },
      {
        id: 'node_end', type: 'end', position: { x: 2250, y: 200 },
        data: {
          label: 'Ket thuc', targetStatus: 'DONE', sendNotification: true,
          notification: { title: 'Cong viec da duoc nghiem thu', template: 'Cong viec "{{taskTitle}}" cua ban da duoc duyet hoan thanh.', recipientExpression: '[assigneeCode]' }
        }
      },
    ],
    edges: [
      { id: 'edge_start',            source: 'node_start',           target: 'node_plan_assignment', label: '' },
      { id: 'edge_plan_assign',      source: 'node_plan_assignment',  target: 'node_assign',          label: 'PLAN_ASSIGNMENT' },
      { id: 'edge_assign_gw',        source: 'node_assign',           target: 'gw_split',             label: 'ASSIGN' },
      { id: 'edge_gw_main',          source: 'gw_split',              target: 'node_in_progress',     label: '' },
      { id: 'edge_gw_monitor',       source: 'gw_split',              target: 'node_monitor',         label: '' },
      { id: 'edge_progress_gw',      source: 'node_in_progress',      target: 'gw_join',              label: 'IN_PROGRESS' },
      { id: 'edge_monitor_gw',       source: 'node_monitor',          target: 'gw_join',              label: '' },
      { id: 'edge_monitor_instruct', source: 'node_monitor',          target: 'node_in_progress',     label: 'MONITOR' },
      { id: 'edge_gw_report',        source: 'gw_join',               target: 'node_report',          label: '' },
      { id: 'edge_report_approve',   source: 'node_report',           target: 'node_approve',         label: 'COMPLETE' },
      { id: 'edge_approve_gw',       source: 'node_approve',          target: 'gw_approve',           label: 'APPROVE' },
      { id: 'edge_gw_end',           source: 'gw_approve',            target: 'node_end',             label: 'APPROVE', data: { expression: 'actionName === "APPROVE"' } },
      { id: 'edge_gw_return',        source: 'gw_approve',            target: 'node_in_progress',     label: 'REJECT',  data: { expression: 'actionName === "REJECT"' } },
    ],
  };

  // ─── 2. Quy trinh dieu chuyen & xu ly van ban (DOCUMENT_TRANSFER_ID) ──────
  const docTransferWorkflowDef = {
    nodes: [
      { id: 'node_start', type: 'start', position: { x: 50, y: 200 }, data: { label: 'Bat dau' } },
      {
        id: 'node_receive', type: 'user_task', position: { x: 250, y: 200 },
        data: {
          label: 'Tiep nhan & Vao so',
          description: 'Van thu tiep nhan van ban va vao so cong van',
          actionName: 'RECEIVE', sendNotification: false,
          assignmentStrategy: 'ANY', targetStatus: 'TODO',
          permissions: { ...fullPermissions, RECEIVE: ['OWNER', 'DEPT_LEADER', 'ADMIN'] },
        }
      },
      {
        id: 'node_route', type: 'user_task', position: { x: 500, y: 200 },
        data: {
          label: 'Lanh dao but phe',
          description: 'Lanh dao co quan dieu chuyen van ban den don vi xu ly',
          actionName: 'ROUTE', sendNotification: true,
          assignmentStrategy: 'DIRECT_MANAGER',
          notification: { title: 'Co van ban can phe duyet', template: 'Van ban "{{taskTitle}}" dang cho y kien chi dao cua ban.', recipientExpression: '[supervisorCode]' },
          permissions: { ...fullPermissions, ROUTE: ['SUPERVISOR', 'DEPT_LEADER', 'ADMIN'], ASSIGN_DEPT: ['SUPERVISOR', 'DEPT_LEADER', 'ADMIN'], ARCHIVE: ['SUPERVISOR', 'DEPT_LEADER', 'ADMIN'] },
        }
      },
      { id: 'gw_route', type: 'exclusive_gateway', position: { x: 750, y: 200 }, data: { label: 'Dieu chuyen / Luu tru' } },
      {
        id: 'node_assign_staff', type: 'user_task', position: { x: 1000, y: 100 },
        data: {
          label: 'Truong phong phan cong',
          description: 'Lanh dao phong ban giao viec cho chuyen vien xu ly',
          actionName: 'ASSIGN_STAFF', sendNotification: true,
          assignmentStrategy: 'BY_DEPARTMENT',
          notification: { title: 'Co van ban can phan cong', template: 'Da co chi dao cho van ban "{{taskTitle}}". Vui long phan cong chuyen vien xu ly.', recipientExpression: '[assigneeCode]' },
          permissions: { ...fullPermissions, ASSIGN_STAFF: ['DEPT_LEADER', 'ADMIN'] },
        }
      },
      {
        id: 'node_process', type: 'user_task', position: { x: 1250, y: 100 },
        data: {
          label: 'Chuyen vien xu ly',
          description: 'Chuyen vien thu ly va soan thao phan hoi',
          actionName: 'PROCESS', sendNotification: true,
          assignmentStrategy: 'ANY', targetStatus: 'IN_PROGRESS',
          notification: { title: 'Ban duoc giao xu ly van ban', template: 'Ban vua duoc phan cong thu ly van ban "{{taskTitle}}".', recipientExpression: '[assigneeCode]' },
          permissions: { ...fullPermissions, PROCESS: ['ASSIGNEE', 'DEPT_LEADER', 'ADMIN'] },
        }
      },
      {
        id: 'node_approve', type: 'user_task', position: { x: 1500, y: 100 },
        data: {
          label: 'Duyet ket qua xu ly',
          description: 'Lanh dao phe duyet du thao phan hoi cua chuyen vien',
          actionName: 'APPROVE', sendNotification: true,
          assignmentStrategy: 'DIRECT_MANAGER', targetStatus: 'PENDING_APPROVAL', autoProgress: 100,
          notification: { title: 'Trinh duyet ket qua xu ly van ban', template: 'Chuyen vien da hoan thanh xu ly van ban "{{taskTitle}}". Vui long kiem tra.', recipientExpression: '[supervisorCode, assignerCode]' },
          permissions: { ...fullPermissions, APPROVE: ['SUPERVISOR', 'DEPT_LEADER', 'ADMIN'], REJECT: ['SUPERVISOR', 'DEPT_LEADER', 'ADMIN'] },
        }
      },
      { id: 'gw_approve', type: 'exclusive_gateway', position: { x: 1750, y: 100 }, data: { label: 'Ket qua duyet' } },
      {
        id: 'node_issue', type: 'user_task', position: { x: 2000, y: 100 },
        data: {
          label: 'Ban hanh / Luu tru',
          description: 'Van thu ban hanh van ban di hoac luu tru ho so',
          actionName: 'ISSUE', sendNotification: true,
          assignmentStrategy: 'ANY',
          notification: { title: 'Van ban da duoc duyet', template: 'Van ban "{{taskTitle}}" da duoc duyet va san sang de ban hanh.', recipientExpression: '[creatorEmployeeCode]' },
          permissions: { ...fullPermissions, ISSUE: ['OWNER', 'DEPT_LEADER', 'ADMIN'] },
        }
      },
      {
        id: 'node_end', type: 'end', position: { x: 2250, y: 200 },
        data: {
          label: 'Ket thuc', targetStatus: 'DONE', sendNotification: true,
          notification: { title: 'Van ban da ban hanh', template: 'Qua trinh xu ly van ban "{{taskTitle}}" da hoan tat.', recipientExpression: '[assigneeCode, assignerCode]' }
        }
      },
    ],
    edges: [
      { id: 'edge_start',          source: 'node_start',        target: 'node_receive',      label: '' },
      { id: 'edge_recv_route',     source: 'node_receive',      target: 'node_route',         label: 'RECEIVE' },
      { id: 'edge_route_gw',       source: 'node_route',        target: 'gw_route',           label: 'ROUTE' },
      { id: 'edge_gw_assign',      source: 'gw_route',          target: 'node_assign_staff',  label: 'ASSIGN_DEPT', data: { expression: 'actionName === "ASSIGN_DEPT"' } },
      { id: 'edge_gw_archive',     source: 'gw_route',          target: 'node_issue',         label: 'ARCHIVE',     data: { expression: 'actionName === "ARCHIVE"' } },
      { id: 'edge_assign_process', source: 'node_assign_staff', target: 'node_process',       label: 'ASSIGN_STAFF' },
      { id: 'edge_process_approve',source: 'node_process',      target: 'node_approve',       label: 'PROCESS' },
      { id: 'edge_approve_gw',     source: 'node_approve',      target: 'gw_approve',         label: 'APPROVE' },
      { id: 'edge_gw_issue',       source: 'gw_approve',        target: 'node_issue',         label: 'APPROVE', data: { expression: 'actionName === "APPROVE"' } },
      { id: 'edge_gw_return',      source: 'gw_approve',        target: 'node_process',       label: 'REJECT',  data: { expression: 'actionName === "REJECT"' } },
      { id: 'edge_issue_end',      source: 'node_issue',        target: 'node_end',           label: 'ISSUE' },
    ],
  };

  // ─── 3. Quy trinh bien tap & xuat ban (ARTICLE_MANAGEMENT_ID) ────────────
  const articleWorkflowDef = {
    nodes: [
      { id: 'node_start', type: 'start', position: { x: 50, y: 200 }, data: { label: 'Bat dau' } },
      {
        id: 'node_draft', type: 'user_task', position: { x: 250, y: 200 },
        data: {
          label: 'Soan thao',
          description: 'Tac gia soan thao ban thao bai viet',
          actionName: 'SUBMIT_DRAFT', sendNotification: true,
          assignmentStrategy: 'ANY', targetStatus: 'IN_PROGRESS',
          notification: { title: 'Yeu cau viet bai', template: 'Ban duoc phan cong soan thao bai viet "{{taskTitle}}".', recipientExpression: '[assigneeCode]' },
          permissions: { ...fullPermissions, SUBMIT_DRAFT: ['ASSIGNEE', 'DEPT_LEADER', 'ADMIN'] },
        }
      },
      {
        id: 'node_edit', type: 'user_task', position: { x: 500, y: 200 },
        data: {
          label: 'Bien tap',
          description: 'Bien tap vien chinh sua noi dung va kiem tra chat luong bai viet',
          actionName: 'EDIT_ARTICLE', sendNotification: true,
          assignmentStrategy: 'BY_DEPARTMENT', targetStatus: 'REVIEWING',
          notification: { title: 'Co bai viet cho bien tap', template: 'Bai viet "{{taskTitle}}" vua duoc nop va dang cho ban bien tap.', recipientExpression: '[supervisorCode, assignerCode]' },
          permissions: { ...fullPermissions, EDIT_ARTICLE: ['DEPT_LEADER', 'ADMIN'], APPROVE: ['DEPT_LEADER', 'ADMIN'], REJECT: ['DEPT_LEADER', 'ADMIN'] },
        }
      },
      { id: 'gw_edit', type: 'exclusive_gateway', position: { x: 750, y: 200 }, data: { label: 'Dat yeu cau bien tap?' } },
      {
        id: 'node_approve', type: 'user_task', position: { x: 1000, y: 200 },
        data: {
          label: 'Lanh dao duyet',
          description: 'Tong bien tap / Lanh dao phe duyet noi dung bai viet truoc khi xuat ban',
          actionName: 'APPROVE', sendNotification: true,
          assignmentStrategy: 'DIRECT_MANAGER', targetStatus: 'PENDING_APPROVAL', autoProgress: 100,
          notification: { title: 'Co bai viet cho phe duyet', template: 'Bai viet "{{taskTitle}}" da duoc bien tap va can su phe duyet cua ban.', recipientExpression: '[creatorEmployeeCode]' },
          permissions: { ...fullPermissions, APPROVE: ['SUPERVISOR', 'DEPT_LEADER', 'ADMIN'], REJECT: ['SUPERVISOR', 'DEPT_LEADER', 'ADMIN'] },
        }
      },
      { id: 'gw_approve', type: 'exclusive_gateway', position: { x: 1250, y: 200 }, data: { label: 'Ket qua duyet xuat ban' } },
      {
        id: 'node_publish', type: 'user_task', position: { x: 1500, y: 200 },
        data: {
          label: 'Xuat ban',
          description: 'Xuat ban bai viet len cong thong tin dien tu',
          actionName: 'PUBLISH', sendNotification: true,
          assignmentStrategy: 'ANY',
          notification: { title: 'Yeu cau xuat ban bai viet', template: 'Bai viet "{{taskTitle}}" da duoc duyet va san sang de xuat ban.', recipientExpression: '[assigneeCode]' },
          permissions: { ...fullPermissions, PUBLISH: ['OWNER', 'DEPT_LEADER', 'ADMIN'] },
        }
      },
      {
        id: 'node_end', type: 'end', position: { x: 1750, y: 200 },
        data: {
          label: 'Ket thuc', targetStatus: 'DONE', sendNotification: true,
          notification: { title: 'Bai viet da xuat ban', template: 'Qua trinh bien tap bai viet "{{taskTitle}}" da hoan tat.', recipientExpression: '[assignerCode, creatorEmployeeCode]' }
        }
      },
    ],
    edges: [
      { id: 'edge_start',           source: 'node_start',   target: 'node_draft',   label: '' },
      { id: 'edge_draft_edit',      source: 'node_draft',   target: 'node_edit',    label: 'SUBMIT_DRAFT' },
      { id: 'edge_edit_gw',         source: 'node_edit',    target: 'gw_edit',      label: 'EDIT_ARTICLE' },
      { id: 'edge_gw_approve',      source: 'gw_edit',      target: 'node_approve', label: 'APPROVE', data: { expression: 'actionName === "APPROVE"' } },
      { id: 'edge_gw_return_draft', source: 'gw_edit',      target: 'node_draft',   label: 'REJECT',  data: { expression: 'actionName === "REJECT"' } },
      { id: 'edge_approve_gw',      source: 'node_approve', target: 'gw_approve',   label: 'APPROVE' },
      { id: 'edge_gw_publish',      source: 'gw_approve',   target: 'node_publish', label: 'APPROVE', data: { expression: 'actionName === "APPROVE"' } },
      { id: 'edge_gw_return_edit',  source: 'gw_approve',   target: 'node_edit',    label: 'REJECT',  data: { expression: 'actionName === "REJECT"' } },
      { id: 'edge_publish_end',     source: 'node_publish', target: 'node_end',     label: 'PUBLISH' },
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
    'Quy trinh xu ly cong viec v4',
    'Luong nghiep vu xu ly giao viec: Phan cong - Giao viec - Thuc hien (song song Giam sat) - Bao cao - Nghiem thu. Nguoi giao viec la nguoi phe duyet ket qua.',
    taskWorkflowDef,
  );

  await seedWorkflow(
    'DOCUMENT_TRANSFER_ID',
    'Quy trinh dieu chuyen & xu ly van ban',
    'Quy trinh danh rieng cho viec tiep nhan, but phe, xu ly va ban hanh van ban.',
    docTransferWorkflowDef,
  );

  await seedWorkflow(
    'ARTICLE_MANAGEMENT_ID',
    'Quy trinh bien tap & xuat ban',
    'Quy trinh kiem duyet va xuat ban bai viet, tin tuc cho cong thong tin dien tu.',
    articleWorkflowDef,
  );

  console.log('Seeding hoan tat!');
  await app.close();
}

main().catch((e) => {
  console.error('Error seeding workflow:', e);
  process.exit(1);
});
