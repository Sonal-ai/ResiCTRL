/**
 * Centralized Error Handler
 * 
 * Handles all operational and unexpected errors consistently:
 * - Prisma errors (unique constraint, not found, validation)
 * - Zod validation errors
 * - JWT errors  
 * - Custom AppError instances
 * - Unknown errors (logged, sanitized for client)
 */

/**
 * Custom application error with status code.
 * Use for intentional error throwing in controllers/services.
 */
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

/**
 * Maps Prisma error codes to user-friendly messages.
 */
function handlePrismaError(err) {
  switch (err.code) {
    case 'P2002': {
      const field = err.meta?.target?.[0] || 'field';
      return { statusCode: 409, message: `A record with this ${field} already exists` };
    }
    case 'P2025':
      return { statusCode: 404, message: 'Record not found' };
    case 'P2003':
      return { statusCode: 400, message: 'Invalid reference: related record does not exist' };
    default:
      return { statusCode: 500, message: 'Database error' };
  }
}

/**
 * Global error handler middleware — mount as the LAST middleware in app.js.
 */
export const errorHandler = (err, req, res, next) => {
  // Default values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // ── Prisma errors ──
  if (err.code && err.code.startsWith('P2')) {
    const prismaErr = handlePrismaError(err);
    statusCode = prismaErr.statusCode;
    message = prismaErr.message;
  }

  // ── Zod validation errors ──
  if (err.name === 'ZodError') {
    statusCode = 400;
    message = err.issues?.[0]?.message || 'Validation failed';
  }

  // ── JWT errors ──
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // ── Multer errors (file upload) ──
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413;
    message = 'File too large. Maximum size is 5MB';
  }
  if (err.code === 'INVALID_FILE_TYPE') {
    statusCode = 400;
    message = err.message || 'Invalid file type';
  }

  // Log full error in development, minimal in production
  if (process.env.NODE_ENV === 'development') {
    console.error('─── ERROR ───');
    console.error(err.stack || err);
    console.error('─────────────');
  } else {
    // In production, only log non-operational (unexpected) errors fully
    if (!err.isOperational) {
      console.error('UNEXPECTED ERROR:', err);
    }
  }

  // Never leak stack traces or internal details in production
  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 && process.env.NODE_ENV === 'production'
      ? 'Internal Server Error'
      : message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
