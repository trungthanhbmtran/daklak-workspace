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
    // DOC_TYPE
    { group: 'DOC_TYPE', code: 'QUYET_DINH', name: 'Quyết định', order: 1 },
    { group: 'DOC_TYPE', code: 'NGHI_QUYET', name: 'Nghị quyết', order: 2 },
    { group: 'DOC_TYPE', code: 'CONG_VAN', name: 'Công văn', order: 3 },
    { group: 'DOC_TYPE', code: 'TO_TRINH', name: 'Tờ trình', order: 4 },
    { group: 'DOC_TYPE', code: 'BAO_CAO', name: 'Báo cáo', order: 5 },
    { group: 'DOC_TYPE', code: 'CHI_THI', name: 'Chỉ thị', order: 6 },
    { group: 'DOC_TYPE', code: 'THONG_TU', name: 'Thông tư', order: 7 },
    { group: 'DOC_TYPE', code: 'KE_HOACH', name: 'Kế hoạch', order: 8 },
    { group: 'DOC_TYPE', code: 'QUY_DINH', name: 'Quy định', order: 9 },
    { group: 'DOC_TYPE', code: 'QUY_CHE', name: 'Quy chế', order: 10 },
    { group: 'DOC_TYPE', code: 'HUONG_DAN', name: 'Hướng dẫn', order: 11 },
    { group: 'DOC_TYPE', code: 'BIEN_BAN', name: 'Biên bản', order: 12 },
    { group: 'DOC_TYPE', code: 'GIAY_MOI', name: 'Giấy mời', order: 13 },
    { group: 'DOC_TYPE', code: 'CONG_DIEN', name: 'Công điện', order: 14 },
    { group: 'DOC_TYPE', code: 'THONG_BAO', name: 'Thông báo', order: 15 },

    // DOC_SECURITY
    { group: 'DOC_SECURITY', code: 'THUONG', name: 'Thường', order: 1 },
    { group: 'DOC_SECURITY', code: 'MAT', name: 'Mật', order: 2 },
    { group: 'DOC_SECURITY', code: 'TOI_MAT', name: 'Tối mật', order: 3 },
    { group: 'DOC_SECURITY', code: 'TUYET_MAT', name: 'Tuyệt mật', order: 4 },

    // DOC_URGENCY
    { group: 'DOC_URGENCY', code: 'THUONG', name: 'Thường', order: 1 },
    { group: 'DOC_URGENCY', code: 'KHAN', name: 'Khẩn', order: 2 },
    { group: 'DOC_URGENCY', code: 'HOA_TOC', name: 'Hỏa tốc', order: 3 },

    // UNIT_TYPE
    { group: 'UNIT_TYPE', code: 'CQNN', name: 'Cơ quan nhà nước', order: 1 },
    { group: 'UNIT_TYPE', code: 'DVSN', name: 'Đơn vị sự nghiệp', order: 2 },
    { group: 'UNIT_TYPE', code: 'DN', name: 'Doanh nghiệp', order: 3 },

    // UNIT_DOMAIN
    { group: 'UNIT_DOMAIN', code: 'KHCN', name: 'Khoa học công nghệ', order: 1 },
    { group: 'UNIT_DOMAIN', code: 'GIAO_DUC', name: 'Giáo dục', order: 2 },
    { group: 'UNIT_DOMAIN', code: 'Y_TE', name: 'Y tế', order: 3 },
    { group: 'UNIT_DOMAIN', code: 'KINH_TE', name: 'Kinh tế', order: 4 },
    { group: 'UNIT_DOMAIN', code: 'VAN_HOA', name: 'Văn hóa', order: 5 },

    // JOB_TITLE
    { group: 'JOB_TITLE', code: 'GIAM_DOC', name: 'Giám đốc', order: 1 },
    { group: 'JOB_TITLE', code: 'PHO_GIAM_DOC', name: 'Phó Giám đốc', order: 2 },
    { group: 'JOB_TITLE', code: 'TRUONG_PHONG', name: 'Trưởng phòng', order: 3 },
    { group: 'JOB_TITLE', code: 'PHO_TRUONG_PHONG', name: 'Phó Trưởng phòng', order: 4 },
    { group: 'JOB_TITLE', code: 'CHUYEN_VIEN', name: 'Chuyên viên', order: 5 },
    { group: 'JOB_TITLE', code: 'CAN_BO', name: 'Cán bộ', order: 6 },
    { group: 'JOB_TITLE', code: 'NHAN_VIEN', name: 'Nhân viên', order: 7 },

    // ETHNICITY
    { group: 'ETHNICITY', code: 'KINH', name: 'Kinh', order: 1 },
    { group: 'ETHNICITY', code: 'TAY', name: 'Tày', order: 2 },
    { group: 'ETHNICITY', code: 'THAI', name: 'Thái', order: 3 },
    { group: 'ETHNICITY', code: 'EDE', name: 'Ê-đê', order: 4 },
    { group: 'ETHNICITY', code: 'M_NONG', name: 'M\'Nông', order: 5 },
    { group: 'ETHNICITY', code: 'MUONG', name: 'Mường', order: 6 },
    { group: 'ETHNICITY', code: 'KHO_ME', name: 'Khơ-me', order: 7 },
    { group: 'ETHNICITY', code: 'MONG', name: 'Mông', order: 8 },
    { group: 'ETHNICITY', code: 'NUNG', name: 'Nùng', order: 9 },
    { group: 'ETHNICITY', code: 'HOA', name: 'Hoa', order: 10 },

    // RELIGION
    { group: 'RELIGION', code: 'KHONG', name: 'Không', order: 1 },
    { group: 'RELIGION', code: 'PHAT_GIAO', name: 'Phật giáo', order: 2 },
    { group: 'RELIGION', code: 'CONG_GIAO', name: 'Công giáo', order: 3 },
    { group: 'RELIGION', code: 'TIN_LANH', name: 'Tin lành', order: 4 },
    { group: 'RELIGION', code: 'CAO_DAI', name: 'Cao đài', order: 5 },
    { group: 'RELIGION', code: 'HOA_HAO', name: 'Hòa hảo', order: 6 },

    // GENDER
    { group: 'GENDER', code: 'NAM', name: 'Nam', order: 1 },
    { group: 'GENDER', code: 'NU', name: 'Nữ', order: 2 },
    { group: 'GENDER', code: 'KHAC', name: 'Khác', order: 3 },

    // DOC_FIELD
    { group: 'DOC_FIELD', code: 'HANH_CHINH', name: 'Hành chính', order: 1 },
    { group: 'DOC_FIELD', code: 'KHOA_HOC', name: 'Khoa học công nghệ', order: 2 },
    { group: 'DOC_FIELD', code: 'TAI_CHINH', name: 'Tài chính', order: 3 },
    { group: 'DOC_FIELD', code: 'TO_CHUC', name: 'Tổ chức cán bộ', order: 4 },
    { group: 'DOC_FIELD', code: 'KE_HOACH', name: 'Kế hoạch đầu tư', order: 5 },
    { group: 'DOC_FIELD', code: 'XAY_DUNG', name: 'Xây dựng', order: 6 },
    { group: 'DOC_FIELD', code: 'GIAO_THONG', name: 'Giao thông', order: 7 },
    { group: 'DOC_FIELD', code: 'GIAO_DUC', name: 'Giáo dục', order: 8 },
    { group: 'DOC_FIELD', code: 'Y_TE', name: 'Y tế', order: 9 },

    // DOC_STATUS
    { group: 'DOC_STATUS', code: 'DU_THAO', name: 'Dự thảo', order: 1 },
    { group: 'DOC_STATUS', code: 'CHO_DUYET', name: 'Chờ duyệt', order: 2 },
    { group: 'DOC_STATUS', code: 'DA_DUYET', name: 'Đã duyệt', order: 3 },
    { group: 'DOC_STATUS', code: 'DA_BAN_HANH', name: 'Đã ban hành', order: 4 },
    { group: 'DOC_STATUS', code: 'DA_THU_HOI', name: 'Đã thu hồi', order: 5 },

    // ACADEMIC_LEVEL
    { group: 'ACADEMIC_LEVEL', code: 'DAI_HOC', name: 'Đại học', order: 1 },
    { group: 'ACADEMIC_LEVEL', code: 'CAO_DANG', name: 'Cao đẳng', order: 2 },
    { group: 'ACADEMIC_LEVEL', code: 'TRUNG_CAP', name: 'Trung cấp', order: 3 },
    { group: 'ACADEMIC_LEVEL', code: 'SO_CAP', name: 'Sơ cấp', order: 4 },
    { group: 'ACADEMIC_LEVEL', code: 'THPT', name: 'Trung học phổ thông', order: 5 },

    // ACADEMIC_DEGREE
    { group: 'ACADEMIC_DEGREE', code: 'TIEN_SI', name: 'Tiến sĩ', order: 1 },
    { group: 'ACADEMIC_DEGREE', code: 'THAC_SI', name: 'Thạc sĩ', order: 2 },
    { group: 'ACADEMIC_DEGREE', code: 'CU_NHAN', name: 'Cử nhân', order: 3 },
    { group: 'ACADEMIC_DEGREE', code: 'KY_SU', name: 'Kỹ sư', order: 4 },

    // ACADEMIC_RANK
    { group: 'ACADEMIC_RANK', code: 'GIAO_SU', name: 'Giáo sư', order: 1 },
    { group: 'ACADEMIC_RANK', code: 'PHO_GIAO_SU', name: 'Phó Giáo sư', order: 2 },

    // POLITICAL_THEORY
    { group: 'POLITICAL_THEORY', code: 'CAO_CAP', name: 'Cao cấp', order: 1 },
    { group: 'POLITICAL_THEORY', code: 'TRUNG_CAP', name: 'Trung cấp', order: 2 },
    { group: 'POLITICAL_THEORY', code: 'SO_CAP', name: 'Sơ cấp', order: 3 },

    // STATE_MANAGEMENT
    { group: 'STATE_MANAGEMENT', code: 'CVC_CAO_CAP', name: 'Chuyên viên cao cấp', order: 1 },
    { group: 'STATE_MANAGEMENT', code: 'CVC_CHINH', name: 'Chuyên viên chính', order: 2 },
    { group: 'STATE_MANAGEMENT', code: 'CHUYEN_VIEN', name: 'Chuyên viên', order: 3 },
    { group: 'STATE_MANAGEMENT', code: 'CAN_SU', name: 'Cán sự', order: 4 },

    // POST_CATEGORY
    { group: 'POST_CATEGORY', code: 'TIN_TUC', name: 'Tin tức & Sự kiện', order: 1 },
    { group: 'POST_CATEGORY', code: 'THONG_BAO', name: 'Thông báo', order: 2 },
    { group: 'POST_CATEGORY', code: 'VAN_BAN_CHI_DAO', name: 'Văn bản chỉ đạo', order: 3 },
    { group: 'POST_CATEGORY', code: 'HUONG_DAN', name: 'Hướng dẫn nghiệp vụ', order: 4 },

    // ORG_LEVEL
    { group: 'ORG_LEVEL', code: 'TINH', name: 'Cấp Tỉnh/Thành phố', order: 1 },
    { group: 'ORG_LEVEL', code: 'HUYEN', name: 'Cấp Sở/Ngành/Quận/Huyện', order: 2 },
    { group: 'ORG_LEVEL', code: 'XA', name: 'Cấp Phòng/Ban/Xã/Phường', order: 3 },
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