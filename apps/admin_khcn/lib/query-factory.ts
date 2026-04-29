import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * Standard pagination response structure
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    pagination: {
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    };
  };
}

/**
 * Factory for creating standardized CRUD hooks
 */
export const createCrudHooks = <T, TCreate = any, TUpdate = any>(
  resourceKey: string,
  api: {
    list: (params: any) => Promise<PaginatedResponse<T>>;
    get: (id: string) => Promise<T>;
    create: (data: TCreate) => Promise<any>;
    update: (id: string, data: TUpdate) => Promise<any>;
    delete: (id: string) => Promise<any>;
  }
) => {
  return {
    useList: (params: any = {}) => {
      return useQuery({
        queryKey: [resourceKey, 'list', params],
        queryFn: () => api.list(params),
      });
    },

    useDetail: (id: string | null, options?: Partial<UseQueryOptions<T>>) => {
      return useQuery({
        queryKey: [resourceKey, 'detail', id],
        queryFn: () => api.get(id!),
        enabled: !!id && (options?.enabled ?? true),
        ...options,
      });
    },

    useCreate: (options?: { onSuccess?: () => void }) => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: api.create,
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: [resourceKey, 'list'] });
          options?.onSuccess?.();
          toast.success('Dữ liệu đã được tạo thành công!');
        },
      });
    },

    useUpdate: (options?: { onSuccess?: () => void }) => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: ({ id, data }: { id: string; data: TUpdate }) => api.update(id, data),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: [resourceKey] });
          options?.onSuccess?.();
          toast.success('Cập nhật dữ liệu thành công!');
        },
      });
    },

    useDelete: (options?: { onSuccess?: () => void }) => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: api.delete,
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: [resourceKey] });
          options?.onSuccess?.();
          toast.success('Đã xóa dữ liệu thành công!');
        },
      });
    },
  };
};
