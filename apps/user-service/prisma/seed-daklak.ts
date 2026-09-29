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

  // 0. Tạo các Lĩnh vực phụ trách (Domain) chuyên biệt cho khối Đảng
  const partyDomains = [
    { code: 'CONG_TAC_TO_CHUC', name: 'Công tác Tổ chức, Cán bộ và Đảng viên' },
    { code: 'CONG_TAC_KIEM_TRA', name: 'Công tác Kiểm tra, Giám sát và Kỷ luật Đảng' },
    { code: 'CONG_TAC_TUYEN_GIAO', name: 'Công tác Tuyên giáo, Tư tưởng' },
    { code: 'CONG_TAC_DAN_VAN', name: 'Công tác Dân vận' },
    { code: 'CONG_TAC_NOI_CHINH', name: 'Công tác Nội chính, Cải cách tư pháp và Phòng chống tham nhũng, tiêu cực' },
    { code: 'CONG_TAC_VAN_PHONG', name: 'Công tác Văn phòng, Tham mưu tổng hợp cấp ủy' }
  ];

  for (const d of partyDomains) {
    const cat = await prisma.category.upsert({
      where: { groupCode_code: { groupCode: 'DOMAIN', code: d.code } },
      update: {},
      create: { groupCode: 'DOMAIN', code: d.code, order: 100 },
    });
    await prisma.categoryTranslation.upsert({
      where: { categoryId_langCode: { categoryId: cat.id, langCode: 'vi' } },
      update: { name: d.name },
      create: { categoryId: cat.id, langCode: 'vi', name: d.name },
    });
  }

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

  // 2.1. Phân công lĩnh vực phụ trách Đảng cho các đơn vị
  const allPartyDomains = await prisma.category.findMany({
    where: { groupCode: 'DOMAIN', code: { in: partyDomains.map(d => d.code) } }
  });

  const tinhUyDomains = allPartyDomains;
  const btcDomains = allPartyDomains.filter(d => ['CONG_TAC_TO_CHUC'].includes(d.code));

  await prisma.unitDomain.deleteMany({ where: { unitId: { in: [tinhUy.id, btcTu.id] } } });
  
  await prisma.unitDomain.createMany({
    data: [
      ...tinhUyDomains.map(d => ({ unitId: tinhUy.id, domainId: d.id })),
      ...btcDomains.map(d => ({ unitId: btcTu.id, domainId: d.id }))
    ],
    skipDuplicates: true
  });

  // 3. Chức danh (JobTitle)
  const jobTitles: any[] = [
    { code: 'R_BTCTU_TB', name: 'Trưởng ban Tổ chức Tỉnh ủy', typeCode: 'BAN_DANG', type: 'PARTY' },
    { code: 'R_BTCTU_PTB1', name: 'Phó Trưởng ban Thường trực (Phó Ban 1)', typeCode: 'BAN_DANG', type: 'PARTY' },
    { code: 'R_BTCTU_PTB2', name: 'Phó Trưởng ban (Phó Ban 2)', typeCode: 'BAN_DANG', type: 'PARTY' },
    { code: 'R_BTCTU_PTB3', name: 'Phó Trưởng ban (Phó Ban 3)', typeCode: 'BAN_DANG', type: 'PARTY' },
    { code: 'R_BTCTU_PTB4', name: 'Phó Trưởng ban (Phó Ban 4)', typeCode: 'BAN_DANG', type: 'PARTY' },
    { code: 'R_P_TCD_DV_TP', name: 'Trưởng phòng Tổ chức đảng, đảng viên', typeCode: 'PHONG_BAN_DANG', type: 'PARTY' },
    { code: 'R_P_TCD_DV_PTP1', name: 'Phó Trưởng phòng 1 (TCCSĐ)', typeCode: 'PHONG_BAN_DANG', type: 'PARTY' },
    { code: 'R_P_TCD_DV_PTP2', name: 'Phó Trưởng phòng 2 (Nghiệp vụ Đảng viên)', typeCode: 'PHONG_BAN_DANG', type: 'PARTY' },
    { code: 'R_P_TCD_DV_CV', name: 'Chuyên viên CSDL & Chuyển đổi số Đảng viên', typeCode: 'PHONG_BAN_DANG', type: 'PARTY' },
    { code: 'R_P_TCCB_TP', name: 'Trưởng phòng Tổ chức cán bộ', typeCode: 'PHONG_BAN_DANG', type: 'PARTY' },
    { code: 'R_P_TCCB_PTP1', name: 'Phó Trưởng phòng 1 (Quy hoạch, Bổ nhiệm)', typeCode: 'PHONG_BAN_DANG', type: 'PARTY' },
    { code: 'R_P_TCCB_PTP2', name: 'Phó Trưởng phòng 2 (Biên chế, Đào tạo)', typeCode: 'PHONG_BAN_DANG', type: 'PARTY' },
    { code: 'R_P_TCCB_CV', name: 'Chuyên viên Quản lý Cán bộ & CSDL Mẫu 2C', typeCode: 'PHONG_BAN_DANG', type: 'PARTY' },
    { code: 'R_P_BVCTNB_TP', name: 'Trưởng phòng Bảo vệ chính trị nội bộ', typeCode: 'PHONG_BAN_DANG', type: 'PARTY' },
    { code: 'R_P_BVCTNB_PTP1', name: 'Phó Trưởng phòng 1 (Thẩm tra, Xác minh)', typeCode: 'PHONG_BAN_DANG', type: 'PARTY' },
    { code: 'R_P_BVCTNB_PTP2', name: 'Phó Trưởng phòng 2 (Yếu tố nước ngoài & Đơn thư)', typeCode: 'PHONG_BAN_DANG', type: 'PARTY' },
    { code: 'R_P_BVCTNB_CV', name: 'Chuyên viên / Cán bộ Biệt phái BVCTNB', typeCode: 'PHONG_BAN_DANG', type: 'PARTY' },
    { code: 'R_VP_CVP', name: 'Chánh Văn phòng Ban', typeCode: 'VAN_PHONG_DANG_UY', type: 'PARTY' },
    { code: 'R_VP_PCVP1', name: 'Phó Chánh Văn phòng 1 (Sức khỏe Cán bộ & Tang lễ)', typeCode: 'VAN_PHONG_DANG_UY', type: 'PARTY' },
    { code: 'R_VP_PCVP2', name: 'Phó Chánh Văn phòng 2 (Tài chính, Văn thư Mật & CNTT)', typeCode: 'VAN_PHONG_DANG_UY', type: 'PARTY' },
    { code: 'R_VP_CV_IT', name: 'Chuyên viên Quản trị Hạ tầng CNTT & ATTT', typeCode: 'VAN_PHONG_DANG_UY', type: 'PARTY' },
    { code: 'R_VP_NV', name: 'Nhân viên Văn thư - Lưu trữ - Kế toán', typeCode: 'VAN_PHONG_DANG_UY', type: 'PARTY' },
  ];

  const jobs: Record<string, any> = {};
  for (const jt of jobTitles) {
    const job = await prisma.jobTitle.upsert({
      where: { code: jt.code },
      update: { name: jt.name, type: jt.type },
      create: { code: jt.code, name: jt.name, type: jt.type },
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
    { email: 'truongban@daklak.gov.vn', username: 'truongban', fullName: 'Trưởng Ban', jobCode: 'R_BTCTU_TB', orgCode: 'BTCTU_DAKLAK', isLeader: true },
    { email: 'phoban1@daklak.gov.vn', username: 'phoban1', fullName: 'Phó Ban 1', jobCode: 'R_BTCTU_PTB1', orgCode: 'BTCTU_DAKLAK', isLeader: false },
    { email: 'phoban2@daklak.gov.vn', username: 'phoban2', fullName: 'Phó Ban 2', jobCode: 'R_BTCTU_PTB2', orgCode: 'BTCTU_DAKLAK', isLeader: false },
    { email: 'phoban3@daklak.gov.vn', username: 'phoban3', fullName: 'Phó Ban 3', jobCode: 'R_BTCTU_PTB3', orgCode: 'BTCTU_DAKLAK', isLeader: false },
    { email: 'phoban4@daklak.gov.vn', username: 'phoban4', fullName: 'Phó Ban 4', jobCode: 'R_BTCTU_PTB4', orgCode: 'BTCTU_DAKLAK', isLeader: false },
    
    // Phòng TCD-DV
    { email: 'tcd_tp@daklak.gov.vn', username: 'tcd_tp', fullName: 'Trưởng phòng TCD-DV', jobCode: 'R_P_TCD_DV_TP', orgCode: 'P_TCD_DV', isLeader: true },
    { email: 'tcd_ptp1@daklak.gov.vn', username: 'tcd_ptp1', fullName: 'Phó Trưởng phòng TCD-DV 1', jobCode: 'R_P_TCD_DV_PTP1', orgCode: 'P_TCD_DV', isLeader: false },
    { email: 'tcd_ptp2@daklak.gov.vn', username: 'tcd_ptp2', fullName: 'Phó Trưởng phòng TCD-DV 2', jobCode: 'R_P_TCD_DV_PTP2', orgCode: 'P_TCD_DV', isLeader: false },
    { email: 'tcd_cv@daklak.gov.vn', username: 'tcd_cv', fullName: 'Chuyên viên TCD-DV', jobCode: 'R_P_TCD_DV_CV', orgCode: 'P_TCD_DV', isLeader: false },
    
    // Phòng TCCB
    { email: 'tccb_tp@daklak.gov.vn', username: 'tccb_tp', fullName: 'Trưởng phòng TCCB', jobCode: 'R_P_TCCB_TP', orgCode: 'P_TCCB', isLeader: true },
    { email: 'tccb_ptp1@daklak.gov.vn', username: 'tccb_ptp1', fullName: 'Phó Trưởng phòng TCCB 1', jobCode: 'R_P_TCCB_PTP1', orgCode: 'P_TCCB', isLeader: false },
    { email: 'tccb_ptp2@daklak.gov.vn', username: 'tccb_ptp2', fullName: 'Phó Trưởng phòng TCCB 2', jobCode: 'R_P_TCCB_PTP2', orgCode: 'P_TCCB', isLeader: false },
    { email: 'tccb_cv@daklak.gov.vn', username: 'tccb_cv', fullName: 'Chuyên viên TCCB', jobCode: 'R_P_TCCB_CV', orgCode: 'P_TCCB', isLeader: false },
    
    // Phòng BVCTNB
    { email: 'bvctnb_tp@daklak.gov.vn', username: 'bvctnb_tp', fullName: 'Trưởng phòng BVCTNB', jobCode: 'R_P_BVCTNB_TP', orgCode: 'P_BVCTNB', isLeader: true },
    { email: 'bvctnb_ptp1@daklak.gov.vn', username: 'bvctnb_ptp1', fullName: 'Phó Trưởng phòng BVCTNB 1', jobCode: 'R_P_BVCTNB_PTP1', orgCode: 'P_BVCTNB', isLeader: false },
    { email: 'bvctnb_ptp2@daklak.gov.vn', username: 'bvctnb_ptp2', fullName: 'Phó Trưởng phòng BVCTNB 2', jobCode: 'R_P_BVCTNB_PTP2', orgCode: 'P_BVCTNB', isLeader: false },
    { email: 'bvctnb_cv@daklak.gov.vn', username: 'bvctnb_cv', fullName: 'Chuyên viên BVCTNB', jobCode: 'R_P_BVCTNB_CV', orgCode: 'P_BVCTNB', isLeader: false },
    
    // Khối Văn phòng Ban
    { email: 'vp_cvp@daklak.gov.vn', username: 'vp_cvp', fullName: 'Chánh Văn phòng Ban', jobCode: 'R_VP_CVP', orgCode: 'VAN_PHONG', isLeader: true },
    { email: 'vp_pcvp1@daklak.gov.vn', username: 'vp_pcvp1', fullName: 'Phó Chánh Văn phòng 1', jobCode: 'R_VP_PCVP1', orgCode: 'VAN_PHONG', isLeader: false },
    { email: 'vp_pcvp2@daklak.gov.vn', username: 'vp_pcvp2', fullName: 'Phó Chánh Văn phòng 2', jobCode: 'R_VP_PCVP2', orgCode: 'VAN_PHONG', isLeader: false },
    { email: 'vp_it@daklak.gov.vn', username: 'vp_it', fullName: 'Chuyên viên CNTT', jobCode: 'R_VP_CV_IT', orgCode: 'VAN_PHONG', isLeader: false },
    { email: 'vp_nv@daklak.gov.vn', username: 'vp_nv', fullName: 'Nhân viên Văn thư - Kế toán', jobCode: 'R_VP_NV', orgCode: 'VAN_PHONG', isLeader: false },
    
    // Quản trị viên
    { email: 'admin_btc@daklak.gov.vn', username: 'admin_btc', fullName: 'Quản trị viên Hệ thống', jobCode: 'R_VP_CV_IT', orgCode: 'VAN_PHONG', isLeader: false },
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
