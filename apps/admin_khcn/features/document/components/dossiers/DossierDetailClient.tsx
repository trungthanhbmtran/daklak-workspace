"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, AlertCircle, Upload, Search, Download, Trash2, Link as LinkIcon, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import apiClient from "@/lib/axiosInstance";
import { toast } from "sonner";

export function DossierDetailClient({ dossierId }: { dossierId: string }) {
  // Mock data
  const dossier = {
    id: dossierId,
    procedureName: "Đăng ký đề tài Khoa học công nghệ cấp Tỉnh",
    applicant: "Nguyễn Văn A",
    status: "PROCESSING",
    submitDate: "2023-10-15",
  };

  const [components, setComponents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDossierAndComponents();
  }, [dossierId]);

  const fetchDossierAndComponents = async () => {
    try {
      setLoading(true);
      const res: any = await apiClient.get(`/documents/dossiers/${dossierId}/components`);
      if (res?.data && res.data.length > 0) {
        setComponents(res.data);
      } else {
        // Fallback mock nếu chưa có data trong DB
        setComponents([
          { id: "comp-1", name: "Đơn đăng ký đề tài", isRequired: true, status: "VALID", fileUrl: "DonDangKy_Form01.pdf", source: "UPLOAD" },
          { id: "comp-2", name: "Thuyết minh đề tài nghiên cứu", isRequired: true, status: "PENDING_REVIEW", fileUrl: "ThuyetMinh_V1.pdf", source: "UPLOAD" },
          { id: "comp-3", name: "Bản sao CCCD", isRequired: true, status: "MISSING", fileUrl: null, source: null },
          { id: "comp-4", name: "Giấy chứng minh năng lực", isRequired: false, status: "VALID", fileUrl: "ChungChi.pdf", source: "CABINET" }
        ]);
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi tải thành phần hồ sơ");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadClick = () => toast.success("Gọi /admin/media/request-upload...");
  const handleCabinetClick = () => toast.success("Mở modal chọn file từ Tủ văn bản số...");

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'VALID': return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case 'MISSING': return <AlertCircle className="h-5 w-5 text-rose-500" />;
      case 'PENDING_REVIEW': return <AlertCircle className="h-5 w-5 text-amber-500" />;
      default: return <FileText className="h-5 w-5 text-slate-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'VALID': return <Badge className="bg-emerald-100 text-emerald-700">Hợp lệ</Badge>;
      case 'MISSING': return <Badge className="bg-rose-100 text-rose-700">Còn thiếu</Badge>;
      case 'PENDING_REVIEW': return <Badge className="bg-amber-100 text-amber-700">Chờ duyệt</Badge>;
      default: return <Badge variant="outline">Chưa rõ</Badge>;
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/services/documents/dossiers">
              <Button variant="ghost" size="sm" className="h-8 px-2 text-slate-500 hover:text-slate-900">
                <ArrowLeft className="mr-1 h-4 w-4" /> Quay lại
              </Button>
            </Link>
            <Badge variant="outline" className="font-mono text-indigo-700 bg-indigo-50 border-indigo-200">{dossier.id}</Badge>
            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Đang xử lý</Badge>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">{dossier.procedureName}</h2>
          <p className="text-slate-500 mt-1">Người nộp: <span className="font-medium text-slate-700">{dossier.applicant}</span> • Nộp ngày: {dossier.submitDate}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="text-rose-600 border-rose-200 hover:bg-rose-50">Yêu cầu bổ sung</Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700"><CheckCircle2 className="mr-2 h-4 w-4"/> Duyệt hồ sơ</Button>
        </div>
      </div>

      {/* Components List */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-50 border-b border-slate-100 rounded-t-xl pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-bold text-slate-800">Thành phần hồ sơ</CardTitle>
            <span className="text-sm font-medium text-slate-500">Tiến độ: 3/4 tài liệu</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {components.map((comp) => (
              <div key={comp.id} className="p-5 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between hover:bg-slate-50/50 transition-colors">
                
                <div className="flex gap-4 items-start flex-1">
                  <div className="mt-1">
                    {getStatusIcon(comp.status)}
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                      {comp.name}
                      {comp.isRequired && <span className="text-rose-500 text-sm">*</span>}
                      {getStatusBadge(comp.status)}
                    </h4>
                    {comp.fileUrl ? (
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="bg-white border border-slate-200 text-indigo-700 hover:bg-slate-100 cursor-pointer">
                          <FileText className="mr-1 h-3 w-3" /> {comp.fileUrl.split('/').pop()}
                        </Badge>
                        {comp.source === 'CABINET' && (
                          <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <LinkIcon className="h-3 w-3"/> Lấy từ Tủ văn bản
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400 mt-1 italic">Chưa có tài liệu đính kèm.</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                  {!comp.fileUrl ? (
                    <>
                      <Button onClick={handleUploadClick} variant="outline" size="sm" className="flex-1 md:flex-none border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                        <Upload className="mr-2 h-3 w-3" /> Tải lên
                      </Button>
                      <Button onClick={handleCabinetClick} variant="secondary" size="sm" className="flex-1 md:flex-none bg-emerald-50 text-emerald-700 hover:bg-emerald-100">
                        <LinkIcon className="mr-2 h-3 w-3" /> Từ Tủ VB
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-600">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-slate-400 hover:text-rose-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>

              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
