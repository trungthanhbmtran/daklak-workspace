import { cookies } from "next/headers";
import axios from "axios";
import { serverApiBase } from "./server-api-url";

export async function serverFetch<T>(path: string): Promise<T | null> {
  const url = `${serverApiBase()}${path.startsWith("/") ? path : `/${path}`}`;

  const cookieHeader = (await cookies())
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join("; ");

  try {
    const res = await axios.get<T>(url, {
      headers: { Accept: "application/json", Cookie: cookieHeader },
      validateStatus: (status) => status >= 200 && status < 300,
    });
    return res.data;
  } catch {
    return null;
  }
}