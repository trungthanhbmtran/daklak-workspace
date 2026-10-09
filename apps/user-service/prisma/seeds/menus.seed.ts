import { PrismaClient } from '../../src/generated/prisma/client';

interface MenuSeed {
  code: string;
  name: string;
  route: string;
  icon: string;
  order: number;
  parentCode?: string;
  linkedResourceCode: string | null;
  type: string;
}

const menuData: MenuSeed[] = [
  { code: 'DASHBOARD', name: 'Bảng điều khiển', route: '/', icon: 'LayoutDashboard', order: 1, linkedResourceCode: null, type: 'MENU' },

  { code: 'SYS_GROUP', name: 'Quản trị hệ thống', route: '/services/admin', icon: 'Settings2', order: 99, linkedResourceCode: null, type: 'SERVICE_ITEM' },
  { code: 'SYS_ORG', name: 'Cơ cấu tổ chức', route: '/services/admin/organization', icon: 'Building2', order: 1, parentCode: 'SYS_GROUP', linkedResourceCode: 'ORGANIZATION', type: 'MENU' },
  { code: 'SYS_UNIT_JOB_TEMPLATE', name: 'Phân loại chức danh', route: '/services/admin/unit-job-templates', icon: 'Briefcase', order: 1.5, parentCode: 'SYS_GROUP', linkedResourceCode: 'ORGANIZATION', type: 'MENU' },
  { code: 'SYS_USER', name: 'Người dùng', route: '/services/admin/users', icon: 'Users', order: 2, parentCode: 'SYS_GROUP', linkedResourceCode: 'USER', type: 'MENU' },
  { code: 'SYS_ROLE', name: 'Vai trò & Quyền', route: '/services/admin/policies', icon: 'ShieldCheck', order: 3, parentCode: 'SYS_GROUP', linkedResourceCode: 'ROLE', type: 'MENU' },
  { code: 'SYS_RESOURCE', name: 'Tài nguyên PBAC', route: '/services/admin/resources', icon: 'Database', order: 4, parentCode: 'SYS_GROUP', linkedResourceCode: 'RESOURCE', type: 'MENU' },
  { code: 'SYS_MENU', name: 'Quản lý Menu', route: '/services/admin/menus', icon: 'Menu', order: 5, parentCode: 'SYS_GROUP', linkedResourceCode: 'MENU', type: 'MENU' },
  { code: 'SYS_CAT', name: 'Danh mục', route: '/services/admin/categories', icon: 'ListTree', order: 6, parentCode: 'SYS_GROUP', linkedResourceCode: 'CATEGORY', type: 'MENU' },
  { code: 'SYS_SETTING', name: 'Cấu hình chung', route: '/services/admin/settings', icon: 'Settings', order: 8, parentCode: 'SYS_GROUP', linkedResourceCode: 'SYSTEM', type: 'MENU' },
  { code: 'SYS_ENDPOINT', name: 'Quản lý Endpoints', route: '/system-admin/endpoints', icon: 'PlugZ', order: 9, parentCode: 'SYS_GROUP', linkedResourceCode: 'SYSTEM', type: 'MENU' },

  { code: 'HUB_NOTIF_GROUP', name: 'Trung tâm Thông báo', route: '/hub/notifications', icon: 'Bell', order: 10, linkedResourceCode: null, type: 'SERVICE_ITEM' },
  { code: 'SYS_NOTIF', name: 'Cấu hình Thông báo', route: '/hub/notifications/config', icon: 'Mail', order: 1, parentCode: 'HUB_NOTIF_GROUP', linkedResourceCode: 'NOTIFICATION', type: 'MENU' },
  { code: 'API_GATEWAY_GROUP', name: 'Quản lý API Gateway', route: '/admin/gateway', icon: 'Server', order: 11, linkedResourceCode: null, type: 'SERVICE_ITEM' },

  { code: 'HRM_GROUP', name: 'Nhân sự & Công việc', route: '/services/hrm', icon: 'Users', order: 2, linkedResourceCode: null, type: 'SERVICE_ITEM' },
  { code: 'HRM_EMPLOYEE_MENU', name: 'Hồ sơ nhân sự', route: '/services/hrm/employees', icon: 'UserCircle', order: 2, parentCode: 'HRM_GROUP', linkedResourceCode: 'HRM_EMPLOYEE', type: 'MENU' },
  { code: 'HRM_TASK_MENU', name: 'Danh sách nhiệm vụ', route: '/services/hrm/work-plans/tasks', icon: 'CheckSquare', order: 3, parentCode: 'HRM_GROUP', linkedResourceCode: 'TASK', type: 'MENU' },
  { code: 'HRM_CALENDAR_MENU', name: 'Lịch công tác', route: '/services/hrm/calendar', icon: 'CalendarDays', order: 4, parentCode: 'HRM_GROUP', linkedResourceCode: 'TASK', type: 'MENU' },
  { code: 'HRM_TEMPLATE_MENU', name: 'Khung mẫu nhiệm vụ', route: '/services/hrm/work-plans/rank-templates', icon: 'ClipboardList', order: 6, parentCode: 'HRM_GROUP', linkedResourceCode: 'PLAN', type: 'MENU' },
  { code: 'HRM_SELECTOR_MENU', name: 'Đăng ký nhiệm vụ', route: '/services/hrm/work-plans/manual-selector', icon: 'Layers', order: 7, parentCode: 'HRM_GROUP', linkedResourceCode: 'PLAN', type: 'MENU' },

  { code: 'DOC_GROUP', name: 'Quản lý Văn bản', route: '/services/documents', icon: 'FileText', order: 3, linkedResourceCode: null, type: 'SERVICE_ITEM' },
  { code: 'DOC_INCOMING_MENU', name: 'Văn bản đến', route: '/services/documents/incoming', icon: 'Mail', order: 1, parentCode: 'DOC_GROUP', linkedResourceCode: 'DOC_INCOMING', type: 'MENU' },
  { code: 'DOC_OUTGOING_MENU', name: 'Văn bản đi', route: '/services/documents/outgoing', icon: 'Send', order: 2, parentCode: 'DOC_GROUP', linkedResourceCode: 'DOC_OUTGOING', type: 'MENU' },
  { code: 'DOC_PROCESSING_MENU', name: 'Xử lý văn bản', route: '/services/documents/processing', icon: 'Layers', order: 3, parentCode: 'DOC_GROUP', linkedResourceCode: 'DOC_PROCESSING', type: 'MENU' },
  { code: 'DOC_PUBLISH_MENU', name: 'Phát hành văn bản', route: '/services/documents/publish', icon: 'Globe', order: 4, parentCode: 'DOC_GROUP', linkedResourceCode: 'DOC_PUBLISH', type: 'MENU' },
  { code: 'DOC_TRANSPARENCY_MENU', name: 'Công khai văn bản', route: '/services/documents/transparency', icon: 'Eye', order: 5, parentCode: 'DOC_GROUP', linkedResourceCode: 'DOC_TRANSPARENCY', type: 'MENU' },
  { code: 'DOC_MINUTES_MENU', name: 'Biên bản cuộc họp', route: '/services/documents/minutes', icon: 'ClipboardList', order: 6, parentCode: 'DOC_GROUP', linkedResourceCode: 'DOC_MINUTES', type: 'MENU' },
  { code: 'DOC_CABINET_MENU', name: 'Tủ văn bản', route: '/services/documents/cabinet', icon: 'Inbox', order: 7, parentCode: 'DOC_GROUP', linkedResourceCode: 'DOCUMENT', type: 'MENU' },
  { code: 'DOC_CONSULTATION_MENU', name: 'Lấy ý kiến', route: '/services/documents/consultations', icon: 'MessageSquare', order: 8, parentCode: 'DOC_GROUP', linkedResourceCode: 'DOC_CONSULTATION', type: 'MENU' },
  { code: 'DOC_DOSSIER_MENU', name: 'Hồ sơ lưu trữ', route: '/services/documents/dossiers', icon: 'Layers', order: 9, parentCode: 'DOC_GROUP', linkedResourceCode: 'DOCUMENT', type: 'MENU' },
  { code: 'DOC_PROCEDURE_MENU', name: 'Thủ tục hành chính', route: '/services/documents/procedures', icon: 'ClipboardList', order: 10, parentCode: 'DOC_GROUP', linkedResourceCode: 'DOCUMENT', type: 'MENU' },

  { code: 'CONTENT_GROUP', name: 'Quản lý Nội dung', route: '/services/posts', icon: 'Newspaper', order: 4, linkedResourceCode: null, type: 'SERVICE_ITEM' },
  { code: 'CONTENT_POST_MENU', name: 'Bài viết', route: '/services/posts', icon: 'FileText', order: 1, parentCode: 'CONTENT_GROUP', linkedResourceCode: 'POST', type: 'MENU' },
  { code: 'CONTENT_BANNER_MENU', name: 'Banner', route: '/services/posts/banners', icon: 'Image', order: 2, parentCode: 'CONTENT_GROUP', linkedResourceCode: 'BANNER', type: 'MENU' },
  { code: 'CONTENT_PORTAL_MENU', name: 'Menu Portal', route: '/services/posts/portal-menu', icon: 'Menu', order: 3, parentCode: 'CONTENT_GROUP', linkedResourceCode: 'PORTAL_MENU', type: 'MENU' },
  { code: 'CONTENT_INTERACT_MENU', name: 'Tương tác công dân', route: '/services/posts/interactions', icon: 'MessageSquare', order: 4, parentCode: 'CONTENT_GROUP', linkedResourceCode: 'CITIZEN_INTERACTION', type: 'MENU' },
  { code: 'CONTENT_APPEARANCE_MENU', name: 'Giao diện Portal', route: '/services/posts/appearance', icon: 'Eye', order: 5, parentCode: 'CONTENT_GROUP', linkedResourceCode: 'POST', type: 'MENU' },
  { code: 'CONTENT_CONFIG_MENU', name: 'Cấu hình Portal', route: '/services/posts/portal-config', icon: 'Settings', order: 6, parentCode: 'CONTENT_GROUP', linkedResourceCode: 'POST', type: 'MENU' },
  { code: 'CONTENT_BUILDER_MENU', name: 'Trình dựng trang', route: '/services/posts/portal-page-builder', icon: 'Layers', order: 7, parentCode: 'CONTENT_GROUP', linkedResourceCode: 'POST', type: 'MENU' },

  { code: 'WORKFLOW_GROUP', name: 'Quy trình hệ thống', route: '/services/workflow', icon: 'GitBranch', order: 5, linkedResourceCode: null, type: 'SERVICE_ITEM' },
  { code: 'WORKFLOW_DASHBOARD_MENU', name: 'Bảng quản trị', route: '/services/workflow', icon: 'Layers', order: 1, parentCode: 'WORKFLOW_GROUP', linkedResourceCode: 'WORKFLOW', type: 'MENU' },
  { code: 'WORKFLOW_SYSTEM_MENU', name: 'Định nghĩa quy trình', route: '/services/workflow/workflows', icon: 'GitBranch', order: 2, parentCode: 'WORKFLOW_GROUP', linkedResourceCode: 'WORKFLOW', type: 'MENU' },
  { code: 'WORKFLOW_INSTANCE_MENU', name: 'Quy trình đang chạy', route: '/services/workflow/instances', icon: 'Activity', order: 3, parentCode: 'WORKFLOW_GROUP', linkedResourceCode: 'WORKFLOW', type: 'MENU' },

  { code: 'API_MANAGER_GROUP', name: 'Quản lý API Gateway', route: '/services/api-manager', icon: 'Network', order: 6, linkedResourceCode: null, type: 'SERVICE_ITEM' },
  { code: 'API_MANAGER_GATEWAY_MENU', name: 'Cấu hình Gateway', route: '/services/api-manager/gateway', icon: 'Network', order: 1, parentCode: 'API_MANAGER_GROUP', linkedResourceCode: 'INTEGRATION', type: 'MENU' },
  { code: 'API_MANAGER_API_MENU', name: 'Kết nối API Đầu vào', route: '/services/api-manager/apis', icon: 'Plug', order: 2, parentCode: 'API_MANAGER_GROUP', linkedResourceCode: 'INTEGRATION', type: 'MENU' },

  { code: 'REPORT_GROUP', name: 'Phân tích, báo cáo', route: '/services/reports', icon: 'BarChart3', order: 7, linkedResourceCode: null, type: 'SERVICE_ITEM' },
  { code: 'REPORT_DASHBOARD_MENU', name: 'Dashboard Thống kê', route: '/services/reports', icon: 'LayoutDashboard', order: 1, parentCode: 'REPORT_GROUP', linkedResourceCode: 'REPORT', type: 'MENU' },
];

export async function seedMenus(prisma: PrismaClient) {
  console.log('🔹 Seeding Menus...');

  await prisma.menu.deleteMany({ where: { code: 'HRM_DASHBOARD_MENU' } });

  for (const menu of menuData) {
    const parent = menu.parentCode
      ? await prisma.menu.findUnique({ where: { code: menu.parentCode } })
      : null;
    const parentId = parent?.id ?? null;

    await prisma.menu.upsert({
      where: { code: menu.code },
      update: {
        name: menu.name,
        route: menu.route,
        icon: menu.icon,
        order: menu.order,
        linkedResourceCode: menu.linkedResourceCode,
        type: menu.type,
        parentId,
      },
      create: {
        code: menu.code,
        name: menu.name,
        route: menu.route,
        icon: menu.icon,
        order: menu.order,
        linkedResourceCode: menu.linkedResourceCode,
        type: menu.type,
        parentId,
      },
    });
  }

  console.log('✅ Hoàn tất cập nhật menu.');
}
