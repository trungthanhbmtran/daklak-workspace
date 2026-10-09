import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiManagementApi, ApiConnection } from "../api";
import { toast } from "sonner";

export const useConnections = (search?: string) => {
  return useQuery({
    queryKey: ['api-connections', search],
    queryFn: () => apiManagementApi.getConnections({ search }),
  });
};

export const useCreateConnection = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ApiConnection>) => apiManagementApi.createConnection(data),
    onSuccess: () => {
      toast.success("Tạo kết nối thành công");
      qc.invalidateQueries({ queryKey: ['api-connections'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Lỗi khi tạo kết nối");
    }
  });
};

export const useUpdateConnection = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ApiConnection> & { expectedVersion?: number } }) => apiManagementApi.updateConnection(id, data),
    onSuccess: () => {
      toast.success("Cập nhật kết nối thành công");
      qc.invalidateQueries({ queryKey: ['api-connections'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Lỗi khi cập nhật");
    }
  });
};

export const useDeleteConnection = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiManagementApi.deleteConnection(id),
    onSuccess: () => {
      toast.success("Xóa kết nối thành công");
      qc.invalidateQueries({ queryKey: ['api-connections'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Lỗi khi xóa kết nối");
    }
  });
};


export const useDisableConnection = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, expectedVersion }: { id: string, expectedVersion: number }) => apiManagementApi.disableConnection(id, expectedVersion),
    onSuccess: () => {
      toast.success("Đã vô hiệu hoá kết nối khẩn cấp");
      qc.invalidateQueries({ queryKey: ['api-connections'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Lỗi khi vô hiệu hoá")
  });
};

export const usePublishRevision = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiManagementApi.publishRevision(),
    onSuccess: () => {
      toast.success("Đã publish phiên bản mới thành công!");
      qc.invalidateQueries({ queryKey: ['api-connections'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Lỗi khi publish. Có thể do chưa có thay đổi nào mới.")
  });
};

export const useUploadImport = () => {
  return useMutation({
    mutationFn: ({ file, targetConnectionId }: { file: File, targetConnectionId?: string }) => 
      apiManagementApi.uploadImport(file, targetConnectionId),
    onError: (err: any) => toast.error(err?.response?.data?.message || "Lỗi khi upload file Swagger")
  });
};

export const useCommitImport = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, resolutions }: { sessionId: string, resolutions: any[] }) => 
      apiManagementApi.commitImport(sessionId, resolutions),
    onSuccess: () => {
      toast.success("Import API thành công!");
      qc.invalidateQueries({ queryKey: ['api-connections'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Lỗi khi commit import")
  });
};
