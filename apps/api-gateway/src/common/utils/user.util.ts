export function sanitizeUserForClient(user: any) {
  if (!user) return null;
  // Loại bỏ các thông số liên quan tới hệ thống như quyền (roles, permissions)
  const { roles, permissions, role, roleIds, ...safeUser } = user;
  return safeUser;
}
