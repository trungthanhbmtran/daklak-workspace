"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, User, Briefcase, Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { hrmApi, hrmKeys } from "@/features/hrm";
import { organizationApi } from "@/features/system-admin/organization/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";

function flattenUnits(nodes: unknown[], acc: { id: number; name: string; code?: string }[] = []): { id: number; name: string; code?: string }[] {
  for (const n of nodes || []) {
    const node = n as { id?: number; name?: string; code?: string; children?: unknown[] };
    if (node.id != null) acc.push({ id: node.id, name: node.name ?? "", code: node.code });
    flattenUnits(node.children ?? [], acc);
  }
  return acc;
}

export default function CreateEmployeePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);

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

  const { data: treeNodes } = useQuery({
    queryKey: ["organizations", "tree"],
    queryFn: () => organizationApi.getTree(),
  });
  const { data: jobTitlesRes } = useQuery({
    queryKey: ["organizations", "job-titles"],
    queryFn: () => organizationApi.getJobTitles(),
  });

  const units = flattenUnits(Array.isArray(treeNodes) ? treeNodes : []);
  const jobTitles = jobTitlesRes?.items ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const departmentId = parseInt(form.departmentId, 10);
    const jobTitleId = parseInt(form.jobTitleId, 10);
    if (!departmentId || !jobTitleId) {
      toast.error("Vui lòng chọn Đơn vị và Chức danh.");
      return;
    }
    setSubmitting(true);
    try {
      await hrmApi.create({
        firstname: form.firstname.trim(),
        lastname: form.lastname.trim(),
        employeeCode: form.employeeCode.trim() || undefined,
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        identityCard: form.identityCard.trim() || undefined,
        departmentId,
        jobTitleId,
        startDate: form.startDate || new Date().toISOString().slice(0, 10),
        birthday: form.birthday || undefined,
      });
      queryClient.invalidateQueries({ queryKey: hrmKeys.employees() });
      toast.success("Đã thêm nhân sự thành công.");
      router.push("/services/hrm/employees");
    } catch (err) {
      toast.error("Không thể thêm nhân sự. Kiểm tra kết nối API.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 p-6 md:p-10 space-y-6">
      <form onSubmit={handleSubmit} className="max-w-[1200px] mx-auto w-full flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/services/hrm/employees">
              <Button type="button" variant="outline" size="icon" className="rounded-full bg-white h-10 w-10 border-slate-200">
                <ArrowLeft className="h-4 w-4 text-slate-600" />
              </Button>
            </Link>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">Thêm nhân sự mới</h2>
              <p className="text-sm text-slate-500 mt-1">Điền thông tin cơ bản. Dữ liệu gửi qua API gateway (hrm-service).</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/services/hrm/employees">
              <Button type="button" variant="ghost" className="text-slate-600 font-medium">Hủy</Button>
            </Link>
            <Button type="submit" disabled={submitting} className="rounded-full bg-blue-600 hover:bg-blue-700 px-6 shadow-md shadow-blue-500/20">
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Lưu hồ sơ
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="rounded-2xl border-slate-200/60 shadow-sm overflow-hidden bg-white">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4 px-6">
                <div className="flex items-center text-slate-800">
                  <User className="h-5 w-5 mr-2 text-blue-500" />
                  <CardTitle className="text-lg font-semibold">Thông tin cá nhân</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstname" className="text-slate-700 font-medium">Họ và đệm <span className="text-red-500">*</span></Label>
                    <Input
                      id="firstname"
                      placeholder="VD: Nguyễn Văn"
                      className="h-11 rounded-xl bg-slate-50/50 border-slate-200 focus-visible:ring-blue-500"
                      value={form.firstname}
                      onChange={(e) => setForm((f) => ({ ...f, firstname: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastname" className="text-slate-700 font-medium">Tên <span className="text-red-500">*</span></Label>
                    <Input
                      id="lastname"
                      placeholder="VD: Anh"
                      className="h-11 rounded-xl bg-slate-50/50 border-slate-200 focus-visible:ring-blue-500"
                      value={form.lastname}
                      onChange={(e) => setForm((f) => ({ ...f, lastname: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="identityCard" className="text-slate-700 font-medium">Số CCCD</Label>
                    <Input
                      id="identityCard"
                      placeholder="12 chữ số"
                      className="h-11 rounded-xl bg-slate-50/50 border-slate-200 focus-visible:ring-blue-500"
                      value={form.identityCard}
                      onChange={(e) => setForm((f) => ({ ...f, identityCard: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birthday" className="text-slate-700 font-medium">Ngày sinh</Label>
                    <Input
                      id="birthday"
                      type="date"
                      className="h-11 rounded-xl bg-slate-50/50 border-slate-200 focus-visible:ring-blue-500 text-slate-600"
                      value={form.birthday}
                      onChange={(e) => setForm((f) => ({ ...f, birthday: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-slate-700 font-medium">Số điện thoại</Label>
                    <Input
                      id="phone"
                      placeholder="09xx xxx xxx"
                      className="h-11 rounded-xl bg-slate-50/50 border-slate-200 focus-visible:ring-blue-500"
                      value={form.phone}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700 font-medium">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@example.com"
                      className="h-11 rounded-xl bg-slate-50/50 border-slate-200 focus-visible:ring-blue-500"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="rounded-2xl border-slate-200/60 shadow-sm overflow-hidden bg-white">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4 px-6">
                <div className="flex items-center text-slate-800">
                  <Briefcase className="h-5 w-5 mr-2 text-violet-500" />
                  <CardTitle className="text-lg font-semibold">Công việc</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="empCode" className="text-slate-700 font-medium">Mã nhân viên</Label>
                  <Input
                    id="empCode"
                    placeholder="Để trống sẽ tự tạo"
                    className="h-11 rounded-xl bg-slate-50/50 border-slate-200 focus-visible:ring-violet-500"
                    value={form.employeeCode}
                    onChange={(e) => setForm((f) => ({ ...f, employeeCode: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department" className="text-slate-700 font-medium">Đơn vị <span className="text-red-500">*</span></Label>
                  <select
                    id="department"
                    className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                    value={form.departmentId}
                    onChange={(e) => setForm((f) => ({ ...f, departmentId: e.target.value }))}
                    required
                  >
                    <option value="">-- Chọn đơn vị --</option>
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobTitle" className="text-slate-700 font-medium">Chức danh <span className="text-red-500">*</span></Label>
                  <select
                    id="jobTitle"
                    className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                    value={form.jobTitleId}
                    onChange={(e) => setForm((f) => ({ ...f, jobTitleId: e.target.value }))}
                    required
                  >
                    <option value="">-- Chọn chức danh --</option>
                    {jobTitles.map((j: { id: number; name: string; code?: string }) => (
                      <option key={j.id} value={j.id}>{j.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-slate-700 font-medium">Ngày gia nhập</Label>
                  <Input
                    id="startDate"
                    type="date"
                    className="h-11 rounded-xl bg-slate-50/50 border-slate-200 focus-visible:ring-violet-500 text-slate-600"
                    value={form.startDate}
                    onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
