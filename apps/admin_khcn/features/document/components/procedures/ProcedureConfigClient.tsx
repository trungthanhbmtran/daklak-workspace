"use client";

import React, { useState } from "react";
import { Plus, Settings2, FileText, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ProcedureConfigClient() {
  const [procedures, setProcedures] = useState([
    {
      id: "proc-1",
      name: "Đăng ký đề tài Khoa học công nghệ cấp Tỉnh",
      domain: "Khoa học công nghệ",
      components: [
        { id: "comp-1", name: "Đơn đăng ký đề tài", isRequired: true },
        { id: "comp-2", name: "Thuyết minh đề tài nghiên cứu", isRequired: true },
        { id: "comp-3", name: "Bản sao CCCD chủ nhiệm đề tài", isRequired: true },
        { id: "comp-4", name: "Giấy tờ chứng minh năng lực (tùy chọn)", isRequired: false },
      ]
    },
    {
      id: "proc-2",
      name: "Cấp giấy phép hoạt động đo lường",
      domain: "Đo lường, Chất lượng",
      components: [
        { id: "comp-5", name: "Đơn đề nghị cấp giấy phép", isRequired: true },
        { id: "comp-6", name: "Sơ đồ mặt bằng cơ sở", isRequired: true },
      ]
    }
  ]);

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Cấu hình Thủ tục hành chính</h2>
          <p className="text-slate-500 mt-2">Quản lý danh sách các thủ tục và biểu mẫu/thành phần hồ sơ yêu cầu.</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="mr-2 h-4 w-4" /> Thêm TTHC mới
        </Button>
      </div>

      <div className="grid gap-6">
        {procedures.map((proc) => (
          <Card key={proc.id} className="border-slate-200 shadow-sm hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-xl font-bold text-slate-800">{proc.name}</CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-indigo-600 border-indigo-200 bg-indigo-50">
                    {proc.domain}
                  </Badge>
                  <span className="text-sm text-slate-500">{proc.components.length} thành phần hồ sơ</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="text-slate-500 hover:text-indigo-600">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-slate-500 hover:text-rose-600">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mt-4 bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold text-slate-700 flex items-center">
                    <FileText className="mr-2 h-4 w-4 text-slate-400" />
                    Thành phần hồ sơ yêu cầu
                  </h4>
                  <Button variant="outline" size="sm" className="h-8 text-xs">
                    <Plus className="mr-1 h-3 w-3" /> Thêm thành phần
                  </Button>
                </div>
                <ul className="space-y-2">
                  {proc.components.map((comp) => (
                    <li key={comp.id} className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200">
                      <span className="text-sm font-medium text-slate-700">{comp.name}</span>
                      {comp.isRequired ? (
                        <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100">Bắt buộc</Badge>
                      ) : (
                        <Badge variant="outline" className="text-slate-500">Tùy chọn</Badge>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
