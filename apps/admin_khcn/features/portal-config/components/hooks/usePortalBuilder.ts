"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { portalConfigApi } from "../../api";
import { Row } from "@/modules/page-builder/core/types";

export interface CustomPageMeta {
    id: string;
    title: Record<string, string>;
    isActive: boolean;
}

export function usePortalBuilder(languages: any[]) {
    const queryClient = useQueryClient();
    const [isSaving, setIsSaving] = useState(false);

    // Chỉ giữ lại State cho các tương tác UI tức thời
    const [selectedPageId, setSelectedPageId] = useState<string>("");
    const [currentLayout, setCurrentLayout] = useState<Row[]>([]);
    const [showPagesSidebar, setShowPagesSidebar] = useState(true);

    const activeLangs = languages.length > 0
        ? languages
        : [{ code: "vi", name: "Tiếng Việt" }, { code: "en", name: "English" }];

    // 1. LẤY DỮ LIỆU TỪ SERVER (Source of Truth)
    const { data: dbConfigs, isLoading, refetch } = useQuery({
        queryKey: ["portal-configs"],
        queryFn: async () => {
            const res: any = await portalConfigApi.getAll();
            return Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        },
        staleTime: 60_000,
    });

    // 2. DERIVED STATE: Tự động tính toán Danh sách trang từ Cache (Không dùng useEffect & useState)
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
        // Fallback mặc định
        return [
            { id: "about-page", title: { vi: "Trang giới thiệu chung", en: "General Introduction" }, isActive: true },
            { id: "contact-page", title: { vi: "Trang liên hệ", en: "Contact Page" }, isActive: true }
        ];
    }, [dbConfigs]);

    // 3. Tự động chọn Page ID hiển thị
    const activePageId = selectedPageId || (pagesList.length > 0 ? pagesList[0].id : "about-page");

    // 4. DERIVED STATE: Tính toán Layout đã lưu trên DB cho Page đang mở
    const savedLayout = useMemo<Row[]>(() => {
        if (!dbConfigs?.length) return [];
        const layoutCode = activePageId === "about-page" ? "custom_about_layout" : `custom_page_layout_${activePageId}`;
        const layoutConfig = dbConfigs.find((c: any) => c.code === layoutCode);

        if (layoutConfig?.description) {
            try { return JSON.parse(layoutConfig.description); } catch (e) { }
        }
        return [];
    }, [dbConfigs, activePageId]);

    // 5. ĐỒNG BỘ LOCAL STATE (Duy nhất 1 useEffect để nạp Layout DB vào Canvas Editor)
    useEffect(() => {
        setCurrentLayout(savedLayout);
    }, [savedLayout]);

    // 6. OPTIMISTIC UPDATE: Hàm giả lập setPagesList thao tác thẳng vào Cache của React Query
    // Đảm bảo UI update tức thì mà không cần re-render do chờ State
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

    // 7. CÁC NGHIỆP VỤ LƯU / XÓA
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

            // Batch upsert — 1 request thay vì N requests tuần tự
            await portalConfigApi.batchUpsert(itemsToSave);

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

            // UI cập nhật ngay lập tức nhờ Cache Mutation
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
            toast.error("Không thể xóa trang.");
        }
    };

    // Chọn ra metadata của trang hiện tại đang Active để truyền cho UI Header
    const selectedPageMeta = useMemo(() => {
        return pagesList.find((p) => p.id === activePageId) || pagesList[0];
    }, [pagesList, activePageId]);

    return {
        isLoading,
        isSaving,
        pagesList,
        setPagesList, // Bây giờ nó chỉnh sửa thẳng vào Cache React Query thay vì useState
        selectedPageId: activePageId,
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