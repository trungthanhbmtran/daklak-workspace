import { PrismaClient } from '../../src/generated/prisma/client';
import * as bcrypt from 'bcrypt';

export async function seedUsers(prisma: PrismaClient) {
  const DEFAULT_PASSWORD = 'Admin@123';
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  
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
    {
      email: 'admin@sys.com',
      username: 'admin',
      fullName: 'System Administrator',
      role: 'ADMIN',
    },
    {
      email: 'orgadmin@daklak.gov.vn',
      username: 'orgadmin',
      fullName: 'Quản trị viên Đơn vị',
      role: 'ORG_ADMIN',
    },
    {
      email: 'author@daklak.gov.vn',
      username: 'author',
      fullName: 'Nguyễn Văn Biên Tập',
      role: 'AUTHOR',
    },
    {
      email: 'reviewer@daklak.gov.vn',
      username: 'reviewer',
      fullName: 'Lê Văn Thẩm Định',
      role: 'REVIEWER',
    },
    {
      email: 'approver@daklak.gov.vn',
      username: 'approver',
      fullName: 'Phạm Phê Duyệt',
      role: 'REVIEWER',
    },
    {
      email: 'publisher@daklak.gov.vn',
      username: 'publisher',
      fullName: 'Trần Xuất Bản',
      role: 'PUBLISHER',
    },
    {
      email: 'trungthanh@daklak.gov.vn',
      username: 'trungthanh',
      fullName: 'Trần Trung Thành',
      role: 'ADMIN',
    },
  ];

  for (const u of cmsUsers) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        fullName: u.fullName,
        roles: { set: [{ id: roleMap[u.role].id }] },
      },
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

  
}
