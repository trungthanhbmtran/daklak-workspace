"use client";
import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Search } from "@/components/ui/search";
import {
  useUserList,
  useUserDetail,
  useSetUserActive,
  useDeleteUser,
} from "./hooks/useUserApi";
import { useUserUI } from "./hooks/useUserUI";
import { UserTable } from "./components/UserTable";
import dynamic from "next/dynamic";
import type { UserItem } from "./types";

const CreateUserModal = dynamic(() => import("./components/CreateUserModal").then(mod => mod.CreateUserModal), {
  ssr: false,
});

const EditUserModal = dynamic(() => import("./components/EditUserModal").then(mod => mod.EditUserModal), {
  ssr: false,
});

const UserDetailSheet = dynamic(() => import("./components/UserDetailCard").then(mod => mod.UserDetailSheet), {
  ssr: false,
});

export function UserClient() {
  const ui = useUserUI();
  const [page, setPage] = useState(1);
  const limit = 10;
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);

  // Gọi API danh sách (đã phân trang ở server)
  const { data: listResponse, isLoading, isError } = useUserList({
    page,
    limit,
    search: ui.state.searchTerm
  });

  const serverData = listResponse?.data ?? [];
  const total = listResponse?.meta?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  // Reset page khi search thay đổi
   
  useEffect(() => {
    setPage(1);
  }, [ui.state.searchTerm]);
  
  const { data: detailUser, isLoading: isLoadingDetail } = useUserDetail(ui.state.detailId);
  const setActiveMutation = useSetUserActive();
  const deleteUserMutation = useDeleteUser();

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 bg-card p-4 rounded-lg border shadow-sm">
        <Search
          placeholder="Tìm email, tên đăng nhập, họ tên..."
          className="w-full sm:w-80"
        />
        <Button
          className="shrink-0 w-full sm:w-auto"
          onClick={() => ui.setters.setIsCreateOpen(true)}
        >
          <Plus className="h-4 w-4" /> Thêm người dùng
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
        onEdit={(item) => setEditingUser(item)}
        onDelete={(item) => {
          if (confirm(`Bạn có chắc chắn muốn xóa người dùng ${item.fullName || item.email}?`)) {
            deleteUserMutation.mutate(item.id);
          }
        }}
      />

      {/* Sheet chi tiết – policies lazy load bên trong */}
      {ui.state.detailId !== null && (
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
                />
          )}

      {ui.state.isCreateOpen && (
          <CreateUserModal
                  isOpen={ui.state.isCreateOpen}
                  onClose={() => ui.setters.setIsCreateOpen(false)}
                />
          )}

      {editingUser !== null && (
        <EditUserModal
          isOpen={editingUser !== null}
          user={editingUser}
          onClose={() => setEditingUser(null)}
        />
      )}
    </div>
  );
}
