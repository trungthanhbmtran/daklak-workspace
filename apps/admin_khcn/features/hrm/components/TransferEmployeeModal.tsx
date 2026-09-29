import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { organizationApi } from "@/features/system-admin/organization/api";

interface TransferEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: any;
  onSuccess?: () => void;
}

export function TransferEmployeeModal({
  isOpen,
  onClose,
  employee,
  onSuccess
}: TransferEmployeeModalProps) {
  const [selectedUnit, setSelectedUnit] = useState<string>("");
  const [selectedJob, setSelectedJob] = useState<string>("");

  // Fetch danh sách Đơn vị / Phòng ban từ user-service
  const { data: unitsRes } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => organizationApi.getOrganizations()
  });
  
  // Fetch danh sách Chức danh từ user-service
  const { data: jobsRes } = useQuery({
    queryKey: ['jobTitles'],
    queryFn: () => organizationApi.getJobTitles()
  });

  const units = unitsRes?.data || [];
  const jobs = jobsRes?.data?.allTitles || [];

  const handleTransfer = async () => {
    if (!selectedUnit || !selectedJob) {
      toast.error("Vui lòng chọn phòng ban và chức danh mới");
      return;
    }

    try {
      // TODO: Tích hợp API gọi sang user-service để assign StaffingSlot
      // API này sẽ trigger Event 'user.position.assigned' để hrm-service tự động cập nhật
      
      toast.success("Đã gửi yêu cầu luân chuyển thành công!");
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error("Lỗi khi luân chuyển cán bộ");
    }
  };

  if (!employee) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Luân chuyển cán bộ</DialogTitle>
          <DialogDescription>
            Chọn phòng ban và chức vụ mới cho nhân viên <strong>{employee.fullName}</strong>. Hệ thống sẽ tự động cập nhật phân quyền và vị trí việc làm.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Thông tin đơn vị cũ */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right text-muted-foreground">Đơn vị cũ</Label>
            <div className="col-span-3 text-sm font-medium">
              {employee.departmentName || "Chưa phân bổ"}
            </div>
          </div>

          {/* Chọn đơn vị mới */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="new-unit" className="text-right">Đơn vị mới</Label>
            <div className="col-span-3">
              <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn phòng ban / đơn vị" />
                </SelectTrigger>
                <SelectContent>
                  {units.map((u: any) => (
                    <SelectItem key={u.id} value={u.id.toString()}>{u.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Chọn chức danh mới */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="new-job" className="text-right">Chức danh</Label>
            <div className="col-span-3">
              <Select value={selectedJob} onValueChange={setSelectedJob}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn chức danh mới" />
                </SelectTrigger>
                <SelectContent>
                  {jobs.map((j: any) => (
                    <SelectItem key={j.id} value={j.id.toString()}>{j.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={handleTransfer}>Xác nhận luân chuyển</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
