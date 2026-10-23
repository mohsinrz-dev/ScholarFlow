import { supabaseAdmin } from '../config/supabase.js';
import { Errors } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export async function getConversations(userId) {
  const { data, error } = await supabaseAdmin
    .from('ai_conversations')
    .select('id, title, subject, language, created_at, updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    logger.error('getConversations DB error', { message: error.message });
    throw Errors.internal();
  }
  return data ?? [];
}

export async function getConversationById(userId, conversationId) {
  const { data, error } = await supabaseAdmin
    .from('ai_conversations')
    .select('id, title, subject, language, created_at, updated_at')
    .eq('id', conversationId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    logger.error('getConversationById DB error', { message: error.message });
    throw Errors.internal();
  }
  return data;
}

export async function createConversation(userId, title, subject, language) {
  const { data, error } = await supabaseAdmin
    .from('ai_conversations')
    .insert({ user_id: userId, title, subject: subject ?? null, language })
    .select('id, title, subject, language, created_at, updated_at')
    .single();

  if (error) {
    logger.error('createConversation DB error', { message: error.message });
    throw Errors.internal();
  }
  return data;
}

export async function touchConversation(conversationId) {
  const { error } = await supabaseAdmin
    .from('ai_conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId);
  if (error) {
    logger.error('touchConversation DB error', { message: error.message });
    throw Errors.internal();
  }
}

export async function deleteConversation(userId, conversationId) {
  const { error, count } = await supabaseAdmin
    .from('ai_conversations')
    .delete({ count: 'exact' })
    .eq('id', conversationId)
    .eq('user_id', userId);

  if (error) {
    logger.error('deleteConversation DB error', { message: error.message });
    throw Errors.internal();
  }
  return count;
}

export async function getMessages(userId, conversationId, limit = 40) {
  const convo = await getConversationById(userId, conversationId);
  if (!convo) return null;

  const { data, error } = await supabaseAdmin
    .from('ai_messages')
    .select('id, role, content, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) {
    logger.error('getMessages DB error', { message: error.message });
    throw Errors.internal();
  }
  return { conversation: convo, messages: data ?? [] };
}

export async function insertMessage(conversationId, userId, role, content) {
  const { data, error } = await supabaseAdmin
    .from('ai_messages')
    .insert({ conversation_id: conversationId, user_id: userId, role, content })
    .select('id, role, content, created_at')
    .single();

  if (error) {
    logger.error('insertMessage DB error', { message: error.message });
    throw Errors.internal();
  }
  return data;
}

export async function getRecentMessages(conversationId, limit = 20) {
  const { data, error } = await supabaseAdmin
    .from('ai_messages')
    .select('role, content')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    logger.error('getRecentMessages DB error', { message: error.message });
    throw Errors.internal();
  }
  return (data ?? []).reverse();
}
