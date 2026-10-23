import OpenAI from 'openai';
import { env } from '../../config/env.js';
import { AppError, Errors } from '../../utils/errors.js';
import { logger } from '../../utils/logger.js';

let client = null;

function getClient() {
  if (client) return client;

  if (!env.AI_PROVIDER_API_KEY) {
    throw Errors.aiNotConfigured();
  }

  client = new OpenAI({
    apiKey: env.AI_PROVIDER_API_KEY,
    baseURL: env.AI_PROVIDER_BASE_URL ?? 'https://api.openai.com/v1',
    timeout: 25000,
    maxRetries: 0,
  });

  return client;
}

const SYSTEM_PROMPTS = {
  en: `You are StudyPilot AI, a friendly and knowledgeable tutor. Your role is to help students learn effectively.
- Give clear, beginner-friendly explanations
- Break down complex topics into manageable steps
- Encourage questions and curiosity
- Stay strictly on topic — only discuss academic subjects and study-related queries
- Respond only in English`,

  hi: `You are StudyPilot AI, a friendly and knowledgeable tutor. Your role is to help students learn effectively.
- Give clear, beginner-friendly explanations
- Break down complex topics into manageable steps
- Encourage questions and curiosity
- Stay strictly on topic — only discuss academic subjects and study-related queries
- Respond in Hinglish (a natural mix of Hindi and English used in everyday Indian conversation)`,
};

const MODE_INSTRUCTIONS = {
  explain: 'Explain the topic clearly and comprehensively.',
  quiz: 'Create a short quiz (3-5 questions) on the topic. Ask one question at a time.',
  step_by_step: 'Break down the solution or concept into numbered steps. Be thorough.',
  follow_up: 'Continue from the previous conversation. Answer the follow-up question directly.',
};

export async function chat({ messages, language = 'en', learningMode = 'explain', subject }) {
  const aiClient = getClient();

  const systemContent = [
    SYSTEM_PROMPTS[language] ?? SYSTEM_PROMPTS.en,
    MODE_INSTRUCTIONS[learningMode] ?? '',
    subject ? `Current subject: ${subject}` : '',
  ]
    .filter(Boolean)
    .join('\n\n');

  const formattedMessages = [{ role: 'system', content: systemContent }, ...messages];

  try {
    const response = await aiClient.chat.completions.create({
      model: env.AI_MODEL,
      messages: formattedMessages,
      max_tokens: 1024,
      temperature: 0.7,
    });

    const choice = response.choices?.[0];
    if (!choice?.message?.content) {
      throw Errors.aiUnavailable();
    }

    return choice.message.content.trim();
  } catch (err) {
    if (err.name === 'AppError') throw err;

    logger.error('AI provider error', { type: err.constructor.name, status: err.status });

    if (err.status === 429) {
      throw new AppError(
        'AI_RATE_LIMITED',
        'AI service rate limit reached. Please try again in a moment.',
        429
      );
    }

    if (err.code === 'ETIMEDOUT' || err.code === 'ECONNRESET' || err.message?.includes('timeout')) {
      throw Errors.aiUnavailable();
    }

    throw Errors.aiUnavailable();
  }
}
