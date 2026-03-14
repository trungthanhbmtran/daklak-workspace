import { OrganizationClient } from "@/features/system-admin/organization";

export const metadata = {
  title: "Cơ cấu tổ chức | Quản trị Hệ thống",
};

export default function OrganizationPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Cơ cấu tổ chức</h2>
          <p className="text-muted-foreground">
            Quản lý đơn vị tổ chức (cây đơn vị), định biên và chức danh theo Nghị định 24/2014/NĐ-CP và 107/2020/NĐ-CP.
          </p>
          <p className="text-xs text-muted-foreground/80 mt-1">
            Tổ chức cơ quan chuyên môn thuộc UBND tỉnh, TP trực thuộc TW: Sở (Phòng, Thanh tra, Văn phòng, Chi cục, Đơn vị sự nghiệp).
          </p>
        </div>
      </div>

      <OrganizationClient />
    </div>
  );
}
