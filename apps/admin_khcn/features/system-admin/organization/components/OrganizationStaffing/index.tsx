"use client";

import { useState, useMemo } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOrganizationContext } from "../../context/OrganizationContext";
import { useStaffingReport } from "./hooks/useStaffingReport";
import { useStaffingMutations } from "./hooks/useStaffingMutations";
import { StaffingTable } from "./StaffingTable";
import { JobTitleConfigDialog } from "./JobTitleConfigDialog";
import { Skeleton } from "@/components/ui/skeleton";
import type { JobTitleItem, StaffingReportItem } from "../../types";
import { useDomainSearch } from "../../hooks/useScopeCatalog";

export function OrganizationStaffing() {
  const { state } = useOrganizationContext();
  const { selectedId, flatUnits } = state;

  const [activeTab, setActiveTab] = useState<"DANG" | "CHINH_QUYEN">("CHINH_QUYEN");
  const [selectedJobTitleId, setSelectedJobTitleId] = useState<string>("");
  const [quantity, setQuantity] = useState("1");
  const [configOpen, setConfigOpen] = useState(false);
  const [configJobTitle, setConfigJobTitle] = useState<JobTitleItem | null>(null);
  const [configDomainId, setConfigDomainId] = useState("__none__");
  const [govPage, setGovPage] = useState(1);
  const [partyPage, setPartyPage] = useState(1);
  const STAFFING_PAGE_SIZE = 8;

  const unit =
    selectedId != null ? flatUnits.find((u) => u.id === selectedId) : null;

  const {
    report,
    jobTitles,
    isLoadingReport,
    isLoadingJobTitles,
    isError,
  } = useStaffingReport(selectedId ?? null);

  const { items: domains } = useDomainSearch(unit?.domainIds ?? []);
  const { setStaffing, setStaffingSlot, updateJobTitle } =
    useStaffingMutations(selectedId ?? null);

  const domainsForUnit =
    unit?.domainIds?.length && domains.length
      ? domains.filter((d: any) => unit.domainIds!.includes(d.id))
      : domains;
  const subordinateUnits = flatUnits.filter((u) => u.parentId === selectedId);

  const openConfig = (j: JobTitleItem) => {
    setConfigJobTitle(j);
    setConfigDomainId(j.domainId ? String(j.domainId) : "__none__");
    setConfigOpen(true);
  };

  const handleSaveConfig = () => {
    if (!configJobTitle) return;
    updateJobTitle.mutate(
      {
        id: configJobTitle.id,
        domainId: configDomainId === "__none__" ? 0 : parseInt(configDomainId, 10),
      },
      {
        onSuccess: () => {
          setConfigOpen(false);
          setConfigJobTitle(null);
        },
      }
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

  // Logic phân loại chức danh
  const isParty = (j: JobTitleItem) =>
    ["DANG", "PARTY"].includes(j.category?.toUpperCase() ?? "") ||
    ["DANG", "PARTY"].includes(j.type?.toUpperCase() ?? "");
  const isGov = (j: JobTitleItem) =>
    ["CHINH_QUYEN", "GOV", "CHINHQUYEN"].includes(j.category?.toUpperCase() ?? "") ||
    ["CHINH_QUYEN", "GOV", "CHINHQUYEN"].includes(j.type?.toUpperCase() ?? "");

  const getJobTitleGroup = (j: JobTitleItem) => {
    if (isParty(j)) return "DANG";
    if (isGov(j)) return "CHINH_QUYEN";
    // Mặc định cho vào Chính quyền nếu không xác định
    return "CHINH_QUYEN";
  };

  const { partyTitles, govTitles } = useMemo(() => {
    const p: JobTitleItem[] = [];
    const g: JobTitleItem[] = [];
    jobTitles.forEach((j) => {
      // Bỏ qua Ngạch vì không định biên theo Ngạch
      const group = getJobTitleGroup(j);
      if (group === "DANG") p.push(j);
      else g.push(j);
    });
    return { partyTitles: p, govTitles: g };
  }, [jobTitles]);

  const { partyReport, govReport } = useMemo(() => {
    const p: StaffingReportItem[] = [];
    const g: StaffingReportItem[] = [];

    report.forEach((rep) => {
      const matchJobTitle = jobTitles.find((j) => j.id === rep.jobTitleId);
      const group = matchJobTitle ? getJobTitleGroup(matchJobTitle) : "CHINH_QUYEN";
      if (group === "DANG") p.push(rep);
      else g.push(rep);
    });
    return { partyReport: p, govReport: g };
  }, [report, jobTitles]);

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

  const renderTabContent = (
    titleList: JobTitleItem[],
    reportList: StaffingReportItem[],
    label: string,
    page: number,
    setPage: (p: number) => void
  ) => {
    const PAGE_SIZE = STAFFING_PAGE_SIZE;
    const totalPages = Math.max(1, Math.ceil(reportList.length / PAGE_SIZE));
    const safeP = page > totalPages ? 1 : page;
    const pagedReport = reportList.slice((safeP - 1) * PAGE_SIZE, safeP * PAGE_SIZE);
    return (
      <div className="flex flex-col h-full min-h-0 gap-4 mt-2">
        <section className="shrink-0 rounded-lg border bg-muted/30 p-4">
          <h3 className="text-sm font-medium mb-3">Thêm định biên {label.toLowerCase()}</h3>
          <form onSubmit={handleSubmitStaffing} className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5 min-w-[220px]">
              <label className="text-sm font-medium text-foreground">Chức danh</label>
              <Select
                value={selectedJobTitleId || "__none__"}
                onValueChange={(v) => setSelectedJobTitleId(v === "__none__" ? "" : v)}
                disabled={isLoadingJobTitles}
              >
                <SelectTrigger className="h-9"><SelectValue placeholder="Chọn chức danh" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Chọn chức danh</SelectItem>
                  {titleList.map((j) => (
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
              <Input type="number" min={1} className="h-9" value={quantity}
                onChange={(e) => setQuantity(e.target.value)} disabled={setStaffing.isPending} />
            </div>
            <Button type="submit" size="default" className="h-9"
              disabled={setStaffing.isPending || !selectedJobTitleId}>
              {setStaffing.isPending ? "Đang lưu..." : "Lưu định biên"}
            </Button>
          </form>
        </section>

        <section className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium">Danh sách {label.toLowerCase()}</h3>
            {reportList.length > 0 && (
              <span className="text-xs text-muted-foreground">{reportList.length} chức danh</span>
            )}
          </div>
          {isLoadingReport ? (
            <Skeleton className="h-40 w-full rounded-lg" />
          ) : reportList.length === 0 ? (
            <div className="rounded-lg border border-dashed bg-muted/20 py-10 text-center text-sm text-muted-foreground">
              Chưa có định biên. Thêm chức danh và số lượng ở form trên.
            </div>
          ) : (
            <>
              <div className="rounded-lg border overflow-y-auto flex-1 min-h-0 relative">
                <StaffingTable
                  report={pagedReport}
                  domainsForUnit={domainsForUnit}
                  unitDomainIds={unit?.domainIds ?? []}
                  subordinateUnits={subordinateUnits}
                  onSaveSlot={(payload) => setStaffingSlot.mutate(payload)}
                  isSavingSlot={setStaffingSlot.isPending}
                />
              </div>
              {totalPages > 1 && (
                <div className="shrink-0 flex items-center justify-between mt-2 px-1">
                  <span className="text-xs text-muted-foreground">
                    {(safeP - 1) * PAGE_SIZE + 1}–{Math.min(safeP * PAGE_SIZE, reportList.length)} / {reportList.length}
                  </span>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" className="h-7 px-2 text-xs"
                      disabled={safeP <= 1} onClick={() => setPage(safeP - 1)}>Trước</Button>
                    <span className="text-xs font-medium px-2 self-center">{safeP}/{totalPages}</span>
                    <Button variant="outline" size="sm" className="h-7 px-2 text-xs"
                      disabled={safeP >= totalPages} onClick={() => setPage(safeP + 1)}>Sau</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        {titleList.length > 0 && (
          <section className="shrink-0 rounded-lg border bg-muted/20 p-4">
            <h3 className="text-sm font-medium mb-1">Cấu hình chức danh</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Lĩnh vực phụ trách (theo cấp trên giao). Theo dõi phòng ban: đơn vị trực thuộc.
            </p>
            <div className="flex flex-wrap gap-2">
              {titleList.map((j) => (
                <Button key={j.id} type="button" variant="outline" size="sm" className="h-8" onClick={() => openConfig(j)}>
                  {j.name}
                  {(j.domainName || j.geographicAreaName || (j.monitoredUnitNames?.length ?? 0) > 0) && (
                    <span className="ml-1.5 text-muted-foreground">•</span>
                  )}
                </Button>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full min-h-0 gap-4">
      <div className="shrink-0">
        <h2 className="text-base font-semibold text-foreground">
          Định biên & Chức danh
          {unit?.name && (
            <span className="font-normal text-muted-foreground"> — {unit.name}</span>
          )}
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Chức danh theo NĐ 334/2025/NĐ-CP (Đảng, Chính quyền).
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(val: any) => {
          setActiveTab(val);
          setSelectedJobTitleId("");
          setQuantity("1");
        }}
        className="flex-1 min-h-0 flex flex-col w-full"
      >
        <TabsList className="shrink-0 w-full grid grid-cols-2 h-10 items-center justify-center rounded-xl bg-muted p-1 text-muted-foreground">
          <TabsTrigger value="CHINH_QUYEN" className="rounded-lg text-xs font-semibold">
            Chính quyền
          </TabsTrigger>
          <TabsTrigger value="DANG" className="rounded-lg text-xs font-semibold">
            Đảng đoàn thể
          </TabsTrigger>
        </TabsList>

        <TabsContent value="CHINH_QUYEN" className="flex-1 min-h-0 mt-0 data-[state=active]:flex flex-col">
          {renderTabContent(govTitles, govReport, "Chính quyền", govPage, setGovPage)}
        </TabsContent>

        <TabsContent value="DANG" className="flex-1 min-h-0 mt-0 data-[state=active]:flex flex-col">
          {renderTabContent(partyTitles, partyReport, "Đảng", partyPage, setPartyPage)}
        </TabsContent>
      </Tabs>

      <JobTitleConfigDialog
        open={configOpen}
        onOpenChange={setConfigOpen}
        jobTitle={configJobTitle}
        domainId={configDomainId}
        onDomainIdChange={setConfigDomainId}
        onSave={handleSaveConfig}
        isSaving={updateJobTitle.isPending}
        domainsForUnit={domainsForUnit}
        unitName={unit?.name}
      />
    </div>
  );
}
