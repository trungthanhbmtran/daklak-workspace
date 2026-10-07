"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import apiClient from "@/lib/axiosInstance";
import { Loader2 } from "lucide-react";

interface WorkflowBindingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function WorkflowBindingModal({
  isOpen,
  onClose,
  onSuccess,
}: WorkflowBindingModalProps) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [processTypes, setProcessTypes] = useState<any[]>([]);
  const [workflows, setWorkflows] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    processTypeId: "",
    trigger: "",
    definitionId: "",
    priority: "100",
  });

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ptRes, wfRes] = await Promise.all([
        apiClient.get("/admin/workflow/catalog/process-types"),
        apiClient.get("/admin/workflow"), // List workflows
      ]);
      setProcessTypes(ptRes.data?.data || []);
      setWorkflows(wfRes.data?.data || wfRes.data?.items || []);
    } catch (error: any) {
      toast.error(error?.message || "Lỗi khi tải dữ liệu khởi tạo");
    } finally {
      setLoading(false);
    }
  };

  const selectedProcessType = processTypes.find(
    (pt) => pt.id === formData.processTypeId
  );
  
  let triggers: string[] = [];
  if (selectedProcessType?.validTriggers) {
    if (Array.isArray(selectedProcessType.validTriggers)) {
      triggers = selectedProcessType.validTriggers;
    } else if (typeof selectedProcessType.validTriggers === "object") {
      triggers = Object.keys(selectedProcessType.validTriggers);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.processTypeId || !formData.definitionId || !formData.trigger) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        priority: parseInt(formData.priority, 10) || 100,
      };
      const res = await apiClient.post("/admin/workflow/bindings", payload);
      if (res.data?.success) {
        toast.success("Tạo cấu hình Auto-Binding thành công");
        onSuccess();
        onClose();
        setFormData({
          processTypeId: "",
          trigger: "",
          definitionId: "",
          priority: "100",
        });
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Tạo binding thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Tạo cấu hình Auto-Binding mới</DialogTitle>
          <DialogDescription>
            Gắn kết một đối tượng nghiệp vụ (Process Type) với Quy trình đã thiết kế.
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center p-6">
            <Loader2 className="animate-spin text-primary w-6 h-6" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Đối tượng nghiệp vụ (Process Type)</Label>
              <Select
                value={formData.processTypeId}
                onValueChange={(val) =>
                  setFormData({ ...formData, processTypeId: val, trigger: "" })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn đối tượng..." />
                </SelectTrigger>
                <SelectContent>
                  {processTypes.map((pt) => (
                    <SelectItem key={pt.id} value={pt.id}>
                      {pt.name} ({pt.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.processTypeId && (
              <div className="space-y-2">
                <Label>Sự kiện kích hoạt (Trigger)</Label>
                <Select
                  value={formData.trigger}
                  onValueChange={(val) =>
                    setFormData({ ...formData, trigger: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn sự kiện..." />
                  </SelectTrigger>
                  <SelectContent>
                    {triggers.length > 0 ? (
                      triggers.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="CREATED" disabled>
                        Không có dữ liệu trigger
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Quy trình thực thi (Workflow Definition)</Label>
              <Select
                value={formData.definitionId}
                onValueChange={(val) =>
                  setFormData({ ...formData, definitionId: val })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn quy trình..." />
                </SelectTrigger>
                <SelectContent>
                  {workflows.map((wf) => (
                    <SelectItem key={wf.id} value={wf.id}>
                      {wf.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Độ ưu tiên (Mặc định: 100)</Label>
              <Input
                type="number"
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value })
                }
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Hủy
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Lưu cấu hình
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
