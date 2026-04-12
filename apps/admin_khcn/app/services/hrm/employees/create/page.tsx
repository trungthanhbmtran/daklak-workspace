"use client";

import { useState, useMemo, useRef } from "react";
import { useImageUpload } from "@/features/posts/hooks/useImageUpload";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Save, User, Camera,
  Loader2, Mail, Phone, CreditCard, Calendar,
  Building2, Search, Check, ChevronRight, Hash, AlertCircle
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

// flatten tree
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
    avatar: "", // ✅ giữ nguyên field, nhưng sẽ chứa fileId
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ✅ upload hook
  const { isUploading, previewUrl, handleImageUpload } = useImageUpload({
    onSuccess: (fileId) => {
      setForm(prev => ({ ...prev, avatar: fileId })); // ✅ LƯU fileId
    }
  });

  // fetch organization
  const { data: treeNodes } = useQuery({
    queryKey: ["organizations", "tree"],
    queryFn: () => organizationApi.getTree(),
  });

  const units = useMemo(
    () => flattenUnits(Array.isArray(treeNodes) ? treeNodes : []),
    [treeNodes]
  );

  const { data: jobTitlesRes, isLoading: isLoadingJobs } = useQuery({
    queryKey: ["organizations", "job-titles", form.departmentId],
    queryFn: () =>
      organizationApi.getJobTitles(
        form.departmentId ? parseInt(form.departmentId, 10) : undefined
      ),
    enabled: !!form.departmentId,
  });

  const selectedUnit = units.find(
    (u) => u.id.toString() === form.departmentId
  );

  const jobTitles = jobTitlesRes?.items ?? [];

  // submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.departmentId || !form.jobTitleId) {
      toast.error("Vui lòng chọn Đơn vị và Chức danh");
      return;
    }

    setSubmitting(true);

    try {
      await hrmApi.create({
        ...form,
        departmentId: parseInt(form.departmentId),
        jobTitleId: parseInt(form.jobTitleId),
      });

      queryClient.invalidateQueries({
        queryKey: hrmKeys.employees(),
      });

      toast.success("Thêm nhân sự thành công");
      router.push("/services/hrm/employees");
    } catch {
      toast.error("Lỗi khi lưu dữ liệu");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] p-6 md:p-10 text-slate-900">
      <form onSubmit={handleSubmit} className="max-w-[1200px] mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex justify-between bg-white p-6 rounded-2xl border">
          <div className="flex items-center gap-4">
            <Button type="button" onClick={() => router.back()}>
              <ArrowLeft />
            </Button>
            <h2 className="text-xl font-bold">Tạo hồ sơ nhân sự</h2>
          </div>

          <Button type="submit" disabled={submitting}>
            {submitting ? <Loader2 className="animate-spin" /> : <Save />}
            Lưu
          </Button>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">

          {/* LEFT */}
          <div className="lg:col-span-7 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cá nhân</CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">

                {/* AVATAR */}
                <div className="flex gap-6 items-center">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 border rounded-xl flex items-center justify-center cursor-pointer overflow-hidden"
                  >
                    {isUploading ? (
                      <Loader2 className="animate-spin" />
                    ) : previewUrl ? ( // ✅ chỉ dùng previewUrl
                      <img src={previewUrl} className="w-full h-full object-cover" />
                    ) : (
                      <Camera />
                    )}
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    hidden
                    accept="image/*"
                    onChange={handleImageUpload}
                  />

                  <div className="grid grid-cols-2 gap-4 flex-1">
                    <Input
                      placeholder="Họ"
                      value={form.firstname}
                      onChange={(e) =>
                        setForm({ ...form, firstname: e.target.value })
                      }
                    />
                    <Input
                      placeholder="Tên"
                      value={form.lastname}
                      onChange={(e) =>
                        setForm({ ...form, lastname: e.target.value })
                      }
                    />
                  </div>
                </div>

                <Input
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                />

                <Input
                  placeholder="SĐT"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({ ...form, phone: e.target.value })
                  }
                />

                <Input
                  placeholder="CCCD"
                  value={form.identityCard}
                  onChange={(e) =>
                    setForm({ ...form, identityCard: e.target.value })
                  }
                />

                <Input
                  type="date"
                  value={form.birthday}
                  onChange={(e) =>
                    setForm({ ...form, birthday: e.target.value })
                  }
                />

              </CardContent>
            </Card>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-5">
            <Card>
              <CardHeader>
                <CardTitle>Đơn vị công tác</CardTitle>
              </CardHeader>

              <CardContent>
                <Input
                  placeholder="Tìm đơn vị..."
                  onChange={(e) => setSearchTerm(e.target.value)}
                />

                <div className="max-h-60 overflow-auto mt-2">
                  {units
                    .filter(u =>
                      u.fullPath.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map(u => (
                      <div
                        key={u.id}
                        onClick={() =>
                          setForm({
                            ...form,
                            departmentId: u.id.toString(),
                            jobTitleId: ""
                          })
                        }
                        className="p-2 cursor-pointer hover:bg-gray-100"
                      >
                        {u.fullPath}
                      </div>
                    ))}
                </div>

                <select
                  value={form.jobTitleId}
                  onChange={(e) =>
                    setForm({ ...form, jobTitleId: e.target.value })
                  }
                  disabled={!form.departmentId}
                  className="w-full mt-4"
                >
                  <option value="">Chọn chức danh</option>
                  {jobTitles.map((j: any) => (
                    <option key={j.id} value={j.id}>
                      {j.name}
                    </option>
                  ))}
                </select>

              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}