"use client";

import { useState } from "react";
import { Search, Calendar, Download, MoreVertical, CheckCircle2, Clock, AlertCircle, Plus, Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const MOCK_TIMESHEETS = [
  { id: 1, empName: "Nguyễn Văn A", empCode: "NV001", date: "2026-05-21", checkIn: "07:55", checkOut: "17:05", totalHours: 8, status: "ontime", avatar: "" },
  { id: 2, empName: "Trần Thị B", empCode: "NV002", date: "2026-05-21", checkIn: "08:15", checkOut: "17:00", totalHours: 7.75, status: "late", avatar: "" },
  { id: 3, empName: "Lê Văn C", empCode: "NV003", date: "2026-05-21", checkIn: "07:50", checkOut: "16:00", totalHours: 7, status: "early_leave", avatar: "" },
  { id: 4, empName: "Phạm Thị D", empCode: "NV004", date: "2026-05-21", checkIn: null, checkOut: null, totalHours: 0, status: "absent", avatar: "" },
  { id: 5, empName: "Hoàng Văn E", empCode: "NV005", date: "2026-05-21", checkIn: "08:00", checkOut: "17:30", totalHours: 8.5, status: "ontime", avatar: "" },
];

export function TimesheetClient() {
  const [searchInput, setSearchInput] = useState("");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ontime":
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700"><CheckCircle2 className="w-3 h-3 mr-1"/> Đúng giờ</span>;
      case "late":
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700"><Clock className="w-3 h-3 mr-1"/> Đi muộn</span>;
      case "early_leave":
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700"><Clock className="w-3 h-3 mr-1"/> Về sớm</span>;
      case "absent":
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700"><AlertCircle className="w-3 h-3 mr-1"/> Vắng mặt</span>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 p-6 md:p-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Quản lý chấm công</h2>
          <p className="text-sm text-slate-500 mt-1">
            Theo dõi giờ giấc làm việc và trạng thái điểm danh của nhân sự.
          </p>
        </div>
        <div className="flex gap-2">
          <Button className="rounded-xl bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" /> Thêm chấm công
          </Button>
          <Button variant="outline" className="rounded-xl">
            <Calendar className="mr-2 h-4 w-4" /> Tháng 5/2026
          </Button>
          <Button variant="outline" className="rounded-xl">
            <Download className="mr-2 h-4 w-4" /> Xuất báo cáo
          </Button>
        </div>
      </div>

      <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Tìm theo tên hoặc mã nhân viên..."
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
                <TableHead className="font-semibold text-slate-600">Ngày</TableHead>
                <TableHead className="font-semibold text-slate-600">Check-in</TableHead>
                <TableHead className="font-semibold text-slate-600">Check-out</TableHead>
                <TableHead className="font-semibold text-slate-600">Tổng giờ</TableHead>
                <TableHead className="font-semibold text-slate-600">Trạng thái</TableHead>
                <TableHead className="text-right font-semibold text-slate-600">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_TIMESHEETS.map((item) => (
                <TableRow key={item.id} className="border-slate-100 hover:bg-slate-50/80 transition-colors group">
                  <TableCell className="py-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-9 w-9 border border-slate-100">
                        <AvatarFallback className="bg-blue-50 text-blue-700 font-medium">
                          {item.empName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-slate-900">{item.empName}</div>
                        <div className="text-xs text-slate-500">#{item.empCode}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600">{item.date}</TableCell>
                  <TableCell className="font-medium text-slate-700">{item.checkIn || "—"}</TableCell>
                  <TableCell className="font-medium text-slate-700">{item.checkOut || "—"}</TableCell>
                  <TableCell className="font-semibold text-slate-900">{item.totalHours}h</TableCell>
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
