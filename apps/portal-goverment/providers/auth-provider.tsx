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
      } catch (e) {
        console.error("Failed to parse user info", e);
      }
    }
    setIsInitialized(true);
  }, []);

  const login = () => {
    const clientId = process.env.NEXT_PUBLIC_SSO_CLIENT_ID || "CiA_7dKL3zw7JnhhliTMwyU_Wssa";
    const authorizeUrl = process.env.NEXT_PUBLIC_SSO_AUTHORIZE_URL || "https://lifesso.lifetex.vn:9445/oauth2/authorize";
    const redirectUri = process.env.NEXT_PUBLIC_SSO_REDIRECT_URI || `${window.location.origin}/auth/callback`;
    
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