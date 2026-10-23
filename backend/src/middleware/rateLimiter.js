import rateLimit from 'express-rate-limit';
import { Errors } from '../utils/errors.js';

function rateLimitError(req, res) {
  const err = Errors.rateLimited();
  res.status(429).json({ success: false, error: { code: err.code, message: err.message } });
}

export const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitError,
});

export const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitError,
});

export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitError,
});
