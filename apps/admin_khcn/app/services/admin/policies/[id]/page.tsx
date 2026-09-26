import { PolicyForm } from "@/features/system-admin/policies";

export const metadata = {
  title: "Chi tiết Vai trò | Quản trị Hệ thống",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RoleDetailPage({ params }: PageProps) {
  const { id } = await params;
  const policyId = Number(id);

  if (isNaN(policyId)) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">ID vai trò không hợp lệ.</p>
      </div>
    );
  }

  return <PolicyForm policyId={policyId} />;
}
