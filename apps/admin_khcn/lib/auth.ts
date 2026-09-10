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
// requireAuth — bắt buộc đăng nhập, dùng trong layout
// ─────────────────────────────────────────────
export async function requireAuth() {
  const token = await getToken();
  if (!token) redirect('/login');
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
          cache: 'no-store',
        });
        if (!res.ok) return [];
        const json = await res.json();
        return json?.data?.allowedPaths || json?.allowedPaths || json?.allowed_paths || [];
      } catch {
        return [];
      }
    },
    // Cache key dựa vào token (unique per user session)
    [`menu-paths-${token.slice(-16)}`],
    { revalidate: 300, tags: ['user-menus'] } // 5 phút
  )();
}

// ─────────────────────────────────────────────
// requireMenuAccess — kiểm tra quyền menu server-side (Dumb Frontend)
// Gọi ở Server Component layout, notFound() nếu không có quyền
// ─────────────────────────────────────────────
export async function requireMenuAccess(pathname: string) {
  const token = await requireAuth();
  const allowedPaths = await getCachedAllowedPaths(token);

  if (allowedPaths.length === 0) {
    notFound();
  }

  const hasAccess = allowedPaths.some((policy) => {
    if (!policy) return false;
    
    // Nếu policy có wildcard ở cuối (ví dụ: /services/admin/users/*)
    if (policy.endsWith('/*')) {
      const base = policy.slice(0, -2);
      return pathname === base || pathname.startsWith(base + '/');
    }
    
    // Nếu không có wildcard thì phải khớp chính xác
    return pathname === policy;
  });

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
