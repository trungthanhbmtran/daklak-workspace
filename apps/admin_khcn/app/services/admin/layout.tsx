import { ServiceLayout } from "@/components/layouts/service-layout";
import { requireMenuAccess, getCurrentPathname } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 🔒 Server-side authorization — không thể bypass từ client
  // proxy.ts đã forward pathname qua header x-pathname
  const pathname = await getCurrentPathname();
  await requireMenuAccess(pathname);

  return <ServiceLayout>{children}</ServiceLayout>;
}
