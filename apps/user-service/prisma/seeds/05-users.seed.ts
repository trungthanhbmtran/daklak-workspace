import { PrismaClient } from '../../src/generated/prisma/client';
import * as bcrypt from 'bcrypt';

export async function usersSeed(prisma: PrismaClient) {
  console.log('Seeding users...');

  // 1. Lấy nhóm quyền
  const adminGroup = await prisma.userGroup.findUnique({
    where: { name: 'Quản trị viên hệ thống' },
  });
  const orgAdminGroup = await prisma.userGroup.findUnique({
    where: { name: 'Quản trị viên đơn vị' },
  });
  const staffGroup = await prisma.userGroup.findUnique({
    where: { name: 'Cán bộ / Chuyên viên' },
  });

  const defaultPassword = 'Admin@123'; // Cấp lại mật khẩu thống nhất là Admin@123 cho tiện test
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  // --- CMS USERS ---
  const cmsUsers = [
    {
      email: 'superadmin@sys.com',
      username: 'superadmin',
      fullName: 'Super Administrator',
      isAdmin: true,
    },
    {
      email: 'admin@sys.com',
      username: 'admin',
      fullName: 'System Administrator',
      isAdmin: true,
    },
    {
      email: 'orgadmin@daklak.gov.vn',
      username: 'orgadmin',
      fullName: 'Quản trị viên Đơn vị',
      isAdmin: true,
    },
    {
      email: 'author@daklak.gov.vn',
      username: 'author',
      fullName: 'Nguyễn Văn Biên Tập',
      isAdmin: false,
    },
    {
      email: 'reviewer@daklak.gov.vn',
      username: 'reviewer',
      fullName: 'Lê Văn Thẩm Định',
      isAdmin: false,
    },
    {
      email: 'approver@daklak.gov.vn',
      username: 'approver',
      fullName: 'Phạm Phê Duyệt',
      isAdmin: false,
    },
    {
      email: 'publisher@daklak.gov.vn',
      username: 'publisher',
      fullName: 'Trần Xuất Bản',
      isAdmin: false,
    },
    {
      email: 'trungthanh@daklak.gov.vn',
      username: 'trungthanh',
      fullName: 'Trần Trung Thành',
      isAdmin: true,
    },
  ];

  for (const u of cmsUsers) {
    let groupId = staffGroup ? staffGroup.id : null;
    if (u.username === 'orgadmin') {
      groupId = orgAdminGroup ? orgAdminGroup.id : groupId;
    } else if (u.isAdmin) {
      groupId = adminGroup ? adminGroup.id : groupId;
    }
    
    if (!groupId) continue; // Bỏ qua nếu không tìm thấy nhóm quyền

    const user = await prisma.user.upsert({
      where: { username: u.username },
      update: {
        email: u.email,
        fullName: u.fullName,
        isActive: true,
        UserToUserGroup: {
          deleteMany: {},
          create: [{ B: groupId }]
        }
      },
      create: {
        username: u.username,
        email: u.email,
        fullName: u.fullName,
        isActive: true,
        employeeCode: u.username.toUpperCase(),
        UserToUserGroup: {
          create: [{ B: groupId }]
        }
      },
    });

    await prisma.credential.upsert({
      where: { userId: user.id },
      update: { passwordHash },
      create: { userId: user.id, passwordHash },
    });
  }

  console.log('✅ Users seeded successfully.');
}