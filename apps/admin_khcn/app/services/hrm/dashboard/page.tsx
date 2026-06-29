import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const HrmDashboardClient = dynamic(
  () => import("@/features/hrm").then(mod => mod.HrmDashboardClient),
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
  title: "Quản lý Nhân sự | Sở KH&CN Đắk Lắk",
};

export default function HrmDashboardPage() {
  return <HrmDashboardClient />;
}
