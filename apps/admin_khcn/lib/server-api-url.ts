/** Accept both origin-only and already-prefixed INTERNAL_API_URL values. */
export function serverApiBase(
  value = process.env.INTERNAL_API_URL || "http://api-gateway:8080",
) {
  return (
    value.replace(/\/+$/, "").replace(/\/api\/v1(?:\/admin)?$/, "") +
    "/api/v1/admin"
  );
}
