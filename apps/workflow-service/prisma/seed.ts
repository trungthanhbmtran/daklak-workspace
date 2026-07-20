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
    {
      id: 'start_1',
      type: 'START',
      name: 'Bắt đầu',
      next: ['task_1'],
    },
    {
      id: 'task_1',
      type: 'USER_TASK',
      name: 'Nhân viên nộp đơn',
      assigneeRole: 'EMPLOYEE',
      form: { fields: ['reason', 'startDate', 'endDate', 'leaveDays'] },
      next: ['task_2'],
    },
    {
      id: 'task_2',
      type: 'USER_TASK',
      name: 'Trưởng phòng Duyệt',
      assigneeRole: 'MANAGER',
      next: ['gateway_1'],
    },
    {
      id: 'gateway_1',
      type: 'EXCLUSIVE_GATEWAY',
      name: 'Kiểm tra Kết quả Duyệt',
      conditions: [
        { target: 'integration_1', expression: 'variables.approved == true' },
        { target: 'end_rejected', expression: 'variables.approved == false' },
      ],
    },
    {
      id: 'integration_1',
      type: 'INTEGRATION_CALL',
      name: 'Đồng bộ nghỉ phép sang HRM',
      integrationCode: 'LGSP_TINH',
      endpoint: '/hrm/leave-sync',
      method: 'POST',
      bodyMapping: {
        employeeId: '{{ variables.employeeId }}',
        startDate: '{{ variables.startDate }}',
        endDate: '{{ variables.endDate }}',
      },
      next: ['end_approved'],
    },
    {
      id: 'end_approved',
      type: 'END',
      name: 'Hoàn thành - Đã duyệt',
    },
    {
      id: 'end_rejected',
      type: 'END',
      name: 'Hoàn thành - Bị từ chối',
    },
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
          { id: 'start_1', type: 'START', name: 'Bắt đầu', next: ['task_1'] },
          { id: 'task_1', type: 'USER_TASK', name: 'Soạn thảo văn bản', assigneeRole: 'STAFF', next: ['task_2'] },
          { id: 'task_2', type: 'USER_TASK', name: 'Trưởng phòng ký duyệt', assigneeRole: 'MANAGER', next: ['task_3'] },
          { id: 'task_3', type: 'USER_TASK', name: 'Ban Giám đốc ký ban hành', assigneeRole: 'DIRECTOR', next: ['end_1'] },
          { id: 'end_1', type: 'END', name: 'Văn bản đã ban hành' },
        ],
      },
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
