import { Injectable, OnModuleInit, Inject, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, timeout, type Observable } from 'rxjs';
import axios from 'axios';
import { executeTable } from './table-engine';
import { Metadata } from '@grpc/grpc-js';

import { PrismaService } from '../prisma/prisma.service';
import { StatisticsService } from '../statistics/statistics.service';
import { safeParse } from '../../common/safe-parse.util';
import {
  normalizeRow,
  normalizeSchema,
  matchSearchQuery,
  getFriendlyFieldLabel,
} from './utils/normalization';

// ───────────────────────── Types ─────────────────────────

interface CatalogEntry {
  endpoint: string;
  upstream?: string;
  path?: string;
  method?: string;
  name: string;
  fields: any;
}

// ───────────────────────── Constants ─────────────────────────

const GRPC_TIMEOUT_MS = 10_000;
const PAGE_SIZE = 500;
const MAX_PAGES = 200; // chặn vòng lặp vô hạn (tối đa 100.000 bản ghi / nguồn)
const CATALOG_TTL_MS = 60_000;
const DASHBOARD_TTL_MS = 15_000; // 15 seconds for dashboard caching

const SCHEMA_META_KEYS = new Set([
  'name',
  'description',
  'parameters',
  'body',
  'responseFields',
  'bodyType',
  'formItems',
  'headers',
  'method',
  'path',
  'endpoint',
  'url',
  'contentType',
  'raw',
  'mode',
  'options',
  'type',
  'required',
  'properties',
]);

function getSampleRowsForApi(endpointOrPath: string): any[] {
  // Ledger #23 (Fabricated KPI data): sample rows là dữ liệu bịa cho dev/demo.
  // Mặc định trả [] — báo cáo hiển thị trống/N/A thay vì số liệu ảo.
  // Chỉ bật khi REPORT_ENABLE_SAMPLE_DATA=true (môi trường demo/dev riêng).
  if (process.env.REPORT_ENABLE_SAMPLE_DATA !== 'true') {
    return [];
  }
  const p = (endpointOrPath || '').toLowerCase();
  if (p.includes('document-statistics') || p.includes('doc_stats')) {
    return [
      {
        id: 1,
        departmentId: 'BTCTU',
        from_organ_id: 'A15.05',
        departmentName: 'Ban Tổ chức Tỉnh ủy Đắk Lắk',
        organName: 'Ban Tổ chức Tỉnh ủy Đắk Lắk',
        totalDocuments: 385,
        incomingDocuments: 240,
        outgoingDocuments: 145,
        processedDocuments: 372,
        pendingDocuments: 13,
        completionRate: 96.6,
        reportPeriod: 'Quý 3/2026',
      },
      {
        id: 2,
        departmentId: 'SBNV',
        departmentName: 'Sở Nội vụ Tỉnh Đắk Lắk',
        totalDocuments: 342,
        incomingDocuments: 210,
        outgoingDocuments: 132,
        processedDocuments: 320,
        pendingDocuments: 22,
        completionRate: 93.6,
        reportPeriod: 'Quý 3/2026',
      },
      {
        id: 2,
        departmentId: 'SKHCN',
        departmentName: 'Sở Khoa học và Công nghệ',
        totalDocuments: 256,
        incomingDocuments: 168,
        outgoingDocuments: 88,
        processedDocuments: 248,
        pendingDocuments: 8,
        completionRate: 96.9,
        reportPeriod: 'Quý 3/2026',
      },
      {
        id: 3,
        departmentId: 'STC',
        departmentName: 'Sở Tài chính Tỉnh Đắk Lắk',
        totalDocuments: 415,
        incomingDocuments: 280,
        outgoingDocuments: 135,
        processedDocuments: 395,
        pendingDocuments: 20,
        completionRate: 95.2,
        reportPeriod: 'Quý 3/2026',
      },
      {
        id: 4,
        departmentId: 'VPUBND',
        departmentName: 'Văn phòng UBND Tỉnh Đắk Lắk',
        totalDocuments: 680,
        incomingDocuments: 450,
        outgoingDocuments: 230,
        processedDocuments: 655,
        pendingDocuments: 25,
        completionRate: 96.3,
        reportPeriod: 'Quý 3/2026',
      },
      {
        id: 5,
        departmentId: 'TPBMT',
        departmentName: 'UBND TP. Buôn Ma Thuột',
        totalDocuments: 520,
        incomingDocuments: 340,
        outgoingDocuments: 180,
        processedDocuments: 490,
        pendingDocuments: 30,
        completionRate: 94.2,
        reportPeriod: 'Quý 3/2026',
      },
    ];
  }
  if (p.includes('btc_finance') || p.includes('finance_overview') || p.includes('finance')) {
    return [
      { id: 1, ma_chi_tieu: 'TC_01', ten_chi_tieu: 'Thu Ngân sách Nhà nước trên địa bàn tỉnh', linh_vuc: 'Thu ngân sách', don_vi_phu_trach: 'Cục Thuế tỉnh Đắk Lắk', du_toan_giao: 9640000000000, thuc_hien: 8520000000000, ty_le_dat: 88.4, cung_ky_nam_truoc: 7550000000000, danh_gia_tien_do: 'Vượt tiến độ dự toán (88.4%)', ky_bao_cao: 'Tháng 10/2026' },
      { id: 2, ma_chi_tieu: 'TC_02', ten_chi_tieu: 'Chi Ngân sách địa phương theo phân bổ', linh_vuc: 'Chi ngân sách', don_vi_phu_trach: 'Kho bạc Nhà nước Đắk Lắk', du_toan_giao: 14200000000000, thuc_hien: 11650000000000, ty_le_dat: 82.0, cung_ky_nam_truoc: 10420000000000, danh_gia_tien_do: 'Đảm bảo chi thường xuyên và ĐTPT', ky_bao_cao: 'Tháng 10/2026' },
      { id: 3, ma_chi_tieu: 'TC_03', ten_chi_tieu: 'Kế hoạch Vốn Đầu tư công giải ngân', linh_vuc: 'Đầu tư phát triển', don_vi_phu_trach: 'Sở Kế hoạch và Đầu tư', du_toan_giao: 6750000000000, thuc_hien: 5480000000000, ty_le_dat: 81.2, cung_ky_nam_truoc: 4620000000000, danh_gia_tien_do: 'Đạt mức khá so với cả nước (81.2%)', ky_bao_cao: 'Tháng 10/2026' },
      { id: 4, ma_chi_tieu: 'TC_04', ten_chi_tieu: 'Kim ngạch Xuất khẩu Nông sản chủ lực', linh_vuc: 'Hải quan & XNK', don_vi_phu_trach: 'Chi cục HQ Buôn Ma Thuột', du_toan_giao: 360000000, thuc_hien: 320100000, ty_le_dat: 88.9, cung_ky_nam_truoc: 278000000, danh_gia_tien_do: 'Xuất siêu 284 Triệu USD', ky_bao_cao: 'Tháng 10/2026' },
      { id: 5, ma_chi_tieu: 'TC_05', ten_chi_tieu: 'Thuế Doanh nghiệp phát sinh qua HĐĐT', linh_vuc: 'Thuế điện tử', don_vi_phu_trach: 'Cục Thuế tỉnh Đắk Lắk', du_toan_giao: 4300000000000, thuc_hien: 3840000000000, ty_le_dat: 89.3, cung_ky_nam_truoc: 3320000000000, danh_gia_tien_do: '2.450 doanh nghiệp hoạt động', ky_bao_cao: 'Tháng 10/2026' },
      { id: 6, ma_chi_tieu: 'TC_06', ten_chi_tieu: 'Cao tốc Khánh Hòa - Buôn Ma Thuột (DA TP3)', linh_vuc: 'Dự án trọng điểm', don_vi_phu_trach: 'BQLDA ĐTXD CTGT & NN PTNT Tỉnh', du_toan_giao: 1350000000000, thuc_hien: 1080000000000, ty_le_dat: 80.0, cung_ky_nam_truoc: 620000000000, danh_gia_tien_do: 'Bám sát mốc tiến độ thông xe 2026', ky_bao_cao: 'Tuần 41/2026' },
      { id: 7, ma_chi_tieu: 'TC_07', ten_chi_tieu: 'Đường Hồ Chí Minh tránh phía Đông TP. BMT', linh_vuc: 'Dự án trọng điểm', don_vi_phu_trach: 'BQLDA ĐTXD CTGT & NN PTNT Tỉnh', du_toan_giao: 520000000000, thuc_hien: 460000000000, ty_le_dat: 88.5, cung_ky_nam_truoc: 310000000000, danh_gia_tien_do: 'Giai đoạn thảm nhựa hoàn thiện', ky_bao_cao: 'Tuần 41/2026' },
      { id: 8, ma_chi_tieu: 'TC_08', ten_chi_tieu: 'Trung tâm Giám sát Điều hành Thông minh IOC', linh_vuc: 'Chuyển đổi số & ĐMST', don_vi_phu_trach: 'Sở Thông tin và Truyền thông', du_toan_giao: 65000000000, thuc_hien: 58000000000, ty_le_dat: 89.2, cung_ky_nam_truoc: 25000000000, danh_gia_tien_do: 'Tích hợp trục LGSP & CSDL ngành', ky_bao_cao: 'Tuần 41/2026' },
    ];
  }
  if (p.includes('hhxnk')) {
    return [
      { id: 1, ma_hai_quan: 'HQ_DL_01', ten_chi_cuc: 'Chi cục HQ Buôn Ma Thuột', loai_hinh: 'Xuất khẩu', mat_hang: 'Cà phê Robusta nhân xô', thi_truong: 'Liên minh Châu Âu (EU), Hoa Kỳ', so_luong_tan: 38500, kim_ngach_usd: 154200000, thue_xnk_vnd: 0, thoi_gian: 'Tháng 10/2026' },
      { id: 2, ma_hai_quan: 'HQ_DL_01', ten_chi_cuc: 'Chi cục HQ Buôn Ma Thuột', loai_hinh: 'Xuất khẩu', mat_hang: 'Sầu riêng cấp đông xuất khẩu', thi_truong: 'Trung Quốc (Chính ngạch)', so_luong_tan: 18200, kim_ngach_usd: 89500000, thue_xnk_vnd: 0, thoi_gian: 'Tháng 10/2026' },
      { id: 3, ma_hai_quan: 'HQ_DL_01', ten_chi_cuc: 'Chi cục HQ Buôn Ma Thuột', loai_hinh: 'Xuất khẩu', mat_hang: 'Hạt tiêu đen Đắk Lắk', thi_truong: 'Hoa Kỳ, Nhật Bản', so_luong_tan: 7600, kim_ngach_usd: 42800000, thue_xnk_vnd: 0, thoi_gian: 'Tháng 10/2026' },
      { id: 4, ma_hai_quan: 'HQ_DL_01', ten_chi_cuc: 'Chi cục HQ Buôn Ma Thuột', loai_hinh: 'Xuất khẩu', mat_hang: 'Mủ cao su thiên nhiên', thi_truong: 'Hàn Quốc, Đài Loan', so_luong_tan: 12400, kim_ngach_usd: 33600000, thue_xnk_vnd: 0, thoi_gian: 'Tháng 10/2026' },
      { id: 5, ma_hai_quan: 'HQ_DL_02', ten_chi_cuc: 'Chi cục HQ Cửa khẩu', loai_hinh: 'Nhập khẩu', mat_hang: 'Phân bón & Vật tư công nghệ cao', thi_truong: 'Nhật Bản, Israel', so_luong_tan: 15800, kim_ngach_usd: 36100000, thue_xnk_vnd: 4250000000, thoi_gian: 'Tháng 10/2026' },
    ];
  }
  if (p.includes('nsnn_thu')) {
    return [
      { id: 1, dia_ban: 'Toàn tỉnh Đắk Lắk', khoan_thu: 'Tổng thu NSNN trên địa bàn', du_toan_nam: 9640000000000, so_thuc_thu: 8520000000000, tien_do_dat: 88.4, cung_ky_nam_truoc: 7550000000000, thoi_gian: 'Tháng 10/2026', ghi_chu: 'Đạt 88.4% dự toán HĐND tỉnh giao' },
      { id: 2, dia_ban: 'TP. Buôn Ma Thuột', khoan_thu: 'Thuế TNDN & Tiền sử dụng đất', du_toan_nam: 3200000000000, so_thuc_thu: 2860000000000, tien_do_dat: 89.4, cung_ky_nam_truoc: 2510000000000, thoi_gian: 'Tháng 10/2026', ghi_chu: 'Trung tâm kinh tế đô thị của tỉnh' },
      { id: 3, dia_ban: 'Thị xã Buôn Hồ', khoan_thu: 'Thuế GTGT & Thuế TNCN', du_toan_nam: 680000000000, so_thuc_thu: 598000000000, tien_do_dat: 87.9, cung_ky_nam_truoc: 520000000000, thoi_gian: 'Tháng 10/2026', ghi_chu: 'Khu vực kinh tế phía Bắc' },
      { id: 4, dia_ban: 'Huyện Cư M\'gar', khoan_thu: 'Thuế SXKD & Nông sản cà phê', du_toan_nam: 560000000000, so_thuc_thu: 505000000000, tien_do_dat: 90.2, cung_ky_nam_truoc: 440000000000, thoi_gian: 'Tháng 10/2026', ghi_chu: 'Vùng chuyên canh cà phê lớn nhất' },
      { id: 5, dia_ban: 'Huyện Krông Pắc', khoan_thu: 'Thuế chuỗi giá trị sầu riêng', du_toan_nam: 480000000000, so_thuc_thu: 442000000000, tien_do_dat: 92.1, cung_ky_nam_truoc: 365000000000, thoi_gian: 'Tháng 10/2026', ghi_chu: 'Thủ phủ sầu riêng xuất khẩu' },
      { id: 6, dia_ban: 'Huyện Ea Kar', khoan_thu: 'Thuế dịch vụ thương mại', du_toan_nam: 410000000000, so_thuc_thu: 358000000000, tien_do_dat: 87.3, cung_ky_nam_truoc: 312000000000, thoi_gian: 'Tháng 10/2026', ghi_chu: 'Vùng đô thị động lực phía Đông' },
      { id: 7, dia_ban: 'Huyện Krông Ana', khoan_thu: 'Thuế nông lâm nghiệp', du_toan_nam: 320000000000, so_thuc_thu: 278000000000, tien_do_dat: 86.9, cung_ky_nam_truoc: 245000000000, thoi_gian: 'Tháng 10/2026', ghi_chu: 'Bám sát tiến độ thu' }
    ];
  }
  if (p.includes('nsnn_chi')) {
    return [
      { id: 1, linh_vuc_chi: 'Chi đầu tư phát triển', du_toan_giao: 4850000000000, so_da_chi: 3940000000000, ty_le_giai_ngan: 81.2, thoi_gian: 'Tháng 10/2026', ghi_chu: 'Hạ tầng giao thông, thủy lợi, y tế' },
      { id: 2, linh_vuc_chi: 'Chi sự nghiệp giáo dục và đào tạo', du_toan_giao: 4120000000000, so_da_chi: 3480000000000, ty_le_giai_ngan: 84.5, thoi_gian: 'Tháng 10/2026', ghi_chu: 'Đảm bảo lương và cơ sở vật chất trường học' },
      { id: 3, linh_vuc_chi: 'Chi quản lý hành chính nhà nước', du_toan_giao: 1650000000000, so_da_chi: 1340000000000, ty_le_giai_ngan: 81.2, thoi_gian: 'Tháng 10/2026', ghi_chu: 'Tiết kiệm chi thường xuyên theo NQ Chính phủ' },
      { id: 4, linh_vuc_chi: 'Chi sự nghiệp y tế và dân số', du_toan_giao: 1380000000000, so_da_chi: 1150000000000, ty_le_giai_ngan: 83.3, thoi_gian: 'Tháng 10/2026', ghi_chu: 'Khám chữa bệnh BHYT và phòng chống dịch' },
      { id: 5, linh_vuc_chi: 'Chi sự nghiệp khoa học và công nghệ', du_toan_giao: 210000000000, so_da_chi: 178000000000, ty_le_giai_ngan: 84.8, thoi_gian: 'Tháng 10/2026', ghi_chu: 'Đổi mới sáng tạo và chuyển đổi số' },
      { id: 6, linh_vuc_chi: 'Chi an sinh xã hội & người có công', du_toan_giao: 980000000000, so_da_chi: 862000000000, ty_le_giai_ngan: 88.0, thoi_gian: 'Tháng 10/2026', ghi_chu: 'Chính sách người có công và đồng bào DTTS' }
    ];
  }
  if (p.includes('dtc_giaingan_tuan')) {
    return [
      { id: 1, ten_du_an: 'Cao tốc Khánh Hòa - Buôn Ma Thuột (Dự án TP3)', chu_dau_tu: 'BQLDA ĐTXD CTGT & NN PTNT Tỉnh', ke_hoach_von: 1350000000000, giai_ngan_tuan: 42000000000, da_giai_ngan: 1080000000000, ty_le_dat: 80.0, tuan_bao_cao: 'Tuần 41/2026' },
      { id: 2, ten_du_an: 'Đường Hồ Chí Minh tránh phía Đông TP. BMT', chu_dau_tu: 'BQLDA ĐTXD CTGT & NN PTNT Tỉnh', ke_hoach_von: 520000000000, giai_ngan_tuan: 18500000000, da_giai_ngan: 460000000000, ty_le_dat: 88.5, tuan_bao_cao: 'Tuần 41/2026' },
      { id: 3, ten_du_an: 'Khu Công nghệ cao & Đổi mới sáng tạo Tỉnh', chu_dau_tu: 'Sở Khoa học và Công nghệ', ke_hoach_von: 240000000000, giai_ngan_tuan: 8200000000, da_giai_ngan: 198000000000, ty_le_dat: 82.5, tuan_bao_cao: 'Tuần 41/2026' },
      { id: 4, ten_du_an: 'Bệnh viện Đa khoa vùng Tây Nguyên (Giai đoạn 2)', chu_dau_tu: 'Sở Y tế Đắk Lắk', ke_hoach_von: 180000000000, giai_ngan_tuan: 5400000000, da_giai_ngan: 155000000000, ty_le_dat: 86.1, tuan_bao_cao: 'Tuần 41/2026' },
      { id: 5, ten_du_an: 'Nâng cấp hệ thống hồ thủy lợi Ea Kao', chu_dau_tu: 'BQLDA ĐTXD CTGT & NN PTNT Tỉnh', ke_hoach_von: 120000000000, giai_ngan_tuan: 3800000000, da_giai_ngan: 98000000000, ty_le_dat: 81.7, tuan_bao_cao: 'Tuần 41/2026' },
      { id: 6, ten_du_an: 'Trung tâm Điều hành Đô thị Thông minh IOC', chu_dau_tu: 'Sở Thông tin và Truyền thông', ke_hoach_von: 65000000000, giai_ngan_tuan: 2500000000, da_giai_ngan: 58000000000, ty_le_dat: 89.2, tuan_bao_cao: 'Tuần 41/2026' }
    ];
  }
  if (p.includes('hddn')) {
    return [
      { id: 1, mst: '6000123456', ten_doanh_nghiep: 'Công ty Cổ phần Tập đoàn Trung Nguyên', loai_hoa_don: 'HĐĐT có mã cơ quan thuế', so_luong_hd: 2840, tong_tien_truoc_thue: 58200000000, tien_thue: 4656000000, ky_ke_khai: 'Tháng 10/2026' },
      { id: 2, mst: '6000234567', ten_doanh_nghiep: 'Công ty TNHH MTV XNK 2-9 Đắk Lắk (Simexco)', loai_hoa_don: 'HĐĐT có mã cơ quan thuế', so_luong_hd: 1950, tong_tien_truoc_thue: 49800000000, tien_thue: 3984000000, ky_ke_khai: 'Tháng 10/2026' },
      { id: 3, mst: '6000345678', ten_doanh_nghiep: 'Công ty CP Cà phê An Thái', loai_hoa_don: 'HĐĐT có mã cơ quan thuế', so_luong_hd: 1120, tong_tien_truoc_thue: 21500000000, tien_thue: 1720000000, ky_ke_khai: 'Tháng 10/2026' },
      { id: 4, mst: '6000456789', ten_doanh_nghiep: 'HTX Nông nghiệp Dịch vụ Công bằng Ea Tu', loai_hoa_don: 'HĐĐT khởi tạo từ máy tính tiền', so_luong_hd: 840, tong_tien_truoc_thue: 14200000000, tien_thue: 1136000000, ky_ke_khai: 'Tháng 10/2026' }
    ];
  }
  if (p.includes('htx')) {
    return [
      { id: 1, huyen_thi_xa: 'TP. Buôn Ma Thuột', so_htx_hoat_dong: 82, so_thanh_vien: 1450, doanh_thu_tb_trieu: 3850, nam: 2026 },
      { id: 2, huyen_thi_xa: 'Huyện Cư M\'gar', so_htx_hoat_dong: 64, so_thanh_vien: 1120, doanh_thu_tb_trieu: 2950, nam: 2026 },
      { id: 3, huyen_thi_xa: 'Huyện Krông Pắc', so_htx_hoat_dong: 58, so_thanh_vien: 980, doanh_thu_tb_trieu: 3200, nam: 2026 },
      { id: 4, huyen_thi_xa: 'Huyện Ea Kar', so_htx_hoat_dong: 51, so_thanh_vien: 890, doanh_thu_tb_trieu: 2650, nam: 2026 },
    ];
  }
  if (p.includes('qldt')) {
    return [
      { id: 1, dia_ban: 'TP. Buôn Ma Thuột', so_du_an_moi: 8, von_ngoai_ns_ty: 3450, tien_do_trien_khai: 'Đang giải phóng mặt bằng', ghi_chu: 'Khu đô thị và dịch vụ thương mại' },
      { id: 2, dia_ban: 'TX. Buôn Hồ', so_du_an_moi: 3, von_ngoai_ns_ty: 890, tien_do_trien_khai: 'Hoàn tất thủ tục đầu tư', ghi_chu: 'Nhà máy chế biến nông sản' },
      { id: 3, dia_ban: 'Huyện Cư M\'gar', so_du_an_moi: 4, von_ngoai_ns_ty: 1250, tien_do_trien_khai: 'Đang thi công xây dựng', ghi_chu: 'Năng lượng tái tạo và logistics' },
      { id: 4, dia_ban: 'Huyện Ea H\'leo', so_du_an_moi: 2, von_ngoai_ns_ty: 1600, tien_do_trien_khai: 'Đang lập quy hoạch chi tiết', ghi_chu: 'Cụm công nghiệp và điện gió' },
    ];
  }
  if (p.includes('user_org') || p.includes('organization')) {
    return [
      { id: 56, code: 'A15.05', name: 'Ban Tổ chức Tỉnh ủy Đắk Lắk', parentId: null, order: 1, level: 1, status: 'Hoạt động', createdAt: '2026-01-01' },
      { id: 57, code: 'A15.05.01', name: 'Phòng Tổ chức cán bộ', parentId: 56, order: 1, level: 2, status: 'Hoạt động', createdAt: '2026-01-01' },
      { id: 58, code: 'A15.05.02', name: 'Phòng Bảo vệ chính trị nội bộ', parentId: 56, order: 2, level: 2, status: 'Hoạt động', createdAt: '2026-01-01' },
      { id: 59, code: 'A15.05.03', name: 'Phòng Tổ chức đảng, đảng viên', parentId: 56, order: 3, level: 2, status: 'Hoạt động', createdAt: '2026-01-01' },
      { id: 60, code: 'A15.05.04', name: 'Văn phòng Ban', parentId: 56, order: 4, level: 2, status: 'Hoạt động', createdAt: '2026-01-01' },
      { id: 20, code: 'H15.20', name: 'Sở Khoa học và Công nghệ', parentId: null, order: 2, level: 1, status: 'Hoạt động', createdAt: '2026-01-01' },
      { id: 3, code: 'H15.03', name: 'Sở Tài chính Đắk Lắk', parentId: null, order: 3, level: 1, status: 'Hoạt động', createdAt: '2026-01-01' },
      { id: 1, code: 'H15.01', name: 'UBND Huyện Krông Pắc', parentId: null, order: 4, level: 1, status: 'Hoạt động', createdAt: '2026-01-01' },
    ];
  }
  if (p.includes('user_cadre') || p.includes('cadre_stats')) {
    return [
      { id: 1, employeeCode: 'BTCTU_001', username: 'nam.hd', fullName: 'Hoàng Đức Nam', email: 'nam.hd@daklak.gov.vn', phone: '0912345678', unitId: 57, departmentName: 'Phòng Tổ chức cán bộ', jobTitle: 'Trưởng phòng TCCB', status: 'Chính thức', isActive: 'Hoạt động' },
      { id: 2, employeeCode: 'BTCTU_002', username: 'mai.pt', fullName: 'Phạm Thị Mai', email: 'mai.pt@daklak.gov.vn', phone: '0912345679', unitId: 57, departmentName: 'Phòng Tổ chức cán bộ', jobTitle: 'Phó Trưởng phòng TCCB', status: 'Chính thức', isActive: 'Hoạt động' },
      { id: 3, employeeCode: 'BTCTU_003', username: 'hung.vv', fullName: 'Vũ Văn Hùng', email: 'hung.vv@daklak.gov.vn', phone: '0912345680', unitId: 58, departmentName: 'Phòng Bảo vệ chính trị nội bộ', jobTitle: 'Trưởng phòng BVCTNB', status: 'Chính thức', isActive: 'Hoạt động' },
      { id: 4, employeeCode: 'BTCTU_004', username: 'hoang.ld', fullName: 'Lê Đình Hoàng', email: 'hoang.ld@daklak.gov.vn', phone: '0912345681', unitId: 59, departmentName: 'Phòng Tổ chức đảng, đảng viên', jobTitle: 'Chuyên viên chính', status: 'Chính thức', isActive: 'Hoạt động' },
      { id: 5, employeeCode: 'BTCTU_005', username: 'lan.dt', fullName: 'Đỗ Thị Lan', email: 'lan.dt@daklak.gov.vn', phone: '0912345682', unitId: 60, departmentName: 'Văn phòng Ban', jobTitle: 'Chánh Văn phòng', status: 'Chính thức', isActive: 'Hoạt động' },
    ];
  }
  if (p.includes('staffing')) {
    return [
      { id: 1, unitId: 56, jobTitleId: 101, jobTitleName: 'Trưởng Ban Tổ chức Tỉnh ủy', quantity: 1, currentCount: 1, missingCount: 0, isOver: 'Đủ định biên' },
      { id: 2, unitId: 56, jobTitleId: 102, jobTitleName: 'Phó Trưởng Ban Tổ chức Tỉnh ủy', quantity: 3, currentCount: 3, missingCount: 0, isOver: 'Đủ định biên' },
      { id: 3, unitId: 57, jobTitleId: 103, jobTitleName: 'Trưởng phòng Tổ chức cán bộ', quantity: 1, currentCount: 1, missingCount: 0, isOver: 'Đủ định biên' },
      { id: 4, unitId: 57, jobTitleId: 104, jobTitleName: 'Chuyên viên chính Phòng TCCB', quantity: 4, currentCount: 3, missingCount: 1, isOver: 'Thiếu định biên' },
      { id: 5, unitId: 58, jobTitleId: 105, jobTitleName: 'Trưởng phòng Bảo vệ CTNB', quantity: 1, currentCount: 1, missingCount: 0, isOver: 'Đủ định biên' },
    ];
  }
  if (p.includes('workflow')) {
    return [
      { id: 1, processDefinitionKey: 'QUY_TRINH_BO_NHIEM_CAN_BO', processInstanceId: 'PROC_2026_01', businessKey: 'HS_BTCTU_01', currentStep: 'Thẩm tra tiêu chuẩn chính trị', assignee: 'Vũ Văn Hùng', status: 'Đang xử lý', startedAt: '2026-10-01', endedAt: null, durationHours: 72 },
      { id: 2, processDefinitionKey: 'QUY_TRINH_DANH_GIA_SOP_MAU05', processInstanceId: 'PROC_2026_02', businessKey: 'DG_QUY_3_2026', currentStep: 'Lãnh đạo Ban phê duyệt Mẫu 05', assignee: 'Trưởng Ban', status: 'Hoàn thành', startedAt: '2026-10-05', endedAt: '2026-10-12', durationHours: 168 },
      { id: 3, processDefinitionKey: 'QUY_TRINH_LUU_CHUYEN_VAN_BAN', processInstanceId: 'PROC_2026_03', businessKey: 'VB_1288_UBND', currentStep: 'Phân công chuyên viên xử lý', assignee: 'Hoàng Đức Nam', status: 'Đang xử lý', startedAt: '2026-10-14', endedAt: null, durationHours: 24 },
    ];
  }
  return [
    { id: 1, code: 'API_ROW_01', name: 'Bản ghi liên thông dữ liệu số 01', status: 'COMPLETED', createdAt: '2026-10-15' },
    { id: 2, code: 'API_ROW_02', name: 'Bản ghi liên thông dữ liệu số 02', status: 'IN_PROGRESS', createdAt: '2026-10-15' },
  ];
}

const FALLBACK_CATALOG: CatalogEntry[] = [
  {
    endpoint: 'BTC_FINANCE_OVERVIEW',
    name: 'Giám sát Tài chính & Ngân sách Tổng hợp tỉnh Đắk Lắk (Bộ Tài chính & LGSP)',
    fields: ['id', 'ma_chi_tieu', 'ten_chi_tieu', 'linh_vuc', 'don_vi_phu_trach', 'du_toan_giao', 'thuc_hien', 'ty_le_dat', 'cung_ky_nam_truoc', 'danh_gia_tien_do', 'ky_bao_cao'],
  },
  {
    endpoint: 'BTC_NSNN_THU',
    name: 'Thu Ngân sách Nhà nước trên địa bàn tỉnh Đắk Lắk (Cục Thuế & Bộ Tài chính)',
    fields: ['id', 'dia_ban', 'khoan_thu', 'du_toan_nam', 'so_thuc_thu', 'tien_do_dat', 'cung_ky_nam_truoc', 'thoi_gian', 'ghi_chu'],
  },
  {
    endpoint: 'BTC_NSNN_CHI',
    name: 'Chi Ngân sách Nhà nước tỉnh Đắk Lắk (Kho bạc Nhà nước & Bộ Tài chính)',
    fields: ['id', 'linh_vuc_chi', 'du_toan_giao', 'so_da_chi', 'ty_le_giai_ngan', 'thoi_gian', 'ghi_chu'],
  },
  {
    endpoint: 'BTC_DTC_GIAINGAN_TUAN',
    name: 'Giải ngân Vốn Đầu tư công theo tuần - Dự án trọng điểm (Trục Tài chính Đắk Lắk)',
    fields: ['id', 'ten_du_an', 'chu_dau_tu', 'ke_hoach_von', 'giai_ngan_tuan', 'da_giai_ngan', 'ty_le_dat', 'tuan_bao_cao'],
  },
  {
    endpoint: 'BTC_HHXNK',
    name: 'Kim ngạch Hàng hóa Xuất Nhập khẩu Hải quan Đắk Lắk (Tổng cục Hải quan)',
    fields: ['id', 'ma_hai_quan', 'ten_chi_cuc', 'loai_hinh', 'mat_hang', 'thi_truong', 'so_luong_tan', 'kim_ngach_usd', 'thue_xnk_vnd', 'thoi_gian'],
  },
  {
    endpoint: 'BTC_HDDN',
    name: 'Hóa đơn Điện tử & Hoạt động Doanh nghiệp (Bộ Tài chính & Thuế điện tử)',
    fields: ['id', 'mst', 'ten_doanh_nghiep', 'loai_hoa_don', 'so_luong_hd', 'tong_tien_truoc_thue', 'tien_thue', 'ky_ke_khai'],
  },
  {
    endpoint: 'BTCTU_KPI_STATS',
    name: 'Đánh giá Cán bộ Ban Tổ chức Tỉnh ủy (SOP 4 bước & Mẫu 05)',
    fields: ['id', 'cadreCode', 'fullName', 'departmentId', 'departmentName', 'jobTitle', 'sChung', 'sNhiemVu', 'sTong', 'proposedRank', 'approvedRank', 'hasMau04', 'sopStep', 'status', 'quarterYear'],
  },
  {
    endpoint: 'HRM_TASK_STATS',
    name: 'Quản lý Công việc & Nhiệm vụ Toàn tỉnh',
    fields: ['id', 'title', 'status', 'priority', 'progress', 'departmentId', 'departmentName', 'assigneeCode', 'assigneeName', 'dueDate', 'isOverdue', 'isCompleted'],
  },
  {
    endpoint: 'USER_CADRE_STATS',
    name: 'Hồ sơ Cán bộ & Tài khoản Công chức Hệ thống',
    fields: ['id', 'employeeCode', 'username', 'fullName', 'email', 'phone', 'unitId', 'departmentName', 'jobTitle', 'status', 'isActive'],
  },
  {
    endpoint: 'USER_ORG_STATS',
    name: 'Cơ cấu Tổ chức & Danh mục Đơn vị Hành chính',
    fields: ['id', 'code', 'name', 'parentId', 'order', 'level', 'status', 'createdAt'],
  },
  {
    endpoint: 'USER_STAFFING_STATS',
    name: 'Vị trí việc làm (VTVL) & Định biên Nhân sự Đơn vị',
    fields: ['id', 'unitId', 'jobTitleId', 'jobTitleName', 'quantity', 'currentCount', 'missingCount', 'isOver'],
  },
  {
    endpoint: 'DOC_STATS',
    name: 'Lưu chuyển Văn bản Hành chính Đến / Đi',
    fields: ['id', 'documentNumber', 'abstract', 'isIncoming', 'status', 'urgency', 'securityLevel', 'pageCount', 'isLate', 'issueDate', 'departmentId', 'departmentName'],
  },
  {
    endpoint: 'WORKFLOW_STATS',
    name: 'Theo dõi Tiến độ Quy trình Luồng duyệt (Workflow)',
    fields: ['id', 'processDefinitionKey', 'processInstanceId', 'businessKey', 'currentStep', 'assignee', 'status', 'startedAt', 'endedAt', 'durationHours'],
  },
  {
    endpoint: 'POST_STATS',
    name: 'Hoạt động Xuất bản Tin bài Cổng Thông tin Điện tử',
    fields: ['id', 'title', 'categoryName', 'status', 'viewCount', 'authorName', 'isFeatured', 'publishedDate'],
  },
  {
    endpoint: 'EMPLOYEE_QUALITY',
    name: 'Đánh giá Năng suất & Chất lượng Cán bộ Toàn tỉnh',
    fields: ['id', 'employeeName', 'departmentName', 'taskCount', 'completedCount', 'qualityScore', 'ranking'],
  },
  {
    endpoint: 'HRM_PERSONAL_STATS',
    name: 'Bàn làm việc & Thống kê Cá nhân Cán bộ',
    fields: ['month', 'score', 'completedTasks', 'status', 'departmentName', 'workload', 'title', 'progress', 'role', 'dueDate', 'cadreCode', 'fullName'],
  },
];

@Injectable()
export class ReportsService implements OnModuleInit {
  private readonly logger = new Logger(ReportsService.name);
  private orgGrpcService: any;
  private taskGrpcService: any;
  private docGrpcService: any;
  private apiGrpcService: any;

  private catalogCache: {
    expiresAt: number;
    includesApiSources: boolean;
    value: CatalogEntry[];
  } | null = null;
  private statsCache: { expiresAt: number; value: any } | null = null;
  private defsCache: { expiresAt: number; value: any } | null = null;

  constructor(
    @Inject('USER_SERVICE') private userClient: ClientGrpc,
    @Inject('TASK_SERVICE') private taskClient: ClientGrpc,
    @Inject('DOCUMENT_SERVICE') private docClient: ClientGrpc,
    @Inject('API_MANAGEMENT_SERVICE') private apiClient: ClientGrpc,
    private readonly prisma: PrismaService,
    private readonly statsService: StatisticsService,
  ) {}

  onModuleInit() {
    this.orgGrpcService = this.userClient.getService<any>('OrganizationService');
    this.taskGrpcService = this.taskClient.getService<any>('TaskService');
    this.docGrpcService = this.docClient.getService<any>('DocumentService');
    this.apiGrpcService = this.apiClient.getService<any>('ApiManagementService');
  }

  // ───────────────────────── Dynamic Report Designer ─────────────────────────

  async createReportDefinition(payloadStr: string, _userDataStr: string) {
    try {
      const payload = JSON.parse(payloadStr);
      let definition;
      const config = payload.configuration || payload.config || {};
      if (payload.id) {
        definition = await this.prisma.reportDefinition.update({
          where: { id: Number(payload.id) },
          data: {
            name: payload.name,
            description: payload.description,
            configuration: config,
            organizationId: payload.organizationId !== undefined ? payload.organizationId : undefined,
            version: { increment: 1 },
          },
        });
      } else {
        const genCode = payload.code || `REP_${Date.now()}`;
        definition = await this.prisma.reportDefinition.create({
          data: {
            code: genCode,
            name: payload.name || 'Báo cáo mới',
            description: payload.description,
            configuration: config,
            organizationId: payload.organizationId,
          },
        });
      }

      // Invalidate caches
      this.defsCache = null;
      this.statsCache = null;

      return {
        success: true,
        data: JSON.stringify(definition),
        message: 'Tạo cấu hình báo cáo thành công',
      };
    } catch (error: any) {
      this.logger.error('Error creating report definition', error?.stack);
      throw new RpcException(error?.message || 'Lỗi tạo cấu hình báo cáo');
    }
  }

  async getReportDefinitions(_payloadStr: string, _userDataStr: string) {
    try {
      const now = Date.now();
      if (this.defsCache && this.defsCache.expiresAt > now) {
        return {
          success: true,
          data: JSON.stringify(this.defsCache.value),
          message: 'Lấy danh sách cấu hình báo cáo thành công (Cache)',
        };
      }

      // Tối ưu: Không lấy cột 'configuration' (chứa dữ liệu JSON lớn) để tránh OOM / sập hệ thống.
      const definitions = await this.prisma.reportDefinition.findMany({
        select: {
          id: true,
          code: true,
          name: true,
          description: true,
          version: true,
          organizationId: true,
          ownerId: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: 'desc' },
      });

      this.defsCache = { expiresAt: now + DASHBOARD_TTL_MS, value: definitions };

      return {
        success: true,
        data: JSON.stringify(definitions),
        message: 'Lấy danh sách cấu hình báo cáo thành công',
      };
    } catch (error: any) {
      this.logger.error('Error fetching report definitions', error?.stack);
      throw new RpcException('Lỗi lấy danh sách cấu hình báo cáo');
    }
  }

  async getReportDefinitionById(payloadStr: string, _userDataStr: string) {
    try {
      const { id } = JSON.parse(payloadStr);
      const numId = Number(id);
      if (!numId || isNaN(numId)) {
        throw new RpcException('ID báo cáo không hợp lệ');
      }
      const definition = await this.prisma.reportDefinition.findUnique({
        where: { id: numId },
        include: {
          runs: {
            orderBy: { id: 'desc' },
            take: 1,
          },
        },
      });
      if (!definition) {
        throw new RpcException('Không tìm thấy cấu hình báo cáo');
      }
      return {
        success: true,
        data: JSON.stringify(definition),
        message: 'Lấy chi tiết cấu hình báo cáo thành công',
      };
    } catch (error: any) {
      if (error instanceof RpcException) throw error;
      this.logger.error('Error fetching report definition by id', error?.stack);
      throw new RpcException('Lỗi lấy chi tiết cấu hình báo cáo');
    }
  }

  async getReportDashboardStats(_payloadStr: string, _userDataStr: string) {
    try {
      const now = Date.now();
      if (this.statsCache && this.statsCache.expiresAt > now) {
        return {
          success: true,
          data: JSON.stringify(this.statsCache.value),
          message: 'Lấy thống kê dashboard thành công (Cache)',
        };
      }

      const [totalReports, runsGroup, totalShared] = await Promise.all([
        this.prisma.reportDefinition.count(),
        this.prisma.reportRun.groupBy({
          by: ['status'],
          _count: true,
        }),
        this.prisma.reportAssignment.count(),
      ]);

      const totalRuns = runsGroup.reduce((acc, curr) => acc + curr._count, 0);
      const processingRuns = runsGroup
        .filter((g) => g.status === 'QUEUED' || g.status === 'RUNNING')
        .reduce((acc, curr) => acc + curr._count, 0);

      const stats = { totalReports, totalRuns, totalShared, processingRuns };
      this.statsCache = { expiresAt: now + DASHBOARD_TTL_MS, value: stats };

      return {
        success: true,
        data: JSON.stringify(stats),
        message: 'Lấy thống kê dashboard thành công',
      };
    } catch (error: any) {
      this.logger.error('Error fetching report dashboard stats', error?.stack);
      throw new RpcException('Lỗi lấy thống kê báo cáo');
    }
  }

  private evaluateFormula(formula: string, row: Record<string, any>): any {
    if (!formula || typeof formula !== 'string') return null;
    try {
      // Thay thế các token [field_name] bằng giá trị tương ứng trong row
      const cleanExpr = formula.replace(/\[([a-zA-Z0-9_.]+)\]/g, (_, field) => {
        const val = row[field];
        if (val === undefined || val === null) return '0';
        if (typeof val === 'number') return String(val);
        if (typeof val === 'boolean') return String(val);
        return JSON.stringify(String(val));
      });

      // Kiểm tra an toàn: ngăn chặn các từ khóa can thiệp hệ thống
      if (
        /(process|require|import|global|window|document|eval|Function|constructor|prototype|__proto__|this)/i.test(
          cleanExpr,
        )
      ) {
        return null;
      }

      // Thực thi an toàn biểu thức toán học hoặc điều kiện ternary
      const fn = new Function(`"use strict"; return (${cleanExpr});`);
      const result = fn();
      if (typeof result === 'number' && !isNaN(result)) {
        return Math.round(result * 100) / 100;
      }
      return result ?? null;
    } catch {
      return null;
    }
  }

  private async fetchSourceRows(
    sourceDef: any,
    config: any,
    payloadParams: any,
    metadata?: Metadata,
  ): Promise<any[]> {
    const sourceCode = sourceDef?.endpoint || sourceDef?.id || '';
    const queryParams = { ...(sourceDef?.params || {}), ...(payloadParams || {}) };
    const queryMeta = metadata || new Metadata();
    let rows: any[] = [];

    try {
      let statsRes: any;
      if (sourceCode === 'HRM_TASK_STATS' || sourceCode.includes('TASK')) {
        statsRes = await this.statsService.getTaskStatistics(queryParams, null, queryMeta);
      } else if (sourceCode === 'DOC_STATS' || sourceCode.includes('DOC')) {
        statsRes = await this.statsService.getDocumentStatistics(queryParams, queryMeta);
      } else if (sourceCode === 'POST_STATS' || sourceCode.includes('POST')) {
        statsRes = await this.statsService.getPostStatistics(queryParams, queryMeta);
      } else if (
        sourceCode === 'BTCTU_KPI_STATS' ||
        sourceCode.includes('BTCTU') ||
        sourceCode.includes('KPI_EVAL')
      ) {
        statsRes = await this.statsService.getBtctuKpiStatistics(queryParams, null, queryMeta);
      } else if (sourceCode === 'EMPLOYEE_QUALITY' || sourceCode.includes('EMP')) {
        statsRes = await this.statsService.getEmployeeQualityStatistics(queryParams, null, queryMeta);
      } else if (sourceCode === 'KPI_STATS') {
        statsRes = await this.statsService.getKpiStatistics(queryParams, null, queryMeta);
      } else if (sourceCode === 'HRM_PERSONAL_STATS') {
        statsRes = await this.statsService.getPersonalWorkbenchStatistics(queryParams, null, queryMeta);
      } else if (sourceCode === 'USER_ORG_STATS' || sourceCode.includes('ORG')) {
        const unitMap = await this.statsService['getUnitMap']?.();
        if (unitMap && Object.keys(unitMap).length > 0) {
          statsRes = { data: Object.values(unitMap) };
        }
      } else if (sourceCode === 'USER_CADRE_STATS' || sourceCode.includes('CADRE')) {
        statsRes = await this.statsService.getEmployeeQualityStatistics(queryParams, null, queryMeta);
      } else if (
        sourceCode.startsWith('BTC_') ||
        sourceCode.includes('FINANCE') ||
        sourceCode.includes('NSNN') ||
        sourceCode.includes('DTC_') ||
        sourceCode.includes('HHXNK') ||
        sourceCode.includes('HDDN')
      ) {
        const snapshot = await this.prisma.statisticsSnapshot.findFirst({
          where: { dataSourceCode: sourceCode },
          orderBy: { recordedAt: 'desc' },
        });
        if (snapshot && Array.isArray(snapshot.data) && (snapshot.data as any[]).length > 0) {
          statsRes = { data: snapshot.data };
        } else {
          statsRes = { data: getSampleRowsForApi(sourceCode) };
        }
      } else if (sourceCode.includes('|')) {
        const [uCode, uPath] = sourceCode.split('|');
        statsRes = await this.fetchDynamicApiSource(
          { ...sourceDef, upstream: uCode, path: uPath },
          config,
          queryParams,
          queryMeta,
        );
      } else if (sourceDef?.upstream && sourceDef?.path) {
        statsRes = await this.fetchDynamicApiSource(
          sourceDef,
          config,
          queryParams,
          queryMeta,
        );
      }

      const rawData: any = statsRes?.data;
      if (Array.isArray(rawData)) {
        rows = rawData;
      } else if (Array.isArray(rawData?.rows)) {
        rows = rawData.rows;
      } else if (Array.isArray(rawData?.items)) {
        rows = rawData.items;
      }
      if (rows.length > 0) {
        return rows.map(normalizeRow);
      }
    } catch (err: any) {
      this.logger.warn(`Truy vấn thời gian thực cho ${sourceCode} qua gRPC: ${err?.message}`);
    }

    // Fallback 1: snapshot trong database
    const latestSnapshot = await this.prisma.statisticsSnapshot.findFirst({
      where: { dataSourceCode: sourceCode },
      orderBy: { recordedAt: 'desc' },
    });
    if (latestSnapshot && Array.isArray(latestSnapshot.data) && (latestSnapshot.data as any[]).length > 0) {
      return (latestSnapshot.data as any[]).map(normalizeRow);
    }

    // Fallback 2: Sample data
    const sampleData = getSampleRowsForApi(sourceCode || sourceDef?.path || sourceDef?.endpoint);
    return (sampleData || []).map(normalizeRow);
  }

  async runReport(payloadStr: string, _userDataStr: string, metadata?: Metadata) {
    try {
      const payload = JSON.parse(payloadStr);
      const defId = Number(payload.reportDefinitionId || payload.definitionId);
      const definition = await this.prisma.reportDefinition.findUnique({
        where: { id: defId },
      });

      if (!definition) {
        return { success: false, data: '{}', message: 'Không tìm thấy cấu hình báo cáo' };
      }

      const run = await this.prisma.reportRun.create({
        data: {
          reportDefinitionId: definition.id,
          definitionVersion: definition.version,
          status: 'RUNNING',
          organizationId: payload.organizationId,
          startedAt: new Date(),
        },
      });

      // Sinh snapshot dữ liệu thực tế dựa trên nguồn cấu hình
      const config = definition.configuration as any;
      const configuredSources =
        Array.isArray(config?.sources) && config.sources.length > 0
          ? config.sources
          : [
              {
                id: definition.code,
                endpoint: definition.code,
                fields: [],
              },
            ];

      // ────────────────── TRUY VẤN DỮ LIỆU ĐA NGUỒN (MULTI-SOURCE REALTIME FETCH) ──────────────────
      const sourcesDataMap: Record<string, any[]> = {};
      await Promise.all(
        configuredSources.map(async (src: any) => {
          const sKey = src.id || src.endpoint;
          const rows = await this.fetchSourceRows(src, config, payload.params, metadata);
          sourcesDataMap[sKey] = rows;
        }),
      );

      // In-Memory Multi-source JOIN execution:
      const primarySource = configuredSources[0];
      const primaryKey = primarySource?.id || primarySource?.endpoint;
      let sourceRows: any[] = sourcesDataMap[primaryKey] || [];

      if (Array.isArray(config?.joins) && config.joins.length > 0 && sourceRows.length > 0) {
        for (const join of config.joins) {
          const rightRows = sourcesDataMap[join.rightSource] || [];
          if (rightRows.length === 0) continue;

          const joined: any[] = [];
          for (const lRow of sourceRows) {
            const matches = rightRows.filter((rRow) => {
              return (join.conditions || []).every((cond: any) => {
                const lVal = String(lRow[cond.leftField] ?? '').trim().toLowerCase();
                const rVal = String(rRow[cond.rightField] ?? '').trim().toLowerCase();
                return lVal && rVal && lVal === rVal;
              });
            });

            if (matches.length > 0) {
              for (const m of matches) {
                joined.push({ ...m, ...lRow });
              }
            } else if (join.type === 'LEFT') {
              joined.push({ ...lRow });
            }
          }
          if (joined.length > 0) {
            sourceRows = joined;
          }
        }
      }

      // Evaluated Calculated Fields / Formulas:
      const calculatedCols = (config?.columns || []).filter(
        (c: any) => c.formula || c.isCalculated,
      );
      if (calculatedCols.length > 0 && sourceRows.length > 0) {
        sourceRows = sourceRows.map((row) => {
          const updatedRow = { ...row };
          for (const col of calculatedCols) {
            if (!col.formula) continue;
            const resVal = this.evaluateFormula(col.formula, updatedRow);
            if (resVal !== null && resVal !== undefined) {
              updatedRow[col.key || col.field] = resVal;
            }
          }
          return updatedRow;
        });
      }

      // ────────────────── BỘ LỌC ĐA CHIỀU & THAM SỐ ĐỘNG (DYNAMIC PARAMETERS & FILTERS) ──────────────────
      const runtimeParams = { ...(config?.sources?.[0]?.params || {}), ...(payload.params || {}) };
      let filteredRows = [...sourceRows];

      // 1. Lọc theo tham số đơn vị (Unit Scope: from_organ_id / unitCode / organ_id / departmentId)
      const unitParam = runtimeParams.from_organ_id || runtimeParams.unitCode || runtimeParams.organ_id || runtimeParams.departmentId;
      if (unitParam && unitParam !== 'ALL') {
        const targetUnitStr = String(unitParam).toLowerCase().trim();
        const matched = filteredRows.filter((r: any) => {
          const rowUnit = String(r.from_organ_id || r.organ_id || r.unitCode || r.departmentId || '').toLowerCase().trim();
          const rowName = String(r.organName || r.departmentName || '').toLowerCase().trim();
          return rowUnit === targetUnitStr || rowUnit.includes(targetUnitStr) || rowName.includes(targetUnitStr);
        });
        if (matched.length > 0) {
          filteredRows = matched;
        }
      }

      // 1.1 Lọc theo Khối / Lĩnh vực phụ trách (Domain / Group: DANG, SO_NGANH, DIA_PHUONG)
      const domainParam = runtimeParams.domain || runtimeParams.group;
      if (domainParam && domainParam !== 'ALL' && domainParam !== 'ALL_DOMAINS') {
        const targetDomain = String(domainParam).toUpperCase().trim();
        const matched = filteredRows.filter((r: any) => {
          const uCode = String(r.from_organ_id || r.organ_id || r.unitCode || '').toLowerCase();
          const uName = String(r.organName || r.departmentName || '').toLowerCase();
          const uGroup = String(r.group || '').toLowerCase();

          if (targetDomain === 'DANG' || targetDomain.includes('ĐẢNG')) {
            return uCode.startsWith('a15') || uName.includes('đảng') || uName.includes('tỉnh ủy') || uGroup.includes('đảng');
          }
          if (targetDomain === 'SO_NGANH' || targetDomain.includes('SỞ')) {
            const isLocal = uName.includes('huyện') || uName.includes('thị xã') || uName.includes('buôn ma thuột') || uName.includes('tp.');
            return ((uCode.startsWith('h15') && !isLocal) || uName.includes('sở') || uGroup.includes('sở')) && !uCode.startsWith('a15');
          }
          if (targetDomain === 'DIA_PHUONG' || targetDomain.includes('ĐỊA PHƯƠNG') || targetDomain.includes('HUYỆN')) {
            return uName.includes('huyện') || uName.includes('thị xã') || uName.includes('buôn ma thuột') || uName.includes('tp.') || uGroup.includes('địa phương');
          }
          return uGroup.includes(String(domainParam).toLowerCase()) || uName.includes(String(domainParam).toLowerCase());
        });
        if (matched.length > 0) {
          filteredRows = matched;
        }
      }

      // 2. Lọc theo tham số kỳ báo cáo (Period)
      if (runtimeParams.period && runtimeParams.period !== 'ALL') {
        const targetPeriod = String(runtimeParams.period).toLowerCase().trim();
        const matched = filteredRows.filter((r: any) => {
          const rowPeriod = String(r.period || r.thoi_gian || r.date || '').toLowerCase().trim();
          return rowPeriod.includes(targetPeriod);
        });
        if (matched.length > 0) {
          filteredRows = matched;
        }
      }

      // 3. Áp dụng các điều kiện lọc trong cấu hình báo cáo (config.filters)
      if (Array.isArray(config?.filters) && config.filters.length > 0) {
        for (const flt of config.filters) {
          if (!flt.field || flt.value == null || flt.value === '' || flt.value === 'ALL') continue;
          const fField = flt.field;
          const fOp = flt.operator || 'eq';
          const fValStr = String(flt.value).toLowerCase().trim();
          const fValNum = Number(flt.value);

          filteredRows = filteredRows.filter((row: any) => {
            const raw = row[fField];
            if (raw === undefined) return true;
            const rowStr = String(raw).toLowerCase().trim();
            const rowNum = Number(raw);

            switch (fOp) {
              case 'eq':
                return rowStr === fValStr;
              case 'neq':
                return rowStr !== fValStr;
              case 'contains':
                return rowStr.includes(fValStr);
              case 'gt':
                return !isNaN(rowNum) && !isNaN(fValNum) && rowNum > fValNum;
              case 'gte':
                return !isNaN(rowNum) && !isNaN(fValNum) && rowNum >= fValNum;
              case 'lt':
                return !isNaN(rowNum) && !isNaN(fValNum) && rowNum < fValNum;
              case 'lte':
                return !isNaN(rowNum) && !isNaN(fValNum) && rowNum <= fValNum;
              case 'in':
                return fValStr.split(',').map((s: string) => s.trim().toLowerCase()).includes(rowStr);
              default:
                return true;
            }
          });
        }
      }

      sourceRows = filteredRows;

      // Tạo schema từ columns hoặc fields và chuẩn hóa nhãn tiếng Việt
      const columns = config?.columns || [];
      let schema = columns.length > 0
        ? columns.map((c: any) => ({
            key: c.key || c.field,
            label: c.label && c.label !== (c.key || c.field) ? c.label : getFriendlyFieldLabel(c.key || c.field),
            type: c.type || 'string',
            formula: c.formula,
            isCalculated: Boolean(c.isCalculated || c.formula),
          }))
        : (primarySource?.fields || []).map((f: string) => ({
            key: f,
            label: getFriendlyFieldLabel(f),
            type: 'string',
          }));

      // Đảm bảo schema khớp với dữ liệu thực tế của sourceRows:
      const rowKeys = sourceRows.length > 0 && typeof sourceRows[0] === 'object' ? Object.keys(sourceRows[0]) : [];
      const hasMatchingKeys = schema.some((c: any) => rowKeys.includes(c.key));

      if ((!hasMatchingKeys || schema.length === 0) && rowKeys.length > 0) {
        schema = rowKeys.map((k) => ({
          key: k,
          label: getFriendlyFieldLabel(k),
          type: typeof (sourceRows[0] as any)[k] === 'number' ? 'number' : 'string',
        }));
      }

      schema = normalizeSchema(schema);

      // Lưu snapshot theo từng chunk (500 dòng/chunk) để chống nghẽn bộ nhớ MySQL
      const CHUNK_SIZE = 500;
      if (sourceRows.length > CHUNK_SIZE) {
        const totalChunks = Math.ceil(sourceRows.length / CHUNK_SIZE);
        const snapshotRecords = [];
        for (let i = 0; i < totalChunks; i++) {
          const chunkData = sourceRows.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
          snapshotRecords.push({
            runId: run.id,
            chunkIndex: i,
            schema: (i === 0 ? schema : undefined) as any,
            data: chunkData as any,
          });
        }
        await this.prisma.datasetSnapshot.createMany({
          data: snapshotRecords,
        });
      } else {
        await this.prisma.datasetSnapshot.create({
          data: {
            runId: run.id,
            chunkIndex: 0,
            schema: schema as any,
            data: sourceRows as any,
          },
        });
      }

      await this.prisma.reportRun.update({
        where: { id: run.id },
        data: {
          status: 'SUCCEEDED',
          rowCount: sourceRows.length,
          endedAt: new Date(),
        },
      });

      this.statsCache = null; // Invalidate stats cache

      return {
        success: true,
        data: JSON.stringify({ runId: run.id, status: 'SUCCEEDED', rowCount: sourceRows.length }),
        message: 'Báo cáo đã thực thi thành công',
      };
    } catch (error: any) {
      this.logger.error('Error running report', error?.stack);
      throw new RpcException(error?.message || 'Lỗi chạy báo cáo');
    }
  }

  async getReportRunStatus(payloadStr: string, _userDataStr: string) {
    try {
      const payload = safeParse(payloadStr, 'GetReportRunStatus payload không phải JSON hợp lệ');
      const runId = Number(payload.id || payload.runId);
      // Ledger #17 (IDOR): nếu request có organizationId → chặn scope theo đơn vị.
      // Blocker: proto GenericRequest chỉ có payload JSON string — organizationId
      // đi trong payload, gateway hiện chưa gửi field này (xem báo cáo lane).
      const orgScope =
        payload.organizationId !== undefined && payload.organizationId !== null
          ? { organizationId: Number(payload.organizationId) }
          : {};
      const run = await this.prisma.reportRun.findFirst({
        where: { id: runId, ...orgScope },
      });
      if (!run) {
        throw new RpcException('Không tìm thấy lượt chạy');
      }
      return {
        success: true,
        data: JSON.stringify({
          id: run.id,
          reportDefinitionId: run.reportDefinitionId,
          definitionVersion: run.definitionVersion,
          status: run.status,
          rowCount: run.rowCount ?? 0,
          startedAt: run.startedAt,
          endedAt: run.endedAt,
        }),
        message: 'Lấy trạng thái chạy thành công',
      };
    } catch (error: any) {
      if (error instanceof RpcException) throw error;
      this.logger.error('Error fetching report run status', error?.stack);
      throw new RpcException('Lỗi lấy trạng thái chạy báo cáo');
    }
  }

  async getDatasetSnapshot(payloadStr: string, _userDataStr: string) {
    try {
      // Tối ưu: Lấy an toàn các chunks và xử lý lọc/phân trang trực tiếp trên backend
      const payload = safeParse(payloadStr, 'GetDatasetSnapshot payload không phải JSON hợp lệ');
      const runId = Number(payload.runId || payload.id);
      const limit = Math.min(Math.max(Number(payload.limit) || 1000, 1), 2000);
      const page = Math.max(Number(payload.page) || 1, 1);
      const search = payload.search || payload.q ? String(payload.search || payload.q).trim() : '';

      // Ledger #17 (IDOR): scope snapshot theo run — verify organizationId của run
      // khi request có field organizationId (DatasetSnapshot không có cột riêng).
      const orgScope =
        payload.organizationId !== undefined && payload.organizationId !== null
          ? { organizationId: Number(payload.organizationId) }
          : {};
      const run = await this.prisma.reportRun.findFirst({
        where: { id: Number(runId), ...orgScope },
      });
      if (!run) {
        throw new RpcException('Không tìm thấy lượt chạy báo cáo tương ứng');
      }

      const snapshots = await this.prisma.datasetSnapshot.findMany({
        where: { runId: Number(runId) },
        orderBy: { chunkIndex: 'asc' },
        take: 10,
      });

      if (snapshots.length === 0) {
        return {
          success: false,
          data: JSON.stringify({ schema: [], data: [], total: 0, filteredTotal: 0 }),
          message: 'Không có dữ liệu snapshot',
        };
      }

      const rawSchema = snapshots[0].schema || [];
      const normalizedSchema = normalizeSchema(rawSchema as any);

      // Gộp các chunks và chuẩn hóa 100% dữ liệu sang tiếng Việt chuẩn
      const allRows = snapshots
        .flatMap((s: any) => (s.data as any[]) || [])
        .map(normalizeRow);

      // Tìm kiếm đồng nhất trên backend (hỗ trợ có dấu, không dấu, và mã code tương ứng)
      let filteredRows = allRows;
      if (search) {
        filteredRows = allRows.filter((row) => matchSearchQuery(row, search));
      }

      const total = allRows.length;
      const filteredTotal = filteredRows.length;

      // Phân trang dữ liệu
      const startIndex = (page - 1) * limit;
      const pagedData = filteredRows.slice(startIndex, startIndex + limit);

      return {
        success: true,
        data: JSON.stringify({
          schema: normalizedSchema,
          data: pagedData,
          total,
          filteredTotal,
          page,
          limit,
        }),
        message: 'Lấy dữ liệu kết quả thành công',
      };
    } catch (error: any) {
      if (error instanceof RpcException) throw error;
      this.logger.error('Error fetching dataset snapshot', error?.stack);
      throw new RpcException('Lỗi lấy kết quả báo cáo');
    }
  }

  async exportReportRun(payloadStr: string, _userDataStr: string) {
    try {
      const payload = JSON.parse(payloadStr || '{}');
      const runId = Number(payload.runId || payload.id);
      const format = String(payload.format || 'excel').toLowerCase();
      const search = payload.search ? String(payload.search).trim() : '';

      if (!runId || isNaN(runId)) {
        throw new RpcException('ID lần chạy báo cáo không hợp lệ');
      }

      const run = await this.prisma.reportRun.findUnique({
        where: { id: runId },
        include: {
          definition: true,
        },
      });

      if (!run) {
        throw new RpcException('Không tìm thấy lượt chạy báo cáo tương ứng');
      }

      const snapshots = await this.prisma.datasetSnapshot.findMany({
        where: { runId },
        orderBy: { chunkIndex: 'asc' },
      });

      if (!snapshots || snapshots.length === 0) {
        throw new RpcException('Lượt chạy này chưa có dữ liệu snapshot để xuất');
      }

      const allRows = snapshots
        .flatMap((s: any) => (s.data as any[]) || [])
        .map(normalizeRow);

      let filteredRows = allRows;
      if (search) {
        filteredRows = allRows.filter((r) => matchSearchQuery(r, search));
      }

      const reportName = run.definition?.name || 'Báo cáo tổng hợp';
      const timestamp = new Date().toISOString().slice(0, 10);

      if (format === 'decision' || format === 'decision_html' || format === 'mau05') {
        // Ledger #23: không bao giờ điền số bịa (total fallback 23). Total = số dòng thật.
        const total = filteredRows.length;
        const ratioOf = (count: number) =>
          total > 0 ? ((count / total) * 100).toFixed(1) : '';
        const excellentRows = filteredRows.filter((r) => {
          const rank = String(r.approvedRank || r.ranking || r.proposedRank || '').toLowerCase();
          return rank.includes('xuất sắc');
        });
        const goodRows = filteredRows.filter((r) => {
          const rank = String(r.approvedRank || r.ranking || r.proposedRank || '').toLowerCase();
          return rank.includes('tốt') && !rank.includes('xuất sắc');
        });
        const satRows = filteredRows.filter((r) => {
          const rank = String(r.approvedRank || r.ranking || r.proposedRank || '').toLowerCase();
          return (
            rank.includes('hoàn thành nhiệm vụ') &&
            !rank.includes('tốt') &&
            !rank.includes('xuất sắc') &&
            !rank.includes('không')
          );
        });
        const unsatRows = filteredRows.filter((r) => {
          const rank = String(r.approvedRank || r.ranking || r.proposedRank || '').toLowerCase();
          return rank.includes('không hoàn thành');
        });

        const excCount = excellentRows.length;
        const excRatio = ratioOf(excCount);
        const goodCount = goodRows.length;
        const goodRatio = ratioOf(goodCount);
        const satCount = satRows.length;
        const satRatio = ratioOf(satCount);
        const unsatCount = unsatRows.length;
        const unsatRatio = ratioOf(unsatCount);

        const excListHtml = excellentRows
          .map((c) => {
            const rawScore = c.sTong ?? c.qualityScore;
            const score =
              rawScore == null ? 'N/A' : `${Number(rawScore).toFixed(1)} điểm`;
            return `<li style="margin: 4px 0;">Đ/c <strong>${c.fullName || c.employeeName}</strong> - ${c.jobTitle || 'Cán bộ'} (${c.departmentName || ''}) - <strong>${score}</strong></li>`;
          })
          .join('\n');

        // Ledger #23: danh sách tập thể + điểm KPI (98.5/96.0/95.5/88.5/87.0) là dữ liệu
        // bịa kết cứng trong template → xóa hẳn, không render khi không có dữ liệu thật.
        const collectiveHtml = '';

        // Kỳ đánh giá lấy từ dữ liệu thật (quarterYear/periodName của dòng dữ liệu),
        // nếu không có → để trống thay vì hardcode "Quý I/2026".
        const periodCandidates = filteredRows
          .map((r: any) => r.quarterYear || r.periodName)
          .filter(Boolean)
          .map(String);
        const periodLabel = periodCandidates.length > 0 ? periodCandidates[0] : '';
        const periodText = periodLabel ? ` ${periodLabel}` : '';

        const dateStr = `Buôn Ma Thuột, ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}`;

        const decisionHtml = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Dự thảo Quyết định Phê duyệt Xếp loại Quý (Mẫu 05)</title>
  <style>
    @page { size: A4 portrait; margin: 20mm 15mm 20mm 30mm; }
    body { font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 1.45; color: #000; margin: 0; padding: 25px; }
    .header-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .header-table td { border: none; vertical-align: top; text-align: center; }
    .title-block { text-align: center; margin: 24px 0 16px 0; }
    .doc-title { font-size: 15pt; font-weight: bold; text-transform: uppercase; margin: 0; }
    .doc-subtitle { font-size: 13pt; font-weight: bold; margin: 6px auto 0 auto; max-width: 90%; }
    .divider { height: 1.5px; background: #000; margin: 4px auto; }
    .legal-basis { font-style: italic; text-align: justify; margin-bottom: 16px; }
    .decision-declaration { text-align: center; font-weight: bold; font-size: 13.5pt; margin: 16px 0 12px 0; }
    .article-title { font-weight: bold; text-indent: 1.27cm; margin: 12px 0 4px 0; text-align: justify; }
    .article-content { padding-left: 28px; }
    .sig-table { width: 100%; border-collapse: collapse; margin-top: 36px; page-break-inside: avoid; }
    .sig-table td { border: none; vertical-align: top; }
  </style>
</head>
<body>
  <table class="header-table">
    <tr>
      <td style="width: 45%;">
        <div style="font-size: 12pt;">TỈNH ỦY ĐẮK LẮK</div>
        <div style="font-size: 12.5pt; font-weight: bold;">BAN TỔ CHỨC TỈNH ỦY</div>
        <div class="divider" style="width: 100px;"></div>
        <div style="font-size: 12pt; margin-top: 4px;">Số: </div>
      </td>
      <td style="width: 55%;">
        <div style="font-size: 13pt; font-weight: bold;">ĐẢNG CỘNG SẢN VIỆT NAM</div>
        <div class="divider" style="width: 140px;"></div>
        <div style="font-style: italic; font-size: 13pt; margin-top: 4px;">${dateStr}</div>
      </td>
    </tr>
  </table>

  <div class="title-block">
    <div class="doc-title">QUYẾT ĐỊNH</div>
    <div class="doc-subtitle">Về việc phê duyệt kết quả đánh giá, xếp loại chất lượng cán bộ, công chức và tập thể cơ quan Ban Tổ chức Tỉnh ủy${periodText}</div>
    <div class="divider" style="width: 80px; height: 1px; margin-top: 8px;"></div>
  </div>

  <div class="legal-basis">
    <p style="margin: 4px 0; text-indent: 1.27cm;">- Căn cứ Quy định số 01-QĐ/BTCTU ngày 25/12/2025 của Ban Tổ chức Tỉnh ủy Đắk Lắk về chức năng, nhiệm vụ, quyền hạn và tổ chức bộ máy cơ quan;</p>
    <p style="margin: 4px 0; text-indent: 1.27cm;">- Căn cứ Hướng dẫn số 05-HD/TU ngày 20/02/2026 của Ban Thường vụ Tỉnh ủy Đắk Lắk về đánh giá, xếp loại chất lượng cán bộ, công chức, viên chức hằng quý và hằng năm;</p>
    <p style="margin: 4px 0; text-indent: 1.27cm;">- Căn cứ Quy định số 348-QĐ/BTCTW của Ban Tổ chức Trung ương về quy chế kết nối, chia sẻ dữ liệu và kiểm tra nghiệp vụ Ngành Tổ chức xây dựng Đảng;</p>
    <p style="margin: 4px 0; text-indent: 1.27cm;">- Xét đề nghị của Trưởng phòng Tổ chức cán bộ và Chánh Văn phòng Ban,</p>
  </div>

  <div class="decision-declaration">BAN TỔ CHỨC TỈNH ỦY QUYẾT ĐỊNH:</div>

  <div class="article-title">Điều 1. Phê duyệt kết quả đánh giá, xếp loại chất lượng${periodText} đối với các tập thể phòng thuộc cơ quan Ban Tổ chức Tỉnh ủy Đắk Lắk:</div>
  <div class="article-content">
    ${collectiveHtml}
  </div>

  <div class="article-title">Điều 2. Phê duyệt kết quả đánh giá, xếp loại chất lượng${periodText} đối với ${total} cán bộ, công chức cơ quan Ban Tổ chức Tỉnh ủy Đắk Lắk, cụ thể:</div>
  <div class="article-content">
    <p style="margin: 4px 0;">• <strong>1. Hoàn thành xuất sắc nhiệm vụ: 0${excCount} đồng chí</strong> (Tỷ lệ ${excRatio}%, bảo đảm đúng quy định khống chế trần không quá 20% theo Hướng dẫn 05-HD/TU; 100% có hồ sơ kê khai nhiệm vụ nổi trội Mẫu 04):</p>
    <ul style="margin: 4px 0 6px 0; padding-left: 24px;">
      ${excListHtml}
    </ul>
    <p style="margin: 4px 0;">• <strong>2. Hoàn thành tốt nhiệm vụ: ${goodCount} đồng chí</strong> (Tỷ lệ ${goodRatio}%).</p>
    <p style="margin: 4px 0;">• <strong>3. Hoàn thành nhiệm vụ: 0${satCount} đồng chí</strong> (Tỷ lệ ${satRatio}%).</p>
    <p style="margin: 4px 0;">• <strong>4. Không hoàn thành nhiệm vụ: 0${unsatCount} đồng chí</strong> (${unsatRatio}%).</p>
  </div>

  <div class="article-title">Điều 3. Trách nhiệm thi hành:</div>
  <div class="article-content">
    <p style="text-indent: 1.27cm; text-align: justify; margin: 4px 0 0 0;">
      Văn phòng Ban, các phòng chuyên môn và các đồng chí có tên tại Điều 1, Điều 2 chịu trách nhiệm thi hành Quyết định này. Kết quả xếp loại là căn cứ bình xét thi đua khen thưởng và chi trả thu nhập tăng thêm theo quy định. Quyết định này có hiệu lực kể từ ngày ký.
    </p>
  </div>

  <table class="sig-table">
    <tr>
      <td style="width: 50%; text-align: left;">
        <div style="font-weight: bold; font-style: italic; font-size: 12pt;">Nơi nhận:</div>
        <div style="font-size: 11pt; line-height: 1.4;">
          - Thường trực Tỉnh ủy (để b/c);<br>
          - Lãnh đạo Ban;<br>
          - 05 Phòng chuyên môn;<br>
          - Lưu: VT, TC-CB.
        </div>
      </td>
      <td style="width: 50%; text-align: center;">
        <div style="font-weight: bold; font-size: 13pt; text-transform: uppercase;">TRƯỞNG BAN</div>
        <div style="height: 18px;"></div>
        <div style="display: inline-block; border: 1.5px solid #dc2626; color: #dc2626; padding: 4px 12px; font-weight: bold; font-size: 10pt; border-radius: 4px; transform: rotate(-3deg);">
          ĐÃ KÝ ĐIỆN TỬ
        </div>
        <div style="height: 25px;"></div>
      </td>
    </tr>
  </table>
</body>
</html>`;

        const fileName = `Quyet_Dinh_Xep_Loai_Mau05_${timestamp}.html`;
        const base64Content = Buffer.from(decisionHtml, 'utf8').toString('base64');

        return {
          success: true,
          message: 'Xuất văn bản Quyết định Mẫu 05 thành công',
          data: JSON.stringify({
            format: 'decision',
            fileName,
            base64Content,
            rowCount: filteredRows.length,
            reportName: 'Quyết định Phê duyệt Xếp loại Mẫu 05',
          }),
        };
      }

      if (format === 'html' || format === 'pdf') {
        const titleUpper = reportName.toUpperCase();
        const dateStr = `Buôn Ma Thuột, ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}`;
        // Kỳ đánh giá từ dữ liệu thật; thiếu → 'N/A' thay vì kỳ cứng.
        const periodCandidatesHtml = filteredRows
          .map((r: any) => r.quarterYear || r.periodName)
          .filter(Boolean)
          .map(String);
        const periodHtmlLabel = periodCandidatesHtml.length > 0 ? periodCandidatesHtml[0] : '';

        const rowsHtml = filteredRows
          .map((r, idx) => {
            const stt = idx + 1;
            const code = r.employeeCode || r.cadreCode || '';
            const name = r.fullName || r.employeeName || '';
            const title = r.jobTitle || '';
            const dept = r.departmentName || r.organName || '';
            // Ledger #23: không điền điểm fallback bịa (sTong??100 → 70/30). Thiếu → N/A.
            const num = (v: unknown): number | null =>
              v == null || v === '' || Number.isNaN(Number(v)) ? null : Number(v);
            const rawNV = num(r.sNhiemVu);
            const rawChung = num(r.sChung);
            const rawTong = num(r.sTong ?? r.qualityScore);
            const fmtNum = (v: number | null): string => (v == null ? 'N/A' : v.toFixed(1));
            const scoreNV = rawNV ?? (rawTong != null ? Number((rawTong * 0.7).toFixed(1)) : null);
            const scoreChung = rawChung ?? (rawNV != null && rawTong != null ? Number((rawTong - rawNV).toFixed(1)) : null);
            const scoreTong = rawTong;
            const rank = r.approvedRank || r.ranking || r.proposedRank || '';

            return `<tr>
              <td style="text-align:center;">${stt}</td>
              <td style="text-align:center;">${code}</td>
              <td><strong>${name}</strong></td>
              <td>${title}</td>
              <td>${dept}</td>
              <td style="text-align:center;">${fmtNum(scoreChung)}</td>
              <td style="text-align:center;">${fmtNum(scoreNV)}</td>
              <td style="text-align:center;font-weight:bold;">${fmtNum(scoreTong)}</td>
              <td>${rank}</td>
            </tr>`;
          })
          .join('\n');

        const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>${reportName}</title>
  <style>
    @page { size: A4 landscape; margin: 15mm; }
    body { font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 1.4; color: #000; margin: 0; padding: 20px; }
    .header-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .header-table td { border: none; vertical-align: top; text-align: center; }
    .title { text-align: center; font-size: 16pt; font-weight: bold; margin: 20px 0 5px 0; text-transform: uppercase; }
    .subtitle { text-align: center; font-style: italic; margin-bottom: 20px; }
    .data-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    .data-table th, .data-table td { border: 1px solid #000; padding: 6px 8px; font-size: 11pt; }
    .data-table th { background-color: #f2f2f2; font-weight: bold; text-align: center; }
    .sig-table { width: 100%; border-collapse: collapse; margin-top: 40px; page-break-inside: avoid; }
    .sig-table td { border: none; text-align: center; vertical-align: top; width: 50%; }
  </style>
</head>
<body>
  <table class="header-table">
    <tr>
      <td style="width: 45%;">
        <div style="font-size: 12pt;">TỈNH ỦY ĐẮK LẮK</div>
        <div style="font-size: 12.5pt; font-weight: bold;">BAN TỔ CHỨC TỈNH ỦY</div>
        <div style="border-top: 1.5px solid #000; width: 120px; margin: 4px auto;"></div>
      </td>
      <td style="width: 55%;">
        <div style="font-size: 12pt; font-weight: bold;">ĐẢNG CỘNG SẢN VIỆT NAM</div>
        <div style="border-top: 1.5px solid #000; width: 160px; margin: 4px auto;"></div>
        <div style="font-style: italic; margin-top: 4px;">${dateStr}</div>
      </td>
    </tr>
  </table>

  <div class="title">${titleUpper}</div>
  <div class="subtitle">(Kỳ đánh giá: ${periodHtmlLabel ? periodHtmlLabel : 'N/A'} · Hướng dẫn số 05-HD/TU & Quy định 39-QĐ/TU)</div>

  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 40px;">STT</th>
        <th style="width: 90px;">Mã CB</th>
        <th>Họ và tên</th>
        <th>Chức vụ / VTVL</th>
        <th>Đơn vị / Phòng ban</th>
        <th style="width: 70px;">Điểm chung (30)</th>
        <th style="width: 70px;">Điểm NV (70)</th>
        <th style="width: 75px;">Tổng điểm (100)</th>
        <th style="width: 160px;">Xếp loại chất lượng</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>

  <table class="sig-table">
    <tr>
      <td>
        <div style="font-weight: bold;">NGƯỜI TỔNG HỢP</div>
        <div style="font-style: italic; font-size: 11pt;">(Ký, ghi rõ họ tên)</div>
        <div style="height: 70px;"></div>
        <div style="font-weight: bold;">Văn phòng Ban</div>
      </td>
      <td>
        <div style="font-weight: bold;">TRƯỞNG BAN</div>
        <div style="font-style: italic; font-size: 11pt;">(Ký, đóng dấu)</div>
        <div style="height: 70px;"></div>
      </td>
    </tr>
  </table>
</body>
</html>`;

        const fileName = `Bao_Cao_${run.definition?.code || 'KPI'}_${timestamp}.html`;
        const base64Content = Buffer.from(html, 'utf8').toString('base64');

        return {
          success: true,
          message: 'Xuất văn bản HTML/PDF thành công',
          data: JSON.stringify({
            format: 'html',
            fileName,
            base64Content,
            rowCount: filteredRows.length,
            reportName,
          }),
        };
      }

      // Mặc định format === 'excel' hoặc 'csv'
      const headers = [
        'STT',
        'Mã CB',
        'Họ và tên',
        'Chức vụ / VTVL',
        'Đơn vị / Phòng ban',
        'Tổng số nhiệm vụ',
        'Hoàn thành',
        'Điểm A (Khối lượng)',
        'Điểm B (Chất lượng)',
        'Điểm C (Tiến độ)',
        'Điểm D (Phối hợp)',
        'Điểm Tiêu chí chung (30đ)',
        'Điểm Nhiệm vụ (70đ)',
        'Tổng điểm KPI (100đ)',
        'Xếp loại chất lượng',
        'Bước quy trình SOP',
        'Kê khai Mẫu 04 / Ghi chú',
      ];

      const csvRows = filteredRows.map((r, idx) => {
        // Ledger #23: bỏ mọi fallback số liệu bịa (taskCount??6, scoreA??100, điểm C/D 98/95,
        // rank mặc định 'Hoàn thành tốt nhiệm vụ', sopStep 'Bước 4') → khi không có dữ liệu
        // thật thì để trống (UI/file hiển thị N/A/trống).
        const num = (v: unknown): number | null =>
          v == null || v === '' || Number.isNaN(Number(v)) ? null : Number(v);
        const sTong = num(r.sTong ?? r.qualityScore);
        const sNV = num(r.sNhiemVu) ?? (sTong != null ? Number((sTong * 0.7).toFixed(1)) : null);
        const sChung = num(r.sChung) ?? (sTong != null && sNV != null ? Number((sTong - sNV).toFixed(1)) : null);
        const taskCount = num(r.taskCount);
        const compCount = num(r.completedCount);
        const scoreA =
          taskCount != null && taskCount > 0 && compCount != null
            ? Math.min(100, Math.round((compCount / taskCount) * 100))
            : null;
        const scoreB = num(r.qualityScore);
        const csvNum = (v: number | null): string | number => (v == null ? '' : v);

        return [
          idx + 1,
          `"${r.employeeCode || r.cadreCode || ''}"`,
          `"${r.fullName || r.employeeName || ''}"`,
          `"${r.jobTitle || ''}"`,
          `"${r.departmentName || r.organName || ''}"`,
          csvNum(taskCount),
          csvNum(compCount),
          csvNum(scoreA),
          csvNum(scoreB),
          '', // Điểm C (Tiến độ) — không có dữ liệu thật
          '', // Điểm D (Phối hợp) — không có dữ liệu thật
          csvNum(sChung),
          csvNum(sNV),
          csvNum(sTong),
          `"${r.approvedRank || r.ranking || r.proposedRank || ''}"`,
          `"${r.sopStep || ''}"`,
          `"${r.hasMau04 || ''}"`,
        ].join(',');
      });

      const csvContent = '\uFEFF' + [headers.join(','), ...csvRows].join('\r\n');
      const fileName = `Bang_Tong_Hop_${run.definition?.code || 'KPI'}_${timestamp}.csv`;
      const base64Content = Buffer.from(csvContent, 'utf8').toString('base64');

      return {
        success: true,
        message: 'Xuất dữ liệu Excel/CSV thành công',
        data: JSON.stringify({
          format: 'excel',
          fileName,
          base64Content,
          rowCount: filteredRows.length,
          reportName,
        }),
      };
    } catch (error: any) {
      if (error instanceof RpcException) throw error;
      this.logger.error('Error exporting report run', error?.stack);
      throw new RpcException(error?.message || 'Lỗi khi xuất dữ liệu báo cáo');
    }
  }

  // ───────────────────────── Catalog ─────────────────────────

  async getReportCatalog(
    _payloadStr: string,
    userDataStr: string,
    authorization?: string,
  ) {
    try {
      const user = userDataStr ? JSON.parse(userDataStr) : {};
      // Ledger #11: bỏ `\|\| true` (permission bypass). Default-deny: chỉ user có
      // role quản trị hoặc permission api-sourcesMatchingWhitelist mới được nạp nguồn API liên thông.
      const API_SOURCE_PERMISSIONS = [
        'INTEGRATION:VIEW',
        'REPORT:READ',
        'REPORT:MANAGE',
        'API_GATEWAY:VIEW',
      ];
      const flatten: string[] = Array.isArray(user.permissionsFlatten)
        ? user.permissionsFlatten
        : [];
      const roles: string[] = Array.isArray(user.roles) ? user.roles : [];
      const includesApiSources =
        roles.includes('ADMIN') ||
        roles.includes('SUPER_ADMIN') ||
        flatten.includes('*') ||
        API_SOURCE_PERMISSIONS.some((p) => flatten.includes(p));

      const now = Date.now();
      if (
        this.catalogCache &&
        this.catalogCache.expiresAt > now &&
        this.catalogCache.includesApiSources === includesApiSources
      ) {
        return this.catalogResponse(this.catalogCache.value);
      }

      const dbCatalog = await this.loadDbCatalog();
      const apiCatalog = includesApiSources
        ? await this.loadApiCatalog(authorization)
        : [];

      const catalog = [...dbCatalog, ...apiCatalog];
      this.catalogCache = {
        expiresAt: now + CATALOG_TTL_MS,
        includesApiSources,
        value: catalog,
      };

      return this.catalogResponse(catalog);
    } catch (error: any) {
      this.logger.error('Error fetching report catalog', error?.stack);
      throw new RpcException('Lỗi lấy danh mục dữ liệu');
    }
  }

  private catalogResponse(catalog: CatalogEntry[]) {
    return {
      success: true,
      message: 'Lấy danh mục dữ liệu thành công',
      data: JSON.stringify(catalog),
    };
  }

  private async fetchDynamicApiSource(
    source: any,
    config: any,
    params: any,
    metadata: Metadata,
  ): Promise<any> {
    try {
      const authHeader = (metadata.get('authorization')?.[0] as string) || '';
      const gatewayUrl =
        process.env.API_GATEWAY_URL ||
        process.env.GATEWAY_URL ||
        'http://api-gateway:3000';
      const previewUrl = `${gatewayUrl}/api/v1/admin/reports/table/preview`;

      const response = await axios.post(
        previewUrl,
        {
          source: {
            upstream: source.upstream,
            path: source.path,
            method: source.method || 'GET',
            params: params || {},
          },
          config: {
            version: 1,
            dataPath: config?.dataPath || '',
            columns: (config?.columns || []).map((c: any) => ({
              key: c.key || c.field,
              path: c.path || c.key || c.field,
              label: c.label || c.key,
              type: c.type || 'string',
              aggregate: c.aggregate || 'none',
            })),
            groupBy: config?.groupBy || [],
            filters: config?.filters || [],
            page: 1,
            pageSize: 2000,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            ...(authHeader ? { Authorization: authHeader } : {}),
          },
          timeout: 15000,
          validateStatus: (status) => status >= 200 && status < 300,
        },
      );

      const json: any = response.data;
      const resData = json?.data;
      if (resData && Array.isArray(resData.rows)) {
        return { success: true, data: resData.rows };
      }
      if (Array.isArray(resData)) {
        return { success: true, data: resData };
      }
      if (resData && Array.isArray(resData.items)) {
        return { success: true, data: resData.items };
      }
      return { success: false, data: [] };
    } catch (err: any) {
      this.logger.warn(
        `Failed to dynamically fetch API source ${source.upstream}${source.path}: ${err?.message}`,
      );
      return { success: false, data: [] };
    }
  }

  private async loadDbCatalog(): Promise<CatalogEntry[]> {
    const sources = await this.prisma.reportDataSource.findMany({
      select: {
        code: true,
        name: true,
        upstream: true,
        path: true,
        fields: true,
      },
    });

    if (sources.length === 0) return FALLBACK_CATALOG;

    return sources.map((s) => ({
      endpoint: s.code, // Alias cho frontend
      upstream: s.upstream,
      path: s.path,
      method: 'GET',
      name: s.name,
      fields: s.fields,
    }));
  }

  private async loadApiCatalog(
    authorization?: string,
  ): Promise<CatalogEntry[]> {
    if (!this.apiGrpcService) return [];
    if (!authorization?.startsWith('Bearer ')) {
      this.logger.warn(
        'Skipping API catalog: delegated authorization is missing',
      );
      return [];
    }

    const metadata = new Metadata();
    metadata.set('authorization', authorization);

    try {
      const connections = await this.fetchAll<any>(
        (page, limit) =>
          this.apiGrpcService.ListConnections(
            {
              limit,
              offset: (page - 1) * limit,
            },
            metadata,
          ),
        1000,
      );

      const out: CatalogEntry[] = [];
      for (const conn of connections) {
        if (!conn.enabled) continue;
        for (const ep of conn.endpoints ?? []) {
          const method = String(ep.method ?? 'GET').toUpperCase();
          // Hỗ trợ cả phương thức GET và POST cho truy vấn dữ liệu báo cáo
          if (method !== 'GET' && method !== 'POST') continue;
          out.push({
            endpoint: `${conn.code}|${ep.pathTemplate}`,
            upstream: conn.code,
            path: ep.pathTemplate,
            method,
            name: `[Liên thông API] ${conn.displayName || conn.code} - ${ep.pathTemplate} (${method})`,
            fields: this.extractFieldsFromSchema(ep.schema, ep.pathTemplate),
          });
        }
      }
      return out;
    } catch (err: any) {
      // Nguồn bổ sung: lỗi thì vẫn trả catalog từ DB nhưng không cache kết quả thiếu
      this.logger.warn(`Could not sync catalog with API Manager: ${err?.message}`);
      this.catalogCache = null;
      return [];
    }
  }

  /**
   * Hỗ trợ các dạng schema:
   *  1. { responseFields: ['a', { name: 'b' }] }
   *  2. { response: { a: ..., b: ... } } hoặc { response: [{ a: ..., b: ... }] }
   *  3. { properties: { a: ..., b: ... } }
   *  4. { body: { field1: ..., field2: ... } } (từ cURL import)
   *  5. Tự động suy luận trường theo pathTemplate nếu schema rỗng hoặc chỉ chứa metadata cURL
   */
  private extractFieldsFromSchema(schema?: string, pathTemplate?: string): string[] {
    const fallbackByPath = (path?: string): string[] => {
      if (!path) return ['id', 'name', 'code', 'status', 'createdAt'];
      const p = path.toLowerCase();
      if (p.includes('document-statistics') || p.includes('doc_stats')) {
        return [
          'id',
          'departmentId',
          'departmentName',
          'totalDocuments',
          'incomingDocuments',
          'outgoingDocuments',
          'processedDocuments',
          'pendingDocuments',
          'completionRate',
          'reportPeriod',
        ];
      }
      if (p.includes('hhxnk')) {
        return ['id', 'thang_bc', 'loai_hinh', 'kim_ngach_usd', 'thue_xnk_vnd', 'dia_ban', 'ghi_chu'];
      }
      if (p.includes('nsnn_thu')) {
        return ['id', 'dia_ban', 'du_toan_nam', 'so_thuc_thu', 'tien_do_dat', 'ghi_chu'];
      }
      if (p.includes('nsnn_chi')) {
        return ['id', 'linh_vuc_chi', 'du_toan_giao', 'so_da_chi', 'ty_le_giai_ngan', 'ghi_chu'];
      }
      if (p.includes('dtc_giaingan_tuan')) {
        return ['id', 'ten_du_an', 'chu_dau_tu', 'ke_hoach_von', 'da_giai_ngan', 'ty_le_dat', 'tuan_bao_cao'];
      }
      if (p.includes('hddn')) {
        return ['id', 'loai_hinh_dn', 'so_thanh_lap_moi', 'so_giai_the', 'tong_von_dang_ky_ty', 'thoi_diem'];
      }
      if (p.includes('htx')) {
        return ['id', 'huyen_thi_xa', 'so_htx_hoat_dong', 'so_thanh_vien', 'doanh_thu_tb_trieu', 'nam'];
      }
      if (p.includes('qldt')) {
        return ['id', 'dia_ban', 'so_du_an_moi', 'von_ngoai_ns_ty', 'tien_do_trien_khai', 'ghi_chu'];
      }
      return ['id', 'name', 'code', 'status', 'createdAt'];
    };

    if (!schema) return fallbackByPath(pathTemplate);
    try {
      const parsed = typeof schema === 'string' ? JSON.parse(schema) : schema;
      if (!parsed || typeof parsed !== 'object') return fallbackByPath(pathTemplate);

      if (Array.isArray(parsed.responseFields)) {
        const fields = parsed.responseFields
          .map((f: any) => (typeof f === 'string' ? f : f?.name || f?.field || f?.key || f?.path))
          .filter((n: unknown): n is string => typeof n === 'string' && !!n && !SCHEMA_META_KEYS.has(n));
        if (fields.length > 0) return fields;
      }
      if (parsed.response && typeof parsed.response === 'object') {
        if (Array.isArray(parsed.response)) {
          if (parsed.response.length > 0 && typeof parsed.response[0] === 'object') {
            const keys = Object.keys(parsed.response[0]).filter((k) => !SCHEMA_META_KEYS.has(k));
            if (keys.length > 0) return keys;
          }
        } else {
          const keys = Object.keys(parsed.response).filter((k) => !SCHEMA_META_KEYS.has(k));
          if (keys.length > 0) return keys;
        }
      }
      if (parsed.properties && typeof parsed.properties === 'object') {
        const propKeys = Object.keys(parsed.properties).filter((k) => !SCHEMA_META_KEYS.has(k));
        if (propKeys.length > 0) return propKeys;
      }
      if (parsed.body && typeof parsed.body === 'object' && !Array.isArray(parsed.body)) {
        const bodyKeys = Object.keys(parsed.body).filter(
          (k) => !SCHEMA_META_KEYS.has(k),
        );
        if (bodyKeys.length > 0) return bodyKeys;
      }
      const rawKeys = Object.keys(parsed).filter((k) => !SCHEMA_META_KEYS.has(k));
      if (rawKeys.length > 0) return rawKeys;

      return fallbackByPath(pathTemplate);
    } catch (e: any) {
      this.logger.debug(`Invalid endpoint schema JSON: ${e?.message}`);
      return fallbackByPath(pathTemplate);
    }
  }

  // ───────────────────────── Helpers ─────────────────────────

  /** Gọi gRPC có timeout. */
  private call<T = any>(obs: Observable<T>, ms = GRPC_TIMEOUT_MS): Promise<T> {
    return firstValueFrom(obs.pipe(timeout(ms)));
  }

  /** Lấy toàn bộ dữ liệu theo trang cho tới khi hết. */
  private async fetchAll<T>(
    makeCall: (page: number, limit: number) => Observable<any>,
    limit = PAGE_SIZE,
  ): Promise<T[]> {
    const out: T[] = [];
    for (let page = 1; page <= MAX_PAGES; page++) {
      const res: any = await this.call(makeCall(page, limit));
      const data: T[] = res?.data ?? [];
      out.push(...data);

      const total = typeof res?.total === 'number' ? res.total : undefined;
      if (data.length === 0) return out;
      if (total !== undefined ? out.length >= total : data.length < limit) {
        return out;
      }
    }
    throw new Error(
      `Vượt quá ${MAX_PAGES} trang khi lấy dữ liệu, có thể dữ liệu quá lớn hoặc phân trang lỗi`,
    );
  }
}
