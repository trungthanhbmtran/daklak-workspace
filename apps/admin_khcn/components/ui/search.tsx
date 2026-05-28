'use client';

import { Search as SearchIcon } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { useDebounceCallback } from '@/hooks/use-debounce';

export function Search({ placeholder, className }: { placeholder?: string; className?: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = useDebounceCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('search', term);
    } else {
      params.delete('search');
    }
    replace(`${pathname}?${params.toString()}`);
  }, 500);

  return (
    <div className={`relative ${className || 'w-full sm:w-96 flex shrink-0'}`}>
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
      <Input
        placeholder={placeholder || "Tìm kiếm..."}
        className="pl-10 rounded-full bg-slate-50 border-none focus-visible:ring-1 focus-visible:ring-indigo-500 w-full"
        defaultValue={searchParams.get('search')?.toString()}
        onChange={(e) => {
          handleSearch(e.target.value);
        }}
      />
    </div>
  );
}
