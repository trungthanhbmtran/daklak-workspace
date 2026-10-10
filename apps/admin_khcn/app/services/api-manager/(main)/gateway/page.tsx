import { GatewayClient } from "@/features/gateway/components/GatewayClient";

export const metadata = {
  title: "Quản lý Cấu hình Gateway | Cổng Ứng dụng Nội bộ",
};

export default function GatewayPage() {
  return (
    <div className="w-full p-6 flex-1 min-h-0 flex flex-col overflow-hidden">
      <GatewayClient />
    </div>
  );
}
