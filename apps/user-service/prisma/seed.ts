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
  console.log('🌱 START COMPREHENSIVE SEED');

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  // ==========================================================
  // 1. RESOURCES
  // ==========================================================
  const resourcesData = [
    { code: 'SYSTEM', name: 'Hệ thống' },
    { code: 'USER', name: 'Quản lý Người dùng' },
    { code: 'ROLE', name: 'Quản lý Vai trò' },
    { code: 'RESOURCE', name: 'Quản lý Tài nguyên' },
    { code: 'MENU', name: 'Quản lý Menu' },
    { code: 'ORGANIZATION', name: 'Cây tổ chức' },
    { code: 'CATEGORY', name: 'Danh mục hệ thống' },
    { code: 'HRM_EMPLOYEE', name: 'Nhân sự - Nhân viên' },
    { code: 'HRM_DEPT', name: 'Nhân sự - Phòng ban' },
    { code: 'DOCUMENT', name: 'Quản lý Văn bản' },
    { code: 'POST', name: 'Quản lý Bài viết' },
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
  const actions = ['CREATE', 'READ', 'UPDATE', 'DELETE', 'VIEW', 'APPROVE', 'MANAGE'];
  const allPermissions: { id: number }[] = [];

  for (const res of Object.values(resources)) {
    for (const action of actions) {
      // Logic: SYSTEM only has VIEW/MANAGE, others have standard CRUD
      if (res.code === 'SYSTEM' && !['VIEW', 'MANAGE'].includes(action)) continue;

      const perm = await prisma.permission.upsert({
        where: { action_resourceId: { action, resourceId: res.id } },
        update: {},
        create: { action, resourceId: res.id },
      });
      allPermissions.push({ id: perm.id });
    }
  }

  // Helper to get permission ID
  const getPermId = async (action: string, resCode: string) => {
    const resId = resources[resCode].id;
    const p = await prisma.permission.findUnique({
      where: { action_resourceId: { action, resourceId: resId } }
    });
    return p ? { id: p.id } : null;
  };

  // ==========================================================
  // 3. ROLES
  // ==========================================================

  // ROLE: SUPER_ADMIN (All permissions)
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

  // ROLE: ADMIN (Standard System Admin)
  const systemPerms = allPermissions.filter((_, index) => index % 2 === 0); // Placeholder for subset
  const adminRole = await prisma.role.upsert({
    where: { code: 'ADMIN' },
    update: {
      name: 'Quản trị viên',
      permissions: { set: systemPerms },
    },
    create: {
      code: 'ADMIN',
      name: 'Quản trị viên',
      permissions: { connect: systemPerms },
    },
  });

  // ==========================================================
  // 4. MENUS (ADMIN_PORTAL)
  // ==========================================================

  // Root Menu (Invisible container usually)
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

  // -- SERVICE ROOTS (CARDS ON HUB) --

  const services = [
    {
      code: 'USER_SERVICE_ROOT',
      name: 'Quản trị Hệ thống',
      icon: 'shield-checkmark-outline',
      service: 'USER_SERVICE',
      desc: 'Quản lý tài khoản, vai trò, quyền hạn và cây tổ chức.',
      color: '#3b82f6',
      order: 1
    },
    {
      code: 'HRM_SERVICE_ROOT',
      name: 'Quản lý Nhân sự',
      icon: 'people-outline',
      service: 'HRM_SERVICE',
      desc: 'Quản lý thông tin cán bộ, hồ sơ nhân viên và phòng ban.',
      color: '#10b981',
      order: 2
    },
    {
      code: 'DOCUMENT_SERVICE_ROOT',
      name: 'Quản lý Văn bản',
      icon: 'document-text-outline',
      service: 'DOCUMENT_SERVICE',
      desc: 'Quản lý công văn, tờ trình và luồng luân chuyển văn bản.',
      color: '#f59e0b',
      order: 3
    },
    {
      code: 'CONTENT_SERVICE_ROOT',
      name: 'Quản lý Nội dung',
      icon: 'newspaper-outline',
      service: 'CONTENT_SERVICE',
      desc: 'Quản lý bài viết, tin tức và cổng thông tin điện tử.',
      color: '#ec4899',
      order: 4
    },
    {
      code: 'WORKFLOW_SERVICE_ROOT',
      name: 'Quy trình Nghiệp vụ',
      icon: 'layers-outline',
      service: 'WORKFLOW_SERVICE',
      desc: 'Thiết kế và theo dõi các quy trình phê duyệt tự động.',
      color: '#8b5cf6',
      order: 5
    },
  ];

  const serviceNodes: Record<string, any> = {};

  for (const sys of services) {
    const node = await prisma.menu.upsert({
      where: { code: sys.code },
      update: {
        parentId: rootMenu.id,
        name: sys.name,
        icon: sys.icon,
        description: sys.desc,
        iconColor: sys.color,
        order: sys.order,
        service: sys.service,
      },
      create: {
        code: sys.code,
        name: sys.name,
        icon: sys.icon,
        description: sys.desc,
        iconColor: sys.color,
        order: sys.order,
        service: sys.service,
        parentId: rootMenu.id,
        application: 'ADMIN_PORTAL',
      },
    });
    serviceNodes[sys.service] = node;
  }

  // -- SUB MENUS (SIDEBARS) --

  // Admin Sidebar
  const adminMenus = [
    { code: 'ADMIN_ORG', name: 'Đơn vị & Phòng ban', route: 'org', icon: 'apartment', order: 1 },
    { code: 'ADMIN_USERS', name: 'Người dùng', route: 'users', icon: 'person-outline', order: 2 },
    { code: 'ADMIN_ROLES', name: 'Vai trò & Quyền', route: 'roles', icon: 'lock-closed-outline', order: 3 },
    { code: 'ADMIN_RESOURCES', name: 'Tài nguyên', route: 'resources', icon: 'shield-checkmark-outline', order: 4 },
    { code: 'ADMIN_MENUS', name: 'Cấu hình Menu', route: 'menus', icon: 'list-outline', order: 5 },
    { code: 'ADMIN_CATEGORIES', name: 'Danh mục', route: 'categories', icon: 'cog-outline', order: 6 },
  ];

  for (const m of adminMenus) {
    await prisma.menu.upsert({
      where: { code: m.code },
      update: { parentId: serviceNodes['USER_SERVICE'].id, order: m.order, route: m.route, icon: m.icon },
      create: {
        code: m.code,
        name: m.name,
        route: m.route,
        icon: m.icon,
        order: m.order,
        parentId: serviceNodes['USER_SERVICE'].id,
        application: 'ADMIN_PORTAL',
        service: 'USER_SERVICE',
      },
    });
  }

  // HRM Sidebar
  const hrmMenus = [
    { code: 'HRM_DASHBOARD', name: 'Thống kê nhân sự', route: '', icon: 'grid-outline', order: 1 },
    { code: 'HRM_EMPLOYEE_LIST', name: 'Danh sách nhân viên', route: 'employees', icon: 'people-outline', order: 2 },
  ];

  for (const m of hrmMenus) {
    await prisma.menu.upsert({
      where: { code: m.code },
      update: { parentId: serviceNodes['HRM_SERVICE'].id, order: m.order, route: m.route, icon: m.icon },
      create: {
        code: m.code,
        name: m.name,
        route: m.route,
        icon: m.icon,
        order: m.order,
        parentId: serviceNodes['HRM_SERVICE'].id,
        application: 'ADMIN_PORTAL',
        service: 'HRM_SERVICE',
      },
    });
  }

  // ==========================================================
  // 5. USERS
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

  console.log('🎉 COMPREHENSIVE SEED COMPLETED');
  console.log(`👉 SuperAdmin: superadmin@sys.com / ${DEFAULT_PASSWORD}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });