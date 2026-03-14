"use client";

import { useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Mail, Phone, Briefcase, Calendar, ShieldCheck, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useHrmEmployee } from "@/features/hrm";
import { organizationApi } from "@/features/system-admin/organization/api";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

function flattenUnits(nodes: unknown[], acc: { id: number; name: string }[] = []): { id: number; name: string }[] {
  for (const n of nodes || []) {
    const node = n as { id?: number; name?: string; children?: unknown[] };
    if (node.id != null) acc.push({ id: node.id, name: node.name ?? "" });
    flattenUnits(node.children ?? [], acc);
  }
  return acc;
}

export default function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const resolvedParams = typeof (params as Promise<{ id: string }>).then === "function" ? use(params as Promise<{ id: string }>) : (params as { id: string });
  const id = parseInt(resolvedParams.id, 10);
  const [activeTab, setActiveTab] = useState("info");

  const { data: employee, isLoading, isError } = useHrmEmployee(Number.isNaN(id) ? null : id);
  const { data: treeNodes } = useQuery({
    queryKey: ["organizations", "tree"],
    queryFn: () => organizationApi.getTree(),
  });
  const { data: jobTitlesRes } = useQuery({
    queryKey: ["organizations", "job-titles"],
    queryFn: () => organizationApi.getJobTitles(),
  });

  const unitName = useMemo(() => {
    if (!employee?.departmentId) return employee?.department?.name ?? "—";
    if (!Array.isArray(treeNodes)) return employee?.department?.name ?? "—";
    const flat = flattenUnits(treeNodes);
    const found = flat.find((u) => u.id === employee.departmentId);
    return found?.name ?? employee?.department?.name ?? "—";
  }, [employee, treeNodes]);

  const jobTitleName = useMemo(() => {
    if (!employee?.jobTitleId) return employee?.jobTitle?.name ?? "—";
    const items = jobTitlesRes?.items ?? [];
    const found = items.find((j: { id: number }) => j.id === employee.jobTitleId);
    return found?.name ?? employee?.jobTitle?.name ?? "—";
  }, [employee, jobTitlesRes]);

  const fullName = employee ? [employee.firstname, employee.lastname].filter(Boolean).join(" ") : "—";

  if (Number.isNaN(id)) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50/50 p-6 md:p-10 items-center justify-center">
        <p className="text-slate-500">ID không hợp lệ.</p>
        <Link href="/services/hrm/employees">
          <Button variant="link">Quay lại danh sách</Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50/50 p-6 md:p-10 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
        <p className="text-slate-500">Đang tải hồ sơ...</p>
      </div>
    );
  }

  if (isError || !employee) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50/50 p-6 md:p-10 items-center justify-center">
        <p className="text-red-600 mb-4">Không tìm thấy nhân viên hoặc lỗi tải dữ liệu.</p>
        <Link href="/services/hrm/employees">
          <Button variant="outline">Quay lại danh sách</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 p-6 md:p-10 space-y-6">
      <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-6">
        <div>
          <Link href="/services/hrm/employees">
            <Button variant="ghost" className="text-slate-500 hover:text-slate-900 -ml-4">
              <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại danh sách
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4">
            <Card className="rounded-2xl border-slate-200/60 shadow-sm overflow-hidden bg-white sticky top-6">
              <div className="h-28 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
              <CardContent className="px-6 pb-6 pt-0 flex flex-col items-center text-center relative">
                <Avatar className="h-24 w-24 border-4 border-white shadow-sm -mt-12 bg-white">
                  <AvatarImage src={undefined} />
                  <AvatarFallback className="text-2xl font-semibold text-blue-700 bg-blue-50">
                    {fullName.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-bold text-slate-900 mt-3">{fullName}</h3>
                <p className="text-slate-500 font-medium text-sm mt-1">{jobTitleName}</p>
                <div className="mt-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200/50">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Đang làm việc
                  </span>
                </div>
                <div className="w-full h-px bg-slate-100 my-6"></div>
                <div className="w-full space-y-4 text-sm text-left">
                  <div className="flex items-center text-slate-600">
                    <Briefcase className="h-4 w-4 mr-3 text-slate-400" />
                    <span className="font-medium text-slate-900">{unitName}</span>
                  </div>
                  <div className="flex items-center text-slate-600">
                    <Mail className="h-4 w-4 mr-3 text-slate-400" />
                    <span className="font-medium text-slate-900 truncate">{employee.email || "—"}</span>
                  </div>
                  <div className="flex items-center text-slate-600">
                    <Phone className="h-4 w-4 mr-3 text-slate-400" />
                    <span className="font-medium text-slate-900">{employee.phone || "—"}</span>
                  </div>
                  <div className="flex items-center text-slate-600">
                    <Calendar className="h-4 w-4 mr-3 text-slate-400" />
                    <span className="font-medium text-slate-900">Mã NV: {employee.employeeCode || employee.id}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
              <TabsList className="bg-slate-200/50 p-1.5 rounded-xl h-auto inline-flex">
                <TabsTrigger value="info" className="rounded-lg px-6 py-2.5 text-sm font-medium text-slate-600 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm transition-all">
                  Sơ yếu lý lịch
                </TabsTrigger>
                <TabsTrigger value="contracts" className="rounded-lg px-6 py-2.5 text-sm font-medium text-slate-600 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm transition-all">
                  Hợp đồng
                </TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="outline-none">
                <Card className="rounded-2xl border-slate-200/60 shadow-sm overflow-hidden bg-white">
                  <div className="p-6">
                    <h4 className="text-lg font-semibold text-slate-900 mb-6">Thông tin định danh</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 text-sm">
                      <div className="flex flex-col space-y-1.5">
                        <span className="text-slate-500">Mã nhân viên</span>
                        <span className="font-semibold text-slate-900 text-base">{employee.employeeCode || employee.id}</span>
                      </div>
                      <div className="flex flex-col space-y-1.5">
                        <span className="text-slate-500">Số CCCD</span>
                        <span className="font-semibold text-slate-900 text-base">{employee.identityCard || "—"}</span>
                      </div>
                      <div className="flex flex-col space-y-1.5">
                        <span className="text-slate-500">Email</span>
                        <span className="font-semibold text-slate-900 text-base">{employee.email || "—"}</span>
                      </div>
                      <div className="flex flex-col space-y-1.5">
                        <span className="text-slate-500">Số điện thoại</span>
                        <span className="font-semibold text-slate-900 text-base">{employee.phone || "—"}</span>
                      </div>
                      <div className="flex flex-col space-y-1.5">
                        <span className="text-slate-500">Đơn vị</span>
                        <span className="font-semibold text-slate-900 text-base">{unitName}</span>
                      </div>
                      <div className="flex flex-col space-y-1.5">
                        <span className="text-slate-500">Chức danh</span>
                        <span className="font-semibold text-slate-900 text-base">{jobTitleName}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="contracts" className="outline-none">
                <Card className="rounded-2xl border-slate-200/60 shadow-sm overflow-hidden bg-white">
                  <div className="p-12 flex flex-col items-center justify-center text-center">
                    <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                      <FileText className="h-8 w-8 text-slate-300" />
                    </div>
                    <h4 className="text-slate-700 font-medium">Chưa có dữ liệu hợp đồng</h4>
                    <p className="text-sm text-slate-400 mt-1 max-w-sm">
                      Nhân viên này chưa được gắn hợp đồng lao động nào. Bạn có thể thêm hợp đồng từ hệ thống.
                    </p>
                    <Button variant="outline" className="mt-6 rounded-full border-slate-200 text-slate-600" disabled>
                      Thêm hợp đồng
                    </Button>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
