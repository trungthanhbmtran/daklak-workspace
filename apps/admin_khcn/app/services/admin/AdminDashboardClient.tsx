"use client";

import React from "react";
import Link from "next/link";
import {
  Building2,
  Users,
  Shield,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  Settings,
  FolderTree,
  Menu,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmbeddedReportWidget } from "@/features/reports";

const ADMIN_QUICK_LINKS = [
  {
    title: "Cơ cấu Tổ chức & Định biên",
    description: "Quản lý phòng ban, sơ đồ phân cấp và định biên số lượng người làm việc theo từng vị trí việc làm",
    href: "/services/admin/organization",
    icon: Building2,
    badge: "Source of Truth",
    color: "text-blue-600 bg-blue-50 border-blue-200",
  },
  {
    title: "Tài khoản & Người dùng",
    description: "Quản lý danh sách cán bộ, phân bổ tài khoản định danh, kích hoạt trạng thái và phân quyền đơn vị",
    href: "/services/admin/users",
    icon: Users,
    badge: "Bảo mật",
    color: "text-emerald-600 bg-emerald-50 border-emerald-200",
  },
  {
    title: "Chính sách Phân quyền (PBAC)",
    description: "Thiết lập ma trận phân quyền dựa trên chính sách và vai trò, bảo vệ dữ liệu theo phạm vi tổ chức",
    href: "/services/admin/policies",
    icon: ShieldCheck,
    badge: "An toàn",
    color: "text-indigo-600 bg-indigo-50 border-indigo-200",
  },
  {
    title: "Khung Mẫu Vị trí Việc làm",
    description: "Bộ tiêu chuẩn định danh VTVL, mô tả chức danh và quy định phân công theo dõi địa bàn, lĩnh vực",
    href: "/services/admin/unit-job-templates",
    icon: FileSpreadsheet,
    badge: "Ban Tổ chức TU",
    color: "text-amber-600 bg-amber-50 border-amber-200",
  },
  {
    title: "Danh mục Dùng chung",
    description: "Chuẩn hóa bảng mã danh mục liên thông dữ liệu, danh mục chức vụ, ngạch bậc và trạng thái",
    href: "/services/admin/categories",
    icon: FolderTree,
    badge: "Toàn tỉnh",
    color: "text-purple-600 bg-purple-50 border-purple-200",
  },
  {
    title: "Menu & Cấu hình Phân hệ",
    description: "Cấu hình cây điều hướng, quyền hiển thị menu và các tham số vận hành trên Cổng Quản trị",
    href: "/services/admin/menus",
    icon: Menu,
    badge: "Hệ thống",
    color: "text-slate-600 bg-slate-50 border-slate-200",
  },
];

export function AdminDashboardClient() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8 animate-fade-in w-full max-w-7xl mx-auto min-w-0">
      {/* 1. Header Trang Tổng Quan Quản Trị */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-5 min-w-0">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 mr-1 inline" /> Quản Trị Trung Tâm
            </Badge>
            <h1 className="text-2xl font-bold tracking-tight text-foreground truncate min-w-0">
              Tổng Quan Quản Trị Hệ Thống
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Trung tâm điều hành tổ chức, định biên vị trí việc làm (VTVL), tài khoản cán bộ và chính sách an toàn bảo mật PBAC
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link href="/services/reports">
            <Button variant="outline" size="sm" className="h-8 text-xs font-semibold gap-1.5 border-primary/30 text-primary hover:bg-primary/5">
              <Layers className="w-3.5 h-3.5" />
              Trung tâm Báo cáo
            </Button>
          </Link>
          <Link href="/services/admin/settings">
            <Button size="sm" className="h-8 text-xs font-semibold gap-1.5 shadow-xs">
              <Settings className="w-3.5 h-3.5" />
              Cài đặt Hệ thống
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Thẻ Thống Kê Điều Hành Nhanh */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 min-w-0">
        <Link href="/services/admin/organization" className="min-w-0">
          <Card className="p-4 border shadow-2xs hover:shadow-sm hover:border-primary/40 transition-all cursor-pointer rounded-xl bg-card min-w-0">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 min-w-0">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Cơ cấu Tổ chức</p>
                <h3 className="text-xl font-bold text-foreground">Định biên VTVL</h3>
                <p className="text-[11px] text-primary font-medium mt-1">Phân cấp Ban/Phòng/Đơn vị &rarr;</p>
              </div>
              <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0 border border-blue-200">
                <Building2 className="h-5 w-5" />
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/services/admin/users" className="min-w-0">
          <Card className="p-4 border shadow-2xs hover:shadow-sm hover:border-primary/40 transition-all cursor-pointer rounded-xl bg-card min-w-0">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 min-w-0">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Cán bộ & Người dùng</p>
                <h3 className="text-xl font-bold text-foreground">Tài khoản Hệ thống</h3>
                <p className="text-[11px] text-emerald-600 font-medium mt-1">Xác thực & Gán VTVL &rarr;</p>
              </div>
              <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0 border border-emerald-200">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/services/admin/policies" className="min-w-0">
          <Card className="p-4 border shadow-2xs hover:shadow-sm hover:border-primary/40 transition-all cursor-pointer rounded-xl bg-card min-w-0">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 min-w-0">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">An toàn Thông tin</p>
                <h3 className="text-xl font-bold text-foreground">Phân quyền PBAC</h3>
                <p className="text-[11px] text-indigo-600 font-medium mt-1">Chính sách & Phạm vi &rarr;</p>
              </div>
              <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0 border border-indigo-200">
                <Shield className="h-5 w-5" />
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/services/admin/unit-job-templates" className="min-w-0">
          <Card className="p-4 border shadow-2xs hover:shadow-sm hover:border-primary/40 transition-all cursor-pointer rounded-xl bg-card min-w-0">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 min-w-0">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Tiêu chuẩn Vị trí</p>
                <h3 className="text-xl font-bold text-foreground">Khung Mẫu VTVL</h3>
                <p className="text-[11px] text-amber-600 font-medium mt-1">Danh mục chức danh &rarr;</p>
              </div>
              <div className="h-10 w-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0 border border-amber-200">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* 3. Khối Báo Cáo Điều Hành Thụ Hưởng từ Report Service */}
      <div className="space-y-5 min-w-0">
        <EmbeddedReportWidget
          reportIdOrCode="REP_BTCTU_SOP_KPI"
          title="Báo cáo Xếp loại & Đánh giá Cán bộ Ban Tổ chức Tỉnh ủy"
          description="Thống kê cơ cấu xếp loại và tiến độ đánh giá cán bộ các cơ quan Đảng, Sở Ban Ngành tỉnh Đắk Lắk"
          columns={2}
          chartHeight={240}
        />

        <EmbeddedReportWidget
          reportIdOrCode="REP_HRM_TASKS"
          title="Báo cáo Tổng hợp Nhiệm vụ & Công việc Toàn Tỉnh"
          description="Biểu đồ tiến độ giao việc và xử lý nhiệm vụ các cơ quan, đơn vị đồng bộ từ Report Service"
          columns={2}
          chartHeight={240}
          defaultCollapsed={true}
        />
      </div>

      {/* 4. Lưới Phân Hệ Quản Trị Chi Tiết */}
      <div className="space-y-3 min-w-0 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">
            Danh mục Chức năng Quản trị
          </h2>
          <span className="text-xs text-muted-foreground">
            {ADMIN_QUICK_LINKS.length} phân hệ quản trị
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-w-0">
          {ADMIN_QUICK_LINKS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link key={idx} href={item.href} className="group min-w-0">
                <Card className="h-full p-4 border rounded-xl bg-card shadow-2xs hover:shadow-sm hover:border-primary/40 transition-all flex flex-col justify-between min-w-0">
                  <div className="space-y-2.5 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className={`p-2.5 rounded-lg border ${item.color} shrink-0`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <Badge variant="secondary" className="text-[10px] font-semibold px-2 py-0.5">
                        {item.badge}
                      </Badge>
                    </div>

                    <div className="space-y-1 min-w-0">
                      <CardTitle className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
                        {item.title}
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {item.description}
                      </CardDescription>
                    </div>
                  </div>

                  <div className="pt-3 border-t mt-3 flex items-center justify-between text-xs font-medium text-primary">
                    <span>Truy cập quản trị</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
