import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../src/generated/prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const rawUrl =
  process.env.DATABASE_URL ||
  'mysql://root:mypassword@127.0.0.1:3306/admin_report?allowPublicKeyRetrieval=true';
const mariadbUrl = rawUrl.replace(/^mysql:\/\//, 'mariadb://');
const adapter = new PrismaMariaDb(mariadbUrl);
const prisma = new PrismaClient({ adapter });

export const btctuCadreRows = [
  // --- 1. KHỐI LÃNH ĐẠO BAN (05 VTVL) ---
  {
    cadreCode: 'BTCTU_001',
    fullName: 'Nguyễn Thượng Hải',
    departmentName: 'Lãnh đạo Ban',
    jobTitle: 'Trưởng ban Tổ chức Tỉnh ủy',
    sChung: 30.0,
    sNhiemVu: 70.0,
    sTong: 100.0,
    proposedRank: 'Hoàn thành xuất sắc nhiệm vụ',
    approvedRank: 'Hoàn thành xuất sắc nhiệm vụ',
    hasMau04: 'Có (Đề án 01-ĐA/TU)',
    sopStep: 'Bước 4: Ban hành QĐ',
    status: 'Đã ban hành QĐ',
    quarterYear: 'Quý I/2026',
  },
  {
    cadreCode: 'BTCTU_002',
    fullName: 'Lưu Vĩnh Hưng',
    departmentName: 'Lãnh đạo Ban',
    jobTitle: 'Phó Trưởng ban Thường trực',
    sChung: 29.5,
    sNhiemVu: 68.5,
    sTong: 98.0,
    proposedRank: 'Hoàn thành xuất sắc nhiệm vụ',
    approvedRank: 'Hoàn thành xuất sắc nhiệm vụ',
    hasMau04: 'Có (Mô hình VTVL)',
    sopStep: 'Bước 4: Ban hành QĐ',
    status: 'Đã ban hành QĐ',
    quarterYear: 'Quý I/2026',
  },
  {
    cadreCode: 'BTCTU_003',
    fullName: 'Nguyễn Hữu Toàn',
    departmentName: 'Lãnh đạo Ban',
    jobTitle: 'Phó Trưởng ban (TCCSĐ & Đảng viên)',
    sChung: 28.5,
    sNhiemVu: 66.0,
    sTong: 94.5,
    proposedRank: 'Hoàn thành tốt nhiệm vụ',
    approvedRank: 'Hoàn thành tốt nhiệm vụ',
    hasMau04: 'Không',
    sopStep: 'Bước 4: Ban hành QĐ',
    status: 'Đã ban hành QĐ',
    quarterYear: 'Quý I/2026',
  },
  {
    cadreCode: 'BTCTU_004',
    fullName: 'Trần Tuấn Anh',
    departmentName: 'Lãnh đạo Ban',
    jobTitle: 'Phó Trưởng ban (BVCTNB)',
    sChung: 28.0,
    sNhiemVu: 65.5,
    sTong: 93.5,
    proposedRank: 'Hoàn thành tốt nhiệm vụ',
    approvedRank: 'Hoàn thành tốt nhiệm vụ',
    hasMau04: 'Không',
    sopStep: 'Bước 4: Ban hành QĐ',
    status: 'Đã ban hành QĐ',
    quarterYear: 'Quý I/2026',
  },
  {
    cadreCode: 'BTCTU_005',
    fullName: 'Y Nhuân Byă',
    departmentName: 'Lãnh đạo Ban',
    jobTitle: 'Phó Trưởng ban (Đào tạo & CĐS)',
    sChung: 28.5,
    sNhiemVu: 66.5,
    sTong: 95.0,
    proposedRank: 'Hoàn thành tốt nhiệm vụ',
    approvedRank: 'Hoàn thành tốt nhiệm vụ',
    hasMau04: 'Không',
    sopStep: 'Bước 4: Ban hành QĐ',
    status: 'Đã ban hành QĐ',
    quarterYear: 'Quý I/2026',
  },

  // --- 2. PHÒNG TỔ CHỨC ĐẢNG, ĐẢNG VIÊN (04 VTVL) ---
  {
    cadreCode: 'BTCTU_006',
    fullName: 'Công chức 1',
    departmentName: 'Phòng Tổ chức đảng, đảng viên',
    jobTitle: 'Trưởng phòng TCĐ-ĐV',
    sChung: 29.0,
    sNhiemVu: 68.0,
    sTong: 97.0,
    proposedRank: 'Hoàn thành xuất sắc nhiệm vụ',
    approvedRank: 'Hoàn thành xuất sắc nhiệm vụ',
    hasMau04: 'Có (HD TCCSĐ mới)',
    sopStep: 'Bước 4: Ban hành QĐ',
    status: 'Đã ban hành QĐ',
    quarterYear: 'Quý I/2026',
  },
  {
    cadreCode: 'BTCTU_007',
    fullName: 'Công chức 2',
    departmentName: 'Phòng Tổ chức đảng, đảng viên',
    jobTitle: 'Phó Trưởng phòng (TCCSĐ)',
    sChung: 27.0,
    sNhiemVu: 61.5,
    sTong: 88.5,
    proposedRank: 'Hoàn thành tốt nhiệm vụ',
    approvedRank: 'Hoàn thành tốt nhiệm vụ',
    hasMau04: 'Không',
    sopStep: 'Bước 4: Ban hành QĐ',
    status: 'Đã ban hành QĐ',
    quarterYear: 'Quý I/2026',
  },
  {
    cadreCode: 'BTCTU_008',
    fullName: 'Công chức 3',
    departmentName: 'Phòng Tổ chức đảng, đảng viên',
    jobTitle: 'Phó Trưởng phòng (Nghiệp vụ ĐV & LGSP)',
    sChung: 27.5,
    sNhiemVu: 62.0,
    sTong: 89.5,
    proposedRank: 'Hoàn thành tốt nhiệm vụ',
    approvedRank: 'Hoàn thành tốt nhiệm vụ',
    hasMau04: 'Không',
    sopStep: 'Bước 4: Ban hành QĐ',
    status: 'Đã ban hành QĐ',
    quarterYear: 'Quý I/2026',
  },
  {
    cadreCode: 'BTCTU_009',
    fullName: 'Công chức 4',
    departmentName: 'Phòng Tổ chức đảng, đảng viên',
    jobTitle: 'Chuyên viên CSDL & CĐS Đảng viên',
    sChung: 26.5,
    sNhiemVu: 58.0,
    sTong: 84.5,
    proposedRank: 'Hoàn thành tốt nhiệm vụ',
    approvedRank: 'Hoàn thành tốt nhiệm vụ',
    hasMau04: 'Không',
    sopStep: 'Bước 4: Ban hành QĐ',
    status: 'Đã ban hành QĐ',
    quarterYear: 'Quý I/2026',
  },

  // --- 3. PHÒNG TỔ CHỨC CÁN BỘ (04 VTVL) ---
  {
    cadreCode: 'BTCTU_010',
    fullName: 'Công chức 5',
    departmentName: 'Phòng Tổ chức cán bộ',
    jobTitle: 'Trưởng phòng TCCB',
    sChung: 29.0,
    sNhiemVu: 67.5,
    sTong: 96.5,
    proposedRank: 'Hoàn thành xuất sắc nhiệm vụ',
    approvedRank: 'Hoàn thành tốt nhiệm vụ',
    hasMau04: 'Không',
    sopStep: 'Bước 4: Ban hành QĐ',
    status: 'Đã ban hành QĐ (Áp trần 20%)',
    quarterYear: 'Quý I/2026',
  },
  {
    cadreCode: 'BTCTU_011',
    fullName: 'Công chức 6',
    departmentName: 'Phòng Tổ chức cán bộ',
    jobTitle: 'Phó Trưởng phòng (Quy hoạch, Bổ nhiệm)',
    sChung: 27.5,
    sNhiemVu: 63.0,
    sTong: 90.5,
    proposedRank: 'Hoàn thành xuất sắc nhiệm vụ',
    approvedRank: 'Hoàn thành tốt nhiệm vụ',
    hasMau04: 'Không',
    sopStep: 'Bước 4: Ban hành QĐ',
    status: 'Đã ban hành QĐ (Áp trần 20%)',
    quarterYear: 'Quý I/2026',
  },
  {
    cadreCode: 'BTCTU_012',
    fullName: 'Công chức 7',
    departmentName: 'Phòng Tổ chức cán bộ',
    jobTitle: 'Phó Trưởng phòng (Biên chế & Đào tạo)',
    sChung: 26.5,
    sNhiemVu: 60.5,
    sTong: 87.0,
    proposedRank: 'Hoàn thành tốt nhiệm vụ',
    approvedRank: 'Hoàn thành tốt nhiệm vụ',
    hasMau04: 'Không',
    sopStep: 'Bước 4: Ban hành QĐ',
    status: 'Đã ban hành QĐ',
    quarterYear: 'Quý I/2026',
  },
  {
    cadreCode: 'BTCTU_013',
    fullName: 'Công chức 8',
    departmentName: 'Phòng Tổ chức cán bộ',
    jobTitle: 'Chuyên viên QLCB & CSDL Mẫu 2C',
    sChung: 29.5,
    sNhiemVu: 70.0,
    sTong: 99.5,
    proposedRank: 'Hoàn thành xuất sắc nhiệm vụ',
    approvedRank: 'Hoàn thành xuất sắc nhiệm vụ',
    hasMau04: 'Có (HD 05-HD/TU)',
    sopStep: 'Bước 4: Ban hành QĐ',
    status: 'Đã ban hành QĐ',
    quarterYear: 'Quý I/2026',
  },

  // --- 4. PHÒNG BẢO VỆ CHÍNH TRỊ NỘI BỘ (04 VTVL) ---
  {
    cadreCode: 'BTCTU_014',
    fullName: 'Công chức 9',
    departmentName: 'Phòng Bảo vệ chính trị nội bộ',
    jobTitle: 'Trưởng phòng BVCTNB',
    sChung: 28.5,
    sNhiemVu: 65.0,
    sTong: 93.5,
    proposedRank: 'Hoàn thành tốt nhiệm vụ',
    approvedRank: 'Hoàn thành tốt nhiệm vụ',
    hasMau04: 'Không',
    sopStep: 'Bước 4: Ban hành QĐ',
    status: 'Đã ban hành QĐ',
    quarterYear: 'Quý I/2026',
  },
  {
    cadreCode: 'BTCTU_015',
    fullName: 'Công chức 10',
    departmentName: 'Phòng Bảo vệ chính trị nội bộ',
    jobTitle: 'Phó Trưởng phòng (Thẩm tra xác minh)',
    sChung: 27.0,
    sNhiemVu: 61.0,
    sTong: 88.0,
    proposedRank: 'Hoàn thành tốt nhiệm vụ',
    approvedRank: 'Hoàn thành tốt nhiệm vụ',
    hasMau04: 'Không',
    sopStep: 'Bước 4: Ban hành QĐ',
    status: 'Đã ban hành QĐ',
    quarterYear: 'Quý I/2026',
  },
  {
    cadreCode: 'BTCTU_016',
    fullName: 'Công chức 11',
    departmentName: 'Phòng Bảo vệ chính trị nội bộ',
    jobTitle: 'Phó Trưởng phòng (Yếu tố nước ngoài)',
    sChung: 26.5,
    sNhiemVu: 59.5,
    sTong: 86.0,
    proposedRank: 'Hoàn thành tốt nhiệm vụ',
    approvedRank: 'Hoàn thành tốt nhiệm vụ',
    hasMau04: 'Không',
    sopStep: 'Bước 4: Ban hành QĐ',
    status: 'Đã ban hành QĐ',
    quarterYear: 'Quý I/2026',
  },
  {
    cadreCode: 'BTCTU_017',
    fullName: 'Công chức 12',
    departmentName: 'Phòng Bảo vệ chính trị nội bộ',
    jobTitle: 'Chuyên viên Biệt phái BVCTNB Mức 3',
    sChung: 26.0,
    sNhiemVu: 58.0,
    sTong: 84.0,
    proposedRank: 'Hoàn thành tốt nhiệm vụ',
    approvedRank: 'Hoàn thành tốt nhiệm vụ',
    hasMau04: 'Không',
    sopStep: 'Bước 4: Ban hành QĐ',
    status: 'Đã ban hành QĐ',
    quarterYear: 'Quý I/2026',
  },

  // --- 5. KHỐI VĂN PHÒNG BAN (06 VTVL) ---
  {
    cadreCode: 'BTCTU_018',
    fullName: 'Công chức 13',
    departmentName: 'Văn phòng Ban',
    jobTitle: 'Chánh Văn phòng Ban',
    sChung: 28.0,
    sNhiemVu: 64.0,
    sTong: 92.0,
    proposedRank: 'Hoàn thành tốt nhiệm vụ',
    approvedRank: 'Hoàn thành tốt nhiệm vụ',
    hasMau04: 'Không',
    sopStep: 'Bước 4: Ban hành QĐ',
    status: 'Đã ban hành QĐ',
    quarterYear: 'Quý I/2026',
  },
  {
    cadreCode: 'BTCTU_019',
    fullName: 'Công chức 14',
    departmentName: 'Văn phòng Ban',
    jobTitle: 'Phó Chánh Văn phòng (Sức khỏe cán bộ)',
    sChung: 26.5,
    sNhiemVu: 59.0,
    sTong: 85.5,
    proposedRank: 'Hoàn thành tốt nhiệm vụ',
    approvedRank: 'Hoàn thành tốt nhiệm vụ',
    hasMau04: 'Không',
    sopStep: 'Bước 4: Ban hành QĐ',
    status: 'Đã ban hành QĐ',
    quarterYear: 'Quý I/2026',
  },
  {
    cadreCode: 'BTCTU_020',
    fullName: 'Công chức 15',
    departmentName: 'Văn phòng Ban',
    jobTitle: 'Phó Chánh Văn phòng (Tài chính, Mật & CNTT)',
    sChung: 27.0,
    sNhiemVu: 60.0,
    sTong: 87.0,
    proposedRank: 'Hoàn thành tốt nhiệm vụ',
    approvedRank: 'Hoàn thành tốt nhiệm vụ',
    hasMau04: 'Không',
    sopStep: 'Bước 4: Ban hành QĐ',
    status: 'Đã ban hành QĐ',
    quarterYear: 'Quý I/2026',
  },
  {
    cadreCode: 'BTCTU_021',
    fullName: 'Công chức 16',
    departmentName: 'Văn phòng Ban',
    jobTitle: 'Chuyên viên Quản trị Mạng & ATTT Cấp 3',
    sChung: 26.0,
    sNhiemVu: 57.0,
    sTong: 83.0,
    proposedRank: 'Hoàn thành tốt nhiệm vụ',
    approvedRank: 'Hoàn thành tốt nhiệm vụ',
    hasMau04: 'Không',
    sopStep: 'Bước 4: Ban hành QĐ',
    status: 'Đã ban hành QĐ',
    quarterYear: 'Quý I/2026',
  },
  {
    cadreCode: 'BTCTU_022',
    fullName: 'Công chức 17',
    departmentName: 'Văn phòng Ban',
    jobTitle: 'Chuyên viên ATTT & Phần mềm Cơ yếu',
    sChung: 25.5,
    sNhiemVu: 56.5,
    sTong: 82.0,
    proposedRank: 'Hoàn thành tốt nhiệm vụ',
    approvedRank: 'Hoàn thành tốt nhiệm vụ',
    hasMau04: 'Không',
    sopStep: 'Bước 4: Ban hành QĐ',
    status: 'Đã ban hành QĐ',
    quarterYear: 'Quý I/2026',
  },
  {
    cadreCode: 'BTCTU_023',
    fullName: 'Công chức 18',
    departmentName: 'Văn phòng Ban',
    jobTitle: 'Nhân viên Văn thư - Lưu trữ - Kế toán',
    sChung: 24.5,
    sNhiemVu: 51.5,
    sTong: 76.0,
    proposedRank: 'Hoàn thành nhiệm vụ',
    approvedRank: 'Hoàn thành nhiệm vụ',
    hasMau04: 'Không',
    sopStep: 'Bước 4: Ban hành QĐ',
    status: 'Đã ban hành QĐ',
    quarterYear: 'Quý I/2026',
  },
];

const reportConfig = {
  version: 2,
  sources: [
    {
      id: 'BTCTU_KPI_STATS',
      endpoint: 'BTCTU_KPI_STATS',
      name: 'Đánh giá KPI & Xếp loại Cán bộ BTCTU',
      upstream: 'hrm-service',
      path: '/admin/reports/btctu-kpi-stats',
      fields: [
        'cadreCode',
        'fullName',
        'departmentName',
        'jobTitle',
        'sChung',
        'sNhiemVu',
        'sTong',
        'proposedRank',
        'approvedRank',
        'hasMau04',
        'sopStep',
        'status',
        'quarterYear',
      ],
    },
  ],
  joins: [],
  filters: [],
  columns: [
    {
      key: 'cadreCode',
      field: 'cadreCode',
      label: 'Mã CB',
      type: 'string',
    },
    {
      key: 'fullName',
      field: 'fullName',
      label: 'Họ và tên',
      type: 'string',
    },
    {
      key: 'departmentName',
      field: 'departmentName',
      label: 'Phòng ban / Đơn vị',
      type: 'string',
    },
    {
      key: 'jobTitle',
      field: 'jobTitle',
      label: 'Vị trí việc làm (VTVL)',
      type: 'string',
    },
    {
      key: 'sChung',
      field: 'sChung',
      label: 'Điểm chung (30đ)',
      type: 'number',
    },
    {
      key: 'sNhiemVu',
      field: 'sNhiemVu',
      label: 'Điểm nhiệm vụ (70đ)',
      type: 'number',
    },
    {
      key: 'sTong',
      field: 'sTong',
      label: 'Tổng điểm (100đ)',
      type: 'number',
    },
    {
      key: 'proposedRank',
      field: 'proposedRank',
      label: 'Xếp loại đề xuất (Mẫu 02/03)',
      type: 'string',
    },
    {
      key: 'approvedRank',
      field: 'approvedRank',
      label: 'Xếp loại phê duyệt (Mẫu 05)',
      type: 'string',
    },
    {
      key: 'hasMau04',
      field: 'hasMau04',
      label: 'Mẫu 04 (Nổi trội)',
      type: 'string',
    },
    {
      key: 'sopStep',
      field: 'sopStep',
      label: 'Tiến trình SOP',
      type: 'string',
    },
    {
      key: 'status',
      field: 'status',
      label: 'Trạng thái',
      type: 'string',
    },
    {
      key: 'quarterYear',
      field: 'quarterYear',
      label: 'Kỳ đánh giá',
      type: 'string',
    },
  ],
  groupBy: [],
  charts: [
    {
      type: 'bar',
      xAxis: 'departmentName',
      yAxis: 'sTong',
      title: 'Điểm KPI Trung bình theo 05 Tập thể Phòng',
    },
    {
      type: 'pie',
      xAxis: 'approvedRank',
      yAxis: 'sTong',
      title: 'Tỷ lệ Phân bổ Xếp loại (Đã siết trần ≤ 20% Xuất sắc)',
    },
    {
      type: 'line',
      xAxis: 'departmentName',
      yAxis: 'sNhiemVu',
      title: 'So sánh Điểm Tiêu chí Chung (30đ) vs Điểm Nhiệm vụ (70đ)',
    },
    {
      type: 'bar',
      xAxis: 'sopStep',
      yAxis: 'sTong',
      title: 'Phân bổ Trạng thái Quy trình SOP 4 Bước',
    },
  ],
};

const schema = reportConfig.columns.map((c) => ({
  key: c.key,
  label: c.label,
  type: c.type,
}));

async function main() {
  console.log('🔄 Đang cập nhật Báo cáo #5 theo chuẩn SOP và Câu 2...');

  // 1. Cập nhật ReportDefinition #5
  const repDef = await prisma.reportDefinition.upsert({
    where: { id: 5 },
    update: {
      code: 'REP_BTCTU_SOP_KPI',
      name: 'Báo cáo Đánh giá, Xếp loại Chất lượng Cán bộ & Tập thể (Chuẩn SOP & KPI Ban Tổ chức Tỉnh ủy)',
      description:
        'Báo cáo tổng hợp kết quả đánh giá, xếp loại chất lượng cán bộ, công chức và 05 tập thể phòng theo chuẩn SOP 4 bước và khung KPI Ban Tổ chức Tỉnh ủy Đắk Lắk (Hướng dẫn 05-HD/TU & Quy định 348-QĐ/BTCTW).',
      version: 2,
      configuration: reportConfig,
    },
    create: {
      id: 5,
      code: 'REP_BTCTU_SOP_KPI',
      name: 'Báo cáo Đánh giá, Xếp loại Chất lượng Cán bộ & Tập thể (Chuẩn SOP & KPI Ban Tổ chức Tỉnh ủy)',
      description:
        'Báo cáo tổng hợp kết quả đánh giá, xếp loại chất lượng cán bộ, công chức và 05 tập thể phòng theo chuẩn SOP 4 bước và khung KPI Ban Tổ chức Tỉnh ủy Đắk Lắk (Hướng dẫn 05-HD/TU & Quy định 348-QĐ/BTCTW).',
      version: 2,
      configuration: reportConfig,
    },
  });
  console.log(`✅ Đã cập nhật ReportDefinition #${repDef.id} (${repDef.code}): ${repDef.name}`);

  // 2. Thêm StatisticsSnapshot cho BTCTU_KPI_STATS
  const statSnap = await prisma.statisticsSnapshot.create({
    data: {
      dataSourceCode: 'BTCTU_KPI_STATS',
      data: btctuCadreRows,
    },
  });
  console.log(`✅ Đã tạo StatisticsSnapshot #${statSnap.id} cho dataSourceCode = BTCTU_KPI_STATS (${btctuCadreRows.length} dòng)`);

  // 3. Cập nhật hoặc tạo ReportRun mới
  let run = await prisma.reportRun.findFirst({
    where: { reportDefinitionId: 5 },
    orderBy: { id: 'desc' },
  });

  if (!run) {
    run = await prisma.reportRun.create({
      data: {
        reportDefinitionId: 5,
        definitionVersion: 2,
        status: 'SUCCEEDED',
        rowCount: btctuCadreRows.length,
        startedAt: new Date(),
        endedAt: new Date(),
      },
    });
  } else {
    run = await prisma.reportRun.update({
      where: { id: run.id },
      data: {
        definitionVersion: 2,
        status: 'SUCCEEDED',
        rowCount: btctuCadreRows.length,
        endedAt: new Date(),
      },
    });
  }
  console.log(`✅ Đã cập nhật ReportRun #${run.id} trạng thái SUCCEEDED (${run.rowCount} dòng)`);

  // 4. Cập nhật DatasetSnapshot cho run
  await prisma.datasetSnapshot.deleteMany({
    where: { runId: run.id },
  });

  const dataset = await prisma.datasetSnapshot.create({
    data: {
      runId: run.id,
      chunkIndex: 0,
      schema,
      data: btctuCadreRows,
    },
  });
  console.log(`✅ Đã tạo DatasetSnapshot #${dataset.id} cho Run #${run.id} với 23 cán bộ BTCTU!`);

  console.log('🎉 Hoàn tất nạp dữ liệu Báo cáo #5 chuẩn SOP và Câu 2!');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
