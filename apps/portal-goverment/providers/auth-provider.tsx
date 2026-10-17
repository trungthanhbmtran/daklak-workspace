"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface UserInfo {
  sub: string;
  name?: string;
  email?: string;
  roles?: string[];
  [key: string]: any;
}

interface AuthContextType {
  user: UserInfo | null;
  accessToken: string | null;
  login: () => void;
  logout: () => void;
  setAuthData: (token: string, user: UserInfo) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("sso_access_token");
    const userInfoStr = localStorage.getItem("sso_user_info");
    if (token && userInfoStr) {
      try {
        setAccessToken(token);
        setUser(JSON.parse(userInfoStr));
      } catch {
        // Fallback user info handled
      }
    }
    setIsInitialized(true);
  }, []);

  const login = () => {
    // Env bắt buộc — KHÔNG fallback hardcode (fail-fast qua runtime error)
    const clientId = process.env.NEXT_PUBLIC_SSO_CLIENT_ID;
    const authorizeUrl = process.env.NEXT_PUBLIC_SSO_AUTHORIZE_URL;
    const redirectUri = process.env.NEXT_PUBLIC_SSO_REDIRECT_URI || `${window.location.origin}/auth/callback`;

    if (!clientId) {
      throw new Error("SSO_CLIENT_ID env is required");
    }
    if (!authorizeUrl) {
      throw new Error("SSO_AUTH_URL env is required");
    }
    
    const params = new URLSearchParams({
      response_type: "code",
      client_id: clientId || "",
      redirect_uri: redirectUri || "",
      scope: "openid email groups profile roles",
      state: Math.random().toString(36).substring(7),
    });

    window.location.href = `${authorizeUrl}?${params.toString()}`;
  };

  const logout = () => {
    localStorage.removeItem("sso_access_token");
    localStorage.removeItem("sso_user_info");
    setAccessToken(null);
    setUser(null);
  };

  const setAuthData = (token: string, userInfo: UserInfo) => {
    // TODO(security): token lưu localStorage là bề mặt XSS — refactor sang httpOnly cookie (ngoài scope lane L10).
    localStorage.setItem("sso_access_token", token);
    localStorage.setItem("sso_user_info", JSON.stringify(userInfo));
    setAccessToken(token);
    setUser(userInfo);
  };

  if (!isInitialized) return null;

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout, setAuthData }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};