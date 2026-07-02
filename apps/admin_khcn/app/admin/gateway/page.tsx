import { GatewayClient } from "@/features/gateway/components/GatewayClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý API Gateway | Quản trị Hệ thống",
  description: "Quản lý dịch vụ cổng",
};

export default function GatewayPage() {
  return (
    <div className="w-full h-full overflow-y-auto p-4 md:p-8">
      <GatewayClient />
    </div>
  );
}
