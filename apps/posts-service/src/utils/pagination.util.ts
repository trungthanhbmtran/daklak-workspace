export interface PaginationResult<T> {
  data: T[];
  meta: {
    pagination: {
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
      hasNext?: boolean;
      hasPrev?: boolean;
    };
  };
}
