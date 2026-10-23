import { success, created, noContent, paginated } from '../utils/response.js';
import * as revisionService from '../services/revisionService.js';

export async function listRevisions(req, res, next) {
  try {
    const result = await revisionService.listRevisions(req.userId, req.query);
    return paginated(res, result.items, result.pagination);
  } catch (err) {
    return next(err);
  }
}

export async function createRevision(req, res, next) {
  try {
    const revision = await revisionService.createRevision(req.userId, req.body);
    return created(res, revision);
  } catch (err) {
    return next(err);
  }
}

export async function updateRevision(req, res, next) {
  try {
    const revision = await revisionService.updateRevision(req.userId, req.params.id, req.body);
    return success(res, revision);
  } catch (err) {
    return next(err);
  }
}
