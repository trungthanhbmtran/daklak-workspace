import { ServiceLayout } from "@/components/layouts/service-layout";

export default function PostsLayout({ children }: { children: React.ReactNode }) {
  return <ServiceLayout serviceKey="posts">{children}</ServiceLayout>;
}
