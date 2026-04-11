"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useImageUpload } from "@/features/posts/hooks/useImageUpload";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Save, User, Briefcase, Camera,
  Loader2, Mail, Phone, CreditCard, Calendar,
  Building2, Search, MapPin, Check, ChevronRight, Hash, AlertCircle
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { hrmApi, hrmKeys } from "@/features/hrm";
import { organizationApi } from "@/features/system-admin/organization/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

// Hàm xử lý Path để phân biệt các đơn vị trùng tên
function flattenUnits(nodes: any[], acc: any[] = [], parentPath: string = ""): any[] {
  for (const node of nodes || []) {
    const currentPath = parentPath ? `${parentPath} / ${node.name}` : node.name;
    if (node.id != null) {
      acc.push({ id: node.id, name: node.name, fullPath: currentPath, code: node.code });
    }
    flattenUnits(node.children ?? [], acc, currentPath);
  }
  return acc;
}

export default function CreateEmployeePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [form, setForm] = useState({
    firstname: "", lastname: "", employeeCode: "", email: "",
    phone: "", identityCard: "", departmentId: "", jobTitleId: "",
    startDate: new Date().toISOString().slice(0, 10), birthday: "",
    avatar: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isUploading, previewUrl, handleImageUpload } = useImageUpload();

  useEffect(() => {
    if (previewUrl) {
      setForm(prev => ({ ...prev, avatar: previewUrl }));
    }
  }, [previewUrl]);

  const { data: treeNodes } = useQuery({
    queryKey: ["organizations", "tree"],
    queryFn: () => organizationApi.getTree(),
  });

  const units = useMemo(() => flattenUnits(Array.isArray(treeNodes) ? treeNodes : []), [treeNodes]);

  const { data: jobTitlesRes, isLoading: isLoadingJobs } = useQuery({
    queryKey: ["organizations", "job-titles", form.departmentId],
    queryFn: () => organizationApi.getJobTitles(form.departmentId ? parseInt(form.departmentId, 10) : undefined),
    enabled: !!form.departmentId,
  });

  const selectedUnit = units.find(u => u.id.toString() === form.departmentId);
  const jobTitles = jobTitlesRes?.items ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.departmentId || !form.jobTitleId) {
      toast.error("Vui lòng chọn Đơn vị và Chức danh");
      return;
    }
    setSubmitting(true);
    try {
      await hrmApi.create({ ...form, departmentId: parseInt(form.departmentId), jobTitleId: parseInt(form.jobTitleId) });
      queryClient.invalidateQueries({ queryKey: hrmKeys.employees() });
      toast.success("Thêm nhân sự thành công");
      router.push("/services/hrm/employees");
    } catch {
      toast.error("Lỗi khi lưu dữ liệu");
    } finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] p-6 md:p-10 text-slate-900">
      <form onSubmit={handleSubmit} className="max-w-[1200px] mx-auto space-y-6">

        {/* HEADER - Tương phản mạnh */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <Button type="button" variant="outline" size="icon" onClick={() => router.back()} className="rounded-full border-slate-300">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">Tạo hồ sơ nhân sự</h2>
              <p className="text-sm text-slate-500 font-medium italic">Thiết lập vị trí và thông tin định danh hệ thống iDesk</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button type="button" variant="ghost" onClick={() => router.back()} className="font-bold text-slate-600">Hủy</Button>
            <Button type="submit" disabled={submitting} className="rounded-xl bg-blue-700 hover:bg-blue-800 px-8 h-11 font-bold shadow-lg shadow-blue-200">
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              LƯU HỒ SƠ
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* CỘT PHẢI: CHỌN ĐƠN VỊ (Đưa lên trước hoặc bên trái để ưu tiên) */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="rounded-2xl border-slate-300 shadow-md overflow-hidden bg-white ring-1 ring-slate-200">
              <CardHeader className="border-b border-slate-100 bg-slate-50">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-700" />
                  <CardTitle className="text-lg font-bold">Vị trí công tác</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">

                {/* Search & List */}
                <div className="space-y-3">
                  <Label className="font-black text-slate-700 text-xs uppercase tracking-wider">1. Tìm đơn vị (Sở/Phòng/Ban)</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Gõ tên đơn vị cần tìm..."
                      className="pl-10 h-11 border-slate-300 focus:ring-blue-600"
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
                    <div className="max-h-[300px] overflow-y-auto p-1 custom-scrollbar">
                      {units.filter(u => u.fullPath.toLowerCase().includes(searchTerm.toLowerCase())).map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => setForm({ ...form, departmentId: u.id.toString(), jobTitleId: "" })}
                          className={cn(
                            "w-full text-left p-3 rounded-lg mb-1 transition-all border border-transparent",
                            form.departmentId === u.id.toString()
                              ? "bg-blue-700 text-white border-blue-800 shadow-md"
                              : "hover:bg-white hover:border-slate-200 text-slate-700"
                          )}
                        >
                          <div className="font-bold text-[13px]">{u.name}</div>
                          <div className={cn("text-[10px] truncate font-medium", form.departmentId === u.id.toString() ? "text-blue-100" : "text-slate-400")}>
                            {u.fullPath}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Confirm Path - Độ tương phản cực cao */}
                {selectedUnit && (
                  <div className="bg-slate-900 rounded-xl p-4 text-white shadow-lg border-l-4 border-blue-500 animate-in fade-in zoom-in-95">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-600 p-1.5 rounded-lg shrink-0"><Check size={16} /></div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Đơn vị đã chọn:</p>
                        <p className="text-sm font-bold leading-snug">{selectedUnit.fullPath}</p>
                        <p className="text-[10px] text-slate-400 font-mono italic">Mã định danh: {selectedUnit.code || 'None'}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="font-black text-slate-700 text-xs uppercase tracking-wider">2. Chức danh công việc</Label>
                  <div className="relative">
                    <select
                      className="w-full h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold focus:ring-2 focus:ring-blue-600 outline-none appearance-none disabled:bg-slate-100"
                      value={form.jobTitleId}
                      onChange={(e) => setForm({ ...form, jobTitleId: e.target.value })}
                      disabled={!form.departmentId}
                    >
                      <option value="">-- Chọn chức danh --</option>
                      {jobTitles.map((j: any) => <option key={j.id} value={j.id}>{j.name}</option>)}
                    </select>
                    <ChevronRight className="absolute right-4 top-3.5 h-4 w-4 text-slate-400 rotate-90" />
                    {isLoadingJobs && <Loader2 className="absolute right-10 top-3.5 h-4 w-4 animate-spin text-blue-600" />}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CỘT TRÁI: THÔNG TIN CÁ NHÂN */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="rounded-2xl border-slate-300 shadow-md bg-white ring-1 ring-slate-200">
              <CardHeader className="border-b border-slate-100 bg-slate-50">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-700" />
                  <CardTitle className="text-lg font-bold">Thông tin cá nhân & Tài khoản</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Photo & Basic info */}
                  <div className="col-span-full flex items-center gap-6 pb-4 border-b border-slate-100 mb-2">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="h-24 w-24 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-600 transition-all cursor-pointer overflow-hidden relative group"
                    >
                      {isUploading ? (
                        <div className="flex flex-col items-center gap-1">
                          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                          <span className="text-[10px] font-bold text-blue-600 uppercase">Uploading</span>
                        </div>
                      ) : form.avatar ? (
                        <>
                          <img src={form.avatar} alt="Avatar" className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera size={20} className="text-white" />
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <Camera size={24} />
                          <span className="text-[10px] font-bold uppercase">Ảnh thẻ</span>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="font-bold text-slate-700 text-sm">Họ và đệm *</Label>
                        <Input value={form.firstname} onChange={e => setForm({ ...form, firstname: e.target.value })} className="border-slate-300 font-medium" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="font-bold text-slate-700 text-sm">Tên *</Label>
                        <Input value={form.lastname} onChange={e => setForm({ ...form, lastname: e.target.value })} className="border-slate-300 font-medium" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="font-bold text-slate-700 text-sm flex items-center gap-2"><CreditCard size={14} /> CCCD/Định danh</Label>
                    <Input value={form.identityCard} onChange={e => setForm({ ...form, identityCard: e.target.value })} className="border-slate-300" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-bold text-slate-700 text-sm flex items-center gap-2"><Calendar size={14} /> Ngày sinh</Label>
                    <Input type="date" value={form.birthday} onChange={e => setForm({ ...form, birthday: e.target.value })} className="border-slate-300" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-bold text-slate-700 text-sm flex items-center gap-2"><Mail size={14} /> Email liên hệ</Label>
                    <Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="border-slate-300" placeholder="user@daklak.gov.vn" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-bold text-slate-700 text-sm flex items-center gap-2"><Phone size={14} /> Số điện thoại</Label>
                    <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="border-slate-300" />
                  </div>

                  <Separator className="col-span-full my-2" />

                  <div className="space-y-1.5">
                    <Label className="font-bold text-slate-700 text-sm flex items-center gap-2"><Hash size={14} /> Mã nhân viên</Label>
                    <Input value={form.employeeCode} onChange={e => setForm({ ...form, employeeCode: e.target.value })} className="border-slate-300 font-mono text-sm uppercase" placeholder="HỆ THỐNG TỰ TẠO" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-bold text-slate-700 text-sm flex items-center gap-2"><Calendar size={14} /> Ngày gia nhập</Label>
                    <Input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} className="border-slate-300" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="p-4 rounded-xl bg-slate-900 text-white flex gap-4 items-center shadow-lg ring-1 ring-slate-800">
              <AlertCircle size={24} className="text-blue-500 shrink-0" />
              <p className="text-xs font-medium leading-relaxed">
                Hồ sơ nhân sự sẽ được liên kết trực tiếp với <strong>Trục liên thông văn bản (LGSP)</strong> của tỉnh. Vui lòng kiểm tra kỹ đơn vị công tác trước khi Lưu.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}