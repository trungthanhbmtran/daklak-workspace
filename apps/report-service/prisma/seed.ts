import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../src/generated/prisma/client';
import * as dotenv from 'dotenv';
import { btctuCadreRows, personalWorkbenchRows } from './seed-data';

dotenv.config();

const dbUrl =
  process.env.DATABASE_URL ||
  'mysql://root:mypassword@mysql:3306/admin_report?allowPublicKeyRetrieval=true';
const mariadbUrl = dbUrl.replace(/^mysql:\/\//, 'mariadb://');
const adapter = new PrismaMariaDb(mariadbUrl);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('--- Bắt đầu Đồng bộ Seed Báo cáo & Thống kê Thời gian thực (Report Service) ---');

  // 1. Cập nhật Danh mục Nguồn Dữ liệu Hệ thống (Data Sources)
  await prisma.reportDataSource.deleteMany();
  await prisma.reportDataSource.createMany({
    data: [
      {
        code: 'BTCTU_KPI_STATS',
        name: 'Đánh giá Cán bộ Ban Tổ chức Tỉnh ủy (SOP 4 bước & Mẫu 05)',
        upstream: 'hrm-service',
        path: '/admin/hrm/kpi/evaluations',
        fields: ['id', 'cadreCode', 'fullName', 'departmentId', 'departmentName', 'jobTitle', 'sChung', 'sNhiemVu', 'sTong', 'proposedRank', 'approvedRank', 'hasMau04', 'sopStep', 'status', 'quarterYear'],
      },
      {
        code: 'HRM_TASK_STATS',
        name: 'Quản lý Công việc & Nhiệm vụ Toàn tỉnh',
        upstream: 'hrm-service',
        path: '/admin/hrm/tasks',
        fields: ['id', 'title', 'status', 'priority', 'progress', 'departmentId', 'departmentName', 'assigneeCode', 'assigneeName', 'dueDate', 'isOverdue', 'isCompleted'],
      },
      {
        code: 'USER_CADRE_STATS',
        name: 'Hồ sơ Cán bộ & Tài khoản Công chức Hệ thống',
        upstream: 'user-service',
        path: '/admin/users',
        fields: ['id', 'employeeCode', 'username', 'fullName', 'email', 'phone', 'unitId', 'departmentName', 'jobTitle', 'status', 'isActive'],
      },
      {
        code: 'USER_ORG_STATS',
        name: 'Cơ cấu Tổ chức & Danh mục Đơn vị Hành chính',
        upstream: 'user-service',
        path: '/admin/organizations',
        fields: ['id', 'code', 'name', 'parentId', 'order', 'level', 'status', 'createdAt'],
      },
      {
        code: 'USER_STAFFING_STATS',
        name: 'Vị trí việc làm (VTVL) & Định biên Nhân sự Đơn vị',
        upstream: 'user-service',
        path: '/admin/staffing-slots',
        fields: ['id', 'unitId', 'jobTitleId', 'jobTitleName', 'quantity', 'currentCount', 'missingCount', 'isOver'],
      },
      {
        code: 'DOC_STATS',
        name: 'Lưu chuyển Văn bản Hành chính Đến / Đi',
        upstream: 'document-service',
        path: '/admin/documents',
        fields: ['id', 'documentNumber', 'abstract', 'isIncoming', 'status', 'urgency', 'securityLevel', 'pageCount', 'isLate', 'issueDate', 'departmentId', 'departmentName'],
      },
      {
        code: 'WORKFLOW_STATS',
        name: 'Theo dõi Tiến độ Quy trình Luồng duyệt (Workflow)',
        upstream: 'workflow-service',
        path: '/admin/workflows/instances',
        fields: ['id', 'processDefinitionKey', 'processInstanceId', 'businessKey', 'currentStep', 'assignee', 'status', 'startedAt', 'endedAt', 'durationHours'],
      },
      {
        code: 'POST_STATS',
        name: 'Hoạt động Xuất bản Tin bài Cổng Thông tin Điện tử',
        upstream: 'posts-service',
        path: '/admin/posts',
        fields: ['id', 'title', 'categoryName', 'status', 'viewCount', 'authorName', 'isFeatured', 'publishedDate'],
      },
      {
        code: 'EMPLOYEE_QUALITY',
        name: 'Đánh giá Năng suất & Chất lượng Cán bộ Toàn tỉnh',
        upstream: 'hrm-service',
        path: '/admin/reports/employee-quality',
        fields: ['id', 'employeeName', 'departmentName', 'taskCount', 'completedCount', 'qualityScore', 'ranking'],
      },
      {
        code: 'HRM_PERSONAL_STATS',
        name: 'Bàn làm việc & Thống kê Cá nhân Cán bộ',
        upstream: 'hrm-service',
        path: '/admin/hrm/workbench',
        fields: ['month', 'score', 'completedTasks', 'status', 'departmentName', 'workload', 'title', 'progress', 'role', 'dueDate', 'cadreCode', 'fullName'],
      },
      {
        code: 'BTC_FINANCE_OVERVIEW',
        name: 'Giám sát Tài chính & Ngân sách Tổng hợp tỉnh Đắk Lắk (Bộ Tài chính & LGSP)',
        upstream: 'api-gateway',
        path: '/api/v1/external/btc/overview',
        fields: ['id', 'ma_chi_tieu', 'ten_chi_tieu', 'linh_vuc', 'don_vi_phu_trach', 'du_toan_giao', 'thuc_hien', 'ty_le_dat', 'cung_ky_nam_truoc', 'danh_gia_tien_do', 'ky_bao_cao'],
      },
      {
        code: 'BTC_NSNN_THU',
        name: 'Thu Ngân sách Nhà nước trên địa bàn tỉnh Đắk Lắk (Cục Thuế & Bộ Tài chính)',
        upstream: 'api-gateway',
        path: '/api/v1/external/btc/nsnn_thu',
        fields: ['id', 'dia_ban', 'khoan_thu', 'du_toan_nam', 'so_thuc_thu', 'tien_do_dat', 'cung_ky_nam_truoc', 'thoi_gian', 'ghi_chu'],
      },
      {
        code: 'BTC_NSNN_CHI',
        name: 'Chi Ngân sách Nhà nước tỉnh Đắk Lắk (Kho bạc Nhà nước & Bộ Tài chính)',
        upstream: 'api-gateway',
        path: '/api/v1/external/btc/nsnn_chi',
        fields: ['id', 'linh_vuc_chi', 'du_toan_giao', 'so_da_chi', 'ty_le_giai_ngan', 'thoi_gian', 'ghi_chu'],
      },
      {
        code: 'BTC_DTC_GIAINGAN_TUAN',
        name: 'Giải ngân Vốn Đầu tư công theo tuần - Dự án trọng điểm (Trục Tài chính Đắk Lắk)',
        upstream: 'api-gateway',
        path: '/api/v1/external/btc/dtc_giaingan_tuan',
        fields: ['id', 'ten_du_an', 'chu_dau_tu', 'ke_hoach_von', 'giai_ngan_tuan', 'da_giai_ngan', 'ty_le_dat', 'tuan_bao_cao'],
      },
      {
        code: 'BTC_HHXNK',
        name: 'Kim ngạch Hàng hóa Xuất Nhập khẩu Hải quan Đắk Lắk (Tổng cục Hải quan)',
        upstream: 'api-gateway',
        path: '/api/v1/external/btc/hhxnk',
        fields: ['id', 'ma_hai_quan', 'ten_chi_cuc', 'loai_hinh', 'mat_hang', 'thi_truong', 'so_luong_tan', 'kim_ngach_usd', 'thue_xnk_vnd', 'thoi_gian'],
      },
      {
        code: 'BTC_HDDN',
        name: 'Hóa đơn Điện tử & Hoạt động Doanh nghiệp (Bộ Tài chính & Thuế điện tử)',
        upstream: 'api-gateway',
        path: '/api/v1/external/btc/hddn',
        fields: ['id', 'mst', 'ten_doanh_nghiep', 'loai_hoa_don', 'so_luong_hd', 'tong_tien_truoc_thue', 'tien_thue', 'ky_ke_khai'],
      },
    ],
  });

  // 2. Dọn dẹp các Template và Widget cũ để tái cấu trúc
  await prisma.reportAssignment.deleteMany({});
  await prisma.reportWidget.deleteMany({});
  await prisma.reportTemplate.deleteMany({});

  // ────────────────── TẠO CÁC TEMPLATE BÁO CÁO & WIDGETS GIAO DIỆN ──────────────────

  // 2.1 Template 1: Quản lý Công việc & Nhiệm vụ
  await prisma.reportTemplate.create({
    data: {
      title: 'Báo cáo Tổng hợp Quản lý Công việc & Nhiệm vụ',
      description: 'Thống kê động tiến độ, trạng thái và tỷ lệ hoàn thành nhiệm vụ theo phòng ban và nhân sự',
      layout: { cols: 12, rows: 6 },
      widgets: {
        create: [
          {
            title: 'Cơ cấu trạng thái nhiệm vụ',
            chartType: 'PIE',
            dataSourceCode: 'HRM_TASK_STATS',
            xAxisKey: 'status',
            yAxisKey: 'id',
            config: { yAxisLabel: 'Số lượng nhiệm vụ' },
          },
          {
            title: 'Tiến độ trung bình theo phòng ban',
            chartType: 'BAR',
            dataSourceCode: 'HRM_TASK_STATS',
            xAxisKey: 'departmentName',
            yAxisKey: 'progress',
            config: { yAxisLabel: 'Tiến độ trung bình (%)' },
          },
          {
            title: 'Bảng theo dõi chi tiết nhiệm vụ',
            chartType: 'TABLE',
            dataSourceCode: 'HRM_TASK_STATS',
            xAxisKey: 'title',
            yAxisKey: 'progress',
            config: {
              source: { upstream: 'hrm-service', path: '/admin/hrm/tasks', params: {} },
              table: {
                version: 1,
                dataPath: 'items',
                columns: [
                  { key: 'title', path: 'title', label: 'Tên nhiệm vụ', type: 'string', aggregate: 'none' },
                  { key: 'departmentName', path: 'departmentName', label: 'Phòng ban', type: 'string', aggregate: 'none' },
                  { key: 'assigneeName', path: 'assigneeName', label: 'Người thực hiện', type: 'string', aggregate: 'none' },
                  { key: 'status', path: 'status', label: 'Trạng thái', type: 'string', aggregate: 'none' },
                  { key: 'progress', path: 'progress', label: 'Tiến độ (%)', type: 'number', aggregate: 'avg' },
                ],
                groupBy: ['title', 'departmentName', 'assigneeName', 'status'],
                filters: [],
                page: 1,
                pageSize: 20,
              },
            },
          },
        ],
      },
    },
  });

  // 2.2 Template 2: Quản lý Văn bản Hành chính
  await prisma.reportTemplate.create({
    data: {
      title: 'Báo cáo Lưu chuyển và Xử lý Văn bản Hành chính',
      description: 'Thống kê số lượng văn bản đến/đi, độ khẩn và tình trạng xử lý hồ sơ',
      layout: { cols: 12, rows: 6 },
      widgets: {
        create: [
          {
            title: 'Tỷ lệ văn bản theo độ khẩn',
            chartType: 'PIE',
            dataSourceCode: 'DOC_STATS',
            xAxisKey: 'urgency',
            yAxisKey: 'id',
            config: { yAxisLabel: 'Số lượng văn bản' },
          },
          {
            title: 'Phân bố văn bản theo trạng thái',
            chartType: 'BAR',
            dataSourceCode: 'DOC_STATS',
            xAxisKey: 'status',
            yAxisKey: 'id',
            config: { yAxisLabel: 'Số lượng văn bản' },
          },
          {
            title: 'Bảng chi tiết văn bản',
            chartType: 'TABLE',
            dataSourceCode: 'DOC_STATS',
            xAxisKey: 'documentNumber',
            yAxisKey: 'pageCount',
            config: {
              source: { upstream: 'document-service', path: '/admin/documents', params: {} },
              table: {
                version: 1,
                dataPath: 'items',
                columns: [
                  { key: 'documentNumber', path: 'documentNumber', label: 'Số văn bản', type: 'string', aggregate: 'none' },
                  { key: 'abstract', path: 'abstract', label: 'Trích yếu', type: 'string', aggregate: 'none' },
                  { key: 'isIncoming', path: 'isIncoming', label: 'Loại văn bản', type: 'string', aggregate: 'none' },
                  { key: 'status', path: 'status', label: 'Trạng thái', type: 'string', aggregate: 'none' },
                  { key: 'pageCount', path: 'pageCount', label: 'Số trang', type: 'number', aggregate: 'sum' },
                ],
                groupBy: ['documentNumber', 'abstract', 'isIncoming', 'status'],
                filters: [],
                page: 1,
                pageSize: 20,
              },
            },
          },
        ],
      },
    },
  });

  // 2.3 Template 3: Hoạt động Cổng thông tin & Bài viết
  await prisma.reportTemplate.create({
    data: {
      title: 'Báo cáo Hoạt động Xuất bản Cổng Thông tin',
      description: 'Thống kê số lượng bài viết, chuyên mục và lượt truy cập đọc giả',
      layout: { cols: 12, rows: 6 },
      widgets: {
        create: [
          {
            title: 'Số lượng bài viết theo chuyên mục',
            chartType: 'BAR',
            dataSourceCode: 'POST_STATS',
            xAxisKey: 'categoryName',
            yAxisKey: 'id',
            config: { yAxisLabel: 'Số bài viết' },
          },
          {
            title: 'Tỷ lệ bài viết theo trạng thái',
            chartType: 'PIE',
            dataSourceCode: 'POST_STATS',
            xAxisKey: 'status',
            yAxisKey: 'id',
            config: { yAxisLabel: 'Số lượng' },
          },
          {
            title: 'Lượt xem theo bài viết',
            chartType: 'LINE',
            dataSourceCode: 'POST_STATS',
            xAxisKey: 'title',
            yAxisKey: 'viewCount',
            config: { yAxisLabel: 'Lượt xem' },
          },
        ],
      },
    },
  });

  // 2.4 Template 4: Đánh giá Chất lượng Nhân sự
  await prisma.reportTemplate.create({
    data: {
      title: 'Báo cáo Đánh giá Chất lượng Nhân sự Toàn diện',
      description: 'Tổng hợp đánh giá chất lượng cán bộ dựa trên năng suất xử lý văn bản và kết quả công việc',
      layout: { cols: 12, rows: 6 },
      widgets: {
        create: [
          {
            title: 'Điểm chất lượng cán bộ',
            chartType: 'BAR',
            dataSourceCode: 'EMPLOYEE_QUALITY',
            xAxisKey: 'employeeName',
            yAxisKey: 'qualityScore',
            config: { yAxisLabel: 'Điểm chất lượng' },
          },
          {
            title: 'Số nhiệm vụ hoàn thành theo cán bộ',
            chartType: 'BAR',
            dataSourceCode: 'EMPLOYEE_QUALITY',
            xAxisKey: 'employeeName',
            yAxisKey: 'taskCount',
            config: { yAxisLabel: 'Số nhiệm vụ' },
          },
        ],
      },
    },
  });

  // 2.5 Template 5: Đánh giá Cán bộ Ban Tổ chức Tỉnh ủy (Chuẩn SOP & Mẫu 05)
  await prisma.reportTemplate.create({
    data: {
      title: 'Báo cáo Đánh giá Cán bộ Ban Tổ chức Tỉnh ủy (Chuẩn SOP & Mẫu 05)',
      description: 'Tổng hợp kết quả đánh giá, xếp loại cán bộ và tiến độ SOP 4 bước chuẩn Ban Tổ chức Tỉnh ủy Đắk Lắk',
      layout: { cols: 12, rows: 6 },
      widgets: {
        create: [
          {
            title: 'Phân bổ Xếp loại Thi đua Cán bộ',
            chartType: 'PIE',
            dataSourceCode: 'BTCTU_KPI_STATS',
            xAxisKey: 'approvedRank',
            yAxisKey: 'sTong',
            config: { yAxisLabel: 'Số lượng cán bộ' },
          },
          {
            title: 'Tiến độ Quy trình SOP 4 Bước',
            chartType: 'BAR',
            dataSourceCode: 'BTCTU_KPI_STATS',
            xAxisKey: 'sopStep',
            yAxisKey: 'sTong',
            config: { yAxisLabel: 'Số cán bộ' },
          },
          {
            title: 'Điểm Trung bình theo Phòng ban',
            chartType: 'BAR',
            dataSourceCode: 'BTCTU_KPI_STATS',
            xAxisKey: 'departmentName',
            yAxisKey: 'sTong',
            config: { yAxisLabel: 'Điểm trung bình' },
          },
          {
            title: 'Điểm Chất lượng Năng suất theo Cán bộ',
            chartType: 'LINE',
            dataSourceCode: 'BTCTU_KPI_STATS',
            xAxisKey: 'fullName',
            yAxisKey: 'sTong',
            config: { yAxisLabel: 'Điểm tổng hợp' },
          },
        ],
      },
      assignments: {
        create: [
          { assigneeType: 'UNIT', assigneeId: '56', permissions: 'VIEW' },
          { assigneeType: 'UNIT', assigneeId: '18', permissions: 'VIEW' },
          { assigneeType: 'UNIT', assigneeId: '32', permissions: 'VIEW' },
        ],
      },
    },
  });

  // 2.6 Template 6: Bàn làm việc Cá nhân
  await prisma.reportTemplate.create({
    data: {
      title: 'Bàn làm việc & Dashboard Cá nhân',
      description: 'Chỉ số tiến độ cá nhân, tỷ lệ hoàn thành công việc và tải công việc 6 tháng gần nhất',
      layout: { cols: 12, rows: 6 },
      widgets: {
        create: [
          {
            title: 'Tiến độ & Điểm chất lượng 6 tháng gần nhất',
            chartType: 'LINE',
            dataSourceCode: 'HRM_PERSONAL_STATS',
            xAxisKey: 'month',
            yAxisKey: 'score',
            config: { yAxisLabel: 'Điểm KPI' },
          },
          {
            title: 'Cơ cấu Trạng thái Nhiệm vụ Cá nhân',
            chartType: 'PIE',
            dataSourceCode: 'HRM_PERSONAL_STATS',
            xAxisKey: 'status',
            yAxisKey: 'completedTasks',
            config: { yAxisLabel: 'Số nhiệm vụ' },
          },
          {
            title: 'Tiến độ Thực hiện Nhiệm vụ Cá nhân',
            chartType: 'BAR',
            dataSourceCode: 'HRM_PERSONAL_STATS',
            xAxisKey: 'title',
            yAxisKey: 'progress',
            config: { yAxisLabel: 'Tiến độ (%)' },
          },
        ],
      },
      assignments: {
        create: [
          { assigneeType: 'UNIT', assigneeId: '56', permissions: 'VIEW' },
          { assigneeType: 'UNIT', assigneeId: '18', permissions: 'VIEW' },
        ],
      },
    },
  });

  // ────────────────── 3. SEED REPORT DEFINITIONS (V2 DYNAMIC REPORT ENGINE) ──────────────────
  await prisma.reportDefinition.deleteMany({});

  // 3.1 REP_BTCTU_SOP_KPI
  const btctuDef = await prisma.reportDefinition.create({
    data: {
      code: 'REP_BTCTU_SOP_KPI',
      name: 'Báo cáo Xếp loại & Đánh giá Cán bộ Ban Tổ chức Tỉnh ủy (SOP & Mẫu 05)',
      description: 'Báo cáo tổng hợp cơ cấu xếp loại thi đua, đánh giá cán bộ và quy trình 4 bước chuẩn Nghị định 30, Quyết định 348-QĐ/BTCTW của Ban Tổ chức Tỉnh ủy Đắk Lắk.',
      version: 1,
      configuration: {
        version: 1,
        sources: [
          {
            id: 'BTCTU_KPI_STATS',
            endpoint: 'BTCTU_KPI_STATS',
            name: 'Đánh giá Cán bộ BTCTU',
            upstream: 'hrm-service',
            path: '/admin/hrm/kpi/evaluations',
            fields: ['id', 'cadreCode', 'fullName', 'departmentName', 'jobTitle', 'sChung', 'sNhiemVu', 'sTong', 'proposedRank', 'approvedRank', 'hasMau04', 'sopStep', 'status', 'quarterYear'],
          },
        ],
        joins: [],
        filters: [],
        columns: [
          { key: 'id', source: 'BTCTU_KPI_STATS', field: 'id', type: 'number', label: 'STT', aggregate: 'none' },
          { key: 'cadreCode', source: 'BTCTU_KPI_STATS', field: 'cadreCode', type: 'string', label: 'Mã cán bộ', aggregate: 'none' },
          { key: 'fullName', source: 'BTCTU_KPI_STATS', field: 'fullName', type: 'string', label: 'Họ và tên cán bộ', aggregate: 'none' },
          { key: 'departmentName', source: 'BTCTU_KPI_STATS', field: 'departmentName', type: 'string', label: 'Phòng ban / Đơn vị', aggregate: 'none' },
          { key: 'jobTitle', source: 'BTCTU_KPI_STATS', field: 'jobTitle', type: 'string', label: 'Vị trí việc làm (VTVL)', aggregate: 'none' },
          { key: 'sChung', source: 'BTCTU_KPI_STATS', field: 'sChung', type: 'number', label: 'Điểm chung (30đ)', aggregate: 'avg' },
          { key: 'sNhiemVu', source: 'BTCTU_KPI_STATS', field: 'sNhiemVu', type: 'number', label: 'Điểm nhiệm vụ (70đ)', aggregate: 'avg' },
          { key: 'sTong', source: 'BTCTU_KPI_STATS', field: 'sTong', type: 'number', label: 'Tổng điểm (100đ)', aggregate: 'avg' },
          { key: 'proposedRank', source: 'BTCTU_KPI_STATS', field: 'proposedRank', type: 'string', label: 'Đề xuất xếp loại', aggregate: 'none' },
          { key: 'approvedRank', source: 'BTCTU_KPI_STATS', field: 'approvedRank', type: 'string', label: 'Xếp loại chính thức', aggregate: 'none' },
          { key: 'hasMau04', source: 'BTCTU_KPI_STATS', field: 'hasMau04', type: 'string', label: 'Việc nổi trội (Mẫu 04)', aggregate: 'none' },
          { key: 'sopStep', source: 'BTCTU_KPI_STATS', field: 'sopStep', type: 'string', label: 'Tiến độ SOP 4 Bước', aggregate: 'none' },
          { key: 'status', source: 'BTCTU_KPI_STATS', field: 'status', type: 'string', label: 'Trạng thái', aggregate: 'none' },
          { key: 'quarterYear', source: 'BTCTU_KPI_STATS', field: 'quarterYear', type: 'string', label: 'Kỳ đánh giá', aggregate: 'none' },
        ],
        groupBy: [],
        charts: [
          { type: 'pie', xAxis: 'approvedRank', yAxis: 'sTong', title: 'Cơ cấu Xếp loại Thi đua Cán bộ' },
          { type: 'bar', xAxis: 'sopStep', yAxis: 'sTong', title: 'Tiến độ Thực hiện Quy trình SOP 4 Bước' },
          { type: 'bar', xAxis: 'departmentName', yAxis: 'sTong', title: 'Điểm Đánh giá Trung bình theo Phòng ban' },
          { type: 'line', xAxis: 'fullName', yAxis: 'sTong', title: 'Biểu đồ Điểm Số Cán bộ Ban Tổ chức Tỉnh ủy' },
        ],
      },
    },
  });

  // 3.2 REP_HRM_TASKS
  const taskDef = await prisma.reportDefinition.create({
    data: {
      code: 'REP_HRM_TASKS',
      name: 'Báo cáo Tổng hợp Quản lý Công việc & Nhiệm vụ Toàn tỉnh',
      description: 'Thống kê chi tiết các nhiệm vụ phân công, theo dõi tiến độ, cơ cấu trạng thái và xếp loại theo phòng ban tại các cơ quan, đơn vị.',
      version: 1,
      configuration: {
        version: 1,
        sources: [
          {
            id: 'HRM_TASK_STATS',
            endpoint: 'HRM_TASK_STATS',
            name: 'Thống kê nhiệm vụ',
            upstream: 'hrm-service',
            path: '/admin/hrm/tasks',
            fields: ['id', 'title', 'status', 'priority', 'progress', 'departmentName', 'assigneeName', 'dueDate', 'isOverdue', 'isCompleted'],
          },
        ],
        joins: [],
        filters: [],
        columns: [
          { key: 'id', source: 'HRM_TASK_STATS', field: 'id', type: 'number', label: 'Mã NV', aggregate: 'none' },
          { key: 'title', source: 'HRM_TASK_STATS', field: 'title', type: 'string', label: 'Tên nhiệm vụ', aggregate: 'none' },
          { key: 'departmentName', source: 'HRM_TASK_STATS', field: 'departmentName', type: 'string', label: 'Phòng ban', aggregate: 'none' },
          { key: 'assigneeName', source: 'HRM_TASK_STATS', field: 'assigneeName', type: 'string', label: 'Người phụ trách', aggregate: 'none' },
          { key: 'status', source: 'HRM_TASK_STATS', field: 'status', type: 'string', label: 'Trạng thái', aggregate: 'none' },
          { key: 'progress', source: 'HRM_TASK_STATS', field: 'progress', type: 'number', label: 'Tiến độ (%)', aggregate: 'none' },
          { key: 'isOverdue', source: 'HRM_TASK_STATS', field: 'isOverdue', type: 'string', label: 'Hạn định', aggregate: 'none' },
          { key: 'isCompleted', source: 'HRM_TASK_STATS', field: 'isCompleted', type: 'string', label: 'Kết quả', aggregate: 'none' },
        ],
        groupBy: [],
        charts: [
          { type: 'bar', xAxis: 'status', yAxis: 'progress', title: 'Phân bổ Tiến độ theo Trạng thái Nhiệm vụ' },
          { type: 'pie', xAxis: 'status', yAxis: 'id', title: 'Cơ cấu Trạng thái Nhiệm vụ' },
          { type: 'line', xAxis: 'departmentName', yAxis: 'progress', title: 'Xu hướng Tiến độ theo Phòng ban' },
        ],
      },
    },
  });

  // 3.3 REP_DOC_STATS
  const docDef = await prisma.reportDefinition.create({
    data: {
      code: 'REP_DOC_STATS',
      name: 'Báo cáo Lưu chuyển và Xử lý Văn bản Hành chính',
      description: 'Tổng hợp phân bổ văn bản đến/đi, cơ cấu theo mức độ khẩn và kết quả giải quyết văn bản hành chính công.',
      version: 1,
      configuration: {
        version: 1,
        sources: [
          {
            id: 'DOC_STATS',
            endpoint: 'DOC_STATS',
            name: 'Thống kê văn bản',
            upstream: 'document-service',
            path: '/admin/documents',
            fields: ['id', 'documentNumber', 'abstract', 'status', 'isIncoming', 'urgency', 'securityLevel', 'pageCount', 'isLate'],
          },
        ],
        joins: [],
        filters: [],
        columns: [
          { key: 'id', source: 'DOC_STATS', field: 'id', type: 'number', label: 'ID', aggregate: 'none' },
          { key: 'documentNumber', source: 'DOC_STATS', field: 'documentNumber', type: 'string', label: 'Số hiệu văn bản', aggregate: 'none' },
          { key: 'abstract', source: 'DOC_STATS', field: 'abstract', type: 'string', label: 'Trích yếu', aggregate: 'none' },
          { key: 'isIncoming', source: 'DOC_STATS', field: 'isIncoming', type: 'string', label: 'Loại văn bản', aggregate: 'none' },
          { key: 'status', source: 'DOC_STATS', field: 'status', type: 'string', label: 'Trạng thái', aggregate: 'none' },
          { key: 'urgency', source: 'DOC_STATS', field: 'urgency', type: 'string', label: 'Độ khẩn', aggregate: 'none' },
          { key: 'securityLevel', source: 'DOC_STATS', field: 'securityLevel', type: 'string', label: 'Mức độ mật', aggregate: 'none' },
          { key: 'isLate', source: 'DOC_STATS', field: 'isLate', type: 'string', label: 'Tiến độ xử lý', aggregate: 'none' },
        ],
        groupBy: [],
        charts: [
          { type: 'pie', xAxis: 'urgency', yAxis: 'id', title: 'Tỷ lệ Văn bản theo Mức độ Khẩn' },
          { type: 'bar', xAxis: 'status', yAxis: 'id', title: 'Phân bố Văn bản theo Tình trạng Xử lý' },
        ],
      },
    },
  });

  // 3.4 REP_POST_STATS
  const postDef = await prisma.reportDefinition.create({
    data: {
      code: 'REP_POST_STATS',
      name: 'Báo cáo Hoạt động Cổng Thông tin & Bài viết',
      description: 'Thống kê xuất bản tin bài, cơ cấu bài viết theo chuyên mục khoa học công nghệ và lượt xem truy cập.',
      version: 1,
      configuration: {
        version: 1,
        sources: [
          {
            id: 'POST_STATS',
            endpoint: 'POST_STATS',
            name: 'Thống kê bài viết',
            upstream: 'posts-service',
            path: '/admin/posts',
            fields: ['id', 'title', 'categoryName', 'status', 'viewCount', 'authorName', 'isFeatured', 'publishedDate'],
          },
        ],
        joins: [],
        filters: [],
        columns: [
          { key: 'id', source: 'POST_STATS', field: 'id', type: 'number', label: 'ID', aggregate: 'none' },
          { key: 'title', source: 'POST_STATS', field: 'title', type: 'string', label: 'Tiêu đề bài viết', aggregate: 'none' },
          { key: 'categoryName', source: 'POST_STATS', field: 'categoryName', type: 'string', label: 'Chuyên mục', aggregate: 'none' },
          { key: 'status', source: 'POST_STATS', field: 'status', type: 'string', label: 'Trạng thái', aggregate: 'none' },
          { key: 'viewCount', source: 'POST_STATS', field: 'viewCount', type: 'number', label: 'Lượt xem', aggregate: 'none' },
          { key: 'authorName', source: 'POST_STATS', field: 'authorName', type: 'string', label: 'Tác giả', aggregate: 'none' },
        ],
        groupBy: [],
        charts: [
          { type: 'bar', xAxis: 'categoryName', yAxis: 'viewCount', title: 'Tổng Lượt xem theo Chuyên mục' },
          { type: 'pie', xAxis: 'status', yAxis: 'id', title: 'Cơ cấu Trạng thái Duyệt Bài viết' },
          { type: 'line', xAxis: 'title', yAxis: 'viewCount', title: 'Biểu đồ Tương tác theo Tin bài' },
        ],
      },
    },
  });

  // 3.5 REP_EMP_QUALITY
  const empDef = await prisma.reportDefinition.create({
    data: {
      code: 'REP_EMP_QUALITY',
      name: 'Báo cáo Đánh giá Năng suất & Chất lượng Cán bộ Toàn tỉnh',
      description: 'Đánh giá tổng hợp điểm chất lượng công việc, tỷ lệ hoàn thành nhiệm vụ của cán bộ công chức thuộc các cơ quan Đảng, Sở Ban Ngành.',
      version: 1,
      configuration: {
        version: 1,
        sources: [
          {
            id: 'EMPLOYEE_QUALITY',
            endpoint: 'EMPLOYEE_QUALITY',
            name: 'Đánh giá chất lượng nhân sự',
            upstream: 'hrm-service',
            path: '/admin/reports/employee-quality',
            fields: ['employeeName', 'departmentName', 'taskCount', 'completedCount', 'qualityScore', 'ranking'],
          },
        ],
        joins: [],
        filters: [],
        columns: [
          { key: 'employeeName', source: 'EMPLOYEE_QUALITY', field: 'employeeName', type: 'string', label: 'Họ và tên', aggregate: 'none' },
          { key: 'departmentName', source: 'EMPLOYEE_QUALITY', field: 'departmentName', type: 'string', label: 'Phòng ban', aggregate: 'none' },
          { key: 'taskCount', source: 'EMPLOYEE_QUALITY', field: 'taskCount', type: 'number', label: 'Tổng nhiệm vụ', aggregate: 'none' },
          { key: 'completedCount', source: 'EMPLOYEE_QUALITY', field: 'completedCount', type: 'number', label: 'Đã hoàn thành', aggregate: 'none' },
          { key: 'qualityScore', source: 'EMPLOYEE_QUALITY', field: 'qualityScore', type: 'number', label: 'Điểm chất lượng (100)', aggregate: 'none' },
          { key: 'ranking', source: 'EMPLOYEE_QUALITY', field: 'ranking', type: 'string', label: 'Xếp loại', aggregate: 'none' },
        ],
        groupBy: [],
        charts: [
          { type: 'bar', xAxis: 'employeeName', yAxis: 'qualityScore', title: 'Điểm Chất lượng Năng suất Cán bộ' },
        ],
      },
    },
  });

  // 3.6 REP_BTC_FINANCE_DAKLAK
  const financeDef = await prisma.reportDefinition.create({
    data: {
      code: 'REP_BTC_FINANCE_DAKLAK',
      name: 'Báo cáo & Dashboard Giám sát Số liệu Ngành Tài chính tỉnh Đắk Lắk (Trục Bộ Tài chính & LGSP)',
      description: 'Hệ thống giám sát điều hành toàn diện số liệu tài chính công: tổng hợp thu - chi ngân sách nhà nước, tiến độ giải ngân vốn đầu tư công các công trình trọng điểm, kim ngạch xuất nhập khẩu nông sản chủ lực (cà phê, tiêu, sầu riêng) và quản lý hóa đơn điện tử doanh nghiệp theo mẫu trục liên thông LGSP tỉnh Đắk Lắk & Bộ Tài chính.',
      version: 1,
      configuration: {
        version: 1,
        sources: [
          {
            id: 'BTC_FINANCE_OVERVIEW',
            endpoint: 'BTC_FINANCE_OVERVIEW',
            name: 'Tổng hợp Giám sát Tài chính Ngân sách',
            upstream: 'api-gateway',
            path: '/api/v1/external/btc/overview',
            fields: ['id', 'ma_chi_tieu', 'ten_chi_tieu', 'linh_vuc', 'don_vi_phu_trach', 'du_toan_giao', 'thuc_hien', 'ty_le_dat', 'cung_ky_nam_truoc', 'danh_gia_tien_do', 'ky_bao_cao'],
          },
        ],
        joins: [],
        filters: [],
        columns: [
          { key: 'id', source: 'BTC_FINANCE_OVERVIEW', field: 'id', type: 'number', label: 'STT', aggregate: 'none' },
          { key: 'ma_chi_tieu', source: 'BTC_FINANCE_OVERVIEW', field: 'ma_chi_tieu', type: 'string', label: 'Mã chỉ tiêu', aggregate: 'none' },
          { key: 'ten_chi_tieu', source: 'BTC_FINANCE_OVERVIEW', field: 'ten_chi_tieu', type: 'string', label: 'Chỉ tiêu giám sát tài chính', aggregate: 'none' },
          { key: 'linh_vuc', source: 'BTC_FINANCE_OVERVIEW', field: 'linh_vuc', type: 'string', label: 'Lĩnh vực tài chính', aggregate: 'none' },
          { key: 'don_vi_phu_trach', source: 'BTC_FINANCE_OVERVIEW', field: 'don_vi_phu_trach', type: 'string', label: 'Đơn vị chủ trì', aggregate: 'none' },
          { key: 'du_toan_giao', source: 'BTC_FINANCE_OVERVIEW', field: 'du_toan_giao', type: 'number', label: 'Dự toán / Kế hoạch vốn (VNĐ)', aggregate: 'sum' },
          { key: 'thuc_hien', source: 'BTC_FINANCE_OVERVIEW', field: 'thuc_hien', type: 'number', label: 'Thực hiện / Giải ngân (VNĐ)', aggregate: 'sum' },
          { key: 'ty_le_dat', source: 'BTC_FINANCE_OVERVIEW', field: 'ty_le_dat', type: 'number', label: 'Tiến độ đạt (%)', aggregate: 'avg' },
          { key: 'cung_ky_nam_truoc', source: 'BTC_FINANCE_OVERVIEW', field: 'cung_ky_nam_truoc', type: 'number', label: 'Cùng kỳ năm trước (VNĐ)', aggregate: 'sum' },
          { key: 'danh_gia_tien_do', source: 'BTC_FINANCE_OVERVIEW', field: 'danh_gia_tien_do', type: 'string', label: 'Đánh giá tiến độ', aggregate: 'none' },
          { key: 'ky_bao_cao', source: 'BTC_FINANCE_OVERVIEW', field: 'ky_bao_cao', type: 'string', label: 'Kỳ báo cáo', aggregate: 'none' },
        ],
        groupBy: [],
        charts: [
          { type: 'bar', xAxis: 'ten_chi_tieu', yAxis: 'thuc_hien', title: 'Số Thực hiện / Giải ngân theo Chỉ tiêu Tài chính (VNĐ)' },
          { type: 'pie', xAxis: 'linh_vuc', yAxis: 'thuc_hien', title: 'Cơ cấu Phân bổ Nguồn vốn theo Lĩnh vực Tài chính' },
          { type: 'line', xAxis: 'ten_chi_tieu', yAxis: 'ty_le_dat', title: 'Tỷ lệ Hoàn thành Tiến độ các Chỉ tiêu Tài chính (%)' },
          { type: 'bar', xAxis: 'don_vi_phu_trach', yAxis: 'thuc_hien', title: 'Quy mô Thực hiện theo Đơn vị Chủ trì' },
        ],
      },
    },
  });

  // ────────────────── 4. NẠP SNAPSHOT KHỞI TẠO BÁM SÁT DỮ LIỆU THỰC TẾ ──────────────────
  await prisma.statisticsSnapshot.deleteMany({});

  // 4.1 Snapshot BTCTU_KPI_STATS
  await prisma.statisticsSnapshot.create({
    data: {
      dataSourceCode: 'BTCTU_KPI_STATS',
      data: btctuCadreRows as any,
      recordedAt: new Date(),
    },
  });

  // 4.2 Snapshot HRM_PERSONAL_STATS
  await prisma.statisticsSnapshot.create({
    data: {
      dataSourceCode: 'HRM_PERSONAL_STATS',
      data: personalWorkbenchRows as any,
      recordedAt: new Date(),
    },
  });

  // 4.3 Snapshot HRM_TASK_STATS (Dữ liệu mẫu chuẩn cấu trúc thật)
  const taskRows = [
    { id: 1, title: 'Xây dựng Báo cáo Đề án 01-ĐA/TU về VTVL', status: 'Hoàn thành', priority: 'Ưu tiên cao', progress: 100, departmentName: 'Phòng Tổ chức cán bộ', assigneeName: 'Hoàng Đức Nam', isOverdue: 'Đúng hạn', isCompleted: 'Hoàn thành' },
    { id: 2, title: 'Thẩm định hồ sơ cán bộ bổ nhiệm đợt 1/2026', status: 'Đang thực hiện', priority: 'Ưu tiên cao', progress: 85, departmentName: 'Phòng Tổ chức cán bộ', assigneeName: 'Phạm Thị Mai', isOverdue: 'Đúng hạn', isCompleted: 'Chưa hoàn thành' },
    { id: 3, title: 'Thẩm tra tiêu chuẩn chính trị nội bộ 05 nhân sự', status: 'Hoàn thành', priority: 'Khẩn cấp', progress: 100, departmentName: 'Phòng Bảo vệ chính trị nội bộ', assigneeName: 'Vũ Văn Hùng', isOverdue: 'Đúng hạn', isCompleted: 'Hoàn thành' },
    { id: 4, title: 'Rà soát dữ liệu đảng viên toàn tỉnh qua LGSP', status: 'Đang thực hiện', priority: 'Bình thường', progress: 75, departmentName: 'Phòng Tổ chức đảng, đảng viên', assigneeName: 'Lê Đình Hoàng', isOverdue: 'Đúng hạn', isCompleted: 'Chưa hoàn thành' },
    { id: 5, title: 'Ban hành thông báo lịch họp giao ban công tác tháng', status: 'Hoàn thành', priority: 'Bình thường', progress: 100, departmentName: 'Văn phòng Ban', assigneeName: 'Đỗ Thị Lan', isOverdue: 'Đúng hạn', isCompleted: 'Hoàn thành' },
    { id: 6, title: 'Dự thảo Kế hoạch đào tạo bồi dưỡng cán bộ năm 2026', status: 'Đang thực hiện', priority: 'Bình thường', progress: 60, departmentName: 'Phòng Tổ chức cán bộ', assigneeName: 'Nguyễn Văn Tâm', isOverdue: 'Đúng hạn', isCompleted: 'Chưa hoàn thành' },
  ];
  await prisma.statisticsSnapshot.create({
    data: {
      dataSourceCode: 'HRM_TASK_STATS',
      data: taskRows as any,
      recordedAt: new Date(),
    },
  });

  // 4.4 Snapshot DOC_STATS
  const docRows = [
    { id: 1, documentNumber: '105-QĐ/TU', abstract: 'Quyết định ban hành Quy chế làm việc của Ban Tổ chức Tỉnh ủy', isIncoming: 'Văn bản đi', status: 'Đã ban hành', urgency: 'Khẩn', securityLevel: 'Thường', pageCount: 18, isLate: 'Đúng hạn' },
    { id: 2, documentNumber: '42-CV/BTCTU', abstract: 'Công văn hướng dẫn đánh giá, xếp loại chất lượng cán bộ năm 2026', isIncoming: 'Văn bản đi', status: 'Đã ban hành', urgency: 'Bình thường', securityLevel: 'Thường', pageCount: 8, isLate: 'Đúng hạn' },
    { id: 3, documentNumber: '1288/UBND-TH', abstract: 'Văn bản phối hợp rà soát danh mục vị trí việc làm các cơ quan hành chính', isIncoming: 'Văn bản đến', status: 'Đang thực hiện', urgency: 'Thượng khẩn', securityLevel: 'Thường', pageCount: 5, isLate: 'Đúng hạn' },
    { id: 4, documentNumber: '15-BC/TCCB', abstract: 'Báo cáo tổng hợp kết quả công tác cán bộ Quý I/2026', isIncoming: 'Văn bản đi', status: 'Đã hoàn thành', urgency: 'Bình thường', securityLevel: 'Mật', pageCount: 12, isLate: 'Đúng hạn' },
  ];
  await prisma.statisticsSnapshot.create({
    data: {
      dataSourceCode: 'DOC_STATS',
      data: docRows as any,
      recordedAt: new Date(),
    },
  });

  // 4.5 Snapshot POST_STATS
  const postRows = [
    { id: 1, title: 'Ban Tổ chức Tỉnh ủy Đắk Lắk triển khai ứng dụng CĐS trong công tác cán bộ', categoryName: 'Tin tức Đảng vụ', status: 'Đã xuất bản', viewCount: 1420, authorName: 'Ban Biên tập', isFeatured: 'Nổi bật', publishedDate: '2026-10-10' },
    { id: 2, title: 'Nâng cao chất lượng đánh giá cán bộ qua mô hình KPI và Đề án 01-ĐA/TU', categoryName: 'Nghiên cứu - Trao đổi', status: 'Đã xuất bản', viewCount: 980, authorName: 'Phòng TCCB', isFeatured: 'Bình thường', publishedDate: '2026-10-12' },
    { id: 3, title: 'Tỉnh ủy Đắk Lắk sơ kết công tác xây dựng Đảng Quý III/2026', categoryName: 'Thời sự Chính trị', status: 'Đã xuất bản', viewCount: 2150, authorName: 'Văn phòng Tỉnh ủy', isFeatured: 'Nổi bật', publishedDate: '2026-10-14' },
  ];
  await prisma.statisticsSnapshot.create({
    data: {
      dataSourceCode: 'POST_STATS',
      data: postRows as any,
      recordedAt: new Date(),
    },
  });

  // 4.6 Snapshot EMPLOYEE_QUALITY
  const empQualityRows = [
    { id: 1, employeeName: 'Hoàng Đức Nam', departmentName: 'Phòng Tổ chức cán bộ', taskCount: 8, completedCount: 8, qualityScore: 98, ranking: 'Hoàn thành xuất sắc' },
    { id: 2, employeeName: 'Lê Đình Hoàng', departmentName: 'Phòng Tổ chức đảng, đảng viên', taskCount: 7, completedCount: 7, qualityScore: 97, ranking: 'Hoàn thành xuất sắc' },
    { id: 3, employeeName: 'Vũ Văn Hùng', departmentName: 'Phòng Bảo vệ chính trị nội bộ', taskCount: 6, completedCount: 6, qualityScore: 96, ranking: 'Hoàn thành xuất sắc' },
    { id: 4, employeeName: 'Đỗ Thị Lan', departmentName: 'Văn phòng Ban', taskCount: 9, completedCount: 9, qualityScore: 95, ranking: 'Hoàn thành xuất sắc' },
    { id: 5, employeeName: 'Phạm Thị Mai', departmentName: 'Phòng Tổ chức cán bộ', taskCount: 6, completedCount: 5, qualityScore: 89, ranking: 'Hoàn thành tốt' },
    { id: 6, employeeName: 'Nguyễn Văn Tâm', departmentName: 'Phòng Tổ chức cán bộ', taskCount: 5, completedCount: 4, qualityScore: 85, ranking: 'Hoàn thành tốt' },
  ];
  await prisma.statisticsSnapshot.create({
    data: {
      dataSourceCode: 'EMPLOYEE_QUALITY',
      data: empQualityRows as any,
      recordedAt: new Date(),
    },
  });

  // ────────────────── 5. SEED INITIAL REPORT RUN & DATASET SNAPSHOT ──────────────────
  // Tạo sẵn run đầu tiên cho các báo cáo để khi người dùng mở ra có ngay dữ liệu không bị màn hình trắng
  const allDefs = [
    { def: btctuDef, rows: btctuCadreRows },
    { def: taskDef, rows: taskRows },
    { def: docDef, rows: docRows },
    { def: postDef, rows: postRows },
    { def: empDef, rows: empQualityRows },
  ];

  for (const item of allDefs) {
    const run = await prisma.reportRun.create({
      data: {
        reportDefinitionId: item.def.id,
        definitionVersion: item.def.version,
        status: 'SUCCEEDED',
        rowCount: item.rows.length,
        startedAt: new Date(),
        endedAt: new Date(),
      },
    });

    const columns = (item.def.configuration as any)?.columns || [];
    const schema = columns.map((c: any) => ({
      key: c.key || c.field,
      label: c.label || c.key,
      type: c.type || 'string',
    }));

    await prisma.datasetSnapshot.create({
      data: {
        runId: run.id,
        chunkIndex: 0,
        schema: schema as any,
        data: item.rows as any,
      },
    });
  }

  console.log('✅ Hoàn tất Seed hệ thống Báo cáo Thời gian thực (Report Service) thành công 100%!');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi seed report-service:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
