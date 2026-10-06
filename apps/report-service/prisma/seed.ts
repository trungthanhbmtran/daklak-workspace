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

  console.log('✅ Đã nạp thành công 4 Report Templates và 12 Widgets động!');
}

main()
  .catch((e) => {
    console.error('Lỗi khi seed report-service:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
