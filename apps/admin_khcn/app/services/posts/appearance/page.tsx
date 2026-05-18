import React from "react";
import { AppearanceClient } from "@/features/posts/components/AppearanceClient";

export const metadata = {
  title: "Quản trị Giao diện Portal | Hệ thống Quản trị",
  description: "Cấu hình theme, màu sắc, font chữ, bố cục và bộ nhận diện thương hiệu của cổng thông tin."
};

export default function AppearancePage() {
  return <AppearanceClient />;
}
