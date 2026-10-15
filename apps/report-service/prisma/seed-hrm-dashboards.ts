import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../src/generated/prisma/client';
import * as dotenv from 'dotenv';
import { btctuCadreRows } from './seed-btctu-report5';

dotenv.config();

const dbUrl =
  process.env.DATABASE_URL ||
  'mysql://root:mypassword@mysql:3306/admin_report?allowPublicKeyRetrieval=true';
const mariadbUrl = dbUrl.replace(/^mysql:\/\//, 'mariadb://');
const adapter = new PrismaMariaDb(mariadbUrl);
const prisma = new PrismaClient({ adapter });

export const personalWorkbenchRows = [
  // 1. Tiến độ & Điểm số 6 tháng gần nhất của Cán bộ
  {
    month: 'Tháng 5',
    score: 88,
    completedTasks: 38,
    status: 'Hoàn thành',
    departmentName: 'Phòng HT-NTS',
    workload: 0.71,
    title: 'Xây dựng khung Kiến trúc CQĐT 2.0',
    progress: 100,
    role: 'Chủ trì',
    dueDate: '15/05/2026',
    cadreCode: 'CB_001',
    fullName: 'Trần Trung Thành',
  },
  {
    month: 'Tháng 6',
    score: 91,
    completedTasks: 42,
    status: 'Hoàn thành',
    departmentName: 'Phòng HT-NTS',
    workload: 0.71,
    title: 'Nâng cấp mạng truyền số liệu chuyên dùng',
    progress: 100,
    role: 'Chủ trì',
    dueDate: '20/06/2026',
    cadreCode: 'CB_001',
    fullName: 'Trần Trung Thành',
  },
  {
    month: 'Tháng 7',
    score: 86,
    completedTasks: 36,
    status: 'Hoàn thành',
    departmentName: 'Phòng HT-NTS',
    workload: 0.71,
    title: 'Kiểm tra an toàn thông tin Trung tâm Tích hợp dữ liệu',
    progress: 100,
    role: 'Chủ trì',
    dueDate: '25/07/2026',
    cadreCode: 'CB_001',
    fullName: 'Trần Trung Thành',
  },
  {
    month: 'Tháng 8',
    score: 92,
    completedTasks: 44,
    status: 'Hoàn thành',
    departmentName: 'Phòng HT-NTS',
    workload: 0.71,
    title: 'Triển khai Cổng Dịch vụ công trực tuyến liên thông',
    progress: 100,
    role: 'Chủ trì',
    dueDate: '30/08/2026',
    cadreCode: 'CB_001',
    fullName: 'Trần Trung Thành',
  },
  {
    month: 'Tháng 9',
    score: 94,
    completedTasks: 46,
    status: 'Hoàn thành',
    departmentName: 'Phòng HT-NTS',
    workload: 0.71,
    title: 'Tích hợp Trục LGSP kết nối cơ sở dữ liệu quốc gia',
    progress: 100,
    role: 'Chủ trì',
    dueDate: '30/09/2026',
    cadreCode: 'CB_001',
    fullName: 'Trần Trung Thành',
  },
  {
    month: 'Tháng 10',
    score: 95,
    completedTasks: 48,
    status: 'Đang xử lý',
    departmentName: 'Phòng HT-NTS',
    workload: 0.71,
    title: 'Vận hành thử nghiệm Trung tâm điều hành thông minh (IOC)',
    progress: 95,
    role: 'Chủ trì',
    dueDate: '30/10/2026',
    cadreCode: 'CB_001',
    fullName: 'Trần Trung Thành',
  },

  // 2. Cơ cấu phân bổ trạng thái nhiệm vụ cá nhân (Tổng 235 việc)
  {
    month: 'Hiện tại',
    score: 95,
    completedTasks: 224,
    status: 'Hoàn thành',
    departmentName: 'Phòng HT-NTS',
    workload: 0.71,
    title: 'Nhiệm vụ hoàn thành đúng hạn',
    progress: 100,
    role: 'Chủ trì',
    dueDate: '15/10/2026',
    cadreCode: 'CB_001',
    fullName: 'Trần Trung Thành',
  },
  {
    month: 'Hiện tại',
    score: 95,
    completedTasks: 32,
    status: 'Hoàn thành quá hạn',
    departmentName: 'Phòng HT-NTS',
    workload: 0.71,
    title: 'Nhiệm vụ hoàn thành sau hạn',
    progress: 100,
    role: 'Phối hợp',
    dueDate: '10/10/2026',
    cadreCode: 'CB_001',
    fullName: 'Trần Trung Thành',
  },
  {
    month: 'Hiện tại',
    score: 95,
    completedTasks: 11,
    status: 'Đang xử lý',
    departmentName: 'Phòng HT-NTS',
    workload: 0.71,
    title: 'Nhiệm vụ đang tiến hành',
    progress: 75,
    role: 'Chủ trì',
    dueDate: '25/10/2026',
    cadreCode: 'CB_001',
    fullName: 'Trần Trung Thành',
  },
  {
    month: 'Hiện tại',
    score: 95,
    completedTasks: 3,
    status: 'Chờ duyệt',
    departmentName: 'Phòng HT-NTS',
    workload: 0.71,
    title: 'Hồ sơ trình Lãnh đạo thẩm định',
    progress: 90,
    role: 'Chủ trì',
    dueDate: '20/10/2026',
    cadreCode: 'CB_001',
    fullName: 'Trần Trung Thành',
  },

  // 3. Cân đối tải công việc theo phòng ban (Workload Recommendations)
  {
    month: 'T10',
    score: 92,
    completedTasks: 75,
    status: 'Đang xử lý',
    departmentName: 'HT-NTS (Hạ tầng - ĐTTM)',
    workload: 0.71,
    title: 'HT-NTS: Tải 0.71 quy đổi/người (TB 0.24) · Có dấu hiệu thiếu người',
    progress: 85,
    role: 'Đơn vị',
    dueDate: '30/10/2026',
    cadreCode: 'DEPT_HT',
    fullName: 'HT-NTS',
  },
  {
    month: 'T10',
    score: 90,
    completedTasks: 48,
    status: 'Hoàn thành',
    departmentName: 'HCTH (Hành chính - TH)',
    workload: 0.24,
    title: 'HCTH: Tải 0.24 quy đổi/người · Đạt mức cân đối tải',
    progress: 95,
    role: 'Đơn vị',
    dueDate: '30/10/2026',
    cadreCode: 'DEPT_HC',
    fullName: 'HCTH',
  },
  {
    month: 'T10',
    score: 89,
    completedTasks: 52,
    status: 'Hoàn thành',
    departmentName: 'QL-KTDL (Khai thác DL)',
    workload: 0.2,
    title: 'QL-KTDL: Tải 0.20 quy đổi/người · Có thể dư người',
    progress: 92,
    role: 'Đơn vị',
    dueDate: '30/10/2026',
    cadreCode: 'DEPT_DL',
    fullName: 'QL-KTDL',
  },

  // 4. Danh sách nhiệm vụ trọng tâm cá nhân
  {
    month: 'T10',
    score: 95,
    completedTasks: 1,
    status: 'Đang xử lý',
    departmentName: 'Phòng HT-NTS',
    workload: 0.71,
    title: 'Phương án kết nối mạng IOC tỉnh Đắk Lắk',
    progress: 90,
    role: 'Chủ trì',
    dueDate: '22/10/2026',
    cadreCode: 'CB_001',
    fullName: 'Trần Trung Thành',
  },
  {
    month: 'T10',
    score: 95,
    completedTasks: 1,
    status: 'Hoàn thành',
    departmentName: 'Phòng HT-NTS',
    workload: 0.71,
    title: 'Kiểm thử an toàn mạng nội bộ Sở KH&CN',
    progress: 100,
    role: 'Chủ trì',
    dueDate: '12/10/2026',
    cadreCode: 'CB_001',
    fullName: 'Trần Trung Thành',
  },
  {
    month: 'T10',
    score: 95,
    completedTasks: 1,
    status: 'Đang xử lý',
    departmentName: 'Phòng HT-NTS',
    workload: 0.71,
    title: 'Tổng hợp đánh giá năng suất chuyên viên quý 3',
    progress: 80,
    role: 'Chủ trì',
    dueDate: '28/10/2026',
    cadreCode: 'CB_001',
    fullName: 'Trần Trung Thành',
  },
  {
    month: 'T10',
    score: 95,
    completedTasks: 1,
    status: 'Chờ duyệt',
    departmentName: 'Phòng HT-NTS',
    workload: 0.71,
    title: 'Hồ sơ thẩm định dự án Chuyển đổi số 2026',
    progress: 95,
    role: 'Phối hợp',
    dueDate: '19/10/2026',
    cadreCode: 'CB_001',
    fullName: 'Trần Trung Thành',
  },
];

const personalWorkbenchConfig = {
  version: 1,
  sources: [
    {
      id: 'HRM_PERSONAL_STATS',
      endpoint: 'HRM_PERSONAL_STATS',
      name: 'Dữ liệu Bàn làm việc Cá nhân & Điều phối',
      upstream: 'hrm-service',
      path: '/admin/reports/personal-tasks',
      fields: [
        'month',
        'score',
        'completedTasks',
        'status',
        'workload',
        'departmentName',
        'title',
        'progress',
        'role',
        'dueDate',
        'cadreCode',
        'fullName',
      ],
    },
  ],
  joins: [],
  filters: [],
  columns: [
    {
      key: 'month',
      source: 'HRM_PERSONAL_STATS',
      field: 'month',
      type: 'string',
      label: 'Thời điểm',
      aggregate: 'none',
    },
    {
      key: 'score',
      source: 'HRM_PERSONAL_STATS',
      field: 'score',
      type: 'number',
      label: 'Điểm KPI',
      aggregate: 'none',
    },
    {
      key: 'completedTasks',
      source: 'HRM_PERSONAL_STATS',
      field: 'completedTasks',
      type: 'number',
      label: 'Số việc hoàn thành',
      aggregate: 'none',
    },
    {
      key: 'status',
      source: 'HRM_PERSONAL_STATS',
      field: 'status',
      type: 'string',
      label: 'Trạng thái',
      aggregate: 'none',
    },
    {
      key: 'departmentName',
      source: 'HRM_PERSONAL_STATS',
      field: 'departmentName',
      type: 'string',
      label: 'Phòng ban',
      aggregate: 'none',
    },
    {
      key: 'workload',
      source: 'HRM_PERSONAL_STATS',
      field: 'workload',
      type: 'number',
      label: 'Tải quy đổi/người',
      aggregate: 'none',
    },
    {
      key: 'title',
      source: 'HRM_PERSONAL_STATS',
      field: 'title',
      type: 'string',
      label: 'Nhiệm vụ',
      aggregate: 'none',
    },
    {
      key: 'progress',
      source: 'HRM_PERSONAL_STATS',
      field: 'progress',
      type: 'number',
      label: 'Tiến độ (%)',
      aggregate: 'none',
    },
    {
      key: 'role',
      source: 'HRM_PERSONAL_STATS',
      field: 'role',
      type: 'string',
      label: 'Vai trò',
      aggregate: 'none',
    },
    {
      key: 'dueDate',
      source: 'HRM_PERSONAL_STATS',
      field: 'dueDate',
      type: 'string',
      label: 'Hạn chót',
      aggregate: 'none',
    },
  ],
  groupBy: [],
  charts: [
    {
      type: 'line',
      xAxis: 'month',
      yAxis: 'score',
      title: 'Tiến độ & Điểm chất lượng 6 tháng gần nhất',
    },
    {
      type: 'pie',
      xAxis: 'status',
      yAxis: 'completedTasks',
      title: 'Cơ cấu Trạng thái Nhiệm vụ Cá nhân',
    },
    {
      type: 'bar',
      xAxis: 'departmentName',
      yAxis: 'workload',
      title: 'Cân đối Tải công việc theo Phòng ban',
    },
    {
      type: 'bar',
      xAxis: 'title',
      yAxis: 'progress',
      title: 'Tiến độ Thực hiện Nhiệm vụ Cá nhân',
    },
  ],
};

const personalSchema = personalWorkbenchConfig.columns.map((c) => ({
  key: c.key,
  label: c.label,
  type: c.type,
}));

export async function seedHrmDashboards() {
  console.log('🔄 Đang seed Bàn làm việc Cá nhân & Dashboard HRM trên report-service...');

  // 1. Đăng ký Data Source
  await prisma.reportDataSource.upsert({
    where: { code: 'HRM_PERSONAL_STATS' },
    update: {
      name: 'Dữ liệu Bàn làm việc Cá nhân & Điều phối',
      upstream: 'hrm-service',
      path: '/admin/reports/personal-tasks',
      fields: personalWorkbenchConfig.sources[0].fields,
    },
    create: {
      code: 'HRM_PERSONAL_STATS',
      name: 'Dữ liệu Bàn làm việc Cá nhân & Điều phối',
      upstream: 'hrm-service',
      path: '/admin/reports/personal-tasks',
      fields: personalWorkbenchConfig.sources[0].fields,
    },
  });

  // 2. Tạo hoặc Cập nhật ReportDefinition cho Bàn làm việc cá nhân (REP_PERSONAL_WORKBENCH)
  const personalDef = await prisma.reportDefinition.upsert({
    where: { code: 'REP_PERSONAL_WORKBENCH' },
    update: {
      name: 'Báo cáo Bàn làm việc Nhiệm vụ Cá nhân & Điều phối Nhân sự',
      description:
        'Theo dõi chỉ số KPI cá nhân, xu hướng tiến độ 6 tháng, cơ cấu trạng thái nhiệm vụ và cân đối tải công việc phòng ban.',
      version: 1,
      configuration: personalWorkbenchConfig,
    },
    create: {
      code: 'REP_PERSONAL_WORKBENCH',
      name: 'Báo cáo Bàn làm việc Nhiệm vụ Cá nhân & Điều phối Nhân sự',
      description:
        'Theo dõi chỉ số KPI cá nhân, xu hướng tiến độ 6 tháng, cơ cấu trạng thái nhiệm vụ và cân đối tải công việc phòng ban.',
      version: 1,
      configuration: personalWorkbenchConfig,
    },
  });
  console.log(`✅ Đã cập nhật ReportDefinition #${personalDef.id} (${personalDef.code})`);

  // 3. Tạo ReportRun SUCCEEDED cho REP_PERSONAL_WORKBENCH
  let run = await prisma.reportRun.findFirst({
    where: { reportDefinitionId: personalDef.id },
    orderBy: { id: 'desc' },
  });

  if (!run) {
    run = await prisma.reportRun.create({
      data: {
        reportDefinitionId: personalDef.id,
        definitionVersion: 1,
        status: 'SUCCEEDED',
        rowCount: personalWorkbenchRows.length,
        startedAt: new Date(),
        endedAt: new Date(),
      },
    });
  } else {
    run = await prisma.reportRun.update({
      where: { id: run.id },
      data: {
        definitionVersion: 1,
        status: 'SUCCEEDED',
        rowCount: personalWorkbenchRows.length,
        endedAt: new Date(),
      },
    });
  }

  // 4. DatasetSnapshot cho REP_PERSONAL_WORKBENCH
  await prisma.datasetSnapshot.deleteMany({
    where: { runId: run.id },
  });

  await prisma.datasetSnapshot.create({
    data: {
      runId: run.id,
      chunkIndex: 0,
      schema: personalSchema,
      data: personalWorkbenchRows,
    },
  });
  console.log(`✅ Đã nạp DatasetSnapshot cho Run #${run.id} (${personalWorkbenchRows.length} dòng dữ liệu Bàn làm việc)`);

  // 5. Tạo ReportTemplate & Widgets cho Bàn làm việc cá nhân
  const personalTemplate = await prisma.reportTemplate.create({
    data: {
      title: 'Bàn làm việc Nhiệm vụ Cá nhân & Điều phối',
      description: 'Giao diện bàn làm việc tích hợp chỉ số năng suất cá nhân và đề xuất điều phối nhân sự theo phòng ban',
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
            title: 'Cân đối Tải công việc theo Phòng ban',
            chartType: 'BAR',
            dataSourceCode: 'HRM_PERSONAL_STATS',
            xAxisKey: 'departmentName',
            yAxisKey: 'workload',
            config: { yAxisLabel: 'Tải quy đổi/người' },
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
          {
            assigneeType: 'UNIT',
            assigneeId: '18',
            permissions: 'VIEW',
          },
          {
            assigneeType: 'UNIT',
            assigneeId: '32',
            permissions: 'VIEW',
          },
        ],
      },
    },
  });
  console.log(`✅ Đã tạo ReportTemplate #${personalTemplate.id} (Bàn làm việc Cá nhân) kèm 4 Widgets`);

  // 6. Đảm bảo REP_BTCTU_SOP_KPI (Báo cáo Đánh giá Cán bộ & SOP Bước 4 Mẫu 05) được liên kết vào Dashboard
  const btctuDef = await prisma.reportDefinition.findFirst({
    where: { code: 'REP_BTCTU_SOP_KPI' },
  });

  if (btctuDef) {
    const btctuTemplate = await prisma.reportTemplate.create({
      data: {
        title: 'Báo cáo Đánh giá Cán bộ Toàn cơ quan (Chuẩn SOP & Mẫu 05)',
        description: 'Tổng hợp kết quả đánh giá, xếp loại cán bộ và tiến độ SOP 4 bước chuẩn Ban Tổ chức Tỉnh ủy',
        layout: { cols: 12, rows: 6 },
        widgets: {
          create: [
            {
              title: 'Phân bổ Xếp loại Chất lượng Cán bộ',
              chartType: 'PIE',
              dataSourceCode: 'BTCTU_KPI_STATS',
              xAxisKey: 'approvedRank',
              yAxisKey: 'sTong',
              config: { yAxisLabel: 'Điểm tổng' },
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
              chartType: 'BAR',
              dataSourceCode: 'BTCTU_KPI_STATS',
              xAxisKey: 'fullName',
              yAxisKey: 'sTong',
              config: { yAxisLabel: 'Điểm chất lượng' },
            },
          ],
        },
        assignments: {
          create: [
            {
              assigneeType: 'UNIT',
              assigneeId: '18',
              permissions: 'VIEW',
            },
            {
              assigneeType: 'UNIT',
              assigneeId: '32',
              permissions: 'VIEW',
            },
          ],
        },
      },
    });
    console.log(`✅ Đã tạo ReportTemplate #${btctuTemplate.id} (Chuẩn SOP & Mẫu 05) kèm 4 Widgets`);
  }

  console.log('🎉 Hoàn tất Seed thiết kế Bàn làm việc Cá nhân & Báo cáo HRM lên Report Service!');
}

if (require.main === module && process.argv.some((arg) => arg.includes('seed-hrm-dashboards'))) {
  seedHrmDashboards()
    .catch((e) => {
      console.error('❌ Lỗi:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
