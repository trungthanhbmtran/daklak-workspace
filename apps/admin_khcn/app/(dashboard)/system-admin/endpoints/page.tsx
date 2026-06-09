import { Metadata } from "next";
import { EndpointClient } from "@/features/system-admin/endpoints/components/EndpointClient";

export const metadata: Metadata = {
  title: "Quản lý Endpoint",
  description: "Phân quyền động cho các API Endpoint",
};

export default function EndpointsPage() {
  return (
    <div className="flex flex-col gap-5 p-4 sm:p-6 lg:p-8 flex-1 w-full max-w-[1600px] mx-auto min-h-0 relative">
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold tracking-tight">API Endpoints (Dynamic Policy)</h2>
        <p className="text-muted-foreground">
          Tự động quét các API Endpoint và gán quyền yêu cầu để truy cập. Thay đổi có hiệu lực ngay lập tức.
        </p>
      </div>
      <EndpointClient />
    </div>
  );
}
