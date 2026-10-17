import { cookies } from "next/headers";
import axios from "axios";

export async function serverFetch<T>(path: string): Promise<T | null> {
  let lang = "vi";
  try {
    const cookieStore = await cookies();
    const cookieLang = cookieStore.get("lang")?.value;
    if (cookieLang === "vi" || cookieLang === "en") {
      lang = cookieLang;
    }
  } catch {
    // Graceful fallback during static compilation or static generation (ISR)
  }

  // Dùng http://api-gateway:8080 trong Docker, fallback về http://localhost:8080 ngoài Docker
  const baseUrl = process.env.INTERNAL_API_URL || "http://api-gateway:8080";
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Construct final URL with language query parameter
  const rawUrl = `${baseUrl}/api/v1/${cleanPath}`;
  const separator = rawUrl.includes('?') ? '&' : '?';
  const url = `${rawUrl}${separator}lang=${lang}`;
  
  try {
    const res = await axios.get<T>(url, {
      headers: {
        "x-lang": lang,
        "Accept-Language": lang,
      },
      validateStatus: (status) => status >= 200 && status < 300,
    });
    return res.data;
  } catch {
    if (!baseUrl.includes("localhost")) {
      const fallbackRawUrl = `http://localhost:8080/api/v1/${cleanPath}`;
      const fallbackSeparator = fallbackRawUrl.includes('?') ? '&' : '?';
      const fallbackUrl = `${fallbackRawUrl}${fallbackSeparator}lang=${lang}`;
      try {
        const res = await axios.get<T>(fallbackUrl, {
          headers: {
            "x-lang": lang,
            "Accept-Language": lang,
          },
          validateStatus: (status) => status >= 200 && status < 300,
        });
        return res.data;
      } catch {
        return null;
      }
    }
    return null;
  }
}

