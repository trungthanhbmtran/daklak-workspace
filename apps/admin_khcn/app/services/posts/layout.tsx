import { ServiceLayout } from "@/components/layouts/service-layout";

export default function PostsLayout({ children }: { children: React.ReactNode }) {
  return <ServiceLayout>{children}</ServiceLayout>;
}
