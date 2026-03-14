import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { userApi } from "../api";
import type { UserCreatePayload, UserItem } from "../types";
import { USER_KEYS } from "../keys";

export function useUserList() {
  return useQuery({
    queryKey: USER_KEYS.list(),
    queryFn: userApi.list,
    staleTime: 2 * 60 * 1000,
  });
}

export function useUserDetail(id: number | null) {
  return useQuery({
    queryKey: USER_KEYS.detail(id!),
    queryFn: () => userApi.getOne(id!),
    enabled: id != null && id > 0,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UserCreatePayload) => userApi.create(payload),
    onSuccess: (newUser) => {
      queryClient.setQueryData<UserItem[]>(USER_KEYS.list(), (old) =>
        old ? [...old, newUser] : [newUser]
      );
      queryClient.invalidateQueries({ queryKey: USER_KEYS.list() });
      toast.success("Đã thêm người dùng.");
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string }; message?: string } })?.response?.data?.message
        ?? (err as Error)?.message
        ?? "Không thể thêm người dùng.";
      toast.error(msg);
    },
  });
}

export function useSetUserActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) => userApi.setActive(id, isActive),
    onSuccess: (res, { id }) => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.list() });
      queryClient.invalidateQueries({ queryKey: USER_KEYS.detail(id) });
      toast.success(res?.message ?? (res?.success ? "Đã cập nhật trạng thái tài khoản." : "Thất bại."));
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string }; message?: string } })?.response?.data?.message
        ?? (err as Error)?.message
        ?? "Không thể cập nhật trạng thái.";
      toast.error(msg);
    },
  });
}

export function useAssignRoles() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, roleIds }: { id: number; roleIds: number[] }) => userApi.assignRoles(id, roleIds),
    onSuccess: async (res, { id }) => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.list() });
      queryClient.invalidateQueries({ queryKey: USER_KEYS.detail(id) });
      await queryClient.refetchQueries({ queryKey: USER_KEYS.detail(id) });
      toast.success(res?.message ?? "Đã cập nhật vai trò.");
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string }; message?: string } })?.response?.data?.message
        ?? (err as Error)?.message
        ?? "Không thể cập nhật vai trò.";
      toast.error(msg);
    },
  });
}
