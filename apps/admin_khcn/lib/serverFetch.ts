import { cookies } from "next/headers";
import { serverApiBase } from "./server-api-url";

export async function serverFetch<T>(path: string): Promise<T | null> {
  const baseUrl = serverApiBase();
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  const rawUrl = `${baseUrl}/${cleanPath}`;

  // Next.js must propagate request/prerender control flow before network error handling.
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`).join(";");

  try {
    const res = await fetch(rawUrl, {
      cache: "no-store",
      headers: { Accept: "application/json", Cookie: cookieHeader },
    });
    if (!res.ok) {
      console.error(`[serverFetch] Request failed: ${res.status}`);
      return null;
    }
    return (await res.json()) as T;
  } catch {
    // Use the configured gateway only; do not send the user's cookie to a fallback server.
    console.error("[serverFetch] Gateway request unavailable");
    return null;
  }
}
