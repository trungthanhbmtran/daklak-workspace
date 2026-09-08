import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

const INTERNAL_API_URL = process.env.INTERNAL_API_URL || 'http://api-gateway:8080/api/v1/admin';

export async function getServerUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  if (!token) return null;

  try {
    const res = await fetch(`${INTERNAL_API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      // Không cache để luôn lấy session mới nhất từ server
      cache: 'no-store'
    });
    
    if (!res.ok) return null;
    
    const json = await res.json();
    return json?.data?.data || json?.data || json;
  } catch (error) {
    console.error('getServerUser error:', error);
    return null;
  }
}

export async function requirePermissions(policies: string[]) {
  const user = await getServerUser();
  if (!user) {
    notFound();
  }

  // Nếu không yêu cầu quyền gì thì cho qua
  if (!policies || policies.length === 0) {
    return user;
  }

  const userPolicies: string[] = user.permissionsFlatten || [];
  const hasPermission = policies.some(policy => userPolicies.includes(policy));

  if (!hasPermission) {
    notFound();
  }

  return user;
}

export async function requireMenuAccess(path: string) {
  const user = await getServerUser();
  if (!user) notFound();

  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;

  try {
    const res = await fetch(`${INTERNAL_API_URL}/menus/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      cache: 'no-store'
    });
    
    if (!res.ok) notFound();
    
    const json = await res.json();
    const menus = json?.data || [];
    
    // Đệ quy lấy tất cả các path hợp lệ từ cây menu
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const extractPaths = (items: any[]): string[] => {
      const paths: string[] = [];
      for (const item of items) {
        if (item.path) paths.push(item.path);
        if (item.children && Array.isArray(item.children)) {
          paths.push(...extractPaths(item.children));
        }
      }
      return paths;
    };
    
    const allowedPaths = extractPaths(menus);
    // Cho phép truy cập nếu đường dẫn hiện tại bắt đầu bằng một trong các path được phép (hỗ trợ trang con)
    const hasAccess = allowedPaths.some(p => p && p.length > 1 && path.startsWith(p));
    
    if (!hasAccess) {
      notFound();
    }
    
    return user;
  } catch (error) {
    console.error('requireMenuAccess error:', error);
    notFound();
  }
}
