import { OrganizationDetailClient } from "@/features/system-admin/organization";

export const metadata = {
  title: "Chi tiết Đơn vị | Quản trị Hệ thống",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrganizationDetailPage({ params }: PageProps) {
  const { id } = await params;
  const unitId = Number(id);

  if (isNaN(unitId)) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">ID đơn vị không hợp lệ.</p>
      </div>
    );
  }

  return <OrganizationDetailClient />;
}
