import { useState, useMemo, useCallback, useEffect } from "react";

interface UseMultiLangTitleSlugStateProps {
    activeLangs: any[];
    initialTitles?: Record<string, string>;
    initialSlug?: string;
    isEditMode?: boolean;
}

/**
 * Công cụ xử lý dùng chung (Hook) quản lý State cho component MultiLangTitleSlug
 * Hỗ trợ đồng bộ hóa tự động Title (Đa ngôn ngữ) và Slug (Đơn/Toàn cục)
 */
export function useMultiLangTitleSlugState({
    activeLangs,
    initialTitles = {},
    initialSlug = "",
    isEditMode = false,
}: UseMultiLangTitleSlugStateProps) {
    const [titles, setTitles] = useState<Record<string, string>>(initialTitles);
    const [slug, setSlug] = useState<string>(initialSlug);

    // Cập nhật lại state khi dữ liệu khởi tạo (initial data) thay đổi từ parent (chẳng hạn khi bấm Edit page khác)
    useEffect(() => {
        setTitles(initialTitles);
        setSlug(initialSlug);
    }, [initialTitles, initialSlug]);

    // Giá trị binding đẩy xuống cho component MultiLangTitleSlug
    const multiLangValue = useMemo(() => {
        const result: Record<string, any> = {};
        for (const lang of activeLangs) {
            result[lang.code] = {
                title: titles[lang.code] || "",
                slug: slug // Sử dụng chung 1 Global Slug cho tất cả các tab
            };
        }
        return result;
    }, [titles, activeLangs, slug]);

    // Hàm callback hứng dữ liệu khi component thay đổi
    const handleMultiLangChange = useCallback((newVal: Record<string, any>) => {
        const newTitles: Record<string, string> = {};
        let updatedSlug = slug;

        for (const code in newVal) {
            newTitles[code] = newVal[code].title;

            // Nếu hệ thống đang không ở chế độ Edit và phát hiện tab nào đó vừa thay đổi slug
            // (do user gõ tiêu đề làm hàm tự build slug chạy, hoặc user tự sửa slug)
            if (!isEditMode && newVal[code].slug && newVal[code].slug !== slug) {
                updatedSlug = newVal[code].slug;
            }
        }

        setTitles(newTitles);
        if (!isEditMode && updatedSlug !== slug) {
            setSlug(updatedSlug);
        }
    }, [slug, isEditMode]);

    return {
        titles,
        setTitles,
        slug,
        setSlug,
        multiLangValue,
        handleMultiLangChange
    };
}
