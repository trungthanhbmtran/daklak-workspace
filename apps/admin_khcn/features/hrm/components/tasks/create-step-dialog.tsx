/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/typography";
import { Label } from "@/components/ui/label";
import { ListChecksIcon, CheckCircle2, Loader2, UsersIcon } from "lucide-react";

import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useHrmEmployeesList } from "../../hooks/useHrmEmployees";
import { useCreateStep } from "../../hooks/useTasks";
import { useUser } from "@/hooks/useUser";

interface CreateStepDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: any;
}

interface ParticipantItem {
  code: string;
  name: string;
  subtitle?: string;
  roleLabel: string;
}

export function CreateStepDialog({ open, onOpenChange, task }: CreateStepDialogProps) {
  const { user } = useUser();
  const [title, setTitle] = useState("");
  const [baseScore, setBaseScore] = useState<number | "">("");
  const [assigneeCode, setAssigneeCode] = useState<string>("");

  const createStep = useCreateStep(Number(task?.id));
  const isPending = createStep.isPending;

  const { data: employeesData } = useHrmEmployeesList(
    { pageSize: 100 },
    { enabled: open }
  );
  const employees = (employeesData as any)?.data ?? [];

  // ── Lọc nhân sự tham gia nhiệm vụ: CHỈ hiển thị nhân sự phối hợp / trong nhóm công việc ──
  const taskParticipants = useMemo<{ groupTitle: string; items: ParticipantItem[] }>(() => {
    const list: ParticipantItem[] = [];
    const seenCodes = new Set<string>();

    if (user?.employeeCode) {
      seenCodes.add(user.employeeCode);
    }
    if (task?.assigneeCode) {
      seenCodes.add(task.assigneeCode);
    }

    // 1. Từ task.participants (role: COORDINATOR hoặc PARTICIPANT)
    if (Array.isArray(task?.participants)) {
      task.participants.forEach((p: any) => {
        const code = p.employeeCode || p.code || p.employee?.employeeCode;
        const role = (p.participantRole || p.role || "").toUpperCase();
        if (code && !seenCodes.has(code) && (role === "COORDINATOR" || role === "PARTICIPANT")) {
          seenCodes.add(code);
          const emp = employees.find((e: any) => e.employeeCode === code);
          const name = p.fullName || p.employee?.fullName || emp?.fullName || code;
          const subtitle = emp?.jobTitleName || p.jobTitle || emp?.unitName;
          list.push({ code, name, subtitle, roleLabel: "Nhân sự phối hợp" });
        }
      });
    }

    // 2. Từ task.coAssignees
    if (Array.isArray(task?.coAssignees)) {
      task.coAssignees.forEach((ca: any) => {
        const code = ca.employeeCode || ca.code;
        if (code && !seenCodes.has(code)) {
          seenCodes.add(code);
          const emp = employees.find((e: any) => e.employeeCode === code);
          list.push({
            code,
            name: ca.fullName || emp?.fullName || code,
            subtitle: emp?.jobTitleName,
            roleLabel: "Nhân sự phối hợp",
          });
        }
      });
    }

    // 3. Từ task.coassigneeCodes hoặc task.coAssigneeCodes
    const rawCodes = task?.coassigneeCodes || task?.coAssigneeCodes || [];
    if (Array.isArray(rawCodes)) {
      rawCodes.forEach((code: string) => {
        if (code && !seenCodes.has(code)) {
          seenCodes.add(code);
          const emp = employees.find((e: any) => e.employeeCode === code);
          list.push({
            code,
            name: emp?.fullName || code,
            subtitle: emp?.jobTitleName || emp?.unitName,
            roleLabel: "Nhân sự phối hợp",
          });
        }
      });
    }

    // 4. Từ task.coordinators
    if (Array.isArray(task?.coordinators)) {
      task.coordinators.forEach((c: any) => {
        const code = typeof c === "string" ? c : c.id || c.employeeCode;
        if (code && !seenCodes.has(code) && !code.startsWith("DEPT_")) {
          seenCodes.add(code);
          const emp = employees.find((e: any) => e.employeeCode === code);
          list.push({
            code,
            name: c.name || emp?.fullName || code,
            subtitle: emp?.jobTitleName,
            roleLabel: "Nhân sự phối hợp",
          });
        }
      });
    }

    // 5. Từ các nhánh phối hợp con (subTasks / children có isCoordinationBranch)
    const childTasks = Array.isArray(task?.children)
      ? task.children
      : Array.isArray(task?.subTasks)
      ? task.subTasks
      : [];
    childTasks.forEach((child: any) => {
      const isCoordChild = child?.metadata?.isCoordinationBranch || child?.title?.startsWith("[Phối hợp]");
      if (isCoordChild) {
        if (child.assigneeCode && child.assigneeCode !== "UNASSIGNED" && !seenCodes.has(child.assigneeCode)) {
          seenCodes.add(child.assigneeCode);
          const emp = employees.find((e: any) => e.employeeCode === child.assigneeCode);
          const name = child.assigneeName || emp?.fullName || child.assigneeCode;
          const subtitle = emp?.jobTitleName || "Chủ trì phối hợp đơn vị";
          list.push({ code: child.assigneeCode, name, subtitle, roleLabel: "Chủ trì phối hợp đơn vị" });
        }
        if (Array.isArray(child.participants)) {
          child.participants.forEach((p: any) => {
            const code = p.employeeCode || p.code;
            if (code && !seenCodes.has(code) && code !== "UNASSIGNED") {
              seenCodes.add(code);
              const emp = employees.find((e: any) => e.employeeCode === code);
              const name = p.fullName || emp?.fullName || code;
              const subtitle = emp?.jobTitleName || "Nhân sự phối hợp đơn vị";
              list.push({ code, name, subtitle, roleLabel: "Nhân sự phối hợp đơn vị" });
            }
          });
        }
      }
    });

    if (list.length > 0) {
      return {
        groupTitle: `Nhân sự phối hợp trong việc này (${list.length})`,
        items: list,
      };
    }

    // Nếu không có danh sách phối hợp riêng, kiểm tra xem công việc có giao cho phòng ban cụ thể không
    const deptId =
      task?.assigneeDepartmentId || task?.departmentId || task?.assigneeDepartment?.id;
    if (deptId) {
      const deptEmployees = employees
        .filter(
          (emp: any) =>
            (emp.departmentId === deptId || emp.department?.id === deptId) &&
            !seenCodes.has(emp.employeeCode)
        )
        .map((emp: any) => ({
          code: emp.employeeCode,
          name: emp.fullName,
          subtitle: emp.jobTitleName || emp.unitName,
          roleLabel: "Cùng phòng ban",
        }));
      if (deptEmployees.length > 0) {
        return {
          groupTitle: `Nhân sự phòng ban nhận việc (${deptEmployees.length})`,
          items: deptEmployees,
        };
      }
    }

    return { groupTitle: "", items: [] };
  }, [task, user, employees]);

  const resetForm = () => {
    setTitle("");
    setBaseScore("");
    setAssigneeCode("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await createStep.mutateAsync({
        title: title.trim(),
        baseScore,
        assigneeCode: assigneeCode && assigneeCode !== "UNASSIGNED" ? assigneeCode : undefined,
      });
      resetForm();
      onOpenChange(false);
    } catch {
      // Lỗi đã xử lý trong hook (onError toast)
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!isPending) {
          resetForm();
          onOpenChange(v);
        }
      }}
    >
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-0 shadow-2xl">
        <div className="p-6 pb-5 border-b bg-white dark:bg-slate-950">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                <ListChecksIcon className="w-4 h-4" />
              </div>
              Thêm bước thực hiện (Checklist)
            </DialogTitle>
            <DialogDescription className="ml-10">
              Chia nhỏ công việc thành các bước cụ thể để dễ theo dõi và giám sát tiến độ.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-slate-50/50 dark:bg-slate-900/20">
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              Tên bước / Công việc cần làm <Text as="span" className="text-red-500">*</Text>
            </Label>
            <Input
              required
              placeholder="VD: Khảo sát thực trạng, thu thập số liệu..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-base h-11 transition-all focus-visible:ring-indigo-500 bg-white"
              autoFocus
              disabled={isPending}
            />
          </div>

          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              Điểm KPI (Tùy chọn)
            </Label>
            <Input
              type="number"
              placeholder="Nhập điểm thưởng khi hoàn thành bước này"
              value={baseScore}
              onChange={(e) => setBaseScore(e.target.value === "" ? "" : Number(e.target.value))}
              className="text-base h-11 transition-all focus-visible:ring-indigo-500 bg-white"
              disabled={isPending}
            />
          </div>

          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              Người thực hiện (Phân việc)
            </Label>
            <Select value={assigneeCode} onValueChange={setAssigneeCode} disabled={isPending}>
              <SelectTrigger className="w-full bg-white h-11 focus:ring-indigo-500 min-w-0">
                <SelectValue placeholder="Chọn người thực hiện bước này..." />
              </SelectTrigger>
              <SelectContent className="max-h-[280px]">
                {user?.employeeCode && (
                  <SelectItem value={user.employeeCode} className="font-medium text-purple-700 dark:text-purple-300">
                    👤 Bản thân tôi phụ trách ({user.fullName || user.employeeCode})
                  </SelectItem>
                )}
                {task?.assigneeCode && task.assigneeCode !== user?.employeeCode && (
                  <SelectItem value={task.assigneeCode} className="font-medium text-blue-700 dark:text-blue-300">
                    🎯 Người chủ trì công việc ({task.assigneeName || task.assigneeCode})
                  </SelectItem>
                )}
                <SelectItem value="UNASSIGNED" className="text-slate-500 italic">
                  -- Chưa phân công cụ thể --
                </SelectItem>
                {taskParticipants.items.length > 0 && (
                  <SelectGroup>
                    <SelectLabel className="text-xs text-blue-600 dark:text-blue-400 uppercase font-semibold flex items-center gap-1.5">
                      <UsersIcon className="w-3.5 h-3.5" />
                      {taskParticipants.groupTitle}
                    </SelectLabel>
                    {taskParticipants.items.map((item) => (
                      <SelectItem key={item.code} value={item.code}>
                        <div className="flex items-center gap-2 truncate">
                          <span>👤 {item.name}</span>
                          {item.subtitle && (
                            <span className="text-xs text-slate-400">({item.subtitle})</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                )}
              </SelectContent>
            </Select>
            <Text variant="small" className="text-slate-500 font-normal">
              {taskParticipants.items.length > 0
                ? "Chỉ hiển thị các nhân sự được giao phối hợp trong công việc này."
                : "Bạn có thể tự phụ trách hoặc giao cho người chủ trì công việc."}
            </Text>
          </div>

          <div className="pt-4 flex justify-end gap-3 sm:space-x-0">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
              disabled={isPending}
              className="hover:bg-slate-200 dark:hover:bg-slate-800"
            >
              Huỷ bỏ
            </Button>
            <Button
              type="submit"
              disabled={isPending || !title.trim()}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {isPending ? "Đang lưu..." : "Lưu bước"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
