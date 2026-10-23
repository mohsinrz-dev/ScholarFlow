import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env.js';
import { globalLimiter } from './middleware/rateLimiter.js';
import { requestTimeout } from './middleware/timeout.js';
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './utils/logger.js';

import profileRouter from './routes/profile.js';
import subjectsRouter from './routes/subjects.js';
import tasksRouter from './routes/tasks.js';
import sessionsRouter from './routes/sessions.js';
import historyRouter from './routes/history.js';
import revisionsRouter from './routes/revisions.js';
import aiRouter from './routes/ai.js';
import analyticsRouter from './routes/analytics.js';
import dashboardRouter from './routes/dashboard.js';
import accountRouter from './routes/account.js';
import authRouter from './routes/auth.js';

const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_ORIGIN,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);
app.use(express.json({ limit: '64kb' }));
app.use(express.urlencoded({ extended: false, limit: '16kb' }));
app.use(requestTimeout(30000));
app.use(globalLimiter);

app.get('/api/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});
app.get('/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

app.use('/api/auth', authRouter);
app.use('/api/profile', profileRouter);
app.use('/api/subjects', subjectsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/study-sessions', sessionsRouter);
app.use('/api/learning-history', historyRouter);
app.use('/api/revisions', revisionsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/account', accountRouter);

app.use((req, res) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Endpoint not found.' } });
});

app.use(errorHandler);

export default app;
