import 'dotenv/config';
import type { PrismaClient as PrismaClientType } from '@generated/prisma/client';
let PrismaClient: typeof PrismaClientType;
try {
  PrismaClient = require('@generated/prisma/client').PrismaClient;
} catch (e) {
  PrismaClient = require('../generated/prisma/client').PrismaClient;
}
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL chưa được đặt. Tạo file .env với DATABASE_URL="mysql://..."');
  process.exit(1);
}

const adapter = new PrismaMariaDb(url);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🔹 Cleaning old seed data...');
  await prisma.kpiEvaluationDetail.deleteMany({});
  await prisma.kpiEvaluation.deleteMany({});
  await prisma.employeeKpiTarget.deleteMany({});
  await prisma.taskKpiSetting.deleteMany({});
  await prisma.kpiCriteria.deleteMany({});
  await prisma.kpiPeriod.deleteMany({});
  await prisma.rankQuota.deleteMany({});
  await prisma.taskRankTemplate.deleteMany({});
  
  console.log('🔹 Seed HRM employees...');
  const startDate = new Date('2020-01-01');

  // Fetch real units and job titles from the user-service database (admin_systems)
  const units: any[] = await prisma.$queryRaw`SELECT id, code FROM admin_systems.organization_units`;
  const jobTitles: any[] = await prisma.$queryRaw`SELECT id, code FROM admin_systems.job_titles`;
  const categories: any[] = await prisma.$queryRaw`SELECT id, code FROM admin_systems.sys_categories`;

  const unitMap = Object.fromEntries(units.map(u => [u.code, u.id]));
  const jobMap = Object.fromEntries(jobTitles.map(j => [j.code, j.id]));
  const catMap = Object.fromEntries(categories.map(c => [c.code, c.id]));

  if (!unitMap['H15.07'] || !jobMap['GIAM_DOC']) {
    console.log('⚠️ Please run user-service seed first to create OrganizationUnits, JobTitles and Categories!');
    return;
  }

  const EMPLOYEES = [
    // --- Lãnh đạo Sở KHCN ---
    { fullName: 'Bùi Thanh Toàn', firstname: 'Bùi Thanh', lastname: 'Toàn', employeeCode: 'NV_001', email: 'buithanhtoan@daklak.gov.vn', phone: '0901000001', identityCard: '001000001', departmentId: unitMap['H15.07'], jobTitleId: jobMap['GIAM_DOC'], civilServantRankId: catMap['SENIOR_SPECIALIST'], partyTitleId: jobMap['BI_THU_DANG_BO'] },
    { fullName: 'Ra Lan Trương Thanh Hà', firstname: 'Ra Lan Trương', lastname: 'Thanh Hà', employeeCode: 'NV_003', email: 'ralantruongthanhha@daklak.gov.vn', phone: '0901000003', identityCard: '001000003', departmentId: unitMap['H15.07'], jobTitleId: jobMap['PHO_GIAM_DOC'], civilServantRankId: catMap['PRINCIPAL_SPECIALIST'], partyTitleId: jobMap['PHO_BI_THU_DANG_BO'] },
    { fullName: 'Phạm Gia Việt', firstname: 'Phạm Gia', lastname: 'Việt', employeeCode: 'NV_002', email: 'phamgiaviet@daklak.gov.vn', phone: '0901000002', identityCard: '001000002', departmentId: unitMap['H15.07'], jobTitleId: jobMap['PHO_GIAM_DOC'], civilServantRankId: catMap['PRINCIPAL_SPECIALIST'] },
    { fullName: 'Trần Văn Sơn', firstname: 'Trần Văn', lastname: 'Sơn', employeeCode: 'NV_004', email: 'tranvanson@daklak.gov.vn', phone: '0901000004', identityCard: '001000004', departmentId: unitMap['H15.07'], jobTitleId: jobMap['PHO_GIAM_DOC'], civilServantRankId: catMap['PRINCIPAL_SPECIALIST'] },
    { fullName: 'Lâm Vũ Mỹ Hạnh', firstname: 'Lâm Vũ Mỹ', lastname: 'Hạnh', employeeCode: 'NV_005', email: 'lamvumyhanh@daklak.gov.vn', phone: '0901000005', identityCard: '001000005', departmentId: unitMap['H15.07'], jobTitleId: jobMap['PHO_GIAM_DOC'], civilServantRankId: catMap['PRINCIPAL_SPECIALIST'] },

    // --- Lãnh đạo các phòng ban Sở KHCN (Khối Công chức) ---
    { fullName: 'Nguyễn Chiến Thắng', firstname: 'Nguyễn Chiến', lastname: 'Thắng', employeeCode: 'NV_020', email: 'nguyenvana@daklak.gov.vn', phone: '0902000020', identityCard: '002000020', departmentId: unitMap['H15.07.05'], jobTitleId: jobMap['CHANH_VAN_PHONG'], civilServantRankId: catMap['PRINCIPAL_SPECIALIST'], partyTitleId: jobMap['DANG_UY_VIEN'] },
    { fullName: 'Lê Thị B', firstname: 'Lê Thị', lastname: 'B', employeeCode: 'NV_021', email: 'lethib@daklak.gov.vn', phone: '0902000021', identityCard: '002000021', departmentId: unitMap['H15.07.07'], jobTitleId: jobMap['TRUONG_PHONG'], civilServantRankId: catMap['PRINCIPAL_SPECIALIST'] },
    { fullName: 'Trần Văn C', firstname: 'Trần Văn', lastname: 'C', employeeCode: 'NV_022', email: 'tranvanc@daklak.gov.vn', phone: '0902000022', identityCard: '002000022', departmentId: unitMap['H15.07.08'], jobTitleId: jobMap['TRUONG_PHONG'], civilServantRankId: catMap['PRINCIPAL_SPECIALIST'] },
    { fullName: 'Phạm Thị D', firstname: 'Phạm Thị', lastname: 'D', employeeCode: 'NV_023', email: 'phamthid@daklak.gov.vn', phone: '0902000023', identityCard: '002000023', departmentId: unitMap['H15.07.09'], jobTitleId: jobMap['TRUONG_PHONG'], civilServantRankId: catMap['PRINCIPAL_SPECIALIST'] },
    { fullName: 'Hoàng Văn E', firstname: 'Hoàng Văn', lastname: 'E', employeeCode: 'NV_024', email: 'hoangvane@daklak.gov.vn', phone: '0902000024', identityCard: '002000024', departmentId: unitMap['H15.07.10'], jobTitleId: jobMap['TRUONG_PHONG'], civilServantRankId: catMap['PRINCIPAL_SPECIALIST'] },
    { fullName: 'Vũ Thị F', firstname: 'Vũ Thị', lastname: 'F', employeeCode: 'NV_025', email: 'vuthif@daklak.gov.vn', phone: '0902000025', identityCard: '002000025', departmentId: unitMap['H15.07.11'], jobTitleId: jobMap['TRUONG_PHONG'], civilServantRankId: catMap['PRINCIPAL_SPECIALIST'] },

    // Phó Trưởng phòng Sở KHCN
    { fullName: 'Trương Văn Phó 1', firstname: 'Trương Văn', lastname: 'Phó 1', employeeCode: 'NV_036', email: 'phochvp_khcn@daklak.gov.vn', phone: '0902000036', identityCard: '002000036', departmentId: unitMap['H15.07.05'], jobTitleId: jobMap['PHO_CHANH_VAN_PHONG'], civilServantRankId: catMap['SPECIALIST'] },
    { fullName: 'Ngô Thị Phó 2', firstname: 'Ngô Thị', lastname: 'Phó 2', employeeCode: 'NV_037', email: 'photp_khtc_khcn@daklak.gov.vn', phone: '0902000037', identityCard: '002000037', departmentId: unitMap['H15.07.07'], jobTitleId: jobMap['PHO_PHONG'], civilServantRankId: catMap['SPECIALIST'] },

    // --- Lãnh đạo các Trung tâm khác thuộc Sở KHCN (Khối Viên chức) ---
    { fullName: 'Đỗ Văn G', firstname: 'Đỗ Văn', lastname: 'G', employeeCode: 'NV_026', email: 'dovang@daklak.gov.vn', phone: '0902000026', identityCard: '002000026', departmentId: unitMap['H15.07.01'], jobTitleId: jobMap['GIAM_DOC'], civilServantRankId: catMap['GRADE_2'] },
    { fullName: 'Lý Văn I', firstname: 'Lý Văn', lastname: 'I', employeeCode: 'NV_028', email: 'lyvani@daklak.gov.vn', phone: '0902000028', identityCard: '002000028', departmentId: unitMap['H15.07.02'], jobTitleId: jobMap['GIAM_DOC'], civilServantRankId: catMap['GRADE_2'] },

    // Lãnh đạo các phòng thuộc các Trung tâm khác
    { fullName: 'Hoàng Văn HC', firstname: 'Hoàng Văn', lastname: 'HC', employeeCode: 'NV_029', email: 'truongphonghc_dmsm@daklak.gov.vn', phone: '0902000029', identityCard: '002000029', departmentId: unitMap['H15.07.01.01'], jobTitleId: jobMap['TRUONG_PHONG'], civilServantRankId: catMap['GRADE_3'] },
    { fullName: 'Lê Thị UT', firstname: 'Lê Thị', lastname: 'UT', employeeCode: 'NV_030', email: 'truongphongut_dmsm@daklak.gov.vn', phone: '0902000030', identityCard: '002000030', departmentId: unitMap['H15.07.01.02'], jobTitleId: jobMap['TRUONG_PHONG'], civilServantRankId: catMap['GRADE_3'] },
    { fullName: 'Nguyễn Văn HC', firstname: 'Nguyễn Văn', lastname: 'HC', employeeCode: 'NV_033', email: 'truongphonghc_kttdc@daklak.gov.vn', phone: '0902000033', identityCard: '002000033', departmentId: unitMap['H15.07.02.01'], jobTitleId: jobMap['TRUONG_PHONG'], civilServantRankId: catMap['GRADE_3'] },
    { fullName: 'Đinh Thị DL', firstname: 'Đinh Thị', lastname: 'DL', employeeCode: 'NV_034', email: 'truongphongdl_kttdc@daklak.gov.vn', phone: '0902000034', identityCard: '002000034', departmentId: unitMap['H15.07.02.02'], jobTitleId: jobMap['TRUONG_PHONG'], civilServantRankId: catMap['GRADE_3'] },
    { fullName: 'Vũ Văn TN', firstname: 'Vũ Văn', lastname: 'TN', employeeCode: 'NV_035', email: 'truongphongtn_kttdc@daklak.gov.vn', phone: '0902000035', identityCard: '002000035', departmentId: unitMap['H15.07.02.03'], jobTitleId: jobMap['TRUONG_PHONG'], civilServantRankId: catMap['GRADE_3'] },

    // --- Cán bộ, nhân viên Trung tâm Giám sát, Điều hành Đô thị thông minh (IOC) ---
    { fullName: 'Võ Nguyễn Hoàng Nam', firstname: 'Võ Nguyễn Hoàng', lastname: 'Nam', employeeCode: 'NV_100', email: 'vonguyenhoangnam@daklak.gov.vn', phone: '0903000100', identityCard: '003000100', departmentId: unitMap['H15.07.04'], jobTitleId: jobMap['GIAM_DOC'], civilServantRankId: catMap['GRADE_2'] },
    { fullName: 'Lê Xuân Quang', firstname: 'Lê Xuân', lastname: 'Quang', employeeCode: 'NV_101', email: 'lexuanquang@daklak.gov.vn', phone: '0903000101', identityCard: '003000101', departmentId: unitMap['H15.07.04'], jobTitleId: jobMap['PHO_GIAM_DOC'], civilServantRankId: catMap['GRADE_2'] },
    { fullName: 'Trần Duy Tân', firstname: 'Trần Duy', lastname: 'Tân', employeeCode: 'NV_102', email: 'tranduytan@daklak.gov.vn', phone: '0903000102', identityCard: '003000102', departmentId: unitMap['H15.07.04'], jobTitleId: jobMap['PHO_GIAM_DOC'], civilServantRankId: catMap['GRADE_2'] },
    { fullName: 'Lê Anh Tuấn', firstname: 'Lê Anh', lastname: 'Tuấn', employeeCode: 'NV_103', email: 'leanhtuan@daklak.gov.vn', phone: '0903000103', identityCard: '003000103', departmentId: unitMap['H15.07.04.01'], jobTitleId: jobMap['TRUONG_PHONG'], civilServantRankId: catMap['GRADE_3'] },
    { fullName: 'Lê Quang Thanh', firstname: 'Lê Quang', lastname: 'Thanh', employeeCode: 'NV_104', email: 'lequangthanh@daklak.gov.vn', phone: '0903000104', identityCard: '003000104', departmentId: unitMap['H15.07.04.03'], jobTitleId: jobMap['TRUONG_PHONG'], civilServantRankId: catMap['GRADE_3'] },
    { fullName: 'Lê Trọng Vũ', firstname: 'Lê Trọng', lastname: 'Vũ', employeeCode: 'NV_105', email: 'letrongvu@daklak.gov.vn', phone: '0903000105', identityCard: '003000105', departmentId: unitMap['H15.07.04.02'], jobTitleId: jobMap['TRUONG_PHONG'], civilServantRankId: catMap['GRADE_3'] },
    { fullName: 'Châu Trọng Phát', firstname: 'Châu Trọng', lastname: 'Phát', employeeCode: 'NV_106', email: 'chautrongphat@daklak.gov.vn', phone: '0903000106', identityCard: '003000106', departmentId: unitMap['H15.07.04.01'], jobTitleId: jobMap['KE_TOAN'], civilServantRankId: catMap['GRADE_3'] },
    { fullName: 'Nguyễn Thị Kim Oanh', firstname: 'Nguyễn Thị Kim', lastname: 'Oanh', employeeCode: 'NV_107', email: 'nguyenthikimoanh@daklak.gov.vn', phone: '0903000107', identityCard: '003000107', departmentId: unitMap['H15.07.04.01'], jobTitleId: jobMap['VIEN_CHUC'], civilServantRankId: catMap['GRADE_3'] },
    { fullName: 'Võ Thị Hiền', firstname: 'Võ Thị', lastname: 'Hiền', employeeCode: 'NV_108', email: 'vothihien@daklak.gov.vn', phone: '0903000108', identityCard: '003000108', departmentId: unitMap['H15.07.04.01'], jobTitleId: jobMap['VAN_THU'], civilServantRankId: catMap['GRADE_3'] },
    { fullName: 'Phạm Thế Anh', firstname: 'Phạm Thế', lastname: 'Anh', employeeCode: 'NV_109', email: 'phamtheanh@daklak.gov.vn', phone: '0903000109', identityCard: '003000109', departmentId: unitMap['H15.07.04.03'], jobTitleId: jobMap['VIEN_CHUC'], civilServantRankId: catMap['GRADE_3'] },
    { fullName: 'Phan Đăng Việt Vinh Chuẩn', firstname: 'Phan Đăng Việt Vinh', lastname: 'Chuẩn', employeeCode: 'NV_110', email: 'phandangvietvinhchuan@daklak.gov.vn', phone: '0903000110', identityCard: '003000110', departmentId: unitMap['H15.07.04.03'], jobTitleId: jobMap['VIEN_CHUC'], civilServantRankId: catMap['GRADE_3'] },
    { fullName: 'Nguyễn Minh Hóa', firstname: 'Nguyễn Minh', lastname: 'Hóa', employeeCode: 'NV_111', email: 'nguyenminhhoa@daklak.gov.vn', phone: '0903000111', identityCard: '003000111', departmentId: unitMap['H15.07.04.02'], jobTitleId: jobMap['VIEN_CHUC'], civilServantRankId: catMap['GRADE_3'] },
    { fullName: 'Châu Hòa Khánh Tâm', firstname: 'Châu Hòa Khánh', lastname: 'Tâm', employeeCode: 'NV_112', email: 'chauhoakhanhtam@daklak.gov.vn', phone: '0903000112', identityCard: '003000112', departmentId: unitMap['H15.07.04.02'], jobTitleId: jobMap['VIEN_CHUC'], civilServantRankId: catMap['GRADE_3'] },
    { fullName: 'Lê Thị Thanh Kiều', firstname: 'Lê Thị Thanh', lastname: 'Kiều', employeeCode: 'NV_113', email: 'lethithanhkieu@daklak.gov.vn', phone: '0903000113', identityCard: '003000113', departmentId: unitMap['H15.07.04.02'], jobTitleId: jobMap['VIEN_CHUC'], civilServantRankId: catMap['GRADE_3'] },
    { fullName: 'Nguyễn Kiều Trang', firstname: 'Nguyễn Kiều', lastname: 'Trang', employeeCode: 'NV_114', email: 'nguyenkieutrang@daklak.gov.vn', phone: '0903000114', identityCard: '003000114', departmentId: unitMap['H15.07.04.01'], jobTitleId: jobMap['NHAN_VIEN'], civilServantRankId: catMap['GRADE_4'] },
    { fullName: 'H Lisa Byă', firstname: 'H Lisa', lastname: 'Byă', employeeCode: 'NV_115', email: 'hlisabya@daklak.gov.vn', phone: '0903000115', identityCard: '003000115', departmentId: unitMap['H15.07.04.01'], jobTitleId: jobMap['NHAN_VIEN'], civilServantRankId: catMap['GRADE_4'] },
    { fullName: 'Nguyễn Thị Diễm Quyên', firstname: 'Nguyễn Thị Diễm', lastname: 'Quyên', employeeCode: 'NV_116', email: 'nguyenthidiemquyen@daklak.gov.vn', phone: '0903000116', identityCard: '003000116', departmentId: unitMap['H15.07.04.01'], jobTitleId: jobMap['NHAN_VIEN'], civilServantRankId: catMap['GRADE_4'] },
    { fullName: 'Y Sơm Ê Nuôl', firstname: 'Y Sơm', lastname: 'Ê Nuôl', employeeCode: 'NV_117', email: 'ysomenuol@daklak.gov.vn', phone: '0903000117', identityCard: '003000117', departmentId: unitMap['H15.07.04.03'], jobTitleId: jobMap['NHAN_VIEN'], civilServantRankId: catMap['GRADE_4'] },
    { fullName: 'Nguyễn Vũ Huy', firstname: 'Nguyễn Vũ', lastname: 'Huy', employeeCode: 'NV_118', email: 'nguyenvuhuy@daklak.gov.vn', phone: '0903000118', identityCard: '003000118', departmentId: unitMap['H15.07.04.03'], jobTitleId: jobMap['NHAN_VIEN'], civilServantRankId: catMap['GRADE_4'] },
    { fullName: 'Phùng Đình Hưng', firstname: 'Phùng Đình', lastname: 'Hưng', employeeCode: 'NV_119', email: 'phungdinhhung@daklak.gov.vn', phone: '0903000119', identityCard: '003000119', departmentId: unitMap['H15.07.04.03'], jobTitleId: jobMap['NHAN_VIEN'], civilServantRankId: catMap['GRADE_4'] },
    { fullName: 'Kiều Vũ Adrơng', firstname: 'Kiều Vũ', lastname: 'Adrơng', employeeCode: 'NV_120', email: 'kieuvuadrong@daklak.gov.vn', phone: '0903000120', identityCard: '003000120', departmentId: unitMap['H15.07.04.03'], jobTitleId: jobMap['NHAN_VIEN'], civilServantRankId: catMap['GRADE_4'] },
    { fullName: 'Nguyễn Thị Quỳnh Mai', firstname: 'Nguyễn Thị Quỳnh', lastname: 'Mai', employeeCode: 'NV_121', email: 'nguyenthiquynhmai@daklak.gov.vn', phone: '0903000121', identityCard: '003000121', departmentId: unitMap['H15.07.04.02'], jobTitleId: jobMap['NHAN_VIEN'], civilServantRankId: catMap['GRADE_4'] },
    { fullName: 'Nguyễn Quang Tú', firstname: 'Nguyễn Quang', lastname: 'Tú', employeeCode: 'NV_122', email: 'nguyenquangtu@daklak.gov.vn', phone: '0903000122', identityCard: '003000122', departmentId: unitMap['H15.07.04.02'], jobTitleId: jobMap['NHAN_VIEN'], civilServantRankId: catMap['GRADE_4'] },
    { fullName: 'Trần Trung Thành', firstname: 'Trần Trung', lastname: 'Thành', employeeCode: 'NV_123', email: 'trantrungthanh@daklak.gov.vn', phone: '0903000123', identityCard: '003000123', departmentId: unitMap['H15.07.04.02'], jobTitleId: jobMap['NHAN_VIEN'], civilServantRankId: catMap['GRADE_4'] },
    { fullName: 'Nguyễn Sỹ Hợp', firstname: 'Nguyễn Sỹ', lastname: 'Hợp', employeeCode: 'NV_124', email: 'nguyensyhop@daklak.gov.vn', phone: '0903000124', identityCard: '003000124', departmentId: unitMap['H15.07.04.01'], jobTitleId: jobMap['BAO_VE'], civilServantRankId: catMap['GRADE_4'] },
    { fullName: 'Nguyễn Tiến Quang', firstname: 'Nguyễn Tiến', lastname: 'Quang', employeeCode: 'NV_125', email: 'nguyentienquang@daklak.gov.vn', phone: '0903000125', identityCard: '003000125', departmentId: unitMap['H15.07.04.01'], jobTitleId: jobMap['BAO_VE'], civilServantRankId: catMap['GRADE_4'] },

    // --- Lãnh đạo các Sở khác (Khối Công chức cấp Tỉnh) ---
    { fullName: 'Trương Ngọc Tuấn', firstname: 'Trương Ngọc', lastname: 'Tuấn', employeeCode: 'NV_010', email: 'truongngoctuan@daklak.gov.vn', phone: '0901000010', identityCard: '001000010', departmentId: unitMap['H15.13'], jobTitleId: jobMap['GIAM_DOC'], civilServantRankId: catMap['SENIOR_SPECIALIST'] },
    { fullName: 'Trần Văn Tân', firstname: 'Trần Văn', lastname: 'Tân', employeeCode: 'NV_011', email: 'tranvantan@daklak.gov.vn', phone: '0901000011', identityCard: '001000011', departmentId: unitMap['H15.11'], jobTitleId: jobMap['GIAM_DOC'], civilServantRankId: catMap['SENIOR_SPECIALIST'] },
    { fullName: 'Cao Đình Huy', firstname: 'Cao Đình', lastname: 'Huy', employeeCode: 'NV_012', email: 'caodinhhuy@daklak.gov.vn', phone: '0901000012', identityCard: '001000012', departmentId: unitMap['H15.14'], jobTitleId: jobMap['GIAM_DOC'], civilServantRankId: catMap['SENIOR_SPECIALIST'] }
  ];

  let count = 0;
  for (const e of EMPLOYEES) {
    if (!e.departmentId || !e.jobTitleId) {
      console.log(`Skipping ${e.employeeCode}: departmentId=${!!e.departmentId}, jobTitleId=${!!e.jobTitleId}`);
      continue;
    }
    count++;
    await prisma.employee.upsert({
      where: { employeeCode: e.employeeCode },
      update: {
        firstname: e.firstname,
        lastname: e.lastname,
        fullName: e.fullName,
        email: e.email,
        phone: e.phone,
        identityCard: e.identityCard,
        departmentId: e.departmentId,
        jobTitleId: e.jobTitleId,
        civilServantRankId: (e as any).civilServantRankId || null,
        partyTitleId: (e as any).partyTitleId || null,
      },
      create: {
        firstname: e.firstname,
        lastname: e.lastname,
        fullName: e.fullName,
        employeeCode: e.employeeCode,
        email: e.email,
        phone: e.phone,
        identityCard: e.identityCard,
        departmentId: e.departmentId,
        jobTitleId: e.jobTitleId,
        civilServantRankId: (e as any).civilServantRankId || null,
        partyTitleId: (e as any).partyTitleId || null,
        startDate,
      },
    });
  }
  console.log(`✅ Đã seed ${count} nhân viên HRM trên tổng số ${EMPLOYEES.length}.`);

  // Đồng bộ user_id từ admin_systems.users sang admin_hrm.employees
  try {
    console.log('🔹 Đồng bộ user_id từ admin_systems.users sang admin_hrm.employees...');
    await prisma.$executeRawUnsafe(`
      UPDATE admin_hrm.employees e
      JOIN admin_systems.users u ON e.email = u.email
      SET e.user_id = u.id, e.updated_at = NOW();
    `);
    console.log('✅ Đã đồng bộ user_id thành công.');
  } catch (error) {
    console.error('❌ Lỗi khi đồng bộ user_id:', error);
  }

  // Đồng bộ vị trí định biên từ HRM sang StaffingSlot của hệ thống (admin_systems)
  try {
    console.log('🔹 Gán mã nhân viên vào Vị trí định biên (admin_systems.staffing_slots)...');
    
    // Xóa tất cả gán cũ trước khi gán mới từ HRM
    // Chỉ xóa những slot mà mã nhân viên thuộc danh sách được seed trong HRM
    await prisma.$executeRawUnsafe(`
      UPDATE admin_systems.staffing_slots
      SET assigned_employee_code = NULL
      WHERE assigned_employee_code IS NOT NULL;
    `);

    for (const e of EMPLOYEES) {
      if (e.departmentId && e.jobTitleId && e.employeeCode) {
        // Tìm staffing tương ứng
        const staffing: any[] = await prisma.$queryRaw`
          SELECT id FROM admin_systems.org_staffing 
          WHERE unit_id = ${e.departmentId} AND job_title_id = ${e.jobTitleId} LIMIT 1
        `;

        if (staffing.length > 0) {
          const staffingId = staffing[0].id;
          
          // Tìm slot trống đầu tiên
          const emptySlot: any[] = await prisma.$queryRaw`
            SELECT id FROM admin_systems.staffing_slots 
            WHERE staffing_id = ${staffingId} AND assigned_employee_code IS NULL 
            ORDER BY slot_order ASC LIMIT 1
          `;
          
          if (emptySlot.length > 0) {
            await prisma.$executeRawUnsafe(`
              UPDATE admin_systems.staffing_slots 
              SET assigned_employee_code = '${e.employeeCode}',
                  description = 'Phụ trách bởi ${e.fullName}'
              WHERE id = ${emptySlot[0].id}
            `);
          } else {
            // Tự động tạo slot mới nếu thiếu
            const lastSlot: any[] = await prisma.$queryRaw`
              SELECT slot_order FROM admin_systems.staffing_slots
              WHERE staffing_id = ${staffingId}
              ORDER BY slot_order DESC LIMIT 1
            `;
            const nextSlotOrder = lastSlot.length > 0 ? lastSlot[0].slot_order + 1 : 1;
            
            await prisma.$executeRawUnsafe(`
              INSERT INTO admin_systems.staffing_slots (staffing_id, slot_order, description, assigned_employee_code)
              VALUES (${staffingId}, ${nextSlotOrder}, 'Phụ trách bởi ${e.fullName}', '${e.employeeCode}')
            `);
          }
        } else {
          // Tự động tạo staffing và slot nếu chưa có
          await prisma.$executeRawUnsafe(`
            INSERT INTO admin_systems.org_staffing (unit_id, job_title_id, quantity, created_at, updated_at)
            VALUES (${e.departmentId}, ${e.jobTitleId}, 1, NOW(), NOW())
          `);
          
          const newStaffing: any[] = await prisma.$queryRaw`
            SELECT id FROM admin_systems.org_staffing 
            WHERE unit_id = ${e.departmentId} AND job_title_id = ${e.jobTitleId} LIMIT 1
          `;
          
          if (newStaffing.length > 0) {
            await prisma.$executeRawUnsafe(`
              INSERT INTO admin_systems.staffing_slots (staffing_id, slot_order, description, assigned_employee_code)
              VALUES (${newStaffing[0].id}, 1, 'Phụ trách bởi ${e.fullName}', '${e.employeeCode}')
            `);
          }
        }
      }
    }
    console.log('✅ Đã gán nhân sự vào vị trí định biên thành công.');
  } catch (error) {
    console.error('❌ Lỗi khi gán vị trí định biên:', error);
  }

  console.log('🔹 Seed TaskRankTemplates theo Nghị định 335/2025/NĐ-CP...');

  await prisma.taskRankTemplate.deleteMany();

  const RANK_TEMPLATES = [
    // KHỐI CÔNG CHỨC
    // 1. Ngạch Chuyên viên cao cấp (SENIOR_SPECIALIST)
    { classification: 'CONG_CHUC', rank: 'SENIOR_SPECIALIST', rankNameVN: 'Chuyên viên cao cấp', taskName: 'Chủ trì nghiên cứu, xây dựng Nghị quyết, Quyết định quy phạm pháp luật', defaultUnit: 'Văn bản QPPL', defaultWeight: 30, target: 5 },
    { classification: 'CONG_CHUC', rank: 'SENIOR_SPECIALIST', rankNameVN: 'Chuyên viên cao cấp', taskName: 'Chủ trì thẩm định quy hoạch ngành, đề án phát triển kinh tế - xã hội', defaultUnit: 'Đề án/Quy hoạch', defaultWeight: 25, target: 3 },
    { classification: 'CONG_CHUC', rank: 'SENIOR_SPECIALIST', rankNameVN: 'Chuyên viên cao cấp', taskName: 'Chủ trì các chương trình đàm phán, thỏa thuận hợp tác liên ngành', defaultUnit: 'Chương trình', defaultWeight: 20, target: 2 },
    { classification: 'CONG_CHUC', rank: 'SENIOR_SPECIALIST', rankNameVN: 'Chuyên viên cao cấp', taskName: 'Tham mưu chiến lược, báo cáo chuyên đề cấp Tỉnh/Bộ', defaultUnit: 'Báo cáo', defaultWeight: 25, target: 10 },

    // 2. Ngạch Chuyên viên chính (PRINCIPAL_SPECIALIST)
    { classification: 'CONG_CHUC', rank: 'PRINCIPAL_SPECIALIST', rankNameVN: 'Chuyên viên chính', taskName: 'Chủ trì thẩm định hồ sơ chuyên ngành, đề án kỹ thuật công nghệ', defaultUnit: 'Hồ sơ', defaultWeight: 20, target: 15 },
    { classification: 'CONG_CHUC', rank: 'PRINCIPAL_SPECIALIST', rankNameVN: 'Chuyên viên chính', taskName: 'Chủ trì biên soạn tài liệu, văn bản hướng dẫn nghiệp vụ', defaultUnit: 'Văn bản', defaultWeight: 20, target: 10 },
    { classification: 'CONG_CHUC', rank: 'PRINCIPAL_SPECIALIST', rankNameVN: 'Chuyên viên chính', taskName: 'Tham mưu giải quyết khiếu nại, tố cáo phức tạp', defaultUnit: 'Vụ việc', defaultWeight: 15, target: 5 },
    { classification: 'CONG_CHUC', rank: 'PRINCIPAL_SPECIALIST', rankNameVN: 'Chuyên viên chính', taskName: 'Tham mưu tổng hợp, xây dựng kế hoạch công tác năm, báo cáo định kỳ', defaultUnit: 'Báo cáo/Kế hoạch', defaultWeight: 15, target: 12 },
    { classification: 'CONG_CHUC', rank: 'PRINCIPAL_SPECIALIST', rankNameVN: 'Chuyên viên chính', taskName: 'Thẩm định độc lập các văn bản do Chuyên viên dự thảo', defaultUnit: 'Văn bản', defaultWeight: 15, target: 30 },
    { classification: 'CONG_CHUC', rank: 'PRINCIPAL_SPECIALIST', rankNameVN: 'Chuyên viên chính', taskName: 'Tham gia hội đồng chuyên môn, đoàn thanh tra/kiểm tra', defaultUnit: 'Lượt tham gia', defaultWeight: 15, target: 8 },

    // 3. Ngạch Chuyên viên (SPECIALIST)
    { classification: 'CONG_CHUC', rank: 'SPECIALIST', rankNameVN: 'Chuyên viên', taskName: 'Chủ trì xử lý các hồ sơ thủ tục hành chính, dịch vụ công trực tuyến', defaultUnit: 'Hồ sơ', defaultWeight: 20, target: 50 },
    { classification: 'CONG_CHUC', rank: 'SPECIALIST', rankNameVN: 'Chuyên viên', taskName: 'Tham mưu soạn thảo tờ trình, công văn, quyết định cá biệt', defaultUnit: 'Văn bản', defaultWeight: 25, target: 30 },
    { classification: 'CONG_CHUC', rank: 'SPECIALIST', rankNameVN: 'Chuyên viên', taskName: 'Tổng hợp số liệu, lập báo cáo chuyên đề, báo cáo tháng/quý', defaultUnit: 'Báo cáo', defaultWeight: 20, target: 12 },
    { classification: 'CONG_CHUC', rank: 'SPECIALIST', rankNameVN: 'Chuyên viên', taskName: 'Nghiên cứu, thu thập tài liệu phục vụ đề án/dự án', defaultUnit: 'Bộ tài liệu', defaultWeight: 10, target: 5 },
    { classification: 'CONG_CHUC', rank: 'SPECIALIST', rankNameVN: 'Chuyên viên', taskName: 'Tham gia các tổ công tác, hội đồng chuyên môn, đoàn khảo sát thực tế', defaultUnit: 'Lượt tham gia', defaultWeight: 15, target: 10 },
    { classification: 'CONG_CHUC', rank: 'SPECIALIST', rankNameVN: 'Chuyên viên', taskName: 'Giải đáp thắc mắc, hướng dẫn người dân/doanh nghiệp qua tổng đài/email', defaultUnit: 'Phiếu hỗ trợ (Ticket)', defaultWeight: 10, target: 100 },

    // 4. Ngạch Cán sự (OFFICER)
    { classification: 'CONG_CHUC', rank: 'OFFICER', rankNameVN: 'Cán sự', taskName: 'Thu thập, cập nhật và chuẩn hóa dữ liệu vào các hệ thống thông tin', defaultUnit: 'Bản ghi/Bộ dữ liệu', defaultWeight: 30, target: 500 },
    { classification: 'CONG_CHUC', rank: 'OFFICER', rankNameVN: 'Cán sự', taskName: 'Kiểm tra tính hợp lệ, đầy đủ của hồ sơ đầu vào', defaultUnit: 'Hồ sơ', defaultWeight: 30, target: 100 },
    { classification: 'CONG_CHUC', rank: 'OFFICER', rankNameVN: 'Cán sự', taskName: 'Soạn thảo văn bản hành chính thông thường (giấy mời, thông báo)', defaultUnit: 'Văn bản', defaultWeight: 20, target: 40 },
    { classification: 'CONG_CHUC', rank: 'OFFICER', rankNameVN: 'Cán sự', taskName: 'Sắp xếp, chuẩn bị tài liệu cho các cuộc họp', defaultUnit: 'Lượt', defaultWeight: 20, target: 20 },

    // 5. Ngạch Nhân viên (STAFF)
    { classification: 'CONG_CHUC', rank: 'STAFF', rankNameVN: 'Nhân viên', taskName: 'Thực hiện công tác văn thư, tiếp nhận, luân chuyển văn bản đi/đến', defaultUnit: 'Lượt', defaultWeight: 40, target: 1000 },
    { classification: 'CONG_CHUC', rank: 'STAFF', rankNameVN: 'Nhân viên', taskName: 'Quản trị cơ sở vật chất, bảo trì trang thiết bị văn phòng', defaultUnit: 'Lượt', defaultWeight: 30, target: 50 },
    { classification: 'CONG_CHUC', rank: 'STAFF', rankNameVN: 'Nhân viên', taskName: 'Thực hiện công tác lễ tân, khánh tiết, phục vụ hội nghị', defaultUnit: 'Lượt', defaultWeight: 30, target: 30 },


    // ==========================================
    // KHỐI VIÊN CHỨC - ĐƠN VỊ SỰ NGHIỆP CÔNG LẬP (KHCN, CNTT, Y TẾ, GIÁO DỤC...)
    // Căn cứ pháp lý: Nghị định 115/2020/NĐ-CP & Nghị định 85/2023/NĐ-CP
    // Phân loại: Dữ liệu khung (Generic Data). Các đơn vị sẽ tự thêm nhiệm vụ chi tiết thông qua UI.
    
    // 1. Chức danh nghề nghiệp CHUYÊN NGÀNH
    { classification: 'VIEN_CHUC', rank: 'VC_CN_HANG_1', rankNameVN: 'Viên chức Chuyên ngành Hạng I', taskName: 'Chủ trì đề tài/dự án cấp Bộ, Tỉnh', defaultUnit: 'Đề tài', defaultWeight: 30, target: 1 },
    { classification: 'VIEN_CHUC', rank: 'VC_CN_HANG_1', rankNameVN: 'Viên chức Chuyên ngành Hạng I', taskName: 'Nghiên cứu, đề xuất chiến lược phát triển chuyên ngành', defaultUnit: 'Chiến lược', defaultWeight: 20, target: 2 },
    { classification: 'VIEN_CHUC', rank: 'VC_CN_HANG_1', rankNameVN: 'Viên chức Chuyên ngành Hạng I', taskName: 'Thẩm định các giải pháp, quy hoạch chuyên môn cấp cao', defaultUnit: 'Bản thẩm định', defaultWeight: 25, target: 5 },

    { classification: 'VIEN_CHUC', rank: 'VC_CN_HANG_2', rankNameVN: 'Viên chức Chuyên ngành Hạng II', taskName: 'Chủ trì thực hiện nhiệm vụ chuyên môn cấp cơ sở', defaultUnit: 'Nhiệm vụ', defaultWeight: 30, target: 10 },
    { classification: 'VIEN_CHUC', rank: 'VC_CN_HANG_2', rankNameVN: 'Viên chức Chuyên ngành Hạng II', taskName: 'Hướng dẫn, đào tạo, chuyển giao nghiệp vụ cho tuyến dưới', defaultUnit: 'Khóa/Lượt', defaultWeight: 20, target: 4 },
    { classification: 'VIEN_CHUC', rank: 'VC_CN_HANG_2', rankNameVN: 'Viên chức Chuyên ngành Hạng II', taskName: 'Xây dựng quy trình, tài liệu hướng dẫn chuyên môn', defaultUnit: 'Tài liệu', defaultWeight: 20, target: 3 },
    { classification: 'VIEN_CHUC', rank: 'VC_CN_HANG_2', domainCode: 'IOC', rankNameVN: 'Viên chức Chuyên ngành Hạng II (IOC)', taskName: 'Nghiên cứu, thiết kế mô hình dự báo, phân tích dữ liệu lớn (Big Data)', defaultUnit: 'Mô hình/Chuyên đề', defaultWeight: 25, target: 2 },
    { classification: 'VIEN_CHUC', rank: 'VC_CN_HANG_2', domainCode: 'IOC', rankNameVN: 'Viên chức Chuyên ngành Hạng II (IOC)', taskName: 'Thiết kế, tích hợp các hệ thống thông tin, cơ sở dữ liệu liên ngành', defaultUnit: 'Hệ thống', defaultWeight: 25, target: 2 },

    { classification: 'VIEN_CHUC', rank: 'VC_CN_HANG_3', rankNameVN: 'Viên chức Chuyên ngành Hạng III', taskName: 'Thực hiện nhiệm vụ chuyên môn cốt lõi theo Bản mô tả Vị trí việc làm', defaultUnit: 'Hạng mục/Khối lượng', defaultWeight: 30, target: 100 },
    { classification: 'VIEN_CHUC', rank: 'VC_CN_HANG_3', rankNameVN: 'Viên chức Chuyên ngành Hạng III', taskName: 'Tham gia nghiên cứu, đóng góp ý kiến xây dựng quy trình chuyên môn', defaultUnit: 'Ý kiến', defaultWeight: 10, target: 5 },
    { classification: 'VIEN_CHUC', rank: 'VC_CN_HANG_3', rankNameVN: 'Viên chức Chuyên ngành Hạng III', taskName: 'Lập báo cáo kết quả thực hiện nhiệm vụ chuyên môn định kỳ', defaultUnit: 'Báo cáo', defaultWeight: 10, target: 12 },
    { classification: 'VIEN_CHUC', rank: 'VC_CN_HANG_3', domainCode: 'IOC', rankNameVN: 'Viên chức Chuyên ngành Hạng III (IOC)', taskName: 'Trực vận hành, giám sát các nền tảng số tại Trung tâm IOC', defaultUnit: 'Ca trực', defaultWeight: 20, target: 20 },
    { classification: 'VIEN_CHUC', rank: 'VC_CN_HANG_3', domainCode: 'IOC', rankNameVN: 'Viên chức Chuyên ngành Hạng III (IOC)', taskName: 'Tiếp nhận, phân loại, điều phối phản ánh kiến nghị (PAKN)', defaultUnit: 'Hồ sơ', defaultWeight: 20, target: 100 },
    { classification: 'VIEN_CHUC', rank: 'VC_CN_HANG_3', domainCode: 'IOC', rankNameVN: 'Viên chức Chuyên ngành Hạng III (IOC)', taskName: 'Phân tích dữ liệu, lập báo cáo chuyên sâu phục vụ chỉ đạo điều hành', defaultUnit: 'Báo cáo', defaultWeight: 20, target: 4 },

    { classification: 'VIEN_CHUC', rank: 'VC_CN_HANG_4', rankNameVN: 'Viên chức Chuyên ngành Hạng IV', taskName: 'Hỗ trợ thực hiện các tác nghiệp chuyên môn, kỹ thuật', defaultUnit: 'Tác vụ', defaultWeight: 30, target: 50 },
    { classification: 'VIEN_CHUC', rank: 'VC_CN_HANG_4', rankNameVN: 'Viên chức Chuyên ngành Hạng IV', taskName: 'Vận hành, bảo trì các trang thiết bị, cơ sở vật chất kỹ thuật', defaultUnit: 'Lượt', defaultWeight: 30, target: 50 },
    { classification: 'VIEN_CHUC', rank: 'VC_CN_HANG_4', rankNameVN: 'Viên chức Chuyên ngành Hạng IV', taskName: 'Chuẩn bị vật tư, tài liệu phục vụ công tác chuyên môn', defaultUnit: 'Lượt', defaultWeight: 20, target: 60 },
    { classification: 'VIEN_CHUC', rank: 'VC_CN_HANG_4', domainCode: 'IOC', rankNameVN: 'Viên chức Chuyên ngành Hạng IV (IOC)', taskName: 'Hỗ trợ kỹ thuật, xử lý sự cố thiết bị đầu cuối tại Trung tâm IOC', defaultUnit: 'Lượt', defaultWeight: 30, target: 30 },
    { classification: 'VIEN_CHUC', rank: 'VC_CN_HANG_4', domainCode: 'IOC', rankNameVN: 'Viên chức Chuyên ngành Hạng IV (IOC)', taskName: 'Trực màn hình giám sát an ninh trật tự, giao thông', defaultUnit: 'Ca trực', defaultWeight: 30, target: 20 },
    
    // 2. Chức danh nghề nghiệp DÙNG CHUNG (Hành chính, Tổ chức, Kế toán...)
    { classification: 'VIEN_CHUC', rank: 'VC_DC_HANG_1', rankNameVN: 'Viên chức Dùng chung Hạng I (Chuyên viên CC)', taskName: 'Tham mưu hoạch định chính sách, chiến lược phát triển đơn vị', defaultUnit: 'Văn bản', defaultWeight: 30, target: 5 },
    { classification: 'VIEN_CHUC', rank: 'VC_DC_HANG_2', rankNameVN: 'Viên chức Dùng chung Hạng II (Chuyên viên C)', taskName: 'Chủ trì xây dựng các đề án, quy chế nội bộ', defaultUnit: 'Đề án/Quy chế', defaultWeight: 30, target: 10 },
    
    { classification: 'VIEN_CHUC', rank: 'VC_DC_HANG_3', rankNameVN: 'Viên chức Dùng chung Hạng III (Chuyên viên)', taskName: 'Thực hiện thủ tục hành chính, dịch vụ công trực tuyến tại đơn vị SNCL', defaultUnit: 'Hồ sơ', defaultWeight: 20, target: 50 },
    { classification: 'VIEN_CHUC', rank: 'VC_DC_HANG_3', rankNameVN: 'Viên chức Dùng chung Hạng III (Chuyên viên)', taskName: 'Soạn thảo tờ trình, công văn, quyết định thuộc thẩm quyền', defaultUnit: 'Văn bản', defaultWeight: 25, target: 30 },
    { classification: 'VIEN_CHUC', rank: 'VC_DC_HANG_3', rankNameVN: 'Viên chức Dùng chung Hạng III (Chuyên viên)', taskName: 'Tổng hợp số liệu, lập báo cáo chuyên đề, báo cáo tháng/quý', defaultUnit: 'Báo cáo', defaultWeight: 20, target: 12 },
    
    { classification: 'VIEN_CHUC', rank: 'VC_DC_HANG_4', rankNameVN: 'Viên chức Dùng chung Hạng IV (Cán sự)', taskName: 'Kiểm tra, hướng dẫn thủ tục hồ sơ cơ bản', defaultUnit: 'Hồ sơ', defaultWeight: 30, target: 100 },
    { classification: 'VIEN_CHUC', rank: 'VC_DC_HANG_4', rankNameVN: 'Viên chức Dùng chung Hạng IV (Cán sự)', taskName: 'Quản lý, theo dõi số liệu, hồ sơ chuyên môn nội bộ', defaultUnit: 'Hồ sơ', defaultWeight: 30, target: 50 },
    
    // 3. Chức danh nghề nghiệp HỖ TRỢ, PHỤC VỤ
    { classification: 'VIEN_CHUC', rank: 'VC_HT_HANG_5', rankNameVN: 'Viên chức Hỗ trợ phục vụ Hạng V (Nhân viên)', taskName: 'Thực hiện công tác văn thư, lưu trữ tại đơn vị SNCL', defaultUnit: 'Lượt', defaultWeight: 40, target: 1000 },
    { classification: 'VIEN_CHUC', rank: 'VC_HT_HANG_5', rankNameVN: 'Viên chức Hỗ trợ phục vụ Hạng V (Nhân viên)', taskName: 'Quản trị cơ sở vật chất, bảo trì trang thiết bị văn phòng', defaultUnit: 'Lượt', defaultWeight: 30, target: 50 },
    { classification: 'VIEN_CHUC', rank: 'VC_HT_HANG_5', rankNameVN: 'Viên chức Hỗ trợ phục vụ Hạng V (Nhân viên)', taskName: 'Thực hiện công tác lễ tân, khánh tiết, phục vụ hội nghị', defaultUnit: 'Lượt', defaultWeight: 30, target: 30 }
  ];

  const templatesToSeed = RANK_TEMPLATES.map(t => {
    const { target, ...rest } = t;
    return rest;
  });
  await prisma.taskRankTemplate.createMany({ data: templatesToSeed });
  console.log(`✅ Đã seed ${RANK_TEMPLATES.length} TaskRankTemplates.`);

  // --- Seed KPI Periods ---
  console.log('🔹 Seed KPI Periods...');
  const kpiPeriods = [
    { name: 'Tháng 1/2026', startDate: new Date('2026-01-01'), endDate: new Date('2026-01-31') },
    { name: 'Tháng 2/2026', startDate: new Date('2026-02-01'), endDate: new Date('2026-02-28') },
    { name: 'Tháng 3/2026', startDate: new Date('2026-03-01'), endDate: new Date('2026-03-31') },
    { name: 'Tháng 4/2026', startDate: new Date('2026-04-01'), endDate: new Date('2026-04-30') },
    { name: 'Tháng 5/2026', startDate: new Date('2026-05-01'), endDate: new Date('2026-05-31') },
    { name: 'Tháng 6/2026', startDate: new Date('2026-06-01'), endDate: new Date('2026-06-30') },
  ];
  await prisma.kpiPeriod.createMany({ data: kpiPeriods });
  console.log(`✅ Đã seed ${kpiPeriods.length} KPI Periods.`);

  // --- Seed Rank Quotas ---
  console.log('🔹 Seed Rank Quotas...');
  const rankQuotas = RANK_TEMPLATES.map(t => {
    let targetValue = 10;
    let weight = t.defaultWeight || 10;
    
    if (['Văn bản QPPL', 'Bộ tài liệu', 'Chương trình', 'Bài báo', 'Báo cáo thẩm định'].includes(t.defaultUnit)) targetValue = 2;
    else if (['Đề án/Quy hoạch', 'Tài liệu thiết kế'].includes(t.defaultUnit)) targetValue = 3;
    else if (t.defaultUnit === 'Hồ sơ') targetValue = t.rank === 'PRINCIPAL_SPECIALIST' ? 15 : (t.rank === 'OFFICER' ? 50 : 30);
    else if (t.defaultUnit === 'Văn bản') targetValue = 20;
    else if (['Vụ việc', 'Khóa/Lượt', 'Dự án/Hạng mục'].includes(t.defaultUnit)) targetValue = 4;
    else if (['Báo cáo/Kế hoạch', 'Báo cáo', 'Lượt tham gia', 'Gói dịch vụ', 'Module/Tính năng'].includes(t.defaultUnit)) targetValue = 5;
    else if (['Bản ghi/Bộ dữ liệu', 'Lượt', 'Phiếu hỗ trợ (Ticket)'].includes(t.defaultUnit)) targetValue = 100;
    else if (t.defaultUnit === 'Đề tài') targetValue = 1;
    else if (['Ca trực', 'Phiếu kiểm định'].includes(t.defaultUnit)) targetValue = 20;
    else if (['Hệ thống/Yêu cầu', 'Lần triển khai'].includes(t.defaultUnit)) targetValue = 10;
    else if (t.defaultUnit === 'Bản ghi') targetValue = 30;

    return {
      rankCode: t.rank,
      taskName: t.taskName,
      unit: t.defaultUnit,
      targetValue,
      weight
    };
  });
  await prisma.rankQuota.createMany({ data: rankQuotas });
  console.log(`✅ Đã seed ${rankQuotas.length} Rank Quotas.`);

  // --- Seed KPI Criteria (Updated for Rank Quotas) ---
  console.log('🔹 Seed KPI Criteria (Đề án Vị trí việc làm 01/07/2026)...');
  const kpiCriteriaData = [
    { 
      name: 'Hoàn thành định mức nhiệm vụ chuyên môn theo VTVL', 
      description: 'Đánh giá tiến độ, số lượng và chất lượng các công việc cốt lõi thuộc bản mô tả vị trí việc làm (Kế hoạch/Định mức).', 
      settings: { weight: 50.0, baseScore: 50.0, scoringMethod: 'AUTO', difficulty: 'NORMAL', difficultyMultiplier: 1.0, bonusThresholdDays: 0, bonusPerDay: 2, penaltyPerDay: 5 }
    },
    { 
      name: 'Thực hiện nhiệm vụ phát sinh, đột xuất', 
      description: 'Đánh giá tính sẵn sàng và hiệu quả khi thực hiện các công việc phát sinh ngoài định mức do Lãnh đạo trực tiếp giao phó.', 
      settings: { weight: 20.0, baseScore: 20.0, scoringMethod: 'AUTO', difficulty: 'HARD', difficultyMultiplier: 1.5, bonusThresholdDays: 0, bonusPerDay: 5, penaltyPerDay: 5 }
    },
    { 
      name: 'Khả năng tham mưu, tính chủ động và sáng tạo', 
      description: 'Đánh giá mức độ chủ động đề xuất giải pháp, sáng kiến cải tiến quy trình nghiệp vụ mang lại hiệu quả cho cơ quan.', 
      settings: { weight: 10.0, baseScore: 10.0, scoringMethod: 'MANUAL', difficulty: 'NORMAL', difficultyMultiplier: 1.0, bonusThresholdDays: 0, bonusPerDay: 0, penaltyPerDay: 0 }
    },
    { 
      name: 'Chấp hành kỷ luật, kỷ cương và thời giờ làm việc', 
      description: 'Đánh giá việc tuân thủ nội quy cơ quan, đảm bảo ngày công, giờ giấc làm việc.', 
      settings: { weight: 10.0, baseScore: 10.0, scoringMethod: 'INTEGRATION_API', difficulty: 'NORMAL', difficultyMultiplier: 1.0, bonusThresholdDays: 0, bonusPerDay: 0, penaltyPerDay: 2, integrationCode: 'TIMEKEEPER_API' }
    },
    { 
      name: 'Thái độ, tác phong và tinh thần phối hợp công tác', 
      description: 'Đánh giá thái độ phục vụ nhân dân, văn hóa công sở và khả năng phối hợp nhịp nhàng với đồng nghiệp, phòng ban khác.', 
      settings: { weight: 10.0, baseScore: 10.0, scoringMethod: 'MANUAL', difficulty: 'NORMAL', difficultyMultiplier: 1.0, bonusThresholdDays: 0, bonusPerDay: 0, penaltyPerDay: 0 }
    }
  ];

  for (const criteria of kpiCriteriaData) {
    await prisma.kpiCriteria.create({
      data: {
        name: criteria.name,
        description: criteria.description,
        settings: {
          create: criteria.settings
        }
      }
    });
  }
  console.log(`✅ Đã seed ${kpiCriteriaData.length} KPI Criteria theo chuẩn VTVL.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
