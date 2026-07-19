/* eslint-disable react-hooks/set-state-in-effect, @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectGroup, SelectLabel, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/typography";
import { Label } from "@/components/ui/label";
import { CalendarIcon, FlagIcon, UserIcon, AlignLeftIcon, TypeIcon, CheckCircle2, UserCircle2, BriefcaseIcon, UsersIcon, X, Loader2, Repeat } from "lucide-react";
import { useCreateTask, useCreateSubTask } from "../../hooks/useTasks";
import { useHrmEmployeesList } from "../../hooks/useHrmEmployees";
import { useOrganizationFlatListQuery } from "@/features/system-admin/organization/hooks/useOrganizationQueries";
import { toast } from "sonner";

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentId?: string | number;
}

export function CreateTaskDialog({ open, onOpenChange, parentId }: CreateTaskDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("NORMAL");
  const [assignee, setAssignee] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [coordinators, setCoordinators] = useState<{id: string, name: string}[]>([]);
  const [taskType, setTaskType] = useState("ONE_TIME"); // ONE_TIME, REGULAR, PERIODIC
  const [recurrence, setRecurrence] = useState("MONTHLY"); // DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY

  const isSubTask = !!parentId;

  // ── Smart Defaults ──
  useEffect(() => {
    if (open) {
      if (!dueDate) {
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        // Format to YYYY-MM-DDThh:mm for input type datetime-local (or we just use date)
        const tzoffset = (today.getTimezoneOffset() * 60000); 
        const localISOTime = (new Date(today.getTime() - tzoffset)).toISOString().slice(0, 16);
        setDueDate(localISOTime);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const applyQuickPreset = (presetTitle: string, presetPriority: string = "NORMAL", type: string = "ONE_TIME", presetRecurrence?: string) => {
    setTitle(presetTitle);
    setPriority(presetPriority);
    setTaskType(type);
    if (presetRecurrence) {
      setRecurrence(presetRecurrence);
    }
  };

  // ── Mutations ──
  const createTask = useCreateTask();
  const createSubTask = useCreateSubTask();
  const isPending = createTask.isPending || createSubTask.isPending;

  // ── Danh sách nhân viên từ API ──
  const { data: employeesData } = useHrmEmployeesList({ pageSize: 100, assignableOnly: true });
  const employees = (employeesData as any)?.data ?? [];

  // ── Danh sách phòng ban từ API ──
  const { data: orgData } = useOrganizationFlatListQuery();
  const departments = orgData?.items ?? [];

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

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPriority("NORMAL");
    setAssignee("");
    setDueDate("");
    setCoordinators([]);
    setTaskType("ONE_TIME");
    setRecurrence("MONTHLY");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { toast.error("Vui lòng nhập tiêu đề công việc"); return; }
    if (!assignee) { toast.error("Vui lòng chọn người/đơn vị nhận việc"); return; }
    if (!dueDate) { toast.error("Vui lòng chọn thời hạn"); return; }

    const selectedDate = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      toast.error("Thời gian hạn chót không được trước thời gian giao việc (hiện tại)");
      return;
    }

    // Phân tích assignee: nếu bắt đầu bằng DEPT_ → departmentId, ngược lại → assigneeCode
    const isDept = assignee.startsWith("DEPT_");
    const payload: any = {
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      dueDate: new Date(dueDate).toISOString(),
      coAssigneeCodes: coordinators.map(c => c.id),
      metadata: {
        taskType,
        ...(taskType === "PERIODIC" && { recurrence })
      }
    };

    if (isDept) {
      payload.departmentId = parseInt(assignee.replace("DEPT_", ""), 10);
    } else {
      payload.assigneeCode = assignee;
    }

    try {
      if (isSubTask) {
        await createSubTask.mutateAsync({ parentId: Number(parentId), payload });
      } else {
        await createTask.mutateAsync(payload);
      }
      toast.success(isSubTask ? "Đã tạo nhiệm vụ con thành công" : "Đã giao việc thành công");
      resetForm();
      onOpenChange(false);
    } catch {
      // Lỗi đã được xử lý trong hooks (onError)
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!isPending) { resetForm(); onOpenChange(v); } }}>
      <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden border-0 shadow-2xl">
        <div className="p-6 pb-5 border-b bg-white dark:bg-slate-950">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
               <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  <BriefcaseIcon className="w-4 h-4" />
               </div>
               {isSubTask ? "Giao việc con (Phân rã công việc)" : "Giao việc mới"}
            </DialogTitle>
            <DialogDescription className="ml-10">
              {isSubTask ? `Công việc này sẽ phụ thuộc vào nhiệm vụ cha: ${parentId}` : "Thiết lập thông tin và phân công nhiệm vụ cho nhân sự hoặc phòng ban."}
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col">
          {/* Gợi ý nhanh (Quick presets) */}
          <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2 overflow-x-auto">
            <Text as="span" variant="small" weight="medium" className="text-slate-500 whitespace-nowrap">Gợi ý nhanh:</Text>
            <Badge variant="outline" className="cursor-pointer hover:bg-blue-50 hover:text-blue-600 transition-colors whitespace-nowrap" onClick={() => applyQuickPreset("Báo cáo tuần theo quyết định", "NORMAL", "PERIODIC", "WEEKLY")}>Báo cáo tuần</Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-amber-50 hover:text-amber-600 transition-colors whitespace-nowrap" onClick={() => applyQuickPreset("Báo cáo tháng theo quyết định", "NORMAL", "PERIODIC", "MONTHLY")}>Báo cáo tháng</Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-emerald-50 hover:text-emerald-600 transition-colors whitespace-nowrap" onClick={() => applyQuickPreset("Báo cáo năm theo quyết định", "NORMAL", "PERIODIC", "YEARLY")}>Báo cáo năm</Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-purple-50 hover:text-purple-600 transition-colors whitespace-nowrap" onClick={() => applyQuickPreset("Soạn thảo văn bản", "HIGH", "ONE_TIME")}>Soạn văn bản (Gấp)</Badge>
          </div>

          <div className="flex flex-col md:flex-row max-h-[60vh] overflow-y-auto bg-white dark:bg-slate-950">
            {/* Cột trái: Thông tin chính */}
            <div className="flex-1 p-6 space-y-6">
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  <TypeIcon className="w-4 h-4 text-slate-400"/> Tiêu đề công việc <Text as="span" className="text-red-500">*</Text>
                </Label>
                <Input 
                  required 
                  placeholder="VD: Cập nhật tài liệu kỹ thuật dự án A..." 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-base h-11 transition-all focus-visible:ring-blue-500"
                />
              </div>
              
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  <AlignLeftIcon className="w-4 h-4 text-slate-400"/> Nội dung chi tiết
                </Label>
                <Textarea 
                  placeholder="Mô tả chi tiết yêu cầu công việc, đính kèm link, kết quả mong đợi..." 
                  className="min-h-[160px] resize-y transition-all focus-visible:ring-blue-500 text-base"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            {/* Cột phải: Thiết lập */}
            <div className="w-full md:w-[320px] bg-slate-50 dark:bg-slate-900/30 p-6 md:border-l space-y-6">
              
              {/* Loại công việc (Mới thêm) */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  <BriefcaseIcon className="w-4 h-4 text-slate-400"/> Tính chất công việc
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <div 
                    onClick={() => setTaskType("ONE_TIME")}
                    className={`cursor-pointer text-center px-2 py-2 text-xs font-medium rounded-md border transition-all ${taskType === "ONE_TIME" ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                  >
                    Đột xuất
                  </div>
                  <div 
                    onClick={() => { setTaskType("PERIODIC"); if(recurrence === "NONE") setRecurrence("MONTHLY"); }}
                    className={`cursor-pointer text-center px-2 py-2 text-xs font-medium rounded-md border transition-all ${(taskType === "PERIODIC" || taskType === "REGULAR") ? "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                  >
                    Thường xuyên / Định kỳ
                  </div>
                </div>
              </div>

              {/* Nếu chọn định kỳ/thường xuyên, hiển thị tần suất */}
              {(taskType === "PERIODIC" || taskType === "REGULAR") && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <Repeat className="w-4 h-4 text-slate-400"/> Tần suất lặp lại
                  </Label>
                  <Select value={taskType === "REGULAR" ? "NONE" : recurrence} onValueChange={(val) => {
                    if (val === "NONE") {
                      setTaskType("REGULAR");
                    } else {
                      setTaskType("PERIODIC");
                      setRecurrence(val);
                    }
                  }}>
                    <SelectTrigger className="w-full bg-white dark:bg-slate-950 h-10 focus:ring-emerald-500 shadow-sm border-emerald-200">
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


              <div className="space-y-3 pt-2 border-t border-slate-200 border-dashed">
                <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  <UserIcon className="w-4 h-4 text-slate-400"/> Người / Đơn vị nhận việc <Text as="span" className="text-red-500">*</Text>
                </Label>
                <Select value={assignee} onValueChange={setAssignee} required>
                  <SelectTrigger className="w-full bg-white dark:bg-slate-950 h-11 focus:ring-blue-500 shadow-sm">
                    <SelectValue placeholder="Chọn người nhận..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {departments.length > 0 && (
                      <SelectGroup>
                        <SelectLabel className="text-xs text-slate-500 uppercase font-semibold">Phòng ban</SelectLabel>
                        {departments.map((dept: any) => (
                          <SelectItem key={`DEPT_${dept.id}`} value={`DEPT_${dept.id}`}>
                            <div className="flex items-center gap-2">
                              <UsersIcon className="w-4 h-4 text-orange-500" />
                              <span>{dept.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    )}
                    {employees.length > 0 ? (
                      <SelectGroup>
                        <SelectLabel className="text-xs text-slate-500 uppercase font-semibold">Nhân viên</SelectLabel>
                        {employees.map((emp: any) => (
                          <SelectItem key={emp.employeeCode} value={emp.employeeCode}>
                            <div className="flex items-center gap-2">
                              <UserCircle2 className="w-4 h-4 text-blue-500" />
                              <span>{emp.fullName} ({emp.employeeCode})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ) : (
                      <SelectItem value="loading" disabled>Đang tải danh sách...</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Đơn vị phối hợp */}
              <div className="space-y-3 pt-1">
                <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  <UsersIcon className="w-4 h-4 text-slate-400"/> Phối hợp thực hiện
                </Label>
                <Select value="" onValueChange={handleAddCoordinator}>
                  <SelectTrigger className="w-full bg-white dark:bg-slate-950 h-10 border-dashed text-slate-500 focus:ring-blue-500 shadow-sm">
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
                  <div className="flex flex-wrap gap-2 mt-2">
                    {coordinators.map(c => (
                      <Badge key={c.id} variant="secondary" className="flex items-center gap-1.5 py-1 px-2 bg-white border border-slate-200 text-sm font-normal">
                        {c.name}
                        <div 
                          className="w-4 h-4 rounded-full hover:bg-slate-200 flex items-center justify-center cursor-pointer transition-colors"
                          onClick={() => removeCoordinator(c.id)}
                        >
                          <X className="w-3 h-3 text-slate-500 hover:text-red-500" />
                        </div>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  <CalendarIcon className="w-4 h-4 text-slate-400"/> Thời hạn <Text as="span" className="text-red-500">*</Text>
                </Label>
                <Input 
                  required 
                  type="date" 
                  value={dueDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="bg-white dark:bg-slate-950 h-11 focus-visible:ring-blue-500 shadow-sm" 
                />
              </div>

              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  <FlagIcon className="w-4 h-4 text-slate-400"/> Mức độ ưu tiên
                </Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="w-full bg-white dark:bg-slate-950 h-11 focus:ring-blue-500 shadow-sm">
                    <SelectValue placeholder="Chọn mức độ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">
                      <div className="flex items-center gap-2 font-medium"><div className="w-2.5 h-2.5 rounded-full bg-slate-400 shadow-sm"></div> Thấp</div>
                    </SelectItem>
                    <SelectItem value="NORMAL">
                      <div className="flex items-center gap-2 font-medium"><div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm"></div> Bình thường</div>
                    </SelectItem>
                    <SelectItem value="HIGH">
                      <div className="flex items-center gap-2 font-medium"><div className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm"></div> Cao</div>
                    </SelectItem>
                    <SelectItem value="URGENT">
                      <div className="flex items-center gap-2 font-medium"><div className="w-2.5 h-2.5 rounded-full bg-red-600 shadow-sm animate-pulse"></div> Khẩn cấp</div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="p-4 border-t bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <DialogFooter className="flex justify-end gap-3 sm:space-x-0">
              <Button type="button" variant="ghost" onClick={() => { resetForm(); onOpenChange(false); }} disabled={isPending} className="hover:bg-slate-200 dark:hover:bg-slate-800">
                Huỷ bỏ
              </Button>
              <Button type="submit" disabled={isPending} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {isPending ? "Đang lưu..." : "Giao việc ngay"}
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
