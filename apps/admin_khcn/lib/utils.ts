/* eslint-disable @typescript-eslint/no-explicit-any */
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safely parse a JSON string or return the object itself if already parsed.
 * @param data The JSON string or object
 * @param fallback The fallback value if parsing fails
 */
export function safeParseJSON<T = any>(data: any, fallback: T = {} as T): T {
  if (!data) return fallback;
  if (typeof data === 'object') return data;
  try {
    return JSON.parse(data);
  // eslint-disable-next-line unused-imports/no-unused-vars
  } catch (e) {
    return fallback;
  }
}

/**
 * Safely format a date string or object.
 * @param dateStr The date string or object
 * @param formatStr The date-fns format string (default 'dd/MM/yyyy')
 * @param fallback The fallback string if date is invalid (default '—')
 */
export function formatDate(dateStr: string | Date | undefined | null, formatStr: string = 'dd/MM/yyyy', fallback: string = "—"): string {
  if (!dateStr) return fallback;
  try {
    return format(new Date(dateStr), formatStr, { locale: vi });
  // eslint-disable-next-line unused-imports/no-unused-vars
  } catch (e) {
    return fallback;
  }
}
