export function sanitizeUserForClient(user: any) {
  if (!user) return null;
  const {
    // Note: PBAC enabled. Role-related fields have been deprecated.
    // Ensure you only pass necessary flags (like permissions or policies) to the frontend.
    ...safeUser
  } = user;

  return safeUser;
}
