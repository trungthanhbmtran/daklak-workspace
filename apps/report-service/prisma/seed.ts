import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../src/generated/prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const dbUrl =
  process.env.DATABASE_URL ||
  'mysql://root:mypassword@mysql:3306/admin_report?allowPublicKeyRetrieval=true';
const mariadbUrl = dbUrl.replace(/^mysql:\/\//, 'mariadb://');
const adapter = new PrismaMariaDb(mariadbUrl);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('--- Bắt đầu Seed Dữ liệu Báo cáo Động (Report Templates & Widgets) ---');

  await prisma.reportDataSource.deleteMany();
  await prisma.reportDataSource.createMany({
    data: [
      {
        code: 'HRM_TASK_STATS',
        name: 'Thống kê nhiệm vụ',
        upstream: 'hrm-service',
        path: '/admin/reports/tasks',
        fields: ['taskId', 'employeeId', 'status', 'hours'],
      },
      {
        code: 'DOC_STATS',
        name: 'Thống kê văn bản',
        upstream: 'document-service',
        path: '/admin/documents/stats',
        fields: ['docId', 'departmentId', 'type', 'issueDate'],
      },
      {
        code: 'POST_STATS',
        name: 'Thống kê bài viết',
        upstream: 'posts-service',
        path: '/admin/posts/stats',
        fields: ['postId', 'authorId', 'categoryName', 'viewCount'],
      }
    ]
  });
  // Xóa các template cũ nếu có để re-seed đồng bộ
  await prisma.reportWidget.deleteMany({});
  await prisma.reportTemplate.deleteMany({});

  // 1. Template 1: Quản lý Công việc & Nhiệm vụ
  await prisma.reportTemplate.create({
    data: {
      title: 'Báo cáo Tổng hợp Quản lý Công việc & Nhiệm vụ',
      description:
        'Thống kê động tiến độ, trạng thái và tỷ lệ hoàn thành nhiệm vụ theo phòng ban và nhân sự',
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
              source: {
                upstream: 'hrm-service',
                path: '/admin/hrm/tasks',
                params: {},
              },
              table: {
                version: 1,
                dataPath: 'items',
                columns: [
                  {
                    key: 'title',
                    path: 'title',
                    label: 'Tên nhiệm vụ',
                    type: 'string',
                    aggregate: 'none',
                  },
                  {
                    key: 'departmentName',
                    path: 'departmentName',
                    label: 'Phòng ban',
                    type: 'string',
                    aggregate: 'none',
                  },
                  {
                    key: 'assigneeName',
                    path: 'assigneeName',
                    label: 'Người thực hiện',
                    type: 'string',
                    aggregate: 'none',
                  },
                  {
                    key: 'status',
                    path: 'status',
                    label: 'Trạng thái',
                    type: 'string',
                    aggregate: 'none',
                  },
                  {
                    key: 'progress',
                    path: 'progress',
                    label: 'Tiến độ (%)',
                    type: 'number',
                    aggregate: 'avg',
                  },
                ],
                groupBy: [
                  'title',
                  'departmentName',
                  'assigneeName',
                  'status',
                ],
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

  // 2. Template 2: Quản lý Văn bản
  await prisma.reportTemplate.create({
    data: {
      title: 'Báo cáo Lưu chuyển và Xử lý Văn bản',
      description:
        'Thống kê số lượng văn bản đến/đi, độ khẩn và tình trạng xử lý hồ sơ',
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
              source: {
                upstream: 'document-service',
                path: '/admin/documents',
                params: {},
              },
              table: {
                version: 1,
                dataPath: 'items',
                columns: [
                  {
                    key: 'documentNumber',
                    path: 'documentNumber',
                    label: 'Số văn bản',
                    type: 'string',
                    aggregate: 'none',
                  },
                  {
                    key: 'abstract',
                    path: 'abstract',
                    label: 'Trích yếu',
                    type: 'string',
                    aggregate: 'none',
                  },
                  {
                    key: 'isIncoming',
                    path: 'isIncoming',
                    label: 'Loại văn bản',
                    type: 'string',
                    aggregate: 'none',
                  },
                  {
                    key: 'status',
                    path: 'status',
                    label: 'Trạng thái',
                    type: 'string',
                    aggregate: 'none',
                  },
                  {
                    key: 'pageCount',
                    path: 'pageCount',
                    label: 'Số trang',
                    type: 'number',
                    aggregate: 'sum',
                  },
                ],
                groupBy: [
                  'documentNumber',
                  'abstract',
                  'isIncoming',
                  'status',
                ],
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

  // 3. Template 3: Hoạt động Cổng thông tin & Bài viết
  await prisma.reportTemplate.create({
    data: {
      title: 'Báo cáo Hoạt động Xuất bản Cổng Thông tin',
      description:
        'Thống kê số lượng bài viết, chuyên mục và lượt truy cập đọc giả',
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

  // 4. Template 4: Đánh giá Chất lượng Nhân sự
  await prisma.reportTemplate.create({
    data: {
      title: 'Báo cáo Đánh giá Chất lượng Nhân sự Toàn diện',
      description:
        'Tổng hợp đánh giá chất lượng cán bộ dựa trên năng suất xử lý văn bản và kết quả công việc',
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
          {
            title: 'Bảng chi tiết chất lượng nhân sự',
            chartType: 'TABLE',
            dataSourceCode: 'EMPLOYEE_QUALITY',
            xAxisKey: 'employeeName',
            yAxisKey: 'qualityScore',
            config: {
              source: {
                upstream: 'hrm-service',
                path: '/admin/reports/employee-quality',
                params: {},
              },
              table: {
                version: 1,
                dataPath: 'items',
                columns: [
                  {
                    key: 'employeeName',
                    path: 'employeeName',
                    label: 'Họ và tên',
                    type: 'string',
                    aggregate: 'none',
                  },
                  {
                    key: 'departmentName',
                    path: 'departmentName',
                    label: 'Phòng ban',
                    type: 'string',
                    aggregate: 'none',
                  },
                  {
                    key: 'taskCount',
                    path: 'taskCount',
                    label: 'Nhiệm vụ',
                    type: 'number',
                    aggregate: 'sum',
                  },
                  {
                    key: 'docCount',
                    path: 'docCount',
                    label: 'Văn bản',
                    type: 'number',
                    aggregate: 'sum',
                  },
                  {
                    key: 'qualityScore',
                    path: 'qualityScore',
                    label: 'Điểm chất lượng',
                    type: 'number',
                    aggregate: 'avg',
                  },
                ],
                groupBy: ['employeeName', 'departmentName'],
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

  // 5. Seed Report Definitions cho V2 Dynamic Report Workspace
  await prisma.reportDefinition.deleteMany({});

  await prisma.reportDefinition.create({
    data: {
      code: 'REP_HRM_TASKS',
      name: 'Báo cáo Tổng hợp Quản lý Công việc & Nhiệm vụ',
      description:
        'Thống kê chi tiết 27 nhiệm vụ phân công, theo dõi tiến độ, cơ cấu trạng thái và xếp loại theo phòng ban tại Sở KH&CN.',
      version: 1,
      configuration: {
        version: 1,
        sources: [
          {
            id: 'HRM_TASK_STATS',
            endpoint: 'HRM_TASK_STATS',
            name: 'Thống kê nhiệm vụ',
            upstream: 'hrm-service',
            path: '/admin/reports/tasks',
            fields: [
              'id',
              'title',
              'status',
              'priority',
              'progress',
              'departmentName',
              'assigneeName',
              'isOverdue',
              'isCompleted',
            ],
          },
        ],
        joins: [],
        filters: [],
        columns: [
          {
            key: 'id',
            source: 'HRM_TASK_STATS',
            field: 'id',
            type: 'number',
            label: 'Mã NV',
            aggregate: 'none',
          },
          {
            key: 'title',
            source: 'HRM_TASK_STATS',
            field: 'title',
            type: 'string',
            label: 'Tên nhiệm vụ',
            aggregate: 'none',
          },
          {
            key: 'departmentName',
            source: 'HRM_TASK_STATS',
            field: 'departmentName',
            type: 'string',
            label: 'Phòng ban',
            aggregate: 'none',
          },
          {
            key: 'assigneeName',
            source: 'HRM_TASK_STATS',
            field: 'assigneeName',
            type: 'string',
            label: 'Người phụ trách',
            aggregate: 'none',
          },
          {
            key: 'status',
            source: 'HRM_TASK_STATS',
            field: 'status',
            type: 'string',
            label: 'Trạng thái',
            aggregate: 'none',
          },
          {
            key: 'progress',
            source: 'HRM_TASK_STATS',
            field: 'progress',
            type: 'number',
            label: 'Tiến độ (%)',
            aggregate: 'none',
          },
          {
            key: 'isOverdue',
            source: 'HRM_TASK_STATS',
            field: 'isOverdue',
            type: 'string',
            label: 'Hạn định',
            aggregate: 'none',
          },
        ],
        groupBy: [],
        charts: [
          {
            type: 'bar',
            xAxis: 'status',
            yAxis: 'progress',
            title: 'Phân bổ Tiến độ theo Trạng thái Nhiệm vụ',
          },
          {
            type: 'pie',
            xAxis: 'status',
            yAxis: 'id',
            title: 'Cơ cấu Trạng thái Nhiệm vụ',
          },
          {
            type: 'line',
            xAxis: 'departmentName',
            yAxis: 'progress',
            title: 'Xu hướng Tiến độ theo Phòng ban',
          },
        ],
      },
    },
  });

  await prisma.reportDefinition.create({
    data: {
      code: 'REP_DOC_STATS',
      name: 'Báo cáo Lưu chuyển và Xử lý Văn bản Hành chính',
      description:
        'Tổng hợp phân bổ văn bản đến/đi, cơ cấu theo mức độ khẩn và kết quả giải quyết văn bản hành chính công.',
      version: 1,
      configuration: {
        version: 1,
        sources: [
          {
            id: 'DOC_STATS',
            endpoint: 'DOC_STATS',
            name: 'Thống kê văn bản',
            upstream: 'document-service',
            path: '/admin/documents/stats',
            fields: [
              'id',
              'documentNumber',
              'abstract',
              'status',
              'isIncoming',
              'urgency',
              'securityLevel',
              'pageCount',
            ],
          },
        ],
        joins: [],
        filters: [],
        columns: [
          {
            key: 'id',
            source: 'DOC_STATS',
            field: 'id',
            type: 'number',
            label: 'ID',
            aggregate: 'none',
          },
          {
            key: 'documentNumber',
            source: 'DOC_STATS',
            field: 'documentNumber',
            type: 'string',
            label: 'Số hiệu văn bản',
            aggregate: 'none',
          },
          {
            key: 'abstract',
            source: 'DOC_STATS',
            field: 'abstract',
            type: 'string',
            label: 'Trích yếu',
            aggregate: 'none',
          },
          {
            key: 'isIncoming',
            source: 'DOC_STATS',
            field: 'isIncoming',
            type: 'string',
            label: 'Loại văn bản',
            aggregate: 'none',
          },
          {
            key: 'status',
            source: 'DOC_STATS',
            field: 'status',
            type: 'string',
            label: 'Trạng thái',
            aggregate: 'none',
          },
          {
            key: 'urgency',
            source: 'DOC_STATS',
            field: 'urgency',
            type: 'string',
            label: 'Độ khẩn',
            aggregate: 'none',
          },
        ],
        groupBy: [],
        charts: [
          {
            type: 'pie',
            xAxis: 'urgency',
            yAxis: 'id',
            title: 'Tỷ lệ Văn bản theo Mức độ Khẩn',
          },
          {
            type: 'bar',
            xAxis: 'status',
            yAxis: 'id',
            title: 'Phân bố Văn bản theo Tình trạng Xử lý',
          },
        ],
      },
    },
  });

  await prisma.reportDefinition.create({
    data: {
      code: 'REP_POST_STATS',
      name: 'Báo cáo Hoạt động Cổng Thông tin & Bài viết',
      description:
        'Thống kê xuất bản tin bài, cơ cấu bài viết theo chuyên mục khoa học công nghệ và lượt xem truy cập.',
      version: 1,
      configuration: {
        version: 1,
        sources: [
          {
            id: 'POST_STATS',
            endpoint: 'POST_STATS',
            name: 'Thống kê bài viết',
            upstream: 'posts-service',
            path: '/admin/posts/stats',
            fields: [
              'id',
              'title',
              'categoryName',
              'status',
              'viewCount',
              'authorName',
              'publishedAt',
            ],
          },
        ],
        joins: [],
        filters: [],
        columns: [
          {
            key: 'id',
            source: 'POST_STATS',
            field: 'id',
            type: 'number',
            label: 'ID',
            aggregate: 'none',
          },
          {
            key: 'title',
            source: 'POST_STATS',
            field: 'title',
            type: 'string',
            label: 'Tiêu đề bài viết',
            aggregate: 'none',
          },
          {
            key: 'categoryName',
            source: 'POST_STATS',
            field: 'categoryName',
            type: 'string',
            label: 'Chuyên mục',
            aggregate: 'none',
          },
          {
            key: 'status',
            source: 'POST_STATS',
            field: 'status',
            type: 'string',
            label: 'Trạng thái',
            aggregate: 'none',
          },
          {
            key: 'viewCount',
            source: 'POST_STATS',
            field: 'viewCount',
            type: 'number',
            label: 'Lượt xem',
            aggregate: 'none',
          },
          {
            key: 'authorName',
            source: 'POST_STATS',
            field: 'authorName',
            type: 'string',
            label: 'Tác giả',
            aggregate: 'none',
          },
        ],
        groupBy: [],
        charts: [
          {
            type: 'bar',
            xAxis: 'categoryName',
            yAxis: 'viewCount',
            title: 'Tổng Lượt xem theo Chuyên mục',
          },
          {
            type: 'pie',
            xAxis: 'status',
            yAxis: 'id',
            title: 'Cơ cấu Trạng thái Duyệt Bài viết',
          },
          {
            type: 'line',
            xAxis: 'title',
            yAxis: 'viewCount',
            title: 'Biểu đồ Tương tác theo Tin bài',
          },
        ],
      },
    },
  });

  await prisma.reportDefinition.create({
    data: {
      code: 'REP_EMP_QUALITY',
      name: 'Báo cáo Đánh giá Năng suất & Chất lượng Cán bộ',
      description:
        'Đánh giá tổng hợp điểm chất lượng công việc, tỷ lệ hoàn thành nhiệm vụ của 49 cán bộ công chức thuộc Sở.',
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
            fields: [
              'employeeName',
              'departmentName',
              'taskCount',
              'completedCount',
              'qualityScore',
              'ranking',
            ],
          },
        ],
        joins: [],
        filters: [],
        columns: [
          {
            key: 'employeeName',
            source: 'EMPLOYEE_QUALITY',
            field: 'employeeName',
            type: 'string',
            label: 'Họ và tên',
            aggregate: 'none',
          },
          {
            key: 'departmentName',
            source: 'EMPLOYEE_QUALITY',
            field: 'departmentName',
            type: 'string',
            label: 'Phòng ban',
            aggregate: 'none',
          },
          {
            key: 'taskCount',
            source: 'EMPLOYEE_QUALITY',
            field: 'taskCount',
            type: 'number',
            label: 'Tổng nhiệm vụ',
            aggregate: 'none',
          },
          {
            key: 'completedCount',
            source: 'EMPLOYEE_QUALITY',
            field: 'completedCount',
            type: 'number',
            label: 'Đã hoàn thành',
            aggregate: 'none',
          },
          {
            key: 'qualityScore',
            source: 'EMPLOYEE_QUALITY',
            field: 'qualityScore',
            type: 'number',
            label: 'Điểm chất lượng (100)',
            aggregate: 'none',
          },
          {
            key: 'ranking',
            source: 'EMPLOYEE_QUALITY',
            field: 'ranking',
            type: 'string',
            label: 'Xếp loại',
            aggregate: 'none',
          },
        ],
        groupBy: [],
        charts: [
          {
            type: 'bar',
            xAxis: 'employeeName',
            yAxis: 'qualityScore',
            title: 'Điểm Chất lượng Năng suất Cán bộ',
          },
          {
            type: 'pie',
            xAxis: 'ranking',
            yAxis: 'taskCount',
            title: 'Phân bổ Xếp loại Thi đua',
          },
        ],
      },
    },
  });

  console.log(
    '✅ Đã nạp thành công 4 Report Templates, 12 Widgets và 4 Report Definitions chuẩn CSDL!',
  );
}

main()
  .catch((e) => {
    console.error('Lỗi khi seed report-service:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
