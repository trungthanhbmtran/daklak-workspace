import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { menuApi } from "../api";
import { menuKeys } from "../keys";

const getErrorMessage = (err: unknown): string => {
  const ax = err as { response?: { data?: { message?: string | string[] } }; message?: string };
  const msg = ax?.response?.data?.message;
  if (Array.isArray(msg)) return msg[0] ?? "Lỗi không xác định";
  if (typeof msg === "string") return msg;
  return ax?.message ?? "Lỗi không xác định";
};

export function useMenuSaveMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: menuApi.saveMenu,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menuKeys.all });
      toast.success("Lưu cấu hình menu thành công!");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useMenuDeleteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: menuApi.deleteMenu,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menuKeys.all });
      toast.success("Đã xóa menu thành công!");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}
