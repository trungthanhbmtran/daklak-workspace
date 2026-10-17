const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
const { PrismaClient } = require('../src/generated/prisma');
require('dotenv').config();

const dbUrl = process.env.DATABASE_URL || 'mysql://root:mypassword@localhost:3306/admin_report?allowPublicKeyRetrieval=true';
const mariadbUrl = dbUrl.replace(/^mysql:\/\//, 'mariadb://');
const adapter = new PrismaMariaDb(mariadbUrl);
const prisma = new PrismaClient({ adapter });

async function seedBtcFinance() {
  console.log('=== Bắt đầu nạp dữ liệu Báo cáo Giám sát Tài chính Bộ Tài chính & Trục Đắk Lắk ===');

  // 1. Nạp danh mục Data Sources của Bộ Tài chính & Trục Đắk Lắk
  const btcSources = [
    {
      code: 'BTC_FINANCE_OVERVIEW',
      name: 'Giám sát Tài chính & Ngân sách Tổng hợp tỉnh Đắk Lắk (Bộ Tài chính & LGSP)',
      upstream: 'api-gateway',
      path: '/api/v1/external/btc/overview',
      fields: ['id', 'ma_chi_tieu', 'ten_chi_tieu', 'linh_vuc', 'don_vi_phu_trach', 'du_toan_giao', 'thuc_hien', 'ty_le_dat', 'cung_ky_nam_truoc', 'danh_gia_tien_do', 'ky_bao_cao'],
    },
    {
      code: 'BTC_NSNN_THU',
      name: 'Thu Ngân sách Nhà nước trên địa bàn tỉnh Đắk Lắk (Cục Thuế & Bộ Tài chính)',
      upstream: 'api-gateway',
      path: '/api/v1/external/btc/nsnn_thu',
      fields: ['id', 'dia_ban', 'khoan_thu', 'du_toan_nam', 'so_thuc_thu', 'tien_do_dat', 'cung_ky_nam_truoc', 'thoi_gian', 'ghi_chu'],
    },
    {
      code: 'BTC_NSNN_CHI',
      name: 'Chi Ngân sách Nhà nước tỉnh Đắk Lắk (Kho bạc Nhà nước & Bộ Tài chính)',
      upstream: 'api-gateway',
      path: '/api/v1/external/btc/nsnn_chi',
      fields: ['id', 'linh_vuc_chi', 'du_toan_giao', 'so_da_chi', 'ty_le_giai_ngan', 'thoi_gian', 'ghi_chu'],
    },
    {
      code: 'BTC_DTC_GIAINGAN_TUAN',
      name: 'Giải ngân Vốn Đầu tư công theo tuần - Dự án trọng điểm (Trục Tài chính Đắk Lắk)',
      upstream: 'api-gateway',
      path: '/api/v1/external/btc/dtc_giaingan_tuan',
      fields: ['id', 'ten_du_an', 'chu_dau_tu', 'ke_hoach_von', 'giai_ngan_tuan', 'da_giai_ngan', 'ty_le_dat', 'tuan_bao_cao'],
    },
    {
      code: 'BTC_HHXNK',
      name: 'Kim ngạch Hàng hóa Xuất Nhập khẩu Hải quan Đắk Lắk (Tổng cục Hải quan)',
      upstream: 'api-gateway',
      path: '/api/v1/external/btc/hhxnk',
      fields: ['id', 'ma_hai_quan', 'ten_chi_cuc', 'loai_hinh', 'mat_hang', 'thi_truong', 'so_luong_tan', 'kim_ngach_usd', 'thue_xnk_vnd', 'thoi_gian'],
    },
    {
      code: 'BTC_HDDN',
      name: 'Hóa đơn Điện tử & Hoạt động Doanh nghiệp (Bộ Tài chính & Thuế điện tử)',
      upstream: 'api-gateway',
      path: '/api/v1/external/btc/hddn',
      fields: ['id', 'mst', 'ten_doanh_nghiep', 'loai_hoa_don', 'so_luong_hd', 'tong_tien_truoc_thue', 'tien_thue', 'ky_ke_khai'],
    },
  ];

  for (const s of btcSources) {
    await prisma.reportDataSource.upsert({
      where: { code: s.code },
      update: s,
      create: s,
    });
    console.log(`- Upsert ReportDataSource: ${s.code}`);
  }

  // 2. Dữ liệu Snapshot
  const overviewRows = [
    { id: 1, ma_chi_tieu: 'TC_01', ten_chi_tieu: 'Thu Ngân sách Nhà nước trên địa bàn tỉnh', linh_vuc: 'Thu ngân sách', don_vi_phu_trach: 'Cục Thuế tỉnh Đắk Lắk', du_toan_giao: 9640000000000, thuc_hien: 8520000000000, ty_le_dat: 88.4, cung_ky_nam_truoc: 7550000000000, danh_gia_tien_do: 'Vượt tiến độ dự toán (88.4%)', ky_bao_cao: 'Tháng 10/2026' },
    { id: 2, ma_chi_tieu: 'TC_02', ten_chi_tieu: 'Chi Ngân sách địa phương theo phân bổ', linh_vuc: 'Chi ngân sách', don_vi_phu_trach: 'Kho bạc Nhà nước Đắk Lắk', du_toan_giao: 14200000000000, thuc_hien: 11650000000000, ty_le_dat: 82.0, cung_ky_nam_truoc: 10420000000000, danh_gia_tien_do: 'Đảm bảo chi thường xuyên và ĐTPT', ky_bao_cao: 'Tháng 10/2026' },
    { id: 3, ma_chi_tieu: 'TC_03', ten_chi_tieu: 'Kế hoạch Vốn Đầu tư công giải ngân', linh_vuc: 'Đầu tư phát triển', don_vi_phu_trach: 'Sở Kế hoạch và Đầu tư', du_toan_giao: 6750000000000, thuc_hien: 5480000000000, ty_le_dat: 81.2, cung_ky_nam_truoc: 4620000000000, danh_gia_tien_do: 'Đạt mức khá so với cả nước (81.2%)', ky_bao_cao: 'Tháng 10/2026' },
    { id: 4, ma_chi_tieu: 'TC_04', ten_chi_tieu: 'Kim ngạch Xuất khẩu Nông sản chủ lực', linh_vuc: 'Hải quan & XNK', don_vi_phu_trach: 'Chi cục HQ Buôn Ma Thuột', du_toan_giao: 360000000, thuc_hien: 320100000, ty_le_dat: 88.9, cung_ky_nam_truoc: 278000000, danh_gia_tien_do: 'Xuất siêu 284 Triệu USD', ky_bao_cao: 'Tháng 10/2026' },
    { id: 5, ma_chi_tieu: 'TC_05', ten_chi_tieu: 'Thuế Doanh nghiệp phát sinh qua HĐĐT', linh_vuc: 'Thuế điện tử', don_vi_phu_trach: 'Cục Thuế tỉnh Đắk Lắk', du_toan_giao: 4300000000000, thuc_hien: 3840000000000, ty_le_dat: 89.3, cung_ky_nam_truoc: 3320000000000, danh_gia_tien_do: '2.450 doanh nghiệp hoạt động', ky_bao_cao: 'Tháng 10/2026' },
    { id: 6, ma_chi_tieu: 'TC_06', ten_chi_tieu: 'Cao tốc Khánh Hòa - Buôn Ma Thuột (DA TP3)', linh_vuc: 'Dự án trọng điểm', don_vi_phu_trach: 'BQLDA ĐTXD CTGT & NN PTNT Tỉnh', du_toan_giao: 1350000000000, thuc_hien: 1080000000000, ty_le_dat: 80.0, cung_ky_nam_truoc: 620000000000, danh_gia_tien_do: 'Bám sát mốc tiến độ thông xe 2026', ky_bao_cao: 'Tuần 41/2026' },
    { id: 7, ma_chi_tieu: 'TC_07', ten_chi_tieu: 'Đường Hồ Chí Minh tránh phía Đông TP. BMT', linh_vuc: 'Dự án trọng điểm', don_vi_phu_trach: 'BQLDA ĐTXD CTGT & NN PTNT Tỉnh', du_toan_giao: 520000000000, thuc_hien: 460000000000, ty_le_dat: 88.5, cung_ky_nam_truoc: 310000000000, danh_gia_tien_do: 'Giai đoạn thảm nhựa hoàn thiện', ky_bao_cao: 'Tuần 41/2026' },
    { id: 8, ma_chi_tieu: 'TC_08', ten_chi_tieu: 'Trung tâm Giám sát Điều hành Thông minh IOC', linh_vuc: 'Chuyển đổi số & ĐMST', don_vi_phu_trach: 'Sở Thông tin và Truyền thông', du_toan_giao: 65000000000, thuc_hien: 58000000000, ty_le_dat: 89.2, cung_ky_nam_truoc: 25000000000, danh_gia_tien_do: 'Tích hợp trục LGSP & CSDL ngành', ky_bao_cao: 'Tuần 41/2026' },
  ];

  const nsnnThuRows = [
    { id: 1, dia_ban: 'Toàn tỉnh Đắk Lắk', khoan_thu: 'Tổng thu NSNN trên địa bàn', du_toan_nam: 9640000000000, so_thuc_thu: 8520000000000, tien_do_dat: 88.4, cung_ky_nam_truoc: 7550000000000, thoi_gian: 'Tháng 10/2026', ghi_chu: 'Đạt 88.4% dự toán HĐND tỉnh giao' },
    { id: 2, dia_ban: 'TP. Buôn Ma Thuột', khoan_thu: 'Thuế TNDN & Tiền sử dụng đất', du_toan_nam: 3200000000000, so_thuc_thu: 2860000000000, tien_do_dat: 89.4, cung_ky_nam_truoc: 2510000000000, thoi_gian: 'Tháng 10/2026', ghi_chu: 'Trung tâm kinh tế đô thị của tỉnh' },
    { id: 3, dia_ban: 'Thị xã Buôn Hồ', khoan_thu: 'Thuế GTGT & Thuế TNCN', du_toan_nam: 680000000000, so_thuc_thu: 598000000000, tien_do_dat: 87.9, cung_ky_nam_truoc: 520000000000, thoi_gian: 'Tháng 10/2026', ghi_chu: 'Khu vực kinh tế phía Bắc' },
    { id: 4, dia_ban: 'Huyện Cư M\'gar', khoan_thu: 'Thuế SXKD & Nông sản cà phê', du_toan_nam: 560000000000, so_thuc_thu: 505000000000, tien_do_dat: 90.2, cung_ky_nam_truoc: 440000000000, thoi_gian: 'Tháng 10/2026', ghi_chu: 'Vùng chuyên canh cà phê lớn nhất' },
    { id: 5, dia_ban: 'Huyện Krông Pắc', khoan_thu: 'Thuế chuỗi giá trị sầu riêng', du_toan_nam: 480000000000, so_thuc_thu: 442000000000, tien_do_dat: 92.1, cung_ky_nam_truoc: 365000000000, thoi_gian: 'Tháng 10/2026', ghi_chu: 'Thủ phủ sầu riêng xuất khẩu' },
    { id: 6, dia_ban: 'Huyện Ea Kar', khoan_thu: 'Thuế dịch vụ thương mại', du_toan_nam: 410000000000, so_thuc_thu: 358000000000, tien_do_dat: 87.3, cung_ky_nam_truoc: 312000000000, thoi_gian: 'Tháng 10/2026', ghi_chu: 'Vùng đô thị động lực phía Đông' },
    { id: 7, dia_ban: 'Huyện Krông Ana', khoan_thu: 'Thuế nông lâm nghiệp', du_toan_nam: 320000000000, so_thuc_thu: 278000000000, tien_do_dat: 86.9, cung_ky_nam_truoc: 245000000000, thoi_gian: 'Tháng 10/2026', ghi_chu: 'Bám sát tiến độ thu' }
  ];

  const nsnnChiRows = [
    { id: 1, linh_vuc_chi: 'Chi đầu tư phát triển', du_toan_giao: 4850000000000, so_da_chi: 3940000000000, ty_le_giai_ngan: 81.2, thoi_gian: 'Tháng 10/2026', ghi_chu: 'Hạ tầng giao thông, thủy lợi, y tế' },
    { id: 2, linh_vuc_chi: 'Chi sự nghiệp giáo dục và đào tạo', du_toan_giao: 4120000000000, so_da_chi: 3480000000000, ty_le_giai_ngan: 84.5, thoi_gian: 'Tháng 10/2026', ghi_chu: 'Đảm bảo lương và cơ sở vật chất trường học' },
    { id: 3, linh_vuc_chi: 'Chi quản lý hành chính nhà nước', du_toan_giao: 1650000000000, so_da_chi: 1340000000000, ty_le_giai_ngan: 81.2, thoi_gian: 'Tháng 10/2026', ghi_chu: 'Tiết kiệm chi thường xuyên theo NQ Chính phủ' },
    { id: 4, linh_vuc_chi: 'Chi sự nghiệp y tế và dân số', du_toan_giao: 1380000000000, so_da_chi: 1150000000000, ty_le_giai_ngan: 83.3, thoi_gian: 'Tháng 10/2026', ghi_chu: 'Khám chữa bệnh BHYT và phòng chống dịch' },
    { id: 5, linh_vuc_chi: 'Chi sự nghiệp khoa học và công nghệ', du_toan_giao: 210000000000, so_da_chi: 178000000000, ty_le_giai_ngan: 84.8, thoi_gian: 'Tháng 10/2026', ghi_chu: 'Đổi mới sáng tạo và chuyển đổi số' },
    { id: 6, linh_vuc_chi: 'Chi an sinh xã hội & người có công', du_toan_giao: 980000000000, so_da_chi: 862000000000, ty_le_giai_ngan: 88.0, thoi_gian: 'Tháng 10/2026', ghi_chu: 'Chính sách người có công và đồng bào DTTS' }
  ];

  const dtcRows = [
    { id: 1, ten_du_an: 'Cao tốc Khánh Hòa - Buôn Ma Thuột (DA TP3)', chu_dau_tu: 'BQLDA ĐTXD CTGT & NN PTNT Tỉnh', ke_hoach_von: 1350000000000, giai_ngan_tuan: 42000000000, da_giai_ngan: 1080000000000, ty_le_dat: 80.0, tuan_bao_cao: 'Tuần 41/2026' },
    { id: 2, ten_du_an: 'Đường Hồ Chí Minh tránh phía Đông TP. BMT', chu_dau_tu: 'BQLDA ĐTXD CTGT & NN PTNT Tỉnh', ke_hoach_von: 520000000000, giai_ngan_tuan: 18500000000, da_giai_ngan: 460000000000, ty_le_dat: 88.5, tuan_bao_cao: 'Tuần 41/2026' },
    { id: 3, ten_du_an: 'Khu Công nghệ cao & Đổi mới sáng tạo Tỉnh', chu_dau_tu: 'Sở Khoa học và Công nghệ', ke_hoach_von: 240000000000, giai_ngan_tuan: 8200000000, da_giai_ngan: 198000000000, ty_le_dat: 82.5, tuan_bao_cao: 'Tuần 41/2026' },
    { id: 4, ten_du_an: 'Bệnh viện Đa khoa vùng Tây Nguyên (Giai đoạn 2)', chu_dau_tu: 'Sở Y tế Đắk Lắk', ke_hoach_von: 180000000000, giai_ngan_tuan: 5400000000, da_giai_ngan: 155000000000, ty_le_dat: 86.1, tuan_bao_cao: 'Tuần 41/2026' },
    { id: 5, ten_du_an: 'Nâng cấp hệ thống hồ thủy lợi Ea Kao', chu_dau_tu: 'BQLDA ĐTXD CTGT & NN PTNT Tỉnh', ke_hoach_von: 120000000000, giai_ngan_tuan: 3800000000, da_giai_ngan: 98000000000, ty_le_dat: 81.7, tuan_bao_cao: 'Tuần 41/2026' },
    { id: 6, ten_du_an: 'Trung tâm Điều hành Đô thị Thông minh IOC', chu_dau_tu: 'Sở Thông tin và Truyền thông', ke_hoach_von: 65000000000, giai_ngan_tuan: 2500000000, da_giai_ngan: 58000000000, ty_le_dat: 89.2, tuan_bao_cao: 'Tuần 41/2026' }
  ];

  const hhxnkRows = [
    { id: 1, ma_hai_quan: 'HQ_DL_01', ten_chi_cuc: 'Chi cục HQ Buôn Ma Thuột', loai_hinh: 'Xuất khẩu', mat_hang: 'Cà phê Robusta nhân xô', thi_truong: 'Liên minh Châu Âu (EU), Hoa Kỳ', so_luong_tan: 38500, kim_ngach_usd: 154200000, thue_xnk_vnd: 0, thoi_gian: 'Tháng 10/2026' },
    { id: 2, ma_hai_quan: 'HQ_DL_01', ten_chi_cuc: 'Chi cục HQ Buôn Ma Thuột', loai_hinh: 'Xuất khẩu', mat_hang: 'Sầu riêng cấp đông xuất khẩu', thi_truong: 'Trung Quốc (Chính ngạch)', so_luong_tan: 18200, kim_ngach_usd: 89500000, thue_xnk_vnd: 0, thoi_gian: 'Tháng 10/2026' },
    { id: 3, ma_hai_quan: 'HQ_DL_01', ten_chi_cuc: 'Chi cục HQ Buôn Ma Thuột', loai_hinh: 'Xuất khẩu', mat_hang: 'Hạt tiêu đen Đắk Lắk', thi_truong: 'Hoa Kỳ, Nhật Bản', so_luong_tan: 7600, kim_ngach_usd: 42800000, thue_xnk_vnd: 0, thoi_gian: 'Tháng 10/2026' },
    { id: 4, ma_hai_quan: 'HQ_DL_01', ten_chi_cuc: 'Chi cục HQ Buôn Ma Thuột', loai_hinh: 'Xuất khẩu', mat_hang: 'Mủ cao su thiên nhiên', thi_truong: 'Hàn Quốc, Đài Loan', so_luong_tan: 12400, kim_ngach_usd: 33600000, thue_xnk_vnd: 0, thoi_gian: 'Tháng 10/2026' },
    { id: 5, ma_hai_quan: 'HQ_DL_02', ten_chi_cuc: 'Chi cục HQ Cửa khẩu', loai_hinh: 'Nhập khẩu', mat_hang: 'Phân bón & Vật tư công nghệ cao', thi_truong: 'Nhật Bản, Israel', so_luong_tan: 15800, kim_ngach_usd: 36100000, thue_xnk_vnd: 4250000000, thoi_gian: 'Tháng 10/2026' }
  ];

  const hddnRows = [
    { id: 1, mst: '6000123456', ten_doanh_nghiep: 'Công ty Cổ phần Tập đoàn Trung Nguyên', loai_hoa_don: 'HĐĐT có mã cơ quan thuế', so_luong_hd: 2840, tong_tien_truoc_thue: 58200000000, tien_thue: 4656000000, ky_ke_khai: 'Tháng 10/2026' },
    { id: 2, mst: '6000234567', ten_doanh_nghiep: 'Công ty TNHH MTV XNK 2-9 Đắk Lắk (Simexco)', loai_hoa_don: 'HĐĐT có mã cơ quan thuế', so_luong_hd: 1950, tong_tien_truoc_thue: 49800000000, tien_thue: 3984000000, ky_ke_khai: 'Tháng 10/2026' },
    { id: 3, mst: '6000345678', ten_doanh_nghiep: 'Công ty CP Cà phê An Thái', loai_hoa_don: 'HĐĐT có mã cơ quan thuế', so_luong_hd: 1120, tong_tien_truoc_thue: 21500000000, tien_thue: 1720000000, ky_ke_khai: 'Tháng 10/2026' },
    { id: 4, mst: '6000456789', ten_doanh_nghiep: 'HTX Nông nghiệp Dịch vụ Công bằng Ea Tu', loai_hoa_don: 'HĐĐT khởi tạo từ máy tính tiền', so_luong_hd: 840, tong_tien_truoc_thue: 14200000000, tien_thue: 1136000000, ky_ke_khai: 'Tháng 10/2026' }
  ];

  // Nạp snapshots
  await prisma.statisticsSnapshot.createMany({
    data: [
      { dataSourceCode: 'BTC_FINANCE_OVERVIEW', data: overviewRows, recordedAt: new Date() },
      { dataSourceCode: 'BTC_NSNN_THU', data: nsnnThuRows, recordedAt: new Date() },
      { dataSourceCode: 'BTC_NSNN_CHI', data: nsnnChiRows, recordedAt: new Date() },
      { dataSourceCode: 'BTC_DTC_GIAINGAN_TUAN', data: dtcRows, recordedAt: new Date() },
      { dataSourceCode: 'BTC_HHXNK', data: hhxnkRows, recordedAt: new Date() },
      { dataSourceCode: 'BTC_HDDN', data: hddnRows, recordedAt: new Date() },
    ]
  });
  console.log('- Đã nạp 6 StatisticsSnapshot');

  // 3. Tạo ReportDefinition: REP_BTC_FINANCE_DAKLAK
  const reportCode = 'REP_BTC_FINANCE_DAKLAK';
  await prisma.reportDefinition.deleteMany({
    where: { code: reportCode },
  });

  const financeDef = await prisma.reportDefinition.create({
    data: {
      code: reportCode,
      name: 'Báo cáo & Dashboard Giám sát Số liệu Ngành Tài chính tỉnh Đắk Lắk (Trục Bộ Tài chính & LGSP)',
      description: 'Hệ thống giám sát điều hành toàn diện số liệu tài chính công: tổng hợp thu - chi ngân sách nhà nước, tiến độ giải ngân vốn đầu tư công các công trình trọng điểm, kim ngạch xuất nhập khẩu nông sản chủ lực (cà phê, tiêu, sầu riêng) và quản lý hóa đơn điện tử doanh nghiệp theo mẫu trục liên thông LGSP tỉnh Đắk Lắk & Bộ Tài chính.',
      version: 1,
      configuration: {
        version: 1,
        sources: [
          {
            id: 'BTC_FINANCE_OVERVIEW',
            endpoint: 'BTC_FINANCE_OVERVIEW',
            name: 'Tổng hợp Giám sát Tài chính Ngân sách',
            upstream: 'api-gateway',
            path: '/api/v1/external/btc/overview',
            fields: ['id', 'ma_chi_tieu', 'ten_chi_tieu', 'linh_vuc', 'don_vi_phu_trach', 'du_toan_giao', 'thuc_hien', 'ty_le_dat', 'cung_ky_nam_truoc', 'danh_gia_tien_do', 'ky_bao_cao'],
          },
        ],
        joins: [],
        filters: [],
        columns: [
          { key: 'id', source: 'BTC_FINANCE_OVERVIEW', field: 'id', type: 'number', label: 'STT', aggregate: 'none' },
          { key: 'ma_chi_tieu', source: 'BTC_FINANCE_OVERVIEW', field: 'ma_chi_tieu', type: 'string', label: 'Mã chỉ tiêu', aggregate: 'none' },
          { key: 'ten_chi_tieu', source: 'BTC_FINANCE_OVERVIEW', field: 'ten_chi_tieu', type: 'string', label: 'Chỉ tiêu giám sát tài chính', aggregate: 'none' },
          { key: 'linh_vuc', source: 'BTC_FINANCE_OVERVIEW', field: 'linh_vuc', type: 'string', label: 'Lĩnh vực tài chính', aggregate: 'none' },
          { key: 'don_vi_phu_trach', source: 'BTC_FINANCE_OVERVIEW', field: 'don_vi_phu_trach', type: 'string', label: 'Đơn vị chủ trì', aggregate: 'none' },
          { key: 'du_toan_giao', source: 'BTC_FINANCE_OVERVIEW', field: 'du_toan_giao', type: 'number', label: 'Dự toán / Kế hoạch vốn (VNĐ)', aggregate: 'sum' },
          { key: 'thuc_hien', source: 'BTC_FINANCE_OVERVIEW', field: 'thuc_hien', type: 'number', label: 'Thực hiện / Giải ngân (VNĐ)', aggregate: 'sum' },
          { key: 'ty_le_dat', source: 'BTC_FINANCE_OVERVIEW', field: 'ty_le_dat', type: 'number', label: 'Tiến độ đạt (%)', aggregate: 'avg' },
          { key: 'cung_ky_nam_truoc', source: 'BTC_FINANCE_OVERVIEW', field: 'cung_ky_nam_truoc', type: 'number', label: 'Cùng kỳ năm trước (VNĐ)', aggregate: 'sum' },
          { key: 'danh_gia_tien_do', source: 'BTC_FINANCE_OVERVIEW', field: 'danh_gia_tien_do', type: 'string', label: 'Đánh giá tiến độ', aggregate: 'none' },
          { key: 'ky_bao_cao', source: 'BTC_FINANCE_OVERVIEW', field: 'ky_bao_cao', type: 'string', label: 'Kỳ báo cáo', aggregate: 'none' },
        ],
        groupBy: [],
        charts: [
          { type: 'bar', xAxis: 'ten_chi_tieu', yAxis: 'thuc_hien', title: 'Số Thực hiện / Giải ngân theo Chỉ tiêu Tài chính (VNĐ)' },
          { type: 'pie', xAxis: 'linh_vuc', yAxis: 'thuc_hien', title: 'Cơ cấu Phân bổ Nguồn vốn theo Lĩnh vực Tài chính' },
          { type: 'line', xAxis: 'ten_chi_tieu', yAxis: 'ty_le_dat', title: 'Tỷ lệ Hoàn thành Tiến độ các Chỉ tiêu Tài chính (%)' },
          { type: 'bar', xAxis: 'don_vi_phu_trach', yAxis: 'thuc_hien', title: 'Quy mô Thực hiện theo Đơn vị Chủ trì' },
        ],
      },
    },
  });
  console.log(`- Đã tạo ReportDefinition id=${financeDef.id}, code=${financeDef.code}`);

  // 4. Tạo ReportRun & DatasetSnapshot để xem được ngay
  const run = await prisma.reportRun.create({
    data: {
      reportDefinitionId: financeDef.id,
      definitionVersion: 1,
      status: 'SUCCEEDED',
      rowCount: overviewRows.length,
      startedAt: new Date(),
      endedAt: new Date(),
    },
  });

  const columns = financeDef.configuration.columns || [];
  const schema = columns.map((c) => ({
    key: c.key || c.field,
    label: c.label || c.key,
    type: c.type || 'string',
  }));

  await prisma.datasetSnapshot.create({
    data: {
      runId: run.id,
      chunkIndex: 0,
      schema: schema,
      data: overviewRows,
    },
  });
  console.log(`- Đã tạo ReportRun id=${run.id} và DatasetSnapshot thành công!`);

  console.log('=== HOÀN TẤT SEED BÁO CÁO GIÁM SÁT TÀI CHÍNH BỘ TÀI CHÍNH 100% ===');
}

seedBtcFinance()
  .catch((e) => {
    console.error('Lỗi seed BTC finance:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
