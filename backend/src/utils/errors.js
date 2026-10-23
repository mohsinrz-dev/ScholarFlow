export class AppError extends Error {
  constructor(code, message, statusCode = 400) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export const Errors = {
  unauthorized: () => new AppError('UNAUTHORIZED', 'Authentication required.', 401),
  forbidden: () => new AppError('FORBIDDEN', 'You do not have permission to access this resource.', 403),
  notFound: (resource = 'Resource') => new AppError('NOT_FOUND', `${resource} not found.`, 404),
  conflict: (msg = 'A conflict occurred.') => new AppError('CONFLICT', msg, 409),
  validation: (msg = 'Validation failed.') => new AppError('VALIDATION_ERROR', msg, 422),
  aiNotConfigured: () =>
    new AppError('AI_SERVICE_NOT_CONFIGURED', 'AI service is not configured. Please contact the administrator.', 503),
  aiUnavailable: () =>
    new AppError('AI_SERVICE_UNAVAILABLE', 'AI service is temporarily unavailable. Please try again later.', 503),
  rateLimited: () => new AppError('RATE_LIMITED', 'Too many requests. Please slow down.', 429),
  accountDeleted: () =>
    new AppError('ACCOUNT_DELETED', 'This account has been scheduled for deletion. Contact support to recover it.', 403),
  internal: () => new AppError('INTERNAL_ERROR', 'An unexpected error occurred.', 500),
};
