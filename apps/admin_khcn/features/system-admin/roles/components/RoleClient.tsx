"use client";

import { useRoleLogic } from "../hooks/useRoleLogic";
import { RoleSidebar } from "./RoleSidebar";
import { RoleForm } from "./RoleForm";

export function RoleClient() {
  const state = useRoleLogic();

  if (state.isLoading) return <div className="h-full flex items-center justify-center animate-pulse">Đang tải cấu hình PBAC...</div>;

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start h-[calc(100vh-120px)] overflow-hidden">
      <RoleSidebar 
        roles={state.roles}
        searchTerm={state.searchTerm} setSearchTerm={state.setSearchTerm}
        selectedRoleId={state.selectedRole?.id}
        onSelect={state.handleSelectRole}
        onAdd={state.handleAddRole}
      />
      <RoleForm 
        selectedRole={state.selectedRole} createMode={state.createMode}
        permissions={state.permissions}
        onSave={state.handleSave} onDelete={state.handleDelete}
        onCancel={state.handleCancel}
        isSaving={state.isSaving} isDeleting={state.isDeleting}
      />
    </div>
  );
}
