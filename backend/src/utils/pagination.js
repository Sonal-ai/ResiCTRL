/**
 * Pagination Utility
 * 
 * Extracts pagination params from request query, enforces safe defaults.
 * Usage: const { skip, take, page, limit } = parsePagination(req);
 */
export const parsePagination = (req) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
  const skip = (page - 1) * limit;
  return { skip, take: limit, page, limit };
};

/**
 * Wraps paginated query results in a standard response format.
 */
export const paginatedResponse = (data, total, { page, limit }) => ({
  data,
  pagination: {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  },
});
