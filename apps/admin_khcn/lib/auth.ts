import { cookies, headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { unstable_cache } from "next/cache";
import { createHash } from "crypto";
import { serverApiBase } from "./server-api-url";

class SessionRefreshRequired extends Error {}

const INTERNAL_API_URL = serverApiBase();

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

async function getToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("accessToken")?.value || null;
}

// ─────────────────────────────────────────────
// getServerUser — lấy thông tin user hiện tại (server-side)
// ─────────────────────────────────────────────
export async function getServerUser() {
  const token = await getToken();
  if (!token) return null;

  try {
    const res = await fetch(`${INTERNAL_API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data?.data || json?.data || json;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────
// requireAuth — bắt buộc đăng nhập, dùng trong layout
// ─────────────────────────────────────────────
export async function requireAuth() {
  const token = await getToken();
  if (!token) {
    const cookieStore = await cookies();
    const path = await getCurrentPathname();
    const target = cookieStore.get("refreshToken")?.value
      ? "/session/refresh"
      : "/login";
    redirect(target + "?callbackUrl=" + encodeURIComponent(path));
  }
  return token;
}

// ─────────────────────────────────────────────
// Cached menu paths per-user (TTL 5 phút)
// Lấy danh sách allowed_paths (có wildcard) từ Backend
// ─────────────────────────────────────────────
function getCachedAllowedPaths(token: string) {
  return unstable_cache(
    async (): Promise<string[]> => {
      try {
        const res = await fetch(`${INTERNAL_API_URL}/menus/me`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        if (res.status === 401) throw new SessionRefreshRequired();
        if (res.status === 403) return [];
        if (!res.ok) throw new Error("Không thể tải quyền truy cập lúc này");
        const json = await res.json();
        const paths =
          json?.data?.allowedPaths ||
          json?.allowedPaths ||
          json?.allowed_paths ||
          [];
        if (paths.length === 0) {
          console.error(
            `[fetch menus/me] SUCCESS but paths is empty. JSON:`,
            JSON.stringify(json),
          );
        }
        return paths;
      } catch (err) {
        // Failed auth/network lookups must not be cached as an empty permission list.
        throw err;
      }
    },
    // Cache key dựa vào token (unique per user session)
    [`menu-paths-${createHash("sha256").update(token).digest("hex")}`],
    { revalidate: 10, tags: ["user-menus"] }, // 10 giây (giảm để debug)
  )();
}

// ─────────────────────────────────────────────
// requireMenuAccess — kiểm tra quyền menu server-side (Dumb Frontend)
// Gọi ở Server Component layout, notFound() nếu không có quyền
// ─────────────────────────────────────────────
export async function requireMenuAccess(pathname: string) {
  const token = await requireAuth();
  let allowedPaths: string[];
  try {
    allowedPaths = await getCachedAllowedPaths(token);
  } catch (error) {
    if (error instanceof SessionRefreshRequired) {
      redirect("/session/refresh?callbackUrl=" + encodeURIComponent(pathname));
    }
    throw error;
  }

  if (allowedPaths.length === 0) {
    console.error("[requireMenuAccess] No allowed menu paths for this session");
    notFound();
  }

  // Chuẩn hoá pathname: bỏ trailing slash nếu có
  const normalizedPathname =
    pathname.endsWith("/") && pathname.length > 1
      ? pathname.slice(0, -1)
      : pathname;

  const hasAccess = allowedPaths.some((policy) => {
    if (!policy) return false;

    // Nếu policy có wildcard ở cuối (ví dụ: /services/admin/users/*)
    if (policy.endsWith("/*")) {
      const base = policy.slice(0, -2);
      return (
        normalizedPathname === base || normalizedPathname.startsWith(base + "/")
      );
    }

    // Nếu không có wildcard thì phải khớp chính xác
    return normalizedPathname === policy;
  });

  if (!hasAccess) {
    console.error(
      `[requireMenuAccess] no access for pathname: ${normalizedPathname}. Allowed: ${allowedPaths}`,
    );
    notFound();
  }
}

// ─────────────────────────────────────────────
// getCurrentPathname — đọc pathname từ header (forward bởi proxy.ts)
// ─────────────────────────────────────────────
export async function getCurrentPathname(): Promise<string> {
  const headersList = await headers();
  // proxy.ts forward x-pathname, bỏ basePath '/admin' nếu có
  let pathname = headersList.get("x-pathname") || "/services/admin";
  if (pathname.startsWith("/admin/")) {
    pathname = pathname.replace(/^\/admin/, "") || "/";
  } else if (pathname === "/admin") {
    pathname = "/";
  }
  return pathname;
}
