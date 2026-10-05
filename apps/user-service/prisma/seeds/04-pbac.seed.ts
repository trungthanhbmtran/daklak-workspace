import { PrismaClient } from '../../src/generated/prisma/client';

export async function seedUserGroups(prisma: PrismaClient) {
  console.log('Seeding PBAC User Groups and Policies...');

  const resources = await prisma.resource.findMany();
  const getRes = (code: string) => resources.find((r) => r.code === code);

  // Helper để tạo policy
  const ensurePolicy = async (
    groupId: number,
    resourceId: number,
    actions: string[],
    conditions?: string
  ) => {
    for (const action of actions) {
      const existing = await prisma.policy.findFirst({
        where: {
          resourceId,
          action,
          userGroups: { some: { id: groupId } },
        },
      });
      if (!existing) {
        await prisma.policy.create({
          data: {
            resourceId,
            action,
            effect: 'ALLOW',
            conditions: conditions ? { expression: conditions } : undefined,
            userGroups: { connect: { id: groupId } },
          },
        });
      }
    }
  };

  // 1. Quản trị viên hệ thống (System Admin)
  const adminGroup = await prisma.userGroup.upsert({
    where: { name: 'Quản trị viên hệ thống' },
    update: {},
    create: { name: 'Quản trị viên hệ thống' },
  });

  for (const res of resources) {
    await ensurePolicy(adminGroup.id, res.id, ['*']);
  }

  // 2. Quản trị viên đơn vị (Org Admin)
  const orgAdminGroup = await prisma.userGroup.upsert({
    where: { name: 'Quản trị viên đơn vị' },
    update: {},
    create: { name: 'Quản trị viên đơn vị' },
  });

  const orgAdminCondition = 'ALLOW IF targetUser.unitCode STARTSWITH user.unitCode OR resource.unitCode STARTSWITH user.unitCode OR resource.departmentId == currentDepartmentId';
  for (const res of resources) {
    await ensurePolicy(orgAdminGroup.id, res.id, ['*'], orgAdminCondition);
  }

  // 3. Lãnh đạo đơn vị (Unit Leader)
  const leaderGroup = await prisma.userGroup.upsert({
    where: { name: 'Lãnh đạo đơn vị' },
    update: {},
    create: { name: 'Lãnh đạo đơn vị' },
  });
  
  const leaderCondition = 'ALLOW IF resource.unitCode == user.unitCode OR resource.departmentId == currentDepartmentId';
  const leaderResources = ['DOCUMENT', 'DOC_INCOMING', 'DOC_OUTGOING', 'DOC_INTERNAL', 'WORKFLOW', 'TASK', 'HRM_EMPLOYEE', 'REPORT', 'PROJECT', 'PLAN'];
  for (const code of leaderResources) {
    const res = getRes(code);
    if (res) {
      await ensurePolicy(leaderGroup.id, res.id, ['VIEW', 'APPROVE', 'ASSIGN', 'UPDATE'], leaderCondition);
    }
  }

  // 4. Văn thư (Clerk)
  const clerkGroup = await prisma.userGroup.upsert({
    where: { name: 'Văn thư đơn vị' },
    update: {},
    create: { name: 'Văn thư đơn vị' },
  });
  
  const clerkCondition = 'ALLOW IF resource.unitCode == user.unitCode';
  const clerkResources = ['DOC_INCOMING', 'DOC_OUTGOING', 'DOC_INTERNAL', 'DOC_PUBLISH', 'DOC_CATEGORIES', 'DOCUMENT', 'MEETING'];
  for (const code of clerkResources) {
    const res = getRes(code);
    if (res) {
      await ensurePolicy(clerkGroup.id, res.id, ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'PUBLISH'], clerkCondition);
    }
  }

  // 5. Cán bộ / Chuyên viên (Specialist)
  const specialistGroup = await prisma.userGroup.upsert({
    where: { name: 'Cán bộ / Chuyên viên' },
    update: {},
    create: { name: 'Cán bộ / Chuyên viên' },
  });
  
  const specialistCondition = 'ALLOW IF resource.assigneeId == user.id OR resource.creatorId == user.id OR resource.departmentId == currentDepartmentId';
  
  // Quyền cơ bản: Được XEM danh bạ, tài nguyên nội bộ
  ['HRM_EMPLOYEE', 'ORGANIZATION', 'CATEGORY'].forEach(async (code) => {
    const res = getRes(code);
    if (res) await ensurePolicy(specialistGroup.id, res.id, ['VIEW'], 'ALLOW IF resource.unitCode == user.unitCode');
  });

  // Quyền thao tác công việc của mình
  ['TASK', 'DOCUMENT', 'DOC_DRAFT', 'WORKFLOW'].forEach(async (code) => {
    const res = getRes(code);
    if (res) {
      await ensurePolicy(specialistGroup.id, res.id, ['VIEW', 'CREATE', 'UPDATE'], specialistCondition);
    }
  });

  console.log('✅ PBAC seeding completed.');
}
