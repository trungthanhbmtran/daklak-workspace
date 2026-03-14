"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrganizationContext } from "../../context/OrganizationContext";
import { useStaffingReport } from "./hooks/useStaffingReport";
import { useStaffingMutations } from "./hooks/useStaffingMutations";
import { StaffingTable } from "./StaffingTable";
import { JobTitleConfigDialog } from "./JobTitleConfigDialog";
import { Skeleton } from "@/components/ui/skeleton";
import type { JobTitleItem } from "../../types";

export function OrganizationStaffing() {
  const { state, meta } = useOrganizationContext();
  const { selectedId, flatUnits } = state;
  const { domains } = meta;

  const [selectedJobTitleId, setSelectedJobTitleId] = useState<string>("");
  const [quantity, setQuantity] = useState("1");
  const [configOpen, setConfigOpen] = useState(false);
  const [configJobTitle, setConfigJobTitle] = useState<JobTitleItem | null>(null);
  const [configDomainId, setConfigDomainId] = useState("__none__");
  const [configGeoId, setConfigGeoId] = useState("__none__");
  const [configUnitIds, setConfigUnitIds] = useState<number[]>([]);

  const unit =
    selectedId != null ? flatUnits.find((u) => u.id === selectedId) : null;

  const {
    report,
    jobTitles,
    geoAreas,
    isLoadingReport,
    isLoadingJobTitles,
    isError,
  } = useStaffingReport(selectedId ?? null);

  const { setStaffing, setStaffingSlot, updateJobTitle } =
    useStaffingMutations(selectedId ?? null);

  const domainsForUnit =
    unit?.domainIds?.length && domains.length
      ? domains.filter((d) => unit.domainIds!.includes(d.id))
      : domains;
  const subordinateUnits = flatUnits.filter((u) => u.parentId === selectedId);

  const openConfig = (j: JobTitleItem) => {
    setConfigJobTitle(j);
    setConfigDomainId(j.domainId ? String(j.domainId) : "__none__");
    setConfigGeoId(j.geographicAreaId ? String(j.geographicAreaId) : "__none__");
    setConfigUnitIds(j.monitoredUnitIds ?? []);
    setConfigOpen(true);
  };

  const handleSaveConfig = () => {
    if (!configJobTitle) return;
    updateJobTitle.mutate(
      {
        id: configJobTitle.id,
        domainId: configDomainId === "__none__" ? 0 : parseInt(configDomainId, 10),
        geographicAreaId: configGeoId === "__none__" ? 0 : parseInt(configGeoId, 10),
        monitoredUnitIds: configUnitIds,
      },
      {
        onSuccess: () => {
          setConfigOpen(false);
          setConfigJobTitle(null);
        },
      }
    );
  };

  const toggleConfigUnit = (unitId: number) => {
    setConfigUnitIds((prev) =>
      prev.includes(unitId) ? prev.filter((id) => id !== unitId) : [...prev, unitId]
    );
  };

  const handleSubmitStaffing = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedId == null || !selectedJobTitleId) {
      toast.error("Vui lòng chọn chức danh.");
      return;
    }
    const q = parseInt(quantity, 10);
    if (Number.isNaN(q) || q < 1) {
      toast.error("Số lượng phải là số nguyên dương.");
      return;
    }
    setStaffing.mutate({
      unitId: selectedId,
      jobTitleId: parseInt(selectedJobTitleId, 10),
      quantity: q,
    });
    setQuantity("1");
    setSelectedJobTitleId("");
  };

  if (selectedId == null) return null;

  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 py-10 text-center">
        <p className="text-sm text-destructive">
          Không tải được báo cáo định biên. Vui lòng thử lại.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-base font-semibold text-foreground">
          Định biên & Chức danh
          {unit?.name && (
            <span className="font-normal text-muted-foreground"> — {unit.name}</span>
          )}
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Chức danh theo NĐ 24/2014, 107/2020. Chỉ hiện chức danh áp dụng cho loại đơn vị.
        </p>
      </div>

      <section className="rounded-lg border bg-muted/30 p-4">
        <h3 className="text-sm font-medium mb-3">Thêm / cập nhật định biên</h3>
        <form
          onSubmit={handleSubmitStaffing}
          className="flex flex-wrap items-end gap-4"
        >
          <div className="space-y-1.5 min-w-[220px]">
            <label className="text-sm font-medium text-foreground">Chức danh</label>
            <Select
              value={selectedJobTitleId || "__none__"}
              onValueChange={(v) =>
                setSelectedJobTitleId(v === "__none__" ? "" : v)
              }
              disabled={isLoadingJobTitles}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Chọn chức danh" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Chọn chức danh</SelectItem>
                {jobTitles.map((j) => (
                  <SelectItem key={j.id} value={String(j.id)}>
                    <span>
                      {j.name} ({j.code})
                      {(j.domainName || j.geographicAreaName) && (
                        <span className="text-muted-foreground text-xs ml-1">
                          — {[j.domainName, j.geographicAreaName].filter(Boolean).join(", ")}
                        </span>
                      )}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 w-24">
            <label className="text-sm font-medium text-foreground">Số lượng</label>
            <Input
              type="number"
              min={1}
              className="h-9"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              disabled={setStaffing.isPending}
            />
          </div>
          <Button
            type="submit"
            size="default"
            className="h-9"
            disabled={setStaffing.isPending || !selectedJobTitleId}
          >
            {setStaffing.isPending ? "Đang lưu..." : "Lưu định biên"}
          </Button>
        </form>
      </section>

      <section>
        <h3 className="text-sm font-medium mb-3">Danh sách chức danh đơn vị</h3>
        {isLoadingReport ? (
          <Skeleton className="h-40 w-full rounded-lg" />
        ) : report.length === 0 ? (
          <div className="rounded-lg border border-dashed bg-muted/20 py-10 text-center text-sm text-muted-foreground">
            Chưa có định biên. Thêm chức danh và số lượng ở form trên.
          </div>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <StaffingTable
              report={report}
              domainsForUnit={domainsForUnit}
              geoAreas={geoAreas}
              subordinateUnits={subordinateUnits}
              onSaveSlot={(payload) => setStaffingSlot.mutate(payload)}
              isSavingSlot={setStaffingSlot.isPending}
            />
          </div>
        )}
      </section>

      <section className="rounded-lg border bg-muted/20 p-4">
        <h3 className="text-sm font-medium mb-1">Cấu hình chức danh</h3>
        <p className="text-xs text-muted-foreground mb-3">
          Lĩnh vực phụ trách (theo cấp trên giao). Theo dõi phòng ban: đơn vị trực thuộc.
        </p>
        <div className="flex flex-wrap gap-2">
          {jobTitles.map((j) => (
            <Button
              key={j.id}
              type="button"
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => openConfig(j)}
            >
              {j.name}
              {(j.domainName ||
                j.geographicAreaName ||
                (j.monitoredUnitNames?.length ?? 0) > 0) && (
                <span className="ml-1.5 text-muted-foreground">•</span>
              )}
            </Button>
          ))}
        </div>
      </section>

      <JobTitleConfigDialog
        open={configOpen}
        onOpenChange={setConfigOpen}
        jobTitle={configJobTitle}
        domainId={configDomainId}
        geoId={configGeoId}
        unitIds={configUnitIds}
        onDomainIdChange={setConfigDomainId}
        onGeoIdChange={setConfigGeoId}
        onUnitToggle={toggleConfigUnit}
        onSave={handleSaveConfig}
        isSaving={updateJobTitle.isPending}
        domainsForUnit={domainsForUnit}
        geoAreas={geoAreas}
        subordinateUnits={subordinateUnits}
        unitName={unit?.name}
      />
    </div>
  );
}
