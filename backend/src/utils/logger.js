import { env } from '../config/env.js';

const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const CURRENT = LEVELS[env.NODE_ENV === 'production' ? 'info' : 'debug'] ?? LEVELS.debug;

function log(level, message, meta = {}) {
  if (LEVELS[level] > CURRENT) return;

  const sanitized = Object.fromEntries(
    Object.entries(meta).filter(([k]) => !['password', 'token', 'key', 'secret', 'authorization'].includes(k.toLowerCase()))
  );

  const entry = {
    ts: new Date().toISOString(),
    level,
    message,
    ...(Object.keys(sanitized).length ? { meta: sanitized } : {}),
  };

  const output = JSON.stringify(entry);
  if (level === 'error') {
    process.stderr.write(output + '\n');
  } else {
    process.stdout.write(output + '\n');
  }
}

export const logger = {
  error: (msg, meta) => log('error', msg, meta),
  warn: (msg, meta) => log('warn', msg, meta),
  info: (msg, meta) => log('info', msg, meta),
  debug: (msg, meta) => log('debug', msg, meta),
};
