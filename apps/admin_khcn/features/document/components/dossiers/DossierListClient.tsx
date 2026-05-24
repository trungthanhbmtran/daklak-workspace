"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FolderOpen, Search, Filter, Plus, Calendar, Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function DossierListClient() {
  const [dossiers, setDossiers] = useState([
    {
      id: "HS-2023-001",
      procedureName: "Đăng ký đề tài Khoa học công nghệ cấp Tỉnh",
      applicant: "Nguyễn Văn A (Công ty TNHH ABC)",
      status: "PROCESSING",
      submitDate: "2023-10-15",
      deadline: "2023-11-15",
      completeness: 3, // 3/4 tài liệu
      totalRequired: 4
    },
    {
      id: "HS-2023-002",
      procedureName: "Cấp giấy phép hoạt động đo lường",
      applicant: "Trần Thị B",
      status: "WAITING_FOR_DOCS",
      submitDate: "2023-10-14",
      deadline: "2023-10-24",
      completeness: 1,
      totalRequired: 2
    },
    {
      id: "HS-2023-003",
      procedureName: "Đăng ký đề tài Khoa học công nghệ cấp Tỉnh",
      applicant: "Viện Nghiên cứu Nông nghiệp",
      status: "COMPLETED",
      submitDate: "2023-09-01",
      deadline: "2023-10-01",
      completeness: 4,
      totalRequired: 4
    }
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PROCESSING': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Đang xử lý</Badge>;
      case 'WAITING_FOR_DOCS': return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Chờ bổ sung</Badge>;
      case 'COMPLETED': return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Hoàn thành</Badge>;
      case 'REJECTED': return <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100">Từ chối</Badge>;
      default: return <Badge variant="outline">Mới tiếp nhận</Badge>;
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Quản lý Hồ sơ TTHC</h2>
          <p className="text-slate-500 mt-2">Theo dõi tiến độ, tiếp nhận và yêu cầu bổ sung thành phần hồ sơ.</p>
        </div>
        <Link href="/services/documents/dossiers/create">
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="mr-2 h-4 w-4" /> Tiếp nhận hồ sơ mới
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Tìm mã hồ sơ, người nộp..." className="pl-10 bg-slate-50 border-none" />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="rounded-full"><Filter className="h-4 w-4 mr-2"/> Lọc Trạng thái</Button>
          <Button variant="secondary" size="sm" className="rounded-full bg-slate-100">Đang xử lý</Button>
        </div>
      </div>

      <div className="grid gap-4">
        {dossiers.map((hs) => {
          const progress = Math.round((hs.completeness / hs.totalRequired) * 100);
          return (
            <Card key={hs.id} className="group border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer">
              <CardContent className="p-0">
                <div className="p-5 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                  
                  {/* Info Left */}
                  <div className="flex gap-4 items-start flex-1">
                    <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                      <FolderOpen className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-mono text-sm font-semibold text-slate-500">{hs.id}</span>
                        {getStatusBadge(hs.status)}
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 leading-tight mb-2 group-hover:text-indigo-700 transition-colors">
                        {hs.procedureName}
                      </h3>
                      <p className="text-sm text-slate-600">Người nộp: <span className="font-medium text-slate-800">{hs.applicant}</span></p>
                    </div>
                  </div>

                  {/* Info Right */}
                  <div className="flex flex-col gap-3 min-w-[200px]">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Thành phần hồ sơ:</span>
                      <span className="font-semibold text-slate-700">{hs.completeness}/{hs.totalRequired}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${progress === 100 ? 'bg-emerald-500' : progress > 50 ? 'bg-blue-500' : 'bg-amber-500'}`} 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex gap-4 text-xs text-slate-500 mt-2">
                      <div className="flex items-center gap-1"><Calendar className="h-3 w-3"/> Nộp: {hs.submitDate}</div>
                      <div className="flex items-center gap-1 text-rose-500 font-medium"><Clock className="h-3 w-3"/> Hạn: {hs.deadline}</div>
                    </div>
                  </div>

                  <div className="hidden md:flex items-center justify-center pl-4 border-l border-slate-100">
                    <Link href={`/services/documents/dossiers/${hs.id}`}>
                      <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 rounded-full">
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  );
}
