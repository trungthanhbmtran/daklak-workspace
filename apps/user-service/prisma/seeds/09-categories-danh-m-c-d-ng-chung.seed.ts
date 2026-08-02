import { PrismaClient } from '../../src/generated/prisma/client';
import * as bcrypt from 'bcrypt';

export async function seedCategoriesDanhMCDNgChung(prisma: PrismaClient) {
  
  console.log('🔹 Seeding Categories...');

  await prisma.categoryGroup.upsert({
    where: { code: 'INTEGRATION_PROTOCOL' },
    update: { name: 'Giao thức tích hợp' },
    create: { code: 'INTEGRATION_PROTOCOL', name: 'Giao thức tích hợp' },
  });

  const integrationProtocols = [
    { code: 'REST', name: 'REST API', order: 1 },
    { code: 'SOAP', name: 'SOAP / WSDL', order: 2 },
    { code: 'GRAPHQL', name: 'GraphQL', order: 3 },
    { code: 'GRPC', name: 'gRPC', order: 4 },
  ];

  for (const protocol of integrationProtocols) {
    const cat = await prisma.category.upsert({
      where: { groupCode_code: { groupCode: 'INTEGRATION_PROTOCOL', code: protocol.code } },
      update: { order: protocol.order },
      create: { groupCode: 'INTEGRATION_PROTOCOL', code: protocol.code, order: protocol.order },
    });

    await prisma.categoryTranslation.upsert({
      where: { categoryId_langCode: { categoryId: cat.id, langCode: 'vi' } },
      update: { name: protocol.name },
      create: { categoryId: cat.id, langCode: 'vi', name: protocol.name },
    });
  }

  await prisma.categoryGroup.upsert({
    where: { code: 'INTEGRATION_AUTH_TYPE' },
    update: { name: 'Loại xác thực tích hợp' },
    create: { code: 'INTEGRATION_AUTH_TYPE', name: 'Loại xác thực tích hợp' },
  });

  const integrationAuthTypes = [
    { code: 'NONE', name: 'Không xác thực', order: 1 },
    { code: 'BASIC', name: 'Basic Auth', order: 2 },
    { code: 'BEARER', name: 'Bearer Token', order: 3 },
    { code: 'OAUTH2', name: 'OAuth 2.0', order: 4 },
    { code: 'API_KEY', name: 'API Key', order: 5 },
    // { code: 'MTLS', name: 'mTLS', order: 6 },
  ];

  for (const auth of integrationAuthTypes) {
    const cat = await prisma.category.upsert({
      where: { groupCode_code: { groupCode: 'INTEGRATION_AUTH_TYPE', code: auth.code } },
      update: { order: auth.order },
      create: { groupCode: 'INTEGRATION_AUTH_TYPE', code: auth.code, order: auth.order },
    });

    await prisma.categoryTranslation.upsert({
      where: { categoryId_langCode: { categoryId: cat.id, langCode: 'vi' } },
      update: { name: auth.name },
      create: { categoryId: cat.id, langCode: 'vi', name: auth.name },
    });
  }

  await prisma.categoryGroup.upsert({
    where: { code: 'PLAN_FRAMEWORK' },
    update: { name: 'Mô hình Quản trị / Kế hoạch' },
    create: { code: 'PLAN_FRAMEWORK', name: 'Mô hình Quản trị / Kế hoạch' },
  });

  const planFrameworks = [
    { code: 'OKRs', name: 'Objective & Key Results (OKRs)', order: 1 },
    { code: 'BSC', name: 'Balanced Scorecard (BSC)', order: 2 },
    { code: 'KPI', name: 'KPI Management', order: 3 },
    { code: 'MBO', name: 'Management by Objectives (MBO)', order: 4 },
    { code: 'SMART', name: 'SMART Goals', order: 5 },
    { code: 'AGILE', name: 'Agile Management', order: 6 },
    { code: 'LEAN', name: 'Lean Management', order: 7 },
    { code: 'DATA_DRIVEN', name: 'Data-Driven Management', order: 8 },
    { code: 'GOVERNANCE', name: 'Governance Model', order: 9 },
    { code: 'RACI', name: 'RACI Matrix', order: 10 },
  ];

  for (const fw of planFrameworks) {
    const cat = await prisma.category.upsert({
      where: { groupCode_code: { groupCode: 'PLAN_FRAMEWORK', code: fw.code } },
      update: { order: fw.order },
      create: { groupCode: 'PLAN_FRAMEWORK', code: fw.code, order: fw.order },
    });

    await prisma.categoryTranslation.upsert({
      where: { categoryId_langCode: { categoryId: cat.id, langCode: 'vi' } },
      update: { name: fw.name },
      create: { categoryId: cat.id, langCode: 'vi', name: fw.name },
    });
  }



  console.log('✅ Categories seeded successfully!');

  // 4. Chỉ lấy địa bàn cấp tỉnh: Tỉnh Đắk Lắk (PROVINCE 47) — không gán từng xã/phường
  const daklakProvince = await prisma.category.findFirst({
    where: { code: '47', groupCode: 'PROVINCE' },
  });
  const defaultGeoAreas = daklakProvince ? [daklakProvince] : [];

  // 5. Lấy các lĩnh vực KHCN, TT&TT, CĐS và NGÂN SÁCH
  const allDomainCodes = [
    'H15.07', 'CHUYEN_DOI_SO', 'DU_LIEU_SO', 'AN_TOAN_THONG_TIN', 'VIEN_THONG', 'KINH_TE_SO',
    'THONG_TIN_TRUYEN_THONG', 'BAO_CHI', 'XUAT_BAN', 'THONG_TIN_DIEN_TU', 'BUU_CHINH', 'HA_TANG_SO',
    'TRUYEN_THONG_CO_SO', 'THONG_TIN_DOI_NGOAI', 'NGAN_SACH',
    'QUAN_LY_KHOA_HOC', 'QUAN_LY_CONG_NGHE', 'DOI_MOI_SANG_TAO', 'KHOI_NGHIEP_SANG_TAO', 'TIEM_LUC_KHCN', 'SO_HUU_TRI_TUE',
    'TIEU_CHUAN_DO_LUONG_CHAT_LUONG', 'AN_TOAN_BUC_XA_HAT_NHAN', 'TAN_SO_VO_TUYEN_DIEN', 'CONG_NGHE_THONG_TIN', 'UNG_DUNG_KHCN'
  ];

  const techDomains = await prisma.category.findMany({
    where: {
      groupCode: 'DOMAIN',
      code: {
        in: allDomainCodes
      }
    }
  });

  const soKhcnUnits = await prisma.organizationUnit.findMany({
    where: {
      OR: [
        { code: 'H15.07' },
        { code: { startsWith: 'H15.07.' } }
      ]
    }
  });

  if (soKhcnUnits.length > 0) {
    const domainData: { unitId: number, domainId: number }[] = [];

    const domainMapping: Record<string, string[]> = {
      // Sở KHCN — toàn bộ lĩnh vực
      'H15.07': allDomainCodes,

      // Văn phòng Sở — hành chính tổng hợp toàn Sở
      'H15.07.05': ['H15.07'],

      // Phòng Kế hoạch - Tài chính
      'H15.07.07': ['NGAN_SACH', 'H15.07'],

      // Phòng Quản lý Khoa học
      'H15.07.08': ['QUAN_LY_KHOA_HOC', 'TIEM_LUC_KHCN'],

      // Phòng Chuyển đổi số
      'H15.07.09': ['CHUYEN_DOI_SO', 'DU_LIEU_SO', 'AN_TOAN_THONG_TIN', 'CONG_NGHE_THONG_TIN', 'VIEN_THONG', 'BUU_CHINH', 'TAN_SO_VO_TUYEN_DIEN', 'KINH_TE_SO', 'HA_TANG_SO'],

      // Phòng Quản lý Công nghệ & Đổi mới sáng tạo
      'H15.07.10': ['DOI_MOI_SANG_TAO', 'SO_HUU_TRI_TUE', 'KHOI_NGHIEP_SANG_TAO'],

      // Phòng Quản lý TCĐLCL
      'H15.07.11': ['TIEU_CHUAN_DO_LUONG_CHAT_LUONG', 'AN_TOAN_BUC_XA_HAT_NHAN'],

      // Trung tâm Đổi mới Sáng tạo (H15.07.01)
      'H15.07.01': ['DOI_MOI_SANG_TAO', 'KHOI_NGHIEP_SANG_TAO'],
      'H15.07.01.01': ['DOI_MOI_SANG_TAO'],
      'H15.07.01.02': ['KHOI_NGHIEP_SANG_TAO'],

      // TT Thông tin Ứng dụng KH&CN (H15.07.03) -> Giữ nguyên (nếu đây là một tổ chức cũ/mới tương ứng)
      'H15.07.03': ['THONG_TIN_TRUYEN_THONG', 'BAO_CHI', 'XUAT_BAN', 'THONG_TIN_DIEN_TU', 'TRUYEN_THONG_CO_SO', 'THONG_TIN_DOI_NGOAI'],
      'H15.07.03.01': ['THONG_TIN_TRUYEN_THONG', 'BAO_CHI', 'XUAT_BAN'],
      'H15.07.03.02': ['THONG_TIN_TRUYEN_THONG', 'BAO_CHI', 'XUAT_BAN', 'THONG_TIN_DIEN_TU'],
      'H15.07.03.03': ['THONG_TIN_DIEN_TU', 'TRUYEN_THONG_CO_SO'],
      'H15.07.03.04': ['TRUYEN_THONG_CO_SO', 'THONG_TIN_DOI_NGOAI'],
      'H15.07.03.05': ['H15.07'],

      // Trung tâm Kỹ thuật TCĐLCL (H15.07.02)
      'H15.07.02': ['TIEU_CHUAN_DO_LUONG_CHAT_LUONG'],
      'H15.07.02.01': ['TIEU_CHUAN_DO_LUONG_CHAT_LUONG'],
      'H15.07.02.02': ['TIEU_CHUAN_DO_LUONG_CHAT_LUONG'],
      'H15.07.02.03': ['TIEU_CHUAN_DO_LUONG_CHAT_LUONG'],

      // TT IOC — Giám sát Đô thị Thông minh (H15.07.04)
      'H15.07.04': ['DU_LIEU_SO', 'HA_TANG_SO', 'THONG_TIN_TRUYEN_THONG', 'CHUYEN_DOI_SO', 'AN_TOAN_THONG_TIN'],
      'H15.07.04.01': ['DU_LIEU_SO', 'CHUYEN_DOI_SO'],                                        // HC-TH IOC
      'H15.07.04.02': ['DU_LIEU_SO', 'AN_TOAN_THONG_TIN', 'CHUYEN_DOI_SO'],                   // Khai thác dữ liệu
      'H15.07.04.03': ['HA_TANG_SO', 'AN_TOAN_THONG_TIN', 'THONG_TIN_TRUYEN_THONG'],          // Hạ tầng ĐT thông minh
    };


    for (const unit of soKhcnUnits) {

      const assignedCodes = domainMapping[unit.code] || ['H15.07'];
      const unitDomains = techDomains.filter(d => assignedCodes.includes(d.code));

      for (const domain of unitDomains) {
        domainData.push({ unitId: unit.id, domainId: domain.id });
      }
    }



    await prisma.unitDomain.createMany({
      data: domainData,
      skipDuplicates: true,
    });

    console.log(`✅ Đã phân bổ Lĩnh vực chuyên môn theo chức năng cho các đơn vị KH&CN (Tổng: ${domainData.length} bản ghi)`);

    // ----------------------------------------------------
    // SEED STAFFING SLOTS (Định biên chi tiết cho từng Slot)
    // ----------------------------------------------------
    const allStaffing = await prisma.organizationStaffing.findMany({
      where: { unitId: { in: soKhcnUnits.map(u => u.id) } },
      include: { jobTitle: true, unit: true }
    });


    const slotDomains: { slotId: number, domainId: number }[] = [];
    const slotMonitored: { slotId: number, unitId: number }[] = [];
    const slotGeoAreas: { slotId: number, geographicAreaId: number }[] = [];

    const vanPhong = soKhcnUnits.find(u => u.code === 'H15.07.05');
    const thanhTra = soKhcnUnits.find(u => u.code === 'H15.07.06');
    const phongKHTC = soKhcnUnits.find(u => u.code === 'H15.07.07');
    const phongQLKH = soKhcnUnits.find(u => u.code === 'H15.07.08');
    const phongCDS = soKhcnUnits.find(u => u.code === 'H15.07.09');
    const phongQLCN = soKhcnUnits.find(u => u.code === 'H15.07.10');
    const phongQLTCDLCL = soKhcnUnits.find(u => u.code === 'H15.07.11');

    const ttDoiMoiSangTao = soKhcnUnits.find(u => u.code === 'H15.07.01');
    const ttTCDLCL = soKhcnUnits.find(u => u.code === 'H15.07.02');
    const ttThongTinUngDung = soKhcnUnits.find(u => u.code === 'H15.07.03');
    const trungtamIOC = soKhcnUnits.find(u => u.code === 'H15.07.04');

    // Phòng ban thuộc TT Đổi mới sáng tạo
    const phongHCTH_Dmst = soKhcnUnits.find(u => u.code === 'H15.07.01.01');
    const phongUomTao_Dmst = soKhcnUnits.find(u => u.code === 'H15.07.01.02');

    // Phòng ban thuộc TT TCDLCL
    const phongHCTH_Tcdlcl = soKhcnUnits.find(u => u.code === 'H15.07.02.01');
    const phongDoLuong_Tcdlcl = soKhcnUnits.find(u => u.code === 'H15.07.02.02');
    const phongThuNghiem_Tcdlcl = soKhcnUnits.find(u => u.code === 'H15.07.02.03');

    // Phòng ban thuộc TT Thông tin - Ứng dụng KHCN
    const phongHCTH_Ttud = soKhcnUnits.find(u => u.code === 'H15.07.03.01');
    const phongThongTin_Ttud = soKhcnUnits.find(u => u.code === 'H15.07.03.02');
    const phongUngDung_Ttud = soKhcnUnits.find(u => u.code === 'H15.07.03.03');
    const phongDichVu_Ttud = soKhcnUnits.find(u => u.code === 'H15.07.03.04');
    const traiThucNghiem_Ttud = soKhcnUnits.find(u => u.code === 'H15.07.03.05');

    // Phòng ban thuộc TT IOC
    const phongHCTH_Ioc = soKhcnUnits.find(u => u.code === 'H15.07.04.01');
    const phongKTQLDL_Ioc = soKhcnUnits.find(u => u.code === 'H15.07.04.02');
    const phongHTDT_Ioc = soKhcnUnits.find(u => u.code === 'H15.07.04.03');

    const domainNS = techDomains.find(d => d.code === 'NGAN_SACH');
    const domainCDS = techDomains.find(d => d.code === 'CHUYEN_DOI_SO');
    const domainTCDLCL = techDomains.find(d => d.code === 'TIEU_CHUAN_DO_LUONG_CHAT_LUONG');
    const domainQLCN = techDomains.find(d => d.code === 'QUAN_LY_CONG_NGHE');
    const domainSHTT = techDomains.find(d => d.code === 'SO_HUU_TRI_TUE');
    const domainUDKHCN = techDomains.find(d => d.code === 'UNG_DUNG_KHCN');
    const domainQLKH = techDomains.find(d => d.code === 'QUAN_LY_KHOA_HOC');
    const domainDMST = techDomains.find(d => d.code === 'DOI_MOI_SANG_TAO');

    for (const staffing of allStaffing) {
      for (let i = 1; i <= staffing.quantity; i++) {
        // Tạo Slot
        const slot = await prisma.staffingSlot.upsert({
          where: { staffingId_slotOrder: { staffingId: staffing.id, slotOrder: i } },
          update: {},
          create: { staffingId: staffing.id, slotOrder: i },
        });

        // 1. Địa bàn phụ trách (mặc định: Tỉnh Đắk Lắk)
        for (const geo of defaultGeoAreas) {
          slotGeoAreas.push({ slotId: slot.id, geographicAreaId: geo.id });
        }

        // 2. Lĩnh vực và Phòng ban theo dõi

        // Mặc định: Kế thừa lĩnh vực của đơn vị cha (ngoại trừ Lãnh đạo cấp Sở phân công riêng)
        if (staffing.unit.code !== 'H15.07') {
          const assignedCodes = domainMapping[staffing.unit.code] || ['H15.07'];
          const unitDomains = techDomains.filter(d => assignedCodes.includes(d.code));
          for (const d of unitDomains) {
            slotDomains.push({ slotId: slot.id, domainId: d.id });
          }
        }

        if (staffing.unit.code === 'H15.07') { // Lãnh đạo cấp Sở
          if (staffing.jobTitle.code === 'GIAM_DOC' && i === 1) {
            // Giám đốc phụ trách chung tất cả các lĩnh vực của Sở
            const allAssigned = techDomains.filter(d => (domainMapping['H15.07'] || []).includes(d.code));
            for (const d of allAssigned) slotDomains.push({ slotId: slot.id, domainId: d.id });

            if (vanPhong) slotMonitored.push({ slotId: slot.id, unitId: vanPhong.id });
            if (thanhTra) slotMonitored.push({ slotId: slot.id, unitId: thanhTra.id });
            if (phongKHTC) slotMonitored.push({ slotId: slot.id, unitId: phongKHTC.id });
          } else if (staffing.jobTitle.code === 'PHO_GIAM_DOC') {
            if (i === 1) { // PGD 1 phụ trách CĐS, IOC
              if (domainCDS) slotDomains.push({ slotId: slot.id, domainId: domainCDS.id });
              if (domainTCDLCL) slotDomains.push({ slotId: slot.id, domainId: domainTCDLCL.id });
              if (phongCDS) slotMonitored.push({ slotId: slot.id, unitId: phongCDS.id });
              if (trungtamIOC) slotMonitored.push({ slotId: slot.id, unitId: trungtamIOC.id });
              if (phongQLTCDLCL) slotMonitored.push({ slotId: slot.id, unitId: phongQLTCDLCL.id });
              if (ttTCDLCL) slotMonitored.push({ slotId: slot.id, unitId: ttTCDLCL.id });
            }
            if (i === 2) { // PGD 2 phụ trách QLCN
              if (domainQLCN) slotDomains.push({ slotId: slot.id, domainId: domainQLCN.id });
              if (domainSHTT) slotDomains.push({ slotId: slot.id, domainId: domainSHTT.id });
              if (domainUDKHCN) slotDomains.push({ slotId: slot.id, domainId: domainUDKHCN.id });
              if (phongQLCN) slotMonitored.push({ slotId: slot.id, unitId: phongQLCN.id });
              if (ttThongTinUngDung) slotMonitored.push({ slotId: slot.id, unitId: ttThongTinUngDung.id });
            }
            if (i === 3) { // PGD 3 phụ trách QLKH
              if (domainQLKH) slotDomains.push({ slotId: slot.id, domainId: domainQLKH.id });
              if (domainDMST) slotDomains.push({ slotId: slot.id, domainId: domainDMST.id });
              if (phongQLKH) slotMonitored.push({ slotId: slot.id, unitId: phongQLKH.id });
              if (ttDoiMoiSangTao) slotMonitored.push({ slotId: slot.id, unitId: ttDoiMoiSangTao.id });
            }
          }
        } else if (staffing.unit.code === 'H15.07.01') { // Trung tâm Đổi mới sáng tạo
          if (staffing.jobTitle.code === 'GIAM_DOC') {
            if (phongHCTH_Dmst) slotMonitored.push({ slotId: slot.id, unitId: phongHCTH_Dmst.id });
          } else if (staffing.jobTitle.code === 'PHO_GIAM_DOC') {
            if (i === 1 && phongUomTao_Dmst) slotMonitored.push({ slotId: slot.id, unitId: phongUomTao_Dmst.id });
          }
        } else if (staffing.unit.code === 'H15.07.02') { // Trung tâm TCDLCL
          if (staffing.jobTitle.code === 'GIAM_DOC') {
            if (phongHCTH_Tcdlcl) slotMonitored.push({ slotId: slot.id, unitId: phongHCTH_Tcdlcl.id });
          } else if (staffing.jobTitle.code === 'PHO_GIAM_DOC') {
            if (i === 1 && phongDoLuong_Tcdlcl) slotMonitored.push({ slotId: slot.id, unitId: phongDoLuong_Tcdlcl.id });
            if (i === 2 && phongThuNghiem_Tcdlcl) slotMonitored.push({ slotId: slot.id, unitId: phongThuNghiem_Tcdlcl.id });
          }
        } else if (staffing.unit.code === 'H15.07.03') { // Trung tâm Thông tin - Ứng dụng KHCN
          if (staffing.jobTitle.code === 'GIAM_DOC') {
            if (phongHCTH_Ttud) slotMonitored.push({ slotId: slot.id, unitId: phongHCTH_Ttud.id });
          } else if (staffing.jobTitle.code === 'PHO_GIAM_DOC') {
            if (i === 1) {
              if (phongThongTin_Ttud) slotMonitored.push({ slotId: slot.id, unitId: phongThongTin_Ttud.id });
              if (phongUngDung_Ttud) slotMonitored.push({ slotId: slot.id, unitId: phongUngDung_Ttud.id });
            }
            if (i === 2) {
              if (phongDichVu_Ttud) slotMonitored.push({ slotId: slot.id, unitId: phongDichVu_Ttud.id });
              if (traiThucNghiem_Ttud) slotMonitored.push({ slotId: slot.id, unitId: traiThucNghiem_Ttud.id });
            }
          }
        } else if (staffing.unit.code === 'H15.07.04') { // Trung tâm IOC
          if (staffing.jobTitle.code === 'GIAM_DOC') {
            if (phongKTQLDL_Ioc) slotMonitored.push({ slotId: slot.id, unitId: phongKTQLDL_Ioc.id });
          } else if (staffing.jobTitle.code === 'PHO_GIAM_DOC') {
            if (i === 1) {
              if (phongHCTH_Ioc) slotMonitored.push({ slotId: slot.id, unitId: phongHCTH_Ioc.id });
            }
            if (i === 2) {
              if (phongHTDT_Ioc) slotMonitored.push({ slotId: slot.id, unitId: phongHTDT_Ioc.id });
            }
          }
        }
      }
    }

    await prisma.staffingSlotDomain.createMany({ data: slotDomains, skipDuplicates: true });
    await prisma.staffingSlotMonitoredUnit.createMany({ data: slotMonitored, skipDuplicates: true });
    await prisma.staffingSlotGeographicArea.createMany({ data: slotGeoAreas, skipDuplicates: true });

    console.log(`✅ Đã phân bổ Lĩnh vực theo dõi (${slotDomains.length}), Địa bàn (${slotGeoAreas.length}), và Phòng ban theo dõi (${slotMonitored.length}) cho các Vị trí chức danh.`);
  }



  // ==========================================================
  // UNIT_TYPE_CATEGORY — Cập nhật description với metadata đầy đủ
  // Categories đã tạo qua loop chuẩn ở trên (group_code unique).
  // description lưu trong CategoryTranslation.description (JSON).
  // Frontend parse và render, không hardcode logic nghiệp vụ.
  // ==========================================================
  const unitTypeMeta: Record<string, { descVi: string; descEn: string }> = {
    CHINH_QUYEN: {
      descVi: JSON.stringify({
        icon: 'Landmark', color: 'blue',
        description: 'Sở, Ban, UBND các cấp, Chi cục trực thuộc',
        signingNote: 'Ký ban hành văn bản quản lý nhà nước (QĐ, CV, TB) theo thẩm quyền được phân cấp.',
        purposeNote: 'Thực hiện chức năng quản lý hành chính nhà nước trong lĩnh vực được giao.',
        signingAuthority: 'FULL', politicalSystem: 'HANH_CHINH',
        requiredFields: ['domainIds'],
        leaderTitleKeywords: ['Giám đốc', 'Phó Giám đốc', 'Chủ tịch UBND', 'Phó Chủ tịch UBND'],
        staffTitleKeywords: ['Chuyên viên cao cấp', 'Chuyên viên chính', 'Chuyên viên', 'Nhân viên'],
      }),
      descEn: JSON.stringify({
        icon: 'Landmark', color: 'blue',
        description: 'Departments, Offices, People\'s Committees, Sub-departments',
        signingNote: 'Issue state management documents (Decisions, Dispatches, Notices) within delegated authority.',
        purposeNote: 'Performs state administrative management functions in assigned fields.',
        signingAuthority: 'FULL', politicalSystem: 'HANH_CHINH',
        requiredFields: ['domainIds'],
        leaderTitleKeywords: ['Director', 'Deputy Director', 'Chairman', 'Vice Chairman'],
        staffTitleKeywords: ['Senior Expert', 'Principal Expert', 'Expert', 'Staff'],
      }),
    },
    DANG: {
      descVi: JSON.stringify({
        icon: 'Flag', color: 'red',
        description: 'Tỉnh ủy, Huyện ủy, Đảng bộ, Chi bộ, Ban Đảng',
        signingNote: 'Ký ban hành nghị quyết, chỉ thị, thông báo kết luận của Đảng.',
        purposeNote: 'Lãnh đạo chính trị theo hệ thống Đảng, song song với hệ thống hành chính.',
        signingAuthority: 'FULL', politicalSystem: 'DANG',
        requiredFields: [],
        leaderTitleKeywords: ['Bí thư', 'Phó Bí thư', 'Ủy viên Ban Thường vụ', 'Tỉnh ủy viên'],
        staffTitleKeywords: ['Chuyên viên đảng', 'Nhân viên văn phòng Đảng ủy'],
      }),
      descEn: JSON.stringify({
        icon: 'Flag', color: 'red',
        description: 'Provincial/District Party Committees, Party Cells',
        signingNote: 'Issue Party resolutions, directives, and conclusion notices.',
        purposeNote: 'Political leadership through the Party system, parallel to administrative governance.',
        signingAuthority: 'FULL', politicalSystem: 'DANG',
        requiredFields: [],
        leaderTitleKeywords: ['Secretary', 'Deputy Secretary', 'Standing Committee Member'],
        staffTitleKeywords: ['Party Expert', 'Party Office Staff'],
      }),
    },
    THAM_MUU: {
      descVi: JSON.stringify({
        icon: 'ClipboardList', color: 'violet',
        description: 'Văn phòng, Thanh tra, Phòng Tổ chức cán bộ, Kế hoạch–Tài chính',
        signingNote: 'Ký thừa lệnh hoặc theo ủy quyền. Không ban hành văn bản quy phạm pháp luật độc lập.',
        purposeNote: 'Tham mưu tổng hợp, điều phối nội bộ, hành chính quản trị cho lãnh đạo cơ quan.',
        signingAuthority: 'DELEGATED', politicalSystem: 'HANH_CHINH',
        requiredFields: ['domainIds'],
        leaderTitleKeywords: ['Chánh Văn phòng', 'Phó Chánh Văn phòng', 'Chánh Thanh tra', 'Trưởng phòng', 'Phó Trưởng phòng'],
        staffTitleKeywords: ['Chuyên viên', 'Kế toán viên', 'Nhân viên'],
      }),
      descEn: JSON.stringify({
        icon: 'ClipboardList', color: 'violet',
        description: 'Office, Inspectorate, Personnel Dept, Finance & Planning',
        signingNote: 'Sign on behalf of or by delegation. Cannot independently issue regulatory documents.',
        purposeNote: 'Comprehensive advisory, internal coordination, and administrative management.',
        signingAuthority: 'DELEGATED', politicalSystem: 'HANH_CHINH',
        requiredFields: ['domainIds'],
        leaderTitleKeywords: ['Chief of Office', 'Deputy Chief', 'Chief Inspector', 'Head of Department'],
        staffTitleKeywords: ['Expert', 'Accountant', 'Staff'],
      }),
    },
    CHUYEN_MON: {
      descVi: JSON.stringify({
        icon: 'BookOpen', color: 'emerald',
        description: 'Phòng nghiệp vụ, Chi cục trực thuộc Sở',
        signingNote: 'Tham mưu và thực thi chuyên ngành. Chi cục có thể ký một số văn bản theo phân cấp.',
        purposeNote: 'Quản lý chuyên môn theo ngành dọc; thanh tra, kiểm tra, hướng dẫn nghiệp vụ.',
        signingAuthority: 'DELEGATED', politicalSystem: 'HANH_CHINH',
        requiredFields: ['domainIds'],
        leaderTitleKeywords: ['Trưởng phòng', 'Phó Trưởng phòng', 'Chi cục trưởng', 'Phó Chi cục trưởng'],
        staffTitleKeywords: ['Chuyên viên', 'Chuyên viên chính', 'Chuyên viên cao cấp', 'Kiểm soát viên'],
      }),
      descEn: JSON.stringify({
        icon: 'BookOpen', color: 'emerald',
        description: 'Specialized divisions, Sub-departments under Departments',
        signingNote: 'Advisory and implementation in specialized fields. Sub-departments may sign certain documents.',
        purposeNote: 'Vertical sector management; inspection, guidance on professional matters.',
        signingAuthority: 'DELEGATED', politicalSystem: 'HANH_CHINH',
        requiredFields: ['domainIds'],
        leaderTitleKeywords: ['Head of Division', 'Deputy Head', 'Sub-department Director'],
        staffTitleKeywords: ['Expert', 'Principal Expert', 'Senior Expert', 'Inspector'],
      }),
    },
    SU_NGHIEP: {
      descVi: JSON.stringify({
        icon: 'GraduationCap', color: 'amber',
        description: 'Trung tâm, Trường, Bệnh viện, Ban quản lý dự án',
        signingNote: 'Ký hợp đồng dịch vụ, văn bản nội bộ. Vượt thẩm quyền phải trình cơ quan chủ quản.',
        purposeNote: 'Cung cấp dịch vụ công theo cơ chế tự chủ. Hoạt động theo Luật Viên chức.',
        signingAuthority: 'FULL', politicalSystem: 'SU_NGHIEP',
        requiredFields: ['domainIds', 'scope'],
        leaderTitleKeywords: ['Giám đốc', 'Phó Giám đốc', 'Hiệu trưởng', 'Phó Hiệu trưởng', 'Trưởng ban'],
        staffTitleKeywords: ['Viên chức', 'Giáo viên', 'Bác sĩ', 'Điều dưỡng', 'Kỹ sư', 'Giảng viên'],
      }),
      descEn: JSON.stringify({
        icon: 'GraduationCap', color: 'amber',
        description: 'Centers, Schools, Hospitals, Project Management Boards',
        signingNote: 'Sign service contracts, internal documents. Exceed authority must report to supervising agency.',
        purposeNote: 'Provide public services under autonomous mechanism. Operate under Civil Servant Law.',
        signingAuthority: 'FULL', politicalSystem: 'SU_NGHIEP',
        requiredFields: ['domainIds', 'scope'],
        leaderTitleKeywords: ['Director', 'Deputy Director', 'Principal', 'Vice Principal'],
        staffTitleKeywords: ['Official', 'Teacher', 'Doctor', 'Nurse', 'Engineer', 'Lecturer'],
      }),
    },
    PHONG_THUOC_SN: {
      descVi: JSON.stringify({
        icon: 'Users', color: 'slate',
        description: 'Phòng HC-TH, Tổ chuyên môn nội bộ TT/Trường/BV',
        signingNote: 'Không ký văn bản đối ngoại. Mọi trao đổi ra ngoài qua Giám đốc/Hiệu trưởng đơn vị.',
        purposeNote: 'Thực hiện chức năng chuyên môn nội bộ trong đơn vị sự nghiệp.',
        signingAuthority: 'INTERNAL', politicalSystem: 'SU_NGHIEP',
        requiredFields: ['domainIds'],
        leaderTitleKeywords: ['Trưởng phòng', 'Phó Trưởng phòng', 'Tổ trưởng', 'Tổ phó'],
        staffTitleKeywords: ['Viên chức', 'Nhân viên', 'Kỹ thuật viên', 'Y tá', 'Hộ lý'],
      }),
      descEn: JSON.stringify({
        icon: 'Users', color: 'slate',
        description: 'Admin Division, Internal specialist teams in Centers/Schools/Hospitals',
        signingNote: 'No external document signing. All external communications via Director/Principal.',
        purposeNote: 'Internal specialized functions within public service units.',
        signingAuthority: 'INTERNAL', politicalSystem: 'SU_NGHIEP',
        requiredFields: ['domainIds'],
        leaderTitleKeywords: ['Head of Department', 'Deputy Head', 'Team Leader', 'Deputy Team Leader'],
        staffTitleKeywords: ['Official', 'Staff', 'Technician', 'Nurse', 'Care Worker'],
      }),
    },
  };

  for (const [code, meta] of Object.entries(unitTypeMeta)) {
    const cat = await prisma.category.findUnique({
      where: { groupCode_code: { groupCode: 'UNIT_TYPE_CATEGORY', code } },
    });
    if (!cat) continue;

    await prisma.categoryTranslation.upsert({
      where: { categoryId_langCode: { categoryId: cat.id, langCode: 'vi' } },
      update: { description: meta.descVi },
      create: { categoryId: cat.id, langCode: 'vi', name: '', description: meta.descVi },
    });
    await prisma.categoryTranslation.upsert({
      where: { categoryId_langCode: { categoryId: cat.id, langCode: 'en' } },
      update: { description: meta.descEn },
      create: { categoryId: cat.id, langCode: 'en', name: '', description: meta.descEn },
    });
  }
  console.log('✅ Đã cập nhật metadata đầy đủ cho UNIT_TYPE_CATEGORY (6 nhóm phân loại tổ chức).');

  // ==========================================================
  // PBAC MENU SEED (Giao diện chuẩn)
  // ==========================================================
  console.log('🔹 Seeding Standard Menus...');

  const menuData = [
    // 1. Dashboard (Public/No PBAC required)
    { code: 'DASHBOARD', name: 'Bảng điều khiển', route: '/', icon: 'LayoutDashboard', order: 1, linkedResourceCode: null, type: 'MENU' },

    // 2. Quản trị hệ thống (chỉ SUPER_ADMIN + ADMIN thấy)
    { code: 'SYS_GROUP', name: 'Quản trị hệ thống', route: '/services/admin', icon: 'Settings2', order: 99, linkedResourceCode: null, type: 'SERVICE_ITEM' },
    { code: 'SYS_ORG', name: 'Cơ cấu tổ chức', route: '/services/admin/organization', icon: 'Building2', order: 1, parentCode: 'SYS_GROUP', linkedResourceCode: 'ORGANIZATION', type: 'MENU' },
    { code: 'SYS_USER', name: 'Người dùng', route: '/services/admin/users', icon: 'Users', order: 2, parentCode: 'SYS_GROUP', linkedResourceCode: 'USER', type: 'MENU' },
    { code: 'SYS_ROLE', name: 'Vai trò & Quyền', route: '/services/admin/roles', icon: 'ShieldCheck', order: 3, parentCode: 'SYS_GROUP', linkedResourceCode: 'ROLE', type: 'MENU' },
    { code: 'SYS_RESOURCE', name: 'Tài nguyên PBAC', route: '/services/admin/resources', icon: 'Database', order: 4, parentCode: 'SYS_GROUP', linkedResourceCode: 'RESOURCE', type: 'MENU' },
    { code: 'SYS_MENU', name: 'Quản lý Menu', route: '/services/admin/menus', icon: 'Menu', order: 5, parentCode: 'SYS_GROUP', linkedResourceCode: 'MENU', type: 'MENU' },
    { code: 'SYS_CAT', name: 'Danh mục', route: '/services/admin/categories', icon: 'ListTree', order: 6, parentCode: 'SYS_GROUP', linkedResourceCode: 'CATEGORY', type: 'MENU' },
    { code: 'SYS_SETTING', name: 'Cấu hình chung', route: '/services/admin/settings', icon: 'Settings', order: 8, parentCode: 'SYS_GROUP', linkedResourceCode: 'SYSTEM', type: 'MENU' },
    { code: 'SYS_ENDPOINT', name: 'Quản lý Endpoints', route: '/system-admin/endpoints', icon: 'PlugZ', order: 9, parentCode: 'SYS_GROUP', linkedResourceCode: 'SYSTEM', type: 'MENU' },

    // 2.5 Trung tâm Thông báo (Hub)
    { code: 'HUB_NOTIF_GROUP', name: 'Trung tâm Thông báo', route: '/hub/notifications', icon: 'Bell', order: 10, linkedResourceCode: null, type: 'SERVICE_ITEM' },
    { code: 'SYS_NOTIF', name: 'Cấu hình Thông báo', route: '/hub/notifications/config', icon: 'Mail', order: 1, parentCode: 'HUB_NOTIF_GROUP', linkedResourceCode: 'NOTIFICATION', type: 'MENU' },

    // 2.6 Quản lý API Gateway
    { code: 'API_GATEWAY_GROUP', name: 'Quản lý API Gateway', route: '/admin/gateway', icon: 'Server', order: 11, linkedResourceCode: null, type: 'SERVICE_ITEM' },

    // 3. Quản lý Nhân sự & Công việc
    { code: 'HRM_GROUP', name: 'Nhân sự & Công việc', route: '/services/hrm', icon: 'Users', order: 2, linkedResourceCode: null, type: 'SERVICE_ITEM' },
    { code: 'HRM_DASHBOARD_MENU', name: 'Tổng quan (Dashboard)', route: '/services/hrm/dashboard', icon: 'LayoutDashboard', order: 1, parentCode: 'HRM_GROUP', linkedResourceCode: 'HRM_EMPLOYEE', type: 'MENU' },
    { code: 'HRM_EMPLOYEE_MENU', name: 'Hồ sơ nhân sự', route: '/services/hrm/employees', icon: 'UserCircle', order: 2, parentCode: 'HRM_GROUP', linkedResourceCode: 'HRM_EMPLOYEE', type: 'MENU' },
    { code: 'HRM_TASK_MENU', name: 'Danh sách nhiệm vụ', route: '/services/hrm/work-plans/tasks', icon: 'CheckSquare', order: 3, parentCode: 'HRM_GROUP', linkedResourceCode: 'TASK', type: 'MENU' },
    { code: 'HRM_CALENDAR_MENU', name: 'Lịch công tác', route: '/services/hrm/calendar', icon: 'CalendarDays', order: 4, parentCode: 'HRM_GROUP', linkedResourceCode: 'TASK', type: 'MENU' },
    { code: 'HRM_PROJECT_MENU', name: 'Dự án', route: '/services/hrm/work-plans/projects', icon: 'FolderGit2', order: 5, parentCode: 'HRM_GROUP', linkedResourceCode: 'PROJECT', type: 'MENU' },
    { code: 'HRM_TEMPLATE_MENU', name: 'Khung mẫu nhiệm vụ', route: '/services/hrm/work-plans/rank-templates', icon: 'ClipboardList', order: 6, parentCode: 'HRM_GROUP', linkedResourceCode: 'PLAN', type: 'MENU' },
    { code: 'HRM_SELECTOR_MENU', name: 'Đăng ký nhiệm vụ', route: '/services/hrm/work-plans/manual-selector', icon: 'Layers', order: 7, parentCode: 'HRM_GROUP', linkedResourceCode: 'PLAN', type: 'MENU' },
    { code: 'HRM_CRITERIA_MENU', name: 'Tiêu chí đánh giá', route: '/services/hrm/work-plans/criteria', icon: 'BarChart2', order: 8, parentCode: 'HRM_GROUP', linkedResourceCode: 'KPI', type: 'MENU' },
    { code: 'HRM_PERSONAL_KPI_MENU', name: 'KPI Cá nhân', route: '/services/hrm/work-plans/personal-kpi', icon: 'Target', order: 9, parentCode: 'HRM_GROUP', linkedResourceCode: 'KPI', type: 'MENU' },
    { code: 'HRM_REVIEW_KPI_MENU', name: 'Đánh giá KPI', route: '/services/hrm/work-plans/review-kpi', icon: 'CheckCircle', order: 10, parentCode: 'HRM_GROUP', linkedResourceCode: 'KPI', type: 'MENU' },
    { code: 'HRM_DASHBOARD_KPI_MENU', name: 'Tổng hợp KPI', route: '/services/hrm/work-plans/dashboard-kpi', icon: 'PieChart', order: 11, parentCode: 'HRM_GROUP', linkedResourceCode: 'KPI', type: 'MENU' },

    // 4. Quản lý Văn bản
    { code: 'DOC_GROUP', name: 'Quản lý Văn bản', route: '/services/documents', icon: 'FileText', order: 3, linkedResourceCode: null, type: 'SERVICE_ITEM' },
    { code: 'DOC_INCOMING_MENU', name: 'Văn bản đến', route: '/services/documents/incoming', icon: 'Mail', order: 1, parentCode: 'DOC_GROUP', linkedResourceCode: 'DOC_INCOMING', type: 'MENU' },
    { code: 'DOC_OUTGOING_MENU', name: 'Văn bản đi', route: '/services/documents/outgoing', icon: 'Send', order: 2, parentCode: 'DOC_GROUP', linkedResourceCode: 'DOC_OUTGOING', type: 'MENU' },
    { code: 'DOC_PROCESSING_MENU', name: 'Xử lý văn bản', route: '/services/documents/processing', icon: 'Layers', order: 3, parentCode: 'DOC_GROUP', linkedResourceCode: 'DOC_PROCESSING', type: 'MENU' },
    { code: 'DOC_PUBLISH_MENU', name: 'Phát hành văn bản', route: '/services/documents/publish', icon: 'Globe', order: 4, parentCode: 'DOC_GROUP', linkedResourceCode: 'DOC_PUBLISH', type: 'MENU' },
    { code: 'DOC_TRANSPARENCY_MENU', name: 'Công khai văn bản', route: '/services/documents/transparency', icon: 'Eye', order: 5, parentCode: 'DOC_GROUP', linkedResourceCode: 'DOC_TRANSPARENCY', type: 'MENU' },
    { code: 'DOC_MINUTES_MENU', name: 'Biên bản cuộc họp', route: '/services/documents/minutes', icon: 'ClipboardList', order: 6, parentCode: 'DOC_GROUP', linkedResourceCode: 'DOC_MINUTES', type: 'MENU' },
    { code: 'DOC_CABINET_MENU', name: 'Tủ văn bản', route: '/services/documents/cabinet', icon: 'Inbox', order: 7, parentCode: 'DOC_GROUP', linkedResourceCode: 'DOCUMENT', type: 'MENU' },
    { code: 'DOC_CONSULTATION_MENU', name: 'Lấy ý kiến', route: '/services/documents/consultations', icon: 'MessageSquare', order: 8, parentCode: 'DOC_GROUP', linkedResourceCode: 'DOC_CONSULTATION', type: 'MENU' },
    { code: 'DOC_DOSSIER_MENU', name: 'Hồ sơ lưu trữ', route: '/services/documents/dossiers', icon: 'Layers', order: 9, parentCode: 'DOC_GROUP', linkedResourceCode: 'DOCUMENT', type: 'MENU' },
    { code: 'DOC_PROCEDURE_MENU', name: 'Thủ tục hành chính', route: '/services/documents/procedures', icon: 'ClipboardList', order: 10, parentCode: 'DOC_GROUP', linkedResourceCode: 'DOCUMENT', type: 'MENU' },

    // 5. Quản lý Nội dung
    { code: 'CONTENT_GROUP', name: 'Quản lý Nội dung', route: '/services/posts', icon: 'Newspaper', order: 4, linkedResourceCode: null, type: 'SERVICE_ITEM' },
    { code: 'CONTENT_POST_MENU', name: 'Bài viết', route: '/services/posts', icon: 'FileText', order: 1, parentCode: 'CONTENT_GROUP', linkedResourceCode: 'POST', type: 'MENU' },
    { code: 'CONTENT_BANNER_MENU', name: 'Banner', route: '/services/posts/banners', icon: 'Image', order: 2, parentCode: 'CONTENT_GROUP', linkedResourceCode: 'BANNER', type: 'MENU' },
    { code: 'CONTENT_PORTAL_MENU', name: 'Menu Portal', route: '/services/posts/portal-menu', icon: 'Menu', order: 3, parentCode: 'CONTENT_GROUP', linkedResourceCode: 'PORTAL_MENU', type: 'MENU' },
    { code: 'CONTENT_INTERACT_MENU', name: 'Tương tác công dân', route: '/services/posts/interactions', icon: 'MessageSquare', order: 4, parentCode: 'CONTENT_GROUP', linkedResourceCode: 'CITIZEN_INTERACTION', type: 'MENU' },
    { code: 'CONTENT_APPEARANCE_MENU', name: 'Giao diện Portal', route: '/services/posts/appearance', icon: 'Eye', order: 5, parentCode: 'CONTENT_GROUP', linkedResourceCode: 'POST', type: 'MENU' },
    { code: 'CONTENT_CONFIG_MENU', name: 'Cấu hình Portal', route: '/services/posts/portal-config', icon: 'Settings', order: 6, parentCode: 'CONTENT_GROUP', linkedResourceCode: 'POST', type: 'MENU' },
    { code: 'CONTENT_BUILDER_MENU', name: 'Trình dựng trang', route: '/services/posts/portal-page-builder', icon: 'Layers', order: 7, parentCode: 'CONTENT_GROUP', linkedResourceCode: 'POST', type: 'MENU' },

    // 6. Quy trình & Tích hợp
    { code: 'WORKFLOW_GROUP', name: 'Quy trình & Liên thông', route: '/services/integration', icon: 'GitBranch', order: 5, linkedResourceCode: null, type: 'SERVICE_ITEM' },
    { code: 'WORKFLOW_DASHBOARD_MENU', name: 'Bảng quản trị', route: '/services/integration', icon: 'Layers', order: 1, parentCode: 'WORKFLOW_GROUP', linkedResourceCode: 'WORKFLOW', type: 'MENU' },
    { code: 'WORKFLOW_GATEWAY_MENU', name: 'Cấu hình Gateway', route: '/services/integration/gateway', icon: 'Network', order: 2, parentCode: 'WORKFLOW_GROUP', linkedResourceCode: 'INTEGRATION', type: 'MENU' },
    { code: 'WORKFLOW_SYSTEM_MENU', name: 'Quy trình hệ thống', route: '/services/integration/workflows', icon: 'GitBranch', order: 3, parentCode: 'WORKFLOW_GROUP', linkedResourceCode: 'WORKFLOW', type: 'MENU' },
    { code: 'WORKFLOW_API_MENU', name: 'Kết nối API Đầu vào', route: '/services/integration/apis', icon: 'Plug', order: 4, parentCode: 'WORKFLOW_GROUP', linkedResourceCode: 'INTEGRATION', type: 'MENU' },

    // 7. Phân tích, báo cáo
    { code: 'REPORT_GROUP', name: 'Phân tích, báo cáo', route: '/services/reports', icon: 'BarChart3', order: 6, linkedResourceCode: null, type: 'SERVICE_ITEM' },
    { code: 'REPORT_DASHBOARD_MENU', name: 'Dashboard Thống kê', route: '/services/reports', icon: 'LayoutDashboard', order: 1, parentCode: 'REPORT_GROUP', linkedResourceCode: 'REPORT', type: 'MENU' },
  ];

  for (const m of menuData) {
    let parentId: number | null = null;
    if (m.parentCode) {
      const parentMenu = await prisma.menu.findUnique({ where: { code: m.parentCode } });
      if (parentMenu) parentId = parentMenu.id;
    }

    await prisma.menu.upsert({
      where: { code: m.code },
      update: {
        name: m.name,
        route: m.route,
        icon: m.icon,
        order: m.order,
        linkedResourceCode: m.linkedResourceCode,
        type: m.type,
        parentId
      },
      create: {
        code: m.code,
        name: m.name,
        route: m.route,
        icon: m.icon,
        order: m.order,
        linkedResourceCode: m.linkedResourceCode,
        type: m.type,
        parentId
      }
    });
  }
  console.log('✅ Hoàn tất cấu hình PBAC Menus.');

  // ==========================================================
  console.log('🌱 READY FOR GRPC MICROSERVICES DEPLOYMENT!');

}
