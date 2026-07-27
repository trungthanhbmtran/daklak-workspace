import { PrismaClient } from '../../src/generated/prisma/client';
import * as bcrypt from 'bcrypt';

export async function seed1UnitTypesNewModel(prisma: PrismaClient) {
  

  console.log('📦 Seeding Unit Types...');
  const unitTypesData = [
    { code: 'CQ_TU', name: 'Cơ quan Trung ương', level: 1 },
    { code: 'UBND_TINH', name: 'UBND Cấp Tỉnh', level: 1 },
    { code: 'HDND_TINH', name: 'HĐND Cấp Tỉnh', level: 1 },
    { code: 'SO_NGANH', name: 'Sở, Ban, Ngành', level: 2 },
    { code: 'PHONG_BAN_SO', name: 'Phòng chuyên môn cấp Sở', level: 3 },
    { code: 'PHONG_BAN_TRUNG_TAM', name: 'Phòng chuyên môn cấp Trung tâm', level: 4 },
    { code: 'VAN_PHONG', name: 'Văn phòng', level: 3 },
    { code: 'THANH_TRA', name: 'Thanh tra', level: 3 },
    { code: 'DVSN', name: 'Đơn vị sự nghiệp', level: 2 },
    { code: 'CHI_CUC', name: 'Chi cục / Tổng cục', level: 2 },
    { code: 'TRUNG_TAM', name: 'Trung tâm', level: 3 },
    { code: 'CQ_DANG', name: 'Cơ quan Đảng', level: 1 },
    { code: 'TO_CHUC_CTXH', name: 'Tổ chức Chính trị - Xã hội', level: 2 },
  ];

  const unitTypeMap: Record<string, any> = {};
  for (const ut of unitTypesData) {
    const created = await prisma.unitType.upsert({
      where: { code: ut.code },
      update: { name: ut.name, level: ut.level },
      create: ut,
    });
    unitTypeMap[ut.code] = created;
  }
  console.log('✅ Unit Types seeded');

  
}
