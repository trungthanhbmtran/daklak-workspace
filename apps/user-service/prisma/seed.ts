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
    { code: 'DOC_MINUTES', name: 'Biên bản cuộc họp' },
    { code: 'DOC_CATEGORIES', name: 'Danh mục văn bản' },

    // HRM
    { code: 'HRM_EMPLOYEE', name: 'Quản lý Nhân sự' },

    // CMS
    { code: 'POST', name: 'Quản lý Bài viết' },
    { code: 'POST_CATEGORY', name: 'Quản lý Chuyên mục' },
    { code: 'BANNER', name: 'Quản lý Banner & Quảng cáo' },

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
    { group: 'DISTRICT', code: '47_04', name: 'Huyện Krông Năng', order: 4 },
    { group: 'DISTRICT', code: '47_05', name: 'Huyện Ea H\'leo', order: 5 },
    { group: 'DISTRICT', code: '47_06', name: 'Huyện Buôn Đôn', order: 6 },
    { group: 'DISTRICT', code: '47_07', name: 'Huyện Cư M\'gar', order: 7 },
    { group: 'DISTRICT', code: '47_08', name: 'Huyện Ea Kar', order: 8 },

    { group: 'WARD', code: '47_01_01', name: 'Phường Tân Lợi', order: 1 },
    { group: 'WARD', code: '47_01_02', name: 'Phường Tân Hòa', order: 2 },
    { group: 'WARD', code: '47_01_03', name: 'Phường Tân Lập', order: 3 },
    { group: 'WARD', code: '47_01_04', name: 'Phường Tân An', order: 4 },
    { group: 'WARD', code: '47_01_05', name: 'Phường Thắng Lợi', order: 5 },

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
    { group: 'DOCUMENT_DOMAIN', code: 'GIAO_THONG', name: 'Giao thông vận tải', order: 4 },
    { group: 'DOCUMENT_DOMAIN', code: 'Y_TE', name: 'Y tế', order: 5 },

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

    { group: 'DOMAIN', code: 'KHCN', name: 'Khoa học công nghệ', order: 1 },
    { group: 'DOMAIN', code: 'GIAO_DUC', name: 'Giáo dục', order: 2 },
    { group: 'DOMAIN', code: 'Y_TE', name: 'Y tế', order: 3 },
    { group: 'DOMAIN', code: 'NONG_NGHIEP', name: 'Nông nghiệp & PTNT', order: 4 },
    { group: 'DOMAIN', code: 'CONG_THUONG', name: 'Công thương', order: 5 },

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
  // 3.1 UNIT TYPES (New Model)
  // ==========================================================
  console.log('📦 Seeding Unit Types...');
  const unitTypesData = [
    { code: 'CQ_TU', name: 'Cơ quan Trung ương', level: 1 },
    { code: 'UBND_TINH', name: 'UBND Cấp Tỉnh', level: 1 },
    { code: 'HDND_TINH', name: 'HĐND Cấp Tỉnh', level: 1 },
    { code: 'SO_NGANH', name: 'Sở, Ban, Ngành', level: 2 },
    { code: 'UBND_HUYEN', name: 'UBND Cấp Huyện', level: 2 },
    { code: 'HDND_HUYEN', name: 'HĐND Cấp Huyện', level: 2 },
    { code: 'PHONG_BAN_HUYEN', name: 'Phòng, Ban chuyên môn cấp Huyện', level: 3 },
    { code: 'UBND_XA', name: 'UBND Cấp Xã/Phường', level: 3 },
    { code: 'HDND_XA', name: 'HĐND Cấp Xã', level: 3 },
    { code: 'DVSN', name: 'Đơn vị sự nghiệp', level: 2 },
    { code: 'CHI_CUC', name: 'Chi cục / Tổng cục', level: 2 },
    { code: 'TRUNG_TAM', name: 'Trung tâm', level: 3 },
    { code: 'CQ_DANG', name: 'Cơ quan Đảng', level: 1 },
    { code: 'TO_CHUC_CTXH', name: 'Tổ chức Chính trị - Xã hội', level: 2 },
  ];

  const unitTypeMap: Record<string, any> = {};
  for (const ut of unitTypesData) {
    const created = await prisma.unitType.upsert({
      where: { code: ut.code },
      update: { name: ut.name, level: ut.level },
      create: ut,
    });
    unitTypeMap[ut.code] = created;
  }
  console.log('✅ Unit Types seeded');

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
    update: {
      name: 'Quản trị viên hệ thống',
      permissions: { set: allPermissions },
    },
    create: {
      code: 'ADMIN',
      name: 'Quản trị viên hệ thống',
      permissions: { connect: allPermissions },
    },
  });

  // --- CMS ROLES ---
  const cmsRoles = [
    { code: 'AUTHOR', name: 'Biên tập viên', permissions: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'VIEW'] },
    { code: 'REVIEWER', name: 'Thẩm định & Phê duyệt', permissions: ['READ', 'VIEW', 'UPDATE', 'APPROVE', 'REJECT'] },
    { code: 'PUBLISHER', name: 'Cán bộ xuất bản', permissions: ['READ', 'VIEW', 'PUBLISH'] },
  ];

  const roleMap: Record<string, any> = { SUPER_ADMIN: superAdminRole, ADMIN: adminRole };

  for (const r of cmsRoles) {
    const rolePerms: { id: number }[] = [];
    const postResId = resources['POST'].id;

    for (const action of r.permissions) {
      const perm = await prisma.permission.findUnique({
        where: { action_resourceId: { action: action === 'REJECT' ? 'UPDATE' : action, resourceId: postResId } }
      });
      if (perm) rolePerms.push({ id: perm.id });
    }

    const createdRole = await prisma.role.upsert({
      where: { code: r.code },
      update: { name: r.name, permissions: { set: rolePerms } },
      create: { code: r.code, name: r.name, permissions: { connect: rolePerms } },
    });
    roleMap[r.code] = createdRole;
  }

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
    { code: 'DOC_MENU_FEEDBACKS', name: 'Duyệt Góp ý Công chúng', route: 'consultations/public-feedbacks', icon: 'megaphone-outline', order: 7, res: 'DOC_CONSULTATION' },
    { code: 'DOC_MENU_MINUTES', name: 'Biên bản cuộc họp', route: 'minutes', icon: 'list-outline', order: 8, res: 'DOC_MINUTES' },
    { code: 'DOC_MENU_CATEGORIES', name: 'Danh mục dùng chung', route: 'categories', icon: 'settings-outline', order: 9, res: 'DOC_CATEGORIES' },
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
    { code: 'CONTENT_MENU_POSTS', name: 'Danh sách bài viết', route: '', icon: 'newspaper-outline', order: 1, res: 'POST' },
    { code: 'CONTENT_MENU_MODERATION', name: 'Kiểm duyệt bài viết', route: '', icon: 'shield-checkmark-outline', order: 2, res: 'POST' },
    { code: 'CONTENT_MENU_CATEGORIES', name: 'Chuyên mục', route: 'categories', icon: 'list-outline', order: 3, res: 'POST_CATEGORY' },
    { code: 'CONTENT_MENU_BANNERS', name: 'Banner & Quảng cáo', route: 'banners', icon: 'layers-outline', order: 4, res: 'BANNER' },
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

  // --- CMS USERS ---
  const cmsUsers = [
    { email: 'author@daklak.gov.vn', username: 'author', fullName: 'Nguyễn Văn Biên Tập', role: 'AUTHOR' },
    { email: 'reviewer@daklak.gov.vn', username: 'reviewer', fullName: 'Lê Văn Thẩm Định', role: 'REVIEWER' },
    { email: 'approver@daklak.gov.vn', username: 'approver', fullName: 'Phạm Phê Duyệt', role: 'REVIEWER' },
    { email: 'publisher@daklak.gov.vn', username: 'publisher', fullName: 'Trần Xuất Bản', role: 'PUBLISHER' },
  ];

  for (const u of cmsUsers) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { fullName: u.fullName, roles: { set: [{ id: roleMap[u.role].id }] } },
      create: {
        email: u.email,
        username: u.username,
        fullName: u.fullName,
        roles: { connect: [{ id: roleMap[u.role].id }] },
      },
    });

    await prisma.credential.upsert({
      where: { userId: user.id },
      update: { passwordHash },
      create: { userId: user.id, passwordHash },
    });
  }

  // ==========================================================
  // 7. JOB TITLES
  // ==========================================================
  console.log('📦 Seeding Job Titles...');
  const jobTitlesData = [
    { code: 'CHU_TICH', name: 'Chủ tịch', category: 'EXECUTIVE', rank: 1 },
    { code: 'PHO_CHU_TICH', name: 'Phó Chủ tịch', category: 'EXECUTIVE', rank: 2 },
    { code: 'GIAM_DOC', name: 'Giám đốc', category: 'EXECUTIVE', rank: 1 },
    { code: 'PHO_GIAM_DOC', name: 'Phó Giám đốc', category: 'EXECUTIVE', rank: 2 },
    { code: 'TRUONG_PHONG', name: 'Trưởng phòng', category: 'MANAGER', rank: 1 },
    { code: 'PHO_PHONG', name: 'Phó Trưởng phòng', category: 'MANAGER', rank: 2 },
    { code: 'CHUYEN_VIEN', name: 'Chuyên viên', category: 'STAFF', rank: 3 },
  ];

  for (const jt of jobTitlesData) {
    await prisma.jobTitle.upsert({
      where: { code: jt.code },
      update: { name: jt.name, category: jt.category, rank: jt.rank },
      create: jt,
    });
  }

  // 7.1 LINK JOB TITLES TO UNIT TYPES (Using Template)
  console.log('📦 Linking Job Titles to Unit Types...');
  const links = [
    { jt: 'CHU_TICH', types: ['UBND_TINH', 'UBND_HUYEN', 'UBND_XA', 'HDND_TINH', 'HDND_HUYEN', 'HDND_XA'] },
    { jt: 'PHO_CHU_TICH', types: ['UBND_TINH', 'UBND_HUYEN', 'UBND_XA', 'HDND_TINH', 'HDND_HUYEN', 'HDND_XA'] },
    { jt: 'GIAM_DOC', types: ['SO_NGANH', 'DVSN', 'TRUNG_TAM', 'CHI_CUC'] },
    { jt: 'PHO_GIAM_DOC', types: ['SO_NGANH', 'DVSN', 'TRUNG_TAM', 'CHI_CUC'] },
    { jt: 'TRUONG_PHONG', types: ['PHONG_BAN_HUYEN', 'SO_NGANH', 'DVSN', 'TRUNG_TAM', 'CHI_CUC'] },
    { jt: 'PHO_PHONG', types: ['PHONG_BAN_HUYEN', 'SO_NGANH', 'DVSN', 'TRUNG_TAM', 'CHI_CUC'] },
    { jt: 'CHUYEN_VIEN', types: ['PHONG_BAN_HUYEN', 'SO_NGANH', 'DVSN', 'TRUNG_TAM', 'CHI_CUC', 'CQ_TU', 'UBND_TINH', 'UBND_HUYEN'] },
  ];

  for (const link of links) {
    const jobTitle = await prisma.jobTitle.findUnique({ where: { code: link.jt } });
    if (jobTitle) {
      for (const typeCode of link.types) {
        const typeId = unitTypeMap[typeCode]?.id;
        if (typeId) {
          await prisma.unitTypeJobTemplate.upsert({
            where: { unitTypeId_jobTitleId: { unitTypeId: typeId, jobTitleId: jobTitle.id } },
            update: {},
            create: { unitTypeId: typeId, jobTitleId: jobTitle.id },
          });
        }
      }
    }
  }

  // ==========================================================
  // 8. ORGANIZATIONS (DAK LAK PROVINCE)
  // ==========================================================
  console.log('📦 Seeding Organization Units...');
  const ubndTinhTypeId = unitTypeMap['UBND_TINH'].id;
  const ubndHuyenTypeId = unitTypeMap['UBND_HUYEN'].id;
  const ubndXaTypeId = unitTypeMap['UBND_XA'].id;
  const soTypeId = unitTypeMap['SO_NGANH'].id;
  const phongTypeId = unitTypeMap['PHONG_BAN_HUYEN'].id;
  const dvsnTypeId = unitTypeMap['DVSN'].id;
  const trungTamTypeId = unitTypeMap['TRUNG_TAM'].id;

  const province = await prisma.organizationUnit.upsert({
    where: { code: 'UBND_TINH_DAKLAK' },
    update: { name: 'UBND Tỉnh Đắk Lắk', typeId: ubndTinhTypeId },
    create: { code: 'UBND_TINH_DAKLAK', name: 'UBND Tỉnh Đắk Lắk', typeId: ubndTinhTypeId, shortName: 'UBND Tỉnh' },
  });

  const depts = [
    { code: 'SO_KHCN', name: 'Sở Khoa học và Công nghệ', shortName: 'Sở KH&CN' },
    { code: 'SO_GTVT', name: 'Sở Giao thông vận tải', shortName: 'Sở GTVT' },
    { code: 'SO_YTE', name: 'Sở Y tế', shortName: 'Sở Y tế' },
    { code: 'SO_GDDT', name: 'Sở Giáo dục và Đào tạo', shortName: 'Sở GD&ĐT' },
    { code: 'SO_TC', name: 'Sở Tài chính', shortName: 'Sở Tài chính' },
    { code: 'SO_KHDT', name: 'Sở Kế hoạch và Đầu tư', shortName: 'Sở KH&ĐT' },
    { code: 'SO_NV', name: 'Sở Nội vụ', shortName: 'Sở Nội vụ' },
    { code: 'VP_UBND', name: 'Văn phòng UBND tỉnh', shortName: 'VP UBND' },
  ];

  for (const d of depts) {
    await prisma.organizationUnit.upsert({
      where: { code: d.code },
      update: { parentId: province.id, typeId: soTypeId },
      create: { ...d, parentId: province.id, typeId: soTypeId },
    });
  }

  const districtsUnits = [
    { code: 'UBND_BMT', name: 'UBND Thành phố Buôn Ma Thuột', shortName: 'UBND BMT' },
    { code: 'UBND_BUON_HO', name: 'UBND Thị xã Buôn Hồ', shortName: 'UBND Buôn Hồ' },
  ];

  for (const d of districtsUnits) {
    await prisma.organizationUnit.upsert({
      where: { code: d.code },
      update: { parentId: province.id, typeId: ubndHuyenTypeId },
      create: { ...d, parentId: province.id, typeId: ubndHuyenTypeId },
    });
  }

  // Thêm ví dụ UBND Xã
  const ubndBmt = await prisma.organizationUnit.findUnique({ where: { code: 'UBND_BMT' } });
  if (ubndBmt) {
    await prisma.organizationUnit.upsert({
      where: { code: 'UBND_XA_TAN_LOI' },
      update: { parentId: ubndBmt.id, typeId: ubndXaTypeId },
      create: { code: 'UBND_XA_TAN_LOI', name: 'UBND Phường Tân Lợi', parentId: ubndBmt.id, typeId: ubndXaTypeId },
    });
  }

  // Thêm Đơn vị sự nghiệp tiêu biểu
  const soKhcn = await prisma.organizationUnit.findUnique({ where: { code: 'SO_KHCN' } });
  if (soKhcn) {
    await prisma.organizationUnit.upsert({
      where: { code: 'TT_CNTT_KHCN' },
      update: { parentId: soKhcn.id, typeId: trungTamTypeId },
      create: { code: 'TT_CNTT_KHCN', name: 'Trung tâm Công nghệ thông tin và Khoa học công nghệ', parentId: soKhcn.id, typeId: trungTamTypeId },
    });
  }

  console.log('🎉 COMPREHENSIVE E-GOV SEED COMPLETED');
  console.log(`👉 SuperAdmin: superadmin@sys.com / ${DEFAULT_PASSWORD}`);

  console.log('📦 Seeding Departments for Organizations...');

  // helper tạo phòng ban
  const createDept = async (parentCode: string, dept: { code: string; name: string }) => {
    const parent = await prisma.organizationUnit.findUnique({
      where: { code: parentCode },
    });
    if (!parent) return;

    await prisma.organizationUnit.upsert({
      where: { code: dept.code },
      update: { parentId: parent.id },
      create: {
        code: dept.code,
        name: dept.name,
        parentId: parent.id,
        typeId: phongTypeId,
      },
    });
  };

  // ==========================
  // 1. SỞ KHOA HỌC & CÔNG NGHỆ
  // ==========================
  await createDept('SO_KHCN', { code: 'SO_KHCN_VP', name: 'Văn phòng Sở' });
  await createDept('SO_KHCN', { code: 'SO_KHCN_TT', name: 'Thanh tra Sở' });
  await createDept('SO_KHCN', { code: 'SO_KHCN_KHTC', name: 'Phòng Kế hoạch - Tài chính' });
  await createDept('SO_KHCN', { code: 'SO_KHCN_QLKH', name: 'Phòng Quản lý Khoa học' });
  await createDept('SO_KHCN', { code: 'SO_KHCN_CNSH', name: 'Phòng Công nghệ & Sở hữu trí tuệ' });

  // ==========================
  // 2. SỞ Y TẾ
  // ==========================
  await createDept('SO_YTE', { code: 'SO_YTE_VP', name: 'Văn phòng Sở' });
  await createDept('SO_YTE', { code: 'SO_YTE_TT', name: 'Thanh tra Sở' });
  await createDept('SO_YTE', { code: 'SO_YTE_KHTC', name: 'Phòng Kế hoạch - Tài chính' });
  await createDept('SO_YTE', { code: 'SO_YTE_NVY', name: 'Phòng Nghiệp vụ Y' });
  await createDept('SO_YTE', { code: 'SO_YTE_DUOC', name: 'Phòng Quản lý Dược' });

  // ==========================
  // 3. SỞ GIÁO DỤC
  // ==========================
  await createDept('SO_GDDT', { code: 'SO_GDDT_VP', name: 'Văn phòng Sở' });
  await createDept('SO_GDDT', { code: 'SO_GDDT_TT', name: 'Thanh tra Sở' });
  await createDept('SO_GDDT', { code: 'SO_GDDT_KHTC', name: 'Phòng Kế hoạch - Tài chính' });
  await createDept('SO_GDDT', { code: 'SO_GDDT_TCCB', name: 'Phòng Tổ chức Cán bộ' });
  await createDept('SO_GDDT', { code: 'SO_GDDT_GDTRH', name: 'Phòng Giáo dục Trung học' });

  // ==========================
  // 4. SỞ TÀI CHÍNH
  // ==========================
  await createDept('SO_TC', { code: 'SO_TC_VP', name: 'Văn phòng Sở' });
  await createDept('SO_TC', { code: 'SO_TC_TT', name: 'Thanh tra Sở' });
  await createDept('SO_TC', { code: 'SO_TC_NS', name: 'Phòng Ngân sách' });
  await createDept('SO_TC', { code: 'SO_TC_HCSN', name: 'Phòng Hành chính sự nghiệp' });

  // ==========================
  // 5. UBND TP BUÔN MA THUỘT
  // ==========================
  await createDept('UBND_BMT', { code: 'BMT_VP', name: 'Văn phòng HĐND & UBND' });
  await createDept('UBND_BMT', { code: 'BMT_NV', name: 'Phòng Nội vụ' });
  await createDept('UBND_BMT', { code: 'BMT_TC_KH', name: 'Phòng Tài chính - Kế hoạch' });
  await createDept('UBND_BMT', { code: 'BMT_KT', name: 'Phòng Kinh tế' });
  await createDept('UBND_BMT', { code: 'BMT_TNMT', name: 'Phòng Tài nguyên & Môi trường' });

  // ==========================
  // 6. UBND BUÔN HỒ
  // ==========================
  await createDept('UBND_BUON_HO', { code: 'BH_VP', name: 'Văn phòng HĐND & UBND' });
  await createDept('UBND_BUON_HO', { code: 'BH_NV', name: 'Phòng Nội vụ' });
  await createDept('UBND_BUON_HO', { code: 'BH_TC_KH', name: 'Phòng Tài chính - Kế hoạch' });
  await createDept('UBND_BUON_HO', { code: 'BH_KT_HT', name: 'Phòng Kinh tế - Hạ tầng' });
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });