import { success, created, paginated } from '../utils/response.js';
import * as sessionService from '../services/sessionService.js';

export async function listSessions(req, res, next) {
  try {
    const result = await sessionService.listSessions(req.userId, req.query);
    return paginated(res, result.items, result.pagination);
  } catch (err) {
    return next(err);
  }
}

export async function createSession(req, res, next) {
  try {
    const session = await sessionService.createSession(req.userId, req.body);
    return created(res, session);
  } catch (err) {
    return next(err);
  }
}

export async function getHistory(req, res, next) {
  try {
    const result = await sessionService.getHistory(req.userId, req.query);
    return paginated(res, result.items, result.pagination);
  } catch (err) {
    return next(err);
  }
}
