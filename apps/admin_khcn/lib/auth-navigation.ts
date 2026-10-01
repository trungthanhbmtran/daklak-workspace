/** Next router expects an app-relative route; the configured /admin basePath is added by Next. */
export function safeAuthCallback(value: string | null | undefined): string {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    /[\\\r\n]/.test(value)
  )
    return "/hub";
  let decoded: string;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    return "/hub";
  }
  if (decoded.startsWith("//") || /[\\\r\n]/.test(decoded)) return "/hub";
  const normalized =
    value === "/admin"
      ? "/"
      : value.startsWith("/admin/")
        ? value.slice(6)
        : value;
  const pathname = new URL(normalized, "https://app.invalid").pathname;
  if (
    pathname === "/login" ||
    pathname === "/session/refresh" ||
    pathname.startsWith("/api/") ||
    pathname === "/api"
  )
    return "/hub";
  return normalized;
}
