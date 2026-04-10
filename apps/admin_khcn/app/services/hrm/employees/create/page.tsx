"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Save, User, Briefcase, Camera,
  Loader2, Mail, Phone, CreditCard, Calendar,
  Building2, UserCheck, X
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

// Hàm xử lý cây đơn vị thành danh sách phẳng có phân cấp
function flattenUnits(
  nodes: any[],
  acc: { id: number; name: string; code?: string }[] = [],
  level: number = 0
): { id: number; name: string; code?: string }[] {
  for (const node of nodes || []) {
    if (node.id != null) {
      const prefix = level > 0 ? "— ".repeat(level) : "";
      acc.push({ id: node.id, name: `${prefix}${node.name ?? ""}`, code: node.code });
    }
    flattenUnits(node.children ?? [], acc, level + 1);
  }
  return acc;
}

export default function CreateEmployeePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

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

  // Fetch dữ liệu Đơn vị
  const { data: treeNodes } = useQuery({
    queryKey: ["organizations", "tree"],
    queryFn: () => organizationApi.getTree(),
  });

  // Fetch dữ liệu Chức danh dựa trên Đơn vị đã chọn
  const { data: jobTitlesRes, isLoading: isLoadingJobs } = useQuery({
    queryKey: ["organizations", "job-titles", form.departmentId],
    queryFn: () => organizationApi.getJobTitles(form.departmentId ? parseInt(form.departmentId, 10) : undefined),
    enabled: !!form.departmentId,
  });

  const units = flattenUnits(Array.isArray(treeNodes) ? treeNodes : []);
  const jobTitles = jobTitlesRes?.items ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const departmentId = parseInt(form.departmentId, 10);
    const jobTitleId = parseInt(form.jobTitleId, 10);

    if (!departmentId || !jobTitleId) {
      toast.error("Vui lòng chọn đầy đủ Đơn vị và Chức danh.");
      return;
    }

    setSubmitting(true);
    try {
      await hrmApi.create({
        ...form,
        firstname: form.firstname.trim(),
        lastname: form.lastname.trim(),
        departmentId,
        jobTitleId,
        employeeCode: form.employeeCode.trim() || undefined,
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        identityCard: form.identityCard.trim() || undefined,
      });

      queryClient.invalidateQueries({ queryKey: hrmKeys.employees() });
      toast.success("Tạo hồ sơ nhân sự thành công!");
      router.push("/services/hrm/employees");
    } catch (err) {
      toast.error("Lỗi khi gửi dữ liệu. Vui lòng kiểm tra lại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      {/* Top Header Sticky */}
      <div className="sticky top-0 z-30 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/services/hrm/employees">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100">
                <ArrowLeft className="h-5 w-5 text-slate-600" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Thêm nhân sự</h1>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Hrm Service / Employees</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="rounded-lg border-slate-200 text-slate-600 font-semibold"
            >
              Hủy bỏ
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="rounded-lg bg-blue-600 hover:bg-blue-700 px-8 shadow-lg shadow-blue-200 transition-all active:scale-95"
            >
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Lưu hồ sơ
            </Button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Cột Trái: Ảnh và Thông tin cơ bản */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden">
              <CardHeader className="bg-white border-b border-slate-50 pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Thông tin cá nhân</CardTitle>
                    <CardDescription>Các thông tin định danh cơ bản của nhân sự</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row gap-10">
                  {/* Upload Avatar */}
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative group">
                      <div className="h-32 w-32 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden transition-all group-hover:border-blue-400">
                        {previewImage ? (
                          <img src={previewImage} alt="Avatar" className="h-full w-full object-cover" />
                        ) : (
                          <Camera className="h-8 w-8 text-slate-400 group-hover:text-blue-500 transition-colors" />
                        )}
                      </div>
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" title="Chọn ảnh" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Ảnh đại diện</span>
                  </div>

                  {/* Form fields */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-semibold">Họ và tên đệm <span className="text-red-500">*</span></Label>
                      <Input
                        placeholder="Nguyễn Văn"
                        value={form.firstname}
                        onChange={(e) => setForm({ ...form, firstname: e.target.value })}
                        className="bg-slate-50/50 focus:bg-white transition-colors border-slate-200"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-semibold">Tên <span className="text-red-500">*</span></Label>
                      <Input
                        placeholder="Anh"
                        value={form.lastname}
                        onChange={(e) => setForm({ ...form, lastname: e.target.value })}
                        className="bg-slate-50/50 focus:bg-white transition-colors border-slate-200"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-semibold flex items-center gap-2">
                        <CreditCard className="h-3.5 w-3.5" /> Số CCCD
                      </Label>
                      <Input
                        placeholder="12 chữ số"
                        value={form.identityCard}
                        onChange={(e) => setForm({ ...form, identityCard: e.target.value })}
                        className="bg-slate-50/50 border-slate-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-semibold flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5" /> Ngày sinh
                      </Label>
                      <Input
                        type="date"
                        value={form.birthday}
                        onChange={(e) => setForm({ ...form, birthday: e.target.value })}
                        className="bg-slate-50/50 border-slate-200"
                      />
                    </div>
                  </div>
                </div>

                <Separator className="my-8 opacity-50" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-semibold flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5" /> Địa chỉ Email
                    </Label>
                    <Input
                      type="email"
                      placeholder="email@congty.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="bg-slate-50/50 border-slate-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-semibold flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5" /> Số điện thoại
                    </Label>
                    <Input
                      placeholder="09xx xxx xxx"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="bg-slate-50/50 border-slate-200"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cột Phải: Công việc & Tổ chức */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-violet-50 rounded-lg">
                    <Briefcase className="h-5 w-5 text-violet-600" />
                  </div>
                  <CardTitle className="text-lg">Vị trí công việc</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="space-y-2">
                  <Label className="text-slate-700 font-semibold">Mã nhân viên</Label>
                  <div className="relative">
                    <Input
                      placeholder="Tự động tạo nếu để trống"
                      value={form.employeeCode}
                      onChange={(e) => setForm({ ...form, employeeCode: e.target.value })}
                      className="bg-slate-50/50 border-slate-200 font-mono text-sm"
                    />
                    <UserCheck className="absolute right-3 top-3 h-4 w-4 text-slate-300" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-700 font-semibold flex items-center gap-2">
                    <Building2 className="h-3.5 w-3.5" /> Đơn vị trực thuộc <span className="text-red-500">*</span>
                  </Label>
                  <select
                    className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                    value={form.departmentId}
                    onChange={(e) => setForm({ ...form, departmentId: e.target.value, jobTitleId: "" })}
                    required
                  >
                    <option value="">-- Chọn đơn vị --</option>
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-700 font-semibold">Chức danh <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <select
                      className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                      value={form.jobTitleId}
                      onChange={(e) => setForm({ ...form, jobTitleId: e.target.value })}
                      disabled={!form.departmentId || isLoadingJobs}
                      required
                    >
                      <option value="">-- Chọn chức danh --</option>
                      {jobTitles.map((j: any) => (
                        <option key={j.id} value={j.id}>{j.name}</option>
                      ))}
                    </select>
                    {isLoadingJobs && (
                      <Loader2 className="absolute right-8 top-3 h-4 w-4 animate-spin text-slate-400" />
                    )}
                  </div>
                  {!form.departmentId && (
                    <p className="text-[11px] text-amber-600 font-medium italic">* Vui lòng chọn đơn vị trước</p>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label className="text-slate-700 font-semibold flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" /> Ngày gia nhập
                  </Label>
                  <Input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="bg-slate-50/50 border-slate-200"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
              <p className="text-xs text-blue-700 leading-relaxed">
                <strong className="block mb-1">Lưu ý:</strong>
                Các thông tin có dấu <span className="text-red-500">*</span> là bắt buộc. Hệ thống sẽ gửi email thông báo tài khoản sau khi hồ sơ được lưu thành công.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}