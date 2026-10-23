import { success, created, noContent, paginated } from '../utils/response.js';
import * as taskService from '../services/taskService.js';

export async function listTasks(req, res, next) {
  try {
    const result = await taskService.listTasks(req.userId, req.query);
    return paginated(res, result.items, result.pagination);
  } catch (err) {
    return next(err);
  }
}

export async function getTask(req, res, next) {
  try {
    const task = await taskService.getTask(req.userId, req.params.id);
    return success(res, task);
  } catch (err) {
    return next(err);
  }
}

export async function createTask(req, res, next) {
  try {
    const task = await taskService.createTask(req.userId, req.body);
    return created(res, task);
  } catch (err) {
    return next(err);
  }
}

export async function updateTask(req, res, next) {
  try {
    const task = await taskService.updateTask(req.userId, req.params.id, req.body);
    return success(res, task);
  } catch (err) {
    return next(err);
  }
}

export async function deleteTask(req, res, next) {
  try {
    await taskService.deleteTask(req.userId, req.params.id);
    return noContent(res);
  } catch (err) {
    return next(err);
  }
}
