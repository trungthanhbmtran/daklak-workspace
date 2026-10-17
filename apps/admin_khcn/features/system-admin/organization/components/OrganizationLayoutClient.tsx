/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export function OrganizationLayoutClient({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const isRoot = pathname === "/services/admin/organization" || pathname === "/services/admin/organization/";
  const searchTerm = searchParams.get('search') || "";

  const { data: treeResponse, isLoading: isLoadingTree } = useOrganizationTreeQuery(searchTerm);
  const { data: flatListResponse, isLoading: isLoadingFlatList } = useOrganizationFlatListQuery(searchTerm);

  const { mutateAsync: createUnit, isPending: isCreating } = useOrganizationCreateMutation();
  const { mutateAsync: updateUnitBase, isPending: isUpdating } = useOrganizationUpdateMutation();
  const { mutateAsync: updateScopeBase, isPending: isUpdatingScope } = useOrganizationUpdateScopeMutation();
  const { mutateAsync: deleteUnit, isPending: isDeleting } = useOrganizationDeleteMutation();

  const updateUnit = (id: number, payload: any) => updateUnitBase({ id, payload });
  const updateScope = (id: number, payload: any) => updateScopeBase({ id, payload });

  const tree = (treeResponse as any)?.data ?? treeResponse ?? [];
  const flatUnits = (flatListResponse as any)?.data ?? flatListResponse ?? [];

  const contextValue = {
    state: {
      tree,
      flatUnits,
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

  if (isLoadingTree || isLoadingFlatList) {
    return (
      <div className="flex flex-col lg:flex-row gap-6 flex-1 w-full min-h-0 overflow-hidden h-full">
        <Skeleton className={cn("w-full lg:w-[380px] h-full rounded-xl shrink-0", isRoot ? "block" : "hidden lg:block")} />
        <Skeleton className={cn("flex-1 h-full rounded-xl", isRoot ? "hidden lg:block" : "block")} />
      </div>
    );
  }

  return (
    <OrganizationProvider value={contextValue}>
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 flex-1 w-full min-h-0 overflow-hidden font-sans antialiased min-w-0 h-full">
        <div className={cn("w-full lg:w-[380px] shrink-0 h-full", isRoot ? "flex flex-col" : "hidden lg:flex flex-col")}>
          <OrganizationSidebar />
        </div>
        <div className={cn("flex-1 min-w-0 flex flex-col overflow-hidden h-full pb-2", isRoot ? "hidden lg:flex" : "flex")}>
          {children}
        </div>
      </div>
    </OrganizationProvider>
  );
}
