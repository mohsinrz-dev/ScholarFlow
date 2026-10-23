import * as conversationRepo from '../repositories/conversationRepository.js';
import { chat } from './ai/provider.js';
import { Errors } from '../utils/errors.js';

const MAX_MESSAGE_LENGTH = 4000;
const MAX_CONTEXT_MESSAGES = 20;

export async function handleTutorMessage(userId, payload) {
  const { message, subject, language, conversation_id, learning_mode } = payload;

  if (message.length > MAX_MESSAGE_LENGTH) {
    throw Errors.validation('Message exceeds the maximum allowed length.');
  }

  let conversationId = conversation_id;
  let isNewConversation = false;

  if (conversationId) {
    const convo = await conversationRepo.getConversationById(userId, conversationId);
    if (!convo) throw Errors.notFound('Conversation');
  } else {
    const title = message.slice(0, 80) + (message.length > 80 ? '…' : '');
    const newConvo = await conversationRepo.createConversation(userId, title, subject ?? null, language);
    conversationId = newConvo.id;
    isNewConversation = true;
  }

  const history = await conversationRepo.getRecentMessages(conversationId, MAX_CONTEXT_MESSAGES);
  const contextMessages = history.map((m) => ({ role: m.role, content: m.content }));

  const assistantReply = await chat({
    messages: [...contextMessages, { role: 'user', content: message }],
    language,
    learningMode: learning_mode,
    subject,
  });

  await conversationRepo.insertMessage(conversationId, userId, 'user', message);
  const assistantMsg = await conversationRepo.insertMessage(conversationId, userId, 'assistant', assistantReply);
  await conversationRepo.touchConversation(conversationId);

  return {
    conversation_id: conversationId,
    is_new_conversation: isNewConversation,
    message: assistantMsg,
  };
}

export async function listConversations(userId) {
  return conversationRepo.getConversations(userId);
}

export async function getConversation(userId, conversationId) {
  const result = await conversationRepo.getMessages(userId, conversationId);
  if (!result) throw Errors.notFound('Conversation');
  return result;
}

export async function deleteConversation(userId, conversationId) {
  const count = await conversationRepo.deleteConversation(userId, conversationId);
  if (!count) throw Errors.notFound('Conversation');
}
