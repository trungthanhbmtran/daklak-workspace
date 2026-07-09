import { LoginClient } from "@/features/auth";

export const metadata = {
  title: "Đăng nhập hệ thống | Quản trị",
};

import { Suspense } from "react";

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Đang tải...</div>}>
      <LoginClient />
    </Suspense>
  );
}



