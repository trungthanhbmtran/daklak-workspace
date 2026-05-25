import { useState, useEffect } from 'react';
import apiClient from '@/lib/axiosInstance';

export function useLanguages(initialLanguages = []) {
  const [languages, setLanguages]: any = useState(initialLanguages);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const res: unknown = await apiClient.get('/categories');
        const all = Array.isArray((res as any)?.data) ? (res as any).data : [];
        const langs = all.filter((c: any) => c.group === 'LANGUAGE' && c.active === 1);
        setLanguages(langs.length > 0 ? langs : [{ code: 'vi', name: 'Tiếng Việt' }, { code: 'en', name: 'English' }]);
      } catch (error) {
        console.error('Error fetching languages', error);
        setLanguages([{ code: 'vi', name: 'Tiếng Việt' }, { code: 'en', name: 'English' }]);
      }
    };
    fetchLanguages();
  }, []);

  return languages;
}
