import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL chưa được đặt. Tạo file .env với DATABASE_URL="mysql://..."');
  process.exit(1);
}

const adapter = new PrismaMariaDb(url);

const prisma = new PrismaClient({ adapter });


/**
 * Seed nhân viên HRM.
 * Lưu ý: departmentId và jobTitleId tham chiếu sang user-service (OrganizationUnit, JobTitle).
 * Chạy seed user-service trước; nếu ID đơn vị/chức danh khác, sửa DEFAULT_UNIT_IDS và DEFAULT_JOB_TITLE_IDS.
 */
const DEFAULT_UNIT_IDS = { root: 1, dept: 2, sub: 3, sub2: 4 };
const DEFAULT_JOB_TITLE_IDS = { giamDoc: 1, chuyenVien: 2, phoGiamDoc: 3, truongPhong: 4 };

const EMPLOYEES = [
  { firstname: 'Nguyễn Văn', lastname: 'A', employeeCode: 'NV001', email: 'nguyenvana@daklak.gov.vn', phone: '0905111222', identityCard: '012345678901', departmentId: DEFAULT_UNIT_IDS.dept, jobTitleId: DEFAULT_JOB_TITLE_IDS.giamDoc },
  { firstname: 'Trần Thị', lastname: 'B', employeeCode: 'NV002', email: 'tranthib@daklak.gov.vn', phone: '0905333444', identityCard: '012345678902', departmentId: DEFAULT_UNIT_IDS.sub, jobTitleId: DEFAULT_JOB_TITLE_IDS.chuyenVien },
  { firstname: 'Lê Văn', lastname: 'C', employeeCode: 'NV003', email: 'levanc@daklak.gov.vn', phone: '0905555666', identityCard: '012345678903', departmentId: DEFAULT_UNIT_IDS.dept, jobTitleId: DEFAULT_JOB_TITLE_IDS.phoGiamDoc },
  { firstname: 'Phạm Thị', lastname: 'D', employeeCode: 'NV004', email: 'phamthid@daklak.gov.vn', phone: '0905777888', identityCard: '012345678904', departmentId: DEFAULT_UNIT_IDS.sub, jobTitleId: DEFAULT_JOB_TITLE_IDS.truongPhong },
  { firstname: 'Hoàng Văn', lastname: 'E', employeeCode: 'NV005', email: 'hoangvane@daklak.gov.vn', phone: '0905999000', identityCard: '012345678905', departmentId: DEFAULT_UNIT_IDS.sub2, jobTitleId: DEFAULT_JOB_TITLE_IDS.truongPhong },
  { firstname: 'Võ Thị', lastname: 'F', employeeCode: 'NV006', email: 'vothif@daklak.gov.vn', phone: '0906123456', identityCard: '012345678906', departmentId: DEFAULT_UNIT_IDS.sub2, jobTitleId: DEFAULT_JOB_TITLE_IDS.chuyenVien },
  { firstname: 'Đặng Văn', lastname: 'G', employeeCode: 'NV007', email: 'dangvang@daklak.gov.vn', phone: '0906245680', identityCard: '012345678907', departmentId: DEFAULT_UNIT_IDS.sub, jobTitleId: DEFAULT_JOB_TITLE_IDS.chuyenVien },
  { firstname: 'Bùi Thị', lastname: 'H', employeeCode: 'NV008', email: 'buithih@daklak.gov.vn', phone: '0906367890', identityCard: '012345678908', departmentId: DEFAULT_UNIT_IDS.dept, jobTitleId: DEFAULT_JOB_TITLE_IDS.chuyenVien },
];

async function main() {
  console.log('🔹 Seed HRM employees...');
  const startDate = new Date('2020-01-01');
  for (const e of EMPLOYEES) {
    await prisma.employee.upsert({
      where: { employeeCode: e.employeeCode },
      update: {
        firstname: e.firstname,
        lastname: e.lastname,
        email: e.email,
        phone: e.phone,
        identityCard: e.identityCard,
        departmentId: e.departmentId,
        jobTitleId: e.jobTitleId,
      },
      create: {
        firstname: e.firstname,
        lastname: e.lastname,
        employeeCode: e.employeeCode,
        email: e.email,
        phone: e.phone,
        identityCard: e.identityCard,
        departmentId: e.departmentId,
        jobTitleId: e.jobTitleId,
        startDate,
        status: 'active',
      },
    });
  }
  console.log(`✅ Đã seed ${EMPLOYEES.length} nhân viên.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
