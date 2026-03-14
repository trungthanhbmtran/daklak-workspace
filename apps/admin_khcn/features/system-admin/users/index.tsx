"use client";

import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUserList, useUserDetail, useSetUserActive, useAssignRoles } from "./hooks/useUserApi";
import { useUserUI } from "./hooks/useUserUI";
import { UserTable } from "./components/UserTable";
import { CreateUserModal } from "./components/CreateUserModal";
// Thay thế UserDetailCard bằng UserDetailSheet
import { UserDetailSheet } from "./components/UserDetailCard"; 

export function UserClient() {
  // GIỮ NGUYÊN TOÀN BỘ LOGIC API VÀ STATE CỦA BẠN
  const { data: serverData = [], isLoading, isError } = useUserList();
  const ui = useUserUI(serverData);
  const { data: detailUser, isLoading: isLoadingDetail } = useUserDetail(ui.state.detailId);
  const setActiveMutation = useSetUserActive();
  const assignRolesMutation = useAssignRoles();

  return (
    // Đổi layout thành flex-col để Table chiếm 100% chiều ngang màn hình
    <div className="flex flex-col gap-6">
      <div className="flex-1 space-y-4">
        
        {/* Thanh công cụ tìm kiếm và nút Thêm */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-4 rounded-lg border shadow-sm">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm email, tên đăng nhập, họ tên..."
              className="pl-8 bg-background"
              value={ui.state.searchTerm}
              onChange={(e) => ui.setters.setSearchTerm(e.target.value)}
            />
          </div>
          <Button className="shrink-0 w-full sm:w-auto" onClick={() => ui.setters.setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Thêm người dùng
          </Button>
        </div>

        {/* Bảng dữ liệu chiếm full width */}
        <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
          <UserTable
            isLoading={isLoading}
            isError={isError}
            data={ui.derived.filteredData}
            onViewDetail={(item) => ui.setters.setDetailId(item.id)}
          />
        </div>
      </div>

      {/* Hiển thị ngăn kéo trượt từ phải sang (Sheet) dựa trên logic state cũ của bạn */}
      <UserDetailSheet
        isOpen={ui.state.detailId !== null}
        user={ui.state.detailId ? (detailUser ?? serverData.find((u) => u.id === ui.state.detailId)) ?? null : null}
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
