/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from '@tanstack/react-query';
import { portalLanguagesApi } from '../../api';

/**
 * Hook lấy danh sách ngôn ngữ active — dùng React Query để cache.
 * Không dùng useEffect/useState thuần nữa.
 */
export function useLanguages(initialLanguages: any[] = []) {
  const { data } = useQuery({
    queryKey: ['portal-languages'],
    queryFn: async () => {
      const res: any = await portalLanguagesApi.getActive();
      const all = Array.isArray(res?.data) ? res.data : [];
      const langs = all.filter((c: any) => c.active === 1);
      return langs.length > 0 ? langs : [{ code: 'vi', name: 'Tiếng Việt' }, { code: 'en', name: 'English' }];
    },
    staleTime: 5 * 60_000,
    placeholderData: initialLanguages.length > 0 ? initialLanguages : [{ code: 'vi', name: 'Tiếng Việt' }, { code: 'en', name: 'English' }],
  });

  return data ?? (initialLanguages.length > 0 ? initialLanguages : [{ code: 'vi', name: 'Tiếng Việt' }]);
}
