import { Suspense } from "react";
import { OrganizationLayoutClient } from "@/features/system-admin/organization/components/OrganizationLayoutClient";
import { Skeleton } from "@/components/ui/skeleton";

export default function OrganizationLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col lg:flex-row gap-6 flex-1 w-full min-h-0 overflow-hidden h-full">
          <Skeleton className="w-full lg:w-[380px] flex-1 lg:flex-none h-full rounded-xl shrink-0" />
          <Skeleton className="flex-1 h-full rounded-xl" />
        </div>
      }
    >
      <OrganizationLayoutClient>{children}</OrganizationLayoutClient>
    </Suspense>
  );
}
