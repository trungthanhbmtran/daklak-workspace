import { RoleForm } from "@/features/system-admin/roles";

export const metadata = {
  title: "Chi tiết Vai trò | Quản trị Hệ thống",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RoleDetailPage({ params }: PageProps) {
  const { id } = await params;
  const roleId = Number(id);

  if (isNaN(roleId)) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">ID vai trò không hợp lệ.</p>
      </div>
    );
  }

  return <RoleForm roleId={roleId} />;
}
