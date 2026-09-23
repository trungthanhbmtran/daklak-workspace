/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

/**
 * OrganizationStaffing — Dinh bien & Chuc danh.
 * Rebuilt from scratch. No return null. Correct TQ v5 loading states.
 */

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { useOrganizationContext } from "../../context/OrganizationContext";
import { useStaffingData, useStaffingActions } from "./hooks/useStaffingData";
import { StaffingTable } from "./StaffingTable";
import { JobTitleConfigDialog } from "./JobTitleConfigDialog";
import { organizationApi } from "../../api";
import { organizationQueryKeys } from "../../constants/queryKeys";
import { useDomainSearch } from "../../hooks/useScopeCatalog";
import type { JobTitleItem, StaffingReportItem } from "../../types";

const STALE = 2 * 60 * 1000;
const PAGE_SIZE = 8;

export function OrganizationStaffing() {
  const params = useParams<{ code: string }>();
  const code = params?.code ? decodeURIComponent(params.code) : "";

  /* 1. Detail query — reuse cache from layout */
  const detailQuery = useQuery({
    queryKey: code ? [...organizationQueryKeys.all, "detail", code] : [...organizationQueryKeys.all, "detail"],
    queryFn: () => organizationApi.getDetail(code),
    enabled: !!code,
    staleTime: STALE,
  });

  const unit = detailQuery.data?.data;
  const unitId = unit?.id;

  const { state } = useOrganizationContext();
  const { flatUnits } = state;

  /* 2. Staffing data */
  const { report, jobTitles, isLoadingReport, isLoadingJobTitles, isError } = useStaffingData(unitId ?? null);
  const { setStaffing, setStaffingSlot, updateJobTitle } = useStaffingActions(unitId ?? null);

  /* 3. Domain list for unit (for SlotCard) */
  const { items: allDomains } = useDomainSearch(unit?.domainIds ?? []);
  const domainsForUnit = unit?.domainIds?.length
    ? allDomains.filter((d: any) => unit.domainIds!.includes(d.id))
    : [];
  const subordinateUnits = flatUnits.filter(u => u.parentId === unitId);

  /* 4. UI state */
  const [activeTab, setActiveTab] = useState<"CHINH_QUYEN" | "DANG">("CHINH_QUYEN");
  const [selectedJobTitleId, setSelectedJobTitleId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [govPage, setGovPage] = useState(1);
  const [partyPage, setPartyPage] = useState(1);

  /* Config dialog */
  const [configOpen, setConfigOpen] = useState(false);
  const [configJobTitle, setConfigJobTitle] = useState<JobTitleItem | null>(null);
  const [configDomainId, setConfigDomainId] = useState("__none__");

  /* 5. Classify job titles */
  const isParty = (j: JobTitleItem) => ["DANG", "PARTY"].includes(j.category?.toUpperCase() ?? "") || ["DANG", "PARTY"].includes(j.type?.toUpperCase() ?? "");

  const { partyTitles, govTitles } = useMemo(() => {
    const p: JobTitleItem[] = [];
    const g: JobTitleItem[] = [];
    jobTitles.forEach(j => (isParty(j) ? p : g).push(j));
    return { partyTitles: p, govTitles: g };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobTitles]);

  const { partyReport, govReport } = useMemo(() => {
    const p: StaffingReportItem[] = [];
    const g: StaffingReportItem[] = [];
    report.forEach(rep => {
      const jt = jobTitles.find(j => j.id === rep.jobTitleId);
      const party = jt ? isParty(jt) : false;
      (party ? p : g).push(rep);
    });
    return { partyReport: p, govReport: g };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report, jobTitles]);

  /* 6. Handlers */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitId || !selectedJobTitleId) { toast.error("Vui lòng chọn chức danh."); return; }
    const q = parseInt(quantity, 10);
    if (Number.isNaN(q) || q < 1) { toast.error("Số lượng phải là số nguyên dương."); return; }
    setStaffing.mutate({ unitId, jobTitleId: parseInt(selectedJobTitleId, 10), quantity: q });
    setQuantity("1");
    setSelectedJobTitleId("");
  };

  const openConfig = (j: JobTitleItem) => {
    setConfigJobTitle(j);
    setConfigDomainId(j.domainId ? String(j.domainId) : "__none__");
    setConfigOpen(true);
  };

  const handleSaveConfig = () => {
    if (!configJobTitle) return;
    updateJobTitle.mutate({ id: configJobTitle.id, domainId: configDomainId === "__none__" ? 0 : parseInt(configDomainId, 10) }, { onSuccess: () => { setConfigOpen(false); setConfigJobTitle(null); } });
  };

  /* 7. Render states */
  // Không dùng early-return để form luôn render ngay, tránh bị ẩn khi chuyển tab
  const isDetailLoading = (detailQuery.isPending || detailQuery.isFetching) && !unit;
  const isDetailError = detailQuery.isError || (!!code && !isDetailLoading && !unit);


  /* 8. Tab content renderer */
  const renderTab = (titleList: JobTitleItem[], reportList: StaffingReportItem[], label: string, page: number, setPage: (p: number) => void) => {
    const totalPages = Math.max(1, Math.ceil(reportList.length / PAGE_SIZE));
    const safeP = page > totalPages ? 1 : page;
    const paged = reportList.slice((safeP - 1) * PAGE_SIZE, safeP * PAGE_SIZE);
    return (
      <div className="flex flex-col flex-1 min-h-0 gap-4 mt-2">
        <section className="shrink-0 rounded-lg border bg-muted/30 p-4">
          <h3 className="text-sm font-medium mb-3">Thêm định biên {label.toLowerCase()}</h3>
          <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5 min-w-[220px]">
              <label className="text-sm font-medium text-foreground">Chuc danh</label>
              <Select value={selectedJobTitleId || "__none__"} onValueChange={v => setSelectedJobTitleId(v === "__none__" ? "" : v)} disabled={isLoadingJobTitles}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Chọn chức danh" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Chọn chức danh</SelectItem>
                  {titleList.map(j => (
                    <SelectItem key={j.id} value={String(j.id)}>
                      <span>{j.name} ({j.code}){(j.domainName || j.geographicAreaName) && <span className="text-muted-foreground text-xs ml-1">— {[j.domainName, j.geographicAreaName].filter(Boolean).join(", ")}</span>}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 w-24">
              <label className="text-sm font-medium text-foreground">Số lượng</label>
              <Input type="number" min={1} className="h-9" value={quantity} onChange={e => setQuantity(e.target.value)} disabled={setStaffing.isPending} />
            </div>
            <Button type="submit" size="default" className="h-9" disabled={setStaffing.isPending || !selectedJobTitleId}>
              {setStaffing.isPending ? "Đang lưu..." : "Lưu định biên"}
            </Button>
          </form>
        </section>

        <section className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium">Danh sách {label.toLowerCase()}</h3>
            {reportList.length > 0 && <span className="text-xs text-muted-foreground">{reportList.length} chức danh</span>}
          </div>
          {isLoadingReport ? (
            <Skeleton className="h-40 w-full rounded-lg" />
          ) : reportList.length === 0 ? (
            <div className="rounded-lg border border-dashed bg-muted/20 py-10 text-center text-sm text-muted-foreground">
              Chua co dinh bien. Them chức danh va so luong o form tren.
            </div>
          ) : (
            <>
              <div className="rounded-lg border overflow-y-auto flex-1 min-h-0 relative">
                <StaffingTable report={paged} domainsForUnit={domainsForUnit} unitDomainIds={unit?.domainIds ?? []} subordinateUnits={subordinateUnits} onSaveSlot={p => setStaffingSlot.mutate(p)} isSavingSlot={setStaffingSlot.isPending} />
              </div>
              {totalPages > 1 && (
                <div className="shrink-0 flex items-center justify-between mt-2 px-1">
                  <span className="text-xs text-muted-foreground">{(safeP - 1) * PAGE_SIZE + 1}–{Math.min(safeP * PAGE_SIZE, reportList.length)} / {reportList.length}</span>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" className="h-7 px-2 text-xs" disabled={safeP <= 1} onClick={() => setPage(safeP - 1)}>Trước</Button>
                    <span className="text-xs font-medium px-2 self-center">{safeP}/{totalPages}</span>
                    <Button variant="outline" size="sm" className="h-7 px-2 text-xs" disabled={safeP >= totalPages} onClick={() => setPage(safeP + 1)}>Sau</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        {titleList.length > 0 && (
          <section className="shrink-0 rounded-lg border bg-muted/20 p-4">
            <h3 className="text-sm font-medium mb-1">Cau hinh chức danh</h3>
            <p className="text-xs text-muted-foreground mb-3">Lĩnh vực phụ trách (theo cấp trên giao). Theo dõi phòng ban: đơn vị trực thuộc.</p>
            <div className="flex flex-wrap gap-2">
              {titleList.map(j => (
                <Button key={j.id} type="button" variant="outline" size="sm" className="h-8" onClick={() => openConfig(j)}>
                  {j.name}
                  {(j.domainName || j.geographicAreaName || (j.monitoredUnitNames?.length ?? 0) > 0) && <span className="ml-1.5 text-muted-foreground">•</span>}
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
          {isDetailLoading
            ? <Skeleton className="inline-block h-4 w-40 ml-2 align-middle" />
            : unit?.name && <span className="font-normal text-muted-foreground"> — {unit.name}</span>
          }
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">Chức danh theo NĐ 334/2025/NĐ-CP (Đảng, Chính quyền).</p>
      </div>

      {isDetailLoading ? (
        <div className="flex flex-col gap-4 flex-1">
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
        </div>
      ) : isDetailError ? (
        <div className="rounded-xl border border-dashed bg-muted/20 py-16 flex flex-col items-center gap-3 text-center">
          <AlertCircle className="h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Không tải được thông tin đơn vị. Vui lòng thử lại.</p>
        </div>
      ) : isError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 py-10 text-center">
          <p className="text-sm text-destructive">Không tải được báo cáo định biên. Vui lòng thử lại.</p>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={(v: any) => { setActiveTab(v); setSelectedJobTitleId(""); setQuantity("1"); }} className="flex-1 min-h-0 flex flex-col w-full">
          <TabsList className="shrink-0 w-full grid grid-cols-2 h-10 items-center justify-center rounded-xl bg-muted p-1 text-muted-foreground">
            <TabsTrigger value="CHINH_QUYEN" className="rounded-lg text-xs font-semibold">Chính quyền</TabsTrigger>
            <TabsTrigger value="DANG" className="rounded-lg text-xs font-semibold">Đảng đoàn thể</TabsTrigger>
          </TabsList>
          <TabsContent value="CHINH_QUYEN" className="flex-1 min-h-0 mt-0 data-[state=active]:flex flex-col">
            {renderTab(govTitles, govReport, "Chính quyền", govPage, setGovPage)}
          </TabsContent>
          <TabsContent value="DANG" className="flex-1 min-h-0 mt-0 data-[state=active]:flex flex-col">
            {renderTab(partyTitles, partyReport, "Đảng", partyPage, setPartyPage)}
          </TabsContent>
        </Tabs>
      )}

      {configOpen && (
        <JobTitleConfigDialog open={configOpen} onOpenChange={setConfigOpen} jobTitle={configJobTitle} domainId={configDomainId} onDomainIdChange={setConfigDomainId} onSave={handleSaveConfig} isSaving={updateJobTitle.isPending} domainsForUnit={domainsForUnit} unitName={unit?.name} />
      )}
    </div>
  );
}
