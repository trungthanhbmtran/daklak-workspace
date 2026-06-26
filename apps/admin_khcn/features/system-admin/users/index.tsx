"use client";
import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Search } from "@/components/ui/search";
import {
  useUserList,
  useUserDetail,
  useSetUserActive,
  useAssignRoles,
} from "./hooks/useUserApi";
import { useUserUI } from "./hooks/useUserUI";
import { UserTable } from "./components/UserTable";
import { CreateUserModal } from "./components/CreateUserModal";
import { UserDetailSheet } from "./components/UserDetailCard";

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export function UserClient() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const limit = 10;

  // Gọi API danh sách (đã phân trang ở server)
  const { data: listResponse, isLoading, isError } = useUserList({
    page,
    limit,
    search: debouncedSearch
  });
  
  const serverData = listResponse?.data ?? [];
  const total = listResponse?.meta?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  // Reset page khi search thay đổi
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const ui = useUserUI();
  const { data: detailUser, isLoading: isLoadingDetail } = useUserDetail(ui.state.detailId);
  const setActiveMutation = useSetUserActive();
  const assignRolesMutation = useAssignRoles();

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 bg-card p-4 rounded-lg border shadow-sm">
        <Search
          placeholder="Tìm email, tên đăng nhập, họ tên..."
          className="w-full sm:w-80"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button
          className="shrink-0 w-full sm:w-auto"
          onClick={() => ui.setters.setIsCreateOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> Thêm người dùng
        </Button>
      </div>

      {/* Bảng + phân trang */}
      <UserTable
        isLoading={isLoading}
        isError={isError}
        data={serverData}
        total={total}
        page={page}
        totalPages={totalPages}
        pageSize={limit}
        onPageChange={setPage}
        onViewDetail={(item) => ui.setters.setDetailId(item.id)}
      />

      {/* Sheet chi tiết – policies lazy load bên trong */}
      <UserDetailSheet
        isOpen={ui.state.detailId !== null}
        user={
          ui.state.detailId
            ? (detailUser ?? serverData.find((u) => u.id === ui.state.detailId)) ?? null
            : null
        }
        isLoading={ui.state.detailId != null && isLoadingDetail}
        onClose={() => ui.setters.setDetailId(null)}
        onSetActive={(id, isActive) => setActiveMutation.mutate({ id, isActive })}
        isSettingActive={setActiveMutation.isPending}
        onAssignRoles={(payload) => assignRolesMutation.mutate(payload)}
        isAssigningRoles={assignRolesMutation.isPending}
      />

      <CreateUserModal
        isOpen={ui.state.isCreateOpen}
        onClose={() => ui.setters.setIsCreateOpen(false)}
      />
    </div>
  );
}
