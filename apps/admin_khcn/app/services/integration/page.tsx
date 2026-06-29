import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const IntegrationClient = dynamic(
  () => import("@/features/integration/components/IntegrationClient").then(mod => mod.IntegrationClient),
  { 
    ssr: false, 
    loading: () => (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    ) 
  }
);

export const metadata = {
  title: "Trung tâm Tích hợp & Quy trình | Cổng Ứng dụng Nội bộ",
};

export default function IntegrationPage() {
  return <IntegrationClient />;
}
