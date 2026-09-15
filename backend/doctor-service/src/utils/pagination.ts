type PaginationMeta = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
};

const getPagination = (page = 1, limit = 10) => ({
  page,
  limit,
  skip: (page - 1) * limit,
});

const buildPaginationMeta = (
  page: number,
  limit: number,
  totalItems: number,
): PaginationMeta => ({
  page,
  limit,
  totalItems,
  totalPages: Math.ceil(totalItems / limit),
});

module.exports = { getPagination, buildPaginationMeta };
