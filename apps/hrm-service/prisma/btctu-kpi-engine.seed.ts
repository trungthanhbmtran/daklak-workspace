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
    { formCode: 'MAU_01', name: 'Bản đăng ký khung danh mục sản phẩm / công việc chuẩn đầu kỳ', description: 'Đăng ký công việc đầu kỳ' },
    { formCode: 'MAU_02', name: 'Bản tự đánh giá, chấm điểm KPI/OKR cá nhân hằng quý', description: 'Cá nhân tự đánh giá' },
    { formCode: 'MAU_03', name: 'Bảng tổng hợp kết quả đánh giá tập thể phòng', description: 'Tổng hợp đánh giá cấp phòng' },
    { formCode: 'MAU_04', name: 'Bảng kê khai sản phẩm / nhiệm vụ nổi trội, vượt mức', description: 'Khai báo thành tích nổi trội' },
    { formCode: 'MAU_05', name: 'Dự thảo quyết định phê duyệt xếp loại chất lượng hằng quý', description: 'Quyết định chốt xếp loại của Lãnh đạo Ban' },
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
