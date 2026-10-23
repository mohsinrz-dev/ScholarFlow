import * as sessionRepo from '../repositories/sessionRepository.js';
import * as subjectRepo from '../repositories/subjectRepository.js';
import * as taskRepo from '../repositories/taskRepository.js';
import { parsePagination, buildPaginationMeta } from '../utils/pagination.js';
import { Errors } from '../utils/errors.js';

export async function listSessions(userId, query) {
  const { page, limit, offset } = parsePagination(query);
  const filters = {
    subject_id: query.subject_id,
    from: query.from,
    to: query.to,
  };

  const { items, total } = await sessionRepo.getSessions(userId, filters, { offset, limit });
  return { items, pagination: buildPaginationMeta(page, limit, total) };
}

export async function createSession(userId, payload) {
  if (payload.subject_id) {
    const subject = await subjectRepo.getSubjectById(userId, payload.subject_id);
    if (!subject) throw Errors.notFound('Subject');
  }

  if (payload.task_id) {
    const task = await taskRepo.getTaskById(userId, payload.task_id);
    if (!task) throw Errors.notFound('Task');
    if (payload.subject_id && task.subject_id !== payload.subject_id) {
      throw Errors.validation('The session subject must match the task subject.');
    }
    if (!payload.subject_id && task.subject_id) payload = { ...payload, subject_id: task.subject_id };
  }

  return sessionRepo.createSession(userId, payload);
}

export async function getHistory(userId, query) {
  return listSessions(userId, query);
}
