const buildPaginationMeta = (
  page: number,
  limit: number,
  totalItems: number,
) => ({
  page,
  limit,
  totalItems,
  totalPages: Math.ceil(totalItems / limit),
});

module.exports = { buildPaginationMeta };
