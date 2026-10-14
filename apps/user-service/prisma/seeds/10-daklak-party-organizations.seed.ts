import { PrismaClient } from '../../src/generated/prisma/client';
import * as bcrypt from 'bcrypt';

export async function seedPartyOrganizationsDakLak(prisma: PrismaClient) {
  console.log('🏛️ Bắt đầu Seed Cơ cấu Tổ chức, Nhiệm vụ Đảng & Vị trí việc làm Ban Tổ chức Tỉnh ủy Đắk Lắk...');

  // -------------------------------------------------------------
  // 1. Danh mục Lĩnh vực Công tác Đảng chuẩn (DOMAIN - Party Tasks)
  // -------------------------------------------------------------
  const partyDomains = [
    { code: 'CONG_TAC_TO_CHUC', name: 'Công tác Tổ chức, Cán bộ và Đảng viên' },
    { code: 'CONG_TAC_KIEM_TRA', name: 'Công tác Kiểm tra, Giám sát và Kỷ luật Đảng' },
    { code: 'CONG_TAC_TUYEN_GIAO', name: 'Công tác Tuyên giáo, Tư tưởng' },
    { code: 'CONG_TAC_DAN_VAN', name: 'Công tác Dân vận' },
    { code: 'CONG_TAC_NOI_CHINH', name: 'Công tác Nội chính, Cải cách tư pháp và Phòng chống tham nhũng, tiêu cực' },
    { code: 'CONG_TAC_VAN_PHONG', name: 'Công tác Văn phòng, Tham mưu tổng hợp cấp ủy' },
    { code: 'TO_CHUC_XAY_DUNG_DANG', name: 'Tổ chức xây dựng Đảng' },
    { code: 'TO_CHUC_CAN_BO_DANG', name: 'Công tác Tổ chức, Cán bộ, Đảng viên' },
    { code: 'VAN_PHONG_CAP_UY', name: 'Văn phòng Cấp ủy' },
    { code: 'CO_QUAN_DANG', name: 'Các cơ quan Đảng' },
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
  // 2. Đảm bảo Loại hình cơ quan / đơn vị (UnitType) khối Đảng
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
  // 3. Cơ cấu Tổ chức: Tỉnh ủy Đắk Lắk & Ban Tổ chức Tỉnh ủy (05 Đơn vị)
  // -------------------------------------------------------------
  const tinhUy = await prisma.organizationUnit.upsert({
    where: { code: 'TU_DAKLAK' },
    update: { name: 'Tỉnh ủy Đắk Lắk', typeId: typeCoQuanDang.id },
    create: {
      code: 'TU_DAKLAK',
      name: 'Tỉnh ủy Đắk Lắk',
      typeId: typeCoQuanDang.id,
      shortName: 'Tỉnh ủy',
    },
  });

  const btcTu = await prisma.organizationUnit.upsert({
    where: { code: 'BTCTU_DAKLAK' },
    update: {
      name: 'Ban Tổ chức Tỉnh ủy Đắk Lắk',
      parentId: tinhUy.id,
      typeId: typeBanDang.id,
      hierarchyPath: `${tinhUy.id}/BTCTU_DAKLAK`,
      shortName: 'Ban Tổ chức Tỉnh ủy',
    },
    create: {
      code: 'BTCTU_DAKLAK',
      name: 'Ban Tổ chức Tỉnh ủy Đắk Lắk',
      typeId: typeBanDang.id,
      parentId: tinhUy.id,
      hierarchyPath: `${tinhUy.id}/BTCTU_DAKLAK`,
      shortName: 'Ban Tổ chức Tỉnh ủy',
    },
  });

  // 04 Phòng chuyên môn trực thuộc Ban Tổ chức Tỉnh ủy
  const divisions = [
    { code: 'P_TCD_DV', name: 'Phòng Tổ chức đảng, đảng viên', shortName: 'Phòng TCĐ-ĐV', typeId: typePhongBanDang.id },
    { code: 'P_TCCB', name: 'Phòng Tổ chức cán bộ', shortName: 'Phòng TCCB', typeId: typePhongBanDang.id },
    { code: 'P_BVCTNB', name: 'Phòng Bảo vệ chính trị nội bộ', shortName: 'Phòng BVCTNB', typeId: typePhongBanDang.id },
    { code: 'VAN_PHONG', name: 'Văn phòng Ban', shortName: 'Văn phòng', typeId: typeVanPhongDang.id },
  ];

  const orgUnits: Record<string, any> = {
    'BTCTU_DAKLAK': btcTu,
  };

  for (const div of divisions) {
    const org = await prisma.organizationUnit.upsert({
      where: { code: div.code },
      update: {
        name: div.name,
        parentId: btcTu.id,
        typeId: div.typeId,
        hierarchyPath: `${btcTu.id}/${div.code}`,
        shortName: div.shortName,
      },
      create: {
        code: div.code,
        name: div.name,
        typeId: div.typeId,
        parentId: btcTu.id,
        hierarchyPath: `${btcTu.id}/${div.code}`,
        shortName: div.shortName,
      },
    });
    orgUnits[div.code] = org;
  }

  // -------------------------------------------------------------
  // 4. Cấu hình Nhiệm vụ / Lĩnh vực Công tác Đảng cấp Đơn vị (UnitDomain)
  // -------------------------------------------------------------
  const allPartyDomains = await prisma.category.findMany({
    where: { groupCode: 'DOMAIN', code: { in: partyDomains.map((d) => d.code) } },
  });

  const unitIdsToClean = [tinhUy.id, btcTu.id, ...Object.values(orgUnits).map((u) => u.id)];
  await prisma.unitDomain.deleteMany({
    where: { unitId: { in: unitIdsToClean } },
  });

  const btcCoreDomainCodes = [
    'CONG_TAC_TO_CHUC',
    'TO_CHUC_XAY_DUNG_DANG',
    'TO_CHUC_CAN_BO_DANG',
    'CONG_TAC_VAN_PHONG',
    'CONG_TAC_NOI_CHINH',
    'CONG_TAC_KIEM_TRA',
    'VAN_PHONG_CAP_UY',
  ];

  const btcDomainEntries = [
    ...allPartyDomains.map((d) => ({ unitId: tinhUy.id, domainId: d.id })),
    ...btcCoreDomainCodes
      .map((code) => ({ unitId: btcTu.id, domainId: domainMap[code] }))
      .filter((e) => !!e.domainId),
    { unitId: orgUnits['P_TCD_DV'].id, domainId: domainMap['CONG_TAC_TO_CHUC'] },
    { unitId: orgUnits['P_TCD_DV'].id, domainId: domainMap['TO_CHUC_XAY_DUNG_DANG'] },
    { unitId: orgUnits['P_TCCB'].id, domainId: domainMap['CONG_TAC_TO_CHUC'] },
    { unitId: orgUnits['P_TCCB'].id, domainId: domainMap['TO_CHUC_CAN_BO_DANG'] },
    { unitId: orgUnits['P_BVCTNB'].id, domainId: domainMap['CONG_TAC_NOI_CHINH'] },
    { unitId: orgUnits['P_BVCTNB'].id, domainId: domainMap['CONG_TAC_KIEM_TRA'] },
    { unitId: orgUnits['VAN_PHONG'].id, domainId: domainMap['CONG_TAC_VAN_PHONG'] },
    { unitId: orgUnits['VAN_PHONG'].id, domainId: domainMap['VAN_PHONG_CAP_UY'] },
  ].filter((e) => !!e.domainId);

  await prisma.unitDomain.createMany({
    data: btcDomainEntries,
    skipDuplicates: true,
  });

  // -------------------------------------------------------------
  // 5. Danh mục 22 Vị trí việc làm cá nhân (JobTitle) theo Đề án BTCTU
  // -------------------------------------------------------------
  const vtvlDefinitions = [
    // --- Khối Lãnh đạo Ban (Trưởng ban & Phó Trưởng ban với 4 Vị trí chức danh) ---
    {
      code: 'TRUONG_BAN',
      name: 'Trưởng ban',
      cdeCode: 'CDE-BTCTU-001',
      vtvlCode: 'VTVL-01',
      unitCode: 'BTCTU_DAKLAK',
      typeCode: 'BAN_DANG',
      rank: 1,
      authorityLevel: 'BAN_THUONG_VU',
      reportsToCode: null,
      description: 'Lãnh đạo, điều hành toàn diện công tác Tổ chức xây dựng Đảng toàn tỉnh. Sản phẩm chuẩn: Nghị quyết/Đề án Tỉnh ủy, Kết luận chính trị nhân sự, Quyết định xếp loại.',
      slotCount: 1,
      domainCodes: ['CONG_TAC_TO_CHUC', 'TO_CHUC_XAY_DUNG_DANG'],
      slots: [
        {
          slotOrder: 1,
          description: 'Vị trí 1 — Trưởng ban (Ủy viên BTV Tỉnh ủy, Trưởng Ban Tổ chức Tỉnh ủy)',
          empCode: 'BTCTU_001',
          domainCodes: ['CONG_TAC_TO_CHUC', 'TO_CHUC_XAY_DUNG_DANG'],
        },
      ],
    },
    {
      code: 'PHO_TRUONG_BAN',
      name: 'Phó Trưởng ban',
      cdeCode: 'CDE-BTCTU-002',
      vtvlCode: 'VTVL-02',
      unitCode: 'BTCTU_DAKLAK',
      typeCode: 'BAN_DANG',
      rank: 2,
      authorityLevel: 'THUONG_TRUC_BAN',
      reportsToCode: 'TRUONG_BAN',
      description: 'Ban gồm 04 Phó Trưởng ban (Phó ban 1, 2, 3, 4) phụ trách 4 mảng công tác Đảng chuyên sâu.',
      slotCount: 4,
      domainCodes: [
        'CONG_TAC_TO_CHUC',
        'TO_CHUC_CAN_BO_DANG',
        'TO_CHUC_XAY_DUNG_DANG',
        'CONG_TAC_NOI_CHINH',
        'CONG_TAC_KIEM_TRA',
        'CONG_TAC_VAN_PHONG',
      ],
      slots: [
        {
          slotOrder: 1,
          description: 'Vị trí 1 — Phó ban 1 (Phó Trưởng ban Thường trực: Phụ trách Tổ chức cán bộ, Quản lý biên chế, VTVL)',
          empCode: 'BTCTU_002',
          domainCodes: ['CONG_TAC_TO_CHUC', 'TO_CHUC_CAN_BO_DANG'],
        },
        {
          slotOrder: 2,
          description: 'Vị trí 2 — Phó ban 2 (Phụ trách Tổ chức cơ sở đảng, Đảng viên & Sổ tay Đảng viên)',
          empCode: 'BTCTU_003',
          domainCodes: ['CONG_TAC_TO_CHUC', 'TO_CHUC_XAY_DUNG_DANG'],
        },
        {
          slotOrder: 3,
          description: 'Vị trí 3 — Phó ban 3 (Phụ trách Bảo vệ chính trị nội bộ & Đơn thư khiếu nại tố cáo)',
          empCode: 'BTCTU_004',
          domainCodes: ['CONG_TAC_NOI_CHINH', 'CONG_TAC_KIEM_TRA'],
        },
        {
          slotOrder: 4,
          description: 'Vị trí 4 — Phó ban 4 (Phụ trách Đào tạo, Chính sách cán bộ, Sức khỏe CB & Hạ tầng CNTT)',
          empCode: 'BTCTU_005',
          domainCodes: ['TO_CHUC_CAN_BO_DANG', 'CONG_TAC_VAN_PHONG'],
        },
      ],
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
      domainCodes: ['CONG_TAC_TO_CHUC', 'TO_CHUC_XAY_DUNG_DANG'],
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
      domainCodes: ['CONG_TAC_TO_CHUC', 'TO_CHUC_XAY_DUNG_DANG'],
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
      domainCodes: ['CONG_TAC_TO_CHUC', 'TO_CHUC_XAY_DUNG_DANG'],
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
      domainCodes: ['CONG_TAC_TO_CHUC', 'TO_CHUC_XAY_DUNG_DANG'],
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
      domainCodes: ['CONG_TAC_TO_CHUC', 'TO_CHUC_CAN_BO_DANG'],
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
      domainCodes: ['CONG_TAC_TO_CHUC', 'TO_CHUC_CAN_BO_DANG'],
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
      domainCodes: ['CONG_TAC_TO_CHUC', 'TO_CHUC_CAN_BO_DANG'],
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
      domainCodes: ['CONG_TAC_TO_CHUC', 'TO_CHUC_CAN_BO_DANG'],
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
      domainCodes: ['CONG_TAC_NOI_CHINH', 'CONG_TAC_KIEM_TRA'],
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
      domainCodes: ['CONG_TAC_NOI_CHINH', 'CONG_TAC_KIEM_TRA'],
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
      domainCodes: ['CONG_TAC_NOI_CHINH', 'CONG_TAC_KIEM_TRA'],
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
      domainCodes: ['CONG_TAC_NOI_CHINH', 'CONG_TAC_KIEM_TRA'],
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
      domainCodes: ['CONG_TAC_VAN_PHONG', 'VAN_PHONG_CAP_UY'],
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
      domainCodes: ['CONG_TAC_VAN_PHONG', 'VAN_PHONG_CAP_UY'],
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
      domainCodes: ['CONG_TAC_VAN_PHONG', 'VAN_PHONG_CAP_UY'],
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
      domainCodes: ['CONG_TAC_VAN_PHONG', 'VAN_PHONG_CAP_UY'],
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
      domainCodes: ['CONG_TAC_VAN_PHONG', 'VAN_PHONG_CAP_UY'],
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
  }

  // -------------------------------------------------------------
  // 6. Chuẩn hóa UnitTypeJobTemplate & Loại bỏ Chức danh Generic
  // -------------------------------------------------------------
  // Xóa sạch các generic jobs chính quyền khỏi template của các đơn vị Đảng
  const genericJobCodes = ['SPECIALIST', 'OFFICER', 'STAFF', 'KE_TOAN', 'VAN_THU', 'HOP_DONG', 'NHAN_VIEN', 'BAO_VE'];
  const genericJobs = await prisma.jobTitle.findMany({
    where: { code: { in: genericJobCodes } },
  });
  const genericJobIds = genericJobs.map((j) => j.id);

  if (genericJobIds.length > 0) {
    await prisma.unitTypeJobTemplate.deleteMany({
      where: {
        unitTypeId: { in: [typeBanDang.id, typePhongBanDang.id, typeVanPhongDang.id, typeCoQuanDang.id] },
        jobTitleId: { in: genericJobIds },
      },
    });
  }

  // Gán TRUONG_BAN và PHO_TRUONG_BAN vào template BAN_DANG
  const leaderJobs = await prisma.jobTitle.findMany({
    where: { code: { in: ['TRUONG_BAN', 'PHO_TRUONG_BAN'] } },
  });
  for (const lj of leaderJobs) {
    await prisma.unitTypeJobTemplate.upsert({
      where: { unitTypeId_jobTitleId: { unitTypeId: typeBanDang.id, jobTitleId: lj.id } },
      update: {},
      create: { unitTypeId: typeBanDang.id, jobTitleId: lj.id },
    });
  }

  // Gán TẤT CẢ 22 VTVL vào template BAN_DANG và template phòng ban tương ứng
  for (const vtvl of vtvlDefinitions) {
    const job = jobMap[vtvl.code];
    if (!job) continue;

    // Gán vào BAN_DANG (cấp Ban quản lý toàn bộ VTVL của cơ quan)
    await prisma.unitTypeJobTemplate.upsert({
      where: { unitTypeId_jobTitleId: { unitTypeId: typeBanDang.id, jobTitleId: job.id } },
      update: {},
      create: { unitTypeId: typeBanDang.id, jobTitleId: job.id },
    });

    // Gán vào loại phòng ban tương ứng
    let specificTypeId: number | undefined;
    if (vtvl.typeCode === 'PHONG_BAN_DANG') specificTypeId = typePhongBanDang.id;
    else if (vtvl.typeCode === 'VAN_PHONG_DANG_UY') specificTypeId = typeVanPhongDang.id;

    if (specificTypeId) {
      await prisma.unitTypeJobTemplate.upsert({
        where: { unitTypeId_jobTitleId: { unitTypeId: specificTypeId, jobTitleId: job.id } },
        update: {},
        create: { unitTypeId: specificTypeId, jobTitleId: job.id },
      });
    }
  }

  // Vòng 2: Cập nhật tuyến báo cáo reportsToJobTitleId
  for (const vtvl of vtvlDefinitions) {
    if (vtvl.reportsToCode && jobMap[vtvl.reportsToCode]) {
      await prisma.jobTitle.update({
        where: { code: vtvl.code },
        data: { reportsToJobTitleId: jobMap[vtvl.reportsToCode].id },
      });
    }
  }

  // -------------------------------------------------------------
  // 7. Định biên biên chế (OrganizationStaffing) & Phân bổ Slots (StaffingSlot)
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
      const explicitSlot = vtvl.slots?.find((s: any) => s.slotOrder === slotOrder);
      const slotDesc = explicitSlot?.description
        || (vtvl.slotCount > 1 ? `Vị trí ${vtvl.name} - Vị trí số ${slotOrder}` : `Vị trí ${vtvl.name}`);
      const slotEmpCode = explicitSlot?.empCode || null;

      const slot = await prisma.staffingSlot.upsert({
        where: { staffingId_slotOrder: { staffingId: staffing.id, slotOrder } },
        update: {
          description: slotDesc,
          assignedEmployeeCode: slotEmpCode,
        },
        create: {
          staffingId: staffing.id,
          slotOrder,
          description: slotDesc,
          assignedEmployeeCode: slotEmpCode,
        },
      });

      // Gắn domain nhiệm vụ Đảng cho slot
      const targetDomains = explicitSlot?.domainCodes || vtvl.domainCodes;
      if (targetDomains && targetDomains.length > 0) {
        for (const domCode of targetDomains) {
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

      // Gắn monitored units cho lãnh đạo Ban
      if (vtvl.rank <= 2) {
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
  // 8. Cập nhật Danh sách Cán bộ Công chức & Vị trí công tác (JobPosition)
  // -------------------------------------------------------------
  const usersToSeed = [
    // Lãnh đạo Ban
    { email: 'truongban@daklak.gov.vn', username: 'truongban', fullName: 'Nguyễn Thượng Hải', employeeCode: 'BTCTU_001', jobCode: 'TRUONG_BAN', orgCode: 'BTCTU_DAKLAK', isLeader: true, isDeputy: false, slotOrder: 1, roleGroup: 'BTCTU_LANH_DAO_BAN' },
    { email: 'phoban1@daklak.gov.vn', username: 'phoban1', fullName: 'Lưu Vĩnh Hưng', employeeCode: 'BTCTU_002', jobCode: 'PHO_TRUONG_BAN', orgCode: 'BTCTU_DAKLAK', isLeader: false, isDeputy: true, slotOrder: 1, roleGroup: 'BTCTU_LANH_DAO_BAN' },
    { email: 'phoban2@daklak.gov.vn', username: 'phoban2', fullName: 'Nguyễn Hữu Toàn', employeeCode: 'BTCTU_003', jobCode: 'PHO_TRUONG_BAN', orgCode: 'BTCTU_DAKLAK', isLeader: false, isDeputy: true, slotOrder: 2, roleGroup: 'BTCTU_LANH_DAO_BAN' },
    { email: 'phoban3@daklak.gov.vn', username: 'phoban3', fullName: 'Trần Tuấn Anh', employeeCode: 'BTCTU_004', jobCode: 'PHO_TRUONG_BAN', orgCode: 'BTCTU_DAKLAK', isLeader: false, isDeputy: true, slotOrder: 3, roleGroup: 'BTCTU_LANH_DAO_BAN' },
    { email: 'phoban4@daklak.gov.vn', username: 'phoban4', fullName: 'Y Nhuân Byă', employeeCode: 'BTCTU_005', jobCode: 'PHO_TRUONG_BAN', orgCode: 'BTCTU_DAKLAK', isLeader: false, isDeputy: true, slotOrder: 4, roleGroup: 'BTCTU_LANH_DAO_BAN' },

    // Phòng TCĐ-ĐV
    { email: 'tcd_tp@daklak.gov.vn', username: 'tcd_tp', fullName: 'Lê Đình Hoàng', employeeCode: 'BTCTU_006', jobCode: 'R_P_TCD_DV_TP', orgCode: 'P_TCD_DV', isLeader: true, isDeputy: false, slotOrder: 1, roleGroup: 'BTCTU_LANH_DAO_PHONG' },
    { email: 'tcd_ptp1@daklak.gov.vn', username: 'tcd_ptp1', fullName: 'Phạm Văn Minh', employeeCode: 'BTCTU_007', jobCode: 'R_P_TCD_DV_PTP1', orgCode: 'P_TCD_DV', isLeader: false, isDeputy: true, slotOrder: 1, roleGroup: 'BTCTU_LANH_DAO_PHONG' },
    { email: 'tcd_ptp2@daklak.gov.vn', username: 'tcd_ptp2', fullName: 'Vũ Thị Mai', employeeCode: 'BTCTU_008', jobCode: 'R_P_TCD_DV_PTP2', orgCode: 'P_TCD_DV', isLeader: false, isDeputy: true, slotOrder: 1, roleGroup: 'BTCTU_LANH_DAO_PHONG' },
    { email: 'tcd_cv@daklak.gov.vn', username: 'tcd_cv', fullName: 'Đặng Quang Huy', employeeCode: 'BTCTU_009', jobCode: 'R_P_TCD_DV_CV', orgCode: 'P_TCD_DV', isLeader: false, isDeputy: false, slotOrder: 1, roleGroup: 'BTCTU_CV_TCD_DV' },

    // Phòng TCCB
    { email: 'tccb_tp@daklak.gov.vn', username: 'tccb_tp', fullName: 'Hoàng Đức Nam', employeeCode: 'BTCTU_010', jobCode: 'R_P_TCCB_TP', orgCode: 'P_TCCB', isLeader: true, isDeputy: false, slotOrder: 1, roleGroup: 'BTCTU_LANH_DAO_PHONG' },
    { email: 'tccb_ptp1@daklak.gov.vn', username: 'tccb_ptp1', fullName: 'Trần Quốc Tuấn', employeeCode: 'BTCTU_011', jobCode: 'R_P_TCCB_PTP1', orgCode: 'P_TCCB', isLeader: false, isDeputy: true, slotOrder: 1, roleGroup: 'BTCTU_LANH_DAO_PHONG' },
    { email: 'tccb_ptp2@daklak.gov.vn', username: 'tccb_ptp2', fullName: 'Bùi Thị Bích Ngọc', employeeCode: 'BTCTU_012', jobCode: 'R_P_TCCB_PTP2', orgCode: 'P_TCCB', isLeader: false, isDeputy: true, slotOrder: 1, roleGroup: 'BTCTU_LANH_DAO_PHONG' },
    { email: 'tccb_cv@daklak.gov.vn', username: 'tccb_cv', fullName: 'Nguyễn Tiến Đạt', employeeCode: 'BTCTU_013', jobCode: 'R_P_TCCB_CV', orgCode: 'P_TCCB', isLeader: false, isDeputy: false, slotOrder: 1, roleGroup: 'BTCTU_CV_TCCB' },

    // Phòng BVCTNB
    { email: 'bvctnb_tp@daklak.gov.vn', username: 'bvctnb_tp', fullName: 'Ngô Thanh Tùng', employeeCode: 'BTCTU_014', jobCode: 'R_P_BVCTNB_TP', orgCode: 'P_BVCTNB', isLeader: true, isDeputy: false, slotOrder: 1, roleGroup: 'BTCTU_LANH_DAO_PHONG' },
    { email: 'bvctnb_ptp1@daklak.gov.vn', username: 'bvctnb_ptp1', fullName: 'Đinh Trọng Hưng', employeeCode: 'BTCTU_015', jobCode: 'R_P_BVCTNB_PTP1', orgCode: 'P_BVCTNB', isLeader: false, isDeputy: true, slotOrder: 1, roleGroup: 'BTCTU_LANH_DAO_PHONG' },
    { email: 'bvctnb_ptp2@daklak.gov.vn', username: 'bvctnb_ptp2', fullName: 'Dương Văn Hùng', employeeCode: 'BTCTU_016', jobCode: 'R_P_BVCTNB_PTP2', orgCode: 'P_BVCTNB', isLeader: false, isDeputy: true, slotOrder: 1, roleGroup: 'BTCTU_LANH_DAO_PHONG' },
    { email: 'bvctnb_cv@daklak.gov.vn', username: 'bvctnb_cv', fullName: 'Phan Thành Trung', employeeCode: 'BTCTU_017', jobCode: 'R_P_BVCTNB_CV', orgCode: 'P_BVCTNB', isLeader: false, isDeputy: false, slotOrder: 1, roleGroup: 'BTCTU_CB_BVCTNB' },

    // Khối Văn phòng Ban
    { email: 'vp_cvp@daklak.gov.vn', username: 'vp_cvp', fullName: 'Chu Văn Kiên', employeeCode: 'BTCTU_018', jobCode: 'R_VP_CVP', orgCode: 'VAN_PHONG', isLeader: true, isDeputy: false, slotOrder: 1, roleGroup: 'BTCTU_LANH_DAO_PHONG' },
    { email: 'vp_pcvp1@daklak.gov.vn', username: 'vp_pcvp1', fullName: 'Nguyễn Hồng Ánh', employeeCode: 'BTCTU_019', jobCode: 'R_VP_PCVP1', orgCode: 'VAN_PHONG', isLeader: false, isDeputy: true, slotOrder: 1, roleGroup: 'BTCTU_LANH_DAO_PHONG' },
    { email: 'vp_pcvp2@daklak.gov.vn', username: 'vp_pcvp2', fullName: 'Lương Đình Quý', employeeCode: 'BTCTU_020', jobCode: 'R_VP_PCVP2', orgCode: 'VAN_PHONG', isLeader: false, isDeputy: true, slotOrder: 1, roleGroup: 'BTCTU_LANH_DAO_PHONG' },
    { email: 'vp_it1@daklak.gov.vn', username: 'vp_it1', fullName: 'Trương Minh Cường', employeeCode: 'BTCTU_021', jobCode: 'R_VP_CV_IT', orgCode: 'VAN_PHONG', isLeader: false, isDeputy: false, slotOrder: 1, roleGroup: 'BTCTU_ADMIN_CNTT' },
    { email: 'vp_it2@daklak.gov.vn', username: 'vp_it2', fullName: 'Võ Thành Danh', employeeCode: 'BTCTU_022', jobCode: 'R_VP_CV_IT', orgCode: 'VAN_PHONG', isLeader: false, isDeputy: false, slotOrder: 2, roleGroup: 'BTCTU_ADMIN_CNTT' },
    { email: 'vp_nv@daklak.gov.vn', username: 'vp_nv', fullName: 'Lê Thu Thảo', employeeCode: 'BTCTU_023', jobCode: 'R_VP_NV', orgCode: 'VAN_PHONG', isLeader: false, isDeputy: false, slotOrder: 1, roleGroup: 'BTCTU_VAN_THU' },

    // Quản trị viên Hệ thống Ban Tổ chức
    { email: 'admin_btc@daklak.gov.vn', username: 'admin_btc', fullName: 'Quản trị viên Hệ thống BTCTU', employeeCode: 'BTCTU_ADMIN', jobCode: 'R_VP_CV_IT', orgCode: 'VAN_PHONG', isLeader: false, isDeputy: false, slotOrder: 1, roleGroup: 'ADMIN_SYSTEM' },
  ];

  const DEFAULT_PASSWORD = 'Admin@123';
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  // -------------------------------------------------------------
  // 9. Khởi tạo Nhóm người dùng (UserGroup) & Chính sách PBAC (Policy)
  // -------------------------------------------------------------
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
  const getResource = (code: string) => allResources.find((r) => r.code === code);

  // Helper đảm bảo Policy
  const ensureGroupPolicies = async (
    groupId: number,
    resourceCode: string,
    actions: string[],
    conditions?: any
  ) => {
    const res = getResource(resourceCode);
    if (!res) return;

    for (const action of actions) {
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
    }
  };

  // Policy: Quản trị viên hệ thống -> Full * trên mọi resource
  for (const res of allResources) {
    await ensureGroupPolicies(createdUserGroups['ADMIN_SYSTEM'].id, res.code, ['*']);
  }

  // Policy: Lãnh đạo Ban Tổ chức Tỉnh ủy (Điều hành toàn diện, giao việc, thẩm định & phê duyệt)
  const lanhDaoBanId = createdUserGroups['BTCTU_LANH_DAO_BAN'].id;
  await ensureGroupPolicies(lanhDaoBanId, 'TASK', ['*']);
  await ensureGroupPolicies(lanhDaoBanId, 'HRM_EMPLOYEE', ['VIEW']);
  await ensureGroupPolicies(lanhDaoBanId, 'REPORT', ['VIEW', 'CREATE', 'UPDATE', 'APPROVE', 'EXPORT']);
  await ensureGroupPolicies(lanhDaoBanId, 'DOCUMENT', ['VIEW', 'CREATE', 'UPDATE', 'APPROVE', 'ASSIGN', 'PUBLISH']);
  await ensureGroupPolicies(lanhDaoBanId, 'DOC_INCOMING', ['VIEW', 'CREATE', 'UPDATE', 'APPROVE', 'ASSIGN', 'PUBLISH']);
  await ensureGroupPolicies(lanhDaoBanId, 'DOC_OUTGOING', ['VIEW', 'CREATE', 'UPDATE', 'APPROVE', 'ASSIGN', 'PUBLISH']);
  await ensureGroupPolicies(lanhDaoBanId, 'DOC_INTERNAL', ['VIEW', 'CREATE', 'UPDATE', 'APPROVE', 'ASSIGN', 'PUBLISH']);
  await ensureGroupPolicies(lanhDaoBanId, 'DOC_PUBLISH', ['VIEW', 'CREATE', 'UPDATE', 'APPROVE', 'ASSIGN', 'PUBLISH']);
  await ensureGroupPolicies(lanhDaoBanId, 'PLAN', ['VIEW', 'CREATE', 'UPDATE', 'APPROVE', 'ASSIGN']);
  await ensureGroupPolicies(lanhDaoBanId, 'MEETING', ['VIEW', 'CREATE', 'UPDATE', 'APPROVE']);
  await ensureGroupPolicies(lanhDaoBanId, 'WORKFLOW', ['VIEW', 'EXECUTE', 'APPROVE']);
  await ensureGroupPolicies(lanhDaoBanId, 'ORGANIZATION', ['VIEW']);
  await ensureGroupPolicies(lanhDaoBanId, 'CATEGORY', ['VIEW']);

  // Policy: Lãnh đạo Phòng - BTCTU (Giao việc cho phòng, thẩm định bước và đánh giá kết quả)
  const lanhDaoPhongId = createdUserGroups['BTCTU_LANH_DAO_PHONG'].id;
  await ensureGroupPolicies(lanhDaoPhongId, 'TASK', ['VIEW', 'CREATE', 'UPDATE', 'APPROVE', 'ASSIGN', 'REASSIGN', 'EVALUATE']);
  await ensureGroupPolicies(lanhDaoPhongId, 'HRM_EMPLOYEE', ['VIEW']);
  await ensureGroupPolicies(lanhDaoPhongId, 'REPORT', ['VIEW', 'CREATE', 'UPDATE', 'EXPORT']);
  await ensureGroupPolicies(lanhDaoPhongId, 'DOCUMENT', ['VIEW', 'CREATE', 'UPDATE', 'APPROVE', 'ASSIGN']);
  await ensureGroupPolicies(lanhDaoPhongId, 'DOC_INCOMING', ['VIEW', 'CREATE', 'UPDATE', 'APPROVE', 'ASSIGN']);
  await ensureGroupPolicies(lanhDaoPhongId, 'DOC_OUTGOING', ['VIEW', 'CREATE', 'UPDATE', 'APPROVE', 'ASSIGN']);
  await ensureGroupPolicies(lanhDaoPhongId, 'DOC_INTERNAL', ['VIEW', 'CREATE', 'UPDATE', 'APPROVE', 'ASSIGN']);
  await ensureGroupPolicies(lanhDaoPhongId, 'DOC_DRAFT', ['VIEW', 'CREATE', 'UPDATE', 'APPROVE', 'ASSIGN']);
  await ensureGroupPolicies(lanhDaoPhongId, 'PLAN', ['VIEW', 'CREATE', 'UPDATE']);
  await ensureGroupPolicies(lanhDaoPhongId, 'MEETING', ['VIEW', 'CREATE', 'UPDATE']);
  await ensureGroupPolicies(lanhDaoPhongId, 'WORKFLOW', ['VIEW', 'EXECUTE']);
  await ensureGroupPolicies(lanhDaoPhongId, 'ORGANIZATION', ['VIEW']);
  await ensureGroupPolicies(lanhDaoPhongId, 'CATEGORY', ['VIEW']);

  // Policy: Chuyên viên Phòng TCĐ-ĐV (Thực thi nhiệm vụ, lập báo cáo, soạn dự thảo văn bản)
  const tcdDvId = createdUserGroups['BTCTU_CV_TCD_DV'].id;
  await ensureGroupPolicies(tcdDvId, 'TASK', ['VIEW', 'CREATE', 'UPDATE']);
  await ensureGroupPolicies(tcdDvId, 'HRM_EMPLOYEE', ['VIEW']);
  await ensureGroupPolicies(tcdDvId, 'REPORT', ['VIEW', 'CREATE', 'UPDATE', 'EXPORT']);
  await ensureGroupPolicies(tcdDvId, 'DOCUMENT', ['VIEW', 'CREATE', 'UPDATE']);
  await ensureGroupPolicies(tcdDvId, 'DOC_DRAFT', ['VIEW', 'CREATE', 'UPDATE']);
  await ensureGroupPolicies(tcdDvId, 'DOC_INCOMING', ['VIEW']);
  await ensureGroupPolicies(tcdDvId, 'DOC_OUTGOING', ['VIEW']);
  await ensureGroupPolicies(tcdDvId, 'DOC_INTERNAL', ['VIEW']);
  await ensureGroupPolicies(tcdDvId, 'WORKFLOW', ['VIEW', 'EXECUTE']);
  await ensureGroupPolicies(tcdDvId, 'PLAN', ['VIEW']);
  await ensureGroupPolicies(tcdDvId, 'MEETING', ['VIEW']);
  await ensureGroupPolicies(tcdDvId, 'ORGANIZATION', ['VIEW']);
  await ensureGroupPolicies(tcdDvId, 'CATEGORY', ['VIEW']);

  // Policy: Chuyên viên Phòng TCCB (Thực thi nhiệm vụ cán bộ, quản lý hồ sơ nhân sự, biên chế)
  const tccbId = createdUserGroups['BTCTU_CV_TCCB'].id;
  await ensureGroupPolicies(tccbId, 'TASK', ['VIEW', 'CREATE', 'UPDATE']);
  await ensureGroupPolicies(tccbId, 'HRM_EMPLOYEE', ['VIEW', 'CREATE', 'UPDATE']);
  await ensureGroupPolicies(tccbId, 'REPORT', ['VIEW', 'CREATE', 'UPDATE', 'EXPORT']);
  await ensureGroupPolicies(tccbId, 'DOCUMENT', ['VIEW', 'CREATE', 'UPDATE']);
  await ensureGroupPolicies(tccbId, 'DOC_DRAFT', ['VIEW', 'CREATE', 'UPDATE']);
  await ensureGroupPolicies(tccbId, 'DOC_INCOMING', ['VIEW']);
  await ensureGroupPolicies(tccbId, 'DOC_OUTGOING', ['VIEW']);
  await ensureGroupPolicies(tccbId, 'DOC_INTERNAL', ['VIEW']);
  await ensureGroupPolicies(tccbId, 'ORGANIZATION', ['VIEW']);
  await ensureGroupPolicies(tccbId, 'CATEGORY', ['VIEW']);
  await ensureGroupPolicies(tccbId, 'WORKFLOW', ['VIEW', 'EXECUTE']);
  await ensureGroupPolicies(tccbId, 'PLAN', ['VIEW']);
  await ensureGroupPolicies(tccbId, 'MEETING', ['VIEW']);

  // Policy: Cán bộ BVCTNB (Bảo vệ chính trị nội bộ)
  const bvctnbId = createdUserGroups['BTCTU_CB_BVCTNB'].id;
  await ensureGroupPolicies(bvctnbId, 'TASK', ['VIEW', 'CREATE', 'UPDATE']);
  await ensureGroupPolicies(bvctnbId, 'HRM_EMPLOYEE', ['VIEW']);
  await ensureGroupPolicies(bvctnbId, 'REPORT', ['VIEW', 'CREATE', 'UPDATE', 'EXPORT']);
  await ensureGroupPolicies(bvctnbId, 'DOCUMENT', ['VIEW', 'CREATE', 'UPDATE']);
  await ensureGroupPolicies(bvctnbId, 'DOC_DRAFT', ['VIEW', 'CREATE', 'UPDATE']);
  await ensureGroupPolicies(bvctnbId, 'DOC_INCOMING', ['VIEW']);
  await ensureGroupPolicies(bvctnbId, 'DOC_OUTGOING', ['VIEW']);
  await ensureGroupPolicies(bvctnbId, 'DOC_INTERNAL', ['VIEW']);
  await ensureGroupPolicies(bvctnbId, 'WORKFLOW', ['VIEW', 'EXECUTE']);
  await ensureGroupPolicies(bvctnbId, 'PLAN', ['VIEW']);
  await ensureGroupPolicies(bvctnbId, 'MEETING', ['VIEW']);
  await ensureGroupPolicies(bvctnbId, 'ORGANIZATION', ['VIEW']);
  await ensureGroupPolicies(bvctnbId, 'CATEGORY', ['VIEW']);

  // Policy: Văn thư - Lưu trữ - Kế toán - BTCTU (Văn bản đến, đi, phát hành, lịch họp)
  const vanThuId = createdUserGroups['BTCTU_VAN_THU'].id;
  await ensureGroupPolicies(vanThuId, 'DOCUMENT', ['*']);
  await ensureGroupPolicies(vanThuId, 'DOC_INCOMING', ['*']);
  await ensureGroupPolicies(vanThuId, 'DOC_OUTGOING', ['*']);
  await ensureGroupPolicies(vanThuId, 'DOC_INTERNAL', ['*']);
  await ensureGroupPolicies(vanThuId, 'DOC_DRAFT', ['*']);
  await ensureGroupPolicies(vanThuId, 'DOC_PUBLISH', ['*']);
  await ensureGroupPolicies(vanThuId, 'DOC_CATEGORIES', ['*']);
  await ensureGroupPolicies(vanThuId, 'MEETING', ['VIEW', 'CREATE', 'UPDATE']);
  await ensureGroupPolicies(vanThuId, 'TASK', ['VIEW', 'CREATE', 'UPDATE']);
  await ensureGroupPolicies(vanThuId, 'REPORT', ['VIEW', 'CREATE', 'EXPORT']);
  await ensureGroupPolicies(vanThuId, 'HRM_EMPLOYEE', ['VIEW']);
  await ensureGroupPolicies(vanThuId, 'ORGANIZATION', ['VIEW']);
  await ensureGroupPolicies(vanThuId, 'CATEGORY', ['VIEW']);

  // Policy: Quản trị CNTT & ATTT - BTCTU
  const itId = createdUserGroups['BTCTU_ADMIN_CNTT'].id;
  await ensureGroupPolicies(itId, 'USER', ['*']);
  await ensureGroupPolicies(itId, 'ROLE', ['*']);
  await ensureGroupPolicies(itId, 'RESOURCE', ['*']);
  await ensureGroupPolicies(itId, 'ORGANIZATION', ['*']);
  await ensureGroupPolicies(itId, 'CATEGORY', ['*']);
  await ensureGroupPolicies(itId, 'MENU', ['*']);
  await ensureGroupPolicies(itId, 'HRM_EMPLOYEE', ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'MANAGE']);
  await ensureGroupPolicies(itId, 'TASK', ['VIEW', 'CREATE', 'UPDATE']);
  await ensureGroupPolicies(itId, 'REPORT', ['VIEW', 'EXPORT']);
  await ensureGroupPolicies(itId, 'SYSTEM', ['VIEW', 'UPDATE']);

  // -------------------------------------------------------------
  // 10. Tạo Users, Bổ nhiệm JobPosition & Gán Slot cho BTCTU
  // -------------------------------------------------------------
  for (const u of usersToSeed) {
    const unit = orgUnits[u.orgCode];
    const job = jobMap[u.jobCode];
    if (!unit || !job) continue;

    const group = createdUserGroups[u.roleGroup];

    const user = await prisma.user.upsert({
      where: { username: u.username },
      update: {
        fullName: u.fullName,
        email: u.email,
        employeeCode: u.employeeCode,
        isActive: true,
        ...(group
          ? {
              UserToUserGroup: {
                deleteMany: {},
                create: [{ B: group.id }],
              },
            }
          : {}),
      },
      create: {
        username: u.username,
        email: u.email,
        fullName: u.fullName,
        employeeCode: u.employeeCode,
        isActive: true,
        ...(group
          ? {
              UserToUserGroup: {
                create: [{ B: group.id }],
              },
            }
          : {}),
      },
    });

    await prisma.credential.upsert({
      where: { userId: user.id },
      update: { passwordHash },
      create: { userId: user.id, passwordHash },
    });

    // Bổ nhiệm JobPosition chính thức
    const existingPos = await prisma.jobPosition.findFirst({
      where: { userId: user.id, unitId: unit.id },
    });

    if (existingPos) {
      await prisma.jobPosition.update({
        where: { id: existingPos.id },
        data: {
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
        },
      });
    }
  }

  console.log('✅ Hoàn thành 100% Seed Nhiệm vụ Đảng, Cơ cấu Tổ chức & 22 VTVL Ban Tổ chức Tỉnh ủy Đắk Lắk.');
}
