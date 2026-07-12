import { ResourceDetail } from "@/features/system-admin/resources";

export const metadata = { title: "Chi tiết Tài nguyên | Quản trị Hệ thống" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ResourceDetailPage({ params }: PageProps) {
  const { id } = await params;
  const resourceId = Number(id);

  if (isNaN(resourceId)) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">ID tài nguyên không hợp lệ.</p>
      </div>
    );
  }

  return <ResourceDetail resourceId={resourceId} />;
}
