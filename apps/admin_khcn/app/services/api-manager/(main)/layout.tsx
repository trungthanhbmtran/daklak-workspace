import { ServiceLayout } from "@/components/layouts/service-layout";

export default function ApiManagerLayout({ children }: { children: React.ReactNode }) {
  return (
    <ServiceLayout>
      {children}
    </ServiceLayout>
  );
}
