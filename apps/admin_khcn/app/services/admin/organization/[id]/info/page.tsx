import { OrganizationUnitEdit } from "@/features/system-admin/organization";

export const metadata = {
  title: "Thông tin Đơn vị | Quản trị Hệ thống",
};

export default function OrganizationInfoPage() {
  return (
    <div className="flex-1 min-h-0 overflow-hidden mt-0 pt-4 px-4 pb-4 flex flex-col focus-visible:outline-none h-full">
      <OrganizationUnitEdit />
    </div>
  );
}
