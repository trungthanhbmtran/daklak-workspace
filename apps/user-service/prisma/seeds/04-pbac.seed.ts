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

  // 2. Tạo nhóm quyền Cán bộ / Nhân viên cơ bản
  const employeeGroup = await prisma.userGroup.upsert({
    where: { name: 'Cán bộ / Chuyên viên' },
    update: {},
    create: { name: 'Cán bộ / Chuyên viên' },
  });

  // Có thể gán các quyền cơ bản (VIEW) ở đây nếu cần,
  // Tạm thời chỉ tạo khung nhóm quyền.
  
  console.log('✅ PBAC seeding completed.');
}
