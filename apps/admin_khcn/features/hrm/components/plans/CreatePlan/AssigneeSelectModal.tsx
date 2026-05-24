import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

interface Employee {
  code: string;
  name: string;
  dept: string;
}

interface AssigneeSelectModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  departments: string[];
  fields: string[];
  employees: Employee[];
  onSelectAssignee: (code: string) => void;
}

export function AssigneeSelectModal({
  isOpen,
  onOpenChange,
  departments,
  fields,
  employees,
  onSelectAssignee,
}: AssigneeSelectModalProps) {
  const [filterDept, setFilterDept] = useState("ALL");
  const [filterField, setFilterField] = useState("ALL");

  const filteredEmployees = employees.filter(e => filterDept !== 'ALL' ? e.dept === filterDept : true);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden bg-slate-50">
        <DialogHeader className="p-6 bg-white border-b border-slate-100">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" /> Chọn Nhân sự thực hiện
          </DialogTitle>
        </DialogHeader>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-500 uppercase">Bộ lọc: Phòng ban / Đơn vị</Label>
              <Select value={filterDept} onValueChange={setFilterDept}>
                <SelectTrigger className="bg-white"><SelectValue placeholder="Tất cả phòng ban" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả phòng ban</SelectItem>
                  {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-500 uppercase">Bộ lọc: Lĩnh vực / Mảng</Label>
              <Select value={filterField} onValueChange={setFilterField}>
                <SelectTrigger className="bg-white"><SelectValue placeholder="Tất cả lĩnh vực" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả lĩnh vực</SelectItem>
                  {fields.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">Mã NV</th>
                  <th className="px-4 py-3">Họ và Tên</th>
                  <th className="px-4 py-3">Phòng ban</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.code} className="hover:bg-indigo-50/50 transition-colors group">
                    <td className="px-4 py-3 font-mono text-slate-600">{emp.code}</td>
                    <td className="px-4 py-3 font-bold text-slate-800">{emp.name}</td>
                    <td className="px-4 py-3 text-slate-600">{emp.dept}</td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        className="bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-600 hover:text-white"
                        onClick={() => onSelectAssignee(emp.code)}
                      >
                        Chọn Giao
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
