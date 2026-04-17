/**
 * Standardized API Response Helpers
 * 
 * Use these to ensure consistent response format across all controllers.
 */

export const sendSuccess = (res, data, statusCode = 200) => {
  res.status(statusCode).json({ success: true, data });
};

export const sendError = (res, message, statusCode = 500) => {
  res.status(statusCode).json({ success: false, message });
};

export const sendPaginated = (res, data, total, pagination) => {
  res.status(200).json({
    success: true,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: Math.ceil(total / pagination.limit),
    },
  });
};
