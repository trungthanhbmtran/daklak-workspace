/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectLabel, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/typography";
import { Label } from "@/components/ui/label";
import { UserCircle2, UserIcon, UsersIcon, X, Loader2, BriefcaseIcon } from "lucide-react";
import { useAssignTask, useTaskContext } from "../../hooks/useTasks";
import { useHrmEmployeesList } from "../../hooks/useHrmEmployees";
import { useOrganizationFlatListQuery } from "@/features/system-admin/organization/hooks/useOrganizationQueries";
import { DepartmentWorkloadRecommendation } from "./department-workload-recommendation";

interface TaskAssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: number;
  currentAssigneeCode?: string;
  currentCoordinators?: { id: string, name: string }[];
}

export function TaskAssignDialog({ open, onOpenChange, taskId, currentAssigneeCode, currentCoordinators }: TaskAssignDialogProps) {
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("");
  const [assignee, setAssignee] = useState<string>("");
  const [coordinators, setCoordinators] = useState<{ id: string; name: string }[]>([]);

  // ── Danh sách nhân viên từ API (lazy query khi mở dialog) ──
  const { data: employeesData } = useHrmEmployeesList({ pageSize: 150, assignableOnly: true }, { enabled: open });
  const employees = useMemo(() => (employeesData as any)?.data ?? [], [employeesData]);

  // ── Danh sách phòng ban từ API ──
  const { data: orgData } = useOrganizationFlatListQuery(undefined, { enabled: open });
  const departments = useMemo(() => orgData?.data ?? [], [orgData]);

  const { data: contextData } = useTaskContext(
    {
      departmentId: selectedDepartmentId && selectedDepartmentId !== "ALL" ? selectedDepartmentId : undefined,
      assignee: assignee || undefined,
    },
    { enabled: open }
  );
  const context: any = (contextData as any)?.data ?? contextData;
  const deptLeaders = context?.deptLeaders ?? [];
  const deptStaff = context?.deptStaff ?? [];

  useEffect(() => {
    if (open) {
      const code = currentAssigneeCode ? String(currentAssigneeCode) : "";
      setAssignee(code);
      setCoordinators(currentCoordinators || []);

      if (code) {
        if (code.startsWith("DEPT_")) {
          setSelectedDepartmentId(code.replace("DEPT_", ""));
        } else {
          const emp = employees.find((e: any) => e.employeeCode === code);
          if (emp?.departmentId) {
            setSelectedDepartmentId(String(emp.departmentId));
          }
        }
      } else {
        setSelectedDepartmentId("");
      }
    }
  }, [open, currentAssigneeCode, currentCoordinators, employees]);

  const selectedDepartment = useMemo(() => {
    if (!selectedDepartmentId || selectedDepartmentId === "ALL") return null;
    return departments.find((d: any) => String(d.id) === selectedDepartmentId);
  }, [departments, selectedDepartmentId]);


  const handleDepartmentChange = (deptId: string) => {
    setSelectedDepartmentId(deptId);
    if (deptId === "ALL") {
      setAssignee("");
    } else {
      setAssignee(`DEPT_${deptId}`);
    }
  };

  const assignTask = useAssignTask();
  const isPending = assignTask.isPending;

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
      setCoordinators([...coordinators, { id: value, name }]);
    }
  };

  const removeCoordinator = (id: string) => {
    setCoordinators(coordinators.filter((c) => c.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignee) return;

    try {
      await assignTask.mutateAsync({
        id: taskId,
        payload: {
          assignee: assignee,
          coordinators: coordinators.map((c) => c.id),
        },
      });
      onOpenChange(false);
    } catch {
      // lỗi đã được handle ở hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!isPending) onOpenChange(v); }}>
      <DialogContent className="sm:max-w-[650px] p-0 overflow-hidden border-0 shadow-2xl">
        <div className="p-6 pb-5 border-b bg-white dark:bg-slate-950">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <BriefcaseIcon className="w-4 h-4" />
              </div>
              Giao lại / Thêm người phối hợp
            </DialogTitle>
            <DialogDescription className="ml-10">
              Chọn phòng ban trước để thu gọn danh sách, sau đó giao cho cả phòng ban hoặc cá nhân cụ thể.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col p-6 space-y-6">
          {/* Phân cấp: Chọn phòng ban trước -> Chọn chủ trì */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-0">
            {/* 1. Chọn phòng ban */}
            <div className="space-y-2 min-w-0">
              <Label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <UsersIcon className="w-4 h-4 text-blue-600" />
                Đơn vị / Phòng ban chủ trì <span className="text-red-500">*</span>
              </Label>
              <Select value={selectedDepartmentId} onValueChange={handleDepartmentChange}>
                <SelectTrigger className="w-full bg-white dark:bg-slate-950 h-11 focus:ring-blue-500 shadow-sm min-w-0">
                  <SelectValue placeholder="Chọn phòng ban chủ trì..." />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {departments.map((dept: any) => {
                    const count = employees.filter(
                      (e: any) => e.departmentId === dept.id || e.department?.id === dept.id
                    ).length;
                    return (
                      <SelectItem key={`DEPT_ASSIGN_${dept.id}`} value={String(dept.id)}>
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

            {/* 2. Chọn người / đơn vị xử lý chính */}
            <div className="space-y-2 min-w-0">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <UserCircle2 className="w-4 h-4 text-blue-600" />
                  Người / Đơn vị nhận việc <span className="text-red-500">*</span>
                </Label>
                {selectedDepartment && (
                  <Badge variant="outline" className="text-[10px] text-blue-700 bg-blue-50 border-blue-200 truncate max-w-[130px] font-normal">
                    {selectedDepartment.name}
                  </Badge>
                )}
              </div>
              <Select
                required
                value={assignee || undefined}
                onValueChange={setAssignee}
                disabled={!selectedDepartmentId}
              >
                <SelectTrigger className="w-full bg-white dark:bg-slate-950 h-11 focus:ring-blue-500 shadow-sm min-w-0 disabled:opacity-60">
                  <SelectValue
                    placeholder={
                      selectedDepartmentId
                        ? "Chọn người hoặc giao cả phòng..."
                        : "← Chọn phòng ban trước"
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
                              ({emp.jobTitleName || "Lãnh đạo"})
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
            />
          )}

          {/* Phối hợp thực hiện */}
          <div className="space-y-3 min-w-0">
            <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <UsersIcon className="w-4 h-4 text-slate-400" /> Phối hợp thực hiện
            </Label>
            <Select value={undefined} onValueChange={handleAddCoordinator}>
              <SelectTrigger className="w-full bg-white dark:bg-slate-950 h-11 border-dashed text-slate-500 focus:ring-blue-500 shadow-sm min-w-0">
                <SelectValue placeholder="+ Thêm người / đơn vị phối hợp..." />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {departments.length > 0 && (
                  <SelectGroup>
                    <SelectLabel className="text-xs text-slate-500 uppercase font-semibold">Phòng ban</SelectLabel>
                    {departments
                      .filter((d: any) => d?.id != null && `DEPT_${d.id}` !== assignee && !coordinators.find((c) => c.id === `DEPT_${d.id}`))
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
                      .filter((e: any) => !!e?.employeeCode && e.employeeCode !== assignee && !coordinators.find((c) => c.id === e.employeeCode))
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

            {coordinators.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {coordinators.map((c) => (
                  <Badge key={c.id} variant="secondary" className="flex items-center gap-1.5 py-1.5 px-3 bg-white border border-slate-200 text-sm font-normal">
                    {c.name}
                    <div
                      className="w-4 h-4 rounded-full hover:bg-slate-200 flex items-center justify-center cursor-pointer transition-colors ml-1"
                      onClick={() => removeCoordinator(c.id)}
                    >
                      <X className="w-3 h-3 text-slate-500 hover:text-red-500" />
                    </div>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="pt-4 border-t mt-6 gap-3 sm:space-x-0">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isPending} className="hover:bg-slate-200 dark:hover:bg-slate-800">
              Huỷ bỏ
            </Button>
            <Button type="submit" disabled={isPending || !assignee} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md">
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {isPending ? "Đang lưu..." : "Xác nhận giao việc"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
