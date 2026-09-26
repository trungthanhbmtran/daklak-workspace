"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FileText, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOrganizationDetailQuery } from "@/features/system-admin/organization/hooks/useOrganizationQueries";
import { useOrganizationContext } from "@/features/system-admin/organization/context/OrganizationContext";
import { OrganizationUnitEdit } from "@/features/system-admin/organization/components/OrganizationUnitEdit";
import { UnitScopePanel } from "@/features/system-admin/organization/components/UnitScopePanel";
import { OrganizationStaffing } from "@/features/system-admin/organization/components/OrganizationStaffing";

export default function OrganizationDetailPage() {
  const params = useParams<{ code: string }>();
  const rawCode = params?.code;
  const code = rawCode ? decodeURIComponent(rawCode) : "";

  const { data: unitData, isPending, isFetching, isError, isPlaceholderData } = useOrganizationDetailQuery(code);
  const unit = unitData?.data;

  // TanStack Query v5: khi query disabled (code = ""), isLoading = false, isPending = true.
  // isPlaceholderData = true khi keepPreviousData đang giữ data cũ trong lúc fetch data mới.
  const isQueryLoading = isPending || isFetching || isPlaceholderData;

  const { state } = useOrganizationContext();
  const { flatUnits } = state;
  const parentUnit = unit?.parentId != null ? flatUnits.find((u) => u.id === unit.parentId) : null;

  const [activeTab, setActiveTab] = useState("info");

  // Reset tab to "info" when switching organizations
  useEffect(() => {
    setActiveTab("info");
  }, [code]);

  if (isError || (!isQueryLoading && !unit && code)) {
    return (
      <div className="flex-1 min-h-0 flex items-center justify-center rounded-xl border bg-card text-card-foreground shadow-sm h-full">
        <div className="flex flex-col items-center gap-2">
          <p className="text-muted-foreground">Không tìm thấy đơn vị hoặc mã đơn vị không hợp lệ (Mã: {code}).</p>
          <Link href="/services/admin/organization">
            <Badge variant="outline" className="cursor-pointer hover:bg-muted">
              Quay lại danh sách
            </Badge>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm h-full">
      {/* Header */}
      <div className="pb-4 shrink-0 bg-muted/10 border-b p-4">
        {isQueryLoading && !unit ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-6 w-1/3" />
          </div>
        ) : unit ? (
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-0.5 min-w-0">
              <p className="text-xs text-muted-foreground truncate">
                {parentUnit ? `${parentUnit.name} /` : "Cơ cấu tổ chức /"} {unit.name}
              </p>
              <h2 className="text-base font-semibold leading-none tracking-tight">
                {unit.name}
              </h2>
            </div>
            <Badge variant="outline" className="font-mono text-xs shrink-0 bg-background">{unit.code}</Badge>
          </div>
        ) : null}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0 h-full w-full">
        {/* Tab bar */}
        <div className="shrink-0 border-b bg-muted/30 px-4 pt-3 pb-2">
          <TabsList className="flex h-9 w-full sm:w-auto bg-muted/60 p-0.5 rounded-lg space-x-1 justify-start">
            <TabsTrigger 
              value="info" 
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            >
              <FileText className="h-4 w-4 shrink-0" />
              <span>Thông tin</span>
            </TabsTrigger>
            <TabsTrigger 
              value="scope" 
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            >
              <MapPin className="h-4 w-4 shrink-0" />
              <span>Phạm vi phụ trách</span>
            </TabsTrigger>
            <TabsTrigger 
              value="staffing" 
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            >
              <Users className="h-4 w-4 shrink-0" />
              <span>Định biên & Chức danh</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Content area */}
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col focus-visible:outline-none h-full">
          <TabsContent value="info" className="flex-1 min-h-0 m-0 overflow-hidden outline-none data-[state=inactive]:hidden data-[state=active]:flex data-[state=active]:flex-col h-full">
            <OrganizationUnitEdit />
          </TabsContent>
          <TabsContent value="scope" className="flex-1 min-h-0 m-0 outline-none data-[state=inactive]:hidden data-[state=active]:flex data-[state=active]:flex-col h-full">
            <div className="flex-1 min-h-0 overflow-y-auto mt-0 pt-4 px-4 pb-4 flex flex-col focus-visible:outline-none h-full">
              <UnitScopePanel />
            </div>
          </TabsContent>
          <TabsContent value="staffing" className="flex-1 min-h-0 m-0 outline-none data-[state=inactive]:hidden data-[state=active]:flex data-[state=active]:flex-col h-full">
            <div className="flex-1 min-h-0 overflow-y-auto mt-0 pt-4 px-4 pb-4 flex flex-col focus-visible:outline-none h-full">
              <OrganizationStaffing />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
