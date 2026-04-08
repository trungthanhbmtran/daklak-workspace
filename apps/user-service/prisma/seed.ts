import * as bcrypt from 'bcrypt';
import { PrismaClient } from '@generated/prisma/client';
import * as dotenv from 'dotenv';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

dotenv.config();

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('Missing DATABASE_URL');
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaMariaDb(url),
});

const DEFAULT_PASSWORD = 'Admin@123';

async function main() {
  console.log('🌱 START COMPREHENSIVE E-GOV SEED');

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  // ==========================================================
  // 1. RESOURCES
  // ==========================================================
  const resourcesData = [
    // System & Admin
    { code: 'SYSTEM', name: 'Hệ thống' },
    { code: 'USER', name: 'Quản lý Người dùng' },
    { code: 'ROLE', name: 'Quản lý Vai trò' },
    { code: 'RESOURCE', name: 'Quản lý Tài nguyên' },
    { code: 'MENU', name: 'Quản lý Menu' },
    { code: 'ORGANIZATION', name: 'Cây tổ chức' },
    { code: 'CATEGORY', name: 'Danh mục hệ thống' },
    { code: 'NOTIFICATION', name: 'Thông báo hệ thống' },

    // Document Management
    { code: 'DOC_INCOMING', name: 'Văn bản đến' },
    { code: 'DOC_OUTGOING', name: 'Văn bản đi' },
    { code: 'DOC_PROCESSING', name: 'Xử lý văn bản' },
    { code: 'DOC_PUBLISH', name: 'Phát hành văn bản' },
    { code: 'DOC_TRANSPARENCY', name: 'Công khai văn bản' },
    { code: 'DOC_CONSULTATION', name: 'Xin ý kiến văn bản' },

    // HRM
    { code: 'HRM_EMPLOYEE', name: 'Quản lý Nhân sự' },

    // CMS
    { code: 'POST', name: 'Quản lý Bài viết' },

    // Workflow
    { code: 'WORKFLOW', name: 'Quy trình nghiệp vụ' },
  ];

  const resources: Record<string, { id: number; code: string; name: string }> = {};
  for (const res of resourcesData) {
    const created = await prisma.resource.upsert({
      where: { code: res.code },
      update: { name: res.name },
      create: res,
    });
    resources[res.code] = created;
  }

  // ==========================================================
  // 2. PERMISSIONS (CRUD for all)
  // ==========================================================
  const actions = ['CREATE', 'READ', 'UPDATE', 'DELETE', 'VIEW', 'APPROVE', 'PUBLISH', 'MANAGE'];
  const allPermissions: { id: number }[] = [];

  for (const res of Object.values(resources)) {
    for (const action of actions) {
      // Logic constraint: SYSTEM only has VIEW/MANAGE
      if (res.code === 'SYSTEM' && !['VIEW', 'MANAGE'].includes(action)) continue;

      const perm = await prisma.permission.upsert({
        where: { action_resourceId: { action, resourceId: res.id } },
        update: {},
        create: { action, resourceId: res.id },
      });
      allPermissions.push({ id: perm.id });
    }
  }

  // ==========================================================
  // 3. COMMON CATEGORIES (E-GOV STANDARD)
  // ==========================================================
  const categoriesData = [
    // --- SYSTEM & MANAGEMENT ---
    { group: 'STATUS', code: 'ACTIVE', name: 'Hoạt động', order: 1 },
    { group: 'STATUS', code: 'INACTIVE', name: 'Ngưng hoạt động', order: 2 },
    { group: 'STATUS', code: 'PENDING', name: 'Chờ xử lý', order: 3 },
    { group: 'STATUS', code: 'LOCKED', name: 'Đã khóa', order: 4 },

    { group: 'ACTION_LOG', code: 'LOGIN', name: 'Đăng nhập', order: 1 },
    { group: 'ACTION_LOG', code: 'LOGOUT', name: 'Đăng xuất', order: 2 },
    { group: 'ACTION_LOG', code: 'CREATE', name: 'Tạo mới', order: 3 },
    { group: 'ACTION_LOG', code: 'UPDATE', name: 'Cập nhật', order: 4 },
    { group: 'ACTION_LOG', code: 'DELETE', name: 'Xóa', order: 5 },

    { group: 'MICROSERVICE', code: 'USER_SERVICE', name: 'Dịch vụ Người dùng', order: 1 },
    { group: 'MICROSERVICE', code: 'HRM_SERVICE', name: 'Dịch vụ Nhân sự', order: 2 },
    { group: 'MICROSERVICE', code: 'DOCUMENT_SERVICE', name: 'Dịch vụ Văn bản', order: 3 },
    { group: 'MICROSERVICE', code: 'POST_SERVICE', name: 'Dịch vụ Nội dung', order: 4 },

    // --- GEOGRAPHIC DATA ---
    { group: 'PROVINCE', code: '47', name: 'Tỉnh Đắk Lắk', order: 1 },
    { group: 'PROVINCE', code: '01', name: 'Thành phố Hà Nội', order: 2 },
    { group: 'PROVINCE', code: '79', name: 'Thành phố Hồ Chí Minh', order: 3 },

    { group: 'DISTRICT', code: '47_01', name: 'Thành phố Buôn Ma Thuột', order: 1 },
    { group: 'DISTRICT', code: '47_02', name: 'Thị xã Buôn Hồ', order: 2 },
    { group: 'DISTRICT', code: '47_03', name: 'Huyện Krông Pắc', order: 3 },

    { group: 'WARD', code: '47_01_01', name: 'Phường Tân Lợi', order: 1 },
    { group: 'WARD', code: '47_01_02', name: 'Phường Tân Hòa', order: 2 },

    { group: 'GEO_AREA', code: 'TAY_NGUYEN', name: 'Khu vực Tây Nguyên', order: 1 },
    { group: 'GEO_AREA', code: 'MIEN_TRUNG', name: 'Khu vực Miền Trung', order: 2 },

    // --- DOCUMENTS ---
    { group: 'DOCUMENT_TYPE', code: 'QUYET_DINH', name: 'Quyết định', order: 1 },
    { group: 'DOCUMENT_TYPE', code: 'NGHI_QUYET', name: 'Nghị quyết', order: 2 },
    { group: 'DOCUMENT_TYPE', code: 'CONG_VAN', name: 'Công văn', order: 3 },
    { group: 'DOCUMENT_TYPE', code: 'TO_TRINH', name: 'Tờ trình', order: 4 },
    { group: 'DOCUMENT_TYPE', code: 'BAO_CAO', name: 'Báo cáo', order: 5 },

    { group: 'URGENCY_LEVEL', code: 'THUONG', name: 'Thường', order: 1 },
    { group: 'URGENCY_LEVEL', code: 'KHAN', name: 'Khẩn', order: 2 },
    { group: 'URGENCY_LEVEL', code: 'HOA_TOC', name: 'Hỏa tốc', order: 3 },

    { group: 'SECURITY_LEVEL', code: 'THUONG', name: 'Thường', order: 1 },
    { group: 'SECURITY_LEVEL', code: 'MAT', name: 'Mật', order: 2 },
    { group: 'SECURITY_LEVEL', code: 'TOI_MAT', name: 'Tối mật', order: 3 },
    { group: 'SECURITY_LEVEL', code: 'TUYET_MAT', name: 'Tuyệt mật', order: 4 },

    { group: 'DOCUMENT_DOMAIN', code: 'HANH_CHINH', name: 'Hành chính', order: 1 },
    { group: 'DOCUMENT_DOMAIN', code: 'KHOA_HOC', name: 'Khoa học công nghệ', order: 2 },
    { group: 'DOCUMENT_DOMAIN', code: 'TAI_CHINH', name: 'Tài chính', order: 3 },

    { group: 'STORAGE_PERIOD', code: '5_YEARS', name: '05 năm', order: 1 },
    { group: 'STORAGE_PERIOD', code: '10_YEARS', name: '10 năm', order: 2 },
    { group: 'STORAGE_PERIOD', code: '20_YEARS', name: '20 năm', order: 3 },
    { group: 'STORAGE_PERIOD', code: 'PERMANENT', name: 'Vĩnh viễn', order: 4 },

    // --- HRM & PERSONAL ---
    { group: 'GENDER', code: 'NAM', name: 'Nam', order: 1 },
    { group: 'GENDER', code: 'NU', name: 'Nữ', order: 2 },
    { group: 'GENDER', code: 'KHAC', name: 'Khác', order: 3 },

    { group: 'ETHNICITY', code: 'KINH', name: 'Kinh', order: 1 },
    { group: 'ETHNICITY', code: 'EDE', name: 'Ê-đê', order: 2 },
    { group: 'ETHNICITY', code: 'M_NONG', name: 'M\'Nông', order: 3 },

    { group: 'RELIGION', code: 'KHONG', name: 'Không', order: 1 },
    { group: 'RELIGION', code: 'PHAT_GIAO', name: 'Phật giáo', order: 2 },
    { group: 'RELIGION', code: 'CONG_GIAO', name: 'Công giáo', order: 3 },

    { group: 'IDENTITY_TYPE', code: 'CCCD', name: 'Căn cước công dân', order: 1 },
    { group: 'IDENTITY_TYPE', code: 'PASSPORT', name: 'Hộ chiếu', order: 2 },

    { group: 'POSITION', code: 'GIAM_DOC', name: 'Giám đốc', order: 1 },
    { group: 'POSITION', code: 'PHO_GIAM_DOC', name: 'Phó Giám đốc', order: 2 },
    { group: 'POSITION', code: 'TRUONG_PHONG', name: 'Trưởng phòng', order: 3 },
    { group: 'POSITION', code: 'CHUYEN_VIEN', name: 'Chuyên viên', order: 4 },

    { group: 'CIVIL_SERVANT_RANK', code: 'CVC_CAO_CAP', name: 'Chuyên viên cao cấp', order: 1 },
    { group: 'CIVIL_SERVANT_RANK', code: 'CVC_CHINH', name: 'Chuyên viên chính', order: 2 },
    { group: 'CIVIL_SERVANT_RANK', code: 'CHUYEN_VIEN', name: 'Chuyên viên', order: 3 },

    { group: 'ACADEMIC_RANK', code: 'TIEN_SI', name: 'Tiến sĩ', order: 1 },
    { group: 'ACADEMIC_RANK', code: 'THAC_SI', name: 'Thạc sĩ', order: 2 },
    { group: 'ACADEMIC_RANK', code: 'GIAO_SU', name: 'Giáo sư', order: 3 },
    { group: 'ACADEMIC_RANK', code: 'PHO_GIAO_SU', name: 'Phó Giáo sư', order: 4 },

    { group: 'POLITICAL_THEORY', code: 'CAO_CAP', name: 'Cao cấp', order: 1 },
    { group: 'POLITICAL_THEORY', code: 'TRUNG_CAP', name: 'Trung cấp', order: 2 },
    { group: 'POLITICAL_THEORY', code: 'SO_CAP', name: 'Sơ cấp', order: 3 },

    { group: 'STATE_MANAGEMENT', code: 'CHUYEN_VIEN_CAO_CAP', name: 'Chuyên viên cao cấp', order: 1 },
    { group: 'STATE_MANAGEMENT', code: 'CHUYEN_VIEN_CHINH', name: 'Chuyên viên chính', order: 2 },
    { group: 'STATE_MANAGEMENT', code: 'CHUYEN_VIEN', name: 'Chuyên viên', order: 3 },

    { group: 'IT_SKILL', code: 'CO_BAN', name: 'Cơ bản', order: 1 },
    { group: 'IT_SKILL', code: 'NANG_CAO', name: 'Nâng cao', order: 2 },

    { group: 'LANGUAGE_SKILL', code: 'ENGLISH_B1', name: 'Tiếng Anh B1', order: 1 },
    { group: 'LANGUAGE_SKILL', code: 'ENGLISH_B2', name: 'Tiếng Anh B2', order: 2 },

    // --- OTHER ---
    { group: 'UNIT_TYPE', code: 'CQNN', name: 'Cơ quan nhà nước', order: 1 },
    { group: 'UNIT_TYPE', code: 'DVSN', name: 'Đơn vị sự nghiệp', order: 2 },

    { group: 'DOMAIN', code: 'KHCN', name: 'Khoa học công nghệ', order: 1 },
    { group: 'DOMAIN', code: 'GIAO_DUC', name: 'Giáo dục', order: 2 },

    { group: 'CONTENT_TYPE', code: 'ARTICLE', name: 'Bài viết', order: 1 },
    { group: 'CONTENT_TYPE', code: 'NOTIF', name: 'Thông báo', order: 2 },
    { group: 'CONTENT_TYPE', code: 'POLICY', name: 'Văn bản chỉ đạo', order: 3 },

    { group: 'DEPARTMENT', code: 'VAN_PHONG', name: 'Văn phòng Sở', order: 1 },
    { group: 'DEPARTMENT', code: 'PHONG_KE_HOACH', name: 'Phòng Kế hoạch - Tài chính', order: 2 },
  ];

  console.log(`📦 Seeding ${categoriesData.length} categories...`);
  for (const cat of categoriesData) {
    await prisma.category.upsert({
      where: { group_code: { group: cat.group, code: cat.code } },
      update: { name: cat.name, order: cat.order },
      create: { ...cat, isSystem: true },
    });
  }
  console.log('✅ Categories seeded');

  // ==========================================================
  // 4. ROLES
  // ==========================================================
  const superAdminRole = await prisma.role.upsert({
    where: { code: 'SUPER_ADMIN' },
    update: {
      name: 'Super Administrator',
      permissions: { set: allPermissions },
    },
    create: {
      code: 'SUPER_ADMIN',
      name: 'Super Administrator',
      permissions: { connect: allPermissions },
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { code: 'ADMIN' },
    update: { name: 'Quản trị viên hệ thống' },
    create: { code: 'ADMIN', name: 'Quản trị viên hệ thống' },
  });

  // ==========================================================
  // 5. MENUS (ADMIN_PORTAL) - PBAC Implementation
  // ==========================================================

  const rootMenu = await prisma.menu.upsert({
    where: { code: 'SYS_ROOT' },
    update: { application: 'ADMIN_PORTAL' },
    create: {
      code: 'SYS_ROOT',
      name: 'Gốc hệ thống',
      order: 0,
      application: 'ADMIN_PORTAL',
    },
  });

  // Helper to link menu to resource permission
  const linkMenuPBAC = async (menuId: number, resCode: string, action: string = 'READ') => {
    const resId = resources[resCode]?.id;
    if (!resId) return;
    const perm = await prisma.permission.findUnique({
      where: { action_resourceId: { action, resourceId: resId } }
    });
    if (perm) {
      await prisma.menuRequiredPermission.upsert({
        where: { menuId_permissionId: { menuId, permissionId: perm.id } },
        update: {},
        create: { menuId, permissionId: perm.id }
      });
    }
  };

  // --- SERVICE ROOTS ---
  const services = [
    { code: 'USER_SERVICE_ROOT', name: 'Quản trị Hệ thống', icon: 'shield-checkmark-outline', service: 'USER_SERVICE', color: '#3b82f6', order: 1, res: 'USER' },
    { code: 'HRM_SERVICE_ROOT', name: 'Quản lý Nhân sự', icon: 'people-outline', service: 'HRM_SERVICE', color: '#10b981', order: 2, res: 'HRM_EMPLOYEE' },
    { code: 'DOCUMENT_SERVICE_ROOT', name: 'Quản lý Văn bản', icon: 'document-text-outline', service: 'DOCUMENT_SERVICE', color: '#f59e0b', order: 3, res: 'DOC_INCOMING' },
    { code: 'CONTENT_SERVICE_ROOT', name: 'Quản lý Nội dung', icon: 'newspaper-outline', service: 'CONTENT_SERVICE', color: '#ec4899', order: 4, res: 'POST' },
    { code: 'WORKFLOW_SERVICE_ROOT', name: 'Quy trình Nghiệp vụ', icon: 'layers-outline', service: 'WORKFLOW_SERVICE', color: '#8b5cf6', order: 5, res: 'WORKFLOW' },
  ];

  const serviceNodes: Record<string, any> = {};
  for (const sys of services) {
    const node = await prisma.menu.upsert({
      where: { code: sys.code },
      update: { parentId: rootMenu.id, name: sys.name, icon: sys.icon, iconColor: sys.color, order: sys.order, service: sys.service },
      create: {
        code: sys.code,
        name: sys.name,
        icon: sys.icon,
        iconColor: sys.color,
        order: sys.order,
        service: sys.service,
        parentId: rootMenu.id,
        application: 'ADMIN_PORTAL',
      },
    });
    serviceNodes[sys.service] = node;
    await linkMenuPBAC(node.id, sys.res, 'READ');
  }

  // --- SUB MENUS (PBAC LINKED) ---

  // 1. Admin Module
  const adminMenus = [
    { code: 'ADMIN_USERS', name: 'Người dùng', route: 'users', icon: 'person-outline', order: 1, res: 'USER' },
    { code: 'ADMIN_ROLES', name: 'Vai trò & Quyền', route: 'roles', icon: 'lock-closed-outline', order: 2, res: 'ROLE' },
    { code: 'ADMIN_RESOURCES', name: 'Tài nguyên', route: 'resources', icon: 'shield-checkmark-outline', order: 3, res: 'RESOURCE' },
    { code: 'ADMIN_MENUS', name: 'Cấu hình Menu', route: 'menus', icon: 'list-outline', order: 4, res: 'MENU' },
    { code: 'ADMIN_ORGANIZATION', name: 'Đơn vị & Phòng ban', route: 'organization', icon: 'apartment', order: 5, res: 'ORGANIZATION' },
    { code: 'ADMIN_CATEGORIES', name: 'Danh mục hệ thống', route: 'categories', icon: 'cog-outline', order: 6, res: 'CATEGORY' },
    { code: 'ADMIN_NOTIFICATIONS', name: 'Thông báo', route: 'notifications', icon: 'megaphone-outline', order: 7, res: 'NOTIFICATION' },
  ];

  for (const { res, ...m } of adminMenus) {
    const node = await prisma.menu.upsert({
      where: { code: m.code },
      update: { parentId: serviceNodes['USER_SERVICE'].id, order: m.order, route: m.route, icon: m.icon },
      create: { ...m, parentId: serviceNodes['USER_SERVICE'].id, application: 'ADMIN_PORTAL', service: 'USER_SERVICE' },
    });
    await linkMenuPBAC(node.id, res, 'READ');
  }

  // 2. Document Module
  const docMenus = [
    { code: 'DOC_MENU_INCOMING', name: 'Văn bản đến', route: 'incoming', icon: 'document-attach-outline', order: 1, res: 'DOC_INCOMING' },
    { code: 'DOC_MENU_OUTGOING', name: 'Văn bản đi', route: 'outgoing', icon: 'document-attach-outline', order: 2, res: 'DOC_OUTGOING' },
    { code: 'DOC_MENU_PROCESSING', name: 'Xử lý văn bản', route: 'processing', icon: 'document-text-outline', order: 3, res: 'DOC_PROCESSING' },
    { code: 'DOC_MENU_PUBLISH', name: 'Phát hành', route: 'publish', icon: 'globe-outline', order: 4, res: 'DOC_PUBLISH' },
    { code: 'DOC_MENU_TRANSPARENCY', name: 'Công khai', route: 'transparency', icon: 'folder-outline', order: 5, res: 'DOC_TRANSPARENCY' },
    { code: 'DOC_MENU_CONSULTATION', name: 'Xin ý kiến', route: 'consultations', icon: 'people-outline', order: 6, res: 'DOC_CONSULTATION' },
  ];

  for (const { res, ...m } of docMenus) {
    const node = await prisma.menu.upsert({
      where: { code: m.code },
      update: { parentId: serviceNodes['DOCUMENT_SERVICE'].id, order: m.order, route: m.route, icon: m.icon },
      create: { ...m, parentId: serviceNodes['DOCUMENT_SERVICE'].id, application: 'ADMIN_PORTAL', service: 'DOCUMENT_SERVICE' },
    });
    await linkMenuPBAC(node.id, res, 'READ');
  }

  // 3. HRM Module
  const hrmMenus = [
    { code: 'HRM_MENU_EMPLOYEE_LIST', name: 'Danh sách cán bộ', route: 'employees', icon: 'people-outline', order: 1, res: 'HRM_EMPLOYEE' },
  ];

  for (const { res, ...m } of hrmMenus) {
    const node = await prisma.menu.upsert({
      where: { code: m.code },
      update: { parentId: serviceNodes['HRM_SERVICE'].id, order: m.order, route: m.route, icon: m.icon },
      create: { ...m, parentId: serviceNodes['HRM_SERVICE'].id, application: 'ADMIN_PORTAL', service: 'HRM_SERVICE' },
    });
    await linkMenuPBAC(node.id, res, 'READ');
  }

  // 4. Content Module
  const postMenus = [
    { code: 'CONTENT_MENU_POSTS', name: 'Bài viết & Tin tức', route: '', icon: 'newspaper-outline', order: 1, res: 'POST' },
  ];

  for (const { res, ...m } of postMenus) {
    const node = await prisma.menu.upsert({
      where: { code: m.code },
      update: { parentId: serviceNodes['CONTENT_SERVICE'].id, order: m.order, route: m.route, icon: m.icon },
      create: { ...m, parentId: serviceNodes['CONTENT_SERVICE'].id, application: 'ADMIN_PORTAL', service: 'CONTENT_SERVICE' },
    });
    await linkMenuPBAC(node.id, res, 'READ');
  }

  // ==========================================================
  // 6. USERS
  // ==========================================================
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@sys.com' },
    update: { roles: { set: [{ id: superAdminRole.id }] } },
    create: {
      email: 'superadmin@sys.com',
      username: 'superadmin',
      fullName: 'Super Administrator',
      roles: { connect: [{ id: superAdminRole.id }] },
    },
  });

  await prisma.credential.upsert({
    where: { userId: superAdmin.id },
    update: { passwordHash },
    create: { userId: superAdmin.id, passwordHash },
  });

  console.log('🎉 COMPREHENSIVE E-GOV SEED COMPLETED');
  console.log(`👉 SuperAdmin: superadmin@sys.com / ${DEFAULT_PASSWORD}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });