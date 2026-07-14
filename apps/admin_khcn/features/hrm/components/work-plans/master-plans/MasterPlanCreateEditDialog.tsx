"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { workflowApi } from "@/features/workflow/api";
import { hrmPlansApi } from "@/features/hrm/api/plans.api";
import { hrmKeys } from "@/features/hrm/keys";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { HrmMasterPlan } from "@/features/hrm/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planToEdit?: HrmMasterPlan | null;
}

export function MasterPlanCreateEditDialog({ open, onOpenChange, planToEdit }: Props) {
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "ACTIVE",
    workflowCode: "TASK_PROCESSING_ID",
  });

  useEffect(() => {
    if (open && planToEdit) {
      setFormData({
        title: planToEdit.title || "",
        description: planToEdit.description || "",
        status: planToEdit.status || "ACTIVE",
        workflowCode: planToEdit.workflowCode || "TASK_PROCESSING_ID",
      });
    } else if (open) {
      setFormData({
        title: "",
        description: "",
        status: "ACTIVE",
        workflowCode: "TASK_PROCESSING_ID",
      });
    }
  }, [open, planToEdit]);

  // Fetch workflows to select from
  const { data: workflowsRes, isLoading: isLoadingWorkflows } = useQuery({
    queryKey: ["workflows"],
    queryFn: () => workflowApi.list(),
  });
  
  const workflows = workflowsRes?.data || workflowsRes || [];

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (planToEdit) {
        return hrmPlansApi.update(planToEdit.id, data);
      }
      return hrmPlansApi.create(data);
    },
    onSuccess: () => {
      toast.success(planToEdit ? "Cập nhật thành công!" : "Tạo Kế hoạch/Dự án thành công!");
      queryClient.invalidateQueries({ queryKey: hrmKeys.masterPlans() });
      onOpenChange(false);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Có lỗi xảy ra");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error("Vui lòng nhập tên dự án/kế hoạch");
      return;
    }
    mutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{planToEdit ? "Sửa Dự án/Kế hoạch" : "Tạo Mới Dự án/Kế hoạch"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Tên Kế hoạch / Dự án <span className="text-red-500">*</span></Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Nhập tên dự án..."
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Mô tả mục tiêu, yêu cầu..."
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="workflowCode">Quy trình Động (Workflow)</Label>
              <Select
                value={formData.workflowCode}
                onValueChange={(val) => setFormData({ ...formData, workflowCode: val })}
              >
                <SelectTrigger id="workflowCode">
                  <SelectValue placeholder="Chọn workflow mặc định" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TASK_PROCESSING_ID">Mặc định (Workflow Cơ bản)</SelectItem>
                  {!isLoadingWorkflows && Array.isArray(workflows) && workflows.map((wf: any) => (
                    <SelectItem key={wf.id} value={wf.id}>
                      {wf.name} ({wf.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Các công việc trong dự án này sẽ tự động áp dụng luồng xử lý theo quy trình được chọn.
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">Trạng thái</Label>
              <Select
                value={formData.status}
                onValueChange={(val) => setFormData({ ...formData, status: val })}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Đang hoạt động (ACTIVE)</SelectItem>
                  <SelectItem value="DRAFT">Bản nháp (DRAFT)</SelectItem>
                  <SelectItem value="COMPLETED">Đã hoàn thành (COMPLETED)</SelectItem>
                  <SelectItem value="CANCELLED">Đã hủy (CANCELLED)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {planToEdit ? "Lưu thay đổi" : "Tạo Dự án"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
