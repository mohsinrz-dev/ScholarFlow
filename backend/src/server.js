import 'dotenv/config';
import http from 'http';
import cron from 'node-cron';
import app from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { purgeExpiredAccounts } from './services/profileService.js';

const server = http.createServer(app);

cron.schedule('0 2 * * *', async () => {
  logger.info('Running scheduled purge of expired deleted accounts');
  try {
    const count = await purgeExpiredAccounts();
    logger.info('Account purge complete', { purged: count });
  } catch (err) {
    logger.error('Account purge failed', { message: err.message });
  }
});

server.listen(env.PORT, '0.0.0.0', () => {
  logger.info('Server started', { port: env.PORT, env: env.NODE_ENV });
});

function shutdown(signal) {
  logger.info('Received shutdown signal', { signal });
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Forcing shutdown after timeout');
    process.exit(1);
  }, 10000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
