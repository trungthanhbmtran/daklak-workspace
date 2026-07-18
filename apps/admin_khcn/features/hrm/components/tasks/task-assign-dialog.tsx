"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectLabel, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { UserCircle2, UsersIcon, X, Loader2, BriefcaseIcon } from "lucide-react";
import { useAssignTask } from "../../hooks/useTasks";
import { useHrmEmployeesList } from "../../hooks/useHrmEmployees";
import { useOrganizationFlatListQuery } from "@/features/system-admin/organization/hooks/useOrganizationQueries";

interface TaskAssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: number;
  currentAssigneeCode?: string;
  currentCoordinatorsCodes?: string[];
}

export function TaskAssignDialog({ open, onOpenChange, taskId, currentAssigneeCode, currentCoordinatorsCodes }: TaskAssignDialogProps) {
  const [assignee, setAssignee] = useState<string>("");
  const [coordinators, setCoordinators] = useState<{id: string, name: string}[]>([]);

  // ── Danh sách nhân viên từ API ──
  const { data: employeesData } = useHrmEmployeesList({ pageSize: 100, assignableOnly: true });
  const employees = (employeesData as any)?.data ?? [];

  // ── Danh sách phòng ban từ API ──
  const { data: orgData } = useOrganizationFlatListQuery();
  const departments = orgData?.items ?? [];

  useEffect(() => {
    if (open) {
      setAssignee(currentAssigneeCode || "");
      
      if (currentCoordinatorsCodes && currentCoordinatorsCodes.length > 0) {
        const mapped = currentCoordinatorsCodes.map(code => {
          let name = code;
          if (code.startsWith("DEPT_")) {
            const deptId = parseInt(code.replace("DEPT_", ""), 10);
            const dept = departments.find((d: any) => d.id === deptId);
            if (dept) name = `🏢 ${dept.name}`;
          } else {
            const emp = employees.find((e: any) => e.employeeCode === code);
            if (emp) name = `👤 ${emp.fullName}`;
          }
          return { id: code, name };
        });
        setCoordinators(mapped);
      } else {
        setCoordinators([]);
      }
    }
  }, [open, currentAssigneeCode, currentCoordinatorsCodes, employees, departments]);

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
      if (emp) name = `👤 ${emp.fullName}`;
    }

    if (!coordinators.find(c => c.id === value)) {
      setCoordinators([...coordinators, { id: value, name }]);
    }
  };

  const removeCoordinator = (id: string) => {
    setCoordinators(coordinators.filter(c => c.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignee) return;

    try {
      await assignTask.mutateAsync({
        id: taskId,
        payload: {
          assigneeCode: assignee.startsWith("DEPT_") ? undefined : assignee,
          departmentId: assignee.startsWith("DEPT_") ? parseInt(assignee.replace("DEPT_", ""), 10) : undefined,
          coAssigneeCodes: coordinators.map(c => c.id),
        }
      });
      onOpenChange(false);
    } catch {
      // lỗi đã được handle ở hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!isPending) onOpenChange(v); }}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-0 shadow-2xl">
        <div className="p-6 pb-5 border-b bg-white dark:bg-slate-950">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
               <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  <BriefcaseIcon className="w-4 h-4" />
               </div>
               Giao lại / Thêm người phối hợp
            </DialogTitle>
            <DialogDescription className="ml-10">
              Chọn lại người xử lý hoặc thêm người phối hợp cho công việc này.
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col p-6 space-y-6">
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <UserCircle2 className="w-4 h-4 text-slate-400"/> Người xử lý chính <span className="text-red-500">*</span>
            </Label>
            <Select required value={assignee} onValueChange={setAssignee}>
              <SelectTrigger className="w-full bg-white dark:bg-slate-950 h-11 focus:ring-blue-500 shadow-sm">
                <SelectValue placeholder="Chọn người chịu trách nhiệm chính..." />
              </SelectTrigger>
              <SelectContent>
                {departments.length > 0 && (
                  <SelectGroup>
                    <SelectLabel className="text-xs text-slate-500 uppercase font-semibold">Phòng ban</SelectLabel>
                    {departments.map((dept: any) => (
                      <SelectItem key={`DEPT_${dept.id}`} value={`DEPT_${dept.id}`}>
                        🏢 {dept.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                )}
                {employees.length > 0 && (
                  <SelectGroup>
                    <SelectLabel className="text-xs text-slate-500 uppercase font-semibold">Nhân viên</SelectLabel>
                    {employees.map((emp: any) => (
                      <SelectItem key={emp.employeeCode} value={emp.employeeCode}>
                        👤 {emp.fullName}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <UsersIcon className="w-4 h-4 text-slate-400"/> Phối hợp thực hiện
            </Label>
            <Select value="" onValueChange={handleAddCoordinator}>
              <SelectTrigger className="w-full bg-white dark:bg-slate-950 h-11 border-dashed text-slate-500 focus:ring-blue-500 shadow-sm">
                <SelectValue placeholder="+ Thêm người / đơn vị phối hợp..." />
              </SelectTrigger>
              <SelectContent>
                {departments.length > 0 && (
                  <SelectGroup>
                    <SelectLabel className="text-xs text-slate-500 uppercase font-semibold">Phòng ban</SelectLabel>
                    {departments
                      .filter((d: any) => `DEPT_${d.id}` !== assignee && !coordinators.find(c => c.id === `DEPT_${d.id}`))
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
                      .filter((e: any) => e.employeeCode !== assignee && !coordinators.find(c => c.id === e.employeeCode))
                      .map((emp: any) => (
                        <SelectItem key={emp.employeeCode} value={emp.employeeCode}>
                          👤 {emp.fullName}
                        </SelectItem>
                      ))}
                  </SelectGroup>
                )}
              </SelectContent>
            </Select>
            
            {coordinators.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {coordinators.map(c => (
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
