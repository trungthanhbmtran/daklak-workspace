import { redirect } from "next/navigation";

export const metadata = {
  title: "Chi tiết Đơn vị | Quản trị Hệ thống",
};

interface PageProps {
  params: Promise<{ code: string }>;
}

export default async function OrganizationDetailPage({ params }: PageProps) {
  const { code } = await params;

  if (!code) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Mã đơn vị không hợp lệ.</p>
      </div>
    );
  }

  // Redirect to the default 'info' tab
  redirect(`/services/admin/organization/${code}/info`);
}
