import * as React from "react"
import { serverFetch } from "@/lib/serverFetch"
import HomeClient from "@/components/pages/home-client"

// Cấu hình ISR: tự động revalidate lại trang tĩnh sau mỗi 60 giây
export const revalidate = 60;

export default async function Page() {
  console.log("[Server Component] Rendering home page on server (ISR)...");
  
  // Pre-fetch dữ liệu tĩnh trên server
  const [portalMenus, posts] = await Promise.all([
    serverFetch("public/portal-menus"),
    serverFetch("public/posts")
  ]);

  return (
    <HomeClient 
      initialPortalMenus={portalMenus || { success: true, data: [] }} 
      initialPosts={posts || { success: true, data: [] }} 
    />
  );
}
