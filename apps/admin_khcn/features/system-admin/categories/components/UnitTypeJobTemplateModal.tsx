"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CategoryItem } from "../types";
import { organizationApi } from "../../organization/api";

interface UnitTypeJobTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: CategoryItem; // This is the Unit Type from Categories
}

export function UnitTypeJobTemplateModal({ isOpen, onClose, category }: UnitTypeJobTemplateModalProps) {
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // 1. Fetch real UnitType id by matching code
  const { data: unitTypesData, isLoading: isUnitTypesLoading } = useQuery({
    queryKey: ["admin_khcn", "unit-types"],
    queryFn: organizationApi.getUnitTypes,
    enabled: isOpen,
  });

  const unitType = unitTypesData?.data?.find((u) => u.code === category.code);

  // 2. Fetch all job titles
  const { data: jobTitlesData, isLoading: isJobTitlesLoading } = useQuery({
    queryKey: ["admin_khcn", "job-titles-all"],
    queryFn: () => organizationApi.getJobTitles(),
    enabled: isOpen,
  });

  // 3. Fetch selected templates for this unit type
  const { data: templatesData, isLoading: isTemplatesLoading } = useQuery({
    queryKey: ["admin_khcn", "unit-type-job-templates", unitType?.id],
    queryFn: () => organizationApi.getUnitTypeJobTemplates(unitType!.id),
    enabled: !!unitType?.id && isOpen,
  });

  useEffect(() => {
    if (templatesData?.data) {
      setSelectedIds(new Set(templatesData.data));
    }
  }, [templatesData]);

  const updateMutation = useMutation({
    mutationFn: (jobTitleIds: number[]) => organizationApi.updateUnitTypeJobTemplates(unitType!.id, jobTitleIds),
    onSuccess: () => {
      toast.success("Đã cập nhật cấu hình chức danh thành công");
      queryClient.invalidateQueries({ queryKey: ["admin_khcn", "unit-type-job-templates", unitType?.id] });
      onClose();
    },
    onError: () => {
      toast.error("Cập nhật thất bại. Vui lòng thử lại.");
    },
  });

  const handleToggle = (id: number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleSave = () => {
    if (!unitType) return;
    updateMutation.mutate(Array.from(selectedIds));
  };

  const isLoading = isUnitTypesLoading || isJobTitlesLoading || isTemplatesLoading;
  const allJobTitles = jobTitlesData?.data?.allTitles || [];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Cấu hình chức danh cho "{category.name}"</DialogTitle>
          <DialogDescription>
            Chọn các chức danh được phép sử dụng khi định biên cho loại đơn vị này.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col py-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
              Đang tải dữ liệu...
            </div>
          ) : !unitType ? (
            <div className="flex items-center justify-center h-48 text-destructive text-sm text-center">
              Không tìm thấy Loại đơn vị tương ứng trong hệ thống. <br/>
              Vui lòng kiểm tra lại mã loại đơn vị.
            </div>
          ) : allJobTitles.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
              Hệ thống chưa có dữ liệu chức danh.
            </div>
          ) : (
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4">
                <div className="grid gap-3">
                  {allJobTitles.map((job) => (
                    <div
                      key={job.id}
                      className="flex items-start space-x-3 rounded-md border p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleToggle(job.id)}
                    >
                      <Checkbox
                        id={`job-${job.id}`}
                        checked={selectedIds.has(job.id)}
                        onCheckedChange={() => handleToggle(job.id)}
                      />
                      <div className="space-y-1 leading-none flex-1">
                        <label
                          htmlFor={`job-${job.id}`}
                          className="text-sm font-medium leading-none cursor-pointer"
                          onClick={(e) => e.preventDefault()}
                        >
                          {job.name} <span className="text-muted-foreground ml-1">({job.code})</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={updateMutation.isPending}>
            Hủy
          </Button>
          <Button onClick={handleSave} disabled={isLoading || !unitType || updateMutation.isPending}>
            {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Lưu thay đổi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
