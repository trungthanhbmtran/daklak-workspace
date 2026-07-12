"use client";

import { useOrganizationApi } from "@/features/system-admin/organization/hooks/useOrganizationApi";
import { OrganizationProvider } from "@/features/system-admin/organization/context/OrganizationContext";
import { OrganizationSidebar } from "@/features/system-admin/organization/components/OrganizationSidebar";
import { Skeleton } from "@/components/ui/skeleton";

export default function OrganizationLayout({ children }: { children: React.ReactNode }) {
  const api = useOrganizationApi();

  const contextValue = {
    state: {
      flatUnits: api.flatUnits,
      isLoadingTree: api.isLoadingTree,
    },
    actions: {
      createUnit: api.createUnit,
      updateUnit: api.updateUnit,
      updateScope: api.updateScope,
      deleteUnit: api.deleteUnit,
    },
    meta: {
      isCreating: api.isCreating,
      isUpdating: api.isUpdating,
      isUpdatingScope: api.isUpdatingScope,
      isDeleting: api.isDeleting,
    },
  };

  if (api.isLoadingTree) {
    return (
      <div className="flex flex-col lg:flex-row gap-6 flex-1 w-full min-h-0 overflow-hidden h-full">
        <Skeleton className="w-full lg:w-[380px] flex-1 lg:flex-none h-full rounded-xl shrink-0" />
        <Skeleton className="flex-1 h-full rounded-xl" />
      </div>
    );
  }

  return (
    <OrganizationProvider value={contextValue}>
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 flex-1 w-full min-h-0 overflow-hidden font-sans antialiased min-w-0 h-full">
        <OrganizationSidebar />
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden h-full pb-2">
          {children}
        </div>
      </div>
    </OrganizationProvider>
  );
}
