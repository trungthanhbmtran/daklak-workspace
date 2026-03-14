"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { hrmApi } from "../api";
import { hrmKeys } from "../keys";
import type { HrmEmployeesListParams } from "../types";

/**
 * Danh sách nhân viên có phân trang (trang HRM).
 */
export function useHrmEmployeesList(params: HrmEmployeesListParams = {}) {
  const { page = 1, pageSize = 10, keyword, departmentId, jobTitleId, status } = params;
  return useQuery({
    queryKey: hrmKeys.list({ page, pageSize, keyword, departmentId, jobTitleId, status }),
    queryFn: () => hrmApi.list({ page, pageSize, keyword, departmentId, jobTitleId, status }),
  });
}

/**
 * Tìm kiếm nhân viên theo keyword (cho tra cứu khi tạo user).
 * Chỉ gọi API khi keyword.length >= minChars.
 */
export function useHrmEmployeesSearch(keyword: string, options?: { enabled?: boolean; minChars?: number }) {
  const { enabled = true, minChars = 2 } = options ?? {};
  const shouldRun = enabled && keyword.trim().length >= minChars;
  return useQuery({
    queryKey: hrmKeys.search(keyword.trim()),
    queryFn: () => hrmApi.search(keyword.trim()),
    enabled: shouldRun,
    staleTime: 30_000,
  });
}

/**
 * Chi tiết một nhân viên.
 */
export function useHrmEmployee(id: number | null, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: hrmKeys.detail(id ?? 0),
    queryFn: () => hrmApi.getOne(id!),
    enabled: (options?.enabled ?? true) && id != null && id > 0,
  });
}

/**
 * Invalidate cache danh sách / tìm kiếm nhân viên (sau khi tạo/cập nhật user từ HRM).
 */
export function useInvalidateHrmEmployees() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: hrmKeys.employees() });
  };
}
