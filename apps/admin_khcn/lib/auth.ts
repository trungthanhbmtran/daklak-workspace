import { cookies, headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { unstable_cache } from 'next/cache';

const INTERNAL_API_URL =
  process.env.INTERNAL_API_URL || 'http://api-gateway:8080/api/v1/admin';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

async function getToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return (
    cookieStore.get('session')?.value ||
    cookieStore.get('accessToken')?.value ||
    null
  );
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
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data?.data || json?.data || json;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────
// Cached menu paths per-user (TTL 5 phút)
// Chỉ gọi API khi cache miss — nhanh, tiết kiệm tài nguyên
// ─────────────────────────────────────────────
function getCachedMenuPaths(token: string) {
  return unstable_cache(
    async (): Promise<string[]> => {
      const res = await fetch(`${INTERNAL_API_URL}/menus/me`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      if (!res.ok) return [];
      const json = await res.json();
      const menus = json?.data || [];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const extractPaths = (items: any[]): string[] => {
        const paths: string[] = [];
        for (const item of items) {
          const path = item.path || item.route;
          if (path) paths.push(path);
          if (item.children && Array.isArray(item.children)) {
            paths.push(...extractPaths(item.children));
          }
        }
        return paths;
      };

      return extractPaths(menus);
    },
    // Cache key dựa vào token (unique per user session)
    [`menu-paths-${token.slice(-16)}`],
    { revalidate: 300, tags: ['user-menus'] } // 5 phút
  )();
}

// ─────────────────────────────────────────────
// requireAuth — bắt buộc đăng nhập, dùng trong layout
// ─────────────────────────────────────────────
export async function requireAuth() {
  const token = await getToken();
  if (!token) redirect('/login');
  return token;
}

// ─────────────────────────────────────────────
// requireMenuAccess — kiểm tra quyền menu server-side
// Gọi ở Server Component layout, notFound() nếu không có quyền
// Cache 5 phút per user session
// ─────────────────────────────────────────────
export async function requireMenuAccess(pathname: string) {
  const token = await requireAuth();

  const allowedPaths = await getCachedMenuPaths(token);

  // allowedPaths rỗng = API lỗi hoặc user chưa được cấp menu nào
  if (allowedPaths.length === 0) {
    notFound();
  }

  const hasAccess = allowedPaths.some(
    (p) => p && p.length > 1 && pathname.startsWith(p)
  );

  if (!hasAccess) {
    notFound();
  }
}

// ─────────────────────────────────────────────
// requirePermissions — kiểm tra quyền PBAC cụ thể
// ─────────────────────────────────────────────
export async function requirePermissions(policies: string[]) {
  const user = await getServerUser();
  if (!user) redirect('/login');

  if (!policies || policies.length === 0) return user;

  const userPolicies: string[] = user.permissionsFlatten || [];
  const hasPermission = policies.some((policy) =>
    userPolicies.includes(policy)
  );

  if (!hasPermission) notFound();

  return user;
}

// ─────────────────────────────────────────────
// getCurrentPathname — đọc pathname từ header (forward bởi proxy.ts)
// ─────────────────────────────────────────────
export async function getCurrentPathname(): Promise<string> {
  const headersList = await headers();
  // proxy.ts forward x-pathname, bỏ basePath '/admin' nếu có
  return headersList.get('x-pathname') || '/services/admin';
}
