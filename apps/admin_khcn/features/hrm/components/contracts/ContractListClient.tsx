"use client";

import { useState } from "react";
import { Search, Plus, MoreVertical, FileText, CheckCircle2, AlertCircle, Clock, Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const MOCK_CONTRACTS = [
  { id: "HD-2026-001", empName: "Nguyễn Văn A", type: "Không xác định thời hạn", startDate: "2024-01-01", endDate: null, status: "active" },
  { id: "HD-2026-002", empName: "Trần Thị B", type: "Xác định thời hạn 1 năm", startDate: "2025-06-01", endDate: "2026-05-31", status: "expiring" },
  { id: "HD-2026-003", empName: "Lê Văn C", type: "Thử việc 2 tháng", startDate: "2026-04-01", endDate: "2026-05-31", status: "active" },
  { id: "HD-2026-004", empName: "Phạm Thị D", type: "Xác định thời hạn 3 năm", startDate: "2022-01-01", endDate: "2024-12-31", status: "expired" },
];

export function ContractListClient() {
  const [searchInput, setSearchInput] = useState("");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700"><CheckCircle2 className="w-3 h-3 mr-1"/> Có hiệu lực</span>;
      case "expiring":
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700"><Clock className="w-3 h-3 mr-1"/> Sắp hết hạn</span>;
      case "expired":
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700"><AlertCircle className="w-3 h-3 mr-1"/> Đã hết hạn</span>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 p-6 md:p-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Quản lý hợp đồng</h2>
          <p className="text-sm text-slate-500 mt-1">
            Theo dõi và quản lý hợp đồng lao động của nhân sự.
          </p>
        </div>
        <Link href="/services/hrm/contracts/create">
          <Button className="rounded-xl bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 px-6">
            <Plus className="mr-2 h-4 w-4" /> Thêm hợp đồng
          </Button>
        </Link>
      </div>

      <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Tìm theo tên nhân viên, số hợp đồng..."
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
                <TableHead className="font-semibold text-slate-600 h-12">Số Hợp Đồng</TableHead>
                <TableHead className="font-semibold text-slate-600">Nhân viên</TableHead>
                <TableHead className="font-semibold text-slate-600">Loại hợp đồng</TableHead>
                <TableHead className="font-semibold text-slate-600">Ngày bắt đầu</TableHead>
                <TableHead className="font-semibold text-slate-600">Ngày kết thúc</TableHead>
                <TableHead className="font-semibold text-slate-600">Trạng thái</TableHead>
                <TableHead className="text-right font-semibold text-slate-600">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_CONTRACTS.map((item) => (
                <TableRow key={item.id} className="border-slate-100 hover:bg-slate-50/80 transition-colors group">
                  <TableCell className="font-medium text-blue-600 py-4">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-slate-400" />
                      {item.id}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8 border border-slate-100">
                        <AvatarFallback className="bg-blue-50 text-blue-700 font-medium text-xs">
                          {item.empName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-slate-900">{item.empName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600">{item.type}</TableCell>
                  <TableCell className="text-slate-600">{item.startDate}</TableCell>
                  <TableCell className="text-slate-600">{item.endDate || "—"}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
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
