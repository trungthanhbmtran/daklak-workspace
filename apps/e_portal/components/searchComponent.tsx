'use client'
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce'; // Cần cài thêm để tránh spam API

export default function Search() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  // Khi người dùng gõ, update URL
  const handleSearch = useDebouncedCallback((term) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }
    // Chuyển URL mà không reload trang
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  return <input onChange={(e) => handleSearch(e.target.value)} />;
}