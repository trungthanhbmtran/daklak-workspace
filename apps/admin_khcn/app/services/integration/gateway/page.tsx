import { GatewayClient } from "@/features/gateway/components/GatewayClient";

export const metadata = {
  title: "Quản lý Cấu hình Gateway | Cổng Ứng dụng Nội bộ",
};

export default function GatewayPage() {
  return (
    <div className="container mx-auto p-6 max-w-5xl h-full overflow-y-auto">
      <GatewayClient />
    </div>
  );
}
