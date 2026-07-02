import { GatewayClient } from "@/features/gateway/components/GatewayClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý API Gateway | Quản trị Hệ thống",
  description: "Quản lý dịch vụ cổng",
};

export default function GatewayPage() {
  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      <GatewayClient />
    </div>
  );
}
