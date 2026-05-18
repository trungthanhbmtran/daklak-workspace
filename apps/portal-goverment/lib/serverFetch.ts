import { cookies } from "next/headers";

export async function serverFetch<T>(path: string): Promise<T | null> {
  let lang = "vi";
  try {
    const cookieStore = await cookies();
    const cookieLang = cookieStore.get("lang")?.value;
    if (cookieLang === "vi" || cookieLang === "en") {
      lang = cookieLang;
    }
  } catch (e) {
    // Graceful fallback during static compilation or static generation (ISR)
  }

  // Dùng http://api-gateway:8080 trong Docker, fallback về http://localhost:8080 ngoài Docker
  const baseUrl = process.env.INTERNAL_API_URL || "http://api-gateway:8080";
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Construct final URL with language query parameter
  const rawUrl = `${baseUrl}/api/v1/${cleanPath}`;
  const separator = rawUrl.includes('?') ? '&' : '?';
  const url = `${rawUrl}${separator}lang=${lang}`;
  
  console.log(`[serverFetch] Fetching from: ${url} (lang: ${lang})`);
  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: {
        "x-lang": lang,
        "Accept-Language": lang,
      }
    });
    if (!res.ok) {
      console.error(`[serverFetch] Failed to fetch ${url}: ${res.statusText} (${res.status})`);
      return null;
    }
    return await res.json() as T;
  } catch (error) {
    console.error(`[serverFetch] Error fetching from ${url}:`, error);
    
    if (!baseUrl.includes("localhost")) {
      const fallbackRawUrl = `http://localhost:8080/api/v1/${cleanPath}`;
      const fallbackSeparator = fallbackRawUrl.includes('?') ? '&' : '?';
      const fallbackUrl = `${fallbackRawUrl}${fallbackSeparator}lang=${lang}`;
      console.log(`[serverFetch] Retrying with localhost fallback: ${fallbackUrl}`);
      try {
        const res = await fetch(fallbackUrl, {
          cache: "no-store",
          headers: {
            "x-lang": lang,
            "Accept-Language": lang,
          }
        });
        if (res.ok) {
          return await res.json() as T;
        }
      } catch (fallbackError) {
        console.error(`[serverFetch] Fallback failed:`, fallbackError);
      }
    }
    return null;
  }
}
