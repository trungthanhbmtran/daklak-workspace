"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import apiClient from "@/lib/axiosInstance";
import { Row } from "@/modules/page-builder/core/types";

export interface CustomPageMeta {
    id: string;
    title: Record<string, string>;
    isActive: boolean;
}

export function usePortalBuilder(languages: any[]) {
    const [isSaving, setIsSaving] = useState(false);
    const [pagesList, setPagesList] = useState<CustomPageMeta[]>([]);
    const [selectedPageId, setSelectedPageId] = useState<string>("");
    const [currentLayout, setCurrentLayout] = useState<Row[]>([]);
    const [showPagesSidebar, setShowPagesSidebar] = useState(true);

    const activeLangs = languages.length > 0
        ? languages
        : [{ code: "vi", name: "Tiếng Việt" }, { code: "en", name: "English" }];

    // Fetch dữ liệu cấu hình từ API
    const { data: dbConfigs, isLoading, refetch } = useQuery({
        queryKey: ["portal-configs"],
        queryFn: async () => {
            const res: any = await apiClient.get("/portal-configs");
            return res || [];
        }
    });

    // Xử lý danh sách trang từ DB
    useEffect(() => {
        if (dbConfigs?.length) {
            const listConfig = dbConfigs.find((c: any) => c.code === "custom_page_list");
            let parsedPages: CustomPageMeta[] = [];

            if (listConfig?.description) {
                try {
                    parsedPages = JSON.parse(listConfig.description);
                } catch (e) {
                    console.error("Failed to parse custom page list", e);
                }
            }

            if (parsedPages.length === 0) {
                parsedPages = [
                    { id: "about-page", title: { vi: "Trang giới thiệu chung", en: "General Introduction" }, isActive: true },
                    { id: "contact-page", title: { vi: "Trang liên hệ", en: "Contact Page" }, isActive: true }
                ];
            }

            setPagesList(parsedPages);
            if (!parsedPages.some((p) => p.id === selectedPageId)) {
                setSelectedPageId(parsedPages[0]?.id || "about-page");
            }
        }
    }, [dbConfigs]);

    // Xử lý nạp Layout tương ứng với trang đang chọn
    useEffect(() => {
        if (dbConfigs?.length && selectedPageId) {
            const layoutCode = selectedPageId === "about-page" ? "custom_about_layout" : `custom_page_layout_${selectedPageId}`;
            const layoutConfig = dbConfigs.find((c: any) => c.code === layoutCode);

            if (layoutConfig?.description) {
                try {
                    setCurrentLayout(JSON.parse(layoutConfig.description));
                } catch (e) {
                    setCurrentLayout([]);
                }
            } else {
                setCurrentLayout([]);
            }
        }
    }, [dbConfigs, selectedPageId]);

    // Hàm lưu / xuất bản cấu trúc Layout
    const handleSaveLayout = async (targetPageId: string, updatedLayout: Row[], updatedPagesList?: CustomPageMeta[]) => {
        setIsSaving(true);
        try {
            const finalPagesList = updatedPagesList || pagesList;
            const targetPageMeta = finalPagesList.find(p => p.id === targetPageId);

            const itemsToSave = [
                { code: "custom_page_list", name: "Danh sách trang thiết kế trực quan", description: JSON.stringify(finalPagesList) },
                { code: targetPageId === "about-page" ? "custom_about_layout" : `custom_page_layout_${targetPageId}`, name: `Cấu trúc layout trang ${targetPageMeta?.title?.vi || targetPageId}`, description: JSON.stringify(updatedLayout) }
            ];

            if (targetPageId === "about-page") {
                itemsToSave.push({
                    code: "use_custom_about_layout",
                    name: targetPageMeta?.isActive ? "true" : "false",
                    description: "Đồng bộ hóa cấu hình trang giới thiệu trực quan"
                });
            }

            for (const item of itemsToSave) {
                const existing = dbConfigs?.find((c: any) => c.code === item.code);
                if (existing) {
                    await apiClient.put(`/portal-configs/${existing.id}`, item);
                } else {
                    await apiClient.post("/portal-configs", item);
                }
            }

            toast.success(`Xuất bản thành công "${targetPageMeta?.title?.vi || targetPageId}"!`);
            refetch();
        } catch (error) {
            toast.error("Không thể lưu trang. Vui lòng thử lại.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeletePage = async (pageId: string) => {
        if (pageId === "about-page" || pageId === "contact-page") {
            toast.error("Không thể xóa các trang mặc định của hệ thống.");
            return;
        }

        if (!confirm("Bạn có chắc chắn muốn xóa trang này?")) return;

        try {
            const updatedList = pagesList.filter((p) => p.id !== pageId);
            setPagesList(updatedList);

            await apiClient.post("/portal-configs", {
                code: "custom_page_list",
                name: "Danh sách trang thiết kế trực quan",
                description: JSON.stringify(updatedList)
            });

            const layoutConfig = dbConfigs?.find((c: any) => c.code === `custom_page_layout_${pageId}`);
            if (layoutConfig) {
                await apiClient.delete(`/portal-configs/${layoutConfig.id}`);
            }

            toast.success("Đã xóa trang tùy chỉnh thành công!");
            if (selectedPageId === pageId) {
                setSelectedPageId(updatedList[0]?.id || "about-page");
            }
            refetch();
        } catch (e) {
            toast.error("Không thể xóa trang.");
        }
    };

    const selectedPageMeta = useMemo(() => {
        return pagesList.find((p) => p.id === selectedPageId) || pagesList[0];
    }, [pagesList, selectedPageId]);

    return {
        isLoading,
        isSaving,
        pagesList,
        setPagesList,
        selectedPageId,
        setSelectedPageId,
        currentLayout,
        setCurrentLayout,
        showPagesSidebar,
        setShowPagesSidebar,
        selectedPageMeta,
        activeLangs,
        refetch,
        handleSaveLayout,
        handleDeletePage
    };
}