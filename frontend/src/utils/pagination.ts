import type { PaginatedData } from "../types";

export const normalizePaginatedData = <T>(
  data: PaginatedData<T> | T[],
): PaginatedData<T> => {
  if (!Array.isArray(data)) return data;

  return {
    items: data,
    pagination: {
      page: 1,
      limit: data.length || 10,
      totalItems: data.length,
      totalPages: data.length ? 1 : 0,
    },
  };
};
