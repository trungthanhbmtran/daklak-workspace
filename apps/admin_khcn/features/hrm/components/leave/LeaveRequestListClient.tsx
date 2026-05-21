"use client";

import { useState } from "react";
import { Search, Plus, MoreVertical, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const MOCK_LEAVE_REQUESTS = [
  { id: "LR-001", empName: "Nguyễn Văn A", type: "Nghỉ phép năm", fromDate: "2026-05-25", toDate: "2026-05-26", days: 2, status: "approved" },
  { id: "LR-002", empName: "Trần Thị B", type: "Nghỉ ốm", fromDate: "2026-05-22", toDate: "2026-05-22", days: 1, status: "pending" },
  { id: "LR-003", empName: "Lê Văn C", type: "Nghỉ không lương", fromDate: "2026-06-01", toDate: "2026-06-05", days: 5, status: "rejected" },
  { id: "LR-004", empName: "Phạm Thị D", type: "Nghỉ phép năm", fromDate: "2026-05-20", toDate: "2026-05-20", days: 0.5, status: "approved" },
];

export function LeaveRequestListClient() {
  const [searchInput, setSearchInput] = useState("");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700"><CheckCircle2 className="w-3 h-3 mr-1"/> Đã duyệt</span>;
      case "pending":
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700"><Clock className="w-3 h-3 mr-1"/> Chờ duyệt</span>;
      case "rejected":
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700"><XCircle className="w-3 h-3 mr-1"/> Đã từ chối</span>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 p-6 md:p-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Nghỉ phép & Vắng mặt</h2>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý các đơn xin nghỉ phép, nghỉ ốm và vắng mặt của nhân sự.
          </p>
        </div>
        <Button className="rounded-xl bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 px-6">
          <Plus className="mr-2 h-4 w-4" /> Tạo đơn nghỉ phép
        </Button>
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
                <TableHead className="font-semibold text-slate-600">Loại nghỉ phép</TableHead>
                <TableHead className="font-semibold text-slate-600">Từ ngày</TableHead>
                <TableHead className="font-semibold text-slate-600">Đến ngày</TableHead>
                <TableHead className="font-semibold text-slate-600">Số ngày</TableHead>
                <TableHead className="font-semibold text-slate-600">Trạng thái</TableHead>
                <TableHead className="text-right font-semibold text-slate-600">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_LEAVE_REQUESTS.map((item) => (
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
                  <TableCell className="text-slate-600">{item.type}</TableCell>
                  <TableCell className="text-slate-600">{item.fromDate}</TableCell>
                  <TableCell className="text-slate-600">{item.toDate}</TableCell>
                  <TableCell className="font-medium text-slate-900">{item.days}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-900 rounded-full">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
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
