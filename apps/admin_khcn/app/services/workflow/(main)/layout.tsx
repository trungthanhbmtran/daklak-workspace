import { ServiceLayout } from "@/components/layouts/service-layout";

export default function WorkflowMainLayout({ children }: { children: React.ReactNode }) {
  return <ServiceLayout>{children}</ServiceLayout>;
}
