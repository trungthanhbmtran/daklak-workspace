import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { organizationApi } from "../api";
import { organizationQueryKeys } from "../constants/queryKeys";
import type { CreateUnitPayload, UpdateUnitPayload } from "../types";

function extractErrorMessage(err: unknown, fallback: string): string {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
    (err as Error)?.message ??
    fallback
  );
}

export function useOrganizationCreateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUnitPayload) =>
      organizationApi.createUnit({
        ...payload,
        parentId: payload.parentId ?? undefined,
        domainIds: payload.domainIds?.length ? payload.domainIds : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationQueryKeys.tree() });
      toast.success("Đã thêm đơn vị tổ chức.");
    },
    onError: (err) => toast.error(extractErrorMessage(err, "Không thể tạo đơn vị.")),
  });
}

export function useOrganizationUpdateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateUnitPayload }) =>
      organizationApi.updateUnit(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationQueryKeys.tree() });
      toast.success("Đã cập nhật thông tin đơn vị.");
    },
    onError: (err) => toast.error(extractErrorMessage(err, "Không thể cập nhật đơn vị.")),
  });
}

export function useOrganizationUpdateScopeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: { domainIds?: number[] } }) =>
      organizationApi.updateScope(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationQueryKeys.tree() });
      toast.success("Đã cập nhật phạm vi phụ trách.");
    },
    onError: (err) => toast.error(extractErrorMessage(err, "Không thể cập nhật phạm vi.")),
  });
}

export function useOrganizationDeleteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => organizationApi.deleteUnit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationQueryKeys.tree() });
      toast.success("Đã xóa đơn vị tổ chức.");
    },
    onError: (err) => toast.error(extractErrorMessage(err, "Không thể xóa đơn vị.")),
  });
}
