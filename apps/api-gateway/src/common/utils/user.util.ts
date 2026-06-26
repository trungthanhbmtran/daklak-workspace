export function sanitizeUserForClient(user: any) {
  if (!user) return null;
  const {
    // Chỉ loại bỏ các Role thuần túy (RBAC) nếu không dùng tới ở client
    roles,
    role,
    roleIds,
    role_ids,
    roleNames,
    role_names,

    // (Giữ lại permissionsFlatten và policies cho PBAC)
    // (Giữ lại đơn vị, chức danh để render)
    ...safeUser
  } = user;

  return safeUser;
}
