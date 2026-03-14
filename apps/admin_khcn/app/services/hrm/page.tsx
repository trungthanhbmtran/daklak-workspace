"use client";

import Link from "next/link";
import { Users, UserPlus, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useHrmEmployeesList } from "@/features/hrm";

export default function HrmDashboardPage() {
  const { data: listRes, isLoading } = useHrmEmployeesList({ page: 1, pageSize: 1 });
  const total = listRes?.meta?.pagination?.total ?? 0;

  return (
    <div className="flex flex-col h-full min-h-screen bg-slate-50/50 p-6 md:p-10 space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Quản lý Nhân sự 👋</h2>
        <p className="text-slate-500 mt-2 text-base">
          Tổng quan nhân sự từ hệ thống HRM (dữ liệu qua API gateway).
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="rounded-2xl border-slate-200/60 shadow-sm overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Tổng nhân sự hiện tại</p>
                {isLoading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600 mt-2" />
                ) : (
                  <h3 className="text-3xl font-bold text-slate-900 mt-2">{total}</h3>
                )}
              </div>
              <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-7 w-7 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Phân hệ chức năng</h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="group rounded-2xl border-slate-200/60 hover:shadow-md transition-all duration-300 hover:border-blue-200">
            <CardContent className="p-6 flex flex-col h-full">
              <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="text-xl font-semibold text-slate-900 mb-2">Hồ sơ nhân viên</h4>
              <p className="text-slate-500 text-sm flex-1 mb-6 leading-relaxed">
                Quản lý thông tin cá nhân, phòng ban, chức danh. Dữ liệu từ API gateway (hrm-service).
              </p>
              <Link href="/services/hrm/employees">
                <Button className="w-full bg-slate-900 hover:bg-slate-800 rounded-xl group-hover:gap-4 transition-all">
                  Mở phân hệ <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="group rounded-2xl border-slate-200/60 hover:shadow-md transition-all duration-300 hover:border-blue-200">
            <CardContent className="p-6 flex flex-col h-full">
              <div className="h-12 w-12 rounded-xl bg-violet-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <UserPlus className="h-6 w-6 text-violet-600" />
              </div>
              <h4 className="text-xl font-semibold text-slate-900 mb-2">Tạo tài khoản từ nhân viên</h4>
              <p className="text-slate-500 text-sm flex-1 mb-6 leading-relaxed">
                Tra cứu HRM theo CCCD/mã NV và gán vào tài khoản đăng nhập hệ thống.
              </p>
              <Link href="/services/admin/users">
                <Button variant="outline" className="w-full rounded-xl border-slate-200">
                  Đến Quản trị người dùng <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
