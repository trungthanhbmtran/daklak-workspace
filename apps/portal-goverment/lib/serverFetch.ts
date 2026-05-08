export async function serverFetch<T>(path: string): Promise<T | null> {
  // Dùng http://api-gateway:8080 trong Docker, fallback về http://localhost:8080 ngoài Docker
  const baseUrl = process.env.INTERNAL_API_URL || "http://api-gateway:8080";
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const url = `${baseUrl}/api/v1/${cleanPath}`;
  
  console.log(`[serverFetch] Fetching from: ${url}`);
  try {
    const res = await fetch(url, {
      next: { revalidate: 60 }, // ISR 60 giây
    });
    if (!res.ok) {
      console.error(`[serverFetch] Failed to fetch ${url}: ${res.statusText} (${res.status})`);
      return null;
    }
    return await res.json() as T;
  } catch (error) {
    console.error(`[serverFetch] Error fetching from ${url}:`, error);
    
    if (!baseUrl.includes("localhost")) {
      const fallbackUrl = `http://localhost:8080/api/v1/${cleanPath}`;
      console.log(`[serverFetch] Retrying with localhost fallback: ${fallbackUrl}`);
      try {
        const res = await fetch(fallbackUrl, { next: { revalidate: 60 } });
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
