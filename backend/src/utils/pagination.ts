interface PaginationInput {
  page?: string;
  limit?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

const toPositiveInteger = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

export const getPagination = (query: PaginationInput) => {
  const page = toPositiveInteger(query.page, 1);
  const limit = Math.min(toPositiveInteger(query.limit, 10), 100);

  return { page, limit, skip: (page - 1) * limit };
};

export const buildPaginationMeta = (
  page: number,
  limit: number,
  totalItems: number,
): PaginationMeta => ({
  page,
  limit,
  totalItems,
  totalPages: Math.ceil(totalItems / limit),
});
