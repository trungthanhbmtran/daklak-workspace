import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import 'dotenv/config';
import type { PrismaClient as PrismaClientType } from '../src/generated/prisma/client';

let PrismaClient: typeof PrismaClientType;
try {
  PrismaClient = require('../src/generated/prisma/client').PrismaClient;
} catch (e) {
  PrismaClient = require('../src/generated/prisma/client').PrismaClient;
}

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) throw new Error('DATABASE_URL is not set');
const mariadbUrl = dbUrl.replace(/^mysql:\/\//, 'mariadb://');
const adapter = new PrismaMariaDb(mariadbUrl);
const prisma = new PrismaClient({ adapter });

export interface BtctuEmployeeSeedData {
  employeeCode: string;
  firstname: string;
  lastname: string;
  fullName: string;
  email: string;
  phone: string;
  gender: string;
  birthday: string;
  identityCard: string;
  departmentId: number;
  departmentPath: string;
  jobTitleId: number;
  partyTitleId: number;
  slotOrder: number;
  username: string;
}

export const btctuEmployeesData: BtctuEmployeeSeedData[] = [
  // --- 1. Khối Lãnh đạo Ban Tổ chức Tỉnh ủy (05 Lãnh đạo) ---
  {
    employeeCode: 'BTCTU_001',
    lastname: 'Nguyễn',
    firstname: 'Thượng Hải',
    fullName: 'Nguyễn Thượng Hải',
    email: 'truongban@daklak.gov.vn',
    phone: '0913456001',
    gender: 'male',
    birthday: '1972-12-31',
    identityCard: '066072000001',
    departmentId: 56,
    departmentPath: '55/BTCTU_DAKLAK',
    jobTitleId: 40,
    partyTitleId: 40,
    slotOrder: 1,
    username: 'truongban',
  },
  {
    employeeCode: 'BTCTU_002',
    lastname: 'Lưu',
    firstname: 'Vĩnh Hưng',
    fullName: 'Lưu Vĩnh Hưng',
    email: 'phoban1@daklak.gov.vn',
    phone: '0913456002',
    gender: 'male',
    birthday: '1975-05-15',
    identityCard: '066075000002',
    departmentId: 56,
    departmentPath: '55/BTCTU_DAKLAK',
    jobTitleId: 41,
    partyTitleId: 41,
    slotOrder: 1,
    username: 'phoban1',
  },
  {
    employeeCode: 'BTCTU_003',
    lastname: 'Nguyễn',
    firstname: 'Hữu Toàn',
    fullName: 'Nguyễn Hữu Toàn',
    email: 'phoban2@daklak.gov.vn',
    phone: '0913456003',
    gender: 'male',
    birthday: '1978-08-20',
    identityCard: '066078000003',
    departmentId: 56,
    departmentPath: '55/BTCTU_DAKLAK',
    jobTitleId: 41,
    partyTitleId: 41,
    slotOrder: 2,
    username: 'phoban2',
  },
  {
    employeeCode: 'BTCTU_004',
    lastname: 'Trần',
    firstname: 'Tuấn Anh',
    fullName: 'Trần Tuấn Anh',
    email: 'phoban3@daklak.gov.vn',
    phone: '0913456004',
    gender: 'male',
    birthday: '1976-11-10',
    identityCard: '066076000004',
    departmentId: 56,
    departmentPath: '55/BTCTU_DAKLAK',
    jobTitleId: 41,
    partyTitleId: 41,
    slotOrder: 3,
    username: 'phoban3',
  },
  {
    employeeCode: 'BTCTU_005',
    lastname: 'Y',
    firstname: 'Nhuân Byă',
    fullName: 'Y Nhuân Byă',
    email: 'phoban4@daklak.gov.vn',
    phone: '0913456005',
    gender: 'male',
    birthday: '1977-03-25',
    identityCard: '066077000005',
    departmentId: 56,
    departmentPath: '55/BTCTU_DAKLAK',
    jobTitleId: 41,
    partyTitleId: 41,
    slotOrder: 4,
    username: 'phoban4',
  },

  // --- 2. Phòng Tổ chức đảng, đảng viên (04 Cán bộ công chức) ---
  {
    employeeCode: 'BTCTU_006',
    lastname: 'Công chức',
    firstname: '1',
    fullName: 'Công chức 1',
    email: 'tcd_tp@daklak.gov.vn',
    phone: '0913456006',
    gender: 'male',
    birthday: '1980-04-12',
    identityCard: '066080000006',
    departmentId: 57,
    departmentPath: '56/P_TCD_DV',
    jobTitleId: 42,
    partyTitleId: 42,
    slotOrder: 1,
    username: 'tcd_tp',
  },
  {
    employeeCode: 'BTCTU_007',
    lastname: 'Công chức',
    firstname: '2',
    fullName: 'Công chức 2',
    email: 'tcd_ptp1@daklak.gov.vn',
    phone: '0913456007',
    gender: 'female',
    birthday: '1983-09-18',
    identityCard: '066083000007',
    departmentId: 57,
    departmentPath: '56/P_TCD_DV',
    jobTitleId: 57,
    partyTitleId: 57,
    slotOrder: 1,
    username: 'tcd_ptp1',
  },
  {
    employeeCode: 'BTCTU_008',
    lastname: 'Công chức',
    firstname: '3',
    fullName: 'Công chức 3',
    email: 'tcd_ptp2@daklak.gov.vn',
    phone: '0913456008',
    gender: 'male',
    birthday: '1985-02-28',
    identityCard: '066085000008',
    departmentId: 57,
    departmentPath: '56/P_TCD_DV',
    jobTitleId: 58,
    partyTitleId: 58,
    slotOrder: 1,
    username: 'tcd_ptp2',
  },
  {
    employeeCode: 'BTCTU_009',
    lastname: 'Công chức',
    firstname: '4',
    fullName: 'Công chức 4',
    email: 'tcd_cv@daklak.gov.vn',
    phone: '0913456009',
    gender: 'male',
    birthday: '1990-07-15',
    identityCard: '066090000009',
    departmentId: 57,
    departmentPath: '56/P_TCD_DV',
    jobTitleId: 44,
    partyTitleId: 44,
    slotOrder: 1,
    username: 'tcd_cv',
  },

  // --- 3. Phòng Tổ chức cán bộ (04 Cán bộ công chức) ---
  {
    employeeCode: 'BTCTU_010',
    lastname: 'Công chức',
    firstname: '5',
    fullName: 'Công chức 5',
    email: 'tccb_tp@daklak.gov.vn',
    phone: '0913456010',
    gender: 'male',
    birthday: '1981-06-22',
    identityCard: '066081000010',
    departmentId: 58,
    departmentPath: '56/P_TCCB',
    jobTitleId: 45,
    partyTitleId: 45,
    slotOrder: 1,
    username: 'tccb_tp',
  },
  {
    employeeCode: 'BTCTU_011',
    lastname: 'Công chức',
    firstname: '6',
    fullName: 'Công chức 6',
    email: 'tccb_ptp1@daklak.gov.vn',
    phone: '0913456011',
    gender: 'female',
    birthday: '1984-12-05',
    identityCard: '066084000011',
    departmentId: 58,
    departmentPath: '56/P_TCCB',
    jobTitleId: 59,
    partyTitleId: 59,
    slotOrder: 1,
    username: 'tccb_ptp1',
  },
  {
    employeeCode: 'BTCTU_012',
    lastname: 'Công chức',
    firstname: '7',
    fullName: 'Công chức 7',
    email: 'tccb_ptp2@daklak.gov.vn',
    phone: '0913456012',
    gender: 'male',
    birthday: '1986-10-30',
    identityCard: '066086000012',
    departmentId: 58,
    departmentPath: '56/P_TCCB',
    jobTitleId: 60,
    partyTitleId: 60,
    slotOrder: 1,
    username: 'tccb_ptp2',
  },
  {
    employeeCode: 'BTCTU_013',
    lastname: 'Công chức',
    firstname: '8',
    fullName: 'Công chức 8',
    email: 'tccb_cv@daklak.gov.vn',
    phone: '0913456013',
    gender: 'female',
    birthday: '1992-01-14',
    identityCard: '066092000013',
    departmentId: 58,
    departmentPath: '56/P_TCCB',
    jobTitleId: 46,
    partyTitleId: 46,
    slotOrder: 1,
    username: 'tccb_cv',
  },

  // --- 4. Phòng Bảo vệ chính trị nội bộ (04 Cán bộ công chức) ---
  {
    employeeCode: 'BTCTU_014',
    lastname: 'Công chức',
    firstname: '9',
    fullName: 'Công chức 9',
    email: 'bvctnb_tp@daklak.gov.vn',
    phone: '0913456014',
    gender: 'male',
    birthday: '1979-03-08',
    identityCard: '066079000014',
    departmentId: 59,
    departmentPath: '56/P_BVCTNB',
    jobTitleId: 47,
    partyTitleId: 47,
    slotOrder: 1,
    username: 'bvctnb_tp',
  },
  {
    employeeCode: 'BTCTU_015',
    lastname: 'Công chức',
    firstname: '10',
    fullName: 'Công chức 10',
    email: 'bvctnb_ptp1@daklak.gov.vn',
    phone: '0913456015',
    gender: 'male',
    birthday: '1982-11-25',
    identityCard: '066082000015',
    departmentId: 59,
    departmentPath: '56/P_BVCTNB',
    jobTitleId: 61,
    partyTitleId: 61,
    slotOrder: 1,
    username: 'bvctnb_ptp1',
  },
  {
    employeeCode: 'BTCTU_016',
    lastname: 'Công chức',
    firstname: '11',
    fullName: 'Công chức 11',
    email: 'bvctnb_ptp2@daklak.gov.vn',
    phone: '0913456016',
    gender: 'male',
    birthday: '1984-07-19',
    identityCard: '066084000016',
    departmentId: 59,
    departmentPath: '56/P_BVCTNB',
    jobTitleId: 62,
    partyTitleId: 62,
    slotOrder: 1,
    username: 'bvctnb_ptp2',
  },
  {
    employeeCode: 'BTCTU_017',
    lastname: 'Công chức',
    firstname: '12',
    fullName: 'Công chức 12',
    email: 'bvctnb_cv@daklak.gov.vn',
    phone: '0913456017',
    gender: 'male',
    birthday: '1988-05-03',
    identityCard: '066088000017',
    departmentId: 59,
    departmentPath: '56/P_BVCTNB',
    jobTitleId: 48,
    partyTitleId: 48,
    slotOrder: 1,
    username: 'bvctnb_cv',
  },

  // --- 5. Khối Văn phòng Ban (07 Cán bộ công chức) ---
  {
    employeeCode: 'BTCTU_018',
    lastname: 'Công chức',
    firstname: '13',
    fullName: 'Công chức 13',
    email: 'vp_cvp@daklak.gov.vn',
    phone: '0913456018',
    gender: 'male',
    birthday: '1980-12-12',
    identityCard: '066080000018',
    departmentId: 60,
    departmentPath: '56/VAN_PHONG',
    jobTitleId: 49,
    partyTitleId: 49,
    slotOrder: 1,
    username: 'vp_cvp',
  },
  {
    employeeCode: 'BTCTU_019',
    lastname: 'Công chức',
    firstname: '14',
    fullName: 'Công chức 14',
    email: 'vp_pcvp1@daklak.gov.vn',
    phone: '0913456019',
    gender: 'male',
    birthday: '1983-08-08',
    identityCard: '066083000019',
    departmentId: 60,
    departmentPath: '56/VAN_PHONG',
    jobTitleId: 63,
    partyTitleId: 63,
    slotOrder: 1,
    username: 'vp_pcvp1',
  },
  {
    employeeCode: 'BTCTU_020',
    lastname: 'Công chức',
    firstname: '15',
    fullName: 'Công chức 15',
    email: 'vp_pcvp2@daklak.gov.vn',
    phone: '0913456020',
    gender: 'female',
    birthday: '1985-04-16',
    identityCard: '066085000020',
    departmentId: 60,
    departmentPath: '56/VAN_PHONG',
    jobTitleId: 64,
    partyTitleId: 64,
    slotOrder: 1,
    username: 'vp_pcvp2',
  },
  {
    employeeCode: 'BTCTU_021',
    lastname: 'Công chức',
    firstname: '16',
    fullName: 'Công chức 16',
    email: 'vp_it1@daklak.gov.vn',
    phone: '0913456021',
    gender: 'male',
    birthday: '1991-09-09',
    identityCard: '066091000021',
    departmentId: 60,
    departmentPath: '56/VAN_PHONG',
    jobTitleId: 65,
    partyTitleId: 65,
    slotOrder: 1,
    username: 'vp_it1',
  },
  {
    employeeCode: 'BTCTU_022',
    lastname: 'Công chức',
    firstname: '17',
    fullName: 'Công chức 17',
    email: 'vp_it2@daklak.gov.vn',
    phone: '0913456022',
    gender: 'male',
    birthday: '1993-10-24',
    identityCard: '066093000022',
    departmentId: 60,
    departmentPath: '56/VAN_PHONG',
    jobTitleId: 65,
    partyTitleId: 65,
    slotOrder: 2,
    username: 'vp_it2',
  },
  {
    employeeCode: 'BTCTU_023',
    lastname: 'Công chức',
    firstname: '18',
    fullName: 'Công chức 18',
    email: 'vp_nv@daklak.gov.vn',
    phone: '0913456023',
    gender: 'female',
    birthday: '1994-06-30',
    identityCard: '066094000023',
    departmentId: 60,
    departmentPath: '56/VAN_PHONG',
    jobTitleId: 50,
    partyTitleId: 50,
    slotOrder: 1,
    username: 'vp_nv',
  },
  {
    employeeCode: 'BTCTU_ADMIN',
    lastname: 'Quản trị viên',
    firstname: 'Hệ thống',
    fullName: 'Quản trị viên Hệ thống BTCTU',
    email: 'admin_btc@daklak.gov.vn',
    phone: '0913456000',
    gender: 'male',
    birthday: '1990-01-01',
    identityCard: '066090000000',
    departmentId: 60,
    departmentPath: '56/VAN_PHONG',
    jobTitleId: 65,
    partyTitleId: 65,
    slotOrder: 1,
    username: 'admin_btc',
  },
];

export async function seedBtctuEmployees() {
  console.log('🏛️ Bắt đầu nạp 24 Hồ sơ Nhân sự Ban Tổ chức Tỉnh ủy Đắk Lắk (BTCTU_DAKLAK)...');

  // Lấy ánh xạ users từ admin_systems
  const userRows: any[] = await prisma.$queryRawUnsafe(`
    SELECT id, username, email, employee_code FROM admin_systems.users
  `);
  const userMapByUsername = new Map<string, any>(userRows.map((u: any) => [u.username, u]));
  const userMapByCode = new Map<string, any>(userRows.map((u: any) => [u.employee_code, u]));

  let insertedCount = 0;
  let updatedCount = 0;

  for (const item of btctuEmployeesData) {
    const matchedUser = userMapByUsername.get(item.username) || userMapByCode.get(item.employeeCode);
    const userId = matchedUser ? String(matchedUser.id) : null;

    const existing = await prisma.employee.findUnique({
      where: { employeeCode: item.employeeCode },
    });

    if (existing) {
      await prisma.employee.update({
        where: { employeeCode: item.employeeCode },
        data: {
          userId,
          firstname: item.firstname,
          lastname: item.lastname,
          fullName: item.fullName,
          email: item.email,
          phone: item.phone,
          gender: item.gender,
          birthday: new Date(item.birthday),
          identityCard: item.identityCard,
          departmentId: item.departmentId,
          departmentPath: item.departmentPath,
          jobTitleId: null,
          partyTitleId: item.partyTitleId,
          employmentStatus: 'active',
          isDeleted: false,
        },
      });
      updatedCount++;
    } else {
      await prisma.employee.create({
        data: {
          userId,
          firstname: item.firstname,
          lastname: item.lastname,
          fullName: item.fullName,
          employeeCode: item.employeeCode,
          email: item.email,
          phone: item.phone,
          gender: item.gender,
          birthday: new Date(item.birthday),
          identityCard: item.identityCard,
          departmentId: item.departmentId,
          departmentPath: item.departmentPath,
          jobTitleId: null,
          partyTitleId: item.partyTitleId,
          startDate: new Date('2020-01-01'),
          employmentStatus: 'active',
          organizationId: 'DEFAULT',
          isDeleted: false,
        },
      });
      insertedCount++;
    }

    // Đồng bộ họ tên sang admin_systems.users nếu có tài khoản
    if (matchedUser) {
      await prisma.$executeRawUnsafe(
        `UPDATE admin_systems.users SET full_name = ?, employee_code = ? WHERE id = ?`,
        item.fullName,
        item.employeeCode,
        matchedUser.id,
      );
    }
  }

  console.log(`✅ Đã nạp xong HRM: Thêm mới ${insertedCount}, Cập nhật ${updatedCount} hồ sơ nhân sự.`);

  // Cập nhật slot biên chế gán chính xác mã nhân viên
  console.log('🔗 Đồng bộ slot biên chế (staffing_slots) trong admin_systems...');
  for (const item of btctuEmployeesData) {
    if (item.employeeCode === 'BTCTU_ADMIN') continue; // Quản trị viên không chiếm slot định biên công chức

    // Tìm staffing ID theo unitId và jobTitleId
    const staffingRows: any[] = await prisma.$queryRawUnsafe(
      `SELECT id FROM admin_systems.org_staffing WHERE unit_id = ? AND job_title_id = ?`,
      item.departmentId,
      item.partyTitleId,
    );

    if (staffingRows.length > 0) {
      const staffingId = staffingRows[0].id;
      await prisma.$executeRawUnsafe(
        `UPDATE admin_systems.staffing_slots 
         SET assigned_employee_code = ? 
         WHERE staffing_id = ? AND slot_order = ?`,
        item.employeeCode,
        staffingId,
        item.slotOrder,
      );
    }
  }

  // Cập nhật current_count cho toàn bộ org_staffing của các đơn vị BTCTU
  console.log('📊 Cập nhật current_count cho bảng org_staffing...');
  await prisma.$executeRawUnsafe(`
    UPDATE admin_systems.org_staffing os
    SET current_count = (
      SELECT COUNT(*) 
      FROM admin_systems.staffing_slots ss 
      WHERE ss.staffing_id = os.id 
        AND ss.assigned_employee_code IS NOT NULL 
        AND ss.assigned_employee_code <> ''
    )
    WHERE os.unit_id IN (56, 57, 58, 59, 60)
  `);

  console.log('🎉 Hoàn tất 100% xây dựng hồ sơ nhân sự và định biên cho Ban Tổ chức Tỉnh ủy Đắk Lắk!');
}

if (require.main === module) {
  seedBtctuEmployees()
    .then(() => prisma.$disconnect())
    .catch((e) => {
      console.error('Lỗi seed hồ sơ nhân sự BTCTU:', e);
      prisma.$disconnect();
      process.exit(1);
    });
}
