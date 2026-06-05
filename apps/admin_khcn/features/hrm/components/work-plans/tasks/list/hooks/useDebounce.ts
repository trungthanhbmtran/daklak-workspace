import { useState, useEffect } from 'react';

/**
 * Trả về giá trị đã được debounce sau `delay` ms.
 * Dùng cho search input và filter selects để tránh gọi API mỗi keystroke.
 *
 * @example
 * const debouncedSearch = useDebounce(searchValue, 300);
 * // useQuery chỉ refetch khi debouncedSearch thay đổi
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
