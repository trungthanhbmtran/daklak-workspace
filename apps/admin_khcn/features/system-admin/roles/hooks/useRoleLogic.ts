import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { roleApi } from "../api";
import { roleKeys } from "../keys";
import { Role } from "../types";

export function useRoleLogic() {
  const queryClient = useQueryClient();

  // 1. Danh sách vai trò — GET /roles
  const { data: roles = [], isLoading: isLoadingRoles } = useQuery({
    queryKey: roleKeys.lists(),
    queryFn: () => roleApi.getRoles(),
  });

  // 2. Ma trận quyền (Resource -> Permissions) — GET /roles/permissions/matrix
  const { data: permissions = [], isLoading: isLoadingPerms } = useQuery({
    queryKey: roleKeys.permissions(),
    queryFn: () => roleApi.getPermissionMatrix(),
  });

  const saveMutation = useMutation({
    mutationFn: roleApi.saveRole,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
      if (variables.id) queryClient.invalidateQueries({ queryKey: [...roleKeys.lists(), "detail", variables.id] });
      toast.success("Đã lưu cấu hình vai trò!");
      setCreateMode(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: roleApi.deleteRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
      toast.success("Đã xóa vai trò!");
      setSelectedRoleId(null);
    },
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [createMode, setCreateMode] = useState<boolean>(false);

  // Chi tiết vai trò (kèm permissionIds) — GET /roles/:id khi chọn từ list
  const { data: roleDetail } = useQuery({
    queryKey: [...roleKeys.lists(), "detail", selectedRoleId],
    queryFn: () => roleApi.getRoleById(selectedRoleId!),
    enabled: !!selectedRoleId && !createMode,
  });

  const selectedRole = roleDetail ?? (selectedRoleId ? roles.find((r: Role) => r.id === selectedRoleId) ?? null : null);

  const handleSelectRole = (role: Role) => {
    setCreateMode(false);
    setSelectedRoleId(role.id);
  };

  const handleAddRole = () => {
    setCreateMode(true);
    setSelectedRoleId(null);
  };

  const handleSave = (data: Partial<Role>) => {
    // Khi đang sửa vai trò có sẵn, bắt buộc gửi id để gateway gọi PUT thay vì POST (tránh lỗi "Mã Role đã tồn tại")
    const payload = !createMode && selectedRole?.id
      ? { ...data, id: selectedRole.id }
      : data;
    saveMutation.mutate(payload);
  };
  const handleDelete = () => {
    if (selectedRole && confirm(`Xóa vai trò: ${selectedRole.name}?`)) {
      deleteMutation.mutate(selectedRole.id);
    }
  };

  // Lọc vai trò theo tìm kiếm
  const filteredRoles = roles.filter((r: Role) => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCancel = () => {
    setCreateMode(false);
    setSelectedRoleId(null);
  };

  return {
    roles: filteredRoles,
    permissions,
    isLoading: isLoadingRoles || isLoadingPerms,
    searchTerm,
    setSearchTerm,
    selectedRole,
    handleSelectRole,
    createMode,
    handleAddRole,
    setCreateMode,
    handleCancel,
    handleSave,
    handleDelete,
    isSaving: saveMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
