import React from "react";
import { PortalConfigClient } from "@/features/portal-config";

export const metadata = {
  title: "Cấu hình chung đơn vị & Portal | Hệ thống Quản trị",
  description: "Thiết lập các thông số nhận diện, bản quyền, liên hệ và trang giới thiệu đơn vị."
};

export default function PortalConfigPage() {
  return <PortalConfigClient />;
}
