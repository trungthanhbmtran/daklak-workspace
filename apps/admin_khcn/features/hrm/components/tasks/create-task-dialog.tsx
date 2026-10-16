/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/typography";
import { Label } from "@/components/ui/label";
import {
  CalendarIcon,
  FlagIcon,
  UserIcon,
  AlignLeftIcon,
  TypeIcon,
  CheckCircle2,
  UserCircle2,
  BriefcaseIcon,
  UsersIcon,
  X,
  Loader2,
  Repeat,
  FileText,
  ShieldCheck,
  Sparkles,
  Plus,
  Trash2,
  Award,
  Percent,
  CheckSquare,
  Search,
  Scale,
  AlertCircle,
} from "lucide-react";
import { useCreateTask, useCreateSubTask, useTaskContext, useBalancePercentages } from "../../hooks/useTasks";
import { useHrmEmployeesList } from "../../hooks/useHrmEmployees";
import { useOrganizationFlatListQuery } from "@/features/system-admin/organization/hooks/useOrganizationQueries";
import { useTaskTemplatesList } from "../../hooks/useTaskTemplates";
import { useUser } from "@/hooks/useUser";
import { hrmTasksApi } from "../../api";
import { toast } from "sonner";
import { DepartmentWorkloadRecommendation } from "./department-workload-recommendation";

interface CoordinatorItem {
  id: string;
  name: string;
  percentage: number;
}

export interface TaskInitialStep {
  title: string;
  assigneeCode?: string;
  assigneeName?: string;
  baseScore?: number;
}

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentId?: string | number;
  initialDate?: Date | null;
}

export function CreateTaskDialog({
  open,
  onOpenChange,
  parentId,
  initialDate,
}: CreateTaskDialogProps) {
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
  const [priority, setPriority] = useState("NORMAL");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("");
  const [assignee, setAssignee] = useState("");
  const [assigneePercentage, setAssigneePercentage] = useState<number>(100);
  const [dueDate, setDueDate] = useState("");
  const [coordinators, setCoordinators] = useState<CoordinatorItem[]>([]);
  const [taskType, setTaskType] = useState("ONE_TIME"); // ONE_TIME, REGULAR, PERIODIC
  const [recurrence, setRecurrence] = useState("MONTHLY"); // DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY
  const [type, setType] = useState("TASK"); // TASK, MEETING, STUDY
  const [meetingLink, setMeetingLink] = useState("");

  // VTVL & Trọng số
  const [baseScore, setBaseScore] = useState<number>(100);
  const [weight, setWeight] = useState<number>(1);

  // KPI Targets fields (Tự động bật và tính điểm theo VTVL)
  const [isKpiTarget, setIsKpiTarget] = useState(true);
  const [plannedQty, setPlannedQty] = useState<number>(1);
  const [difficultyK, setDifficultyK] = useState<number>(2);
  const [formulaDomainCode, setFormulaDomainCode] = useState("VTVL_CHUNG");

  // Checklist các bước ban đầu (gắn với cá nhân khác hoặc bản thân người tạo)
  const [initialSteps, setInitialSteps] = useState<TaskInitialStep[]>([]);
  const [stepInput, setStepInput] = useState("");
  const [stepAssignee, setStepAssignee] = useState<string>("SELF");
  const [stepScore, setStepScore] = useState<number | "">("");

  // Template selector
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateSearch, setTemplateSearch] = useState("");

  const isSubTask = !!parentId;

  // ── Smart Defaults ──
  useEffect(() => {
    if (open) {
      if (initialDate) {
        const d = new Date(initialDate);
        if (d.getHours() === 0) d.setHours(17, 30, 0, 0);
        const tzoffset = d.getTimezoneOffset() * 60000;
        const localISOTime = new Date(d.getTime() - tzoffset)
          .toISOString()
          .slice(0, 16);
        setDueDate(localISOTime);
      } else if (!dueDate) {
        const today = new Date();
        today.setDate(today.getDate() + 3);
        today.setHours(17, 30, 0, 0);
        const tzoffset = today.getTimezoneOffset() * 60000;
        const localISOTime = new Date(today.getTime() - tzoffset)
          .toISOString()
          .slice(0, 16);
        setDueDate(localISOTime);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // ── Mutations & Queries ──
  const createTask = useCreateTask();
  const createSubTask = useCreateSubTask();
  const isPending = createTask.isPending || createSubTask.isPending;

  const { data: employeesData } = useHrmEmployeesList({
    pageSize: 200,
    assignableOnly: true,
  }, { enabled: open });
  const employees = (employeesData as any)?.data ?? [];

  const { data: orgData } = useOrganizationFlatListQuery(undefined, { enabled: open });
  const departments = orgData?.data ?? [];

  const { data: templatesData } = useTaskTemplatesList(undefined, { enabled: open && showTemplateModal });
  const rawTemplates = (templatesData as any)?.data ?? [];
  const templates = Array.isArray(rawTemplates) ? rawTemplates : [];

  const filteredTemplates = useMemo(() => {
    if (!templateSearch.trim()) return templates.slice(0, 30);
    const kw = templateSearch.toLowerCase();
    return templates.filter(
      (t: any) =>
        t.taskName?.toLowerCase().includes(kw) ||
        t.rank?.toLowerCase().includes(kw) ||
        t.legalBasis?.toLowerCase().includes(kw)
    );
  }, [templates, templateSearch]);

  // ── Lấy bối cảnh giao việc, phân loại nhân sự & tính điểm chuẩn hóa từ server ──
  const coordinatorIdsParam = useMemo(
    () => coordinators.map((c) => c.id).join(","),
    [coordinators]
  );

  const { data: contextData } = useTaskContext(
    {
      departmentId: selectedDepartmentId && selectedDepartmentId !== "ALL" ? selectedDepartmentId : undefined,
      assignee: assignee || undefined,
      coordinatorIds: coordinatorIdsParam || undefined,
      priority,
    },
    { enabled: open }
  );

  const serverContext = contextData?.data;
  const deptLeaders = serverContext?.deptLeaders ?? [];
  const deptStaff = serverContext?.deptStaff ?? [];
  const stepAssigneeOptions = serverContext?.stepAssigneeOptions ?? { label: "", list: [] };

  // Đồng bộ kết quả chuẩn hóa từ server vào state form
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

  // ── Phân cấp Đơn vị / Phòng ban & Nhân sự ──
  // Tự động đồng bộ selectedDepartmentId khi assignee thay đổi từ preset hoặc template
  useEffect(() => {
    if (assignee) {
      if (assignee.startsWith("DEPT_")) {
        const dId = assignee.replace("DEPT_", "");
        if (selectedDepartmentId !== dId) {
          setSelectedDepartmentId(dId);
        }
      } else {
        const emp = employees.find((e: any) => e.employeeCode === assignee);
        if (emp?.departmentId && selectedDepartmentId !== String(emp.departmentId)) {
          setSelectedDepartmentId(String(emp.departmentId));
        }
      }
    }
  }, [assignee, employees, selectedDepartmentId]);

  const selectedDepartment = useMemo(() => {
    if (!selectedDepartmentId || selectedDepartmentId === "ALL") return null;
    return departments.find((d: any) => String(d.id) === selectedDepartmentId);
  }, [departments, selectedDepartmentId]);


  const handleDepartmentChange = (deptId: string) => {
    setSelectedDepartmentId(deptId);
    if (deptId === "ALL") {
      setAssignee("");
    } else {
      // Mặc định giao cho cả phòng ban để Lãnh đạo phòng phân công tiếp
      setAssignee(`DEPT_${deptId}`);
    }
  };

  // ── Coordinators & Percentages ──
  const handleAddCoordinator = (value: string) => {
    let name = value;
    if (value.startsWith("DEPT_")) {
      const deptId = parseInt(value.replace("DEPT_", ""), 10);
      const dept = departments.find((d: any) => d.id === deptId);
      if (dept) name = `🏢 ${dept.name}`;
    } else {
      const emp = employees.find((e: any) => e.employeeCode === value);
      if (emp) {
        const d = departments.find((x: any) => x.id === emp.departmentId || x.id === emp.department?.id);
        const deptTag = d?.name ? ` (${d.name})` : emp.unitName ? ` (${emp.unitName})` : "";
        name = `👤 ${emp.fullName}${deptTag}`;
      }
    }

    if (!coordinators.find((c) => c.id === value)) {
      const nextCoordinators = [
        ...coordinators,
        { id: value, name, percentage: 10 },
      ];
      setCoordinators(nextCoordinators);
      // Auto adjust assignee percentage
      if (assigneePercentage > 70) {
        setAssigneePercentage(70);
      }
    }
  };

  const removeCoordinator = (id: string) => {
    const next = coordinators.filter((c) => c.id !== id);
    setCoordinators(next);
    if (next.length === 0) {
      setAssigneePercentage(100);
    }
  };

  const updateCoordinatorPct = (id: string, pct: number) => {
    setCoordinators(
      coordinators.map((c) => (c.id === id ? { ...c, percentage: pct } : c))
    );
  };

  const balancePercentagesMutation = useBalancePercentages();

  const handleAutoBalancePercentage = async () => {
    if (coordinators.length === 0) {
      setAssigneePercentage(100);
      return;
    }
    try {
      const res = await balancePercentagesMutation.mutateAsync({
        coordinatorCodes: coordinators.map((c) => c.id),
      });
      if (res?.data) {
        setAssigneePercentage(res.data.assigneePercentage);
        setCoordinators((prev) =>
          prev.map((c) => {
            const found = res.data.coordinators?.find((x) => x.id === c.id);
            return {
              ...c,
              percentage: found ? found.percentage : res.data.coordinatorPercentage,
            };
          })
        );
        toast.success("Đã tự động cân bằng tỷ lệ đóng góp về 100%");
      }
    } catch {
      // Handled in mutation
    }
  };

  const totalPercentage = useMemo(() => {
    if (coordinators.length === 0) return 100;
    const coorsSum = coordinators.reduce(
      (sum, c) => sum + (Number(c.percentage) || 0),
      0
    );
    return (Number(assigneePercentage) || 0) + coorsSum;
  }, [assigneePercentage, coordinators]);

  const handleAddStep = () => {
    if (!stepInput.trim()) return;

    let assignedCode = stepAssignee;
    let assignedName = "Bản thân tôi phụ trách";

    if (assignedCode === "SELF") {
      assignedCode = currentUser?.employeeCode || "";
      assignedName = currentUser?.fullName ? `${currentUser.fullName} (Tôi)` : "Bản thân tôi phụ trách";
    } else if (assignedCode === "ASSIGNEE") {
      assignedCode = assignee;
      if (assignee.startsWith("DEPT_")) {
        const dId = parseInt(assignee.replace("DEPT_", ""), 10);
        const dept = departments.find((d: any) => d.id === dId);
        assignedName = dept ? `🏢 ${dept.name} (Chủ trì)` : "Phòng ban chủ trì";
      } else {
        const emp = [...deptLeaders, ...deptStaff, ...employees].find((e: any) => e.employeeCode === assignee);
        assignedName = emp?.fullName ? `${emp.fullName} (Chủ trì)` : `Chủ trì (${assignee})`;
      }
    } else {
      const emp = [...deptLeaders, ...deptStaff, ...(stepAssigneeOptions.list || []), ...employees].find((e: any) => e.employeeCode === assignedCode);
      assignedName = emp?.fullName ? `${emp.fullName}` : assignedCode;
    }

    setInitialSteps([
      ...initialSteps,
      {
        title: stepInput.trim(),
        assigneeCode: assignedCode || undefined,
        assigneeName: assignedName,
        baseScore: stepScore === "" ? undefined : Number(stepScore),
      },
    ]);
    setStepInput("");
    setStepScore("");
  };

  const handleRemoveStep = (index: number) => {
    setInitialSteps(initialSteps.filter((_, i) => i !== index));
  };

  // ── Preset & Template Applying ──
  const applyQuickPreset = (
    presetTitle: string,
    presetPriority: string = "NORMAL",
    tType: string = "ONE_TIME",
    presetRecurrence?: string,
    evtType: string = "TASK",
    legalRef?: string
  ) => {
    setTitle(presetTitle);
    setPriority(presetPriority);
    setTaskType(tType);
    setType(evtType);
    if (presetRecurrence) setRecurrence(presetRecurrence);
    if (legalRef) setSourceDocumentRef(legalRef);
  };

  const handleApplyTemplate = (tpl: any) => {
    setTitle(tpl.taskName || "");
    if (tpl.legalBasis) setSourceDocumentRef(tpl.legalBasis);
    if (tpl.defaultWeight) setWeight(Number(tpl.defaultWeight));
    if (tpl.standardDurationDays && !dueDate) {
      const target = new Date();
      target.setDate(target.getDate() + Number(tpl.standardDurationDays));
      const tzoffset = target.getTimezoneOffset() * 60000;
      setDueDate(new Date(target.getTime() - tzoffset).toISOString().slice(0, 16));
    }
    setShowTemplateModal(false);
    toast.success(`Đã áp dụng mẫu nhiệm vụ: ${tpl.taskName}`);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setSourceDocumentRef("");
    setSupervisorCode("DEFAULT");
    setAutoDetectedSupervisor(null);
    setPriority("NORMAL");
    setSelectedDepartmentId("");
    setAssignee("");
    setAssigneePercentage(100);
    setDueDate("");
    setCoordinators([]);
    setTaskType("ONE_TIME");
    setRecurrence("MONTHLY");
    setType("TASK");
    setMeetingLink("");
    setBaseScore(100);
    setWeight(1);
    setIsKpiTarget(true);
    setPlannedQty(1);
    setDifficultyK(2);
    setFormulaDomainCode("VTVL_CHUNG");
    setInitialSteps([]);
    setStepInput("");
    setStepAssignee("SELF");
    setStepScore("");
    setShowTemplateModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Vui lòng nhập tiêu đề công việc");
      return;
    }
    if (!assignee) {
      toast.error("Vui lòng chọn người/đơn vị nhận việc");
      return;
    }
    if (!dueDate) {
      toast.error("Vui lòng chọn thời hạn hoàn thành");
      return;
    }

    const payload: any = {
      title: title.trim(),
      description: description.trim() || undefined,
      sourceDocumentRef: sourceDocumentRef.trim() || undefined,
      supervisorCode: supervisorCode && supervisorCode !== "DEFAULT" ? supervisorCode : undefined,
      priority,
      dueDate,
      assignee,
      assigneePercentage: coordinators.length > 0 ? Number(assigneePercentage) : 100,
      coordinators: coordinators.map((c) => c.id),
      coassigneePercentages:
        coordinators.length > 0
          ? coordinators.map((c) => Number(c.percentage) || 0)
          : undefined,
      taskType,
      type,
      meetingLink:
        (type === "MEETING" || type === "STUDY") && meetingLink.trim()
          ? meetingLink.trim()
          : undefined,
      recurrence: taskType === "PERIODIC" ? recurrence : undefined,
      baseScore: Number(baseScore) || 0,
      weight: Number(weight) || 1,
      initialSteps:
        initialSteps.length > 0
          ? initialSteps.map((s) => ({
              title: s.title,
              assigneeCode: s.assigneeCode || undefined,
              baseScore: s.baseScore || 0,
            }))
          : undefined,
      metadata: {
        taskType,
        isIncidental: taskType === "UNPLANNED",
        sourceDocumentRef: sourceDocumentRef.trim() || undefined,
        ...(isKpiTarget
          ? {
              isKpiTarget: taskType !== "UNPLANNED", // Bắt buộc Lãnh đạo thẩm định duyệt mới tính KPI
              isKpiTargetPendingApproval: taskType === "UNPLANNED",
              plannedQty,
              difficultyK,
              ...(formulaDomainCode.trim()
                ? { domainCode: formulaDomainCode.trim().toUpperCase() }
                : {}),
            }
          : {}),
      },
    };

    try {
      if (isSubTask) {
        await createSubTask.mutateAsync({
          parentId: Number(parentId),
          payload,
        });
      } else {
        await createTask.mutateAsync(payload);
      }
      toast.success(
        isSubTask ? "Đã tạo nhiệm vụ con thành công" : "Đã giao việc thành công"
      );
      resetForm();
      onOpenChange(false);
    } catch {
      // Handled in hooks
    }
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        if (!isPending) {
          if (!v) resetForm();
          onOpenChange(v);
        }
      }}
    >
      <SheetContent
        side="right"
        className="w-full sm:max-w-3xl max-w-full flex flex-col p-0 gap-0 border-l border-slate-200 dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-950 overflow-hidden"
      >
        {/* TẦNG 1: HEADER CỐ ĐỊNH */}
        <div className="shrink-0 p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm max-w-full min-w-0">
          <SheetHeader className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600 text-white shadow-md shadow-blue-500/20">
                <BriefcaseIcon className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <SheetTitle className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span>{isSubTask ? "Giao việc con (Phân rã nhiệm vụ)" : "Giao việc mới"}</span>
                  <Badge variant="outline" className="text-xs bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 font-normal">
                    Chuẩn VTVL & KPI
                  </Badge>
                </SheetTitle>
                <SheetDescription className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {isSubTask
                    ? `Nhiệm vụ trực thuộc công việc cha #${parentId}`
                    : "Thiết lập thông tin, phân định trách nhiệm chủ trì - phối hợp và lãnh đạo phê duyệt."}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {/* Quick Presets & Mẫu VTVL Button */}
          <div className="mt-3.5 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <Text as="span" variant="small" weight="medium" className="text-slate-500 shrink-0">
              Mẫu nhanh:
            </Text>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 h-7 px-2.5 text-xs bg-blue-50/80 hover:bg-blue-100 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300 font-medium shrink-0"
              onClick={() => setShowTemplateModal(!showTemplateModal)}
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Thư viện VTVL ({templates.length})
            </Button>
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors shrink-0"
              onClick={() =>
                applyQuickPreset(
                  "Báo cáo tuần thực hiện nhiệm vụ",
                  "NORMAL",
                  "PERIODIC",
                  "WEEKLY",
                  "TASK",
                  "Quy chế làm việc cơ quan"
                )
              }
            >
              Báo cáo tuần
            </Badge>
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors shrink-0"
              onClick={() =>
                applyQuickPreset(
                  "Báo cáo tháng công tác chuyên môn",
                  "NORMAL",
                  "PERIODIC",
                  "MONTHLY",
                  "TASK",
                  "Quyết định số 15/QĐ-UBND"
                )
              }
            >
              Báo cáo tháng
            </Badge>
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 transition-colors shrink-0"
              onClick={() =>
                applyQuickPreset(
                  "Soạn thảo văn bản chỉ đạo (Hỏa tốc)",
                  "URGENT",
                  "ONE_TIME",
                  undefined,
                  "TASK",
                  "Thông báo Kết luận Thường trực"
                )
              }
            >
              Văn bản hỏa tốc
            </Badge>
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300 transition-colors shrink-0"
              onClick={() =>
                applyQuickPreset(
                  "Họp giao ban định kỳ chuyên môn",
                  "NORMAL",
                  "PERIODIC",
                  "WEEKLY",
                  "MEETING"
                )
              }
            >
              Họp giao ban
            </Badge>
          </div>

          {/* Selector Dropdown Thư viện VTVL */}
          {showTemplateModal && (
            <div className="mt-3 p-3 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-800 dark:text-blue-300">
                  <Scale className="w-4 h-4 text-blue-600" />
                  Chọn từ Danh mục Nhiệm vụ Vị trí việc làm chuẩn hóa
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-slate-500 hover:text-slate-800"
                  onClick={() => setShowTemplateModal(false)}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <Input
                  value={templateSearch}
                  onChange={(e) => setTemplateSearch(e.target.value)}
                  placeholder="Tìm theo tên nhiệm vụ, ngạch công chức, căn cứ pháp lý..."
                  className="h-8 pl-8 text-xs bg-white dark:bg-slate-900 border-blue-200 dark:border-blue-800"
                />
              </div>
              <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1 text-xs">
                {filteredTemplates.length > 0 ? (
                  filteredTemplates.map((t: any) => (
                    <div
                      key={t.id}
                      onClick={() => handleApplyTemplate(t)}
                      className="p-2 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/40 cursor-pointer transition-all flex items-start justify-between gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-slate-800 dark:text-slate-200 wrap-break-word">
                          {t.taskName}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex flex-wrap gap-2">
                          <span className="text-blue-600 dark:text-blue-400 font-medium">
                            {t.rankNameVN || t.rank}
                          </span>
                          {t.legalBasis && (
                            <span className="italic truncate max-w-[280px]">
                              Căn cứ: {t.legalBasis}
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-[10px] shrink-0 font-normal">
                        Trọng số: {t.defaultWeight || 1}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="py-4 text-center text-slate-500 text-xs">
                    Không tìm thấy mẫu nhiệm vụ phù hợp
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* TẦNG 2: FORM BODY CUỘN TỰ NHIÊN */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-6 space-y-6 min-w-0 pr-4">
            {/* NHÓM 1: TIÊU ĐỀ & CĂN CỨ VĂN BẢN */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                  <TypeIcon className="w-4 h-4 text-blue-600" /> Tiêu đề công việc <span className="text-red-500">*</span>
                </Label>
                <Input
                  required
                  placeholder="VD: Thẩm định hồ sơ bổ nhiệm cán bộ phòng ban..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-base h-11 transition-all focus-visible:ring-blue-500 font-medium"
                />
              </div>

              {/* Căn cứ văn bản nguồn (sourceDocumentRef) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                    <FileText className="w-4 h-4 text-blue-600" /> Căn cứ văn bản giao việc
                  </Label>
                  <span className="text-[11px] text-slate-500">
                    (Quyết định, Kế hoạch, Thông báo kết luận...)
                  </span>
                </div>
                <Input
                  placeholder="VD: Thông báo Kết luận số 142-TB/BTCTU, Quyết định số 25/QĐ-UBND..."
                  value={sourceDocumentRef}
                  onChange={(e) => setSourceDocumentRef(e.target.value)}
                  className="h-10 text-sm transition-all focus-visible:ring-blue-500"
                />
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5 text-[11px] text-slate-500">
                  <span className="text-slate-400">Gợi ý nhanh:</span>
                  <button
                    type="button"
                    onClick={() => setSourceDocumentRef("Thông báo Kết luận số ")}
                    className="px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    + TB Kết luận
                  </button>
                  <button
                    type="button"
                    onClick={() => setSourceDocumentRef("Quyết định số ")}
                    className="px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    + Quyết định
                  </button>
                  <button
                    type="button"
                    onClick={() => setSourceDocumentRef("Kế hoạch số ")}
                    className="px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    + Kế hoạch
                  </button>
                  <button
                    type="button"
                    onClick={() => setSourceDocumentRef("Công văn số ")}
                    className="px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    + Công văn
                  </button>
                </div>
              </div>

              {/* Nội dung chi tiết */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                  <AlignLeftIcon className="w-4 h-4 text-slate-400" /> Nội dung chi tiết & Sản phẩm yêu cầu
                </Label>
                <Textarea
                  placeholder="Mô tả cụ thể mục tiêu, tài liệu tham khảo, yêu cầu chất lượng và sản phẩm đầu ra hoàn thành..."
                  className="min-h-[110px] resize-y transition-all focus-visible:ring-blue-500 text-sm leading-relaxed"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            {/* NHÓM 2: PHÂN CÔNG NHÂN SỰ & NGƯỜI THẨM ĐỊNH PHÊ DUYỆT */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/30 space-y-4 min-w-0">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100 pb-1 border-b border-slate-200 dark:border-slate-800">
                <UsersIcon className="w-4 h-4 text-blue-600" />
                Phân công Trách nhiệm & Thẩm quyền
              </div>

              {/* Phân cấp: Chọn phòng ban trước -> Từ phòng ban chọn lãnh đạo/chuyên viên hoặc giao cả phòng */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-0">
                {/* 1. Chọn Phòng ban chủ trì */}
                <div className="space-y-2 min-w-0">
                  <Label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <UsersIcon className="w-3.5 h-3.5 text-blue-600" />
                    Đơn vị / Phòng ban chủ trì <span className="text-red-500">*</span>
                  </Label>
                  <Select value={selectedDepartmentId} onValueChange={handleDepartmentChange}>
                    <SelectTrigger className="w-full bg-white dark:bg-slate-950 h-10 text-sm focus:ring-blue-500 shadow-sm min-w-0">
                      <SelectValue placeholder="Chọn phòng ban chủ trì..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {departments.map((dept: any) => {
                        const count = employees.filter(
                          (e: any) => e.departmentId === dept.id || e.department?.id === dept.id
                        ).length;
                        return (
                          <SelectItem key={`DEPT_OPT_${dept.id}`} value={String(dept.id)}>
                            <div className="flex items-center justify-between gap-2 w-full truncate">
                              <span className="truncate">🏢 {dept.name}</span>
                              {count > 0 && (
                                <span className="text-[10px] text-slate-400 font-normal shrink-0">
                                  ({count} nhân sự)
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* 2. Chủ trì nhận việc (Giao cả phòng hoặc cá nhân trong phòng) */}
                <div className="space-y-2 min-w-0">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <UserIcon className="w-3.5 h-3.5 text-blue-600" />
                      Chủ trì nhận việc <span className="text-red-500">*</span>
                    </Label>
                    {selectedDepartment && (
                      <Badge variant="outline" className="text-[10px] text-blue-700 bg-blue-50 border-blue-200 truncate max-w-[140px] font-normal">
                        {selectedDepartment.name}
                      </Badge>
                    )}
                  </div>
                  <Select
                    value={assignee}
                    onValueChange={setAssignee}
                    required
                    disabled={!selectedDepartmentId}
                  >
                    <SelectTrigger className="w-full bg-white dark:bg-slate-950 h-10 text-sm focus:ring-blue-500 shadow-sm min-w-0 disabled:opacity-60">
                      <SelectValue
                        placeholder={
                          selectedDepartmentId
                            ? "Chọn người hoặc giao cả phòng..."
                            : "← Vui lòng chọn phòng ban trước"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="max-h-[320px]">
                      {selectedDepartmentId && (
                        <SelectGroup>
                          <SelectLabel className="text-[11px] text-blue-600 uppercase font-bold">
                            Tập thể phòng ban
                          </SelectLabel>
                          <SelectItem value={`DEPT_${selectedDepartmentId}`}>
                            <div className="flex items-center gap-2 font-semibold text-blue-700 dark:text-blue-300">
                              <UsersIcon className="w-4 h-4 text-blue-600 shrink-0" />
                              <span className="truncate">
                                🏢 Giao cho cả phòng ban (Lãnh đạo phòng sẽ phân công tiếp)
                              </span>
                            </div>
                          </SelectItem>
                        </SelectGroup>
                      )}

                      {deptLeaders.length > 0 && (
                        <SelectGroup>
                          <SelectLabel className="text-[11px] text-amber-600 uppercase font-bold">
                            Lãnh đạo phòng ban ({deptLeaders.length})
                          </SelectLabel>
                          {deptLeaders.map((emp: any) => (
                            <SelectItem key={emp.employeeCode} value={emp.employeeCode}>
                              <div className="flex items-center gap-2 truncate">
                                <UserCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                                <span className="font-medium truncate">{emp.fullName}</span>
                                <span className="text-xs text-amber-600/80 shrink-0">
                                  ({emp.jobTitleName || "Lãnh đạo phòng"})
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      )}

                      {deptStaff.length > 0 && (
                        <SelectGroup>
                          <SelectLabel className="text-[11px] text-slate-500 uppercase font-semibold">
                            Chuyên viên & Nhân sự ({deptStaff.length})
                          </SelectLabel>
                          {deptStaff.map((emp: any) => (
                            <SelectItem key={emp.employeeCode} value={emp.employeeCode}>
                              <div className="flex items-center gap-2 truncate">
                                <UserIcon className="w-4 h-4 text-slate-500 shrink-0" />
                                <span className="truncate">{emp.fullName}</span>
                                <span className="text-xs text-slate-400 shrink-0">
                                  ({emp.jobTitleName || emp.employeeCode})
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      )}

                      {deptLeaders.length === 0 && deptStaff.length === 0 && selectedDepartmentId && (
                        <div className="p-3 text-center text-xs text-slate-500">
                          Chưa có dữ liệu nhân sự thuộc phòng ban này. Bạn có thể giao trực tiếp cho cả phòng.
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* TÌNH HÌNH TẢI CÔNG VIỆC PHÒNG BAN & ĐỀ XUẤT PHÂN CÔNG THÔNG MINH */}
              {selectedDepartmentId && (
                <DepartmentWorkloadRecommendation
                  departmentId={selectedDepartmentId}
                  departmentName={selectedDepartment?.name}
                  currentAssigneeCode={assignee}
                  onSelectAssignee={(code) => setAssignee(code)}
                  onInsertToDescription={(textToInsert) =>
                    setDescription((prev) => (prev ? prev + textToInsert : textToInsert.trimStart()))
                  }
                />
              )}

              {/* LÃNH ĐẠO THẨM ĐỊNH & PHÊ DUYỆT (TaskRole.APPROVER) */}
              <div className="space-y-2 min-w-0 pt-2 border-t border-slate-200/80 dark:border-slate-800/80">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Lãnh đạo thẩm định & Phê duyệt
                  </Label>
                  <Badge variant="outline" className="text-[10px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800">
                    Người duyệt kết quả
                  </Badge>
                </div>
                <Select value={supervisorCode} onValueChange={setSupervisorCode}>
                  <SelectTrigger className="w-full bg-white dark:bg-slate-950 h-10 text-sm focus:ring-emerald-500 shadow-sm border-slate-200 min-w-0">
                    <SelectValue placeholder="Chọn lãnh đạo phụ trách..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    <SelectItem value="DEFAULT">-- Mặc định người giao việc --</SelectItem>
                    {autoDetectedSupervisor && (
                      <SelectItem value={autoDetectedSupervisor.code}>
                        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-medium">
                          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="truncate">{autoDetectedSupervisor.name} (Tự động theo Định biên)</span>
                        </div>
                      </SelectItem>
                    )}
                    {employees
                      .filter((emp: any) => emp.employeeCode !== autoDetectedSupervisor?.code)
                      .map((emp: any) => (
                        <SelectItem key={emp.employeeCode} value={emp.employeeCode}>
                          <div className="flex items-center gap-2 truncate">
                            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="truncate">{emp.fullName}</span>
                            <span className="text-xs text-slate-400 shrink-0">({emp.jobTitleName || emp.employeeCode})</span>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>

                {/* Thẻ hiển thị căn cứ VTVL & Thẩm quyền PBAC */}
                {autoDetectedSupervisor && (
                  <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300 shadow-sm min-w-0">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-emerald-900 dark:text-emerald-200">
                          Tự động xác định theo VTVL & Thẩm quyền:
                        </span>
                        {supervisorCode !== autoDetectedSupervisor.code ? (
                          <button
                            type="button"
                            onClick={() => setSupervisorCode(autoDetectedSupervisor.code)}
                            className="text-emerald-700 dark:text-emerald-400 underline font-medium hover:text-emerald-900 cursor-pointer"
                          >
                            (Đặt lại theo chuẩn VTVL)
                          </button>
                        ) : (
                          <Badge className="text-[10px] h-4 bg-emerald-600 text-white font-normal">
                            Chuẩn VTVL Đề án 01
                          </Badge>
                        )}
                      </div>
                      <div className="text-slate-700 dark:text-slate-300 font-medium truncate">
                        {autoDetectedSupervisor.name}
                        {autoDetectedSupervisor.jobTitle ? ` - ${autoDetectedSupervisor.jobTitle}` : ""}
                        {autoDetectedSupervisor.unitName ? ` (${autoDetectedSupervisor.unitName})` : ""}
                      </div>
                      <div className="text-[10.5px] text-emerald-700/90 dark:text-emerald-400/90 wrap-break-word">
                        {autoDetectedSupervisor.reason}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Phối hợp thực hiện */}
              <div className="space-y-2 pt-2 border-t border-slate-200/80 dark:border-slate-800/80 min-w-0">
                <Label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <UsersIcon className="w-3.5 h-3.5 text-slate-500" /> Nhân sự / Đơn vị phối hợp thực hiện
                </Label>
                <Select value="" onValueChange={handleAddCoordinator}>
                  <SelectTrigger className="w-full bg-white dark:bg-slate-950 h-9 border-dashed text-slate-500 focus:ring-blue-500 shadow-sm text-xs min-w-0">
                    <SelectValue placeholder="+ Thêm người / đơn vị phối hợp..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {departments.length > 0 && (
                      <SelectGroup>
                        <SelectLabel className="text-xs text-slate-500 uppercase font-semibold">Phòng ban</SelectLabel>
                        {departments
                          .filter((d: any) => `DEPT_${d.id}` !== assignee && !coordinators.find((c) => c.id === `DEPT_${d.id}`))
                          .map((dept: any) => (
                            <SelectItem key={`DEPT_${dept.id}`} value={`DEPT_${dept.id}`}>
                              🏢 {dept.name}
                            </SelectItem>
                          ))}
                      </SelectGroup>
                    )}
                    {employees.length > 0 && (
                      <SelectGroup>
                        <SelectLabel className="text-xs text-slate-500 uppercase font-semibold">Nhân viên</SelectLabel>
                        {employees
                          .filter((e: any) => e.employeeCode !== assignee && !coordinators.find((c) => c.id === e.employeeCode))
                          .map((emp: any) => {
                            const d = departments.find((x: any) => x.id === emp.departmentId || x.id === emp.department?.id);
                            return (
                              <SelectItem key={emp.employeeCode} value={emp.employeeCode}>
                                <div className="flex items-center gap-1.5 truncate">
                                  <span>👤 {emp.fullName}</span>
                                  <span className="text-[11px] text-slate-400">
                                    ({d?.name || emp.unitName || emp.jobTitleName || emp.employeeCode})
                                  </span>
                                </div>
                              </SelectItem>
                            );
                          })}
                      </SelectGroup>
                    )}
                  </SelectContent>
                </Select>

                {/* Danh sách người phối hợp & Phân chia % đóng góp */}
                {coordinators.length > 0 && (
                  <div className="mt-3 space-y-2.5 p-3 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs pb-1 border-b">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                        <Percent className="w-3.5 h-3.5 text-blue-600" />
                        Phân bổ tỷ lệ % đóng góp
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`text-[11px] font-medium ${
                            totalPercentage === 100
                              ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40"
                              : "bg-red-50 text-red-700 border-red-300 dark:bg-red-950/40"
                          }`}
                        >
                          Tổng: {totalPercentage}% {totalPercentage === 100 ? "✓" : "≠ 100%"}
                        </Badge>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-[11px] text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={handleAutoBalancePercentage}
                        >
                          Cân bằng 100%
                        </Button>
                      </div>
                    </div>

                    {/* Chủ trì % */}
                    <div className="flex items-center justify-between gap-3 text-xs py-1">
                      <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200 truncate min-w-0">
                        <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200 shrink-0">
                          Chủ trì
                        </Badge>
                        <span className="truncate">Người nhận việc chính</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Input
                          type="number"
                          min={1}
                          max={100}
                          value={assigneePercentage}
                          onChange={(e) => setAssigneePercentage(Number(e.target.value))}
                          className="w-16 h-7 text-xs text-right pr-2"
                        />
                        <span className="text-slate-400">%</span>
                      </div>
                    </div>

                    {/* Danh sách phối hợp % */}
                    {coordinators.map((c) => (
                      <div key={c.id} className="flex items-center justify-between gap-3 text-xs py-1">
                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 truncate min-w-0">
                          <Badge variant="secondary" className="text-[10px] shrink-0 font-normal">
                            Phối hợp
                          </Badge>
                          <span className="truncate">{c.name}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Input
                            type="number"
                            min={1}
                            max={100}
                            value={c.percentage}
                            onChange={(e) => updateCoordinatorPct(c.id, Number(e.target.value))}
                            className="w-16 h-7 text-xs text-right pr-2"
                          />
                          <span className="text-slate-400">%</span>
                          <button
                            type="button"
                            onClick={() => removeCoordinator(c.id)}
                            className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* NHÓM 3: LOẠI SỰ KIỆN, TÍNH CHẤT, THỜI HẠN & MỨC ƯU TIÊN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Loại sự kiện */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <CalendarIcon className="w-3.5 h-3.5 text-slate-500" /> Loại sự kiện
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  <div
                    onClick={() => setType("TASK")}
                    className={`cursor-pointer text-center px-1 py-2 text-xs font-medium rounded-md border transition-all ${
                      type === "TASK"
                        ? "bg-blue-50 border-blue-300 text-blue-700 shadow-sm"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Công việc
                  </div>
                  <div
                    onClick={() => setType("MEETING")}
                    className={`cursor-pointer text-center px-1 py-2 text-xs font-medium rounded-md border transition-all ${
                      type === "MEETING"
                        ? "bg-amber-50 border-amber-300 text-amber-700 shadow-sm"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Lịch họp
                  </div>
                  <div
                    onClick={() => setType("STUDY")}
                    className={`cursor-pointer text-center px-1 py-2 text-xs font-medium rounded-md border transition-all ${
                      type === "STUDY"
                        ? "bg-purple-50 border-purple-300 text-purple-700 shadow-sm"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Lịch học
                  </div>
                </div>
              </div>

              {/* Tính chất */}
              <div className="space-y-2 col-span-2">
                <Label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <BriefcaseIcon className="w-3.5 h-3.5 text-slate-500" /> Tính chất nhiệm vụ
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  <div
                    onClick={() => setTaskType("ONE_TIME")}
                    className={`cursor-pointer text-center px-2 py-2 text-xs font-medium rounded-md border transition-all ${
                      taskType === "ONE_TIME"
                        ? "bg-blue-50 border-blue-300 text-blue-700 shadow-sm"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Trong kế hoạch
                  </div>
                  <div
                    onClick={() => {
                      setTaskType("PERIODIC");
                      if (recurrence === "NONE") setRecurrence("MONTHLY");
                    }}
                    className={`cursor-pointer text-center px-2 py-2 text-xs font-medium rounded-md border transition-all ${
                      taskType === "PERIODIC" || taskType === "REGULAR"
                        ? "bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Định kỳ
                  </div>
                  <div
                    onClick={() => setTaskType("UNPLANNED")}
                    className={`cursor-pointer text-center px-2 py-2 text-xs font-medium rounded-md border transition-all ${
                      taskType === "UNPLANNED"
                        ? "bg-amber-50 border-amber-300 text-amber-700 shadow-sm font-semibold"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    ⚡ Việc phát sinh
                  </div>
                </div>

                {taskType === "UNPLANNED" && (
                  <div className="p-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2 mt-2 animate-in fade-in duration-200">
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-semibold text-amber-800 dark:text-amber-300">
                        Quy định phê duyệt việc phát sinh:
                      </p>
                      <p className="leading-relaxed">
                        Nhiệm vụ phát sinh ngoài kế hoạch khi tạo mới sẽ ở trạng thái <strong>Chờ lãnh đạo duyệt</strong>. Phải có sự đồng ý của <strong>Lãnh đạo phụ trách thẩm định</strong> duyệt thì mới chính thức tính là việc phát sinh và tính điểm KPI.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Tần suất lặp lại nếu định kỳ */}
              {(taskType === "PERIODIC" || taskType === "REGULAR") && (
                <div className="space-y-2 col-span-2">
                  <Label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <Repeat className="w-3.5 h-3.5 text-emerald-600" /> Tần suất lặp lại định kỳ
                  </Label>
                  <Select
                    value={taskType === "REGULAR" ? "NONE" : recurrence}
                    onValueChange={(val) => {
                      if (val === "NONE") {
                        setTaskType("REGULAR");
                      } else {
                        setTaskType("PERIODIC");
                        setRecurrence(val);
                      }
                    }}
                  >
                    <SelectTrigger className="w-full bg-white dark:bg-slate-950 h-9 text-xs min-w-0 [&>span]:truncate">
                      <SelectValue placeholder="Chọn tần suất..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONE">Chỉ thường xuyên (Không lặp lại)</SelectItem>
                      <SelectItem value="DAILY">Hàng ngày</SelectItem>
                      <SelectItem value="WEEKLY">Hàng tuần</SelectItem>
                      <SelectItem value="MONTHLY">Hàng tháng</SelectItem>
                      <SelectItem value="QUARTERLY">Hàng quý</SelectItem>
                      <SelectItem value="YEARLY">Hàng năm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Link họp online nếu là MEETING/STUDY */}
              {(type === "MEETING" || type === "STUDY") && (
                <div className="space-y-2 col-span-2">
                  <Label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <CalendarIcon className="w-3.5 h-3.5 text-slate-400" /> Link họp / học trực tuyến
                  </Label>
                  <Input
                    placeholder="VD: https://meet.google.com/... hoặc link phòng họp trực tuyến"
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    className="bg-white dark:bg-slate-950 h-9 text-xs"
                  />
                </div>
              )}

              {/* Thời hạn hoàn thành */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <CalendarIcon className="w-3.5 h-3.5 text-blue-600" /> Thời hạn hoàn thành <span className="text-red-500">*</span>
                </Label>
                <Input
                  required
                  type="datetime-local"
                  value={dueDate}
                  min={new Date().toISOString().slice(0, 16)}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="bg-white dark:bg-slate-950 h-10 text-sm focus-visible:ring-blue-500 shadow-sm"
                />
              </div>

              {/* Mức độ ưu tiên */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <FlagIcon className="w-3.5 h-3.5 text-slate-400" /> Mức độ ưu tiên
                </Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="w-full bg-white dark:bg-slate-950 h-10 text-sm focus:ring-blue-500 shadow-sm min-w-0 [&>span]:truncate">
                    <SelectValue placeholder="Chọn mức độ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">
                      <div className="flex items-center gap-2 font-medium">
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-400"></div> Thấp
                      </div>
                    </SelectItem>
                    <SelectItem value="NORMAL">
                      <div className="flex items-center gap-2 font-medium">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div> Bình thường
                      </div>
                    </SelectItem>
                    <SelectItem value="HIGH">
                      <div className="flex items-center gap-2 font-medium">
                        <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div> Cao (Ưu tiên)
                      </div>
                    </SelectItem>
                    <SelectItem value="URGENT">
                      <div className="flex items-center gap-2 font-medium">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></div> Hỏa tốc / Khẩn cấp
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* NHÓM 4: CHECKLIST CÁC BƯỚC THỰC HIỆN BAN ĐẦU (Gắn người phụ trách) */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-3">
              <div className="flex items-center justify-between pb-1 border-b">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-blue-600" />
                  <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Checklist các mốc / bước thực hiện ban đầu
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 font-normal">
                    {initialSteps.length} bước được giao
                  </Badge>
                </div>
              </div>

              {/* Form thêm bước mới với người phụ trách cụ thể */}
              <div className="space-y-2 p-3 rounded-lg bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Tên bước thực hiện (VD: Soạn dự thảo, Thẩm định hồ sơ...)..."
                    value={stepInput}
                    onChange={(e) => setStepInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddStep();
                      }
                    }}
                    className="h-9 text-xs bg-white dark:bg-slate-950 flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddStep}
                    disabled={!stepInput.trim()}
                    className="h-9 px-3 text-xs gap-1 shrink-0 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300"
                  >
                    <Plus className="w-3.5 h-3.5" /> Thêm bước
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                  {/* Chọn người phụ trách bước */}
                  <div className="space-y-1 min-w-0">
                    <Label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      <UserIcon className="w-3 h-3 text-blue-500" /> Người phụ trách bước:
                    </Label>
                    <Select value={stepAssignee} onValueChange={setStepAssignee}>
                      <SelectTrigger className="w-full h-8 text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 min-w-0 [&>span]:truncate">
                        <SelectValue placeholder="Chọn người phụ trách bước..." />
                      </SelectTrigger>
                      <SelectContent className="max-h-[250px]">
                        <SelectItem value="SELF">
                          <div className="flex items-center gap-1.5 font-medium text-purple-700 dark:text-purple-300">
                            <span>👤 Bản thân tôi phụ trách</span>
                            {currentUser?.fullName && <span className="text-[11px] text-slate-400">({currentUser.fullName})</span>}
                          </div>
                        </SelectItem>
                        {assignee && (
                          <SelectItem value="ASSIGNEE">
                            <div className="flex items-center gap-1.5 font-medium text-blue-700 dark:text-blue-300">
                              <span>🎯 Người chủ trì nhận việc</span>
                              <span className="text-[11px] text-slate-400">
                                ({assignee.startsWith("DEPT_")
                                  ? departments.find((d: any) => `DEPT_${d.id}` === assignee)?.name || "Cả phòng ban"
                                  : employees.find((e: any) => e.employeeCode === assignee)?.fullName || assignee})
                              </span>
                            </div>
                          </SelectItem>
                        )}
                        {stepAssigneeOptions.list.length > 0 && (
                          <SelectGroup>
                            <SelectLabel className="text-[10px] text-blue-600 dark:text-blue-400 uppercase font-semibold">
                              {stepAssigneeOptions.label}
                            </SelectLabel>
                            {stepAssigneeOptions.list.map((emp: any) => (
                              <SelectItem key={emp.employeeCode} value={emp.employeeCode}>
                                <div className="flex items-center gap-1.5 truncate">
                                  <span>👤 {emp.fullName}</span>
                                  <span className="text-[10px] text-slate-400">({emp.jobTitleName || emp.employeeCode})</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Điểm KPI của bước */}
                  <div className="space-y-1">
                    <Label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      <Award className="w-3 h-3 text-amber-500" /> Điểm cơ sở bước (tùy chọn):
                    </Label>
                    <Input
                      type="number"
                      placeholder="VD: 20 điểm"
                      min={0}
                      value={stepScore}
                      onChange={(e) => setStepScore(e.target.value === "" ? "" : Number(e.target.value))}
                      className="h-8 text-xs bg-slate-50 dark:bg-slate-900 border-slate-200"
                    />
                  </div>
                </div>
              </div>

              {/* Danh sách các bước đã thêm */}
              {initialSteps.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  {initialSteps.map((s, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs shadow-sm hover:border-blue-200 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <Badge variant="outline" className="text-[10px] h-5 w-5 p-0 flex items-center justify-center shrink-0 font-bold bg-slate-100 dark:bg-slate-800">
                          {idx + 1}
                        </Badge>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate text-slate-800 dark:text-slate-200">{s.title}</p>
                          <div className="flex items-center gap-2 pt-0.5 text-[11px] text-slate-500">
                            <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                              <UserIcon className="w-3 h-3 text-blue-500" />
                              {s.assigneeName || "Người phụ trách chưa gán"}
                            </span>
                            {s.baseScore !== undefined && s.baseScore > 0 && (
                              <Badge variant="secondary" className="text-[10px] h-4 bg-amber-50 text-amber-700 border border-amber-200">
                                +{s.baseScore} điểm
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveStep(idx)}
                        className="h-7 w-7 p-0 text-slate-400 hover:text-red-500 shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* NHÓM 5: THIẾT LẬP VTVL & CHỈ TIÊU KPI NÂNG CAO (TỰ ĐỘNG CHUẨN HÓA) */}
            <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 space-y-3.5 min-w-0 overflow-hidden">
              <div className="flex items-center justify-between gap-2 min-w-0">
                <div className="flex items-center space-x-2 min-w-0">
                  <input
                    type="checkbox"
                    id="isKpiTarget"
                    checked={isKpiTarget}
                    onChange={(e) => setIsKpiTarget(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                  />
                  <Label
                    htmlFor="isKpiTarget"
                    className="font-bold text-xs text-blue-900 dark:text-blue-200 cursor-pointer flex items-center gap-1.5 min-w-0 truncate"
                  >
                    <Award className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="truncate">Tính điểm KPI & Chuẩn hóa Vị trí việc làm</span>
                  </Label>
                </div>
                <Badge className="text-[10px] bg-blue-600 text-white font-normal flex items-center gap-1 shrink-0">
                  <Sparkles className="w-3 h-3" /> Tự động tính theo VTVL
                </Badge>
              </div>

              {isKpiTarget && (
                <div className="space-y-3 pt-1 border-t border-blue-200/60 dark:border-blue-800/60 text-xs min-w-0">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 min-w-0">
                    <div className="space-y-1 min-w-0">
                      <span className="text-slate-600 dark:text-slate-400 text-[11px] font-medium truncate block">Trọng số việc:</span>
                      <Input
                        type="number"
                        step={0.1}
                        min={0.1}
                        value={weight}
                        onChange={(e) => setWeight(Number(e.target.value))}
                        className="h-8 text-xs bg-white dark:bg-slate-950 text-right pr-2 w-full min-w-0"
                      />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <span className="text-slate-600 dark:text-slate-400 text-[11px] font-medium truncate block">Điểm cơ sở (VTVL):</span>
                      <Input
                        type="number"
                        min={0}
                        value={baseScore}
                        onChange={(e) => setBaseScore(Number(e.target.value))}
                        className="h-8 text-xs bg-white dark:bg-slate-950 text-right pr-2 font-semibold text-blue-600 w-full min-w-0"
                      />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <span className="text-slate-600 dark:text-slate-400 text-[11px] font-medium truncate block">Số lượng chỉ tiêu:</span>
                      <Input
                        type="number"
                        min={1}
                        value={plannedQty}
                        onChange={(e) => setPlannedQty(Number(e.target.value))}
                        className="h-8 text-xs bg-white dark:bg-slate-950 text-right pr-2 w-full min-w-0"
                      />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <span
                        className="text-slate-600 dark:text-slate-400 text-[11px] font-medium truncate block"
                        title="Hệ số độ khó (k)"
                      >
                        Hệ số độ khó (k):
                      </span>
                      <Select
                        value={difficultyK.toString()}
                        onValueChange={(val) => setDifficultyK(Number(val))}
                      >
                        <SelectTrigger
                          className="w-full min-w-0 bg-white dark:bg-slate-950 h-8 text-xs truncate [&>span]:truncate"
                          title="Hệ số độ khó k (theo định mức VTVL/KPI)"
                        >
                          <SelectValue placeholder="Chọn độ khó" />
                        </SelectTrigger>
                        <SelectContent className="max-w-[280px]">
                          <SelectItem value="1" title="k = 1.0 (Dễ - Thường xuyên)">
                            <span className="truncate">k = 1.0 (Dễ - Thường xuyên)</span>
                          </SelectItem>
                          <SelectItem value="2" title="k = 2.0 (Bình thường - Tiêu chuẩn)">
                            <span className="truncate">k = 2.0 (Tiêu chuẩn)</span>
                          </SelectItem>
                          <SelectItem value="3" title="k = 3.0 (Khó - Đòi hỏi độc lập)">
                            <span className="truncate">k = 3.0 (Khó - Độc lập)</span>
                          </SelectItem>
                          <SelectItem value="4" title="k = 4.0 (Rất khó - Khẩn / Trọng yếu)">
                            <span className="truncate">k = 4.0 (Rất khó - Khẩn)</span>
                          </SelectItem>
                          <SelectItem value="5" title="k = 5.0 (Đặc biệt phức tạp)">
                            <span className="truncate">k = 5.0 (Đặc biệt phức tạp)</span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 min-w-0">
                      <Label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate">
                        Mã nhóm công thức VTVL (Định biên Đề án 01-ĐA/TU)
                      </Label>
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 shrink-0">
                        Gợi ý tự động theo phòng ban nhân sự
                      </span>
                    </div>
                    <Input
                      value={formulaDomainCode}
                      onChange={(e) =>
                        setFormulaDomainCode(
                          e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, "")
                        )
                      }
                      placeholder="VD: THAM_DINH_TCCB, BVCTNB, TCD_DV, VAN_PHONG..."
                      className="bg-white font-mono dark:bg-slate-950 h-8 text-xs uppercase w-full min-w-0"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* TẦNG 3: FOOTER CỐ ĐỊNH */}
          <div className="shrink-0 p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-sm flex items-center justify-between gap-3 min-w-0 max-w-full">
            <div className="text-xs text-slate-500 truncate min-w-0 hidden sm:block">
              {assignee && (
                <span>
                  Chủ trì:{" "}
                  <strong className="text-slate-700 dark:text-slate-300">
                    {assignee.startsWith("DEPT_")
                      ? `Phòng ban (${departments.find((d: any) => `DEPT_${d.id}` === assignee)?.name || "Đơn vị"})`
                      : employees.find((e: any) => e.employeeCode === assignee)?.fullName || assignee}
                  </strong>
                </span>
              )}
              {supervisorCode && supervisorCode !== "DEFAULT" && (
                <span className="ml-2">
                  • Phê duyệt:{" "}
                  <strong className="text-emerald-700 dark:text-emerald-400">
                    {autoDetectedSupervisor?.code === supervisorCode
                      ? autoDetectedSupervisor.name
                      : employees.find((e: any) => e.employeeCode === supervisorCode)?.fullName || supervisorCode}
                  </strong>
                </span>
              )}
            </div>

            <SheetFooter className="flex items-center gap-2 p-0 sm:space-x-0 ml-auto shrink-0">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  resetForm();
                  onOpenChange(false);
                }}
                disabled={isPending}
                className="h-10 px-4 text-xs hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                Huỷ bỏ
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="h-10 px-5 gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md text-xs font-semibold"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                {isPending ? "Đang xử lý..." : isSubTask ? "Tạo nhiệm vụ con" : "Giao việc ngay"}
              </Button>
            </SheetFooter>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

export { CreateTaskDialog as CreateTaskSheet };
