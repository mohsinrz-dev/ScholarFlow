import { success, noContent } from '../utils/response.js';
import * as aiService from '../services/aiService.js';

export async function tutorMessage(req, res, next) {
  try {
    const result = await aiService.handleTutorMessage(req.userId, req.body);
    return success(res, result);
  } catch (err) {
    return next(err);
  }
}

export async function listConversations(req, res, next) {
  try {
    const conversations = await aiService.listConversations(req.userId);
    return success(res, conversations);
  } catch (err) {
    return next(err);
  }
}

export async function getConversation(req, res, next) {
  try {
    const conversation = await aiService.getConversation(req.userId, req.params.id);
    return success(res, conversation);
  } catch (err) {
    return next(err);
  }
}

export async function deleteConversation(req, res, next) {
  try {
    await aiService.deleteConversation(req.userId, req.params.id);
    return noContent(res);
  } catch (err) {
    return next(err);
  }
}
