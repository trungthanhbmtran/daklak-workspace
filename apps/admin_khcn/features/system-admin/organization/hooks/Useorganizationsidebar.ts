"use client";

import { useCallback, useMemo, useState } from "react";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { useOrganizationContext } from "../context/OrganizationContext";

/**
 * Toàn bộ state & side-effect của OrganizationSidebar được gom vào đây.
 * Component render (OrganizationSidebar.tsx) chỉ còn nhiệm vụ hiển thị,
 * giúp dễ test logic riêng và tránh việc mỗi lần re-render phải định nghĩa
 * lại các hàm callback (dùng useCallback để giữ tham chiếu ổn định cho
 * React.memo ở các component con phát huy tác dụng).
 */
export function useOrganizationSidebar() {
    const { state } = useOrganizationContext();
    const { flatUnits, tree } = state;

    const searchParams = useSearchParams();
    const router = useRouter();
    const params = useParams<{ code: string }>();
    const pathname = usePathname();

    const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

    const searchTerm = searchParams.get("search") || "";

    // Xác định activeId từ route params hoặc searchParams
    const activeId = useMemo(() => {
        const rawCode = params?.code;
        const currentCode = rawCode ? decodeURIComponent(rawCode) : "";
        const activeUnit = currentCode
            ? flatUnits.find((u) => u.code === currentCode || String(u.id) === currentCode)
            : undefined;

        if (activeUnit) return activeUnit.id;

        const parentIdStr = searchParams.get("parentId");
        return parentIdStr ? Number(parentIdStr) : undefined;
    }, [params?.code, flatUnits, searchParams]);

    // Khi đang tìm kiếm thì mở rộng toàn bộ cây để lộ ra kết quả phù hợp
    const effectiveExpandedIds = useMemo(() => {
        if (!searchTerm.trim()) return expandedIds;
        return new Set(flatUnits.map((u) => u.id));
    }, [searchTerm, flatUnits, expandedIds]);

    const toggleExpand = useCallback((id: number) => {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const handleSelect = useCallback(
        (id: number) => {
            // Lấy tab segment cuối cùng trong URL để giữ lại khi chuyển đơn vị
            // Dùng pop() thay vì includes() để tránh false match với các segment khác
            const TABS = ["info", "scope", "staffing"] as const;
            const lastSegment = pathname.split("/").pop() ?? "";
            const activeTab = (TABS as readonly string[]).includes(lastSegment)
                ? (lastSegment as typeof TABS[number])
                : "info";
            const searchStr = searchParams.toString();
            const suffix = searchStr ? `?${searchStr}` : "";
            router.push(`/services/admin/organization/${id}/${activeTab}${suffix}`);
        },
        [router, pathname, searchParams]
    );

    const handleAddChild = useCallback(
        (id: number) => {
            router.push(`/services/admin/organization/create?parentId=${id}`);
        },
        [router]
    );

    const handleAddRoot = useCallback(() => {
        router.push(`/services/admin/organization/create`);
    }, [router]);

    return {
        flatUnits,
        tree,
        searchTerm,
        activeId,
        expandedIds: effectiveExpandedIds,
        toggleExpand,
        handleSelect,
        handleAddChild,
        handleAddRoot,
    };
}