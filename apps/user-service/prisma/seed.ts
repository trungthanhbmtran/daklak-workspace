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
  console.log('🌱 START SEED');

  // ==========================================================
  // 1. RESOURCE (PBAC)
  // ==========================================================
  const resSystem = await prisma.resource.upsert({
    where: { code: 'SYSTEM' },
    update: {},
    create: { code: 'SYSTEM', name: 'Hệ thống' },
  });

  const resUser = await prisma.resource.upsert({
    where: { code: 'USER' },
    update: {},
    create: { code: 'USER', name: 'Người dùng' },
  });

  const resWorkflow = await prisma.resource.upsert({
    where: { code: 'WORKFLOW' },
    update: {},
    create: { code: 'WORKFLOW', name: 'Quy trình nghiệp vụ' },
  });

  // ==========================================================
  // 2. PERMISSION
  // ==========================================================
  const permSystemView = await prisma.permission.upsert({
    where: { action_resourceId: { action: 'VIEW', resourceId: resSystem.id } },
    update: {},
    create: { action: 'VIEW', resourceId: resSystem.id },
  });

  const permUserRead = await prisma.permission.upsert({
    where: { action_resourceId: { action: 'READ', resourceId: resUser.id } },
    update: {},
    create: { action: 'READ', resourceId: resUser.id },
  });

  const permUserCreate = await prisma.permission.upsert({
    where: { action_resourceId: { action: 'CREATE', resourceId: resUser.id } },
    update: {},
    create: { action: 'CREATE', resourceId: resUser.id },
  });

  const permWorkflowView = await prisma.permission.upsert({
    where: { action_resourceId: { action: 'VIEW', resourceId: resWorkflow.id } },
    update: {},
    create: { action: 'VIEW', resourceId: resWorkflow.id },
  });

  const permWorkflowApprove = await prisma.permission.upsert({
    where: { action_resourceId: { action: 'APPROVE', resourceId: resWorkflow.id } },
    update: {},
    create: { action: 'APPROVE', resourceId: resWorkflow.id },
  });

  // ==========================================================
  // 3. ROLE
  // ==========================================================
  const adminRole = await prisma.role.upsert({
    where: { code: 'ADMIN' },
    update: {
      permissions: {
        set: [
          { id: permSystemView.id },
          { id: permUserRead.id },
          { id: permUserCreate.id },
          { id: permWorkflowView.id },
          { id: permWorkflowApprove.id },
        ],
      },
    },
    create: {
      code: 'ADMIN',
      name: 'Admin',
      permissions: {
        connect: [
          { id: permSystemView.id },
          { id: permUserRead.id },
          { id: permUserCreate.id },
          { id: permWorkflowView.id },
          { id: permWorkflowApprove.id },
        ],
      },
    },
  });

  const managerRole = await prisma.role.upsert({
    where: { code: 'MANAGER' },
    update: {
      permissions: {
        set: [
          { id: permUserRead.id },
          { id: permWorkflowApprove.id },
        ],
      },
    },
    create: {
      code: 'MANAGER',
      name: 'Manager',
      permissions: {
        connect: [
          { id: permUserRead.id },
          { id: permWorkflowApprove.id },
        ],
      },
    },
  });

  const viewerRole = await prisma.role.upsert({
    where: { code: 'VIEWER' },
    update: {
      permissions: {
        set: [{ id: permUserRead.id }],
      },
    },
    create: {
      code: 'VIEWER',
      name: 'Viewer',
      permissions: {
        connect: [{ id: permUserRead.id }],
      },
    },
  });

  // ==========================================================
  // 4. MENU
  // ==========================================================
  const rootMenu = await prisma.menu.upsert({
    where: { code: 'SYS_ROOT' },
    update: {},
    create: {
      code: 'SYS_ROOT',
      name: 'Hệ thống',
      order: 0,
      application: 'ADMIN_PORTAL',
      requiredPermissions: {
        create: [{ permissionId: permSystemView.id }],
      },
    },
  });

  const adminRoot = await prisma.menu.upsert({
    where: { code: 'ADMIN_ROOT' },
    update: { parentId: rootMenu.id },
    create: {
      code: 'ADMIN_ROOT',
      name: 'Quản trị',
      parentId: rootMenu.id,
      application: 'ADMIN_PORTAL',
      requiredPermissions: {
        create: [{ permissionId: permSystemView.id }],
      },
    },
  });

  await prisma.menu.upsert({
    where: { code: 'USER_MENU' },
    update: { parentId: adminRoot.id },
    create: {
      code: 'USER_MENU',
      name: 'Người dùng',
      route: '/users',
      parentId: adminRoot.id,
      application: 'ADMIN_PORTAL',
      requiredPermissions: {
        create: [{ permissionId: permUserRead.id }],
      },
    },
  });

  await prisma.menu.upsert({
    where: { code: 'WORKFLOW_MENU' },
    update: { parentId: adminRoot.id },
    create: {
      code: 'WORKFLOW_MENU',
      name: 'Workflow',
      route: '/workflow',
      parentId: adminRoot.id,
      application: 'ADMIN_PORTAL',
      service: 'WORKFLOW_SERVICE',
      requiredPermissions: {
        create: [{ permissionId: permWorkflowView.id }],
      },
    },
  });

  // ==========================================================
  // 5. USERS
  // ==========================================================
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  const createUser = async (email: string, roleId: number) => {
    const user = await prisma.user.upsert({
      where: { email },
      update: { roles: { set: [{ id: roleId }] } },
      create: {
        email,
        username: email,
        fullName: email,
        roles: { connect: [{ id: roleId }] },
      },
    });

    await prisma.credential.upsert({
      where: { userId: user.id },
      update: { passwordHash },
      create: { userId: user.id, passwordHash },
    });

    return user;
  };

  const admin = await createUser('admin@sys.com', adminRole.id);
  const manager = await createUser('manager@sys.com', managerRole.id);
  const viewer = await createUser('viewer@sys.com', viewerRole.id);

  // ==========================================================
  // 6. USER GROUP
  // ==========================================================
  await prisma.userGroup.upsert({
    where: { name: 'Managers' },
    update: {},
    create: {
      name: 'Managers',
      users: { connect: [{ id: manager.id }] },
      roles: { connect: [{ id: managerRole.id }] },
    },
  });

  // ==========================================================
  // DONE
  // ==========================================================
  console.log('🎉 SEED COMPLETED');
  console.log(`👉 Default password: ${DEFAULT_PASSWORD}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });