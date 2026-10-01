import { cookies } from "next/headers";
import { serverApiBase } from "./server-api-url";

export async function serverFetch<T>(path: string): Promise<T | null> {
  const baseUrl = serverApiBase();
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;

  const rawUrl = `${baseUrl}/${cleanPath}`;

  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map((c: any) => `${c.name}=${c.value}`)
      .join(";");

    const res = await fetch(rawUrl, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Cookie: cookieHeader,
      },
    });

    if (!res.ok) {
      console.error(`[serverFetch] Failed to fetch ${rawUrl}: ${res.status}`);
      return null;
    }

    return (await res.json()) as T;
  } catch (error) {
    console.error(`[serverFetch] Error fetching from ${rawUrl}:`, error);

    // Fallback to localhost
    if (!baseUrl.includes("localhost")) {
      const fallbackRawUrl = `http://localhost:8080/api/v1/admin/${cleanPath}`;
      try {
        const cookieStore = await cookies();
        const cookieHeader = cookieStore
          .getAll()
          .map((c: any) => `${c.name}=${c.value}`)
          .join(";");

        const res = await fetch(fallbackRawUrl, {
          cache: "no-store",
          headers: {
            Accept: "application/json",
            Cookie: cookieHeader,
          },
        });
        if (res.ok) {
          return (await res.json()) as T;
        }
      } catch (fallbackError) {
        console.error(`[serverFetch] Fallback failed:`, fallbackError);
      }
    }
    return null;
  }
}
