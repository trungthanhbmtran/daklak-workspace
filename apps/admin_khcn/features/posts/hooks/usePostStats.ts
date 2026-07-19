/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery } from "@tanstack/react-query";
import { postsApi } from "../api";

export interface PostStats {
  total: number;
  published: number;
  draft: number;
  pending: number;
  reviewing: number;
  rejected: number;
  totalViews: number;
}

/**
 * Hook lấy thống kê bài viết từ backend endpoint /posts/stats.
 * Backend tính sẵn bằng COUNT queries parallel — loại bỏ pattern
 * client fetch 1000 records rồi đếm thủ công.
 */
export function usePostStats(params?: { categoryId?: string; authorId?: string }) {
  return useQuery<PostStats>({
    queryKey: ["posts-stats", params],
    queryFn: async () => {
      const res = await postsApi.getPostStats(params);
      // Interceptor đã bóc Axios wrapper → res là ApiResponse
      const data = (res as any)?.data ?? res;
      return {
        total:      Number(data?.total      ?? 0),
        published:  Number(data?.published  ?? 0),
        draft:      Number(data?.draft      ?? 0),
        pending:    Number(data?.pending    ?? 0),
        reviewing:  Number(data?.reviewing  ?? 0),
        rejected:   Number(data?.rejected   ?? 0),
        totalViews: Number(data?.totalViews ?? 0),
      };
    },
    staleTime: 2 * 60_000,   // cache 2 phút
    gcTime:    10 * 60_000,  // giữ 10 phút sau unmount
    placeholderData: {
      total: 0, published: 0, draft: 0, pending: 0,
      reviewing: 0, rejected: 0, totalViews: 0,
    },
  });
}
