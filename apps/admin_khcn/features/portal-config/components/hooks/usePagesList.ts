/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { portalConfigApi } from "../../api";

export interface CustomPageMeta {
  id: string;
  title: Record<string, string>;
  isActive: boolean;
}

export function usePagesList(selectedPageId: string, setSelectedPageId: (id: string) => void) {
  const queryClient = useQueryClient();

  const { data: dbConfigs, isLoading, refetch } = useQuery({
    queryKey: ["portal-configs"],
    queryFn: async () => {
      const res: any = await portalConfigApi.getAll();
      return res.data;
    },
    staleTime: 60_000,
  });

  const pagesList = useMemo<CustomPageMeta[]>(() => {
    if (!dbConfigs?.length) return [];
    const listConfig = dbConfigs.find((c: any) => c.code === "custom_page_list");

    if (listConfig?.description) {
      try {
        const parsed = JSON.parse(listConfig.description);
        if (parsed.length > 0) return parsed;
      } catch (e) {
        console.error("Failed to parse custom page list", e);
      }
    }
    return [
      { id: "about-page", title: { vi: "Trang giới thiệu chung", en: "General Introduction" }, isActive: true },
      { id: "contact-page", title: { vi: "Trang liên hệ", en: "Contact Page" }, isActive: true }
    ];
  }, [dbConfigs]);

  const activePageId = selectedPageId || (pagesList.length > 0 ? pagesList[0].id : "about-page");

  const setPagesList = (newList: CustomPageMeta[]) => {
    queryClient.setQueryData(["portal-configs"], (oldData: any[]) => {
      if (!oldData) return oldData;
      const existingIdx = oldData.findIndex(c => c.code === "custom_page_list");
      const newConfig = { code: "custom_page_list", description: JSON.stringify(newList) };

      if (existingIdx >= 0) {
        const newData = [...oldData];
        newData[existingIdx] = { ...newData[existingIdx], ...newConfig };
        return newData;
      }
      return [...oldData, newConfig];
    });
  };

  const handleSavePageMeta = async (id: string, titles: Record<string, string>, isActive: boolean, mode: "ADD" | "EDIT") => {
    let updatedList: CustomPageMeta[];
    if (mode === "ADD") {
      const newPage: CustomPageMeta = { id, title: titles, isActive };
      updatedList = [...pagesList, newPage];
    } else {
      updatedList = pagesList.map((p) => p.id === id ? { ...p, title: titles, isActive } : p);
    }
    setPagesList(updatedList);

    try {
      await portalConfigApi.batchUpsert([{
        code: "custom_page_list",
        name: "Danh sách trang thiết kế trực quan",
        description: JSON.stringify(updatedList)
      }]);
      if (mode === "ADD") setSelectedPageId(id);
      refetch();
     
    } catch (e) {
      toast.error((e as any)?.response?.data?.message || "Không thể lưu thông tin trang. Vui lòng thử lại.");
    }
  };

  const handleDeletePage = async (pageId: string) => {
    if (pageId === "about-page" || pageId === "contact-page") {
      toast.error("Không thể xóa các trang mặc định của hệ thống.");
      return;
    }

    try {
      const updatedList = pagesList.filter((p) => p.id !== pageId);
      setPagesList(updatedList);

      await portalConfigApi.batchUpsert([{
        code: "custom_page_list",
        name: "Danh sách trang thiết kế trực quan",
        description: JSON.stringify(updatedList)
      }]);

      const layoutConfig = dbConfigs?.find((c: any) => c.code === `custom_page_layout_${pageId}`);
      if (layoutConfig) {
        await portalConfigApi.update(layoutConfig.id, { code: layoutConfig.code, name: layoutConfig.name, description: '' });
      }

      toast.success("Đã xóa trang tùy chỉnh thành công!");

      if (activePageId === pageId) {
        setSelectedPageId(updatedList[0]?.id || "about-page");
      }
      refetch();
     
    } catch (e) {
      toast.error((e as any)?.response?.data?.message || "Không thể xóa trang.");
    }
  };

  const togglePageActive = async (pageId: string) => {
    const updatedList = pagesList.map((p) =>
      p.id === pageId ? { ...p, isActive: !p.isActive } : p
    );
    setPagesList(updatedList);
    try {
      await portalConfigApi.batchUpsert([{
        code: "custom_page_list",
        name: "Danh sách trang thiết kế trực quan",
        description: JSON.stringify(updatedList)
      }]);
      refetch();
     
    } catch (e) {
      toast.error((e as any)?.response?.data?.message || "Không thể cập nhật trạng thái trang.");
    }
  };

  return {
    isLoading,
    pagesList,
    activePageId,
    handleSavePageMeta,
    handleDeletePage,
    togglePageActive
  };
}
