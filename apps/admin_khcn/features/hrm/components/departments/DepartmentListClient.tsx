"use client";

import { useState } from "react";
import { Search, Plus, MoreVertical, Building, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const MOCK_DEPARTMENTS = [
  { id: "PB001", name: "Ban Giám đốc", manager: "Nguyễn Văn A", headcount: 3, status: "active" },
  { id: "PB002", name: "Phòng Nhân sự", manager: "Trần Thị B", headcount: 5, status: "active" },
  { id: "PB003", name: "Phòng Kế toán", manager: "Lê Văn C", headcount: 4, status: "active" },
  { id: "PB004", name: "Phòng Kỹ thuật", manager: "Phạm Thị D", headcount: 12, status: "active" },
  { id: "PB005", name: "Phòng Kinh doanh", manager: "Hoàng Văn E", headcount: 20, status: "active" },
];

export function DepartmentListClient() {
  const [searchInput, setSearchInput] = useState("");

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 p-6 md:p-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Phòng ban & Bộ phận</h2>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý sơ đồ tổ chức, các phòng ban và đơn vị trực thuộc.
          </p>
        </div>
        <Button className="rounded-xl bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 px-6">
          <Plus className="mr-2 h-4 w-4" /> Thêm phòng ban
        </Button>
      </div>

      <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Tìm theo tên phòng ban..."
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
                <TableHead className="font-semibold text-slate-600 h-12">Tên Phòng Ban</TableHead>
                <TableHead className="font-semibold text-slate-600">Mã PB</TableHead>
                <TableHead className="font-semibold text-slate-600">Trưởng phòng</TableHead>
                <TableHead className="font-semibold text-slate-600 text-center">Số lượng nhân sự</TableHead>
                <TableHead className="font-semibold text-slate-600 text-center">Trạng thái</TableHead>
                <TableHead className="text-right font-semibold text-slate-600">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_DEPARTMENTS.map((item) => (
                <TableRow key={item.id} className="border-slate-100 hover:bg-slate-50/80 transition-colors group">
                  <TableCell className="py-4 font-medium text-slate-900">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center mr-3 border border-blue-100">
                        <Building className="h-4 w-4" />
                      </div>
                      {item.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-500">{item.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-7 w-7 border border-slate-100">
                        <AvatarFallback className="bg-slate-100 text-slate-700 font-medium text-xs">
                          {item.manager.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-slate-700 text-sm">{item.manager}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="inline-flex items-center justify-center bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
                      <Users className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                      <span className="font-medium text-slate-700 text-sm">{item.headcount}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                      Hoạt động
                    </span>
                  </TableCell>
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
