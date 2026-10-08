"use client";

import { Suspense, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/axiosInstance";
import { safeAuthCallback } from "@/lib/auth-navigation";
import { Button } from "@/components/ui/button";

function RestoreSession() {
  const router = useRouter(),
    search = useSearchParams();
  const target = safeAuthCallback(search.get("callbackUrl"));
  const session = useQuery({
    queryKey: ["auth", "restore"],
    queryFn: () => api.get("/auth/me"),
    staleTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
  });
  useEffect(() => {
    if (session.isSuccess && session.isFetchedAfterMount && !session.isFetching)
      window.location.assign("/admin" + target);
  }, [
    session.isSuccess,
    session.isFetchedAfterMount,
    session.isFetching,
    router,
    target,
  ]);
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      {session.isError ? (
        <>
          <p role="alert">
            Không thể khôi phục phiên lúc này. Vui lòng thử lại hoặc đăng nhập.
          </p>
          <Button onClick={() => session.refetch()}>Thử lại</Button>
          <Button variant="outline" onClick={() => window.location.assign("/admin/login")}>
            Đăng nhập
          </Button>
        </>
      ) : (
        <p role="status">Đang khôi phục phiên đăng nhập...</p>
      )}
    </main>
  );
}
export default function RefreshSessionPage() {
  return (
    <Suspense fallback={<p>Đang khôi phục phiên...</p>}>
      <RestoreSession />
    </Suspense>
  );
}
