"use client";

import { Loader2 } from "lucide-react";
import { useRoleLogic } from "../hooks/useRoleLogic";
import { RoleSidebar } from "./RoleSidebar";
import { RoleForm } from "./RoleForm";

export function RoleClient() {
  const state = useRoleLogic();

  if (state.isLoading) {
    return (
      <div className="h-[calc(100vh-120px)] flex items-center justify-center text-muted-foreground gap-2">
        <Loader2 className="h-5 w-5 animate-spin" /> Đang tải danh sách vai trò...
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start h-[calc(100vh-120px)] overflow-hidden">
      <RoleSidebar
        roles={state.roles}
        total={state.allRolesCount}
        page={state.page}
        totalPages={state.totalPages}
        pageSize={state.pageSize}
        onPageChange={state.setPage}
        selectedRoleId={state.selectedRole?.id}
        onSelect={state.handleSelectRole}
        onAdd={state.handleAddRole}
      />
      <RoleForm
        selectedRole={state.selectedRole}
        createMode={state.createMode}
        permissions={state.permissions}
        isLoadingPerms={state.isLoadingPerms}
        onSave={state.handleSave}
        onDelete={state.handleDelete}
        onCancel={state.handleCancel}
        isSaving={state.isSaving}
        isDeleting={state.isDeleting}
      />
    </div>
  );
}
