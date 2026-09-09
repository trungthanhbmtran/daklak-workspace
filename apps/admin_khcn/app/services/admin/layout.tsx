import { ServiceLayout } from "@/components/layouts/service-layout";


export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Quyền truy cập đã được chặn từ xa thông qua Next.js Middleware (tầng Edge)
  // Không cần check phụ ở đây nữa để tránh gọi API 2 lần


  return (
    <ServiceLayout>
      {children}
    </ServiceLayout>
  );
}
