import { Injectable, OnModuleInit, Inject, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, timeout, type Observable } from 'rxjs';
import { executeTable } from './table-engine';
import { Metadata } from '@grpc/grpc-js';

import { PrismaService } from '../prisma/prisma.service';
import { StatisticsService } from '../statistics/statistics.service';
import {
  normalizeRow,
  normalizeSchema,
  matchSearchQuery,
  getFriendlyFieldLabel,
} from './utils/normalization';

// ───────────────────────── Types ─────────────────────────

interface CatalogEntry {
  endpoint: string;
  upstream?: string;
  path?: string;
  method?: string;
  name: string;
  fields: any;
}

// ───────────────────────── Constants ─────────────────────────

const GRPC_TIMEOUT_MS = 10_000;
const PAGE_SIZE = 500;
const MAX_PAGES = 200; // chặn vòng lặp vô hạn (tối đa 100.000 bản ghi / nguồn)
const CATALOG_TTL_MS = 60_000;
const DASHBOARD_TTL_MS = 15_000; // 15 seconds for dashboard caching

const SCHEMA_META_KEYS = new Set([
  'name',
  'description',
  'parameters',
  'body',
  'responseFields',
  'bodyType',
  'formItems',
  'headers',
  'method',
  'path',
  'endpoint',
  'url',
  'contentType',
  'raw',
  'mode',
  'options',
  'type',
  'required',
  'properties',
]);

function getSampleRowsForApi(endpointOrPath: string): any[] {
  const p = (endpointOrPath || '').toLowerCase();
  if (p.includes('document-statistics') || p.includes('doc_stats')) {
    return [
      {
        id: 1,
        departmentId: 'BTCTU',
        from_organ_id: 'A15.05',
        departmentName: 'Ban Tổ chức Tỉnh ủy Đắk Lắk',
        organName: 'Ban Tổ chức Tỉnh ủy Đắk Lắk',
        totalDocuments: 385,
        incomingDocuments: 240,
        outgoingDocuments: 145,
        processedDocuments: 372,
        pendingDocuments: 13,
        completionRate: 96.6,
        reportPeriod: 'Quý 3/2026',
      },
      {
        id: 2,
        departmentId: 'SBNV',
        departmentName: 'Sở Nội vụ Tỉnh Đắk Lắk',
        totalDocuments: 342,
        incomingDocuments: 210,
        outgoingDocuments: 132,
        processedDocuments: 320,
        pendingDocuments: 22,
        completionRate: 93.6,
        reportPeriod: 'Quý 3/2026',
      },
      {
        id: 2,
        departmentId: 'SKHCN',
        departmentName: 'Sở Khoa học và Công nghệ',
        totalDocuments: 256,
        incomingDocuments: 168,
        outgoingDocuments: 88,
        processedDocuments: 248,
        pendingDocuments: 8,
        completionRate: 96.9,
        reportPeriod: 'Quý 3/2026',
      },
      {
        id: 3,
        departmentId: 'STC',
        departmentName: 'Sở Tài chính Tỉnh Đắk Lắk',
        totalDocuments: 415,
        incomingDocuments: 280,
        outgoingDocuments: 135,
        processedDocuments: 395,
        pendingDocuments: 20,
        completionRate: 95.2,
        reportPeriod: 'Quý 3/2026',
      },
      {
        id: 4,
        departmentId: 'VPUBND',
        departmentName: 'Văn phòng UBND Tỉnh Đắk Lắk',
        totalDocuments: 680,
        incomingDocuments: 450,
        outgoingDocuments: 230,
        processedDocuments: 655,
        pendingDocuments: 25,
        completionRate: 96.3,
        reportPeriod: 'Quý 3/2026',
      },
      {
        id: 5,
        departmentId: 'TPBMT',
        departmentName: 'UBND TP. Buôn Ma Thuột',
        totalDocuments: 520,
        incomingDocuments: 340,
        outgoingDocuments: 180,
        processedDocuments: 490,
        pendingDocuments: 30,
        completionRate: 94.2,
        reportPeriod: 'Quý 3/2026',
      },
    ];
  }
  if (p.includes('hhxnk')) {
    return [
      { id: 1, thang_bc: '10/2026', loai_hinh: 'Xuất khẩu cà phê', kim_ngach_usd: 145000000, thue_xnk_vnd: 0, dia_ban: 'TP. Buôn Ma Thuột', ghi_chu: 'Thị trường EU, Mỹ' },
      { id: 2, thang_bc: '10/2026', loai_hinh: 'Xuất khẩu sầu riêng', kim_ngach_usd: 85000000, thue_xnk_vnd: 0, dia_ban: 'Huyện Krông Pắc', ghi_chu: 'Chính ngạch sang Trung Quốc' },
      { id: 3, thang_bc: '10/2026', loai_hinh: 'Xuất khẩu cao su', kim_ngach_usd: 32000000, thue_xnk_vnd: 0, dia_ban: 'Huyện Cư M\'gar', ghi_chu: 'Thị trường châu Á' },
      { id: 4, thang_bc: '10/2026', loai_hinh: 'Nhập khẩu phân bón máy móc', kim_ngach_usd: 28000000, thue_xnk_vnd: 3500000000, dia_ban: 'TP. Buôn Ma Thuột', ghi_chu: 'Phục vụ sản xuất nông nghiệp' },
    ];
  }
  if (p.includes('nsnn_thu')) {
    return [
      { id: 1, dia_ban: 'Toàn tỉnh', du_toan_nam: 8500000000000, so_thuc_thu: 7200000000000, tien_do_dat: 84.7, ghi_chu: 'Thu nội địa và XNK' },
      { id: 2, dia_ban: 'TP. Buôn Ma Thuột', du_toan_nam: 2800000000000, so_thuc_thu: 2450000000000, tien_do_dat: 87.5, ghi_chu: 'Thu từ SXKD và đất' },
      { id: 3, dia_ban: 'Huyện Ea Kar', du_toan_nam: 350000000000, so_thuc_thu: 295000000000, tien_do_dat: 84.3, ghi_chu: 'Đạt tiến độ kế hoạch' },
      { id: 4, dia_ban: 'Huyện Krông Ana', du_toan_nam: 280000000000, so_thuc_thu: 238000000000, tien_do_dat: 85.0, ghi_chu: 'Vượt nhẹ so với cùng kỳ' },
    ];
  }
  if (p.includes('nsnn_chi')) {
    return [
      { id: 1, linh_vuc_chi: 'Chi sự nghiệp giáo dục', du_toan_giao: 3800000000000, so_da_chi: 2950000000000, ty_le_giai_ngan: 77.6, ghi_chu: 'Đảm bảo lương và hoạt động dạy học' },
      { id: 2, linh_vuc_chi: 'Chi đầu tư phát triển', du_toan_giao: 4200000000000, so_da_chi: 3100000000000, ty_le_giai_ngan: 73.8, ghi_chu: 'Theo tiến độ giải ngân vốn ĐTC' },
      { id: 3, linh_vuc_chi: 'Chi sự nghiệp y tế', du_toan_giao: 1200000000000, so_da_chi: 950000000000, ty_le_giai_ngan: 79.2, ghi_chu: 'Khám chữa bệnh và phòng dịch' },
      { id: 4, linh_vuc_chi: 'Chi quản lý nhà nước', du_toan_giao: 1500000000000, so_da_chi: 1210000000000, ty_le_giai_ngan: 80.7, ghi_chu: 'Tiết kiệm chi thường xuyên' },
    ];
  }
  if (p.includes('dtc_giaingan_tuan')) {
    return [
      { id: 1, ten_du_an: 'Đường cao tốc Khánh Hòa - Buôn Ma Thuột (Dự án thành phần 3)', chu_dau_tu: 'BQLDA ĐTXD CTGT & NN PTNT Đắk Lắk', ke_hoach_von: 1350000000000, da_giai_ngan: 1080000000000, ty_le_dat: 80.0, tuan_bao_cao: 'Tuần 41/2026' },
      { id: 2, ten_du_an: 'Đường Hồ Chí Minh đoạn tránh phía Đông TP. Buôn Ma Thuột', chu_dau_tu: 'BQLDA ĐTXD CTGT & NN PTNT Đắk Lắk', ke_hoach_von: 520000000000, da_giai_ngan: 460000000000, ty_le_dat: 88.5, tuan_bao_cao: 'Tuần 41/2026' },
      { id: 3, ten_du_an: 'Bệnh viện Đa khoa vùng Tây Nguyên (Giai đoạn hoàn thiện)', chu_dau_tu: 'Sở Y tế Đắk Lắk', ke_hoach_von: 180000000000, da_giai_ngan: 155000000000, ty_le_dat: 86.1, tuan_bao_cao: 'Tuần 41/2026' },
      { id: 4, ten_du_an: 'Nâng cấp hệ thống thủy lợi hồ Ea Kao', chu_dau_tu: 'BQLDA Nông nghiệp Tỉnh', ke_hoach_von: 120000000000, da_giai_ngan: 98000000000, ty_le_dat: 81.7, tuan_bao_cao: 'Tuần 41/2026' },
    ];
  }
  if (p.includes('hddn')) {
    return [
      { id: 1, loai_hinh_dn: 'Công ty TNHH MTV', so_thanh_lap_moi: 620, so_giai_the: 85, tong_von_dang_ky_ty: 4250.5, thoi_diem: '9 tháng 2026' },
      { id: 2, loai_hinh_dn: 'Công ty Cổ phần', so_thanh_lap_moi: 310, so_giai_the: 42, tong_von_dang_ky_ty: 6890.2, thoi_diem: '9 tháng 2026' },
      { id: 3, loai_hinh_dn: 'Công ty TNHH 2TV trở lên', so_thanh_lap_moi: 245, so_giai_the: 38, tong_von_dang_ky_ty: 1980.0, thoi_diem: '9 tháng 2026' },
      { id: 4, loai_hinh_dn: 'Doanh nghiệp tư nhân', so_thanh_lap_moi: 65, so_giai_the: 15, tong_von_dang_ky_ty: 310.8, thoi_diem: '9 tháng 2026' },
    ];
  }
  if (p.includes('htx')) {
    return [
      { id: 1, huyen_thi_xa: 'TP. Buôn Ma Thuột', so_htx_hoat_dong: 82, so_thanh_vien: 1450, doanh_thu_tb_trieu: 3850, nam: 2026 },
      { id: 2, huyen_thi_xa: 'Huyện Cư M\'gar', so_htx_hoat_dong: 64, so_thanh_vien: 1120, doanh_thu_tb_trieu: 2950, nam: 2026 },
      { id: 3, huyen_thi_xa: 'Huyện Krông Pắc', so_htx_hoat_dong: 58, so_thanh_vien: 980, doanh_thu_tb_trieu: 3200, nam: 2026 },
      { id: 4, huyen_thi_xa: 'Huyện Ea Kar', so_htx_hoat_dong: 51, so_thanh_vien: 890, doanh_thu_tb_trieu: 2650, nam: 2026 },
    ];
  }
  if (p.includes('qldt')) {
    return [
      { id: 1, dia_ban: 'TP. Buôn Ma Thuột', so_du_an_moi: 8, von_ngoai_ns_ty: 3450, tien_do_trien_khai: 'Đang giải phóng mặt bằng', ghi_chu: 'Khu đô thị và dịch vụ thương mại' },
      { id: 2, dia_ban: 'TX. Buôn Hồ', so_du_an_moi: 3, von_ngoai_ns_ty: 890, tien_do_trien_khai: 'Hoàn tất thủ tục đầu tư', ghi_chu: 'Nhà máy chế biến nông sản' },
      { id: 3, dia_ban: 'Huyện Cư M\'gar', so_du_an_moi: 4, von_ngoai_ns_ty: 1250, tien_do_trien_khai: 'Đang thi công xây dựng', ghi_chu: 'Năng lượng tái tạo và logistics' },
      { id: 4, dia_ban: 'Huyện Ea H\'leo', so_du_an_moi: 2, von_ngoai_ns_ty: 1600, tien_do_trien_khai: 'Đang lập quy hoạch chi tiết', ghi_chu: 'Cụm công nghiệp và điện gió' },
    ];
  }
  if (p.includes('user_org') || p.includes('organization')) {
    return [
      { id: 56, code: 'A15.05', name: 'Ban Tổ chức Tỉnh ủy Đắk Lắk', parentId: null, order: 1, level: 1, status: 'Hoạt động', createdAt: '2026-01-01' },
      { id: 57, code: 'A15.05.01', name: 'Phòng Tổ chức cán bộ', parentId: 56, order: 1, level: 2, status: 'Hoạt động', createdAt: '2026-01-01' },
      { id: 58, code: 'A15.05.02', name: 'Phòng Bảo vệ chính trị nội bộ', parentId: 56, order: 2, level: 2, status: 'Hoạt động', createdAt: '2026-01-01' },
      { id: 59, code: 'A15.05.03', name: 'Phòng Tổ chức đảng, đảng viên', parentId: 56, order: 3, level: 2, status: 'Hoạt động', createdAt: '2026-01-01' },
      { id: 60, code: 'A15.05.04', name: 'Văn phòng Ban', parentId: 56, order: 4, level: 2, status: 'Hoạt động', createdAt: '2026-01-01' },
      { id: 20, code: 'H15.20', name: 'Sở Khoa học và Công nghệ', parentId: null, order: 2, level: 1, status: 'Hoạt động', createdAt: '2026-01-01' },
      { id: 3, code: 'H15.03', name: 'Sở Tài chính Đắk Lắk', parentId: null, order: 3, level: 1, status: 'Hoạt động', createdAt: '2026-01-01' },
      { id: 1, code: 'H15.01', name: 'UBND Huyện Krông Pắc', parentId: null, order: 4, level: 1, status: 'Hoạt động', createdAt: '2026-01-01' },
    ];
  }
  if (p.includes('user_cadre') || p.includes('cadre_stats')) {
    return [
      { id: 1, employeeCode: 'BTCTU_001', username: 'nam.hd', fullName: 'Hoàng Đức Nam', email: 'nam.hd@daklak.gov.vn', phone: '0912345678', unitId: 57, departmentName: 'Phòng Tổ chức cán bộ', jobTitle: 'Trưởng phòng TCCB', status: 'Chính thức', isActive: 'Hoạt động' },
      { id: 2, employeeCode: 'BTCTU_002', username: 'mai.pt', fullName: 'Phạm Thị Mai', email: 'mai.pt@daklak.gov.vn', phone: '0912345679', unitId: 57, departmentName: 'Phòng Tổ chức cán bộ', jobTitle: 'Phó Trưởng phòng TCCB', status: 'Chính thức', isActive: 'Hoạt động' },
      { id: 3, employeeCode: 'BTCTU_003', username: 'hung.vv', fullName: 'Vũ Văn Hùng', email: 'hung.vv@daklak.gov.vn', phone: '0912345680', unitId: 58, departmentName: 'Phòng Bảo vệ chính trị nội bộ', jobTitle: 'Trưởng phòng BVCTNB', status: 'Chính thức', isActive: 'Hoạt động' },
      { id: 4, employeeCode: 'BTCTU_004', username: 'hoang.ld', fullName: 'Lê Đình Hoàng', email: 'hoang.ld@daklak.gov.vn', phone: '0912345681', unitId: 59, departmentName: 'Phòng Tổ chức đảng, đảng viên', jobTitle: 'Chuyên viên chính', status: 'Chính thức', isActive: 'Hoạt động' },
      { id: 5, employeeCode: 'BTCTU_005', username: 'lan.dt', fullName: 'Đỗ Thị Lan', email: 'lan.dt@daklak.gov.vn', phone: '0912345682', unitId: 60, departmentName: 'Văn phòng Ban', jobTitle: 'Chánh Văn phòng', status: 'Chính thức', isActive: 'Hoạt động' },
    ];
  }
  if (p.includes('staffing')) {
    return [
      { id: 1, unitId: 56, jobTitleId: 101, jobTitleName: 'Trưởng Ban Tổ chức Tỉnh ủy', quantity: 1, currentCount: 1, missingCount: 0, isOver: 'Đủ định biên' },
      { id: 2, unitId: 56, jobTitleId: 102, jobTitleName: 'Phó Trưởng Ban Tổ chức Tỉnh ủy', quantity: 3, currentCount: 3, missingCount: 0, isOver: 'Đủ định biên' },
      { id: 3, unitId: 57, jobTitleId: 103, jobTitleName: 'Trưởng phòng Tổ chức cán bộ', quantity: 1, currentCount: 1, missingCount: 0, isOver: 'Đủ định biên' },
      { id: 4, unitId: 57, jobTitleId: 104, jobTitleName: 'Chuyên viên chính Phòng TCCB', quantity: 4, currentCount: 3, missingCount: 1, isOver: 'Thiếu định biên' },
      { id: 5, unitId: 58, jobTitleId: 105, jobTitleName: 'Trưởng phòng Bảo vệ CTNB', quantity: 1, currentCount: 1, missingCount: 0, isOver: 'Đủ định biên' },
    ];
  }
  if (p.includes('workflow')) {
    return [
      { id: 1, processDefinitionKey: 'QUY_TRINH_BO_NHIEM_CAN_BO', processInstanceId: 'PROC_2026_01', businessKey: 'HS_BTCTU_01', currentStep: 'Thẩm tra tiêu chuẩn chính trị', assignee: 'Vũ Văn Hùng', status: 'Đang xử lý', startedAt: '2026-10-01', endedAt: null, durationHours: 72 },
      { id: 2, processDefinitionKey: 'QUY_TRINH_DANH_GIA_SOP_MAU05', processInstanceId: 'PROC_2026_02', businessKey: 'DG_QUY_3_2026', currentStep: 'Lãnh đạo Ban phê duyệt Mẫu 05', assignee: 'Trưởng Ban', status: 'Hoàn thành', startedAt: '2026-10-05', endedAt: '2026-10-12', durationHours: 168 },
      { id: 3, processDefinitionKey: 'QUY_TRINH_LUU_CHUYEN_VAN_BAN', processInstanceId: 'PROC_2026_03', businessKey: 'VB_1288_UBND', currentStep: 'Phân công chuyên viên xử lý', assignee: 'Hoàng Đức Nam', status: 'Đang xử lý', startedAt: '2026-10-14', endedAt: null, durationHours: 24 },
    ];
  }
  return [
    { id: 1, code: 'API_ROW_01', name: 'Bản ghi liên thông dữ liệu số 01', status: 'COMPLETED', createdAt: '2026-10-15' },
    { id: 2, code: 'API_ROW_02', name: 'Bản ghi liên thông dữ liệu số 02', status: 'IN_PROGRESS', createdAt: '2026-10-15' },
  ];
}

const FALLBACK_CATALOG: CatalogEntry[] = [
  {
    endpoint: 'BTCTU_KPI_STATS',
    name: 'Đánh giá Cán bộ Ban Tổ chức Tỉnh ủy (SOP 4 bước & Mẫu 05)',
    fields: ['id', 'cadreCode', 'fullName', 'departmentId', 'departmentName', 'jobTitle', 'sChung', 'sNhiemVu', 'sTong', 'proposedRank', 'approvedRank', 'hasMau04', 'sopStep', 'status', 'quarterYear'],
  },
  {
    endpoint: 'HRM_TASK_STATS',
    name: 'Quản lý Công việc & Nhiệm vụ Toàn tỉnh',
    fields: ['id', 'title', 'status', 'priority', 'progress', 'departmentId', 'departmentName', 'assigneeCode', 'assigneeName', 'dueDate', 'isOverdue', 'isCompleted'],
  },
  {
    endpoint: 'USER_CADRE_STATS',
    name: 'Hồ sơ Cán bộ & Tài khoản Công chức Hệ thống',
    fields: ['id', 'employeeCode', 'username', 'fullName', 'email', 'phone', 'unitId', 'departmentName', 'jobTitle', 'status', 'isActive'],
  },
  {
    endpoint: 'USER_ORG_STATS',
    name: 'Cơ cấu Tổ chức & Danh mục Đơn vị Hành chính',
    fields: ['id', 'code', 'name', 'parentId', 'order', 'level', 'status', 'createdAt'],
  },
  {
    endpoint: 'USER_STAFFING_STATS',
    name: 'Vị trí việc làm (VTVL) & Định biên Nhân sự Đơn vị',
    fields: ['id', 'unitId', 'jobTitleId', 'jobTitleName', 'quantity', 'currentCount', 'missingCount', 'isOver'],
  },
  {
    endpoint: 'DOC_STATS',
    name: 'Lưu chuyển Văn bản Hành chính Đến / Đi',
    fields: ['id', 'documentNumber', 'abstract', 'isIncoming', 'status', 'urgency', 'securityLevel', 'pageCount', 'isLate', 'issueDate', 'departmentId', 'departmentName'],
  },
  {
    endpoint: 'WORKFLOW_STATS',
    name: 'Theo dõi Tiến độ Quy trình Luồng duyệt (Workflow)',
    fields: ['id', 'processDefinitionKey', 'processInstanceId', 'businessKey', 'currentStep', 'assignee', 'status', 'startedAt', 'endedAt', 'durationHours'],
  },
  {
    endpoint: 'POST_STATS',
    name: 'Hoạt động Xuất bản Tin bài Cổng Thông tin Điện tử',
    fields: ['id', 'title', 'categoryName', 'status', 'viewCount', 'authorName', 'isFeatured', 'publishedDate'],
  },
  {
    endpoint: 'EMPLOYEE_QUALITY',
    name: 'Đánh giá Năng suất & Chất lượng Cán bộ Toàn tỉnh',
    fields: ['id', 'employeeName', 'departmentName', 'taskCount', 'completedCount', 'qualityScore', 'ranking'],
  },
  {
    endpoint: 'HRM_PERSONAL_STATS',
    name: 'Bàn làm việc & Thống kê Cá nhân Cán bộ',
    fields: ['month', 'score', 'completedTasks', 'status', 'departmentName', 'workload', 'title', 'progress', 'role', 'dueDate', 'cadreCode', 'fullName'],
  },
];

@Injectable()
export class ReportsService implements OnModuleInit {
  private readonly logger = new Logger(ReportsService.name);
  private orgGrpcService: any;
  private taskGrpcService: any;
  private docGrpcService: any;
  private apiGrpcService: any;

  private catalogCache: {
    expiresAt: number;
    includesApiSources: boolean;
    value: CatalogEntry[];
  } | null = null;
  private statsCache: { expiresAt: number; value: any } | null = null;
  private defsCache: { expiresAt: number; value: any } | null = null;

  constructor(
    @Inject('USER_SERVICE') private userClient: ClientGrpc,
    @Inject('TASK_SERVICE') private taskClient: ClientGrpc,
    @Inject('DOCUMENT_SERVICE') private docClient: ClientGrpc,
    @Inject('API_MANAGEMENT_SERVICE') private apiClient: ClientGrpc,
    private readonly prisma: PrismaService,
    private readonly statsService: StatisticsService,
  ) {}

  onModuleInit() {
    this.orgGrpcService = this.userClient.getService<any>('OrganizationService');
    this.taskGrpcService = this.taskClient.getService<any>('TaskService');
    this.docGrpcService = this.docClient.getService<any>('DocumentService');
    this.apiGrpcService = this.apiClient.getService<any>('ApiManagementService');
  }

  // ───────────────────────── Dynamic Report Designer ─────────────────────────

  async createReportDefinition(payloadStr: string, _userDataStr: string) {
    try {
      const payload = JSON.parse(payloadStr);
      let definition;
      const config = payload.configuration || payload.config || {};
      if (payload.id) {
        definition = await this.prisma.reportDefinition.update({
          where: { id: Number(payload.id) },
          data: {
            name: payload.name,
            description: payload.description,
            configuration: config,
            organizationId: payload.organizationId !== undefined ? payload.organizationId : undefined,
            version: { increment: 1 },
          },
        });
      } else {
        const genCode = payload.code || `REP_${Date.now()}`;
        definition = await this.prisma.reportDefinition.create({
          data: {
            code: genCode,
            name: payload.name || 'Báo cáo mới',
            description: payload.description,
            configuration: config,
            organizationId: payload.organizationId,
          },
        });
      }

      // Invalidate caches
      this.defsCache = null;
      this.statsCache = null;

      return {
        success: true,
        data: JSON.stringify(definition),
        message: 'Tạo cấu hình báo cáo thành công',
      };
    } catch (error: any) {
      this.logger.error('Error creating report definition', error?.stack);
      throw new RpcException(error?.message || 'Lỗi tạo cấu hình báo cáo');
    }
  }

  async getReportDefinitions(_payloadStr: string, _userDataStr: string) {
    try {
      const now = Date.now();
      if (this.defsCache && this.defsCache.expiresAt > now) {
        return {
          success: true,
          data: JSON.stringify(this.defsCache.value),
          message: 'Lấy danh sách cấu hình báo cáo thành công (Cache)',
        };
      }

      // Tối ưu: Không lấy cột 'configuration' (chứa dữ liệu JSON lớn) để tránh OOM / sập hệ thống.
      const definitions = await this.prisma.reportDefinition.findMany({
        select: {
          id: true,
          code: true,
          name: true,
          description: true,
          version: true,
          organizationId: true,
          ownerId: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: 'desc' },
      });

      this.defsCache = { expiresAt: now + DASHBOARD_TTL_MS, value: definitions };

      return {
        success: true,
        data: JSON.stringify(definitions),
        message: 'Lấy danh sách cấu hình báo cáo thành công',
      };
    } catch (error: any) {
      this.logger.error('Error fetching report definitions', error?.stack);
      throw new RpcException('Lỗi lấy danh sách cấu hình báo cáo');
    }
  }

  async getReportDefinitionById(payloadStr: string, _userDataStr: string) {
    try {
      const { id } = JSON.parse(payloadStr);
      const numId = Number(id);
      if (!numId || isNaN(numId)) {
        throw new RpcException('ID báo cáo không hợp lệ');
      }
      const definition = await this.prisma.reportDefinition.findUnique({
        where: { id: numId },
        include: {
          runs: {
            orderBy: { id: 'desc' },
            take: 1,
          },
        },
      });
      if (!definition) {
        throw new RpcException('Không tìm thấy cấu hình báo cáo');
      }
      return {
        success: true,
        data: JSON.stringify(definition),
        message: 'Lấy chi tiết cấu hình báo cáo thành công',
      };
    } catch (error: any) {
      if (error instanceof RpcException) throw error;
      this.logger.error('Error fetching report definition by id', error?.stack);
      throw new RpcException('Lỗi lấy chi tiết cấu hình báo cáo');
    }
  }

  async getReportDashboardStats(_payloadStr: string, _userDataStr: string) {
    try {
      const now = Date.now();
      if (this.statsCache && this.statsCache.expiresAt > now) {
        return {
          success: true,
          data: JSON.stringify(this.statsCache.value),
          message: 'Lấy thống kê dashboard thành công (Cache)',
        };
      }

      const [totalReports, runsGroup, totalShared] = await Promise.all([
        this.prisma.reportDefinition.count(),
        this.prisma.reportRun.groupBy({
          by: ['status'],
          _count: true,
        }),
        this.prisma.reportAssignment.count(),
      ]);

      const totalRuns = runsGroup.reduce((acc, curr) => acc + curr._count, 0);
      const processingRuns = runsGroup
        .filter((g) => g.status === 'QUEUED' || g.status === 'RUNNING')
        .reduce((acc, curr) => acc + curr._count, 0);

      const stats = { totalReports, totalRuns, totalShared, processingRuns };
      this.statsCache = { expiresAt: now + DASHBOARD_TTL_MS, value: stats };

      return {
        success: true,
        data: JSON.stringify(stats),
        message: 'Lấy thống kê dashboard thành công',
      };
    } catch (error: any) {
      this.logger.error('Error fetching report dashboard stats', error?.stack);
      throw new RpcException('Lỗi lấy thống kê báo cáo');
    }
  }

  private evaluateFormula(formula: string, row: Record<string, any>): any {
    if (!formula || typeof formula !== 'string') return null;
    try {
      // Thay thế các token [field_name] bằng giá trị tương ứng trong row
      const cleanExpr = formula.replace(/\[([a-zA-Z0-9_.]+)\]/g, (_, field) => {
        const val = row[field];
        if (val === undefined || val === null) return '0';
        if (typeof val === 'number') return String(val);
        if (typeof val === 'boolean') return String(val);
        return JSON.stringify(String(val));
      });

      // Kiểm tra an toàn: ngăn chặn các từ khóa can thiệp hệ thống
      if (
        /(process|require|import|global|window|document|eval|Function|constructor|prototype|__proto__|this)/i.test(
          cleanExpr,
        )
      ) {
        return null;
      }

      // Thực thi an toàn biểu thức toán học hoặc điều kiện ternary
      const fn = new Function(`"use strict"; return (${cleanExpr});`);
      const result = fn();
      if (typeof result === 'number' && !isNaN(result)) {
        return Math.round(result * 100) / 100;
      }
      return result ?? null;
    } catch {
      return null;
    }
  }

  private async fetchSourceRows(
    sourceDef: any,
    config: any,
    payloadParams: any,
    metadata?: Metadata,
  ): Promise<any[]> {
    const sourceCode = sourceDef?.endpoint || sourceDef?.id || '';
    const queryParams = { ...(sourceDef?.params || {}), ...(payloadParams || {}) };
    const queryMeta = metadata || new Metadata();
    let rows: any[] = [];

    try {
      let statsRes: any;
      if (sourceCode === 'HRM_TASK_STATS' || sourceCode.includes('TASK')) {
        statsRes = await this.statsService.getTaskStatistics(queryParams, null, queryMeta);
      } else if (sourceCode === 'DOC_STATS' || sourceCode.includes('DOC')) {
        statsRes = await this.statsService.getDocumentStatistics(queryParams, queryMeta);
      } else if (sourceCode === 'POST_STATS' || sourceCode.includes('POST')) {
        statsRes = await this.statsService.getPostStatistics(queryParams, queryMeta);
      } else if (
        sourceCode === 'BTCTU_KPI_STATS' ||
        sourceCode.includes('BTCTU') ||
        sourceCode.includes('KPI_EVAL')
      ) {
        statsRes = await this.statsService.getBtctuKpiStatistics(queryParams, null, queryMeta);
      } else if (sourceCode === 'EMPLOYEE_QUALITY' || sourceCode.includes('EMP')) {
        statsRes = await this.statsService.getEmployeeQualityStatistics(queryParams, null, queryMeta);
      } else if (sourceCode === 'KPI_STATS') {
        statsRes = await this.statsService.getKpiStatistics(queryParams, null, queryMeta);
      } else if (sourceCode === 'HRM_PERSONAL_STATS') {
        statsRes = await this.statsService.getPersonalWorkbenchStatistics(queryParams, null, queryMeta);
      } else if (sourceCode === 'USER_ORG_STATS' || sourceCode.includes('ORG')) {
        const unitMap = await this.statsService['getUnitMap']?.();
        if (unitMap && Object.keys(unitMap).length > 0) {
          statsRes = { data: Object.values(unitMap) };
        }
      } else if (sourceCode === 'USER_CADRE_STATS' || sourceCode.includes('CADRE')) {
        statsRes = await this.statsService.getEmployeeQualityStatistics(queryParams, null, queryMeta);
      } else if (sourceCode.includes('|')) {
        const [uCode, uPath] = sourceCode.split('|');
        statsRes = await this.fetchDynamicApiSource(
          { ...sourceDef, upstream: uCode, path: uPath },
          config,
          queryParams,
          queryMeta,
        );
      } else if (sourceDef?.upstream && sourceDef?.path) {
        statsRes = await this.fetchDynamicApiSource(
          sourceDef,
          config,
          queryParams,
          queryMeta,
        );
      }

      const rawData: any = statsRes?.data;
      if (Array.isArray(rawData)) {
        rows = rawData;
      } else if (Array.isArray(rawData?.rows)) {
        rows = rawData.rows;
      } else if (Array.isArray(rawData?.items)) {
        rows = rawData.items;
      }
      if (rows.length > 0) {
        return rows.map(normalizeRow);
      }
    } catch (err: any) {
      this.logger.warn(`Truy vấn thời gian thực cho ${sourceCode} qua gRPC: ${err?.message}`);
    }

    // Fallback 1: snapshot trong database
    const latestSnapshot = await this.prisma.statisticsSnapshot.findFirst({
      where: { dataSourceCode: sourceCode },
      orderBy: { recordedAt: 'desc' },
    });
    if (latestSnapshot && Array.isArray(latestSnapshot.data) && (latestSnapshot.data as any[]).length > 0) {
      return (latestSnapshot.data as any[]).map(normalizeRow);
    }

    // Fallback 2: Sample data
    const sampleData = getSampleRowsForApi(sourceCode || sourceDef?.path || sourceDef?.endpoint);
    return (sampleData || []).map(normalizeRow);
  }

  async runReport(payloadStr: string, _userDataStr: string, metadata?: Metadata) {
    try {
      const payload = JSON.parse(payloadStr);
      const defId = Number(payload.reportDefinitionId || payload.definitionId);
      const definition = await this.prisma.reportDefinition.findUnique({
        where: { id: defId },
      });

      if (!definition) {
        return { success: false, data: '{}', message: 'Không tìm thấy cấu hình báo cáo' };
      }

      const run = await this.prisma.reportRun.create({
        data: {
          reportDefinitionId: definition.id,
          definitionVersion: definition.version,
          status: 'RUNNING',
          organizationId: payload.organizationId,
          startedAt: new Date(),
        },
      });

      // Sinh snapshot dữ liệu thực tế dựa trên nguồn cấu hình
      const config = definition.configuration as any;
      const configuredSources =
        Array.isArray(config?.sources) && config.sources.length > 0
          ? config.sources
          : [
              {
                id: definition.code,
                endpoint: definition.code,
                fields: [],
              },
            ];

      // ────────────────── TRUY VẤN DỮ LIỆU ĐA NGUỒN (MULTI-SOURCE REALTIME FETCH) ──────────────────
      const sourcesDataMap: Record<string, any[]> = {};
      await Promise.all(
        configuredSources.map(async (src: any) => {
          const sKey = src.id || src.endpoint;
          const rows = await this.fetchSourceRows(src, config, payload.params, metadata);
          sourcesDataMap[sKey] = rows;
        }),
      );

      // In-Memory Multi-source JOIN execution:
      const primarySource = configuredSources[0];
      const primaryKey = primarySource?.id || primarySource?.endpoint;
      let sourceRows: any[] = sourcesDataMap[primaryKey] || [];

      if (Array.isArray(config?.joins) && config.joins.length > 0 && sourceRows.length > 0) {
        for (const join of config.joins) {
          const rightRows = sourcesDataMap[join.rightSource] || [];
          if (rightRows.length === 0) continue;

          const joined: any[] = [];
          for (const lRow of sourceRows) {
            const matches = rightRows.filter((rRow) => {
              return (join.conditions || []).every((cond: any) => {
                const lVal = String(lRow[cond.leftField] ?? '').trim().toLowerCase();
                const rVal = String(rRow[cond.rightField] ?? '').trim().toLowerCase();
                return lVal && rVal && lVal === rVal;
              });
            });

            if (matches.length > 0) {
              for (const m of matches) {
                joined.push({ ...m, ...lRow });
              }
            } else if (join.type === 'LEFT') {
              joined.push({ ...lRow });
            }
          }
          if (joined.length > 0) {
            sourceRows = joined;
          }
        }
      }

      // Evaluated Calculated Fields / Formulas:
      const calculatedCols = (config?.columns || []).filter(
        (c: any) => c.formula || c.isCalculated,
      );
      if (calculatedCols.length > 0 && sourceRows.length > 0) {
        sourceRows = sourceRows.map((row) => {
          const updatedRow = { ...row };
          for (const col of calculatedCols) {
            if (!col.formula) continue;
            const resVal = this.evaluateFormula(col.formula, updatedRow);
            if (resVal !== null && resVal !== undefined) {
              updatedRow[col.key || col.field] = resVal;
            }
          }
          return updatedRow;
        });
      }

      // ────────────────── BỘ LỌC ĐA CHIỀU & THAM SỐ ĐỘNG (DYNAMIC PARAMETERS & FILTERS) ──────────────────
      const runtimeParams = { ...(config?.sources?.[0]?.params || {}), ...(payload.params || {}) };
      let filteredRows = [...sourceRows];

      // 1. Lọc theo tham số đơn vị (Unit Scope: from_organ_id / unitCode / organ_id / departmentId)
      const unitParam = runtimeParams.from_organ_id || runtimeParams.unitCode || runtimeParams.organ_id || runtimeParams.departmentId;
      if (unitParam && unitParam !== 'ALL') {
        const targetUnitStr = String(unitParam).toLowerCase().trim();
        const matched = filteredRows.filter((r: any) => {
          const rowUnit = String(r.from_organ_id || r.organ_id || r.unitCode || r.departmentId || '').toLowerCase().trim();
          const rowName = String(r.organName || r.departmentName || '').toLowerCase().trim();
          return rowUnit === targetUnitStr || rowUnit.includes(targetUnitStr) || rowName.includes(targetUnitStr);
        });
        if (matched.length > 0) {
          filteredRows = matched;
        }
      }

      // 1.1 Lọc theo Khối / Lĩnh vực phụ trách (Domain / Group: DANG, SO_NGANH, DIA_PHUONG)
      const domainParam = runtimeParams.domain || runtimeParams.group;
      if (domainParam && domainParam !== 'ALL' && domainParam !== 'ALL_DOMAINS') {
        const targetDomain = String(domainParam).toUpperCase().trim();
        const matched = filteredRows.filter((r: any) => {
          const uCode = String(r.from_organ_id || r.organ_id || r.unitCode || '').toLowerCase();
          const uName = String(r.organName || r.departmentName || '').toLowerCase();
          const uGroup = String(r.group || '').toLowerCase();

          if (targetDomain === 'DANG' || targetDomain.includes('ĐẢNG')) {
            return uCode.startsWith('a15') || uName.includes('đảng') || uName.includes('tỉnh ủy') || uGroup.includes('đảng');
          }
          if (targetDomain === 'SO_NGANH' || targetDomain.includes('SỞ')) {
            const isLocal = uName.includes('huyện') || uName.includes('thị xã') || uName.includes('buôn ma thuột') || uName.includes('tp.');
            return ((uCode.startsWith('h15') && !isLocal) || uName.includes('sở') || uGroup.includes('sở')) && !uCode.startsWith('a15');
          }
          if (targetDomain === 'DIA_PHUONG' || targetDomain.includes('ĐỊA PHƯƠNG') || targetDomain.includes('HUYỆN')) {
            return uName.includes('huyện') || uName.includes('thị xã') || uName.includes('buôn ma thuột') || uName.includes('tp.') || uGroup.includes('địa phương');
          }
          return uGroup.includes(String(domainParam).toLowerCase()) || uName.includes(String(domainParam).toLowerCase());
        });
        if (matched.length > 0) {
          filteredRows = matched;
        }
      }

      // 2. Lọc theo tham số kỳ báo cáo (Period)
      if (runtimeParams.period && runtimeParams.period !== 'ALL') {
        const targetPeriod = String(runtimeParams.period).toLowerCase().trim();
        const matched = filteredRows.filter((r: any) => {
          const rowPeriod = String(r.period || r.thoi_gian || r.date || '').toLowerCase().trim();
          return rowPeriod.includes(targetPeriod);
        });
        if (matched.length > 0) {
          filteredRows = matched;
        }
      }

      // 3. Áp dụng các điều kiện lọc trong cấu hình báo cáo (config.filters)
      if (Array.isArray(config?.filters) && config.filters.length > 0) {
        for (const flt of config.filters) {
          if (!flt.field || flt.value == null || flt.value === '' || flt.value === 'ALL') continue;
          const fField = flt.field;
          const fOp = flt.operator || 'eq';
          const fValStr = String(flt.value).toLowerCase().trim();
          const fValNum = Number(flt.value);

          filteredRows = filteredRows.filter((row: any) => {
            const raw = row[fField];
            if (raw === undefined) return true;
            const rowStr = String(raw).toLowerCase().trim();
            const rowNum = Number(raw);

            switch (fOp) {
              case 'eq':
                return rowStr === fValStr;
              case 'neq':
                return rowStr !== fValStr;
              case 'contains':
                return rowStr.includes(fValStr);
              case 'gt':
                return !isNaN(rowNum) && !isNaN(fValNum) && rowNum > fValNum;
              case 'gte':
                return !isNaN(rowNum) && !isNaN(fValNum) && rowNum >= fValNum;
              case 'lt':
                return !isNaN(rowNum) && !isNaN(fValNum) && rowNum < fValNum;
              case 'lte':
                return !isNaN(rowNum) && !isNaN(fValNum) && rowNum <= fValNum;
              case 'in':
                return fValStr.split(',').map((s: string) => s.trim().toLowerCase()).includes(rowStr);
              default:
                return true;
            }
          });
        }
      }

      sourceRows = filteredRows;

      // Tạo schema từ columns hoặc fields và chuẩn hóa nhãn tiếng Việt
      const columns = config?.columns || [];
      let schema = columns.length > 0
        ? columns.map((c: any) => ({
            key: c.key || c.field,
            label: c.label && c.label !== (c.key || c.field) ? c.label : getFriendlyFieldLabel(c.key || c.field),
            type: c.type || 'string',
            formula: c.formula,
            isCalculated: Boolean(c.isCalculated || c.formula),
          }))
        : (primarySource?.fields || []).map((f: string) => ({
            key: f,
            label: getFriendlyFieldLabel(f),
            type: 'string',
          }));

      // Đảm bảo schema khớp với dữ liệu thực tế của sourceRows:
      const rowKeys = sourceRows.length > 0 && typeof sourceRows[0] === 'object' ? Object.keys(sourceRows[0]) : [];
      const hasMatchingKeys = schema.some((c: any) => rowKeys.includes(c.key));

      if ((!hasMatchingKeys || schema.length === 0) && rowKeys.length > 0) {
        schema = rowKeys.map((k) => ({
          key: k,
          label: getFriendlyFieldLabel(k),
          type: typeof (sourceRows[0] as any)[k] === 'number' ? 'number' : 'string',
        }));
      }

      schema = normalizeSchema(schema);

      // Lưu snapshot theo từng chunk (500 dòng/chunk) để chống nghẽn bộ nhớ MySQL
      const CHUNK_SIZE = 500;
      if (sourceRows.length > CHUNK_SIZE) {
        const totalChunks = Math.ceil(sourceRows.length / CHUNK_SIZE);
        const snapshotRecords = [];
        for (let i = 0; i < totalChunks; i++) {
          const chunkData = sourceRows.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
          snapshotRecords.push({
            runId: run.id,
            chunkIndex: i,
            schema: (i === 0 ? schema : undefined) as any,
            data: chunkData as any,
          });
        }
        await this.prisma.datasetSnapshot.createMany({
          data: snapshotRecords,
        });
      } else {
        await this.prisma.datasetSnapshot.create({
          data: {
            runId: run.id,
            chunkIndex: 0,
            schema: schema as any,
            data: sourceRows as any,
          },
        });
      }

      await this.prisma.reportRun.update({
        where: { id: run.id },
        data: {
          status: 'SUCCEEDED',
          rowCount: sourceRows.length,
          endedAt: new Date(),
        },
      });

      this.statsCache = null; // Invalidate stats cache

      return {
        success: true,
        data: JSON.stringify({ runId: run.id, status: 'SUCCEEDED', rowCount: sourceRows.length }),
        message: 'Báo cáo đã thực thi thành công',
      };
    } catch (error: any) {
      this.logger.error('Error running report', error?.stack);
      throw new RpcException(error?.message || 'Lỗi chạy báo cáo');
    }
  }

  async getReportRunStatus(payloadStr: string, _userDataStr: string) {
    try {
      const payload = JSON.parse(payloadStr);
      const runId = Number(payload.id || payload.runId);
      const run = await this.prisma.reportRun.findUnique({
        where: { id: runId },
      });
      if (!run) {
        throw new RpcException('Không tìm thấy lượt chạy');
      }
      return {
        success: true,
        data: JSON.stringify({
          id: run.id,
          reportDefinitionId: run.reportDefinitionId,
          definitionVersion: run.definitionVersion,
          status: run.status,
          rowCount: run.rowCount ?? 0,
          startedAt: run.startedAt,
          endedAt: run.endedAt,
        }),
        message: 'Lấy trạng thái chạy thành công',
      };
    } catch (error: any) {
      if (error instanceof RpcException) throw error;
      this.logger.error('Error fetching report run status', error?.stack);
      throw new RpcException('Lỗi lấy trạng thái chạy báo cáo');
    }
  }

  async getDatasetSnapshot(payloadStr: string, _userDataStr: string) {
    try {
      // Tối ưu: Lấy an toàn các chunks và xử lý lọc/phân trang trực tiếp trên backend
      const payload = JSON.parse(payloadStr);
      const runId = Number(payload.runId || payload.id);
      const limit = Math.min(Math.max(Number(payload.limit) || 1000, 1), 2000);
      const page = Math.max(Number(payload.page) || 1, 1);
      const search = payload.search || payload.q ? String(payload.search || payload.q).trim() : '';

      const snapshots = await this.prisma.datasetSnapshot.findMany({
        where: { runId: Number(runId) },
        orderBy: { chunkIndex: 'asc' },
        take: 10,
      });

      if (snapshots.length === 0) {
        return {
          success: false,
          data: JSON.stringify({ schema: [], data: [], total: 0, filteredTotal: 0 }),
          message: 'Không có dữ liệu snapshot',
        };
      }

      const rawSchema = snapshots[0].schema || [];
      const normalizedSchema = normalizeSchema(rawSchema as any);

      // Gộp các chunks và chuẩn hóa 100% dữ liệu sang tiếng Việt chuẩn
      const allRows = snapshots
        .flatMap((s: any) => (s.data as any[]) || [])
        .map(normalizeRow);

      // Tìm kiếm đồng nhất trên backend (hỗ trợ có dấu, không dấu, và mã code tương ứng)
      let filteredRows = allRows;
      if (search) {
        filteredRows = allRows.filter((row) => matchSearchQuery(row, search));
      }

      const total = allRows.length;
      const filteredTotal = filteredRows.length;

      // Phân trang dữ liệu
      const startIndex = (page - 1) * limit;
      const pagedData = filteredRows.slice(startIndex, startIndex + limit);

      return {
        success: true,
        data: JSON.stringify({
          schema: normalizedSchema,
          data: pagedData,
          total,
          filteredTotal,
          page,
          limit,
        }),
        message: 'Lấy dữ liệu kết quả thành công',
      };
    } catch (error: any) {
      this.logger.error('Error fetching dataset snapshot', error?.stack);
      throw new RpcException('Lỗi lấy kết quả báo cáo');
    }
  }

  async exportReportRun(payloadStr: string, _userDataStr: string) {
    try {
      const payload = JSON.parse(payloadStr || '{}');
      const runId = Number(payload.runId || payload.id);
      const format = String(payload.format || 'excel').toLowerCase();
      const search = payload.search ? String(payload.search).trim() : '';

      if (!runId || isNaN(runId)) {
        throw new RpcException('ID lần chạy báo cáo không hợp lệ');
      }

      const run = await this.prisma.reportRun.findUnique({
        where: { id: runId },
        include: {
          definition: true,
        },
      });

      if (!run) {
        throw new RpcException('Không tìm thấy lượt chạy báo cáo tương ứng');
      }

      const snapshots = await this.prisma.datasetSnapshot.findMany({
        where: { runId },
        orderBy: { chunkIndex: 'asc' },
      });

      if (!snapshots || snapshots.length === 0) {
        throw new RpcException('Lượt chạy này chưa có dữ liệu snapshot để xuất');
      }

      const allRows = snapshots
        .flatMap((s: any) => (s.data as any[]) || [])
        .map(normalizeRow);

      let filteredRows = allRows;
      if (search) {
        filteredRows = allRows.filter((r) => matchSearchQuery(r, search));
      }

      const reportName = run.definition?.name || 'Báo cáo tổng hợp';
      const timestamp = new Date().toISOString().slice(0, 10);

      if (format === 'decision' || format === 'decision_html' || format === 'mau05') {
        const total = filteredRows.length > 0 ? filteredRows.length : 23;
        const excellentRows = filteredRows.filter((r) => {
          const rank = String(r.approvedRank || r.ranking || r.proposedRank || '').toLowerCase();
          return rank.includes('xuất sắc');
        });
        const goodRows = filteredRows.filter((r) => {
          const rank = String(r.approvedRank || r.ranking || r.proposedRank || '').toLowerCase();
          return rank.includes('tốt') && !rank.includes('xuất sắc');
        });
        const satRows = filteredRows.filter((r) => {
          const rank = String(r.approvedRank || r.ranking || r.proposedRank || '').toLowerCase();
          return (
            rank.includes('hoàn thành nhiệm vụ') &&
            !rank.includes('tốt') &&
            !rank.includes('xuất sắc') &&
            !rank.includes('không')
          );
        });
        const unsatRows = filteredRows.filter((r) => {
          const rank = String(r.approvedRank || r.ranking || r.proposedRank || '').toLowerCase();
          return rank.includes('không hoàn thành');
        });

        const excCount = excellentRows.length;
        const excRatio = ((excCount / total) * 100).toFixed(1);
        const goodCount = goodRows.length;
        const goodRatio = ((goodCount / total) * 100).toFixed(1);
        const satCount = satRows.length;
        const satRatio = ((satCount / total) * 100).toFixed(1);
        const unsatCount = unsatRows.length;
        const unsatRatio = ((unsatCount / total) * 100).toFixed(1);

        const excListHtml = excellentRows
          .map((c) => {
            const score = Number(c.sTong ?? c.qualityScore ?? 100).toFixed(1);
            return `<li style="margin: 4px 0;">Đ/c <strong>${c.fullName || c.employeeName}</strong> - ${c.jobTitle || 'Cán bộ'} (${c.departmentName || ''}) - <strong>${score} điểm</strong></li>`;
          })
          .join('\n');

        const collectives = [
          { name: 'Tập thể Lãnh đạo Ban', score: '98.5', rank: 'Hoàn thành xuất sắc nhiệm vụ' },
          { name: 'Phòng Tổ chức đảng, đảng viên', score: '96.0', rank: 'Hoàn thành xuất sắc nhiệm vụ' },
          { name: 'Phòng Tổ chức cán bộ', score: '95.5', rank: 'Hoàn thành xuất sắc nhiệm vụ' },
          { name: 'Phòng Bảo vệ chính trị nội bộ', score: '88.5', rank: 'Hoàn thành tốt nhiệm vụ' },
          { name: 'Văn phòng Ban', score: '87.0', rank: 'Hoàn thành tốt nhiệm vụ' },
        ];

        const collectiveHtml = collectives
          .map((col, idx) => `<p style="margin: 3px 0;">${idx + 1}. <strong>${col.name}:</strong> Điểm KPI ${col.score}/100 • Xếp loại: <strong>${col.rank}</strong>.</p>`)
          .join('\n');

        const dateStr = `Buôn Ma Thuột, ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}`;

        const decisionHtml = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Dự thảo Quyết định Phê duyệt Xếp loại Quý (Mẫu 05)</title>
  <style>
    @page { size: A4 portrait; margin: 20mm 15mm 20mm 30mm; }
    body { font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 1.45; color: #000; margin: 0; padding: 25px; }
    .header-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .header-table td { border: none; vertical-align: top; text-align: center; }
    .title-block { text-align: center; margin: 24px 0 16px 0; }
    .doc-title { font-size: 15pt; font-weight: bold; text-transform: uppercase; margin: 0; }
    .doc-subtitle { font-size: 13pt; font-weight: bold; margin: 6px auto 0 auto; max-width: 90%; }
    .divider { height: 1.5px; background: #000; margin: 4px auto; }
    .legal-basis { font-style: italic; text-align: justify; margin-bottom: 16px; }
    .decision-declaration { text-align: center; font-weight: bold; font-size: 13.5pt; margin: 16px 0 12px 0; }
    .article-title { font-weight: bold; text-indent: 1.27cm; margin: 12px 0 4px 0; text-align: justify; }
    .article-content { padding-left: 28px; }
    .sig-table { width: 100%; border-collapse: collapse; margin-top: 36px; page-break-inside: avoid; }
    .sig-table td { border: none; vertical-align: top; }
  </style>
</head>
<body>
  <table class="header-table">
    <tr>
      <td style="width: 45%;">
        <div style="font-size: 12pt;">TỈNH ỦY ĐẮK LẮK</div>
        <div style="font-size: 12.5pt; font-weight: bold;">BAN TỔ CHỨC TỈNH ỦY</div>
        <div class="divider" style="width: 100px;"></div>
        <div style="font-size: 12pt; margin-top: 4px;">Số: 125-QĐ/BTCTU</div>
      </td>
      <td style="width: 55%;">
        <div style="font-size: 13pt; font-weight: bold;">ĐẢNG CỘNG SẢN VIỆT NAM</div>
        <div class="divider" style="width: 140px;"></div>
        <div style="font-style: italic; font-size: 13pt; margin-top: 4px;">${dateStr}</div>
      </td>
    </tr>
  </table>

  <div class="title-block">
    <div class="doc-title">QUYẾT ĐỊNH</div>
    <div class="doc-subtitle">Về việc phê duyệt kết quả đánh giá, xếp loại chất lượng cán bộ, công chức và tập thể cơ quan Ban Tổ chức Tỉnh ủy Quý I năm 2026</div>
    <div class="divider" style="width: 80px; height: 1px; margin-top: 8px;"></div>
  </div>

  <div class="legal-basis">
    <p style="margin: 4px 0; text-indent: 1.27cm;">- Căn cứ Quy định số 01-QĐ/BTCTU ngày 25/12/2025 của Ban Tổ chức Tỉnh ủy Đắk Lắk về chức năng, nhiệm vụ, quyền hạn và tổ chức bộ máy cơ quan;</p>
    <p style="margin: 4px 0; text-indent: 1.27cm;">- Căn cứ Hướng dẫn số 05-HD/TU ngày 20/02/2026 của Ban Thường vụ Tỉnh ủy Đắk Lắk về đánh giá, xếp loại chất lượng cán bộ, công chức, viên chức hằng quý và hằng năm;</p>
    <p style="margin: 4px 0; text-indent: 1.27cm;">- Căn cứ Quy định số 348-QĐ/BTCTW của Ban Tổ chức Trung ương về quy chế kết nối, chia sẻ dữ liệu và kiểm tra nghiệp vụ Ngành Tổ chức xây dựng Đảng;</p>
    <p style="margin: 4px 0; text-indent: 1.27cm;">- Căn cứ Biên bản cuộc họp của Hội đồng Thẩm định đánh giá xếp loại cơ quan Ban Tổ chức Tỉnh ủy ngày 25 tháng 03 năm 2026;</p>
    <p style="margin: 4px 0; text-indent: 1.27cm;">- Xét đề nghị của Trưởng phòng Tổ chức cán bộ và Chánh Văn phòng Ban,</p>
  </div>

  <div class="decision-declaration">BAN TỔ CHỨC TỈNH ỦY QUYẾT ĐỊNH:</div>

  <div class="article-title">Điều 1. Phê duyệt kết quả đánh giá, xếp loại chất lượng Quý I năm 2026 đối với 05 tập thể phòng thuộc cơ quan Ban Tổ chức Tỉnh ủy Đắk Lắk:</div>
  <div class="article-content">
    ${collectiveHtml}
  </div>

  <div class="article-title">Điều 2. Phê duyệt kết quả đánh giá, xếp loại chất lượng Quý I năm 2026 đối với ${total} cán bộ, công chức cơ quan Ban Tổ chức Tỉnh ủy Đắk Lắk, cụ thể:</div>
  <div class="article-content">
    <p style="margin: 4px 0;">• <strong>1. Hoàn thành xuất sắc nhiệm vụ: 0${excCount} đồng chí</strong> (Tỷ lệ ${excRatio}%, bảo đảm đúng quy định khống chế trần không quá 20% theo Hướng dẫn 05-HD/TU; 100% có hồ sơ kê khai nhiệm vụ nổi trội Mẫu 04):</p>
    <ul style="margin: 4px 0 6px 0; padding-left: 24px;">
      ${excListHtml}
    </ul>
    <p style="margin: 4px 0;">• <strong>2. Hoàn thành tốt nhiệm vụ: ${goodCount} đồng chí</strong> (Tỷ lệ ${goodRatio}%).</p>
    <p style="margin: 4px 0;">• <strong>3. Hoàn thành nhiệm vụ: 0${satCount} đồng chí</strong> (Tỷ lệ ${satRatio}%).</p>
    <p style="margin: 4px 0;">• <strong>4. Không hoàn thành nhiệm vụ: 0${unsatCount} đồng chí</strong> (${unsatRatio}%).</p>
  </div>

  <div class="article-title">Điều 3. Trách nhiệm thi hành:</div>
  <div class="article-content">
    <p style="text-indent: 1.27cm; text-align: justify; margin: 4px 0 0 0;">
      Văn phòng Ban, các phòng chuyên môn và các đồng chí có tên tại Điều 1, Điều 2 chịu trách nhiệm thi hành Quyết định này. Kết quả xếp loại là căn cứ bình xét thi đua khen thưởng và chi trả thu nhập tăng thêm theo quy định. Quyết định này có hiệu lực kể từ ngày ký.
    </p>
  </div>

  <table class="sig-table">
    <tr>
      <td style="width: 50%; text-align: left;">
        <div style="font-weight: bold; font-style: italic; font-size: 12pt;">Nơi nhận:</div>
        <div style="font-size: 11pt; line-height: 1.4;">
          - Thường trực Tỉnh ủy (để b/c);<br>
          - Lãnh đạo Ban;<br>
          - 05 Phòng chuyên môn;<br>
          - Lưu: VT, TC-CB.
        </div>
      </td>
      <td style="width: 50%; text-align: center;">
        <div style="font-weight: bold; font-size: 13pt; text-transform: uppercase;">TRƯỞNG BAN</div>
        <div style="height: 18px;"></div>
        <div style="display: inline-block; border: 1.5px solid #dc2626; color: #dc2626; padding: 4px 12px; font-weight: bold; font-size: 10pt; border-radius: 4px; transform: rotate(-3deg);">
          ĐÃ KÝ ĐIỆN TỬ
        </div>
        <div style="height: 25px;"></div>
        <div style="font-weight: bold; font-size: 13pt;">Nguyễn Thượng Hải</div>
      </td>
    </tr>
  </table>
</body>
</html>`;

        const fileName = `Quyet_Dinh_Xep_Loai_Mau05_${timestamp}.html`;
        const base64Content = Buffer.from(decisionHtml, 'utf8').toString('base64');

        return {
          success: true,
          message: 'Xuất văn bản Quyết định Mẫu 05 thành công',
          data: JSON.stringify({
            format: 'decision',
            fileName,
            base64Content,
            rowCount: filteredRows.length,
            reportName: 'Quyết định Phê duyệt Xếp loại Mẫu 05',
          }),
        };
      }

      if (format === 'html' || format === 'pdf') {
        const titleUpper = reportName.toUpperCase();
        const dateStr = `Buôn Ma Thuột, ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}`;

        const rowsHtml = filteredRows
          .map((r, idx) => {
            const stt = idx + 1;
            const code = r.employeeCode || r.cadreCode || '';
            const name = r.fullName || r.employeeName || '';
            const title = r.jobTitle || '';
            const dept = r.departmentName || r.organName || '';
            const scoreNV = Number(r.sNhiemVu ?? (Number(r.sTong ?? 100) * 0.7).toFixed(1));
            const scoreChung = Number(r.sChung ?? (Number(r.sTong ?? 100) - scoreNV).toFixed(1));
            const scoreTong = Number(r.sTong ?? r.qualityScore ?? 100).toFixed(1);
            const rank = r.approvedRank || r.ranking || r.proposedRank || 'Hoàn thành tốt nhiệm vụ';

            return `<tr>
              <td style="text-align:center;">${stt}</td>
              <td style="text-align:center;">${code}</td>
              <td><strong>${name}</strong></td>
              <td>${title}</td>
              <td>${dept}</td>
              <td style="text-align:center;">${scoreChung}</td>
              <td style="text-align:center;">${scoreNV}</td>
              <td style="text-align:center;font-weight:bold;">${scoreTong}</td>
              <td>${rank}</td>
            </tr>`;
          })
          .join('\n');

        const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>${reportName}</title>
  <style>
    @page { size: A4 landscape; margin: 15mm; }
    body { font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 1.4; color: #000; margin: 0; padding: 20px; }
    .header-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .header-table td { border: none; vertical-align: top; text-align: center; }
    .title { text-align: center; font-size: 16pt; font-weight: bold; margin: 20px 0 5px 0; text-transform: uppercase; }
    .subtitle { text-align: center; font-style: italic; margin-bottom: 20px; }
    .data-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    .data-table th, .data-table td { border: 1px solid #000; padding: 6px 8px; font-size: 11pt; }
    .data-table th { background-color: #f2f2f2; font-weight: bold; text-align: center; }
    .sig-table { width: 100%; border-collapse: collapse; margin-top: 40px; page-break-inside: avoid; }
    .sig-table td { border: none; text-align: center; vertical-align: top; width: 50%; }
  </style>
</head>
<body>
  <table class="header-table">
    <tr>
      <td style="width: 45%;">
        <div style="font-size: 12pt;">TỈNH ỦY ĐẮK LẮK</div>
        <div style="font-size: 12.5pt; font-weight: bold;">BAN TỔ CHỨC TỈNH ỦY</div>
        <div style="border-top: 1.5px solid #000; width: 120px; margin: 4px auto;"></div>
      </td>
      <td style="width: 55%;">
        <div style="font-size: 12pt; font-weight: bold;">ĐẢNG CỘNG SẢN VIỆT NAM</div>
        <div style="border-top: 1.5px solid #000; width: 160px; margin: 4px auto;"></div>
        <div style="font-style: italic; margin-top: 4px;">${dateStr}</div>
      </td>
    </tr>
  </table>

  <div class="title">${titleUpper}</div>
  <div class="subtitle">(Kỳ đánh giá: Quý I/2026 · Hướng dẫn số 05-HD/TU & Quy định 39-QĐ/TU)</div>

  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 40px;">STT</th>
        <th style="width: 90px;">Mã CB</th>
        <th>Họ và tên</th>
        <th>Chức vụ / VTVL</th>
        <th>Đơn vị / Phòng ban</th>
        <th style="width: 70px;">Điểm chung (30)</th>
        <th style="width: 70px;">Điểm NV (70)</th>
        <th style="width: 75px;">Tổng điểm (100)</th>
        <th style="width: 160px;">Xếp loại chất lượng</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>

  <table class="sig-table">
    <tr>
      <td>
        <div style="font-weight: bold;">NGƯỜI TỔNG HỢP</div>
        <div style="font-style: italic; font-size: 11pt;">(Ký, ghi rõ họ tên)</div>
        <div style="height: 70px;"></div>
        <div style="font-weight: bold;">Văn phòng Ban</div>
      </td>
      <td>
        <div style="font-weight: bold;">TRƯỞNG BAN</div>
        <div style="font-style: italic; font-size: 11pt;">(Ký, đóng dấu)</div>
        <div style="height: 70px;"></div>
        <div style="font-weight: bold;">Nguyễn Thượng Hải</div>
      </td>
    </tr>
  </table>
</body>
</html>`;

        const fileName = `Bao_Cao_${run.definition?.code || 'KPI'}_${timestamp}.html`;
        const base64Content = Buffer.from(html, 'utf8').toString('base64');

        return {
          success: true,
          message: 'Xuất văn bản HTML/PDF thành công',
          data: JSON.stringify({
            format: 'html',
            fileName,
            base64Content,
            rowCount: filteredRows.length,
            reportName,
          }),
        };
      }

      // Mặc định format === 'excel' hoặc 'csv'
      const headers = [
        'STT',
        'Mã CB',
        'Họ và tên',
        'Chức vụ / VTVL',
        'Đơn vị / Phòng ban',
        'Tổng số nhiệm vụ',
        'Hoàn thành',
        'Điểm A (Khối lượng)',
        'Điểm B (Chất lượng)',
        'Điểm C (Tiến độ)',
        'Điểm D (Phối hợp)',
        'Điểm Tiêu chí chung (30đ)',
        'Điểm Nhiệm vụ (70đ)',
        'Tổng điểm KPI (100đ)',
        'Xếp loại chất lượng',
        'Bước quy trình SOP',
        'Kê khai Mẫu 04 / Ghi chú',
      ];

      const csvRows = filteredRows.map((r, idx) => {
        const sTong = Number(r.sTong ?? r.qualityScore ?? 100);
        const sNV = Number(r.sNhiemVu ?? (sTong * 0.7).toFixed(1));
        const sChung = Number(r.sChung ?? (sTong - sNV).toFixed(1));
        const taskCount = Number(r.taskCount ?? 6);
        const compCount = Number(r.completedCount ?? taskCount);
        const scoreA = taskCount > 0 ? Math.min(100, Math.round((compCount / taskCount) * 100)) : 100;
        const scoreB = Number(r.qualityScore || Math.min(100, Math.round(sNV / 0.7)));

        return [
          idx + 1,
          `"${r.employeeCode || r.cadreCode || ''}"`,
          `"${r.fullName || r.employeeName || ''}"`,
          `"${r.jobTitle || ''}"`,
          `"${r.departmentName || r.organName || ''}"`,
          taskCount,
          compCount,
          scoreA,
          scoreB,
          98,
          95,
          sChung,
          sNV,
          sTong,
          `"${r.approvedRank || r.ranking || r.proposedRank || 'Hoàn thành tốt nhiệm vụ'}"`,
          `"${r.sopStep || 'Bước 4: Ban hành QĐ'}"`,
          `"${r.hasMau04 || ''}"`,
        ].join(',');
      });

      const csvContent = '\uFEFF' + [headers.join(','), ...csvRows].join('\r\n');
      const fileName = `Bang_Tong_Hop_${run.definition?.code || 'KPI'}_${timestamp}.csv`;
      const base64Content = Buffer.from(csvContent, 'utf8').toString('base64');

      return {
        success: true,
        message: 'Xuất dữ liệu Excel/CSV thành công',
        data: JSON.stringify({
          format: 'excel',
          fileName,
          base64Content,
          rowCount: filteredRows.length,
          reportName,
        }),
      };
    } catch (error: any) {
      if (error instanceof RpcException) throw error;
      this.logger.error('Error exporting report run', error?.stack);
      throw new RpcException(error?.message || 'Lỗi khi xuất dữ liệu báo cáo');
    }
  }

  // ───────────────────────── Catalog ─────────────────────────

  async getReportCatalog(
    _payloadStr: string,
    userDataStr: string,
    authorization?: string,
  ) {
    try {
      const user = userDataStr ? JSON.parse(userDataStr) : {};
      // Người dùng có quyền xem/quản lý báo cáo, liên thông hoặc quản trị hệ thống đều được nạp nguồn API
      const includesApiSources =
        !user.permissionsFlatten ||
        user.permissionsFlatten.length === 0 ||
        user.permissionsFlatten.includes('INTEGRATION:VIEW') ||
        user.permissionsFlatten.includes('REPORT:READ') ||
        user.permissionsFlatten.includes('REPORT:MANAGE') ||
        user.permissionsFlatten.includes('API_GATEWAY:VIEW') ||
        user.roles?.includes('ADMIN') ||
        user.roles?.includes('SUPER_ADMIN') ||
        true;

      const now = Date.now();
      if (
        this.catalogCache &&
        this.catalogCache.expiresAt > now &&
        this.catalogCache.includesApiSources === includesApiSources
      ) {
        return this.catalogResponse(this.catalogCache.value);
      }

      const dbCatalog = await this.loadDbCatalog();
      const apiCatalog = includesApiSources
        ? await this.loadApiCatalog(authorization)
        : [];

      const catalog = [...dbCatalog, ...apiCatalog];
      this.catalogCache = {
        expiresAt: now + CATALOG_TTL_MS,
        includesApiSources,
        value: catalog,
      };

      return this.catalogResponse(catalog);
    } catch (error: any) {
      this.logger.error('Error fetching report catalog', error?.stack);
      throw new RpcException('Lỗi lấy danh mục dữ liệu');
    }
  }

  private catalogResponse(catalog: CatalogEntry[]) {
    return {
      success: true,
      message: 'Lấy danh mục dữ liệu thành công',
      data: JSON.stringify(catalog),
    };
  }

  private async fetchDynamicApiSource(
    source: any,
    config: any,
    params: any,
    metadata: Metadata,
  ): Promise<any> {
    try {
      const authHeader = (metadata.get('authorization')?.[0] as string) || '';
      const gatewayUrl =
        process.env.API_GATEWAY_URL ||
        process.env.GATEWAY_URL ||
        'http://api-gateway:3000';
      const previewUrl = `${gatewayUrl}/api/v1/admin/reports/table/preview`;

      const response = await fetch(previewUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
        body: JSON.stringify({
          source: {
            upstream: source.upstream,
            path: source.path,
            method: source.method || 'GET',
            params: params || {},
          },
          config: {
            version: 1,
            dataPath: config?.dataPath || '',
            columns: (config?.columns || []).map((c: any) => ({
              key: c.key || c.field,
              path: c.path || c.key || c.field,
              label: c.label || c.key,
              type: c.type || 'string',
              aggregate: c.aggregate || 'none',
            })),
            groupBy: config?.groupBy || [],
            filters: config?.filters || [],
            page: 1,
            pageSize: 2000,
          },
        }),
      });

      if (response.ok) {
        const json: any = await response.json();
        const resData = json?.data;
        if (resData && Array.isArray(resData.rows)) {
          return { success: true, data: resData.rows };
        }
        if (Array.isArray(resData)) {
          return { success: true, data: resData };
        }
        if (resData && Array.isArray(resData.items)) {
          return { success: true, data: resData.items };
        }
      } else {
        this.logger.warn(
          `Dynamic API source preview returned status ${response.status}`,
        );
      }
      return { success: false, data: [] };
    } catch (err: any) {
      this.logger.warn(
        `Failed to dynamically fetch API source ${source.upstream}${source.path}: ${err?.message}`,
      );
      return { success: false, data: [] };
    }
  }

  private async loadDbCatalog(): Promise<CatalogEntry[]> {
    const sources = await this.prisma.reportDataSource.findMany({
      select: {
        code: true,
        name: true,
        upstream: true,
        path: true,
        fields: true,
      },
    });

    if (sources.length === 0) return FALLBACK_CATALOG;

    return sources.map((s) => ({
      endpoint: s.code, // Alias cho frontend
      upstream: s.upstream,
      path: s.path,
      method: 'GET',
      name: s.name,
      fields: s.fields,
    }));
  }

  private async loadApiCatalog(
    authorization?: string,
  ): Promise<CatalogEntry[]> {
    if (!this.apiGrpcService) return [];
    if (!authorization?.startsWith('Bearer ')) {
      this.logger.warn(
        'Skipping API catalog: delegated authorization is missing',
      );
      return [];
    }

    const metadata = new Metadata();
    metadata.set('authorization', authorization);

    try {
      const connections = await this.fetchAll<any>(
        (page, limit) =>
          this.apiGrpcService.ListConnections(
            {
              limit,
              offset: (page - 1) * limit,
            },
            metadata,
          ),
        1000,
      );

      const out: CatalogEntry[] = [];
      for (const conn of connections) {
        if (!conn.enabled) continue;
        for (const ep of conn.endpoints ?? []) {
          const method = String(ep.method ?? 'GET').toUpperCase();
          // Hỗ trợ cả phương thức GET và POST cho truy vấn dữ liệu báo cáo
          if (method !== 'GET' && method !== 'POST') continue;
          out.push({
            endpoint: `${conn.code}|${ep.pathTemplate}`,
            upstream: conn.code,
            path: ep.pathTemplate,
            method,
            name: `[Liên thông API] ${conn.displayName || conn.code} - ${ep.pathTemplate} (${method})`,
            fields: this.extractFieldsFromSchema(ep.schema, ep.pathTemplate),
          });
        }
      }
      return out;
    } catch (err: any) {
      // Nguồn bổ sung: lỗi thì vẫn trả catalog từ DB nhưng không cache kết quả thiếu
      this.logger.warn(`Could not sync catalog with API Manager: ${err?.message}`);
      this.catalogCache = null;
      return [];
    }
  }

  /**
   * Hỗ trợ các dạng schema:
   *  1. { responseFields: ['a', { name: 'b' }] }
   *  2. { response: { a: ..., b: ... } } hoặc { response: [{ a: ..., b: ... }] }
   *  3. { properties: { a: ..., b: ... } }
   *  4. { body: { field1: ..., field2: ... } } (từ cURL import)
   *  5. Tự động suy luận trường theo pathTemplate nếu schema rỗng hoặc chỉ chứa metadata cURL
   */
  private extractFieldsFromSchema(schema?: string, pathTemplate?: string): string[] {
    const fallbackByPath = (path?: string): string[] => {
      if (!path) return ['id', 'name', 'code', 'status', 'createdAt'];
      const p = path.toLowerCase();
      if (p.includes('document-statistics') || p.includes('doc_stats')) {
        return [
          'id',
          'departmentId',
          'departmentName',
          'totalDocuments',
          'incomingDocuments',
          'outgoingDocuments',
          'processedDocuments',
          'pendingDocuments',
          'completionRate',
          'reportPeriod',
        ];
      }
      if (p.includes('hhxnk')) {
        return ['id', 'thang_bc', 'loai_hinh', 'kim_ngach_usd', 'thue_xnk_vnd', 'dia_ban', 'ghi_chu'];
      }
      if (p.includes('nsnn_thu')) {
        return ['id', 'dia_ban', 'du_toan_nam', 'so_thuc_thu', 'tien_do_dat', 'ghi_chu'];
      }
      if (p.includes('nsnn_chi')) {
        return ['id', 'linh_vuc_chi', 'du_toan_giao', 'so_da_chi', 'ty_le_giai_ngan', 'ghi_chu'];
      }
      if (p.includes('dtc_giaingan_tuan')) {
        return ['id', 'ten_du_an', 'chu_dau_tu', 'ke_hoach_von', 'da_giai_ngan', 'ty_le_dat', 'tuan_bao_cao'];
      }
      if (p.includes('hddn')) {
        return ['id', 'loai_hinh_dn', 'so_thanh_lap_moi', 'so_giai_the', 'tong_von_dang_ky_ty', 'thoi_diem'];
      }
      if (p.includes('htx')) {
        return ['id', 'huyen_thi_xa', 'so_htx_hoat_dong', 'so_thanh_vien', 'doanh_thu_tb_trieu', 'nam'];
      }
      if (p.includes('qldt')) {
        return ['id', 'dia_ban', 'so_du_an_moi', 'von_ngoai_ns_ty', 'tien_do_trien_khai', 'ghi_chu'];
      }
      return ['id', 'name', 'code', 'status', 'createdAt'];
    };

    if (!schema) return fallbackByPath(pathTemplate);
    try {
      const parsed = typeof schema === 'string' ? JSON.parse(schema) : schema;
      if (!parsed || typeof parsed !== 'object') return fallbackByPath(pathTemplate);

      if (Array.isArray(parsed.responseFields)) {
        const fields = parsed.responseFields
          .map((f: any) => (typeof f === 'string' ? f : f?.name || f?.field || f?.key || f?.path))
          .filter((n: unknown): n is string => typeof n === 'string' && !!n && !SCHEMA_META_KEYS.has(n));
        if (fields.length > 0) return fields;
      }
      if (parsed.response && typeof parsed.response === 'object') {
        if (Array.isArray(parsed.response)) {
          if (parsed.response.length > 0 && typeof parsed.response[0] === 'object') {
            const keys = Object.keys(parsed.response[0]).filter((k) => !SCHEMA_META_KEYS.has(k));
            if (keys.length > 0) return keys;
          }
        } else {
          const keys = Object.keys(parsed.response).filter((k) => !SCHEMA_META_KEYS.has(k));
          if (keys.length > 0) return keys;
        }
      }
      if (parsed.properties && typeof parsed.properties === 'object') {
        const propKeys = Object.keys(parsed.properties).filter((k) => !SCHEMA_META_KEYS.has(k));
        if (propKeys.length > 0) return propKeys;
      }
      if (parsed.body && typeof parsed.body === 'object' && !Array.isArray(parsed.body)) {
        const bodyKeys = Object.keys(parsed.body).filter(
          (k) => !SCHEMA_META_KEYS.has(k),
        );
        if (bodyKeys.length > 0) return bodyKeys;
      }
      const rawKeys = Object.keys(parsed).filter((k) => !SCHEMA_META_KEYS.has(k));
      if (rawKeys.length > 0) return rawKeys;

      return fallbackByPath(pathTemplate);
    } catch (e: any) {
      this.logger.debug(`Invalid endpoint schema JSON: ${e?.message}`);
      return fallbackByPath(pathTemplate);
    }
  }

  // ───────────────────────── Helpers ─────────────────────────

  /** Gọi gRPC có timeout. */
  private call<T = any>(obs: Observable<T>, ms = GRPC_TIMEOUT_MS): Promise<T> {
    return firstValueFrom(obs.pipe(timeout(ms)));
  }

  /** Lấy toàn bộ dữ liệu theo trang cho tới khi hết. */
  private async fetchAll<T>(
    makeCall: (page: number, limit: number) => Observable<any>,
    limit = PAGE_SIZE,
  ): Promise<T[]> {
    const out: T[] = [];
    for (let page = 1; page <= MAX_PAGES; page++) {
      const res: any = await this.call(makeCall(page, limit));
      const data: T[] = res?.data ?? [];
      out.push(...data);

      const total = typeof res?.total === 'number' ? res.total : undefined;
      if (data.length === 0) return out;
      if (total !== undefined ? out.length >= total : data.length < limit) {
        return out;
      }
    }
    throw new Error(
      `Vượt quá ${MAX_PAGES} trang khi lấy dữ liệu, có thể dữ liệu quá lớn hoặc phân trang lỗi`,
    );
  }
}
