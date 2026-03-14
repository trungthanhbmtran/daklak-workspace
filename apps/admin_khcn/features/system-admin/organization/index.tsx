"use client";

import { Building2, FileText, Users } from "lucide-react";
import { OrganizationSidebar } from "./components/OrganizationSidebar";
import { OrganizationForm } from "./components/OrganizationForm";
import { OrganizationUnitEdit } from "./components/OrganizationUnitEdit";
import { OrganizationStaffing } from "./components/OrganizationStaffing";
import { useOrganizationApi } from "./hooks/useOrganizationApi";
import { useOrganizationView } from "./hooks/useOrganizationView";
import { OrganizationProvider, type ViewMode } from "./context/OrganizationContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

export const Organization = {
  Provider: OrganizationProvider,
  Sidebar: OrganizationSidebar,
  Form: OrganizationForm,
  UnitEdit: OrganizationUnitEdit,
  Staffing: OrganizationStaffing,
};

export type { ViewState } from "./hooks/useOrganizationView";

export function OrganizationClient() {
  const api = useOrganizationApi();
  const view = useOrganizationView();
  const { viewState, activeTab, setActiveTab } = view;

  const contextValue = {
    state: {
      flatUnits: api.flatUnits,
      mode: viewState.mode,
      selectedId: viewState.selectedId,
      parentId: viewState.parentId,
      isLoadingTree: api.isLoadingTree,
    },
    actions: {
      select: view.select,
      addRoot: view.addRoot,
      addChild: view.addChild,
      cancel: view.cancel,
      createUnit: api.createUnit,
      updateUnit: api.updateUnit,
      deleteUnit: api.deleteUnit,
    },
    meta: {
      unitTypes: api.unitTypes,
      domains: api.domains,
      isLoadingTypes: api.isLoadingTypes,
      isLoadingDomains: api.isLoadingDomains,
      isCreating: api.isCreating,
      isUpdating: api.isUpdating,
      isDeleting: api.isDeleting,
    },
  };

  if (api.isLoadingTree) {
    return (
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-120px)] overflow-hidden">
        <Skeleton className="w-full lg:w-[350px] h-full rounded-xl shrink-0" />
        <Skeleton className="flex-1 h-full rounded-xl" />
      </div>
    );
  }

  const isCreate = viewState.mode !== "idle";
  const hasSelection = viewState.selectedId != null;

  const renderRightContent = () => {
    if (isCreate) return <OrganizationForm />;

    if (hasSelection) {
      return (
        <div className="h-full min-h-0 flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 flex flex-col min-h-0"
          >
            <div className="shrink-0 border-b bg-muted/30 px-4 pt-3 pb-2">
              <TabsList className="h-9 w-full sm:w-auto bg-muted/60 p-0.5 rounded-lg">
                <TabsTrigger value="info" className="gap-2 px-4 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <FileText className="h-4 w-4 shrink-0" />
                  Thông tin đơn vị
                </TabsTrigger>
                <TabsTrigger value="staffing" className="gap-2 px-4 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <Users className="h-4 w-4 shrink-0" />
                  Định biên & Chức danh
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent
              value="info"
              className="flex-1 min-h-0 overflow-y-auto mt-0 pt-4 px-4 pb-4 data-[state=active]:flex flex-col focus-visible:outline-none"
            >
              <OrganizationUnitEdit />
            </TabsContent>
            <TabsContent
              value="staffing"
              className="flex-1 min-h-0 overflow-y-auto mt-0 pt-4 px-4 pb-4 data-[state=active]:flex flex-col focus-visible:outline-none"
            >
              <OrganizationStaffing />
            </TabsContent>
          </Tabs>
        </div>
      );
    }

    return (
      <div className="h-full flex flex-1 items-center justify-center rounded-xl border border-dashed bg-muted/20">
        <div className="flex flex-col items-center gap-4 px-6 text-center">
          <div className="rounded-full bg-muted/50 p-5">
            <Building2 className="h-12 w-12 text-muted-foreground/50" />
          </div>
          <p className="text-sm text-muted-foreground max-w-[280px]">
            Chọn một đơn vị từ cây tổ chức bên trái để xem và chỉnh sửa thông tin.
          </p>
        </div>
      </div>
    );
  };

  return (
    <OrganizationProvider value={contextValue}>
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 h-[calc(100vh-120px)] overflow-hidden font-sans antialiased min-w-0">
        <OrganizationSidebar />
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          {renderRightContent()}
        </div>
      </div>
    </OrganizationProvider>
  );
}
