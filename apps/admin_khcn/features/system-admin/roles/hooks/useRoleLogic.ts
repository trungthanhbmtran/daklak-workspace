import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { roleApi } from "../api";
import { roleKeys } from "../keys";
import { Role } from "../types";

const PAGE_SIZE = 10;

export function useRoleLogic() {
  const queryClient = useQueryClient();

  // 1. Danh sách vai trò — luôn fetch (nhẹ)
  const { data: roles = [], isLoading: isLoadingRoles } = useQuery({
    queryKey: roleKeys.lists(),
    queryFn: () => roleApi.getRoles(),
    staleTime: 2 * 60 * 1000,
  });

  const searchParams = useSearchParams();
  const searchTerm = searchParams.get('search') || "";
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [createMode, setCreateMode] = useState<boolean>(false);
  const [page, setPage] = useState(1);

  // Lọc theo tìm kiếm
  const filteredRoles = useMemo(() => roles.filter((r: Role) =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.code.toLowerCase().includes(searchTerm.toLowerCase())
  ), [roles, searchTerm]);

  // Phân trang
  const totalPages = Math.max(1, Math.ceil(filteredRoles.length / PAGE_SIZE));
  const pagedRoles = useMemo(() => {
    const safePage = page > totalPages ? 1 : page;
    return filteredRoles.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  }, [filteredRoles, page, totalPages]);

  // 2. Permission matrix — lazy: chỉ fetch khi đang chọn role hoặc createMode
  const needPerms = !!selectedRoleId || createMode;
  const { data: permissions = [], isLoading: isLoadingPerms } = useQuery({
    queryKey: roleKeys.permissions(),
    queryFn: () => roleApi.getPermissionMatrix(),
    enabled: needPerms,
    staleTime: 5 * 60 * 1000,
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

  // Chi tiết vai trò (kèm policies) — chỉ fetch khi chọn
  const { data: roleDetail } = useQuery({
    queryKey: [...roleKeys.lists(), "detail", selectedRoleId],
    queryFn: () => roleApi.getRoleById(selectedRoleId!),
    enabled: !!selectedRoleId && !createMode,
    staleTime: 60 * 1000,
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
    const payload = !createMode && selectedRole?.id
      ? { ...data, id: selectedRole.id }
      : data;
    saveMutation.mutate(payload);
  };

  const handleDelete = () => {
    if (selectedRole) deleteMutation.mutate(selectedRole.id);
  };

  const handleCancel = () => {
    setCreateMode(false);
    setSelectedRoleId(null);
  };

  return {
    roles: pagedRoles,
    allRolesCount: filteredRoles.length,
    page,
    setPage,
    totalPages,
    pageSize: PAGE_SIZE,
    permissions,
    isLoading: isLoadingRoles,
    isLoadingPerms: isLoadingPerms && needPerms,
    searchTerm,
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
