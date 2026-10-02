/** Return a canonical app route; /admin is supplied by Next's basePath. */
export function safeAuthCallback(value: string | null | undefined): string {
  if (!value?.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u001f\u007f]/.test(value)) return "/hub";
  let url: URL, path: string;
  try {
    url = new URL(value, "https://app.invalid");
    path = decodeURIComponent(url.pathname);
  } catch { return "/hub"; }
  if (/[\\%\u0000-\u001f\u007f]/.test(path)) return "/hub";
  const local = path === "/admin" ? "/" : path.startsWith("/admin/") ? path.slice(6) : path;
  if (local.startsWith("//")) return "/hub";
  url.pathname = local;
  const canonical = url.pathname.replace(/\/+$/, "") || "/";
  if (canonical === "/login" || canonical === "/session/refresh" || canonical === "/api" || canonical.startsWith("/api/")) return "/hub";
  return url.pathname + url.search + url.hash;
}
