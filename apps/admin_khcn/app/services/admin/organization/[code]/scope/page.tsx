import { UnitScopePanel } from "@/features/system-admin/organization";

export const metadata = {
  title: "Phạm vi phụ trách | Quản trị Hệ thống",
};

export default function OrganizationScopePage() {
  return (
    <div className="flex-1 min-h-0 mt-0 pt-6 px-6 pb-6 flex flex-col focus-visible:outline-none h-full">
      <UnitScopePanel />
    </div>
  );
}
