"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, Building2, Save, Search, Users, Tags, ArrowRight } from "lucide-react";

import { organizationApi } from "@/features/system-admin/organization/api";
import { useGetCategoryByGroup } from "@/features/system-admin/categories/hooks/useCategoryApi";
import { UNIT_TYPE_CATEGORY_GROUP, parseUnitTypeCategoryMeta } from "@/features/system-admin/organization/hooks/useUnitTypeCategories";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default function UnitJobTemplatesPage() {
  const queryClient = useQueryClient();
  const [selectedUnitTypeId, setSelectedUnitTypeId] = useState<number | null>(null);
  const [searchUnitText, setSearchUnitText] = useState("");
  const [searchJobText, setSearchJobText] = useState("");

  // 1. Fetch categories (Nhóm khối)
  const { data: categoryItems = [], isLoading: isLoadingCategories } = useGetCategoryByGroup(UNIT_TYPE_CATEGORY_GROUP);

  // 2. Lấy danh sách Loại đơn vị
  const { data: unitTypesRes, isLoading: isLoadingUnitTypes } = useQuery({
    queryKey: ["admin", "unit-types"],
    queryFn: () => organizationApi.getUnitTypes(),
  });
  const unitTypes = unitTypesRes?.data || [];

  // 3. Lấy danh sách nhóm vị trí việc làm (Category)
  const { data: groupsRes, isLoading: isLoadingGroups } = useQuery({
    queryKey: ["admin", "job-title-groups"],
    queryFn: () => organizationApi.getJobTitleGroups(),
  });
  const jobTitleGroups = groupsRes?.data || [];

  // 4. Lấy danh sách toàn bộ Chức danh
  const { data: jobTitlesRes, isLoading: isLoadingJobTitles } = useQuery({
    queryKey: ["admin", "all-job-titles"],
    queryFn: () => organizationApi.getJobTitles(),
  });
  const allJobTitles = jobTitlesRes?.data?.allTitles || [];

  // 5. Lấy cấu hình chức danh cho loại đơn vị đang chọn
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
    setSearchJobText(""); // Reset job search when switching unit
  };

  // Group unit types by their categoryCode
  const groupedUnitTypes = useMemo(() => {
    const map = new Map<string, { label: string; meta: any; items: any[] }>();

    // Khởi tạo các nhóm từ categoryItems
    categoryItems.forEach(cat => {
      map.set(cat.code, {
        label: cat.name,
        meta: parseUnitTypeCategoryMeta(cat),
        items: []
      });
    });

    const unassignedGroup = { label: "Khác", meta: null, items: [] as any[] };

    const lowerSearch = searchUnitText.toLowerCase();
    unitTypes.forEach((ut: any) => {
      if (lowerSearch && !ut.name.toLowerCase().includes(lowerSearch)) return;

      const code = ut.categoryCode;
      if (code && map.has(code)) {
        map.get(code)!.items.push(ut);
      } else {
        unassignedGroup.items.push(ut);
      }
    });

    const result = Array.from(map.values()).filter(g => g.items.length > 0);
    if (unassignedGroup.items.length > 0) result.push(unassignedGroup);
    return result;
  }, [unitTypes, categoryItems, searchUnitText]);

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-background flex-col rounded-xl border overflow-hidden shadow-sm">
      <div className="flex items-center px-6 py-5 border-b shrink-0 bg-card">
        <div className="p-2 bg-primary/10 rounded-lg mr-4">
          <Building2 className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Phân loại chức danh theo Đơn vị</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Thiết lập danh sách chức danh chuẩn (Job Titles) được phép sử dụng cho từng Loại đơn vị (Unit Types).
          </p>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden bg-muted/20">
        {/* LEFT PANEL: Danh sách Unit Types */}
        <div className="w-[340px] border-r flex flex-col shrink-0 bg-background">
          <div className="px-4 py-3 border-b flex flex-col gap-2 shadow-sm z-10">
            <h2 className="text-sm font-semibold text-foreground/80 flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Chọn Loại Đơn vị
            </h2>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm loại đơn vị..."
                className="pl-9 bg-muted/50 h-9 text-sm"
                value={searchUnitText}
                onChange={(e) => setSearchUnitText(e.target.value)}
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-3">
              {isLoadingUnitTypes || isLoadingCategories ? (
                <div className="space-y-4 p-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : groupedUnitTypes.length === 0 ? (
                <div className="text-center p-6 text-muted-foreground text-sm">
                  Không tìm thấy loại đơn vị nào.
                </div>
              ) : (
                <div className="space-y-6">
                  {groupedUnitTypes.map((group, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center gap-2 px-2">
                        <Badge variant="outline" className="bg-muted/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-0.5 border-none">
                          {group.label}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        {group.items.map((ut: any) => {
                          const isSelected = selectedUnitTypeId === ut.id;
                          return (
                            <button
                              key={ut.id}
                              onClick={() => handleSelectUnitType(ut.id)}
                              className={cn(
                                "group w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-lg transition-all text-left border border-transparent",
                                isSelected
                                  ? "bg-primary/10 text-primary-foreground font-medium shadow-sm border-primary/20"
                                  : "hover:bg-muted hover:border-border text-foreground/80 hover:text-foreground"
                              )}
                            >
                              <span className={cn("line-clamp-2", isSelected ? "text-primary" : "")}>{ut.name}</span>
                              {isSelected ? (
                                <ArrowRight className="h-4 w-4 text-primary shrink-0 ml-2 animate-in slide-in-from-left-1" />
                              ) : (
                                <div className="h-4 w-4 shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* RIGHT PANEL: Danh sách Chức danh */}
        <div className="flex-1 flex flex-col bg-muted/10 relative">
          {selectedUnitTypeId ? (
            <JobTitleSelectionPanel
              key={selectedUnitTypeId} // Force re-render on selection change
              allJobTitles={allJobTitles}
              jobTitleGroups={jobTitleGroups}
              serverCheckedIds={currentAssignedIds}
              isLoading={isLoadingTemplates || isLoadingJobTitles || isLoadingGroups}
              onSave={mutation.mutate}
              isSaving={mutation.isPending}
              searchText={searchJobText}
              setSearchText={setSearchJobText}
            />
          ) : (
            <div className="flex flex-1 items-center justify-center text-muted-foreground bg-background">
              <div className="text-center max-w-sm">
                <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Tags className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Chưa chọn Loại đơn vị</h3>
                <p className="text-sm">Vui lòng chọn một loại đơn vị ở danh sách bên trái để bắt đầu cấu hình chức danh cho nó.</p>
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
  searchText,
  setSearchText
}: {
  allJobTitles: any[];
  jobTitleGroups: any[];
  serverCheckedIds: number[];
  isLoading: boolean;
  onSave: (ids: number[]) => void;
  isSaving: boolean;
  searchText: string;
  setSearchText: (v: string) => void;
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
      <div className="p-8 space-y-6 bg-background h-full">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-1/2" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const handleSave = () => {
    onSave(Array.from(localCheckedIds));
  };

  const toggle = (id: number) => {
    const next = new Set(localCheckedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setLocalCheckedIds(next);
  };

  const toggleGroup = (items: any[]) => {
    if (!items || items.length === 0) return;
    const next = new Set(localCheckedIds);
    const allChecked = items.every(it => next.has(it.id));

    if (allChecked) {
      items.forEach(it => next.delete(it.id));
    } else {
      items.forEach(it => next.add(it.id));
    }

    setLocalCheckedIds(next);
  };

  // Build dynamic groups based on JobTitle.categoryId and filter by search
  const lowerSearch = searchText.toLowerCase();

  const groupedJobTitles = jobTitleGroups.map((group) => {
    return {
      key: group.code || group.id.toString(),
      label: group.name || group.translations?.[0]?.name || group.code,
      items: allJobTitles.filter((jt) => {
        if (jt.categoryId !== group.id) return false;
        if (lowerSearch && !jt.name.toLowerCase().includes(lowerSearch) && !jt.code.toLowerCase().includes(lowerSearch)) return false;
        return true;
      }),
    };
  });

  const unassignedItems = allJobTitles.filter((jt) => {
    if (jt.categoryId) return false;
    if (lowerSearch && !jt.name.toLowerCase().includes(lowerSearch) && !jt.code.toLowerCase().includes(lowerSearch)) return false;
    return true;
  });

  if (unassignedItems.length > 0) {
    groupedJobTitles.push({
      key: 'UNASSIGNED',
      label: 'Khác',
      items: unassignedItems,
    });
  }

  const totalFiltered = groupedJobTitles.reduce((acc, g) => acc + g.items.length, 0);

  return (
    <div className="flex flex-col h-full absolute inset-0 bg-background/50">
      <div className="px-6 py-4 border-b flex flex-wrap gap-4 items-center justify-between bg-card shrink-0 shadow-sm z-10">
        <div>
          <h2 className="text-base font-semibold text-foreground">Chọn chức danh áp dụng</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Đã chọn <span className="font-semibold text-primary">{localCheckedIds.size}</span> / {allJobTitles.length} chức danh
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm chức danh..."
              className="pl-9 h-9"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <Button onClick={handleSave} disabled={isSaving} className="shadow-sm">
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6">
        {totalFiltered === 0 ? (
          <div className="flex flex-col items-center justify-center text-muted-foreground py-16">
            <Users className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p>Không tìm thấy chức danh nào phù hợp với tìm kiếm.</p>
          </div>
        ) : (
          <div className="space-y-8 max-w-7xl mx-auto">
            {groupedJobTitles.map((group) => {
              if (group.items.length === 0) return null;
              return (
                <div key={group.key} className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-semibold text-foreground tracking-tight">{group.label}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-[11px] px-2 text-muted-foreground hover:text-primary shrink-0"
                      onClick={() => toggleGroup(group.items)}
                    >
                      {group.items.every(it => localCheckedIds.has(it.id)) ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                    </Button>
                    <div className="h-px flex-1 bg-border/60"></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {group.items.map((jt: any) => {
                      const isChecked = localCheckedIds.has(jt.id);
                      return (
                        <label
                          key={jt.id}
                          className={cn(
                            "flex items-start space-x-3 p-3.5 rounded-xl border cursor-pointer transition-all shadow-sm hover:shadow-md",
                            isChecked
                              ? "border-primary bg-primary/[0.03] ring-1 ring-primary/20"
                              : "border-border hover:border-muted-foreground/40 bg-card"
                          )}
                        >
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={() => toggle(jt.id)}
                            className={cn(
                              "mt-0.5 h-5 w-5 rounded-sm transition-all shrink-0",
                              isChecked ? "data-[state=checked]:bg-primary data-[state=checked]:border-primary" : ""
                            )}
                          />
                          <div className="space-y-1 min-w-0 flex-1">
                            <p className="text-sm font-medium leading-snug truncate text-foreground" title={jt.name}>
                              {jt.name}
                            </p>
                            <p className="text-xs text-muted-foreground/80 truncate">{jt.code}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div className="h-8 shrink-0" />
      </div>
    </div>
  );
}
