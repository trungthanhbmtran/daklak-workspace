"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FolderOpen, Search, Filter, Plus,
  Calendar, Clock, ChevronRight, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { CreateDossierModal } from "./CreateDossierModal";
import { useDossierList } from "../../hooks/useDocumentFormData";
import { DossierStatusBadge } from "@/components/shared/badges/DocumentBadges";

export function DossierListClient() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // React Query — loại bỏ useEffect + apiClient trực tiếp
  const { data: dossiers = [], isLoading, refetch } = useDossierList();



  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Quản lý Hồ sơ TTHC</h2>
          <p className="text-slate-500 mt-2">Theo dõi tiến độ, tiếp nhận và yêu cầu bổ sung thành phần hồ sơ.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="mr-2 h-4 w-4" /> Tiếp nhận hồ sơ mới
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Tìm mã hồ sơ, người nộp..." className="pl-10 bg-slate-50 border-none" />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="rounded-full">
            <Filter className="h-4 w-4 mr-2" /> Lọc Trạng thái
          </Button>
          <Button variant="secondary" size="sm" className="rounded-full bg-slate-100">Đang xử lý</Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="grid gap-4">
          {dossiers.length === 0 ? (
            <p className="text-center text-slate-500 py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300">
              Chưa có hồ sơ nào được tiếp nhận.
            </p>
          ) : dossiers.map((hs: any) => {
            const completeness = hs.completeness || 0;
            const totalRequired = hs.totalRequired || 1;
            const progress = totalRequired > 0 ? Math.round((completeness / totalRequired) * 100) : 0;

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
                          <span className="font-mono text-sm font-semibold text-slate-500">{hs.code}</span>
                          <DossierStatusBadge code={hs.status} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 leading-tight mb-2 group-hover:text-indigo-700 transition-colors">
                          {hs.procedureName || "Hồ sơ chưa phân loại"}
                        </h3>
                        <p className="text-sm text-slate-600">
                          Người nộp: <span className="font-medium text-slate-800">{hs.senderName}</span>
                        </p>
                      </div>
                    </div>

                    {/* Info Right */}
                    <div className="flex flex-col gap-3 min-w-[200px]">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500">Tiến độ nộp:</span>
                        <span className="font-semibold text-slate-700">{progress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${progress === 100 ? "bg-emerald-500" : progress > 50 ? "bg-blue-500" : "bg-amber-500"}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      <div className="flex gap-4 text-xs text-slate-500 mt-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> Nộp: {new Date(hs.receiveDate || hs.createdAt).toLocaleDateString("vi-VN")}
                        </div>
                        <div className="flex items-center gap-1 text-rose-500 font-medium">
                          <Clock className="h-3 w-3" /> Hạn: {new Date(hs.dueDate || hs.createdAt).toLocaleDateString("vi-VN")}
                        </div>
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
            );
          })}
        </div>
      )}

      {/* CreateDossierModal tự invalidate cache sau khi tạo — không cần fetchDossiers callback */}
      <CreateDossierModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
