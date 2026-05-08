import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function resolveMediaUrl(urlOrId: string | undefined | null) {
  if (!urlOrId) return "";
  if (urlOrId.startsWith("http://") || urlOrId.startsWith("https://") || urlOrId.startsWith("data:")) {
    return urlOrId;
  }
  return `/api/v1/admin/media/download/${urlOrId}`;
}

