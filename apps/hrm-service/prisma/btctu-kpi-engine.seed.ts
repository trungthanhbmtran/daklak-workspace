import { PrismaClient } from '../src/generated/prisma';

export async function seedBtctuKpiEngine(prisma: PrismaClient) {
  console.log('📦 Bắt đầu nạp cấu hình Generic KPI/OKR cho Ban Tổ chức Tỉnh ủy (BTCTU_DAKLAK)...');

  const unitCode = 'BTCTU_DAKLAK'; // Khớp với tổ chức trong user-service
  const version = 'v1.2026';

  // 1. Tạo hoặc cập nhật Rule Set (Bộ luật version v1.2026)
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

  console.log(`✅ Đã nạp KpiRuleSet: ${version} cho ${unitCode}`);

  // 2. Nạp Ma trận trọng số (Domain Weights)
  const domainWeights = [
    {
      domainCode: 'DOM_THAM_DINH', // Thẩm định / BVCTNB
      volumeWeight: 15.0,
      qualityWeight: 50.0,
      progressWeight: 20.0,
      attitudeWeight: 15.0,
    },
    {
      domainCode: 'DOM_VAN_THU', // Văn thư / Hồ sơ
      volumeWeight: 40.0,
      qualityWeight: 20.0,
      progressWeight: 30.0,
      attitudeWeight: 10.0,
    },
    {
      domainCode: 'DOM_IT_ATTT', // Quản trị CNTT
      volumeWeight: 20.0,
      qualityWeight: 30.0,
      progressWeight: 35.0,
      attitudeWeight: 15.0,
    },
    {
      domainCode: 'DOM_THAM_MUU', // Tham mưu Đề án
      volumeWeight: 20.0,
      qualityWeight: 40.0,
      progressWeight: 20.0,
      attitudeWeight: 20.0,
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

  console.log(`✅ Đã nạp thành công ${domainWeights.length} Ma trận trọng số.`);

  // 3. Nạp danh mục biểu mẫu hành chính (Forms 01 - 05)
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
}
