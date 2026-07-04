"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { portalConfigApi } from "../../api";
import { Row } from "@/modules/page-builder/core/types";

export function usePageLayout(activePageId: string, pageIsActive: boolean, pageTitle: string) {
  const [isSaving, setIsSaving] = useState(false);
  const [currentLayout, setCurrentLayout] = useState<Row[]>([]);

  const { data: dbConfigs, refetch } = useQuery({
    queryKey: ["portal-configs"],
    queryFn: async () => {
      const res: any = await portalConfigApi.getAll();
      return Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
    },
    staleTime: 60_000,
  });

  const savedLayout = useMemo<Row[]>(() => {
    if (!dbConfigs?.length || !activePageId) return [];
    const layoutCode = activePageId === "about-page" ? "custom_about_layout" : `custom_page_layout_${activePageId}`;
    const layoutConfig = dbConfigs.find((c: any) => c.code === layoutCode);

    if (layoutConfig?.description) {
      try { return JSON.parse(layoutConfig.description); } catch (e) { }
    }
    return [];
  }, [dbConfigs, activePageId]);

  useEffect(() => {
    setCurrentLayout(savedLayout);
  }, [savedLayout]);

  const handleSaveLayout = async () => {
    if (!activePageId) return;
    setIsSaving(true);
    try {
      const itemsToSave = [
        { 
          code: activePageId === "about-page" ? "custom_about_layout" : `custom_page_layout_${activePageId}`, 
          name: `Cấu trúc layout trang ${pageTitle || activePageId}`, 
          description: JSON.stringify(currentLayout) 
        }
      ];

      if (activePageId === "about-page") {
        itemsToSave.push({
          code: "use_custom_about_layout",
          name: pageIsActive ? "true" : "false",
          description: "Đồng bộ hóa cấu hình trang giới thiệu trực quan"
        });
      }

      await portalConfigApi.batchUpsert(itemsToSave);
      toast.success(`Xuất bản thành công "${pageTitle || activePageId}"!`);
      refetch();
    } catch (error) {
      toast.error("Không thể lưu trang. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    currentLayout,
    setCurrentLayout,
    isSaving,
    handleSaveLayout,
    refetch
  };
}
