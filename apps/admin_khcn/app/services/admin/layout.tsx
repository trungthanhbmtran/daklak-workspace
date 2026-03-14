import { ServiceLayout } from "@/components/layouts/service-layout";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ServiceLayout serviceKey="admin" >
      {children}
    </ServiceLayout>
  );
}
