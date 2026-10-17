/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Users,
  Award,
  ShieldCheck,
  TrendingUp,
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
  Sparkles,
  Repeat,
  Briefcase,
  Scale,
  FileText,
  CheckSquare,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Heading, Text } from "@/components/ui/typography";
import { toast } from "sonner";

import { useCreateTask, useTaskContext, useBalancePercentages } from "../../hooks/useTasks";
import { useHrmEmployeesList } from "../../hooks/useHrmEmployees";
import { useOrganizationFlatListQuery } from "@/features/system-admin/organization/hooks/useOrganizationQueries";
import { useUser } from "@/hooks/useUser";
import { unwrapData } from "@/lib/api-helper";
import { DepartmentWorkloadRecommendation } from "./department-workload-recommendation";

interface CoordinatorItem {
  id: string;
  name: string;
  percentage: number;
}

function getJobTitleLabel(jobTitle: any): string {
  if (!jobTitle) return "";
  if (typeof jobTitle === "string") return jobTitle;
  if (typeof jobTitle === "object" && typeof jobTitle.name === "string") return jobTitle.name;
  return "";
}

function getEmployeeName(e: any): string {
  if (!e) return "";
  if (typeof e.fullName === "string" && e.fullName.trim()) return e.fullName.trim();
  if (typeof e.name === "string" && e.name.trim()) return e.name.trim();
  const first = typeof e.firstname === "string" ? e.firstname : "";
  const last = typeof e.lastname === "string" ? e.lastname : "";
  const combined = `${first} ${last}`.trim();
  return combined || e.employeeCode || e.code || "Cán bộ";
}

function getDepartmentLabel(e: any): string {
  if (!e) return "";
  if (typeof e.departmentName === "string" && e.departmentName) return e.departmentName;
  if (typeof e.department === "string" && e.department) return e.department;
  if (typeof e.department?.name === "string") return e.department.name;
  return "";
}

export interface TaskInitialStep {
  title: string;
  assigneeCode?: string;
  assigneeName?: string;
  baseScore?: number;
}

export function TaskCreateClient({ parentId }: { parentId?: string | number }) {
  const router = useRouter();
  const { user: currentUser } = useUser();

  // ── Form State ──
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sourceDocumentRef, setSourceDocumentRef] = useState("");
  const [supervisorCode, setSupervisorCode] = useState("DEFAULT");
  const [autoDetectedSupervisor, setAutoDetectedSupervisor] = useState<{
    code: string;
    name: string;
    jobTitle?: string;
    unitName?: string;
    reason: string;
  } | null>(null);

  const [taskType, setTaskType] = useState<"REGULAR" | "INCIDENTAL" | "PERIODIC">("REGULAR");
  const [recurrence, setRecurrence] = useState<"DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY">("MONTHLY");

  const [priority, setPriority] = useState<"URGENT" | "HIGH" | "NORMAL" | "LOW">("NORMAL");
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setHours(8, 0, 0, 0);
    const tzoffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzoffset).toISOString().slice(0, 16);
  });
  const [dueDate, setDueDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 3);
    today.setHours(17, 30, 0, 0);
    const tzoffset = today.getTimezoneOffset() * 60000;
    return new Date(today.getTime() - tzoffset).toISOString().slice(0, 16);
  });

  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("ALL");
  const [assignee, setAssignee] = useState<string>("");
  const [assigneePercentage, setAssigneePercentage] = useState<number>(100);
  const [coordinators, setCoordinators] = useState<CoordinatorItem[]>([]);

  // KPI & Trọng số
  const [isKpiTarget, setIsKpiTarget] = useState(true);
  const [formulaDomainCode, setFormulaDomainCode] = useState("CHUNG");
  const [baseScore, setBaseScore] = useState<number>(10);
  const [difficultyK, setDifficultyK] = useState<number>(1.0);

  // Quy trình checklist
  const [initialSteps, setInitialSteps] = useState<TaskInitialStep[]>([]);
  const [newStepTitle, setNewStepTitle] = useState("");

  // ── Queries & Mutations ──
  const createTask = useCreateTask();
  const balanceMutation = useBalancePercentages();

  const { data: employeesData } = useHrmEmployeesList({
    pageSize: 200,
    assignableOnly: true,
  });
  const employees = employeesData?.data ?? [];

  const { data: departments = [] } = useOrganizationFlatListQuery();

  // Lấy bối cảnh giao việc & phân loại nhân sự từ server
  const coordinatorIdsParam = useMemo(() => coordinators.map((c) => c.id).join(","), [coordinators]);

  const { data: contextData } = useTaskContext({
    departmentId: selectedDepartmentId && selectedDepartmentId !== "ALL" ? selectedDepartmentId : undefined,
    assignee: assignee || undefined,
    coordinatorIds: coordinatorIdsParam || undefined,
    priority,
  });

  const serverContext: any = (contextData as any)?.data ?? contextData;
  const deptLeaders = serverContext?.deptLeaders ?? [];
  const deptStaff = serverContext?.deptStaff ?? [];

  useEffect(() => {
    if (serverContext?.supervisor) {
      setAutoDetectedSupervisor({
        ...serverContext.supervisor,
        reason: serverContext.supervisor.reason || "Lãnh đạo thẩm định theo VTVL tuyến báo cáo & phân công quản lý",
      });
      if (supervisorCode === "DEFAULT" || !supervisorCode) {
        setSupervisorCode(serverContext.supervisor.code);
      }
    } else if (!assignee) {
      setAutoDetectedSupervisor(null);
    }

    if (serverContext?.formulaDomainCode) {
      setFormulaDomainCode(serverContext.formulaDomainCode);
    }

    if (serverContext?.kpiDefaults) {
      setBaseScore(serverContext.kpiDefaults.baseScore);
      setDifficultyK(serverContext.kpiDefaults.difficultyK);
      setIsKpiTarget(true);
    }
  }, [serverContext, assignee, supervisorCode]);

  // Cân bằng tỷ lệ phối hợp qua API server
  const handleAutoBalance = async (coords: CoordinatorItem[]) => {
    if (coords.length === 0) {
      setAssigneePercentage(100);
    }
    try {
      const res = await balanceMutation.mutateAsync({
        coordinatorCount: coords.length,
        coordinatorCodes: coords.map((c) => c.id),
      });
      const resData = unwrapData<any>(res);
      if (resData && typeof resData.assigneePercentage === "number") {
        setAssigneePercentage(resData.assigneePercentage);
        const coordList = Array.isArray(resData.coordinators) ? resData.coordinators : [];
        const coordMap = new Map<string, number>(
          coordList.map((item: any) => [item.id || item.employeeCode, item.percentage])
        );
        setCoordinators(
          coords.map((c) => ({
            ...c,
            percentage: coordMap.get(c.id) ?? Math.round(30 / coords.length),
          }))
        );
        return;
      }
    } catch {
      // Fallback
    }
    const defaultPrimary = 70;
    const remaining = 100 - defaultPrimary;
    const perCoord = Math.round(remaining / coords.length);
    setAssigneePercentage(defaultPrimary);
    setCoordinators(coords.map((c) => ({ ...c, percentage: perCoord })));
  };

  const handleAddCoordinator = (empCode: string) => {
    if (!empCode || coordinators.some((c) => c.id === empCode)) return;
    const emp = employees.find((e: any) => e.employeeCode === empCode);
    if (!emp) return;
    const newCoords = [
      ...coordinators,
      { id: empCode, name: emp.fullName || [emp.firstname, emp.lastname].filter(Boolean).join(" "), percentage: 0 },
    ];
    handleAutoBalance(newCoords);
  };

  const handleRemoveCoordinator = (id: string) => {
    const newCoords = coordinators.filter((c) => c.id !== id);
    handleAutoBalance(newCoords);
  };

  const handleAddStep = () => {
    if (!newStepTitle.trim()) return;
    setInitialSteps((prev) => [
      ...prev,
      {
        title: newStepTitle.trim(),
        assigneeCode: assignee || undefined,
        baseScore: Math.round(100 / (prev.length + 1)),
      },
    ]);
    setNewStepTitle("");
  };

  const handleRemoveStep = (idx: number) => {
    setInitialSteps((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (isDraft: boolean = false) => {
    if (!title.trim()) {
      toast.error("Vui lòng nhập tên nhiệm vụ công vụ");
      return;
    }
    if (!assignee) {
      toast.error("Vui lòng chỉ định cán bộ hoặc đơn vị chủ trì thực hiện");
      return;
    }
    if (!dueDate) {
      toast.error("Vui lòng chọn thời hạn hoàn thành công việc");
      return;
    }

    const payload: any = {
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      startDate: startDate ? new Date(startDate).toISOString() : undefined,
      dueDate: new Date(dueDate).toISOString(),
      parentId: parentId ? Number(parentId) : undefined,
      assigneeCode: assignee.startsWith("DEPT_") ? undefined : assignee,
      departmentId: assignee.startsWith("DEPT_")
        ? Number(assignee.replace("DEPT_", ""))
        : selectedDepartmentId && selectedDepartmentId !== "ALL"
        ? Number(selectedDepartmentId)
        : undefined,
      assigneePercentage,
      coordinators: coordinators.map((c) => ({
        employeeCode: c.id,
        percentage: c.percentage,
      })),
      supervisorCode: supervisorCode === "DEFAULT" ? undefined : supervisorCode,
      status: isDraft ? "DRAFT" : "TODO",
      metadata: {
        taskType: taskType === "INCIDENTAL" ? "UNPLANNED" : taskType,
        isIncidental: taskType === "INCIDENTAL",
        recurrence: taskType === "PERIODIC" ? recurrence : undefined,
        sourceDocumentRef: sourceDocumentRef.trim() || undefined,
        formulaDomainCode,
        kpiFormulaCode: isKpiTarget ? "KPI_STANDARD" : undefined,
        difficultyFactor: difficultyK,
        baseScore,
      },
      initialSteps: initialSteps.length > 0 ? initialSteps : undefined,
    };

    try {
      const res = await createTask.mutateAsync(payload);
      toast.success(isDraft ? "Đã lưu bản nháp nhiệm vụ thành công" : "Đã ban hành và giao nhiệm vụ thành công!");
      const taskData = unwrapData<any>(res);
      const createdId = taskData?.id;
      if (createdId) {
        router.push(`/services/hrm/work-plans/tasks/${createdId}`);
      } else {
        router.push("/services/hrm/work-plans/tasks");
      }
    } catch {
      toast.error("Có lỗi xảy ra khi tạo nhiệm vụ. Vui lòng thử lại.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      <div className="max-w-[1300px] mx-auto w-full p-4 md:p-6 lg:p-8 space-y-6">
        {/* Top Header & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Link href="/services/hrm/work-plans/tasks" className="hover:text-primary transition-colors flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Quản lý công việc
              </Link>
              <span>/</span>
              <span className="font-semibold text-slate-700">Giao việc mới</span>
            </div>
            <Heading level="h2" className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
              Giao việc & Khởi tạo Nhiệm vụ Công vụ
            </Heading>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/services/hrm/work-plans/tasks">
              <Button variant="outline" size="sm" className="h-9 gap-1.5 text-slate-600">
                Hủy bỏ
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSubmit(true)}
              disabled={createTask.isPending}
              className="h-9 gap-1.5 text-slate-700"
            >
              Lưu nháp
            </Button>
            <Button
              size="sm"
              onClick={() => handleSubmit(false)}
              disabled={createTask.isPending}
              className="h-9 gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
            >
              {createTask.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Ban hành & Giao việc
            </Button>
          </div>
        </div>

        {/* 12-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Form (8 Columns) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Card 1: Thông tin cơ bản & Hồ sơ nhiệm vụ */}
            <Card className="rounded-2xl border-slate-200 bg-white shadow-xs p-6 space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Thông tin cốt lõi & Căn cứ nhiệm vụ</h3>
              </div>

              {/* Tên công việc */}
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-sm font-semibold text-slate-800">
                  Tên nhiệm vụ công vụ <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Ví dụ: Rà soát và thẩm định hồ sơ tuyển dụng viên chức năm 2026..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-10 text-sm font-medium"
                />
              </div>

              {/* Loại công việc & Mức ưu tiên */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Loại nhiệm vụ</Label>
                  <Select value={taskType} onValueChange={(v: any) => setTaskType(v)}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Chọn loại công việc" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="REGULAR">Công việc thường xuyên</SelectItem>
                      <SelectItem value="INCIDENTAL">Việc phát sinh đột xuất</SelectItem>
                      <SelectItem value="PERIODIC">Nhiệm vụ định kỳ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Mức độ ưu tiên</Label>
                  <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Chọn mức ưu tiên" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="URGENT">Khẩn cấp (Đỏ - Pulse)</SelectItem>
                      <SelectItem value="HIGH">Ưu tiên cao</SelectItem>
                      <SelectItem value="NORMAL">Bình thường</SelectItem>
                      <SelectItem value="LOW">Ưu tiên thấp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Chu kỳ nếu là định kỳ */}
              {taskType === "PERIODIC" && (
                <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-1.5">
                  <Label className="text-xs font-semibold text-emerald-900 flex items-center gap-1.5">
                    <Repeat className="w-3.5 h-3.5 text-emerald-600" />
                    Chu kỳ lặp lại nhiệm vụ định kỳ
                  </Label>
                  <Select value={recurrence} onValueChange={(v: any) => setRecurrence(v)}>
                    <SelectTrigger className="h-9 text-xs bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DAILY">Hàng ngày</SelectItem>
                      <SelectItem value="WEEKLY">Hàng tuần</SelectItem>
                      <SelectItem value="MONTHLY">Hàng tháng</SelectItem>
                      <SelectItem value="QUARTERLY">Hàng quý</SelectItem>
                      <SelectItem value="YEARLY">Hàng năm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Căn cứ văn bản pháp lý */}
              <div className="space-y-1.5">
                <Label htmlFor="sourceRef" className="text-xs font-semibold text-slate-700">
                  Căn cứ pháp lý / Số văn bản chỉ đạo (nếu có)
                </Label>
                <Input
                  id="sourceRef"
                  placeholder="Ví dụ: Kế hoạch số 45/KH-UBND ngày 12/03/2026..."
                  value={sourceDocumentRef}
                  onChange={(e) => setSourceDocumentRef(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              {/* Mô tả chi tiết & Tiêu chuẩn đầu ra */}
              <div className="space-y-1.5">
                <Label htmlFor="desc" className="text-xs font-semibold text-slate-700">
                  Nội dung mô tả chi tiết & Yêu cầu sản phẩm đầu ra
                </Label>
                <Textarea
                  id="desc"
                  rows={4}
                  placeholder="Nêu rõ mục tiêu, phạm vi, sản phẩm đầu ra cần hoàn thành, các yêu cầu chất lượng..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="text-xs leading-relaxed"
                />
              </div>
            </Card>

            {/* Card 2: Thời hạn thực hiện */}
            <Card className="rounded-2xl border-slate-200 bg-white shadow-xs p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">Thời gian thực hiện & Hạn chót</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="startDate" className="text-xs font-semibold text-slate-700">
                    Ngày bắt đầu thực hiện
                  </Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="dueDate" className="text-xs font-semibold text-slate-700">
                    Hạn hoàn thành (Deadline) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="dueDate"
                    type="datetime-local"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="h-9 text-xs font-semibold text-slate-800"
                  />
                </div>
              </div>
            </Card>

            {/* Card 3: Phân công Nhân sự & Tỷ lệ gánh vác */}
            <Card className="rounded-2xl border-slate-200 bg-white shadow-xs p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-slate-900 text-base">Phân bổ Nhân sự & Tỷ lệ gánh vác (%)</h3>
                </div>
                <Badge variant="outline" className="text-blue-700 bg-blue-50 border-blue-200 text-xs font-bold">
                  Tổng phân bổ: {assigneePercentage + coordinators.reduce((sum, c) => sum + (c.percentage || 0), 0)}%
                </Badge>
              </div>

              {/* Lọc phòng ban & Chủ trì */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Đơn vị / Phòng ban thực hiện</Label>
                  <Select value={selectedDepartmentId} onValueChange={setSelectedDepartmentId}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Chọn phòng ban" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Toàn cơ quan / Tất cả đơn vị</SelectItem>
                      {departments.map((d: any) => (
                        <SelectItem key={d.id} value={String(d.id)}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">
                    Cán bộ / Đơn vị chủ trì <span className="text-red-500">*</span>
                  </Label>
                  <Select value={assignee} onValueChange={setAssignee}>
                    <SelectTrigger className="h-9 text-xs font-semibold text-slate-800">
                      <SelectValue placeholder="-- Chọn cán bộ chủ trì --" />
                    </SelectTrigger>
                    <SelectContent>
                      {deptLeaders.length > 0 && (
                        <SelectGroup>
                          <SelectLabel className="text-2xs text-blue-700 font-bold">Lãnh đạo đơn vị</SelectLabel>
                          {deptLeaders.map((e: any) => (
                            <SelectItem key={e.code || e.employeeCode} value={e.code || e.employeeCode}>
                              {getEmployeeName(e)} ({getJobTitleLabel(e.jobTitle) || "Lãnh đạo"})
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      )}
                      {deptStaff.length > 0 && (
                        <SelectGroup>
                          <SelectLabel className="text-2xs text-slate-500 font-bold">Chuyên viên phòng ban</SelectLabel>
                          {deptStaff.map((e: any) => (
                            <SelectItem key={e.code || e.employeeCode} value={e.code || e.employeeCode}>
                              {getEmployeeName(e)} ({getJobTitleLabel(e.jobTitle) || "Chuyên viên"})
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      )}
                      {employees.length > 0 && deptLeaders.length === 0 && deptStaff.length === 0 && (
                        <SelectGroup>
                          <SelectLabel className="text-2xs text-slate-500 font-bold">Danh sách cán bộ</SelectLabel>
                          {employees.map((e: any) => (
                            <SelectItem key={e.employeeCode} value={e.employeeCode}>
                              {getEmployeeName(e)} - {e.employeeCode}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tỷ lệ gánh vác của chủ trì */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-blue-50/50 border border-blue-100">
                <div className="min-w-0">
                  <span className="text-xs font-bold text-slate-900 block">Tỷ lệ trách nhiệm Chủ trì</span>
                  <span className="text-2xs text-slate-500">Mức đóng góp chính trong tổng kết quả</span>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={assigneePercentage}
                    onChange={(e) => setAssigneePercentage(Number(e.target.value) || 0)}
                    className="w-20 h-8 text-center text-xs font-bold text-blue-700"
                  />
                  <span className="text-xs font-bold text-slate-600">%</span>
                </div>
              </div>

              {/* Danh sách cán bộ phối hợp */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-slate-800">Cán bộ phối hợp thực hiện</Label>
                  <Select onValueChange={handleAddCoordinator}>
                    <SelectTrigger className="h-8 w-56 text-xs border-dashed">
                      <Plus className="w-3.5 h-3.5 mr-1 text-blue-600" />
                      <span>+ Thêm người phối hợp</span>
                    </SelectTrigger>
                    <SelectContent>
                      {employees
                        .filter((e: any) => e.employeeCode !== assignee && !coordinators.some((c) => c.id === e.employeeCode))
                        .map((e: any) => {
                          const name = getEmployeeName(e);
                          const dept = getDepartmentLabel(e);
                          return (
                            <SelectItem key={e.employeeCode} value={e.employeeCode}>
                              {name} {dept ? `(${dept})` : ""}
                            </SelectItem>
                          );
                        })}
                    </SelectContent>
                  </Select>
                </div>

                {coordinators.length > 0 ? (
                  <div className="space-y-2">
                    {coordinators.map((c) => (
                      <div key={c.id} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50/60">
                        <div className="flex items-center gap-2 min-w-0">
                          <User className="w-4 h-4 text-slate-500 shrink-0" />
                          <span className="text-xs font-semibold text-slate-800 truncate">{c.name}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              min={1}
                              max={100}
                              value={c.percentage}
                              onChange={(e) => {
                                const val = Number(e.target.value) || 0;
                                setCoordinators(coordinators.map((x) => (x.id === c.id ? { ...x, percentage: val } : x)));
                              }}
                              className="w-16 h-7 text-center text-xs font-semibold"
                            />
                            <span className="text-xs text-slate-500">%</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveCoordinator(c.id)}
                            className="h-7 w-7 p-0 text-slate-400 hover:text-red-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Chưa có cán bộ phối hợp. Công việc do cán bộ chủ trì đảm nhận 100%.</p>
                )}
              </div>

              {/* Lãnh đạo giám sát & thẩm định */}
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    Lãnh đạo thẩm định & Giám sát kết quả
                  </Label>
                  {autoDetectedSupervisor && (
                    <Badge variant="outline" className="text-2xs bg-indigo-50 text-indigo-700 border-indigo-200">
                      Gợi ý tự động
                    </Badge>
                  )}
                </div>
                <Select value={supervisorCode} onValueChange={setSupervisorCode}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Chọn lãnh đạo thẩm định" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DEFAULT">Lãnh đạo trực tiếp quản lý đơn vị</SelectItem>
                    {employees.map((e: any) => {
                      const name = getEmployeeName(e);
                      const jt = getJobTitleLabel(e.jobTitle);
                      const dept = getDepartmentLabel(e);
                      const role = jt || dept || e.employeeCode;
                      return (
                        <SelectItem key={e.employeeCode} value={e.employeeCode}>
                          {name} ({role})
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </Card>

            {/* Card 4: Checklist quy trình các bước */}
            <Card className="rounded-2xl border-slate-200 bg-white shadow-xs p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-slate-900 text-base">Phân rã các bước thực hiện (Checklist)</h3>
                </div>
                <Badge variant="outline" className="text-emerald-700 bg-emerald-50 text-xs font-semibold">
                  {initialSteps.length} bước
                </Badge>
              </div>

              {/* Ô thêm bước mới */}
              <div className="flex gap-2">
                <Input
                  placeholder="Nhập tên bước thực hiện (ví dụ: Soạn thảo dự thảo, Lấy ý kiến phòng ban...)"
                  value={newStepTitle}
                  onChange={(e) => setNewStepTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddStep())}
                  className="h-9 text-xs"
                />
                <Button size="sm" onClick={handleAddStep} className="h-9 px-3.5 bg-slate-800 hover:bg-slate-900 text-white shrink-0 text-xs">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Thêm bước
                </Button>
              </div>

              {/* Danh sách các bước */}
              {initialSteps.length > 0 ? (
                <div className="space-y-2 pt-1">
                  {initialSteps.map((step, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/70">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-semibold text-slate-800 truncate">{step.title}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveStep(idx)}
                        className="h-7 w-7 p-0 text-slate-400 hover:text-red-600 shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">Chưa tạo bước quy trình. Có thể bổ sung sau khi công việc đã ban hành.</p>
              )}
            </Card>
          </div>

          {/* Right Sidebar: Định mức KPI & Tóm tắt (4 Columns) */}
          <div className="lg:col-span-4 space-y-6 sticky top-6">
            {/* Card: Cơ chế tính điểm KPI */}
            <Card className="rounded-2xl border-slate-200 bg-white shadow-xs p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Award className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">Định mức & Điểm số KPI (Đề án 01)</h3>
              </div>

              <div className="space-y-3.5">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Điểm cơ số nhiệm vụ</Label>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={baseScore}
                    onChange={(e) => setBaseScore(Number(e.target.value) || 10)}
                    className="h-9 text-xs font-bold text-slate-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-slate-700">Hệ số độ khó (K)</Label>
                    <span className="text-2xs font-bold text-indigo-700">K = {difficultyK}</span>
                  </div>
                  <Select value={String(difficultyK)} onValueChange={(v) => setDifficultyK(Number(v))}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">K = 1.0 (Nhiệm vụ tiêu chuẩn)</SelectItem>
                      <SelectItem value="1.2">K = 1.2 (Độ khó cao / Phức tạp)</SelectItem>
                      <SelectItem value="1.5">K = 1.5 (Đặc biệt quan trọng / Đột xuất)</SelectItem>
                      <SelectItem value="0.8">K = 0.8 (Nhiệm vụ đơn giản, phụ trợ)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-1.5">
                  <span className="text-2xs font-bold text-indigo-900 uppercase tracking-wider block">Ước tính điểm KPI chủ trì</span>
                  <div className="text-xl font-bold text-indigo-700">
                    {Math.round(baseScore * difficultyK * (assigneePercentage / 100))} điểm
                  </div>
                  <span className="text-2xs text-slate-500">Tính trên tỷ lệ đóng góp {assigneePercentage}%</span>
                </div>
              </div>
            </Card>

            {/* Khuyến nghị tải công việc */}
            {selectedDepartmentId && selectedDepartmentId !== "ALL" && (
              <DepartmentWorkloadRecommendation
                departmentId={selectedDepartmentId}
                currentAssigneeCode={assignee}
                onSelectAssignee={(code) => setAssignee(code)}
                onInsertToDescription={(text) =>
                  setDescription((prev) => (prev ? `${prev}\n${text}` : text))
                }
              />
            )}

            {/* Action Card */}
            <Card className="rounded-2xl border-slate-200 bg-white shadow-xs p-5 space-y-3">
              <Button
                size="lg"
                onClick={() => handleSubmit(false)}
                disabled={createTask.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 shadow-sm gap-2"
              >
                {createTask.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                Ban hành & Giao việc ngay
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSubmit(true)}
                disabled={createTask.isPending}
                className="w-full h-10 text-xs font-semibold text-slate-700"
              >
                Lưu làm bản nháp
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
