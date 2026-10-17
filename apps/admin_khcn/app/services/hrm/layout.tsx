import { ServiceLayout } from "@/components/layouts/service-layout";
import { AmaKeyIntegratedLayout } from "@/features/hrm/components/amakey";

export default function HrmLayout({ children }: { children: React.ReactNode }) {
  return (
    <ServiceLayout>
      <AmaKeyIntegratedLayout>{children}</AmaKeyIntegratedLayout>
    </ServiceLayout>
  );
}
