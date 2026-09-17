import { OrganizationStaffing } from "@/features/system-admin/organization";

export const metadata = {
  title: "Định biên & Chức danh | Quản trị Hệ thống",
};

export default function OrganizationStaffingPage() {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto mt-0 pt-4 px-4 pb-4 flex flex-col focus-visible:outline-none h-full">
      <OrganizationStaffing />
    </div>
  );
}
