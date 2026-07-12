"use client";

import { useOrganizationTreeQuery, useOrganizationFlatListQuery } from "@/features/system-admin/organization/hooks/useOrganizationQueries";
import {
  useOrganizationCreateMutation,
  useOrganizationUpdateMutation,
  useOrganizationUpdateScopeMutation,
  useOrganizationDeleteMutation,
} from "@/features/system-admin/organization/hooks/useOrganizationMutations";
import { OrganizationProvider } from "@/features/system-admin/organization/context/OrganizationContext";
import { OrganizationSidebar } from "@/features/system-admin/organization/components/OrganizationSidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams } from "next/navigation";

export function OrganizationLayoutClient({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get('search') || "";
  
  const { data: treeResponse, isLoading: isLoadingTree } = useOrganizationTreeQuery(searchTerm);
  const { data: flatResponse } = useOrganizationFlatListQuery(searchTerm);
  
  const { mutateAsync: createUnit, isPending: isCreating } = useOrganizationCreateMutation();
  const { mutateAsync: updateUnitBase, isPending: isUpdating } = useOrganizationUpdateMutation();
  const { mutateAsync: updateScopeBase, isPending: isUpdatingScope } = useOrganizationUpdateScopeMutation();
  const { mutateAsync: deleteUnit, isPending: isDeleting } = useOrganizationDeleteMutation();

  const updateUnit = (id: number, payload: any) => updateUnitBase({ id, payload });
  const updateScope = (id: number, payload: any) => updateScopeBase({ id, payload });

  const contextValue = {
    state: {
      tree: treeResponse?.items ?? [],
      flatUnits: flatResponse?.items ?? [],
      isLoadingTree,
    },
    actions: {
      createUnit,
      updateUnit,
      updateScope,
      deleteUnit,
    },
    meta: {
      isCreating,
      isUpdating,
      isUpdatingScope,
      isDeleting,
    },
  };

  if (isLoadingTree) {
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
