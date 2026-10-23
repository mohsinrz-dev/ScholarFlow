import * as taskRepo from '../repositories/taskRepository.js';
import * as subjectRepo from '../repositories/subjectRepository.js';
import { Errors } from '../utils/errors.js';
import { parsePagination, buildPaginationMeta } from '../utils/pagination.js';

export async function listTasks(userId, query) {
  const { page, limit, offset } = parsePagination(query);
  const filters = {
    status: query.status,
    priority: query.priority,
    subject_id: query.subject_id,
    due_before: query.due_before,
    due_after: query.due_after,
  };

  const { items, total } = await taskRepo.getTasks(userId, filters, { offset, limit });
  return { items, pagination: buildPaginationMeta(page, limit, total) };
}

export async function getTask(userId, taskId) {
  const task = await taskRepo.getTaskById(userId, taskId);
  if (!task) throw Errors.notFound('Task');
  return task;
}

export async function createTask(userId, payload) {
  if (payload.subject_id) {
    const subject = await subjectRepo.getSubjectById(userId, payload.subject_id);
    if (!subject) throw Errors.notFound('Subject');
  }

  return taskRepo.createTask(userId, payload);
}

export async function updateTask(userId, taskId, payload) {
  const existing = await taskRepo.getTaskById(userId, taskId);
  if (!existing) throw Errors.notFound('Task');

  if (payload.subject_id) {
    const subject = await subjectRepo.getSubjectById(userId, payload.subject_id);
    if (!subject) throw Errors.notFound('Subject');
  }

  const updates = { ...payload };
  if (Object.hasOwn(payload, 'estimated_minutes') && !Object.hasOwn(payload, 'estimated_duration')) {
    updates.estimated_duration = payload.estimated_minutes;
  }
  delete updates.estimated_minutes;

  if (payload.status === 'completed' && existing.status !== 'completed') {
    updates.completed_at = new Date().toISOString();
  } else if (payload.status && payload.status !== 'completed' && existing.status === 'completed') {
    updates.completed_at = null;
  }

  const updated = await taskRepo.updateTask(userId, taskId, updates);
  if (!updated) throw Errors.notFound('Task');
  return updated;
}

export async function deleteTask(userId, taskId) {
  const count = await taskRepo.deleteTask(userId, taskId);
  if (!count) throw Errors.notFound('Task');
}
