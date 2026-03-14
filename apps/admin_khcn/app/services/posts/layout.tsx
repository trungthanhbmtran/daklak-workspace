import { ServiceLayout } from "@/components/layouts/service-layout";

export default function HrmLayout({ children }: { children: React.ReactNode }) {
  return <ServiceLayout serviceKey="posts">{children}</ServiceLayout>;
}
