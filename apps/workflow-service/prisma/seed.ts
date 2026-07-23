/**
 * Prisma Seed - Workflow Service
 * Chuẩn Prisma 7.x với Driver Adapter (mariadb)
 *
 * Cách chạy:
 *   npx ts-node -r tsconfig-paths/register prisma/seed.ts
 *
 * LƯU Ý Prisma 7.x:
 * - PrismaClient phải được khởi tạo với Driver Adapter.
 * - Import từ generated output path, không phải '@prisma/client'.
 * - DATABASE_URL phải được set trước khi chạy seed.
 */
import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

function createPrismaClient(): PrismaClient {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  // PrismaMariaDb nhận PoolConfig object trực tiếp, không cần createPool() trước
  const url = new URL(dbUrl);
  const adapter = new PrismaMariaDb({
    host: url.hostname,
    port: parseInt(url.port || '3306', 10),
    user: url.username,
    password: url.password,
    database: url.pathname.replace('/', ''),
    connectionLimit: 5,
  });
  return new PrismaClient({ adapter } as any);
}

// ============================================================================
// SEED DATA
// ============================================================================

const integrationConnections = [
  {
    name: 'Hệ thống Trục liên thông LGSP Tỉnh',
    code: 'LGSP_TINH',
    protocol: 'REST',
    baseUrl: 'https://lgsp.daklak.gov.vn/api/v1',
    authType: 'BEARER',
    authConfig: { apiToken: 'mock-token-12345' },
    description: 'Kết nối đồng bộ hồ sơ qua hệ thống trục liên thông nội tỉnh (LGSP)',
    metadata: { environment: 'staging', openApiUrl: 'https://lgsp.daklak.gov.vn/api/v1/swagger.json' },
    endpoints: [
      { path: '/hrm/leave-sync', method: 'POST', description: 'Đồng bộ nghỉ phép nhân sự' },
      { path: '/hrm/employees', method: 'GET', description: 'Lấy danh sách nhân sự' },
    ],
  },
  {
    name: 'Cổng DVC Quốc gia',
    code: 'DVC_QG',
    protocol: 'SOAP',
    baseUrl: 'https://dichvucong.gov.vn/services',
    authType: 'BASIC',
    authConfig: { username: 'daklak_svc', password: 'encrypted_pass' },
    description: 'Kết nối cổng Dịch vụ công Quốc gia qua giao thức SOAP',
    metadata: { wsdlUrl: 'https://dichvucong.gov.vn/services/SubmitDocumentService?wsdl' },
    endpoints: [
      { path: '/SubmitDocumentService', method: 'POST', description: 'Nộp hồ sơ điện tử' },
    ],
  },
];

const leaveRequestGraph = {
  nodes: [
    { id: 'start_1', type: 'start', position: { x: 50, y: 250 }, data: { label: 'Bắt đầu' } },
    { id: 'task_1', type: 'user_task', position: { x: 250, y: 250 }, data: { label: 'Nhân viên nộp đơn', assigneeRole: 'EMPLOYEE', formSchema: JSON.stringify([{id:"f1",name:"reason",label:"Lý do",type:"textarea"},{id:"f2",name:"startDate",label:"Ngày bắt đầu",type:"date"},{id:"f3",name:"endDate",label:"Ngày kết thúc",type:"date"},{id:"f4",name:"leaveDays",label:"Số ngày nghỉ",type:"number"}]) } },
    { id: 'task_2', type: 'user_task', position: { x: 500, y: 250 }, data: { label: 'Trưởng phòng Duyệt', assigneeRole: 'MANAGER' } },
    { id: 'gateway_1', type: 'exclusive_gateway', position: { x: 750, y: 250 }, data: { label: 'Kiểm tra Kết quả Duyệt' } },
    { id: 'integration_1', type: 'service_task', position: { x: 1050, y: 250 }, data: { label: 'Đồng bộ nghỉ phép sang HRM', integrationCode: 'LGSP_TINH', endpoint: '/hrm/leave-sync', method: 'POST', bodyMapping: { employeeId: '{{ variables.employeeId }}', startDate: '{{ variables.startDate }}', endDate: '{{ variables.endDate }}' } } },
    { id: 'end_approved', type: 'end', position: { x: 1350, y: 250 }, data: { label: 'Hoàn thành - Đã duyệt' } },
    { id: 'end_rejected', type: 'end', position: { x: 750, y: 450 }, data: { label: 'Hoàn thành - Bị từ chối' } },
  ],
  edges: [
    { id: 'e_start1_task1', source: 'start_1', target: 'task_1', type: 'custom' },
    { id: 'e_task1_task2', source: 'task_1', target: 'task_2', type: 'custom', label: 'SUBMIT' },
    { id: 'e_task2_gateway1', source: 'task_2', target: 'gateway_1', type: 'custom', label: 'REVIEW' },
    { id: 'e_gateway1_integration1', source: 'gateway_1', target: 'integration_1', type: 'custom', sourceHandle: 'true', label: 'APPROVE', data: { conditions: [{ id: 'c1', field: 'variables.approved', operator: '===', value: 'true', logicalOp: '&&' }], expression: "variables.approved === true" } },
    { id: 'e_gateway1_rejected', source: 'gateway_1', target: 'end_rejected', type: 'custom', sourceHandle: 'false', label: 'REJECT', data: { conditions: [{ id: 'c1', field: 'variables.approved', operator: '===', value: 'false', logicalOp: '&&' }], expression: "variables.approved === false" } },
    { id: 'e_integration1_end', source: 'integration_1', target: 'end_approved', type: 'custom' },
  ],
};

const govComplexTaskGraph = {
  nodes: [
    { id: 'start_1', type: 'start', position: { x: 50, y: 250 }, data: { label: 'Bắt đầu' } },
    { id: 'task_assign', type: 'user_task', position: { x: 250, y: 250 }, data: { label: 'Giao việc (Lãnh đạo)', assigneeRole: 'MANAGER', formSchema: JSON.stringify([{id:"f1",name:"taskName",label:"Tên công việc",type:"text"},{id:"f2",name:"description",label:"Mô tả",type:"textarea"},{id:"f3",name:"dueDate",label:"Hạn chót",type:"date"},{id:"f4",name:"assigneeId",label:"Người nhận",type:"text"}]) } },
    { id: 'gateway_accept', type: 'exclusive_gateway', position: { x: 550, y: 250 }, data: { label: 'Tiếp nhận hay Từ chối?' } },
    { id: 'task_process', type: 'user_task', position: { x: 850, y: 250 }, data: { label: 'Xử lý & Phối hợp (Chuyên viên)', assigneeRole: 'STAFF', formSchema: JSON.stringify([{id:"f1",name:"reportContent",label:"Nội dung báo cáo",type:"textarea"},{id:"f2",name:"attachments",label:"Đính kèm",type:"text"},{id:"f3",name:"coordinators",label:"Người phối hợp",type:"text"}]), multiInstanceLoopCharacteristics: { isSequential: false, collectionString: 'variables.assignees' } } },
    { id: 'task_evaluate', type: 'user_task', position: { x: 1150, y: 250 }, data: { label: 'Nghiệm thu & Chấm KPI', assigneeRole: 'MANAGER', formSchema: JSON.stringify([{id:"f1",name:"isApproved",label:"Đồng ý duyệt",type:"text"},{id:"f2",name:"kpiScore",label:"Điểm KPI",type:"number"},{id:"f3",name:"managerFeedback",label:"Phản hồi",type:"textarea"}]) } },
    { id: 'gateway_evaluate', type: 'exclusive_gateway', position: { x: 1450, y: 250 }, data: { label: 'Kết quả Nghiệm thu' } },
    { id: 'end_done', type: 'end', position: { x: 1750, y: 250 }, data: { label: 'Hoàn thành' } },
  ],
  edges: [
    { id: 'e_start_assign', source: 'start_1', target: 'task_assign', type: 'custom' },
    { id: 'e_assign_gw', source: 'task_assign', target: 'gateway_accept', type: 'custom', label: 'ASSIGN' },
    { id: 'e_gw_reject', source: 'gateway_accept', target: 'task_assign', type: 'custom', sourceHandle: 'false', label: 'REJECT', data: { conditions: [{ id: 'c1', field: 'variables.isAccepted', operator: '===', value: 'false', logicalOp: '&&' }], expression: "variables.isAccepted === false" } },
    { id: 'e_gw_process', source: 'gateway_accept', target: 'task_process', type: 'custom', sourceHandle: 'true', label: 'ACCEPT', data: { conditions: [{ id: 'c1', field: 'variables.isAccepted', operator: '===', value: 'true', logicalOp: '&&' }], expression: "variables.isAccepted === true" } },
    { id: 'e_process_eval', source: 'task_process', target: 'task_evaluate', type: 'custom', label: 'SUBMIT_REPORT' },
    { id: 'e_eval_gw', source: 'task_evaluate', target: 'gateway_evaluate', type: 'custom', label: 'EVALUATE' },
    { id: 'e_gweval_reject', source: 'gateway_evaluate', target: 'task_process', type: 'custom', sourceHandle: 'false', label: 'REWORK', data: { conditions: [{ id: 'c1', field: 'variables.isApproved', operator: '===', value: 'false', logicalOp: '&&' }], expression: "variables.isApproved === false" } },
    { id: 'e_gweval_done', source: 'gateway_evaluate', target: 'end_done', type: 'custom', sourceHandle: 'true', label: 'APPROVE', data: { conditions: [{ id: 'c1', field: 'variables.isApproved', operator: '===', value: 'true', logicalOp: '&&' }], expression: "variables.isApproved === true" } },
  ],
};

const processDefinitions = [
  {
    code: 'LEAVE_REQUEST',
    name: 'Quy trình Xin nghỉ phép',
    description: 'Quy trình chuẩn cho nhân viên xin phép nghỉ với liên thông HRM',
    isActive: true,
    version: {
      version: 1,
      status: 'PUBLISHED',
      graph: leaveRequestGraph,
    },
  },
  {
    code: 'DOCUMENT_APPROVAL',
    name: 'Quy trình Phê duyệt Văn bản',
    description: 'Quy trình phê duyệt văn bản nội bộ nhiều cấp',
    isActive: true,
    version: {
      version: 1,
      status: 'PUBLISHED',
      graph: {
        nodes: [
          { id: 'start_1', type: 'start', position: { x: 50, y: 250 }, data: { label: 'Bắt đầu' } },
          { id: 'task_1', type: 'user_task', position: { x: 250, y: 250 }, data: { label: 'Soạn thảo văn bản', assigneeRole: 'STAFF' } },
          { id: 'task_2', type: 'user_task', position: { x: 550, y: 250 }, data: { label: 'Trưởng phòng ký duyệt', assigneeRole: 'MANAGER' } },
          { id: 'task_3', type: 'user_task', position: { x: 850, y: 250 }, data: { label: 'Ban Giám đốc ký ban hành', assigneeRole: 'DIRECTOR' } },
          { id: 'end_1', type: 'end', position: { x: 1150, y: 250 }, data: { label: 'Văn bản đã ban hành' } },
        ],
        edges: [
          { id: 'e_start1_task1', source: 'start_1', target: 'task_1', type: 'custom' },
          { id: 'e_task1_task2', source: 'task_1', target: 'task_2', type: 'custom', label: 'SUBMIT' },
          { id: 'e_task2_task3', source: 'task_2', target: 'task_3', type: 'custom', label: 'APPROVE' },
          { id: 'e_task3_end1', source: 'task_3', target: 'end_1', type: 'custom', label: 'PUBLISH' },
        ],
      },
    },
  },
  {
    code: 'GOV_COMPLEX_TASK',
    name: 'Quy trình Quản lý Công việc & KPI (CQNN)',
    description: 'Quy trình giao việc, tiếp nhận/từ chối, phối hợp xử lý và đánh giá chấm KPI chuẩn cơ quan nhà nước',
    isActive: true,
    version: {
      version: 1,
      status: 'PUBLISHED',
      graph: govComplexTaskGraph,
    },
  },
];

// ============================================================================
// MAIN SEED FUNCTION
// ============================================================================

async function main() {
  console.log('🌱 Bắt đầu chạy seed database cho Workflow Service (Prisma 7.x)...\n');

  const prisma = createPrismaClient();

  try {
    // 1. Seed IntegrationConnections
    console.log('📡 Seeding IntegrationConnections...');
    for (const conn of integrationConnections) {
      await (prisma as any).integrationConnection.upsert({
        where: { code: conn.code },
        update: {
          name: conn.name,
          baseUrl: conn.baseUrl,
          authType: conn.authType,
          authConfig: conn.authConfig,
          metadata: conn.metadata,
          endpoints: conn.endpoints,
        },
        create: conn,
      });
      console.log(`  ✅ Upserted: ${conn.code} (${conn.protocol})`);
    }

    // 2. Seed ProcessDefinitions & Versions
    console.log('\n📋 Seeding ProcessDefinitions & Versions...');
    for (const def of processDefinitions) {
      const { version: versionData, ...definitionData } = def;

      const definition = await (prisma as any).processDefinition.upsert({
        where: { code: def.code },
        update: { name: def.name, description: def.description, isActive: def.isActive },
        create: definitionData,
      });

      await (prisma as any).processVersion.upsert({
        where: {
          definitionId_version: {
            definitionId: definition.id,
            version: versionData.version,
          },
        },
        update: { graph: versionData.graph, status: versionData.status },
        create: {
          definitionId: definition.id,
          version: versionData.version,
          status: versionData.status,
          graph: versionData.graph,
        },
      });

      console.log(`  ✅ Upserted: ${def.code} - v${versionData.version} [${versionData.status}]`);
    }

    console.log('\n🎉 Hoàn thành seed database!');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('❌ Seed thất bại:', err);
  process.exit(1);
});
