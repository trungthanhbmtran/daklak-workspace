import { PrismaClient } from '../../src/generated/prisma/client';

export async function seedUserGroups(prisma: PrismaClient) {
  console.log('Seeding PBAC User Groups and Policies...');

  const resources = await prisma.resource.findMany();
  const getRes = (code: string) => resources.find((r) => r.code === code);

  // Helper để tạo policy an toàn cho danh sách actions
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

  const grant = async (
    groupId: number,
    resourceCode: string,
    actions: string[],
    conditions?: string
  ) => {
    const res = getRes(resourceCode);
    if (res) {
      await ensurePolicy(groupId, res.id, actions, conditions);
    }
  };

  // 1. Quản trị viên hệ thống (System Admin) - Full toàn quyền
  const adminGroup = await prisma.userGroup.upsert({
    where: { name: 'Quản trị viên hệ thống' },
    update: {},
    create: { name: 'Quản trị viên hệ thống' },
  });

  for (const res of resources) {
    await ensurePolicy(adminGroup.id, res.id, ['*']);
  }

  // 2. Quản trị viên đơn vị (Org Admin) - Quản trị tài khoản, nhân sự & tổ chức trong đơn vị
  const orgAdminGroup = await prisma.userGroup.upsert({
    where: { name: 'Quản trị viên đơn vị' },
    update: {},
    create: { name: 'Quản trị viên đơn vị' },
  });

  const orgAdminCondition = 'ALLOW IF targetUser.unitCode STARTSWITH user.unitCode OR resource.unitCode STARTSWITH user.unitCode OR resource.departmentId == currentDepartmentId';
  await grant(orgAdminGroup.id, 'USER', ['*'], orgAdminCondition);
  await grant(orgAdminGroup.id, 'HRM_EMPLOYEE', ['*'], orgAdminCondition);
  await grant(orgAdminGroup.id, 'ORGANIZATION', ['VIEW', 'UPDATE'], orgAdminCondition);
  await grant(orgAdminGroup.id, 'ROLE', ['VIEW', 'ASSIGN'], orgAdminCondition);
  await grant(orgAdminGroup.id, 'CATEGORY', ['VIEW'], orgAdminCondition);
  await grant(orgAdminGroup.id, 'MENU', ['VIEW'], orgAdminCondition);
  await grant(orgAdminGroup.id, 'TASK', ['VIEW', 'CREATE', 'UPDATE'], orgAdminCondition);
  await grant(orgAdminGroup.id, 'REPORT', ['VIEW', 'EXPORT'], orgAdminCondition);
  await grant(orgAdminGroup.id, 'DOCUMENT', ['VIEW'], orgAdminCondition);

  // 3. Lãnh đạo đơn vị (Unit Leader) - Điều hành, giao việc, phê duyệt, thẩm định đánh giá & báo cáo
  const leaderGroup = await prisma.userGroup.upsert({
    where: { name: 'Lãnh đạo đơn vị' },
    update: {},
    create: { name: 'Lãnh đạo đơn vị' },
  });
  
  const leaderCondition = 'ALLOW IF resource.unitCode == user.unitCode OR resource.departmentId == currentDepartmentId';
  await grant(leaderGroup.id, 'TASK', ['VIEW', 'CREATE', 'UPDATE', 'APPROVE', 'ASSIGN', 'REASSIGN', 'EVALUATE', 'DELETE'], leaderCondition);
  await grant(leaderGroup.id, 'HRM_EMPLOYEE', ['VIEW'], leaderCondition);
  await grant(leaderGroup.id, 'DOCUMENT', ['VIEW', 'CREATE', 'UPDATE', 'APPROVE', 'ASSIGN', 'PUBLISH'], leaderCondition);
  await grant(leaderGroup.id, 'DOC_INCOMING', ['VIEW', 'CREATE', 'UPDATE', 'APPROVE', 'ASSIGN', 'PUBLISH'], leaderCondition);
  await grant(leaderGroup.id, 'DOC_OUTGOING', ['VIEW', 'CREATE', 'UPDATE', 'APPROVE', 'ASSIGN', 'PUBLISH'], leaderCondition);
  await grant(leaderGroup.id, 'DOC_INTERNAL', ['VIEW', 'CREATE', 'UPDATE', 'APPROVE', 'ASSIGN', 'PUBLISH'], leaderCondition);
  await grant(leaderGroup.id, 'DOC_PUBLISH', ['VIEW', 'CREATE', 'UPDATE', 'APPROVE', 'ASSIGN', 'PUBLISH'], leaderCondition);
  await grant(leaderGroup.id, 'REPORT', ['VIEW', 'CREATE', 'UPDATE', 'APPROVE', 'EXPORT'], leaderCondition);
  await grant(leaderGroup.id, 'PLAN', ['VIEW', 'CREATE', 'UPDATE', 'APPROVE', 'ASSIGN'], leaderCondition);
  await grant(leaderGroup.id, 'MEETING', ['VIEW', 'CREATE', 'UPDATE', 'APPROVE'], leaderCondition);
  await grant(leaderGroup.id, 'WORKFLOW', ['VIEW', 'EXECUTE', 'APPROVE'], leaderCondition);
  await grant(leaderGroup.id, 'PROJECT', ['VIEW', 'CREATE', 'UPDATE', 'APPROVE'], leaderCondition);
  await grant(leaderGroup.id, 'ORGANIZATION', ['VIEW']);
  await grant(leaderGroup.id, 'CATEGORY', ['VIEW']);

  // 4. Văn thư đơn vị (Clerk) - Quản lý văn thư, lưu trữ, phát hành & lịch họp
  const clerkGroup = await prisma.userGroup.upsert({
    where: { name: 'Văn thư đơn vị' },
    update: {},
    create: { name: 'Văn thư đơn vị' },
  });
  
  const clerkCondition = 'ALLOW IF resource.unitCode == user.unitCode';
  const clerkDocResources = ['DOCUMENT', 'DOC_INCOMING', 'DOC_OUTGOING', 'DOC_INTERNAL', 'DOC_DRAFT', 'DOC_PUBLISH', 'DOC_CATEGORIES'];
  for (const code of clerkDocResources) {
    await grant(clerkGroup.id, code, ['*'], clerkCondition);
  }
  await grant(clerkGroup.id, 'MEETING', ['VIEW', 'CREATE', 'UPDATE'], clerkCondition);
  await grant(clerkGroup.id, 'TASK', ['VIEW', 'CREATE', 'UPDATE'], clerkCondition);
  await grant(clerkGroup.id, 'REPORT', ['VIEW', 'CREATE', 'EXPORT'], clerkCondition);
  await grant(clerkGroup.id, 'HRM_EMPLOYEE', ['VIEW']);
  await grant(clerkGroup.id, 'ORGANIZATION', ['VIEW']);
  await grant(clerkGroup.id, 'CATEGORY', ['VIEW']);

  // 5. Cán bộ / Chuyên viên (Specialist) - Thực thi công việc, lập báo cáo, soạn dự thảo văn bản
  const specialistGroup = await prisma.userGroup.upsert({
    where: { name: 'Cán bộ / Chuyên viên' },
    update: {},
    create: { name: 'Cán bộ / Chuyên viên' },
  });
  
  const specialistCondition = 'ALLOW IF resource.assigneeId == user.id OR resource.creatorId == user.id OR resource.departmentId == currentDepartmentId';
  await grant(specialistGroup.id, 'TASK', ['VIEW', 'CREATE', 'UPDATE'], specialistCondition);
  await grant(specialistGroup.id, 'DOCUMENT', ['VIEW', 'CREATE', 'UPDATE'], specialistCondition);
  await grant(specialistGroup.id, 'DOC_DRAFT', ['VIEW', 'CREATE', 'UPDATE'], specialistCondition);
  await grant(specialistGroup.id, 'DOC_INCOMING', ['VIEW'], specialistCondition);
  await grant(specialistGroup.id, 'DOC_OUTGOING', ['VIEW'], specialistCondition);
  await grant(specialistGroup.id, 'DOC_INTERNAL', ['VIEW'], specialistCondition);
  await grant(specialistGroup.id, 'REPORT', ['VIEW', 'CREATE', 'UPDATE', 'EXPORT'], specialistCondition);
  await grant(specialistGroup.id, 'PLAN', ['VIEW'], specialistCondition);
  await grant(specialistGroup.id, 'MEETING', ['VIEW'], specialistCondition);
  await grant(specialistGroup.id, 'WORKFLOW', ['VIEW', 'EXECUTE'], specialistCondition);
  await grant(specialistGroup.id, 'HRM_EMPLOYEE', ['VIEW']);
  await grant(specialistGroup.id, 'ORGANIZATION', ['VIEW']);
  await grant(specialistGroup.id, 'CATEGORY', ['VIEW']);

  console.log('✅ PBAC seeding completed.');
}
