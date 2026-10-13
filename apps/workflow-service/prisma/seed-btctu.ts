import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';

/**
 * Script Seed Quy Trình Nghiệp Vụ Ban Tổ Chức Tỉnh Ủy Đắk Lắk (BTCTU)
 * 
 * Nạp dữ liệu các quy trình chuẩn hóa theo:
 * - Quy định số 01-QĐ/BTCTU (Chức năng, nhiệm vụ 05 tập thể phòng, 22 VTVL)
 * - Hướng dẫn 05-HD/TU & Quy định 39-QĐ/TU (Đánh giá, xếp loại CBCC)
 * - Quy định 348-QĐ/BTCTW (Bảo vệ chính trị nội bộ & Áp trần 20% Xuất sắc)
 * - Nghị định 85/2016/NĐ-CP (An toàn thông tin Cấp độ 3)
 * - docs/diagrams/quan-ly-cong-viec-ban-to-chuc.md
 * 
 * Đơn vị: BTCTU_DAKLAK (Ban Tổ chức Tỉnh ủy Đắk Lắk)
 */

const BTCTU_ORG_ID = 'BTCTU_DAKLAK';

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
// 1. SƠ ĐỒ 1 & 3: QUY TRÌNH QUẢN LÝ & PHÊ DUYỆT CÔNG VIỆC BTCTU
// ============================================================================

export const btctuTaskManagementGraph = {
  viewport: { x: 0, y: 0, zoom: 0.85 },
  nodes: [
    {
      id: 'start_btctu',
      type: 'start',
      position: { x: 60, y: 70 },
      data: {
        label: 'Khởi tạo nhiệm vụ / Chỉ đạo BTV Tỉnh ủy',
        description: 'Tiếp nhận chỉ đạo của Ban Thường vụ Tỉnh ủy hoặc Lãnh đạo Ban giao việc đột xuất / định kỳ',
      },
    },
    {
      id: 'task_ldb_assign',
      type: 'userTask',
      position: { x: 340, y: 270 },
      data: {
        label: 'Lãnh đạo Ban tiếp nhận & Giao việc cấp Phòng',
        description: 'Phân loại mảng công tác và giao Trưởng phòng chuyên môn chủ trì (TCCB, TCĐ-ĐV, BVCTNB, Văn phòng)',
        targetStatus: 'PENDING_ACCEPTANCE',
        assignments: [
          {
            unitScope: 'PARENT_UNIT',
            roleCode: 'LANH_DAO_BAN',
            description: 'Trưởng ban & 4 Phó ban Tổ chức Tỉnh ủy',
          },
        ],
        formSchema: JSON.stringify([
          { id: 'f1', name: 'taskTitle', label: 'Tên nhiệm vụ / Đề án', type: 'text', required: true },
          { id: 'f2', name: 'assignedDept', label: 'Phòng chuyên môn chủ trì', type: 'select', options: ['P_TCCB', 'P_TCD_DV', 'P_BVCTNB', 'VAN_PHONG'], required: true },
          { id: 'f3', name: 'coordinatingDepts', label: 'Phòng phối hợp', type: 'multiselect', options: ['P_TCCB', 'P_TCD_DV', 'P_BVCTNB', 'VAN_PHONG'] },
          { id: 'f4', name: 'priorityLevel', label: 'Độ khẩn', type: 'select', options: ['HOA_TOC', 'THUONG_KHAN', 'KHAN', 'THUONG'], required: true },
          { id: 'f5', name: 'dueDate', label: 'Thời hạn hoàn thành', type: 'date', required: true },
          { id: 'f6', name: 'securityLevel', label: 'Mức độ mật', type: 'select', options: ['TUYET_MAT', 'TOI_MAT', 'MAT', 'THUONG'], required: true }
        ]),
      },
    },
    {
      id: 'gateway_dept_router',
      type: 'exclusiveGateway',
      position: { x: 650, y: 270 },
      data: {
        label: 'Phân luồng 04 Phòng chuyên môn',
        description: 'Định tuyến hồ sơ về Phòng TCCB, TCĐ-ĐV, BVCTNB hoặc Văn phòng Ban',
      },
    },
    {
      id: 'task_ldp_dispatch',
      type: 'userTask',
      position: { x: 650, y: 510 },
      data: {
        label: 'Lãnh đạo Phòng phân rã việc & Giao Chuyên viên',
        description: 'Xác định hệ số độ khó K, thời hạn, trọng số thành tố A/B/C/D, checklist nghiệp vụ và chọn Chuyên viên chủ trì (22 VTVL)',
        targetStatus: 'ASSIGNED',
        assignments: [
          {
            unitScope: 'SAME_UNIT',
            roleCode: 'LANH_DAO_PHONG',
            description: 'Trưởng/Phó phòng chuyên môn',
          },
        ],
        formSchema: JSON.stringify([
          { id: 'f1', name: 'kFactor', label: 'Hệ số độ khó K (1.0 - 2.5)', type: 'number', required: true, default: 1.0 },
          { id: 'f2', name: 'weightA', label: 'Trọng số Tiến độ A% (25-30%)', type: 'number', required: true, default: 30 },
          { id: 'f3', name: 'weightB', label: 'Trọng số Chất lượng B% (35-40%)', type: 'number', required: true, default: 40 },
          { id: 'f4', name: 'weightC', label: 'Trọng số Khối lượng C% (20-25%)', type: 'number', required: true, default: 20 },
          { id: 'f5', name: 'weightD', label: 'Trọng số Kỷ luật D% (10-15%)', type: 'number', required: true, default: 10 },
          { id: 'f6', name: 'assigneeOfficerId', label: 'Chuyên viên chủ trì (22 VTVL)', type: 'user', required: true },
          { id: 'f7', name: 'cooperatingOfficers', label: 'Cán bộ phối hợp', type: 'users' },
          { id: 'f8', name: 'stepsChecklist', label: 'Checklist các bước nghiệp vụ', type: 'textarea' }
        ]),
      },
    },
    {
      id: 'task_officer_execute',
      type: 'userTask',
      position: { x: 960, y: 730 },
      data: {
        label: 'Chuyên viên thụ lý & Phối hợp thực thi',
        description: 'Thực thi nghiệp vụ đặc thù theo mảng (TCCB: Mẫu 2C; TCĐ-ĐV: LGSP; BVCTNB: CSDL Mức 3; Văn phòng: Văn bản Mật & ATTT Cấp 3). Nộp sản phẩm kèm minh chứng.',
        targetStatus: 'IN_PROGRESS',
        assignments: [
          {
            unitScope: 'SAME_UNIT',
            roleCode: 'CHUYEN_VIEN',
            description: 'Chuyên viên 22 VTVL và người phối hợp',
          },
        ],
        formSchema: JSON.stringify([
          { id: 'f1', name: 'domainWorkType', label: 'Mảng nghiệp vụ thực hiện', type: 'select', options: ['THAM_DINH_CAN_BO_2C', 'DANG_VIEN_LGSP', 'BVCTNB_MUC_3', 'VAN_THU_MAT_ATTT3'], required: true },
          { id: 'f2', name: 'executionResult', label: 'Nội dung báo cáo kết quả / Dự thảo Tờ trình', type: 'textarea', required: true },
          { id: 'f3', name: 'attachmentFileId', label: 'Minh chứng đầu ra / Hồ sơ thẩm tra (MinIO Encrypted)', type: 'file', required: true },
          { id: 'f4', name: 'extensionRequested', label: 'Đề xuất gia hạn (phải gửi trước 24h)', type: 'boolean', default: false }
        ]),
      },
    },
    {
      id: 'task_officer_extension',
      type: 'userTask',
      position: { x: 960, y: 980 },
      data: {
        label: 'Chuyên viên lập Phiếu đề xuất xin gia hạn',
        description: 'Đề xuất gia hạn trước 24h, giải trình lý do khách quan (liên thông quy trình WF_BTCTU_XIN_GIA_HAN_VIEC)',
        targetStatus: 'PENDING_EXTENSION',
        assignments: [
          {
            unitScope: 'SAME_UNIT',
            roleCode: 'CHUYEN_VIEN',
            description: 'Chuyên viên 22 VTVL đang thụ lý',
          },
        ],
        formSchema: JSON.stringify([
          { id: 'f1', name: 'reasonCategory', label: 'Lý do xin gia hạn', type: 'select', options: ['CHO_VAN_BAN_CO_QUAN_NGOAI', 'BO_SUNG_MINH_CHUNG_XAC_MINH', 'NHIEM_VU_DOT_XUAT_CHEN_NGANG', 'LY_DO_KHACH_QUAN_KHAC'], required: true },
          { id: 'f2', name: 'proposedDueDate', label: 'Thời hạn đề xuất mới', type: 'date', required: true },
          { id: 'f3', name: 'detailedReason', label: 'Giải trình chi tiết lý do khách quan', type: 'textarea', required: true }
        ]),
      },
    },
    {
      id: 'task_auto_link_extension',
      type: 'serviceTask',
      position: { x: 1280, y: 980 },
      data: {
        label: 'Tự động liên thông quy trình WF_BTCTU_XIN_GIA_HAN_VIEC',
        description: 'Khởi tạo tiến trình WF_BTCTU_XIN_GIA_HAN_VIEC, cập nhật hạn mới vào Task sau khi Lãnh đạo Ban phê duyệt',
        integrationCode: 'WF_BTCTU_XIN_GIA_HAN_VIEC',
        endpoint: '/api/v1/workflow/trigger-subflow',
        method: 'POST',
      },
    },
    {
      id: 'task_ldp_review',
      type: 'userTask',
      position: { x: 1280, y: 510 },
      data: {
        label: 'Lãnh đạo Phòng thẩm định & Kiểm soát 3 mức lỗi',
        description: 'Kiểm soát chất lượng sản phẩm theo 3 mức lỗi (-5% thể thức, -15% số liệu, -35% pháp lý/chính trị). Đạt chuẩn: ký nháy Tờ trình trình Lãnh đạo Ban; Có lỗi: trả lại sửa.',
        targetStatus: 'REVIEWING',
        assignments: [
          {
            unitScope: 'SAME_UNIT',
            roleCode: 'LANH_DAO_PHONG',
            description: 'Trưởng phòng / Phó trưởng phòng',
          },
        ],
        formSchema: JSON.stringify([
          { id: 'f1', name: 'reviewDecision', label: 'Kết luận thẩm định', type: 'select', options: ['DAT_YEU_CAU', 'TRA_LAI_CHINH_SUA'], required: true },
          { id: 'f2', name: 'errorLevel', label: 'Phân loại mức lỗi (nếu trả lại)', type: 'select', options: ['KHONG_LOI', 'LOI_NHE_5_PERCENT', 'LOI_TRUNG_BINH_15_PERCENT', 'LOI_NGHIEM_TRONG_35_PERCENT'] },
          { id: 'f3', name: 'reviewComment', label: 'Ý kiến thẩm định chi tiết', type: 'textarea' },
          { id: 'f4', name: 'initialSignTimestamp', label: 'Thời điểm ký nháy Tờ trình', type: 'text' }
        ]),
      },
    },
    {
      id: 'gateway_ldp_check',
      type: 'exclusiveGateway',
      position: { x: 1600, y: 510 },
      data: {
        label: 'Kiểm tra Đạt chuẩn Phòng?',
        description: 'Đạt yêu cầu -> Trình Lãnh đạo Ban; Có lỗi -> Trả lại Chuyên viên',
      },
    },
    {
      id: 'task_ldb_approve',
      type: 'userTask',
      position: { x: 1900, y: 270 },
      data: {
        label: 'Lãnh đạo Ban thẩm định & Ký duyệt (Ký số)',
        description: 'Lãnh đạo Ban xem xét, phê duyệt kết quả, thực hiện ký số chứng thư CA Chuyên dùng phát hành hoặc trình Ban Thường vụ Tỉnh ủy',
        targetStatus: 'PENDING_APPROVAL',
        assignments: [
          {
            unitScope: 'PARENT_UNIT',
            roleCode: 'LANH_DAO_BAN',
            description: 'Trưởng ban & các Phó trưởng ban Tổ chức Tỉnh ủy',
          },
        ],
        formSchema: JSON.stringify([
          { id: 'f1', name: 'banDecision', label: 'Quyết định phê duyệt', type: 'select', options: ['PHE_DUYET_BAN_HANH', 'TRINH_BTV_TINH_UY', 'YEU_CAU_RA_SOAT_LAI', 'DINH_CHI'], required: true },
          { id: 'f2', name: 'digitalSignature', label: 'Ký số CA Chuyên dùng Chính phủ', type: 'text' },
          { id: 'f3', name: 'directiveNotes', label: 'Ý kiến chỉ đạo kết luận', type: 'textarea' }
        ]),
      },
    },
    {
      id: 'gateway_ldb_check',
      type: 'exclusiveGateway',
      position: { x: 2220, y: 270 },
      data: {
        label: 'Kết luận Phê duyệt Ban?',
        description: 'Phê duyệt / Trình BTVTU -> Tự động tính KPI; Yêu cầu rà soát -> Trả về phòng; Đình chỉ -> Hủy',
      },
    },
    {
      id: 'task_auto_kpi',
      type: 'serviceTask',
      position: { x: 2520, y: 270 },
      data: {
        label: 'Hệ thống tự động tính điểm KPI 4 thành tố',
        description: 'Rule Engine tính điểm KPI_i = K * [A%*ScoreA + B%*ScoreB + C%*ScoreC + D%*ScoreD], tự động trừ điểm lỗi B% (5%/15%/35%) và đồng bộ dữ liệu sang HRM Service',
        integrationCode: 'HRM_SERVICE',
        endpoint: '/api/v1/hrm/kpi/calculate-task-score',
        method: 'POST',
      },
    },
    {
      id: 'end_completed',
      type: 'end',
      position: { x: 2820, y: 270 },
      data: {
        label: 'Hoàn thành nhiệm vụ & Lưu trữ ATTT Cấp độ 3',
        description: 'Nhiệm vụ hoàn tất, chuyển trạng thái DONE, lưu vết hồ sơ điện tử an toàn',
        targetStatus: 'DONE',
      },
    },
    {
      id: 'end_rejected',
      type: 'end',
      position: { x: 2220, y: 70 },
      data: {
        label: 'Đình chỉ / Hủy nhiệm vụ theo chỉ đạo BTVTU',
        description: 'Nhiệm vụ dừng thực hiện, chuyển trạng thái CANCELLED',
        targetStatus: 'CANCELLED',
      },
    },
  ],
  edges: [
    {
      id: 'e_start_ldb',
      source: 'start_btctu',
      target: 'task_ldb_assign',
      type: 'custom',
      label: 'Khởi tạo & Giao việc',
      action: 'ASSIGN_START',
    },
    {
      id: 'e_ldb_gw',
      source: 'task_ldb_assign',
      target: 'gateway_dept_router',
      type: 'custom',
      label: 'Phân luồng về phòng chuyên môn',
      action: 'DISPATCH_TO_DEPT',
    },
    {
      id: 'e_gw_p_tccb',
      source: 'gateway_dept_router',
      target: 'task_ldp_dispatch',
      type: 'custom',
      label: 'Phòng TCCB · Bổ nhiệm cán bộ 5 bước',
      action: 'ROUTE_P_TCCB',
    },
    {
      id: 'e_gw_p_tcd_dv',
      source: 'gateway_dept_router',
      target: 'task_ldp_dispatch',
      type: 'custom',
      label: 'Phòng TCĐ-ĐV · Đảng viên & Huy hiệu Đảng LGSP',
      action: 'ROUTE_P_TCD_DV',
    },
    {
      id: 'e_gw_p_bvctnb',
      source: 'gateway_dept_router',
      target: 'task_ldp_dispatch',
      type: 'custom',
      label: 'Phòng BVCTNB · Thẩm tra chính trị CSDL Mức 3',
      action: 'ROUTE_P_BVCTNB',
    },
    {
      id: 'e_gw_van_phong',
      source: 'gateway_dept_router',
      target: 'task_ldp_dispatch',
      type: 'custom',
      label: 'Văn phòng · Văn thư Mật & ATTT Cấp 3',
      action: 'ROUTE_VAN_PHONG',
    },
    {
      id: 'e_ldp_officer',
      source: 'task_ldp_dispatch',
      target: 'task_officer_execute',
      type: 'custom',
      label: 'Giao Chuyên viên 22 VTVL chủ trì',
      action: 'ASSIGN_OFFICER',
    },
    {
      id: 'e_officer_review',
      source: 'task_officer_execute',
      target: 'task_ldp_review',
      type: 'custom',
      label: 'Nộp sản phẩm kèm minh chứng',
      action: 'SUBMIT_FOR_REVIEW',
    },
    {
      id: 'e_officer_to_ext',
      source: 'task_officer_execute',
      target: 'task_officer_extension',
      type: 'custom',
      label: 'Đề xuất xin gia hạn (trước 24h)',
      action: 'REQUEST_EXTENSION',
    },
    {
      id: 'e_ext_to_autolink',
      source: 'task_officer_extension',
      target: 'task_auto_link_extension',
      type: 'custom',
      label: 'Chuyển thẩm định gia hạn (WF_BTCTU_XIN_GIA_HAN_VIEC)',
      action: 'TRIGGER_EXTENSION_SUBFLOW',
    },
    {
      id: 'e_autolink_to_officer',
      source: 'task_auto_link_extension',
      target: 'task_officer_execute',
      type: 'custom',
      label: 'Cập nhật hạn mới · Tiếp tục thực thi',
      action: 'RESUME_AFTER_EXTENSION',
    },
    {
      id: 'e_review_gw',
      source: 'task_ldp_review',
      target: 'gateway_ldp_check',
      type: 'custom',
      label: 'Thẩm định chất lượng (3 mức lỗi)',
      action: 'CHECK_QUALITY',
    },
    {
      id: 'e_gwldp_return',
      source: 'gateway_ldp_check',
      target: 'task_officer_execute',
      type: 'custom',
      sourceHandle: 'false',
      label: 'Có lỗi · Trả lại sửa (-5% / -15% / -35%)',
      action: 'RETURN',
      condition: 'variables.reviewDecision === "TRA_LAI_CHINH_SUA"',
    },
    {
      id: 'e_gwldp_pass',
      source: 'gateway_ldp_check',
      target: 'task_ldb_approve',
      type: 'custom',
      sourceHandle: 'true',
      targetHandle: 'target-left',
      label: 'Đạt chuẩn · Ký nháy trình Lãnh đạo Ban',
      action: 'SUBMIT_TO_BAN',
      condition: 'variables.reviewDecision === "DAT_YEU_CAU"',
    },
    {
      id: 'e_ldb_gw_eval',
      source: 'task_ldb_approve',
      target: 'gateway_ldb_check',
      type: 'custom',
      sourceHandle: 'source-right',
      targetHandle: 'target-left',
      label: 'Xem xét & Phê duyệt Tờ trình',
      action: 'EVALUATE_DECISION',
    },
    {
      id: 'e_gwldb_rework',
      source: 'gateway_ldb_check',
      target: 'task_ldp_review',
      type: 'custom',
      sourceHandle: 'source-bottom',
      targetHandle: 'target-top',
      label: 'Chỉ đạo rà soát lại',
      action: 'BAN_REQUEST_REVIEW',
      condition: 'variables.banDecision === "YEU_CAU_RA_SOAT_LAI"',
    },
    {
      id: 'e_gwldb_approve',
      source: 'gateway_ldb_check',
      target: 'task_auto_kpi',
      type: 'custom',
      sourceHandle: 'approve',
      targetHandle: 'target-left',
      label: 'Phê duyệt (Ký số CA) / Trình BTVTU',
      action: 'BAN_APPROVE',
      condition: 'variables.banDecision === "PHE_DUYET_BAN_HANH" || variables.banDecision === "TRINH_BTV_TINH_UY"',
    },
    {
      id: 'e_gwldb_reject',
      source: 'gateway_ldb_check',
      target: 'end_rejected',
      type: 'custom',
      sourceHandle: 'source-top',
      targetHandle: 'target-bottom',
      label: 'Đình chỉ / Hủy nhiệm vụ',
      action: 'BAN_CANCEL',
      condition: 'variables.banDecision === "DINH_CHI"',
    },
    {
      id: 'e_auto_end',
      source: 'task_auto_kpi',
      target: 'end_completed',
      type: 'custom',
      label: 'Tính điểm KPI 4 thành tố & Lưu trữ ATTT Cấp 3',
      action: 'KPI_COMPLETED',
    },
  ],
};

// ============================================================================
// 2. SƠ ĐỒ 4: QUY TRÌNH ĐÁNH GIÁ KPI & KHỐNG CHẾ TRẦN CHẤT LƯỢNG BTCTU
// ============================================================================

export const btctuKpiEvaluationGraph = {
  // Default workflow configuration. The editor reads these values and lets
  // administrators add, rename, remove, and assign phases without code changes.
  phases: [
    { id: 'evaluation-self', name: 'Tự đánh giá cá nhân', description: 'Đăng ký đầu kỳ, tự chấm điểm và kê khai nhiệm vụ nổi trội', order: 1 },
    { id: 'evaluation-unit', name: 'Nhận xét tập thể phòng', description: 'Họp phòng, nhận xét và tổng hợp kết quả theo đơn vị', order: 2 },
    { id: 'evaluation-council', name: 'Thẩm định và xếp loại', description: 'Đối soát, kiểm tra điều kiện, áp trần và hội đồng xét duyệt', order: 3 },
    { id: 'evaluation-publish', name: 'Ban hành kết quả', description: 'Ký quyết định, công khai và lưu trữ hồ sơ', order: 4 },
  ],
  viewport: { x: 0, y: 0, zoom: 0.8 },
  nodes: [
    {
      id: 'start_kpi_period',
      type: 'start',
      position: { x: 60, y: 150 },
      data: {
        label: 'Mở kỳ đánh giá KPI quý',
        description: 'Kích hoạt kỳ đánh giá định kỳ hằng quý tại Ban Tổ chức Tỉnh ủy',
        phaseId: 'evaluation-self',
      },
    },
    {
      id: 'task_mau01_dangky',
      type: 'userTask',
      position: { x: 60, y: 350 },
      data: {
        label: 'Đăng ký danh mục đầu kỳ (MẪU 01)',
        description: 'Công chức đăng ký khung danh mục sản phẩm, nhiệm vụ trọng tâm đầu kỳ theo Mẫu 01',
        phaseId: 'evaluation-self',
        assignments: [
          {
            unitScope: 'SELF',
            roleCode: 'CAN_BO_CONG_CHUC',
            description: 'Toàn bộ 22 CBCC thuộc BTCTU',
          },
        ],
        formSchema: JSON.stringify([
          { id: 'f1', name: 'targetQuarter', label: 'Quý / Năm đánh giá', type: 'text', required: true },
          { id: 'f2', name: 'workList', label: 'Danh mục công việc / sản phẩm dự kiến', type: 'textarea', required: true },
          { id: 'f3', name: 'expectedOutput', label: 'Sản phẩm đầu ra dự kiến', type: 'textarea', required: true }
        ]),
      },
    },
    {
      id: 'task_mau02_tucham',
      type: 'userTask',
      position: { x: 340, y: 350 },
      data: {
        label: 'Cá nhân tự chấm điểm KPI (MẪU 02)',
        description: 'Tự chấm điểm tiêu chí chung S_chung (tối đa 30đ) + Điểm nhiệm vụ S_nhiemvu (quy đổi từ KPI_i sang thang 70đ) theo Mẫu 02',
        phaseId: 'evaluation-self',
        assignments: [
          {
            unitScope: 'SELF',
            roleCode: 'CAN_BO_CONG_CHUC',
            description: 'Toàn bộ CBCC tự đánh giá trước ngày 15 tháng cuối quý',
          },
        ],
        formSchema: JSON.stringify([
          { id: 'f1', name: 'scoreGeneral', label: 'Điểm tiêu chí chung S_chung (tối đa 30đ)', type: 'number', required: true },
          { id: 'f2', name: 'scoreTasks', label: 'Điểm nhiệm vụ S_nhiemvu (thang 70đ)', type: 'number', required: true },
          { id: 'f3', name: 'totalSelfScore', label: 'Tổng điểm tự chấm (thang 100đ)', type: 'number', required: true },
          { id: 'f4', name: 'selfRanking', label: 'Tự đề xuất mức xếp loại', type: 'select', options: ['HOAN_THANH_XUAT_SAC', 'HOAN_THANH_TOT', 'HOAN_THANH', 'KHONG_HOAN_THANH'], required: true }
        ]),
      },
    },
    {
      id: 'task_mau04_noitroi',
      type: 'userTask',
      position: { x: 620, y: 350 },
      data: {
        label: 'Kê khai nhiệm vụ nổi trội (MẪU 04)',
        description: 'Lập Bảng kê khai nhiệm vụ nổi trội, vượt mức (Mẫu 04) - Điều kiện bắt buộc để xét danh hiệu Hoàn thành Xuất sắc',
        phaseId: 'evaluation-self',
        assignments: [
          {
            unitScope: 'SELF',
            roleCode: 'CAN_BO_CONG_CHUC',
            description: 'Công chức tự đề xuất Xuất sắc',
          },
        ],
        formSchema: JSON.stringify([
          { id: 'f1', name: 'hasOutstandingTasks', label: 'Có nhiệm vụ nổi trội?', type: 'boolean', required: true },
          { id: 'f2', name: 'outstandingDescription', label: 'Chi tiết sản phẩm vượt mức / đột xuất khó', type: 'textarea' },
          { id: 'f3', name: 'bonusScore', label: 'Điểm cộng nổi trội (+10% tối đa)', type: 'number', default: 0 },
          { id: 'f4', name: 'evidenceDocIds', label: 'Văn bản khen thưởng / Minh chứng (MinIO)', type: 'file' }
        ]),
      },
    },
    {
      id: 'task_mau03_phong_hop',
      type: 'userTask',
      position: { x: 960, y: 350 },
      data: {
        label: 'Họp phòng & Thẩm định tập thể (MẪU 03)',
        description: 'Tập thể phòng & Chi bộ họp nhận xét; Trưởng phòng thẩm định điểm từng cá nhân và lập Bảng tổng hợp tập thể phòng theo Mẫu 03',
        phaseId: 'evaluation-unit',
        assignments: [
          {
            unitScope: 'SAME_UNIT',
            roleCode: 'LANH_DAO_PHONG',
            description: 'Trưởng phòng chủ trì họp toàn thể phòng từ ngày 15 đến 20',
          },
        ],
        formSchema: JSON.stringify([
          { id: 'f1', name: 'collectiveScore', label: 'Điểm đánh giá tập thể phòng (S_collective)', type: 'number', required: true },
          { id: 'f2', name: 'deptMeetingNotes', label: 'Biên bản cuộc họp chi bộ & phòng', type: 'textarea', required: true },
          { id: 'f3', name: 'deptProposedRanking', label: 'Bảng tổng hợp đề xuất xếp loại công chức phòng', type: 'textarea', required: true }
        ]),
      },
    },
    {
      id: 'task_service_audit_sources',
      type: 'serviceTask',
      position: { x: 1290, y: 240 },
      data: {
        label: 'Đối soát 08 nguồn CSDL & Rà soát kỷ luật',
        description: 'Tự động đối soát dữ liệu với CSDL Đảng viên, LGSP, Cán bộ 2C, BVCTNB Mức 3, Sổ văn bản mật, An toàn thông tin Cấp 3 để phát hiện vi phạm bắt buộc hạ bậc',
        phaseId: 'evaluation-council',
        integrationCode: 'LGSP_TINH',
        endpoint: '/btctu/audit/discipline-check',
        method: 'POST',
      },
    },
    {
      id: 'gateway_discipline_check',
      type: 'exclusiveGateway',
      position: { x: 1650, y: 240 },
      data: {
        label: 'Có vi phạm kỷ luật / Lọt lộ bí mật?',
        description: 'Vi phạm kỷ luật hoặc chỉ tiêu < 70% -> Hạ bậc bắt buộc; Không vi phạm -> Áp trần chất lượng',
        phaseId: 'evaluation-council',
      },
    },
    {
      id: 'task_demote_unqualified',
      type: 'userTask',
      position: { x: 1650, y: 450 },
      data: {
        label: 'Hạ bậc bắt buộc: Không hoàn thành nhiệm vụ',
        description: 'Ấn định mức xếp loại Không hoàn thành nhiệm vụ theo quy định đối với cá nhân có sai phạm',
        phaseId: 'evaluation-council',
        assignments: [
          {
            unitScope: 'PARENT_UNIT',
            roleCode: 'HOI_DONG_THAM_DINH',
            description: 'Hội đồng Thẩm định Ban xác nhận hạ bậc',
          },
        ],
        formSchema: JSON.stringify([
          { id: 'f1', name: 'demoteReason', label: 'Căn cứ hạ bậc (Kỷ luật / Lọt lộ bí mật / Hoàn thành < 70%)', type: 'textarea', required: true },
          { id: 'f2', name: 'finalRanking', label: 'Xếp loại ấn định', type: 'text', default: 'KHONG_HOAN_THANH_NHIEM_VU' }
        ]),
      },
    },
    {
      id: 'task_service_apply_caps',
      type: 'serviceTask',
      position: { x: 1980, y: 240 },
      data: {
        label: 'Thuật toán Áp trần 20% & Áp trần Người đứng đầu',
        description: 'Áp trần 20% Xuất sắc per Quy định 348-QĐ/BTCTW: Số Xuất sắc <= INT(20% * Tổng số Tốt trở lên). Áp trần Người đứng đầu: Rank Trưởng phòng <= Rank Tập thể phòng',
        phaseId: 'evaluation-council',
        integrationCode: 'HRM_SERVICE',
        endpoint: '/api/v1/hrm/kpi/apply-quotas-and-caps',
        method: 'POST',
      },
    },
    {
      id: 'task_hoidong_thamdinh',
      type: 'userTask',
      position: { x: 2340, y: 240 },
      data: {
        label: 'Hội đồng Thẩm định Ban xét duyệt kết quả',
        description: 'Hội đồng Thẩm định Ban Tổ chức Tỉnh ủy họp từ ngày 21 đến 25 để xem xét toàn diện kết quả chấm điểm và áp trần khống chế',
        phaseId: 'evaluation-council',
        assignments: [
          {
            unitScope: 'PARENT_UNIT',
            roleCode: 'HOI_DONG_THAM_DINH',
            description: 'Trưởng ban, các Phó ban và Lãnh đạo các phòng chuyên môn',
          },
        ],
        formSchema: JSON.stringify([
          { id: 'f1', name: 'councilVerdict', label: 'Kết luận của Hội đồng Thẩm định', type: 'select', options: ['DONG_Y_XEP_LOAI', 'YEU_CAU_DIEU_CHINH'], required: true },
          { id: 'f2', name: 'councilNotes', label: 'Biên bản & Ý kiến kết luận của Hội đồng', type: 'textarea' }
        ]),
      },
    },
    {
      id: 'gateway_council_check',
      type: 'exclusiveGateway',
      position: { x: 2700, y: 240 },
      data: {
        label: 'Hội đồng Thông qua?',
        description: 'Đồng ý -> Dự thảo Quyết định; Yêu cầu điều chỉnh -> Họp phòng rà soát lại',
        phaseId: 'evaluation-council',
      },
    },
    {
      id: 'task_mau05_quyetdinh',
      type: 'userTask',
      position: { x: 2880, y: 240 },
      data: {
        label: 'Trưởng ban ký Quyết định phê duyệt (MẪU 05)',
        phaseId: 'evaluation-publish',
        description: 'Dự thảo và ban hành Quyết định phê duyệt kết quả xếp loại chất lượng toàn cơ quan Ban Tổ chức Tỉnh ủy (Mẫu 05) trước ngày 28',
        assignments: [
          {
            unitScope: 'PARENT_UNIT',
            roleCode: 'TRUONG_BAN',
            description: 'Trưởng ban Tổ chức Tỉnh ủy Đắk Lắk ký phê duyệt',
          },
        ],
        formSchema: JSON.stringify([
          { id: 'f1', name: 'decisionNumber', label: 'Số Quyết định BTCTU', type: 'text', required: true },
          { id: 'f2', name: 'signDate', label: 'Ngày ký ban hành', type: 'date', required: true },
          { id: 'f3', name: 'signerName', label: 'Trưởng Ban Tổ chức Tỉnh ủy ký', type: 'text', required: true },
          { id: 'f4', name: 'reportToProvincialCommittee', label: 'Báo cáo BTV Tỉnh ủy', type: 'boolean', default: true }
        ]),
      },
    },
    {
      id: 'end_kpi_published',
      type: 'end',
      position: { x: 3240, y: 240 },
      data: {
        label: 'Công khai kết quả & Lưu trữ hồ sơ xếp loại',
        phaseId: 'evaluation-publish',
        description: 'Công bố công khai kết quả xếp loại toàn cơ quan và báo cáo Ban Thường vụ Tỉnh ủy',
        targetStatus: 'PUBLISHED',
      },
    },
  ],
  edges: [
    {
      id: 'e_kpi_start_mau01',
      source: 'start_kpi_period',
      target: 'task_mau01_dangky',
      type: 'custom',
      label: 'Kích hoạt kỳ đánh giá quý',
      action: 'INITIATE_PERIOD',
    },
    {
      id: 'e_mau01_mau02',
      source: 'task_mau01_dangky',
      target: 'task_mau02_tucham',
      type: 'custom',
      label: 'Đăng ký danh mục (Mẫu 01)',
      action: 'SUBMIT_MAU_01',
    },
    {
      id: 'e_mau02_mau04',
      source: 'task_mau02_tucham',
      target: 'task_mau04_noitroi',
      type: 'custom',
      label: 'Tự chấm điểm (Mẫu 02)',
      action: 'SUBMIT_MAU_02',
    },
    {
      id: 'e_mau04_mau03',
      source: 'task_mau04_noitroi',
      target: 'task_mau03_phong_hop',
      type: 'custom',
      label: 'Kê khai nổi trội (Mẫu 04)',
      action: 'SUBMIT_MAU_04',
    },
    {
      id: 'e_mau03_audit',
      source: 'task_mau03_phong_hop',
      target: 'task_service_audit_sources',
      type: 'custom',
      label: 'Họp phòng & Thẩm định (Mẫu 03)',
      action: 'SUBMIT_MAU_03',
    },
    {
      id: 'e_audit_gw',
      source: 'task_service_audit_sources',
      target: 'gateway_discipline_check',
      type: 'custom',
      label: 'Đối soát 08 nguồn CSDL & Rà soát kỷ luật',
      action: 'CHECK_AUDIT',
    },
    {
      id: 'e_gw_violation',
      source: 'gateway_discipline_check',
      target: 'task_demote_unqualified',
      type: 'custom',
      sourceHandle: 'source-bottom',
      targetHandle: 'target-top',
      label: 'Có vi phạm (Kỷ luật / Lọt lộ bí mật)',
      action: 'HAS_VIOLATION',
      condition: 'variables.hasDisciplineViolation === true',
    },
    {
      id: 'e_gw_noviolation',
      source: 'gateway_discipline_check',
      target: 'task_service_apply_caps',
      type: 'custom',
      sourceHandle: 'no_violation',
      label: 'Không vi phạm (Đủ điều kiện xét)',
      action: 'NO_VIOLATION',
      condition: 'variables.hasDisciplineViolation !== true',
    },
    {
      id: 'e_demote_mau05',
      source: 'task_demote_unqualified',
      target: 'task_mau05_quyetdinh',
      type: 'custom',
      label: 'Chuyển danh sách ấn định hạ bậc',
      action: 'FORWARD_DEMOTION',
    },
    {
      id: 'e_caps_council',
      source: 'task_service_apply_caps',
      target: 'task_hoidong_thamdinh',
      type: 'custom',
      label: 'Áp trần 20% & Trần người đứng đầu',
      action: 'CAPS_APPLIED',
    },
    {
      id: 'e_council_gw',
      source: 'task_hoidong_thamdinh',
      target: 'gateway_council_check',
      type: 'custom',
      label: 'Hội đồng Ban họp xét duyệt',
      action: 'COUNCIL_REVIEW',
    },
    {
      id: 'e_gwcouncil_rework',
      source: 'gateway_council_check',
      target: 'task_mau03_phong_hop',
      type: 'custom',
      sourceHandle: 'source-bottom',
      targetHandle: 'target-bottom',
      label: 'Yêu cầu phòng rà soát lại',
      action: 'REQUEST_REWORK',
      condition: 'variables.councilVerdict === "YEU_CAU_DIEU_CHINH"',
    },
    {
      id: 'e_gwcouncil_pass',
      source: 'gateway_council_check',
      target: 'task_mau05_quyetdinh',
      type: 'custom',
      sourceHandle: 'approve',
      label: 'Hội đồng thông qua kết quả',
      action: 'COUNCIL_APPROVED',
      condition: 'variables.councilVerdict === "DONG_Y_XEP_LOAI"',
    },
    {
      id: 'e_mau05_end',
      source: 'task_mau05_quyetdinh',
      target: 'end_kpi_published',
      type: 'custom',
      label: 'Ban hành QĐ (Mẫu 05) & Công khai',
      action: 'PUBLISH_RESULTS',
    },
  ],
};

// ============================================================================
// 3. QUY TRÌNH PHÊ DUYỆT XIN GIA HẠN THỜI HẠN CÔNG VIỆC
// ============================================================================

export const btctuTaskExtensionGraph = {
  viewport: { x: 0, y: 0, zoom: 0.85 },
  nodes: [
    {
      id: 'start_extension',
      type: 'start',
      position: { x: 80, y: 200 },
      data: {
        label: 'Khởi tạo Đề xuất xin gia hạn thời hạn',
        description: 'Chuyên viên gửi đề xuất gia hạn trước deadline ít nhất 24 giờ kèm lý do khách quan và tài liệu minh chứng',
      },
    },
    {
      id: 'task_extension_request',
      type: 'userTask',
      position: { x: 380, y: 200 },
      data: {
        label: 'Chuyên viên lập Phiếu đề xuất gia hạn',
        description: 'Nhập thông tin nhiệm vụ, ngày hết hạn ban đầu, ngày đề xuất mới và giải trình lý do khách quan',
        targetStatus: 'PENDING_EXTENSION',
        assignments: [
          {
            unitScope: 'SAME_UNIT',
            roleCode: 'CHUYEN_VIEN',
            description: 'Chuyên viên 22 VTVL đang thụ lý nhiệm vụ',
          },
        ],
        formSchema: JSON.stringify([
          { id: 'f1', name: 'taskId', label: 'Mã nhiệm vụ cần gia hạn', type: 'text', required: true },
          { id: 'f2', name: 'currentDueDate', label: 'Thời hạn ban đầu', type: 'date', required: true },
          { id: 'f3', name: 'proposedDueDate', label: 'Thời hạn đề xuất mới', type: 'date', required: true },
          { id: 'f4', name: 'reasonCategory', label: 'Lý do xin gia hạn', type: 'select', options: ['CHO_VAN_BAN_CO_QUAN_NGOAI', 'BO_SUNG_MINH_CHUNG_XAC_MINH', 'NHIEM_VU_DOT_XUAT_CHEN_NGANG', 'LY_DO_KHACH_QUAN_KHAC'], required: true },
          { id: 'f5', name: 'detailedReason', label: 'Giải trình chi tiết lý do khách quan', type: 'textarea', required: true },
          { id: 'f6', name: 'proofDocument', label: 'Tài liệu minh chứng đính kèm', type: 'file' },
        ]),
      },
    },
    {
      id: 'task_ldp_appraise',
      type: 'userTask',
      position: { x: 720, y: 200 },
      data: {
        label: 'Lãnh đạo Phòng thẩm định đề xuất gia hạn',
        description: 'Trưởng/Phó phòng kiểm tra tính hợp lý, thời gian gửi (đủ 24h trước hạn) và xác nhận lý do khách quan',
        targetStatus: 'APPRAISING_EXTENSION',
        assignments: [
          {
            unitScope: 'SAME_UNIT',
            roleCode: 'LANH_DAO_PHONG',
            description: 'Trưởng/Phó phòng chuyên môn',
          },
        ],
        formSchema: JSON.stringify([
          { id: 'f1', name: 'ldpDecision', label: 'Ý kiến thẩm định của Lãnh đạo Phòng', type: 'select', options: ['DONG_Y_TRINH_BAN', 'KHONG_DONG_Y'], required: true },
          { id: 'f2', name: 'ldpAssessment', label: 'Nhận xét về tính khách quan và khối lượng công việc', type: 'textarea' },
          { id: 'f3', name: 'adjustedDueDate', label: 'Thời hạn kiến nghị điều chỉnh', type: 'date' },
        ]),
      },
    },
    {
      id: 'gw_ldp_extension',
      type: 'exclusiveGateway',
      position: { x: 1040, y: 200 },
      data: {
        label: 'Lãnh đạo Phòng đồng ý?',
        description: 'Đồng ý -> Trình Lãnh đạo Ban; Không đồng ý -> Bác bỏ đề xuất gia hạn',
      },
    },
    {
      id: 'task_ldb_approve_extension',
      type: 'userTask',
      position: { x: 1360, y: 120 },
      data: {
        label: 'Lãnh đạo Ban xem xét & Phê duyệt gia hạn',
        description: 'Lãnh đạo Ban phụ trách xem xét tính cấp bách và phê duyệt quyết định gia hạn thời hạn hoàn thành',
        targetStatus: 'PENDING_BAN_APPROVAL',
        assignments: [
          {
            unitScope: 'PARENT_UNIT',
            roleCode: 'LANH_DAO_BAN',
            description: 'Trưởng ban & các Phó trưởng ban Tổ chức Tỉnh ủy',
          },
        ],
        formSchema: JSON.stringify([
          { id: 'f1', name: 'ldbDecision', label: 'Quyết định của Lãnh đạo Ban', type: 'select', options: ['CHAP_THUAN_GIA_HAN', 'BAC_BO_GIA_HAN'], required: true },
          { id: 'f2', name: 'finalApprovedDueDate', label: 'Thời hạn hoàn thành được duyệt mới', type: 'date' },
          { id: 'f3', name: 'ldbDirective', label: 'Ý kiến chỉ đạo', type: 'textarea' },
        ]),
      },
    },
    {
      id: 'gw_ldb_extension',
      type: 'exclusiveGateway',
      position: { x: 1680, y: 120 },
      data: {
        label: 'Lãnh đạo Ban chấp thuận?',
        description: 'Chấp thuận -> Cập nhật hạn mới & Bảo lưu SLA; Bác bỏ -> Giữ nguyên hạn cũ',
      },
    },
    {
      id: 'task_auto_update_deadline',
      type: 'serviceTask',
      position: { x: 1980, y: 120 },
      data: {
        label: 'Tự động cập nhật hạn mới & Bảo lưu điểm SLA',
        description: 'Rule Engine cập nhật ngày hạn mới vào Task, bảo lưu 100% điểm tiến độ C% không bị trừ điểm vi phạm hạn cũ',
        integrationCode: 'HRM_SERVICE',
        endpoint: '/api/v1/hrm/kpi/extend-task-deadline',
        method: 'POST',
      },
    },
    {
      id: 'end_extension_approved',
      type: 'end',
      position: { x: 2300, y: 120 },
      data: {
        label: 'Gia hạn thành công & Bảo lưu SLA',
        description: 'Thời hạn nhiệm vụ đã được cập nhật thành công trên hệ thống',
        targetStatus: 'EXTENSION_APPROVED',
      },
    },
    {
      id: 'end_extension_rejected',
      type: 'end',
      position: { x: 1360, y: 380 },
      data: {
        label: 'Bác bỏ gia hạn · Giữ nguyên hạn cũ',
        description: 'Đề xuất gia hạn bị từ chối, chuyên viên tiếp tục thực hiện theo hạn ban đầu',
        targetStatus: 'EXTENSION_REJECTED',
      },
    },
  ],
  edges: [
    {
      id: 'e_ext_start_req',
      source: 'start_extension',
      target: 'task_extension_request',
      type: 'custom',
      label: 'Khởi tạo đề xuất gia hạn',
      action: 'SUBMIT_REQUEST',
    },
    {
      id: 'e_ext_req_ldp',
      source: 'task_extension_request',
      target: 'task_ldp_appraise',
      type: 'custom',
      label: 'Trình Lãnh đạo Phòng thẩm định',
      action: 'SUBMIT_TO_LDP',
    },
    {
      id: 'e_ext_ldp_gw',
      source: 'task_ldp_appraise',
      target: 'gw_ldp_extension',
      type: 'custom',
      label: 'Kiểm tra tính hợp lệ',
      action: 'CHECK_LDP',
    },
    {
      id: 'e_ext_gwldp_pass',
      source: 'gw_ldp_extension',
      target: 'task_ldb_approve_extension',
      type: 'custom',
      label: 'Đồng ý · Trình Lãnh đạo Ban',
      action: 'LDP_ENDORSE',
      condition: 'variables.ldpDecision === "DONG_Y_TRINH_BAN"',
    },
    {
      id: 'e_ext_gwldp_reject',
      source: 'gw_ldp_extension',
      target: 'end_extension_rejected',
      type: 'custom',
      label: 'Không đồng ý · Giữ nguyên hạn',
      action: 'LDP_REJECT',
      condition: 'variables.ldpDecision === "KHONG_DONG_Y"',
    },
    {
      id: 'e_ext_ldb_gw',
      source: 'task_ldb_approve_extension',
      target: 'gw_ldb_extension',
      type: 'custom',
      label: 'Lãnh đạo Ban xem xét',
      action: 'CHECK_LDB',
    },
    {
      id: 'e_ext_gwldb_pass',
      source: 'gw_ldb_extension',
      target: 'task_auto_update_deadline',
      type: 'custom',
      label: 'Chấp thuận gia hạn',
      action: 'LDB_APPROVE',
      condition: 'variables.ldbDecision === "CHAP_THUAN_GIA_HAN"',
    },
    {
      id: 'e_ext_gwldb_reject',
      source: 'gw_ldb_extension',
      target: 'end_extension_rejected',
      type: 'custom',
      label: 'Bác bỏ · Giữ nguyên hạn',
      action: 'LDB_REJECT',
      condition: 'variables.ldbDecision === "BAC_BO_GIA_HAN"',
    },
    {
      id: 'e_ext_auto_end',
      source: 'task_auto_update_deadline',
      target: 'end_extension_approved',
      type: 'custom',
      label: 'Cập nhật hạn mới hoàn tất',
      action: 'AUTO_EXTENDED',
    },
  ],
};

// ============================================================================
// 4. QUY TRÌNH THẨM TRA, XÁC MINH TIÊU CHUẨN CHÍNH TRỊ NỘI BỘ (QĐ 348-QĐ/BTCTW)
// ============================================================================

export const btctuBvctnbVerificationGraph = {
  viewport: { x: 0, y: 0, zoom: 0.85 },
  nodes: [
    {
      id: 'start_bvctnb',
      type: 'start',
      position: { x: 80, y: 220 },
      data: {
        label: 'Tiếp nhận Yêu cầu thẩm tra chính trị nội bộ',
        description: 'Tiếp nhận hồ sơ nhân sự từ Phòng TCCB hoặc cấp ủy cấp dưới phục vụ quy hoạch, bổ nhiệm, kết nạp Đảng',
      },
    },
    {
      id: 'task_bvctnb_assign',
      type: 'userTask',
      position: { x: 380, y: 220 },
      data: {
        label: 'Lãnh đạo Phòng BVCTNB phân công Chuyên viên thẩm tra',
        description: 'Phân loại đối tượng cán bộ, mức độ nhạy cảm chính trị và phân công Chuyên viên VTVL BVCTNB chủ trì',
        targetStatus: 'ASSIGNED_INVESTIGATOR',
        assignments: [
          {
            unitScope: 'SAME_UNIT',
            roleCode: 'LANH_DAO_PHONG',
            description: 'Trưởng/Phó Trưởng phòng BVCTNB',
          },
        ],
        formSchema: JSON.stringify([
          { id: 'f1', name: 'cadreName', label: 'Họ và tên cán bộ cần thẩm tra', type: 'text', required: true },
          { id: 'f2', name: 'cadreIdCard', label: 'Số CCCD / Mã định danh', type: 'text', required: true },
          { id: 'f3', name: 'currentPosition', label: 'Chức vụ, đơn vị công tác hiện tại', type: 'text', required: true },
          { id: 'f4', name: 'purposeType', label: 'Mục đích thẩm tra', type: 'select', options: ['BO_NHIEM_QUY_HOACH', 'KET_NAP_DANG', 'DI_NUOC_NGOAI', 'BAO_VE_CHINH_TRI_DINH_KY'], required: true },
          { id: 'f5', name: 'assigneeOfficer', label: 'Chuyên viên BVCTNB chủ trì thụ lý', type: 'user', required: true },
        ]),
      },
    },
    {
      id: 'task_bvctnb_investigate',
      type: 'userTask',
      position: { x: 720, y: 220 },
      data: {
        label: 'Chuyên viên thẩm tra hồ sơ & Tra cứu CSDL Mật Mức 3',
        description: 'Đối soát hồ sơ lý lịch 2C, tra cứu cơ sở dữ liệu chính trị nội bộ mức độ mật, xác minh lịch sử chính trị và quan hệ thân nhân nước ngoài',
        targetStatus: 'INVESTIGATING',
        assignments: [
          {
            unitScope: 'SAME_UNIT',
            roleCode: 'CHUYEN_VIEN',
            description: 'Chuyên viên Phòng BVCTNB',
          },
        ],
        formSchema: JSON.stringify([
          { id: 'f1', name: 'dbQueryResult', label: 'Kết quả tra cứu CSDL Mật ATTT Cấp 3', type: 'select', options: ['KHONG_CO_VET_DEN', 'CO_THONG_TIN_CAN_LAM_RO'], required: true },
          { id: 'f2', name: 'foreignRelationNotes', label: 'Quan hệ có yếu tố nước ngoài', type: 'textarea' },
          { id: 'f3', name: 'needFieldCheck', label: 'Có cần xác minh thực địa tại địa phương?', type: 'boolean', default: false },
        ]),
      },
    },
    {
      id: 'gw_bvctnb_need_field',
      type: 'exclusiveGateway',
      position: { x: 1040, y: 220 },
      data: {
        label: 'Có cần xác minh thực địa?',
        description: 'Cần xác minh -> Cử đoàn thẩm tra cơ sở; Không cần -> Lập dự thảo Kết luận',
      },
    },
    {
      id: 'task_bvctnb_field_check',
      type: 'userTask',
      position: { x: 1360, y: 340 },
      data: {
        label: 'Tổ chức Đoàn xác minh thực địa tại cơ sở',
        description: 'Làm việc với cấp ủy địa phương, cơ quan công an, nhân chứng lịch sử để thu thập chứng cứ và tài liệu gốc',
        targetStatus: 'FIELD_CHECKING',
        assignments: [
          {
            unitScope: 'SAME_UNIT',
            roleCode: 'CHUYEN_VIEN',
            description: 'Đoàn cán bộ thẩm tra BVCTNB',
          },
        ],
        formSchema: JSON.stringify([
          { id: 'f1', name: 'fieldLocation', label: 'Địa bàn / Cơ quan xác minh', type: 'text', required: true },
          { id: 'f2', name: 'fieldFindings', label: 'Kết quả làm việc và biên bản xác minh', type: 'textarea', required: true },
          { id: 'f3', name: 'policeVerificationProof', label: 'Biên bản phối hợp với cơ quan Công an', type: 'file' },
        ]),
      },
    },
    {
      id: 'task_bvctnb_conclusion',
      type: 'userTask',
      position: { x: 1360, y: 120 },
      data: {
        label: 'Lập Báo cáo thẩm tra & Dự thảo Kết luận chính trị',
        description: 'Tổng hợp toàn bộ tài liệu, đối chiếu tiêu chuẩn Quy định 348-QĐ/BTCTW, xây dựng dự thảo Kết luận về tiêu chuẩn chính trị',
        targetStatus: 'DRAFTING_CONCLUSION',
        assignments: [
          {
            unitScope: 'SAME_UNIT',
            roleCode: 'CHUYEN_VIEN',
            description: 'Chuyên viên Phòng BVCTNB',
          },
        ],
        formSchema: JSON.stringify([
          { id: 'f1', name: 'politicalStandard', label: 'Đánh giá tiêu chuẩn chính trị theo QĐ 348', type: 'select', options: ['DU_TIEU_CHUAN_CHINH_TRI', 'CO_VAN_DE_CHINH_TRI_CAN_XIN_Y_KIEN'], required: true },
          { id: 'f2', name: 'conclusionSummary', label: 'Tóm tắt nội dung Kết luận chính trị', type: 'textarea', required: true },
          { id: 'f3', name: 'draftReportFile', label: 'Báo cáo thẩm tra chi tiết', type: 'file', required: true },
        ]),
      },
    },
    {
      id: 'task_bvctnb_ldp_review',
      type: 'userTask',
      position: { x: 1680, y: 220 },
      data: {
        label: 'Lãnh đạo Phòng BVCTNB duyệt Báo cáo & Ký nháy',
        description: 'Kiểm tra cơ sở pháp lý, tính chặt chẽ của chứng cứ và ký nháy Tờ trình kết luận chính trị nội bộ',
        targetStatus: 'LDP_REVIEWING',
        assignments: [
          {
            unitScope: 'SAME_UNIT',
            roleCode: 'LANH_DAO_PHONG',
            description: 'Trưởng phòng BVCTNB',
          },
        ],
        formSchema: JSON.stringify([
          { id: 'f1', name: 'ldpDecision', label: 'Kết luận của Lãnh đạo Phòng BVCTNB', type: 'select', options: ['DONG_Y_TRINH_LANH_DAO_BAN', 'TRA_LAI_XAC_MINH_BO_SUNG'], required: true },
          { id: 'f2', name: 'ldpComment', label: 'Ý kiến thẩm định của Trưởng phòng', type: 'textarea' },
        ]),
      },
    },
    {
      id: 'task_bvctnb_ban_approval',
      type: 'userTask',
      position: { x: 2000, y: 220 },
      data: {
        label: 'Lãnh đạo Ban ký văn bản Kết luận Tiêu chuẩn chính trị',
        description: 'Trưởng ban hoặc Phó Trưởng ban phụ trách ký ban hành văn bản Kết luận hoặc ký Tờ trình trình Ban Thường vụ Tỉnh ủy',
        targetStatus: 'PENDING_BAN_CONCLUSION',
        assignments: [
          {
            unitScope: 'PARENT_UNIT',
            roleCode: 'LANH_DAO_BAN',
            description: 'Trưởng ban / Phó ban Tổ chức Tỉnh ủy',
          },
        ],
        formSchema: JSON.stringify([
          { id: 'f1', name: 'banConclusionVerdict', label: 'Kết luận cuối cùng về tiêu chuẩn chính trị', type: 'select', options: ['KET_LUAN_DU_TIEU_CHUAN', 'BAO_CAO_XIN_Y_KIEN_THUONG_TRUC_TINH_UY'], required: true },
          { id: 'f2', name: 'digitalSignHash', label: 'Chữ ký số Chuyên dùng', type: 'text' },
        ]),
      },
    },
    {
      id: 'end_bvctnb_certified',
      type: 'end',
      position: { x: 2320, y: 220 },
      data: {
        label: 'Ban hành Kết luận & Mã hóa lưu CSDL Mật Cấp 3',
        description: 'Kết luận chính trị nội bộ được phát hành chính thức và lưu trữ bảo mật Cấp độ 3',
        targetStatus: 'CONCLUSION_ISSUED',
      },
    },
  ],
  edges: [
    {
      id: 'e_bvctnb_start_assign',
      source: 'start_bvctnb',
      target: 'task_bvctnb_assign',
      type: 'custom',
      label: 'Tiếp nhận hồ sơ',
      action: 'ASSIGN_START',
    },
    {
      id: 'e_bvctnb_assign_inv',
      source: 'task_bvctnb_assign',
      target: 'task_bvctnb_investigate',
      type: 'custom',
      label: 'Phân công Chuyên viên thẩm tra',
      action: 'ASSIGN_INVESTIGATOR',
    },
    {
      id: 'e_bvctnb_inv_gw',
      source: 'task_bvctnb_investigate',
      target: 'gw_bvctnb_need_field',
      type: 'custom',
      label: 'Đối soát CSDL Mật Mức 3',
      action: 'CHECK_DOSSIER',
    },
    {
      id: 'e_bvctnb_gw_no_field',
      source: 'gw_bvctnb_need_field',
      target: 'task_bvctnb_conclusion',
      type: 'custom',
      label: 'Không cần đi thực địa',
      action: 'SKIP_FIELD',
      condition: '!variables.needFieldCheck',
    },
    {
      id: 'e_bvctnb_gw_need_field',
      source: 'gw_bvctnb_need_field',
      target: 'task_bvctnb_field_check',
      type: 'custom',
      label: 'Cần xác minh thực tế',
      action: 'DO_FIELD_CHECK',
      condition: 'variables.needFieldCheck === true',
    },
    {
      id: 'e_bvctnb_field_concl',
      source: 'task_bvctnb_field_check',
      target: 'task_bvctnb_conclusion',
      type: 'custom',
      label: 'Hoàn tất xác minh cơ sở',
      action: 'COMPLETE_FIELD',
    },
    {
      id: 'e_bvctnb_concl_ldp',
      source: 'task_bvctnb_conclusion',
      target: 'task_bvctnb_ldp_review',
      type: 'custom',
      label: 'Trình Lãnh đạo Phòng duyệt',
      action: 'SUBMIT_TO_LDP',
    },
    {
      id: 'e_bvctnb_ldp_ban',
      source: 'task_bvctnb_ldp_review',
      target: 'task_bvctnb_ban_approval',
      type: 'custom',
      label: 'Trình Lãnh đạo Ban ký duyệt',
      action: 'SUBMIT_TO_BAN',
    },
    {
      id: 'e_bvctnb_ban_end',
      source: 'task_bvctnb_ban_approval',
      target: 'end_bvctnb_certified',
      type: 'custom',
      label: 'Ký ban hành Kết luận',
      action: 'BAN_APPROVE_CONCLUSION',
    },
  ],
};

// ============================================================================
// 5. QUY TRÌNH BỔ NHIỆM, LUÂN CHUYỂN CÁN BỘ 5 BƯỚC (PHÒNG TCCB)
// ============================================================================

export const btctuTccbAppointmentGraph = {
  viewport: { x: 0, y: 0, zoom: 0.85 },
  nodes: [
    {
      id: 'start_appointment',
      type: 'start',
      position: { x: 80, y: 220 },
      data: {
        label: 'Khởi tạo Quy trình Bổ nhiệm Cán bộ',
        description: 'Chủ trương bổ nhiệm từ Ban Thường vụ Tỉnh ủy hoặc đề xuất của cơ quan, đơn vị có nhu cầu kiện toàn nhân sự',
      },
    },
    {
      id: 'task_step1_survey',
      type: 'userTask',
      position: { x: 380, y: 220 },
      data: {
        label: 'Bước 1: Hội nghị Tập thể Lãnh đạo (Lần 1)',
        description: 'Thảo luận, thống nhất về chủ trương, cơ cấu, số lượng, tiêu chuẩn, điều kiện và quy trình giới thiệu nhân sự',
        targetStatus: 'STEP_1_COMPLETED',
        assignments: [
          {
            unitScope: 'PARENT_UNIT',
            roleCode: 'LANH_DAO_BAN',
            description: 'Tập thể Lãnh đạo Ban',
          },
        ],
        formSchema: JSON.stringify([
          { id: 'f1', name: 'targetPosition', label: 'Vị trí / Chức danh bổ nhiệm', type: 'text', required: true },
          { id: 'f2', name: 'step1Minutes', label: 'Biên bản Hội nghị bước 1', type: 'file', required: true },
          { id: 'f3', name: 'resolutionApproved', label: 'Nghị quyết thông qua chủ trương', type: 'boolean', required: true },
        ]),
      },
    },
    {
      id: 'task_step2_expanded',
      type: 'userTask',
      position: { x: 720, y: 220 },
      data: {
        label: 'Bước 2: Hội nghị Tập thể Lãnh đạo mở rộng',
        description: 'Thảo luận và giới thiệu nhân sự bằng phiếu kín theo danh sách quy hoạch đã được phê duyệt',
        targetStatus: 'STEP_2_COMPLETED',
        assignments: [
          {
            unitScope: 'PARENT_UNIT',
            roleCode: 'LANH_DAO_BAN',
            description: 'Tập thể Lãnh đạo mở rộng',
          },
        ],
        formSchema: JSON.stringify([
          { id: 'f1', name: 'nomineeList', label: 'Danh sách nhân sự được giới thiệu', type: 'textarea', required: true },
          { id: 'f2', name: 'voteCountStep2', label: 'Kết quả kiểm phiếu bước 2', type: 'file', required: true },
        ]),
      },
    },
    {
      id: 'task_auto_call_bvctnb',
      type: 'serviceTask',
      position: { x: 890, y: 220 },
      data: {
        label: 'Tự động liên thông Thẩm tra Chính trị (Phòng BVCTNB)',
        description: 'Tự động kích hoạt quy trình con WF_BTCTU_BVCTNB_XAC_MINH để tra cứu CSDL Mật ATTT Cấp 3 và thẩm tra tiêu chuẩn chính trị nhân sự',
        integrationCode: 'WF_BTCTU_BVCTNB_XAC_MINH',
        endpoint: '/api/v1/workflow/trigger-subflow',
        method: 'POST',
      },
    },
    {
      id: 'task_step3_dossier',
      type: 'userTask',
      position: { x: 1140, y: 220 },
      data: {
        label: 'Bước 3: Thẩm định Hồ sơ Cán bộ & Tiêu chuẩn Chính trị',
        description: 'Phòng TCCB số hóa Mẫu 2C; phối hợp Phòng BVCTNB thẩm tra tiêu chuẩn chính trị; lấy ý kiến UBKT và Thanh tra',
        targetStatus: 'DOSSIER_AUDITING',
        assignments: [
          {
            unitScope: 'SAME_UNIT',
            roleCode: 'CHUYEN_VIEN',
            description: 'Chuyên viên Phòng TCCB & BVCTNB',
          },
        ],
        formSchema: JSON.stringify([
          { id: 'f1', name: 'form2cVerified', label: 'Hồ sơ lý lịch 2C số hóa hợp lệ', type: 'boolean', required: true },
          { id: 'f2', name: 'bvctnbConclusionStatus', label: 'Kết luận Tiêu chuẩn Chính trị từ BVCTNB', type: 'select', options: ['DAT_TIEU_CHUAN_CHINH_TRI', 'KHONG_DAT_HOAC_CAN_XAC_MINH'], required: true },
          { id: 'f3', name: 'disciplinaryStatus', label: 'Rà soát Kỷ luật Đảng và Chính quyền', type: 'select', options: ['KHONG_VI_PHAM', 'CO_DON_THU_KHIEU_NAI', 'DANG_BI_KY_LUAT'], required: true },
        ]),
      },
    },
    {
      id: 'gw_dossier_check',
      type: 'exclusiveGateway',
      position: { x: 1380, y: 220 },
      data: {
        label: 'Hồ sơ & Tiêu chuẩn chính trị Đạt chuẩn?',
        description: 'Đạt chuẩn -> Chuyển sang Bước 4; Có vi phạm -> Dừng quy trình bổ nhiệm',
      },
    },
    {
      id: 'task_step4_key_officers',
      type: 'userTask',
      position: { x: 1700, y: 120 },
      data: {
        label: 'Bước 4: Hội nghị Cán bộ chủ chốt lấy phiếu tín nhiệm',
        description: 'Lấy phiếu tín nhiệm của toàn thể cán bộ chủ chốt đối với nhân sự được lựa chọn sau bước 3',
        targetStatus: 'STEP_4_COMPLETED',
        assignments: [
          {
            unitScope: 'PARENT_UNIT',
            roleCode: 'LANH_DAO_BAN',
            description: 'Cán bộ chủ chốt cơ quan',
          },
        ],
        formSchema: JSON.stringify([
          { id: 'f1', name: 'step4VoteResults', label: 'Biên bản kiểm phiếu Hội nghị cán bộ chủ chốt', type: 'file', required: true },
          { id: 'f2', name: 'confidenceRate', label: 'Tỷ lệ phiếu tín nhiệm (%)', type: 'number', required: true },
        ]),
      },
    },
    {
      id: 'task_step5_final_vote',
      type: 'userTask',
      position: { x: 2020, y: 120 },
      data: {
        label: 'Bước 5: Hội nghị Tập thể Lãnh đạo biểu quyết lần cuối',
        description: 'Tập thể Lãnh đạo thảo luận, biểu quyết bằng phiếu kín nhân sự và hoàn thiện Tờ trình trình Ban Thường vụ Tỉnh ủy',
        targetStatus: 'STEP_5_COMPLETED',
        assignments: [
          {
            unitScope: 'PARENT_UNIT',
            roleCode: 'LANH_DAO_BAN',
            description: 'Tập thể Lãnh đạo Ban',
          },
        ],
        formSchema: JSON.stringify([
          { id: 'f1', name: 'finalVoteResult', label: 'Tỷ lệ biểu quyết thông qua (%)', type: 'number', required: true },
          { id: 'f2', name: 'submissionReport', label: 'Tờ trình trình Ban Thường vụ Tỉnh ủy', type: 'file', required: true },
        ]),
      },
    },
    {
      id: 'task_btv_approval',
      type: 'userTask',
      position: { x: 2340, y: 120 },
      data: {
        label: 'Ban Thường vụ Tỉnh ủy xem xét & Ban hành Quyết định',
        description: 'Hội nghị Ban Thường vụ Tỉnh ủy xem xét, quyết định bổ nhiệm và ban hành Quyết định bổ nhiệm cán bộ',
        targetStatus: 'PENDING_BTV_APPROVAL',
        assignments: [
          {
            unitScope: 'PARENT_UNIT',
            roleCode: 'LANH_DAO_BAN',
            description: 'Ban Thường vụ Tỉnh ủy',
          },
        ],
        formSchema: JSON.stringify([
          { id: 'f1', name: 'btvVerdict', label: 'Quyết định của Ban Thường vụ Tỉnh ủy', type: 'select', options: ['THONG_QUA_BO_NHIEM', 'KHONG_DONG_Y'], required: true },
          { id: 'f2', name: 'decisionNumber', label: 'Số Quyết định bổ nhiệm', type: 'text' },
        ]),
      },
    },
    {
      id: 'end_appointment_issued',
      type: 'end',
      position: { x: 2660, y: 120 },
      data: {
        label: 'Ban hành Quyết định Bổ nhiệm & Đồng bộ Hồ sơ 2C',
        description: 'Hoàn tất quy trình bổ nhiệm cán bộ, cập nhật trạng thái chức vụ mới vào hệ thống',
        targetStatus: 'APPOINTMENT_COMPLETED',
      },
    },
    {
      id: 'end_appointment_halted',
      type: 'end',
      position: { x: 1700, y: 360 },
      data: {
        label: 'Dừng quy trình bổ nhiệm do chưa đủ tiêu chuẩn',
        description: 'Nhân sự không đáp ứng tiêu chuẩn chính trị hoặc có vi phạm kỷ luật, dừng xem xét',
        targetStatus: 'APPOINTMENT_HALTED',
      },
    },
  ],
  edges: [
    {
      id: 'e_app_start_s1',
      source: 'start_appointment',
      target: 'task_step1_survey',
      type: 'custom',
      label: 'Khởi tạo quy trình bổ nhiệm',
      action: 'INIT_APPOINTMENT',
    },
    {
      id: 'e_app_s1_s2',
      source: 'task_step1_survey',
      target: 'task_step2_expanded',
      type: 'custom',
      label: 'Hoàn thành bước 1 · Sang bước 2',
      action: 'COMPLETE_STEP1',
    },
    {
      id: 'e_app_s2_bvctnb',
      source: 'task_step2_expanded',
      target: 'task_auto_call_bvctnb',
      type: 'custom',
      label: 'Lấy phiếu bước 2 · Kích hoạt thẩm tra chính trị',
      action: 'TRIGGER_BVCTNB_CHECK',
    },
    {
      id: 'e_app_bvctnb_s3',
      source: 'task_auto_call_bvctnb',
      target: 'task_step3_dossier',
      type: 'custom',
      label: 'Nhận kết quả thẩm tra · Hoàn thiện hồ sơ 2C',
      action: 'COMPLETE_BVCTNB_CHECK',
    },
    {
      id: 'e_app_s3_gw',
      source: 'task_step3_dossier',
      target: 'gw_dossier_check',
      type: 'custom',
      label: 'Đối soát tiêu chuẩn & chính trị',
      action: 'CHECK_DOSSIER',
    },
    {
      id: 'e_app_gw_pass',
      source: 'gw_dossier_check',
      target: 'task_step4_key_officers',
      type: 'custom',
      label: 'Đủ điều kiện · Sang bước 4',
      action: 'DOSSIER_QUALIFIED',
      condition: 'variables.bvctnbConclusionStatus === "DAT_TIEU_CHUAN_CHINH_TRI" && variables.disciplinaryStatus === "KHONG_VI_PHAM"',
    },
    {
      id: 'e_app_gw_fail',
      source: 'gw_dossier_check',
      target: 'end_appointment_halted',
      type: 'custom',
      label: 'Có vi phạm · Dừng bổ nhiệm',
      action: 'DOSSIER_DISQUALIFIED',
      condition: 'variables.bvctnbConclusionStatus !== "DAT_TIEU_CHUAN_CHINH_TRI" || variables.disciplinaryStatus !== "KHONG_VI_PHAM"',
    },
    {
      id: 'e_app_s4_s5',
      source: 'task_step4_key_officers',
      target: 'task_step5_final_vote',
      type: 'custom',
      label: 'Hoàn thành bước 4 · Biểu quyết bước 5',
      action: 'COMPLETE_STEP4',
    },
    {
      id: 'e_app_s5_btv',
      source: 'task_step5_final_vote',
      target: 'task_btv_approval',
      type: 'custom',
      label: 'Trình Ban Thường vụ Tỉnh ủy',
      action: 'SUBMIT_TO_BTV',
    },
    {
      id: 'e_app_btv_end',
      source: 'task_btv_approval',
      target: 'end_appointment_issued',
      type: 'custom',
      label: 'Ban hành Quyết định bổ nhiệm',
      action: 'BTV_APPROVE',
    },
  ],
};

// ============================================================================
// 6. QUY TRÌNH XÉT TẶNG HUY HIỆU ĐẢNG (PHÒNG TỔ CHỨC ĐẢNG - ĐẢNG VIÊN)
// ============================================================================

export const btctuTcdDvBadgeGraph = {
  viewport: { x: 0, y: 0, zoom: 0.85 },
  nodes: [
    {
      id: 'start_badge',
      type: 'start',
      position: { x: 80, y: 220 },
      data: {
        label: 'Tiếp nhận Danh sách đề nghị tặng Huy hiệu Đảng',
        description: 'Tiếp nhận Tờ trình và danh sách đảng viên đề nghị tặng Huy hiệu Đảng từ các Huyện ủy, Thị ủy, Thành ủy và Đảng ủy trực thuộc',
      },
    },
    {
      id: 'task_auto_verify_lgsp',
      type: 'serviceTask',
      position: { x: 380, y: 220 },
      data: {
        label: 'Hệ thống tự động đối soát CSDL Đảng viên qua LGSP',
        description: 'Kiểm tra tự động ngày vào Đảng, ngày chính thức, năm tuổi Đảng và lịch sử sinh hoạt qua Trục liên thông LGSP',
        integrationCode: 'LGSP_SERVICE',
        endpoint: '/api/v1/lgsp/party-members/verify-badge-eligibility',
        method: 'POST',
      },
    },
    {
      id: 'task_tcd_specialist_review',
      type: 'userTask',
      position: { x: 720, y: 220 },
      data: {
        label: 'Chuyên viên Phòng TCĐ-ĐV thẩm định hồ sơ đảng viên',
        description: 'Rà soát tính hợp lệ của lý lịch đảng viên, kiểm tra điều kiện không bị kỷ luật và đối chiếu số năm tuổi Đảng',
        targetStatus: 'SPECIALIST_REVIEWING',
        assignments: [
          {
            unitScope: 'SAME_UNIT',
            roleCode: 'CHUYEN_VIEN',
            description: 'Chuyên viên Phòng TCĐ-ĐV',
          },
        ],
        formSchema: JSON.stringify([
          { id: 'f1', name: 'badgeCategory', label: 'Huy hiệu Đảng đề nghị (năm)', type: 'select', options: ['30_NAM', '40_NAM', '45_NAM', '50_NAM', '55_NAM', '60_NAM', '65_NAM', '70_NAM', '75_NAM', '80_NAM'], required: true },
          { id: 'f2', name: 'eligibilityStatus', label: 'Kết quả thẩm định điều kiện', type: 'select', options: ['DU_DIEU_KIEN', 'CHUA_DU_TUOI_DANG', 'CO_VI_PHAM_KY_LUAT'], required: true },
          { id: 'f3', name: 'specialistNotes', label: 'Ý kiến thẩm định chi tiết', type: 'textarea' },
        ]),
      },
    },
    {
      id: 'gw_badge_eligibility',
      type: 'exclusiveGateway',
      position: { x: 1040, y: 220 },
      data: {
        label: 'Đủ điều kiện xét tặng?',
        description: 'Đủ điều kiện -> Trình Lãnh đạo Phòng; Chưa đủ -> Trả hồ sơ về cơ sở',
      },
    },
    {
      id: 'task_tcd_ldp_review',
      type: 'userTask',
      position: { x: 1360, y: 120 },
      data: {
        label: 'Lãnh đạo Phòng TCĐ-ĐV ký nháy Tờ trình danh sách',
        description: 'Trưởng phòng duyệt danh sách tổng hợp, mức tiền thưởng kèm theo và ký nháy Tờ trình trình Lãnh đạo Ban',
        targetStatus: 'LDP_REVIEWING',
        assignments: [
          {
            unitScope: 'SAME_UNIT',
            roleCode: 'LANH_DAO_PHONG',
            description: 'Trưởng phòng TCĐ-ĐV',
          },
        ],
        formSchema: JSON.stringify([
          { id: 'f1', name: 'ldpApproval', label: 'Ý kiến duyệt của Trưởng phòng', type: 'select', options: ['THONG_QUA_DANH_SACH', 'YEU_CAU_RA_SOAT_LAI'], required: true },
          { id: 'f2', name: 'totalRewardAmount', label: 'Tổng kinh phí khen thưởng (VNĐ)', type: 'number' },
        ]),
      },
    },
    {
      id: 'task_tcd_ldb_review',
      type: 'userTask',
      position: { x: 1680, y: 120 },
      data: {
        label: 'Lãnh đạo Ban Tổ chức Tỉnh ủy xem xét & Ký Tờ trình',
        description: 'Lãnh đạo Ban phụ trách ký Tờ trình chính thức trình Thường trực Tỉnh ủy và Ban Thường vụ Tỉnh ủy',
        targetStatus: 'LDB_REVIEWING',
        assignments: [
          {
            unitScope: 'PARENT_UNIT',
            roleCode: 'LANH_DAO_BAN',
            description: 'Lãnh đạo Ban phụ trách',
          },
        ],
        formSchema: JSON.stringify([
          { id: 'f1', name: 'ldbDecision', label: 'Quyết định của Lãnh đạo Ban', type: 'select', options: ['KY_TRINH_BTV_TINH_UY', 'TRA_LAI_PHONG'], required: true },
          { id: 'f2', name: 'signedDocumentFile', label: 'Tờ trình đã ký số', type: 'file' },
        ]),
      },
    },
    {
      id: 'task_btv_badge_decision',
      type: 'userTask',
      position: { x: 2000, y: 120 },
      data: {
        label: 'Ban Thường vụ Tỉnh ủy ban hành Quyết định trao tặng',
        description: 'Ký ban hành Quyết định tặng Huy hiệu Đảng đợt kỷ niệm và phân bổ kinh phí theo quy định Trung ương',
        targetStatus: 'PENDING_BTV_DECISION',
        assignments: [
          {
            unitScope: 'PARENT_UNIT',
            roleCode: 'LANH_DAO_BAN',
            description: 'Ban Thường vụ Tỉnh ủy',
          },
        ],
        formSchema: JSON.stringify([
          { id: 'f1', name: 'decisionNumber', label: 'Số Quyết định BTV Tỉnh ủy', type: 'text', required: true },
          { id: 'f2', name: 'decisionSignDate', label: 'Ngày ký ban hành', type: 'date', required: true },
        ]),
      },
    },
    {
      id: 'task_badge_sync_lgsp',
      type: 'serviceTask',
      position: { x: 2320, y: 120 },
      data: {
        label: 'Tự động đồng bộ Huy hiệu Đảng vào CSDL Đảng viên',
        description: 'Ghi nhận mã số Huy hiệu, ngày trao tặng vào hồ sơ đảng viên điện tử trên hệ thống cơ sở dữ liệu toàn tỉnh',
        integrationCode: 'LGSP_SERVICE',
        endpoint: '/api/v1/lgsp/party-members/sync-awarded-badge',
        method: 'POST',
      },
    },
    {
      id: 'end_badge_awarded',
      type: 'end',
      position: { x: 2640, y: 120 },
      data: {
        label: 'Hoàn tất trao tặng Huy hiệu Đảng',
        description: 'Quy trình khen thưởng hoàn tất, hồ sơ được lưu vết và vinh danh',
        targetStatus: 'BADGE_AWARDED',
      },
    },
    {
      id: 'end_badge_rejected',
      type: 'end',
      position: { x: 1360, y: 340 },
      data: {
        label: 'Trả hồ sơ về cơ sở do chưa đủ tiêu chuẩn',
        description: 'Hồ sơ chưa đủ điều kiện năm tuổi Đảng hoặc đang trong thời gian xem xét kỷ luật',
        targetStatus: 'BADGE_REJECTED',
      },
    },
  ],
  edges: [
    {
      id: 'e_badge_start_auto',
      source: 'start_badge',
      target: 'task_auto_verify_lgsp',
      type: 'custom',
      label: 'Tiếp nhận hồ sơ',
      action: 'SUBMIT_LIST',
    },
    {
      id: 'e_badge_auto_spec',
      source: 'task_auto_verify_lgsp',
      target: 'task_tcd_specialist_review',
      type: 'custom',
      label: 'Đối soát tự động qua LGSP',
      action: 'AUTO_VERIFIED',
    },
    {
      id: 'e_badge_spec_gw',
      source: 'task_tcd_specialist_review',
      target: 'gw_badge_eligibility',
      type: 'custom',
      label: 'Thẩm định hồ sơ',
      action: 'CHECK_ELIGIBILITY',
    },
    {
      id: 'e_badge_gw_pass',
      source: 'gw_badge_eligibility',
      target: 'task_tcd_ldp_review',
      type: 'custom',
      label: 'Đủ điều kiện · Trình Trưởng phòng',
      action: 'BADGE_QUALIFIED',
      condition: 'variables.eligibilityStatus === "DU_DIEU_KIEN"',
    },
    {
      id: 'e_badge_gw_fail',
      source: 'gw_badge_eligibility',
      target: 'end_badge_rejected',
      type: 'custom',
      label: 'Chưa đủ điều kiện · Trả hồ sơ',
      action: 'BADGE_REJECTED',
      condition: 'variables.eligibilityStatus !== "DU_DIEU_KIEN"',
    },
    {
      id: 'e_badge_ldp_ldb',
      source: 'task_tcd_ldp_review',
      target: 'task_tcd_ldb_review',
      type: 'custom',
      label: 'Ký nháy trình Lãnh đạo Ban',
      action: 'SUBMIT_TO_BAN',
    },
    {
      id: 'e_badge_ldb_btv',
      source: 'task_tcd_ldb_review',
      target: 'task_btv_badge_decision',
      type: 'custom',
      label: 'Trình Ban Thường vụ Tỉnh ủy',
      action: 'SUBMIT_TO_BTV',
    },
    {
      id: 'e_badge_btv_sync',
      source: 'task_btv_badge_decision',
      target: 'task_badge_sync_lgsp',
      type: 'custom',
      label: 'Ban hành QĐ · Đồng bộ dữ liệu',
      action: 'SYNC_DATA',
    },
    {
      id: 'e_badge_sync_end',
      source: 'task_badge_sync_lgsp',
      target: 'end_badge_awarded',
      type: 'custom',
      label: 'Cập nhật hồ sơ thành công',
      action: 'COMPLETED',
    },
  ],
};

// ============================================================================
// 7. QUY TRÌNH QUẢN LÝ VÀ XỬ LÝ SỰ CỐ AN TOÀN THÔNG TIN CẤP ĐỘ 3 (VĂN PHÒNG BAN)
// ============================================================================

export const btctuSecurityIncidentGraph = {
  viewport: { x: 0, y: 0, zoom: 0.85 },
  nodes: [
    {
      id: 'start_security_incident',
      type: 'start',
      position: { x: 80, y: 220 },
      data: {
        label: 'Phát hiện / Tiếp nhận Cảnh báo Sự cố ATTT',
        description: 'Hệ thống SOC/SIEM cảnh báo xâm nhập hoặc Cán bộ Ban phát hiện hiện tượng bất thường, lộ lọt mã độc',
      },
    },
    {
      id: 'task_incident_triage',
      type: 'userTask',
      position: { x: 380, y: 220 },
      data: {
        label: 'Đội Ứng cứu ATTT tiếp nhận & Phân loại sự cố',
        description: 'Xác minh sự cố thật/giả và xếp cấp độ (Cấp 1: Thấp - máy trạm; Cấp 2: Trung bình - dịch vụ nội bộ; Cấp 3: Khẩn cấp - CSDL Mật)',
        targetStatus: 'TRIAGING',
        assignments: [
          {
            unitScope: 'SAME_UNIT',
            roleCode: 'CHUYEN_VIEN',
            description: 'Cán bộ Chuyên trách CNTT/ATTT Văn phòng Ban',
          },
        ],
        formSchema: JSON.stringify([
          { id: 'f1', name: 'incidentType', label: 'Loại hình sự cố', type: 'select', options: ['TAN_CONG_TU_CHOI_DICH_VU_DDOS', 'MA_DOC_RANSOMWARE', 'LO_LOT_DU_LIEU_MAT', 'XAM_NHAP_TRAI_PHEP', 'SU_CO_PHAN_CUNG_MANG'], required: true },
          { id: 'f2', name: 'severityLevel', label: 'Mức độ nghiêm trọng', type: 'select', options: ['MUC_1_THAP', 'MUC_2_TRUNG_BINH', 'MUC_3_NGHIEM_TRONG_CAP_3'], required: true },
          { id: 'f3', name: 'affectedSystems', label: 'Hệ thống bị ảnh hưởng', type: 'multiselect', options: ['CSDL_CAN_BO_MAT', 'PORTAL_BAN_TO_CHUC', 'MAIL_CONG_VU', 'SERVER_UNG_DUNG', 'MAY_TRAM_LAN'], required: true },
        ]),
      },
    },
    {
      id: 'gw_incident_severity',
      type: 'exclusiveGateway',
      position: { x: 720, y: 220 },
      data: {
        label: 'Mức độ khẩn cấp Cấp độ 3?',
        description: 'Cấp 3 Khẩn cấp -> Cô lập VLAN ngay; Cấp 1, 2 -> Xử lý tiêu chuẩn',
      },
    },
    {
      id: 'task_emergency_containment',
      type: 'userTask',
      position: { x: 1040, y: 120 },
      data: {
        label: 'Kích hoạt Cô lập Khẩn cấp & Bảo toàn Hiện trường',
        description: 'Ngắt kết nối mạng máy chủ nghi bị xâm nhập, phong tỏa VLAN, sao lưu bản chụp RAM và log audit phục vụ điều tra forensic',
        targetStatus: 'CONTAINING',
        assignments: [
          {
            unitScope: 'SAME_UNIT',
            roleCode: 'CHUYEN_VIEN',
            description: 'Đội Ứng cứu khẩn cấp ATTT',
          },
        ],
        formSchema: JSON.stringify([
          { id: 'f1', name: 'vlanIsolated', label: 'Đã cô lập VLAN máy chủ bị tấn công', type: 'boolean', required: true },
          { id: 'f2', name: 'forensicSnapshotTaken', label: 'Đã trích xuất snapshot RAM và file log', type: 'boolean', required: true },
          { id: 'f3', name: 'firewallRuleApplied', label: 'Quy tắc chặn IP/Subnet độc hại', type: 'textarea' },
        ]),
      },
    },
    {
      id: 'task_eradication_recovery',
      type: 'userTask',
      position: { x: 1360, y: 220 },
      data: {
        label: 'Xử lý Triệt để & Khôi phục Hệ thống từ Backup sạch',
        description: 'Bóc gỡ mã độc, vá lỗ hổng zero-day, khôi phục CSDL từ bản sao lưu toàn vẹn gần nhất và kiểm tra an toàn trước khi mở mạng',
        targetStatus: 'RECOVERING',
        assignments: [
          {
            unitScope: 'SAME_UNIT',
            roleCode: 'CHUYEN_VIEN',
            description: 'Chuyên viên kỹ thuật hạ tầng',
          },
        ],
        formSchema: JSON.stringify([
          { id: 'f1', name: 'vulnerabilityPatched', label: 'Mô tả lỗ hổng và giải pháp vá', type: 'textarea', required: true },
          { id: 'f2', name: 'backupRestoredDate', label: 'Bản sao lưu sạch được sử dụng', type: 'date', required: true },
          { id: 'f3', name: 'integrityCheckPassed', label: 'Kiểm tra toàn vẹn CSDL Đạt', type: 'boolean', required: true },
        ]),
      },
    },
    {
      id: 'task_post_incident_audit',
      type: 'userTask',
      position: { x: 1680, y: 220 },
      data: {
        label: 'Lập Báo cáo Khắc phục Sự cố & Trình Lãnh đạo Ban',
        description: 'Tổng hợp nguyên nhân, đánh giá thiệt hại, báo cáo Lãnh đạo Ban, Sở Thông tin & Truyền thông và Cục ATTT / VNCERT',
        targetStatus: 'REPORTING',
        assignments: [
          {
            unitScope: 'SAME_UNIT',
            roleCode: 'LANH_DAO_PHONG',
            description: 'Chánh Văn phòng Ban',
          },
        ],
        formSchema: JSON.stringify([
          { id: 'f1', name: 'incidentReportFile', label: 'Báo cáo kỹ thuật điều tra sự cố', type: 'file', required: true },
          { id: 'f2', name: 'externalNotificationSent', label: 'Đã báo cáo Sở TTTT / VNCERT theo quy định', type: 'boolean', required: true },
          { id: 'f3', name: 'preventionMeasures', label: 'Phương án phòng ngừa tái diễn', type: 'textarea', required: true },
        ]),
      },
    },
    {
      id: 'end_incident_resolved',
      type: 'end',
      position: { x: 2000, y: 220 },
      data: {
        label: 'Đóng hồ sơ sự cố & Khôi phục vận hành bình thường',
        description: 'Hệ thống an toàn trở lại, tài liệu điều tra được lưu vết kiểm toán',
        targetStatus: 'INCIDENT_RESOLVED',
      },
    },
  ],
  edges: [
    {
      id: 'e_inc_start_tri',
      source: 'start_security_incident',
      target: 'task_incident_triage',
      type: 'custom',
      label: 'Tiếp nhận cảnh báo',
      action: 'TRIAGE_START',
    },
    {
      id: 'e_inc_tri_gw',
      source: 'task_incident_triage',
      target: 'gw_incident_severity',
      type: 'custom',
      label: 'Phân loại sự cố',
      action: 'CHECK_SEVERITY',
    },
    {
      id: 'e_inc_gw_crit',
      source: 'gw_incident_severity',
      target: 'task_emergency_containment',
      type: 'custom',
      label: 'Khẩn cấp · Cô lập ngay',
      action: 'SEVERITY_HIGH',
      condition: 'variables.severityLevel === "MUC_3_NGHIEM_TRONG_CAP_3"',
    },
    {
      id: 'e_inc_gw_norm',
      source: 'gw_incident_severity',
      target: 'task_eradication_recovery',
      type: 'custom',
      label: 'Mức độ trung bình/thấp',
      action: 'SEVERITY_STANDARD',
      condition: 'variables.severityLevel !== "MUC_3_NGHIEM_TRONG_CAP_3"',
    },
    {
      id: 'e_inc_cont_rec',
      source: 'task_emergency_containment',
      target: 'task_eradication_recovery',
      type: 'custom',
      label: 'Đã cô lập an toàn · Tiến hành xử lý',
      action: 'CONTAINMENT_DONE',
    },
    {
      id: 'e_inc_rec_rep',
      source: 'task_eradication_recovery',
      target: 'task_post_incident_audit',
      type: 'custom',
      label: 'Khôi phục xong · Lập báo cáo',
      action: 'SUBMIT_REPORT',
    },
    {
      id: 'e_inc_rep_end',
      source: 'task_post_incident_audit',
      target: 'end_incident_resolved',
      type: 'custom',
      label: 'Đóng hồ sơ sự cố',
      action: 'INCIDENT_CLOSED',
    },
  ],
};

// ============================================================================
// 8. QUY TRÌNH THU HỒI TÀI NGUYÊN & PHÂN QUYỀN KHI THÔI VIỆC (QUY TRÌNH 7a)
// ============================================================================

export const btctuOffboardingSecurityGraph = {
  viewport: { x: 0, y: 0, zoom: 0.85 },
  nodes: [
    {
      id: 'start_offboarding',
      type: 'start',
      position: { x: 80, y: 220 },
      data: {
        label: 'Tiếp nhận Quyết định Nghỉ việc / Chuyển công tác',
        description: 'Phòng TCCB ban hành hoặc chuyển giao Quyết định nghỉ hưu, chuyển công tác, thôi việc của cán bộ, công chức',
      },
    },
    {
      id: 'task_asset_handover',
      type: 'userTask',
      position: { x: 380, y: 220 },
      data: {
        label: 'Cán bộ thực hiện Bàn giao Tài sản & Thiết bị số',
        description: 'Bàn giao máy tính làm việc, USB lưu trữ an toàn, token chữ ký số chuyên dùng, thẻ ra vào cơ quan',
        targetStatus: 'HANDING_OVER',
        assignments: [
          {
            unitScope: 'SAME_UNIT',
            roleCode: 'CHUYEN_VIEN',
            description: 'Cán bộ thôi việc / chuyển công tác',
          },
        ],
        formSchema: JSON.stringify([
          { id: 'f1', name: 'computerHandedOver', label: 'Đã bàn giao máy tính trạm và phụ kiện', type: 'boolean', required: true },
          { id: 'f2', name: 'caTokenHandedOver', label: 'Đã thu hồi USB Token Chữ ký số CA Ban Cơ yếu', type: 'boolean', required: true },
          { id: 'f3', name: 'secureFilesHandedOver', label: 'Đã bàn giao toàn bộ hồ sơ mật đang quản lý', type: 'boolean', required: true },
        ]),
      },
    },
    {
      id: 'task_dept_confirm',
      type: 'userTask',
      position: { x: 720, y: 220 },
      data: {
        label: 'Trưởng phòng chuyên môn xác nhận hoàn tất bàn giao việc',
        description: 'Kiểm tra tình trạng công việc còn dang dở, các nhiệm vụ phân công đã được giao lại cho nhân sự khác',
        targetStatus: 'DEPT_CONFIRMED',
        assignments: [
          {
            unitScope: 'SAME_UNIT',
            roleCode: 'LANH_DAO_PHONG',
            description: 'Trưởng/Phó phòng chuyên môn trực tiếp',
          },
        ],
        formSchema: JSON.stringify([
          { id: 'f1', name: 'allTasksReassigned', label: 'Tất cả nhiệm vụ đã được chuyển giao', type: 'boolean', required: true },
          { id: 'f2', name: 'deptHandoverMinutes', label: 'Biên bản bàn giao công việc cấp phòng', type: 'file', required: true },
          { id: 'f3', name: 'ldpSignature', label: 'Xác nhận của Lãnh đạo Phòng', type: 'text', required: true },
        ]),
      },
    },
    {
      id: 'task_auto_revoke_access',
      type: 'serviceTask',
      position: { x: 1040, y: 220 },
      data: {
        label: 'Hệ thống tự động vô hiệu hóa Tài khoản & Thu hồi quyền PBAC',
        description: 'Khóa tài khoản SSO, ngắt quyền truy cập toàn bộ module phần mềm, hủy VPN và vô hiệu hóa API keys',
        integrationCode: 'USER_SERVICE',
        endpoint: '/api/v1/user/accounts/revoke-all-access',
        method: 'POST',
      },
    },
    {
      id: 'task_security_audit',
      type: 'userTask',
      position: { x: 1360, y: 220 },
      data: {
        label: 'Bộ phận ATTT Văn phòng kiểm tra & Ký xác nhận',
        description: 'Rà soát nhật ký truy cập lần cuối, kiểm tra tình trạng xóa dữ liệu nhạy cảm trên máy tính trạm và ký Biên bản thanh lý tài nguyên số',
        targetStatus: 'AUDIT_CONFIRMED',
        assignments: [
          {
            unitScope: 'SAME_UNIT',
            roleCode: 'CHUYEN_VIEN',
            description: 'Chuyên trách ATTT Văn phòng Ban',
          },
        ],
        formSchema: JSON.stringify([
          { id: 'f1', name: 'accountRevocationVerified', label: 'Đã xác nhận tài khoản bị khóa 100%', type: 'boolean', required: true },
          { id: 'f2', name: 'hardDriveWiped', label: 'Dữ liệu đệm trên máy tính trạm đã dọn sạch', type: 'boolean', required: true },
          { id: 'f3', name: 'offboardingReportFile', label: 'Biên bản thanh lý tài nguyên số ATTT Cấp độ 3', type: 'file', required: true },
        ]),
      },
    },
    {
      id: 'end_offboarding_completed',
      type: 'end',
      position: { x: 1680, y: 220 },
      data: {
        label: 'Hoàn tất thủ tục An toàn thông tin thôi việc',
        description: 'Toàn bộ quyền và tài sản số của cán bộ đã được thu hồi an toàn tuyệt đối',
        targetStatus: 'OFFBOARDING_COMPLETED',
      },
    },
  ],
  edges: [
    {
      id: 'e_off_start_hand',
      source: 'start_offboarding',
      target: 'task_asset_handover',
      type: 'custom',
      label: 'Tiếp nhận quyết định',
      action: 'START_HANDOVER',
    },
    {
      id: 'e_off_hand_dept',
      source: 'task_asset_handover',
      target: 'task_dept_confirm',
      type: 'custom',
      label: 'Bàn giao tài sản',
      action: 'SUBMIT_HANDOVER',
    },
    {
      id: 'e_off_dept_auto',
      source: 'task_dept_confirm',
      target: 'task_auto_revoke_access',
      type: 'custom',
      label: 'Trưởng phòng xác nhận',
      action: 'CONFIRM_HANDOVER',
    },
    {
      id: 'e_off_auto_sec',
      source: 'task_auto_revoke_access',
      target: 'task_security_audit',
      type: 'custom',
      label: 'Vô hiệu hóa quyền xong',
      action: 'AUTO_REVOKED',
    },
    {
      id: 'e_off_sec_end',
      source: 'task_security_audit',
      target: 'end_offboarding_completed',
      type: 'custom',
      label: 'Xác nhận an toàn · Hoàn tất',
      action: 'COMPLETE_OFFBOARDING',
    },
  ],
};

// ============================================================================
// 9. QUY TRÌNH THỬ NGHIỆM VÀ NGHIỆM THU HỆ THỐNG CNTT CẤP ĐỘ 3 (QUY TRÌNH 7b)
// ============================================================================

export const btctuSystemTestingGraph = {
  viewport: { x: 0, y: 0, zoom: 0.85 },
  nodes: [
    {
      id: 'start_system_testing',
      type: 'start',
      position: { x: 80, y: 220 },
      data: {
        label: 'Nộp Phiên bản Phát hành Thử nghiệm (Release Candidate)',
        description: 'Đơn vị phát triển / Tổ dự án nộp bản build phần mềm kèm tài liệu đặc tả và kịch bản kiểm thử',
      },
    },
    {
      id: 'task_functional_testing',
      type: 'userTask',
      position: { x: 380, y: 220 },
      data: {
        label: 'Kiểm thử Chức năng & Nghiệp vụ 22 VTVL',
        description: 'Tổ chức kiểm thử người dùng (UAT) trên môi trường Staging, đối soát các kịch bản đánh giá KPI, Mẫu 01-05 và phân quyền PBAC',
        targetStatus: 'FUNCTIONAL_TESTING',
        assignments: [
          {
            unitScope: 'SAME_UNIT',
            roleCode: 'CHUYEN_VIEN',
            description: 'Tổ Kiểm thử UAT & Đại diện các phòng',
          },
        ],
        formSchema: JSON.stringify([
          { id: 'f1', name: 'testCasesPassedRate', label: 'Tỷ lệ Test Case thành công (%)', type: 'number', required: true },
          { id: 'f2', name: 'uatSignOff', label: 'Biên bản nghiệm thu UAT người dùng', type: 'file', required: true },
          { id: 'f3', name: 'functionalStatus', label: 'Kết quả kiểm thử nghiệp vụ', type: 'select', options: ['DAT_YEU_CAU', 'CON_LOI_NGHIEP_VU'], required: true },
        ]),
      },
    },
    {
      id: 'task_security_pentest',
      type: 'userTask',
      position: { x: 720, y: 220 },
      data: {
        label: 'Rà quét Lỗ hổng & Đánh giá ATTT Chuẩn Cấp độ 3',
        description: 'Đơn vị chuyên trách ATTT quét lỗ hổng OWASP, kiểm tra mã hóa CSDL Mức 3, rà soát mã nguồn tĩnh (SAST/DAST) và Pentest',
        targetStatus: 'SECURITY_TESTING',
        assignments: [
          {
            unitScope: 'SAME_UNIT',
            roleCode: 'CHUYEN_VIEN',
            description: 'Đơn vị Đánh giá ATTT độc lập',
          },
        ],
        formSchema: JSON.stringify([
          { id: 'f1', name: 'criticalVulnCount', label: 'Số lượng lỗ hổng Nghiêm trọng (Critical)', type: 'number', required: true, default: 0 },
          { id: 'f2', name: 'highVulnCount', label: 'Số lượng lỗ hổng Cao (High)', type: 'number', required: true, default: 0 },
          { id: 'f3', name: 'securityReportFile', label: 'Báo cáo đánh giá An toàn thông tin Cấp 3', type: 'file', required: true },
          { id: 'f4', name: 'pentestVerdict', label: 'Kết luận an toàn thông tin', type: 'select', options: ['DAT_TIEU_CHUAN_ATTT_CAP_3', 'KHONG_DAT_CON_LO_HONG_NGHIEM_TRONG'], required: true },
        ]),
      },
    },
    {
      id: 'gw_testing_results',
      type: 'exclusiveGateway',
      position: { x: 1040, y: 220 },
      data: {
        label: 'Đạt chuẩn Nghiệp vụ & ATTT Cấp độ 3?',
        description: 'Đạt chuẩn -> Trình Hội đồng nghiệm thu; Không đạt -> Yêu cầu khắc phục lỗ hổng',
      },
    },
    {
      id: 'task_remediation',
      type: 'userTask',
      position: { x: 1040, y: 380 },
      data: {
        label: 'Khắc phục Lỗ hổng & Sửa lỗi Phần mềm',
        description: 'Đơn vị phát triển tiến hành vá lỗi bảo mật, cập nhật bản vá và gửi lại yêu cầu tái kiểm thử',
        targetStatus: 'REMEDIATING',
        assignments: [
          {
            unitScope: 'SAME_UNIT',
            roleCode: 'CHUYEN_VIEN',
            description: 'Đội ngũ Kỹ thuật Phát triển phần mềm',
          },
        ],
        formSchema: JSON.stringify([
          { id: 'f1', name: 'remediationChangelog', label: 'Nhật ký các bản vá bảo mật và lỗi đã sửa', type: 'textarea', required: true },
          { id: 'f2', name: 'rescanRequested', label: 'Yêu cầu quét lại bảo mật', type: 'boolean', required: true },
        ]),
      },
    },
    {
      id: 'task_acceptance_board',
      type: 'userTask',
      position: { x: 1360, y: 120 },
      data: {
        label: 'Hội đồng Nghiệm thu Kỹ thuật thẩm định & Ký biên bản',
        description: 'Hội đồng họp xem xét báo cáo UAT, báo cáo ATTT và ký Biên bản nghiệm thu chính thức',
        targetStatus: 'BOARD_EVALUATING',
        assignments: [
          {
            unitScope: 'PARENT_UNIT',
            roleCode: 'LANH_DAO_BAN',
            description: 'Chủ tịch & Thành viên Hội đồng nghiệm thu',
          },
        ],
        formSchema: JSON.stringify([
          { id: 'f1', name: 'boardDecision', label: 'Quyết nghị của Hội đồng nghiệm thu', type: 'select', options: ['NGHIEM_THU_DU_DIEU_KIEN_PROD', 'KHONG_DONG_Y_NGHIEM_THU'], required: true },
          { id: 'f2', name: 'boardMinutesFile', label: 'Biên bản họp Hội đồng nghiệm thu', type: 'file', required: true },
        ]),
      },
    },
    {
      id: 'task_auto_deploy_prod',
      type: 'serviceTask',
      position: { x: 1680, y: 120 },
      data: {
        label: 'Tự động Kích hoạt Pipeline Triển khai Production',
        description: 'Kích hoạt CI/CD pipeline triển khai an toàn Blue-Green lên cụm máy chủ Production, sao lưu tự động và kiểm tra health check',
        integrationCode: 'DEVOPS_SERVICE',
        endpoint: '/api/v1/devops/deploy/production-release',
        method: 'POST',
      },
    },
    {
      id: 'end_system_commissioned',
      type: 'end',
      position: { x: 2000, y: 120 },
      data: {
        label: 'Nghiệm thu thành công & Đưa vào vận hành chính thức',
        description: 'Hệ thống đạt chuẩn ATTT Cấp độ 3 và vận hành chính thức phục vụ Ban Tổ chức Tỉnh ủy',
        targetStatus: 'COMMISSIONED_IN_PRODUCTION',
      },
    },
    {
      id: 'end_system_rejected',
      type: 'end',
      position: { x: 1360, y: 280 },
      data: {
        label: 'Từ chối nghiệm thu do không đạt tiêu chuẩn kỹ thuật',
        description: 'Hội đồng bác bỏ nghiệm thu, yêu cầu tái cấu trúc hoặc khắc phục triệt để',
        targetStatus: 'COMMISSIONING_REJECTED',
      },
    },
  ],
  edges: [
    {
      id: 'e_sys_start_func',
      source: 'start_system_testing',
      target: 'task_functional_testing',
      type: 'custom',
      label: 'Nộp bản phát hành thử nghiệm',
      action: 'SUBMIT_RELEASE',
    },
    {
      id: 'e_sys_func_sec',
      source: 'task_functional_testing',
      target: 'task_security_pentest',
      type: 'custom',
      label: 'UAT hoàn thành · Chuyển Pentest',
      action: 'PASS_UAT',
    },
    {
      id: 'e_sys_sec_gw',
      source: 'task_security_pentest',
      target: 'gw_testing_results',
      type: 'custom',
      label: 'Đối soát kết quả kiểm thử',
      action: 'CHECK_RESULTS',
    },
    {
      id: 'e_sys_gw_pass',
      source: 'gw_testing_results',
      target: 'task_acceptance_board',
      type: 'custom',
      label: 'Đạt chuẩn · Trình Hội đồng nghiệm thu',
      action: 'TESTING_PASSED',
      condition: 'variables.pentestVerdict === "DAT_TIEU_CHUAN_ATTT_CAP_3" && variables.criticalVulnCount === 0',
    },
    {
      id: 'e_sys_gw_fail',
      source: 'gw_testing_results',
      target: 'task_remediation',
      type: 'custom',
      label: 'Có lỗi bảo mật · Yêu cầu khắc phục',
      action: 'NEED_REMEDIATION',
      condition: 'variables.pentestVerdict !== "DAT_TIEU_CHUAN_ATTT_CAP_3" || variables.criticalVulnCount > 0',
    },
    {
      id: 'e_sys_rem_sec',
      source: 'task_remediation',
      target: 'task_security_pentest',
      type: 'custom',
      label: 'Đã vá lỗi · Quét lại bảo mật',
      action: 'RESCAN_SECURITY',
    },
    {
      id: 'e_sys_board_deploy',
      source: 'task_acceptance_board',
      target: 'task_auto_deploy_prod',
      type: 'custom',
      label: 'Hội đồng nghiệm thu thông qua',
      action: 'BOARD_PASSED',
      condition: 'variables.boardDecision === "NGHIEM_THU_DU_DIEU_KIEN_PROD"',
    },
    {
      id: 'e_sys_board_reject',
      source: 'task_acceptance_board',
      target: 'end_system_rejected',
      type: 'custom',
      label: 'Hội đồng bác bỏ nghiệm thu',
      action: 'BOARD_REJECTED',
      condition: 'variables.boardDecision !== "NGHIEM_THU_DU_DIEU_KIEN_PROD"',
    },
    {
      id: 'e_sys_deploy_end',
      source: 'task_auto_deploy_prod',
      target: 'end_system_commissioned',
      type: 'custom',
      label: 'Triển khai Production thành công',
      action: 'DEPLOYED_SUCCESS',
    },
  ],
};

// ============================================================================
// CANONICAL COMPILATION & VALIDATION UTILITIES
// ============================================================================

function compileGraphCanonical(graph: any) {
  const nodes = (graph?.nodes ?? []).map((n: any) => ({
    id: n.id,
    type: n.type,
    name: n.name ?? n.data?.label ?? '',
    code: n.code ?? n.id,
    assignments: n.assignments ?? n.data?.assignments ?? [],
    data: {
      label: n.data?.label,
      description: n.data?.description,
      targetStatus: n.data?.targetStatus,
      formSchema: n.data?.formSchema,
      integrationCode: n.data?.integrationCode,
      endpoint: n.data?.endpoint,
      method: n.data?.method,
    },
  }));

  const edges = (graph?.edges ?? []).map((e: any) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label ?? null,
    action: e.action ?? null,
    condition: e.condition ?? null,
    priority: e.priority ?? 0,
    data: {
      ...(e.data ?? {}),
      ...(e.label ? { label: e.label } : {}),
    },
  }));

  return {
    nodes,
    edges,
    compiledAt: new Date().toISOString(),
    schemaVersion: 1,
  };
}

function validateGraph(graph: any, name: string): void {
  const nodes = graph.nodes || [];
  const edges = graph.edges || [];

  const startNodes = nodes.filter((n: any) => n.type === 'start');
  const endNodes = nodes.filter((n: any) => n.type === 'end');

  if (startNodes.length !== 1) {
    throw new Error(`[${name}] Phải có đúng 1 start node (hiện tại: ${startNodes.length})`);
  }
  if (endNodes.length === 0) {
    throw new Error(`[${name}] Phải có ít nhất 1 end node (hiện tại: ${endNodes.length})`);
  }

  const nodeIds = new Set(nodes.map((n: any) => n.id));
  if (nodeIds.size !== nodes.length) {
    throw new Error(`[${name}] Trùng lặp node id trong graph!`);
  }

  // Reachability BFS
  const visited = new Set<string>([startNodes[0].id]);
  const queue = [startNodes[0].id];
  const adj = new Map<string, string[]>();
  for (const e of edges) {
    if (!nodeIds.has(e.source)) throw new Error(`[${name}] Edge ${e.id} có source không hợp lệ: ${e.source}`);
    if (!nodeIds.has(e.target)) throw new Error(`[${name}] Edge ${e.id} có target không hợp lệ: ${e.target}`);
    if (!adj.has(e.source)) adj.set(e.source, []);
    adj.get(e.source)!.push(e.target);
  }

  while (queue.length > 0) {
    const cur = queue.shift()!;
    for (const next of adj.get(cur) ?? []) {
      if (!visited.has(next)) {
        visited.add(next);
        queue.push(next);
      }
    }
  }

  for (const n of nodes) {
    if (!visited.has(n.id)) {
      throw new Error(`[${name}] Node '${n.id}' không thể đến từ start node!`);
    }
  }

  // Dead-end check (all non-end nodes must have outgoing edge)
  const outgoing = new Map<string, number>();
  for (const e of edges) {
    outgoing.set(e.source, (outgoing.get(e.source) || 0) + 1);
  }
  for (const n of nodes) {
    if (n.type !== 'end' && (outgoing.get(n.id) || 0) === 0) {
      throw new Error(`[${name}] Dead-end node '${n.id}' không có outgoing edge!`);
    }
  }
}

// ============================================================================
// MAIN SEED LOGIC
// ============================================================================

export async function seedBtctuWorkflow(prismaClient?: PrismaClient) {
  const prisma = prismaClient || createPrismaClient();

  try {
    // 1. Kiểm tra graph
    validateGraph(btctuTaskManagementGraph, 'WF_BTCTU_QUAN_LY_CONG_VIEC');
    validateGraph(btctuKpiEvaluationGraph, 'WF_BTCTU_DANH_GIA_KPI');
    validateGraph(btctuTaskExtensionGraph, 'WF_BTCTU_XIN_GIA_HAN_VIEC');
    validateGraph(btctuBvctnbVerificationGraph, 'WF_BTCTU_BVCTNB_XAC_MINH');
    validateGraph(btctuTccbAppointmentGraph, 'WF_BTCTU_TCCB_BO_NHIEM');
    validateGraph(btctuTcdDvBadgeGraph, 'WF_BTCTU_TCD_DV_HUY_HIEU_DANG');
    validateGraph(btctuSecurityIncidentGraph, 'WF_ATTT_XU_LY_SU_CO');
    validateGraph(btctuOffboardingSecurityGraph, 'WF_ATTT_THOI_VIEC_THU_HOI');
    validateGraph(btctuSystemTestingGraph, 'WF_ATTT_THU_NGHIEM_NGHIEM_THU');

    // 2. Upsert ProcessTypes cho BTCTU
    const processTypesData = [
      {
        code: 'BTCTU_TASK_MANAGEMENT',
        name: 'Quản lý công việc Ban Tổ chức Tỉnh ủy',
        description: 'Chu trình phân công, thực thi 22 VTVL và kiểm soát 3 mức lỗi theo Quy định 01-QĐ/BTCTU',
        ownerService: 'hrm-service',
        validTriggers: ['TASK_CREATED', 'TASK_ASSIGNED', 'TASK_DISPATCHED', 'ON_CREATE'],
        validActions: ['ASSIGN_START', 'DISPATCH_TO_DEPT', 'ASSIGN_OFFICER', 'SUBMIT_FOR_REVIEW', 'RETURN', 'SUBMIT_TO_BAN', 'BAN_REQUEST_REVIEW', 'BAN_APPROVE', 'BAN_CANCEL', 'REQUEST_EXTENSION', 'TRIGGER_EXTENSION_SUBFLOW', 'RESUME_AFTER_EXTENSION', 'ROUTE_P_TCCB', 'ROUTE_P_TCD_DV', 'ROUTE_P_BVCTNB', 'ROUTE_VAN_PHONG'],
        enforcementMode: 'ENFORCE',
        isActive: true,
      },
      {
        code: 'BTCTU_KPI_EVALUATION',
        name: 'Đánh giá, xếp loại KPI & Áp trần Ban Tổ chức Tỉnh ủy',
        description: 'Quy trình đánh giá xếp loại hằng quý tích hợp 05 Mẫu biểu và áp trần 20% Xuất sắc per Quy định 348-QĐ/BTCTW',
        ownerService: 'hrm-service',
        validTriggers: ['PERIOD_CLOSED', 'EVALUATION_INITIATED', 'SELF_EVALUATION_SUBMITTED'],
        validActions: ['INITIATE_PERIOD', 'SUBMIT_MAU_01', 'SUBMIT_MAU_02', 'SUBMIT_MAU_04', 'SUBMIT_MAU_03', 'CHECK_AUDIT', 'CAPS_APPLIED', 'COUNCIL_REVIEW', 'REQUEST_REWORK', 'COUNCIL_APPROVED', 'PUBLISH_RESULTS'],
        enforcementMode: 'ENFORCE',
        isActive: true,
      },
      {
        code: 'BTCTU_TASK_EXTENSION',
        name: 'Phê duyệt Xin gia hạn thời hạn công việc',
        description: 'Quy trình thẩm định và phê duyệt đề xuất xin gia hạn thời hạn hoàn thành công việc gửi trước 24h, bảo lưu điểm tiến độ SLA',
        ownerService: 'hrm-service',
        validTriggers: ['EXTENSION_REQUESTED', 'TASK_AT_RISK', 'DEADLINE_APPROACHING'],
        validActions: ['SUBMIT_REQUEST', 'SUBMIT_TO_LDP', 'CHECK_LDP', 'LDP_ENDORSE', 'LDP_REJECT', 'CHECK_LDB', 'LDB_APPROVE', 'LDB_REJECT', 'AUTO_EXTENDED'],
        enforcementMode: 'ENFORCE',
        isActive: true,
      },
      {
        code: 'BTCTU_BVCTNB_VERIFICATION',
        name: 'Thẩm tra, xác minh Tiêu chuẩn Chính trị Nội bộ',
        description: 'Quy trình thẩm tra lý lịch chính trị theo Quy định 348-QĐ/BTCTW, tra cứu CSDL Mật ATTT Cấp 3 và kết luận tiêu chuẩn chính trị',
        ownerService: 'hrm-service',
        validTriggers: ['POLITICAL_CHECK_REQUESTED', 'DOSSIER_SUBMITTED'],
        validActions: ['ASSIGN_START', 'ASSIGN_INVESTIGATOR', 'CHECK_DOSSIER', 'SKIP_FIELD', 'DO_FIELD_CHECK', 'COMPLETE_FIELD', 'SUBMIT_TO_LDP', 'SUBMIT_TO_BAN', 'BAN_APPROVE_CONCLUSION'],
        enforcementMode: 'ENFORCE',
        isActive: true,
      },
      {
        code: 'BTCTU_CADRE_APPOINTMENT',
        name: 'Bổ nhiệm, luân chuyển Cán bộ 5 bước',
        description: 'Quy trình 5 bước bổ nhiệm cán bộ diện Ban Thường vụ Tỉnh ủy quản lý, thẩm định Mẫu 2C và liên thông tiêu chuẩn chính trị',
        ownerService: 'hrm-service',
        validTriggers: ['APPOINTMENT_INITIATED', 'PLANNING_APPROVED'],
        validActions: ['INIT_APPOINTMENT', 'COMPLETE_STEP1', 'COMPLETE_STEP2', 'TRIGGER_BVCTNB_CHECK', 'COMPLETE_BVCTNB_CHECK', 'CHECK_DOSSIER', 'DOSSIER_QUALIFIED', 'DOSSIER_DISQUALIFIED', 'COMPLETE_STEP4', 'SUBMIT_TO_BTV', 'BTV_APPROVE'],
        enforcementMode: 'ENFORCE',
        isActive: true,
      },
      {
        code: 'BTCTU_PARTY_MEMBER_BADGE',
        name: 'Xét tặng Huy hiệu Đảng & Nghiệp vụ đảng viên',
        description: 'Quy trình xét tặng Huy hiệu Đảng định kỳ, tự động đối soát CSDL Đảng viên qua LGSP và ban hành Quyết định BTV Tỉnh ủy',
        ownerService: 'hrm-service',
        validTriggers: ['BADGE_CAMPAIGN_OPENED', 'PROPOSAL_RECEIVED'],
        validActions: ['SUBMIT_LIST', 'AUTO_VERIFIED', 'CHECK_ELIGIBILITY', 'BADGE_QUALIFIED', 'BADGE_REJECTED', 'SUBMIT_TO_BAN', 'SUBMIT_TO_BTV', 'SYNC_DATA', 'COMPLETED'],
        enforcementMode: 'ENFORCE',
        isActive: true,
      },
      {
        code: 'BTCTU_SECURITY_INCIDENT',
        name: 'Quản lý & Xử lý Sự cố An toàn Thông tin Cấp độ 3',
        description: 'Quy trình ứng cứu sự cố ATTT theo Nghị định 85/2016/NĐ-CP & Nghị định 63/2026/NĐ-CP, cô lập hệ thống, khắc phục và báo cáo VNCERT',
        ownerService: 'workflow-service',
        validTriggers: ['INCIDENT_DETECTED', 'SOC_ALERT', 'MANUAL_REPORT'],
        validActions: ['TRIAGE_START', 'CHECK_SEVERITY', 'SEVERITY_HIGH', 'SEVERITY_STANDARD', 'CONTAINMENT_DONE', 'SUBMIT_REPORT', 'INCIDENT_CLOSED'],
        enforcementMode: 'ENFORCE',
        isActive: true,
      },
      {
        code: 'BTCTU_OFFBOARDING_SECURITY',
        name: 'Thu hồi Tài nguyên & Phân quyền khi Thôi việc',
        description: 'Quy trình vô hiệu hóa quyền truy cập, thu hồi chứng thư số CA, máy tính trạm và dọn sạch dữ liệu khi cán bộ thôi việc theo Quy trình 7a',
        ownerService: 'workflow-service',
        validTriggers: ['OFFBOARDING_INITIATED', 'DECISION_ISSUED'],
        validActions: ['START_HANDOVER', 'SUBMIT_HANDOVER', 'CONFIRM_HANDOVER', 'AUTO_REVOKED', 'COMPLETE_OFFBOARDING'],
        enforcementMode: 'ENFORCE',
        isActive: true,
      },
      {
        code: 'BTCTU_SYSTEM_TESTING_COMMISSIONING',
        name: 'Thử nghiệm & Nghiệm thu Hệ thống CNTT Cấp độ 3',
        description: 'Quy trình UAT, rà quét lỗ hổng ATTT Cấp độ 3 và thẩm định Hội đồng nghiệm thu trước khi đưa ứng dụng lên Production theo Quy trình 7b',
        ownerService: 'workflow-service',
        validTriggers: ['RELEASE_CANDIDATE_SUBMITTED', 'COMMISSIONING_REQUESTED'],
        validActions: ['SUBMIT_RELEASE', 'PASS_UAT', 'CHECK_RESULTS', 'TESTING_PASSED', 'NEED_REMEDIATION', 'RESCAN_SECURITY', 'BOARD_PASSED', 'BOARD_REJECTED', 'DEPLOYED_SUCCESS'],
        enforcementMode: 'ENFORCE',
        isActive: true,
      },
    ];

    const typeMap: Record<string, any> = {};
    for (const pt of processTypesData) {
      const typeRecord = await (prisma as any).processType.upsert({
        where: { code: pt.code },
        update: {
          name: pt.name,
          description: pt.description,
          ownerService: pt.ownerService,
          validTriggers: pt.validTriggers,
          validActions: pt.validActions,
          enforcementMode: pt.enforcementMode,
          isActive: pt.isActive,
        },
        create: pt,
      });
      typeMap[pt.code] = typeRecord;
    }

    // 3. Upsert ProcessDefinitions & Versions
    const definitionsData = [
      {
        code: 'WF_BTCTU_QUAN_LY_CONG_VIEC',
        name: 'Quy trình Quản lý, Phân công & Phê duyệt Công việc (Ban Tổ chức Tỉnh ủy Đắk Lắk)',
        description: 'Quy trình toàn diện từ tiếp nhận chỉ đạo BTV Tỉnh ủy / Đăng ký Mẫu 01, phân luồng 04 phòng chuyên môn, thực thi 22 VTVL, kiểm soát 3 mức lỗi (-5%, -15%, -35%), phê duyệt Lãnh đạo Ban, ký số CA Chuyên dùng và tự động tính điểm KPI 4 thành tố.',
        organizationId: BTCTU_ORG_ID,
        ownerUnitCode: 'BTCTU_DAKLAK',
        createdBy: 'BTCTU_ADMIN',
        isActive: true,
        graph: btctuTaskManagementGraph,
      },
      {
        code: 'WF_BTCTU_DANH_GIA_KPI',
        name: 'Quy trình Đánh giá, Xếp loại KPI & Áp trần Khống chế (Ban Tổ chức Tỉnh ủy Đắk Lắk)',
        description: 'Quy trình đánh giá xếp loại hằng quý gồm 4 giai đoạn, tích hợp 05 Mẫu biểu hành chính (Mẫu 01 - 05), đối soát 08 nguồn CSDL, kiểm tra kỷ luật, áp trần 20% Xuất sắc per Quy định 348-QĐ/BTCTW và áp trần Người đứng đầu.',
        organizationId: BTCTU_ORG_ID,
        ownerUnitCode: 'BTCTU_DAKLAK',
        createdBy: 'BTCTU_ADMIN',
        isActive: true,
        graph: btctuKpiEvaluationGraph,
      },
      {
        code: 'WF_BTCTU_XIN_GIA_HAN_VIEC',
        name: 'Quy trình Phê duyệt Xin gia hạn Thời hạn Công việc (Ban Tổ chức Tỉnh ủy Đắk Lắk)',
        description: 'Quy trình giải quyết đề xuất gia hạn hoàn thành nhiệm vụ theo quy định (Chuyên viên gửi trước 24h, Lãnh đạo Phòng thẩm định lý do khách quan, Lãnh đạo Ban phê duyệt, tự động bảo lưu điểm tiến độ C% không bị trừ SLA).',
        organizationId: BTCTU_ORG_ID,
        ownerUnitCode: 'BTCTU_DAKLAK',
        createdBy: 'BTCTU_ADMIN',
        isActive: true,
        graph: btctuTaskExtensionGraph,
      },
      {
        code: 'WF_BTCTU_BVCTNB_XAC_MINH',
        name: 'Quy trình Thẩm tra, Xác minh Tiêu chuẩn Chính trị Nội bộ (Phòng BVCTNB)',
        description: 'Quy trình thẩm tra, xác minh lịch sử chính trị và chính trị hiện nay của cán bộ theo Quy định 348-QĐ/BTCTW; tra cứu CSDL An toàn thông tin Cấp độ 3; lập Báo cáo kết luận chính trị nội bộ trình Thường trực Tỉnh ủy.',
        organizationId: BTCTU_ORG_ID,
        ownerUnitCode: 'P_BVCTNB',
        createdBy: 'BTCTU_ADMIN',
        isActive: true,
        graph: btctuBvctnbVerificationGraph,
      },
      {
        code: 'WF_BTCTU_TCCB_BO_NHIEM',
        name: 'Quy trình Bổ nhiệm Cán bộ 5 bước (Phòng Tổ chức Cán bộ)',
        description: 'Quy trình bổ nhiệm, luân chuyển cán bộ diện Ban Thường vụ Tỉnh ủy quản lý theo quy định Trung ương gồm 5 bước chặt chẽ, trích xuất dữ liệu Hồ sơ 2C số hóa, đối soát tiêu chuẩn chính trị với Phòng BVCTNB và trình BTV Tỉnh ủy.',
        organizationId: BTCTU_ORG_ID,
        ownerUnitCode: 'P_TCCB',
        createdBy: 'BTCTU_ADMIN',
        isActive: true,
        graph: btctuTccbAppointmentGraph,
      },
      {
        code: 'WF_BTCTU_TCD_DV_HUY_HIEU_DANG',
        name: 'Quy trình Xét tặng Huy hiệu Đảng (Phòng Tổ chức Đảng - Đảng viên)',
        description: 'Quy trình tiếp nhận đề nghị, tự động đối soát CSDL Đảng viên qua LGSP, thẩm định hồ sơ, trình Lãnh đạo Ban và Ban Thường vụ Tỉnh ủy ban hành Quyết định trao tặng Huy hiệu Đảng định kỳ.',
        organizationId: BTCTU_ORG_ID,
        ownerUnitCode: 'P_TCD_DV',
        createdBy: 'BTCTU_ADMIN',
        isActive: true,
        graph: btctuTcdDvBadgeGraph,
      },
      {
        code: 'WF_ATTT_XU_LY_SU_CO',
        name: 'Quy trình Quản lý và Xử lý Sự cố An toàn Thông tin Cấp độ 3 (Văn phòng Ban)',
        description: 'Quy trình ứng cứu sự cố an toàn thông tin theo Nghị định 85/2016/NĐ-CP & Nghị định 63/2026/NĐ-CP; tiếp nhận cảnh báo SIEM, cô lập khẩn cấp, khắc phục mã độc, điều tra nguyên nhân và báo cáo Đội ứng cứu sự cố Tỉnh & VNCERT.',
        organizationId: BTCTU_ORG_ID,
        ownerUnitCode: 'VAN_PHONG',
        createdBy: 'BTCTU_ADMIN',
        isActive: true,
        graph: btctuSecurityIncidentGraph,
      },
      {
        code: 'WF_ATTT_THOI_VIEC_THU_HOI',
        name: 'Quy trình Thu hồi Tài nguyên & Phân quyền khi Cán bộ Thôi việc (Quy trình 7a)',
        description: 'Quy trình vô hiệu hóa quyền truy cập, thu hồi chứng thư số CA, máy tính, tài sản số và kiểm tra an toàn thông tin khi cán bộ chuyển công tác, nghỉ hưu hoặc thôi việc per Nghị định 63/2026/NĐ-CP.',
        organizationId: BTCTU_ORG_ID,
        ownerUnitCode: 'VAN_PHONG',
        createdBy: 'BTCTU_ADMIN',
        isActive: true,
        graph: btctuOffboardingSecurityGraph,
      },
      {
        code: 'WF_ATTT_THU_NGHIEM_NGHIEM_THU',
        name: 'Quy trình Thử nghiệm và Nghiệm thu Hệ thống CNTT Cấp độ 3 (Quy trình 7b)',
        description: 'Quy trình kiểm thử chức năng, rà quét an toàn thông tin theo chuẩn Cấp độ 3 (NĐ 85/2016/NĐ-CP & NĐ 63/2026/NĐ-CP) và họp Hội đồng nghiệm thu trước khi đưa ứng dụng lên Production.',
        organizationId: BTCTU_ORG_ID,
        ownerUnitCode: 'VAN_PHONG',
        createdBy: 'BTCTU_ADMIN',
        isActive: true,
        graph: btctuSystemTestingGraph,
      },
    ];

    const defMap: Record<string, any> = {};
    const versionMap: Record<string, any> = {};

    for (const def of definitionsData) {
      const compiled = compileGraphCanonical(def.graph);

      const defRecord = await (prisma as any).processDefinition.upsert({
        where: { code: def.code },
        update: {
          name: def.name,
          description: def.description,
          organizationId: def.organizationId,
          ownerUnitCode: def.ownerUnitCode,
          createdBy: def.createdBy,
          isActive: def.isActive,
        },
        create: {
          code: def.code,
          name: def.name,
          description: def.description,
          organizationId: def.organizationId,
          ownerUnitCode: def.ownerUnitCode,
          createdBy: def.createdBy,
          isActive: def.isActive,
        },
      });
      defMap[def.code] = defRecord;

      const verRecord = await (prisma as any).processVersion.upsert({
        where: {
          definitionId_version: {
            definitionId: defRecord.id,
            version: 1,
          },
        },
        update: {
          status: 'PUBLISHED',
          graph: def.graph,
          compiledGraph: compiled,
          validationErrors: [],
          publishedBy: 'BTCTU_ADMIN',
          publishedAt: new Date(),
        },
        create: {
          definitionId: defRecord.id,
          version: 1,
          status: 'PUBLISHED',
          graph: def.graph,
          compiledGraph: compiled,
          validationErrors: [],
          publishedBy: 'BTCTU_ADMIN',
          publishedAt: new Date(),
        },
      });
      versionMap[def.code] = verRecord;
    }

    // 4. Upsert ProcessBindings gắn với BTCTU_DAKLAK
    const bindingsConfig = [
      {
        processTypeCode: 'BTCTU_TASK_MANAGEMENT',
        definitionCode: 'WF_BTCTU_QUAN_LY_CONG_VIEC',
        trigger: 'TASK_CREATED',
        priority: 10,
      },
      {
        processTypeCode: 'BTCTU_KPI_EVALUATION',
        definitionCode: 'WF_BTCTU_DANH_GIA_KPI',
        trigger: 'PERIOD_CLOSED',
        priority: 10,
      },
      {
        processTypeCode: 'BTCTU_TASK_EXTENSION',
        definitionCode: 'WF_BTCTU_XIN_GIA_HAN_VIEC',
        trigger: 'EXTENSION_REQUESTED',
        priority: 10,
      },
      {
        processTypeCode: 'BTCTU_BVCTNB_VERIFICATION',
        definitionCode: 'WF_BTCTU_BVCTNB_XAC_MINH',
        trigger: 'POLITICAL_CHECK_REQUESTED',
        priority: 10,
      },
      {
        processTypeCode: 'BTCTU_CADRE_APPOINTMENT',
        definitionCode: 'WF_BTCTU_TCCB_BO_NHIEM',
        trigger: 'APPOINTMENT_INITIATED',
        priority: 10,
      },
      {
        processTypeCode: 'BTCTU_PARTY_MEMBER_BADGE',
        definitionCode: 'WF_BTCTU_TCD_DV_HUY_HIEU_DANG',
        trigger: 'BADGE_CAMPAIGN_OPENED',
        priority: 10,
      },
      {
        processTypeCode: 'BTCTU_SECURITY_INCIDENT',
        definitionCode: 'WF_ATTT_XU_LY_SU_CO',
        trigger: 'INCIDENT_DETECTED',
        priority: 10,
      },
      {
        processTypeCode: 'BTCTU_OFFBOARDING_SECURITY',
        definitionCode: 'WF_ATTT_THOI_VIEC_THU_HOI',
        trigger: 'OFFBOARDING_INITIATED',
        priority: 10,
      },
      {
        processTypeCode: 'BTCTU_SYSTEM_TESTING_COMMISSIONING',
        definitionCode: 'WF_ATTT_THU_NGHIEM_NGHIEM_THU',
        trigger: 'RELEASE_CANDIDATE_SUBMITTED',
        priority: 10,
      },
    ];

    for (const b of bindingsConfig) {
      const pType = typeMap[b.processTypeCode];
      const pDef = defMap[b.definitionCode];
      const pVer = versionMap[b.definitionCode];

      // Tìm binding đã tồn tại
      const existing = await (prisma as any).processBinding.findFirst({
        where: {
          processTypeId: pType.id,
          definitionId: pDef.id,
          organizationId: BTCTU_ORG_ID,
          trigger: b.trigger,
        },
      });

      if (existing) {
        await (prisma as any).processBinding.update({
          where: { id: existing.id },
          data: {
            pinnedVersionId: pVer.id,
            status: 'ACTIVE',
            priority: b.priority,
            approvedBy: 'BTCTU_ADMIN',
            approvedAt: new Date(),
            reason: 'Áp dụng quy trình chuẩn Ban Tổ chức Tỉnh ủy Đắk Lắk',
          },
        });
      } else {
        await (prisma as any).processBinding.create({
          data: {
            processTypeId: pType.id,
            definitionId: pDef.id,
            pinnedVersionId: pVer.id,
            organizationId: BTCTU_ORG_ID,
            trigger: b.trigger,
            status: 'ACTIVE',
            priority: b.priority,
            createdBy: 'BTCTU_ADMIN',
            approvedBy: 'BTCTU_ADMIN',
            approvedAt: new Date(),
            reason: 'Áp dụng quy trình chuẩn Ban Tổ chức Tỉnh ủy Đắk Lắk',
          },
        });
      }
    }

    // 5. Khởi tạo phiên chạy mẫu (ProcessInstance) cho BTCTU
    const sampleDef = defMap['WF_BTCTU_QUAN_LY_CONG_VIEC'];
    const sampleVer = versionMap['WF_BTCTU_QUAN_LY_CONG_VIEC'];
    const sampleBinding = await (prisma as any).processBinding.findFirst({
      where: {
        definitionId: sampleDef.id,
        organizationId: BTCTU_ORG_ID,
      },
    });

    const sampleBusinessKey = 'BTCTU-TASK-2026-DEMO-01';

    // Xóa sample instance cũ nếu có
    const existingInstance = await (prisma as any).processInstance.findFirst({
      where: { businessKey: sampleBusinessKey },
    });

    if (existingInstance) {
      await (prisma as any).workflowTask.deleteMany({ where: { instanceId: existingInstance.id } });
      await (prisma as any).workflowTransition.deleteMany({ where: { instanceId: existingInstance.id } });
      await (prisma as any).processInstance.delete({ where: { id: existingInstance.id } });
    }

    const instance = await (prisma as any).processInstance.create({
      data: {
        definitionId: sampleDef.id,
        versionId: sampleVer.id,
        bindingId: sampleBinding?.id,
        processType: 'BTCTU_TASK_MANAGEMENT',
        businessType: 'TASK',
        businessId: sampleBusinessKey,
        businessKey: sampleBusinessKey,
        organizationId: BTCTU_ORG_ID,
        status: 'IN_PROGRESS',
        currentNodeCode: 'task_officer_execute',
        startedBy: 'admin',
        variables: {
          taskTitle: 'Thẩm định hồ sơ bổ nhiệm cán bộ diện Ban Thường vụ Tỉnh ủy quản lý',
          assignedDept: 'P_TCCB',
          coordinatingDepts: ['P_BVCTNB'],
          priorityLevel: 'THUONG_KHAN',
          kFactor: 1.5,
          weightA: 30,
          weightB: 40,
          weightC: 20,
          weightD: 10,
          assigneeOfficerId: 'cv_tccb_01',
          domainWorkType: 'THAM_DINH_CAN_BO_2C',
        },
        stateVersion: 2,
      },
    });

    // Tạo workflow task cho Chuyên viên đang thụ lý
    await (prisma as any).workflowTask.create({
      data: {
        instanceId: instance.id,
        nodeCode: 'task_officer_execute',
        title: 'Thẩm định hồ sơ cán bộ, kiểm tra tiêu chuẩn chính trị & Lập Mẫu 2C',
        assigneeId: 'cv_tccb_01',
        assigneeUnit: 'P_TCCB',
        status: 'IN_PROGRESS',
      },
    });

    // Tạo transition mẫu từ giao việc -> thụ lý
    await (prisma as any).workflowTransition.create({
      data: {
        instanceId: instance.id,
        fromNodeCode: 'task_ldp_dispatch',
        toNodeCode: 'task_officer_execute',
        action: 'ASSIGN_OFFICER',
        performedBy: 'truongphong_tccb',
      },
    });

    return {
      success: true,
      definitionsCount: definitionsData.length,
      typesCount: processTypesData.length,
      sampleInstanceId: instance.id,
    };
  } finally {
    if (!prismaClient) {
      await prisma.$disconnect();
    }
  }
}

// Chạy trực tiếp nếu file được thực thi độc lập
if (require.main === module) {
  seedBtctuWorkflow()
    .then((res) => {
      process.exit(0);
    })
    .catch((err) => {
      console.error('Lỗi khi nạp quy trình BTCTU:', err);
      process.exit(1);
    });
}
