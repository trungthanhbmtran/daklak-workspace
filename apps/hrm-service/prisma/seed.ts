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
  console.log('🔹 Seed HRM employees...');
  const startDate = new Date('2020-01-01');

  // Fetch real units and job titles from the user-service database (admin_systems)
  const units: any[] = await prisma.$queryRaw`SELECT id, code FROM admin_systems.organization_units`;
  const jobTitles: any[] = await prisma.$queryRaw`SELECT id, code FROM admin_systems.job_titles`;

  const unitMap = Object.fromEntries(units.map(u => [u.code, u.id]));
  const jobMap = Object.fromEntries(jobTitles.map(j => [j.code, j.id]));

  if (!unitMap['H15.07'] || !jobMap['GIAM_DOC']) {
    console.log('⚠️ Please run user-service seed first to create OrganizationUnits and JobTitles!');
    return;
  }

  const EMPLOYEES = [
    // --- Lãnh đạo Sở KHCN ---
    { fullName: 'Bùi Thanh Toàn', firstname: 'Bùi Thanh', lastname: 'Toàn', employeeCode: 'NV_001', email: 'buithanhtoan@daklak.gov.vn', phone: '0901000001', identityCard: '001000001', departmentId: unitMap['H15.07'], jobTitleId: jobMap['GIAM_DOC'], civilServantRankId: jobMap['SENIOR_SPECIALIST'], partyTitleId: jobMap['BI_THU_DANG_BO'] },
    { fullName: 'Phạm Gia Việt', firstname: 'Phạm Gia', lastname: 'Việt', employeeCode: 'NV_002', email: 'phamgiaviet@daklak.gov.vn', phone: '0901000002', identityCard: '001000002', departmentId: unitMap['H15.07'], jobTitleId: jobMap['PHO_GIAM_DOC'], civilServantRankId: jobMap['PRINCIPAL_SPECIALIST'] },
    { fullName: 'Ra Lan Trương Thanh Hà', firstname: 'Ra Lan Trương', lastname: 'Thanh Hà', employeeCode: 'NV_003', email: 'ralantruongthanhha@daklak.gov.vn', phone: '0901000003', identityCard: '001000003', departmentId: unitMap['H15.07'], jobTitleId: jobMap['PHO_GIAM_DOC'], civilServantRankId: jobMap['PRINCIPAL_SPECIALIST'], partyTitleId: jobMap['PHO_BI_THU_DANG_BO'] },
    { fullName: 'Trần Văn Sơn', firstname: 'Trần Văn', lastname: 'Sơn', employeeCode: 'NV_004', email: 'tranvanson@daklak.gov.vn', phone: '0901000004', identityCard: '001000004', departmentId: unitMap['H15.07'], jobTitleId: jobMap['PHO_GIAM_DOC'], civilServantRankId: jobMap['PRINCIPAL_SPECIALIST'] },
    { fullName: 'Lâm Vũ Mỹ Hạnh', firstname: 'Lâm Vũ Mỹ', lastname: 'Hạnh', employeeCode: 'NV_005', email: 'lamvumyhanh@daklak.gov.vn', phone: '0901000005', identityCard: '001000005', departmentId: unitMap['H15.07'], jobTitleId: jobMap['PHO_GIAM_DOC'], civilServantRankId: jobMap['PRINCIPAL_SPECIALIST'] },

    // --- Lãnh đạo các phòng ban Sở KHCN (Khối Công chức) ---
    { fullName: 'Nguyễn Chiến Thắng', firstname: 'Nguyễn Chiến', lastname: 'Thắng', employeeCode: 'NV_020', email: 'nguyenvana@daklak.gov.vn', phone: '0902000020', identityCard: '002000020', departmentId: unitMap['H15.07.05'], jobTitleId: jobMap['CHANH_VAN_PHONG'], civilServantRankId: jobMap['PRINCIPAL_SPECIALIST'], partyTitleId: jobMap['DANG_UY_VIEN'] },
    { fullName: 'Lê Thị B', firstname: 'Lê Thị', lastname: 'B', employeeCode: 'NV_021', email: 'lethib@daklak.gov.vn', phone: '0902000021', identityCard: '002000021', departmentId: unitMap['H15.07.07'], jobTitleId: jobMap['TRUONG_PHONG'], civilServantRankId: jobMap['PRINCIPAL_SPECIALIST'] },
    { fullName: 'Trần Văn C', firstname: 'Trần Văn', lastname: 'C', employeeCode: 'NV_022', email: 'tranvanc@daklak.gov.vn', phone: '0902000022', identityCard: '002000022', departmentId: unitMap['H15.07.08'], jobTitleId: jobMap['TRUONG_PHONG'], civilServantRankId: jobMap['PRINCIPAL_SPECIALIST'] },
    { fullName: 'Phạm Thị D', firstname: 'Phạm Thị', lastname: 'D', employeeCode: 'NV_023', email: 'phamthid@daklak.gov.vn', phone: '0902000023', identityCard: '002000023', departmentId: unitMap['H15.07.09'], jobTitleId: jobMap['TRUONG_PHONG'], civilServantRankId: jobMap['PRINCIPAL_SPECIALIST'] },
    { fullName: 'Hoàng Văn E', firstname: 'Hoàng Văn', lastname: 'E', employeeCode: 'NV_024', email: 'hoangvane@daklak.gov.vn', phone: '0902000024', identityCard: '002000024', departmentId: unitMap['H15.07.10'], jobTitleId: jobMap['TRUONG_PHONG'], civilServantRankId: jobMap['PRINCIPAL_SPECIALIST'] },
    { fullName: 'Vũ Thị F', firstname: 'Vũ Thị', lastname: 'F', employeeCode: 'NV_025', email: 'vuthif@daklak.gov.vn', phone: '0902000025', identityCard: '002000025', departmentId: unitMap['H15.07.11'], jobTitleId: jobMap['TRUONG_PHONG'], civilServantRankId: jobMap['PRINCIPAL_SPECIALIST'] },

    // Phó Trưởng phòng Sở KHCN
    { fullName: 'Trương Văn Phó 1', firstname: 'Trương Văn', lastname: 'Phó 1', employeeCode: 'NV_036', email: 'phochvp_khcn@daklak.gov.vn', phone: '0902000036', identityCard: '002000036', departmentId: unitMap['H15.07.05'], jobTitleId: jobMap['PHO_CHANH_VAN_PHONG'], civilServantRankId: jobMap['SPECIALIST'] },
    { fullName: 'Ngô Thị Phó 2', firstname: 'Ngô Thị', lastname: 'Phó 2', employeeCode: 'NV_037', email: 'photp_khtc_khcn@daklak.gov.vn', phone: '0902000037', identityCard: '002000037', departmentId: unitMap['H15.07.07'], jobTitleId: jobMap['PHO_PHONG'], civilServantRankId: jobMap['SPECIALIST'] },

    // --- Lãnh đạo các Trung tâm khác thuộc Sở KHCN (Khối Viên chức) ---
    { fullName: 'Đỗ Văn G', firstname: 'Đỗ Văn', lastname: 'G', employeeCode: 'NV_026', email: 'dovang@daklak.gov.vn', phone: '0902000026', identityCard: '002000026', departmentId: unitMap['H15.07.01'], jobTitleId: jobMap['GIAM_DOC'], civilServantRankId: jobMap['GRADE_2'] },
    { fullName: 'Lý Văn I', firstname: 'Lý Văn', lastname: 'I', employeeCode: 'NV_028', email: 'lyvani@daklak.gov.vn', phone: '0902000028', identityCard: '002000028', departmentId: unitMap['H15.07.02'], jobTitleId: jobMap['GIAM_DOC'], civilServantRankId: jobMap['GRADE_2'] },

    // Lãnh đạo các phòng thuộc các Trung tâm khác
    { fullName: 'Hoàng Văn HC', firstname: 'Hoàng Văn', lastname: 'HC', employeeCode: 'NV_029', email: 'truongphonghc_dmsm@daklak.gov.vn', phone: '0902000029', identityCard: '002000029', departmentId: unitMap['H15.07.01.01'], jobTitleId: jobMap['TRUONG_PHONG'], civilServantRankId: jobMap['GRADE_3'] },
    { fullName: 'Lê Thị UT', firstname: 'Lê Thị', lastname: 'UT', employeeCode: 'NV_030', email: 'truongphongut_dmsm@daklak.gov.vn', phone: '0902000030', identityCard: '002000030', departmentId: unitMap['H15.07.01.02'], jobTitleId: jobMap['TRUONG_PHONG'], civilServantRankId: jobMap['GRADE_3'] },
    { fullName: 'Nguyễn Văn HC', firstname: 'Nguyễn Văn', lastname: 'HC', employeeCode: 'NV_033', email: 'truongphonghc_kttdc@daklak.gov.vn', phone: '0902000033', identityCard: '002000033', departmentId: unitMap['H15.07.02.01'], jobTitleId: jobMap['TRUONG_PHONG'], civilServantRankId: jobMap['GRADE_3'] },
    { fullName: 'Đinh Thị DL', firstname: 'Đinh Thị', lastname: 'DL', employeeCode: 'NV_034', email: 'truongphongdl_kttdc@daklak.gov.vn', phone: '0902000034', identityCard: '002000034', departmentId: unitMap['H15.07.02.02'], jobTitleId: jobMap['TRUONG_PHONG'], civilServantRankId: jobMap['GRADE_3'] },
    { fullName: 'Vũ Văn TN', firstname: 'Vũ Văn', lastname: 'TN', employeeCode: 'NV_035', email: 'truongphongtn_kttdc@daklak.gov.vn', phone: '0902000035', identityCard: '002000035', departmentId: unitMap['H15.07.02.03'], jobTitleId: jobMap['TRUONG_PHONG'], civilServantRankId: jobMap['GRADE_3'] },

    // --- Cán bộ, nhân viên Trung tâm Giám sát, Điều hành Đô thị thông minh (IOC) ---
    { fullName: 'Võ Nguyễn Hoàng Nam', firstname: 'Võ Nguyễn Hoàng', lastname: 'Nam', employeeCode: 'NV_100', email: 'vonguyenhoangnam@daklak.gov.vn', phone: '0903000100', identityCard: '003000100', departmentId: unitMap['H15.07.04'], jobTitleId: jobMap['GIAM_DOC'], civilServantRankId: jobMap['GRADE_2'] },
    { fullName: 'Lê Xuân Quang', firstname: 'Lê Xuân', lastname: 'Quang', employeeCode: 'NV_101', email: 'lexuanquang@daklak.gov.vn', phone: '0903000101', identityCard: '003000101', departmentId: unitMap['H15.07.04'], jobTitleId: jobMap['PHO_GIAM_DOC'], civilServantRankId: jobMap['GRADE_2'] },
    { fullName: 'Trần Duy Tân', firstname: 'Trần Duy', lastname: 'Tân', employeeCode: 'NV_102', email: 'tranduytan@daklak.gov.vn', phone: '0903000102', identityCard: '003000102', departmentId: unitMap['H15.07.04'], jobTitleId: jobMap['PHO_GIAM_DOC'], civilServantRankId: jobMap['GRADE_2'] },
    { fullName: 'Lê Anh Tuấn', firstname: 'Lê Anh', lastname: 'Tuấn', employeeCode: 'NV_103', email: 'leanhtuan@daklak.gov.vn', phone: '0903000103', identityCard: '003000103', departmentId: unitMap['H15.07.04.01'], jobTitleId: jobMap['TRUONG_PHONG'], civilServantRankId: jobMap['GRADE_3'] },
    { fullName: 'Lê Quang Thanh', firstname: 'Lê Quang', lastname: 'Thanh', employeeCode: 'NV_104', email: 'lequangthanh@daklak.gov.vn', phone: '0903000104', identityCard: '003000104', departmentId: unitMap['H15.07.04.03'], jobTitleId: jobMap['TRUONG_PHONG'], civilServantRankId: jobMap['GRADE_3'] },
    { fullName: 'Lê Trọng Vũ', firstname: 'Lê Trọng', lastname: 'Vũ', employeeCode: 'NV_105', email: 'letrongvu@daklak.gov.vn', phone: '0903000105', identityCard: '003000105', departmentId: unitMap['H15.07.04.02'], jobTitleId: jobMap['TRUONG_PHONG'], civilServantRankId: jobMap['GRADE_3'] },
    { fullName: 'Châu Trọng Phát', firstname: 'Châu Trọng', lastname: 'Phát', employeeCode: 'NV_106', email: 'chautrongphat@daklak.gov.vn', phone: '0903000106', identityCard: '003000106', departmentId: unitMap['H15.07.04.01'], jobTitleId: jobMap['KE_TOAN'], civilServantRankId: jobMap['GRADE_3'] },
    { fullName: 'Nguyễn Thị Kim Oanh', firstname: 'Nguyễn Thị Kim', lastname: 'Oanh', employeeCode: 'NV_107', email: 'nguyenthikimoanh@daklak.gov.vn', phone: '0903000107', identityCard: '003000107', departmentId: unitMap['H15.07.04.01'], jobTitleId: jobMap['VIEN_CHUC'], civilServantRankId: jobMap['GRADE_3'] },
    { fullName: 'Võ Thị Hiền', firstname: 'Võ Thị', lastname: 'Hiền', employeeCode: 'NV_108', email: 'vothihien@daklak.gov.vn', phone: '0903000108', identityCard: '003000108', departmentId: unitMap['H15.07.04.01'], jobTitleId: jobMap['VAN_THU'], civilServantRankId: jobMap['GRADE_3'] },
    { fullName: 'Phạm Thế Anh', firstname: 'Phạm Thế', lastname: 'Anh', employeeCode: 'NV_109', email: 'phamtheanh@daklak.gov.vn', phone: '0903000109', identityCard: '003000109', departmentId: unitMap['H15.07.04.03'], jobTitleId: jobMap['VIEN_CHUC'], civilServantRankId: jobMap['GRADE_3'] },
    { fullName: 'Phan Đăng Việt Vinh Chuẩn', firstname: 'Phan Đăng Việt Vinh', lastname: 'Chuẩn', employeeCode: 'NV_110', email: 'phandangvietvinhchuan@daklak.gov.vn', phone: '0903000110', identityCard: '003000110', departmentId: unitMap['H15.07.04.03'], jobTitleId: jobMap['VIEN_CHUC'], civilServantRankId: jobMap['GRADE_3'] },
    { fullName: 'Nguyễn Minh Hóa', firstname: 'Nguyễn Minh', lastname: 'Hóa', employeeCode: 'NV_111', email: 'nguyenminhhoa@daklak.gov.vn', phone: '0903000111', identityCard: '003000111', departmentId: unitMap['H15.07.04.02'], jobTitleId: jobMap['VIEN_CHUC'], civilServantRankId: jobMap['GRADE_3'] },
    { fullName: 'Châu Hòa Khánh Tâm', firstname: 'Châu Hòa Khánh', lastname: 'Tâm', employeeCode: 'NV_112', email: 'chauhoakhanhtam@daklak.gov.vn', phone: '0903000112', identityCard: '003000112', departmentId: unitMap['H15.07.04.02'], jobTitleId: jobMap['VIEN_CHUC'], civilServantRankId: jobMap['GRADE_3'] },
    { fullName: 'Lê Thị Thanh Kiều', firstname: 'Lê Thị Thanh', lastname: 'Kiều', employeeCode: 'NV_113', email: 'lethithanhkieu@daklak.gov.vn', phone: '0903000113', identityCard: '003000113', departmentId: unitMap['H15.07.04.02'], jobTitleId: jobMap['VIEN_CHUC'], civilServantRankId: jobMap['GRADE_3'] },
    { fullName: 'Nguyễn Kiều Trang', firstname: 'Nguyễn Kiều', lastname: 'Trang', employeeCode: 'NV_114', email: 'nguyenkieutrang@daklak.gov.vn', phone: '0903000114', identityCard: '003000114', departmentId: unitMap['H15.07.04.01'], jobTitleId: jobMap['NHAN_VIEN'], civilServantRankId: jobMap['GRADE_4'] },
    { fullName: 'H Lisa Byă', firstname: 'H Lisa', lastname: 'Byă', employeeCode: 'NV_115', email: 'hlisabya@daklak.gov.vn', phone: '0903000115', identityCard: '003000115', departmentId: unitMap['H15.07.04.01'], jobTitleId: jobMap['NHAN_VIEN'], civilServantRankId: jobMap['GRADE_4'] },
    { fullName: 'Nguyễn Thị Diễm Quyên', firstname: 'Nguyễn Thị Diễm', lastname: 'Quyên', employeeCode: 'NV_116', email: 'nguyenthidiemquyen@daklak.gov.vn', phone: '0903000116', identityCard: '003000116', departmentId: unitMap['H15.07.04.01'], jobTitleId: jobMap['NHAN_VIEN'], civilServantRankId: jobMap['GRADE_4'] },
    { fullName: 'Y Sơm Êñuôl', firstname: 'Y Sơm', lastname: 'Êñuôl', employeeCode: 'NV_117', email: 'ysomenuol@daklak.gov.vn', phone: '0903000117', identityCard: '003000117', departmentId: unitMap['H15.07.04.01'], jobTitleId: jobMap['NHAN_VIEN'], civilServantRankId: jobMap['GRADE_4'] },
    { fullName: 'Nguyễn Vũ Huy', firstname: 'Nguyễn Vũ', lastname: 'Huy', employeeCode: 'NV_118', email: 'nguyenvuhuy@daklak.gov.vn', phone: '0903000118', identityCard: '003000118', departmentId: unitMap['H15.07.04.03'], jobTitleId: jobMap['NHAN_VIEN'], civilServantRankId: jobMap['GRADE_4'] },
    { fullName: 'Phùng Đình Hưng', firstname: 'Phùng Đình', lastname: 'Hưng', employeeCode: 'NV_119', email: 'phungdinhhung@daklak.gov.vn', phone: '0903000119', identityCard: '003000119', departmentId: unitMap['H15.07.04.03'], jobTitleId: jobMap['NHAN_VIEN'], civilServantRankId: jobMap['GRADE_4'] },
    { fullName: 'Kiều Vũ Adrơng', firstname: 'Kiều Vũ', lastname: 'Adrơng', employeeCode: 'NV_120', email: 'kieuvuadrong@daklak.gov.vn', phone: '0903000120', identityCard: '003000120', departmentId: unitMap['H15.07.04.03'], jobTitleId: jobMap['NHAN_VIEN'], civilServantRankId: jobMap['GRADE_4'] },
    { fullName: 'Nguyễn Thị Quỳnh Mai', firstname: 'Nguyễn Thị Quỳnh', lastname: 'Mai', employeeCode: 'NV_121', email: 'nguyenthiquynhmai@daklak.gov.vn', phone: '0903000121', identityCard: '003000121', departmentId: unitMap['H15.07.10'], jobTitleId: jobMap['NHAN_VIEN'], civilServantRankId: jobMap['GRADE_4'] },
    { fullName: 'Nguyễn Quang Tú', firstname: 'Nguyễn Quang', lastname: 'Tú', employeeCode: 'NV_122', email: 'nguyenquangtu@daklak.gov.vn', phone: '0903000122', identityCard: '003000122', departmentId: unitMap['H15.07.10'], jobTitleId: jobMap['NHAN_VIEN'], civilServantRankId: jobMap['GRADE_4'] },
    { fullName: 'Trần Trung Thành', firstname: 'Trần Trung', lastname: 'Thành', employeeCode: 'NV_123', email: 'trantrungthanh@daklak.gov.vn', phone: '0903000123', identityCard: '003000123', departmentId: unitMap['H15.07.10'], jobTitleId: jobMap['NHAN_VIEN'], civilServantRankId: jobMap['GRADE_4'] },
    { fullName: 'Nguyễn Sỹ Hợp', firstname: 'Nguyễn Sỹ', lastname: 'Hợp', employeeCode: 'NV_124', email: 'nguyensyhop@daklak.gov.vn', phone: '0903000124', identityCard: '003000124', departmentId: unitMap['H15.07.04.01'], jobTitleId: jobMap['BAO_VE'], civilServantRankId: jobMap['GRADE_4'] },
    { fullName: 'Nguyễn Tiến Quang', firstname: 'Nguyễn Tiến', lastname: 'Quang', employeeCode: 'NV_125', email: 'nguyentienquang@daklak.gov.vn', phone: '0903000125', identityCard: '003000125', departmentId: unitMap['H15.07.04.01'], jobTitleId: jobMap['BAO_VE'], civilServantRankId: jobMap['GRADE_4'] },

    // --- Lãnh đạo các Sở khác (Khối Công chức cấp Tỉnh) ---
    { fullName: 'Trương Ngọc Tuấn', firstname: 'Trương Ngọc', lastname: 'Tuấn', employeeCode: 'NV_010', email: 'truongngoctuan@daklak.gov.vn', phone: '0901000010', identityCard: '001000010', departmentId: unitMap['H15.13'], jobTitleId: jobMap['GIAM_DOC'], civilServantRankId: jobMap['SENIOR_SPECIALIST'] },
    { fullName: 'Trần Văn Tân', firstname: 'Trần Văn', lastname: 'Tân', employeeCode: 'NV_011', email: 'tranvantan@daklak.gov.vn', phone: '0901000011', identityCard: '001000011', departmentId: unitMap['H15.11'], jobTitleId: jobMap['GIAM_DOC'], civilServantRankId: jobMap['SENIOR_SPECIALIST'] },
    { fullName: 'Cao Đình Huy', firstname: 'Cao Đình', lastname: 'Huy', employeeCode: 'NV_012', email: 'caodinhhuy@daklak.gov.vn', phone: '0901000012', identityCard: '001000012', departmentId: unitMap['H15.14'], jobTitleId: jobMap['GIAM_DOC'], civilServantRankId: jobMap['SENIOR_SPECIALIST'] }
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
        employeeCode: e.employeeCode,
        email: e.email,
        phone: e.phone,
        identityCard: e.identityCard,
        departmentId: e.departmentId,
        jobTitleId: e.jobTitleId,
        civilServantRankId: (e as any).civilServantRankId || null,
        partyTitleId: (e as any).partyTitleId || null,
        startDate,
        status: 'active',
      },
    });
  }
  console.log(`✅ Đã seed ${count} nhân viên HRM trên tổng số ${EMPLOYEES.length}.`);

  console.log('🔹 Seed TaskRankTemplates theo Nghị định 335/2025/NĐ-CP...');

  await prisma.taskRankTemplate.deleteMany();

  const RANK_TEMPLATES = [
    // KHỐI CÔNG CHỨC
    // ==========================================
    // KHỐI CÔNG CHỨC - QUẢN LÝ NHÀ NƯỚC & CHUYÊN MÔN
    // Căn cứ pháp lý: Nghị định 170/2025/NĐ-CP & Nghị định 361/2025/NĐ-CP
    // Nguyên tắc (Điều 21 NĐ 170): Giao việc phù hợp ngạch, đảm bảo tính phân cấp, phân quyền và khối lượng công việc.
    // ==========================================

    // 1. Ngạch Chuyên viên cao cấp (SENIOR_SPECIALIST) - Hoạch định chính sách, chiến lược
    { classification: 'CONG_CHUC', rank: 'SENIOR_SPECIALIST', rankNameVN: 'Chuyên viên cao cấp', taskName: 'Chủ trì nghiên cứu, xây dựng và trình ban hành Nghị quyết, Quyết định quy phạm pháp luật cấp Tỉnh', defaultUnit: 'Văn bản QPPL', defaultWeight: 30, legalBasis: 'NĐ 170/2025, NĐ 361/2025' },
    { classification: 'CONG_CHUC', rank: 'SENIOR_SPECIALIST', rankNameVN: 'Chuyên viên cao cấp', taskName: 'Chủ trì thẩm định quy hoạch ngành, đề án phát triển kinh tế - xã hội, kiến trúc chính quyền điện tử', defaultUnit: 'Đề án/Quy hoạch', defaultWeight: 25, legalBasis: 'NĐ 170/2025, NĐ 361/2025' },
    { classification: 'CONG_CHUC', rank: 'SENIOR_SPECIALIST', rankNameVN: 'Chuyên viên cao cấp', taskName: 'Chủ trì các chương trình đàm phán, ký kết thỏa thuận hợp tác liên ngành hoặc với đối tác quốc tế', defaultUnit: 'Chương trình', defaultWeight: 20, legalBasis: 'NĐ 170/2025, NĐ 361/2025' },

    // 2. Ngạch Chuyên viên chính (PRINCIPAL_SPECIALIST) - Tổ chức thực hiện, hướng dẫn nghiệp vụ
    { classification: 'CONG_CHUC', rank: 'PRINCIPAL_SPECIALIST', rankNameVN: 'Chuyên viên chính', taskName: 'Thẩm định hồ sơ chuyên ngành, đề án kỹ thuật công nghệ trọng điểm cấp cơ sở', defaultUnit: 'Hồ sơ', defaultWeight: 15, legalBasis: 'NĐ 170/2025, NĐ 361/2025' },
    { classification: 'CONG_CHUC', rank: 'PRINCIPAL_SPECIALIST', rankNameVN: 'Chuyên viên chính', taskName: 'Biên soạn tài liệu, ban hành văn bản hướng dẫn nghiệp vụ, quy chuẩn chuyên môn cho tuyến dưới', defaultUnit: 'Văn bản', defaultWeight: 15, legalBasis: 'NĐ 170/2025, NĐ 361/2025' },
    { classification: 'CONG_CHUC', rank: 'PRINCIPAL_SPECIALIST', rankNameVN: 'Chuyên viên chính', taskName: 'Chủ trì đoàn thanh tra, kiểm tra chuyên ngành; giải quyết khiếu nại, tố cáo phức tạp', defaultUnit: 'Vụ việc', defaultWeight: 15, legalBasis: 'NĐ 170/2025, NĐ 361/2025' },
    { classification: 'CONG_CHUC', rank: 'PRINCIPAL_SPECIALIST', rankNameVN: 'Chuyên viên chính', taskName: 'Tham mưu tổng hợp, xây dựng kế hoạch công tác năm, báo cáo định kỳ quy mô Sở/Ngành', defaultUnit: 'Báo cáo/Kế hoạch', defaultWeight: 12, legalBasis: 'NĐ 170/2025, NĐ 361/2025' },

    // 3. Ngạch Chuyên viên (SPECIALIST) - Thực thi tác nghiệp chuyên môn
    { classification: 'CONG_CHUC', rank: 'SPECIALIST', rankNameVN: 'Chuyên viên', taskName: 'Nghiên cứu, đề xuất xử lý các hồ sơ thủ tục hành chính, dịch vụ công trực tuyến', defaultUnit: 'Hồ sơ', defaultWeight: 10, legalBasis: 'NĐ 170/2025, NĐ 361/2025' },
    { classification: 'CONG_CHUC', rank: 'SPECIALIST', rankNameVN: 'Chuyên viên', taskName: 'Soạn thảo tờ trình, công văn, quyết định cá biệt theo sự phân công của Lãnh đạo phòng', defaultUnit: 'Văn bản', defaultWeight: 8, legalBasis: 'NĐ 170/2025, NĐ 361/2025' },
    { classification: 'CONG_CHUC', rank: 'SPECIALIST', rankNameVN: 'Chuyên viên', taskName: 'Tổng hợp số liệu, lập báo cáo chuyên đề, báo cáo tháng/quý về tình hình thực hiện nhiệm vụ', defaultUnit: 'Báo cáo', defaultWeight: 8, legalBasis: 'NĐ 170/2025, NĐ 361/2025' },
    { classification: 'CONG_CHUC', rank: 'SPECIALIST', rankNameVN: 'Chuyên viên', taskName: 'Tham gia các tổ công tác, hội đồng chuyên môn, đoàn khảo sát thực tế', defaultUnit: 'Lượt tham gia', defaultWeight: 5, legalBasis: 'NĐ 170/2025, NĐ 361/2025' },

    // 4. Ngạch Cán sự (OFFICER) - Hỗ trợ chuyên môn, thống kê
    { classification: 'CONG_CHUC', rank: 'OFFICER', rankNameVN: 'Cán sự', taskName: 'Thu thập, cập nhật và chuẩn hóa dữ liệu vào các hệ thống thông tin quản lý', defaultUnit: 'Bản ghi/Bộ dữ liệu', defaultWeight: 5, legalBasis: 'NĐ 170/2025, NĐ 361/2025' },
    { classification: 'CONG_CHUC', rank: 'OFFICER', rankNameVN: 'Cán sự', taskName: 'Kiểm tra tính hợp lệ, đầy đủ của hồ sơ đầu vào trước khi bàn giao cho bộ phận chuyên môn', defaultUnit: 'Hồ sơ', defaultWeight: 5, legalBasis: 'NĐ 170/2025, NĐ 361/2025' },
    { classification: 'CONG_CHUC', rank: 'OFFICER', rankNameVN: 'Cán sự', taskName: 'Soạn thảo văn bản hành chính thông thường (giấy mời, thông báo, lịch công tác)', defaultUnit: 'Văn bản', defaultWeight: 4, legalBasis: 'NĐ 170/2025, NĐ 361/2025' },

    // 5. Ngạch Nhân viên (STAFF) - Hành chính, quản trị, phục vụ
    { classification: 'CONG_CHUC', rank: 'STAFF', rankNameVN: 'Nhân viên', taskName: 'Thực hiện công tác văn thư, lưu trữ, tiếp nhận, luân chuyển văn bản đi/đến (iDesk)', defaultUnit: 'Lượt', defaultWeight: 3, legalBasis: 'NĐ 170/2025, NĐ 361/2025' },
    { classification: 'CONG_CHUC', rank: 'STAFF', rankNameVN: 'Nhân viên', taskName: 'Quản trị cơ sở vật chất, bảo trì trang thiết bị văn phòng, cấp phát văn phòng phẩm', defaultUnit: 'Lượt', defaultWeight: 3, legalBasis: 'NĐ 170/2025, NĐ 361/2025' },


    // ==========================================
    // KHỐI VIÊN CHỨC - ĐƠN VỊ SỰ NGHIỆP CÔNG LẬP (KHCN, CNTT, IOC...)
    // Căn cứ pháp lý: Nghị định 115/2020/NĐ-CP & Nghị định 85/2023/NĐ-CP
    // Phân loại: Nhóm chức danh nghề nghiệp chuyên ngành và dùng chung.
    // ==========================================

    // 1. Viên chức Hạng I (GRADE_1) - Tương đương Chuyên viên cao cấp
    { classification: 'VIEN_CHUC', rank: 'GRADE_1', rankNameVN: 'Viên chức Hạng I', taskName: 'Chủ trì thực hiện các đề tài nghiên cứu khoa học, công nghệ trọng điểm cấp Bộ/Tỉnh', defaultUnit: 'Đề tài', defaultWeight: 30, legalBasis: 'NĐ 115/2020, NĐ 85/2023' },
    { classification: 'VIEN_CHUC', rank: 'GRADE_1', rankNameVN: 'Viên chức Hạng I', taskName: 'Tư vấn chuyên gia, thẩm định thiết kế tổng thể các hệ thống công nghệ thông tin quy mô lớn', defaultUnit: 'Báo cáo thẩm định', defaultWeight: 25, legalBasis: 'NĐ 115/2020, NĐ 85/2023' },
    { classification: 'VIEN_CHUC', rank: 'GRADE_1', rankNameVN: 'Viên chức Hạng I', taskName: 'Chủ biên tài liệu, giáo trình, quy chuẩn kỹ thuật quốc gia hoặc cấp ngành', defaultUnit: 'Bộ tài liệu', defaultWeight: 25, legalBasis: 'NĐ 115/2020, NĐ 85/2023' },

    // 2. Viên chức Hạng II (GRADE_2) - Tương đương Chuyên viên chính
    { classification: 'VIEN_CHUC', rank: 'GRADE_2', rankNameVN: 'Viên chức Hạng II', taskName: 'Chủ trì phân tích, thiết kế kiến trúc phần mềm, hệ thống tích hợp liên ngành (LGSP)', defaultUnit: 'Tài liệu thiết kế', defaultWeight: 20, legalBasis: 'NĐ 115/2020, NĐ 85/2023' },
    { classification: 'VIEN_CHUC', rank: 'GRADE_2', rankNameVN: 'Viên chức Hạng II', taskName: 'Tổ chức triển khai thực hiện các dự án, đề án dịch vụ sự nghiệp công phức tạp', defaultUnit: 'Dự án/Hạng mục', defaultWeight: 15, legalBasis: 'NĐ 115/2020, NĐ 85/2023' },
    { classification: 'VIEN_CHUC', rank: 'GRADE_2', rankNameVN: 'Viên chức Hạng II', taskName: 'Viết bài báo khoa học, chuyên đề nghiên cứu công bố trên các tạp chí chuyên ngành', defaultUnit: 'Bài báo', defaultWeight: 15, legalBasis: 'NĐ 115/2020, NĐ 85/2023' },
    { classification: 'VIEN_CHUC', rank: 'GRADE_2', rankNameVN: 'Viên chức Hạng II', taskName: 'Đào tạo, chuyển giao công nghệ, hướng dẫn nghiệp vụ kỹ thuật cho viên chức hạng dưới', defaultUnit: 'Khóa/Lượt', defaultWeight: 10, legalBasis: 'NĐ 115/2020, NĐ 85/2023' },

    // 3. Viên chức Hạng III (GRADE_3) - Tương đương Chuyên viên (Kỹ sư, Nghiên cứu viên...)
    { classification: 'VIEN_CHUC', rank: 'GRADE_3', rankNameVN: 'Viên chức Hạng III', taskName: 'Vận hành kỹ thuật, trực giám sát an toàn thông tin tại Trung tâm điều hành (IOC)', defaultUnit: 'Ca trực', defaultWeight: 10, legalBasis: 'NĐ 115/2020, NĐ 85/2023' },
    { classification: 'VIEN_CHUC', rank: 'GRADE_3', rankNameVN: 'Viên chức Hạng III', taskName: 'Phát triển, bảo trì mã nguồn, tích hợp API cho các hệ thống phần mềm dùng chung', defaultUnit: 'Module/Tính năng', defaultWeight: 12, legalBasis: 'NĐ 115/2020, NĐ 85/2023' },
    { classification: 'VIEN_CHUC', rank: 'GRADE_3', rankNameVN: 'Viên chức Hạng III', taskName: 'Quản trị hệ thống máy chủ, mạng lưới, cấu hình hạ tầng đám mây (Cloud/K8s)', defaultUnit: 'Hệ thống/Yêu cầu', defaultWeight: 10, legalBasis: 'NĐ 115/2020, NĐ 85/2023' },
    { classification: 'VIEN_CHUC', rank: 'GRADE_3', rankNameVN: 'Viên chức Hạng III', taskName: 'Thực hiện các phép đo lường, kiểm định, đánh giá chất lượng sản phẩm công nghệ', defaultUnit: 'Phiếu kiểm định', defaultWeight: 8, legalBasis: 'NĐ 115/2020, NĐ 85/2023' },
    { classification: 'VIEN_CHUC', rank: 'GRADE_3', rankNameVN: 'Viên chức Hạng III', taskName: 'Triển khai cung cấp dịch vụ sự nghiệp công theo kế hoạch được duyệt', defaultUnit: 'Gói dịch vụ', defaultWeight: 10, legalBasis: 'NĐ 115/2020, NĐ 85/2023' },

    // 4. Viên chức Hạng IV (GRADE_4) - Tương đương Cán sự (Kỹ thuật viên, Hỗ trợ)
    { classification: 'VIEN_CHUC', rank: 'GRADE_4', rankNameVN: 'Viên chức Hạng IV', taskName: 'Tiếp nhận yêu cầu (Helpdesk), trực tổng đài hỗ trợ người dùng ứng dụng/hệ thống', defaultUnit: 'Phiếu hỗ trợ (Ticket)', defaultWeight: 5, legalBasis: 'NĐ 115/2020, NĐ 85/2023' },
    { classification: 'VIEN_CHUC', rank: 'GRADE_4', rankNameVN: 'Viên chức Hạng IV', taskName: 'Kiểm tra, bảo dưỡng định kỳ các thiết bị đầu cuối, camera, máy móc thực hành', defaultUnit: 'Lượt', defaultWeight: 5, legalBasis: 'NĐ 115/2020, NĐ 85/2023' },
    { classification: 'VIEN_CHUC', rank: 'GRADE_4', rankNameVN: 'Viên chức Hạng IV', taskName: 'Ghi chép nhật ký vận hành, xuất xuất dữ liệu báo cáo kỹ thuật định kỳ', defaultUnit: 'Bản ghi', defaultWeight: 4, legalBasis: 'NĐ 115/2020, NĐ 85/2023' },
    { classification: 'VIEN_CHUC', rank: 'GRADE_4', rankNameVN: 'Viên chức Hạng IV', taskName: 'Hỗ trợ thiết lập môi trường, triển khai lắp đặt thiết bị tại hiện trường', defaultUnit: 'Lần triển khai', defaultWeight: 6, legalBasis: 'NĐ 115/2020, NĐ 85/2023' }
  ];

  await prisma.taskRankTemplate.createMany({ data: RANK_TEMPLATES });
  console.log(`✅ Đã seed ${RANK_TEMPLATES.length} TaskRankTemplates.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
