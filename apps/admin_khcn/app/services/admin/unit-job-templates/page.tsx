"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, Building2, Save } from "lucide-react";

import { organizationApi } from "@/features/system-admin/organization/api";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export default function UnitJobTemplatesPage() {
  const queryClient = useQueryClient();
  const [selectedUnitTypeId, setSelectedUnitTypeId] = useState<number | null>(null);

  // 1. Lấy danh sách Loại đơn vị
  const { data: unitTypesRes, isLoading: isLoadingUnitTypes } = useQuery({
    queryKey: ["admin", "unit-types"],
    queryFn: () => organizationApi.getUnitTypes(),
  });
  const unitTypes = unitTypesRes?.data || [];

  // 2. Lấy danh sách nhóm vị trí việc làm (Category)
  const { data: groupsRes, isLoading: isLoadingGroups } = useQuery({
    queryKey: ["admin", "job-title-groups"],
    queryFn: () => organizationApi.getJobTitleGroups(),
  });
  const jobTitleGroups = groupsRes?.data || [];

  // 3. Lấy danh sách toàn bộ Chức danh
  const { data: jobTitlesRes, isLoading: isLoadingJobTitles } = useQuery({
    queryKey: ["admin", "all-job-titles"],
    queryFn: () => organizationApi.getJobTitles(),
  });
  const allJobTitles = jobTitlesRes?.data?.allTitles || [];

  // 4. Lấy cấu hình chức danh cho loại đơn vị đang chọn
  const { data: templatesRes, isLoading: isLoadingTemplates } = useQuery({
    queryKey: ["admin", "unit-type-job-templates", selectedUnitTypeId],
    queryFn: () => organizationApi.getUnitTypeJobTemplates(selectedUnitTypeId!),
    enabled: !!selectedUnitTypeId,
  });
  const currentAssignedIds = templatesRes?.data || [];

  const mutation = useMutation({
    mutationFn: (jobTitleIds: number[]) =>
      organizationApi.updateUnitTypeJobTemplates(selectedUnitTypeId!, jobTitleIds),
    onSuccess: () => {
      toast.success("Đã lưu cấu hình chức danh thành công");
      queryClient.invalidateQueries({
        queryKey: ["admin", "unit-type-job-templates", selectedUnitTypeId],
      });
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi lưu cấu hình");
    },
  });

  const handleSelectUnitType = (id: number) => {
    setSelectedUnitTypeId(id);
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-background flex-col rounded-xl border">
      <div className="flex items-center px-6 py-4 border-b shrink-0 bg-muted/20">
        <Building2 className="mr-2 h-5 w-5 text-muted-foreground" />
        <div>
          <h1 className="text-lg font-semibold">Phân loại chức danh theo Loại đơn vị / Phòng ban</h1>
          <p className="text-sm text-muted-foreground">
            Cấu hình danh sách chức danh khả dụng khi thiết lập định biên cho từng loại đơn vị
          </p>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* LEFT PANEL: Danh sách Unit Types */}
        <div className="w-[300px] border-r flex flex-col shrink-0">
          <div className="px-4 py-3 border-b bg-muted/30">
            <h2 className="text-sm font-medium text-muted-foreground">Các Loại đơn vị</h2>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-1">
              {isLoadingUnitTypes ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-md" />
                ))
              ) : (
                unitTypes.map((ut: any) => (
                  <button
                    key={ut.id}
                    onClick={() => handleSelectUnitType(ut.id)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors text-left",
                      selectedUnitTypeId === ut.id
                        ? "bg-primary text-primary-foreground font-medium shadow-sm"
                        : "hover:bg-muted"
                    )}
                  >
                    <span className="line-clamp-2">{ut.name}</span>
                    {selectedUnitTypeId === ut.id && <Check className="h-4 w-4 shrink-0 ml-2" />}
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* RIGHT PANEL: Danh sách Chức danh */}
        <div className="flex-1 flex flex-col bg-muted/5 relative">
          {selectedUnitTypeId ? (
            <JobTitleSelectionPanel
              key={selectedUnitTypeId} // Ép re-render để lấy lại state mỗi khi đổi Unit Type
              allJobTitles={allJobTitles}
              jobTitleGroups={jobTitleGroups}
              serverCheckedIds={currentAssignedIds}
              isLoading={isLoadingTemplates || isLoadingJobTitles || isLoadingGroups}
              onSave={mutation.mutate}
              isSaving={mutation.isPending}
            />
          ) : (
            <div className="flex flex-1 items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Building2 className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p>Vui lòng chọn Loại đơn vị ở danh sách bên trái</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function JobTitleSelectionPanel({
  allJobTitles,
  jobTitleGroups,
  serverCheckedIds,
  isLoading,
  onSave,
  isSaving,
}: {
  allJobTitles: any[];
  jobTitleGroups: any[];
  serverCheckedIds: number[];
  isLoading: boolean;
  onSave: (ids: number[]) => void;
  isSaving: boolean;
}) {
  const [localCheckedIds, setLocalCheckedIds] = useState<Set<number>>(
    new Set(serverCheckedIds)
  );

  useEffect(() => {
    if (!isLoading) {
      setLocalCheckedIds(new Set(serverCheckedIds));
    }
  }, [isLoading, serverCheckedIds]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-1/2" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  const toggle = (id: number) => {
    const next = new Set(localCheckedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setLocalCheckedIds(next);
  };

  const handleSave = () => {
    onSave(Array.from(localCheckedIds));
  };

  // Build dynamic groups based on JobTitle.categoryId
  const groupedJobTitles = jobTitleGroups.map((group) => {
    return {
      key: group.code || group.id.toString(),
      label: group.name || group.translations?.[0]?.name || group.code,
      items: allJobTitles.filter((jt) => jt.categoryId === group.id),
    };
  });
  
  const unassignedItems = allJobTitles.filter((jt) => !jt.categoryId);
  if (unassignedItems.length > 0) {
    groupedJobTitles.push({
      key: 'UNASSIGNED',
      label: 'Chưa phân nhóm (Khác)',
      items: unassignedItems,
    });
  }

  return (
    <div className="flex flex-col h-full absolute inset-0">
      <div className="px-6 py-4 border-b flex items-center justify-between bg-background shrink-0">
        <div>
          <h2 className="text-sm font-semibold">Chọn chức danh áp dụng</h2>
          <p className="text-xs text-muted-foreground">
            Các chức danh được chọn ({localCheckedIds.size}/{allJobTitles.length}) sẽ hiển thị trong phần chọn chức danh
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} size="sm">
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </div>

      <ScrollArea className="flex-1 p-6">
        <div className="space-y-8">
          {groupedJobTitles.map((group) => {
            if (group.items.length === 0) return null;
            return (
              <div key={group.key} className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground/80">{group.label}</h3>
                  <div className="h-px flex-1 bg-border/50"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {group.items.map((jt: any) => {
                    const isChecked = localCheckedIds.has(jt.id);
                    return (
                      <label
                        key={jt.id}
                        className={cn(
                          "flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors shadow-sm",
                          isChecked
                            ? "border-primary/50 bg-primary/5 ring-1 ring-primary/20"
                            : "border-border hover:bg-muted/50 hover:border-muted-foreground/30 bg-background"
                        )}
                      >
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => toggle(jt.id)}
                          className="mt-0.5"
                        />
                        <div className="space-y-1 min-w-0">
                          <p className="text-sm font-medium leading-snug truncate" title={jt.name}>
                            {jt.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate">{jt.code}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        <div className="h-6" />
      </ScrollArea>
    </div>
  );
}
