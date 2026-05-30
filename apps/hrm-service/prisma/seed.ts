import 'dotenv/config';
import { PrismaClient } from '@generated/prisma/client';
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

  if (!unitMap['SO_KHCN'] || !jobMap['GIAM_DOC']) {
    console.log('⚠️ Please run user-service seed first to create OrganizationUnits and JobTitles!');
    return;
  }

  const EMPLOYEES = [
    // --- Lãnh đạo Sở KHCN ---
    { firstname: 'Bùi Thanh', lastname: 'Toàn', employeeCode: 'NV_001', email: 'buithanhtoan@daklak.gov.vn', phone: '0901000001', identityCard: '001000001', departmentId: unitMap['H15.07'], jobTitleId: jobMap['GIAM_DOC'], civilServantRankId: jobMap['SENIOR_SPECIALIST'], partyTitleId: jobMap['BI_THU_DANG_BO'] },
    { firstname: 'Phạm Gia', lastname: 'Việt', employeeCode: 'NV_002', email: 'phamgiaviet@daklak.gov.vn', phone: '0901000002', identityCard: '001000002', departmentId: unitMap['H15.07'], jobTitleId: jobMap['PHO_GIAM_DOC'], civilServantRankId: jobMap['PRINCIPAL_SPECIALIST'], partyTitleId: jobMap['PHO_BI_THU_DANG_BO'] },
    { firstname: 'Ra Lan Trương', lastname: 'Thanh Hà', employeeCode: 'NV_003', email: 'ralantruongthanhha@daklak.gov.vn', phone: '0901000003', identityCard: '001000003', departmentId: unitMap['H15.07'], jobTitleId: jobMap['PHO_GIAM_DOC'] },
    { firstname: 'Trần Văn', lastname: 'Sơn', employeeCode: 'NV_004', email: 'tranvanson@daklak.gov.vn', phone: '0901000004', identityCard: '001000004', departmentId: unitMap['H15.07'], jobTitleId: jobMap['PHO_GIAM_DOC'] },
    { firstname: 'Lâm Vũ Mỹ', lastname: 'Hạnh', employeeCode: 'NV_005', email: 'lamvumyhanh@daklak.gov.vn', phone: '0901000005', identityCard: '001000005', departmentId: unitMap['H15.07'], jobTitleId: jobMap['PHO_GIAM_DOC'] },

    // --- Lãnh đạo các phòng ban Sở KHCN ---
    { firstname: 'Nguyễn Văn', lastname: 'A', employeeCode: 'NV_020', email: 'nguyenvana@daklak.gov.vn', phone: '0902000020', identityCard: '002000020', departmentId: unitMap['SO_KHCN_VP'], jobTitleId: jobMap['CHANH_VAN_PHONG'], civilServantRankId: jobMap['PRINCIPAL_SPECIALIST'], partyTitleId: jobMap['DANG_UY_VIEN'] },
    { firstname: 'Lê Thị', lastname: 'B', employeeCode: 'NV_021', email: 'lethib@daklak.gov.vn', phone: '0902000021', identityCard: '002000021', departmentId: unitMap['SO_KHCN_KHTC'], jobTitleId: jobMap['TRUONG_PHONG'] },
    { firstname: 'Trần Văn', lastname: 'C', employeeCode: 'NV_022', email: 'tranvanc@daklak.gov.vn', phone: '0902000022', identityCard: '002000022', departmentId: unitMap['SO_KHCN_QLKH'], jobTitleId: jobMap['TRUONG_PHONG'] },
    { firstname: 'Phạm Thị', lastname: 'D', employeeCode: 'NV_023', email: 'phamthid@daklak.gov.vn', phone: '0902000023', identityCard: '002000023', departmentId: unitMap['SO_KHCN_CDS'], jobTitleId: jobMap['TRUONG_PHONG'] },
    { firstname: 'Hoàng Văn', lastname: 'E', employeeCode: 'NV_024', email: 'hoangvane@daklak.gov.vn', phone: '0902000024', identityCard: '002000024', departmentId: unitMap['SO_KHCN_QLCN'], jobTitleId: jobMap['TRUONG_PHONG'] },
    { firstname: 'Vũ Thị', lastname: 'F', employeeCode: 'NV_025', email: 'vuthif@daklak.gov.vn', phone: '0902000025', identityCard: '002000025', departmentId: unitMap['SO_KHCN_TDC'], jobTitleId: jobMap['TRUONG_PHONG'] },

    // Phó Trưởng phòng Sở KHCN
    { firstname: 'Trương Văn', lastname: 'Phó 1', employeeCode: 'NV_036', email: 'phochvp_khcn@daklak.gov.vn', phone: '0902000036', identityCard: '002000036', departmentId: unitMap['SO_KHCN_VP'], jobTitleId: jobMap['PHO_CHANH_VAN_PHONG'] },
    { firstname: 'Ngô Thị', lastname: 'Phó 2', employeeCode: 'NV_037', email: 'photp_khtc_khcn@daklak.gov.vn', phone: '0902000037', identityCard: '002000037', departmentId: unitMap['SO_KHCN_KHTC'], jobTitleId: jobMap['PHO_TRUONG_PHONG'] },

    // --- Lãnh đạo các Trung tâm khác thuộc Sở KHCN ---
    { firstname: 'Đỗ Văn', lastname: 'G', employeeCode: 'NV_026', email: 'dovang@daklak.gov.vn', phone: '0902000026', identityCard: '002000026', departmentId: unitMap['TT_DMSM'], jobTitleId: jobMap['GIAM_DOC'] },
    { firstname: 'Lý Văn', lastname: 'I', employeeCode: 'NV_028', email: 'lyvani@daklak.gov.vn', phone: '0902000028', identityCard: '002000028', departmentId: unitMap['TT_KTTDC'], jobTitleId: jobMap['GIAM_DOC'] },

    // Lãnh đạo các phòng thuộc các Trung tâm khác
    { firstname: 'Hoàng Văn', lastname: 'HC', employeeCode: 'NV_029', email: 'truongphonghc_dmsm@daklak.gov.vn', phone: '0902000029', identityCard: '002000029', departmentId: unitMap['TT_DMSM_HC'], jobTitleId: jobMap['TRUONG_PHONG'] },
    { firstname: 'Lê Thị', lastname: 'UT', employeeCode: 'NV_030', email: 'truongphongut_dmsm@daklak.gov.vn', phone: '0902000030', identityCard: '002000030', departmentId: unitMap['TT_DMSM_UT'], jobTitleId: jobMap['TRUONG_PHONG'] },
    { firstname: 'Nguyễn Văn', lastname: 'HC', employeeCode: 'NV_033', email: 'truongphonghc_kttdc@daklak.gov.vn', phone: '0902000033', identityCard: '002000033', departmentId: unitMap['TT_KTTDC_HC'], jobTitleId: jobMap['TRUONG_PHONG'] },
    { firstname: 'Đinh Thị', lastname: 'DL', employeeCode: 'NV_034', email: 'truongphongdl_kttdc@daklak.gov.vn', phone: '0902000034', identityCard: '002000034', departmentId: unitMap['TT_KTTDC_DL'], jobTitleId: jobMap['TRUONG_PHONG'] },
    { firstname: 'Vũ Văn', lastname: 'TN', employeeCode: 'NV_035', email: 'truongphongtn_kttdc@daklak.gov.vn', phone: '0902000035', identityCard: '002000035', departmentId: unitMap['TT_KTTDC_TN'], jobTitleId: jobMap['TRUONG_PHONG'] },

    // --- Cán bộ, nhân viên Trung tâm Giám sát, Điều hành Đô thị thông minh (IOC) (Từ file Excel) ---
    { firstname: 'Võ Nguyễn Hoàng', lastname: 'Nam', employeeCode: 'NV_100', email: 'vonguyenhoangnam@daklak.gov.vn', phone: '0903000100', identityCard: '003000100', departmentId: unitMap['H15.07.04'], jobTitleId: jobMap['GIAM_DOC'] },
    { firstname: 'Lê Xuân', lastname: 'Quang', employeeCode: 'NV_101', email: 'lexuanquang@daklak.gov.vn', phone: '0903000101', identityCard: '003000101', departmentId: unitMap['H15.07.04'], jobTitleId: jobMap['PHO_GIAM_DOC'] },
    { firstname: 'Trần Duy', lastname: 'Tân', employeeCode: 'NV_102', email: 'tranduytan@daklak.gov.vn', phone: '0903000102', identityCard: '003000102', departmentId: unitMap['H15.07.04'], jobTitleId: jobMap['PHO_GIAM_DOC'] },
    { firstname: 'Lê Anh', lastname: 'Tuấn', employeeCode: 'NV_103', email: 'leanhtuan@daklak.gov.vn', phone: '0903000103', identityCard: '003000103', departmentId: unitMap['H15.07.04.HC'], jobTitleId: jobMap['TRUONG_PHONG'] },
    { firstname: 'Lê Quang', lastname: 'Thanh', employeeCode: 'NV_104', email: 'lequangthanh@daklak.gov.vn', phone: '0903000104', identityCard: '003000104', departmentId: unitMap['H15.07.04.HT'], jobTitleId: jobMap['TRUONG_PHONG'] },
    { firstname: 'Lê Trọng', lastname: 'Vũ', employeeCode: 'NV_105', email: 'letrongvu@daklak.gov.vn', phone: '0903000105', identityCard: '003000105', departmentId: unitMap['H15.07.QLCN'], jobTitleId: jobMap['TRUONG_PHONG'] },
    { firstname: 'Châu Trọng', lastname: 'Phát', employeeCode: 'NV_106', email: 'chautrongphat@daklak.gov.vn', phone: '0903000106', identityCard: '003000106', departmentId: unitMap['H15.07.04.HC'], jobTitleId: jobMap['KE_TOAN'] },
    { firstname: 'Nguyễn Thị Kim', lastname: 'Oanh', employeeCode: 'NV_107', email: 'nguyenthikimoanh@daklak.gov.vn', phone: '0903000107', identityCard: '003000107', departmentId: unitMap['H15.07.04.HC'], jobTitleId: jobMap['VIEN_CHUC'] },
    { firstname: 'Võ Thị', lastname: 'Hiền', employeeCode: 'NV_108', email: 'vothihien@daklak.gov.vn', phone: '0903000108', identityCard: '003000108', departmentId: unitMap['H15.07.04.HC'], jobTitleId: jobMap['VAN_THU'] },
    { firstname: 'Phạm Thế', lastname: 'Anh', employeeCode: 'NV_109', email: 'phamtheanh@daklak.gov.vn', phone: '0903000109', identityCard: '003000109', departmentId: unitMap['H15.07.04.HT'], jobTitleId: jobMap['VIEN_CHUC'] },
    { firstname: 'Phan Đăng Việt Vinh', lastname: 'Chuẩn', employeeCode: 'NV_110', email: 'phandangvietvinhchuan@daklak.gov.vn', phone: '0903000110', identityCard: '003000110', departmentId: unitMap['H15.07.04.HT'], jobTitleId: jobMap['VIEN_CHUC'] },
    { firstname: 'Nguyễn Minh', lastname: 'Hóa', employeeCode: 'NV_111', email: 'nguyenminhhoa@daklak.gov.vn', phone: '0903000111', identityCard: '003000111', departmentId: unitMap['H15.07.QLCN'], jobTitleId: jobMap['VIEN_CHUC'] },
    { firstname: 'Châu Hòa Khánh', lastname: 'Tâm', employeeCode: 'NV_112', email: 'chauhoakhanhtam@daklak.gov.vn', phone: '0903000112', identityCard: '003000112', departmentId: unitMap['H15.07.QLCN'], jobTitleId: jobMap['VIEN_CHUC'] },
    { firstname: 'Lê Thị Thanh', lastname: 'Kiều', employeeCode: 'NV_113', email: 'lethithanhkieu@daklak.gov.vn', phone: '0903000113', identityCard: '003000113', departmentId: unitMap['H15.07.04.HC_DL'], jobTitleId: jobMap['VIEN_CHUC'] },
    { firstname: 'Nguyễn Kiều', lastname: 'Trang', employeeCode: 'NV_114', email: 'nguyenkieutrang@daklak.gov.vn', phone: '0903000114', identityCard: '003000114', departmentId: unitMap['H15.07.04.HC'], jobTitleId: jobMap['NHAN_VIEN'] },
    { firstname: 'H Lisa', lastname: 'Byă', employeeCode: 'NV_115', email: 'hlisabya@daklak.gov.vn', phone: '0903000115', identityCard: '003000115', departmentId: unitMap['H15.07.04.HC'], jobTitleId: jobMap['NHAN_VIEN'] },
    { firstname: 'Nguyễn Thị Diễm', lastname: 'Quyên', employeeCode: 'NV_116', email: 'nguyenthidiemquyen@daklak.gov.vn', phone: '0903000116', identityCard: '003000116', departmentId: unitMap['H15.07.04.HC'], jobTitleId: jobMap['NHAN_VIEN'] },
    { firstname: 'Y Sơm', lastname: 'Êñuôl', employeeCode: 'NV_117', email: 'ysomenuol@daklak.gov.vn', phone: '0903000117', identityCard: '003000117', departmentId: unitMap['H15.07.04.HC'], jobTitleId: jobMap['NHAN_VIEN'] },
    { firstname: 'Nguyễn Vũ', lastname: 'Huy', employeeCode: 'NV_118', email: 'nguyenvuhuy@daklak.gov.vn', phone: '0903000118', identityCard: '003000118', departmentId: unitMap['H15.07.04.HT'], jobTitleId: jobMap['NHAN_VIEN'] },
    { firstname: 'Phùng Đình', lastname: 'Hưng', employeeCode: 'NV_119', email: 'phungdinhhung@daklak.gov.vn', phone: '0903000119', identityCard: '003000119', departmentId: unitMap['H15.07.04.HT'], jobTitleId: jobMap['NHAN_VIEN'] },
    { firstname: 'Kiều Vũ', lastname: 'Adrơng', employeeCode: 'NV_120', email: 'kieuvuadrong@daklak.gov.vn', phone: '0903000120', identityCard: '003000120', departmentId: unitMap['H15.07.04.HT'], jobTitleId: jobMap['NHAN_VIEN'] },
    { firstname: 'Nguyễn Thị Quỳnh', lastname: 'Mai', employeeCode: 'NV_121', email: 'nguyenthiquynhmai@daklak.gov.vn', phone: '0903000121', identityCard: '003000121', departmentId: unitMap['H15.07.QLCN'], jobTitleId: jobMap['NHAN_VIEN'] },
    { firstname: 'Nguyễn Quang', lastname: 'Tú', employeeCode: 'NV_122', email: 'nguyenquangtu@daklak.gov.vn', phone: '0903000122', identityCard: '003000122', departmentId: unitMap['H15.07.QLCN'], jobTitleId: jobMap['NHAN_VIEN'] },
    { firstname: 'Trần Trung', lastname: 'Thành', employeeCode: 'NV_123', email: 'trantrungthanh@daklak.gov.vn', phone: '0903000123', identityCard: '003000123', departmentId: unitMap['H15.07.QLCN'], jobTitleId: jobMap['NHAN_VIEN'] },
    { firstname: 'Nguyễn Sỹ', lastname: 'Hợp', employeeCode: 'NV_124', email: 'nguyensyhop@daklak.gov.vn', phone: '0903000124', identityCard: '003000124', departmentId: unitMap['H15.07.04.HC'], jobTitleId: jobMap['BAO_VE'] },
    { firstname: 'Nguyễn Tiến', lastname: 'Quang', employeeCode: 'NV_125', email: 'nguyentienquang@daklak.gov.vn', phone: '0903000125', identityCard: '003000125', departmentId: unitMap['H15.07.04.HC'], jobTitleId: jobMap['BAO_VE'] },


    // --- Lãnh đạo các Sở khác ---
    { firstname: 'Trương Ngọc', lastname: 'Tuấn', employeeCode: 'NV_010', email: 'truongngoctuan@daklak.gov.vn', phone: '0901000010', identityCard: '001000010', departmentId: unitMap['SO_NV'], jobTitleId: jobMap['GIAM_DOC'] },
    { firstname: 'Trần Văn', lastname: 'Tân', employeeCode: 'NV_011', email: 'tranvantan@daklak.gov.vn', phone: '0901000011', identityCard: '001000011', departmentId: unitMap['SO_TC'], jobTitleId: jobMap['GIAM_DOC'] },
    { firstname: 'Cao Đình', lastname: 'Huy', employeeCode: 'NV_012', email: 'caodinhhuy@daklak.gov.vn', phone: '0901000012', identityCard: '001000012', departmentId: unitMap['SO_XD'], jobTitleId: jobMap['GIAM_DOC'] },
  ];

  for (const e of EMPLOYEES) {
    if (!e.departmentId || !e.jobTitleId) continue;
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
  console.log(`✅ Đã seed ${EMPLOYEES.length} nhân viên HRM.`);

  console.log('🔹 Seed TaskRankTemplates theo Nghị định 335/2025/NĐ-CP...');

  await prisma.taskRankTemplate.deleteMany();

  const RANK_TEMPLATES = [
    // KHỐI CÔNG CHỨC
    { classification: 'CONG_CHUC', rank: 'SENIOR_SPECIALIST', taskName: 'Chủ trì nghiên cứu, xây dựng Nghị quyết, Quyết định quy phạm pháp luật cấp Tỉnh', defaultUnit: 'Đề án', defaultWeight: 20 },
    { classification: 'CONG_CHUC', rank: 'SENIOR_SPECIALIST', taskName: 'Chủ trì thẩm định quy hoạch, kiến trúc số, đề án liên ngành', defaultUnit: 'Văn bản thẩm định', defaultWeight: 15 },
    { classification: 'CONG_CHUC', rank: 'PRINCIPAL_SPECIALIST', taskName: 'Tham mưu biên soạn tờ trình, công văn hướng dẫn nghiệp vụ quy mô Sở', defaultUnit: 'Tờ trình', defaultWeight: 10 },
    { classification: 'CONG_CHUC', rank: 'PRINCIPAL_SPECIALIST', taskName: 'Xử lý, thẩm tra và đưa ra ý kiến pháp lý đối với phiếu chuyển, đơn thư phức tạp', defaultUnit: 'Hồ sơ', defaultWeight: 10 },
    { classification: 'CONG_CHUC', rank: 'SPECIALIST', taskName: 'Tiếp nhận, phân loại và luân chuyển văn bản đi/đến trên hệ thống iDesk', defaultUnit: 'Văn bản', defaultWeight: 5 },
    { classification: 'CONG_CHUC', rank: 'SPECIALIST', taskName: 'Trực tiếp xử lý hồ sơ dịch vụ công trực tuyến một cửa', defaultUnit: 'Hồ sơ', defaultWeight: 10 },
    { classification: 'CONG_CHUC', rank: 'OFFICER', taskName: 'Cập nhật dữ liệu, lập báo cáo thống kê định kỳ', defaultUnit: 'Báo cáo', defaultWeight: 5 },
    { classification: 'CONG_CHUC', rank: 'OFFICER', taskName: 'Soạn thảo văn bản hành chính thông thường', defaultUnit: 'Văn bản', defaultWeight: 5 },
    { classification: 'CONG_CHUC', rank: 'STAFF', taskName: 'Thực hiện công tác văn thư lưu trữ', defaultUnit: 'Hồ sơ lưu trữ', defaultWeight: 5 },
    { classification: 'CONG_CHUC', rank: 'STAFF', taskName: 'Đảm bảo cơ sở vật chất, hành chính quản trị', defaultUnit: 'Lượt', defaultWeight: 5 },

    // KHỐI VIÊN CHỨC
    { classification: 'VIEN_CHUC', rank: 'GRADE_1', taskName: 'Chủ trì đề tài nghiên cứu khoa học, công nghệ trọng điểm', defaultUnit: 'Đề tài', defaultWeight: 25 },
    { classification: 'VIEN_CHUC', rank: 'GRADE_1', taskName: 'Trực tiếp tư vấn chuyên gia, thiết kế giải pháp kỹ thuật lớn', defaultUnit: 'Báo cáo tư vấn', defaultWeight: 20 },
    { classification: 'VIEN_CHUC', rank: 'GRADE_2', taskName: 'Tham gia tổ chức thực hiện các đề án chuyên môn kỹ thuật', defaultUnit: 'Hạng mục', defaultWeight: 15 },
    { classification: 'VIEN_CHUC', rank: 'GRADE_2', taskName: 'Viết bài báo cáo khoa học, chuyên đề nghiên cứu', defaultUnit: 'Bài viết', defaultWeight: 10 },
    { classification: 'VIEN_CHUC', rank: 'GRADE_3', taskName: 'Vận hành kỹ thuật, trực giám sát an toàn thông tin hệ thống IOC / LGSP', defaultUnit: 'Ca trực', defaultWeight: 10 },
    { classification: 'VIEN_CHUC', rank: 'GRADE_3', taskName: 'Thực hiện đo lường, kiểm định theo quy trình chuẩn', defaultUnit: 'Phiếu kiểm định', defaultWeight: 5 },
    { classification: 'VIEN_CHUC', rank: 'GRADE_4', taskName: 'Ghi chép số liệu, hỗ trợ kỹ thuật viên chính', defaultUnit: 'Bản ghi', defaultWeight: 5 },
    { classification: 'VIEN_CHUC', rank: 'GRADE_4', taskName: 'Kiểm tra, bảo dưỡng thiết bị máy móc định kỳ', defaultUnit: 'Lượt', defaultWeight: 5 },
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
