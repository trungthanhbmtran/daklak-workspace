import { PrismaClient } from '../src/generated/prisma';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as dotenv from 'dotenv';

dotenv.config();

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) throw new Error('DATABASE_URL is not set');
const mariadbUrl = dbUrl.replace(/^mysql:\/\//, 'mariadb://');
const adapter = new PrismaMariaDb(mariadbUrl);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Bắt đầu cập nhật cơ sở dữ liệu cho Tỉnh ủy Đắk Lắk...');

  // 1. Đảm bảo UnitType
  const typeCoQuanDang = await prisma.unitType.upsert({
    where: { code: 'CQ_DANG' },
    update: {},
    create: { code: 'CQ_DANG', name: 'Cơ quan Đảng', level: 1 },
  });

  const typeBanDang = await prisma.unitType.upsert({
    where: { code: 'BAN_DANG' },
    update: {},
    create: { code: 'BAN_DANG', name: 'Các Ban Đảng', level: 2 },
  });

  const typePhongBanDang = await prisma.unitType.upsert({
    where: { code: 'PHONG_BAN_DANG' },
    update: {},
    create: { code: 'PHONG_BAN_DANG', name: 'Phòng chuyên môn Đảng', level: 3 },
  });

  const typeVanPhongDang = await prisma.unitType.upsert({
    where: { code: 'VAN_PHONG_DANG_UY' },
    update: {},
    create: { code: 'VAN_PHONG_DANG_UY', name: 'Văn phòng Đảng ủy', level: 3 },
  });

  // 2. Tổ chức / Đơn vị
  const tinhUy = await prisma.organizationUnit.upsert({
    where: { code: 'TU_DAKLAK' },
    update: {},
    create: {
      code: 'TU_DAKLAK',
      name: 'Tỉnh ủy Đắk Lắk',
      typeId: typeCoQuanDang.id,
    },
  });

  const btcTu = await prisma.organizationUnit.upsert({
    where: { code: 'BTCTU_DAKLAK' },
    update: { parentId: tinhUy.id, typeId: typeBanDang.id },
    create: {
      code: 'BTCTU_DAKLAK',
      name: 'Ban Tổ chức Tỉnh ủy Đắk Lắk',
      typeId: typeBanDang.id,
      parentId: tinhUy.id,
    },
  });

  // Các phòng ban thuộc Ban Tổ chức Tỉnh ủy
  const divisions = [
    { code: 'P_TCD_DV', name: 'Phòng Tổ chức đảng, đảng viên' },
    { code: 'P_TCCB', name: 'Phòng Tổ chức cán bộ' },
    { code: 'P_BVCTNB', name: 'Phòng Bảo vệ chính trị nội bộ' },
    { code: 'VAN_PHONG', name: 'Văn phòng Ban' },
  ];

  const orgUnits: any = {
    'BTCTU_DAKLAK': btcTu
  };
  for (const div of divisions) {
    const typeId = div.code === 'VAN_PHONG' ? typeVanPhongDang.id : typePhongBanDang.id;
    const org = await prisma.organizationUnit.upsert({
      where: { code: div.code },
      update: { parentId: btcTu.id, typeId },
      create: {
        code: div.code,
        name: div.name,
        typeId,
        parentId: btcTu.id,
      },
    });
    orgUnits[div.code] = org;
  }

  // 3. Chức danh (JobTitle)
  const jobTitles: any[] = [
    { code: 'R_BTCTU_TB', name: 'Trưởng ban', typeCode: 'BAN_DANG' },
    { code: 'R_BTCTU_PTB', name: 'Phó Trưởng ban', typeCode: 'BAN_DANG' },
    { code: 'R_P_TCD_DV_TP', name: 'Trưởng phòng Tổ chức đảng, đảng viên', typeCode: 'PHONG_BAN_DANG' },
    { code: 'R_P_TCD_DV_PTP', name: 'Phó Trưởng phòng Tổ chức đảng, đảng viên', typeCode: 'PHONG_BAN_DANG' },
    { code: 'R_P_TCD_DV_CV', name: 'Công chức Phòng Tổ chức đảng, đảng viên', typeCode: 'PHONG_BAN_DANG' },
    { code: 'R_P_TCCB_TP', name: 'Trưởng phòng Tổ chức cán bộ', typeCode: 'PHONG_BAN_DANG' },
    { code: 'R_P_TCCB_CV', name: 'Chuyên viên Phòng Tổ chức cán bộ', typeCode: 'PHONG_BAN_DANG' },
    { code: 'R_P_BVCTNB_TP', name: 'Trưởng phòng Bảo vệ chính trị nội bộ', typeCode: 'PHONG_BAN_DANG' },
    { code: 'R_P_BVCTNB_CV', name: 'Công chức và Cán bộ Công an biệt phái', typeCode: 'PHONG_BAN_DANG' },
    { code: 'R_VP_CVP', name: 'Chánh Văn phòng Ban Tổ chức Tỉnh ủy', typeCode: 'VAN_PHONG_DANG_UY' },
    { code: 'R_VP_NV', name: 'Nhân viên Văn phòng Ban', typeCode: 'VAN_PHONG_DANG_UY' },
  ];

  const jobs: Record<string, any> = {};
  for (const jt of jobTitles) {
    const job = await prisma.jobTitle.upsert({
      where: { code: jt.code },
      update: { name: jt.name },
      create: { code: jt.code, name: jt.name },
    });
    jobs[jt.code] = job;
    
    // Link to UnitType
    let typeId: number | undefined;
    if (jt.typeCode === 'BAN_DANG') typeId = typeBanDang.id;
    else if (jt.typeCode === 'PHONG_BAN_DANG') typeId = typePhongBanDang.id;
    else if (jt.typeCode === 'VAN_PHONG_DANG_UY') typeId = typeVanPhongDang.id;
    else if (jt.typeCode === 'CQ_DANG') typeId = typeCoQuanDang.id;

    if (typeId) {
      await prisma.unitTypeJobTemplate.upsert({
        where: { unitTypeId_jobTitleId: { unitTypeId: typeId, jobTitleId: job.id } },
        update: {},
        create: { unitTypeId: typeId, jobTitleId: job.id },
      });
    }
  }

  // 4. Tạo User và JobPosition
  const usersToSeed = [
    // Lãnh đạo Ban
    { email: 'nguyenthuonghai@daklak.gov.vn', username: 'nguyenthuonghai', fullName: 'Nguyễn Thượng Hải', jobCode: 'R_BTCTU_TB', orgCode: 'BTCTU_DAKLAK', isLeader: true },
    { email: 'luuvinhhung@daklak.gov.vn', username: 'luuvinhhung', fullName: 'Lưu Vĩnh Hưng', jobCode: 'R_BTCTU_PTB', orgCode: 'BTCTU_DAKLAK', isLeader: false },
    { email: 'phamthixuyen@daklak.gov.vn', username: 'phamthixuyen', fullName: 'Phạm Thị Xuyến', jobCode: 'R_BTCTU_PTB', orgCode: 'BTCTU_DAKLAK', isLeader: false },
    { email: 'nguyenbakim@daklak.gov.vn', username: 'nguyenbakim', fullName: 'Nguyễn Bá Kim', jobCode: 'R_BTCTU_PTB', orgCode: 'BTCTU_DAKLAK', isLeader: false },
    { email: 'nguyenhuutoan@daklak.gov.vn', username: 'nguyenhuutoan', fullName: 'Nguyễn Hữu Toàn', jobCode: 'R_BTCTU_PTB', orgCode: 'BTCTU_DAKLAK', isLeader: false },
    { email: 'nguyenvanha@daklak.gov.vn', username: 'nguyenvanha', fullName: 'Nguyễn Văn Hà', jobCode: 'R_BTCTU_PTB', orgCode: 'BTCTU_DAKLAK', isLeader: false },
    
    // Lãnh đạo, chuyên viên các phòng ban
    { email: 'hoangxuanviet@daklak.gov.vn', username: 'hoangxuanviet', fullName: 'Hoàng Xuân Việt', jobCode: 'R_P_TCD_DV_TP', orgCode: 'P_TCD_DV', isLeader: true },
    { email: 'nguyenngocsan@daklak.gov.vn', username: 'nguyenngocsan', fullName: 'Nguyễn Ngọc San', jobCode: 'R_P_TCD_DV_PTP', orgCode: 'P_TCD_DV', isLeader: false },
    { email: 'nguyenvana@daklak.gov.vn', username: 'nguyenvana', fullName: 'Nguyễn Văn A', jobCode: 'R_P_TCD_DV_CV', orgCode: 'P_TCD_DV', isLeader: false }, // Chuyên viên thêm
    { email: 'tranhaitrieu@daklak.gov.vn', username: 'tranhaitrieu', fullName: 'Trần Hải Triều', jobCode: 'R_P_TCCB_TP', orgCode: 'P_TCCB', isLeader: true },
    { email: 'phanhuuan@daklak.gov.vn', username: 'phanhuuan', fullName: 'Phan Hữu Ân', jobCode: 'R_P_TCCB_CV', orgCode: 'P_TCCB', isLeader: false },
    { email: 'nguyenthanhthuy@daklak.gov.vn', username: 'nguyenthanhthuy', fullName: 'Nguyễn Thanh Thủy', jobCode: 'R_P_BVCTNB_TP', orgCode: 'P_BVCTNB', isLeader: true },
    { email: 'tranvanb@daklak.gov.vn', username: 'tranvanb', fullName: 'Trần Văn B', jobCode: 'R_P_BVCTNB_CV', orgCode: 'P_BVCTNB', isLeader: false }, // Chuyên viên thêm
    { email: 'nguyenthihongthuy@daklak.gov.vn', username: 'nguyenthihongthuy', fullName: 'Nguyễn Thị Hồng Thúy', jobCode: 'R_VP_CVP', orgCode: 'VAN_PHONG', isLeader: true },
    { email: 'nguyenhieuthong@daklak.gov.vn', username: 'nguyenhieuthong', fullName: 'Nguyễn Hiếu Thông', jobCode: 'R_VP_NV', orgCode: 'VAN_PHONG', isLeader: false },
    // Tài khoản Quản trị
    { email: 'admin_btc@daklak.gov.vn', username: 'admin_btc', fullName: 'Quản trị viên Hệ thống', jobCode: 'R_VP_NV', orgCode: 'VAN_PHONG', isLeader: false },
  ];

  const bcrypt = require('bcrypt');
  const DEFAULT_PASSWORD = 'Admin@123';
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  for (const u of usersToSeed) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { fullName: u.fullName },
      create: {
        email: u.email,
        username: u.username,
        fullName: u.fullName,
      }
    });

    await prisma.credential.upsert({
      where: { userId: user.id },
      update: { passwordHash },
      create: { userId: user.id, passwordHash },
    });

    // Check if JobPosition already exists
    const existingPosition = await prisma.jobPosition.findFirst({
      where: {
        userId: user.id,
        unitId: orgUnits[u.orgCode].id,
        jobTitleId: jobs[u.jobCode].id
      }
    });

    if (!existingPosition) {
      await prisma.jobPosition.create({
        data: {
          userId: user.id,
          unitId: orgUnits[u.orgCode].id,
          jobTitleId: jobs[u.jobCode].id,
          isPrimary: true,
          isUnitLeader: u.isLeader,
        }
      });
    }
  }

  console.log('✅ Hoàn thành cập nhật dữ liệu Ban Tổ chức Tỉnh ủy Đắk Lắk.');
}

main()
  .catch(e => {
    console.error('Lỗi khi seed data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
