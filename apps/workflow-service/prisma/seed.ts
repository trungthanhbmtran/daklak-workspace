import { PrismaMariaDb } from '@prisma/adapter-mariadb';
/**
 * Prisma Seed - Workflow Service
 * Chuẩn Prisma 7.x với Driver Adapter (mariadb)
 *
 * Cách chạy:
 *   npx ts-node -r tsconfig-paths/register prisma/seed.ts
 *
 * LƯU Ý Prisma 7.x:
 * - PrismaClient phải được khởi tạo với Driver Adapter.
 * - Import từ generated output path, không phải '../src/generated/prisma/client'.
 * - DATABASE_URL phải được set trước khi chạy seed.
 */
import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client'


function createPrismaClient(): PrismaClient {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  const mariadbUrl = dbUrl.replace(/^mysql:\/\//, 'mariadb://');
  const adapter = new PrismaMariaDb(mariadbUrl);
  return new PrismaClient({ adapter });
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
  
const docStatIntegration = {
  name: 'Báo cáo Thống kê Văn bản',
  code: 'DOC_STATISTICS',
  protocol: 'REST',
  baseUrl: 'http://10.50.1.6:3166',
  authType: 'NONE',
  authConfig: {},
  description: 'API thống kê văn bản để tạo báo cáo riêng cho đơn vị',
  metadata: { 
    defaultPayload: {
      from_organ_id: "H15.151",
      document_type: "8",
      trang_thai_tiep_nhan: "fail",
      subject: "minh",
      searchKeyword: [
          { filter: "document_id", value: "r", type: "like" },
          { filter: "type_edoc", value: "edoc", type: "=" }
      ],
      start_date: "2026-07-01",
      end_date: "2026-09-30"
    },
    _parsedEndpoints: [
      {
        id: "ep-doc-statistics-1",
        name: "Lấy thống kê văn bản",
        description: "API tạo báo cáo riêng cho đơn vị",
        folder: "Báo cáo",
        method: "POST",
        path: "/api/document-statistics",
        headers: [
          { key: "Content-Type", value: "application/json", enabled: true }
        ],
        params: [],
        bodyType: "raw",
        body: "{\n    \"from_organ_id\": \"H15.151\",\n    \"document_type\": \"8\",\n    \"trang_thai_tiep_nhan\": \"fail\",\n    \"subject\": \"minh\",\n    \"searchKeyword\": [\n        {\n            \"filter\": \"document_id\",\n            \"value\": \"r\",\n            \"type\": \"like\"\n        },\n        {\n            \"filter\": \"type_edoc\",\n            \"value\": \"edoc\",\n            \"type\": \"=\"\n        }\n    ],\n    \"start_date\": \"2026-07-01\",\n    \"end_date\": \"2026-09-30\"\n}"
      }
    ]
  },
  endpoints: [
    { path: '/api/document-statistics', method: 'POST', description: 'Lấy thống kê văn bản' },
  ],
};
integrationConnections.push(docStatIntegration as any);

const leaveRequestGraph = {
  viewport: { x: 0, y: 0, zoom: 1 },
  nodes: [
    { id: 'start_1', type: 'start', position: { x: 50, y: 250 }, data: { label: 'Bắt đầu' } },
    { id: 'task_1', type: 'user_task', position: { x: 250, y: 250 }, data: { label: 'Nhân viên nộp đơn', assignments: [{ unitScope: 'SELF' }], formSchema: JSON.stringify([{ id: "f1", name: "reason", action: "Lý do", type: "textarea" }, { id: "f2", name: "startDate", action: "Ngày bắt đầu", type: "date" }, { id: "f3", name: "endDate", action: "Ngày kết thúc", type: "date" }, { id: "f4", name: "leaveDays", action: "Số ngày nghỉ", type: "number" }]) } },
    { id: 'task_2', type: 'user_task', position: { x: 500, y: 250 }, data: { label: 'Trưởng phòng Duyệt', assignments: [{ unitScope: 'SAME_UNIT', rankOperator: 'exact', rankValue: 'minRank' }] } },
    { id: 'gateway_1', type: 'exclusive_gateway', position: { x: 750, y: 250 }, data: { label: 'Kiểm tra Kết quả Duyệt' } },
    { id: 'integration_1', type: 'service_task', position: { x: 1050, y: 250 }, data: { label: 'Đồng bộ nghỉ phép sang HRM', integrationCode: 'LGSP_TINH', endpoint: '/hrm/leave-sync', method: 'POST', bodyMapping: { employeeId: '{{ variables.employeeId }}', startDate: '{{ variables.startDate }}', endDate: '{{ variables.endDate }}' } } },
    { id: 'end_approved', type: 'end', position: { x: 1350, y: 250 }, data: { label: 'Hoàn thành - Đã duyệt' } },
    { id: 'end_rejected', type: 'end', position: { x: 750, y: 450 }, data: { label: 'Hoàn thành - Bị từ chối' } },
  ],
  edges: [
    { id: 'e_start1_task1', source: 'start_1', target: 'task_1', type: 'custom' },
    { id: 'e_task1_task2', source: 'task_1', target: 'task_2', type: 'custom', action: 'SUBMIT' },
    { id: 'e_task2_gateway1', source: 'task_2', target: 'gateway_1', type: 'custom', action: 'REVIEW' },
    { id: 'e_gateway1_integration1', source: 'gateway_1', target: 'integration_1', type: 'custom', sourceHandle: 'true', action: 'APPROVE', condition: 'variables.approved === true' },
    { id: 'e_gateway1_rejected', source: 'gateway_1', target: 'end_rejected', type: 'custom', sourceHandle: 'false', action: 'REJECT', condition: 'variables.approved === false' },
    { id: 'e_integration1_end', source: 'integration_1', target: 'end_approved', type: 'custom' },
  ],
};

const govComplexTaskGraph = {
  viewport: { x: 0, y: 0, zoom: 1 },
  nodes: [
    { id: 'start_1', type: 'start', position: { x: 50, y: 250 }, data: { label: 'Bắt đầu' } },
    { id: 'task_assign', type: 'user_task', position: { x: 250, y: 250 }, data: { label: 'Giao việc (Lãnh đạo)', targetStatus: 'PENDING_ACCEPTANCE', assignments: [{ unitScope: 'SAME_UNIT', rankOperator: 'exact', rankValue: 'minRank' }], formSchema: JSON.stringify([{ id: "f1", name: "taskName", action: "Tên công việc", type: "text" }, { id: "f2", name: "description", action: "Mô tả", type: "textarea" }, { id: "f3", name: "dueDate", action: "Hạn chót", type: "date" }, { id: "f4", name: "assigneeId", action: "Người nhận", type: "text" }]) } },
    { id: 'gateway_accept', type: 'exclusive_gateway', position: { x: 550, y: 250 }, data: { label: 'Tiếp nhận hay Từ chối?' } },
    { id: 'task_process', type: 'user_task', position: { x: 850, y: 250 }, data: { label: 'Xử lý & Phối hợp (Chuyên viên)', targetStatus: 'IN_PROGRESS', assignments: [{ unitScope: 'CHILD_UNIT', rankOperator: 'any' }, { unitScope: 'SAME_UNIT', rankOperator: 'any' }], formSchema: JSON.stringify([{ id: "f1", name: "reportContent", action: "Nội dung báo cáo", type: "textarea" }, { id: "f2", name: "attachments", action: "Đính kèm", type: "text" }, { id: "f3", name: "coordinators", action: "Người phối hợp", type: "text" }]), multiInstanceLoopCharacteristics: { isSequential: false, collectionString: 'variables.assignees' } } },
    { id: 'task_evaluate', type: 'user_task', position: { x: 1150, y: 250 }, data: { label: 'Nghiệm thu & Chấm KPI', targetStatus: 'WAITING_FOR_APPROVAL', assignments: [{ unitScope: 'SAME_UNIT', rankOperator: 'exact', rankValue: 'minRank' }], formSchema: JSON.stringify([{ id: "f1", name: "isApproved", action: "Đồng ý duyệt", type: "text" }, { id: "f2", name: "kpiScore", action: "Điểm KPI", type: "number" }, { id: "f3", name: "managerFeedback", action: "Phản hồi", type: "textarea" }]) } },
    { id: 'gateway_evaluate', type: 'exclusive_gateway', position: { x: 1450, y: 250 }, data: { label: 'Kết quả Nghiệm thu' } },
    { id: 'end_done', type: 'end', position: { x: 1750, y: 250 }, data: { label: 'Hoàn thành', targetStatus: 'COMPLETED' } },
  ],
  edges: [
    { id: 'e_start_assign', source: 'start_1', target: 'task_assign', type: 'custom' },
    { id: 'e_assign_gw', source: 'task_assign', target: 'gateway_accept', type: 'custom', action: 'ASSIGN' },
    { id: 'e_gw_reject', source: 'gateway_accept', target: 'task_assign', type: 'custom', sourceHandle: 'false', action: 'REJECT', condition: 'variables.isAccepted === false' },
    { id: 'e_gw_process', source: 'gateway_accept', target: 'task_process', type: 'custom', sourceHandle: 'true', action: 'ACCEPT', condition: 'variables.isAccepted === true' },
    { id: 'e_process_eval', source: 'task_process', target: 'task_evaluate', type: 'custom', action: 'SUBMIT_REPORT' },
    { id: 'e_eval_gw', source: 'task_evaluate', target: 'gateway_evaluate', type: 'custom', action: 'EVALUATE' },
    { id: 'e_gweval_reject', source: 'gateway_evaluate', target: 'task_process', type: 'custom', sourceHandle: 'false', action: 'REWORK', condition: 'variables.isApproved === false' },
    { id: 'e_gweval_done', source: 'gateway_evaluate', target: 'end_done', type: 'custom', sourceHandle: 'true', action: 'APPROVE', condition: 'variables.isApproved === true' },
  ],
};


const unexpectedTaskGraph = {
  viewport: { x: 0, y: 0, zoom: 1 },
  nodes: [
    { id: 'start_1', type: 'start', position: { x: 50, y: 250 }, data: { label: 'Bắt đầu' } },
    { id: 'task_propose', type: 'user_task', position: { x: 250, y: 250 }, data: { label: 'Đề xuất việc phát sinh (Nhân viên)', targetStatus: 'TODO', assignments: [{ unitScope: 'SELF' }], formSchema: JSON.stringify([{ id: 'f1', name: 'taskName', action: 'Tên công việc', type: 'text' }, { id: 'f2', name: 'description', action: 'Mô tả', type: 'textarea' }, { id: 'f3', name: 'dueDate', action: 'Đề xuất hạn chót', type: 'date' }]) } },
    { id: 'task_approve_proposal', type: 'user_task', position: { x: 550, y: 250 }, data: { label: 'Phê duyệt đề xuất (Lãnh đạo)', targetStatus: 'PENDING_ACCEPTANCE', assignments: [{ unitScope: 'SAME_UNIT', rankOperator: 'exact', rankValue: 'minRank' }], formSchema: JSON.stringify([{ id: 'f1', name: 'isApproved', action: 'Đồng ý', type: 'text' }, { id: 'f2', name: 'reason', action: 'Lý do', type: 'textarea' }]) } },
    { id: 'gateway_proposal', type: 'exclusive_gateway', position: { x: 850, y: 250 }, data: { label: 'Quyết định' } },
    { id: 'end_rejected', type: 'end', position: { x: 850, y: 450 }, data: { label: 'Bị từ chối', targetStatus: 'REJECTED' } },
    { id: 'task_process', type: 'user_task', position: { x: 1150, y: 250 }, data: { label: 'Xử lý & Báo cáo (Nhân viên)', targetStatus: 'IN_PROGRESS', assignments: [{ unitScope: 'SELF' }] } },
    { id: 'task_evaluate', type: 'user_task', position: { x: 1450, y: 250 }, data: { label: 'Nghiệm thu (Lãnh đạo)', targetStatus: 'WAITING_FOR_APPROVAL', assignments: [{ unitScope: 'SAME_UNIT', rankOperator: 'exact', rankValue: 'minRank' }], formSchema: JSON.stringify([{ id: 'f1', name: 'isApproved', action: 'Đồng ý duyệt', type: 'text' }, { id: 'f2', name: 'kpiScore', action: 'Điểm KPI', type: 'number' }, { id: 'f3', name: 'managerFeedback', action: 'Phản hồi', type: "textarea" }]) } },
    { id: 'gateway_evaluate', type: 'exclusive_gateway', position: { x: 1750, y: 250 }, data: { label: 'Kết quả Nghiệm thu' } },
    { id: 'end_done', type: 'end', position: { x: 2050, y: 250 }, data: { label: 'Hoàn thành', targetStatus: 'COMPLETED' } },
  ],
  edges: [
    { id: 'e_start_propose', source: 'start_1', target: 'task_propose', type: 'custom' },
    { id: 'e_propose_approve', source: 'task_propose', target: 'task_approve_proposal', type: 'custom', action: 'SUBMIT' },
    { id: 'e_approve_gw', source: 'task_approve_proposal', target: 'gateway_proposal', type: 'custom', action: 'REVIEW' },
    { id: 'e_gw_reject', source: 'gateway_proposal', target: 'end_rejected', type: 'custom', sourceHandle: 'false', action: 'REJECT', data: { conditions: [{ field: 'variables.isApproved', operator: '===', value: 'false', logicalOp: '&&' }], condition: 'variables.isApproved === false' } },
    { id: 'e_gw_process', source: 'gateway_proposal', target: 'task_process', type: 'custom', sourceHandle: 'true', action: 'APPROVE', data: { conditions: [{ field: 'variables.isApproved', operator: '===', value: 'true', logicalOp: '&&' }], condition: 'variables.isApproved === true' } },
    { id: 'e_process_eval', source: 'task_process', target: 'task_evaluate', type: 'custom', action: 'SUBMIT_REPORT' },
    { id: 'e_eval_gweval', source: 'task_evaluate', target: 'gateway_evaluate', type: 'custom', action: 'EVALUATE' },
    { id: 'e_gweval_rework', source: 'gateway_evaluate', target: 'task_process', type: 'custom', sourceHandle: 'false', action: 'REWORK', data: { conditions: [{ field: 'variables.isApproved', operator: '===', value: 'false', logicalOp: '&&' }], condition: 'variables.isApproved === false' } },
    { id: 'e_gweval_done', source: 'gateway_evaluate', target: 'end_done', type: 'custom', sourceHandle: 'true', action: 'APPROVE', data: { conditions: [{ field: 'variables.isApproved', operator: '===', value: 'true', logicalOp: '&&' }], condition: 'variables.isApproved === true' } },
  ]
};

const processDefinitions = [
  {
    code: 'UNEXPECTED_TASK_PROCESSING',
    name: 'Quy trình Duyệt việc Phát sinh (Nhân viên tự tạo)',
    description: 'Quy trình để nhân viên tự đề xuất công việc, lãnh đạo duyệt để đưa vào kế hoạch, sau đó nhân viên thực hiện và lãnh đạo nghiệm thu cuối cùng.',
    isActive: true,
    version: {
      version: 1,
      status: 'PUBLISHED',
      graph: unexpectedTaskGraph,
    },
  },

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
        viewport: { x: 0, y: 0, zoom: 1 },
        nodes: [
          { id: 'start_1', type: 'start', position: { x: 50, y: 250 }, data: { label: 'Bắt đầu' } },
          { id: 'task_1', type: 'user_task', position: { x: 250, y: 250 }, data: { label: 'Soạn thảo văn bản', assignments: [{ unitScope: 'SELF' }] } },
          { id: 'task_2', type: 'user_task', position: { x: 550, y: 250 }, data: { label: 'Trưởng phòng ký duyệt', assignments: [{ unitScope: 'SAME_UNIT', rankOperator: 'exact', rankValue: 'minRank' }] } },
          { id: 'task_3', type: 'user_task', position: { x: 850, y: 250 }, data: { label: 'Ban Giám đốc ký ban hành', assignments: [{ unitScope: 'PARENT_UNIT', rankOperator: 'exact', rankValue: 'minRank' }] } },
          { id: 'end_1', type: 'end', position: { x: 1150, y: 250 }, data: { label: 'Văn bản đã ban hành' } },
        ],
        edges: [
          { id: 'e_start1_task1', source: 'start_1', target: 'task_1', type: 'custom' },
          { id: 'e_task1_task2', source: 'task_1', target: 'task_2', type: 'custom', action: 'SUBMIT' },
          { id: 'e_task2_task3', source: 'task_2', target: 'task_3', type: 'custom', action: 'APPROVE' },
          { id: 'e_task3_end1', source: 'task_3', target: 'end_1', type: 'custom', action: 'PUBLISH' },
        ],
      },
    },
  },
  {
    code: 'TASK_PROCESSING_ID',
    name: 'Quy trình Quản lý Công việc & KPI (CQNN)',
    description: 'Quy trình giao việc, tiếp nhận/từ chối, phối hợp xử lý và đánh giá chấm KPI chuẩn cơ quan nhà nước',
    isActive: true,
    version: {
      version: 1,
      status: 'PUBLISHED',
      graph: govComplexTaskGraph,
    },
  },
  {
    code: 'BUSINESS_LICENSE',
    name: 'Quy trình Cấp phép Kinh doanh',
    description: 'Quy trình chuẩn cấp giấy phép kinh doanh cho tổ chức/cá nhân.',
    isActive: true,
    version: {
      version: 1,
      status: 'PUBLISHED',
      graph: {
        viewport: { x: 0, y: 0, zoom: 1 },
        nodes: [
          { id: 'start_1', type: 'start', position: { x: 50, y: 250 }, data: { label: 'Công dân nộp hồ sơ' } },
          { id: 'task_receive', type: 'user_task', position: { x: 250, y: 250 }, data: { label: 'Tiếp nhận & Kiểm tra', assignments: [{ unitScope: 'BY_GEO_AREA', rankOperator: 'any' }] } },
          { id: 'gw_valid', type: 'exclusive_gateway', position: { x: 450, y: 250 }, data: { label: 'Hồ sơ hợp lệ?' } },
          { id: 'end_rejected', type: 'end', position: { x: 450, y: 400 }, data: { label: 'Trả hồ sơ / Từ chối' } },
          { id: 'task_verify', type: 'user_task', position: { x: 650, y: 250 }, data: { label: 'Thẩm định hồ sơ', assignments: [{ unitScope: 'BY_DOMAIN', rankOperator: 'any' }] } },
          { id: 'task_approve', type: 'user_task', position: { x: 850, y: 250 }, data: { label: 'Lãnh đạo phê duyệt', assignments: [{ unitScope: 'PARENT_UNIT', rankOperator: 'exact', rankValue: 'minRank' }] } },
          { id: 'end_approved', type: 'end', position: { x: 1050, y: 250 }, data: { label: 'Cấp phép thành công' } }
        ],
        edges: [
          { id: 'e_start_recv', source: 'start_1', target: 'task_receive', type: 'custom' },
          { id: 'e_recv_gw', source: 'task_receive', target: 'gw_valid', type: 'custom', action: 'CHECK' },
          { id: 'e_gw_rej', source: 'gw_valid', target: 'end_rejected', type: 'custom', sourceHandle: 'false', action: 'INVALID', condition: 'variables.isValid === false' },
          { id: 'e_gw_ok', source: 'gw_valid', target: 'task_verify', type: 'custom', sourceHandle: 'true', action: 'VALID', condition: 'variables.isValid === true' },
          { id: 'e_ver_appr', source: 'task_verify', target: 'task_approve', type: 'custom', action: 'VERIFIED' },
          { id: 'e_appr_end', source: 'task_approve', target: 'end_approved', type: 'custom', action: 'APPROVE' }
        ]
      }
    }
  }
];

const processTypes = [
  {
    code: 'LEAVE_REQUEST',
    name: 'Xin nghỉ phép',
    description: 'Nghiệp vụ xin nghỉ phép cá nhân',
    ownerService: 'hrm-service',
    validTriggers: ['ON_CREATE', 'ON_SUBMIT'],
    validActions: ['APPROVE', 'REJECT', 'CANCEL'],
    isActive: true,
  },
  {
    code: 'DOCUMENT_APPROVAL',
    name: 'Phê duyệt văn bản',
    description: 'Nghiệp vụ phê duyệt văn bản đi',
    ownerService: 'doc-service',
    validTriggers: ['ON_DRAFT', 'ON_SUBMIT_REVIEW'],
    validActions: ['SIGN', 'REJECT', 'RETURN'],
    isActive: true,
  },
  {
    code: 'BUSINESS_LICENSE',
    name: 'Cấp phép kinh doanh',
    description: 'Cấp giấy phép kinh doanh cho hộ cá thể',
    ownerService: 'license-service',
    validTriggers: ['ON_RECEIVE_APPLICATION', 'ON_PAYMENT_COMPLETED'],
    validActions: ['VERIFY', 'APPROVE', 'REJECT'],
    isActive: true,
  },
  {
    code: 'TASK_PROCESSING_ID',
    name: 'Quản lý công việc',
    description: 'Giao và xử lý công việc nội bộ',
    ownerService: 'task-service',
    validTriggers: ['ON_ASSIGN', 'ON_UPDATE'],
    validActions: ['ACCEPT', 'COMPLETE', 'REWORK'],
    isActive: true,
  },
  {
    code: 'UNEXPECTED_TASK_PROCESSING',
    name: 'Xử lý việc phát sinh',
    description: 'Nhân viên tự tạo và đề xuất công việc',
    ownerService: 'task-service',
    validTriggers: ['ON_PROPOSE'],
    validActions: ['APPROVE_PROPOSAL', 'REJECT_PROPOSAL'],
    isActive: true,
  }
];

// ============================================================================
// MAIN SEED FUNCTION
// ============================================================================

async function main() {
  console.log('🌱 Bắt đầu chạy seed database cho Workflow Service (Prisma 7.x)...\n');

  const prisma = createPrismaClient();

  try {
    // 0. Xóa dữ liệu cũ
    console.log('🧹 Xóa toàn bộ dữ liệu workflow cũ...');
    await (prisma as any).processInstance.deleteMany({});
    await (prisma as any).processBinding.deleteMany({});
    await (prisma as any).processVersion.deleteMany({});
    await (prisma as any).processDefinition.deleteMany({});
    await (prisma as any).processType.deleteMany({});
    console.log('  ✅ Đã xóa xong.');

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

    // 1.5. Seed ProcessTypes
    console.log('\n📋 Seeding ProcessTypes...');
    for (const type of processTypes) {
      await (prisma as any).processType.upsert({
        where: { code: type.code },
        update: {
          name: type.name,
          description: type.description,
          ownerService: type.ownerService,
          validTriggers: type.validTriggers,
          validActions: type.validActions,
          isActive: type.isActive,
        },
        create: type,
      });
      console.log(`  ✅ Upserted ProcessType: ${type.code}`);
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
    await seedCustomInstance(prisma);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('❌ Seed thất bại:', err);
  process.exit(1);
});


async function seedCustomInstance(prisma) {
  console.log('  -> Đang tạo phiên chạy (ProcessInstance) gán cho người dùng...');
  const defData = await prisma.processDefinition.findUnique({ where: { code: 'TASK_PROCESSING_ID' } });
  if (defData) {
     const versionDataDB = await prisma.processVersion.findFirst({ where: { definitionId: defData.id }, orderBy: { version: 'desc' } });
     if (versionDataDB) {
        
        // Cập nhật graph thêm serviceTask (Rule Engine Script)
        const graph = versionDataDB.graph;
        
        // Xóa end node cũ nếu có
        const oldEndIndex = graph.nodes.findIndex(n => n.id === 'end_done');
        const endNode = oldEndIndex > -1 ? graph.nodes.splice(oldEndIndex, 1)[0] : { id: 'end_done', type: 'end', position: { x: 1850, y: 250 }, data: { label: 'Hoàn thành', targetStatus: 'COMPLETED' } };
        
        // Sửa X của end node
        endNode.position.x = 2050;
        
        // Thêm serviceTask
        graph.nodes.push({ id: 'task_auto_kpi', type: 'serviceTask', position: { x: 1750, y: 250 }, data: { label: 'Tự động tính KPI', script: 'variables.kpiScore = (variables.isApproved === "true" || variables.isApproved === true) ? Math.floor(Math.random() * 20 + 80) : 0;', targetStatus: 'WAITING_FOR_APPROVAL' } });
        graph.nodes.push(endNode);

        // Cập nhật edges
        const oldEdgeIndex = graph.edges.findIndex(e => e.id === 'e_gweval_done');
        if (oldEdgeIndex > -1) {
           graph.edges[oldEdgeIndex].target = 'task_auto_kpi';
        }
        graph.edges.push({ id: 'e_auto_done', source: 'task_auto_kpi', target: 'end_done', type: 'custom' });
        
        await prisma.processVersion.update({
           where: { id: versionDataDB.id },
           data: { graph }
        });

        // Xóa instance cũ để seed lại
        await prisma.processInstance.deleteMany({ where: { startedBy: 'admin' } });

        // Tạo process instance mới
        const instance = await prisma.processInstance.create({
           data: {
              definitionId: defData.id,
              versionId: versionDataDB.id,
              organizationId: 'DEFAULT_ORG',
              status: 'IN_PROGRESS',
              currentNodeCode: 'task_evaluate',
              variables: { taskName: 'Công việc chạy thử nghiệm KPI Tự động', isAccepted: true },
              startedBy: 'admin',
              stateVersion: 1
           }
        });
        
        await prisma.workflowTask.create({
           data: {
              instanceId: instance.id,
              nodeCode: 'task_evaluate',
              title: 'Nghiệm thu & Chấm KPI',
              status: 'PENDING',
              assigneeId: 'admin'
           }
        });
        console.log('  -> Hoàn thành gán phiên chạy cho user [admin].');
     }
  }
}
