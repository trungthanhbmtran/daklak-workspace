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
    cookieStore.get('accessToken')?.value ||
    cookieStore.get('session')?.value ||
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
        if (!res.ok) {
          const errText = await res.text().catch(() => 'No text');
          console.error(`[fetch menus/me] FAILED! Status: ${res.status} ${res.statusText}. Response: ${errText}`);
          return [];
        }
        const json = await res.json();
        const paths = json?.data?.allowedPaths || json?.allowedPaths || json?.allowed_paths || [];
        if (paths.length === 0) {
           console.error(`[fetch menus/me] SUCCESS but paths is empty. JSON:`, JSON.stringify(json));
        }
        return paths;
      } catch (err) {
        console.error('[fetch menus/me] ERROR EXCEPTION:', err);
        return [];
      }
    },
    // Cache key dựa vào token (unique per user session)
    [`menu-paths-${token.slice(-16)}`],
    { revalidate: 10, tags: ['user-menus'] } // 10 giây (giảm để debug)
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
    console.error(`[requireMenuAccess] allowedPaths empty for token: ${token.slice(-10)}`);
    notFound();
  }

  // Chuẩn hoá pathname: bỏ trailing slash nếu có
  const normalizedPathname = pathname.endsWith('/') && pathname.length > 1 
    ? pathname.slice(0, -1) 
    : pathname;

  const hasAccess = allowedPaths.some((policy) => {
    if (!policy) return false;
    
    // Nếu policy có wildcard ở cuối (ví dụ: /services/admin/users/*)
    if (policy.endsWith('/*')) {
      const base = policy.slice(0, -2);
      return normalizedPathname === base || normalizedPathname.startsWith(base + '/');
    }
    
    // Nếu không có wildcard thì phải khớp chính xác
    return normalizedPathname === policy;
  });

  if (!hasAccess) {
    console.error(`[requireMenuAccess] no access for pathname: ${normalizedPathname}. Allowed: ${allowedPaths}`);
    notFound();
  }
}

// ─────────────────────────────────────────────
// getCurrentPathname — đọc pathname từ header (forward bởi proxy.ts)
// ─────────────────────────────────────────────
export async function getCurrentPathname(): Promise<string> {
  const headersList = await headers();
  // proxy.ts forward x-pathname, bỏ basePath '/admin' nếu có
  let pathname = headersList.get('x-pathname') || '/services/admin';
  if (pathname.startsWith('/admin/')) {
    pathname = pathname.replace(/^\/admin/, '') || '/';
  } else if (pathname === '/admin') {
    pathname = '/';
  }
  return pathname;
}
