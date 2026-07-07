export interface PaginationResult<T> {
  data: T[];
  meta: {
    pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Common pagination function using array slicing (between start and end indices)
 * @param items Array of all items
 * @param page Current page number (1-based)
 * @param limit Items per page (0 means no limit)
 * @returns Paginated data and pagination metadata
 */
export function paginateArray<T>(items: T[], page: number, limit: number): PaginationResult<T> {
  const total = items.length;
  
  if (limit <= 0) {
    return {
      data: items,
      meta: {
        pagination: {
          total,
          page: 1,
          pageSize: total > 0 ? total : 1, // Avoid pageSize 0
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      }
    };
  }

  const pageSize = limit;
  const totalPages = Math.ceil(total / pageSize) || 1;
  const validPage = Math.max(1, Math.min(page, totalPages));

  const start = (validPage - 1) * pageSize;
  const end = validPage * pageSize;
  
  const data = items.slice(start, end);

  return {
    data,
    meta: {
      pagination: {
        total,
        page: validPage,
        pageSize,
        totalPages,
        hasNext: validPage < totalPages,
        hasPrev: validPage > 1,
      },
    }
  };
}
