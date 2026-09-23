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
            const unit = flatUnits.find(u => u.id === id);
            const routeCode = unit?.code || id;
            router.push(`/services/admin/organization/${routeCode}`);
        },
        [router, flatUnits]
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