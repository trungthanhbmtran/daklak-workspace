import { MenuForm } from "@/features/system-admin/menus";

export const metadata = {
  title: "Chỉnh sửa Menu | Quản trị Hệ thống",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MenuDetailPage({ params }: PageProps) {
  const { id } = await params;
  const menuId = Number(id);

  if (isNaN(menuId)) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">ID menu không hợp lệ.</p>
      </div>
    );
  }

  return <MenuForm menuId={menuId} />;
}
