"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Save, User, Briefcase, Camera,
  Loader2, Mail, Phone, CreditCard, Calendar,
  Building2, UserCheck, Search, MapPin, Info, Check, ChevronRight
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { hrmApi, hrmKeys } from "@/features/hrm";
import { organizationApi } from "@/features/system-admin/organization/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

/**
 * Hàm làm phẳng cây đơn vị và xây dựng đường dẫn đầy đủ (Full Path)
 */
function flattenUnits(
  nodes: any[],
  acc: { id: number; name: string; fullPath: string; code?: string }[] = [],
  parentPath: string = ""
): { id: number; name: string; fullPath: string; code?: string }[] {
  for (const node of nodes || []) {
    const currentPath = parentPath ? `${parentPath} › ${node.name}` : node.name;
    if (node.id != null) {
      acc.push({
        id: node.id,
        name: node.name,
        fullPath: currentPath,
        code: node.code
      });
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
    firstname: "",
    lastname: "",
    employeeCode: "",
    email: "",
    phone: "",
    identityCard: "",
    departmentId: "",
    jobTitleId: "",
    startDate: new Date().toISOString().slice(0, 10),
    birthday: "",
  });

  // 1. Lấy dữ liệu cây tổ chức
  const { data: treeNodes } = useQuery({
    queryKey: ["organizations", "tree"],
    queryFn: () => organizationApi.getTree(),
  });

  // 2. Xử lý dữ liệu đơn vị đã làm phẳng kèm theo đường dẫn
  const units = useMemo(() => {
    return flattenUnits(Array.isArray(treeNodes) ? treeNodes : []);
  }, [treeNodes]);

  // 3. Lấy dữ liệu chức danh dựa trên đơn vị đã chọn
  const { data: jobTitlesRes, isLoading: isLoadingJobs } = useQuery({
    queryKey: ["organizations", "job-titles", form.departmentId],
    queryFn: () => organizationApi.getJobTitles(form.departmentId ? parseInt(form.departmentId, 10) : undefined),
    enabled: !!form.departmentId,
  });

  const jobTitles = jobTitlesRes?.items ?? [];
  const selectedUnit = units.find(u => u.id.toString() === form.departmentId);

  // 4. Xử lý nộp form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.departmentId || !form.jobTitleId) {
      toast.error("Vui lòng chọn chính xác Đơn vị và Chức danh.");
      return;
    }

    setSubmitting(true);
    try {
      await hrmApi.create({
        ...form,
        departmentId: parseInt(form.departmentId, 10),
        jobTitleId: parseInt(form.jobTitleId, 10),
      });
      queryClient.invalidateQueries({ queryKey: hrmKeys.employees() });
      toast.success("Hồ sơ nhân sự đã được tạo thành công.");
      router.push("/services/hrm/employees");
    } catch (err) {
      toast.error("Lỗi kết nối API. Vui lòng thử lại sau.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Action Bar (Sticky) */}
      <div className="sticky top-0 z-40 w-full border-b bg-white/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Thêm nhân sự mới</h1>
              <p className="text-[11px] font-semibold text-blue-600 uppercase">Hệ thống quản trị IOC Đắk Lắk</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => router.back()} className="rounded-xl px-6 font-semibold">Hủy</Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 px-8 shadow-lg shadow-blue-500/20"
            >
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Lưu hồ sơ
            </Button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* CỘT TRÁI: THÔNG TIN CÁ NHÂN */}
          <div className="lg:col-span-7 space-y-8">
            <Card className="border-none shadow-sm ring-1 ring-slate-200">
              <CardHeader className="border-b border-slate-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><User size={20} /></div>
                  <CardTitle className="text-lg">Thông tin cá nhân</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="flex gap-10 mb-8">
                  <div className="flex flex-col items-center gap-3 shrink-0">
                    <div className="h-28 w-28 rounded-3xl bg-slate-100 border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-all cursor-pointer group">
                      <Camera size={28} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Ảnh chân dung</span>
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700">Họ và đệm *</Label>
                      <Input
                        placeholder="VD: Nguyễn Văn"
                        value={form.firstname}
                        onChange={(e) => setForm({ ...form, firstname: e.target.value })}
                        className="rounded-xl bg-slate-50/50 h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700">Tên nhân sự *</Label>
                      <Input
                        placeholder="VD: Anh"
                        value={form.lastname}
                        onChange={(e) => setForm({ ...form, lastname: e.target.value })}
                        className="rounded-xl bg-slate-50/50 h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700 flex items-center gap-2"><CreditCard size={14} /> Số CCCD</Label>
                      <Input
                        placeholder="12 chữ số"
                        value={form.identityCard}
                        onChange={(e) => setForm({ ...form, identityCard: e.target.value })}
                        className="rounded-xl bg-slate-50/50 h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700 flex items-center gap-2"><Calendar size={14} /> Ngày sinh</Label>
                      <Input
                        type="date"
                        value={form.birthday}
                        onChange={(e) => setForm({ ...form, birthday: e.target.value })}
                        className="rounded-xl bg-slate-50/50 h-11"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700 flex items-center gap-2"><Mail size={14} /> Email liên hệ</Label>
                    <Input
                      placeholder="email@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="rounded-xl bg-slate-50/50 h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700 flex items-center gap-2"><Phone size={14} /> Số điện thoại</Label>
                    <Input
                      placeholder="09xx xxx xxx"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="rounded-xl bg-slate-50/50 h-11"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CỘT PHẢI: TỔ CHỨC & VỊ TRÍ (Thiết kế lại theo yêu cầu) */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="border-none shadow-md ring-1 ring-slate-200 overflow-hidden">
              <CardHeader className="bg-slate-900 text-white">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500 rounded-lg text-white"><Building2 size={18} /></div>
                  <div>
                    <CardTitle className="text-lg">Tổ chức & Công việc</CardTitle>
                    <CardDescription className="text-slate-400">Xác định vị trí chính xác trong sơ đồ</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6 bg-white rounded-t-2xl -mt-2">

                {/* 1. Tìm kiếm và Chọn đơn vị */}
                <div className="space-y-3">
                  <Label className="font-bold text-slate-700 flex justify-between">
                    Đơn vị công tác <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative group">
                    <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-blue-500" />
                    <Input
                      placeholder="Tìm tên hoặc đường dẫn đơn vị..."
                      className="pl-10 h-12 rounded-xl bg-slate-50 focus:bg-white border-slate-200"
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="border border-slate-100 rounded-xl bg-slate-50 overflow-hidden shadow-inner">
                    <div className="max-h-[300px] overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-slate-200">
                      {units
                        .filter(u => u.fullPath.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((u) => (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => setForm({ ...form, departmentId: u.id.toString(), jobTitleId: "" })}
                            className={cn(
                              "w-full text-left p-3 rounded-lg mb-1 transition-all flex flex-col gap-1",
                              form.departmentId === u.id.toString()
                                ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                                : "hover:bg-white text-slate-700 hover:shadow-sm"
                            )}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-[13px]">{u.name}</span>
                              {form.departmentId === u.id.toString() && <Check size={14} className="text-white" />}
                            </div>
                            <span className={cn(
                              "text-[10px] flex items-center gap-1",
                              form.departmentId === u.id.toString() ? "text-blue-100" : "text-slate-400"
                            )}>
                              <MapPin size={10} /> {u.fullPath}
                            </span>
                          </button>
                        ))}
                    </div>
                  </div>
                </div>

                {/* 2. Thẻ xác nhận đơn vị đã chọn */}
                {selectedUnit && (
                  <div className="bg-blue-50/80 border border-blue-100 rounded-2xl p-4 animate-in fade-in slide-in-from-top-2">
                    <div className="flex gap-3">
                      <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                        <Info size={18} className="text-blue-600" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest">Đang áp dụng cho:</p>
                        <p className="text-sm font-bold text-blue-800 leading-snug">{selectedUnit.fullPath}</p>
                        <p className="text-[10px] text-blue-500 font-mono mt-1">Mã định danh: {selectedUnit.code || "CHƯA CÓ MÃ"}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Chọn Chức danh (Cascading) */}
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700">Chức danh / Chức vụ *</Label>
                  <div className="relative">
                    <select
                      className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50 appearance-none cursor-pointer"
                      value={form.jobTitleId}
                      onChange={(e) => setForm({ ...form, jobTitleId: e.target.value })}
                      disabled={!form.departmentId || isLoadingJobs}
                    >
                      <option value="">-- Chọn chức danh công việc --</option>
                      {jobTitles.map((j: any) => (
                        <option key={j.id} value={j.id}>{j.name}</option>
                      ))}
                    </select>
                    <ChevronRight className="absolute right-4 top-4 h-4 w-4 text-slate-400 rotate-90" />
                    {isLoadingJobs && <Loader2 className="absolute right-10 top-4 h-4 w-4 animate-spin text-blue-500" />}
                  </div>
                  {!form.departmentId && (
                    <p className="text-[10px] text-amber-600 font-bold">* Vui lòng chọn Đơn vị trước để tải danh sách chức danh.</p>
                  )}
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700">Mã nhân viên</Label>
                    <Input
                      placeholder="Tự động"
                      value={form.employeeCode}
                      onChange={(e) => setForm({ ...form, employeeCode: e.target.value })}
                      className="rounded-xl bg-slate-50 h-11 font-mono text-xs uppercase"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700">Ngày gia nhập</Label>
                    <Input
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                      className="rounded-xl bg-slate-50 h-11"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-xl shadow-slate-200">
              <div className="flex gap-4 items-center">
                <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
                  <UserCheck className="text-white" size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold">Xác nhận thông tin</p>
                  <p className="text-[11px] text-slate-400">Mọi thay đổi sẽ được ghi lại trong lịch sử hệ thống iDesk.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}