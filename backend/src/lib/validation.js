import { ApiError } from './errors.js';

export function requireString(value, name, { min = 1, max = 5000, optional = false } = {}) {
  if (optional && value === undefined) return undefined;
  if (typeof value !== 'string') throw new ApiError(400, 'VALIDATION_ERROR', `${name} must be a string.`);
  const normalized = value.trim();
  if (normalized.length < min || normalized.length > max) {
    throw new ApiError(400, 'VALIDATION_ERROR', `${name} must be between ${min} and ${max} characters.`);
  }
  return normalized;
}

export function requireId(value, name = 'id') {
  if (typeof value !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
    throw new ApiError(400, 'VALIDATION_ERROR', `${name} must be a valid UUID.`);
  }
  return value;
}

export function requireObject(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Request body must be a JSON object.');
  }
  return value;
}

export function pageOptions(searchParams) {
  const parsedLimit = Number.parseInt(searchParams.get('limit') ?? '50', 10);
  const parsedOffset = Number.parseInt(searchParams.get('offset') ?? '0', 10);
  if (!Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'limit must be an integer from 1 to 100.');
  }
  if (!Number.isInteger(parsedOffset) || parsedOffset < 0) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'offset must be a non-negative integer.');
  }
  return { limit: parsedLimit, offset: parsedOffset };
}

export function pickFields(input, allowed, options = {}) {
  const body = requireObject(input);
  const fields = {};
  for (const key of allowed) {
    if (Object.hasOwn(body, key)) fields[key] = body[key];
    else if (!options.partial) throw new ApiError(400, 'VALIDATION_ERROR', `${key} is required.`);
  }
  if (Object.keys(fields).length === 0) throw new ApiError(400, 'VALIDATION_ERROR', 'At least one editable field is required.');
  return fields;
}
