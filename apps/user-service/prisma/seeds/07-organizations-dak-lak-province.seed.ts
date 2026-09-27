import { PrismaClient } from '../../src/generated/prisma/client';

export async function seedOrganizationsDakLakProvince(prisma: PrismaClient) {

  const _unitTypes = await prisma.unitType.findMany();
  const unitTypeMap: Record<string, any> = {};
  for (const r of _unitTypes) unitTypeMap[r.code] = r;
  const DEFAULT_PASSWORD = 'Admin@123';


  
  console.log('📦 Seeding Organization Units...');
  const ubndTinhTypeId = unitTypeMap['UBND_TINH'].id;
  const soTypeId = unitTypeMap['SO_NGANH'].id;
  const phongTypeId = unitTypeMap['PHONG_BAN_SO'].id; // fallback changed from HUYEN to SO
  const trungTamTypeId = unitTypeMap['TRUNG_TAM'].id;

  const province = await prisma.organizationUnit.upsert({
    where: { code: 'H15' },
    update: { name: 'UBND Tỉnh Đắk Lắk', typeId: ubndTinhTypeId },
    create: {
      code: 'H15',
      name: 'UBND Tỉnh Đắk Lắk',
      typeId: ubndTinhTypeId,
      shortName: 'UBND Tỉnh',
    },
  });

  const depts = [
    {
      code: 'H15.07',
      name: 'Sở Khoa học và Công nghệ',
      shortName: 'Sở KH&CN',
    },
    { code: 'H15.08', name: 'Sở Giao thông vận tải', shortName: 'Sở GTVT' },
    { code: 'H15.09', name: 'Sở Y tế', shortName: 'Sở Y tế' },
    { code: 'H15.10', name: 'Sở Giáo dục và Đào tạo', shortName: 'Sở GD&ĐT' },
    { code: 'H15.11', name: 'Sở Tài chính', shortName: 'Sở Tài chính' },
    { code: 'H15.12', name: 'Sở Kế hoạch và Đầu tư', shortName: 'Sở KH&ĐT' },
    { code: 'H15.13', name: 'Sở Nội vụ', shortName: 'Sở Nội vụ' },
    { code: 'H15.14', name: 'Sở Xây dựng', shortName: 'Sở Xây dựng' },
    { code: 'H15.15', name: 'Sở Tư pháp', shortName: 'Sở Tư pháp' },
    {
      code: 'H15.16',
      name: 'Sở Văn hóa - Thể thao và Du lịch',
      shortName: 'Sở VHTTDL',
    },
    { code: 'H15.17', name: 'Sở Công thương', shortName: 'Sở Công thương' },
    {
      code: 'H15.18',
      name: 'Sở Nông nghiệp và Phát triển nông thôn',
      shortName: 'Sở NN&PTNT',
    },
    { code: 'H15.19', name: 'Sở Dân tộc và Tôn giáo', shortName: 'Sở Dân tộc' },
    { code: 'H15.20', name: 'Thanh tra Tỉnh', shortName: 'Thanh tra Tỉnh' },
    { code: 'H15.01', name: 'Văn phòng UBND tỉnh', shortName: 'VP UBND' },
  ];

  for (const d of depts) {
    await prisma.organizationUnit.upsert({
      where: { code: d.code },
      update: { parentId: province.id, typeId: soTypeId },
      create: { ...d, parentId: province.id, typeId: soTypeId },
    });
  }

  // Thêm ví dụ UBND Xã (Trực thuộc Tỉnh theo mô hình 2 cấp)







  // Thêm Đơn vị sự nghiệp tiêu biểu
  const soKhcn = await prisma.organizationUnit.findUnique({
    where: { code: 'H15.07' },
  });
  if (soKhcn) {
    await prisma.organizationUnit.upsert({
      where: { code: 'H15.07.01' },
      update: { parentId: soKhcn.id, typeId: trungTamTypeId },
      create: {
        code: 'H15.07.01',
        name: 'Trung tâm Đổi mới Sáng tạo',
        parentId: soKhcn.id,
        typeId: trungTamTypeId,
      },
    });
    await prisma.organizationUnit.upsert({
      where: { code: 'H15.07.04' },
      update: { parentId: soKhcn.id, typeId: trungTamTypeId },
      create: {
        code: 'H15.07.04',
        name: 'Trung tâm Giám sát, Điều hành Đô thị Thông minh (IOC)',
        parentId: soKhcn.id,
        typeId: trungTamTypeId,
      },
    });
    await prisma.organizationUnit.upsert({
      where: { code: 'H15.07.02' },
      update: { parentId: soKhcn.id, typeId: trungTamTypeId },
      create: {
        code: 'H15.07.02',
        name: 'Trung tâm Kỹ thuật Tiêu chuẩn - Đo lường - Chất lượng',
        parentId: soKhcn.id,
        typeId: trungTamTypeId,
      },
    });
    await prisma.organizationUnit.upsert({
      where: { code: 'H15.07.03' },
      update: { parentId: soKhcn.id, typeId: trungTamTypeId },
      create: {
        code: 'H15.07.03',
        name: 'Trung tâm Thông tin - Ứng dụng Khoa học và Công nghệ',
        parentId: soKhcn.id,
        typeId: trungTamTypeId,
      },
    });
  }

  console.log('🎉 COMPREHENSIVE E-GOV SEED COMPLETED');
  console.log(`👉 SuperAdmin: superadmin@sys.com / ${DEFAULT_PASSWORD}`);
  console.log(`👉 Admin: admin@sys.com / ${DEFAULT_PASSWORD}`);
  console.log(`👉 OrgAdmin: orgadmin@daklak.gov.vn / ${DEFAULT_PASSWORD}`);

  console.log('📦 Seeding Departments for Organizations...');

  // helper tạo phòng ban
  const createDept = async (
    parentCode: string,
    dept: { code: string; name: string; typeCode?: string; domainCodes?: string[] },
  ) => {
    const parent = await prisma.organizationUnit.findUnique({
      where: { code: parentCode },
    });
    if (!parent) return;

    const tId = dept.typeCode ? unitTypeMap[dept.typeCode]?.id : phongTypeId;

    const unit = await prisma.organizationUnit.upsert({
      where: { code: dept.code },
      update: { parentId: parent.id, typeId: tId },
      create: {
        code: dept.code,
        name: dept.name,
        parentId: parent.id,
        typeId: tId,
      },
    });

    if (dept.domainCodes && dept.domainCodes.length > 0) {
      const domains = await prisma.category.findMany({
        where: { groupCode: 'DOMAIN', code: { in: dept.domainCodes } }
      });
      if (domains.length > 0) {
        await prisma.unitDomain.deleteMany({ where: { unitId: unit.id } });
        await prisma.unitDomain.createMany({
          data: domains.map(d => ({ unitId: unit.id, domainId: d.id })),
          skipDuplicates: true
        });
      }
    }
  };

  // ==========================
  // 1. SỞ KHOA HỌC & CÔNG NGHỆ
  // ==========================
  await createDept('H15.07', {
    code: 'H15.07.05',
    name: 'Văn phòng Sở',
    typeCode: 'VAN_PHONG',
  });
  await createDept('H15.07', {
    code: 'H15.07.06',
    name: 'Thanh tra Sở',
    typeCode: 'THANH_TRA',
  });
  await createDept('H15.07', {
    code: 'H15.07.07',
    name: 'Phòng Kế hoạch - Tài chính',
    typeCode: 'PHONG_BAN_SO',
  });
  await createDept('H15.07', {
    code: 'H15.07.08',
    name: 'Phòng Quản lý Khoa học',
    typeCode: 'PHONG_BAN_SO',
    domainCodes: ['QUAN_LY_KHOA_HOC', 'UNG_DUNG_KHCN'],
  });
  await createDept('H15.07', {
    code: 'H15.07.09',
    name: 'Phòng Chuyển đổi số',
    typeCode: 'PHONG_BAN_SO',
    domainCodes: ['CHUYEN_DOI_SO', 'DU_LIEU_SO', 'AN_TOAN_THONG_TIN', 'CONG_NGHE_THONG_TIN'],
  });
  await createDept('H15.07', {
    code: 'H15.07.10',
    name: 'Phòng Quản lý Công nghệ và Đổi mới sáng tạo',
    typeCode: 'PHONG_BAN_SO',
    domainCodes: ['QUAN_LY_CONG_NGHE', 'DOI_MOI_SANG_TAO', 'SO_HUU_TRI_TUE'],
  });
  await createDept('H15.07', {
    code: 'H15.07.11',
    name: 'Phòng Quản lý Tiêu chuẩn - Đo lường - Chất lượng',
    typeCode: 'PHONG_BAN_SO',
    domainCodes: ['TIEU_CHUAN_DO_LUONG_CHAT_LUONG', 'AN_TOAN_BUC_XA_HAT_NHAN'],
  });

  // Các phòng thuộc Trung tâm Đổi mới Sáng tạo
  await createDept('H15.07.01', {
    code: 'H15.07.01.01',
    name: 'Phòng Hành chính - Tổng hợp',
    typeCode: 'PHONG_BAN_TRUNG_TAM',
  });
  await createDept('H15.07.01', {
    code: 'H15.07.01.02',
    name: 'Phòng Ươm tạo và Phát triển',
    typeCode: 'PHONG_BAN_TRUNG_TAM',
  });

  // Các phòng thuộc Trung tâm IOC
  await createDept('H15.07.04', {
    code: 'H15.07.04.01',
    name: 'Phòng Hành chính - Tổng hợp',
    typeCode: 'PHONG_BAN_TRUNG_TAM',
  });
  await createDept('H15.07.04', {
    code: 'H15.07.04.02',
    name: 'Phòng Khai thác và Quản lý dữ liệu',
    typeCode: 'PHONG_BAN_TRUNG_TAM',
  });
  await createDept('H15.07.04', {
    code: 'H15.07.04.03',
    name: 'Phòng Hạ tầng - Đô thị thông minh',
    typeCode: 'PHONG_BAN_TRUNG_TAM',
  });

  // Các phòng thuộc Trung tâm Kỹ thuật Tiêu chuẩn - Đo lường - Chất lượng
  await createDept('H15.07.02', {
    code: 'H15.07.02.01',
    name: 'Phòng Hành chính - Tổ chức',
    typeCode: 'PHONG_BAN_TRUNG_TAM',
  });
  await createDept('H15.07.02', {
    code: 'H15.07.02.02',
    name: 'Phòng Đo lường',
    typeCode: 'PHONG_BAN_TRUNG_TAM',
  });
  await createDept('H15.07.02', {
    code: 'H15.07.02.03',
    name: 'Phòng Thử nghiệm',
    typeCode: 'PHONG_BAN_TRUNG_TAM',
  });

  // Các phòng thuộc Trung tâm Thông tin - Ứng dụng Khoa học và Công nghệ
  await createDept('H15.07.03', {
    code: 'H15.07.03.01',
    name: 'Phòng Hành chính - Tổng hợp',
    typeCode: 'PHONG_BAN_TRUNG_TAM',
  });
  await createDept('H15.07.03', {
    code: 'H15.07.03.02',
    name: 'Phòng Thông tin KH&CN',
    typeCode: 'PHONG_BAN_TRUNG_TAM',
  });
  await createDept('H15.07.03', {
    code: 'H15.07.03.03',
    name: 'Phòng Ứng dụng KH&CN',
    typeCode: 'PHONG_BAN_TRUNG_TAM',
  });
  await createDept('H15.07.03', {
    code: 'H15.07.03.04',
    name: 'Phòng Dịch vụ KH&CN',
    typeCode: 'PHONG_BAN_TRUNG_TAM',
  });
  await createDept('H15.07.03', {
    code: 'H15.07.03.05',
    name: 'Trại Thực nghiệm KH&CN',
    typeCode: 'PHONG_BAN_TRUNG_TAM',
  });

  // ==========================
  // 2. SỞ Y TẾ
  // ==========================
  await createDept('H15.09', {
    code: 'H15.09.01',
    name: 'Văn phòng Sở',
    typeCode: 'VAN_PHONG',
  });
  await createDept('H15.09', {
    code: 'H15.09.02',
    name: 'Thanh tra Sở',
    typeCode: 'THANH_TRA',
  });
  await createDept('H15.09', {
    code: 'H15.09.03',
    name: 'Phòng Kế hoạch - Tài chính',
    typeCode: 'PHONG_BAN_SO',
  });
  await createDept('H15.09', {
    code: 'H15.09.04',
    name: 'Phòng Nghiệp vụ Y',
    typeCode: 'PHONG_BAN_SO',
  });
  await createDept('H15.09', {
    code: 'H15.09.05',
    name: 'Phòng Quản lý Dược',
    typeCode: 'PHONG_BAN_SO',
  });

  // ==========================
  // 3. SỞ GIÁO DỤC VÀ ĐÀO TẠO
  // ==========================
  await createDept('H15.10', {
    code: 'H15.10.01',
    name: 'Văn phòng Sở',
    typeCode: 'VAN_PHONG',
  });
  await createDept('H15.10', {
    code: 'H15.10.02',
    name: 'Thanh tra Sở',
    typeCode: 'THANH_TRA',
  });
  await createDept('H15.10', {
    code: 'H15.10.03',
    name: 'Phòng Kế hoạch - Tài chính',
    typeCode: 'PHONG_BAN_SO',
  });
  await createDept('H15.10', {
    code: 'H15.10.04',
    name: 'Phòng Tổ chức Cán bộ',
    typeCode: 'PHONG_BAN_SO',
  });
  await createDept('H15.10', {
    code: 'H15.10.05',
    name: 'Phòng Giáo dục Trung học',
    typeCode: 'PHONG_BAN_SO',
  });

  // ==========================
  // 4. SỞ TÀI CHÍNH
  // ==========================
  await createDept('H15.11', {
    code: 'H15.11.01',
    name: 'Văn phòng Sở',
    typeCode: 'VAN_PHONG',
  });
  await createDept('H15.11', {
    code: 'H15.11.02',
    name: 'Thanh tra Sở',
    typeCode: 'THANH_TRA',
  });
  await createDept('H15.11', {
    code: 'H15.11.03',
    name: 'Phòng Ngân sách',
    typeCode: 'PHONG_BAN_SO',
  });
  await createDept('H15.11', {
    code: 'H15.11.04',
    name: 'Phòng Hành chính sự nghiệp',
    typeCode: 'PHONG_BAN_SO',
  });

  // ==========================================================
  // PBAC SEED: SCOPES, POLICIES, ROLES & MAPPINGS
  // ==========================================================
  console.log('🔹 Seeding PBAC Scopes & Policies into SystemConfig...');
}