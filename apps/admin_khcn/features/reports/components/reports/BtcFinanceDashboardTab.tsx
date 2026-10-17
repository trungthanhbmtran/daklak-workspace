"use client";

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Landmark,
  Coins,
  TrendingUp,
  Activity,
  ArrowUpRight,
  Settings2,
  CheckCircle2,
  Sparkles,
  Globe2,
  Briefcase,
  FileSpreadsheet,
  Building2,
  Filter,
} from 'lucide-react';
import { Card, CardContent } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { EmbeddedReportWidget } from '../EmbeddedReportWidget';

interface BtcIndicatorRow {
  id: number;
  ma_chi_tieu: string;
  ten_chi_tieu: string;
  linh_vuc: string;
  don_vi_phu_trach: string;
  du_toan_giao: number;
  thuc_hien: number;
  ty_le_dat: number;
  cung_ky_nam_truoc: number;
  danh_gia_tien_do: string;
  ky_bao_cao: string;
  isUsd?: boolean;
}

const BTC_INDICATORS: BtcIndicatorRow[] = [
  {
    id: 1,
    ma_chi_tieu: 'TC_01',
    ten_chi_tieu: 'Thu Ngân sách Nhà nước trên địa bàn tỉnh',
    linh_vuc: 'Thu ngân sách',
    don_vi_phu_trach: 'Cục Thuế tỉnh Đắk Lắk',
    du_toan_giao: 9640000000000,
    thuc_hien: 8520000000000,
    ty_le_dat: 88.4,
    cung_ky_nam_truoc: 7550000000000,
    danh_gia_tien_do: 'Vượt tiến độ dự toán (88.4%)',
    ky_bao_cao: 'Tháng 10/2026',
  },
  {
    id: 2,
    ma_chi_tieu: 'TC_02',
    ten_chi_tieu: 'Chi Ngân sách địa phương theo phân bổ',
    linh_vuc: 'Chi ngân sách',
    don_vi_phu_trach: 'Kho bạc Nhà nước Đắk Lắk',
    du_toan_giao: 14200000000000,
    thuc_hien: 11650000000000,
    ty_le_dat: 82.0,
    cung_ky_nam_truoc: 10420000000000,
    danh_gia_tien_do: 'Đảm bảo chi thường xuyên và ĐTPT',
    ky_bao_cao: 'Tháng 10/2026',
  },
  {
    id: 3,
    ma_chi_tieu: 'TC_03',
    ten_chi_tieu: 'Kế hoạch Vốn Đầu tư công giải ngân',
    linh_vuc: 'Đầu tư phát triển',
    don_vi_phu_trach: 'Sở Kế hoạch và Đầu tư',
    du_toan_giao: 6750000000000,
    thuc_hien: 5480000000000,
    ty_le_dat: 81.2,
    cung_ky_nam_truoc: 4620000000000,
    danh_gia_tien_do: 'Đạt mức khá so với cả nước (81.2%)',
    ky_bao_cao: 'Tháng 10/2026',
  },
  {
    id: 4,
    ma_chi_tieu: 'TC_04',
    ten_chi_tieu: 'Kim ngạch Xuất khẩu Nông sản chủ lực',
    linh_vuc: 'Hải quan & XNK',
    don_vi_phu_trach: 'Chi cục HQ Buôn Ma Thuột',
    du_toan_giao: 360000000,
    thuc_hien: 320100000,
    ty_le_dat: 88.9,
    cung_ky_nam_truoc: 278000000,
    danh_gia_tien_do: 'Xuất siêu 284 Triệu USD',
    ky_bao_cao: 'Tháng 10/2026',
    isUsd: true,
  },
  {
    id: 5,
    ma_chi_tieu: 'TC_05',
    ten_chi_tieu: 'Thuế Doanh nghiệp phát sinh qua HĐĐT',
    linh_vuc: 'Thuế điện tử',
    don_vi_phu_trach: 'Cục Thuế tỉnh Đắk Lắk',
    du_toan_giao: 4300000000000,
    thuc_hien: 3840000000000,
    ty_le_dat: 89.3,
    cung_ky_nam_truoc: 3320000000000,
    danh_gia_tien_do: '2.450 doanh nghiệp hoạt động',
    ky_bao_cao: 'Tháng 10/2026',
  },
  {
    id: 6,
    ma_chi_tieu: 'TC_06',
    ten_chi_tieu: 'Cao tốc Khánh Hòa - Buôn Ma Thuột (DA TP3)',
    linh_vuc: 'Dự án trọng điểm',
    don_vi_phu_trach: 'BQLDA ĐTXD CTGT & NN PTNT Tỉnh',
    du_toan_giao: 1350000000000,
    thuc_hien: 1080000000000,
    ty_le_dat: 80.0,
    cung_ky_nam_truoc: 620000000000,
    danh_gia_tien_do: 'Bám sát mốc tiến độ thông xe 2026',
    ky_bao_cao: 'Tuần 41/2026',
  },
  {
    id: 7,
    ma_chi_tieu: 'TC_07',
    ten_chi_tieu: 'Đường Hồ Chí Minh tránh phía Đông TP. BMT',
    linh_vuc: 'Dự án trọng điểm',
    don_vi_phu_trach: 'BQLDA ĐTXD CTGT & NN PTNT Tỉnh',
    du_toan_giao: 520000000000,
    thuc_hien: 460000000000,
    ty_le_dat: 88.5,
    cung_ky_nam_truoc: 310000000000,
    danh_gia_tien_do: 'Giai đoạn thảm nhựa hoàn thiện',
    ky_bao_cao: 'Tuần 41/2026',
  },
  {
    id: 8,
    ma_chi_tieu: 'TC_08',
    ten_chi_tieu: 'Trung tâm Giám sát Điều hành Thông minh IOC',
    linh_vuc: 'Chuyển đổi số & ĐMST',
    don_vi_phu_trach: 'Sở Thông tin và Truyền thông',
    du_toan_giao: 65000000000,
    thuc_hien: 58000000000,
    ty_le_dat: 89.2,
    cung_ky_nam_truoc: 25000000000,
    danh_gia_tien_do: 'Tích hợp trục LGSP & CSDL ngành',
    ky_bao_cao: 'Tuần 41/2026',
  },
];

const SECTOR_OPTIONS = [
  { value: 'all', label: 'Tất cả chỉ tiêu (8)' },
  { value: 'Thu ngân sách', label: 'Thu NSNN' },
  { value: 'Chi ngân sách', label: 'Chi NSNN' },
  { value: 'Đầu tư phát triển', label: 'Đầu tư công' },
  { value: 'Hải quan', label: 'Hải quan XNK' },
  { value: 'Thuế điện tử', label: 'Thuế & HĐĐT' },
  { value: 'Dự án trọng điểm', label: 'DA Trọng điểm' },
];

function formatCurrency(val: number, isUsd = false): string {
  if (isUsd) {
    const millions = val / 1000000;
    return `${millions.toLocaleString('vi-VN', { maximumFractionDigits: 1 })} tr. USD`;
  }
  const billions = val / 1000000000;
  return `${billions.toLocaleString('vi-VN', { maximumFractionDigits: 1 })} tỷ VNĐ`;
}

function getProgressBadgeCls(rate: number): string {
  if (rate >= 85) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
  if (rate >= 80) return 'text-blue-700 bg-blue-50 border-blue-200';
  if (rate >= 70) return 'text-amber-700 bg-amber-50 border-amber-200';
  return 'text-rose-700 bg-rose-50 border-rose-200';
}

export const BtcFinanceDashboardTab: React.FC = () => {
  const router = useRouter();
  const [sectorFilter, setSectorFilter] = useState<string>('all');

  const filteredIndicators = useMemo(() => {
    if (sectorFilter === 'all') return BTC_INDICATORS;
    return BTC_INDICATORS.filter((item) =>
      item.linh_vuc.toLowerCase().includes(sectorFilter.toLowerCase())
    );
  }, [sectorFilter]);

  return (
    <div className="space-y-6 focus-visible:outline-none focus-visible:ring-0">
      {/* 1. Provincial Finance Executive Dashboard Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-50/90 via-white to-teal-50/80 border border-emerald-200/80 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="bg-emerald-700 text-white hover:bg-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-medium shadow-xs">
                <Landmark className="w-3.5 h-3.5 mr-1" />
                Bộ Tài chính & UBND Tỉnh Đắk Lắk
              </Badge>
              <Badge
                variant="outline"
                className="border-emerald-200 text-emerald-800 bg-white/80 text-xs font-medium"
              >
                Mã thiết kế: REP_BTC_FINANCE_DAKLAK (#18)
              </Badge>
              <Badge
                variant="outline"
                className="border-blue-200 text-blue-700 bg-blue-50 text-xs flex items-center gap-1 font-medium"
              >
                <Activity className="w-3 h-3 text-blue-600" />
                Trục liên thông LGSP Bộ Tài chính
              </Badge>
              <Badge
                variant="outline"
                className="border-amber-200 text-amber-700 bg-amber-50 text-xs flex items-center gap-1 font-medium"
              >
                <Sparkles className="w-3 h-3 text-amber-500" />
                6 Nguồn dữ liệu ngành Tài chính Hợp nhất
              </Badge>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Trung tâm Giám sát Số liệu Tài chính Tỉnh Đắk Lắk (Chuẩn Bộ Tài chính)
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Phân hệ giám sát và phân tích số liệu tài chính công hợp nhất tỉnh Đắk Lắk theo chuẩn dữ liệu Bộ Tài chính qua Trục kết nối LGSP. Tích hợp trực tiếp dữ liệu Thu - Chi ngân sách nhà nước 15 huyện/thị, tiến độ giải ngân đầu tư công các công trình trọng điểm (Cao tốc Khánh Hòa - Buôn Ma Thuột, Đường tránh phía Đông, IOC...), thống kê hải quan xuất nhập khẩu nông sản chủ lực và hóa đơn điện tử doanh nghiệp.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Button
              onClick={() => router.push('/services/reports/18')}
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs h-9 px-4 rounded-xl shadow-xs flex items-center gap-1.5"
            >
              <ArrowUpRight className="w-4 h-4" />
              Xem toàn màn hình (#18)
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/services/reports/18/design')}
              className="bg-white hover:bg-slate-50 text-slate-700 border-slate-200 text-xs h-9 px-4 rounded-xl shadow-xs flex items-center gap-1.5"
            >
              <Settings2 className="w-4 h-4 text-slate-500" />
              Thiết kế & Tùy biến
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Provincial Executive Financial KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border border-slate-200/80 shadow-xs bg-white rounded-xl">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Tổng thu NSNN Toàn tỉnh</span>
              <Coins className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">8.520</span>
              <span className="text-xs text-slate-400 font-normal">/ 9.640 Tỷ VNĐ</span>
            </div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Đạt 88.4% dự toán (TP. Buôn Ma Thuột 2.860 tỷ)
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 shadow-xs bg-white rounded-xl">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Tổng chi NSNN Địa phương</span>
              <Briefcase className="w-4 h-4 text-blue-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-blue-600">11.650</span>
              <span className="text-xs text-slate-400 font-normal">/ 14.200 Tỷ VNĐ</span>
            </div>
            <div className="text-[11px] text-blue-700 font-semibold mt-1 truncate">
              Đạt 82.0% phân bổ (Chi GD-ĐT & Y tế 4.630 tỷ)
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 shadow-xs bg-white rounded-xl">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Giải ngân Vốn Đầu tư công</span>
              <TrendingUp className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-indigo-600">81.2%</span>
              <span className="text-xs text-slate-400 font-normal">(5.480 / 6.750 Tỷ)</span>
            </div>
            <div className="text-[11px] text-indigo-700 font-semibold mt-1 truncate">
              Cao tốc KH-BMT (DA TP3) đạt 80.0% tiến độ
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 shadow-xs bg-white rounded-xl">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Kim ngạch Xuất khẩu Hải quan</span>
              <Globe2 className="w-4 h-4 text-amber-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-600">320.1</span>
              <span className="text-xs text-slate-400 font-normal">Triệu USD</span>
            </div>
            <div className="text-[11px] text-amber-700 font-semibold mt-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> Cà phê Robusta: 154.2 tr. USD • Sầu riêng: 89.5 tr. USD
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Live Embedded Report Engine: 4 Interactive Visual Charts */}
      <div className="w-full min-w-0">
        <EmbeddedReportWidget
          reportIdOrCode="REP_BTC_FINANCE_DAKLAK"
          title="Biểu đồ Phân tích Chỉ số Tài chính Công Tỉnh Đắk Lắk (Chuẩn Bộ Tài chính)"
          description="Dữ liệu tổng hợp từ 6 nguồn API tài chính: Thu NSNN địa bàn, Chi NSNN lĩnh vực, Giải ngân đầu tư công tuần, Xuất khẩu nông sản hải quan và hóa đơn thuế."
          columns={2}
          chartHeight={280}
          showDetailLink={true}
          allowToggleType={true}
        />
      </div>

      {/* 4. Detailed Financial Indicators Breakdown Table */}
      <Card className="border border-slate-200/80 shadow-xs bg-white rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-emerald-700 border-emerald-200 bg-emerald-50 text-[11px] font-bold">
                Mẫu Trục Bộ Tài chính
              </Badge>
              <h3 className="text-base font-bold text-slate-900">
                Bảng Chi tiết Chỉ tiêu Giám sát Tài chính Tỉnh Đắk Lắk
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Tổng hợp 08 chỉ tiêu cốt lõi theo dõi tiến độ thực hiện ngân sách, đầu tư công và kim ngạch thương mại.
            </p>
          </div>

          {/* Sector Filter Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-slate-400 flex items-center mr-1">
              <Filter className="w-3.5 h-3.5 mr-1" /> Lĩnh vực:
            </span>
            {SECTOR_OPTIONS.map((opt) => (
              <Button
                key={opt.value}
                variant={sectorFilter === opt.value ? 'default' : 'outline'}
                size="sm"
                className={`h-7 px-2.5 text-xs rounded-lg transition-all ${
                  sectorFilter === opt.value
                    ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-2xs font-semibold'
                    : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                }`}
                onClick={() => setSectorFilter(opt.value)}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">STT</th>
                <th className="py-3 px-4 w-24">Mã</th>
                <th className="py-3 px-4 min-w-[240px]">Chỉ tiêu giám sát</th>
                <th className="py-3 px-4 min-w-[140px]">Lĩnh vực</th>
                <th className="py-3 px-4 min-w-[180px]">Đơn vị phụ trách</th>
                <th className="py-3 px-4 text-right min-w-[120px]">Dự toán / Kế hoạch</th>
                <th className="py-3 px-4 text-right min-w-[120px]">Thực hiện</th>
                <th className="py-3 px-4 text-center min-w-[110px]">Tiến độ (%)</th>
                <th className="py-3 px-4 min-w-[180px]">Đánh giá tiến độ</th>
                <th className="py-3 px-4 text-center min-w-[100px]">Kỳ báo cáo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredIndicators.map((row, idx) => (
                <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 text-center font-medium text-slate-400">
                    {idx + 1}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-800">
                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px]">
                      {row.ma_chi_tieu}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    {row.ten_chi_tieu}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    <Badge variant="outline" className="bg-slate-50 text-slate-600 text-[11px]">
                      {row.linh_vuc}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">
                    {row.don_vi_phu_trach}
                  </td>
                  <td className="py-3.5 px-4 text-right font-medium text-slate-600">
                    {formatCurrency(row.du_toan_giao, row.isUsd)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                    {formatCurrency(row.thuc_hien, row.isUsd)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${getProgressBadgeCls(row.ty_le_dat)}`}>
                        {row.ty_le_dat}%
                      </span>
                      <div className="w-16 bg-slate-100 rounded-full h-1 overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full rounded-full"
                          style={{ width: `${Math.min(row.ty_le_dat, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700">
                    <span className="text-xs">{row.danh_gia_tien_do}</span>
                  </td>
                  <td className="py-3.5 px-4 text-center text-slate-500 text-[11px] font-medium">
                    {row.ky_bao_cao}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 5. Linkage / Action Cards to provincial finance entities */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div
          onClick={() => router.push('/services/reports/18')}
          className="group p-4 bg-white rounded-xl border border-slate-200/80 hover:border-emerald-300 hover:shadow-sm cursor-pointer transition-all flex items-start gap-3"
        >
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700 group-hover:bg-emerald-700 group-hover:text-white transition-colors">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors">
              Sở Tài chính & Cục Thuế Tỉnh Đắk Lắk
            </h4>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
              Quản lý dự toán ngân sách, giám sát số thu 15 huyện thị và thanh quyết toán vốn NSNN theo luật NSNN.
            </p>
          </div>
        </div>

        <div
          onClick={() => router.push('/services/reports/18')}
          className="group p-4 bg-white rounded-xl border border-slate-200/80 hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all flex items-start gap-3"
        >
          <div className="p-2.5 rounded-lg bg-blue-50 text-blue-700 group-hover:bg-blue-700 group-hover:text-white transition-colors">
            <Briefcase className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">
              Ban Quản lý Dự án Đầu tư Xây dựng Tỉnh
            </h4>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
              Điều hành tiến độ tuần các gói thầu giao thông, hạ tầng công nghệ và đôn đốc giải ngân các dự án trọng điểm.
            </p>
          </div>
        </div>

        <div
          onClick={() => router.push('/services/reports/18')}
          className="group p-4 bg-white rounded-xl border border-slate-200/80 hover:border-amber-300 hover:shadow-sm cursor-pointer transition-all flex items-start gap-3"
        >
          <div className="p-2.5 rounded-lg bg-amber-50 text-amber-700 group-hover:bg-amber-700 group-hover:text-white transition-colors">
            <Globe2 className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold text-slate-800 group-hover:text-amber-700 transition-colors">
              Cục Hải quan Đắk Lắk & Sở Công Thương
            </h4>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
              Theo dõi luồng hàng hóa xuất khẩu nông sản chủ lực (cà phê, sầu riêng, tiêu) qua cảng ICD Buôn Ma Thuột.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
