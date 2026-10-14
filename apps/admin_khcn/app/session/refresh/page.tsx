import { Suspense } from "react";
import { RestoreSessionClient } from "./RestoreSessionClient";

export const metadata = {
  title: "Khôi phục phiên đăng nhập | Hệ thống",
};

export default function RefreshSessionPage() {
  return (
    <Suspense fallback={<p className="flex min-h-screen items-center justify-center">Đang khôi phục phiên...</p>}>
      <RestoreSessionClient />
    </Suspense>
  );
}
