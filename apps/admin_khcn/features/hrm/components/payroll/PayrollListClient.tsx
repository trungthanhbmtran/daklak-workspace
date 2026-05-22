"use client";

import { useState } from "react";
import { Search, Calendar, Download, MoreVertical, Banknote, CheckCircle2, Clock, Plus, Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const MOCK_PAYROLL = [
  { id: "PR-2605-01", empName: "Nguyễn Văn A", basicSalary: 15000000, allowances: 2000000, deductions: 500000, netSalary: 16500000, status: "paid" },
  { id: "PR-2605-02", empName: "Trần Thị B", basicSalary: 12000000, allowances: 1500000, deductions: 300000, netSalary: 13200000, status: "pending" },
  { id: "PR-2605-03", empName: "Lê Văn C", basicSalary: 18000000, allowances: 3000000, deductions: 1000000, netSalary: 20000000, status: "paid" },
  { id: "PR-2605-04", empName: "Phạm Thị D", basicSalary: 20000000, allowances: 2500000, deductions: 500000, netSalary: 22000000, status: "pending" },
];

export function PayrollListClient() {
  const [searchInput, setSearchInput] = useState("");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700"><CheckCircle2 className="w-3 h-3 mr-1"/> Đã thanh toán</span>;
      case "pending":
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700"><Clock className="w-3 h-3 mr-1"/> Chờ thanh toán</span>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 p-6 md:p-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Bảng lương (Payroll)</h2>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý bảng lương định kỳ, phụ cấp và các khoản khấu trừ.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/services/hrm/payroll/create">
            <Button className="rounded-xl bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 px-6">
              <Plus className="mr-2 h-4 w-4" /> Thêm bảng lương
            </Button>
          </Link>
          <Button variant="outline" className="rounded-xl">
            <Calendar className="mr-2 h-4 w-4" /> Tháng 5/2026
          </Button>
          <Button variant="outline" className="rounded-xl">
            <Download className="mr-2 h-4 w-4" /> Tải bảng lương (Excel)
          </Button>
        </div>
      </div>

      <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Tìm theo tên nhân viên..."
              className="pl-10 h-11 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-blue-500"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 border-slate-100">
                <TableHead className="font-semibold text-slate-600 h-12">Nhân viên</TableHead>
                <TableHead className="font-semibold text-slate-600 text-right">Lương cơ bản</TableHead>
                <TableHead className="font-semibold text-slate-600 text-right">Phụ cấp</TableHead>
                <TableHead className="font-semibold text-slate-600 text-right">Khấu trừ</TableHead>
                <TableHead className="font-semibold text-slate-600 text-right">Thực lĩnh</TableHead>
                <TableHead className="font-semibold text-slate-600 text-center">Trạng thái</TableHead>
                <TableHead className="text-right font-semibold text-slate-600">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_PAYROLL.map((item) => (
                <TableRow key={item.id} className="border-slate-100 hover:bg-slate-50/80 transition-colors group">
                  <TableCell className="py-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-9 w-9 border border-slate-100">
                        <AvatarFallback className="bg-blue-50 text-blue-700 font-medium text-sm">
                          {item.empName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="font-medium text-slate-900">{item.empName}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-slate-600 font-medium">
                    {formatCurrency(item.basicSalary)}
                  </TableCell>
                  <TableCell className="text-right text-emerald-600 font-medium">
                    +{formatCurrency(item.allowances)}
                  </TableCell>
                  <TableCell className="text-right text-red-600 font-medium">
                    -{formatCurrency(item.deductions)}
                  </TableCell>
                  <TableCell className="text-right font-bold text-slate-900 text-base">
                    {formatCurrency(item.netSalary)}
                  </TableCell>
                  <TableCell className="text-center">{getStatusBadge(item.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full" title="Xem chi tiết">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-full" title="Chỉnh sửa">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full" title="Xóa">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
