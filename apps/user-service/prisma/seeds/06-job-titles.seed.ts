import { PrismaClient } from '../../src/generated/prisma/client';
import * as bcrypt from 'bcrypt';

export async function seedJobTitles(prisma: PrismaClient) {
  
  console.log('📦 Seeding Job Titles...');
  const jobTitlesData = [
    {
      code: 'CHU_TICH',
      name: 'Chủ tịch',
      category: 'EXECUTIVE',
      rank: 1,
      type: 'GOVERNMENT',
    },
    {
      code: 'PHO_CHU_TICH',
      name: 'Phó Chủ tịch',
      category: 'EXECUTIVE',
      rank: 2,
      type: 'GOVERNMENT',
    },
    {
      code: 'GIAM_DOC',
      name: 'Giám đốc',
      category: 'EXECUTIVE',
      rank: 1,
      type: 'GOVERNMENT',
    },
    {
      code: 'PHO_GIAM_DOC',
      name: 'Phó Giám đốc',
      category: 'EXECUTIVE',
      rank: 2,
      type: 'GOVERNMENT',
    },
    {
      code: 'TRUONG_PHONG',
      name: 'Trưởng phòng',
      category: 'MANAGER',
      rank: 1,
      type: 'GOVERNMENT',
    },
    {
      code: 'PHO_PHONG',
      name: 'Phó Trưởng phòng',
      category: 'MANAGER',
      rank: 2,
      type: 'GOVERNMENT',
    },
    {
      code: 'CHANH_VAN_PHONG',
      name: 'Chánh Văn phòng',
      category: 'MANAGER',
      rank: 1,
      type: 'GOVERNMENT',
    },
    {
      code: 'PHO_CHANH_VAN_PHONG',
      name: 'Phó Chánh Văn phòng',
      category: 'MANAGER',
      rank: 2,
      type: 'GOVERNMENT',
    },
    {
      code: 'CHANH_THANH_TRA',
      name: 'Chánh Thanh tra',
      category: 'MANAGER',
      rank: 1,
      type: 'GOVERNMENT',
    },
    {
      code: 'PHO_CHANH_THANH_TRA',
      name: 'Phó Chánh Thanh tra',
      category: 'MANAGER',
      rank: 2,
      type: 'GOVERNMENT',
    },
    {
      code: 'THANH_TRA_VIEN',
      name: 'Thanh tra viên',
      category: 'STAFF',
      rank: 3,
      type: 'RANK',
    },
    {
      code: 'THANH_TRA_VIEN_CHINH',
      name: 'Thanh tra viên chính',
      category: 'STAFF',
      rank: 2,
      type: 'RANK',
    },
    {
      code: 'THANH_TRA_VIEN_CAO_CAP',
      name: 'Thanh tra viên cao cấp',
      category: 'STAFF',
      rank: 1,
      type: 'RANK',
    },
    {
      code: 'UY_VIEN_UBND',
      name: 'Ủy viên UBND',
      category: 'EXECUTIVE',
      rank: 3,
      type: 'GOVERNMENT',
    },
    {
      code: 'SPECIALIST',
      name: 'Chuyên viên',
      category: 'STAFF',
      rank: 3,
      type: 'RANK',
    },
    {
      code: 'SENIOR_SPECIALIST',
      name: 'Chuyên viên cao cấp',
      category: 'STAFF',
      rank: 1,
      type: 'RANK',
    },
    {
      code: 'PRINCIPAL_SPECIALIST',
      name: 'Chuyên viên chính',
      category: 'STAFF',
      rank: 2,
      type: 'RANK',
    },
    {
      code: 'OFFICER',
      name: 'Cán sự',
      category: 'STAFF',
      rank: 4,
      type: 'RANK',
    },
    {
      code: 'GRADE_1',
      name: 'Viên chức hạng I',
      category: 'STAFF',
      rank: 1,
      type: 'RANK',
    },
    {
      code: 'GRADE_2',
      name: 'Viên chức hạng II',
      category: 'STAFF',
      rank: 2,
      type: 'RANK',
    },
    {
      code: 'GRADE_3',
      name: 'Viên chức hạng III',
      category: 'STAFF',
      rank: 3,
      type: 'RANK',
    },
    {
      code: 'GRADE_4',
      name: 'Viên chức hạng IV',
      category: 'STAFF',
      rank: 4,
      type: 'RANK',
    },
    {
      code: 'KE_TOAN',
      name: 'Kế toán',
      category: 'STAFF',
      rank: 3,
      type: 'RANK',
    },
    {
      code: 'VAN_THU',
      name: 'Văn thư',
      category: 'STAFF',
      rank: 4,
      type: 'RANK',
    },
    {
      code: 'VIEN_CHUC',
      name: 'Viên chức',
      category: 'STAFF',
      rank: 3,
      type: 'RANK',
    },
    {
      code: 'NHAN_VIEN',
      name: 'Nhân viên',
      category: 'SUPPORT',
      rank: 5,
      type: 'RANK',
    },
    {
      code: 'BAO_VE',
      name: 'Bảo vệ',
      category: 'SUPPORT',
      rank: 6,
      type: 'RANK',
    },
    {
      code: 'CONG_CHUC_PHU_TRACH',
      name: 'Công chức phụ trách',
      category: 'STAFF',
      rank: 3,
      type: 'GOVERNMENT',
    },
    {
      code: 'CAN_BO_PHU_TRACH',
      name: 'Cán bộ phụ trách',
      category: 'STAFF',
      rank: 3,
      type: 'GOVERNMENT',
    },
    {
      code: 'BI_THU_DANG_BO',
      name: 'Bí thư Đảng bộ',
      category: 'EXECUTIVE',
      rank: 1,
      type: 'PARTY',
    },
    {
      code: 'PHO_BI_THU_DANG_BO',
      name: 'Phó Bí thư Đảng bộ',
      category: 'EXECUTIVE',
      rank: 2,
      type: 'PARTY',
    },
    {
      code: 'BI_THU_CHI_BO',
      name: 'Bí thư Chi bộ',
      category: 'EXECUTIVE',
      rank: 1,
      type: 'PARTY',
    },
    {
      code: 'PHO_BI_THU_CHI_BO',
      name: 'Phó Bí thư Chi bộ',
      category: 'EXECUTIVE',
      rank: 2,
      type: 'PARTY',
    },
    {
      code: 'DANG_UY_VIEN',
      name: 'Đảng ủy viên',
      category: 'EXECUTIVE',
      rank: 3,
      type: 'PARTY',
    },
    {
      code: 'CHI_UY_VIEN',
      name: 'Chi ủy viên',
      category: 'EXECUTIVE',
      rank: 3,
      type: 'PARTY',
    },
    {
      code: 'BI_THU',
      name: 'Bí thư',
      category: 'EXECUTIVE',
      rank: 1,
      type: 'PARTY',
    },
    {
      code: 'PHO_BI_THU',
      name: 'Phó Bí thư',
      category: 'EXECUTIVE',
      rank: 2,
      type: 'PARTY',
    },
    {
      code: 'TRUONG_BAN',
      name: 'Trưởng ban',
      category: 'MANAGER',
      rank: 1,
      type: 'GOVERNMENT',
    },
    {
      code: 'PHO_TRUONG_BAN',
      name: 'Phó Trưởng ban',
      category: 'MANAGER',
      rank: 2,
      type: 'GOVERNMENT',
    },
  ];

  for (const jt of jobTitlesData) {
    await prisma.jobTitle.upsert({
      where: { code: jt.code },
      update: {
        name: jt.name,
        category: jt.category,
        rank: jt.rank,
        type: jt.type,
      },
      create: jt,
    });
  }

  // 7.1 LINK JOB TITLES TO UNIT TYPES (Using Template)
  console.log('📦 Cleaning and linking Job Titles to Unit Types...');
  await prisma.unitTypeJobTemplate.deleteMany({});

  const links = [
    {
      jt: 'CHU_TICH',
      types: [
        'UBND_TINH',
        'HDND_TINH',
      ],
    },
    {
      jt: 'PHO_CHU_TICH',
      types: [
        'UBND_TINH',
        'HDND_TINH',
      ],
    },
    { jt: 'UY_VIEN_UBND', types: ['UBND_TINH'] },
    { jt: 'GIAM_DOC', types: ['SO_NGANH', 'DVSN', 'TRUNG_TAM', 'CHI_CUC'] },
    { jt: 'PHO_GIAM_DOC', types: ['SO_NGANH', 'DVSN', 'TRUNG_TAM', 'CHI_CUC'] },
    {
      jt: 'TRUONG_PHONG',
      types: [
        'PHONG_BAN_SO',
        'DVSN',
        'TRUNG_TAM',
        'CHI_CUC',
      ],
    },
    {
      jt: 'PHO_PHONG',
      types: [
        'PHONG_BAN_SO',
        'DVSN',
        'TRUNG_TAM',
        'CHI_CUC',
      ],
    },
    { jt: 'CHANH_VAN_PHONG', types: ['VAN_PHONG'] },
    { jt: 'PHO_CHANH_VAN_PHONG', types: ['VAN_PHONG'] },
    { jt: 'CHANH_THANH_TRA', types: ['THANH_TRA'] },
    { jt: 'PHO_CHANH_THANH_TRA', types: ['THANH_TRA'] },
    { jt: 'THANH_TRA_VIEN', types: ['THANH_TRA'] },
    { jt: 'THANH_TRA_VIEN_CHINH', types: ['THANH_TRA'] },
    { jt: 'THANH_TRA_VIEN_CAO_CAP', types: ['THANH_TRA'] },
    {
      jt: 'SPECIALIST',
      types: [
        'PHONG_BAN_SO',
        'VAN_PHONG',
        'DVSN',
        'TRUNG_TAM',
        'CHI_CUC',
      ],
    },
    {
      jt: 'SENIOR_SPECIALIST',
      types: ['PHONG_BAN_SO', 'VAN_PHONG', 'CHI_CUC'],
    },
    {
      jt: 'PRINCIPAL_SPECIALIST',
      types: ['PHONG_BAN_SO', 'VAN_PHONG', 'CHI_CUC'],
    },
    {
      jt: 'OFFICER',
      types: [
        'PHONG_BAN_SO',
        'VAN_PHONG',
        'DVSN',
        'TRUNG_TAM',
      ],
    },
    {
      jt: 'STAFF',
      types: [
        'PHONG_BAN_SO',
        'VAN_PHONG',
        'THANH_TRA',
        'DVSN',
        'TRUNG_TAM',
      ],
    },
    {
      jt: 'CONG_CHUC_PHU_TRACH',
      types: [
        'PHONG_BAN_SO',
        'VAN_PHONG',
        'DVSN',
        'TRUNG_TAM',
      ],
    },
    {
      jt: 'CAN_BO_PHU_TRACH',
      types: [
        'PHONG_BAN_SO',
        'VAN_PHONG',
        'DVSN',
        'TRUNG_TAM',
      ],
    },
    {
      jt: 'BI_THU_DANG_BO',
      types: [
        'CQ_DANG',
        'SO_NGANH',
        'UBND_TINH',
        'DVSN',
        'CHI_CUC',
      ],
    },
    {
      jt: 'PHO_BI_THU_DANG_BO',
      types: [
        'CQ_DANG',
        'SO_NGANH',
        'UBND_TINH',
        'DVSN',
        'CHI_CUC',
      ],
    },
    {
      jt: 'DANG_UY_VIEN',
      types: [
        'CQ_DANG',
        'SO_NGANH',
        'UBND_TINH',
        'DVSN',
        'CHI_CUC',
      ],
    },
    {
      jt: 'BI_THU_CHI_BO',
      types: [
        'CQ_DANG',
        'PHONG_BAN_SO',
        'VAN_PHONG',
        'THANH_TRA',
        'DVSN',
        'TRUNG_TAM',
        'CHI_CUC',
        'SO_NGANH',
        'UBND_TINH',
      ],
    },
    {
      jt: 'PHO_BI_THU_CHI_BO',
      types: [
        'CQ_DANG',
        'PHONG_BAN_SO',
        'VAN_PHONG',
        'THANH_TRA',
        'DVSN',
        'TRUNG_TAM',
        'CHI_CUC',
        'SO_NGANH',
        'UBND_TINH',
      ],
    },
    {
      jt: 'CHI_UY_VIEN',
      types: [
        'CQ_DANG',
        'PHONG_BAN_SO',
        'VAN_PHONG',
        'THANH_TRA',
        'DVSN',
        'TRUNG_TAM',
        'CHI_CUC',
        'SO_NGANH',
        'UBND_TINH',
      ],
    },
    { jt: 'BI_THU', types: ['CQ_DANG'] },
    { jt: 'PHO_BI_THU', types: ['CQ_DANG'] },
    { jt: 'TRUONG_BAN', types: ['CQ_DANG', 'TO_CHUC_CTXH'] },
    { jt: 'PHO_TRUONG_BAN', types: ['CQ_DANG', 'TO_CHUC_CTXH'] },
    {
      jt: 'KE_TOAN',
      types: [
        'PHONG_BAN_SO',
        'VAN_PHONG',
        'THANH_TRA',
        'DVSN',
        'TRUNG_TAM',
      ],
    },
    {
      jt: 'VAN_THU',
      types: [
        'PHONG_BAN_SO',
        'VAN_PHONG',
        'THANH_TRA',
        'DVSN',
        'TRUNG_TAM',
      ],
    },
    {
      jt: 'VIEN_CHUC',
      types: [
        'DVSN',
        'TRUNG_TAM',
      ],
    },
    {
      jt: 'NHAN_VIEN',
      types: [
        'PHONG_BAN_SO',
        'VAN_PHONG',
        'THANH_TRA',
        'DVSN',
        'TRUNG_TAM',
      ],
    },
    {
      jt: 'BAO_VE',
      types: [
        'PHONG_BAN_SO',
        'VAN_PHONG',
        'THANH_TRA',
        'DVSN',
        'TRUNG_TAM',
      ],
    },
  ];

  // Dynamically add PHONG_BAN_TRUNG_TAM to any link that supports PHONG_BAN_SO
  for (const link of links) {
    if (link.types.includes('PHONG_BAN_SO') && !link.types.includes('PHONG_BAN_TRUNG_TAM')) {
      link.types.push('PHONG_BAN_TRUNG_TAM');
    }
  }

  const templatesToCreate: { unitTypeId: number; jobTitleId: number }[] = [];
  for (const link of links) {
    const jobTitle = await prisma.jobTitle.findUnique({
      where: { code: link.jt },
    });
    if (jobTitle) {
      for (const typeCode of link.types) {
        const typeId = unitTypeMap[typeCode]?.id;
        if (typeId) {
          templatesToCreate.push({ unitTypeId: typeId, jobTitleId: jobTitle.id });
        }
      }
    }
  }

  if (templatesToCreate.length > 0) {
    await prisma.unitTypeJobTemplate.createMany({
      data: templatesToCreate,
      skipDuplicates: true,
    });
  }

  
}
