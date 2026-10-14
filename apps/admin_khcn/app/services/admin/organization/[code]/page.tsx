import { OrganizationDetailClient } from "./OrganizationDetailClient";

export const metadata = {
  title: "Chi tiết Đơn vị | Quản trị Hệ thống",
};

interface PageProps {
  params: Promise<{ code: string }>;
}

export default async function OrganizationDetailPage({ params }: PageProps) {
  const { code } = await params;
  return <OrganizationDetailClient key={code} initialCode={code} />;
}
