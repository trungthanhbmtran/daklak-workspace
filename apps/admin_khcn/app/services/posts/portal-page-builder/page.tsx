import React from "react";
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const PortalPageBuilderClient = dynamic(
  () => import("@/features/portal-config").then(mod => mod.PortalPageBuilderClient),
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
  title: "Quản lý trang thiết kế trực quan | Hệ thống Quản trị",
  description: "Thiết kế các trang tĩnh và trang tiện ích trực quan bằng giao diện kéo thả."
};

export default function PortalPageBuilderPage() {
  return <PortalPageBuilderClient />;
}
