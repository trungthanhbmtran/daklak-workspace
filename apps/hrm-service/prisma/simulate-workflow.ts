import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import 'dotenv/config';
import type { PrismaClient as PrismaClientType } from '../src/generated/prisma/client';

let PrismaClient: typeof PrismaClientType;
try {
  PrismaClient = require('../src/generated/prisma/client').PrismaClient;
} catch (e) {
  PrismaClient = require('../src/generated/prisma/client').PrismaClient;
}

const dbUrl = process.env.DATABASE_URL || 'mysql://root:mypassword@localhost:3306/admin_hrm';
const mariadbUrl = dbUrl.replace(/^mysql:\/\//, 'mariadb://');
const adapter = new PrismaMariaDb(mariadbUrl);
const prisma = new PrismaClient({ adapter });

// Client kết nối cơ sở dữ liệu admin_report
const reportDbUrl = dbUrl.replace('/admin_hrm', '/admin_report');
const reportMariadbUrl = reportDbUrl.replace(/^mysql:\/\//, 'mariadb://');
const reportAdapter = new PrismaMariaDb(reportMariadbUrl);
const reportPrisma = new PrismaClient({ adapter: reportAdapter });

export async function simulateWorkflow() {
  console.log('🚀 =========================================================================');
  console.log('🚀 BẮT ĐẦU MÔ PHỎNG TOÀN DIỆN VÒNG ĐỜI NGHIỆP VỤ (NHÂN VIÊN - CHUYÊN VIÊN - LÃNH ĐẠO)');
  console.log('🚀 ĐƠN VỊ: BAN TỔ CHỨC TỈNH ỦY ĐẮK LẮK (BTCTU_DAKLAK)');
  console.log('🚀 CĂN CỨ: QUY ĐỊNH 01-QĐ/BTCTU, HƯỚNG DẪN 05-HD/TU & QUY ĐỊNH 348-QĐ/BTCTW');
  console.log('🚀 =========================================================================\n');

  try {
    const organizationId = 'DEFAULT';

    // ─────────────────────────────────────────────────────────────────────────
    // GIAI ĐOẠN 1: KHỞI TẠO KẾ HOẠCH CÔNG TÁC (MASTER PLAN)
    // ─────────────────────────────────────────────────────────────────────────
    console.log('📋 [Giai đoạn 1] Khởi tạo Kế hoạch công tác năm 2026...');
    let planQ1 = await prisma.masterPlan.findFirst({
      where: { title: 'Kế hoạch Công tác Quý I/2026 - Ban Tổ chức Tỉnh ủy Đắk Lắk' },
    });
    if (!planQ1) {
      planQ1 = await prisma.masterPlan.create({
        data: {
          title: 'Kế hoạch Công tác Quý I/2026 - Ban Tổ chức Tỉnh ủy Đắk Lắk',
          description: 'Kế hoạch triển khai nhiệm vụ chính trị trọng tâm quý I/2026 theo Nghị quyết Tỉnh ủy',
          startDate: new Date('2026-01-01'),
          endDate: new Date('2026-03-31'),
          status: 'ACTIVE',
          organizationId,
        },
      });
    }

    let planQ4 = await prisma.masterPlan.findFirst({
      where: { title: 'Kế hoạch Trọng tâm Quý IV/2026 - Chuẩn bị Đại hội Đảng bộ tỉnh' },
    });
    if (!planQ4) {
      planQ4 = await prisma.masterPlan.create({
        data: {
          title: 'Kế hoạch Trọng tâm Quý IV/2026 - Chuẩn bị Đại hội Đảng bộ tỉnh',
          description: 'Kế hoạch rà soát quy hoạch, thẩm định nhân sự Đại hội Đảng bộ tỉnh nhiệm kỳ 2025 - 2030',
          startDate: new Date('2026-10-01'),
          endDate: new Date('2026-12-31'),
          status: 'ACTIVE',
          organizationId,
        },
      });
    }
    console.log(`✅ Đã khởi tạo 02 Kế hoạch công tác (Plan #${planQ1.id} & Plan #${planQ4.id}).`);

    // ─────────────────────────────────────────────────────────────────────────
    // GIAI ĐOẠN 2: LẤY KỲ ĐÁNH GIÁ (KPI PERIOD) & BỘ LUẬT (RULE SET)
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n⚖️ [Giai đoạn 2] Tra cứu Kỳ đánh giá & Bộ luật KPI/OKR...');
    let periodQ1 = await prisma.kpiPeriod.findFirst({
      where: { name: 'Quý I/2026' },
    });
    if (!periodQ1) {
      periodQ1 = await prisma.kpiPeriod.create({
        data: {
          name: 'Quý I/2026',
          startDate: new Date('2026-01-01'),
          endDate: new Date('2026-03-31'),
          organizationId,
        },
      });
    }

    let ruleSet = await prisma.kpiRuleSet.findFirst({
      where: { unitId: 'BTCTU_DAKLAK', isActive: true },
    });
    if (!ruleSet) {
      ruleSet = await prisma.kpiRuleSet.create({
        data: {
          unitId: 'BTCTU_DAKLAK',
          version: 'v1.2026',
          isActive: true,
          maxGeneralScore: 30.0,
          maxTaskScore: 70.0,
          bonusThresholdPct: 10.0,
          maxBonusPct: 120.0,
        },
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GIAI ĐOẠN 3: XÂY DỰNG DANH MỤC CÔNG VIỆC MÔ PHỎNG 3 VAI TRÒ
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n💼 [Giai đoạn 3] Xây dựng và mô phỏng 35+ nhiệm vụ thực tế theo 3 vai trò...');

    const simulatedTasks = [
      // === KHỐI LÃNH ĐẠO BAN (05 Lãnh đạo Ban - Giao việc & Tham mưu Đề án trọng tâm) ===
      {
        title: 'Chỉ đạo xây dựng Đề án nhân sự Ban Chấp hành Đảng bộ tỉnh khóa XVIII, nhiệm kỳ 2025 - 2030',
        description: 'Tham mưu Ban Thường vụ Tỉnh ủy rà soát, đánh giá nguồn nhân sự, xây dựng phương án nhân sự cấp ủy khóa mới',
        status: 'COMPLETED',
        progress: 100,
        priority: 'URGENT',
        creator: 'BTCTU_001',
        assignee: 'BTCTU_001',
        approver: 'BTCTU_001',
        deptId: 56,
        deptName: 'Lãnh đạo Ban',
        planId: planQ4.id,
        startDate: '2026-10-01',
        dueDate: '2026-11-15',
        completedAt: '2026-11-10T16:00:00Z',
        isOverdue: 'Đúng hạn',
        domainCode: 'DOM_THAM_MUU',
        difficultyK: 5.0,
        isOutstanding: true,
        steps: [
          'Rà soát quy hoạch cấp ủy và các chức danh lãnh đạo chủ chốt',
          'Khảo sát nhân sự tái cử và nhân sự tham gia lần đầu',
          'Dự thảo báo cáo tổng thể công tác nhân sự trình Thường trực Tỉnh ủy',
          'Hoàn thiện hồ sơ nhân sự trình Ban Thường vụ Tỉnh ủy thông qua',
        ],
        kpiScore: 70.0,
        generalScore: 30.0,
        rank: 'Hoàn thành xuất sắc nhiệm vụ',
        mau04: 'Có (Đề án 01-ĐA/TU)',
      },
      {
        title: 'Chỉ đạo xây dựng Đề án vị trí việc làm (VTVL) và cơ cấu ngạch công chức cơ quan Đảng theo QĐ 01-QĐ/BTCTU',
        description: 'Định biên 22 vị trí việc làm 05 phòng chuyên môn trực thuộc Ban Tổ chức Tỉnh ủy theo chuẩn khung năng lực',
        status: 'COMPLETED',
        progress: 100,
        priority: 'HIGH',
        creator: 'BTCTU_001',
        assignee: 'BTCTU_002',
        approver: 'BTCTU_001',
        deptId: 56,
        deptName: 'Lãnh đạo Ban',
        planId: planQ1.id,
        startDate: '2026-01-05',
        dueDate: '2026-02-28',
        completedAt: '2026-02-25T17:30:00Z',
        isOverdue: 'Đúng hạn',
        domainCode: 'DOM_THAM_MUU',
        difficultyK: 4.5,
        isOutstanding: true,
        steps: [
          'Khảo sát khối lượng công việc thực tế tại 05 phòng chuyên môn',
          'Xây dựng bản mô tả công việc và khung năng lực cho 22 VTVL',
          'Họp thẩm định với Lãnh đạo Ban và các Trưởng phòng',
          'Trình Trưởng ban ký ban hành Quyết định phê duyệt đề án VTVL',
        ],
        kpiScore: 68.5,
        generalScore: 29.5,
        rank: 'Hoàn thành xuất sắc nhiệm vụ',
        mau04: 'Có (Mô hình VTVL)',
      },
      {
        title: 'Chỉ đạo triển khai kết nối Trục liên thông Sổ tay Đảng viên điện tử tỉnh Đắk Lắk qua NDXP/LGSP',
        description: 'Tích hợp cơ sở dữ liệu đảng viên với nền tảng Sổ tay Đảng viên điện tử toàn quốc bảo đảm an toàn dữ liệu',
        status: 'COMPLETED',
        progress: 100,
        priority: 'HIGH',
        creator: 'BTCTU_001',
        assignee: 'BTCTU_003',
        approver: 'BTCTU_001',
        deptId: 56,
        deptName: 'Lãnh đạo Ban',
        planId: planQ1.id,
        startDate: '2026-01-10',
        dueDate: '2026-03-20',
        completedAt: '2026-03-18T10:00:00Z',
        isOverdue: 'Đúng hạn',
        domainCode: 'DOM_TCD_DV',
        difficultyK: 4.0,
        isOutstanding: false,
        steps: [
          'Thống nhất kiến trúc giao tiếp API với Đơn vị cung cấp giải pháp',
          'Kiểm thử đồng bộ dữ liệu trên môi trường Staging',
          'Tập huấn cán bộ quản trị tại các Đảng bộ trực thuộc tỉnh',
          'Kích hoạt vận hành chính thức trên toàn tỉnh',
        ],
        kpiScore: 66.0,
        generalScore: 28.5,
        rank: 'Hoàn thành tốt nhiệm vụ',
        mau04: 'Không',
      },
      {
        title: 'Chỉ đạo công tác thẩm tra, xác minh lịch sử chính trị và chính trị hiện nay phục vụ quy hoạch cán bộ',
        description: 'Bảo đảm tiêu chuẩn chính trị tuyệt đối theo Quy định 348-QĐ/BTCTW đối với 120 hồ sơ cán bộ dự nguồn',
        status: 'COMPLETED',
        progress: 100,
        priority: 'URGENT',
        creator: 'BTCTU_001',
        assignee: 'BTCTU_004',
        approver: 'BTCTU_001',
        deptId: 56,
        deptName: 'Lãnh đạo Ban',
        planId: planQ1.id,
        startDate: '2026-01-15',
        dueDate: '2026-03-25',
        completedAt: '2026-03-22T15:00:00Z',
        isOverdue: 'Đúng hạn',
        domainCode: 'DOM_BVCTNB',
        difficultyK: 4.5,
        isOutstanding: false,
        steps: [
          'Tiếp nhận hồ sơ trích ngang từ các Huyện ủy, Thị ủy, Thành ủy',
          'Phân công chuyên viên thẩm tra xác minh tại địa bàn cư trú',
          'Lấy ý kiến cơ quan an ninh và các cơ quan tư pháp',
          'Tổng hợp kết luận thẩm định tiêu chuẩn chính trị báo cáo Lãnh đạo Ban',
        ],
        kpiScore: 65.5,
        generalScore: 28.0,
        rank: 'Hoàn thành tốt nhiệm vụ',
        mau04: 'Không',
      },
      {
        title: 'Chỉ đạo xây dựng Kế hoạch đào tạo, bồi dưỡng cán bộ, công chức tỉnh Đắk Lắk năm 2026',
        description: 'Xác định nhu cầu bồi dưỡng lý luận chính trị cao cấp, trung cấp và cập nhật kiến thức mới cho cán bộ lãnh đạo',
        status: 'COMPLETED',
        progress: 100,
        priority: 'MEDIUM',
        creator: 'BTCTU_001',
        assignee: 'BTCTU_005',
        approver: 'BTCTU_001',
        deptId: 56,
        deptName: 'Lãnh đạo Ban',
        planId: planQ1.id,
        startDate: '2026-01-08',
        dueDate: '2026-02-28',
        completedAt: '2026-02-26T11:00:00Z',
        isOverdue: 'Đúng hạn',
        domainCode: 'DOM_DAOTAO_CS',
        difficultyK: 4.0,
        isOutstanding: false,
        steps: [
          'Thu thập chỉ tiêu phân bổ từ Học viện Chính trị Quốc gia Hồ Chí Minh',
          'Khảo sát nhu cầu đào tạo từ 15 huyện, thị xã, thành phố',
          'Xây dựng kế hoạch và dự toán kinh phí bồi dưỡng',
          'Trình Ban Thường vụ Tỉnh ủy phê duyệt Kế hoạch năm',
        ],
        kpiScore: 66.5,
        generalScore: 28.5,
        rank: 'Hoàn thành tốt nhiệm vụ',
        mau04: 'Không',
      },

      // === PHÒNG TỔ CHỨC CÁN BỘ (P_TCCB) ===
      {
        title: 'Chủ trì rà soát biên chế và hợp đồng lao động theo NĐ 111/2022/NĐ-CP tại các cơ quan Đảng',
        description: 'Thẩm định hồ sơ biên chế công chức và viên chức hưởng lương ngân sách nhà nước năm 2026',
        status: 'COMPLETED',
        progress: 100,
        priority: 'HIGH',
        creator: 'BTCTU_002',
        assignee: 'BTCTU_010',
        approver: 'BTCTU_002',
        deptId: 58,
        deptName: 'Phòng Tổ chức cán bộ',
        planId: planQ1.id,
        startDate: '2026-01-10',
        dueDate: '2026-03-15',
        completedAt: '2026-03-12T16:30:00Z',
        isOverdue: 'Đúng hạn',
        domainCode: 'DOM_THAM_MUU',
        difficultyK: 3.5,
        isOutstanding: true,
        steps: [
          'Tiếp nhận báo cáo biên chế từ 24 cơ quan, đơn vị khối Đảng',
          'Kiểm tra định mức VTVL và chỉ tiêu tinh giản biên chế',
          'Dự thảo báo cáo tổng hợp chỉ tiêu biên chế năm 2026',
          'Bảo vệ đề xuất trước Hội đồng biên chế tỉnh',
        ],
        kpiScore: 68.0,
        generalScore: 29.0,
        rank: 'Hoàn thành xuất sắc nhiệm vụ',
        mau04: 'Có (Đề án Biên chế)',
      },
      {
        title: 'Thẩm định hồ sơ bổ nhiệm cán bộ lãnh đạo diện BTV Tỉnh ủy quản lý (Mẫu 2C)',
        description: 'Thẩm định tiêu chuẩn, ngạch bậc, điều kiện văn bằng chứng chỉ cho 10 hồ sơ cán bộ chủ chốt',
        status: 'COMPLETED',
        progress: 100,
        priority: 'URGENT',
        creator: 'BTCTU_010',
        assignee: 'BTCTU_013',
        approver: 'BTCTU_010',
        deptId: 58,
        deptName: 'Phòng Tổ chức cán bộ',
        planId: planQ1.id,
        startDate: '2026-02-01',
        dueDate: '2026-02-15',
        completedAt: '2026-02-14T14:00:00Z',
        isOverdue: 'Đúng hạn',
        domainCode: 'DOM_THAM_DINH',
        difficultyK: 3.0,
        isOutstanding: false,
        steps: [
          'Kiểm tra tính pháp lý hồ sơ Mẫu 2C/TCTW',
          'Đối chiếu quy hoạch và điều kiện tiêu chuẩn chức danh',
          'Dự thảo Tờ trình Ban Thường vụ Tỉnh ủy',
          'Trình Lãnh đạo phòng duyệt ký phiếu thẩm định',
        ],
        kpiScore: 70.0,
        generalScore: 29.5,
        rank: 'Hoàn thành xuất sắc nhiệm vụ',
        mau04: 'Không',
      },
      {
        title: 'Kiểm tra, làm sạch dữ liệu hồ sơ cán bộ công chức trên phần mềm quản lý 2C',
        description: 'Chuẩn hóa mã số cán bộ, cập nhật quá trình công tác và kê khai tài sản thu nhập cho 100% cán bộ',
        status: 'COMPLETED',
        progress: 100,
        priority: 'MEDIUM',
        creator: 'BTCTU_010',
        assignee: 'BTCTU_013',
        approver: 'BTCTU_010',
        deptId: 58,
        deptName: 'Phòng Tổ chức cán bộ',
        planId: planQ1.id,
        startDate: '2026-01-15',
        dueDate: '2026-02-25',
        completedAt: '2026-02-20T17:00:00Z',
        isOverdue: 'Đúng hạn',
        domainCode: 'DOM_THAM_MUU',
        difficultyK: 2.0,
        isOutstanding: false,
        steps: [
          'Xuất dữ liệu toàn bộ cán bộ từ CSDL phần mềm 2C',
          'Đối soát các trường thông tin thiếu và sai lệch',
          'Liên hệ cơ sở bổ sung hồ sơ chứng thực',
          'Khóa dữ liệu chuẩn hóa quý I/2026',
        ],
        kpiScore: 68.0,
        generalScore: 28.5,
        rank: 'Hoàn thành tốt nhiệm vụ',
        mau04: 'Không',
      },
      {
        title: 'Dự thảo Hướng dẫn đánh giá xếp loại chất lượng cán bộ hằng quý (Hướng dẫn 05-HD/TU)',
        description: 'Xây dựng bộ công cụ lượng hóa KPI/OKR và quy chế khen thưởng cán bộ, công chức cơ quan Đảng',
        status: 'COMPLETED',
        progress: 100,
        priority: 'HIGH',
        creator: 'BTCTU_002',
        assignee: 'BTCTU_013',
        approver: 'BTCTU_002',
        deptId: 58,
        deptName: 'Phòng Tổ chức cán bộ',
        planId: planQ1.id,
        startDate: '2026-02-01',
        dueDate: '2026-02-28',
        completedAt: '2026-02-24T09:30:00Z',
        isOverdue: 'Đúng hạn',
        domainCode: 'DOM_THAM_MUU',
        difficultyK: 4.0,
        isOutstanding: true,
        steps: [
          'Nghiên cứu Quy định 39-QĐ/TU và Hướng dẫn của Ban Tổ chức Trung ương',
          'Dự thảo khung tiêu chí 30 điểm chung và 70 điểm nhiệm vụ',
          'Lấy ý kiến góp ý của 05 phòng chuyên môn trực thuộc',
          'Trình Thường trực Ban phê duyệt ban hành Hướng dẫn',
        ],
        kpiScore: 70.0,
        generalScore: 29.5,
        rank: 'Hoàn thành xuất sắc nhiệm vụ',
        mau04: 'Có (HD 05-HD/TU)',
      },
      {
        title: 'Tổng hợp số liệu và phân tích cơ cấu cán bộ nữ, cán bộ trẻ, cán bộ DTTS diện BTVTU quản lý',
        description: 'Báo cáo chuyên đề phục vụ đề án chuẩn bị nhân sự Đại hội Đảng bộ tỉnh nhiệm kỳ 2025 - 2030',
        status: 'COMPLETED',
        progress: 100,
        priority: 'MEDIUM',
        creator: 'BTCTU_010',
        assignee: 'BTCTU_012',
        approver: 'BTCTU_010',
        deptId: 58,
        deptName: 'Phòng Tổ chức cán bộ',
        planId: planQ1.id,
        startDate: '2026-02-10',
        dueDate: '2026-03-10',
        completedAt: '2026-03-08T15:30:00Z',
        isOverdue: 'Đúng hạn',
        domainCode: 'DOM_THAM_MUU',
        difficultyK: 2.5,
        isOutstanding: false,
        steps: [
          'Thống kê số lượng cán bộ nữ, cán bộ trẻ dưới 40 tuổi và cán bộ người DTTS',
          'So sánh với chỉ tiêu Nghị quyết số 26-NQ/TW của Ban Chấp hành Trung ương',
          'Dự thảo báo cáo đánh giá thực trạng và đề xuất giải pháp tạo nguồn',
          'Báo cáo Trưởng phòng Tổ chức cán bộ',
        ],
        kpiScore: 66.0,
        generalScore: 28.5,
        rank: 'Hoàn thành tốt nhiệm vụ',
        mau04: 'Không',
      },
      {
        title: 'Thẩm định hồ sơ nâng bậc lương trước thời hạn do lập thành tích xuất sắc năm 2025',
        description: 'Xem xét hồ sơ thành tích khen thưởng của 35 cán bộ, công chức cơ quan Đảng và đoàn thể tỉnh',
        status: 'IN_PROGRESS',
        progress: 75,
        priority: 'MEDIUM',
        creator: 'BTCTU_010',
        assignee: 'BTCTU_012',
        approver: 'BTCTU_010',
        deptId: 58,
        deptName: 'Phòng Tổ chức cán bộ',
        planId: planQ1.id,
        startDate: '2026-03-01',
        dueDate: '2026-03-31',
        completedAt: null,
        isOverdue: 'Đúng hạn',
        domainCode: 'DOM_THAM_DINH',
        difficultyK: 2.0,
        isOutstanding: false,
        steps: [
          'Tiếp nhận hồ sơ đề nghị từ Hội đồng thi đua các đơn vị',
          'Kiểm tra văn bản khen thưởng và xếp loại cán bộ 3 năm liên tục',
          'Lập danh sách đối chiếu tỷ lệ khống chế 10% biên chế',
          'Trình Hội đồng nâng lương Ban Tổ chức Tỉnh ủy xét duyệt',
        ],
        kpiScore: 65.0,
        generalScore: 28.0,
        rank: 'Hoàn thành tốt nhiệm vụ',
        mau04: 'Không',
      },

      // === PHÒNG TỔ CHỨC CƠ SỞ ĐẢNG VÀ ĐẢNG VIÊN (P_TCD_DV) ===
      {
        title: 'Chủ trì thẩm định danh sách đề nghị trao tặng Huy hiệu 30, 40, 50 năm tuổi Đảng đợt 03/02/2026',
        description: 'Thẩm định hồ sơ của 450 đảng viên trên toàn tỉnh bảo đảm đúng quy trình Điều lệ Đảng',
        status: 'COMPLETED',
        progress: 100,
        priority: 'HIGH',
        creator: 'BTCTU_003',
        assignee: 'BTCTU_006',
        approver: 'BTCTU_003',
        deptId: 57,
        deptName: 'Phòng Tổ chức đảng, đảng viên',
        planId: planQ1.id,
        startDate: '2026-01-05',
        dueDate: '2026-01-25',
        completedAt: '2026-01-22T16:00:00Z',
        isOverdue: 'Đúng hạn',
        domainCode: 'DOM_TCD_DV',
        difficultyK: 3.0,
        isOutstanding: false,
        steps: [
          'Tổng hợp danh sách đề nghị từ 15 Huyện ủy, Thị ủy, Thành ủy',
          'Kiểm tra hồ sơ kết nạp gốc và sổ đảng viên',
          'Dự thảo Quyết định tặng Huy hiệu Đảng của Ban Thường vụ Tỉnh ủy',
          'Bàn giao huy hiệu và quyết định cho các Đảng bộ cơ sở',
        ],
        kpiScore: 68.0,
        generalScore: 29.0,
        rank: 'Hoàn thành xuất sắc nhiệm vụ',
        mau04: 'Không',
      },
      {
        title: 'Làm sạch CSDL Đảng viên và đồng bộ Sổ tay Đảng viên điện tử qua trục LGSP',
        description: 'Làm sạch thông tin số định danh cá nhân, quê quán, ngày vào Đảng cho 85.000 đảng viên toàn tỉnh',
        status: 'COMPLETED',
        progress: 100,
        priority: 'HIGH',
        creator: 'BTCTU_006',
        assignee: 'BTCTU_009',
        approver: 'BTCTU_006',
        deptId: 57,
        deptName: 'Phòng Tổ chức đảng, đảng viên',
        planId: planQ1.id,
        startDate: '2026-01-15',
        dueDate: '2026-03-15',
        completedAt: '2026-03-10T14:30:00Z',
        isOverdue: 'Đúng hạn',
        domainCode: 'DOM_TCD_DV',
        difficultyK: 2.5,
        isOutstanding: false,
        steps: [
          'Chạy script đối soát trùng lặp CCCD/CMND trên CSDL Đảng viên',
          'Thông báo danh sách sai lệch về Đảng ủy xã, phường xác nhận',
          'Cập nhật trường dữ liệu chuẩn vào hệ thống',
          'Đồng bộ dữ liệu sang nền tảng Sổ tay Đảng viên điện tử',
        ],
        kpiScore: 63.5,
        generalScore: 28.0,
        rank: 'Hoàn thành tốt nhiệm vụ',
        mau04: 'Không',
      },
      {
        title: 'Xử lý kỹ thuật và hỗ trợ các Đảng bộ cơ sở kết nối phần mềm Quản lý CSDL Đảng viên 3.0',
        description: 'Hỗ trợ 25 cán bộ văn thư - tổ chức cấp huyện và cơ sở tháo gỡ vướng mắc đường truyền mạng nội bộ Đảng',
        status: 'IN_PROGRESS',
        progress: 80,
        priority: 'MEDIUM',
        creator: 'BTCTU_006',
        assignee: 'BTCTU_009',
        approver: 'BTCTU_006',
        deptId: 57,
        deptName: 'Phòng Tổ chức đảng, đảng viên',
        planId: planQ1.id,
        startDate: '2026-02-15',
        dueDate: '2026-03-31',
        completedAt: null,
        isOverdue: 'Đúng hạn',
        domainCode: 'DOM_TCD_DV',
        difficultyK: 2.0,
        isOutstanding: false,
        steps: [
          'Kiểm tra chứng thư số và tài khoản bảo mật của các cơ sở',
          'Xử lý lỗi cấp phát thẻ đảng viên và in danh sách',
          'Cập nhật bản vá bảo mật phần mềm',
          'Đánh giá chỉ số sẵn sàng kỹ thuật của từng đơn vị',
        ],
        kpiScore: 64.0,
        generalScore: 28.0,
        rank: 'Hoàn thành tốt nhiệm vụ',
        mau04: 'Không',
      },
      {
        title: 'Tổng hợp tình hình phát triển đảng viên và xóa tên đảng viên bỏ sinh hoạt đảng quý I/2026',
        description: 'Phân tích số liệu kết nạp đảng viên là học sinh, sinh viên, công nhân và khu vực tôn giáo',
        status: 'COMPLETED',
        progress: 100,
        priority: 'MEDIUM',
        creator: 'BTCTU_006',
        assignee: 'BTCTU_008',
        approver: 'BTCTU_006',
        deptId: 57,
        deptName: 'Phòng Tổ chức đảng, đảng viên',
        planId: planQ1.id,
        startDate: '2026-03-01',
        dueDate: '2026-03-25',
        completedAt: '2026-03-24T11:00:00Z',
        isOverdue: 'Đúng hạn',
        domainCode: 'DOM_TCD_DV',
        difficultyK: 2.5,
        isOutstanding: false,
        steps: [
          'Thu nhận biểu mẫu thống kê định kỳ từ các Đảng bộ trực thuộc',
          'Kiểm tra tính hợp lệ các trường hợp xóa tên và xin ra khỏi Đảng',
          'Xây dựng biểu đồ phân tích tăng trưởng đảng viên',
          'Báo cáo Trưởng phòng Tổ chức đảng, đảng viên',
        ],
        kpiScore: 66.5,
        generalScore: 28.5,
        rank: 'Hoàn thành tốt nhiệm vụ',
        mau04: 'Không',
      },

      // === PHÒNG BẢO VỆ CHÍNH TRỊ NỘI BỘ (P_BVCTNB) ===
      {
        title: 'Thẩm tra lý lịch cán bộ phục vụ bổ nhiệm lãnh đạo cấp sở và tương đương (CSDL Mức 3)',
        description: 'Thẩm tra xác minh lịch sử chính trị và các mối quan hệ xã hội phức tạp bảo đảm đúng Quy định 348',
        status: 'COMPLETED',
        progress: 100,
        priority: 'URGENT',
        creator: 'BTCTU_004',
        assignee: 'BTCTU_017',
        approver: 'BTCTU_014',
        deptId: 59,
        deptName: 'Phòng Bảo vệ chính trị nội bộ',
        planId: planQ1.id,
        startDate: '2026-01-20',
        dueDate: '2026-02-28',
        completedAt: '2026-02-24T17:00:00Z',
        isOverdue: 'Đúng hạn',
        domainCode: 'DOM_BVCTNB',
        difficultyK: 4.0,
        isOutstanding: false,
        steps: [
          'Nghiên cứu hồ sơ lý lịch gốc của cán bộ',
          'Xác minh thực tế tại quê quán và nơi công tác trước đây',
          'Phối hợp với cơ quan An ninh điều tra thẩm định thông tin',
          'Lập biên bản kết luận tiêu chuẩn chính trị Mức 3',
        ],
        kpiScore: 68.5,
        generalScore: 29.5,
        rank: 'Hoàn thành xuất sắc nhiệm vụ',
        mau04: 'Không',
      },
      {
        title: 'Quản trị cơ sở dữ liệu hồ sơ Bảo vệ chính trị nội bộ Mức 3 (Bảo mật tuyệt mật theo QĐ 348)',
        description: 'Lưu trữ, sao lưu mã hóa hồ sơ bảo vệ chính trị nội bộ trên máy trạm cô lập không kết nối Internet',
        status: 'COMPLETED',
        progress: 100,
        priority: 'HIGH',
        creator: 'BTCTU_014',
        assignee: 'BTCTU_016',
        approver: 'BTCTU_014',
        deptId: 59,
        deptName: 'Phòng Bảo vệ chính trị nội bộ',
        planId: planQ1.id,
        startDate: '2026-01-10',
        dueDate: '2026-03-20',
        completedAt: '2026-03-15T15:00:00Z',
        isOverdue: 'Đúng hạn',
        domainCode: 'DOM_BVCTNB',
        difficultyK: 3.5,
        isOutstanding: false,
        steps: [
          'Kiểm tra tính toàn vẹn chữ ký số và dữ liệu mã hóa AES-256',
          'Số hóa tài liệu mật và lưu trữ kho điện tử chuyên dụng',
          'Lập nhật ký truy cập hệ thống bảo mật mức 3',
          'Báo cáo hiện trạng an toàn dữ liệu định kỳ',
        ],
        kpiScore: 67.0,
        generalScore: 29.0,
        rank: 'Hoàn thành tốt nhiệm vụ',
        mau04: 'Không',
      },
      {
        title: 'Xác minh đơn thư phản ánh về tiêu chuẩn chính trị của cán bộ quy hoạch cấp ủy cơ sở',
        description: 'Xác minh nội dung đơn thư nặc danh và có danh phản ánh tư tưởng chính trị và vi phạm Điều lệ Đảng',
        status: 'IN_PROGRESS',
        progress: 70,
        priority: 'HIGH',
        creator: 'BTCTU_014',
        assignee: 'BTCTU_015',
        approver: 'BTCTU_014',
        deptId: 59,
        deptName: 'Phòng Bảo vệ chính trị nội bộ',
        planId: planQ1.id,
        startDate: '2026-02-15',
        dueDate: '2026-03-31',
        completedAt: null,
        isOverdue: 'Đúng hạn',
        domainCode: 'DOM_BVCTNB',
        difficultyK: 3.0,
        isOutstanding: false,
        steps: [
          'Phân loại đơn thư và đề xuất kế hoạch thẩm tra xác minh',
          'Làm việc với người phản ánh và các tổ chức đảng liên quan',
          'Thu thập tài liệu chứng cứ khách quan',
          'Dự thảo báo cáo kết luận xử lý đơn thư',
        ],
        kpiScore: 65.0,
        generalScore: 28.5,
        rank: 'Hoàn thành tốt nhiệm vụ',
        mau04: 'Không',
      },

      // === VĂN PHÒNG BAN (VAN_PHONG) ===
      {
        title: 'Nâng cấp giải pháp bảo đảm an toàn thông tin Cấp độ 3 cho hệ thống thông tin Ban Tổ chức Tỉnh ủy',
        description: 'Thiết lập tường lửa thế hệ mới (NGFW), hệ thống giám sát SIEM và phòng chống mã độc tập trung',
        status: 'COMPLETED',
        progress: 100,
        priority: 'URGENT',
        creator: 'BTCTU_018',
        assignee: 'BTCTU_020',
        approver: 'BTCTU_018',
        deptId: 60,
        deptName: 'Văn phòng Ban',
        planId: planQ1.id,
        startDate: '2026-01-10',
        dueDate: '2026-03-01',
        completedAt: '2026-02-26T14:00:00Z',
        isOverdue: 'Đúng hạn',
        domainCode: 'DOM_IT_ATTT',
        difficultyK: 4.0,
        isOutstanding: true,
        steps: [
          'Rà quét lỗ hổng bảo mật toàn bộ máy chủ và thiết bị mạng',
          'Triển khai chứng chỉ bảo mật SSL/TLS và VPN phân quyền PBAC',
          'Diễn tập ứng cứu sự cố tấn công mạng giả định',
          'Nghiệm thu hồ sơ đề xuất Cấp độ 3 theo Thông tư 12/2022/TT-BTTTT',
        ],
        kpiScore: 70.0,
        generalScore: 29.5,
        rank: 'Hoàn thành xuất sắc nhiệm vụ',
        mau04: 'Có (Sáng kiến ATTT Cấp 3)',
      },
      {
        title: 'Tiếp nhận, số hóa, đăng ký và phát hành văn bản đi/đến (kể cả văn bản Mật) trên hệ thống',
        description: 'Xử lý 1.850 văn bản đi/đến bảo đảm đúng thể thức, thời gian và không thất thoát thông tin mật',
        status: 'COMPLETED',
        progress: 100,
        priority: 'HIGH',
        creator: 'BTCTU_018',
        assignee: 'BTCTU_023',
        approver: 'BTCTU_018',
        deptId: 60,
        deptName: 'Văn phòng Ban',
        planId: planQ1.id,
        startDate: '2026-01-01',
        dueDate: '2026-03-31',
        completedAt: '2026-03-30T17:00:00Z',
        isOverdue: 'Đúng hạn',
        domainCode: 'DOM_VAN_THU',
        difficultyK: 2.0,
        isOutstanding: false,
        steps: [
          'Tiếp nhận văn bản giấy và văn bản điện tử qua trục liên thông',
          'Quét số hóa tài liệu đính kèm hệ thống điều hành',
          'Vào sổ văn thư và phân phối đến Lãnh đạo Ban và các phòng',
          'Đóng dấu phát hành văn bản đi và lưu trữ bản gốc',
        ],
        kpiScore: 67.5,
        generalScore: 28.5,
        rank: 'Hoàn thành tốt nhiệm vụ',
        mau04: 'Không',
      },
      {
        title: 'Soát lỗi chính tả, thể thức văn bản đề án theo Nghị định 30/2020/NĐ-CP trước khi trình Lãnh đạo Ban ký',
        description: 'Kiểm tra căn lề, font chữ, thẩm quyền ký và căn cứ pháp lý của 120 văn bản dự thảo',
        status: 'COMPLETED',
        progress: 100,
        priority: 'MEDIUM',
        creator: 'BTCTU_018',
        assignee: 'BTCTU_023',
        approver: 'BTCTU_018',
        deptId: 60,
        deptName: 'Văn phòng Ban',
        planId: planQ1.id,
        startDate: '2026-01-15',
        dueDate: '2026-03-25',
        completedAt: '2026-03-23T11:30:00Z',
        isOverdue: 'Đúng hạn',
        domainCode: 'DOM_VAN_THU',
        difficultyK: 1.5,
        isOutstanding: false,
        steps: [
          'Kiểm tra thể thức viện dẫn căn cứ pháp lý',
          'Soát lỗi font chữ, ngắt dòng, cỡ chữ theo Nghị định 30',
          'Kiểm tra nơi nhận văn bản bảo đảm đúng đối tượng',
          'Trình Lãnh đạo Văn phòng ký nháy kiểm tra thể thức',
        ],
        kpiScore: 66.0,
        generalScore: 28.0,
        rank: 'Hoàn thành tốt nhiệm vụ',
        mau04: 'Không',
      },
      {
        title: 'Lập hồ sơ lưu trữ điện tử và sắp xếp hồ sơ cán bộ vào kho lưu trữ chuyên dụng theo tiêu chuẩn Cục VTLTNN',
        description: 'Chỉnh lý 45 hộp hồ sơ cán bộ hưu trí và cán bộ chuyển công tác lưu kho theo danh mục bảo mật',
        status: 'IN_PROGRESS',
        progress: 60,
        priority: 'LOW',
        creator: 'BTCTU_018',
        assignee: 'BTCTU_023',
        approver: 'BTCTU_018',
        deptId: 60,
        deptName: 'Văn phòng Ban',
        planId: planQ1.id,
        startDate: '2026-02-01',
        dueDate: '2026-03-31',
        completedAt: null,
        isOverdue: 'Đúng hạn',
        domainCode: 'DOM_VAN_THU',
        difficultyK: 1.5,
        isOutstanding: false,
        steps: [
          'Phân loại hồ sơ theo năm sinh và chức danh cán bộ',
          'Đánh số thứ tự và lập bảng tra cứu mục lục hồ sơ',
          'Đóng cặp hộp carton lưu trữ chuyên dụng chống ẩm mốc',
          'Nhập mã vạch định danh vào phần mềm quản lý kho lưu trữ',
        ],
        kpiScore: 64.0,
        generalScore: 28.0,
        rank: 'Hoàn thành tốt nhiệm vụ',
        mau04: 'Không',
      },
      {
        title: 'Tổng hợp Báo cáo kết quả công tác tổ chức xây dựng Đảng tháng 02/2026 và lịch công tác tháng 03/2026',
        description: 'Xây dựng tài liệu phục vụ Hội nghị giao ban tháng của Ban Tổ chức Tỉnh ủy',
        status: 'COMPLETED',
        progress: 100,
        priority: 'MEDIUM',
        creator: 'BTCTU_018',
        assignee: 'BTCTU_021',
        approver: 'BTCTU_018',
        deptId: 60,
        deptName: 'Văn phòng Ban',
        planId: planQ1.id,
        startDate: '2026-02-20',
        dueDate: '2026-02-28',
        completedAt: '2026-02-27T16:00:00Z',
        isOverdue: 'Đúng hạn',
        domainCode: 'DOM_THAM_MUU',
        difficultyK: 2.5,
        isOutstanding: false,
        steps: [
          'Đôn đốc 04 phòng chuyên môn nộp báo cáo kết quả tháng',
          'Tổng hợp số liệu nhiệm vụ hoàn thành và nhiệm vụ còn tồn đọng',
          'Dự thảo lịch công tác lãnh đạo Ban tháng tiếp theo',
          'In ấn tài liệu phục vụ cuộc họp giao ban',
        ],
        kpiScore: 67.0,
        generalScore: 28.5,
        rank: 'Hoàn thành tốt nhiệm vụ',
        mau04: 'Không',
      },
      {
        title: 'Xây dựng dự toán kinh phí và quản lý tài sản, cơ sở vật chất phục vụ hoạt động cơ quan quý I/2026',
        description: 'Thanh quyết toán chế độ công tác phí, mua sắm vật tư văn phòng và bảo dưỡng phương tiện cơ quan',
        status: 'COMPLETED',
        progress: 100,
        priority: 'MEDIUM',
        creator: 'BTCTU_018',
        assignee: 'BTCTU_022',
        approver: 'BTCTU_018',
        deptId: 60,
        deptName: 'Văn phòng Ban',
        planId: planQ1.id,
        startDate: '2026-01-05',
        dueDate: '2026-03-20',
        completedAt: '2026-03-18T15:30:00Z',
        isOverdue: 'Đúng hạn',
        domainCode: 'DOM_THAM_MUU',
        difficultyK: 2.0,
        isOutstanding: false,
        steps: [
          'Lập bảng tổng hợp nhu cầu văn phòng phẩm các phòng',
          'Thực hiện thanh toán theo hợp đồng dịch vụ đã ký kết',
          'Kiểm kê tài sản cố định và cập nhật phần mềm tài sản công',
          'Quyết toán với Kho bạc Nhà nước tỉnh',
        ],
        kpiScore: 66.0,
        generalScore: 28.0,
        rank: 'Hoàn thành tốt nhiệm vụ',
        mau04: 'Không',
      },

      // === NHIỆM VỤ SỞ KHOA HỌC VÀ CÔNG NGHỆ (ĐỐI SOÁT LIÊN CƠ QUAN) ===
      {
        title: 'Thẩm định hồ sơ nhiệm vụ KH&CN cấp tỉnh năm 2026 trong lĩnh vực nông nghiệp công nghệ cao',
        description: 'Tổ chức Hội đồng khoa học tư vấn xác định nhiệm vụ nghiên cứu giống cây trồng thích ứng biến đổi khí hậu',
        status: 'COMPLETED',
        progress: 100,
        priority: 'HIGH',
        creator: 'NV_001',
        assignee: 'NV_001',
        approver: 'NV_001',
        deptId: 2,
        deptName: 'Sở Khoa học và Công nghệ',
        planId: planQ1.id,
        startDate: '2026-01-10',
        dueDate: '2026-02-28',
        completedAt: '2026-02-25T11:00:00Z',
        isOverdue: 'Đúng hạn',
        domainCode: 'DOM_THAM_DINH',
        difficultyK: 3.5,
        isOutstanding: false,
        steps: [
          'Tiếp nhận phiếu đề xuất nhiệm vụ từ các Viện, Trường',
          'Mời chuyên gia phản biện độc lập',
          'Họp Hội đồng tuyển chọn tổ chức chủ trì',
          'Hoàn thiện hồ sơ trình UBND tỉnh phê duyệt danh mục',
        ],
        kpiScore: 68.0,
        generalScore: 29.0,
        rank: 'Hoàn thành xuất sắc nhiệm vụ',
        mau04: 'Không',
      },
      {
        title: 'Nghiệm thu đề tài ứng dụng IoT trong cảnh báo cháy rừng tại Vườn Quốc gia Yok Đôn',
        description: 'Kiểm tra thực tế các trạm cảm biến đo độ ẩm, nhiệt độ và hệ thống camera AI phát hiện khói sớm',
        status: 'COMPLETED',
        progress: 100,
        priority: 'HIGH',
        creator: 'NV_001',
        assignee: 'NV_002',
        approver: 'NV_001',
        deptId: 2,
        deptName: 'Sở Khoa học và Công nghệ',
        planId: planQ1.id,
        startDate: '2026-01-15',
        dueDate: '2026-03-10',
        completedAt: '2026-03-05T16:00:00Z',
        isOverdue: 'Đúng hạn',
        domainCode: 'DOM_IT_ATTT',
        difficultyK: 3.0,
        isOutstanding: false,
        steps: [
          'Kiểm tra hồ sơ kỹ thuật và sản phẩm bàn giao của đề tài',
          'Khảo sát thực địa tại các tiểu khu rừng Yok Đôn',
          'Đánh giá độ nhạy và thời gian phản hồi cảnh báo cháy',
          'Lập biên bản nghiệm thu cấp cơ sở',
        ],
        kpiScore: 67.0,
        generalScore: 28.5,
        rank: 'Hoàn thành tốt nhiệm vụ',
        mau04: 'Không',
      },
      {
        title: 'Kiểm tra tiến độ dự án đổi mới sáng tạo doanh nghiệp KHCN hỗ trợ chế biến sâu sầu riêng Krông Pắc',
        description: 'Đánh giá tỷ lệ giải ngân vốn hỗ trợ chuyển giao công nghệ cấp đông nhanh bảo quản sau thu hoạch',
        status: 'IN_PROGRESS',
        progress: 60,
        priority: 'MEDIUM',
        creator: 'NV_001',
        assignee: 'NV_004',
        approver: 'NV_001',
        deptId: 2,
        deptName: 'Sở Khoa học và Công nghệ',
        planId: planQ1.id,
        startDate: '2026-02-01',
        dueDate: '2026-03-31',
        completedAt: null,
        isOverdue: 'Đúng hạn',
        domainCode: 'DOM_THAM_MUU',
        difficultyK: 2.5,
        isOutstanding: false,
        steps: [
          'Kiểm tra hóa đơn chứng từ mua sắm dây chuyền công nghệ',
          'Đối chiếu tiến độ lắp đặt thiết bị tại nhà máy chế biến',
          'Đánh giá kết quả chạy thử nghiệm mẻ sản phẩm đầu tiên',
          'Dự thảo báo cáo tiến độ quý I',
        ],
        kpiScore: 65.0,
        generalScore: 28.0,
        rank: 'Hoàn thành tốt nhiệm vụ',
        mau04: 'Không',
      },
      {
        title: 'Báo cáo thống kê chỉ số đổi mới sáng tạo cấp tỉnh (PII) năm 2026',
        description: 'Thu thập 52 chỉ số thành phần từ các Sở, Ban, Ngành và UBND các huyện phục vụ Bộ KH&CN xếp hạng PII',
        status: 'IN_PROGRESS',
        progress: 40,
        priority: 'MEDIUM',
        creator: 'NV_001',
        assignee: 'NV_003',
        approver: 'NV_001',
        deptId: 2,
        deptName: 'Sở Khoa học và Công nghệ',
        planId: planQ1.id,
        startDate: '2026-01-10',
        dueDate: '2026-03-01',
        completedAt: null,
        isOverdue: 'Quá hạn',
        domainCode: 'DOM_THAM_MUU',
        difficultyK: 3.0,
        isOutstanding: false,
        steps: [
          'Gửi văn bản đề nghị các Sở cung cấp số liệu chỉ số thành phần',
          'Đối soát và tổng hợp dữ liệu vào bảng mẫu của Bộ KH&CN',
          'Xử lý số liệu thiếu hụt từ UBND các huyện vùng sâu',
          'Trình Lãnh đạo Sở ký báo cáo gửi UBND tỉnh',
        ],
        kpiScore: 55.0,
        generalScore: 26.0,
        rank: 'Hoàn thành nhiệm vụ',
        mau04: 'Không',
      },
    ];

    // Xóa các task cũ để nạp bộ dữ liệu chuẩn chỉnh đồng bộ
    console.log('🧹 Dọn dẹp các bản ghi dữ liệu mẫu cũ trong admin_hrm...');
    await prisma.kpiEvaluationTask.deleteMany({});
    await prisma.taskStep.deleteMany({});
    await prisma.taskParticipant.deleteMany({});
    await prisma.taskHistory.deleteMany({});
    await prisma.task.deleteMany({});

    console.log(`📥 Đang nạp ${simulatedTasks.length} nhiệm vụ và nhật ký lịch sử vào admin_hrm...`);

    const createdTaskRowsForReport: any[] = [];

    for (let i = 0; i < simulatedTasks.length; i++) {
      const t = simulatedTasks[i];
      const isDone = t.status === 'COMPLETED';

      // 1. Tạo Task
      const createdTask = await prisma.task.create({
        data: {
          title: t.title,
          description: t.description,
          status: t.status,
          progress: t.progress,
          priority: t.priority,
          startDate: new Date(t.startDate),
          dueDate: new Date(t.dueDate),
          completedAt: t.completedAt ? new Date(t.completedAt) : null,
          isCompleted: isDone,
          planId: t.planId,
          creatorEmployeeCode: t.creator,
          organizationId,
        },
      });

      // 2. Tạo Participants (OWNER, ASSIGNEE, APPROVER)
      await prisma.taskParticipant.createMany({
        data: [
          {
            taskId: createdTask.id,
            employeeCode: t.assignee,
            participantRole: 'ASSIGNEE',
            status: isDone ? 'COMPLETED' : 'ACCEPTED',
            contributionPercentage: 100.0,
            organizationId,
          },
          ...(t.creator !== t.assignee
            ? [
                {
                  taskId: createdTask.id,
                  employeeCode: t.creator,
                  participantRole: 'OWNER' as const,
                  status: 'ACCEPTED',
                  contributionPercentage: 0,
                  organizationId,
                },
              ]
            : []),
          ...(t.approver !== t.assignee && t.approver !== t.creator
            ? [
                {
                  taskId: createdTask.id,
                  employeeCode: t.approver,
                  participantRole: 'APPROVER' as const,
                  status: 'ACCEPTED',
                  contributionPercentage: 0,
                  organizationId,
                },
              ]
            : []),
        ],
      });

      // 3. Tạo Steps (Checklists)
      for (let sIdx = 0; sIdx < t.steps.length; sIdx++) {
        const stepTitle = t.steps[sIdx];
        const stepDone = isDone || sIdx < Math.floor((t.progress / 100) * t.steps.length);
        await prisma.taskStep.create({
          data: {
            taskId: createdTask.id,
            title: stepTitle,
            status: stepDone ? 'COMPLETED' : 'TODO',
            order: sIdx + 1,
            assigneeCode: t.assignee,
            baseScore: Math.round(100 / t.steps.length),
            completedAt: stepDone ? new Date(t.startDate) : null,
            organizationId,
          },
        });
      }

      // 4. Tạo Lịch sử (TaskHistory) thể hiện đầy đủ vòng đời
      await prisma.taskHistory.createMany({
        data: [
          {
            taskId: createdTask.id,
            action: 'CREATE_TASK',
            actorCode: t.creator,
            newValue: { message: `Lãnh đạo giao nhiệm vụ: ${t.title}` },
            organizationId,
          },
          {
            taskId: createdTask.id,
            action: 'ACCEPT_TASK',
            actorCode: t.assignee,
            newValue: { message: 'Chuyên viên đã tiếp nhận nhiệm vụ và bắt đầu triển khai' },
            organizationId,
          },
          ...(isDone
            ? [
                {
                  taskId: createdTask.id,
                  action: 'COMPLETE_TASK',
                  actorCode: t.assignee,
                  newValue: { message: 'Chuyên viên đã nộp báo cáo kết quả và sản phẩm đầu ra' },
                  organizationId,
                },
                {
                  taskId: createdTask.id,
                  action: 'EVALUATE_APPROVE',
                  actorCode: t.approver,
                  newValue: {
                    message: `Lãnh đạo nghiệm thu và chấm điểm KPI: ${t.kpiScore}đ (Thành tố A=100%, B=100%, C=${
                      t.isOverdue === 'Quá hạn' ? '80%' : '105%'
                    }, D=95%)`,
                  },
                  organizationId,
                },
              ]
            : [
                {
                  taskId: createdTask.id,
                  action: 'UPDATE_PROGRESS',
                  actorCode: t.assignee,
                  newValue: { message: `Cập nhật tiến độ xử lý đạt ${t.progress}%` },
                  organizationId,
                },
              ]),
        ],
      });

      // Lấy tên người phụ trách
      const emp = await prisma.employee.findUnique({
        where: { employeeCode: t.assignee },
        select: { fullName: true },
      });
      const assigneeName = emp?.fullName || t.assignee;

      // Chuẩn bị dữ liệu phẳng cho Report-Service
      createdTaskRowsForReport.push({
        id: createdTask.id,
        title: t.title,
        status: isDone ? 'Hoàn thành' : (t.status === 'IN_PROGRESS' ? 'Đang thực hiện' : 'Chờ tiếp nhận'),
        priority: t.priority === 'URGENT' ? 'Khẩn cấp' : (t.priority === 'HIGH' ? 'Cao' : 'Bình thường'),
        progress: t.progress,
        departmentId: t.deptId,
        departmentName: t.deptName,
        assigneeCode: t.assignee,
        assigneeName: assigneeName,
        dueDate: t.dueDate,
        createdAt: t.startDate,
        isOverdue: t.isOverdue,
        isCompleted: isDone ? 'Hoàn thành' : 'Chưa hoàn thành',
        organName: t.deptId === 2 ? 'Sở Khoa học và Công nghệ' : 'Ban Tổ chức Tỉnh ủy Đắk Lắk',
        from_organ_id: t.deptId === 2 ? 'A15.08' : 'A15.05',
        unitCode: t.deptId === 2 ? 'A15.08' : 'A15.05',
      });
    }

    console.log(`✅ Đã nạp thành công ${simulatedTasks.length} nhiệm vụ, các bước checklist và lịch sử xử lý.`);

    // ─────────────────────────────────────────────────────────────────────────
    // GIAI ĐOẠN 4: NẠP ĐÁNH GIÁ KPI & XẾP LOẠI 23 CÁN BỘ ĐỊNH BIÊN BAN TỔ CHỨC TỈNH ỦY
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n🌟 [Giai đoạn 4] Đánh giá KPI & xếp loại 23 cán bộ định biên Ban Tổ chức Tỉnh ủy...');

    const btctuCadreEvaluations = [
      // 1. Khối Lãnh đạo Ban (05 VTVL)
      { code: 'BTCTU_001', name: 'Nguyễn Thượng Hải', dept: 'Lãnh đạo Ban', role: 'Trưởng ban', sChung: 30.0, sNhiemVu: 70.0, sTong: 100.0, rank: 'Hoàn thành xuất sắc nhiệm vụ', mau04: 'Có (Đề án 01-ĐA/TU)', reviewer: 'Thường trực Tỉnh ủy' },
      { code: 'BTCTU_002', name: 'Lưu Vĩnh Hưng', dept: 'Lãnh đạo Ban', role: 'Phó Trưởng ban TT', sChung: 29.5, sNhiemVu: 68.5, sTong: 98.0, rank: 'Hoàn thành xuất sắc nhiệm vụ', mau04: 'Có (Mô hình VTVL)', reviewer: 'BTCTU_001' },
      { code: 'BTCTU_003', name: 'Nguyễn Hữu Toàn', dept: 'Lãnh đạo Ban', role: 'Phó Trưởng ban', sChung: 28.5, sNhiemVu: 66.0, sTong: 94.5, rank: 'Hoàn thành tốt nhiệm vụ', mau04: 'Không', reviewer: 'BTCTU_001' },
      { code: 'BTCTU_004', name: 'Trần Tuấn Anh', dept: 'Lãnh đạo Ban', role: 'Phó Trưởng ban', sChung: 28.0, sNhiemVu: 65.5, sTong: 93.5, rank: 'Hoàn thành tốt nhiệm vụ', mau04: 'Không', reviewer: 'BTCTU_001' },
      { code: 'BTCTU_005', name: 'Y Nhuân Byă', dept: 'Lãnh đạo Ban', role: 'Phó Trưởng ban', sChung: 28.5, sNhiemVu: 66.5, sTong: 95.0, rank: 'Hoàn thành tốt nhiệm vụ', mau04: 'Không', reviewer: 'BTCTU_001' },

      // 2. Phòng Tổ chức đảng, đảng viên (04 VTVL)
      { code: 'BTCTU_006', name: 'Lê Đình Hoàng', dept: 'Phòng Tổ chức đảng, đảng viên', role: 'Trưởng phòng', sChung: 29.0, sNhiemVu: 68.0, sTong: 97.0, rank: 'Hoàn thành xuất sắc nhiệm vụ', mau04: 'Có (Đề tài TCCSĐ)', reviewer: 'BTCTU_003' },
      { code: 'BTCTU_007', name: 'Phạm Văn Minh', dept: 'Phòng Tổ chức đảng, đảng viên', role: 'Phó Trưởng phòng', sChung: 28.0, sNhiemVu: 66.0, sTong: 94.0, rank: 'Hoàn thành tốt nhiệm vụ', mau04: 'Không', reviewer: 'BTCTU_006' },
      { code: 'BTCTU_008', name: 'Vũ Thị Mai', dept: 'Phòng Tổ chức đảng, đảng viên', role: 'Chuyên viên Quản lý đảng viên', sChung: 28.5, sNhiemVu: 66.0, sTong: 94.5, rank: 'Hoàn thành tốt nhiệm vụ', mau04: 'Không', reviewer: 'BTCTU_006' },
      { code: 'BTCTU_009', name: 'Đặng Quang Huy', dept: 'Phòng Tổ chức đảng, đảng viên', role: 'Chuyên viên CSDL Đảng viên', sChung: 28.0, sNhiemVu: 63.5, sTong: 91.5, rank: 'Hoàn thành tốt nhiệm vụ', mau04: 'Không', reviewer: 'BTCTU_006' },

      // 3. Phòng Tổ chức cán bộ (04 VTVL)
      { code: 'BTCTU_010', name: 'Hoàng Đức Nam', dept: 'Phòng Tổ chức cán bộ', role: 'Trưởng phòng', sChung: 29.0, sNhiemVu: 68.0, sTong: 97.0, rank: 'Hoàn thành tốt nhiệm vụ', mau04: 'Không', reviewer: 'BTCTU_002' },
      { code: 'BTCTU_011', name: 'Trần Quốc Tuấn', dept: 'Phòng Tổ chức cán bộ', role: 'Phó Trưởng phòng', sChung: 28.5, sNhiemVu: 66.0, sTong: 94.5, rank: 'Hoàn thành tốt nhiệm vụ', mau04: 'Không', reviewer: 'BTCTU_010' },
      { code: 'BTCTU_012', name: 'Bùi Thị Bích Ngọc', dept: 'Phòng Tổ chức cán bộ', role: 'Chuyên viên Quản lý cán bộ', sChung: 28.5, sNhiemVu: 66.5, sTong: 95.0, rank: 'Hoàn thành tốt nhiệm vụ', mau04: 'Không', reviewer: 'BTCTU_010' },
      { code: 'BTCTU_013', name: 'Nguyễn Tiến Đạt', dept: 'Phòng Tổ chức cán bộ', role: 'Chuyên viên Chính sách cán bộ', sChung: 29.5, sNhiemVu: 70.0, sTong: 99.5, rank: 'Hoàn thành xuất sắc nhiệm vụ', mau04: 'Có (HD 05-HD/TU)', reviewer: 'BTCTU_010' },

      // 4. Phòng Bảo vệ chính trị nội bộ (04 VTVL)
      { code: 'BTCTU_014', name: 'Ngô Thanh Tùng', dept: 'Phòng Bảo vệ chính trị nội bộ', role: 'Trưởng phòng', sChung: 28.5, sNhiemVu: 66.5, sTong: 95.0, rank: 'Hoàn thành tốt nhiệm vụ', mau04: 'Không', reviewer: 'BTCTU_004' },
      { code: 'BTCTU_015', name: 'Đinh Trọng Hùng', dept: 'Phòng Bảo vệ chính trị nội bộ', role: 'Phó Trưởng phòng', sChung: 28.0, sNhiemVu: 65.0, sTong: 93.0, rank: 'Hoàn thành tốt nhiệm vụ', mau04: 'Không', reviewer: 'BTCTU_014' },
      { code: 'BTCTU_016', name: 'Dương Văn Hùng', dept: 'Phòng Bảo vệ chính trị nội bộ', role: 'Chuyên viên CSDL Mức 3', sChung: 28.5, sNhiemVu: 66.5, sTong: 95.0, rank: 'Hoàn thành tốt nhiệm vụ', mau04: 'Không', reviewer: 'BTCTU_014' },
      { code: 'BTCTU_017', name: 'Phan Thành Trung', dept: 'Phòng Bảo vệ chính trị nội bộ', role: 'Chuyên viên Thẩm tra xác minh', sChung: 28.5, sNhiemVu: 67.5, sTong: 96.0, rank: 'Hoàn thành tốt nhiệm vụ', mau04: 'Không', reviewer: 'BTCTU_014' },

      // 5. Văn phòng Ban (06 VTVL)
      { code: 'BTCTU_018', name: 'Chu Văn Kiên', dept: 'Văn phòng Ban', role: 'Chánh Văn phòng', sChung: 28.5, sNhiemVu: 66.5, sTong: 95.0, rank: 'Hoàn thành tốt nhiệm vụ', mau04: 'Không', reviewer: 'BTCTU_002' },
      { code: 'BTCTU_019', name: 'Nguyễn Hồng Ánh', dept: 'Văn phòng Ban', role: 'Phó Chánh Văn phòng', sChung: 28.0, sNhiemVu: 65.5, sTong: 93.5, rank: 'Hoàn thành tốt nhiệm vụ', mau04: 'Không', reviewer: 'BTCTU_018' },
      { code: 'BTCTU_020', name: 'Lương Đình Quý', dept: 'Văn phòng Ban', role: 'Chuyên viên CNTT & ATTT', sChung: 29.5, sNhiemVu: 70.0, sTong: 99.5, rank: 'Hoàn thành xuất sắc nhiệm vụ', mau04: 'Có (Sáng kiến ATTT Cấp 3)', reviewer: 'BTCTU_018' },
      { code: 'BTCTU_021', name: 'Trương Minh Cường', dept: 'Văn phòng Ban', role: 'Chuyên viên Tổng hợp', sChung: 28.5, sNhiemVu: 66.0, sTong: 94.5, rank: 'Hoàn thành tốt nhiệm vụ', mau04: 'Không', reviewer: 'BTCTU_018' },
      { code: 'BTCTU_022', name: 'Võ Thành Danh', dept: 'Văn phòng Ban', role: 'Chuyên viên Tài chính', sChung: 28.0, sNhiemVu: 64.5, sTong: 92.5, rank: 'Hoàn thành tốt nhiệm vụ', mau04: 'Không', reviewer: 'BTCTU_018' },
      { code: 'BTCTU_023', name: 'Lê Thu Thảo', dept: 'Văn phòng Ban', role: 'Cán bộ Văn thư - Lưu trữ & Cơ yếu', sChung: 28.5, sNhiemVu: 66.0, sTong: 94.5, rank: 'Hoàn thành tốt nhiệm vụ', mau04: 'Không', reviewer: 'BTCTU_018' },
    ];

    // Xóa và cập nhật kpi_evaluations trong admin_hrm
    await prisma.kpiEvaluation.deleteMany({
      where: { periodId: periodQ1.id },
    });

    const employeeQualityRowsForReport: any[] = [];
    const btctuKpiStatsRows: any[] = [];

    for (const c of btctuCadreEvaluations) {
      const evalCreated = await prisma.kpiEvaluation.create({
        data: {
          employeeCode: c.code,
          periodId: periodQ1.id,
          ruleSetId: ruleSet.id,
          phase: 'FINAL',
          status: 'APPROVED',
          generalScoreSelf: c.sChung,
          taskScoreSelf: c.sNhiemVu,
          generalScoreFinal: c.sChung,
          taskScoreFinal: c.sNhiemVu,
          totalScore: c.sTong,
          reviewerCode: c.reviewer.startsWith('BTCTU') ? c.reviewer : null,
          organizationId,
        },
      });

      // Tạo KpiEvaluationTask liên kết
      await prisma.kpiEvaluationTask.create({
        data: {
          evaluationId: evalCreated.id,
          taskName: `Nhiệm vụ quản lý và thực thi công vụ chuyên môn (${c.role})`,
          domainCode: 'DOM_THAM_MUU',
          plannedQty: 5,
          actualQty: 5,
          difficultyK: c.sTong >= 98 ? 4.0 : 3.0,
          isOutstanding: c.mau04.startsWith('Có'),
          attitudeScore: 95.0,
          finalKpiScore: c.sNhiemVu,
          organizationId,
        },
      });

      const rankingShort = c.sTong >= 95 ? 'Xuất sắc' : (c.sTong >= 75 ? 'Tốt' : 'Hoàn thành');

      const fullQualityItem = {
        cadreCode: c.code,
        employeeCode: c.code,
        fullName: c.name,
        employeeName: c.name,
        departmentId: `A15.05_${c.dept}`,
        departmentName: c.dept,
        organ_id: 'A15.05',
        from_organ_id: 'A15.05',
        unitCode: 'A15.05',
        organName: 'Ban Tổ chức Tỉnh ủy Đắk Lắk',
        domain: 'DANG',
        group: 'DANG',
        jobTitle: c.role,
        taskCount: 6,
        completedCount: 6,
        qualityScore: c.sTong,
        sChung: c.sChung,
        sNhiemVu: c.sNhiemVu,
        sTong: c.sTong,
        ranking: rankingShort,
        proposedRank: c.rank,
        approvedRank: c.rank,
        hasMau04: c.mau04,
        sopStep: 'Bước 4: Ban hành QĐ',
        status: 'Đã ban hành QĐ',
        quarterYear: 'Quý I/2026',
      };

      employeeQualityRowsForReport.push(fullQualityItem);
      btctuKpiStatsRows.push(fullQualityItem);
    }

    console.log(`✅ Đã nạp thành công đánh giá chất lượng cho toàn bộ 23 cán bộ Ban Tổ chức Tỉnh ủy.`);

    // ─────────────────────────────────────────────────────────────────────────
    // GIAI ĐOẠN 5: ĐỒNG BỘ SNAPSHOTS & BÁO CÁO TRONG REPORT-SERVICE
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n📊 [Giai đoạn 5] Đồng bộ dữ liệu sang admin_report cho các Biểu đồ...');

    // 1. Cập nhật StatisticsSnapshot cho HRM_TASK_STATS
    await reportPrisma.$executeRawUnsafe(`
      DELETE FROM admin_report.StatisticsSnapshot WHERE dataSourceCode = 'HRM_TASK_STATS';
    `);
    const taskSnap = await reportPrisma.$executeRawUnsafe(`
      INSERT INTO admin_report.StatisticsSnapshot (dataSourceCode, data, recordedAt)
      VALUES ('HRM_TASK_STATS', '${JSON.stringify(createdTaskRowsForReport).replace(/'/g, "''")}', NOW());
    `);
    console.log(`✅ Đã cập nhật StatisticsSnapshot cho HRM_TASK_STATS (${createdTaskRowsForReport.length} nhiệm vụ).`);

    // 2. Cập nhật StatisticsSnapshot cho EMPLOYEE_QUALITY & BTCTU_KPI_STATS
    await reportPrisma.$executeRawUnsafe(`
      DELETE FROM admin_report.StatisticsSnapshot WHERE dataSourceCode IN ('EMPLOYEE_QUALITY', 'BTCTU_KPI_STATS');
    `);
    await reportPrisma.$executeRawUnsafe(`
      INSERT INTO admin_report.StatisticsSnapshot (dataSourceCode, data, recordedAt)
      VALUES ('EMPLOYEE_QUALITY', '${JSON.stringify(employeeQualityRowsForReport).replace(/'/g, "''")}', NOW());
    `);
    await reportPrisma.$executeRawUnsafe(`
      INSERT INTO admin_report.StatisticsSnapshot (dataSourceCode, data, recordedAt)
      VALUES ('BTCTU_KPI_STATS', '${JSON.stringify(btctuKpiStatsRows).replace(/'/g, "''")}', NOW());
    `);
    console.log(`✅ Đã cập nhật StatisticsSnapshot cho EMPLOYEE_QUALITY và BTCTU_KPI_STATS (${employeeQualityRowsForReport.length} cán bộ).`);

    // 3. Tự động cập nhật ReportRun và DatasetSnapshot cho Báo cáo #1, #4, #5
    const syncReportDefs = [
      { id: 1, code: 'REP_HRM_TASKS', rows: createdTaskRowsForReport },
      { id: 4, code: 'REP_EMP_QUALITY', rows: employeeQualityRowsForReport },
      { id: 5, code: 'REP_BTCTU_SOP_KPI', rows: btctuKpiStatsRows },
    ];

    for (const rDef of syncReportDefs) {
      // Tìm hoặc tạo run
      const rowsJson = JSON.stringify(rDef.rows).replace(/'/g, "''");
      const schemaJson = JSON.stringify(
        Object.keys(rDef.rows[0] || {}).map((k) => ({
          key: k,
          label: k,
          type: typeof (rDef.rows[0] as any)[k] === 'number' ? 'number' : 'string',
        }))
      ).replace(/'/g, "''");

      // Cập nhật ReportRun
      await reportPrisma.$executeRawUnsafe(`
        INSERT INTO admin_report.ReportRun (reportDefinitionId, definitionVersion, status, rowCount, startedAt, endedAt, createdAt, updatedAt)
        VALUES (${rDef.id}, 2, 'SUCCEEDED', ${rDef.rows.length}, NOW(), NOW(), NOW(), NOW());
      `);

      // Lấy id run vừa tạo
      const runRes: any = await reportPrisma.$queryRawUnsafe(`
        SELECT id FROM admin_report.ReportRun WHERE reportDefinitionId = ${rDef.id} ORDER BY id DESC LIMIT 1;
      `);
      const runId = runRes[0]?.id;

      if (runId) {
        await reportPrisma.$executeRawUnsafe(`
          DELETE FROM admin_report.DatasetSnapshot WHERE runId = ${runId};
        `);
        await reportPrisma.$executeRawUnsafe(`
          INSERT INTO admin_report.DatasetSnapshot (runId, chunkIndex, \`schema\`, \`data\`, recordedAt)
          VALUES (${runId}, 0, '${schemaJson}', '${rowsJson}', NOW());
        `);
        console.log(`✅ Đã tạo ReportRun #${runId} & DatasetSnapshot cho Báo cáo #${rDef.id} (${rDef.code}, ${rDef.rows.length} dòng)!`);
      }
    }

    console.log('\n🎉 =========================================================================');
    console.log('🎉 MÔ PHỎNG VÒNG ĐỜI NGHIỆP VỤ HOÀN TẤT 100%! TẤT CẢ BIỂU ĐỒ SẴN SÀNG HIỂN THỊ!');
    console.log('🎉 =========================================================================');
  } finally {
    await prisma.$disconnect();
    await reportPrisma.$disconnect();
  }
}

if (require.main === module) {
  simulateWorkflow()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Lỗi khi thực thi mô phỏng workflow:', err);
      process.exit(1);
    });
}
