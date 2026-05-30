import { ServiceLayout } from "@/components/layouts/service-layout";

export default function IntegrationLayout({ children }: { children: React.ReactNode }) {
  return (
    <ServiceLayout serviceKey="integration">
      {children}
    </ServiceLayout>
  );
}
