import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function resolveMediaUrl(urlOrId: string | undefined | null) {
  if (!urlOrId) return "";
  if (
    urlOrId.startsWith("http://") || 
    urlOrId.startsWith("https://") || 
    urlOrId.startsWith("data:") ||
    urlOrId.startsWith("/")
  ) {
    return urlOrId;
  }
  return `/api/v1/admin/media/download/${urlOrId}`;
}

// Client-side cookie getter helper (dùng chung toàn portal)
export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[2]) : null;
}

/**
 * Loại bỏ các thành phần thực thi động khỏi HTML được render qua dangerouslySetInnerHTML
 * (script tag, iframe/embed/object, event handler attributes on*, href javascript:).
 * Đơn giản bằng regex, không thêm dependency.
 */
export function stripUnsafeHtml(html: string): string {
  if (!html) return "";
  return html
    // <script>...</script> hoặc script tag rỗng/tự đóng
    .replace(/<script\b[\s\S]*?>([\s\S]*?)<\/script\s*>/gi, "")
    .replace(/<script\b[^>]*\/?>/gi, "")
    // iframe / embed / object
    .replace(/<\/?(iframe|embed|object)\b[^>]*>/gi, "")
    // event handler attributes: on*="..." / on*='...' / on*=unquoted
    .replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    // href/src javascript: protocol
    .replace(/\s(href|src)\s*=\s*(?:"\s*javascript:[^"]*"|'\s*javascript:[^']*'|javascript:[^\s>]*)/gi, ' $1="#"');
}

/**
 * Làm sạch CSS do admin nhập trước khi chèn vào <style>
 * - escape "</style" để không đóng thẻ style sớm (breakout)
 * - không cho phép url(javascript:...)
 */
export function sanitizeCustomCss(css: string | undefined | null): string {
  if (!css) return "";
  return css
    .replace(/<\/style/gi, "<\\/style")
    .replace(/url\(\s*(?:(['"])\s*javascript:[^)]*|javascript:[^)]*)\)/gi, "url()");
}

