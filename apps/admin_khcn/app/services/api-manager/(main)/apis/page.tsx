import { ApiManagementDashboard } from "@/features/api-management/components/ApiManagementDashboard";
import { Server } from "lucide-react";

export const metadata = {
  title: "Kết nối API Outbound | Cổng ứng dụng Nội bộ",
};

export default function ApiIntegrationPage() {
  return (
    <div className="w-full p-6 flex-1 min-h-0 flex flex-col overflow-hidden bg-slate-50/30 dark:bg-transparent">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5 sm:gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary shrink-0">
            <Server className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          Quản lý Kết nối API Outbound
        </h1>
        <p className="text-muted-foreground mt-1.5 text-xs sm:text-sm sm:ml-[52px]">
          Thiết lập và quản lý các kết nối API gọi ra bên ngoài (Outbound) như LGSP, hệ thống thanh toán và đối tác thứ ba.
        </p>
      </div>

      <div className="flex-1 overflow-auto bg-card border border-border shadow-sm rounded-xl p-6">
        <ApiManagementDashboard />
      </div>
    </div>
  );
}
