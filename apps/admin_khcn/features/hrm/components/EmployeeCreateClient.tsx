/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";
import { hrmApi, hrmKeys } from "@/features/hrm";
import { useHrmPermissions } from "@/features/hrm/hooks/useHrmPermissions";
import { organizationApi } from "@/features/system-admin/organization/api";

import { employeeCreateSchema, type EmployeeCreateFormValues } from "./employee-create/types";
import { useOrganizationHierarchy } from "./employee-create/hooks/useOrganizationHierarchy";
import { EmployeeCreateHeader } from "./employee-create/components/EmployeeCreateHeader";
import { EmployeePersonalInfoCard } from "./employee-create/components/EmployeePersonalInfoCard";
import { EmployeeEmploymentCard } from "./employee-create/components/EmployeeEmploymentCard";
import { EmployeeOrganizationCard } from "./employee-create/components/EmployeeOrganizationCard";
import { EmployeeSystemSyncCard } from "./employee-create/components/EmployeeSystemSyncCard";

export function EmployeeCreateClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { canCreateEmployee, isLoading: isAuthLoading } = useHrmPermissions();
  const [submitting, setSubmitting] = useState(false);

  // 1. Tải cây tổ chức qua hook có bộ đệm Cache hiệu năng cao (staleTime 5 phút)
  const { units, isLoading: isLoadingUnits } = useOrganizationHierarchy();

  // 2. Khởi tạo biểu mẫu với schema xác thực
  const form = useForm<EmployeeCreateFormValues>({
    resolver: zodResolver(employeeCreateSchema),
    defaultValues: {
      firstname: "",
      lastname: "",
      gender: "male",
      employeeCode: "",
      email: "",
      phone: "",
      identityCard: "",
      address: "",
      departmentId: undefined as any,
      jobTitleId: undefined,
      partyTitleId: undefined,
      civilServantRankId: undefined,
      slotOrder: undefined,
      startDate: new Date().toISOString().slice(0, 10),
      birthday: "",
      employmentStatus: "active",
      avatar: "",
    },
  });

  // Chỉ theo dõi departmentId để trigger nạp chức danh và định biên VTVL
  const departmentId = useWatch({ control: form.control, name: "departmentId" });

  // 3. Tải danh mục chức danh theo đơn vị đã chọn (Backend đã phân loại sẵn partyTitles & govTitles)
  const { data: jobTitlesRes, isLoading: isLoadingJobs } = useQuery({
    queryKey: ["organizations", "job-titles", departmentId],
    queryFn: () => organizationApi.getJobTitles(departmentId!),
    enabled: !!departmentId,
    staleTime: 2 * 60 * 1000,
  });

  // Dumb Client: Lấy trực tiếp dữ liệu chức danh đã phân loại từ Backend
  const partyTitles: any[] = jobTitlesRes?.data?.partyTitles ?? [];
  const govTitles: any[] = jobTitlesRes?.data?.govTitles ?? [];
  const allTitles: any[] = jobTitlesRes?.data?.allTitles ?? [];

  const rankTitles = useMemo(
    () => allTitles.filter((j) => j.type === "RANK"),
    [allTitles]
  );

  // 4. Tải báo cáo định biên VTVL (Staffing Report) của đơn vị (Cache 1 phút)
  const { data: staffingReport } = useQuery({
    queryKey: ["staffing-report", departmentId],
    queryFn: () => organizationApi.getStaffingReport(departmentId!),
    enabled: !!departmentId,
    staleTime: 60 * 1000,
  });

  // 5. Xử lý gửi dữ liệu thêm mới nhân sự
  const onSubmit = async (values: EmployeeCreateFormValues) => {
    setSubmitting(true);
    try {
      const payload: any = {
        firstname: values.firstname.trim(),
        lastname: values.lastname.trim(),
        gender: values.gender || "male",
        employeeCode: values.employeeCode?.trim() || undefined,
        email: values.email?.trim() || undefined,
        phone: values.phone?.trim() || undefined,
        identityCard: values.identityCard?.trim() || undefined,
        address: values.address?.trim() || undefined,
        departmentId: values.departmentId,
        jobTitleId: values.jobTitleId || undefined,
        partyTitleId: values.partyTitleId || undefined,
        civilServantRankId: values.civilServantRankId || undefined,
        slotOrder: values.slotOrder || undefined,
        startDate: values.startDate || undefined,
        birthday: values.birthday || undefined,
        employmentStatus: values.employmentStatus || "active",
        avatar: values.avatar || undefined,
      };

      await hrmApi.create(payload);

      queryClient.invalidateQueries({ queryKey: hrmKeys.employees() });
      if (values.departmentId) {
        queryClient.invalidateQueries({ queryKey: ["staffing-report", values.departmentId] });
      }

      const selectedUnit = units.find((u) => u.id === values.departmentId);
      const fullName = `${values.lastname} ${values.firstname}`.trim().toUpperCase();

      toast.success("Thêm mới hồ sơ nhân sự thành công!", {
        description: `Cán bộ: ${fullName} (${selectedUnit?.name || "Đơn vị"})`,
      });

      router.push("/services/hrm/employees");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Lỗi khi lưu hồ sơ nhân sự. Vui lòng kiểm tra lại."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthLoading && !canCreateEmployee) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <ShieldAlert className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-xl font-bold">Không có quyền truy cập</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-md">
          Bạn không có quyền thêm mới hồ sơ nhân sự (yêu cầu quyền HRM_EMPLOYEE:CREATE). Vui lòng liên hệ quản trị viên để được phân quyền.
        </p>
        <Button className="mt-6" onClick={() => router.back()}>
          Quay lại
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 pb-16 text-slate-900 font-sans">
      {/* ─── STICKY ENTERPRISE HEADER ──────────────────────────────────────────────── */}
      <EmployeeCreateHeader
        isSubmitting={submitting}
        isUploading={false}
        onCancel={() => router.back()}
        onSubmit={form.handleSubmit(onSubmit)}
      />

      {/* ─── MAIN CONTENT CONTAINER ──────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-8 pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* CỘT TRÁI (7 COLS): THÔNG TIN ĐỊNH DANH & HỒ SƠ CÁ NHÂN */}
              <div className="lg:col-span-7 space-y-6 min-w-0">
                <EmployeePersonalInfoCard
                  control={form.control}
                  setValue={form.setValue}
                />
                <EmployeeEmploymentCard
                  control={form.control}
                  rankTitles={rankTitles}
                />
              </div>

              {/* CỘT PHẢI (5 COLS): ĐƠN VỊ CÔNG TÁC, CHỨC DANH VTVL & ĐỊNH BIÊN */}
              <div className="lg:col-span-5 space-y-6 min-w-0">
                <EmployeeOrganizationCard
                  control={form.control}
                  setValue={form.setValue}
                  units={units}
                  isLoadingUnits={isLoadingUnits}
                  partyTitles={partyTitles}
                  govTitles={govTitles}
                  allTitles={allTitles}
                  isLoadingJobs={isLoadingJobs}
                  staffingReport={staffingReport}
                  errors={form.formState.errors}
                />
                <EmployeeSystemSyncCard />
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}