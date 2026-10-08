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
          const clientId = process.env.NEXT_PUBLIC_SSO_CLIENT_ID;
          const tokenUrl = process.env.NEXT_PUBLIC_SSO_TOKEN_URL;
          const redirectUri = process.env.NEXT_PUBLIC_SSO_REDIRECT_URI;
          
          if (!clientId || !tokenUrl || !redirectUri) {
            throw new Error("Missing SSO configuration");
          }

          const body = new URLSearchParams();
          body.append("grant_type", "authorization_code");
          body.append("code", code);
          body.append("client_id", clientId);
          body.append("redirect_uri", redirectUri);

          const response = await axios.post(tokenUrl, body, {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            }
          });

          const { access_token } = response.data;
          
          const userInfoUrl = process.env.NEXT_PUBLIC_SSO_USERINFO_URL;
          let userInfo = { sub: "unknown" };
          
          if (userInfoUrl) {
            try {
              const userResponse = await axios.get(userInfoUrl, {
                headers: {
                  Authorization: `Bearer ${access_token}`
                }
              });
              
              userInfo = userResponse.data;
              
            } catch (err) {
              console.error("Failed to fetch user info", err);
            }
          }
          
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