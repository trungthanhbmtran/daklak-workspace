import { PrismaClient } from '../src/generated/prisma';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';

dotenv.config();

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) throw new Error('DATABASE_URL is not set');
const mariadbUrl = dbUrl.replace(/^mysql:\/\//, 'mariadb://');
const adapter = new PrismaMariaDb(mariadbUrl);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🚀 Bắt đầu cập nhật cơ sở dữ liệu Vị trí việc làm & Phân quyền PBAC cho Ban Tổ chức Tỉnh ủy Đắk Lắk...');

  // -------------------------------------------------------------
  // 0. Tạo / Đảm bảo các Lĩnh vực phụ trách (Domain) chuyên biệt cho khối Đảng
  // -------------------------------------------------------------
  const partyDomains = [
    { code: 'CONG_TAC_TO_CHUC', name: 'Công tác Tổ chức, Cán bộ và Đảng viên' },
    { code: 'CONG_TAC_KIEM_TRA', name: 'Công tác Kiểm tra, Giám sát và Kỷ luật Đảng' },
    { code: 'CONG_TAC_TUYEN_GIAO', name: 'Công tác Tuyên giáo, Tư tưởng' },
    { code: 'CONG_TAC_DAN_VAN', name: 'Công tác Dân vận' },
    { code: 'CONG_TAC_NOI_CHINH', name: 'Công tác Nội chính, Cải cách tư pháp và Phòng chống tham nhũng, tiêu cực' },
    { code: 'CONG_TAC_VAN_PHONG', name: 'Công tác Văn phòng, Tham mưu tổng hợp cấp ủy' }
  ];

  const domainMap: Record<string, number> = {};
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
    domainMap[d.code] = cat.id;
  }

  // -------------------------------------------------------------
  // 1. Đảm bảo Loại hình cơ quan / đơn vị (UnitType)
  // -------------------------------------------------------------
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

  // -------------------------------------------------------------
  // 2. Cơ cấu Tổ chức: Tỉnh ủy Đắk Lắk & Ban Tổ chức Tỉnh ủy (05 Tập thể)
  // -------------------------------------------------------------
  const tinhUy = await prisma.organizationUnit.upsert({
    where: { code: 'TU_DAKLAK' },
    update: { name: 'Tỉnh ủy Đắk Lắk', typeId: typeCoQuanDang.id },
    create: {
      code: 'TU_DAKLAK',
      name: 'Tỉnh ủy Đắk Lắk',
      typeId: typeCoQuanDang.id,
    },
  });

  const btcTu = await prisma.organizationUnit.upsert({
    where: { code: 'BTCTU_DAKLAK' },
    update: {
      name: 'Ban Tổ chức Tỉnh ủy Đắk Lắk',
      parentId: tinhUy.id,
      typeId: typeBanDang.id,
      hierarchyPath: `${tinhUy.id}/BTCTU_DAKLAK`
    },
    create: {
      code: 'BTCTU_DAKLAK',
      name: 'Ban Tổ chức Tỉnh ủy Đắk Lắk',
      typeId: typeBanDang.id,
      parentId: tinhUy.id,
      hierarchyPath: `${tinhUy.id}/BTCTU_DAKLAK`
    },
  });

  // 04 Phòng chuyên môn trực thuộc Ban Tổ chức Tỉnh ủy
  const divisions = [
    { code: 'P_TCD_DV', name: 'Phòng Tổ chức đảng, đảng viên', typeId: typePhongBanDang.id },
    { code: 'P_TCCB', name: 'Phòng Tổ chức cán bộ', typeId: typePhongBanDang.id },
    { code: 'P_BVCTNB', name: 'Phòng Bảo vệ chính trị nội bộ', typeId: typePhongBanDang.id },
    { code: 'VAN_PHONG', name: 'Văn phòng Ban', typeId: typeVanPhongDang.id },
  ];

  const orgUnits: Record<string, any> = {
    'BTCTU_DAKLAK': btcTu
  };

  for (const div of divisions) {
    const org = await prisma.organizationUnit.upsert({
      where: { code: div.code },
      update: {
        name: div.name,
        parentId: btcTu.id,
        typeId: div.typeId,
        hierarchyPath: `${btcTu.id}/${div.code}`
      },
      create: {
        code: div.code,
        name: div.name,
        typeId: div.typeId,
        parentId: btcTu.id,
        hierarchyPath: `${btcTu.id}/${div.code}`
      },
    });
    orgUnits[div.code] = org;
  }

  // Phân bổ Lĩnh vực phụ trách cấp Đơn vị (UnitDomain)
  const allPartyDomains = await prisma.category.findMany({
    where: { groupCode: 'DOMAIN', code: { in: partyDomains.map(d => d.code) } }
  });

  await prisma.unitDomain.deleteMany({
    where: { unitId: { in: [tinhUy.id, btcTu.id, ...Object.values(orgUnits).map(u => u.id)] } }
  });

  const btcDomainEntries = [
    ...allPartyDomains.map(d => ({ unitId: tinhUy.id, domainId: d.id })),
    { unitId: btcTu.id, domainId: domainMap['CONG_TAC_TO_CHUC'] },
    { unitId: orgUnits['P_TCD_DV'].id, domainId: domainMap['CONG_TAC_TO_CHUC'] },
    { unitId: orgUnits['P_TCCB'].id, domainId: domainMap['CONG_TAC_TO_CHUC'] },
    { unitId: orgUnits['P_BVCTNB'].id, domainId: domainMap['CONG_TAC_TO_CHUC'] },
    { unitId: orgUnits['VAN_PHONG'].id, domainId: domainMap['CONG_TAC_VAN_PHONG'] },
  ];

  await prisma.unitDomain.createMany({
    data: btcDomainEntries,
    skipDuplicates: true
  });

  // -------------------------------------------------------------
  // 3. Danh mục 22 Vị trí việc làm cá nhân (JobTitle) chuẩn theo Đề án BTCTU
  // -------------------------------------------------------------
  const vtvlDefinitions = [
    // --- Khối Lãnh đạo Ban (05 VTVL) ---
    {
      code: 'R_BTCTU_TB',
      name: 'Trưởng ban Tổ chức Tỉnh ủy (Ủy viên BTV Tỉnh ủy)',
      cdeCode: 'CDE-BTCTU-001',
      vtvlCode: 'VTVL-01',
      unitCode: 'BTCTU_DAKLAK',
      typeCode: 'BAN_DANG',
      rank: 1,
      authorityLevel: 'BAN_THUONG_VU',
      reportsToCode: null,
      description: 'Lãnh đạo, điều hành toàn diện công tác Tổ chức xây dựng Đảng toàn tỉnh. Sản phẩm chuẩn: Nghị quyết/Đề án Tỉnh ủy, Kết luận chính trị nhân sự, Quyết định xếp loại.',
      slotCount: 1,
      domainCodes: ['CONG_TAC_TO_CHUC'],
    },
    {
      code: 'R_BTCTU_PTB1',
      name: 'Phó Trưởng ban Thường trực (Phó Ban 1)',
      cdeCode: 'CDE-BTCTU-002',
      vtvlCode: 'VTVL-02a',
      unitCode: 'BTCTU_DAKLAK',
      typeCode: 'BAN_DANG',
      rank: 2,
      authorityLevel: 'THUONG_TRUC_BAN',
      reportsToCode: 'R_BTCTU_TB',
      description: 'Phụ trách Tổ chức cán bộ, Quản lý biên chế, VTVL và Nội bộ Ban. Sản phẩm chuẩn: Báo cáo thẩm định nhân sự, Đề án VTVL, Quyết toán tài chính quý.',
      slotCount: 1,
      domainCodes: ['CONG_TAC_TO_CHUC'],
    },
    {
      code: 'R_BTCTU_PTB2',
      name: 'Phó Trưởng ban (Phó Ban 2)',
      cdeCode: 'CDE-BTCTU-003',
      vtvlCode: 'VTVL-02b',
      unitCode: 'BTCTU_DAKLAK',
      typeCode: 'BAN_DANG',
      rank: 2,
      authorityLevel: 'THUONG_TRUC_BAN',
      reportsToCode: 'R_BTCTU_TB',
      description: 'Phụ trách Tổ chức cơ sở đảng, Đảng viên và Chuyển đổi số Đảng viên. Sản phẩm chuẩn: Hướng dẫn TCCSĐ, Báo cáo phát triển ĐV, CSDL sạch LGSP, Sổ tay ĐV.',
      slotCount: 1,
      domainCodes: ['CONG_TAC_TO_CHUC'],
    },
    {
      code: 'R_BTCTU_PTB3',
      name: 'Phó Trưởng ban (Phó Ban 3)',
      cdeCode: 'CDE-BTCTU-004',
      vtvlCode: 'VTVL-02c',
      unitCode: 'BTCTU_DAKLAK',
      typeCode: 'BAN_DANG',
      rank: 2,
      authorityLevel: 'THUONG_TRUC_BAN',
      reportsToCode: 'R_BTCTU_TB',
      description: 'Phụ trách Bảo vệ chính trị nội bộ và Đơn thư khiếu nại tố cáo. Sản phẩm chuẩn: Kết luận Tiêu chuẩn chính trị, Báo cáo xử lý đơn thư, CSDL Mức 3.',
      slotCount: 1,
      domainCodes: ['CONG_TAC_TO_CHUC'],
    },
    {
      code: 'R_BTCTU_PTB4',
      name: 'Phó Trưởng ban (Phó Ban 4)',
      cdeCode: 'CDE-BTCTU-005',
      vtvlCode: 'VTVL-02d',
      unitCode: 'BTCTU_DAKLAK',
      typeCode: 'BAN_DANG',
      rank: 2,
      authorityLevel: 'THUONG_TRUC_BAN',
      reportsToCode: 'R_BTCTU_TB',
      description: 'Phụ trách Đào tạo, Chính sách cán bộ, Sức khỏe CB và Hạ tầng CNTT. Sản phẩm chuẩn: Kế hoạch Đào tạo, Quyết định nâng lương, Uptime hạ tầng >= 99.0%.',
      slotCount: 1,
      domainCodes: ['CONG_TAC_TO_CHUC'],
    },

    // --- Phòng Tổ chức đảng, đảng viên (04 VTVL) ---
    {
      code: 'R_P_TCD_DV_TP',
      name: 'Trưởng phòng Tổ chức đảng, đảng viên',
      cdeCode: 'CDE-BTCTU-006',
      vtvlCode: 'VTVL-03',
      unitCode: 'P_TCD_DV',
      typeCode: 'PHONG_BAN_DANG',
      rank: 3,
      authorityLevel: 'LANH_DAO_PHONG',
      reportsToCode: 'R_BTCTU_PTB2',
      description: 'Điều hành toàn diện Phòng TCCSĐ & ĐV; tham mưu văn bản TCCSĐ. Sản phẩm chuẩn: Văn bản hướng dẫn TCCSĐ, Báo cáo xếp loại TCCSĐ hằng quý.',
      slotCount: 1,
      domainCodes: ['CONG_TAC_TO_CHUC'],
    },
    {
      code: 'R_P_TCD_DV_PTP1',
      name: 'Phó Trưởng phòng 1 (TCCSĐ & Đánh giá TCCSĐ)',
      cdeCode: 'CDE-BTCTU-007',
      vtvlCode: 'VTVL-04a',
      unitCode: 'P_TCD_DV',
      typeCode: 'PHONG_BAN_DANG',
      rank: 4,
      authorityLevel: 'LANH_DAO_PHONG',
      reportsToCode: 'R_P_TCD_DV_TP',
      description: 'Theo dõi sinh hoạt chi bộ, rà soát quy chế cấp ủy, Chi bộ 4 tốt. Sản phẩm chuẩn: Báo cáo kiểm điểm TCCSĐ, Biên bản rà soát quy chế cấp ủy cơ sở.',
      slotCount: 1,
      domainCodes: ['CONG_TAC_TO_CHUC'],
    },
    {
      code: 'R_P_TCD_DV_PTP2',
      name: 'Phó Trưởng phòng 2 (Nghiệp vụ Đảng viên & CSDL, Sổ tay Đảng viên)',
      cdeCode: 'CDE-BTCTU-008',
      vtvlCode: 'VTVL-04b',
      unitCode: 'P_TCD_DV',
      typeCode: 'PHONG_BAN_DANG',
      rank: 4,
      authorityLevel: 'LANH_DAO_PHONG',
      reportsToCode: 'R_P_TCD_DV_TP',
      description: 'Thẩm định hồ sơ Huy hiệu Đảng, làm sạch CSDL đảng viên, Sổ tay ĐV. Sản phẩm chuẩn: Báo cáo thẩm định Huy hiệu Đảng, CSDL sạch LGSP >= 98%, Sổ tay ĐV.',
      slotCount: 1,
      domainCodes: ['CONG_TAC_TO_CHUC'],
    },
    {
      code: 'R_P_TCD_DV_CV',
      name: 'Chuyên viên CSDL & Chuyển đổi số Đảng viên',
      cdeCode: 'CDE-BTCTU-009',
      vtvlCode: 'VTVL-05',
      unitCode: 'P_TCD_DV',
      typeCode: 'PHONG_BAN_DANG',
      rank: 5,
      authorityLevel: 'CHUYEN_VIEN',
      reportsToCode: 'R_P_TCD_DV_TP',
      description: 'Nhập, chuẩn hóa CSDL đảng viên, check LGSP, hỗ trợ Sổ tay ĐV. Sản phẩm chuẩn: Bản ghi CSDL đảng viên chuẩn hóa, Nhật ký check LGSP, Báo cáo lỗi.',
      slotCount: 1,
      domainCodes: ['CONG_TAC_TO_CHUC'],
    },

    // --- Phòng Tổ chức cán bộ (04 VTVL) ---
    {
      code: 'R_P_TCCB_TP',
      name: 'Trưởng phòng Tổ chức cán bộ',
      cdeCode: 'CDE-BTCTU-010',
      vtvlCode: 'VTVL-06',
      unitCode: 'P_TCCB',
      typeCode: 'PHONG_BAN_DANG',
      rank: 3,
      authorityLevel: 'LANH_DAO_PHONG',
      reportsToCode: 'R_BTCTU_PTB1',
      description: 'Điều hành toàn diện Phòng TCCB; thẩm định bổ nhiệm, quản lý biên chế. Sản phẩm chuẩn: Báo cáo thẩm định quy trình 5 bước, Báo cáo biên chế & VTVL khối Đảng.',
      slotCount: 1,
      domainCodes: ['CONG_TAC_TO_CHUC'],
    },
    {
      code: 'R_P_TCCB_PTP1',
      name: 'Phó Trưởng phòng 1 (Quy hoạch, Bổ nhiệm, Luân chuyển)',
      cdeCode: 'CDE-BTCTU-011',
      vtvlCode: 'VTVL-07a',
      unitCode: 'P_TCCB',
      typeCode: 'PHONG_BAN_DANG',
      rank: 4,
      authorityLevel: 'LANH_DAO_PHONG',
      reportsToCode: 'R_P_TCCB_TP',
      description: 'Thẩm định quy hoạch, bổ nhiệm, luân chuyển cán bộ diện BTVTU. Sản phẩm chuẩn: Tờ trình bổ nhiệm cán bộ, Sơ yếu lý lịch Mẫu 2C số hóa trình BTVTU.',
      slotCount: 1,
      domainCodes: ['CONG_TAC_TO_CHUC'],
    },
    {
      code: 'R_P_TCCB_PTP2',
      name: 'Phó Trưởng phòng 2 (Biên chế, VTVL, Đào tạo, Tiền lương)',
      cdeCode: 'CDE-BTCTU-012',
      vtvlCode: 'VTVL-07b',
      unitCode: 'P_TCCB',
      typeCode: 'PHONG_BAN_DANG',
      rank: 4,
      authorityLevel: 'LANH_DAO_PHONG',
      reportsToCode: 'R_P_TCCB_TP',
      description: 'Thẩm định chỉ tiêu biên chế, cử đào tạo/bồi dưỡng, chế độ tiền lương. Sản phẩm chuẩn: Báo cáo quản lý biên chế, Danh sách cử đào tạo, Quyết định nâng lương.',
      slotCount: 1,
      domainCodes: ['CONG_TAC_TO_CHUC'],
    },
    {
      code: 'R_P_TCCB_CV',
      name: 'Chuyên viên Quản lý Cán bộ & CSDL Cán bộ Mẫu 2C',
      cdeCode: 'CDE-BTCTU-013',
      vtvlCode: 'VTVL-08',
      unitCode: 'P_TCCB',
      typeCode: 'PHONG_BAN_DANG',
      rank: 5,
      authorityLevel: 'CHUYEN_VIEN',
      reportsToCode: 'R_P_TCCB_TP',
      description: 'Số hóa hồ sơ Mẫu 2C, tra cứu thông tin cán bộ, đồng bộ CSDL Quốc gia. Sản phẩm chuẩn: Hồ sơ Mẫu 2C số hóa hoàn chỉnh, File CSDL đồng bộ Bộ Nội vụ.',
      slotCount: 1,
      domainCodes: ['CONG_TAC_TO_CHUC'],
    },

    // --- Phòng Bảo vệ chính trị nội bộ (04 VTVL) ---
    {
      code: 'R_P_BVCTNB_TP',
      name: 'Trưởng phòng Bảo vệ chính trị nội bộ',
      cdeCode: 'CDE-BTCTU-014',
      vtvlCode: 'VTVL-09',
      unitCode: 'P_BVCTNB',
      typeCode: 'PHONG_BAN_DANG',
      rank: 3,
      authorityLevel: 'LANH_DAO_PHONG',
      reportsToCode: 'R_BTCTU_PTB3',
      description: 'Điều hành toàn diện Phòng BVCTNB; chỉ đạo thẩm tra, xử lý đơn thư. Sản phẩm chuẩn: Kết luận Tiêu chuẩn chính trị nhân sự, Báo cáo xử lý đơn thư tố cáo.',
      slotCount: 1,
      domainCodes: ['CONG_TAC_TO_CHUC'],
    },
    {
      code: 'R_P_BVCTNB_PTP1',
      name: 'Phó Trưởng phòng 1 (Thẩm tra, Xác minh chính trị)',
      cdeCode: 'CDE-BTCTU-015',
      vtvlCode: 'VTVL-10a',
      unitCode: 'P_BVCTNB',
      typeCode: 'PHONG_BAN_DANG',
      rank: 4,
      authorityLevel: 'LANH_DAO_PHONG',
      reportsToCode: 'R_P_BVCTNB_TP',
      description: 'Trực tiếp thẩm tra, xác minh hồ sơ nhân sự có vấn đề chính trị. Sản phẩm chuẩn: Báo cáo kết quả thẩm tra xác minh thực địa, Hồ sơ nhân sự BVCTNB.',
      slotCount: 1,
      domainCodes: ['CONG_TAC_TO_CHUC'],
    },
    {
      code: 'R_P_BVCTNB_PTP2',
      name: 'Phó Trưởng phòng 2 (Yếu tố nước ngoài & Đơn thư)',
      cdeCode: 'CDE-BTCTU-016',
      vtvlCode: 'VTVL-10b',
      unitCode: 'P_BVCTNB',
      typeCode: 'PHONG_BAN_DANG',
      rank: 4,
      authorityLevel: 'LANH_DAO_PHONG',
      reportsToCode: 'R_P_BVCTNB_TP',
      description: 'Thẩm định hồ sơ cán bộ đi nước ngoài, phân loại xử lý đơn thư tố cáo. Sản phẩm chuẩn: Văn bản cho ý kiến đi nước ngoài, Bảng phân loại đơn thư tố cáo quý.',
      slotCount: 1,
      domainCodes: ['CONG_TAC_TO_CHUC'],
    },
    {
      code: 'R_P_BVCTNB_CV',
      name: 'Chuyên viên / Cán bộ Biệt phái BVCTNB',
      cdeCode: 'CDE-BTCTU-017',
      vtvlCode: 'VTVL-11',
      unitCode: 'P_BVCTNB',
      typeCode: 'PHONG_BAN_DANG',
      rank: 5,
      authorityLevel: 'CHUYEN_VIEN',
      reportsToCode: 'R_P_BVCTNB_TP',
      description: 'Xác minh thực địa, cập nhật CSDL BVCTNB mã hóa Mức 3. Sản phẩm chuẩn: Biên bản xác minh thực địa, CSDL BVCTNB mã hóa phần mềm Ban Cơ yếu.',
      slotCount: 1,
      domainCodes: ['CONG_TAC_TO_CHUC'],
    },

    // --- Khối Văn phòng Ban (05 VTVL - 06 biên chế) ---
    {
      code: 'R_VP_CVP',
      name: 'Chánh Văn phòng Ban',
      cdeCode: 'CDE-BTCTU-018',
      vtvlCode: 'VTVL-12',
      unitCode: 'VAN_PHONG',
      typeCode: 'VAN_PHONG_DANG_UY',
      rank: 3,
      authorityLevel: 'LANH_DAO_PHONG',
      reportsToCode: 'R_BTCTU_TB',
      description: 'Điều hành toàn diện Văn phòng Ban; quản lý lịch công tác, tài chính. Sản phẩm chuẩn: Lịch công tác tuần/tháng/quý, Báo cáo quyết toán ngân sách cơ quan.',
      slotCount: 1,
      domainCodes: ['CONG_TAC_VAN_PHONG'],
    },
    {
      code: 'R_VP_PCVP1',
      name: 'Phó Chánh Văn phòng 1 (Sức khỏe Cán bộ & Tang lễ)',
      cdeCode: 'CDE-BTCTU-019',
      vtvlCode: 'VTVL-13a',
      unitCode: 'VAN_PHONG',
      typeCode: 'VAN_PHONG_DANG_UY',
      rank: 4,
      authorityLevel: 'LANH_DAO_PHONG',
      reportsToCode: 'R_VP_CVP',
      description: 'Tổ chức khám sức khỏe định kỳ, thực hiện chế độ tang lễ, thăm hỏi. Sản phẩm chuẩn: Kế hoạch khám sức khỏe định kỳ, CSDL Sức khỏe CB, Hồ sơ tang lễ.',
      slotCount: 1,
      domainCodes: ['CONG_TAC_VAN_PHONG'],
    },
    {
      code: 'R_VP_PCVP2',
      name: 'Phó Chánh Văn phòng 2 (Tài chính, Văn thư Mật & CNTT)',
      cdeCode: 'CDE-BTCTU-020',
      vtvlCode: 'VTVL-13b',
      unitCode: 'VAN_PHONG',
      typeCode: 'VAN_PHONG_DANG_UY',
      rank: 4,
      authorityLevel: 'LANH_DAO_PHONG',
      reportsToCode: 'R_VP_CVP',
      description: 'Quản lý dự toán thu chi, kiểm tra văn thư Mật, chỉ đạo ATTT Cấp 3. Sản phẩm chuẩn: Chứng từ kế toán hợp lệ, Sổ quản lý văn bản Mật per NĐ 63/2026.',
      slotCount: 1,
      domainCodes: ['CONG_TAC_VAN_PHONG'],
    },
    {
      code: 'R_VP_CV_IT',
      name: 'Chuyên viên Quản trị Hạ tầng CNTT & An toàn Thông tin',
      cdeCode: 'CDE-BTCTU-021',
      vtvlCode: 'VTVL-14',
      unitCode: 'VAN_PHONG',
      typeCode: 'VAN_PHONG_DANG_UY',
      rank: 5,
      authorityLevel: 'CHUYEN_VIEN',
      reportsToCode: 'R_VP_CVP',
      description: 'Bảo trì máy chủ, hạ tầng mạng, sao lưu CSDL dự phòng, ATTT Cấp 3. Sản phẩm chuẩn: Nhật ký bảo trì máy chủ, File CSDL sao lưu hằng tuần, Hồ sơ ATTT Cấp 3.',
      slotCount: 2, // 02 biên chế per Đề án
      domainCodes: ['CONG_TAC_VAN_PHONG'],
    },
    {
      code: 'R_VP_NV',
      name: 'Nhân viên Văn thư - Lưu trữ - Kế toán',
      cdeCode: 'CDE-BTCTU-022',
      vtvlCode: 'VTVL-15',
      unitCode: 'VAN_PHONG',
      typeCode: 'VAN_PHONG_DANG_UY',
      rank: 5,
      authorityLevel: 'CHUYEN_VIEN',
      reportsToCode: 'R_VP_CVP',
      description: 'Tiếp nhận/phát hành văn bản, đóng dấu Mật, chi trả lương đúng ngày. Sản phẩm chuẩn: Số hóa 100% văn bản đi/đến, Sổ theo dõi văn bản Mật, Bảng lương quý.',
      slotCount: 1,
      domainCodes: ['CONG_TAC_VAN_PHONG'],
    },
  ];

  // Lưu JobTitle theo code
  const jobMap: Record<string, any> = {};

  // Vòng 1: Tạo/Cập nhật JobTitle cơ bản
  for (const vtvl of vtvlDefinitions) {
    const job = await prisma.jobTitle.upsert({
      where: { code: vtvl.code },
      update: {
        name: vtvl.name,
        description: `[${vtvl.vtvlCode} | ${vtvl.cdeCode}] ${vtvl.description}`,
        rank: vtvl.rank,
        authorityLevel: vtvl.authorityLevel,
        type: 'PARTY',
      },
      create: {
        code: vtvl.code,
        name: vtvl.name,
        description: `[${vtvl.vtvlCode} | ${vtvl.cdeCode}] ${vtvl.description}`,
        rank: vtvl.rank,
        authorityLevel: vtvl.authorityLevel,
        type: 'PARTY',
      },
    });
    jobMap[vtvl.code] = job;

    // Link template to UnitType
    let typeId: number | undefined;
    if (vtvl.typeCode === 'BAN_DANG') typeId = typeBanDang.id;
    else if (vtvl.typeCode === 'PHONG_BAN_DANG') typeId = typePhongBanDang.id;
    else if (vtvl.typeCode === 'VAN_PHONG_DANG_UY') typeId = typeVanPhongDang.id;
    else if (vtvl.typeCode === 'CQ_DANG') typeId = typeCoQuanDang.id;

    if (typeId) {
      await prisma.unitTypeJobTemplate.upsert({
        where: { unitTypeId_jobTitleId: { unitTypeId: typeId, jobTitleId: job.id } },
        update: {},
        create: { unitTypeId: typeId, jobTitleId: job.id },
      });
    }
  }

  // Vòng 2: Cập nhật tuyến báo cáo reportsToJobTitleId
  for (const vtvl of vtvlDefinitions) {
    if (vtvl.reportsToCode && jobMap[vtvl.reportsToCode]) {
      await prisma.jobTitle.update({
        where: { code: vtvl.code },
        data: { reportsToJobTitleId: jobMap[vtvl.reportsToCode].id }
      });
    }
  }

  // -------------------------------------------------------------
  // 4. Định biên biên chế (OrganizationStaffing) và Phân bổ Slots (StaffingSlot)
  // -------------------------------------------------------------
  for (const vtvl of vtvlDefinitions) {
    const unit = orgUnits[vtvl.unitCode];
    if (!unit) continue;
    const job = jobMap[vtvl.code];

    const staffing = await prisma.organizationStaffing.upsert({
      where: { unitId_jobTitleId: { unitId: unit.id, jobTitleId: job.id } },
      update: {
        quantity: vtvl.slotCount,
        description: `Định biên VTVL: ${vtvl.name} (${vtvl.slotCount} biên chế)`,
      },
      create: {
        unitId: unit.id,
        jobTitleId: job.id,
        quantity: vtvl.slotCount,
        description: `Định biên VTVL: ${vtvl.name} (${vtvl.slotCount} biên chế)`,
      },
    });

    // Tạo các slot biên chế
    for (let slotOrder = 1; slotOrder <= vtvl.slotCount; slotOrder++) {
      const slotDesc = vtvl.slotCount > 1
        ? `Vị trí ${vtvl.name} - Vị trí số ${slotOrder}`
        : `Vị trí ${vtvl.name}`;

      const slot = await prisma.staffingSlot.upsert({
        where: { staffingId_slotOrder: { staffingId: staffing.id, slotOrder } },
        update: { description: slotDesc },
        create: {
          staffingId: staffing.id,
          slotOrder,
          description: slotDesc,
        },
      });

      // Gắn domain cho slot
      if (vtvl.domainCodes && vtvl.domainCodes.length > 0) {
        for (const domCode of vtvl.domainCodes) {
          const domId = domainMap[domCode];
          if (domId) {
            await prisma.staffingSlotDomain.upsert({
              where: {
                slotId_domainId_organizationId: {
                  slotId: slot.id,
                  domainId: domId,
                  organizationId: 'DEFAULT',
                },
              },
              update: {},
              create: {
                slotId: slot.id,
                domainId: domId,
                organizationId: 'DEFAULT',
              },
            });
          }
        }
      }

      // Gắn monitored units cho lãnh đạo
      if (vtvl.rank <= 2) {
        // Lãnh đạo Ban theo dõi tất cả 4 phòng
        for (const div of divisions) {
          const childUnit = orgUnits[div.code];
          if (childUnit) {
            await prisma.staffingSlotMonitoredUnit.upsert({
              where: {
                slotId_unitId_organizationId: {
                  slotId: slot.id,
                  unitId: childUnit.id,
                  organizationId: 'DEFAULT',
                },
              },
              update: {},
              create: {
                slotId: slot.id,
                unitId: childUnit.id,
                organizationId: 'DEFAULT',
              },
            });
          }
        }
      }
    }
  }

  // -------------------------------------------------------------
  // 5. Cập nhật Danh sách 22 Cán bộ Công chức & Vị trí công tác (JobPosition)
  // -------------------------------------------------------------
  const usersToSeed = [
    // Lãnh đạo Ban
    { email: 'truongban@daklak.gov.vn', username: 'truongban', fullName: 'Đ/c Trưởng Ban Tổ chức Tỉnh ủy', employeeCode: 'BTCTU_001', jobCode: 'R_BTCTU_TB', orgCode: 'BTCTU_DAKLAK', isLeader: true, isDeputy: false, slotOrder: 1, roleGroup: 'BTCTU_LANH_DAO_BAN' },
    { email: 'phoban1@daklak.gov.vn', username: 'phoban1', fullName: 'Đ/c Phó Trưởng ban Thường trực (Phó Ban 1)', employeeCode: 'BTCTU_002', jobCode: 'R_BTCTU_PTB1', orgCode: 'BTCTU_DAKLAK', isLeader: false, isDeputy: true, slotOrder: 1, roleGroup: 'BTCTU_LANH_DAO_BAN' },
    { email: 'phoban2@daklak.gov.vn', username: 'phoban2', fullName: 'Đ/c Phó Trưởng ban (Phó Ban 2)', employeeCode: 'BTCTU_003', jobCode: 'R_BTCTU_PTB2', orgCode: 'BTCTU_DAKLAK', isLeader: false, isDeputy: true, slotOrder: 1, roleGroup: 'BTCTU_LANH_DAO_BAN' },
    { email: 'phoban3@daklak.gov.vn', username: 'phoban3', fullName: 'Đ/c Phó Trưởng ban (Phó Ban 3)', employeeCode: 'BTCTU_004', jobCode: 'R_BTCTU_PTB3', orgCode: 'BTCTU_DAKLAK', isLeader: false, isDeputy: true, slotOrder: 1, roleGroup: 'BTCTU_LANH_DAO_BAN' },
    { email: 'phoban4@daklak.gov.vn', username: 'phoban4', fullName: 'Đ/c Phó Trưởng ban (Phó Ban 4)', employeeCode: 'BTCTU_005', jobCode: 'R_BTCTU_PTB4', orgCode: 'BTCTU_DAKLAK', isLeader: false, isDeputy: true, slotOrder: 1, roleGroup: 'BTCTU_LANH_DAO_BAN' },

    // Phòng TCĐ-ĐV
    { email: 'tcd_tp@daklak.gov.vn', username: 'tcd_tp', fullName: 'Đ/c Trưởng phòng Tổ chức đảng, đảng viên', employeeCode: 'BTCTU_006', jobCode: 'R_P_TCD_DV_TP', orgCode: 'P_TCD_DV', isLeader: true, isDeputy: false, slotOrder: 1, roleGroup: 'BTCTU_LANH_DAO_PHONG' },
    { email: 'tcd_ptp1@daklak.gov.vn', username: 'tcd_ptp1', fullName: 'Đ/c Phó Trưởng phòng TCĐ-ĐV 1 (TCCSĐ)', employeeCode: 'BTCTU_007', jobCode: 'R_P_TCD_DV_PTP1', orgCode: 'P_TCD_DV', isLeader: false, isDeputy: true, slotOrder: 1, roleGroup: 'BTCTU_LANH_DAO_PHONG' },
    { email: 'tcd_ptp2@daklak.gov.vn', username: 'tcd_ptp2', fullName: 'Đ/c Phó Trưởng phòng TCĐ-ĐV 2 (Nghiệp vụ ĐV)', employeeCode: 'BTCTU_008', jobCode: 'R_P_TCD_DV_PTP2', orgCode: 'P_TCD_DV', isLeader: false, isDeputy: true, slotOrder: 1, roleGroup: 'BTCTU_LANH_DAO_PHONG' },
    { email: 'tcd_cv@daklak.gov.vn', username: 'tcd_cv', fullName: 'Đ/c Chuyên viên CSDL & CĐS Đảng viên', employeeCode: 'BTCTU_009', jobCode: 'R_P_TCD_DV_CV', orgCode: 'P_TCD_DV', isLeader: false, isDeputy: false, slotOrder: 1, roleGroup: 'BTCTU_CV_TCD_DV' },

    // Phòng TCCB
    { email: 'tccb_tp@daklak.gov.vn', username: 'tccb_tp', fullName: 'Đ/c Trưởng phòng Tổ chức cán bộ', employeeCode: 'BTCTU_010', jobCode: 'R_P_TCCB_TP', orgCode: 'P_TCCB', isLeader: true, isDeputy: false, slotOrder: 1, roleGroup: 'BTCTU_LANH_DAO_PHONG' },
    { email: 'tccb_ptp1@daklak.gov.vn', username: 'tccb_ptp1', fullName: 'Đ/c Phó Trưởng phòng TCCB 1 (Bổ nhiệm)', employeeCode: 'BTCTU_011', jobCode: 'R_P_TCCB_PTP1', orgCode: 'P_TCCB', isLeader: false, isDeputy: true, slotOrder: 1, roleGroup: 'BTCTU_LANH_DAO_PHONG' },
    { email: 'tccb_ptp2@daklak.gov.vn', username: 'tccb_ptp2', fullName: 'Đ/c Phó Trưởng phòng TCCB 2 (Biên chế, Lương)', employeeCode: 'BTCTU_012', jobCode: 'R_P_TCCB_PTP2', orgCode: 'P_TCCB', isLeader: false, isDeputy: true, slotOrder: 1, roleGroup: 'BTCTU_LANH_DAO_PHONG' },
    { email: 'tccb_cv@daklak.gov.vn', username: 'tccb_cv', fullName: 'Đ/c Chuyên viên CSDL Cán bộ Mẫu 2C', employeeCode: 'BTCTU_013', jobCode: 'R_P_TCCB_CV', orgCode: 'P_TCCB', isLeader: false, isDeputy: false, slotOrder: 1, roleGroup: 'BTCTU_CV_TCCB' },

    // Phòng BVCTNB
    { email: 'bvctnb_tp@daklak.gov.vn', username: 'bvctnb_tp', fullName: 'Đ/c Trưởng phòng Bảo vệ chính trị nội bộ', employeeCode: 'BTCTU_014', jobCode: 'R_P_BVCTNB_TP', orgCode: 'P_BVCTNB', isLeader: true, isDeputy: false, slotOrder: 1, roleGroup: 'BTCTU_LANH_DAO_PHONG' },
    { email: 'bvctnb_ptp1@daklak.gov.vn', username: 'bvctnb_ptp1', fullName: 'Đ/c Phó Trưởng phòng BVCTNB 1 (Thẩm tra)', employeeCode: 'BTCTU_015', jobCode: 'R_P_BVCTNB_PTP1', orgCode: 'P_BVCTNB', isLeader: false, isDeputy: true, slotOrder: 1, roleGroup: 'BTCTU_LANH_DAO_PHONG' },
    { email: 'bvctnb_ptp2@daklak.gov.vn', username: 'bvctnb_ptp2', fullName: 'Đ/c Phó Trưởng phòng BVCTNB 2 (Đơn thư)', employeeCode: 'BTCTU_016', jobCode: 'R_P_BVCTNB_PTP2', orgCode: 'P_BVCTNB', isLeader: false, isDeputy: true, slotOrder: 1, roleGroup: 'BTCTU_LANH_DAO_PHONG' },
    { email: 'bvctnb_cv@daklak.gov.vn', username: 'bvctnb_cv', fullName: 'Đ/c Chuyên viên BVCTNB Mức 3', employeeCode: 'BTCTU_017', jobCode: 'R_P_BVCTNB_CV', orgCode: 'P_BVCTNB', isLeader: false, isDeputy: false, slotOrder: 1, roleGroup: 'BTCTU_CB_BVCTNB' },

    // Khối Văn phòng Ban
    { email: 'vp_cvp@daklak.gov.vn', username: 'vp_cvp', fullName: 'Đ/c Chánh Văn phòng Ban', employeeCode: 'BTCTU_018', jobCode: 'R_VP_CVP', orgCode: 'VAN_PHONG', isLeader: true, isDeputy: false, slotOrder: 1, roleGroup: 'BTCTU_LANH_DAO_PHONG' },
    { email: 'vp_pcvp1@daklak.gov.vn', username: 'vp_pcvp1', fullName: 'Đ/c Phó Chánh Văn phòng 1 (Sức khỏe CB)', employeeCode: 'BTCTU_019', jobCode: 'R_VP_PCVP1', orgCode: 'VAN_PHONG', isLeader: false, isDeputy: true, slotOrder: 1, roleGroup: 'BTCTU_LANH_DAO_PHONG' },
    { email: 'vp_pcvp2@daklak.gov.vn', username: 'vp_pcvp2', fullName: 'Đ/c Phó Chánh Văn phòng 2 (Tài chính, Mật)', employeeCode: 'BTCTU_020', jobCode: 'R_VP_PCVP2', orgCode: 'VAN_PHONG', isLeader: false, isDeputy: true, slotOrder: 1, roleGroup: 'BTCTU_LANH_DAO_PHONG' },
    { email: 'vp_it1@daklak.gov.vn', username: 'vp_it1', fullName: 'Đ/c Chuyên viên Quản trị Hạ tầng CNTT & ATTT (Slot 1)', employeeCode: 'BTCTU_021', jobCode: 'R_VP_CV_IT', orgCode: 'VAN_PHONG', isLeader: false, isDeputy: false, slotOrder: 1, roleGroup: 'BTCTU_ADMIN_CNTT' },
    { email: 'vp_it2@daklak.gov.vn', username: 'vp_it2', fullName: 'Đ/c Chuyên viên Phát triển Phần mềm & CĐS (Slot 2)', employeeCode: 'BTCTU_022', jobCode: 'R_VP_CV_IT', orgCode: 'VAN_PHONG', isLeader: false, isDeputy: false, slotOrder: 2, roleGroup: 'BTCTU_ADMIN_CNTT' },
    { email: 'vp_nv@daklak.gov.vn', username: 'vp_nv', fullName: 'Đ/c Nhân viên Văn thư - Lưu trữ - Kế toán', employeeCode: 'BTCTU_023', jobCode: 'R_VP_NV', orgCode: 'VAN_PHONG', isLeader: false, isDeputy: false, slotOrder: 1, roleGroup: 'BTCTU_VAN_THU' },

    // Quản trị viên Hệ thống Ban Tổ chức
    { email: 'admin_btc@daklak.gov.vn', username: 'admin_btc', fullName: 'Quản trị viên Hệ thống BTCTU', employeeCode: 'BTCTU_ADMIN', jobCode: 'R_VP_CV_IT', orgCode: 'VAN_PHONG', isLeader: false, isDeputy: false, slotOrder: 1, roleGroup: 'ADMIN_SYSTEM' },
  ];

  const DEFAULT_PASSWORD = 'Admin@123';
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  // -------------------------------------------------------------
  // 6. Khởi tạo Nhóm người dùng (UserGroup) & Chính sách PBAC (Policy)
  // -------------------------------------------------------------
  console.log('🔐 Thiết lập hệ thống Nhóm người dùng và Chính sách PBAC...');

  const userGroupConfigs = [
    { key: 'ADMIN_SYSTEM', name: 'Quản trị viên hệ thống' },
    { key: 'BTCTU_LANH_DAO_BAN', name: 'Lãnh đạo Ban Tổ chức Tỉnh ủy' },
    { key: 'BTCTU_LANH_DAO_PHONG', name: 'Lãnh đạo Phòng - BTCTU' },
    { key: 'BTCTU_CV_TCD_DV', name: 'Chuyên viên Tổ chức đảng, đảng viên - BTCTU' },
    { key: 'BTCTU_CV_TCCB', name: 'Chuyên viên Tổ chức cán bộ - BTCTU' },
    { key: 'BTCTU_CB_BVCTNB', name: 'Cán bộ Bảo vệ chính trị nội bộ - BTCTU' },
    { key: 'BTCTU_VAN_THU', name: 'Văn thư - Lưu trữ - Kế toán - BTCTU' },
    { key: 'BTCTU_ADMIN_CNTT', name: 'Quản trị CNTT & ATTT - BTCTU' },
  ];

  const createdUserGroups: Record<string, any> = {};
  for (const ug of userGroupConfigs) {
    const group = await prisma.userGroup.upsert({
      where: { name: ug.name },
      update: {},
      create: { name: ug.name },
    });
    createdUserGroups[ug.key] = group;
  }

  // Lấy toàn bộ Resources có sẵn
  const allResources = await prisma.resource.findMany();
  const getResource = (code: string) => allResources.find(r => r.code === code);

  // Helper đảm bảo Policy
  const ensureGroupPolicy = async (
    groupId: number,
    resourceCode: string,
    action: string,
    conditions?: any
  ) => {
    const res = getResource(resourceCode);
    if (!res) return;

    const existing = await prisma.policy.findFirst({
      where: {
        resourceId: res.id,
        action,
        userGroups: { some: { id: groupId } },
      },
    });

    if (!existing) {
      await prisma.policy.create({
        data: {
          resourceId: res.id,
          action,
          effect: 'ALLOW',
          conditions: conditions || undefined,
          userGroups: { connect: [{ id: groupId }] },
        },
      });
    }
  };

  // 6.1 Policy: Quản trị viên hệ thống -> Full * trên mọi resource
  for (const res of allResources) {
    await ensureGroupPolicy(createdUserGroups['ADMIN_SYSTEM'].id, res.code, '*');
  }

  // 6.2 Policy: Lãnh đạo Ban Tổ chức Tỉnh ủy
  // Toàn quyền xem, phê duyệt, giao việc, xuất báo cáo trên toàn Ban Tổ chức
  const lanhDaoBanResources = [
    'WORKFLOW', 'TASK', 'PLAN', 'PROJECT', 'OBJECTIVE', 'KPI', 'REPORT',
    'DOCUMENT', 'DOC_INCOMING', 'DOC_OUTGOING', 'DOC_INTERNAL', 'DOC_PUBLISH', 'DOC_PROCESSING',
    'HRM_EMPLOYEE', 'ORGANIZATION', 'CATEGORY', 'NOTIFICATION'
  ];
  const lanhDaoBanActions = ['VIEW', 'CREATE', 'UPDATE', 'APPROVE', 'ASSIGN', 'EXPORT', 'PUBLISH'];
  const lanhDaoBanCondition = { expression: "ALLOW IF resource.unitCode STARTSWITH 'BTCTU' OR resource.unitId == currentUnitId OR resource.unitId == parentUnitId" };

  for (const resCode of lanhDaoBanResources) {
    for (const act of lanhDaoBanActions) {
      await ensureGroupPolicy(createdUserGroups['BTCTU_LANH_DAO_BAN'].id, resCode, act, lanhDaoBanCondition);
    }
  }

  // 6.3 Policy: Lãnh đạo Phòng - BTCTU
  // Toàn quyền giao việc, duyệt, thẩm định trong phạm vi phòng mình
  const lanhDaoPhongResources = [
    'WORKFLOW', 'TASK', 'PLAN', 'OBJECTIVE', 'KPI', 'REPORT',
    'DOCUMENT', 'DOC_INCOMING', 'DOC_OUTGOING', 'DOC_INTERNAL', 'DOC_DRAFT', 'DOC_PROCESSING',
    'HRM_EMPLOYEE', 'ORGANIZATION', 'CATEGORY', 'NOTIFICATION'
  ];
  const lanhDaoPhongActions = ['VIEW', 'CREATE', 'UPDATE', 'APPROVE', 'ASSIGN'];
  const lanhDaoPhongCondition = { expression: "ALLOW IF resource.departmentId == currentDepartmentId OR resource.unitCode == user.unitCode" };

  for (const resCode of lanhDaoPhongResources) {
    for (const act of lanhDaoPhongActions) {
      await ensureGroupPolicy(createdUserGroups['BTCTU_LANH_DAO_PHONG'].id, resCode, act, lanhDaoPhongCondition);
    }
  }

  // 6.4 Policy: Chuyên viên Tổ chức đảng, đảng viên (P_TCD_DV)
  const cvTcdResources = ['TASK', 'WORKFLOW', 'PLAN', 'DOCUMENT', 'DOC_DRAFT', 'DOC_PROCESSING', 'REPORT'];
  const specialistCondition = { expression: "ALLOW IF resource.assigneeId == user.id OR resource.creatorId == user.id OR resource.departmentId == currentDepartmentId" };

  for (const resCode of cvTcdResources) {
    for (const act of ['VIEW', 'CREATE', 'UPDATE']) {
      await ensureGroupPolicy(createdUserGroups['BTCTU_CV_TCD_DV'].id, resCode, act, specialistCondition);
    }
  }
  for (const resCode of ['HRM_EMPLOYEE', 'ORGANIZATION', 'CATEGORY', 'NOTIFICATION']) {
    await ensureGroupPolicy(createdUserGroups['BTCTU_CV_TCD_DV'].id, resCode, 'VIEW');
  }

  // 6.5 Policy: Chuyên viên Tổ chức cán bộ (P_TCCB)
  const cvTccbResources = ['TASK', 'WORKFLOW', 'PLAN', 'DOCUMENT', 'DOC_DRAFT', 'DOC_PROCESSING', 'HRM_EMPLOYEE', 'REPORT'];
  for (const resCode of cvTccbResources) {
    for (const act of ['VIEW', 'CREATE', 'UPDATE']) {
      await ensureGroupPolicy(createdUserGroups['BTCTU_CV_TCCB'].id, resCode, act, specialistCondition);
    }
  }
  for (const resCode of ['ORGANIZATION', 'CATEGORY', 'NOTIFICATION']) {
    await ensureGroupPolicy(createdUserGroups['BTCTU_CV_TCCB'].id, resCode, 'VIEW');
  }

  // 6.6 Policy: Cán bộ Bảo vệ chính trị nội bộ (P_BVCTNB)
  const cvBvctnbResources = ['TASK', 'WORKFLOW', 'PLAN', 'DOCUMENT', 'DOC_DRAFT', 'DOC_PROCESSING', 'REPORT'];
  for (const resCode of cvBvctnbResources) {
    for (const act of ['VIEW', 'CREATE', 'UPDATE']) {
      await ensureGroupPolicy(createdUserGroups['BTCTU_CB_BVCTNB'].id, resCode, act, specialistCondition);
    }
  }
  for (const resCode of ['ORGANIZATION', 'CATEGORY', 'NOTIFICATION']) {
    await ensureGroupPolicy(createdUserGroups['BTCTU_CB_BVCTNB'].id, resCode, 'VIEW');
  }

  // 6.7 Policy: Văn thư - Lưu trữ - Kế toán (VAN_PHONG)
  const vanThuResources = ['DOC_INCOMING', 'DOC_OUTGOING', 'DOC_INTERNAL', 'DOC_PUBLISH', 'DOC_CATEGORIES', 'DOC_TEMPLATE', 'DOCUMENT', 'REPORT'];
  const vanThuCondition = { expression: "ALLOW IF resource.unitCode STARTSWITH 'BTCTU'" };
  for (const resCode of vanThuResources) {
    for (const act of ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'PUBLISH']) {
      await ensureGroupPolicy(createdUserGroups['BTCTU_VAN_THU'].id, resCode, act, vanThuCondition);
    }
  }
  for (const resCode of ['TASK', 'WORKFLOW', 'ORGANIZATION', 'NOTIFICATION']) {
    await ensureGroupPolicy(createdUserGroups['BTCTU_VAN_THU'].id, resCode, 'VIEW');
  }

  // 6.8 Policy: Quản trị CNTT & ATTT (VAN_PHONG)
  const itResources = ['SYSTEM', 'USER', 'ROLE', 'RESOURCE', 'MENU', 'API_GATEWAY', 'INTEGRATION', 'TASK', 'WORKFLOW', 'REPORT', 'NOTIFICATION'];
  for (const resCode of itResources) {
    for (const act of ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'MANAGE']) {
      await ensureGroupPolicy(createdUserGroups['BTCTU_ADMIN_CNTT'].id, resCode, act);
    }
  }

  // -------------------------------------------------------------
  // 7. Seed Cán bộ, Gán UserPosition, StaffingSlot & UserToUserGroup
  // -------------------------------------------------------------
  console.log('👤 Nạp thông tin Cán bộ công chức và gán quyền PBAC...');

  for (const u of usersToSeed) {
    const targetGroup = createdUserGroups[u.roleGroup];

    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        fullName: u.fullName,
        username: u.username,
        employeeCode: u.employeeCode,
      },
      create: {
        email: u.email,
        username: u.username,
        fullName: u.fullName,
        employeeCode: u.employeeCode,
      },
    });

    // Mật khẩu
    await prisma.credential.upsert({
      where: { userId: user.id },
      update: { passwordHash },
      create: { userId: user.id, passwordHash },
    });

    // Gán UserGroup
    if (targetGroup) {
      await prisma.userToUserGroup.upsert({
        where: {
          A_B_organizationId: {
            A: user.id,
            B: targetGroup.id,
            organizationId: 'DEFAULT',
          },
        },
        update: {},
        create: {
          A: user.id,
          B: targetGroup.id,
          organizationId: 'DEFAULT',
        },
      });
    }

    const unit = orgUnits[u.orgCode];
    const job = jobMap[u.jobCode];

    if (unit && job) {
      // Upsert JobPosition (đảm bảo cập nhật đúng chức danh và đơn vị chuẩn)
      const existingPos = await prisma.jobPosition.findFirst({
        where: { userId: user.id },
      });

      if (existingPos) {
        await prisma.jobPosition.update({
          where: { id: existingPos.id },
          data: {
            unitId: unit.id,
            jobTitleId: job.id,
            isPrimary: true,
            isUnitLeader: u.isLeader,
            isDeputyLeader: u.isDeputy,
          },
        });
        await prisma.jobPosition.deleteMany({
          where: {
            userId: user.id,
            id: { not: existingPos.id },
          },
        });
      } else {
        await prisma.jobPosition.create({
          data: {
            userId: user.id,
            unitId: unit.id,
            jobTitleId: job.id,
            isPrimary: true,
            isUnitLeader: u.isLeader,
            isDeputyLeader: u.isDeputy,
          },
        });
      }

      // Gán assignedEmployeeCode vào StaffingSlot tương ứng
      const staffing = await prisma.organizationStaffing.findUnique({
        where: { unitId_jobTitleId: { unitId: unit.id, jobTitleId: job.id } },
      });

      if (staffing) {
        await prisma.staffingSlot.updateMany({
          where: {
            staffingId: staffing.id,
            slotOrder: u.slotOrder,
          },
          data: {
            assignedEmployeeCode: u.employeeCode,
            description: `Vị trí việc làm đảm nhiệm bởi ${u.fullName} (${u.employeeCode})`,
          },
        });
      }
    }
  }

  console.log('✅ Hoàn thành 100% cập nhật dữ liệu 22 Vị trí việc làm và Phân quyền PBAC Ban Tổ chức Tỉnh ủy Đắk Lắk.');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi seed dữ liệu BTCTU:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
