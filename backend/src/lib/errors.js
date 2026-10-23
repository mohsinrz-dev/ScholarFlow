import { AppError } from '../utils/errors.js';

export class ApiError extends AppError {
  constructor(status, code, message, details) {
    super(code, message, status);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export function fromSupabaseError(error) {
  const message = error?.message ?? 'Database request failed.';
  if (error?.code === 'PGRST116' || error?.code === 'PGRST204') {
    return new ApiError(404, 'NOT_FOUND', 'The requested resource was not found.');
  }
  if (error?.code === '23505') {
    return new ApiError(409, 'CONFLICT', 'A record with those details already exists.');
  }
  if (error?.code === '23503') {
    return new ApiError(400, 'INVALID_REFERENCE', 'A referenced record does not exist.');
  }
  if (error?.code === '23514' || error?.code === '22P02') {
    return new ApiError(400, 'INVALID_DATA', 'One or more fields contain invalid data.');
  }
  if (/relation .* does not exist/i.test(message)) {
    return new ApiError(503, 'DATABASE_NOT_READY', 'StudyPilot database tables are not set up yet. Apply supabase/schema.sql in your Supabase SQL editor.');
  }
  if (/JWT|token|auth/i.test(message) && error?.status === 401) {
    return new ApiError(401, 'UNAUTHENTICATED', 'Your session is invalid or expired.');
  }
  return new ApiError(500, 'DATABASE_ERROR', 'A database operation failed.');
}
