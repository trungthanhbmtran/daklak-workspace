"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import axios from "axios";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuthData } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get("code");
    const errorParam = searchParams.get("error");
    
    if (errorParam) {
      setError(searchParams.get("error_description") || errorParam);
      return;
    }

    if (code) {
      const exchangeToken = async () => {
        try {
          const response = await axios.post("/api/auth/sso/exchange", { code });
          
          const { access_token, userInfo } = response.data;
          
          setAuthData(access_token, userInfo);
          router.replace("/"); // Redirect to home
        } catch (err: any) {
          console.error("SSO Token Exchange failed:", err);
          setError("Failed to authenticate. Please try again.");
        }
      };
      
      exchangeToken();
    } else {
       setError("No authorization code found");
    }
  }, [searchParams, router, setAuthData]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      {error ? (
        <div className="text-red-500 bg-red-100 p-4 rounded-md">
          <h2 className="font-bold">Authentication Error</h2>
          <p>{error}</p>
          <button onClick={() => router.push("/")} className="mt-4 px-4 py-2 bg-portal-primary text-white rounded">Quay lại trang chủ</button>
        </div>
      ) : (
        <div className="text-portal-primary animate-pulse">
          <h2 className="text-xl font-bold">Đang xử lý đăng nhập...</h2>
          <p>Vui lòng chờ trong giây lát.</p>
        </div>
      )}
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]">Đang tải...</div>}>
      <CallbackHandler />
    </Suspense>
  );
}