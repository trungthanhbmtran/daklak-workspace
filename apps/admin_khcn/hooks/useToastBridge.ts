'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';

const STORAGE_KEY = 'pending_toast';

export interface PendingToast {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

/**
 * useToastBridge — Hiển thị toast đã được lưu trước khi navigate.
 *
 * Vấn đề: Khi router.replace() được gọi, React remount page mới.
 * Toast đang hiện sẽ biến mất vì component bị unmount.
 *
 * Giải pháp:
 * 1. Trước khi navigate: gọi scheduleToast({ type, message })
 * 2. Sau khi page mới mount: hook này tự động đọc và hiện toast
 * 3. sessionStorage tự xóa sau khi render (không persist qua tab close)
 *
 * Dùng trong layout root (chạy trên mọi page):
 *   <ToastBridgeRenderer />
 */
export function scheduleToast(pending: PendingToast): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(pending));
  } catch {
    // Ignore nếu sessionStorage không khả dụng
  }
}

export function useToastBridge(): void {
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      sessionStorage.removeItem(STORAGE_KEY);
      const pending: PendingToast = JSON.parse(raw);

      // Delay nhỏ để đảm bảo Toaster component đã mount
      const timer = setTimeout(() => {
        const opts = { duration: pending.duration ?? 4000 };
        switch (pending.type) {
          case 'success': toast.success(pending.message, opts); break;
          case 'error':   toast.error(pending.message, opts); break;
          case 'warning': toast.warning(pending.message, opts); break;
          default:        toast.info(pending.message, opts);
        }
      }, 100);

      return () => clearTimeout(timer);
    } catch {
      // Ignore parse error
    }
  }, []);
}

/**
 * Component wrapper — đặt vào Root Layout một lần duy nhất.
 * Mọi page đều benefit mà không cần import hook thủ công.
 */
export function ToastBridgeRenderer(): null {
  useToastBridge();
  return null;
}
