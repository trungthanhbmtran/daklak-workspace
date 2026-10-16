/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, ShieldAlert, ArrowLeft } from "lucide-react";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/typography";
import { hrmKeys } from "@/features/hrm";
import { useHrmEmployee, useUpdateHrmEmployee } from "@/features/hrm/hooks/useHrmEmployees";
import { useHrmPermissions } from "@/features/hrm/hooks/useHrmPermissions";
import { organizationApi } from "@/features/system-admin/organization/api";

import { employeeCreateSchema, type EmployeeCreateFormValues } from "./employee-create/types";
import { useOrganizationHierarchy } from "./employee-create/hooks/useOrganizationHierarchy";
import { EmployeeCreateHeader } from "./employee-create/components/EmployeeCreateHeader";
import { EmployeePersonalInfoCard } from "./employee-create/components/EmployeePersonalInfoCard";
import { EmployeeEmploymentCard } from "./employee-create/components/EmployeeEmploymentCard";
import { EmployeeOrganizationCard } from "./employee-create/components/EmployeeOrganizationCard";
import { EmployeeSystemSyncCard } from "./employee-create/components/EmployeeSystemSyncCard";

interface EmployeeEditClientProps {
  params: Promise<{ id: string }> | { id: string };
}

export function EmployeeEditClient({ params }: EmployeeEditClientProps) {
  const resolvedParams =
    typeof (params as any)?.then === "function"
      ? use(params as Promise<{ id: string }>)
      : (params as { id: string });

  const employeeId = parseInt(resolvedParams.id, 10);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { canEditEmployee, isLoading: isAuthLoading } = useHrmPermissions();
  const [submitting, setSubmitting] = useState(false);

  // 1. Tải cây tổ chức qua hook đồng bộ có đệm Cache
  const { units, isLoading: isLoadingUnits } = useOrganizationHierarchy();

  // 2. Tải thông tin chi tiết nhân sự cần chỉnh sửa
  const { data: employee, isLoading: isLoadingEmployee, error: employeeError } = useHrmEmployee(employeeId);
  const { mutateAsync: updateEmployee } = useUpdateHrmEmployee();

  // 3. Khởi tạo biểu mẫu với schema chuẩn hóa đồng bộ trang tạo mới
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

  // Điền dữ liệu của cán bộ vào form khi API tải xong
  useEffect(() => {
    if (employee) {
      form.reset({
        firstname: employee.firstname || "",
        lastname: employee.lastname || "",
        gender: employee.gender || "male",
        employeeCode: employee.employeeCode || "",
        email: employee.email || "",
        phone: employee.phone || "",
        identityCard: employee.identityCard || "",
        address: (employee as any).address || "",
        departmentId: employee.departmentId && employee.departmentId > 0 ? employee.departmentId : (undefined as any),
        jobTitleId: employee.jobTitleId && employee.jobTitleId > 0 ? employee.jobTitleId : undefined,
        partyTitleId: employee.partyTitleId && employee.partyTitleId > 0 ? employee.partyTitleId : undefined,
        civilServantRankId: (employee as any).civilServantRankId && (employee as any).civilServantRankId > 0 ? (employee as any).civilServantRankId : undefined,
        slotOrder: (employee as any).slotOrder && (employee as any).slotOrder > 0 ? (employee as any).slotOrder : undefined,
        startDate: employee.startDate ? employee.startDate.toString().slice(0, 10) : new Date().toISOString().slice(0, 10),
        birthday: employee.birthday ? employee.birthday.toString().slice(0, 10) : "",
        employmentStatus: (employee as any).status || (employee as any).employmentStatus || "active",
        avatar: employee.avatar || "",
      });
    }
  }, [employee, form]);

  // Theo dõi departmentId để nạp chức danh và báo cáo định biên
  const departmentId = useWatch({ control: form.control, name: "departmentId" });

  // 4. Tải danh mục chức danh theo đơn vị đã chọn
  const { data: jobTitlesRes, isLoading: isLoadingJobs } = useQuery({
    queryKey: ["organizations", "job-titles", departmentId],
    queryFn: () => organizationApi.getJobTitles(departmentId!),
    enabled: !!departmentId,
    staleTime: 2 * 60 * 1000,
  });

  const partyTitles: any[] = jobTitlesRes?.data?.partyTitles ?? [];
  const govTitles: any[] = jobTitlesRes?.data?.govTitles ?? [];
  const allTitles: any[] = jobTitlesRes?.data?.allTitles ?? [];

  const rankTitles = useMemo(
    () => allTitles.filter((j) => j.type === "RANK"),
    [allTitles]
  );

  // 5. Tải báo cáo định biên VTVL (Staffing Report) của đơn vị
  const { data: staffingReport } = useQuery({
    queryKey: ["staffing-report", departmentId],
    queryFn: () => organizationApi.getStaffingReport(departmentId!),
    enabled: !!departmentId,
    staleTime: 60 * 1000,
  });

  // Tự động nhận diện và pre-select slot hiện tại của nhân sự nếu chưa được chọn
  const selectedJobTitleId = useWatch({ control: form.control, name: "jobTitleId" });
  const selectedPartyTitleId = useWatch({ control: form.control, name: "partyTitleId" });
  const selectedUnit = useMemo(() => units.find((u) => u.id === departmentId), [units, departmentId]);
  const isPartyUnit = selectedUnit?.categoryCode === "DANG";
  const effectiveJobTitleId = isPartyUnit
    ? selectedPartyTitleId || selectedJobTitleId
    : selectedJobTitleId || selectedPartyTitleId;

  const activeStaffingRow = useMemo(() => {
    if (!effectiveJobTitleId || !staffingReport?.data) return undefined;
    return (staffingReport.data as any[]).find((s: any) => s.jobTitleId === effectiveJobTitleId);
  }, [effectiveJobTitleId, staffingReport]);

  useEffect(() => {
    if (employee?.employeeCode && activeStaffingRow?.slots) {
      const matchSlot = activeStaffingRow.slots.find(
        (s: any) => s.assignedEmployeeCode === employee.employeeCode
      );
      if (matchSlot && form.getValues("slotOrder") === undefined) {
        form.setValue("slotOrder", matchSlot.slotOrder, { shouldDirty: false });
      }
    }
  }, [employee, activeStaffingRow, form]);

  // 6. Xử lý lưu cập nhật hồ sơ
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

      await updateEmployee({
        id: employeeId,
        payload,
      });

      queryClient.invalidateQueries({ queryKey: hrmKeys.employees() });
      queryClient.invalidateQueries({ queryKey: hrmKeys.detail(employeeId) });
      if (values.departmentId) {
        queryClient.invalidateQueries({ queryKey: ["staffing-report", values.departmentId] });
      }

      const unitName = selectedUnit?.name || "Đơn vị";
      const fullName = `${values.lastname} ${values.firstname}`.trim().toUpperCase();

      toast.success("Cập nhật hồ sơ nhân sự thành công!", {
        description: `Cán bộ: ${fullName} (${unitName})`,
      });

      router.push("/services/hrm/employees");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Lỗi khi cập nhật hồ sơ nhân sự. Vui lòng kiểm tra lại."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Trạng thái kiểm tra phân quyền
  if (!isAuthLoading && !canEditEmployee) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <ShieldAlert className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-xl font-bold">Không có quyền truy cập</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-md">
          Bạn không có quyền chỉnh sửa hồ sơ nhân sự (yêu cầu quyền HRM_EMPLOYEE:UPDATE hoặc HRM_EMPLOYEE:MANAGE). Vui lòng liên hệ quản trị viên để được phân quyền.
        </p>
        <Button className="mt-6" onClick={() => router.back()}>
          Quay lại
        </Button>
      </div>
    );
  }

  // Trạng thái đang tải dữ liệu nhân sự
  if (isLoadingEmployee) {
    return (
      <div className="min-h-screen bg-slate-50/70 flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
        <Heading level="h4" className="text-slate-800 font-bold">
          Đang tải thông tin hồ sơ nhân sự...
        </Heading>
        <p className="text-xs text-slate-500 mt-1">
          Hệ thống đang đồng bộ dữ liệu cán bộ và vị trí việc làm
        </p>
      </div>
    );
  }

  // Trạng thái không tìm thấy nhân sự
  if (!employee || employeeError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <ShieldAlert className="w-16 h-16 text-amber-500 mb-4" />
        <h2 className="text-xl font-bold">Không tìm thấy nhân sự</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-md">
          Không tìm thấy dữ liệu nhân sự với mã số #{employeeId}. Nhân sự này có thể đã bị xóa hoặc bạn không có quyền xem.
        </p>
        <Button className="mt-6" variant="outline" onClick={() => router.push("/services/hrm/employees")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Về danh sách nhân sự
        </Button>
      </div>
    );
  }

  const employeeFullName = `${employee.lastname || ""} ${employee.firstname || ""}`.trim();
  const employeeCodeDisplay = employee.employeeCode ? `[${employee.employeeCode}]` : "";

  return (
    <div className="min-h-screen bg-slate-50/70 pb-16 text-slate-900 font-sans">
      {/* ─── STICKY ENTERPRISE HEADER ──────────────────────────────────────────────── */}
      <EmployeeCreateHeader
        isSubmitting={submitting}
        isUploading={false}
        onCancel={() => router.back()}
        onSubmit={form.handleSubmit(onSubmit)}
        title="Chỉnh sửa Hồ sơ Cán bộ & Vị trí việc làm"
        subtitle={`Cán bộ: ${employeeFullName} ${employeeCodeDisplay}`.trim()}
        badgeText="HRM & KPI VTVL"
        submitButtonText="Cập nhật hồ sơ"
        submitButtonLoadingText="Đang lưu thay đổi..."
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
                  currentEmployeeCode={employee.employeeCode}
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

export default EmployeeEditClient;