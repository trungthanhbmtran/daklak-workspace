import { PrismaClient } from '../../src/generated/prisma/client';

export async function seedUserGroups(prisma: PrismaClient) {
  console.log('Seeding PBAC User Groups and Policies...');

  // 1. Tạo nhóm quyền Quản trị viên (ADMIN)
  const adminGroup = await prisma.userGroup.upsert({
    where: { name: 'Quản trị viên hệ thống' },
    update: {},
    create: { name: 'Quản trị viên hệ thống' },
  });

  // Lấy tất cả resources hiện có
  const resources = await prisma.resource.findMany();
  
  for (const res of resources) {
    // Cấp toàn quyền (*) cho nhóm Quản trị viên trên mọi tài nguyên
    const existingAdminPolicy = await prisma.policy.findFirst({
      where: {
        resourceId: res.id,
        action: '*',
        userGroups: { some: { id: adminGroup.id } }
      }
    });

    if (!existingAdminPolicy) {
      await prisma.policy.create({
        data: {
          resourceId: res.id,
          action: '*',
          effect: 'ALLOW',
          userGroups: { connect: { id: adminGroup.id } }
        }
      });
    }
  }

  // 2. Tạo nhóm quyền Quản trị viên đơn vị (ORG_ADMIN)
  const orgAdminGroup = await prisma.userGroup.upsert({
    where: { name: 'Quản trị viên đơn vị' },
    update: {},
    create: { name: 'Quản trị viên đơn vị' },
  });

  for (const res of resources) {
    // Cấp toàn quyền (*) cho nhóm Quản trị viên đơn vị trên đơn vị của họ
    const existingOrgAdminPolicy = await prisma.policy.findFirst({
      where: {
        resourceId: res.id,
        action: '*',
        userGroups: { some: { id: orgAdminGroup.id } }
      }
    });

    if (!existingOrgAdminPolicy) {
      await prisma.policy.create({
        data: {
          resourceId: res.id,
          action: '*',
          effect: 'ALLOW',
          conditions: { expression: 'ALLOW IF targetUser.unitCode STARTSWITH user.unitCode OR resource.unitCode STARTSWITH user.unitCode OR resource.departmentId == currentDepartmentId' },
          userGroups: { connect: { id: orgAdminGroup.id } }
        }
      });
    }
  }

  // 3. Tạo nhóm quyền Cán bộ / Nhân viên cơ bản
  const employeeGroup = await prisma.userGroup.upsert({
    where: { name: 'Cán bộ / Chuyên viên' },
    update: {},
    create: { name: 'Cán bộ / Chuyên viên' },
  });

  // Có thể gán các quyền cơ bản (VIEW) ở đây nếu cần,
  // Cấp quyền XEM (VIEW) tài nguyên WORKFLOW cho nhân viên
  const workflowRes = resources.find(r => r.code === 'WORKFLOW');
  if (workflowRes) {
    const existingViewPolicy = await prisma.policy.findFirst({
      where: {
        resourceId: workflowRes.id,
        action: 'VIEW',
        userGroups: { some: { id: employeeGroup.id } }
      }
    });

    if (!existingViewPolicy) {
      await prisma.policy.create({
        data: {
          resourceId: workflowRes.id,
          action: 'VIEW',
          effect: 'ALLOW',
          userGroups: { connect: { id: employeeGroup.id } }
        }
      });
    }
  }
  
  console.log('✅ PBAC seeding completed.');
}
