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
      position: { x: 1600, y: 270 },
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
      position: { x: 1900, y: 270 },
      data: {
        label: 'Kết luận Phê duyệt Ban?',
        description: 'Phê duyệt / Trình BTVTU -> Tự động tính KPI; Yêu cầu rà soát -> Trả về phòng; Đình chỉ -> Hủy',
      },
    },
    {
      id: 'task_auto_kpi',
      type: 'serviceTask',
      position: { x: 2200, y: 270 },
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
      position: { x: 2520, y: 270 },
      data: {
        label: 'Hoàn thành nhiệm vụ & Lưu trữ ATTT Cấp độ 3',
        description: 'Nhiệm vụ hoàn tất, chuyển trạng thái DONE, lưu vết hồ sơ điện tử an toàn',
        targetStatus: 'DONE',
      },
    },
    {
      id: 'end_rejected',
      type: 'end',
      position: { x: 1900, y: 70 },
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
      id: 'e_gw_ldp',
      source: 'gateway_dept_router',
      target: 'task_ldp_dispatch',
      type: 'custom',
      label: 'Tiếp nhận nhiệm vụ cấp phòng',
      action: 'ROUTED_TO_DEPT',
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
      label: 'Đạt chuẩn · Ký nháy trình Lãnh đạo Ban',
      action: 'SUBMIT_TO_BAN',
      condition: 'variables.reviewDecision === "DAT_YEU_CAU"',
    },
    {
      id: 'e_ldb_gw_eval',
      source: 'task_ldb_approve',
      target: 'gateway_ldp_check',
      type: 'custom',
      label: 'Xem xét & Phê duyệt Tờ trình',
      action: 'EVALUATE_DECISION',
    },
    {
      id: 'e_gwldb_rework',
      source: 'gateway_ldb_check',
      target: 'task_ldp_review',
      type: 'custom',
      sourceHandle: 'rework',
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
  viewport: { x: 0, y: 0, zoom: 0.8 },
  nodes: [
    {
      id: 'start_kpi_period',
      type: 'start',
      position: { x: 60, y: 150 },
      data: {
        label: 'Mở kỳ đánh giá KPI quý',
        description: 'Kích hoạt kỳ đánh giá định kỳ hằng quý tại Ban Tổ chức Tỉnh ủy',
      },
    },
    {
      id: 'task_mau01_dangky',
      type: 'userTask',
      position: { x: 60, y: 350 },
      data: {
        label: 'Đăng ký danh mục đầu kỳ (MẪU 01)',
        description: 'Công chức đăng ký khung danh mục sản phẩm, nhiệm vụ trọng tâm đầu kỳ theo Mẫu 01',
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
      },
    },
    {
      id: 'task_demote_unqualified',
      type: 'userTask',
      position: { x: 1650, y: 450 },
      data: {
        label: 'Hạ bậc bắt buộc: Không hoàn thành nhiệm vụ',
        description: 'Ấn định mức xếp loại Không hoàn thành nhiệm vụ theo quy định đối với cá nhân có sai phạm',
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
      },
    },
    {
      id: 'task_mau05_quyetdinh',
      type: 'userTask',
      position: { x: 2880, y: 240 },
      data: {
        label: 'Trưởng ban ký Quyết định phê duyệt (MẪU 05)',
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
      sourceHandle: 'rework',
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

    // 2. Upsert ProcessTypes cho BTCTU
    const processTypesData = [
      {
        code: 'BTCTU_TASK_MANAGEMENT',
        name: 'Quản lý công việc Ban Tổ chức Tỉnh ủy',
        description: 'Chu trình phân công, thực thi 22 VTVL và kiểm soát 3 mức lỗi theo Quy định 01-QĐ/BTCTU',
        ownerService: 'hrm-service',
        validTriggers: ['TASK_CREATED', 'TASK_ASSIGNED', 'TASK_DISPATCHED', 'ON_CREATE'],
        validActions: ['ASSIGN_START', 'DISPATCH_TO_DEPT', 'ASSIGN_OFFICER', 'SUBMIT_FOR_REVIEW', 'RETURN', 'SUBMIT_TO_BAN', 'BAN_REQUEST_REVIEW', 'BAN_APPROVE', 'BAN_CANCEL'],
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
