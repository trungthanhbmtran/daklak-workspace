import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import UnitJobTemplatesClient from "./client";
import { serverFetch } from "@/lib/serverFetch";
import { CATEGORY_KEYS } from "@/features/system-admin/categories/keys";
import { UNIT_TYPE_CATEGORY_GROUP } from "@/features/system-admin/organization/constants/category-groups";
import { connection } from "next/server";
import type { ApiResponse } from "@/lib/api.types";
import type { CategoryItem } from "@/features/system-admin/categories/types";

type JobTitles = {
  partyTitles?: unknown[];
  govTitles?: unknown[];
  allTitles?: unknown[];
};

export const metadata = {
  title: "Phân loại chức danh theo Đơn vị | Daklak Workspace",
  description: "Thiết lập danh sách chức danh chuẩn (Job Titles) được phép sử dụng cho từng Loại đơn vị (Unit Types).",
};

export default async function UnitJobTemplatesPage() {
  await connection();
  const queryClient = new QueryClient();

  await Promise.all([
    // 1. Fetch categories
    queryClient.prefetchQuery({
      queryKey: [CATEGORY_KEYS.all, "group", UNIT_TYPE_CATEGORY_GROUP, undefined],
      queryFn: async () => {
        const res = await serverFetch<ApiResponse<CategoryItem[]>>(`/categories?group=${UNIT_TYPE_CATEGORY_GROUP}`);
        return res?.data ?? [];
      },
    }),

    // 2. Fetch Unit Types
    queryClient.prefetchQuery({
      queryKey: ["admin", "unit-types"],
      queryFn: async () => {
        const res = await serverFetch<ApiResponse<unknown[]>>("/organizations/unit-types");
        return { data: res?.data ?? [] };
      },
    }),

    // 3. Fetch Job Title Groups
    queryClient.prefetchQuery({
      queryKey: ["admin", "job-title-groups"],
      queryFn: async () => {
        const res = await serverFetch<ApiResponse<CategoryItem[] | { data: CategoryItem[] }>>("/categories?group=JOB_TITLE_GROUP&limit=100");
        const data = res?.data;
        return { data: Array.isArray(data) ? data : data?.data ?? [] };
      },
    }),

    // 4. Fetch All Job Titles
    queryClient.prefetchQuery({
      queryKey: ["admin", "all-job-titles"],
      queryFn: async () => {
        const res = await serverFetch<JobTitles & { data?: JobTitles }>("/organizations/job-titles");
        const data = res?.data ?? res;
        return {
          data: {
            partyTitles: data?.partyTitles || [],
            govTitles: data?.govTitles || [],
            allTitles: data?.allTitles || [],
          }
        };
      },
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UnitJobTemplatesClient />
    </HydrationBoundary>
  );
}
