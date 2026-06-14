export function sanitizeUserForClient(user: any) {
  if (!user) return null;
  const {
    roles,
    permissions,
    role,
    roleIds,
    permissionsFlatten,
    policies,
    roleNames,
    role_names,
    ...safeUser
  } = user;
  return safeUser;
}
