import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import 'dotenv/config';
import type { PrismaClient as PrismaClientType } from '../src/generated/prisma/client';

let PrismaClient: typeof PrismaClientType;
try {
  PrismaClient = require('../src/generated/prisma/client').PrismaClient;
} catch (e) {
  PrismaClient = require('../src/generated/prisma/client').PrismaClient;
}

export async function seedBtctuKpiEngine(prismaInstance?: any) {
  let prisma = prismaInstance;
  let shouldDisconnect = false;

  if (!prisma) {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) throw new Error('DATABASE_URL is not set');
    const mariadbUrl = dbUrl.replace(/^mysql:\/\//, 'mariadb://');
    const adapter = new PrismaMariaDb(mariadbUrl);
    prisma = new PrismaClient({ adapter });
    shouldDisconnect = true;
  }

  try {
    console.log('📦 Bắt đầu nạp công thức tính điểm KPI/OKR và thiết lập môi trường kiểm thử...');

    const unitCode = 'BTCTU_DAKLAK';
    const version = 'v1.2026';
    const organizationId = 'DEFAULT';

    // =========================================================================
    // 1. CẤU HÌNH CÔNG THỨC KPI TOÀN HỆ THỐNG (kpi_formula_configs)
    // Căn cứ: Hướng dẫn 05-HD/TU & BTCTU_Yeu_Cau_He_Thong_KPI_OKR.md
    // =========================================================================
    const globalKpiSettings = {
      baseFormula: '(C / Q) * W * 100',
      enableQualityScore: true,
      qualityWeight: 30, // Tỷ trọng chất lượng 30% theo thang chuẩn
      enablePenalty: true,
      penaltyPerDay: 2,  // Trừ 2 điểm/ngày trễ hạn SLA theo NĐ 335/2025/NĐ-CP
      customRules: [
        {
          domainCode: 'DOM_THAM_DINH',
          name: 'Thẩm định hồ sơ cán bộ & BVCTNB (Chất lượng 50%)',
          formula: '((C / Q) * 0.15 + (S / 100) * 0.50 + 0.35) * W * 100',
        },
        {
          domainCode: 'DOM_VAN_THU',
          name: 'Văn thư, Lưu trữ, Quản lý Hồ sơ & Thẻ Đảng (Khối lượng 40%)',
          formula: '((C / Q) * 0.40 + (S / 100) * 0.20 + 0.40) * W * 100',
        },
        {
          domainCode: 'DOM_IT_ATTT',
          name: 'Quản trị Hệ thống CNTT & ATTT Cấp 3 (Tiến độ Uptime 35%)',
          formula: '((C / Q) * 0.20 + (S / 100) * 0.30 + 0.50) * W * 100',
        },
        {
          domainCode: 'DOM_THAM_MUU',
          name: 'Tham mưu Đề án, Nghị quyết & TCCB (Chất lượng 40%)',
          formula: '((C / Q) * 0.20 + (S / 100) * 0.40 + 0.40) * W * 100',
        },
        {
          domainCode: 'DOM_TCD_DV',
          name: 'Tổ chức đảng, đảng viên & Sổ tay ĐV qua LGSP',
          formula: '((C / Q) * 0.25 + (S / 100) * 0.35 + 0.40) * W * 100',
        },
        {
          domainCode: 'DOM_BVCTNB',
          name: 'Bảo vệ chính trị nội bộ Mức 3 (Bảo mật tuyệt đối)',
          formula: '((C / Q) * 0.15 + (S / 100) * 0.55 + 0.30) * W * 100',
        },
        {
          domainCode: 'DOM_DAOTAO_CS',
          name: 'Đào tạo, bồi dưỡng & Chính sách cán bộ',
          formula: '((C / Q) * 0.30 + (S / 100) * 0.30 + 0.40) * W * 100',
        },
      ],
    };

    // Upsert cấu hình công thức KPI vào MySQL kpi_formula_configs
    await prisma.kpiFormulaConfig.upsert({
      where: { organizationId },
      update: {
        version: 1,
        settings: globalKpiSettings,
        updatedBy: 'Ban Quản trị Hệ thống (BTCTU_DAKLAK)',
      },
      create: {
        organizationId,
        version: 1,
        settings: globalKpiSettings,
        updatedBy: 'Ban Quản trị Hệ thống (BTCTU_DAKLAK)',
      },
    });

    // Tạo bản ghi lịch sử phiên bản đầu tiên
    await prisma.kpiFormulaConfigVersion.upsert({
      where: {
        organizationId_version: {
          organizationId,
          version: 1,
        },
      },
      update: {
        settings: globalKpiSettings,
        changedBy: 'Ban Quản trị Hệ thống (BTCTU_DAKLAK)',
      },
      create: {
        organizationId,
        version: 1,
        settings: globalKpiSettings,
        changedBy: 'Ban Quản trị Hệ thống (BTCTU_DAKLAK)',
      },
    });

    console.log('✅ Đã nạp thành công Cấu hình Công thức KPI Toàn hệ thống (v1, 7 Nhóm công việc).');

    // =========================================================================
    // 2. TẠO HOẶC CẬP NHẬT BỘ LUẬT KPI (KpiRuleSet & KpiDomainWeight)
    // =========================================================================
    const ruleSet = await prisma.kpiRuleSet.upsert({
      where: {
        unitId_version: {
          unitId: unitCode,
          version: version,
        },
      },
      update: {
        isActive: true,
        maxGeneralScore: 30.0,
        maxTaskScore: 70.0,
        bonusThresholdPct: 10.0,
        maxBonusPct: 120.0,
      },
      create: {
        unitId: unitCode,
        version: version,
        isActive: true,
        maxGeneralScore: 30.0,
        maxTaskScore: 70.0,
        bonusThresholdPct: 10.0,
        maxBonusPct: 120.0,
      },
    });

    console.log(`✅ Đã nạp KpiRuleSet: ${version} cho đơn vị ${unitCode}`);

    // Nạp Ma trận trọng số (Domain Weights) chuẩn hóa
    const domainWeights = [
      {
        domainCode: 'DOM_THAM_DINH',
        volumeWeight: 15.0,
        qualityWeight: 50.0,
        progressWeight: 20.0,
        attitudeWeight: 15.0,
      },
      {
        domainCode: 'DOM_VAN_THU',
        volumeWeight: 40.0,
        qualityWeight: 20.0,
        progressWeight: 30.0,
        attitudeWeight: 10.0,
      },
      {
        domainCode: 'DOM_IT_ATTT',
        volumeWeight: 20.0,
        qualityWeight: 30.0,
        progressWeight: 35.0,
        attitudeWeight: 15.0,
      },
      {
        domainCode: 'DOM_THAM_MUU',
        volumeWeight: 20.0,
        qualityWeight: 40.0,
        progressWeight: 20.0,
        attitudeWeight: 20.0,
      },
      {
        domainCode: 'DOM_TCD_DV',
        volumeWeight: 25.0,
        qualityWeight: 35.0,
        progressWeight: 25.0,
        attitudeWeight: 15.0,
      },
      {
        domainCode: 'DOM_BVCTNB',
        volumeWeight: 15.0,
        qualityWeight: 55.0,
        progressWeight: 15.0,
        attitudeWeight: 15.0,
      },
      {
        domainCode: 'DOM_DAOTAO_CS',
        volumeWeight: 30.0,
        qualityWeight: 30.0,
        progressWeight: 25.0,
        attitudeWeight: 15.0,
      },
    ];

    for (const dw of domainWeights) {
      await prisma.kpiDomainWeight.upsert({
        where: {
          ruleSetId_domainCode: {
            ruleSetId: ruleSet.id,
            domainCode: dw.domainCode,
          },
        },
        update: dw,
        create: {
          ruleSetId: ruleSet.id,
          ...dw,
        },
      });
    }

    console.log(`✅ Đã nạp thành công ${domainWeights.length} Ma trận trọng số theo mảng việc.`);

    // =========================================================================
    // 3. NẠP CÁC KỲ ĐÁNH GIÁ CHUẨN (KpiPeriod)
    // =========================================================================
    const periodsData = [
      { name: 'Quý I/2026', startDate: new Date('2026-01-01'), endDate: new Date('2026-03-31') },
      { name: 'Quý II/2026', startDate: new Date('2026-04-01'), endDate: new Date('2026-06-30') },
      { name: 'Quý III/2026', startDate: new Date('2026-07-01'), endDate: new Date('2026-09-30') },
      { name: 'Quý IV/2026', startDate: new Date('2026-10-01'), endDate: new Date('2026-12-31') },
      { name: 'Năm 2026', startDate: new Date('2026-01-01'), endDate: new Date('2026-12-31') },
      { name: 'Tháng 1/2026', startDate: new Date('2026-01-01'), endDate: new Date('2026-01-31') },
      { name: 'Tháng 2/2026', startDate: new Date('2026-02-01'), endDate: new Date('2026-02-28') },
      { name: 'Tháng 3/2026', startDate: new Date('2026-03-01'), endDate: new Date('2026-03-31') },
      { name: 'Tháng 4/2026', startDate: new Date('2026-04-01'), endDate: new Date('2026-04-30') },
      { name: 'Tháng 5/2026', startDate: new Date('2026-05-01'), endDate: new Date('2026-05-31') },
      { name: 'Tháng 6/2026', startDate: new Date('2026-06-01'), endDate: new Date('2026-06-30') },
      { name: 'Tháng 7/2026', startDate: new Date('2026-07-01'), endDate: new Date('2026-07-31') },
      { name: 'Tháng 8/2026', startDate: new Date('2026-08-01'), endDate: new Date('2026-08-31') },
      { name: 'Tháng 9/2026', startDate: new Date('2026-09-01'), endDate: new Date('2026-09-30') },
      { name: 'Tháng 10/2026', startDate: new Date('2026-10-01'), endDate: new Date('2026-10-31') },
      { name: 'Tháng 11/2026', startDate: new Date('2026-11-01'), endDate: new Date('2026-11-30') },
      { name: 'Tháng 12/2026', startDate: new Date('2026-12-01'), endDate: new Date('2026-12-31') },
    ];

    const periodMap = new Map<string, number>();

    for (const p of periodsData) {
      const existing = await prisma.kpiPeriod.findFirst({
        where: { name: p.name },
      });
      if (existing) {
        await prisma.kpiPeriod.update({
          where: { id: existing.id },
          data: { startDate: p.startDate, endDate: p.endDate },
        });
        periodMap.set(p.name, existing.id);
      } else {
        const created = await prisma.kpiPeriod.create({
          data: {
            name: p.name,
            startDate: p.startDate,
            endDate: p.endDate,
            organizationId,
          },
        });
        periodMap.set(p.name, created.id);
      }
    }

    console.log(`✅ Đã nạp thành công ${periodsData.length} Kỳ đánh giá (Quý I - IV/2026, Năm 2026 và 12 tháng).`);

    // =========================================================================
    // 4. NẠP DANH MỤC BIỂU MẪU HÀNH CHÍNH (MẪU 01 - 05)
    // =========================================================================
    const forms = [
      {
        formCode: 'MAU_01',
        name: 'Bản đăng ký khung danh mục sản phẩm, công việc chuẩn đầu kỳ',
        description: 'Áp dụng cho chuyên viên và cán bộ đăng ký khung khối lượng, độ khó và hạn định công việc đầu kỳ đánh giá.',
        templateFileId: 'mau-01-dang-ky-dau-ky.xml',
      },
      {
        formCode: 'MAU_02',
        name: 'Bản tự đánh giá, chấm điểm KPI/OKR cá nhân định kỳ',
        description: 'Phiếu tự chấm điểm 30đ tiêu chí chung và 70đ kết quả công việc 4 thành tố (Khối lượng, Chất lượng, Tiến độ, Thái độ).',
        templateFileId: 'mau-02-tu-danh-gia-ca-nhan.xml',
      },
      {
        formCode: 'MAU_03',
        name: 'Bản nhận xét, đánh giá của cấp ủy và tập thể lãnh đạo phòng',
        description: 'Phiếu nhận xét ưu/khuyết điểm, xếp loại của Chi bộ và đánh giá của Lãnh đạo phòng trực tiếp.',
        templateFileId: 'mau-03-nhan-xet-tap-the.xml',
      },
      {
        formCode: 'MAU_04',
        name: 'Bảng tổng hợp kết quả đánh giá tập thể phòng & nhiệm vụ nổi trội',
        description: 'Tổng hợp phân bổ xếp loại của phòng, trừ điểm chất lượng (-5%, -15%, -35%) và cộng thưởng việc nổi trội (+10%).',
        templateFileId: 'mau-04-tong-hop-phong.xml',
      },
      {
        formCode: 'MAU_05',
        name: 'Dự thảo quyết định & Bảng tổng hợp xếp loại toàn cơ quan',
        description: 'Quyết định chốt xếp loại của Trưởng ban, áp dụng trần 20% Hoàn thành xuất sắc và trần Người đứng đầu.',
        templateFileId: 'mau-05-tong-hop-co-quan.xml',
      },
    ];

    for (const f of forms) {
      await prisma.kpiFormTemplate.upsert({
        where: { formCode: f.formCode },
        update: f,
        create: f,
      });
    }

    console.log(`✅ Đã nạp thành công danh mục ${forms.length} Biểu mẫu hành chính (Mẫu 01 - 05).`);

    // =========================================================================
    // 5. NẠP DỮ LIỆU ĐÁNH GIÁ MẪU & NHIỆM VỤ THỰC TẾ ĐỂ BẮT ĐẦU THỬ NGHIỆM
    // Căn cứ: Mục V - Ví dụ minh họa tính điểm trong huong-dan-cong-thuc-tinh-diem-kpi.md
    // =========================================================================
    const q1PeriodId = periodMap.get('Quý I/2026')!;

    // Kiểm tra và nạp đánh giá cho Chuyên viên TCCB Mẫu 2C (BTCTU_013 - Công chức 8)
    const evalOfficer8 = await prisma.kpiEvaluation.upsert({
      where: {
        id: (await prisma.kpiEvaluation.findFirst({
          where: { employeeCode: 'BTCTU_013', periodId: q1PeriodId },
          select: { id: true },
        }))?.id || 0,
      },
      update: {
        ruleSetId: ruleSet.id,
        phase: 'FINAL',
        status: 'APPROVED',
        generalScoreSelf: 29.5,
        taskScoreSelf: 70.0,
        generalScoreFinal: 29.5,
        taskScoreFinal: 70.0,
        totalScore: 99.5, // 29.5 + 70.0 = 99.5đ -> Hoàn thành xuất sắc nhiệm vụ
        reviewerCode: 'BTCTU_010', // Trưởng phòng TCCB đánh giá
      },
      create: {
        employeeCode: 'BTCTU_013',
        periodId: q1PeriodId,
        ruleSetId: ruleSet.id,
        phase: 'FINAL',
        status: 'APPROVED',
        generalScoreSelf: 29.5,
        taskScoreSelf: 70.0,
        generalScoreFinal: 29.5,
        taskScoreFinal: 70.0,
        totalScore: 99.5,
        reviewerCode: 'BTCTU_010',
        organizationId,
      },
    });

    // Nạp 3 nhiệm vụ mẫu của Công chức 8 theo đúng tài liệu
    await prisma.kpiEvaluationTask.deleteMany({
      where: { evaluationId: evalOfficer8.id },
    });

    await prisma.kpiEvaluationTask.createMany({
      data: [
        {
          evaluationId: evalOfficer8.id,
          taskName: 'Thẩm định hồ sơ bổ nhiệm cán bộ lãnh đạo diện BTV Tỉnh ủy quản lý (Mẫu 2C)',
          domainCode: 'DOM_THAM_DINH',
          plannedQty: 10,
          actualQty: 10,
          difficultyK: 3.0, // Độ khó nhóm 3: 25.0đ
          isUnexpected: false,
          isOutstanding: false,
          errorSeverity: 'NONE',
          deadlineDays: 15,
          actualDays: 14,
          attitudeScore: 95.0,
          calculatedVolumePct: 100.0,
          calculatedQualityPct: 100.0,
          calculatedProgressPct: 105.0,
          calculatedAttitudePct: 95.0,
          finalKpiScore: 30.0, // Đạt điểm chất lượng xuất sắc
          organizationId,
        },
        {
          evaluationId: evalOfficer8.id,
          taskName: 'Kiểm tra, làm sạch dữ liệu hồ sơ cán bộ công chức trên phần mềm quản lý 2C',
          domainCode: 'DOM_THAM_MUU',
          plannedQty: 15,
          actualQty: 15,
          difficultyK: 2.0, // Độ khó nhóm 2: 15.0đ
          isUnexpected: false,
          isOutstanding: false,
          errorSeverity: 'NONE',
          deadlineDays: 30,
          actualDays: 25,
          attitudeScore: 90.0,
          calculatedVolumePct: 100.0,
          calculatedQualityPct: 100.0,
          calculatedProgressPct: 120.0,
          calculatedAttitudePct: 90.0,
          finalKpiScore: 18.0,
          organizationId,
        },
        {
          evaluationId: evalOfficer8.id,
          taskName: 'Dự thảo Hướng dẫn đánh giá xếp loại chất lượng cán bộ hằng quý (Hướng dẫn 05-HD/TU)',
          domainCode: 'DOM_THAM_MUU',
          plannedQty: 1,
          actualQty: 1,
          difficultyK: 4.0, // Độ khó nhóm 4: 35.0đ
          isUnexpected: true,
          isOutstanding: true, // Kê khai nổi trội Mẫu 04 (+10%)
          errorSeverity: 'NONE',
          deadlineDays: 20,
          actualDays: 20,
          attitudeScore: 98.0,
          calculatedVolumePct: 100.0,
          calculatedQualityPct: 100.0,
          calculatedProgressPct: 100.0,
          calculatedAttitudePct: 98.0,
          finalKpiScore: 26.25,
          organizationId,
        },
      ],
    });

    // Nạp đánh giá mẫu cho Trưởng ban Nguyễn Thượng Hải (BTCTU_001)
    const evalTruongBan = await prisma.kpiEvaluation.upsert({
      where: {
        id: (await prisma.kpiEvaluation.findFirst({
          where: { employeeCode: 'BTCTU_001', periodId: q1PeriodId },
          select: { id: true },
        }))?.id || 0,
      },
      update: {
        ruleSetId: ruleSet.id,
        phase: 'FINAL',
        status: 'APPROVED',
        generalScoreSelf: 30.0,
        taskScoreSelf: 70.0,
        generalScoreFinal: 30.0,
        taskScoreFinal: 70.0,
        totalScore: 100.0, // Đạt tối đa 100 điểm Xuất sắc
      },
      create: {
        employeeCode: 'BTCTU_001',
        periodId: q1PeriodId,
        ruleSetId: ruleSet.id,
        phase: 'FINAL',
        status: 'APPROVED',
        generalScoreSelf: 30.0,
        taskScoreSelf: 70.0,
        generalScoreFinal: 30.0,
        taskScoreFinal: 70.0,
        totalScore: 100.0,
        organizationId,
      },
    });

    await prisma.kpiEvaluationTask.deleteMany({
      where: { evaluationId: evalTruongBan.id },
    });
    await prisma.kpiEvaluationTask.createMany({
      data: [
        {
          evaluationId: evalTruongBan.id,
          taskName: 'Chỉ đạo toàn diện công tác xây dựng Đảng và tổ chức bộ máy hệ thống chính trị tỉnh',
          domainCode: 'DOM_THAM_MUU',
          plannedQty: 1,
          actualQty: 1,
          difficultyK: 5.0,
          isUnexpected: false,
          isOutstanding: true,
          errorSeverity: 'NONE',
          finalKpiScore: 70.0,
          organizationId,
        },
      ],
    });

    // Nạp đánh giá mẫu cho Phó Trưởng ban Thường trực Lưu Vĩnh Hưng (BTCTU_002)
    const evalPhoBan1 = await prisma.kpiEvaluation.upsert({
      where: {
        id: (await prisma.kpiEvaluation.findFirst({
          where: { employeeCode: 'BTCTU_002', periodId: q1PeriodId },
          select: { id: true },
        }))?.id || 0,
      },
      update: {
        ruleSetId: ruleSet.id,
        phase: 'FINAL',
        status: 'APPROVED',
        generalScoreSelf: 29.5,
        taskScoreSelf: 68.5,
        generalScoreFinal: 29.5,
        taskScoreFinal: 68.5,
        totalScore: 98.0,
        reviewerCode: 'BTCTU_001',
      },
      create: {
        employeeCode: 'BTCTU_002',
        periodId: q1PeriodId,
        ruleSetId: ruleSet.id,
        phase: 'FINAL',
        status: 'APPROVED',
        generalScoreSelf: 29.5,
        taskScoreSelf: 68.5,
        generalScoreFinal: 29.5,
        taskScoreFinal: 68.5,
        totalScore: 98.0,
        reviewerCode: 'BTCTU_001',
        organizationId,
      },
    });

    await prisma.kpiEvaluationTask.deleteMany({
      where: { evaluationId: evalPhoBan1.id },
    });
    await prisma.kpiEvaluationTask.createMany({
      data: [
        {
          evaluationId: evalPhoBan1.id,
          taskName: 'Chỉ đạo công tác tổ chức cán bộ, biên chế, vị trí việc làm và chính sách cán bộ toàn tỉnh',
          domainCode: 'DOM_THAM_MUU',
          plannedQty: 5,
          actualQty: 5,
          difficultyK: 4.5,
          isUnexpected: false,
          isOutstanding: true,
          finalKpiScore: 68.5,
          organizationId,
        },
      ],
    });

    // Nạp đánh giá mẫu cho Chuyên viên CSDL Đảng viên (BTCTU_009 - Công chức 4)
    const evalOfficer4 = await prisma.kpiEvaluation.upsert({
      where: {
        id: (await prisma.kpiEvaluation.findFirst({
          where: { employeeCode: 'BTCTU_009', periodId: q1PeriodId },
          select: { id: true },
        }))?.id || 0,
      },
      update: {
        ruleSetId: ruleSet.id,
        phase: 'FINAL',
        status: 'APPROVED',
        generalScoreSelf: 28.0,
        taskScoreSelf: 63.5,
        generalScoreFinal: 28.0,
        taskScoreFinal: 63.5,
        totalScore: 91.5,
        reviewerCode: 'BTCTU_006',
      },
      create: {
        employeeCode: 'BTCTU_009',
        periodId: q1PeriodId,
        ruleSetId: ruleSet.id,
        phase: 'FINAL',
        status: 'APPROVED',
        generalScoreSelf: 28.0,
        taskScoreSelf: 63.5,
        generalScoreFinal: 28.0,
        taskScoreFinal: 63.5,
        totalScore: 91.5,
        reviewerCode: 'BTCTU_006',
        organizationId,
      },
    });

    await prisma.kpiEvaluationTask.deleteMany({
      where: { evaluationId: evalOfficer4.id },
    });
    await prisma.kpiEvaluationTask.createMany({
      data: [
        {
          evaluationId: evalOfficer4.id,
          taskName: 'Làm sạch CSDL Đảng viên và đồng bộ Sổ tay Đảng viên điện tử qua trục LGSP',
          domainCode: 'DOM_TCD_DV',
          plannedQty: 20,
          actualQty: 20,
          difficultyK: 2.5,
          finalKpiScore: 35.0,
          organizationId,
        },
        {
          evaluationId: evalOfficer4.id,
          taskName: 'Thẩm định danh sách trao tặng Huy hiệu Đảng đợt 03/02 trên toàn tỉnh',
          domainCode: 'DOM_TCD_DV',
          plannedQty: 35,
          actualQty: 35,
          difficultyK: 2.0,
          finalKpiScore: 28.5,
          organizationId,
        },
      ],
    });

    console.log('✅ Đã nạp thành công bộ dữ liệu đánh giá KPI mẫu & nhiệm vụ thực tế cho cán bộ Ban Tổ chức Tỉnh ủy.');
    console.log('🎉 Hoàn tất 100% nạp công thức tính điểm KPI/OKR theo tài liệu thiết kế!');
  } finally {
    if (shouldDisconnect) {
      await prisma.$disconnect();
    }
  }
}

if (require.main === module) {
  seedBtctuKpiEngine()
    .then(() => process.exit(0))
    .catch((e) => {
      console.error('Lỗi seed KPI engine:', e);
      process.exit(1);
    });
}
