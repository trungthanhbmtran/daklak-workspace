import React from "react";
import { PortalPageBuilderClient } from "@/features/portal-config";

export const metadata = {
  title: "Quản lý trang thiết kế trực quan | Hệ thống Quản trị",
  description: "Thiết kế các trang tĩnh và trang tiện ích trực quan bằng giao diện kéo thả."
};

export default function PortalPageBuilderPage() {
  return <PortalPageBuilderClient />;
}
