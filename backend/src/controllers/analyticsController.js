import { success } from '../utils/response.js';
import * as analyticsService from '../services/analyticsService.js';

export async function getDashboard(req, res, next) {
  try {
    const data = await analyticsService.getDashboard(req.userId);
    return success(res, data);
  } catch (err) {
    return next(err);
  }
}

export async function getAnalytics(req, res, next) {
  try {
    const data = await analyticsService.getAnalytics(req.userId, req.query);
    return success(res, data);
  } catch (err) {
    return next(err);
  }
}
