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
    // Lãnh đạo Sở KHCN
    { firstname: 'Bùi Thanh', lastname: 'Toàn', employeeCode: 'NV_001', email: 'buithanhtoan@daklak.gov.vn', phone: '0901000001', identityCard: '001000001', departmentId: unitMap['SO_KHCN'], jobTitleId: jobMap['GIAM_DOC'], civilServantRankId: jobMap['CHUYEN_VIEN_CAO_CAP'], partyTitleId: jobMap['BI_THU_DANG_BO'] },
    { firstname: 'Phạm Gia', lastname: 'Việt', employeeCode: 'NV_002', email: 'phamgiaviet@daklak.gov.vn', phone: '0901000002', identityCard: '001000002', departmentId: unitMap['SO_KHCN'], jobTitleId: jobMap['PHO_GIAM_DOC'], civilServantRankId: jobMap['CHUYEN_VIEN_CHINH'], partyTitleId: jobMap['PHO_BI_THU_DANG_BO'] },
    { firstname: 'Ra Lan Trương', lastname: 'Thanh Hà', employeeCode: 'NV_003', email: 'ralantruongthanhha@daklak.gov.vn', phone: '0901000003', identityCard: '001000003', departmentId: unitMap['SO_KHCN'], jobTitleId: jobMap['PHO_GIAM_DOC'] },
    { firstname: 'Trần Văn', lastname: 'Sơn', employeeCode: 'NV_004', email: 'tranvanson@daklak.gov.vn', phone: '0901000004', identityCard: '001000004', departmentId: unitMap['SO_KHCN'], jobTitleId: jobMap['PHO_GIAM_DOC'] },
    { firstname: 'Lâm Vũ Mỹ', lastname: 'Hạnh', employeeCode: 'NV_005', email: 'lamvumyhanh@daklak.gov.vn', phone: '0901000005', identityCard: '001000005', departmentId: unitMap['SO_KHCN'], jobTitleId: jobMap['PHO_GIAM_DOC'] },

    // Lãnh đạo các phòng ban Sở KHCN
    { firstname: 'Nguyễn Văn', lastname: 'A', employeeCode: 'NV_020', email: 'nguyenvana@daklak.gov.vn', phone: '0902000020', identityCard: '002000020', departmentId: unitMap['SO_KHCN_VP'], jobTitleId: jobMap['CHANH_VAN_PHONG'], civilServantRankId: jobMap['CHUYEN_VIEN_CHINH'], partyTitleId: jobMap['DANG_UY_VIEN'] },
    { firstname: 'Lê Thị', lastname: 'B', employeeCode: 'NV_021', email: 'lethib@daklak.gov.vn', phone: '0902000021', identityCard: '002000021', departmentId: unitMap['SO_KHCN_KHTC'], jobTitleId: jobMap['TRUONG_PHONG'] },
    { firstname: 'Trần Văn', lastname: 'C', employeeCode: 'NV_022', email: 'tranvanc@daklak.gov.vn', phone: '0902000022', identityCard: '002000022', departmentId: unitMap['SO_KHCN_QLKH'], jobTitleId: jobMap['TRUONG_PHONG'] },
    { firstname: 'Phạm Thị', lastname: 'D', employeeCode: 'NV_023', email: 'phamthid@daklak.gov.vn', phone: '0902000023', identityCard: '002000023', departmentId: unitMap['SO_KHCN_CDS'], jobTitleId: jobMap['TRUONG_PHONG'] },
    { firstname: 'Hoàng Văn', lastname: 'E', employeeCode: 'NV_024', email: 'hoangvane@daklak.gov.vn', phone: '0902000024', identityCard: '002000024', departmentId: unitMap['SO_KHCN_QLCN'], jobTitleId: jobMap['TRUONG_PHONG'] },
    { firstname: 'Vũ Thị', lastname: 'F', employeeCode: 'NV_025', email: 'vuthif@daklak.gov.vn', phone: '0902000025', identityCard: '002000025', departmentId: unitMap['SO_KHCN_TDC'], jobTitleId: jobMap['TRUONG_PHONG'] },

    // Lãnh đạo các Trung tâm thuộc Sở KHCN
    { firstname: 'Đỗ Văn', lastname: 'G', employeeCode: 'NV_026', email: 'dovang@daklak.gov.vn', phone: '0902000026', identityCard: '002000026', departmentId: unitMap['TT_DMSM'], jobTitleId: jobMap['GIAM_DOC'] },
    { firstname: 'Ngô Thị', lastname: 'H', employeeCode: 'NV_027', email: 'ngothih@daklak.gov.vn', phone: '0902000027', identityCard: '002000027', departmentId: unitMap['TT_IOC'], jobTitleId: jobMap['GIAM_DOC'] },
    { firstname: 'Lý Văn', lastname: 'I', employeeCode: 'NV_028', email: 'lyvani@daklak.gov.vn', phone: '0902000028', identityCard: '002000028', departmentId: unitMap['TT_KTTDC'], jobTitleId: jobMap['GIAM_DOC'] },

    // Lãnh đạo các phòng thuộc Trung tâm
    { firstname: 'Hoàng Văn', lastname: 'HC', employeeCode: 'NV_029', email: 'truongphonghc_dmsm@daklak.gov.vn', phone: '0902000029', identityCard: '002000029', departmentId: unitMap['TT_DMSM_HC'], jobTitleId: jobMap['TRUONG_PHONG'] },
    { firstname: 'Lê Thị', lastname: 'UT', employeeCode: 'NV_030', email: 'truongphongut_dmsm@daklak.gov.vn', phone: '0902000030', identityCard: '002000030', departmentId: unitMap['TT_DMSM_UT'], jobTitleId: jobMap['TRUONG_PHONG'] },
    { firstname: 'Trần Văn', lastname: 'HC', employeeCode: 'NV_031', email: 'truongphonghc_ioc@daklak.gov.vn', phone: '0902000031', identityCard: '002000031', departmentId: unitMap['TT_IOC_HC'], jobTitleId: jobMap['TRUONG_PHONG'] },
    { firstname: 'Phạm Thị', lastname: 'CN', employeeCode: 'NV_032', email: 'truongphongcn_ioc@daklak.gov.vn', phone: '0902000032', identityCard: '002000032', departmentId: unitMap['TT_IOC_CN'], jobTitleId: jobMap['TRUONG_PHONG'] },
    { firstname: 'Nguyễn Văn', lastname: 'HC', employeeCode: 'NV_033', email: 'truongphonghc_kttdc@daklak.gov.vn', phone: '0902000033', identityCard: '002000033', departmentId: unitMap['TT_KTTDC_HC'], jobTitleId: jobMap['TRUONG_PHONG'] },
    { firstname: 'Đinh Thị', lastname: 'DL', employeeCode: 'NV_034', email: 'truongphongdl_kttdc@daklak.gov.vn', phone: '0902000034', identityCard: '002000034', departmentId: unitMap['TT_KTTDC_DL'], jobTitleId: jobMap['TRUONG_PHONG'] },
    { firstname: 'Vũ Văn', lastname: 'TN', employeeCode: 'NV_035', email: 'truongphongtn_kttdc@daklak.gov.vn', phone: '0902000035', identityCard: '002000035', departmentId: unitMap['TT_KTTDC_TN'], jobTitleId: jobMap['TRUONG_PHONG'] },

    // Thêm Phó Trưởng phòng (Ví dụ)
    { firstname: 'Trương Văn', lastname: 'Phó 1', employeeCode: 'NV_036', email: 'phochvp_khcn@daklak.gov.vn', phone: '0902000036', identityCard: '002000036', departmentId: unitMap['SO_KHCN_VP'], jobTitleId: jobMap['PHO_CHANH_VAN_PHONG'] },
    { firstname: 'Ngô Thị', lastname: 'Phó 2', employeeCode: 'NV_037', email: 'photp_khtc_khcn@daklak.gov.vn', phone: '0902000037', identityCard: '002000037', departmentId: unitMap['SO_KHCN_KHTC'], jobTitleId: jobMap['PHO_TRUONG_PHONG'] },

    // Lãnh đạo Sở khác
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
    { classification: 'CONG_CHUC', rank: 'CHUYEN_VIEN_CAO_CAP', taskName: 'Chủ trì nghiên cứu, xây dựng Nghị quyết, Quyết định quy phạm pháp luật cấp Tỉnh', defaultUnit: 'Đề án', defaultWeight: 20 },
    { classification: 'CONG_CHUC', rank: 'CHUYEN_VIEN_CAO_CAP', taskName: 'Chủ trì thẩm định quy hoạch, kiến trúc số, đề án liên ngành', defaultUnit: 'Văn bản thẩm định', defaultWeight: 15 },
    { classification: 'CONG_CHUC', rank: 'CHUYEN_VIEN_CHINH', taskName: 'Tham mưu biên soạn tờ trình, công văn hướng dẫn nghiệp vụ quy mô Sở', defaultUnit: 'Tờ trình', defaultWeight: 10 },
    { classification: 'CONG_CHUC', rank: 'CHUYEN_VIEN_CHINH', taskName: 'Xử lý, thẩm tra và đưa ra ý kiến pháp lý đối với phiếu chuyển, đơn thư phức tạp', defaultUnit: 'Hồ sơ', defaultWeight: 10 },
    { classification: 'CONG_CHUC', rank: 'CHUYEN_VIEN', taskName: 'Tiếp nhận, phân loại và luân chuyển văn bản đi/đến trên hệ thống iDesk', defaultUnit: 'Văn bản', defaultWeight: 5 },
    { classification: 'CONG_CHUC', rank: 'CHUYEN_VIEN', taskName: 'Trực tiếp xử lý hồ sơ dịch vụ công trực tuyến một cửa', defaultUnit: 'Hồ sơ', defaultWeight: 10 },
    { classification: 'CONG_CHUC', rank: 'CAN_SU', taskName: 'Cập nhật dữ liệu, lập báo cáo thống kê định kỳ', defaultUnit: 'Báo cáo', defaultWeight: 5 },
    { classification: 'CONG_CHUC', rank: 'CAN_SU', taskName: 'Soạn thảo văn bản hành chính thông thường', defaultUnit: 'Văn bản', defaultWeight: 5 },
    { classification: 'CONG_CHUC', rank: 'NHAN_VIEN', taskName: 'Thực hiện công tác văn thư lưu trữ', defaultUnit: 'Hồ sơ lưu trữ', defaultWeight: 5 },
    { classification: 'CONG_CHUC', rank: 'NHAN_VIEN', taskName: 'Đảm bảo cơ sở vật chất, hành chính quản trị', defaultUnit: 'Lượt', defaultWeight: 5 },

    // KHỐI VIÊN CHỨC
    { classification: 'VIEN_CHUC', rank: 'VIEN_CHUC_HANG_1', taskName: 'Chủ trì đề tài nghiên cứu khoa học, công nghệ trọng điểm', defaultUnit: 'Đề tài', defaultWeight: 25 },
    { classification: 'VIEN_CHUC', rank: 'VIEN_CHUC_HANG_1', taskName: 'Trực tiếp tư vấn chuyên gia, thiết kế giải pháp kỹ thuật lớn', defaultUnit: 'Báo cáo tư vấn', defaultWeight: 20 },
    { classification: 'VIEN_CHUC', rank: 'VIEN_CHUC_HANG_2', taskName: 'Tham gia tổ chức thực hiện các đề án chuyên môn kỹ thuật', defaultUnit: 'Hạng mục', defaultWeight: 15 },
    { classification: 'VIEN_CHUC', rank: 'VIEN_CHUC_HANG_2', taskName: 'Viết bài báo cáo khoa học, chuyên đề nghiên cứu', defaultUnit: 'Bài viết', defaultWeight: 10 },
    { classification: 'VIEN_CHUC', rank: 'VIEN_CHUC_HANG_3', taskName: 'Vận hành kỹ thuật, trực giám sát an toàn thông tin hệ thống IOC / LGSP', defaultUnit: 'Ca trực', defaultWeight: 10 },
    { classification: 'VIEN_CHUC', rank: 'VIEN_CHUC_HANG_3', taskName: 'Thực hiện đo lường, kiểm định theo quy trình chuẩn', defaultUnit: 'Phiếu kiểm định', defaultWeight: 5 },
    { classification: 'VIEN_CHUC', rank: 'VIEN_CHUC_HANG_4', taskName: 'Ghi chép số liệu, hỗ trợ kỹ thuật viên chính', defaultUnit: 'Bản ghi', defaultWeight: 5 },
    { classification: 'VIEN_CHUC', rank: 'VIEN_CHUC_HANG_4', taskName: 'Kiểm tra, bảo dưỡng thiết bị máy móc định kỳ', defaultUnit: 'Lượt', defaultWeight: 5 },
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
