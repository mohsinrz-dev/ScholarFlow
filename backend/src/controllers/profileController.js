import { success, created, noContent, paginated } from '../utils/response.js';
import * as profileService from '../services/profileService.js';

export async function getProfile(req, res, next) {
  try {
    const profile = await profileService.getOrCreateProfile(req.userId, req.user.email);
    return success(res, profile);
  } catch (err) {
    return next(err);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const profile = await profileService.updateProfile(req.userId, req.body);
    return success(res, profile);
  } catch (err) {
    return next(err);
  }
}
