import { success, created, noContent } from '../utils/response.js';
import * as subjectRepo from '../repositories/subjectRepository.js';
import { Errors } from '../utils/errors.js';

export async function listSubjects(req, res, next) {
  try {
    const subjects = await subjectRepo.getSubjects(req.userId);
    return success(res, subjects);
  } catch (err) {
    return next(err);
  }
}

export async function createSubject(req, res, next) {
  try {
    const subject = await subjectRepo.createSubject(req.userId, req.body);
    return created(res, subject);
  } catch (err) {
    return next(err);
  }
}

export async function updateSubject(req, res, next) {
  try {
    const existing = await subjectRepo.getSubjectById(req.userId, req.params.id);
    if (!existing) return next(Errors.notFound('Subject'));
    const subject = await subjectRepo.updateSubject(req.userId, req.params.id, req.body);
    return success(res, subject);
  } catch (err) {
    return next(err);
  }
}

export async function deleteSubject(req, res, next) {
  try {
    const count = await subjectRepo.deleteSubject(req.userId, req.params.id);
    if (!count) return next(Errors.notFound('Subject'));
    return noContent(res);
  } catch (err) {
    return next(err);
  }
}
