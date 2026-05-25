import { useState, useCallback } from 'react';

export function usePages(initialPages: any[] = []) {
  const [pagesList, setPagesList] = useState(initialPages);
  const [selectedPageId, setSelectedPageId] = useState<string>('about-page');

  const addPage = useCallback((newPage: any) => {
    setPagesList((prev: any) => [...prev, newPage]);
    setSelectedPageId(newPage.id);
  }, []);

  const updatePage = useCallback((updatedPage: any) => {
    setPagesList((prev: any) =>
      prev.map((p: any) => (p.id === updatedPage.id ? { ...p, ...updatedPage } : p))
    );
  }, []);

  const deletePage = useCallback((pageId: any) => {
    setPagesList((prev) => prev.filter((p) => p.id !== pageId));
    if (selectedPageId === pageId) {
      setSelectedPageId(prev => {
        const remaining = pagesList.filter(p => p.id !== pageId);
        return remaining[0]?.id || 'about-page';
      });
    }
  }, [pagesList, selectedPageId]);

  return { pagesList, setPagesList, selectedPageId, setSelectedPageId, addPage, updatePage, deletePage };
}
