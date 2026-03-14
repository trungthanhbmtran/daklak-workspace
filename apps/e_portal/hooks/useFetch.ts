'use client'

import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { AxiosResponse } from 'axios'
import axiosInstance from '@/lib/axiosInstance'

// ===== Pagination =====
export interface Pagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

// ===== Meta =====
export interface Meta<F = any> {
  pagination?: Pagination
  filter?: F
}

// ===== API response =====
export interface ApiResponse<T = any, F = any> {
  success: boolean
  message?: string
  data: T
  meta?: Meta<F>
  errors?: any
}

// ===== Hook options =====
export interface UseFetchOptions<TData, TFilter = any>
  extends Omit<
    UseQueryOptions<AxiosResponse<ApiResponse<TData, TFilter>>, any, AxiosResponse<ApiResponse<TData, TFilter>>>,
    'queryKey' | 'queryFn'
  > {
  params?: Record<string, any>
}

/**
 * Hook fetch gọn cho React Query
 * Trả nguyên AxiosResponse để bạn có thể dùng res.data, res.status, res.headers...
 */
export const useFetch = <TData = any, TFilter = any>(
  url: string,
  options: UseFetchOptions<TData, TFilter> = {}
) => {
  const { params, ...queryOptions } = options

  return useQuery<AxiosResponse<ApiResponse<TData, TFilter>>>({
    queryKey: [url, params],
    queryFn: async () => {
      return axiosInstance.get<ApiResponse<TData, TFilter>>(url, { params })
    },
    ...queryOptions,
  })
}
