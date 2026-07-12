import { CategoryContent } from "@/features/system-admin/categories";

export const metadata = {
  title: "Chi tiết Danh mục | Quản trị Hệ thống",
};

interface PageProps {
  params: Promise<{ code: string }>;
}

export default async function CategoryDetailPage({ params }: PageProps) {
  const { code } = await params;

  if (!code) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Mã danh mục không hợp lệ.</p>
      </div>
    );
  }

  return <CategoryContent activeGroup={code} />;
}
